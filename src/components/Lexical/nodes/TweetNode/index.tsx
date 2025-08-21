import {
    DecoratorBlockNode,
    type SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode";
import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementFormatType,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    Spread,
} from "lexical";
import { type JSX } from "react";
import { TweetComponent } from "./TweetComponent";

function convertTweetElement(
    domNode: HTMLDivElement
): DOMConversionOutput | null {
    const embedTweetURL = domNode.getAttribute("data-url");
    if (!embedTweetURL) {
        return null;
    }
    const node = $createTweetNode(embedTweetURL);
    return { node };
}

export type SerializedTweetNode = Spread<
    {
        url: string;
        type: "tweet";
        version: 1;
    },
    SerializedDecoratorBlockNode
>;

export class TweetNode extends DecoratorBlockNode {
    __url: string;
    __id: string;
    __owner: string;

    static getType(): string {
        return "tweet";
    }

    static clone(node: TweetNode): TweetNode {
        return new TweetNode(node.__url, node.__format, node.__key);
    }

    static importJSON(serializedNode: SerializedTweetNode): TweetNode {
        const node = $createTweetNode(serializedNode.url);
        node.setFormat(serializedNode.format);
        return node;
    }

    exportJSON(): SerializedTweetNode {
        return {
            ...super.exportJSON(),
            url: this.getUrl(),
            type: "tweet",
            version: 1,
        };
    }

    static importDOM(): DOMConversionMap<HTMLDivElement> | null {
        return {
            div: (domNode: HTMLDivElement) => {
                if (
                    !domNode.hasAttribute("class") ||
                    domNode.getAttribute("class") !== "embed-twitter" ||
                    !domNode.hasAttribute("data-url")
                ) {
                    return null;
                }
                return {
                    conversion: convertTweetElement,
                    priority: 2,
                };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("div");
        element.setAttribute("class", "embed-twitter");
        element.setAttribute("data-url", this.getDataURL());
        return { element };
    }

    constructor(url: string, format?: ElementFormatType, key?: NodeKey) {
        super(format, key);
        this.__id = "";
        this.__owner = "";
        const match =
            /^https:\/\/x\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)(\?.*)?\/?$/.exec(
                url
            );
        if (match != null) {
            this.__id = match[4];
            this.__owner = match[2];
        }
        this.__url = url;
    }

    getUrl(): string {
        return this.__url;
    }

    decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
        const embedBlockTheme = config.theme.embedBlock || {};
        const className = {
            base: embedBlockTheme.base || "",
            focus: embedBlockTheme.focus || "",
        };
        return (
            <TweetComponent
                className={className}
                format={this.__format}
                loadingComponent="Loading..."
                nodeKey={this.getKey()}
                tweetID={this.__id}
            />
        );
    }

    isInline(): false {
        return false;
    }

    getDataURL(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _includeInert?: boolean | undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _includeDirectionless?: false | undefined
    ): string {
        return `https://x.com/${this.__owner}/status/${this.__id}`;
    }
}

export function $createTweetNode(tweetUrl: string): TweetNode {
    return new TweetNode(tweetUrl);
}

export function $isTweetNode(
    node: TweetNode | LexicalNode | null | undefined
): node is TweetNode {
    return node instanceof TweetNode;
}
