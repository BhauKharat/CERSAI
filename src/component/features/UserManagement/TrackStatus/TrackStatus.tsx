/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { MainDiv, HeaderTypo } from '../ModifyRegion/ModifyRegion';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../NavigationBreadCrumb/NavigationBreadCrumb';
import RegionTable from '../CreateModifyRegion/RegionTable';
import { useNavigate } from 'react-router-dom';
import { Region as ApiRegion } from '../CreateModifyRegion/types/region';
import { RegionWorkflow } from '../CreateModifyRegion/types/regionWorkflow';

const TrackStatus = () => {
  const navigate = useNavigate();

  // Get auth state for user role
  const authState = useSelector((state: RootState) => state.auth);
  const userRole = authState?.userDetails?.role;

  // Console log the logged-in user's role
  useEffect(() => {
    console.log('Logged-in User Role:', userRole);
    console.log('Full User Details:', authState?.userDetails);
  }, [userRole, authState?.userDetails]);
  const crumbsInitialData: ICrumbs[] = [
    {
      label: 'User Management',
    },
    {
      label: 'Region',
    },
    {
      label: 'Track Status',
    },
  ];

  const handleRowClick = (
    id: number,
    regionCode: string,
    status?: string,
    regionData?: ApiRegion,
    workflowData?: RegionWorkflow
  ) => {
    navigate(`/re/modify-region/${regionCode}`, {
      state: {
        workflowId: workflowData?.workflowId,
        regionId: id,
        track: true,
        status,
        workflowData,
      },
    });
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv>
        <NavigationBreadCrumb crumbsData={crumbsInitialData} />
        <HeaderTypo>Track Status</HeaderTypo>
      </MainDiv>

      <RegionTable
        showBackButton={false}
        showCreateNewButton={false}
        showSearchFilter={false}
        showStatusFilter={false}
        showContentSearch={true}
        handleRowClick={handleRowClick}
        isTrackStatus={true}
      />
    </Box>
  );
};

export default TrackStatus;
