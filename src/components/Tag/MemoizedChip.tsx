import { Chip } from "@mui/material";
import { memo, useCallback } from "react";

interface MemoizedChipProps {
    chip: string;
    index: number;
    isSelected: boolean;
    disabled: boolean;
    color: "default" | "primary" | "secondary";
    size: "small" | "medium";
    onToggleSelection: (index: number) => void;
    onDelete: (index: number) => void;
}

const MemoizedChip = memo<MemoizedChipProps>(
    ({
        chip,
        index,
        isSelected,
        disabled,
        color,
        size,
        onToggleSelection,
        onDelete,
    }) => {
        const handleClick = useCallback(
            (event: React.MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleSelection(index);
            },
            [onToggleSelection, index]
        );

        const handleDelete = useCallback(
            (event?: React.MouseEvent) => {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                onDelete(index);
            },
            [onDelete, index]
        );

        // iOS-specific touch handlers
        const handleTouchStart = useCallback((event: React.TouchEvent) => {
            event.stopPropagation();
        }, []);

        const handleTouchEnd = useCallback(
            (event: React.TouchEvent) => {
                event.preventDefault();
                event.stopPropagation();
                if (!disabled) {
                    onToggleSelection(index);
                }
            },
            [onToggleSelection, index, disabled]
        );

        return (
            <Chip
                label={`# ${chip}`}
                onClick={disabled ? undefined : handleClick}
                onTouchStart={disabled ? undefined : handleTouchStart}
                onTouchEnd={disabled ? undefined : handleTouchEnd}
                onDelete={disabled || !isSelected ? undefined : handleDelete}
                color={color}
                size={size}
                variant={isSelected ? "filled" : "outlined"}
                className={`
                    ${disabled ? "cursor-default" : "cursor-pointer"}
                    flex-shrink-0 whitespace-nowrap
                    ${!disabled ? "active:scale-95" : ""}
                    flex items-center justify-center
                    px-2.5 py-2 rounded-lg border border-tag-active text-tag-active
                    ${isSelected ? "bg-tag-delete border-0 " : ""}
                `}
            />
        );
    }
);

MemoizedChip.displayName = "MemoizedChip";

export default MemoizedChip;
