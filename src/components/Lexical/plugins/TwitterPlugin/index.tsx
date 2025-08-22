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
import { TweetNode, $createTweetNode } from "../../nodes/TweetNode";
import { getSelectedNode } from "../../../../utils/lexical";

// eslint-disable-next-line react-refresh/only-export-components
export const INSERT_TWEET_COMMAND: LexicalCommand<string> = createCommand();

export default function TwitterPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([TweetNode])) {
            throw new Error(
                "TwitterPlugin: TweetNode not registered on editor"
            );
        }

        return editor.registerCommand<string>(
            INSERT_TWEET_COMMAND,
            (payload) => {
                const tweetNode = $createTweetNode(payload);
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const node = getSelectedNode(selection);
                    const focusNode = selection.focus.getNode();
                    if ($isRootOrShadowRoot(selection.focus.getNode())) {
                        if ($isParagraphNode(focusNode)) {
                            focusNode.append($createParagraphNode());
                        }
                        $insertNodeToNearestRoot(tweetNode);
                    } else if (
                        $isParagraphNode(node) &&
                        node.getTextContent() === ""
                    ) {
                        node.insertBefore(tweetNode);
                    } else {
                        $insertNodeToNearestRoot(tweetNode);
                    }
                } else {
                    $insertNodeToNearestRoot(tweetNode);
                }

                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
}
