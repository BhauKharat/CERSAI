import { Button, ButtonProps, SxProps, Theme } from '@mui/material';
import React, { MouseEvent } from 'react';

interface ActionButtonProps extends ButtonProps {
  buttonType: 'approve' | 'reject' | 'submit';
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  buttonType,
  children,
  sx,
  ...props
}) => {
  const baseStyles: SxProps<Theme> = {
    textTransform: 'none',
    fontSize: '16px',
    minWidth: '120px',
    padding: '8px 24px',
    fontWeight: 500,
    fontFamily: 'Gilroy, sans-serif',
  };

  type ButtonVariant = 'approve' | 'reject' | 'submit';

  const buttonStyles: Record<ButtonVariant, SxProps<Theme>> = {
    approve: {
      backgroundColor: '#002CBA',
      color: 'white',
      '&:hover': {
        backgroundColor: '#0022A3',
      },
      '&:disabled': {
        backgroundColor: '#F0F0F0',
        color: '#A0A0A0',
      },
    },
    reject: {
      borderColor: '#002CBA',
      color: '#002CBA',
      '&:hover': {
        borderColor: '#0022A3',
        backgroundColor: 'rgba(0, 44, 186, 0.04)',
      },
    },
    submit: {
      backgroundColor: '#4CAF50',
      color: 'white',
      '&:hover': {
        backgroundColor: '#3d8b40',
      },
    },
  };

  return (
    <Button
      variant={buttonType === 'reject' ? 'outlined' : 'contained'}
      sx={[
        baseStyles,
        buttonStyles[buttonType],
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Button>
  );
};

interface ActionButtonsProps {
  onApprove?: (e: MouseEvent<HTMLButtonElement>) => void;
  onReject?: (e: MouseEvent<HTMLButtonElement>) => void;
  approveDisabled?: boolean;
  rejectDisabled?: boolean;
  approveText?: string;
  rejectText?: string;
  approveButtonSx?: SxProps<Theme>;
  rejectButtonSx?: SxProps<Theme>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onApprove,
  onReject,
  approveDisabled = false,
  rejectDisabled = false,
  approveText = 'Approve',
  rejectText = 'Reject',
  approveButtonSx,
  rejectButtonSx,
}) => {
  return (
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
      {onReject && (
        <ActionButton
          buttonType="reject"
          onClick={onReject}
          disabled={rejectDisabled}
          sx={rejectButtonSx}
        >
          {rejectText}
        </ActionButton>
      )}
      {onApprove && (
        <ActionButton
          buttonType="approve"
          onClick={onApprove}
          disabled={approveDisabled}
          sx={approveButtonSx}
        >
          {approveText}
        </ActionButton>
      )}
    </div>
  );
};

export default ActionButtons;
