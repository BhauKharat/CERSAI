import React from 'react';
import { Box, Button } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CKYCRRLogo from '../../../../assets/cersai_logo.svg';
import { SVG_LOGIN_PATHS } from '../../../../constants/svgPaths';

export const HeaderLogo: React.FC = () => {
  return (
    <>
      {/* Left-aligned Home button */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '20px', md: '31px' },
          left: { xs: '16px', md: '24px' },
          pb: 2,
        }}
      >
        <Button
          onClick={() => window.location.replace('/')}
          startIcon={<ArrowBackIosNewIcon sx={{ color: 'black' }} />}
          className="signup-header-btn"
          sx={{ textTransform: 'none', color: 'black' }}
        >
          Home
        </Button>
      </Box>

      {/* Centered logo cluster */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '20px', md: '31px' },
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '180px', md: '226px' },
          height: { xs: '40px', md: '50px' },
          '@media (max-width: 375px)': {
            left: '36%',
            transform: 'none',
          },
        }}
      >
        {/* CKYCRR Text Logo */}
        <Box
          sx={{
            position: 'absolute',
            top: '18%',
            left: '26.55%',
            right: 0,
            bottom: '18.48%',
          }}
        >
          <svg
            width="166"
            height="32"
            viewBox="0 0 166 32"
            fill="none"
            style={{ width: '100%', height: '100%' }}
          >
            <g id="CKYCRR">
              <path d={SVG_LOGIN_PATHS.pa9e680} fill="#007643" />
              <path d={SVG_LOGIN_PATHS.pbb92b00} fill="#007643" />
              <path d={SVG_LOGIN_PATHS.p23e0d300} fill="#007643" />
              <path d={SVG_LOGIN_PATHS.pf0be7c0} fill="#007643" />
              <path d={SVG_LOGIN_PATHS.p1a82b000} fill="#007643" />
              <path d={SVG_LOGIN_PATHS.p32aed800} fill="#007643" />
            </g>
          </svg>
        </Box>

        {/* CERSAI Logo */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '22.12%',
            aspectRatio: '1',
            borderRadius: '53px',
            overflow: 'hidden',
          }}
        >
          <img
            src={CKYCRRLogo}
            alt="CERSAI Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 50%',
              borderRadius: '53px',
            }}
          />
        </Box>
        {/* End of centered logo cluster container */}
      </Box>
    </>
  );
};

export default HeaderLogo;
