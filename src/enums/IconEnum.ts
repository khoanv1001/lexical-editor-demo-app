export const IconsEnum = {
    Plus: "plus",
    Bold: "bold",
    Image: "image",
    Trash: "trash",
    Link: "link",
    Strikethrough: "strikethrough",
    H1: "h1",
    Undo: "undo",
    Keyboard: "keyboard",
    Quote: "quote",
    Book: "book",
    Cloud: "cloud",
    PullDown: "pull-down",
    Youtube: "youtube",
} as const;

export type IconsEnum = (typeof IconsEnum)[keyof typeof IconsEnum];
