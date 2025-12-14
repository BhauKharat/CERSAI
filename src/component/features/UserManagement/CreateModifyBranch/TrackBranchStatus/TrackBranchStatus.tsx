/* eslint-disable prettier/prettier */
import React from 'react';
import { Box } from '@mui/material';
import { MainDiv, HeaderTypo } from '../../ModifyRegion/ModifyRegion';
import NavigationBreadCrumb from '../../NavigationBreadCrumb/NavigationBreadCrumb';
import CreateModifyBranch from '../CreateModifyBranch';
import { Branch } from '../types/branch';
import { useNavigate } from 'react-router-dom';

const TrackBranchStatus = () => {
  const navigate = useNavigate();
  const crumbsList = [
    {
      label: 'User Management',
    },
    {
      label: 'Branch',
    },
    {
      label: 'Track Status',
    },
  ];

  const handleRowClick = (
    branchCode: string,
    branch: Branch,
    status?: string
  ) => {
    // Get workflowId from branch (it should be in the id field from transformed branches)
    // The branch object from track status has workflowId in the id field
    const branchWithWorkflowId = branch as Branch & { id?: string; workflowId?: string };
    const workflowId = branchWithWorkflowId.id || branchWithWorkflowId.workflowId;
    navigate(`/re/modify-branch/${branchCode}`, {
      state: {
        branchData: branch,
        isTrack: true,
        status,
        workflowId,
      },
    });
  };
  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv sx={{ paddingBottom: '0px' }}>
        <NavigationBreadCrumb crumbsData={crumbsList} />
        <HeaderTypo sx={{ marginTop: '10px', marginBottom: '0px' }}>Track Status</HeaderTypo>
      </MainDiv>

      <Box sx={{ mt: -2 }}>
        <CreateModifyBranch
          showBackButton={false}
          showSearchFilter={false}
          showStatusFilter={false}
          showCreateNewButton={false}
          showContentSearch={true}
          isTrackStatus={true}
          handleRowClick={handleRowClick}
        />
      </Box>
    </Box>
  );
};

export default TrackBranchStatus;
