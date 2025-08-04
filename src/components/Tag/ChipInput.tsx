import React, { useState, useRef, type KeyboardEvent } from 'react';
import { Chip, TextField, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const ChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  alignItems: 'center',
  minHeight: '40px',
  padding: theme.spacing(0.5),
  cursor: 'text',
  flex: 1,
}));

const StyledTextField = styled(TextField)({
  '& .MuiInput-underline:before': {
    borderBottom: 'none',
  },
  '& .MuiInput-underline:after': {
    borderBottom: 'none',
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottom: 'none',
  },
  '& .MuiInputBase-input': {
    minWidth: '120px',
    padding: '4px 0',
    '&:focus': {
      outline: 'none',
      border: 'none',
      boxShadow: 'none',
    },
  },
  '& .MuiInputBase-root': {
    '&:focus-within': {
      outline: 'none',
      border: 'none',
      boxShadow: 'none',
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
  color?: 'default' | 'primary' | 'secondary';
  size?: 'small' | 'medium';
}

const ChipInput: React.FC<ChipInputProps> = ({
  chips,
  onChipsChange,
  placeholder = 'Add tags...',
  allowDuplicates = false,
  maxChips,
  disabled = false,
  color = 'primary',
  size = 'small',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedChips, setSelectedChips] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addChip = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) return;

    const textOnlyRegex = /^[a-zA-Z0-9]+$/;
    if (!textOnlyRegex.test(trimmedValue)) {
      setInputValue('');
      return;
    }

    if (!allowDuplicates && chips.includes(trimmedValue)) {
      setInputValue('');
      return;
    }
    
    if (maxChips && chips.length >= maxChips) {
      return;
    }
    
    onChipsChange([...chips, trimmedValue]);
    setInputValue('');
  };

  const deleteChip = (index: number) => {
    const newChips = chips.filter((_, chipIndex) => chipIndex !== index);
    const newSelectedChips = new Set<number>();
    selectedChips.forEach(selectedIndex => {
      if (selectedIndex < index) {
        newSelectedChips.add(selectedIndex);
      } else if (selectedIndex > index) {
        newSelectedChips.add(selectedIndex - 1);
      }
    });
    setSelectedChips(newSelectedChips);
    onChipsChange(newChips);
  };

  const toggleChipSelection = (index: number) => {
    const newSelectedChips = new Set(selectedChips);
    if (newSelectedChips.has(index)) {
      newSelectedChips.delete(index);
    } else {
      newSelectedChips.add(index);
    }
    setSelectedChips(newSelectedChips);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addChip();
    } else if (event.key === 'Backspace' && !inputValue && chips.length > 0) {
      // Remove last chip when backspace is pressed and input is empty
      deleteChip(chips.length - 1);
    } else if (event.key === ' ') {
      // Prevent space input
      event.preventDefault();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters and numbers, filter out spaces, emojis, and special characters
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
    setInputValue(filteredValue);
  };

  const handleContainerClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const canAddMore = !maxChips || chips.length < maxChips;

  return (
    <ChipContainer
      ref={containerRef}
      onClick={handleContainerClick}
      sx={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    >
      {chips.map((chip, index) => {
        const isSelected = selectedChips.has(index);
        return (
          <Chip
            key={`${chip}-${index}`}
            label={chip}
            onClick={disabled ? undefined : () => toggleChipSelection(index)}
            onDelete={disabled || !isSelected ? undefined : () => deleteChip(index)}
            color={color}
            size={size}
            variant={isSelected ? "filled" : "outlined"}
            sx={{
              cursor: disabled ? 'default' : 'pointer',
              '& .MuiChip-label': {
              },
            }}
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
            minWidth: inputValue ? `${Math.max(inputValue.length * 8, 120)}px` : '120px',
          }}
        />
      )}
    </ChipContainer>
  );
};

export default ChipInput;
