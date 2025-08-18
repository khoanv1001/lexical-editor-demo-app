import React from "react";
import { t } from "../../i18n";

interface AddTagButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

const AddTagButtonComponent: React.FC<AddTagButtonProps> = ({
    onClick,
    children,
    className = "",
}) => {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 bg-white border-2 text-xs border-blue-500 text-blue-500 rounded-lg transition-colors duration-200 ${className}`}
        >
            {children || t("addTag")}
        </button>
    );
};

export default AddTagButtonComponent;
