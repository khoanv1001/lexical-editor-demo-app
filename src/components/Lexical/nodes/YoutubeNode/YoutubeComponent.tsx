import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
    type ElementFormatType,
    type NodeKey,
    $isNodeSelection,
    $getSelection,
    $getNodeByKey,
    $createParagraphNode,
    $setSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    KEY_DELETE_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_ENTER_COMMAND,
} from "lexical";
import { useRef, useCallback, useEffect } from "react";
import { IconContext } from "react-icons";
import { FaTrashAlt } from "react-icons/fa";
import { $isYouTubeNode } from ".";

type YouTubeComponentProps = Readonly<{
    className: Readonly<{
        base: string;
        focus: string;
    }>;
    format: ElementFormatType | null;
    nodeKey: NodeKey;
    videoID: string;
}>;

export function YouTubeComponent({
    className,
    format,
    nodeKey,
    videoID,
}: YouTubeComponentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isSelected, setSelected, clearSelection] =
        useLexicalNodeSelection(nodeKey);
    const [editor] = useLexicalComposerContext();

    const onDelete = useCallback(
        (payload: KeyboardEvent) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                const node = $getNodeByKey(nodeKey);

                if ($isYouTubeNode(node)) {
                    const parent = node.getParent();
                    node.remove();

                    // Create paragraphNode when root empty children
                    if (parent && parent.getChildrenSize() === 0) {
                        parent.append($createParagraphNode());
                    }
                }
                setSelected(false);
            }
            return false;
        },
        [isSelected, nodeKey, setSelected]
    );

    const onEnter = useCallback(
        (event: KeyboardEvent) => {
            const latestSelection = $getSelection();
            if (latestSelection) {
                const nodes = latestSelection.getNodes();

                if (
                    isSelected &&
                    $isNodeSelection(latestSelection) &&
                    nodes.length === 1
                ) {
                    const node = nodes[0];
                    const newElement = $createParagraphNode();
                    node.insertAfter(newElement);
                    $setSelection(null);
                    event.preventDefault();
                    newElement.select();
                    return true;
                }
            }
            return false;
        },
        [isSelected]
    );

    const onButtonDeleteVideo = useCallback(() => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isYouTubeNode(node)) {
                const parent = node.getParent();
                node.remove();

                // Create paragraphNode when root empty children
                if (parent && parent.getChildrenSize() === 0) {
                    parent.append($createParagraphNode());
                }
                setSelected(false);
            }
        });
    }, [editor, nodeKey, setSelected]);

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand<MouseEvent>(
                CLICK_COMMAND,
                (payload) => {
                    const event = payload;

                    if (
                        containerRef.current &&
                        containerRef.current.contains(event.target as Node)
                    ) {
                        if (event.shiftKey) {
                            setSelected(!isSelected);
                        } else {
                            clearSelection();
                            setSelected(true);
                        }
                        return true;
                    }

                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                onDelete,
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                onDelete,
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_ENTER_COMMAND,
                onEnter,
                COMMAND_PRIORITY_LOW
            )
        );
    }, [
        clearSelection,
        editor,
        isSelected,
        nodeKey,
        onDelete,
        onEnter,
        setSelected,
    ]);

    const isFocused = isSelected;

    return (
        <BlockWithAlignableContents
            className={className}
            format={format}
            nodeKey={nodeKey}
        >
            <div
                ref={containerRef}
                className="relative w-full aspect-video max-w-full overflow-hidden rounded-lg bg-gray-100"
            >
                <iframe
                    className={`pointer-events-none absolute inset-0 w-full h-full border-0 ${
                        isFocused
                            ? "pointer-events-none shadow-lg shadow-black/40 rounded-lg"
                            : ""
                    }`}
                    src={`https://www.youtube-nocookie.com/embed/${videoID}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen={true}
                    title="YouTube video"
                />
                {isFocused && (
                    <IconContext.Provider
                        value={{
                            className:
                                "absolute right-0 bg-white cursor-pointer p-2 rounded border border-gray-300 text-gray-400 shadow-lg",
                            size: "2.5em",
                        }}
                    >
                        <FaTrashAlt onClick={onButtonDeleteVideo} />
                    </IconContext.Provider>
                )}
            </div>
        </BlockWithAlignableContents>
    );
}
