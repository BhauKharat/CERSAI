import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface ReusableButtonProps extends Omit<ButtonProps, 'onClick'> {
  label: string;
  onClick: () => void;
  backgroundColor?: string;
  hoverColor?: string;
  textColor?: string;
  isLoading?: boolean;
  loadingText?: string;
}

const ReusableButton: React.FC<ReusableButtonProps> = ({
  label,
  onClick,
  backgroundColor = '#002CBA',
  hoverColor = '#001a8a',
  textColor = 'white',
  isLoading = false,
  loadingText = 'Loading...',
  disabled = false,
  sx = {},
  ...buttonProps
}) => {
  const buttonStyles = {
    fontFamily: 'Gilroy',
    fontWeight: 500,
    fontSize: '16px',
    textTransform: 'none' as const,
    px: 5,
    py: 1.5,
    borderRadius: '4px',
    backgroundColor: backgroundColor,
    color: textColor,
    '&:hover': {
      backgroundColor: hoverColor,
    },
    '&:disabled': {
      backgroundColor: '#999999',
      color: 'white',
    },
    ...sx,
  };

  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled || isLoading}
      sx={buttonStyles}
      {...buttonProps}
    >
      {isLoading ? loadingText : label}
    </Button>
  );
};

export default ReusableButton;
