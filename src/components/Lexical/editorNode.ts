import { AutoLinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { KlassConstructor, LexicalNode } from "lexical";
import { CustomLinkNode } from "./nodes/CustomLinkNode";
import { ImageNode } from "./nodes/ImageNode";
import { InstagramNode } from "./nodes/InstagramNode";
import { $createCustomQuoteNode, CustomQuoteNode } from "./nodes/QuoteNode";
import { TweetNode } from "./nodes/TweetNode";
import { YouTubeNode } from "./nodes/YoutubeNode";

export const EditorNodes: (
    | KlassConstructor<typeof LexicalNode>
    | {
          replace: KlassConstructor<typeof LexicalNode>;
          with: (node: LexicalNode) => LexicalNode;
          withKlass: KlassConstructor<typeof LexicalNode>;
      }
)[] = [
    ImageNode,
    AutoLinkNode,
    CustomLinkNode,
    YouTubeNode,
    TweetNode,
    InstagramNode,
    HeadingNode,
    CustomQuoteNode,
    {
        replace: QuoteNode,
        with: () => $createCustomQuoteNode(),
        withKlass: CustomQuoteNode,
    },
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
