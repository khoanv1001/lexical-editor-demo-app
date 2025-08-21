/* eslint-disable react-refresh/only-export-components */
import {
    AutoEmbedOption,
    LexicalAutoEmbedPlugin,
    type EmbedConfig,
    type EmbedMatchResult,
} from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import clsx from "clsx";
import type { LexicalEditor } from "lexical";
import { useMemo, useState, type JSX } from "react";
import * as ReactDOM from "react-dom";
import { IconsEnum } from "../../../../enums/IconEnum";
import useModal from "../../../hooks/useModal";
import ModalLayout from "../../../ModalLayout";
import { INSERT_YOUTUBE_COMMAND } from "../YoutubePlugin";
import { t } from "../../../../i18n";
import { INSERT_TWEET_COMMAND } from "../TwitterPlugin";
import { INSERT_INSTAGRAM_COMMAND } from "../InstagramPlugin";

interface PlaygroundEmbedConfig extends EmbedConfig {
    contentName: string;
    icon: IconsEnum | null;
    exampleUrl: string;
    keywords: Array<string>;
    description?: string;
}

const MENU_MODAL_WIDTH = 250;

// export const LinkEmbedConfig: PlaygroundEmbedConfig = {
//     contentName: "Webページを埋め込む",
//     exampleUrl: "https://example.com",
//     icon: null,
//     insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
//         editor.dispatchCommand(INSERT_WEB_EMBED_COMMAND, result.url);
//     },
//     keywords: ["link", "url"],
//     parseUrl: (text: string) => {
//         const match = urlRegex().exec(text);
//         if (match != null && !EMAIL_MATCHER.test(text)) {
//             return {
//                 id: match[4],
//                 url: match[0],
//             };
//         }

//         return null;
//     },
//     type: "link",
// };

export const YoutubeEmbedConfig: PlaygroundEmbedConfig = {
    contentName: "YouTube",
    exampleUrl: "https://www.youtube.com/watch?v=wK3lywzIaSw",
    icon: IconsEnum.Youtube,
    insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
        editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id);
    },
    keywords: ["youtube", "video"],
    parseUrl: (url: string) => {
        const match =
            /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(
                url
            );
        const id = match ? (match?.[2].length === 11 ? match[2] : null) : null;

        if (id != null) {
            return {
                id,
                url,
            };
        }
        return null;
    },
    type: "youtube-video",
};

export const TwitterEmbedConfig: PlaygroundEmbedConfig = {
    contentName: "Twitter",
    exampleUrl: "https://x.com/nordot_jp/status/1467648053125726208",
    icon: null,
    insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
        editor.dispatchCommand(INSERT_TWEET_COMMAND, result.url);
    },
    keywords: ["tweet", "twitter", "x"],
    parseUrl: (text: string) => {
        const match =
            /^https:\/\/x\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)(\?.*)?\/?$/.exec(
                text
            );
        if (match != null) {
            return {
                id: match[4],
                url: match[0],
            };
        }
        return null;
    },

    type: "tweet",
};

export const InstagramEmbedConfig: PlaygroundEmbedConfig = {
    contentName: "Instagram",
    exampleUrl: "https://www.instagram.com/p/CmV98GevRVN",
    icon: null,
    insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
        editor.dispatchCommand(INSERT_INSTAGRAM_COMMAND, result.id);
    },
    keywords: ["post", "instagram"],
    parseUrl: (text: string) => {
        const match =
            /(?:https?:\/\/www\.)?instagram\.com\S*?\/p\/(\w+)\/?/.exec(text);

        if (match != null) {
            return {
                id: match[1],
                url: match[0],
            };
        }

        return null;
    },

    type: "insta",
};

export const EmbedConfigs = [
    YoutubeEmbedConfig,
    TwitterEmbedConfig,
    InstagramEmbedConfig,
];

function AutoEmbedMenuItem({
    index,
    isSelected,
    onClick,
    onMouseEnter,
    option,
}: {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: AutoEmbedOption;
}) {
    let className = clsx(
        "m-0 min-w-[180px] text-sm outline-none cursor-pointer rounded-lg",
        "my-0 p-2 text-[#050505] leading-4 text-[15px] flex content-center flex-row	flex-shrink-0 rounded-lg border-[0px]",
        "first:rounded-[8px_8px_0px_0px] last:rounded-[0px_0px_8px_8px]"
    );
    if (isSelected) {
        className += " bg-[#eee]";
    }

    return (
        <li
            key={option.key}
            tabIndex={-1}
            className={className}
            ref={option.setRefElement}
            role="option"
            aria-selected={isSelected}
            id={"typeahead-item-" + index}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
        >
            <span className="flex leading-5 flex-grow min-w-[150px]">
                {option.title}
            </span>
        </li>
    );
}

