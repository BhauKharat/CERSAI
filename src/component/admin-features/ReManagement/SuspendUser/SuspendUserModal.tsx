/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { suspendUser } from '../slices/suspendUserSlice';
import {
  dialogPaperStyles,
  dialogTitleStyles,
  closeButtonStyles,
  dialogContentStyles,
  inputContainerStyles,
  inputLabelStyles,
  requiredIndicatorStyles,
  helperTextStyles,
  getSelectStyles,
  getDatePickerStyles,
  getTextareaStyles,
  charCounterStyles,
  dialogActionsStyles,
  cancelButtonStyles,
  submitButtonStyles,
} from './SuspendUserModal.styles';
import ErrorModal from '../ErrorModal/ErrorModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { AppDispatch } from 'store';
import { useNavigate } from 'react-router-dom';
import uploadIcon from '../../../../assets/upload_icon.svg';
import { ReFilePreview } from '../ReFilePreview/ReFilePreview';

interface SuspendUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const UploadButtonWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const ImagePreviewBox = styled(Box)(() => ({
  height: '40px',
  marginBottom: '5px',
}));

const MAX_REMARK_LENGTH = 500;

const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const [reason, setReason] = useState('');
  const [remark, setRemark] = useState('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  console.log(userId);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<{
    reason?: string;
    remark?: string;
    fromDate?: string;
    toDate?: string;
  }>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => setFileBase64(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!reason.trim()) newErrors.reason = 'Reason is required';
    if (!remark.trim()) newErrors.remark = 'Remark is required';
    if (!fromDate) newErrors.fromDate = 'From date is required';
    if (!toDate) newErrors.toDate = 'To date is required';
    else if (fromDate && toDate.isBefore(fromDate))
      newErrors.toDate = 'To date must be after from date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          suspensionFromDate: fromDate?.format('YYYY-MM-DD') || '',
          suspensionToDate: toDate?.format('YYYY-MM-DD') || '',
          suspensionReason: reason,
          file,
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

  const resetForm = () => {
    setReason('');
    setRemark('');
    setFromDate(dayjs());
    setToDate(null);
    setFile(null);
    setFileBase64(null);
    setErrors({});
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
    setFile(null);
    setFileBase64(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: dialogPaperStyles }}
    >
      {/* Close button */}
      <DialogTitle sx={dialogTitleStyles}>
        <IconButton onClick={handleClose} sx={closeButtonStyles}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={dialogContentStyles}>
        {/* Heading */}
        <Typography sx={{ ...inputLabelStyles, fontSize: '18px', mb: 3 }}>
          Suspension of Reporting entity
        </Typography>

        {/* Reason */}
        <Box sx={inputContainerStyles}>
          <Typography sx={inputLabelStyles}>
            Suspension Reason <span style={requiredIndicatorStyles}>*</span>
          </Typography>
          <TextField
            select
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            SelectProps={{ native: true }}
            sx={getSelectStyles(!!errors.reason)}
            error={!!errors.reason}
            helperText={errors.reason}
            FormHelperTextProps={{ sx: helperTextStyles }}
          >
            <option value="">Select a reason</option>
            <option value="Restrictions Imposed by Regulators">
              Restrictions Imposed by Regulators
            </option>
            <option value="Non-compliance">Non-compliance</option>
          </TextField>
        </Box>

        {/* Remark */}
        <Box sx={inputContainerStyles}>
          <Typography sx={inputLabelStyles}>
            Remark <span style={requiredIndicatorStyles}>*</span>
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder="Type your remark here"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            sx={getTextareaStyles(!!errors.remark)}
            error={!!errors.remark}
            helperText={errors.remark}
            FormHelperTextProps={{ sx: helperTextStyles }}
          />
          <Typography sx={charCounterStyles}>
            {remark.length}/{MAX_REMARK_LENGTH}
          </Typography>
        </Box>

        {/* Dates */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2, ...inputContainerStyles }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={inputLabelStyles}>
                From Date <span style={requiredIndicatorStyles}>*</span>
              </Typography>
              <DatePicker
                value={fromDate}
                onChange={(newValue: any) =>
                  setFromDate(newValue ? dayjs(newValue) : null)
                }
                slotProps={{
                  textField: {
                    sx: {
                      ...getDatePickerStyles(!!errors.fromDate),
                      width: 210,
                    },
                    error: !!errors.fromDate,
                    helperText: errors.fromDate,
                    FormHelperTextProps: { sx: helperTextStyles },
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={inputLabelStyles}>
                To Date <span style={requiredIndicatorStyles}>*</span>
              </Typography>
              <DatePicker
                value={toDate}
                onChange={(newValue: any) =>
                  setToDate(newValue ? dayjs(newValue) : null)
                }
                minDate={fromDate || undefined}
                slotProps={{
                  textField: {
                    sx: {
                      ...getDatePickerStyles(!!errors.toDate),
                      width: 210, // 👈 set custom width
                    },
                    error: !!errors.toDate,
                    helperText: errors.toDate,
                    FormHelperTextProps: { sx: helperTextStyles },
                  },
                }}
              />
            </Box>
          </Box>
        </LocalizationProvider>

        {/* File Upload */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <UploadButtonWrapper>
            <Typography sx={inputLabelStyles}>Supporting Document</Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<img src={uploadIcon} alt="upload_icon" />}
              sx={{
                height: '48px',
                borderColor: 'rgba(0, 44, 186, 1)',
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'rgba(0, 44, 186, 1)',
                '&:hover': {
                  borderColor: '#002CBA',
                  backgroundColor: 'transparent',
                },
              }}
            >
              {file ? file.name : 'Upload'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </UploadButtonWrapper>

          <ImagePreviewBox>
            {file && <ReFilePreview file={file} />}
          </ImagePreviewBox>
        </Box>
      </DialogContent>

      <DialogActions sx={dialogActionsStyles}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={cancelButtonStyles}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={submitButtonStyles}
        >
          Submit
        </Button>
      </DialogActions>

      {/* Success Modal */}
      <ConfirmationModal
        open={showSuccess}
        onClose={() => {
          handleSuccessClose();
          resetForm();
          setRemark('');
          setReason('');
          setFile(null);
          setFileBase64('');
          setErrorMessage('');
          navigate('/ckycrr-admin/re-management/suspension');
        }}
        message="User has been suspended successfully!"
        onConfirm={() => {
          handleSuccessClose();
          resetForm();
          setRemark('');
          setReason('');
          setFile(null);
          setFileBase64('');
          setErrorMessage('');
          navigate('/ckycrr-admin/re-management/suspension');
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        open={showError}
        onClose={() => {
          handleSuccessClose();
          resetForm();
          setRemark('');
          setReason('');
          setFile(null);
          setFileBase64('');
          setErrorMessage('');
          setShowError(false);
        }}
        primaryMessage={errorMessage}
        buttonText="Try Again"
      />
    </Dialog>
  );
};

export default SuspendUserModal;
