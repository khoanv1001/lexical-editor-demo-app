import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
    type ElementFormatType,
    type NodeKey,
    $getNodeByKey,
    $isDecoratorNode,
    $createParagraphNode,
    CLICK_COMMAND,
    COMMAND_PRIORITY_NORMAL,
} from "lexical";
import { type JSX, useRef, useState, useCallback, useEffect } from "react";
import { IconContext } from "react-icons";
import { FaTrashAlt } from "react-icons/fa";

type TweetComponentProps = Readonly<{
    className: Readonly<{
        base: string;
        focus: string;
    }>;
    format: ElementFormatType | null;
    loadingComponent?: JSX.Element | string;
    nodeKey: NodeKey;
    onError?: (error: string) => void;
    onLoad?: () => void;
    tweetID: string;
}>;

export const WIDGET_SCRIPT_URL = "https://platform.twitter.com/widgets.js";
let isTwitterScriptLoading = true;
const DEFAULT_TWEET_WIDTH = 560;

export function TweetComponent({
    className,
    format,
    loadingComponent,
    nodeKey,
    onError,
    onLoad,
    tweetID,
}: TweetComponentProps) {
    const containerRef = useRef<HTMLIFrameElement | null>(null);

    const previousTweetIDRef = useRef<string>("");
    const [isTweetLoading, setIsTweetLoading] = useState(false);
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] =
        useLexicalNodeSelection(nodeKey);

    const createTweet = useCallback(async () => {
        try {
            let iframeWidth = DEFAULT_TWEET_WIDTH;

            // @ts-expect-error Twitter is attached to the window.
            await window.twttr.widgets.createTweet(
                tweetID,
                containerRef.current
            );

            const tweetElements: NodeListOf<HTMLIFrameElement> =
                document.querySelectorAll('[id^="twitter-widget-"]');
            tweetElements.forEach((tweetElement) => {
                const width =
                    containerRef.current?.parentElement?.getBoundingClientRect()
                        .width;
                if (!width) return;

                iframeWidth = width;
                tweetElement.style.margin = "2px";
                tweetElement.style.pointerEvents = "none";
                tweetElement.style.width = `${iframeWidth}px`;
                tweetElement.style.minWidth = `${iframeWidth}px`;
            });

            setIsTweetLoading(false);
            isTwitterScriptLoading = false;

            if (onLoad) {
                onLoad();
            }
        } catch (error) {
            if (onError) {
                onError(String(error));
            }
        }
    }, [onError, onLoad, tweetID]);

    useEffect(() => {
        if (tweetID !== previousTweetIDRef.current) {
            setIsTweetLoading(true);

            if (isTwitterScriptLoading) {
                const script = document.createElement("script");
                script.src = WIDGET_SCRIPT_URL;
                script.async = true;
                document.body?.appendChild(script);

                script.onload = createTweet;
                if (onError) {
                    script.onerror = onError as OnErrorEventHandler;
                }
            } else {
                createTweet();
            }

            if (previousTweetIDRef) {
                previousTweetIDRef.current = tweetID;
            }
        }
    }, [createTweet, onError, tweetID]);

    const onRemoveTweet = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isDecoratorNode(node)) {
                const parent = node.getParent();
                node.remove();

                // Create paragraphNode when root empty children
                if (parent && parent.getChildrenSize() === 0) {
                    parent.append($createParagraphNode());
                }
            }
            setSelected(false);
        });
    };

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand<MouseEvent>(
                CLICK_COMMAND,
                (event) => {
                    const target = event.target as HTMLElement;
                    if (target.parentElement === containerRef.current) {
                        event.preventDefault();
                        if (!event.shiftKey) {
                            clearSelection();
                        }

                        setSelected(!isSelected);
                        return true;
                    }

                    return false;
                },
                COMMAND_PRIORITY_NORMAL
            )
        );
    }, [clearSelection, editor, isSelected, nodeKey, setSelected]);

    return (
        <BlockWithAlignableContents
            className={className}
            format={format}
            nodeKey={nodeKey}
        >
            {isTweetLoading ? loadingComponent : null}

            {isSelected && (
                <IconContext.Provider
                    value={{
                        className:
                            "absolute right-0 bg-white cursor-pointer p-2 rounded border-solid border-1 border-[#d5d8db] text-gray-400 shadow-[2px_-2px_8px_rgba(0,0,0,.2)]",
                        size: "2.5em",
                    }}
                >
                    <FaTrashAlt onClick={onRemoveTweet} />
                </IconContext.Provider>
            )}

            <div style={{ display: "inline-block" }} ref={containerRef} />
        </BlockWithAlignableContents>
    );
}
