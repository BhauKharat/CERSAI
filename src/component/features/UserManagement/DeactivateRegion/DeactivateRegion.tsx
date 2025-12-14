/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import RegionTable from '../CreateModifyRegion/RegionTable';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../NavigationBreadCrumb/NavigationBreadCrumb';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { HeaderTypo, MainDiv } from '../ModifyRegion/ModifyRegion';

const DeactivateRegion = () => {
  const crumbsInitialData: ICrumbs[] = [
    {
      label: 'User Management',
    },
    {
      label: 'Region',
    },
    {
      label: 'De-activate',
    },
  ];

  const [crumbsData, setCrumbsData] = useState<ICrumbs[]>(crumbsInitialData);

  const navigate = useNavigate();

  const handleRowClick = (id: number, regionCode: string) => {
    navigate(`/re/modify-region/${regionCode}`, {
      state: { regionId: id, deactivate:true },
    });

    setCrumbsData((prev) => [...prev, { label: 'Region Details' }]);
  };
  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv>
        <NavigationBreadCrumb crumbsData={crumbsData} />
        <HeaderTypo>Region De-activation Details</HeaderTypo>
      </MainDiv>

      <RegionTable
        showBackButton={false}
        showCreateNewButton={false}
        showSearchFilter={false}
        showStatusFilter={false}
        showContentSearch={true}
        handleRowClick={handleRowClick}
        isTrackStatus={false}
        isDeactivate={true}
      />
    </Box>
  );
};

export default DeactivateRegion;
