/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
interface HeadingEntityProfileProps {
  breadcrumbItems?: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
  crumbsData?: {
    label: string;
    path?: string;
  }[];
  sx?: object;
}
const IPBreadcrumbUpdateProfile: React.FC<HeadingEntityProfileProps> = ({
  breadcrumbItems,
  crumbsData,
  sx = {},
}) => {
  // PRIORITIZE crumbsData if provided
  const items = crumbsData ?? breadcrumbItems ?? [];
  const navigate = useNavigate();
  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'inline-block' }}>
        <Box
          sx={{
            backgroundColor: '#E4F6FF',
            p: 1,
            borderRadius: 1,
            display: 'inline-block',
          }}
        >
          <Breadcrumbs
            separator={
              <ArrowForwardIosIcon
                sx={{ fontSize: 20, color: 'black', transform: 'scale(0.9)' }}
              />
            }
            aria-label="breadcrumb"
            sx={{
              marginLeft: 1,
              '& .MuiBreadcrumbs-separator': {
                margin: '0 4px',
              },
              '& .MuiTypography-root': {
                fontSize: '1rem',
              },
            }}
          >
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              // Type guard: check if "href" exists
              const hasHref = 'href' in item && item.href;
              const hasOnClick = 'onClick' in item && item.onClick;

              if (isLast) {
                return (
                  <Typography
                    key={index}
                    color="text.primary"
                    fontWeight="medium"
                    sx={{ fontWeight: 545, color: 'black' }}
                  >
                    {item.label}
                  </Typography>
                );
              }

              // If href exists → use navigate
              if (hasHref) {
                return (
                  <Typography
                    key={index}
                    sx={{
                      color: '#002CBA',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                    component="span"
                    onClick={() => navigate((item as any).href)}
                  >
                    {item.label}
                  </Typography>
                );
              }

              // If onClick exists → use that
              if (hasOnClick) {
                return (
                  <Typography
                    key={index}
                    color="text.secondary"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#002CBA',
                      },
                      color: 'black',
                      fontSize: '14px',
                    }}
                    onClick={(item as any).onClick}
                  >
                    {item.label}
                  </Typography>
                );
              }

              // Default if only "path" exists (crumbsData)
              return (
                <Typography
                  key={index}
                  color="text.secondary"
                  sx={{
                    color: 'black',
                    fontSize: '14px',
                  }}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        </Box>
      </Box>
    </Box>
  );
};

export default IPBreadcrumbUpdateProfile;
