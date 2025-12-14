import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  fetchReDropdown,
  setSearchTerm,
  clearReDropdown,
  ReEntity,
} from '../slices/reDropdownSlice';

interface SearchableREDropdownProps {
  value: ReEntity | null;
  onChange: (value: ReEntity | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SearchableREDropdown: React.FC<SearchableREDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Search RE Name/FI Code...',
}) => {
  const dispatch = useAppDispatch();
  const { data, loading, hasMore, currentPage, searchTerm } = useAppSelector(
    (state) => state.reDropdown
  );

  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const listboxRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (open && data.length === 0 && !loading) {
      dispatch(fetchReDropdown({ page: 0, search: '' }));
    }
  }, [open, data.length, loading, dispatch]);

  const handleInputChange = useCallback(
    (event: React.SyntheticEvent, newInputValue: string) => {
      setInputValue(newInputValue);
      dispatch(setSearchTerm(newInputValue));
      dispatch(
        fetchReDropdown({ page: 0, search: newInputValue, append: false })
      );
    },
    [dispatch]
  );
  const handleScroll = useCallback(
    (event: React.SyntheticEvent) => {
      const listboxNode = event.currentTarget as HTMLUListElement;
      const scrollTop = listboxNode.scrollTop;
      const scrollHeight = listboxNode.scrollHeight;
      const clientHeight = listboxNode.clientHeight;
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loading) {
        dispatch(
          fetchReDropdown({
            page: currentPage + 1,
            search: searchTerm,
            append: true,
          })
        );
      }
    },
    [hasMore, loading, currentPage, searchTerm, dispatch]
  );

  useEffect(() => {
    return () => {
      dispatch(clearReDropdown());
    };
  }, [dispatch]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={data}
      getOptionLabel={(option) =>
        option.fiCode ? `${option.name} [${option.fiCode}]` : option.name
      }
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={loading && data.length === 0}
      disabled={disabled}
      popupIcon={<KeyboardArrowDownOutlined />}
      ListboxProps={{
        onScroll: handleScroll,
        ref: listboxRef,
        style: { maxHeight: '250px' },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          size="small"
          sx={{
            minWidth: 250,
            fontFamily: 'Gilroy, sans-serif',
            '& .MuiInputBase-root': {
              backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
            },
            '& .MuiInputBase-input': {
              fontSize: '14px',
              padding: '10px 14px',
              color: disabled ? '#9e9e9e' : '#000000',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#9e9e9e',
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box sx={{ width: '100%' }}>
            <Typography
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {option.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '12px',
                color: '#666',
              }}
            >
              {option.fiCode}
            </Typography>
          </Box>
        </li>
      )}
      noOptionsText={
        loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          'No options found'
        )
      }
      loadingText={
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      }
      sx={{
        minWidth: 250,
        '& .MuiAutocomplete-popupIndicator': {
          color: '#002CBA',
        },
      }}
    />
  );
};

export default SearchableREDropdown;
