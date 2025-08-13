import {
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
    type JSX,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import { IconContext } from "react-icons";
import { FaTrashAlt } from "react-icons/fa";
import type {
    BaseSelection,
    LexicalEditor,
    NodeKey,
    NodeSelection,
    RangeSelection,
} from "lexical";
import {
    $getRoot,
    $createParagraphNode,
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    $setSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from "lexical";
import clsx from "clsx";
import { $isImageNode } from ".";

function LazyImage({
    altText,
    className,
    imageRef,
    src,
    width,
    height,
}: {
    altText: string;
    className: string | null;
    height: "inherit" | number;
    imageRef: { current: null | HTMLImageElement };
    src: string;
    width: "inherit" | number;
}): JSX.Element {
    return (
        <img
            className={clsx(
                className || undefined,
                "max-h-full cursor-pointer max-w-full"
            )}
            src={src}
            alt={altText}
            ref={imageRef}
            style={{
                height,
                width,
            }}
            draggable="false"
        />
    );
}

export default function ImageComponent({
    src,
    altText,
    nodeKey,
    width,
    height,
    showCaption,
    caption,
    captionsEnabled,
}: {
    altText: string;
    caption: LexicalEditor;
    height: "inherit" | number;
    maxWidth: number;
    nodeKey: NodeKey;
    resizable: boolean;
    showCaption: boolean;
    src: string;
    width: "inherit" | number;
    captionsEnabled: boolean;
}): JSX.Element {
    const imageRef = useRef<null | HTMLImageElement>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [isSelected, setSelected, clearSelection] =
        useLexicalNodeSelection(nodeKey);
    const [editor] = useLexicalComposerContext();
    const [selection, setSelection] = useState<
        RangeSelection | NodeSelection | BaseSelection | null
    >(null);
    const activeEditorRef = useRef<LexicalEditor | null>(null);

    const onDelete = useCallback(
        (payload: KeyboardEvent) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                const node = $getNodeByKey(nodeKey);

                if ($isImageNode(node)) {
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
                    const root = $getRoot();
                    const lastChild = root.getLastChild();
                    const node = nodes[0];
                    const newElement = $createParagraphNode();

                    if (node === lastChild) {
                        node.insertAfter(newElement);
                    } else {
                        node.insertBefore(newElement);
                    }

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

    const onEscape = useCallback(
        (event: KeyboardEvent) => {
            if (
                activeEditorRef.current === caption ||
                buttonRef.current === event.target
            ) {
                $setSelection(null);
                editor.update(() => {
                    setSelected(true);
                    const parentRootElement = editor.getRootElement();
                    if (parentRootElement !== null) {
                        parentRootElement.focus();
                    }
                });
                return true;
            }
            return false;
        },
        [caption, editor, setSelected]
    );

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                setSelection(editorState.read(() => $getSelection()));
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_, activeEditor) => {
                    activeEditorRef.current = activeEditor;
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand<MouseEvent>(
                CLICK_COMMAND,
                (payload) => {
                    const event = payload;

                    if (event.target === imageRef.current) {
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
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                onEscape,
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
        onEscape,
        setSelected,
    ]);

    const setShowCaption = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
                node.setShowCaption(true);
            }
        });
    };

    const onButtonDeleteImage = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
                const parent = node.getParent();
                node.remove();

                // Create paragraphNode when root empty children
                if (parent && parent.getChildrenSize() === 0) {
                    parent.append($createParagraphNode());
                }

                setSelected(false);
            }
        });
    };
    const isFocused = isSelected;
    const controlWrapperRef = useRef<HTMLDivElement>(null);

    return (
        <Suspense fallback={null}>
            <>
                <div className="relative">
                    <LazyImage
                        className={
                            isFocused
                                ? `shadow-lg shadow-black/40 rounded-sm select-none ${
                                      $isNodeSelection(selection)
                                          ? "cursor-grab active:cursor-grabbing"
                                          : ""
                                  }`
                                : null
                        }
                        src={src}
                        altText={altText}
                        imageRef={imageRef}
                        width={width}
                        height={height}
                    />
                    {isFocused && (
                        <IconContext.Provider
                            value={{
                                className:
                                    "absolute -top-2 right-0 bg-white cursor-pointer p-2 rounded border border-gray-300 text-gray-400 shadow-lg",
                                size: "2.5em",
                            }}
                        >
                            <FaTrashAlt onClick={onButtonDeleteImage} />
                        </IconContext.Provider>
                    )}
                </div>
                <div ref={controlWrapperRef}>
                    {!showCaption && captionsEnabled && (
                        <button
                            className="block absolute bottom-5 left-0 right-0 w-[30%] py-2.5 px-4 mx-auto border border-white/30 rounded bg-black/50 min-w-[100px] text-white cursor-pointer select-none hover:bg-blue-500/50"
                            ref={buttonRef}
                            onClick={setShowCaption}
                        >
                            キャプションを追加
                        </button>
                    )}
                </div>
            </>
        </Suspense>
    );
}
