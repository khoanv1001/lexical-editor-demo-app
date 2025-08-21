/* eslint-disable react-refresh/only-export-components */
import { useEffect, type JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import {
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    type LexicalCommand,
    $getSelection,
    $isRangeSelection,
    $isRootOrShadowRoot,
    $createParagraphNode,
    $isParagraphNode,
} from "lexical";
import { $createInstagramNode, InstagramNode } from "../../nodes/InstagramNode";
import { getSelectedNode } from "../../../../utils/lexical";

export const INSERT_INSTAGRAM_COMMAND: LexicalCommand<string> = createCommand();

export default function InstagramPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([InstagramNode])) {
            throw new Error(
                "InstagramPlugin: InstagramNode not registered on editor"
            );
        }

        return editor.registerCommand<string>(
            INSERT_INSTAGRAM_COMMAND,
            (payload) => {
                const instagramNode = $createInstagramNode(payload);
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const node = getSelectedNode(selection);
                    const focusNode = selection.focus.getNode();
                    if ($isRootOrShadowRoot(selection.focus.getNode())) {
                        if ($isParagraphNode(focusNode)) {
                            focusNode.append($createParagraphNode());
                        }
                        $insertNodeToNearestRoot(instagramNode);
                    } else if (
                        $isParagraphNode(node) &&
                        node.getTextContent() === ""
                    ) {
                        node.insertBefore(instagramNode);
                    } else {
                        $insertNodeToNearestRoot(instagramNode);
                    }
                } else {
                    $insertNodeToNearestRoot(instagramNode);
                }

                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
}
