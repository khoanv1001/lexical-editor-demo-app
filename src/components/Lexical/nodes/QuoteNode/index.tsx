import { addClassNamesToElement } from "@lexical/utils";
import { QuoteNode } from "@lexical/rich-text";
import {
    $applyNodeReplacement,
    $createLineBreakNode,
    $isParagraphNode,
    type DOMConversionMap,
    type DOMConversionOutput,
    type DOMExportOutput,
    type EditorConfig,
    type LexicalEditor,
    type LexicalNode,
    type SerializedElementNode,
    type Spread,
} from "lexical";
import { stripHTML } from "../../../../utils/lexical";

export type SerializedQuoteNode = Spread<
    {
        type: "quote";
        version: 1;
    },
    SerializedElementNode
>;

export class CustomQuoteNode extends QuoteNode {
    static getType() {
        return "custom-quote";
    }
    static clone(node: CustomQuoteNode): CustomQuoteNode {
        return new CustomQuoteNode(node.__key);
    }
    static importJSON(json: SerializedQuoteNode): CustomQuoteNode {
        return $createCustomQuoteNode().updateFromJSON(json);
    }

    exportDOM(editor: LexicalEditor): DOMExportOutput {
        const element = this.createDOM(editor._config);
        function after(
            generatedElement:
                | HTMLElement
                | DocumentFragment
                | Text
                | null
                | undefined
        ): HTMLElement | DocumentFragment | Text | null | undefined {
            if (!(generatedElement instanceof HTMLElement)) {
                return generatedElement;
            }

            const figureElement = document.createElement("figure");
            figureElement.setAttribute("class", "blockquote");

            const blockQuoteElement = document.createElement("blockquote");
            const paragraphElement = document.createElement("p");
            const childrenElements = generatedElement.children;

            let quoteBody = String("");

            for (let i = 0; i < childrenElements.length; i++) {
                const childrenElement = childrenElements[i];
                if (!childrenElement || !childrenElement.tagName)
                    return generatedElement;
                const tagName = childrenElement.tagName.toLowerCase();

                if (tagName === "span") {
                    const html = childrenElement.innerHTML;
                    const stripContent = stripHTML(html, "<span>");
                    quoteBody += stripContent;
                } else if (tagName === "br") {
                    quoteBody += "<br>";
                } else {
                    quoteBody += childrenElement.outerHTML;
                }
            }

            paragraphElement.innerHTML = quoteBody;
            blockQuoteElement.append(paragraphElement);
            figureElement.appendChild(blockQuoteElement);
            return figureElement;
        }

        return { after, element };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement("blockquote");
        addClassNamesToElement(element, config.theme.quote);
        return element;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            blockquote: () => ({
                conversion: convertBlockquoteElement,
                priority: 2,
            }),
        };
    }
}

export function $createCustomQuoteNode(): CustomQuoteNode {
    return $applyNodeReplacement(new CustomQuoteNode());
}

function afterImport(
    childLexicalNodes: Array<LexicalNode>
): Array<LexicalNode> {
    const newNodes = [];
    for (let i = 0; i < childLexicalNodes.length; i++) {
        const childLexicalNode = childLexicalNodes[i];
        if (!$isParagraphNode(childLexicalNode)) {
            newNodes.push(childLexicalNode);
        } else {
            childLexicalNode.getChildren().forEach((child) => {
                newNodes.push(child);
            });
        }
        if (i !== childLexicalNodes.length - 1) {
            newNodes.push($createLineBreakNode());
        }
    }

    return newNodes;
}

function convertBlockquoteElement(): DOMConversionOutput {
    return {
        node: $createCustomQuoteNode(),
        after: afterImport,
    };
}
