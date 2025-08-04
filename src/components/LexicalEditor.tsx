import { $createParagraphNode, $getRoot, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useState, useCallback, useEffect } from 'react';
import {mergeRegister} from '@lexical/utils';
import ImagesPlugin, { INSERT_IMAGE_COMMAND } from './Lexical/plugins/ImagePlugin';
import { ImageNode } from './Lexical/nodes/ImageNode';
import SwiftUIBridge from '../utils/bridge';
import { AutoLinkPlugin, createLinkMatcherWithRegExp } from '@lexical/react/LexicalAutoLinkPlugin';
import {AutoLinkNode} from '@lexical/link';
import AddTagButtonComponent from './Tag/AddTagButtonComponent';
import TagEditorComponent from './Tag/TagEditorComponent';

const theme = {
  paragraph: 'mb-4 leading-6 last:mb-0',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

function onError(error: Error) {
  console.error(error);
}

function ToolbarPlugin({ 
  imageCount, 
  canInsertImage 
}: { 
  imageCount: number; 
  canInsertImage: boolean; 
}) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
    }
  }, []);

  useEffect(() => {
    // Setup listener for messages from SwiftUI
    SwiftUIBridge.onMessage((data) => {
      SwiftUIBridge.postMessage(`Received from SwiftUI: ${data}`);
    });

    // Send message to SwiftUI
    SwiftUIBridge.postMessage({ type: "INIT", payload: { message: "hello" } });
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateToolbar]);

  return (
    <div className="flex items-center justify-start gap-2 p-3 bg-gray-50 rounded-t-lg border-b border-gray-200 overflow-x-auto overscroll-x-contain
                     dark:bg-gray-800 dark:border-gray-600 
                     max-sm:p-2 max-sm:gap-1.5 
                     select-none scroll-smooth
                     pl-safe-or-3 pr-safe-or-3">
      <button
        className="flex items-center justify-center min-w-11 h-11 px-3 py-2 bg-white border border-gray-300 rounded-lg text-base font-medium text-gray-700 cursor-pointer transition-all duration-200 ease-in-out select-none touch-manipulation
                   hover:bg-gray-100 hover:border-gray-400 
                   active:bg-gray-200 active:scale-95 
                   focus:outline-2 focus:outline-blue-500 focus:outline-offset-2
                   dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:hover:bg-gray-600 dark:hover:border-gray-400 dark:active:bg-gray-500
                   max-sm:min-w-10 max-sm:h-10 max-sm:px-2.5 max-sm:py-1.5 max-sm:text-sm"
        onClick={() => {
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            const paragraph = $createParagraphNode();
            root.append(paragraph);
            paragraph.select();
          });
        }}
        type="button"
        aria-label="Clear"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        Clear
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={`flex items-center justify-center min-w-11 h-11 px-3 py-2 border rounded-lg text-base font-medium cursor-pointer transition-all duration-200 ease-in-out select-none touch-manipulation
                   focus:outline-2 focus:outline-blue-500 focus:outline-offset-2
                   max-sm:min-w-10 max-sm:h-10 max-sm:px-2.5 max-sm:py-1.5 max-sm:text-sm
                   ${isBold 
                     ? 'bg-blue-500 text-white border-blue-500 dark:bg-blue-500 dark:border-blue-500' 
                     : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 active:bg-gray-200 active:scale-95 dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:hover:bg-gray-600 dark:hover:border-gray-400 dark:active:bg-gray-500'
                   }`}
        aria-label="Format Bold"
        type="button"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <strong>B</strong>
      </button>
      <ImagePicker 
        canInsertImage={canInsertImage}
        imageCount={imageCount}
      />
    </div>
  );
}

// Plugin to handle content changes
function OnChangeContentPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  return (
    <OnChangePlugin
      onChange={() => {
        editor.update(() => {
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html);
        });
      }}
    />
  );
}

