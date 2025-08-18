import { AutoLinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { KlassConstructor, LexicalNode } from "lexical";
import { ImageNode } from "./nodes/ImageNode";

export const EditorNodes: Array<KlassConstructor<typeof LexicalNode>> = [
    ImageNode,
    AutoLinkNode,
    HeadingNode,
    QuoteNode,
];

export const createDefaultLexicalContent = (initialContent: string) => ({
    root: {
        children: [
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: initialContent,
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
});
