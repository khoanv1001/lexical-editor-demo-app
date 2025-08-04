import React from 'react';

interface AddTagButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

const AddTagButtonComponent: React.FC<AddTagButtonProps> = ({ 
    onClick, 
    children = "+ Add Tag",
    className = ""
}) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 bg-white border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors duration-200 ${className}`}
        >
            {children}
        </button>
    );
};

export default AddTagButtonComponent;