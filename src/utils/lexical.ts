import type { RangeSelection, TextNode, ElementNode } from "lexical";
import { $isAtNodeEnd } from "@lexical/selection";

export function stripHTML(text: string, ...htmlTag: string[]): string {
    const denyTag = (
        htmlTag
            .join("")
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g) || []
    ).join("");

    return text.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, function ($0, $1) {
        return denyTag.indexOf("<" + $1.toLowerCase() + ">") !== -1 ? "" : $0;
    });
}

export function getSelectedNode(
    selection: RangeSelection
): TextNode | ElementNode {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
}
