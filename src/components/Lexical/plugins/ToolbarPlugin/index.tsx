import { mergeRegister } from "@lexical/utils";
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_LOW,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
    type LexicalEditor,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { FaQuoteLeft, FaRegImage } from "react-icons/fa6";
import { HiMiniBold, HiMiniH1 } from "react-icons/hi2";
import { LuCirclePlus } from "react-icons/lu";
import { MdOutlineKeyboardHide } from "react-icons/md";
import { RiLinkM } from "react-icons/ri";
import { TbArrowBackUp } from "react-icons/tb";
import { GoStrikethrough } from "react-icons/go";
import { INSERT_IMAGE_COMMAND } from "../ImagePlugin";
import DropDown, { DropDownItem } from "./DropDownComponent";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, type HeadingTagType } from "@lexical/rich-text";
import { useLexicalComposerContext } from "../../../../utils/context";

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
                <FaRegImage size={24} className="font-bold" />
            </button>
        </div>
    );
}

export default function ToolbarPlugin({
    imageCount,
    canInsertImage,
}: ToolbarPluginProps) {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [activeItems, setActiveItems] = useState<Set<string>>(new Set());
    const [blockType, setBlockType] = useState("paragraph");
    const [canUndo, setCanUndo] = useState(false);

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"));
            const isStrikethrough = selection.hasFormat("strikethrough");
            setActiveItems((prev) => {
                const newSet = new Set(prev);
                if (!isStrikethrough && newSet.has("Strikethrough")) {
                    newSet.delete("Strikethrough");
                }
                return newSet;
            });
        }
    }, []);

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
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            )
        );
    }, [editor, $updateToolbar]);

    const toggleItem = (itemId: string) => {
        setActiveItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
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

    return (
        <div className="flex items-center justify-start px-2 py-3 bg-white border-t border-border-default select-none">
            <DropDown
                trigger={<LuCirclePlus size={24} className="font-bold" />}
            >
                <DropDownItem
                    onClick={() => toggleItem("Quote")}
                    isActive={activeItems.has("Quote")}
                    icon={<FaQuoteLeft size={16} />}
                >
                    Quote
                </DropDownItem>
                <DropDownItem
                    onClick={() => {
                        toggleItem("Strikethrough");
                        editor.dispatchCommand(
                            FORMAT_TEXT_COMMAND,
                            "strikethrough"
                        );
                    }}
                    isActive={activeItems.has("Strikethrough")}
                    icon={<GoStrikethrough size={16} />}
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
                        blockType === "h1"
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 active:bg-gray-200 active:scale-95"
                    }
                   `}
                aria-label="Format Bold"
                type="button"
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <HiMiniH1 size={24} className="font-bold" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                }}
                className={`flex items-center justify-center p-2 border-none text-base font-medium cursor-pointer  select-none touch-manipulation transition duration-100 active:opacity-80 active:scale-95
                   
                   ${
                       isBold
                           ? "bg-blue-500 text-white border-blue-500"
                           : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 active:bg-gray-200 active:scale-95"
                   }`}
                aria-label="Format Bold"
                type="button"
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <HiMiniBold size={24} className="font-bold" />
            </button>
            <button
                className={
                    "flex items-center justify-center p-2 border-none text-base font-medium cursor-pointer  select-none touch-manipulation "
                }
            >
                <RiLinkM size={24} className="font-bold" />
            </button>
            <div className="px-2 text-xs text-text-sub">000000文字</div>
            <div className="px-2">
                <div className="bg-border-default w-0.5 h-6"></div>
            </div>
            <button
                disabled={!canUndo}
                onClick={() => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                className={`flex items-center justify-center px-2 border-none text-base font-medium cursor-pointer select-none touch-manipulation
                   `}
                type="button"
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <TbArrowBackUp size={24} className="font-bold" />
            </button>
            <button
                onClick={() => {}}
                className={`flex items-center justify-center px-2 border-none text-base font-medium cursor-pointer select-none touch-manipulation
                   `}
                type="button"
                style={{ WebkitTapHighlightColor: "transparent" }}
            >
                <MdOutlineKeyboardHide size={24} className="font-bold" />
            </button>
        </div>
    );
}
