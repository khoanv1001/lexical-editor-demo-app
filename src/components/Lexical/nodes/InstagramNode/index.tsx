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
import { InstagramComponent } from "./InstagramComponent";

function convertInstagramElement(
    domNode: HTMLDivElement
): DOMConversionOutput | null {
    const embedInstagramURL = domNode.getAttribute("data-url");
    if (embedInstagramURL === null) {
        return null;
    }
    const postId = embedInstagramURL.split("/").pop();

    if (postId) {
        const node = $createInstagramNode(postId);
        return { node };
    }
    return null;
}

export type SerializedInstagramNode = Spread<
    {
        id: string;
        type: "instagram";
        version: 1;
    },
    SerializedDecoratorBlockNode
>;

export class InstagramNode extends DecoratorBlockNode {
    __id: string;

    static getType(): string {
        return "instagram";
    }

    static clone(node: InstagramNode): InstagramNode {
        return new InstagramNode(node.__id, node.__format, node.__key);
    }

    static importJSON(serializedNode: SerializedInstagramNode): InstagramNode {
        const node = $createInstagramNode(serializedNode.id);
        node.setFormat(serializedNode.format);
        return node;
    }

    exportJSON(): SerializedInstagramNode {
        return {
            ...super.exportJSON(),
            id: this.getId(),
            type: "instagram",
            version: 1,
        };
    }

    static importDOM(): DOMConversionMap<HTMLDivElement> | null {
        return {
            div: (domNode: HTMLDivElement) => {
                if (
                    !domNode.hasAttribute("class") ||
                    domNode.getAttribute("class") !== "embed-instagram" ||
                    !domNode.hasAttribute("data-url")
                ) {
                    return null;
                }
                return {
                    conversion: convertInstagramElement,
                    priority: 2,
                };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("div");
        element.setAttribute("class", "embed-instagram");
        element.setAttribute("data-url", this.getDataURL());
        return { element };
    }

    constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
        super(format, key);
        this.__id = id;
    }

    getId(): string {
        return this.__id;
    }

    decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
        const embedBlockTheme = config.theme.embedBlock || {};
        const className = {
            base: embedBlockTheme.base || "",
            focus: embedBlockTheme.focus || "",
        };
        return (
            <InstagramComponent
                className={className}
                format={this.__format}
                loadingComponent="Loading..."
                nodeKey={this.getKey()}
                instagramID={this.__id}
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
        return `https://www.instagram.com/p/${this.__id}`;
    }
}

export function $createInstagramNode(instagramID: string): InstagramNode {
    return new InstagramNode(instagramID);
}

export function $isInstagramNode(
    node: InstagramNode | LexicalNode | null | undefined
): node is InstagramNode {
    return node instanceof InstagramNode;
}
