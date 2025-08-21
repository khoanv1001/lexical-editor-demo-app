/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, type JSX } from "react";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_LOW,
    createCommand,
    type LexicalCommand,
} from "lexical";
import useModal from "../../../hooks/useModal";
import ModalLayout from "../../../ModalLayout";
import { TOGGLE_LINK_COMMAND, toggleLink } from "../../nodes/CustomLinkNode";
import { validateHttpUrl } from "../../../../utils/urlMatchers";

type Props = {
    onClose: () => void;
    url: string;
};

export const CustomLinkDialog = ({ onClose, url }: Props): JSX.Element => {
    const [text, setText] = useState(url);
    const [editor] = useLexicalComposerContext();
    const [_isValidURL, setIsValidURL] = useState<boolean>(
        validateHttpUrl(url)
    );

    const onClick = () => {
        if (text !== "") {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, text);
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }

        onClose();
    };

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        setIsValidURL(validateHttpUrl(e.target.value));
    };

    return (
        <ModalLayout
            title="リンク"
            body={
                <div className="flex items-center flex-row mb-[10px]">
                    <input
                        type="text"
                        className="flex flex-[2_2_0%] border-[1px] border-solid border-[#999] py-[7px] px-[10px] text-base rounded-[5px] min-w-0"
                        placeholder="https://"
                        value={text}
                        onChange={onChangeInput}
                    />
                </div>
            }
            footer={<button onClick={onClick}>適用</button>}
        />
    );
};

export const INSERT_CUSTOM_LINK_COMMAND: LexicalCommand<string> =
    createCommand();

export const InsertLinkPlugin = (): JSX.Element | null => {
    const [editor] = useLexicalComposerContext();
    const [modal, showModal] = useModal();

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                TOGGLE_LINK_COMMAND,
                (payload) => {
                    if (payload === null) {
                        toggleLink(payload);
                        return true;
                    } else if (typeof payload === "string") {
                        if (validateHttpUrl(payload)) {
                            toggleLink(payload);
                            return true;
                        }
                        return false;
                    } else {
                        const { url, target, rel } = payload;
                        toggleLink(url, { rel, target });
                        return true;
                    }
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand<string>(
                INSERT_CUSTOM_LINK_COMMAND,
                (payload) => {
                    showModal((onClose) => (
                        <CustomLinkDialog onClose={onClose} url={payload} />
                    ));

                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            )
        );
    }, [editor, showModal]);

    return <>{modal}</>;
};

export default InsertLinkPlugin;
