/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { MainDiv, HeaderTypo } from '../../ModifyRegion/ModifyRegion';
import NavigationBreadCrumb from '../../NavigationBreadCrumb/NavigationBreadCrumb';
import UserListTable from '../UserListTable';
import { ApiUser } from '../types/users';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchRegions } from '../slice/fetchRegionsSlice';
import { fetchBranches } from '../../CreateModifyBranch/slice/fetchBranchesSlice';

const ModifyUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  
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
  
  // Debug regions state
  useEffect(() => {
    console.log('ModifyUser - Regions state:', {
      regions,
      regionsCount: regions?.length || 0,
      regionsLoading,
      regionsError,
    });
  }, [regions, regionsLoading, regionsError]);
  
  // Debug branches state
  useEffect(() => {
    console.log('ModifyUser - Branches state:', {
      branches,
      branchesCount: branches?.length || 0,
      branchesLoading,
      branchesError,
    });
  }, [branches, branchesLoading, branchesError]);
  
  const navigationMenuList = [
    {
      label: 'User Management',
    },
    {
      label: 'User',
    },
    {
      label: 'Modify',
    },
  ];

  // Fetch regions on component mount
  useEffect(() => {
    const userId = authState?.userDetails?.userId;
    console.log('ModifyUser - Fetching regions for userId:', userId);
    if (userId) {
      dispatch(fetchRegions({ userId }));
    }
  }, [dispatch, authState]);

  const handleRowClick = (user: ApiUser) => {
    if (user.status === 'APPROVED') {
      // Get location state to check if coming from track status with Creation activity
      const locationState = location.state as { track?: boolean; workflowType?: string; activity?: string; workflowData?: unknown } | null;
      const isFromTrackStatusCreation = 
        locationState?.track === true && 
        (locationState?.workflowType === 'RE_USER_CREATION' || 
         locationState?.activity === 'Creation' ||
         locationState?.activity === 'RE_USER_CREATION');

      navigate(`/re/modify-user/${user.userId}`, {
        state: { 
          userId: user.userId,
          // Pass track status creation flag to the form
          fromTrackStatusCreation: isFromTrackStatusCreation,
          workflowData: locationState?.workflowData,
          track: locationState?.track,
          activity: locationState?.activity,
        },
      });
    }
  };

  // Handle region change - fetch branches for the selected region
  const handleRegionChange = (regionId: string) => {
    console.log('ModifyUser - Region changed, fetching branches for regionId:', regionId);
    if (regionId) {
      dispatch(fetchBranches({ regionId }));
    }
  };

  const handleBranchChange = () => {
    // Add any additional logic needed when branch changes
  };

//   useEffect(() => {
//     navigate(`/re/modify-user/1a18a3b7-5f08-4b8c-8ce1-ee4693da8b82`, {
//         state: { userId: '1a18a3b7-5f08-4b8c-8ce1-ee4693da8b82' },
//       });
//   }, [])

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv>
        <NavigationBreadCrumb crumbsData={navigationMenuList} />
        <HeaderTypo>Modify User</HeaderTypo>
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
      />
    </Box>
  );
};

export default ModifyUser;
