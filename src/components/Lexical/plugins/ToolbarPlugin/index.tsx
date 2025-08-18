import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode,
    type HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
    $createParagraphNode,
    $getRoot,
    $getSelection,
    $isNodeSelection,
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_LOW,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
    type LexicalEditor,
    type LexicalNode,
    type NodeKey,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { IconsEnum } from "../../../../enums/IconEnum";
import { t } from "../../../../i18n";
import { useLexicalComposerContext } from "../../../../utils/context";
import IconComponent from "../../../IconComponent";
import { INSERT_IMAGE_COMMAND } from "../ImagePlugin";
import DropDown, { DropDownItem } from "./DropDownComponent";
import { blockTypeToBlockName, useToolbarState } from "./ToolbarContext";

interface ToolbarPluginProps {
    imageCount: number;
    canInsertImage: boolean;
}

function ImagePicker({
    canInsertImage,
    imageCount,
}: {
    canInsertImage: boolean;
    imageCount: number;
}) {
    const [editor] = useLexicalComposerContext();

    const loadImage = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const filesToProcess = Array.from(files);
        const availableSlots = Math.min(filesToProcess.length, 2 - imageCount);

        if (availableSlots <= 0) {
            alert(`Maximum of 2 images allowed. Current count: ${imageCount}`);
            return;
        }

        if (filesToProcess.length > availableSlots) {
            alert(
                `Can only insert ${availableSlots} more image(s). Current count: ${imageCount}/2`
            );
        }

        filesToProcess.slice(0, availableSlots).forEach((file) => {
            const reader = new FileReader();
            reader.onload = function () {
                if (typeof reader.result === "string") {
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                        src: reader.result,
                        altText: "Uploaded Image",
                        maxWidth: 600,
                        showCaption: false,
                        captionsEnabled: false,
                    });
                }
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div>
            <input
                id="file-input"
                type="file"
                accept="image/*"
                capture={false}
                multiple={false}
                style={{ display: "none" }}
                onChange={(e) => loadImage(e.target.files)}
            />
            <button
                className={
                    "flex items-center justify-center p-2 border-none text-base font-medium cursor-pointer transition-all select-none touch-manipulation focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                }
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                    if (canInsertImage) {
                        document.getElementById("file-input")?.click();
                    } else {
                        alert(
                            `Maximum of 2 images allowed. Current count: ${imageCount}`
                        );
                    }
                }}
            >
                <IconComponent name={IconsEnum.Image} />
            </button>
        </div>
    );
}

