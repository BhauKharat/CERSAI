/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import RegionTable from '../CreateModifyRegion/RegionTable';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../NavigationBreadCrumb/NavigationBreadCrumb';
import { Box, styled, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Region as ApiRegion } from '../CreateModifyRegion/types/region';

export const MainDiv = styled(Box)(() => ({
  padding: '20px 30px',
}));

export const HeaderTypo = styled(Typography)(() => ({
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '18px',
  fontWeight: 700,
  marginTop: '20px',
}));

const ModifyRegion = () => {
  const crumbsInitialData: ICrumbs[] = [
    {
      label: 'User Management',
    },
    {
      label: 'Region',
    },
    {
      label: 'Modify',
    },
  ];

  const [crumbsData, setCrumbsData] = useState<ICrumbs[]>(crumbsInitialData);

  const navigate = useNavigate();

  const handleRowClick = (id: number, regionCode: string, status?: string, regionData?: ApiRegion) => {
    navigate(`/re/modify-region/${regionCode}`, {
      state: { regionId: id, regionData },
    });

    setCrumbsData((prev) => [...prev, { label: 'Region Details' }]);
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv>
        <NavigationBreadCrumb crumbsData={crumbsData} />
        <HeaderTypo>Modify Region</HeaderTypo>
      </MainDiv>

      <RegionTable
        showBackButton={false}
        showCreateNewButton={false}
        showSearchFilter={false}
        showStatusFilter={false}
        showContentSearch={true}
        handleRowClick={handleRowClick}
        isTrackStatus={false}
      />
    </Box>
  );
};

export default ModifyRegion;
