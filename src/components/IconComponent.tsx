import React from "react";

import PlusIcon from "../assets/icons/add-circle.svg?react";
import UndoIcon from "../assets/icons/ando.svg?react";
import BoldIcon from "../assets/icons/bold.svg?react";
import BookIcon from "../assets/icons/book.svg?react";
import CloudIcon from "../assets/icons/drift.svg?react";
import H1Icon from "../assets/icons/headline.svg?react";
import ImageIcon from "../assets/icons/image.svg?react";
import KeyboardIcon from "../assets/icons/keyboard.svg?react";
import LinkIcon from "../assets/icons/link.svg?react";
import QuoteIcon from "../assets/icons/quote.svg?react";
import StrikethroughIcon from "../assets/icons/strikethrough.svg?react";
import TrashIcon from "../assets/icons/trash.svg?react";
import PullDownIcon from "../assets/icons/pulldown.svg?react";
import YoutubeIcon from "../assets/icons/google.svg?react";
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
    [IconsEnum.Youtube]: YoutubeIcon,
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
    const IconComponent = iconsMap[name];
    if (!IconComponent) return null;

    return (
        <div>
            <IconComponent
                width={size}
                height={size}
                className={className}
                {...props}
            />
        </div>
    );
};

export default IconComponent;
