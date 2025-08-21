/* eslint-disable @typescript-eslint/no-unused-vars */
import { addClassNamesToElement } from "@lexical/utils";
import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalCommand,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    NodeSelection,
    RangeSelection,
    SerializedElementNode,
    Spread,
} from "lexical";
import {
    $applyNodeReplacement,
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    createCommand,
    ElementNode,
} from "lexical";

export type LinkAttributes = {
    rel?: null | string;
    target?: null | string;
};

export type SerializedLinkNode = Spread<
    {
        type: "link";
        url: string;
        version: 1;
    },
    Spread<LinkAttributes, SerializedElementNode>
>;

/** @noInheritDoc */
export class CustomLinkNode extends ElementNode {
    /** @internal */
    __url: string;
    /** @internal */
    __target: null | string;
    /** @internal */
    __rel: null | string;

    static getType(): string {
        return "link";
    }

    static clone(node: CustomLinkNode): CustomLinkNode {
        return new CustomLinkNode(
            node.__url,
            { rel: node.__rel, target: node.__target },
            node.__key
        );
    }

    constructor(url: string, attributes: LinkAttributes = {}, key?: NodeKey) {
        super(key);
        const { target = null, rel = null } = attributes;
        this.__url = url;
        this.__target = target;
        this.__rel = rel;
    }

    createDOM(config: EditorConfig): HTMLAnchorElement {
        const element = document.createElement("a");
        element.href = this.__url;
        if (this.__target !== null) {
            element.target = this.__target;
        }
        if (this.__rel !== null) {
            element.rel = this.__rel;
        }
        addClassNamesToElement(element, config.theme.link);
        return element;
    }

    updateDOM(prevNode: CustomLinkNode, anchor: HTMLAnchorElement): boolean {
        const url = this.__url;
        const target = this.__target;
        const rel = this.__rel;
        if (url !== prevNode.__url) {
            anchor.href = url;
        }

        if (target !== prevNode.__target) {
            if (target) {
                anchor.target = target;
            } else {
                anchor.removeAttribute("target");
            }
        }

        if (rel !== prevNode.__rel) {
            if (rel) {
                anchor.rel = rel;
            } else {
                anchor.removeAttribute("rel");
            }
        }
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            a: () => ({
                conversion: convertAnchorElement,
                priority: 1,
            }),
        };
    }

    exportDOM(editor: LexicalEditor): DOMExportOutput {
        const element = this.createDOM(editor._config);
        element.removeAttribute("rel");
        element.removeAttribute("target");
        element.removeAttribute("class");

        return { after, element };
    }

    static importJSON(
        serializedNode: SerializedLinkNode | SerializedAutoLinkNode
    ): CustomLinkNode {
        const node = $createLinkNode(serializedNode.url, {
            rel: serializedNode.rel,
            target: serializedNode.target,
        });
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }

    exportJSON(): SerializedLinkNode | SerializedAutoLinkNode {
        return {
            ...super.exportJSON(),
            rel: this.getRel(),
            target: this.getTarget(),
            type: "link",
            url: this.getURL(),
            version: 1,
        };
    }

    getURL(): string {
        return this.getLatest().__url;
    }

    setURL(url: string): void {
        const writable = this.getWritable();
        writable.__url = url;
    }

    getTarget(): null | string {
        return this.getLatest().__target;
    }

    setTarget(target: null | string): void {
        const writable = this.getWritable();
        writable.__target = target;
    }

    getRel(): null | string {
        return this.getLatest().__rel;
    }

    setRel(rel: null | string): void {
        const writable = this.getWritable();
        writable.__rel = rel;
    }

    insertNewAfter(
        selection: RangeSelection,
        restoreSelection = true
    ): null | ElementNode {
        const element = this.getParentOrThrow().insertNewAfter(
            selection,
            restoreSelection
        );
        if ($isElementNode(element)) {
            const linkNode = $createLinkNode(this.__url, {
                rel: this.__rel,
                target: this.__target,
            });
            element.append(linkNode);
            return linkNode;
        }
        return null;
    }

    canInsertTextBefore(): false {
        return false;
    }

    canInsertTextAfter(): false {
        return false;
    }

    canBeEmpty(): false {
        return false;
    }

    isInline(): true {
        return true;
    }

    extractWithChild(
        _child: LexicalNode,
        selection: RangeSelection | NodeSelection,
        _destination: "clone" | "html"
    ): boolean {
        if (!$isRangeSelection(selection)) {
            return false;
        }

        const anchorNode = selection.anchor.getNode();
        const focusNode = selection.focus.getNode();

        return (
            this.isParentOf(anchorNode) &&
            this.isParentOf(focusNode) &&
            selection.getTextContent().length > 0
        );
    }
}

