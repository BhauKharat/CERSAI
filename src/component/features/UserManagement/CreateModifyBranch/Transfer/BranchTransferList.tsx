/* eslint-disable prettier/prettier */
import React from 'react';
import { Box } from '@mui/material';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../../NavigationBreadCrumb/NavigationBreadCrumb';
import { MainDiv, HeaderTypo } from '../../ModifyRegion/ModifyRegion';
import CreateModifyBranch from '../CreateModifyBranch';
import { Branch } from '../types/branch';
import { useNavigate } from 'react-router-dom';

const BranchTransferList = () => {
  const navigate = useNavigate();
  const crumbsList: ICrumbs[] = [
    {
      label: 'User Management',
    },
    {
      label: 'Branch',
    },
    {
      label: 'Transfer',
    },
  ];

  const handleRowClick = (branchCode: string, branch: Branch) => {
    navigate('/re/transfer-branch', {
      state: {
        branchData: branch,
        transferBranch: true,
      },
    });
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv sx={{ paddingBottom: '0px' }}>
        <NavigationBreadCrumb crumbsData={crumbsList} />
        <HeaderTypo sx={{ marginTop: '10px', marginBottom: '0px' }}>Transfer Branch</HeaderTypo>
      </MainDiv>

      <Box sx={{ mt: -2 }}>
        <CreateModifyBranch
          showBackButton={false}
          showSearchFilter={false}
          showStatusFilter={false}
          showCreateNewButton={false}
          showContentSearch={true}
          isTrackStatus={false}
          handleRowClick={handleRowClick}
        />
      </Box>
    </Box>
  );
};

export default BranchTransferList;
