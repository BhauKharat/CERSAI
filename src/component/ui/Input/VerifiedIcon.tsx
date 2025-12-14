import React from 'react';
import { Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { SVG_LOGIN_PATHS } from '../../../constants/svgPaths';

export interface VerifiedIconProps {
  text?: string;
  color?: string; // main green color
  size?: number; // px height of the icon circle
  showText?: boolean;
  textSx?: SxProps<Theme>;
}

/**
 * Small verified badge with checkmark and optional "Verified" text.
 * Reusable across inputs and summaries.
 */
const VerifiedIcon: React.FC<VerifiedIconProps> = ({
  text = 'Verified',
  color = '#52AE32',
  size = 19,
  showText = true,
  textSx,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Box
        sx={{ width: `${size}px`, height: `${size}px`, position: 'relative' }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 19 19"
          fill="none"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <g>
            <path
              d={SVG_LOGIN_PATHS.p23e3c2a0}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d={SVG_LOGIN_PATHS.pe425980}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </g>
        </svg>
      </Box>

      {showText && (
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: '"Gilroy-SemiBold", sans-serif',
            color,
            lineHeight: 'normal',
            whiteSpace: 'pre',
            ...textSx,
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default VerifiedIcon;
