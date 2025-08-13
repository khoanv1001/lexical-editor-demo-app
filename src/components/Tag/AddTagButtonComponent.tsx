import React from "react";

interface AddTagButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

const AddTagButtonComponent: React.FC<AddTagButtonProps> = ({
    onClick,
    children = "+ タグを追加",
    className = "",
}) => {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 bg-white border-2 text-xs border-blue-500 text-blue-500 rounded-lg transition-colors duration-200 ${className}`}
        >
            {children}
        </button>
    );
};

export default AddTagButtonComponent;