function convertAnchorElement(domNode: Node): DOMConversionOutput {
    let node = null;
    if (domNode instanceof HTMLAnchorElement) {
        const content = domNode.textContent;
        if (content !== null && content !== "") {
            node = $createLinkNode(domNode.getAttribute("href") || "", {
                rel: domNode.getAttribute("rel"),
                target: domNode.getAttribute("target"),
            });
        }
    }
    return { node };
}

function after(
    generatedElement: HTMLElement | DocumentFragment | Text | null | undefined
): HTMLElement | DocumentFragment | Text | null | undefined {
    if (!(generatedElement instanceof HTMLElement)) {
        return generatedElement;
    }

    const spanElements = generatedElement.getElementsByTagName("span");
    if (spanElements.length === 0) {
        return generatedElement;
    }

    const linkElement = document.createElement("a");
    const hrefValue = generatedElement.getAttribute("href");
    if (hrefValue) {
        linkElement.href = hrefValue;
    }

    for (let i = 0; i < spanElements.length; i++) {
        const element = spanElements[i];
        linkElement.innerHTML = element.innerHTML;
        break;
    }

    return linkElement;
}

export function $createLinkNode(
    url: string,
    attributes?: LinkAttributes
): CustomLinkNode {
    return $applyNodeReplacement(new CustomLinkNode(url, attributes));
}

export function $isLinkNode(
    node: LexicalNode | null | undefined
): node is CustomLinkNode {
    return node instanceof CustomLinkNode;
}

export type SerializedAutoLinkNode = Spread<
    {
        type: "autolink";
        version: 1;
    },
    SerializedLinkNode
>;

// Custom node type to override `canInsertTextAfter` that will
// allow typing within the link
export class AutoLinkNode extends CustomLinkNode {
    static getType(): string {
        return "autolink";
    }

    static clone(node: AutoLinkNode): AutoLinkNode {
        return new AutoLinkNode(
            node.__url,
            { rel: node.__rel, target: node.__target },
            node.__key
        );
    }

    static importJSON(serializedNode: SerializedAutoLinkNode): AutoLinkNode {
        const node = $createAutoLinkNode(serializedNode.url, {
            rel: serializedNode.rel,
            target: serializedNode.target,
        });
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }

    static importDOM(): null {
        // TODO: Should link node should handle the import over autolink?
        return null;
    }

    exportDOM(editor: LexicalEditor): DOMExportOutput {
        const element = this.createDOM(editor._config);
        element.removeAttribute("rel");
        element.removeAttribute("target");
        element.removeAttribute("class");

        return { after, element };
    }

    exportJSON(): SerializedAutoLinkNode {
        return {
            ...super.exportJSON(),
            type: "autolink",
            version: 1,
        };
    }

    insertNewAfter(
        selection: RangeSelection,
        restoreSelection = true
    ): null | ElementNode {
        const element = this.getParentOrThrow().insertNewAfter(
            selection,
            restoreSelection
        );
        if ($isElementNode(element)) {
            const linkNode = $createAutoLinkNode(this.__url, {
                rel: this.__rel,
                target: this.__target,
            });
            element.append(linkNode);
            return linkNode;
        }
        return null;
    }
}

