import React, { useState, useRef, type KeyboardEvent } from "react";
import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import MemoizedChip from "./MemoizedChip";

const StyledTextField = styled(TextField)({
    "& .MuiInput-underline:before": {
        borderBottom: "none",
    },
    "& .MuiInput-underline:after": {
        borderBottom: "none",
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
        borderBottom: "none",
    },
    "& .MuiInputBase-input": {
        minWidth: "60px",
        padding: "4px 0",
        "&:focus": {
            outline: "none",
            border: "none",
            boxShadow: "none",
        },
    },
    "& .MuiInputBase-root": {
        "&:focus-within": {
            outline: "none",
            border: "none",
            boxShadow: "none",
        },
    },
});

interface ChipInputProps {
    chips: string[];
    onChipsChange: (chips: string[]) => void;
    placeholder?: string;
    allowDuplicates?: boolean;
    maxChips?: number;
    disabled?: boolean;
    color?: "default" | "primary" | "secondary";
    size?: "small" | "medium";
}

const ChipInput: React.FC<ChipInputProps> = ({
    chips,
    onChipsChange,
    placeholder = "Add tags...",
    allowDuplicates = false,
    maxChips,
    disabled = false,
    color = "primary",
    size = "small",
}) => {
    const [inputValue, setInputValue] = useState("");
    const [selectedChip, setSelectedChip] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const addChip = () => {
        const trimmedValue = inputValue.trim();

        if (!trimmedValue) return;

        const textOnlyRegex = /^[a-zA-Z0-9]+$/;
        if (!textOnlyRegex.test(trimmedValue)) {
            setInputValue("");
            return;
        }

        if (!allowDuplicates && chips.includes(trimmedValue)) {
            setInputValue("");
            return;
        }

        if (maxChips && chips.length >= maxChips) {
            return;
        }

        onChipsChange([...chips, trimmedValue]);
        setInputValue("");
    };

    const deleteChip = (index: number) => {
        const newChips = chips.filter((_, chipIndex) => chipIndex !== index);
        // Clear selection if deleted chip was selected, or adjust index if needed
        if (selectedChip === index) {
            setSelectedChip(null);
        } else if (selectedChip !== null && selectedChip > index) {
            setSelectedChip(selectedChip - 1);
        }
        onChipsChange(newChips);

        setTimeout(() => {
            if (inputRef.current && !disabled) {
                inputRef.current.focus();
            }
        }, 0);
    };

    const toggleChipSelection = (index: number) => {
        // If the chip is already selected, deselect it; otherwise select it
        if (selectedChip === index) {
            setSelectedChip(null);
        } else {
            setSelectedChip(index);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addChip();
        } else if (
            event.key === "Backspace" &&
            !inputValue &&
            chips.length > 0
        ) {
            // Remove last chip when backspace is pressed and input is empty
            deleteChip(chips.length - 1);
        } else if (event.key === " ") {
            // Prevent space input
            event.preventDefault();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow letters and numbers, filter out spaces, emojis, and special characters
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "");
        setInputValue(filteredValue);
    };

    const handleContainerClick = () => {
        if (!disabled && inputRef.current) {
            inputRef.current.focus();
        }
    };

    const canAddMore = !maxChips || chips.length < maxChips;

    return (
        <div
            ref={containerRef}
            onClick={handleContainerClick}
            className={`flex flex-wrap gap-2 items-center min-h-[40px] p-2 cursor-text flex-1 ${
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-text"
            }`}
        >
            {chips.map((chip, index) => {
                const isSelected = selectedChip === index;
                return (
                    <MemoizedChip
                        key={`${chip}-${index}`}
                        chip={chip}
                        index={index}
                        isSelected={isSelected}
                        disabled={disabled}
                        color={color}
                        size={size}
                        onToggleSelection={toggleChipSelection}
                        onDelete={deleteChip}
                    />
                );
            })}

            {canAddMore && !disabled && (
                <StyledTextField
                    inputRef={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    variant="standard"
                    size={size}
                    disabled={disabled}
                    sx={{
                        flexGrow: 1,
                        minWidth: inputValue
                            ? `${Math.max(inputValue.length * 8, 60)}px`
                            : "60px",
                    }}
                />
            )}
        </div>
    );
};

export default ChipInput;