function ImagePicker({ 
  canInsertImage,
  imageCount
}: { 
  canInsertImage: boolean;
  imageCount: number;
}) {
  const [editor] = useLexicalComposerContext();

  const loadImage = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesToProcess = Array.from(files);
    const availableSlots = Math.min(filesToProcess.length, 2 - imageCount);

    if (availableSlots <= 0) {
      alert(`Maximum of 2 images allowed. Current count: ${imageCount}`);
      return;
    }

    if (filesToProcess.length > availableSlots) {
      alert(`Can only insert ${availableSlots} more image(s). Current count: ${imageCount}/2`);
    }

    // Process only the files that fit within the limit
    filesToProcess.slice(0, availableSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function () {
        if (typeof reader.result === 'string') {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: reader.result,
            altText: 'Uploaded Image',
            maxWidth: 600,
            showCaption: false,
            captionsEnabled: false,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        capture={false}
        multiple={false}
        style={{ display: 'none' }}
        onChange={(e) => loadImage(e.target.files)}
      />
      <button 
        type="button" 
        onClick={() => {
          if (canInsertImage) {
            document.getElementById('file-input')?.click();
          } else {
            alert(`Maximum of 2 images allowed. Current count: ${imageCount}`);
          }
        }}
        disabled={!canInsertImage}
        className={`flex items-center justify-center min-w-11 h-11 px-3 py-2 border rounded-lg text-base font-medium cursor-pointer transition-all duration-200 ease-in-out select-none touch-manipulation
                   focus:outline-2 focus:outline-blue-500 focus:outline-offset-2
                   max-sm:min-w-10 max-sm:h-10 max-sm:px-2.5 max-sm:py-1.5 max-sm:text-sm
                   ${!canInsertImage 
                     ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60 hover:bg-gray-50 hover:border-gray-200 hover:transform-none dark:bg-gray-800 dark:text-gray-500 dark:border-gray-600' 
                     : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 active:bg-gray-200 active:scale-95 dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:hover:bg-gray-600 dark:hover:border-gray-400 dark:active:bg-gray-500'
                   }`}
        title={!canInsertImage ? `Maximum images reached (${imageCount}/2)` : 'Add photo'}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        Photo
      </button>
    </div>
  );
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
  onContentChange,
  onFocus,
  onBlur,
  initialContent = "",
  isRichText = true,
  maxImages = 2
}: LexicalEditorProps & { maxImages?: number }) {
  const [imageCount, setImageCount] = useState(0);
  const [canInsertImage, setCanInsertImage] = useState(true);
  const [isShowingTagEditor, setIsShowingTagEditor] = useState(false);

  const handleImageCountChange = useCallback((count: number, canInsert: boolean) => {
    setImageCount(count);
    setCanInsertImage(canInsert);
  }, []);

  const initialConfig = {
    namespace: 'MobileEditor',
    theme,
    onError,
    nodes: [
      ImageNode,
      AutoLinkNode
    ],
    editorState: initialContent ? JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: initialContent,
                type: "text",
                version: 1
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1
          }
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    }) : undefined
  };

  const handleContentChange = (html: string) => {
    onContentChange?.(html);
  };

  const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

  const MATCHERS = [
    createLinkMatcherWithRegExp(URL_REGEX, (text) => {
      return text.startsWith("http") ? text : `https://${text}`;
    })
  ];

  return (
    <div className="w-full max-w-full m-0 p-2 box-border font-sans bg-white rounded-xl shadow-md
                     dark:bg-gray-800 dark:text-white
                     max-sm:p-1 max-sm:rounded-lg
                     pl-safe-or-2 pr-safe-or-2
                     focus-within:shadow-lg focus-within:ring-2 focus-within:ring-blue-300 focus-within:ring-opacity-50">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative bg-white rounded-b-lg min-h-50
                        dark:bg-gray-800
                        max-sm:rounded-b-md">
          {isRichText ? (
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className="min-h-50 p-5 text-base leading-6 text-gray-800 bg-transparent border-none outline-none resize-none caret-blue-500 select-text break-words
                             dark:text-white
                             max-sm:p-4 max-sm:min-h-38"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="absolute top-5 left-5 right-5 text-gray-500 text-base leading-6 pointer-events-none select-none opacity-70
                                     dark:text-gray-400
                                     max-sm:top-4 max-sm:left-4 max-sm:right-4">{placeholder}</div>
                  }
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={{ 
                    fontSize: '16px', // Prevents zoom on iOS
                    WebkitUserSelect: 'text',
                    userSelect: 'text',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word'
                  }}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          ) : (
            <PlainTextPlugin
              contentEditable={
                <ContentEditable 
                  className="min-h-50 p-5 text-base leading-6 text-gray-800 bg-transparent border-none outline-none resize-none caret-blue-500 select-text break-words
                             dark:text-white
                             max-sm:p-4 max-sm:min-h-38"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="absolute top-5 left-5 right-5 text-gray-500 text-base leading-6 pointer-events-none select-none opacity-70
                                     dark:text-gray-400
                                     max-sm:top-4 max-sm:left-4 max-sm:right-4">{placeholder}</div>
                  }
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={{ 
                    fontSize: '16px', // Prevents zoom on iOS
                    WebkitUserSelect: 'text',
                    userSelect: 'text',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word'
                  }}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          )}
          <ImagesPlugin 
            captionsEnabled={false} 
            maxImages={maxImages}
            onImageCountChange={handleImageCountChange}
          />
          <AutoLinkPlugin matchers={MATCHERS} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangeContentPlugin onChange={handleContentChange} />
        </div>
        <div className="flex">
          <AddTagButtonComponent onClick={() => setIsShowingTagEditor(true)} className="ml-auto mb-1 mt-1" />
          {isShowingTagEditor && (
            <TagEditorComponent
              isShowing={isShowingTagEditor}
              onClose={() => setIsShowingTagEditor(false)}
            />
          )}
        </div>
        {isRichText && <ToolbarPlugin imageCount={imageCount} canInsertImage={canInsertImage} />}
      </LexicalComposer>
    </div>
  );
}
