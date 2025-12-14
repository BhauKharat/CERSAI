/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
interface HeadingEntityProfileProps {
  breadcrumbItems: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
  sx?: object;
}

const AdminBreadcrumbUpdateProfile: React.FC<HeadingEntityProfileProps> = ({
  breadcrumbItems,

  sx = {},
}) => {
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
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;

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

              return item.href ? (
                <Typography
                  key={index}
                  sx={{
                    color: '#002CBA',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    // '&:hover': {
                    //   textDecoration: 'underline',
                    // }
                  }}
                  component="span"
                  //href={item.href}
                  onClick={() => {
                    navigate(item.href!);
                  }}
                >
                  {item.label}
                </Typography>
              ) : (
                <Typography
                  key={index}
                  color="text.secondary"
                  sx={{
                    cursor: item.onClick ? 'pointer' : 'default',
                    '&:hover': item.onClick
                      ? {
                          textDecoration: 'underline',
                          color: '#002CBA',
                        }
                      : {},
                    color: 'black',
                    fontSize: '14px',
                  }}
                  onClick={item.onClick}
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

export default AdminBreadcrumbUpdateProfile;
