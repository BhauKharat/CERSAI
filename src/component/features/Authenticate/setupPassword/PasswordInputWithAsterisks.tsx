/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { TextField } from '@mui/material';

interface PasswordInputWithAsterisksProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  showPassword?: boolean;
  endAdornment?: React.ReactNode;
  sx?: any;
  fullWidth?: boolean;
  variant?: 'outlined' | 'standard' | 'filled';
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

const PasswordInputWithAsterisks: React.FC<PasswordInputWithAsterisksProps> = ({
  value,
  onChange,
  placeholder = '',
  id,
  showPassword = false,
  endAdornment,
  sx,
  fullWidth = true,
  variant = 'outlined',
  onPaste,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const actualValueRef = useRef<string>(value);

  useEffect(() => {
    actualValueRef.current = value;
    // Create asterisks for display
    setDisplayValue('✱'.repeat(value.length));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = e.target.value;
    const oldValue = actualValueRef.current;
    const oldDisplayValue = displayValue;

    // Detect what changed
    if (newDisplayValue.length > oldDisplayValue.length) {
      // Characters were added
      const addedChars = newDisplayValue.slice(oldDisplayValue.length);
      const newActualValue = oldValue + addedChars;
      onChange(newActualValue);
    } else if (newDisplayValue.length < oldDisplayValue.length) {
      // Characters were removed
      const newActualValue = oldValue.substring(0, newDisplayValue.length);
      onChange(newActualValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (!input) return;

    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const oldValue = actualValueRef.current;

      if (selectionStart !== selectionEnd) {
        // Delete selected text
        const newValue =
          oldValue.slice(0, selectionStart) + oldValue.slice(selectionEnd);
        onChange(newValue);
        setTimeout(() => {
          input.setSelectionRange(selectionStart, selectionStart);
        }, 0);
      } else if (selectionStart > 0) {
        // Delete one character before cursor
        const newValue =
          oldValue.slice(0, selectionStart - 1) +
          oldValue.slice(selectionStart);
        onChange(newValue);
        setTimeout(() => {
          input.setSelectionRange(selectionStart - 1, selectionStart - 1);
        }, 0);
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const oldValue = actualValueRef.current;

      if (selectionStart !== selectionEnd) {
        // Delete selected text
        const newValue =
          oldValue.slice(0, selectionStart) + oldValue.slice(selectionEnd);
        onChange(newValue);
        setTimeout(() => {
          input.setSelectionRange(selectionStart, selectionStart);
        }, 0);
      } else if (selectionStart < oldValue.length) {
        // Delete one character after cursor
        const newValue =
          oldValue.slice(0, selectionStart) +
          oldValue.slice(selectionStart + 1);
        onChange(newValue);
        setTimeout(() => {
          input.setSelectionRange(selectionStart, selectionStart);
        }, 0);
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Regular character input
      e.preventDefault();
      const oldValue = actualValueRef.current;
      const char = e.key;

      if (selectionStart !== selectionEnd) {
        // Replace selected text
        const newValue =
          oldValue.slice(0, selectionStart) +
          char +
          oldValue.slice(selectionEnd);
        onChange(newValue);
        setTimeout(() => {
          input.setSelectionRange(selectionStart + 1, selectionStart + 1);
        }, 0);
      } else {
        // Insert character at cursor
        const newValue =
          oldValue.slice(0, selectionStart) +
          char +
          oldValue.slice(selectionStart);
        onChange(newValue);
        setTimeout(() => {
          input.setSelectionRange(selectionStart + 1, selectionStart + 1);
        }, 0);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (onPaste) {
      onPaste(e);
      return;
    }
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const input = inputRef.current;
    if (!input) return;

    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    const oldValue = actualValueRef.current;

    const newValue =
      oldValue.slice(0, selectionStart) +
      pastedText +
      oldValue.slice(selectionEnd);
    onChange(newValue);

    setTimeout(() => {
      const newCursorPos = selectionStart + pastedText.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleCut = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input) return;

    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;

    if (selectionStart !== selectionEnd) {
      const oldValue = actualValueRef.current;
      const selectedText = oldValue.slice(selectionStart, selectionEnd);

      // Copy to clipboard
      navigator.clipboard.writeText(selectedText);

      // Remove selected text
      const newValue =
        oldValue.slice(0, selectionStart) + oldValue.slice(selectionEnd);
      onChange(newValue);

      setTimeout(() => {
        input.setSelectionRange(selectionStart, selectionStart);
      }, 0);
    }
  };

  const handleCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input) return;

    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;

    if (selectionStart !== selectionEnd) {
      const oldValue = actualValueRef.current;
      const selectedText = oldValue.slice(selectionStart, selectionEnd);
      navigator.clipboard.writeText(selectedText);
    }
  };

  return (
    <TextField
      id={id}
      inputRef={inputRef}
      fullWidth={fullWidth}
      variant={variant}
      type={showPassword ? 'text' : 'text'} // Always text type for custom masking
      placeholder={placeholder}
      value={showPassword ? value : displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onCut={handleCut}
      onCopy={handleCopy}
      InputProps={{
        style: {
          height: '48px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        },
        endAdornment: endAdornment,
        inputProps: {
          style: {
            fontFamily: showPassword ? "'Gilroy', sans-serif" : 'Gilroy-Medium',
            fontSize: '14px',
            fontWeight: 400,
            height: '100%',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            lineHeight: '48px',
            letterSpacing: '0%',
          },
        },
      }}
      sx={sx}
    />
  );
};

export default PasswordInputWithAsterisks;
