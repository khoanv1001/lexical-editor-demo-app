import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
    $createParagraphNode,
    $getNodeByKey,
    $isDecoratorNode,
    type ElementFormatType,
    type NodeKey,
} from "lexical";
import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import React from "react";
import { IconContext } from "react-icons";
import { FaTrashAlt } from "react-icons/fa";

type InstagramComponentProps = Readonly<{
    className: Readonly<{
        base: string;
        focus: string;
    }>;
    format: ElementFormatType | null;
    loadingComponent?: JSX.Element | string;
    nodeKey: NodeKey;
    onError?: (error: string) => void;
    onLoad?: () => void;
    instagramID: string;
}>;

export const WIDGET_INSTAGRAM_SCRIPT_URL =
    "https://platform.instagram.com/en_US/embeds.js";
let isInstagramScriptLoading = true;

export function InstagramComponent({
    className,
    format,
    loadingComponent,
    nodeKey,
    onError,
    onLoad,
    instagramID,
}: InstagramComponentProps) {
    const previousInstagramIDRef = useRef<string>("");
    const [isInstagramLoading, setIsInstagramLoading] = useState(false);
    const [editor] = useLexicalComposerContext();
    const instagramRef = React.useRef<HTMLQuoteElement>(null);
    const [isSelected, setSelected] = useLexicalNodeSelection(nodeKey);

    const createInstagram = useCallback(async () => {
        try {
            // @ts-expect-error IG is attached to the window.
            await window.instgrm.Embeds.process();
            const instagramElements: NodeListOf<HTMLIFrameElement> =
                document.querySelectorAll("[id^='instagram-embed-']");

            instagramElements.forEach((element) => {
                element.style.pointerEvents = "none";
                element.style.width = `100%`;
            });

            setIsInstagramLoading(false);
            isInstagramScriptLoading = false;

            if (onLoad) {
                onLoad();
            }
        } catch (error) {
            if (onError) {
                onError(String(error));
            }
        }
    }, [onError, onLoad]);

    const onRemoveInstagram = useCallback(() => {
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
    }, [editor, nodeKey, setSelected]);

    useEffect(() => {
        if (instagramID !== previousInstagramIDRef.current) {
            setIsInstagramLoading(true);

            if (isInstagramScriptLoading) {
                const script = document.createElement("script");
                script.src = WIDGET_INSTAGRAM_SCRIPT_URL;
                script.async = true;
                document.body?.appendChild(script);
                script.onload = createInstagram;
                if (onError) {
                    script.onerror = onError as OnErrorEventHandler;
                }
            } else {
                createInstagram();
            }

            if (previousInstagramIDRef) {
                previousInstagramIDRef.current = instagramID;
            }
        }
    }, [createInstagram, onError, instagramID]);

    return (
        <BlockWithAlignableContents
            className={className}
            format={format}
            nodeKey={nodeKey}
        >
            {isInstagramLoading ? loadingComponent : null}

            <div>
                {isSelected && (
                    <IconContext.Provider
                        value={{
                            className:
                                "absolute right-0 bg-white cursor-pointer p-2 rounded border-solid border-1 border-[#d5d8db] text-gray-400 shadow-[2px_-2px_8px_rgba(0,0,0,.2)]",
                            size: "2.5em",
                        }}
                    >
                        <FaTrashAlt onClick={onRemoveInstagram} />
                    </IconContext.Provider>
                )}
            </div>

            <blockquote
                ref={instagramRef}
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={
                    "https://www.instagram.com/p/" + instagramID
                }
                data-instgrm-version="12"
            />
        </BlockWithAlignableContents>
    );
}
