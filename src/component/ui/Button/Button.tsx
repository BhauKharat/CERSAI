import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';

export type ButtonProps = MuiButtonProps & {
  className?: string;
};

const PRIMARY_BLUE = '#2563eb';
const HOVER_BLUE = '#1e40af';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'contained', className = '', sx, ...props }, ref) => (
    <MuiButton
      ref={ref}
      variant={variant}
      color="primary"
      className={className}
      sx={{
        minWidth: 120,
        height: 40,
        fontWeight: 600,
        fontSize: '1rem',
        borderRadius: '6px',
        letterSpacing: '0.03em',
        textTransform: 'none',
        boxShadow: 'none',
        backgroundColor: variant === 'contained' ? PRIMARY_BLUE : 'transparent',
        color: variant === 'contained' ? '#fff' : PRIMARY_BLUE,
        border:
          variant === 'outlined' ? `2px solid ${PRIMARY_BLUE}` : undefined,
        '&:hover': {
          backgroundColor: variant === 'contained' ? HOVER_BLUE : '#f0f5ff',
          color: variant === 'contained' ? '#fff' : PRIMARY_BLUE,
        },
        ...sx,
      }}
      disableElevation
      {...props}
    >
      {children}
    </MuiButton>
  )
);

Button.displayName = 'Button';

export default Button;