function AutoEmbedMenu({
    options,
    onOptionClick,
    onOptionMouseEnter,
}: {
    onOptionClick: (option: AutoEmbedOption, index: number) => void;
    onOptionMouseEnter: (index: number) => void;
    options: Array<AutoEmbedOption>;
}) {
    return (
        <div
            className={`bg-white shadow-[0_5px_10px_rgba(0,0,0,0.3)] rounded-lg mt-[25px] min-w-[${MENU_MODAL_WIDTH}px]`}
        >
            <ul className="p-0 list-none m-0 rounded-lg max-h-200px overflow-y-none scrollbar-none select-none">
                {options.map((option: AutoEmbedOption, i: number) => (
                    <AutoEmbedMenuItem
                        index={i}
                        isSelected={false}
                        onClick={() => onOptionClick(option, i)}
                        onMouseEnter={() => onOptionMouseEnter(i)}
                        key={option.key}
                        option={option}
                    />
                ))}
            </ul>
        </div>
    );
}

export function AutoEmbedDialog({
    embedConfig,
    onClose,
}: {
    embedConfig: PlaygroundEmbedConfig;
    onClose: () => void;
}): JSX.Element {
    const [text, setText] = useState("");
    const [editor] = useLexicalComposerContext();

    const debounce = (callback: (text: string) => void, delay: number) => {
        let timeoutId: number;
        return (text: string) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                callback(text);
            }, delay);
        };
    };

    const [embedResult, setEmbedResult] = useState<EmbedMatchResult | null>(
        null
    );
    const validateText = useMemo(
        () =>
            debounce((inputText: string) => {
                if (embedConfig != null && inputText != null) {
                    Promise.resolve(embedConfig.parseUrl(inputText)).then(
                        (parseResult) => {
                            setEmbedResult(parseResult);
                        }
                    );
                } else if (embedResult != null) {
                    setEmbedResult(null);
                }
            }, 200),
        [embedConfig, embedResult]
    );

    const onClick = () => {
        if (embedResult !== null) {
            embedConfig.insertNode(editor, embedResult);
            onClose();
        }
    };

    return (
        <ModalLayout
            title={embedConfig.contentName}
            body={
                <div className="flex items-center flex-row mb-[10px]">
                    <input
                        type="text"
                        className="flex flex-[2_2_0%] border-[1px] border-solid border-[#999]
          py-[7px] px-[10px] text-base rounded-[5px] min-w-0"
                        placeholder={embedConfig.exampleUrl}
                        value={text}
                        data-test-id={`${embedConfig.type}-embed-modal-url`}
                        onChange={(e) => {
                            const { value } = e.target;
                            setText(value);
                            validateText(value);
                        }}
                    />
                </div>
            }
            footer={
                <button
                    type="button"
                    aria-label={`${embedConfig.contentName}を挿入`}
                    disabled={!embedResult}
                    onClick={onClick}
                >
                    {t("insert")}
                </button>
            }
        />
    );
}

export default function AutoEmbedPlugin(): JSX.Element {
    const [modal, showModal] = useModal();

    const openEmbedModal = (embedConfig: PlaygroundEmbedConfig) => {
        showModal((onClose) => (
            <AutoEmbedDialog embedConfig={embedConfig} onClose={onClose} />
        ));
    };

    const getMenuOptions = (
        activeEmbedConfig: PlaygroundEmbedConfig,
        embedFn: () => void,
        dismissFn: () => void
    ) => {
        return [
            new AutoEmbedOption(t("pasteURL"), {
                onSelect: dismissFn,
            }),
            new AutoEmbedOption(
                `${activeEmbedConfig.contentName}${t("embed")}`,
                {
                    onSelect: embedFn,
                }
            ),
        ];
    };

    return (
        <>
            {modal}
            <LexicalAutoEmbedPlugin<PlaygroundEmbedConfig>
                embedConfigs={EmbedConfigs}
                onOpenEmbedModalForConfig={openEmbedModal}
                getMenuOptions={getMenuOptions}
                menuRenderFn={(
                    anchorElementRef,
                    { options, selectOptionAndCleanUp, setHighlightedIndex }
                ) => {
                    const windowWidth = window.innerWidth;
                    const anchorElementMargin =
                        anchorElementRef.current?.style.width;
                    const embedMenuWidth = MENU_MODAL_WIDTH;
                    let embedMenuLeft = null;

                    if (anchorElementMargin !== undefined) {
                        if (
                            embedMenuWidth + parseInt(anchorElementMargin) >
                            windowWidth
                        ) {
                            embedMenuLeft = windowWidth - embedMenuWidth - 50;
                        }
                    }
                    return anchorElementRef.current
                        ? ReactDOM.createPortal(
                              <div
                                  className="w-[190px]"
                                  style={{
                                      ...(embedMenuLeft
                                          ? { marginLeft: embedMenuLeft }
                                          : {
                                                marginLeft: anchorElementMargin,
                                            }),
                                  }}
                              >
                                  <AutoEmbedMenu
                                      options={options}
                                      onOptionClick={(
                                          option: AutoEmbedOption,
                                          index: number
                                      ) => {
                                          setHighlightedIndex(index);
                                          selectOptionAndCleanUp(option);
                                      }}
                                      onOptionMouseEnter={(index: number) => {
                                          setHighlightedIndex(index);
                                      }}
                                  />
                              </div>,
                              anchorElementRef.current
                          )
                        : null;
                }}
            />
        </>
    );
}
