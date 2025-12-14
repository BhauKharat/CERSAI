/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { MainDiv, HeaderTypo } from '../../ModifyRegion/ModifyRegion';
import NavigationBreadCrumb from '../../NavigationBreadCrumb/NavigationBreadCrumb';
import UserListTable from '../UserListTable';
import { ApiUser } from '../types/users';
import { useNavigate } from 'react-router-dom';
import { fetchRegions } from '../slice/fetchRegionsSlice';
import { fetchBranches } from '../../CreateModifyBranch/slice/fetchBranchesSlice';

const RevokeSuspension = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get auth state for userId
  const authState = useSelector((state: RootState) => state.auth);
  
  // Get regions data from Redux
  const {
    data: regions,
    loading: regionsLoading,
    error: regionsError,
  } = useSelector((state: RootState) => state.fetchRegionsManagement);
  
  // Get branches data from Redux
  const {
    data: branches,
    loading: branchesLoading,
    error: branchesError,
  } = useSelector((state: RootState) => state.fetchBranchesManagement);
  
  const navigationMenuList = [
    {
      label: 'User Management',
    },
    {
      label: 'User',
    },
    {
      label: 'Revoke Suspension',
    },
  ];

  // Fetch regions on component mount
  useEffect(() => {
    const userId = authState?.userDetails?.userId;
    if (userId) {
      dispatch(fetchRegions({ userId }));
    }
  }, [dispatch, authState]);

  const handleRowClick = (user: ApiUser) => {
    if (user.status === 'APPROVED') {
      navigate(`/re/modify-user/${user.userId}`, {
        state: { userId: user.userId, revoke: true },
      });
    }
  };

  // Handle region change - fetch branches for the selected region
  const handleRegionChange = (regionId: string) => {
    if (regionId) {
      dispatch(fetchBranches({ regionId }));
    }
  };

  const handleBranchChange = () => {
    // Add any additional logic needed when branch changes
  };

//   useEffect(() => {
//     navigate(`/re/modify-user/1a18a3b7-5f08-4b8c-8ce1-ee4693da8b82`, {
//       state: { userId: '1a18a3b7-5f08-4b8c-8ce1-ee4693da8b82', revoke: true },
//     });
//   }, []);

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv>
        <NavigationBreadCrumb crumbsData={navigationMenuList} />
        <HeaderTypo>Revoke User Suspension</HeaderTypo>
      </MainDiv>

      <UserListTable
        showBranchFilter={true}
        showRoleFilter={true}
        showRegionFilter={true}
        handleRowClick={handleRowClick}
        regions={regions || []}
        regionsLoading={regionsLoading}
        regionsError={regionsError}
        branches={branches || []}
        branchesLoading={branchesLoading}
        branchesError={branchesError}
        onRegionChange={handleRegionChange}
        onBranchChange={handleBranchChange}
        defaultStatus="SUSPENDED"
      />
    </Box>
  );
};

export default RevokeSuspension;
