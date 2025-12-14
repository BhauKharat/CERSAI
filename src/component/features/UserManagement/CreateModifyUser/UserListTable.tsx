import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
  Box,
  Table,
  TableBody,
  FormControl,
  InputAdornment,
  SelectChangeEvent,
  Typography,
  CircularProgress,
  TextField,
  styled,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// import VisibilityIcon from '@mui/icons-material/Visibility';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { fetchSubUsers } from './slice/subUsersSlice';
import {
  fetchWorkflowPendingRequests,
  clearData as clearWorkflowData,
} from './slice/workflowPendingRequestsSlice';
import { fetchUserRoles } from './slice/userRolesSlice';
import { ApiUser } from './types/users';
import { RegionData } from './types/fetchRegionsTypes';
import { BranchData } from '../CreateModifyBranch/types/fetchBranchesTypes';
import DeactivateUserModal from './DeactivateUser/DeactivateUserModal';
import SuspendUserModal from './SuspendUser/SuspendUserModal';
import RevokeUserModal from './RevokeUser/RevokeUserModal';
import DateUtils from '../../../../utils/dateUtils';
import { USER_ROLES } from '../../../../utils/enumUtils';

import {
  StyledContainer,
  StyledPaper,
  StyledSearchContainer,
  StyledSearchBox,
  StyledSearchField,
  StyledLabel,
  StyledSearchInput,
  StyledButton,
  StyledTableContainer,
  StyledTableHead,
  StyledTableHeaderCell,
  StyledTableBody,
  StyledTableCell,
  StyledStatusIndicator,
  StyledPaginationContainer,
  StyledPaginationInfo,
  StyledPaginationButtonContainer,
  StyledPaginationButton,
  StyledStatusSelect,
  StyledStatusMenuItem,
  StyledSortableHeaderCell,
  StyledSortContainer,
  StyledSortIconContainer,
  StyledStatusFilterContainer,
  StyledMenuItem,
} from '../CreateModifyRegion/CreateModifyRegion.style';

type Props = {
  showCreateNewButton?: boolean;
  showSearchBy?: boolean;
  showStatusFilter?: boolean;
  showRegionFilter?: boolean;
  showRoleFilter?: boolean;
  showBranchFilter?: boolean;
  handleRowClick: (user: ApiUser) => void;
  isTrackStatus?: boolean;
  showContentSearch?: boolean;
  showSearchClearButtons?: boolean; // New prop to show/hide search and clear buttons
  useWorkflowData?: boolean; // New prop to use workflow pending requests data
  // Data passed from parent
  regions?: RegionData[];
  regionsLoading?: boolean;
  regionsError?: string | null;
  branches?: BranchData[];
  branchesLoading?: boolean;
  branchesError?: string | null;
  // Callbacks for parent to handle filter changes
  onRegionChange?: (regionId: string) => void;
  onBranchChange?: (branchCode: string) => void;
  defaultStatus?: 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'SUSPENDED';
};

const SearchWrapper = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  justifyContent: 'flex-end',
  margin: '20px 0',
}));

const SearchRightWrapper = styled(Box)(() => ({
  flex: 9,
}));

const SearchLeftWrapper = styled(Box)(() => ({
  flex: 3,
}));

