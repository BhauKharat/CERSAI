/* eslint-disable prettier/prettier */
import React from 'react';
import { Box } from '@mui/material';
import { HeaderTypo, MainDiv } from '../../ModifyRegion/ModifyRegion';
import NavigationBreadCrumb from '../../NavigationBreadCrumb/NavigationBreadCrumb';
import CreateModifyBranch from '../CreateModifyBranch';
import { Branch } from '../types/branch';
import { useNavigate } from 'react-router-dom';

const ModifyBranch = () => {

    const navigate = useNavigate();
    const crumbsData = [
        {
            label:'User Management'
        },
        {
            label:"Branch"
        },
        {
            label:"Modify"
        }
    ];

    const handleRowClick = (branchCode:string, branch:Branch) => {
       navigate(`/re/modify-branch/${branchCode}`, {
        state: { branchData: branch },
      });
    }   


  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv sx={{ paddingBottom: '0px' }}>
        <NavigationBreadCrumb crumbsData={crumbsData} />
        <HeaderTypo sx={{ marginTop: '10px', marginBottom: '0px' }}>Modify Branch</HeaderTypo>
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

export default ModifyBranch;