export function $createAutoLinkNode(
    url: string,
    attributes?: LinkAttributes
): AutoLinkNode {
    return $applyNodeReplacement(new AutoLinkNode(url, attributes));
}

export function $isAutoLinkNode(
    node: LexicalNode | null | undefined
): node is AutoLinkNode {
    return node instanceof AutoLinkNode;
}

export const TOGGLE_LINK_COMMAND: LexicalCommand<
    string | ({ url: string } & LinkAttributes) | null
> = createCommand("TOGGLE_LINK_COMMAND");

export function toggleLink(
    url: null | string,
    attributes: LinkAttributes = {}
): void {
    const { target } = attributes;
    const rel = attributes.rel === undefined ? "noopener" : attributes.rel;
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
        return;
    }
    const nodes = selection.extract();

    console.log("URL: ", url);
    if (url === null) {
        // Remove LinkNodes
        nodes.forEach((node) => {
            const parent = node.getParent();

            if ($isLinkNode(parent)) {
                const children = parent.getChildren();

                for (let i = 0; i < children.length; i++) {
                    parent.insertBefore(children[i]);
                }

                parent.remove();
            }
        });
    } else {
        // Add or merge LinkNodes
        if (nodes.length === 1) {
            const firstNode = nodes[0];
            // if the first node is a LinkNode or if its
            // parent is a LinkNode, we update the URL, target and rel.
            const linkNode = $isLinkNode(firstNode)
                ? firstNode
                : $getLinkAncestor(firstNode);
            if (linkNode !== null) {
                if ($isLinkNode(linkNode)) {
                    linkNode.setURL(url);
                }
                if (target !== undefined) {
                    if ($isLinkNode(linkNode)) {
                        linkNode.setTarget(target);
                    }
                }
                if (rel !== null) {
                    if ($isLinkNode(linkNode)) {
                        linkNode.setRel(rel);
                    }
                }
                return;
            }
        }

        let prevParent: ElementNode | CustomLinkNode | null = null;
        let linkNode: CustomLinkNode | null = null;

        nodes.forEach((node) => {
            const parent = node.getParent();

            if (
                parent === linkNode ||
                parent === null ||
                ($isElementNode(node) && !node.isInline())
            ) {
                return;
            }

            if ($isLinkNode(parent)) {
                console.log("tao link 2");
                linkNode = parent;
                parent.setURL(url);
                if (target !== undefined) {
                    parent.setTarget(target);
                }
                if (rel !== null) {
                    linkNode.setRel(rel);
                }
                return;
            }

            if (!parent.is(prevParent)) {
                prevParent = parent;
                linkNode = $createLinkNode(url, { rel, target });
                console.log("Link Node: ", linkNode);
                if ($isLinkNode(parent)) {
                    if (node.getPreviousSibling() === null) {
                        parent.insertBefore(linkNode);
                    } else {
                        parent.insertAfter(linkNode);
                    }
                } else {
                    node.insertBefore(linkNode);
                }
            }

            if ($isLinkNode(node)) {
                if (node.is(linkNode)) {
                    return;
                }
                if (linkNode !== null) {
                    const children = node.getChildren();

                    for (let i = 0; i < children.length; i++) {
                        linkNode.append(children[i]);
                    }
                }

                node.remove();
                return;
            }

            if (linkNode !== null) {
                linkNode.append(node);
            }
        });
    }
}

function $getLinkAncestor(node: LexicalNode): null | LexicalNode {
    return $getAncestor(node, (ancestor) => $isLinkNode(ancestor));
}

function $getAncestor(
    node: LexicalNode,
    predicate: (ancestor: LexicalNode) => boolean
): null | LexicalNode {
    let parent: null | LexicalNode = node;
    while (
        parent !== null &&
        (parent = parent.getParent()) !== null &&
        !predicate(parent)
    );
    return parent;
}