const UserListTable: React.FC<Props> = ({
  showCreateNewButton = false,
  showSearchBy = false,
  showStatusFilter = false,
  showBranchFilter = false,
  showRoleFilter = false,
  showRegionFilter = false,
  handleRowClick,
  isTrackStatus,
  showContentSearch = true,
  defaultStatus = 'ACTIVE',
  showSearchClearButtons = true, // Default to true
  regions = [],
  regionsLoading = false,
  regionsError = null,
  branches = [],
  branchesLoading = false,
  branchesError = null,
  onRegionChange,
  onBranchChange,
  useWorkflowData = false, // Default to false
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

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

  // Get auth state for group membership
  const authState = useSelector((state: RootState) => state.auth);
  const groupMembership = authState?.groupMembership;

  // Get regular subUsers data
  const {
    data: subUsersData,
    totalElements: subUsersTotalElements,
    totalPages: subUsersTotalPages,
    error: subUsersError,
  } = useSelector((state: RootState) => state.subUsers);

  // Get workflow pending requests data
  const {
    data: workflowData,
    totalElements: workflowTotalElements,
    totalPages: workflowTotalPages,
    error: workflowError,
    loading: workflowLoading,
  } = useSelector((state: RootState) => state.workflowPendingRequests);

  // Helper function to map workflow_type to display text
  const getActivityLabel = (workflowType: string): string => {
    const activityMap: Record<string, string> = {
      RE_USER_CREATION: 'Creation',
      RE_USER_MODIFICATION: 'Modification',
      RE_USER_DEACTIVATION: 'De-activation',
      RE_USER_SUSPENSION: 'Suspension',
      RE_USER_SUSPENSION_REVOKE: 'Revoke Suspension',
    };
    return activityMap[workflowType] || workflowType;
  };

  // Helper function to format submitted by as "role - name"
  const formatSubmittedBy = (
    role: string | undefined,
    name: string | undefined
  ): string => {
    if (!role && !name) return '-';
    if (!role) return name || '-';
    if (!name) return role;
    return `${role} - ${name}`;
  };

  // Select the appropriate data source based on useWorkflowData prop
  // Memoize to prevent recreation on every render which can cause duplicates
  // Also ensure we use a fresh array and remove any potential duplicates
  const users: ApiUser[] = useMemo(() => {
    if (useWorkflowData) {
      // Use a Set to track unique workflow IDs to prevent duplicates
      const seenWorkflowIds = new Set<string>();
      return workflowData
        .filter((item) => {
          // Filter out duplicates based on workflow_id
          if (seenWorkflowIds.has(item.workflow_id)) {
            return false;
          }
          seenWorkflowIds.add(item.workflow_id);
          return true;
        })
        .map((item, index) => {
          // Get userId from userDetails, meta_data or concernedUserDetails (may not be in types but exists in API response)
          const userDetailsAny = item.payload?.userDetails as
            | { userId?: string }
            | undefined;
          const metaDataAny = item.meta_data as { userId?: string } | undefined;
          const concernedUserDetailsAny = item.payload?.concernedUserDetails as
            | { userId?: string }
            | undefined;
          const actualUserId =
            userDetailsAny?.userId ||
            metaDataAny?.userId ||
            concernedUserDetailsAny?.userId ||
            '-'; // Show "-" if userId not available

          return {
            srNo: index + 1,
            userId: actualUserId,
            workflowId: item.workflow_id, // Store workflow_id for key when userId is "-"
            emailAddress:
              item.meta_data?.email || item.payload?.userDetails?.email || '',
            mobileNumber:
              item.meta_data?.mobile || item.payload?.userDetails?.mobile || '',
            userName: item.meta_data?.username || '',
            username: item.meta_data?.username || '',
            designation: item.payload?.userDetails?.designation || '',
            region: item.meta_data?.region?.trim() || '', // Get from meta_data
            regionCode: item.payload?.userDetails?.regionCode?.trim() || '', // Get regionCode from payload userDetails
            branch: item.meta_data?.branch?.trim() || '', // Get from meta_data
            role: item.meta_data?.role || item.payload?.userDetails?.role || '',
            citizenship: item.payload?.userDetails?.citizenship || '', // Add citizenship from payload
            status: (item.payload?.approvalWorkflow?.approvalStatus ||
              item.status ||
              'PENDING') as 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING',
            createdAt:
              item.payload?.initiatorDetails?.actionDateTime || item.created_at,
            updatedAt: item.updated_at,
            lastUpdatedOn: item.meta_data?.lastActionOn || item.updated_at,
            lastUpdatedBy:
              item.payload?.initiatorDetails?.actionByUserName ||
              item.meta_data?.lastActionBy ||
              '',
            workflowType: item.workflow_type, // Store workflow_type for activity display
            submittedByRole: item.payload?.initiatorDetails?.actionByUserRole,
            submittedByName: item.payload?.initiatorDetails?.actionByUserName,
            workflowData: {
              ...item,
              workflowId: item.workflow_id,
              activity: item.workflow_type,
              status: item.status,
              submittedBy: item.payload?.initiatorDetails?.actionByUserName,
              submittedOn: item.payload?.initiatorDetails?.actionDateTime,
            }, // Store complete workflow item for navigation
          };
        });
    }
    return subUsersData;
  }, [useWorkflowData, workflowData, subUsersData]);

  const totalElements = useWorkflowData
    ? workflowTotalElements
    : subUsersTotalElements;
  const totalPages = useWorkflowData ? workflowTotalPages : subUsersTotalPages;

  // Get user roles from Redux
  const userRolesData = useSelector((state: RootState) => state.userRoles.data);
  const userRolesLoading = useSelector(
    (state: RootState) => state.userRoles.loading
  );
  const userRolesError = useSelector(
    (state: RootState) => state.userRoles.error
  );

  // Helper function to get role label - show actual value or -
  const getRoleLabel = (roleValue: string): string => {
    // Return - if role is not available or empty
    if (!roleValue || roleValue.trim() === '') {
      return '-';
    }

    // Return the actual role value from API
    return roleValue;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'APPROVED' | 'REJECTED' | 'ACTIVE' | 'SUSPENDED'
  >(defaultStatus);
  const [regionFilter, setRegionFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [selectedUser] = useState<ApiUser | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  const [contentSearchTerm, setContentSearchTerm] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to get valid search term (min 3 characters)
  const getValidSearchTerm = useCallback((searchValue: string): string => {
    // Only return search term if it has at least 3 characters, otherwise return empty string
    return searchValue && searchValue.trim().length >= 3
      ? searchValue.trim()
      : '';
  }, []);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<
    | 'userName'
    | 'userId'
    | 'role'
    | 'region'
    | 'branch'
    | 'lastUpdatedOn'
    | 'lastUpdatedBy'
    | 'status'
    | 'activity'
    | 'submittedOn'
    | 'submittedBy'
    | null
  >(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch user roles on component mount
  useEffect(() => {
    dispatch(fetchUserRoles());
  }, [dispatch]);

  const handleSearch = (searchValue?: string) => {
    const currentSearchTerm =
      searchValue !== undefined ? searchValue : contentSearchTerm;

    console.log('🔍 Search button clicked');
    console.log('Current filters:', {
      statusFilter,
      regionFilter,
      branchFilter,
      roleFilter,
      contentSearchTerm: currentSearchTerm,
      searchTerm,
    });

    setPage(0);
    if (useWorkflowData) {
      const validSearchTerm = getValidSearchTerm(currentSearchTerm);
      dispatch(
        fetchWorkflowPendingRequests({
          filters: [
            {
              operation: 'AND',
              filters: {
                workflow_type: [
                  'RE_USER_CREATION',
                  'RE_USER_MODIFICATION',
                  'RE_USER_SUSPENSION',
                  'RE_USER_SUSPENSION_REVOKE',
                  'RE_USER_DEACTIVATION',
                ],
                status: ['PENDING', 'APPROVED', 'REJECTED'],
              },
            },
          ],
          page: 0, // 0-based pagination
          pageSize: rowsPerPage,
          isPendingRequestAPI: false,
          sortBy: 'created_at',
          sortDesc: true,
          search: validSearchTerm || undefined,
        })
      );
    } else {
      // Use region name and branch name directly (not codes)
      const regionName = regionFilter || undefined;
      const branchName = branchFilter || undefined;
      // Determine userType array based on roleFilter or groupMembership
      let userTypeArray: string[] | undefined = undefined;
      if (roleFilter && roleFilter.trim() !== '') {
        // If role filter is selected, send that single role as array
        userTypeArray = [roleFilter];
      } else {
        // If no role filter, determine based on groupMembership
        if (
          groupMembership &&
          groupMembership.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER)
        ) {
          // Institutional_Admin_User sees IU and IRA
          userTypeArray = ['IU', 'IRA'];
        } else if (
          groupMembership &&
          groupMembership.includes('Institutional_Regional_Admin')
        ) {
          // Institutional_Regional_Admin sees IRU and IBU
          userTypeArray = ['IRU', 'IBU'];
        }
        // If groupMembership doesn't match, userTypeArray remains undefined
        // and will not be included in the filters
      }

      // Map statusFilter to operationalStatus: SUSPENDED -> SUSPENDED, ACTIVE -> ACTIVE, others -> undefined
      const operationalStatus: 'ACTIVE' | 'SUSPENDED' | undefined =
        statusFilter === 'SUSPENDED'
          ? 'SUSPENDED'
          : statusFilter === 'ACTIVE'
            ? 'ACTIVE'
            : undefined;

      const validSearchTerm = getValidSearchTerm(currentSearchTerm);

      const payload = {
        size: rowsPerPage,
        page: 0,
        operationalStatus: operationalStatus,
        search: validSearchTerm || searchTerm || undefined,
        region: regionName,
        branch: branchName,
        userType: userTypeArray,
      };

      console.log('📤 Dispatching fetchSubUsers with payload:', payload);
      console.log(
        '📤 Branch in payload:',
        payload.branch,
        '(type:',
        typeof payload.branch,
        ')'
      );
      dispatch(fetchSubUsers(payload));
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<unknown>) => {
    const newStatus = event.target.value as
      | 'APPROVED'
      | 'REJECTED'
      | 'ACTIVE'
      | 'SUSPENDED';
    console.log('📊 Status changed:', newStatus);
    setStatusFilter(newStatus);
    setPage(0);
    // Don't call API here - wait for search button
  };

  const handleRegionChange = (event: SelectChangeEvent<unknown>) => {
    const regionName = event.target.value as string;
    console.log('🌍 Region changed:', regionName);
    setRegionFilter(regionName);
    console.log('🔄 Resetting branch filter to empty');
    setBranchFilter(''); // Reset branch when region changes
    setPage(0);

    // Find the selected region to get its ID and notify parent
    const selectedRegionData = regions.find((r) => r.regionName === regionName);
    console.log('Selected region data:', selectedRegionData);
    if (selectedRegionData && onRegionChange) {
      console.log(
        '🔔 Calling onRegionChange with regionId:',
        selectedRegionData.id
      );
      onRegionChange(selectedRegionData.id);
    }
    // Don't call API here - wait for search button
  };

  const handleRoleChange = (event: SelectChangeEvent<unknown>) => {
    const selectedRole = event.target.value as string;
    console.log('👤 Role changed:', selectedRole);
    setRoleFilter(selectedRole);
    setPage(0);

    // Reset region and branch filters when role changes
    setRegionFilter('');
    setBranchFilter('');

    // Don't call API here - wait for search button
  };

  const handleBranchChange = (event: SelectChangeEvent<unknown>) => {
    const branchName = event.target.value as string;
    console.log('🏢 Branch changed to:', branchName);
    console.log('🏢 Current branchFilter before change:', branchFilter);
    setBranchFilter(branchName);
    console.log('🏢 Branch filter set to:', branchName);
    setPage(0);

    // Find the selected branch to get its code and notify parent
    const selectedBranchData = branches.find(
      (b) => b.branchName === branchName
    );
    console.log('🏢 Selected branch data:', selectedBranchData);
    console.log('🏢 Available branches:', branches);
    if (selectedBranchData && onBranchChange) {
      onBranchChange(selectedBranchData.branchCode);
    }
    // Don't call API here - wait for search button
  };

  const handleClearFilters = () => {
    console.log('🧹 Clearing all filters');
    setSearchTerm('');
    setRoleFilter('');
    setRegionFilter('');
    setBranchFilter('');
    setContentSearchTerm('');
    setPage(0);
    // Note: statusFilter is NOT reset - it preserves the defaultStatus

    // Directly dispatch with cleared parameters instead of relying on state
    if (useWorkflowData) {
      dispatch(
        fetchWorkflowPendingRequests({
          filters: [
            {
              operation: 'AND',
              filters: {
                workflow_type: [
                  'RE_USER_CREATION',
                  'RE_USER_MODIFICATION',
                  'RE_USER_SUSPENSION',
                  'RE_USER_SUSPENSION_REVOKE',
                  'RE_USER_DEACTIVATION',
                ],
                status: ['PENDING', 'APPROVED', 'REJECTED'],
              },
            },
          ],
          page: 0, // 0-based pagination
          pageSize: rowsPerPage,
          isPendingRequestAPI: false,
          sortBy: 'created_at',
          sortDesc: true,
          search: undefined,
        })
      );
    } else {
      // Dispatch with all filters cleared except statusFilter (preserves defaultStatus)
      let userTypeArray: string[] | undefined = undefined;
      if (
        groupMembership &&
        groupMembership.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER)
      ) {
        userTypeArray = ['IU', 'IRA'];
      } else if (
        groupMembership &&
        groupMembership.includes('Institutional_Regional_Admin')
      ) {
        userTypeArray = ['IRU', 'IBU'];
      }

      // Map statusFilter to operationalStatus: SUSPENDED -> SUSPENDED, ACTIVE -> ACTIVE, others -> undefined
      // Same mapping as in handleSearch
      const operationalStatus: 'ACTIVE' | 'SUSPENDED' | undefined =
        statusFilter === 'SUSPENDED'
          ? 'SUSPENDED'
          : statusFilter === 'ACTIVE'
            ? 'ACTIVE'
            : undefined;

      const payload = {
        size: rowsPerPage,
        page: 0,
        operationalStatus: operationalStatus,
        search: undefined,
        region: undefined,
        branch: undefined,
        userType: userTypeArray,
      };

      console.log(
        '📤 Dispatching fetchSubUsers with cleared filters:',
        payload
      );
      dispatch(fetchSubUsers(payload));
    }
  };

  // Fetch users only on initial load and page change
  useEffect(() => {
    const fetchUsersData = () => {
      const validSearchTerm = getValidSearchTerm(contentSearchTerm);

      if (useWorkflowData) {
        // Clear existing data before fetching to prevent accumulation
        dispatch(clearWorkflowData());
        // Fetch workflow pending requests
        dispatch(
          fetchWorkflowPendingRequests({
            filters: [
              {
                operation: 'AND',
                filters: {
                  workflow_type: [
                    'RE_USER_CREATION',
                    'RE_USER_MODIFICATION',
                    'RE_USER_SUSPENSION',
                    'RE_USER_SUSPENSION_REVOKE',
                    'RE_USER_DEACTIVATION',
                  ],
                  status: ['PENDING', 'APPROVED', 'REJECTED'],
                },
              },
            ],
            page: page, // API uses 0-based pagination
            pageSize: rowsPerPage,
            isPendingRequestAPI: false,
            sortBy: 'created_at',
            sortDesc: true,
            search: validSearchTerm || undefined,
          })
        );
      } else {
        // Convert regionName to regionCode if regionFilter is set
        let regionCode: string = '';
        if (regionFilter && regions.length > 0) {
          const selectedRegion = regions.find(
            (r) => r.regionName === regionFilter
          );
          regionCode = selectedRegion?.regionCode || '';
        }

        // Convert branchName to branchCode if branchFilter is set
        let branchCode: string = '';
        if (branchFilter && branches.length > 0) {
          const selectedBranch = branches.find(
            (b) => b.branchName === branchFilter
          );
          branchCode = selectedBranch?.branchCode || '';
        }

        // Determine userType array based on roleFilter or groupMembership
        let userTypeArray: string[] | undefined = undefined;
        if (roleFilter && roleFilter.trim() !== '') {
          // If role filter is selected, send that single role as array
          userTypeArray = [roleFilter];
        } else {
          // If no role filter, determine based on groupMembership
          if (
            groupMembership &&
            groupMembership.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER)
          ) {
            // Institutional_Admin_User sees IU and IRA
            userTypeArray = ['IU', 'IRA'];
          } else if (
            groupMembership &&
            groupMembership.includes('Institutional_Regional_Admin')
          ) {
            // Institutional_Regional_Admin sees IRU and IBU
            userTypeArray = ['IRU', 'IBU'];
          }
          // If groupMembership doesn't match, userTypeArray remains undefined
          // and will not be included in the filters
        }

        // Fetch regular sub users
        // Map statusFilter to operationalStatus: SUSPENDED -> SUSPENDED, ACTIVE -> ACTIVE, others -> undefined
        const operationalStatus: 'ACTIVE' | 'SUSPENDED' | undefined =
          statusFilter === 'SUSPENDED'
            ? 'SUSPENDED'
            : statusFilter === 'ACTIVE'
              ? 'ACTIVE'
              : undefined;

        dispatch(
          fetchSubUsers({
            size: rowsPerPage,
            page: page,
            operationalStatus: operationalStatus,
            search: validSearchTerm || searchTerm || undefined,
            region: regionCode || undefined,
            branch: branchCode || undefined,
            userType: userTypeArray,
          })
        );
      }
    };

    // Only fetch data on initial mount and page change
    // Filter changes will only trigger API call via Search button
    fetchUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    page,
    rowsPerPage,
    // Removed filter dependencies - they will only trigger API via Search button
    // statusFilter, searchTerm, contentSearchTerm, regionFilter, roleFilter, branchFilter
  ]);

  // const handleClickAction = (
  //   event: React.MouseEvent<HTMLButtonElement>,
  //   user: ApiUser
  // ) => {
  //   // Only navigate if user status is APPROVED
  //   if (user.status === 'APPROVED') {
  //     navigate(`/re/modify-user/${user.userId}`, {
  //       state: { userId: user.userId },
  //     });
  //   }

  //   if (user.status === 'SUSPENDED') {
  //     navigate(`/re/suspend-user/${user.userId}`, {
  //       state: { userId: user.userId },
  //     });
  //   }
  // };

  const handleCreateNew = () => {
    navigate('/re/create-new-user');
  };

  // Display users directly from API - server-side pagination and filtering
  // All search is handled by backend API, no client-side filtering
  // Memoize to prevent recreation on every render
  const displayUsers = useMemo(() => users || [], [users]);

  // Handle sorting
  const handleSort = (
    column:
      | 'userName'
      | 'userId'
      | 'role'
      | 'region'
      | 'branch'
      | 'lastUpdatedOn'
      | 'lastUpdatedBy'
      | 'status'
      | 'activity'
      | 'submittedOn'
      | 'submittedBy'
  ) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Apply sorting to filtered users
  // Memoize to prevent recreation on every render
  const sortedUsers = useMemo(() => {
    return [...displayUsers].sort((a, b) => {
      if (!sortColumn) return 0;

      let aValue: string | number = '';
      let bValue: string | number = '';
      let comparison: number;

      switch (sortColumn) {
        case 'userName':
          aValue = a.username || '';
          bValue = b.username || '';
          comparison = aValue.localeCompare(bValue);
          break;
        case 'userId':
          aValue = a.userId || '';
          bValue = b.userId || '';
          comparison = aValue.localeCompare(bValue);
          break;
        case 'role':
          aValue = a.role || '';
          bValue = b.role || '';
          comparison = aValue.localeCompare(bValue);
          break;
        case 'region':
          aValue = a.region || '';
          bValue = b.region || '';
          comparison = aValue.localeCompare(bValue);
          break;
        case 'branch':
          aValue = a.branch || '';
          bValue = b.branch || '';
          comparison = aValue.localeCompare(bValue);
          break;
        case 'lastUpdatedOn': {
          // Compare dates - convert to timestamps for comparison
          const aDate = new Date(a.lastUpdatedOn || 0).getTime();
          const bDate = new Date(b.lastUpdatedOn || 0).getTime();
          comparison = aDate - bDate;
          break;
        }
        case 'lastUpdatedBy':
          aValue = a.lastUpdatedBy || '';
          bValue = b.lastUpdatedBy || '';
          comparison = aValue.localeCompare(bValue);
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          comparison = aValue.localeCompare(bValue);
          break;
        case 'activity':
          aValue = a.workflowType || '';
          bValue = b.workflowType || '';
          comparison = aValue.localeCompare(bValue);
          break;
        case 'submittedOn': {
          // Compare dates - convert to timestamps for comparison
          const aDate = new Date(a.createdAt || 0).getTime();
          const bDate = new Date(b.createdAt || 0).getTime();
          comparison = aDate - bDate;
          break;
        }
        case 'submittedBy': {
          // Compare by submitted by name, fallback to role
          const aSubmittedBy =
            formatSubmittedBy(a.submittedByRole, a.submittedByName) || '';
          const bSubmittedBy =
            formatSubmittedBy(b.submittedByRole, b.submittedByName) || '';
          comparison = aSubmittedBy.localeCompare(bSubmittedBy);
          break;
        }
        default:
          return 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [displayUsers, sortColumn, sortDirection]);

  const displayTotalElements = totalElements || 0;
  const displayTotalPages = totalPages || 0;

  const emptyRows = Math.max(0, rowsPerPage - sortedUsers.length);

  // Check if there's an error or loading
  const hasError = useWorkflowData ? workflowError : subUsersError;
  const isLoading = useWorkflowData ? workflowLoading : false;
  // Don't show "No records" message while loading - prevents flickering during pagination
  const showNoDataMessage =
    !isLoading && (hasError || (sortedUsers.length === 0 && !hasError));

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // Helper function to calculate which page numbers to display
  const getPageNumbers = (
    currentPage: number,
    totalPages: number
  ): number[] => {
    const maxPagesToShow = 4;

    if (totalPages <= maxPagesToShow) {
      // If total pages is 4 or less, show all pages
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    // Calculate start page
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));

    // Adjust if we're near the end
    if (startPage + maxPagesToShow > totalPages) {
      startPage = totalPages - maxPagesToShow;
    }

    // Generate array of page numbers
    return Array.from({ length: maxPagesToShow }, (_, i) => startPage + i);
  };

  return (
    <StyledContainer maxWidth={false}>
      {/* Back Button */}
      {/* <Box sx={backButtonContainerStyles}>
        <IconButton onClick={handleBack} sx={backButtonStyles}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={backTextStyles}>
          Back
        </Typography>
      </Box> */}

      {/* Search and Filter Section */}
      <StyledPaper elevation={0} className="search-paper">
        <StyledSearchContainer>
          <StyledSearchBox>
            {showSearchBy && (
              <StyledSearchField>
                <StyledLabel variant="subtitle2">Search by</StyledLabel>
                <Box sx={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <TextField
                    placeholder="Enter username / user ID / email address"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    fullWidth
                    sx={StyledSearchInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: StyledSearchInput,
                    }}
                  />
                  <StyledButton
                    variant="contained"
                    onClick={() => handleSearch()}
                  >
                    Search
                  </StyledButton>
                </Box>
              </StyledSearchField>
            )}

            {showStatusFilter && (
              <StyledStatusFilterContainer>
                <StyledLabel variant="subtitle2">Status</StyledLabel>
                <FormControl variant="outlined" size="small" fullWidth>
                  <StyledStatusSelect
                    value={statusFilter}
                    onChange={handleStatusChange}
                    label=""
                  >
                    <StyledStatusMenuItem value="APPROVED">
                      Approved
                    </StyledStatusMenuItem>
                    <StyledStatusMenuItem value="REJECTED">
                      Rejected
                    </StyledStatusMenuItem>
                    <StyledStatusMenuItem value="SUSPENDED">
                      Suspended
                    </StyledStatusMenuItem>
                  </StyledStatusSelect>
                </FormControl>
              </StyledStatusFilterContainer>
            )}

            {showRoleFilter && (
              <StyledStatusFilterContainer>
                <StyledLabel variant="subtitle2">Role</StyledLabel>
                <FormControl variant="outlined" size="small" fullWidth>
                  <StyledStatusSelect
                    value={roleFilter}
                    onChange={handleRoleChange}
                    label=""
                    displayEmpty
                  >
                    <StyledMenuItem value="">All Roles</StyledMenuItem>
                    {userRolesLoading ? (
                      <StyledMenuItem value="" disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading roles...
                      </StyledMenuItem>
                    ) : userRolesError ? (
                      <StyledMenuItem value="" disabled>
                        Error loading roles
                      </StyledMenuItem>
                    ) : userRolesData && userRolesData.length > 0 ? (
                      userRolesData
                        .filter((roleObj) => {
                          // Filter based on logged-in user's group membership
                          if (
                            groupMembership &&
                            groupMembership.includes(
                              USER_ROLES.INSTITUTIONAL_ADMIN_USER
                            )
                          ) {
                            // Show only IU & IRA for Institutional_Admin_User
                            return (
                              roleObj.role === 'IU' || roleObj.role === 'IRA'
                            );
                          } else if (
                            groupMembership &&
                            groupMembership.includes(
                              'Institutional_Regional_Admin'
                            )
                          ) {
                            // Show only IBU & IRU for Institutional_Regional_Admin
                            return (
                              roleObj.role === 'IBU' || roleObj.role === 'IRU'
                            );
                          }
                          // Default: show all roles if group membership is not recognized
                          return (
                            roleObj.role === 'IU' ||
                            roleObj.role === 'IRA' ||
                            roleObj.role === 'IBU' ||
                            roleObj.role === 'IRU'
                          );
                        })
                        .map((roleObj) => (
                          <StyledMenuItem
                            key={roleObj.role}
                            value={roleObj.role}
                          >
                            {roleObj.role}
                          </StyledMenuItem>
                        ))
                    ) : (
                      <StyledMenuItem value="" disabled>
                        No roles available
                      </StyledMenuItem>
                    )}
                  </StyledStatusSelect>
                </FormControl>
              </StyledStatusFilterContainer>
            )}

            {/* Region Filter - Conditionally shown based on selected role (same as create-new-user) */}
            {showRegionFilter && (
              <StyledStatusFilterContainer
                sx={{
                  visibility:
                    roleFilter === 'IRA' ||
                    roleFilter === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
                    roleFilter === 'IRU' ||
                    roleFilter === 'INSTITUTIONAL_REGIONAL_USER' ||
                    roleFilter === 'IBU' ||
                    roleFilter === 'INSTITUTIONAL_BRANCH_USER' ||
                    (!roleFilter &&
                      (groupMembership?.includes('Institutional_Admin_User') ||
                        groupMembership?.includes(
                          'Institutional_Regional_Admin'
                        ) ||
                        !groupMembership))
                      ? 'visible'
                      : 'hidden',
                  opacity:
                    roleFilter === 'IRA' ||
                    roleFilter === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
                    roleFilter === 'IRU' ||
                    roleFilter === 'INSTITUTIONAL_REGIONAL_USER' ||
                    roleFilter === 'IBU' ||
                    roleFilter === 'INSTITUTIONAL_BRANCH_USER' ||
                    (!roleFilter &&
                      (groupMembership?.includes('Institutional_Admin_User') ||
                        groupMembership?.includes(
                          'Institutional_Regional_Admin'
                        ) ||
                        !groupMembership))
                      ? 1
                      : 0,
                  height:
                    roleFilter === 'IRA' ||
                    roleFilter === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
                    roleFilter === 'IRU' ||
                    roleFilter === 'INSTITUTIONAL_REGIONAL_USER' ||
                    roleFilter === 'IBU' ||
                    roleFilter === 'INSTITUTIONAL_BRANCH_USER' ||
                    (!roleFilter &&
                      (groupMembership?.includes('Institutional_Admin_User') ||
                        groupMembership?.includes(
                          'Institutional_Regional_Admin'
                        ) ||
                        !groupMembership))
                      ? 'auto'
                      : 0,
                  overflow: 'hidden',
                }}
              >
                <StyledLabel variant="subtitle2">Region</StyledLabel>
                <FormControl variant="outlined" size="small" fullWidth>
                  <StyledStatusSelect
                    value={regionFilter}
                    onChange={handleRegionChange}
                    label=""
                    disabled={regionsLoading}
                    displayEmpty
                  >
                    <StyledMenuItem value="">All Regions</StyledMenuItem>
                    {regionsLoading ? (
                      <StyledMenuItem value="" disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading...
                      </StyledMenuItem>
                    ) : regionsError ? (
                      <StyledMenuItem value="" disabled>
                        Error loading regions
                      </StyledMenuItem>
                    ) : (
                      Array.isArray(regions) &&
                      regions.map((region: RegionData) => (
                        <StyledMenuItem
                          key={region.regionCode}
                          value={region.regionName}
                        >
                          {region.regionName}
                        </StyledMenuItem>
                      ))
                    )}
                  </StyledStatusSelect>
                </FormControl>
              </StyledStatusFilterContainer>
            )}

            {/* Branch Filter - Conditionally shown based on selected role (only for IBU, same as create-new-user) */}
            {showBranchFilter && (
              <StyledStatusFilterContainer
                sx={{
                  visibility:
                    roleFilter === 'IBU' ||
                    roleFilter === 'INSTITUTIONAL_BRANCH_USER'
                      ? 'visible'
                      : 'hidden',
                  opacity:
                    roleFilter === 'IBU' ||
                    roleFilter === 'INSTITUTIONAL_BRANCH_USER'
                      ? 1
                      : 0,
                  height:
                    roleFilter === 'IBU' ||
                    roleFilter === 'INSTITUTIONAL_BRANCH_USER'
                      ? 'auto'
                      : 0,
                  overflow: 'hidden',
                }}
              >
                <StyledLabel variant="subtitle2">Branch</StyledLabel>
                <FormControl variant="outlined" size="small" fullWidth>
                  <StyledStatusSelect
                    value={branchFilter}
                    onChange={handleBranchChange}
                    label=""
                    disabled={branchesLoading || !regionFilter}
                    displayEmpty
                  >
                    <StyledMenuItem value="">All Branches</StyledMenuItem>
                    {branchesError ? (
                      <StyledMenuItem value="" disabled>
                        Error loading branches
                      </StyledMenuItem>
                    ) : (
                      Array.isArray(branches) &&
                      branches.map((branch: BranchData) => (
                        <StyledMenuItem
                          key={branch.branchCode}
                          value={branch.branchName}
                        >
                          {branch.branchName}
                        </StyledMenuItem>
                      ))
                    )}
                  </StyledStatusSelect>
                </FormControl>
              </StyledStatusFilterContainer>
            )}
            {showSearchClearButtons && (
              <>
                <StyledButton
                  variant="contained"
                  onClick={() => handleSearch()}
                >
                  Search
                </StyledButton>

                <StyledButton
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{
                    backgroundColor: 'white',
                    color: '#002CBA',
                    borderColor: '#002CBA',
                    height: '40px',
                    padding: '0 24px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      borderColor: '#001f8e',
                    },
                    '@media (max-width: 768px)': {
                      height: '44px',
                      padding: '0 16px',
                    },
                  }}
                >
                  Clear
                </StyledButton>
              </>
            )}
          </StyledSearchBox>

          {showCreateNewButton && (
            <StyledButton variant="contained" onClick={handleCreateNew}>
              Create New
            </StyledButton>
          )}
        </StyledSearchContainer>

        <SearchWrapper>
          <SearchRightWrapper></SearchRightWrapper>

          <SearchLeftWrapper>
            {showContentSearch && (
              <TextField
                placeholder="Enter Content Search"
                variant="outlined"
                sx={StyledSearchInput}
                size="small"
                value={contentSearchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setContentSearchTerm(value);

                  // Clear existing timeout
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }

                  // Debounce search - wait 500ms after user stops typing
                  searchTimeoutRef.current = setTimeout(() => {
                    if (value.trim().length >= 3 || value.trim().length === 0) {
                      setPage(0);
                      handleSearch(value); // Pass the current value directly
                    }
                  }, 500);
                }}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ marginRight: '0px' }}
                    >
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    ...StyledSearchInput,
                    '& .MuiInputBase-input': {
                      paddingLeft: '4px',
                    },
                  },
                }}
              />
            )}
          </SearchLeftWrapper>
        </SearchWrapper>
      </StyledPaper>

      {/* Table Section */}
      <StyledPaper elevation={0}>
        <StyledTableContainer>
          <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
            {!isTrackStatus ? (
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '16%' }} />
              </colgroup>
            ) : (
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
            )}
            <TableHead>
              <StyledTableHead>
                <StyledTableHeaderCell>Sr.No.</StyledTableHeaderCell>
                <StyledSortableHeaderCell
                  onClick={() => handleSort('userName')}
                >
                  <StyledSortContainer>
                    User Name
                    <StyledSortIconContainer>
                      <UnfoldMoreIcon />
                    </StyledSortIconContainer>
                  </StyledSortContainer>
                </StyledSortableHeaderCell>
                <StyledSortableHeaderCell onClick={() => handleSort('userId')}>
                  <StyledSortContainer>
                    User ID
                    <StyledSortIconContainer>
                      <UnfoldMoreIcon />
                    </StyledSortIconContainer>
                  </StyledSortContainer>
                </StyledSortableHeaderCell>
                <StyledSortableHeaderCell onClick={() => handleSort('role')}>
                  <StyledSortContainer>
                    Role
                    <StyledSortIconContainer>
                      <UnfoldMoreIcon />
                    </StyledSortIconContainer>
                  </StyledSortContainer>
                </StyledSortableHeaderCell>
                <StyledSortableHeaderCell onClick={() => handleSort('region')}>
                  <StyledSortContainer>
                    Region
                    <StyledSortIconContainer>
                      <UnfoldMoreIcon />
                    </StyledSortIconContainer>
                  </StyledSortContainer>
                </StyledSortableHeaderCell>
                <StyledSortableHeaderCell onClick={() => handleSort('branch')}>
                  <StyledSortContainer>
                    Branch
                    <StyledSortIconContainer>
                      <UnfoldMoreIcon />
                    </StyledSortIconContainer>
                  </StyledSortContainer>
                </StyledSortableHeaderCell>

                {!isTrackStatus && (
                  <StyledSortableHeaderCell
                    onClick={() => handleSort('lastUpdatedOn')}
                  >
                    <StyledSortContainer>
                      Last Updated On
                      <StyledSortIconContainer>
                        <UnfoldMoreIcon />
                      </StyledSortIconContainer>
                    </StyledSortContainer>
                  </StyledSortableHeaderCell>
                )}

                {!isTrackStatus && (
                  <StyledSortableHeaderCell
                    onClick={() => handleSort('lastUpdatedBy')}
                  >
                    <StyledSortContainer>
                      Last Updated By
                      <StyledSortIconContainer>
                        <UnfoldMoreIcon />
                      </StyledSortIconContainer>
                    </StyledSortContainer>
                  </StyledSortableHeaderCell>
                )}

                {isTrackStatus && (
                  <StyledSortableHeaderCell
                    onClick={() => handleSort('status')}
                  >
                    <StyledSortContainer>
                      Status
                      <StyledSortIconContainer>
                        <UnfoldMoreIcon />
                      </StyledSortIconContainer>
                    </StyledSortContainer>
                  </StyledSortableHeaderCell>
                )}

                {isTrackStatus && (
                  <StyledSortableHeaderCell
                    onClick={() => handleSort('activity')}
                  >
                    <StyledSortContainer>
                      Activity
                      <StyledSortIconContainer>
                        <UnfoldMoreIcon />
                      </StyledSortIconContainer>
                    </StyledSortContainer>
                  </StyledSortableHeaderCell>
                )}

                {isTrackStatus && (
                  <StyledSortableHeaderCell
                    onClick={() => handleSort('submittedOn')}
                  >
                    <StyledSortContainer>
                      Submitted On
                      <StyledSortIconContainer>
                        <UnfoldMoreIcon />
                      </StyledSortIconContainer>
                    </StyledSortContainer>
                  </StyledSortableHeaderCell>
                )}

                {isTrackStatus && (
                  <StyledSortableHeaderCell
                    onClick={() => handleSort('submittedBy')}
                  >
                    <StyledSortContainer>
                      Submitted By
                      <StyledSortIconContainer>
                        <UnfoldMoreIcon />
                      </StyledSortIconContainer>
                    </StyledSortContainer>
                  </StyledSortableHeaderCell>
                )}

                {/* <StyledTableHeaderCell>Action</StyledTableHeaderCell> */}
              </StyledTableHead>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <StyledTableCell
                    colSpan={isTrackStatus ? 10 : 10}
                    align="center"
                    sx={{
                      py: 4,
                    }}
                  >
                    <CircularProgress size={30} />
                  </StyledTableCell>
                </TableRow>
              ) : showNoDataMessage ? (
                <TableRow>
                  <StyledTableCell
                    colSpan={isTrackStatus ? 10 : 10}
                    align="center"
                    sx={{
                      py: 4,
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '16px',
                      color: '#666',
                    }}
                  >
                    {hasError ? 'No data found' : 'No records to display'}
                  </StyledTableCell>
                </TableRow>
              ) : (
                <>
                  {sortedUsers.map((user, index) => {
                    // Create a unique key combining userId and workflowId
                    // This ensures uniqueness even when multiple workflows exist for the same user
                    const userWithWorkflow = user as ApiUser & {
                      workflowId?: string;
                    };
                    const uniqueKey = userWithWorkflow.workflowId
                      ? `workflow-${userWithWorkflow.workflowId}`
                      : user.userId !== '-'
                        ? `user-${user.userId}-${index}`
                        : `row-${index}`;

                    return (
                      <StyledTableBody
                        onClick={() => handleRowClick(user)}
                        key={uniqueKey}
                      >
                        <StyledTableCell>
                          {String(page * rowsPerPage + index + 1).padStart(
                            2,
                            '0'
                          )}
                        </StyledTableCell>
                        <StyledTableCell>
                          <CellWithTooltip value={user.username || '-'}>
                            {user.username && user.username.length > 20
                              ? `${user.username.substring(0, 20)}...`
                              : user.username || '-'}
                          </CellWithTooltip>
                        </StyledTableCell>
                        <StyledTableCell>
                          <CellWithTooltip value={user.userId || '-'}>
                            {user.userId || '-'}
                          </CellWithTooltip>
                        </StyledTableCell>
                        <StyledTableCell>
                          <CellWithTooltip value={getRoleLabel(user.role)}>
                            {getRoleLabel(user.role)}
                          </CellWithTooltip>
                        </StyledTableCell>
                        <StyledTableCell>
                          <CellWithTooltip
                            value={
                              user.role === 'IRU'
                                ? user.region || user.regionCode || '-'
                                : user.region || '-'
                            }
                          >
                            {user.role === 'IRU'
                              ? user.region || user.regionCode || '-'
                              : user.region || '-'}
                          </CellWithTooltip>
                        </StyledTableCell>
                        <StyledTableCell>
                          <CellWithTooltip value={user.branch || '-'}>
                            {user.branch || '-'}
                          </CellWithTooltip>
                        </StyledTableCell>

                        {!isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={
                                user.lastUpdatedOn
                                  ? DateUtils.formatDate(user.lastUpdatedOn)
                                  : '-'
                              }
                            >
                              {user.lastUpdatedOn
                                ? DateUtils.formatDate(user.lastUpdatedOn)
                                : '-'}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {!isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip value={user.lastUpdatedBy || '-'}>
                              {user.lastUpdatedBy || '-'}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {isTrackStatus && (
                          <StyledTableCell>
                            <StyledStatusIndicator
                              status={
                                user.status === 'APPROVED'
                                  ? 'Approved'
                                  : user.status === 'PENDING'
                                    ? 'Approval Pending'
                                    : user.status === 'REJECTED'
                                      ? 'Rejected'
                                      : undefined
                              }
                            >
                              <Box className="status-dot" />
                              <Typography
                                variant="body2"
                                className="status-text"
                              >
                                {user.status === 'APPROVED'
                                  ? 'Approved'
                                  : user.status === 'SUSPENDED'
                                    ? 'Suspended'
                                    : user.status === 'PENDING'
                                      ? 'Approval Pending'
                                      : user.status === 'REJECTED'
                                        ? 'Rejected'
                                        : user.status}
                              </Typography>
                            </StyledStatusIndicator>
                          </StyledTableCell>
                        )}

                        {isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={
                                user.workflowType
                                  ? getActivityLabel(user.workflowType)
                                  : '-'
                              }
                            >
                              {user.workflowType
                                ? getActivityLabel(user.workflowType)
                                : '-'}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={
                                user.createdAt
                                  ? DateUtils.formatDate(user.createdAt)
                                  : '-'
                              }
                            >
                              {user.createdAt
                                ? DateUtils.formatDate(user.createdAt)
                                : '-'}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={formatSubmittedBy(
                                user.submittedByRole,
                                user.submittedByName
                              )}
                            >
                              {formatSubmittedBy(
                                user.submittedByRole,
                                user.submittedByName
                              )}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {/* <StyledTableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleClickAction(e, user)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </StyledTableCell> */}
                      </StyledTableBody>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <StyledTableCell colSpan={10} />
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </StyledPaper>

      {/* Pagination */}
      <StyledPaginationContainer>
        <StyledPaginationInfo variant="body2">
          Showing data{' '}
          {Math.min((page + 1) * rowsPerPage, displayTotalElements)} of{' '}
          {displayTotalElements}
        </StyledPaginationInfo>

        <StyledPaginationButtonContainer>
          <StyledPaginationButton
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, page - 1)}
            disabled={page === 0}
            isDisabled={page === 0}
          >
            &lt; Previous
          </StyledPaginationButton>

          {getPageNumbers(page, displayTotalPages).map((pageNumber) => (
            <StyledPaginationButton
              key={pageNumber}
              variant={page === pageNumber ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleChangePage(null, pageNumber)}
              isActive={page === pageNumber}
              className="page-button"
            >
              {pageNumber + 1}
            </StyledPaginationButton>
          ))}

          <StyledPaginationButton
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, page + 1)}
            disabled={page >= displayTotalPages - 1}
            isDisabled={page >= displayTotalPages - 1}
          >
            Next &gt;
          </StyledPaginationButton>
        </StyledPaginationButtonContainer>
      </StyledPaginationContainer>

      {/* Deactivate User Modal */}
      <DeactivateUserModal
        open={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        userId={selectedUser?.userId || ''}
      />

      {/* Suspend Branch Modal */}
      <SuspendUserModal
        open={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        userId={selectedUser?.userId || ''}
      />

      {/* Revoke Suspension Modal */}
      <RevokeUserModal
        open={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        userId={selectedUser?.userId || ''}
      />
    </StyledContainer>
  );
};

export default UserListTable;
