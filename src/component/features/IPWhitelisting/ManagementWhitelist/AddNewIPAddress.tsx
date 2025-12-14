/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
  Button,
  CircularProgress,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EventIcon from '@mui/icons-material/Event';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  addIPAddress,
  clearAddIPAddressState,
} from '../slices/addIPAddressSlice';
import SuccessModal from '../../../ui/Modal/SuccessModal';
import {
  MainContainer,
  FormWrapper,
  FormGrid,
  FieldWrapper,
  StyledFormControl,
} from '../style/AddNewIPAddress.styles';
import NavigationBreadCrumb from '../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';

const AddNewIPAddress: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.addIPAddress);

  // Form state
  const [ipAddress, setIpAddress] = useState<string>('');
  const [ipWhitelistedFor, setIpWhitelistedFor] = useState<string>('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  // Validation state
  const [ipError, setIpError] = useState<string>('');
  const [ipWhitelistedForError, setIpWhitelistedForError] =
    useState<string>('');
  const [dateError, setDateError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');

  // Date validation limits - From date should be today or future dates only
  const minDate = dayjs().startOf('day');
  const maxDate = dayjs().add(100, 'year');

  // IP Address validation regex
  const validateIPAddress = (ip: string): boolean => {
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
  };

  // Handle IP Address change with validation
  const handleIpAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIpAddress(value);

    if (value && !validateIPAddress(value)) {
      setIpError('Invalid IP Address');
    } else {
      setIpError('');
    }
  };

  // Handle date validation
  const validateDates = (from: Dayjs | null, to: Dayjs | null): boolean => {
    const today = dayjs().startOf('day');

    if (from) {
      if (from.isBefore(today)) {
        setDateError('From date cannot be in the past');
        return false;
      }
      if (from.isAfter(maxDate)) {
        setDateError('Date exceeds maximum allowed range');
        return false;
      }
    }
    if (to) {
      if (to.isBefore(today)) {
        setDateError('To date cannot be in the past');
        return false;
      }
      if (to.isAfter(maxDate)) {
        setDateError('Date exceeds maximum allowed range');
        return false;
      }
    }

    if (from && to) {
      if (from.isAfter(to)) {
        setDateError('From date cannot be greater than to date');
        return false;
      }
    }
    setDateError('');
    return true;
  };

  // Handle from date change
  const handleFromDateChange = (date: any) => {
    setFromDate(date);
    validateDates(date, toDate);
  };

  // Handle to date change
  const handleToDateChange = (date: any) => {
    setToDate(date);
    validateDates(fromDate, date);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields
    let hasError = false;

    if (!ipAddress) {
      setIpError('IP Address is required');
      hasError = true;
    } else if (!validateIPAddress(ipAddress)) {
      setIpError('Invalid IP Address');
      hasError = true;
    }

    if (!ipWhitelistedFor) {
      setIpWhitelistedForError('IP Whitelisted For is required');
      hasError = true;
    }

    if (!fromDate || !toDate) {
      setDateError('Both From Date and To Date are required');
      hasError = true;
    } else if (!validateDates(fromDate, toDate)) {
      hasError = true;
    }

    if (hasError) return;

    // Prepare payload
    const payload = {
      ipAddress: ipAddress.trim(),
      ipWhitelistedFor,
      validFrom: fromDate!.toISOString(),
      validTill: toDate!.toISOString(),
    };

    // Dispatch API call
    const resultAction = await dispatch(addIPAddress(payload));

    if (addIPAddress.fulfilled.match(resultAction)) {
      // Show success modal on successful submission
      setIsSubmitSuccess(true);
      setShowSuccessModal(true);
    } else {
      // Error handling - show error modal (error message extracted in slice)
      const errorMsg =
        (resultAction.payload as string) || 'Failed to add IP address';
      setSubmitErrorMessage(errorMsg);
      setIsSubmitSuccess(false);
      setShowSuccessModal(true);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setIpAddress('');
    setIpWhitelistedFor('');
    setFromDate(null);
    setToDate(null);
    setIpError('');
    setIpWhitelistedForError('');
    setDateError('');
  };

  // Handle modal close - refresh component
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSubmitErrorMessage('');
    if (isSubmitSuccess) {
      dispatch(clearAddIPAddressState());
      resetForm(); // Reset form after successful submission
    }
  };

  // Clear error when component unmounts or when starting fresh
  useEffect(() => {
    return () => {
      dispatch(clearAddIPAddressState());
    };
  }, [dispatch]);

  return (
    <MainContainer>
      {/* Breadcrumb */}
      <NavigationBreadCrumb
        crumbsData={[{ label: 'IP Whitelisting' }, { label: 'Add New IP' }]}
      />

      {/* Title */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, fontFamily: 'Gilroy, sans-serif' }}
        >
          Add New IP Address
        </Typography>
      </Box>

      <FormWrapper>
        <FormGrid>
          {/* IP Address Field */}
          <FieldWrapper>
            <InputLabel
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#000',
                mb: 1,
              }}
            >
              IP Address to be Whitelisted
              <span style={{ color: '#d32f2f' }}>*</span>
            </InputLabel>
            <TextField
              // fullWidth
              placeholder="Enter IP to be whitelisted"
              value={ipAddress}
              onChange={handleIpAddressChange}
              error={!!ipError}
              sx={{
                width: '314px',
                height: '48px',
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Gilroy, sans-serif',
                  backgroundColor: 'white',
                  height: '48px',
                },
                '& .MuiOutlinedInput-input': {
                  fontSize: '14px',
                },
              }}
            />
            {ipError && (
              <FormHelperText
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  mt: 0.5,
                  color: '#FF0000',
                }}
              >
                {ipError}
              </FormHelperText>
            )}
          </FieldWrapper>

          {/* IP Whitelisted For Dropdown */}
          <FieldWrapper>
            <InputLabel
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#000',
                mb: 1,
              }}
            >
              IP Whitelisted For
              <span style={{ color: '#d32f2f' }}>*</span>
            </InputLabel>
            <StyledFormControl error={!!ipWhitelistedForError}>
              <Select
                value={ipWhitelistedFor}
                onChange={(e) => {
                  setIpWhitelistedFor(e.target.value);
                  setIpWhitelistedForError('');
                }}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  width: '314px',
                  fontFamily: 'Gilroy, sans-serif',
                  backgroundColor: 'white',
                  height: '48px',
                  fontSize: '14px',
                  '& .MuiSelect-select': {
                    fontFamily: 'Gilroy, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="API">API</MenuItem>
                <MenuItem value="SFTP">SFTP</MenuItem>
              </Select>
              {ipWhitelistedForError && (
                <FormHelperText
                  sx={{ fontFamily: 'Gilroy, sans-serif', color: '#FF0000' }}
                >
                  {ipWhitelistedForError}
                </FormHelperText>
              )}
            </StyledFormControl>
          </FieldWrapper>
        </FormGrid>

        {/* Validity Period Section */}
        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              fontFamily: 'Gilroy, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: '#000',
              mb: 2,
            }}
          >
            Validity Period
            <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>

          <FormGrid>
            {/* From Date */}
            <FieldWrapper>
              <InputLabel
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#000',
                  mb: 1,
                }}
              >
                From Date
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={fromDate}
                  onChange={handleFromDateChange}
                  format="DD/MM/YYYY"
                  minDate={minDate}
                  maxDate={toDate || maxDate}
                  slots={{
                    openPickerIcon: EventIcon,
                  }}
                  slotProps={{
                    textField: {
                      // fullWidth: true,
                      placeholder: 'DD/MM/YYYY',
                      error: !!dateError,
                      sx: {
                        width: '314px',
                        height: '48px',
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'Gilroy, sans-serif',
                          backgroundColor: 'white',
                          height: '40px',
                        },
                        '& .MuiOutlinedInput-input': {
                          fontSize: '14px',
                        },
                      },
                    },
                    openPickerButton: {
                      sx: {
                        color: '#666',
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </FieldWrapper>

            {/* To Date */}
            <FieldWrapper>
              <InputLabel
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#000',
                  mb: 1,
                }}
              >
                To Date
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={toDate}
                  onChange={handleToDateChange}
                  format="DD/MM/YYYY"
                  minDate={fromDate || minDate}
                  maxDate={maxDate}
                  slots={{
                    openPickerIcon: EventIcon,
                  }}
                  slotProps={{
                    textField: {
                      // fullWidth: true,
                      placeholder: 'DD/MM/YYYY',
                      error: !!dateError,
                      sx: {
                        width: '314px',
                        height: '48px',
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'Gilroy, sans-serif',
                          backgroundColor: 'white',
                          height: '40px',
                        },
                        '& .MuiOutlinedInput-input': {
                          fontSize: '14px',
                        },
                      },
                    },
                    openPickerButton: {
                      sx: {
                        color: '#666',
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </FieldWrapper>
          </FormGrid>

          {/* Date Error Message */}
          {dateError && (
            <FormHelperText
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                mt: 1,
                color: '#FF0000',
              }}
            >
              {dateError}
            </FormHelperText>
          )}
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              !ipAddress ||
              !validateIPAddress(ipAddress) ||
              !ipWhitelistedFor ||
              !fromDate ||
              !toDate ||
              !!ipError ||
              !!dateError
            }
            sx={{
              backgroundColor: '#002CBA',
              color: 'white',
              textTransform: 'none',
              width: '224px',
              height: '48px',
              fontSize: '16px',
              fontFamily: '"Gilroy-Medium", sans-serif',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#001a8a',
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </Box>
      </FormWrapper>

      {/* Success/Error Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={handleCloseModal}
        messageType={isSubmitSuccess ? 'success' : 'reject'}
        title={isSubmitSuccess ? 'Submitted for approval' : submitErrorMessage}
        okText="Okay"
      />
    </MainContainer>
  );
};

export default AddNewIPAddress;
