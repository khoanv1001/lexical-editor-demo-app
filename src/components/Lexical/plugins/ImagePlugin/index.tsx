/* eslint-disable react-refresh/only-export-components */
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import {
    $createParagraphNode,
    $getRoot,
    $getSelection,
    $isElementNode,
    $isParagraphNode,
    $isRangeSelection,
    $isRootOrShadowRoot,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    ElementNode,
    type LexicalCommand,
    type LexicalEditor,
    type LexicalNode,
    type NodeKey,
} from "lexical";
import { useCallback, useEffect, type JSX } from "react";
import { useLexicalComposerContext } from "../../../../utils/context";
import { getSelectedNode } from "../../../../utils/lexical";
import {
    $createImageNode,
    $isImageNode,
    ImageNode,
} from "../../nodes/ImageNode";

export const ImageMaxLength = 100;

export interface ImagePayload {
    altText: string;
    height?: number;
    key?: NodeKey;
    maxWidth?: number;
    showCaption?: boolean;
    src: string;
    width?: number;
    captionsEnabled?: boolean;
}

export type InsertImagePayload = Readonly<ImagePayload>;

const MAXIMUM_IMAGE_NODE: number = 2;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
    createCommand("INSERT_IMAGE_COMMAND");

function $getImageNodeCount(): number {
    const root = $getRoot();
    let count = 0;

    function traverse(node: LexicalNode) {
        if ($isImageNode(node)) {
            count++;
        }
        if ($isElementNode(node)) {
            const children = node.getChildren?.();
            if (children) {
                children.forEach(traverse);
            }
        }
    }
    traverse(root);
    return count;
}

export default function ImagesPlugin({
    captionsEnabled,
    maxImages = MAXIMUM_IMAGE_NODE,
    onImageCountChange,
}: {
    captionsEnabled?: boolean;
    maxImages?: number;
    onImageCountChange?: (count: number, canInsert: boolean) => void;
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    const updateImageCount = useCallback(() => {
        editor.getEditorState().read(() => {
            const count = $getImageNodeCount();
            onImageCountChange?.(count, count < maxImages);
        });
    }, [editor, maxImages, onImageCountChange]);

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error("ImagesPlugin: ImageNode not registered on editor");
        }

        // Initial count update
        updateImageCount();

        return mergeRegister(
            // Listen for editor state changes to update count
            editor.registerUpdateListener(() => {
                updateImageCount();
            }),

            editor.registerCommand(
                INSERT_IMAGE_COMMAND,
                (payload) => {
                    // Check if we can insert more images
                    const currentCount = $getImageNodeCount();
                    if (currentCount >= maxImages) {
                        console.warn(
                            `Cannot insert image: Maximum of ${maxImages} images allowed`
                        );
                        return false;
                    }

                    const selection = $getSelection();
                    const imageNode = $createImageNode(payload);

                    if ($isRangeSelection(selection)) {
                        const node = getSelectedNode(selection);
                        const focusNode =
                            selection.focus.getNode() as ElementNode;
                        if ($isRootOrShadowRoot(selection.focus.getNode())) {
                            focusNode.append($createParagraphNode());
                            $insertNodeToNearestRoot(imageNode);
                        } else if (
                            $isParagraphNode(node) &&
                            node.getTextContent() === ""
                        ) {
                            node.insertBefore(imageNode);
                        } else {
                            $insertNodeToNearestRoot(imageNode);
                        }
                    } else {
                        $insertNodeToNearestRoot(imageNode);
                    }

                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            )
        );
    }, [
        captionsEnabled,
        editor,
        maxImages,
        onImageCountChange,
        updateImageCount,
    ]);

    return null;
}

// Helper functions for image node management
export function getImageNodeCount(editor: LexicalEditor): number {
    return editor.getEditorState().read(() => $getImageNodeCount());
}

export function canInsertImage(
    editor: LexicalEditor,
    maxImages: number = MAXIMUM_IMAGE_NODE
): boolean {
    return getImageNodeCount(editor) < maxImages;
}

export function insertImage(
    payload: InsertImagePayload,
    editor: LexicalEditor,
    maxImages: number = MAXIMUM_IMAGE_NODE
): boolean {
    if (!canInsertImage(editor, maxImages)) {
        console.warn(
            `Cannot insert image: Maximum of ${maxImages} images allowed`
        );
        return false;
    }
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    return true;
}

declare global {
    interface DragEvent {
        rangeOffset?: number;
        rangeParent?: Node;
    }
}
