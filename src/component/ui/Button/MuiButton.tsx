import { Button } from '@mui/material';
import React from 'react';
interface IButton {
  text: string;
  onClick?: () => void;
  color?: string;
  backgroundColor?: string;
  type?: 'button' | 'reset' | 'submit';
  disabled?: boolean;
}
const MuiContainedButton = ({
  onClick,
  text,
  backgroundColor,
  color,
  type,
  disabled,
}: IButton) => {
  return (
    <Button
      sx={{
        color: color,
        backgroundColor: backgroundColor,
        textTransform: 'none',
        '&.Mui-disabled': {
          color: 'white', // override disabled text color
        },
      }}
      variant="contained"
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {text}
    </Button>
  );
};

export default MuiContainedButton;
