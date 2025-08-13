import type { ReactNode } from "react";
import type { EditorThemeClasses } from "lexical";
import { useLexicalComposerContext as useOfficialLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    LexicalComposerContext,
    createLexicalComposerContext,
    type LexicalComposerContextWithEditor,
} from "./context";

// Provider component that bridges official Lexical context to your custom context
export function CustomLexicalComposerProvider({
    children,
    theme,
}: {
    children: ReactNode;
    theme?: EditorThemeClasses | null;
}) {
    const [editor] = useOfficialLexicalComposerContext();

    const contextValue: LexicalComposerContextWithEditor = [
        editor,
        createLexicalComposerContext(null, theme),
    ];

    return (
        <LexicalComposerContext.Provider value={contextValue}>
            {children}
        </LexicalComposerContext.Provider>
    );
}
