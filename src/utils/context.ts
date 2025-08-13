import type { EditorThemeClasses, LexicalEditor } from "lexical";

import { createContext as createReactContext, useContext } from "react";

export type LexicalComposerContextType = {
    getTheme: () => EditorThemeClasses | null | undefined;
};

export type LexicalComposerContextWithEditor = [
    LexicalEditor,
    LexicalComposerContextType,
];

export const LexicalComposerContext: React.Context<
    LexicalComposerContextWithEditor | null | undefined
> = createReactContext<LexicalComposerContextWithEditor | null | undefined>(
    null
);

export function createLexicalComposerContext(
    parent: LexicalComposerContextWithEditor | null | undefined,
    theme: EditorThemeClasses | null | undefined
): LexicalComposerContextType {
    let parentContext: LexicalComposerContextType | null = null;

    if (parent != null) {
        parentContext = parent[1];
    }

    function getTheme() {
        if (theme != null) {
            return theme;
        }

        return parentContext != null ? parentContext.getTheme() : null;
    }

    return {
        getTheme,
    };
}

export function useLexicalComposerContext(): LexicalComposerContextWithEditor {
    const composerContext = useContext(LexicalComposerContext);

    if (composerContext == null) {
        invariant(
            false,
            "LexicalComposerContext.useLexicalComposerContext: cannot find a LexicalComposerContext"
        );
    }

    return composerContext;
}

export default function invariant(
    cond?: boolean,
    message?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._args: string[]
): asserts cond {
    if (cond) {
        return;
    }

    throw new Error(
        "Internal Lexical error: invariant() is meant to be replaced at compile " +
            "time. There is no runtime version. Error: " +
            message
    );
}
