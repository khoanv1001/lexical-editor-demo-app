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
        const handleClick = useCallback(() => {
            onToggleSelection(index);
        }, [onToggleSelection, index]);

        const handleDelete = useCallback(() => {
            onDelete(index);
        }, [onDelete, index]);

        return (
            <Chip
                label={`#${chip}`}
                onClick={disabled ? undefined : handleClick}
                onDelete={disabled || !isSelected ? undefined : handleDelete}
                color={color}
                size={size}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                    cursor: disabled ? "default" : "pointer",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                        transform: "scale(1.02)",
                    },
                    "&:active": {
                        transform: "scale(0.98)",
                    },
                    display: "flex",
                    padding: "8px 10px",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "8px",
                    border: "1px solid #0092F1",
                    background: "#FFF",
                }}
            />
        );
    }
);

MemoizedChip.displayName = "MemoizedChip";

export default MemoizedChip;
