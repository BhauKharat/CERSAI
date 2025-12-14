import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { MainDiv, HeaderTypo } from '../../ModifyRegion/ModifyRegion';
import NavigationBreadCrumb from '../../NavigationBreadCrumb/NavigationBreadCrumb';
import UserListTable from '../UserListTable';
import { fetchRegions } from '../slice/fetchRegionsSlice';
import { fetchBranches } from '../../CreateModifyBranch/slice/fetchBranchesSlice';
import { useNavigate } from 'react-router-dom';
import { ApiUser } from '../types/users';

const TrackStatus = () => {
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
      label: 'Track Status',
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
    console.log('===== TRACK STATUS ROW CLICKED =====');
    console.log('Full user object:', user);
    console.log('user.workflowData:', user.workflowData);
    console.log('user.userId:', user.userId);
    console.log('user.workflowType:', user.workflowType);

    // Check if activity is "Creation"
    const activity = user.workflowData?.activity || user.workflowType || '';
    const isCreation =
      activity === 'RE_USER_CREATION' || activity === 'Creation';

    console.log('Activity:', activity);
    console.log('isCreation:', isCreation);

    // If activity is Creation, keep functionality same
    if (isCreation) {
      console.log('===== NAVIGATING TO MODIFY USER (CREATION) =====');
      console.log('State being passed:', {
        userId: user.userId,
        track: true,
        status: user.status,
        workflowType: user.workflowType,
        workflowData: user.workflowData,
      });

      navigate(`/re/modify-user/${user.userId}`, {
        state: {
          userId: user.userId,
          track: true,
          status: user.status,
          workflowType: user.workflowType,
          workflowData: user.workflowData, // Pass complete workflow data including userDetails
        },
      });
    } else {
      // For other activities, pass userId in URL params
      // Get userId from workflowData metadata or user object
      const workflowDataAny = user.workflowData as {
        meta_data?: { userId?: string };
        payload?: { concernedUserDetails?: { userId?: string } };
      };
      const userIdToPass =
        workflowDataAny?.meta_data?.userId ||
        workflowDataAny?.payload?.concernedUserDetails?.userId ||
        user.userId;

      console.log('===== NAVIGATING TO MODIFY USER (OTHER ACTIVITY) =====');
      console.log('userIdToPass:', userIdToPass);
      console.log('State being passed:', {
        userId: userIdToPass,
        track: true,
        status: user.status,
        workflowType: user.workflowType,
        workflowData: user.workflowData,
        activity: activity,
      });

      navigate(`/re/modify-user/${userIdToPass}`, {
        state: {
          userId: userIdToPass,
          track: true,
          status: user.status,
          workflowType: user.workflowType,
          workflowData: user.workflowData,
          activity: activity, // Pass activity to identify non-Creation
        },
      });
    }
  };

  // Handle region change - fetch branches for the selected region
  const handleRegionChange = (regionId: string) => {
    if (regionId) {
      console.log('Fetching branches for regionId:', regionId);
      dispatch(fetchBranches({ regionId }));
    }
  };

  const handleBranchChange = (branchCode: string) => {
    console.log('Branch selected:', branchCode);
    // Add any additional logic needed when branch changes
  };

  //    useEffect(() => {
  //       navigate(`/re/modify-user/1a18a3b7-5f08-4b8c-8ce1-ee4693da8b82`, {
  //         state: { userId: '1a18a3b7-5f08-4b8c-8ce1-ee4693da8b82', track: true, status:'Approval Pending' },
  //       });
  //     }, []);

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <MainDiv>
        <NavigationBreadCrumb crumbsData={navigationMenuList} />
        <HeaderTypo>Track Status</HeaderTypo>
      </MainDiv>

      <UserListTable
        showBranchFilter={false}
        showRoleFilter={false}
        showRegionFilter={false}
        showContentSearch={true}
        showSearchClearButtons={false}
        handleRowClick={handleRowClick}
        isTrackStatus={true}
        useWorkflowData={true}
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

export default TrackStatus;
