import { type EditorThemeClasses } from "lexical";

export const LexicalTheme: EditorThemeClasses = {
    paragraph: "leading-6 last:mb-0",
    text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
    },
    heading: {
        h1: "font-bold text-2xl",
    },
    quote: "m-0 mb-[10px] ml-5 text-[15px] text-[#65676b] border-l-4 border-[#ced0d4] pl-4 ",
    embedBlock: {
        base: "select-none",
        focus: "shadow-lg shadow-black/40 rounded-lg",
    },
};
