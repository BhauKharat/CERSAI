/* eslint-disable @typescript-eslint/no-explicit-any */
// components/modals/ConfirmationModal.tsx
import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  FormHelperText,
  styled,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Custom styled components for MUI
const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-container': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .MuiDialog-paper': {
    borderRadius: '8px',
  },
}));

const StyledDialogContent = styled(DialogContent)(() => ({
  padding: '20px',
  textAlign: 'center',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 24px',
  justifyContent: 'center',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledButton = styled(Button)(() => ({
  height: '40px',
  minWidth: '100px',
  borderRadius: '6px',
  textTransform: 'none',
  fontSize: '14px',
}));

const PrimaryButton = styled(StyledButton)({
  backgroundColor: '#002CBA',
  color: 'white',
  '&:hover': {
    backgroundColor: '#002CBA',
  },
});

const CancelButton = styled(StyledButton)({
  border: '1px solid #002CBA',
  color: '#002CBA',
});

const WarningIconContainer = styled(Box)({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  border: '3px solid #ff4d4f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
});

const formControlStyle = {
  marginBottom: '20px',
  textAlign: 'left',
};

// Interface for form state
interface FormState {
  reason: string;
  remark: string;
  fromDate?: dayjs.Dayjs | null;
  toDate?: dayjs.Dayjs | null;
}

interface ConfirmationModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  type: 'deactivate' | 'suspend' | 'revoke';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onOk,
  onCancel,
  type,
  loading = false,
}) => {
  const [formState, setFormState] = React.useState<FormState>({
    reason: '',
    remark: '',
    fromDate: null,
    toDate: null,
  });

  const [formErrors, setFormErrors] = React.useState<any>({});

  // Reset form state when modal closes
  useEffect(() => {
    if (!visible) {
      setFormState({
        reason: '',
        remark: '',
        fromDate: null,
        toDate: null,
      });
      setFormErrors({});
    }
  }, [visible]);

  const getTitle = () => {
    switch (type) {
      case 'deactivate':
        return 'Are you sure you want to reject this application?';
      case 'suspend':
        return 'Are you sure you want to suspend this user?';
      case 'revoke':
        return 'Are you sure you want to revoke this user?';
      default:
        return '';
    }
  };

  const getReasonOptions = () => {
    switch (type) {
      case 'deactivate':
        return [
          { value: 'insufficient_documents', label: 'Insufficient Documents' },
          { value: 'invalid_information', label: 'Invalid Information' },
          { value: 'policy_violation', label: 'Policy Violation' },
          { value: 'incomplete_application', label: 'Incomplete Application' },
          { value: 'other', label: 'Other' },
        ];
      case 'suspend':
        return [
          { value: 'policy_violation', label: 'Policy Violation' },
          { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
          { value: 'security_concerns', label: 'Security Concerns' },
          { value: 'investigation_pending', label: 'Investigation Pending' },
          { value: 'other', label: 'Other' },
        ];
      case 'revoke':
        return [
          { value: 'policy_violation', label: 'Policy Violation' },
          { value: 'security_breach', label: 'Security Breach' },
          { value: 'unauthorized_access', label: 'Unauthorized Access' },
          { value: 'misuse_of_privileges', label: 'Misuse of Privileges' },
          {
            value: 'termination_of_employment',
            label: 'Termination of Employment',
          },
          { value: 'other', label: 'Other' },
        ];
      default:
        return [];
    }
  };

  const handleValidation = () => {
    const errors: any = {};
    if (type !== 'deactivate' && !formState.reason) {
      errors.reason = `Please select a reason!`;
    }
    if (type === 'suspend') {
      if (!formState.fromDate) {
        errors.fromDate = 'Please select a from date!';
      }
      if (!formState.toDate) {
        errors.toDate = 'Please select a to date!';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOk = () => {
    if (handleValidation()) {
      onOk(formState);
    }
  };

  const handleChange = (field: keyof FormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => {
    const reasonOptions = getReasonOptions();
    const reasonLabel = `${type.charAt(0).toUpperCase() + type.slice(1)} Reason`;

    return (
      <Box sx={{ p: 2, paddingTop: 0 }}>
        {/* Only show reason dropdown for suspend and revoke, not for deactivate */}
        {type !== 'deactivate' && (
          <FormControl
            fullWidth
            required
            sx={formControlStyle}
            error={!!formErrors.reason}
          >
            <InputLabel
              id="reason-label"
              sx={{ color: '#262626', fontWeight: '500', fontSize: '14px' }}
            >
              {reasonLabel}
            </InputLabel>
            <Select
              labelId="reason-label"
              id="reason-select"
              value={formState.reason}
              label={reasonLabel}
              onChange={(e) => handleChange('reason', e.target.value as string)}
              sx={{ height: '45px' }}
            >
              <MenuItem value="">
                <em>Select a reason</em>
              </MenuItem>
              {reasonOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formErrors.reason && (
              <FormHelperText>{formErrors.reason}</FormHelperText>
            )}
          </FormControl>
        )}

        {type === 'suspend' && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormControl
              fullWidth
              required
              sx={formControlStyle}
              error={!!formErrors.fromDate}
            >
              <DatePicker
                label="From Date"
                value={formState.fromDate}
                onChange={(newValue) => handleChange('fromDate', newValue)}
                format="DD-MM-YYYY"
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {
                    height: '45px',
                    borderRadius: '6px',
                  },
                }}
                slots={{
                  openPickerIcon: CalendarMonthIcon,
                }}
              />
              {formErrors.fromDate && (
                <FormHelperText>{formErrors.fromDate}</FormHelperText>
              )}
            </FormControl>
            <FormControl
              fullWidth
              required
              sx={formControlStyle}
              error={!!formErrors.toDate}
            >
              <DatePicker
                label="To Date"
                value={formState.toDate}
                onChange={(newValue) => handleChange('toDate', newValue)}
                format="DD-MM-YYYY"
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {
                    height: '45px',
                    borderRadius: '6px',
                  },
                }}
                slots={{
                  openPickerIcon: CalendarMonthIcon,
                }}
              />
              {formErrors.toDate && (
                <FormHelperText>{formErrors.toDate}</FormHelperText>
              )}
            </FormControl>
          </LocalizationProvider>
        )}

        <FormControl fullWidth sx={formControlStyle}>
          <TextField
            label="Remark"
            multiline
            rows={4}
            value={formState.remark}
            onChange={(e) => handleChange('remark', e.target.value)}
            placeholder={
              type === 'deactivate'
                ? 'Type your Remark here'
                : 'Type remark here'
            }
            inputProps={{ maxLength: 500 }}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '6px',
              },
            }}
            FormHelperTextProps={{
              sx: {
                textAlign: 'right',
                margin: 0,
                paddingRight: '14px',
                color: '#8c8c8c',
              },
            }}
            helperText={`${formState.remark.length.toString().padStart(2, '0')}/500`}
          />
        </FormControl>
      </Box>
    );
  };

  const getModalWidth = () => {
    switch (type) {
      case 'deactivate':
        return 500;
      case 'suspend':
      case 'revoke':
      default:
        return 520;
    }
  };

  return (
    <StyledDialog
      open={visible}
      onClose={onCancel}
      maxWidth={false}
      PaperProps={{ style: { width: getModalWidth() } }}
      disableEscapeKeyDown={loading}
    >
      <StyledDialogContent>
        {/* Warning Icon */}
        <WarningIconContainer>
          <Typography
            component="span"
            sx={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }}
          >
            !
          </Typography>
        </WarningIconContainer>

        {/* Title */}
        <Typography
          variant="h6"
          component="p"
          sx={{
            fontSize: type === 'deactivate' ? '16px' : '18px',
            fontWeight: type === 'deactivate' ? '500' : '600',
            color: '#262626',
            marginBottom: type === 'deactivate' ? '20px' : '30px',
            lineHeight: '1.4',
          }}
        >
          {getTitle()}
        </Typography>

        {/* Form */}
        {renderFormFields()}
      </StyledDialogContent>
      <StyledDialogActions>
        <CancelButton onClick={onCancel} disabled={loading}>
          Cancel
        </CancelButton>
        <PrimaryButton onClick={handleOk} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </PrimaryButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};