export default function ToolbarPlugin({
    imageCount,
    canInsertImage,
}: ToolbarPluginProps) {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState("paragraph");
    const [, setSelectedElementKey] = useState<NodeKey | null>(null);
    const { toolbarState, updateToolbarState } = useToolbarState();

    const $handleHeadingNode = useCallback(
        (selectedElement: LexicalNode) => {
            const type = $isHeadingNode(selectedElement)
                ? selectedElement.getTag()
                : selectedElement.getType();

            if (type in blockTypeToBlockName) {
                updateToolbarState(
                    "blockType",
                    type as keyof typeof blockTypeToBlockName
                );
            }
        },
        [updateToolbarState]
    );

    const $updateToolbar = useCallback(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        updateToolbarState("textLength", utf8Length(text));

        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element = $findTopLevelElement(anchorNode);
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                setSelectedElementKey(elementKey);
                $handleHeadingNode(element);
            }

            updateToolbarState("isBold", selection.hasFormat("bold"));
            updateToolbarState(
                "isStrikethrough",
                selection.hasFormat("strikethrough")
            );
            if ($isNodeSelection(selection)) {
                const nodes = selection.getNodes();
                for (const selectedNode of nodes) {
                    const selectedElement = $findTopLevelElement(selectedNode);
                    $handleHeadingNode(selectedElement);
                }
            }
        }
    }, [editor, updateToolbarState, $handleHeadingNode]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    $updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand<boolean>(
                CAN_UNDO_COMMAND,
                (payload) => {
                    updateToolbarState("canUndo", payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            )
        );
    }, [editor, $updateToolbar]);

    const utf8Length = (text: string) => {
        const currentTextEncoder = textEncoder();

        if (currentTextEncoder === null) {
            // http://stackoverflow.com/a/5515960/210370
            const m = encodeURIComponent(text).match(/%[89ABab]/g);
            return text.length + (m ? m.length : 0);
        }

        return currentTextEncoder.encode(text).length;
    };

    let textEncoderInstance: null | TextEncoder = null;

    const textEncoder = (): null | TextEncoder => {
        if (window.TextEncoder === undefined) {
            return null;
        }

        if (textEncoderInstance === null) {
            textEncoderInstance = new window.TextEncoder();
        }

        return textEncoderInstance;
    };

    const formatHeading = (
        editor: LexicalEditor,
        blockType: string,
        headingSize: HeadingTagType
    ) => {
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => {
                    setBlockType(headingSize);
                    return $createHeadingNode(headingSize);
                });
            });
        } else {
            editor.update(() => {
                const selection = $getSelection();
                setBlockType("paragraph");
                $setBlocksType(selection, () => $createParagraphNode());
            });
        }
    };

    const formatQuote = (editor: LexicalEditor, blockType: string) => {
        if (blockType !== "quote") {
            editor.update(() => {
                const selection = $getSelection();
                setBlockType("quote");
                $setBlocksType(selection, () => $createQuoteNode());
            });
        } else {
            editor.update(() => {
                const selection = $getSelection();
                setBlockType("paragraph");
                $setBlocksType(selection, () => $createParagraphNode());
            });
        }
    };

    return (
        <div className="flex items-center justify-start px-3 py-2 bg-white border-t border-border-default select-none">
            <DropDown trigger={<IconComponent name={IconsEnum.Plus} />}>
                <DropDownItem
                    onClick={() => {
                        formatQuote(editor, blockType);
                    }}
                    isActive={toolbarState.blockType === "quote"}
                    icon={<IconComponent name={IconsEnum.Quote} size={16} />}
                >
                    Quote
                </DropDownItem>
                <DropDownItem
                    onClick={() => {
                        editor.dispatchCommand(
                            FORMAT_TEXT_COMMAND,
                            "strikethrough"
                        );
                    }}
                    isActive={toolbarState.isStrikethrough}
                    icon={
                        <IconComponent
                            name={IconsEnum.Strikethrough}
                            size={16}
                        />
                    }
                >
                    Strikethrough
                </DropDownItem>
            </DropDown>
            <ImagePicker
                canInsertImage={canInsertImage}
                imageCount={imageCount}
            />
            <button
                onClick={() => {
                    formatHeading(editor, blockType, "h1");
                }}
                className={`flex items-center justify-center p-2 border-none text-base font-medium cursor-pointer select-none touch-manipulation 
                    ${
                        toolbarState.blockType === "h1"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-white border-gray-300 text-gray-700"
                    }
                   `}
                aria-label="Format Bold"
                type="button"
            >
                <IconComponent name={IconsEnum.H1} />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                }}
                className={`flex items-center justify-center p-2 border-none text-base font-medium cursor-pointer  select-none touch-manipulation transition duration-100 active:opacity-80 active:scale-95
                   
                   ${
                       toolbarState.isBold
                           ? "bg-blue-100 text-blue-800 border border-blue-200"
                           : "bg-white border-gray-300 text-gray-700"
                   }`}
                aria-label="Format Bold"
                type="button"
            >
                <IconComponent name={IconsEnum.Bold} />
            </button>
            <button
                className={
                    "flex items-center justify-center p-2 border-none text-base font-medium cursor-pointer  select-none touch-manipulation "
                }
            >
                <IconComponent name={IconsEnum.Link} />
            </button>
            <div className="px-2 text-xs text-text-sub min-w-20">
                {toolbarState.textLength.toLocaleString()}
                {t("chars")}
            </div>
            <div className="px-2">
                <div className="bg-border-default w-0.5 h-6"></div>
            </div>
            <button
                disabled={!toolbarState.canUndo}
                onClick={() => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                className={`flex items-center justify-center px-2 border-none text-base font-medium cursor-pointer
                   `}
                type="button"
            >
                <IconComponent name={IconsEnum.Undo} />
            </button>
            <button
                onClick={() => {}}
                className={`flex items-center justify-center px-2 border-none text-base font-medium cursor-pointer
                   `}
                type="button"
            >
                <IconComponent name={IconsEnum.Keyboard} />
            </button>
        </div>
    );
}

function $findTopLevelElement(node: LexicalNode) {
    let topLevelElement =
        node.getKey() === "root"
            ? node
            : $findMatchingParent(node, (e) => {
                  const parent = e.getParent();
                  return parent !== null && $isRootOrShadowRoot(parent);
              });

    if (topLevelElement === null) {
        topLevelElement = node.getTopLevelElementOrThrow();
    }
    return topLevelElement;
}
