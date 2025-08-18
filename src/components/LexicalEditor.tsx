import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import {
    AutoLinkPlugin,
    createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { Chip } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { IconsEnum } from "../enums/IconEnum";
import { t } from "../i18n";
import SwiftUIBridge from "../utils/bridge";
import { CustomLexicalComposerProvider } from "../utils/CustomLexicalComposerProvider";
import { SharedCommand } from "../utils/sharedCommands";
import { createUrlMatchers } from "../utils/urlMatchers";
import IconComponent from "./IconComponent";
import { createDefaultLexicalContent, EditorNodes } from "./Lexical/editorNode";
import { LexicalTheme } from "./Lexical/lexicalConfig";
import ImagesPlugin from "./Lexical/plugins/ImagePlugin";
import ToolbarPlugin from "./Lexical/plugins/ToolbarPlugin";
import AddTagButtonComponent from "./Tag/AddTagButtonComponent";
import TagEditorComponent from "./Tag/TagEditorComponent";

function onError(error: Error) {
    console.error(error);
}

export interface LexicalEditorProps {
    placeholder?: string;
    onContentChange?: (html: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    initialContent?: string;
    isRichText?: boolean;
}

export default function LexicalEditor({
    placeholder = "Start typing...",
    // onContentChange,
    onBlur,
    initialContent = "",
    isRichText = true,
    maxImages = 2,
}: LexicalEditorProps & { maxImages?: number }) {
    const [imageCount, setImageCount] = useState(0);
    const [canInsertImage, setCanInsertImage] = useState(true);
    const [isShowingTagEditor, setIsShowingTagEditor] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [bookName, setBookName] = useState(t("noBook"));

    useEffect(() => {
        // Setup listener for messages from SwiftUI
        SwiftUIBridge.onMessage((data) => {
            setBookName(data || t("noBook"));
            SwiftUIBridge.postMessage(`Received from SwiftUI: ${data}`);
        });
    }, []);

    const handleImageCountChange = useCallback(
        (count: number, canInsert: boolean) => {
            setImageCount(count);
            setCanInsertImage(canInsert);
        },
        []
    );

    const closeEditor = () => {
        SwiftUIBridge.postMessage({
            type: SharedCommand.CLOSE_EDITOR,
        });
    };

    const openBookSheet = () => {
        SwiftUIBridge.postMessage({
            type: SharedCommand.OPEN_BOOK_SHEET,
        });
    };

    const handleTagsChange = useCallback((newTags: string[]) => {
        setTags(newTags);
    }, []);

    const initialConfig = {
        namespace: "MobileEditor",
        theme: LexicalTheme,
        onError,
        nodes: EditorNodes,
        editorState: initialContent
            ? JSON.stringify(createDefaultLexicalContent(initialContent))
            : undefined,
    };

    const MATCHERS = createUrlMatchers(createLinkMatcherWithRegExp);

    return (
        <div className="w-full h-full m-0 p-2 pb-0 box-border bg-white flex flex-col pl-safe-or-2 pr-safe-or-2 overflow-hidden">
            <div className="flex w-full justify-between items-end p-4 py-2 text-sm flex-shrink-0">
                <button
                    onClick={closeEditor}
                    className="text-gray-600 border-none pl-0 font-bold"
                >
                    {t("cancel")}
                </button>
                <button
                    onClick={closeEditor}
                    className="px-2 py-2 text-white min-w-20 border font-bold text-sm rounded-xl bg-button-primary-background"
                >
                    {t("post")}
                </button>
            </div>
            <div className="p-4 text-lg flex items-center flex-shrink-0">
                <button
                    type="button"
                    onClick={openBookSheet}
                    className="px-4 py-3 text-xs flex justify-center border items-center rounded-xl border-border-default gap-2"
                >
                    {bookName !== t("noBook") ? (
                        <IconComponent name={IconsEnum.Book} size={16} />
                    ) : (
                        <IconComponent name={IconsEnum.Cloud} size={16} />
                    )}
                    {bookName}
                    <IconComponent name={IconsEnum.PullDown} size={16} />
                </button>
            </div>
            <LexicalComposer initialConfig={initialConfig}>
                <CustomLexicalComposerProvider theme={initialConfig.theme}>
                    <div className="flex flex-col h-full w-full min-h-0">
                        <div className="relative flex-1 w-full bg-white overflow-y-auto">
                            <RichTextPlugin
                                contentEditable={
                                    <div className="flex flex-col p-4">
                                        <input
                                            className="w-full pb-3 border-none outline-none text-lg font-bold text-gray-500"
                                            type="text"
                                            placeholder={t("title")}
                                            onChange={() => {}}
                                        />
                                        <ContentEditable
                                            className="w-full text-base leading-6 text-gray-800 bg-transparent border-none outline-none resize-none select-text break-words"
                                            aria-placeholder={placeholder}
                                            placeholder={
                                                <div className="absolute top-14 text-gray-500 text-base leading-6 pointer-events-none select-none opacity-70">
                                                    {placeholder}
                                                </div>
                                            }
                                            onFocus={() => {
                                                window.scrollTo(0, 0);
                                            }}
                                            onBlur={onBlur}
                                            style={{
                                                fontSize: "16px",
                                                WebkitUserSelect: "text",
                                                userSelect: "text",
                                                overflowWrap: "break-word",
                                                wordWrap: "break-word",
                                            }}
                                        />
                                    </div>
                                }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <ImagesPlugin
                                captionsEnabled={false}
                                maxImages={maxImages}
                                onImageCountChange={handleImageCountChange}
                            />
                            <AutoLinkPlugin matchers={MATCHERS} />
                            <HistoryPlugin />
                            <AutoFocusPlugin />
                        </div>
                        <div className="flex w-full flex-shrink-0">
                            {tags.length == 0 ? (
                                <AddTagButtonComponent
                                    onClick={() => setIsShowingTagEditor(true)}
                                    className="ml-auto mb-1 mt-1"
                                />
                            ) : (
                                <div className="w-full mb-1 mt-1 overflow-hidden">
                                    <div
                                        className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 px-1"
                                        style={{
                                            scrollbarWidth: "none",
                                            msOverflowStyle: "none",
                                            WebkitOverflowScrolling: "touch",
                                        }}
                                    >
                                        {tags.map((tag, index) => (
                                            <Chip
                                                className="cursor-pointer flex-shrink-0 whitespace-nowrap flex items-center justify-center px-2.5 py-2 rounded-lg border border-tag-active text-tag-active"
                                                key={`${tag}-${index}`}
                                                label={`#${tag}`}
                                                onClick={() =>
                                                    setIsShowingTagEditor(true)
                                                }
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                sx={{
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    padding: "8px 10px",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: "8px",
                                                    border: "1px solid #0092F1",
                                                    background: "#FFF",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <TagEditorComponent
                                isShowing={isShowingTagEditor}
                                initialTags={tags}
                                onClose={() => setIsShowingTagEditor(false)}
                                onTagsChange={handleTagsChange}
                            />
                        </div>
                        {isRichText && (
                            <div className="flex-shrink-0">
                                <ToolbarPlugin
                                    imageCount={imageCount}
                                    canInsertImage={canInsertImage}
                                />
                            </div>
                        )}
                    </div>
                </CustomLexicalComposerProvider>
            </LexicalComposer>
        </div>
    );
}
