/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import {
  TableCell,
  TableRow,
  Box,
  Typography,
  styled,
  Button,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import SearchableTable from '../../../../common/SearchableTable/SearchableTable';
import { SelectChangeEvent } from '@mui/material';
// import { statusTextStyles } from './UserTab.styles'; // Commented out - not used after hiding Status column
import { useDispatch, useSelector } from 'react-redux';
import { SubUserUser } from './types/User';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { fetchUser } from './slice/UserSlice';
import { fetchRegions } from '../../../UserManagement/CreateModifyUser/slice/fetchRegionsSlice';
import { fetchUserRoles } from '../../../UserManagement/CreateModifyUser/slice/userRolesSlice';
import { fetchBranches } from '../../../UserManagement/CreateModifyBranch/slice/fetchBranchesSlice';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import DateUtils from '../../../../../utils/dateUtils';
import { USER_ROLES } from '../../../../../utils/enumUtils';

type Order = 'asc' | 'desc';

const MainDiv = styled(Box)(() => ({
  padding: '20px 30px',
}));

const HeaderTypo = styled(Typography)(() => ({
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '18px',
  fontWeight: 700,
  marginTop: '20px',
}));

const UserTab: React.FC = () => {
  const { action } = useParams<{ action?: string }>();
  const navigate = useNavigate();
  const [userSubUserManagement, setUserSubUserManagement] = useState<
    SubUserUser[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRegion, setSearchRegion] = useState('');
  const [searchBranch, setSearchBranch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Helper component to wrap cell content with tooltip
  const CellWithTooltip: React.FC<{
    value?: string | number | null | undefined;
    children?: React.ReactNode;
  }> = ({ value, children }) => {
    // Get the text value for tooltip - prefer value prop, fallback to children
    const tooltipText =
      value?.toString() ||
      (typeof children === 'string' ? children : children?.toString()) ||
      '-';
    // Get display content - prefer children, fallback to value
    const displayContent =
      children !== undefined ? children : value?.toString() || '-';

    return (
      <Tooltip title={tooltipText} arrow placement="top">
        <span
          style={{
            display: 'block',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayContent}
        </span>
      </Tooltip>
    );
  };

  const [activeSearch, setActiveSearch] = useState('');
  const [activeSearchRegion, setActiveSearchRegion] = useState('');
  const [activeSearchBranch, setActiveSearchBranch] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof SubUserUser>('userName');
  const [totalElementData, setTotalElementData] = useState(0);
  const [searchStatus, setSearchStatus] = useState('PENDING');
  const [activeSearchStatus, setActiveSearchStatus] = useState('PENDING');

  // Get auth state for userId and groupMembership
  const authState = useSelector((state: RootState) => state.auth);
  const groupMembership = authState?.groupMembership;

  // Get regions data from Redux
  const { data: regions } = useSelector(
    (state: RootState) => state.fetchRegionsManagement
  );

  const { data: branches } = useSelector(
    (state: RootState) => state.fetchBranchesManagement
  );

  // Get user roles from Redux
  const userRolesData = useSelector((state: RootState) => state.userRoles.data);
  // const userRolesLoading = useSelector(
  //   (state: RootState) => state.userRoles.loading
  // ); // Commented out - not used
  // const userRolesError = useSelector(
  //   (state: RootState) => state.userRoles.error
  // ); // Commented out - not used

  // Map URL action to workflow_type (case-insensitive)
  const getWorkflowTypeFromAction = (
    actionParam?: string
  ): string | undefined => {
    if (!actionParam) return undefined;
    // Convert to lowercase for case-insensitive matching
    const normalizedAction = actionParam.toLowerCase();
    const actionMap: Record<string, string> = {
      create: 'RE_USER_CREATION',
      modify: 'RE_USER_MODIFICATION',
      modification: 'RE_USER_MODIFICATION',
      suspend: 'RE_USER_SUSPENSION',
      'revoke-suspension': 'RE_USER_SUSPENSION_REVOKE',
      'revoke suspension': 'RE_USER_SUSPENSION_REVOKE',
      'de-activate': 'RE_USER_DEACTIVATION',
      'de-activation': 'RE_USER_DEACTIVATION',
    };
    return actionMap[normalizedAction] || undefined;
  };

  // Get workflow type from URL action
  const workflowType = getWorkflowTypeFromAction(action);

  // Breadcrumb data - capitalize action for display
  const actionLabel = action
    ? action === 'de-activate'
      ? 'De-activate'
      : action
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
    : '';
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'User', path: '/re/sub-user-management/user' },
    ...(actionLabel ? [{ label: actionLabel }] : []),
  ];

  const statusOptions = [
    'Creation',
    'Modification',
    'De-Activation',
    'Modification',
    'Merge',
  ];

  const dispatch = useDispatch<AppDispatch>();

  // Fetch regions and user roles on component mount
  useEffect(() => {
    const userId = authState?.userDetails?.userId;
    if (userId) {
      dispatch(fetchRegions({ userId }));
    }
    dispatch(fetchUserRoles());
  }, [dispatch, authState]);

  // Track role filter changes for debugging
  useEffect(() => {
    console.log('🔄 Role filter changed:', roleFilter);
  }, [roleFilter]);

  // Helper function to get valid search term (only if length is 0 or >= 3)
  const getValidSearchTerm = useCallback((searchValue: string): string => {
    return searchValue && searchValue.trim().length >= 3
      ? searchValue.trim()
      : '';
  }, []);

  // Debounced search effect - automatically call API when searchTerm changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setActiveSearch(searchTerm);
      setPage(0); // Reset to first page when search changes
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchTerm]);

  useEffect(() => {
    // Only call API if searchTerm is empty or has at least 3 characters
    if (
      searchTerm &&
      searchTerm.trim().length > 0 &&
      searchTerm.trim().length < 3
    ) {
      return; // Don't make API call if less than 3 characters
    }

    const validSearchTerm = getValidSearchTerm(activeSearch);

    dispatch(
      fetchUser({
        page: 0,
        size: rowsPerPage,
        workflowType: workflowType,
        role: activeRoleFilter || '',
        region: activeSearchRegion || undefined,
        branch: activeSearchBranch || undefined,
        search: validSearchTerm || undefined,
        status: activeSearchStatus || 'PENDING',
      })
    )
      .then((action: any) => {
        console.log('User API response:---', action.payload);
        if (action.payload) {
          setUserSubUserManagement(action.payload.content || []);
          setTotalElementData(action.payload.totalElements || 0);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch user data:', error);
      });
  }, [
    dispatch,
    rowsPerPage,
    workflowType,
    activeRoleFilter,
    activeSearchRegion,
    activeSearchBranch,
    activeSearch,
    activeSearchStatus,
    getValidSearchTerm,
    searchTerm,
  ]);

  const handleSearch = () => {
    console.log('🔍 Search button clicked');
    console.log('Current filters:', {
      searchTerm,
      searchRegion,
      searchBranch,
      roleFilter,
      searchStatus,
    });
    console.log('Available branches:', branches);
    console.log('Available regions:', regions);

    // Only proceed if searchTerm is empty or has at least 3 characters
    if (
      searchTerm &&
      searchTerm.trim().length > 0 &&
      searchTerm.trim().length < 3
    ) {
      return; // Don't make API call if less than 3 characters
    }

    const validSearchTerm = getValidSearchTerm(searchTerm);
    setActiveSearch(validSearchTerm);
    setActiveSearchStatus(searchStatus);
    setActiveSearchRegion(searchRegion);
    setActiveSearchBranch(searchBranch);
    setActiveRoleFilter(roleFilter);
    setPage(0);

    const payload = {
      page: 0,
      size: rowsPerPage,
      search: validSearchTerm,
      status: searchStatus || 'PENDING',
      region: searchRegion || undefined,
      branch: searchBranch || undefined,
      workflowType: workflowType,
      role: roleFilter || '',
    };

    console.log('📤 Dispatching fetchUser with payload:', payload);

    dispatch(fetchUser(payload))
      .then((action: any) => {
        console.log('Search API response:---', action.payload);
        if (action.payload) {
          setUserSubUserManagement(action.payload.content || []);
          setTotalElementData(action.payload.totalElements || 0);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch user data:', error);
      });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);

    const validSearchTerm = getValidSearchTerm(activeSearch);

    dispatch(
      fetchUser({
        page: newPage,
        size: rowsPerPage,
        search: validSearchTerm,
        status: activeSearchStatus || 'PENDING',
        region: activeSearchRegion || undefined,
        branch: activeSearchBranch || undefined,
        workflowType: workflowType,
        role: activeRoleFilter || '',
      })
    )
      .then((action: any) => {
        if (action.payload) {
          setUserSubUserManagement(action.payload.content || []);
          setTotalElementData(action.payload.totalElements || 0);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch user data:', error);
      });
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof SubUserUser
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    const regionName = event.target.value;
    console.log('🌍 Region changed:', regionName);
    setSearchRegion(regionName);
    setSearchBranch(''); // Reset branch when region changes
    setPage(0);

    // Convert regionName to regionCode
    let regionId = '';
    if (regionName && regions && regions.length > 0) {
      const selectedRegion = regions.find((r) => r.regionName === regionName);
      regionId = selectedRegion?.id || '';
      console.log('Selected region data:', selectedRegion);
    }

    // Fetch branches when region is selected
    if (regionId) {
      dispatch(fetchBranches({ regionId }));
    }

    // Don't call API here - wait for search button
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const selectedRole = event.target.value;
    console.log('👤 Role changed to:', selectedRole);
    setRoleFilter(selectedRole);
    setPage(0);

    // Reset region and branch filters when role changes
    // Based on create-new-user logic:
    // - IRA, IRU, IBU need region
    // - Only IBU needs branch
    // - IU doesn't need region or branch
    if (
      selectedRole === 'IU' ||
      selectedRole === 'INSTITUTIONAL_USER' ||
      selectedRole === ''
    ) {
      // IU doesn't need region or branch
      console.log('👤 Role is IU - hiding region and branch');
      setSearchRegion('');
      setSearchBranch('');
    } else if (
      selectedRole === 'IRU' ||
      selectedRole === 'INSTITUTIONAL_REGIONAL_USER' ||
      selectedRole === 'IRA' ||
      selectedRole === 'INSTITUTIONAL_REGIONAL_ADMIN'
    ) {
      // IRU and IRA need only region, not branch
      console.log('👤 Role is IRU/IRA - hiding branch, keeping region');
      setSearchBranch('');
    } else if (
      selectedRole === 'IBU' ||
      selectedRole === 'INSTITUTIONAL_BRANCH_USER'
    ) {
      // IBU needs both region and branch - keep region if selected
      console.log('👤 Role is IBU - showing both region and branch');
    }

    // Don't call API here - wait for search button
  };

  const handleBranchChange = (event: SelectChangeEvent<string>) => {
    const branchName = event.target.value;
    console.log('🏢 Branch changed:', branchName);
    setSearchBranch(branchName);
    setPage(0);

    // Convert branchName to branchCode for debugging
    if (branchName && branches && branches.length > 0) {
      const selectedBranch = branches.find(
        (b: { branchName?: string; branchCode?: string }) =>
          b.branchName === branchName
      );
      console.log('Selected branch data:', selectedBranch);
    }

    // Don't call API here - wait for search button
  };

  const processedUsers = React.useMemo(() => {
    const users = [...userSubUserManagement];

    // Content search is handled by API only - no frontend filtering
    // Region and branch filtering is also handled by API - no frontend filtering needed

    return users.sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      // Handle date sorting for submittedOn
      if (orderBy === 'submittedOn') {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        if (isNaN(aDate)) aValue = 0;
        else aValue = aDate;
        if (isNaN(bDate)) bValue = 0;
        else bValue = bDate;
      }

      // Handle status field - use the display status (PENDING -> 'Pending Approval')
      if (orderBy === 'status') {
        aValue = a.status === 'PENDING' ? 'Pending Approval' : a.status || '';
        bValue = b.status === 'PENDING' ? 'Pending Approval' : b.status || '';
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle numeric/date comparison
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1;
        }
      }

      // Handle undefined/null values - put them at the end
      if (aValue === undefined || aValue === null || aValue === '') {
        return 1;
      }
      if (bValue === undefined || bValue === null || bValue === '') {
        return -1;
      }

      return 0;
    });
  }, [userSubUserManagement, orderBy, order]);

  const handleRowClick = (user: SubUserUser) => {
    // Use userId if available, otherwise fallback to workflowId
    const idToUse = user?.userId || user?.workflowId || '';

    // Extract originalData and meta_data
    const originalData =
      (user as any)?.originalData || (user as any)?.workflowData || {};
    const metaData = originalData?.meta_data || {};

    // Determine region and branch values with priority
    const regionValue = metaData?.updatedRegion || '';
    const branchValue = metaData?.updatedBranch || '';

    console.log(
      '🔍 Resolved values - Region:',
      regionValue,
      'Branch:',
      branchValue
    );

    // Create enhanced workflowData with updated meta_data
    const enhancedWorkflowData = {
      ...originalData,
      meta_data: {
        ...metaData,
        region: regionValue,
        branch: branchValue,
        regionCode: metaData?.regionCode || '',
        branchCode: metaData?.branchCode || '',
      },
    };

    console.log('🔍 Enhanced workflow data:', enhancedWorkflowData);

    // Pass user data and workflow data via navigation state for prepopulation
    const navigationState = {
      userData: user,
      workflowId: user?.workflowId,
      userId: user?.userId,
      workflowData: enhancedWorkflowData,
    };

    switch (user?.activity) {
      case 'Creation':
        navigate(
          `/re/sub-user-management/user/new-user-creation-request/${idToUse}`,
          { state: navigationState }
        );
        break;
      case 'Modification':
        navigate(
          `/re/sub-user-management/user/user-modification-request/${idToUse}`,
          { state: navigationState }
        );
        break;
      case 'Suspension':
        navigate(
          `/re/sub-user-management/user/user-suspension-request/${idToUse}`,
          { state: navigationState }
        );
        break;
      case 'Revoke Suspension':
        navigate(
          `/re/sub-user-management/user/revoke-user-suspension-request/${idToUse}`,
          { state: navigationState }
        );
        break;
      case 'De-activation':
        navigate(
          `/re/sub-user-management/user/user-deactivation-request/${idToUse}`,
          { state: navigationState }
        );
        break;
      default:
        console.log('No route defined for:', user?.activity);
    }
  };

  // Conditionally include User ID column based on workflow_type
  const shouldShowUserId = workflowType !== 'RE_USER_CREATION';

  const columns = [
    { id: 'srNo', label: 'Sr.No.', sortable: false },
    { id: 'userName', label: 'User Name', sortable: true },
    ...(shouldShowUserId
      ? [{ id: 'userId', label: 'User ID', sortable: true }]
      : []),
    { id: 'role', label: 'Role', sortable: true },
    { id: 'region', label: 'Region', sortable: true },
    { id: 'branch', label: 'Branch', sortable: true },
    // { id: 'status', label: 'Status', sortable: true },
    // { id: 'activity', label: 'Activity', sortable: true },
    { id: 'submittedOn', label: 'Submitted On', sortable: true },
    { id: 'submittedBy', label: 'Submitted By', sortable: true },
  ];

  const renderRow = (user: SubUserUser, index: number) => {
    const startIndex = page * rowsPerPage;
    const srNo = startIndex + index + 1;

    const cellWithDividerStyle = {
      p: '16px',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      fontFamily: 'Gilroy, sans-serif',
      fontWeight: 600,
      fontSize: '16px',
      color: 'rgba(0, 44, 186, 1)',
      textAlign: 'center',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '8px',
        bottom: '8px',
        right: 0,
        width: '1px',
        backgroundColor: 'rgba(224, 224, 224, 1)',
      },
    };
    console.log('Rendering row for user:', user);
    return (
      <TableRow
        key={index}
        sx={{
          '&:hover': { backgroundColor: '#E4F6FF' },
          cursor: 'pointer',
        }}
        onClick={() => handleRowClick(user)}
      >
        <TableCell sx={{ ...cellWithDividerStyle }}>{srNo}</TableCell>
        <TableCell sx={{ ...cellWithDividerStyle }}>
          <CellWithTooltip value={user?.userName || '-'}>
            {user?.userName && user.userName.length > 20
              ? `${user.userName.substring(0, 20)}...`
              : user?.userName || '-'}
          </CellWithTooltip>
        </TableCell>
        {shouldShowUserId && (
          <TableCell sx={{ ...cellWithDividerStyle }}>
            <CellWithTooltip value={user?.userId || '-'}>
              {user?.userId || '-'}
            </CellWithTooltip>
          </TableCell>
        )}
        <TableCell sx={{ ...cellWithDividerStyle }}>
          <CellWithTooltip value={user?.userType || '-'}>
            {user?.userType || '-'}
          </CellWithTooltip>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle }}>
          <CellWithTooltip
            value={
              (user as any)?.originalData?.meta_data?.updatedRegion ||
              (user as any)?.meta_data?.region ||
              user?.regionName ||
              '-'
            }
          >
            {(user as any)?.originalData?.meta_data?.updatedRegion ||
              (user as any)?.meta_data?.region ||
              user?.regionName ||
              '-'}
          </CellWithTooltip>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle }}>
          <CellWithTooltip
            value={
              (user as any)?.originalData?.meta_data?.updatedBranch ||
              (user as any)?.meta_data?.branch ||
              user?.branchName ||
              '-'
            }
          >
            {(user as any)?.originalData?.meta_data?.updatedBranch ||
              (user as any)?.meta_data?.branch ||
              user?.branchName ||
              '-'}
          </CellWithTooltip>
        </TableCell>
        {/* <TableCell sx={{ ...cellWithDividerStyle }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={statusTextStyles(
                (user.status === 'PENDING'
                  ? 'Pending Approval'
                  : user.status) as 'Approved' | 'Pending Approval'
              )}
            >
              {user.status === 'PENDING'
                ? 'Pending Approval'
                : user?.status || '-'}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle }}>
          {user?.activity || '-'}
        </TableCell> */}
        <TableCell sx={{ ...cellWithDividerStyle }}>
          <CellWithTooltip value={DateUtils.formatDate(user?.submittedOn)}>
            {DateUtils.formatDate(user?.submittedOn)}
          </CellWithTooltip>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle }}>
          <CellWithTooltip value={user?.submittedBy || '-'}>
            {user?.submittedBy || '-'}
          </CellWithTooltip>
        </TableCell>
      </TableRow>
    );
  };

  // Region options from Redux state
  const regionOptions = regions
    ? regions.map((region) => region.regionName)
    : [];

  // Role options - Filter based on logged-in user's group membership
  const roleOptions = userRolesData
    ? userRolesData
        .filter((roleObj) => {
          // Filter based on logged-in user's group membership
          if (
            groupMembership &&
            groupMembership.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER)
          ) {
            // Show only IU & IRA for Institutional_Admin_User
            return roleObj.role === 'IU' || roleObj.role === 'IRA';
          } else if (
            groupMembership &&
            groupMembership.includes('Institutional_Regional_Admin')
          ) {
            // Show only IBU & IRU for Institutional_Regional_Admin
            return roleObj.role === 'IBU' || roleObj.role === 'IRU';
          }
          // Default: show all roles if group membership is not recognized
          return (
            roleObj.role === 'IU' ||
            roleObj.role === 'IRA' ||
            roleObj.role === 'IBU' ||
            roleObj.role === 'IRU'
          );
        })
        .map((roleObj) => roleObj.role)
    : [];

  // Branch options from Redux state
  const branchOptions = branches
    ? branches.map(
        (branch: { branchName?: string; branchCode?: string }) =>
          branch.branchName || ''
      )
    : [];

  // Determine visibility of region and branch filters based on selected role
  const shouldShowRegionFilter =
    roleFilter === 'IRA' ||
    roleFilter === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
    roleFilter === 'IRU' ||
    roleFilter === 'INSTITUTIONAL_REGIONAL_USER' ||
    roleFilter === 'IBU' ||
    roleFilter === 'INSTITUTIONAL_BRANCH_USER' ||
    (!roleFilter &&
      (groupMembership?.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER) ||
        groupMembership?.includes('Institutional_Regional_Admin') ||
        !groupMembership));

  const shouldShowBranchFilter =
    roleFilter === 'IBU' ||
    roleFilter === 'INSTITUTIONAL_BRANCH_USER' ||
    (!roleFilter &&
      (groupMembership?.includes('Institutional_Regional_Admin') ||
        !groupMembership));

  // Debug log for branch filter visibility
  console.log('🔧 Filter visibility check:', {
    roleFilter,
    shouldShowRegionFilter,
    shouldShowBranchFilter,
    groupMembership,
    timestamp: Date.now(),
  });

  // 🐛 Create a new wrapper function to handle the SelectChangeEvent
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    console.log('status:=-===', event.target.value);
    setSearchStatus(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchRegion('');
    setSearchBranch('');
    setRoleFilter('');
    setSearchStatus('PENDING');
    setActiveSearch('');
    setActiveSearchRegion('');
    setActiveSearchBranch('');
    setActiveRoleFilter('');
    setActiveSearchStatus('PENDING');
    setPage(0);

    // Call API with cleared filters
    dispatch(
      fetchUser({
        page: 0,
        size: rowsPerPage,
        workflowType: workflowType,
        role: '',
        region: undefined,
        branch: undefined,
        search: undefined,
        status: 'PENDING',
      })
    )
      .then((action: any) => {
        if (action.payload) {
          setUserSubUserManagement(action.payload.content || []);
          setTotalElementData(action.payload.totalElements || 0);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch user data:', error);
      });
  };

  return (
    <React.Fragment>
      <MainDiv>
        {/* Back Button - Top Right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
            onClick={() => navigate(-1)}
            sx={{
              color: '#1A1A1A',
              fontFamily: 'Gilroy, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Back
          </Button>
        </Box>
        <NavigationBreadCrumb crumbsData={crumbsData} />
        <HeaderTypo>
          {actionLabel
            ? action === 'revoke-suspension'
              ? actionLabel
              : `${actionLabel} User`
            : 'User List'}
        </HeaderTypo>
      </MainDiv>

      <SearchableTable
        showStatusDropdown={false}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        tableData={processedUsers}
        columns={columns}
        renderRow={renderRow}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        searchPlaceholder="Content Search"
        order={order}
        orderBy={orderBy}
        handleRequestSort={handleRequestSort}
        showRegionDropdown={shouldShowRegionFilter}
        regionValue={searchRegion}
        handleRegionChange={handleRegionChange}
        regionOptions={regionOptions}
        showRoleDropdown={true}
        roleValue={roleFilter}
        handleRoleChange={handleRoleChange}
        roleOptions={roleOptions}
        roleLabel="Role"
        showBranchDropdown={shouldShowBranchFilter}
        branchValue={searchBranch}
        handleBranchChange={handleBranchChange}
        branchOptions={branchOptions}
        statusOptions={statusOptions}
        totalElement={totalElementData}
        handleStatusChange={handleStatusChange}
        statusValue={searchStatus}
        hideSearchButton={false}
        onClear={handleClear}
      />
    </React.Fragment>
  );
};

export default UserTab;
