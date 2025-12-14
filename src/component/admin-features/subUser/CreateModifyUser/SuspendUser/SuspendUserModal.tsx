/* eslint-disable @typescript-eslint/no-explicit-any */
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import React, { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../redux/store';
import {
  // revokeSuspendUser,
  clearRevokeSuspendError,
} from '../slice/revokeSuspendUserSlice';
import { clearSuspendError, suspendUser } from '../slice/suspendUserSlice';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import dayjs, { Dayjs } from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { CERSAIUserRoles } from '../../../../../../src/enums/userRoles.enum';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../ErrorModal/ErrorModal';
import {
  cancelButtonStyles,
  charCounterStyles,
  closeButtonStyles,
  contentContainerStyles,
  dialogActionsStyles,
  dialogContentStyles,
  dialogPaperStyles,
  dialogTitleStyles,
  errorIconStyles,
  errorMessageContainerStyles,
  // requiredIndicatorStyles,
  // helperTextStyles,
  // getDatePickerStyles,
  getTextareaStyles,
  inputContainerStyles,
  inputLabelStyles,
  submitButtonStyles,
  titleTextStyles,
} from './SuspendUserModal.styles';

interface SuspendUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  mode?: 'suspend' | 'revoke';
  userStatus?: string;
}

const MAX_REMARK_LENGTH = 500;

