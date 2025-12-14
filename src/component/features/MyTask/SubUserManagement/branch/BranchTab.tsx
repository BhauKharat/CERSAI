/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TableRow,
  TableCell,
  Typography,
  SxProps,
  Theme,
  SelectChangeEvent,
  styled,
  Button,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchableTable from '../../../../common/SearchableTable/SearchableTable';
import {
  cellStyles,
  // statusIndicatorStyles, // Commented out - not used after hiding Status column
  // statusTextStyles, // Commented out - not used after hiding Status column
  tableRowStyles,
} from './BranchTab.styles';
import { fetchBranch } from './slice/BranchSlice';
import { SubUserBranch, SubUserBranchSuccessResponse } from './types/Branch';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../redux/store';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import DateUtils from '../../../../../utils/dateUtils';

export type BranchStatus =
  | 'Approved'
  | 'Pending Approval'
  | 'Pending Approval [L1]';

const MainDiv = styled(Box)(() => ({
  padding: '20px 30px',
  paddingBottom: '0px',
}));

const HeaderTypo = styled(Typography)(() => ({
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '18px',
  fontWeight: 700,
  marginTop: '10px',
  marginBottom: '0px',
}));

const BranchTab: React.FC = () => {
  const { action } = useParams<{ action?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof SubUserBranch>('branchName');
  const [rowsPerPage] = useState(10); // As per image
  const dispatch = useDispatch<AppDispatch>();
  const [totalElementData, setTotalElementData] = useState(0);
  const [searchStatus, setSearchStatus] = useState('');
  const [activeSearchStatus, setActiveSearchStatus] = useState('');

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

  // Breadcrumb data - capitalize action for display
  const actionLabel = action
    ? action
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  // Format breadcrumb action label - keep hyphen for de-activate
  const breadcrumbActionLabel =
    action === 'de-activate' ? 'De-activate' : actionLabel;

  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Branch', path: '/re/sub-user-management/branch' },
    ...(breadcrumbActionLabel ? [{ label: breadcrumbActionLabel }] : []),
  ];

  const statusOptions = [
    'Creation',
    'Modification',
    'De-Activation',
    'Modification',
    'Merge',
  ];

  // Map URL action to API activity value (case-insensitive)
  const getActivityFromAction = (actionParam?: string): string => {
    if (!actionParam) return '';
    // Convert to lowercase for case-insensitive matching
    const normalizedAction = actionParam.toLowerCase();
    const actionMap: Record<string, string> = {
      create: 'CREATE',
      modify: 'MODIFY',
      modification: 'MODIFY',
      merge: 'MERGE',
      transfer: 'TRANSFER',
      'de-activate': 'DEACTIVATE',
      'de-activation': 'DEACTIVATE',
    };
    return actionMap[normalizedAction] || '';
  };

  // Get the activity value from URL action
  const apiActivity = getActivityFromAction(action);

  // State to hold the regions data from the API
  const [branchSubUserManagement, setBranchSubUserManagement] = useState<
    SubUserBranch[]
  >([]);

  // Helper function to get valid search term (only if length is 0 or >= 3)
  const getValidSearchTerm = (searchValue: string): string => {
    return searchValue && searchValue.trim().length >= 3
      ? searchValue.trim()
      : '';
  };

  // Fetch regions on component mount
  useEffect(() => {
    // Only call API if searchTerm is empty or has at least 3 characters
    if (
      searchTerm &&
      searchTerm.trim().length > 0 &&
      searchTerm.trim().length < 3
    ) {
      return; // Don't make API call if less than 3 characters
    }

    const validSearchTerm = getValidSearchTerm(searchTerm);

    dispatch(
      fetchBranch({
        page: 0,
        size: rowsPerPage,
        status: 'APPROVAL_PENDING',
        activity: apiActivity,
        sortField: 'submittedOn',
        sortDirection: 'desc',
        isUserSpecific: false,
        searchText: validSearchTerm || '',
      })
    )
      .then((action: any) => {
        // Check if the payload contains data and update state
        const response = action.payload as SubUserBranchSuccessResponse;
        if (action.payload?.content) {
          setBranchSubUserManagement(action.payload?.content);
        }
        console.log('useEffect==', response);
        setTotalElementData(action.payload?.totalElements);
      })
      .catch((error) => {
        console.error('Failed to fetch regions:', error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, rowsPerPage, action, searchTerm]);

  const processedBranches = React.useMemo(() => {
    let branches = [...branchSubUserManagement];

    // Content search is handled by API only - no frontend filtering
    // Removed: if (activeSearch) { ... filter logic ... }

    if (activeSearchStatus) {
      const lowercasedSearchTermStatus = activeSearchStatus.toLowerCase();
      branches = branches.filter((branch) =>
        branch?.activity.toLowerCase().includes(lowercasedSearchTermStatus)
      );
    }

    return branches.sort((a, b) => {
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

      // Handle status field - use the status value directly
      if (orderBy === 'status') {
        aValue = a.status || '';
        bValue = b.status || '';
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
  }, [
    // activeSearch removed - content search is handled by API only
    branchSubUserManagement,
    order,
    orderBy,
    activeSearchStatus,
  ]);

  const handleSearch = () => {
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
    setPage(0);
    dispatch(
      fetchBranch({
        page: 0,
        size: rowsPerPage,
        search: validSearchTerm,
        searchText: validSearchTerm || '',
        status: 'APPROVAL_PENDING',
        activity: apiActivity,
        sortField: 'submittedOn',
        sortDirection: 'desc',
        isUserSpecific: false,
      })
    )
      .then((action: any) => {
        if (action.payload?.content) {
          setBranchSubUserManagement(action.payload?.content);
        }
        setTotalElementData(action.payload?.totalElements);
      })
      .catch((error) => {
        console.error('Failed to fetch regions:', error);
      });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    const validSearchTerm = getValidSearchTerm(activeSearch);
    dispatch(
      fetchBranch({
        page: newPage,
        size: rowsPerPage,
        status: 'APPROVAL_PENDING',
        activity: apiActivity,
        sortField: 'submittedOn',
        isUserSpecific: false,
        sortDirection: 'desc',
        searchText: validSearchTerm || '',
      })
    )
      .then((action: any) => {
        // Check if the payload contains data and update state
        const response = action.payload as SubUserBranchSuccessResponse;
        if (action.payload?.content) {
          setBranchSubUserManagement(action.payload?.content);
        }
        console.log('useEffect==', response);
        setTotalElementData(action.payload?.totalElements);
      })
      .catch((error) => {
        console.error('Failed to fetch regions:', error);
      });
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof SubUserBranch
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setSearchStatus(event.target.value);
  };

  const handleRowClick = (branch: SubUserBranch) => {
    if (!branch?.workflowId) {
      console.error('WorkflowId is missing, cannot navigate');
      return;
    }

    const activity = branch?.activity?.trim();

    // Handle N/A activity - default to creation request
    if (
      !activity ||
      activity === 'N/A' ||
      activity === 'n/a' ||
      activity === 'NA' ||
      activity === 'na'
    ) {
      console.log('Activity is N/A, defaulting to creation request');
      navigate(
        `/re/sub-user-management/branch-creation-request/${branch.workflowId}`
      );
      return;
    }

    // Normalize activity to handle both uppercase and title case, remove spaces and special chars
    const normalizedActivity = activity?.toUpperCase().replace(/[-\s_]/g, '');
    console.log('Normalized activity for matching:', normalizedActivity);

    // Check if activity contains deactivation keywords
    if (
      normalizedActivity?.includes('DEACTIVAT') ||
      normalizedActivity === 'DEACTIVATE'
    ) {
      navigate(
        `/re/sub-user-management/branch-deactivation-request/${branch.workflowId}`
      );
      return;
    }

    // Check if activity contains creation keywords
    if (
      normalizedActivity?.includes('CREAT') ||
      normalizedActivity === 'CREATE'
    ) {
      navigate(
        `/re/sub-user-management/branch-creation-request/${branch.workflowId}`
      );
      return;
    }

    // Check if activity contains modification keywords
    if (
      normalizedActivity?.includes('MODIF') ||
      normalizedActivity === 'MODIFY'
    ) {
      navigate(
        `/re/sub-user-management/branch-modification-request/${branch.workflowId}`
      );
      return;
    }

    // Check if activity contains merge keywords
    if (normalizedActivity?.includes('MERGE')) {
      navigate(
        `/re/sub-user-management/branch-merge-request/${branch.workflowId}`
      );
      return;
    }

    // Check if activity contains transfer keywords (handle variations like TRANSFER, TRANSFERBRANCH, etc.)
    if (normalizedActivity?.includes('TRANSFER')) {
      console.log(
        'Transfer activity detected, navigating to:',
        branch.workflowId
      );
      const transferPath = `/re/sub-user-management/branch-transfer-request/${branch.workflowId}`;
      console.log('Navigation path:', transferPath);
      navigate(transferPath);
      return;
    }

    // Fallback to exact match for backward compatibility
    switch (activity) {
      case 'Creation':
      case 'creation':
      case 'CREATE':
        navigate(
          `/re/sub-user-management/branch-creation-request/${branch.workflowId}`
        );
        break;
      case 'Modification':
      case 'modification':
      case 'MODIFY':
        navigate(
          `/re/sub-user-management/branch-modification-request/${branch.workflowId}`
        );
        break;
      case 'Merge':
      case 'merge':
      case 'MERGE':
        navigate(
          `/re/sub-user-management/branch-merge-request/${branch.workflowId}`
        );
        break;
      case 'Transfer':
      case 'transfer':
      case 'TRANSFER':
        navigate(
          `/re/sub-user-management/branch-transfer-request/${branch.workflowId}`
        );
        break;
      case 'De-activation':
      case 'De-Activation':
      case 'de-activation':
      case 'DEACTIVATE':
        navigate(
          `/re/sub-user-management/branch-deactivation-request/${branch.workflowId}`
        );
        break;
      default:
        console.warn('No route defined for activity:', activity);
        console.log('Available activity values:', activity);
        console.log('Normalized activity:', normalizedActivity);
    }
  };

  const columns = [
    { id: 'srNo', label: 'Sr.No.', sortable: false },
    { id: 'branchName', label: 'Branch Name', sortable: true },
    { id: 'branchCode', label: 'Branch Code', sortable: true },
    // { id: 'status', label: 'Status', sortable: true },
    // { id: 'activity', label: 'Activity', sortable: true },
    { id: 'submittedOn', label: 'Submitted On', sortable: true },
    { id: 'submittedBy', label: 'Submitted By', sortable: true },
  ];

  const renderBranchRow = (branch: SubUserBranch, index: number) => {
    const cellWithDividerStyle: SxProps<Theme> = {
      ...cellStyles,
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

    return (
      <TableRow
        key={branch?.serialNumber || index}
        sx={{
          ...tableRowStyles,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#E4F6FF',
          },
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRowClick(branch);
        }}
      >
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          {page * rowsPerPage + index + 1}
        </TableCell>
        <TableCell sx={cellWithDividerStyle}>
          <CellWithTooltip value={branch?.branchName}>
            {branch?.branchName && branch.branchName.length > 20
              ? `${branch.branchName.substring(0, 20)}...`
              : branch?.branchName}
          </CellWithTooltip>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          <CellWithTooltip value={branch?.branchCode}>
            {branch?.branchCode}
          </CellWithTooltip>
        </TableCell>
        {/* <TableCell sx={cellWithDividerStyle}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {branch.status === 'Pending Approval' && (
              <Box sx={statusIndicatorStyles} />
            )}
            <Typography
              variant="body2"
              sx={statusTextStyles(
                branch.status as 'Approved' | 'Pending Approval'
              )}
            >
              {branch?.status}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          {branch?.activity}
        </TableCell> */}
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          <CellWithTooltip value={DateUtils.formatDate(branch?.submittedOn)}>
            {DateUtils.formatDate(branch?.submittedOn)}
          </CellWithTooltip>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          <CellWithTooltip value={branch?.submittedBy || '-'}>
            {branch?.submittedBy || '-'}
          </CellWithTooltip>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <React.Fragment>
      {/* Back Button - Top Right */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 0,
          px: 0,
          pt: 1,
        }}
      >
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
      <MainDiv>
        <NavigationBreadCrumb crumbsData={crumbsData} />
        <HeaderTypo>
          {action === 'de-activate'
            ? 'De-activate Branch'
            : action
              ? `${actionLabel} Branch`
              : 'Branch List'}
        </HeaderTypo>
      </MainDiv>

      <Box sx={{ mt: -8 }}>
        <SearchableTable
          showStatusDropdown={false}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusValue={searchStatus}
          handleStatusChange={handleStatusChange}
          handleSearch={handleSearch}
          tableData={processedBranches}
          columns={columns}
          renderRow={renderBranchRow}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          searchPlaceholder="Content Search"
          order={order}
          orderBy={orderBy}
          statusOptions={statusOptions}
          handleRequestSort={handleRequestSort}
          totalElement={totalElementData}
          hideSearchButton={true}
        />
      </Box>
    </React.Fragment>
  );
};

export default BranchTab;
