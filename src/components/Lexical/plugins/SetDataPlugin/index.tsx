import { useEffect } from "react";
import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";

export const TextHtmlMimeType = "text/html";

export default function SetDataPlugin({ initValue }: { initValue: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!initValue) return;

        editor.update(() => {
            // In the browser you can use the native DOMParser API to parse the HTML string.
            const dom = new DOMParser().parseFromString(
                initValue.replace(/\n/g, ""),
                TextHtmlMimeType
            );

            // Once you have the DOM instance it's easy to generate LexicalNodes.
            const nodes = $generateNodesFromDOM(editor, dom);

            // Insert them at a selection.
            $insertNodes(nodes);

            // Select the root
            $getRoot().select();
        });
    }, [editor, initValue]);

    return null;
}
