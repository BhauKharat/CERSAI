import React from 'react';
import { Box } from '@mui/material';
import { SVG_LOGIN_PATHS } from '../../../../constants/svgPaths';

export const BackgroundElements: React.FC = () => {
  return (
    <>
      {/* Background Blur Element */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '10%', md: '17.85%' },
          left: { xs: '10%', md: '29.28%' },
          width: { xs: '16px', md: '16px' },
          height: { xs: '26px', md: '26px' },
          filter: 'blur(10px)',
          zIndex: 0,
        }}
      >
        <svg
          width="16"
          height="26"
          viewBox="0 0 16 26"
          fill="none"
          style={{ width: '100%', height: '100%' }}
        >
          <g id="add">
            <path
              d={SVG_LOGIN_PATHS.p122f4900}
              stroke="#1D1D1B"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d={SVG_LOGIN_PATHS.p11c58f80}
              stroke="#1D1D1B"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </Box>

      {/* Right Side Circular Background */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '400px', md: '604px' },
          left: {
            xs: 'calc(60% + 20px)',
            md: 'calc(75% + 72.002px)',
          },
          width: { xs: '300px', md: '554.438px' },
          height: { xs: '300px', md: '554.438px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            transform: 'rotate(320.452deg) scaleY(-1)',
            width: { xs: '200px', md: '393.834px' },
            height: { xs: '200px', md: '393.834px' },
          }}
        >
          <svg
            width="394"
            height="394"
            viewBox="0 0 394 394"
            fill="none"
            style={{ width: '100%', height: '100%' }}
          >
            <circle
              cx="196.917"
              cy="196.917"
              r="196.917"
              fill="url(#paint0_linear_right)"
              opacity="0.4"
            />
            <defs>
              <linearGradient
                id="paint0_linear_right"
                x1="-6.724"
                y1="387.596"
                x2="410.854"
                y2="387.596"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="1" stopColor="#002CBA" />
              </linearGradient>
            </defs>
          </svg>
        </Box>
      </Box>

      {/* Left Side Background Group */}
      <Box
        sx={{
          position: 'absolute',
          top: {
            xs: 'calc(30% - 150px)',
            md: 'calc(50% - 333.589px)',
          },
          right: {
            xs: 'calc(60% + 10px)',
            md: 'calc(75% + 62.689px)',
          },
          width: { xs: '250px', md: '502.306px' },
          height: { xs: '200px', md: '447.808px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translateY(-50%)',
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            transform: 'rotate(343.118deg) scaleY(-1)',
            width: { xs: '200px', md: '421.751px' },
            height: { xs: '150px', md: '339.996px' },
          }}
        >
          <svg
            width="422"
            height="340"
            viewBox="0 0 422 340"
            fill="none"
            style={{ width: '100%', height: '100%' }}
          >
            <g id="Group 1410114757">
              <path
                d={SVG_LOGIN_PATHS.p1c955f80}
                fill="url(#paint0_linear_left_1)"
                opacity="0.4"
              />
              <path
                d={SVG_LOGIN_PATHS.p22d66300}
                fill="url(#paint1_linear_left_1)"
                opacity="0.4"
              />
              <path
                d={SVG_LOGIN_PATHS.p4943900}
                fill="url(#paint2_linear_left_1)"
                opacity="0.4"
              />
              <circle
                cx="195.078"
                cy="209.273"
                r="93.7343"
                fill="url(#paint3_linear_left_1)"
                opacity="0.4"
                transform="rotate(-125.452 195.078 209.273)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_left_1"
                x1="296.156"
                y1="82.8625"
                x2="371.384"
                y2="265.723"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#002CBA" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_left_1"
                x1="24.9137"
                y1="140.593"
                x2="201.067"
                y2="50.7429"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="1" stopColor="#002CBA" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_left_1"
                x1="214.721"
                y1="46.9894"
                x2="293.285"
                y2="74.0649"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="1" stopColor="#002CBA" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_left_1"
                x1="98.1429"
                y1="300.038"
                x2="296.914"
                y2="300.038"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="1" stopColor="#002CBA" />
              </linearGradient>
            </defs>
          </svg>
        </Box>
      </Box>
    </>
  );
};

export default BackgroundElements;
