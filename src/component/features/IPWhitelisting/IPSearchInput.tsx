// src/components/common/inputs/CommonSearchInput.tsx
/* eslint-disable prettier/prettier */
import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
 
interface CommonSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  withIcon?: boolean; // optional, default = true
  sx?: object; // to allow custom styling overrides if needed
}
 
const IPSearchInput: React.FC<CommonSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  withIcon = true,
  sx = {},
}) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      InputProps={{
        startAdornment: withIcon ? (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ) : undefined,
      }}
      sx={{
            width: 220,
            height: 48,
            '& .MuiOutlinedInput-root': { height: 48 },
            '& .MuiInputBase-input': { height: '100%', boxSizing: 'border-box' },
            '@media (max-width: 1200px)': { width: 200 },
            '@media (max-width: 600px)': { width: '100%' },
        ...sx,
      }}
    />
  );
};
 
export default IPSearchInput;