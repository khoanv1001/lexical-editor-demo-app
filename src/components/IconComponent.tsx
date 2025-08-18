import React from "react";

import PlusIcon from "../assets/icons/add-circle.svg";
import UndoIcon from "../assets/icons/ando.svg";
import BoldIcon from "../assets/icons/bold.svg";
import BookIcon from "../assets/icons/book.svg";
import CloudIcon from "../assets/icons/drift.svg";
import H1Icon from "../assets/icons/headline.svg";
import ImageIcon from "../assets/icons/image.svg";
import KeyboardIcon from "../assets/icons/keyboard.svg";
import LinkIcon from "../assets/icons/link.svg";
import QuoteIcon from "../assets/icons/quote.svg";
import StrikethroughIcon from "../assets/icons/strikethrough.svg";
import TrashIcon from "../assets/icons/trash.svg";
import PullDownIcon from "../assets/icons/pulldown.svg";
import { IconsEnum } from "../enums/IconEnum";

const iconsMap = {
    [IconsEnum.Plus]: PlusIcon,
    [IconsEnum.Bold]: BoldIcon,
    [IconsEnum.Image]: ImageIcon,
    [IconsEnum.Trash]: TrashIcon,
    [IconsEnum.Link]: LinkIcon,
    [IconsEnum.Strikethrough]: StrikethroughIcon,
    [IconsEnum.H1]: H1Icon,
    [IconsEnum.Undo]: UndoIcon,
    [IconsEnum.Keyboard]: KeyboardIcon,
    [IconsEnum.Quote]: QuoteIcon,
    [IconsEnum.Book]: BookIcon,
    [IconsEnum.Cloud]: CloudIcon,
    [IconsEnum.PullDown]: PullDownIcon,
};

export interface IconComponentProps {
    name: IconsEnum;
    size?: number | string;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
    "aria-label"?: string;
}

const IconComponent: React.FC<IconComponentProps> = ({
    name,
    size = 24,
    className = "",
    ...props
}) => {
    const iconSrc = iconsMap[name];
    if (!iconSrc) return null;

    return (
        <img
            src={iconSrc}
            width={size}
            height={size}
            className={className}
            {...props}
        />
    );
};

export default IconComponent;