const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  open,
  onClose,
  userId,
  mode = 'suspend',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { suspending, suspendError } = useSelector(
    (state: RootState) => state.suspendUser
  );

  const navigate = useNavigate();
  const token: any = useSelector((state: RootState) => state?.auth?.authToken);
  const decoded: any = jwtDecode(token);
  const userType = decoded?.groupMembership[0].replace(/^\//, '');

  console.log('Mode in SuspendUserModal: ', mode);
  const { revokingSuspension, revokeSuspendError } = useSelector(
    (state: RootState) => state.revokeSuspendUser
  );
  const [reason] = useState('User suspension');
  // const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());
  // const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<{
    // reason?: string;
    // fromDate?: string;
    // toDate?: string;
    remark?: string;
  }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const newErrors: typeof errors = {};

    // // For suspend mode, validate dates
    // if (mode === 'suspend') {
    //   if (!fromDate) {
    //     newErrors.fromDate = 'From date is required';
    //   }

    //   if (!toDate) {
    //     newErrors.toDate = 'To date is required';
    //   } else if (fromDate && toDate.isBefore(fromDate)) {
    //     newErrors.toDate = 'To date must be after from date';
    //   }
    // }

    if (!remark.trim()) {
      newErrors.remark = 'Remark is required';
    } else if (remark.length > MAX_REMARK_LENGTH) {
      newErrors.remark = `Remark must be less than ${MAX_REMARK_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    // setFromDate(dayjs());
    // setToDate(null);
    setRemark('');
    setErrors({});
    setShowSuccess(false);
    dispatch(clearSuspendError());
    dispatch(clearRevokeSuspendError());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const resultAction = await dispatch(
        suspendUser({
          userId,
          remark,
          suspensionFromDate: '', // fromDate?.format('YYYY-MM-DD') || '',
          suspensionToDate: '', // toDate?.format('YYYY-MM-DD') || '',
          suspensionReason: reason,
        })
      );

      if (suspendUser.fulfilled.match(resultAction)) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          resetForm();
        }, 2000);
      } else {
        const errorMsg =
          (resultAction.payload as string) ||
          'Failed to suspend user. Please try again.';
        setErrorMessage(errorMsg);
        setShowError(true);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleClose = () => {
    if (!suspending && !revokingSuspension) {
      resetForm();
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose();
  };

  return (
    <>
      <Dialog
        open={open && !showSuccess}
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
          }
          handleClose();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: dialogPaperStyles,
        }}
      >
        <DialogTitle sx={dialogTitleStyles}>
          <IconButton
            onClick={handleClose}
            disabled={suspending}
            sx={closeButtonStyles}
            data-testid="close-button"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={dialogContentStyles}>
          <Box sx={contentContainerStyles}>
            <Box sx={errorMessageContainerStyles}>
              <ErrorOutlineIcon sx={errorIconStyles} />
            </Box>

            <Typography variant="body1" sx={titleTextStyles}>
              Suspend User
            </Typography>

            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* {mode === 'suspend' && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box sx={inputContainerStyles}>
                    <Typography
                      variant="body2"
                      sx={{ ...inputLabelStyles, textAlign: 'left', mb: 1 }}
                    >
                      From Date <span style={requiredIndicatorStyles}>*</span>
                    </Typography>
                    <DatePicker
                      value={fromDate}
                      onChange={(newValue: any) => {
                        setFromDate(newValue ? dayjs(newValue) : null);
                        if (errors.fromDate) {
                          setErrors({ ...errors, fromDate: '' });
                        }
                      }}
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          placeholder: 'Select from date',
                          error: !!errors.fromDate,
                          helperText: errors.fromDate,
                          FormHelperTextProps: {
                            sx: helperTextStyles,
                          },
                          sx: getDatePickerStyles(!!errors.fromDate),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={inputContainerStyles}>
                    <Typography
                      variant="body2"
                      sx={{ ...inputLabelStyles, textAlign: 'left', mb: 1 }}
                    >
                      To Date <span style={requiredIndicatorStyles}>*</span>
                    </Typography>
                    <DatePicker
                      value={toDate}
                      onChange={(newValue: any) => {
                        setToDate(newValue ? dayjs(newValue) : null);
                        if (errors.toDate) {
                          setErrors({ ...errors, toDate: '' });
                        }
                      }}
                      minDate={fromDate || undefined}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          placeholder: 'Select to date',
                          error: !!errors.toDate,
                          helperText: errors.toDate,
                          FormHelperTextProps: {
                            sx: helperTextStyles,
                          },
                          sx: getDatePickerStyles(!!errors.toDate),
                        },
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              )} */}

              <Box sx={inputContainerStyles}>
                <Typography
                  variant="body2"
                  sx={{ ...inputLabelStyles, textAlign: 'left' }}
                >
                  Remark
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Type remark here"
                  value={remark}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_REMARK_LENGTH) {
                      setRemark(value);
                      if (errors.remark) {
                        setErrors({ ...errors, remark: '' });
                      }
                    }
                  }}
                  error={!!errors.remark}
                  sx={getTextareaStyles(!!errors.remark)}
                />
                <Typography variant="caption" sx={charCounterStyles}>
                  {String(remark.length).padStart(2, '0')}/{MAX_REMARK_LENGTH}
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* Display API Error */}
          {(suspendError || revokeSuspendError) && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
              <Typography
                variant="body2"
                color="error"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ErrorOutlineIcon fontSize="small" />
                {suspendError || revokeSuspendError}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={dialogActionsStyles}>
          <Button
            onClick={handleClose}
            disabled={suspending || revokingSuspension}
            variant="outlined"
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={suspending || revokingSuspension || !remark.trim()}
            sx={submitButtonStyles}
            onClick={handleSubmit}
          >
            {suspending || revokingSuspension ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Submit'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <ConfirmationModal
        open={showSuccess}
        onClose={() => {
          handleSuccessClose();
          navigate(
            '/ckycrr-admin/sub-users/certify-modify?action=Track Status'
          ); // Navigate to /ckycrr-admin/sub-users/certify-modify
        }}
        message={
          userType.toUpperCase() === CERSAIUserRoles.SUPER_ADMIN_USER
            ? 'User suspened successfully'
            : 'Submitted for approval'
        }
        onConfirm={() => {
          handleSuccessClose();
          navigate(
            '/ckycrr-admin/sub-users/certify-modify?action=Track Status'
          ); // Navigate to /ckycrr-admin/sub-users/certify-modify
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        open={showError}
        onClose={() => {
          setShowError(false);
          setErrorMessage('');
        }}
        primaryMessage={errorMessage}
        buttonText="Try Again"
      />
    </>
  );
};

export default SuspendUserModal;
