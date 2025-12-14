/* eslint-disable prettier/prettier */
import { Box, styled, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface Props {
  crumbsData: ICrumbs[];
}

export interface ICrumbs {
  label: string;
  path?: string;
}

const CrumbsMainDiv = styled(Box)(() => ({
  background: 'rgba(228, 246, 255, 1)',
  display: 'inline-flex',
  gap: '10px',
  padding: '15px 20px',
  fontFamily: 'Gilroy, sans-serif',
  borderRadius: '4px',
  alignItems: 'center',
}));

const LinkTypography = styled(Typography)(() => ({
  fontFamily: 'Gilroy, sans-serif',
  color: 'rgba(0, 44, 186, 1)',
  fontWeight: 600,
  fontSize: '17px',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const CurrentPageTypography = styled(Typography)(() => ({
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '17px',
}));

const NavigationBreadCrumb: React.FC<Props> = ({ crumbsData }) => {
  const navigate = useNavigate();

  const handleBreadcrumbClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <React.Fragment>
      <CrumbsMainDiv>
        {crumbsData.map((item, index) => (
          <React.Fragment key={index}>
            {index !== crumbsData.length - 1 ? (
              <React.Fragment>
                <LinkTypography
                  onClick={() => handleBreadcrumbClick(item.path)}
                >
                  {item.label}
                </LinkTypography>
                <ArrowForwardIosIcon sx={{ fontSize: '17px' }} />
              </React.Fragment>
            ) : (
              <CurrentPageTypography>{item.label}</CurrentPageTypography>
            )}
          </React.Fragment>
        ))}
      </CrumbsMainDiv>
    </React.Fragment>
  );
};

export default NavigationBreadCrumb;
