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
  styled,
  Button,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SelectChangeEvent } from '@mui/material'; // Import SelectChangeEvent
import SearchableTable from '../../../../common/SearchableTable/SearchableTable';
import { cellStyles, tableRowStyles } from './RegionTab.styles';
import { AppDispatch } from '../../../../../redux/store';
import { useDispatch } from 'react-redux';
import { fetchRegions } from './slice/SubUserRegionSlice';
import {
  SubUserRegion,
  SubUserRegionSuccessResponse,
} from './types/SubUserRegion';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import DateUtils from '../../../../../utils/dateUtils';

const MainDiv = styled(Box)(() => ({
  padding: '20px 30px',
  paddingBottom: '0px',
}));

const HeaderTypo = styled(Typography)(() => ({
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '18px',
  fontWeight: 700,
  marginTop: '0px',
  marginBottom: '0px',
}));

const RegionTab: React.FC = () => {
  const { action } = useParams<{ action?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeSearchStatus, setActiveSearchStatus] = useState('');
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof SubUserRegion>('regionName');
  const [rowsPerPage] = useState(10);
  const dispatch = useDispatch<AppDispatch>();
  const [totalElementData, setTotalElementData] = useState(0);

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

  // Breadcrumb data - capitalize action for display (keep hyphen, capitalize first letter of each word)
  // Special handling for "de-activate" to show as "De-activate" (lowercase 'a')
  const actionLabel = action
    ? action.toLowerCase() === 'de-activate'
      ? 'De-activate'
      : action
          .split('-')
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join('-')
    : '';
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'Region', path: '/re/sub-user-management/region' },
    ...(actionLabel ? [{ label: actionLabel }] : []),
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
      'de-activate': 'DEACTIVATE',
      'de-activation': 'DEACTIVATE',
    };
    return actionMap[normalizedAction] || '';
  };

  // Get the activity value from URL action
  const apiActivity = getActivityFromAction(action);

  // In your parent component (e.g., in a page that uses SearchableTable)
  const statusOptions = [
    'Creation',
    'Modification',
    'De-Activation',
    'Modification',
    'Merge',
  ];

  const [regionsSubUserManagement, setRegionsSubUserManagement] = useState<
    SubUserRegion[]
  >([]);

  // Helper function to get valid search term (only if length is 0 or >= 3)
  const getValidSearchTerm = (searchValue: string): string => {
    return searchValue && searchValue.trim().length >= 3
      ? searchValue.trim()
      : '';
  };

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
      fetchRegions({
        page: 0,
        size: rowsPerPage,
        status: 'APPROVAL_PENDING',
        activity: apiActivity,
        sortField: 'submittedOn',
        sortDirection: 'desc',
        searchText: validSearchTerm || '',
      })
    )
      .then((action: any) => {
        const response = action.payload as SubUserRegionSuccessResponse;
        if (action.payload?.content) {
          setRegionsSubUserManagement(action.payload?.content);
        }
        setTotalElementData(action.payload?.totalElements);
        console.log('useEffect==', response);
      })
      .catch((error) => {
        console.error('Failed to fetch regions:', error);
      });
  }, [dispatch, rowsPerPage, apiActivity, searchTerm]);

  const processedRegions = React.useMemo(() => {
    let regions = [...regionsSubUserManagement];

    // Content search is handled by API only - no frontend filtering
    // Removed: if (activeSearch) { ... filter logic ... }

    if (activeSearchStatus) {
      const lowercasedSearchTermStatus = activeSearchStatus.toLowerCase();
      regions = regions.filter((region) =>
        region?.activity.toLowerCase().includes(lowercasedSearchTermStatus)
      );
    }
    console.log('Processing regions', regions);
    return regions.sort((a, b) => {
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

      // Handle status field - use the display status
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
    regionsSubUserManagement,
    // activeSearch removed - content search is handled by API only
    activeSearchStatus,
    orderBy,
    order,
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
      fetchRegions({
        page: 0,
        size: rowsPerPage,
        search: validSearchTerm,
        searchText: validSearchTerm || '',
        status: 'APPROVAL_PENDING',
        isUserSpecific: false,
        activity: apiActivity,
        sortField: 'submittedOn',
        sortDirection: 'desc',
      })
    )
      .then((action: any) => {
        if (action.payload?.content) {
          setRegionsSubUserManagement(action.payload?.content);
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
      fetchRegions({
        page: newPage,
        size: rowsPerPage,
        status: 'APPROVAL_PENDING',
        activity: apiActivity,
        sortField: 'submittedOn',
        sortDirection: 'desc',
        searchText: validSearchTerm || '',
      })
    )
      .then((action: any) => {
        if (action.payload?.content) {
          setRegionsSubUserManagement(action.payload?.content);
        }
        setTotalElementData(action.payload?.totalElements);
      })
      .catch((error) => {
        console.error('Failed to fetch regions:', error);
      });
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof SubUserRegion
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // 🐛 Create a new wrapper function to handle the SelectChangeEvent
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setSearchStatus(event.target.value);
  };

  const handleRowClick = (region: SubUserRegion) => {
    console.log('Row clicked - Region:', region);
    console.log('Activity:', region?.activity);
    console.log('WorkflowId:', region?.workflowId);

    if (!region?.workflowId) {
      console.error('WorkflowId is missing, cannot navigate');
      return;
    }

    const activity = region?.activity?.trim();

    // Normalize activity to handle both uppercase and title case, remove spaces and special chars
    const normalizedActivity = activity?.toUpperCase().replace(/[-\s_]/g, '');

    // Check if activity contains deactivation keywords
    if (
      normalizedActivity?.includes('DEACTIVAT') ||
      normalizedActivity === 'DEACTIVATE'
    ) {
      navigate(
        `/re/sub-user-management/region-deactivation-request/${region.workflowId}`
      );
      return;
    }

    // Check if activity contains creation keywords
    if (
      normalizedActivity?.includes('CREAT') ||
      normalizedActivity === 'CREATE'
    ) {
      navigate(
        `/re/sub-user-management/region-creation-request/${region.workflowId}`
      );
      return;
    }

    // Check if activity contains modification keywords
    if (
      normalizedActivity?.includes('MODIF') ||
      normalizedActivity === 'MODIFY'
    ) {
      navigate(
        `/re/sub-user-management/region-modification-request/${region.workflowId}`
      );
      return;
    }

    // Check if activity contains merge keywords
    if (normalizedActivity?.includes('MERGE')) {
      navigate(
        `/re/sub-user-management/region-merger-request/${region.workflowId}`
      );
      return;
    }

    // Fallback to exact match for backward compatibility
    switch (normalizedActivity) {
      case 'CREATION':
      case 'CREATE':
        navigate(
          `/re/sub-user-management/region-creation-request/${region.workflowId}`
        );
        break;
      case 'MODIFICATION':
      case 'MODIFY':
        navigate(
          `/re/sub-user-management/region-modification-request/${region.workflowId}`
        );
        break;
      case 'MERGE':
        navigate(
          `/re/sub-user-management/region-merger-request/${region.workflowId}`
        );
        break;
      case 'DEACTIVATION':
      case 'DEACTIVATE':
        navigate(
          `/re/sub-user-management/region-deactivation-request/${region.workflowId}`
        );
        break;
      default:
        console.warn('No route defined for activity:', activity);
        console.log('Available activity values:', activity);
        console.log('Normalized activity:', normalizedActivity);
    }
  };

  const columns = [
    { id: 'srNo', label: 'Sr. No.', style: { width: '10%' } },
    {
      id: 'regionName',
      label: 'Region Name',
      sortable: true,
      style: { width: '30%' },
    },
    {
      id: 'regionCode',
      label: 'Region Code',
      sortable: true,
      style: { width: '20%' },
    },
    {
      id: 'submittedOn',
      label: 'Submitted On',
      sortable: true,
      style: { width: '20%' },
    },
    {
      id: 'submittedBy',
      label: 'Submitted By',
      sortable: true,
      style: { width: '20%' },
    },
  ];

  const renderRegionRow = (region: SubUserRegion, index: number) => {
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
        key={index}
        sx={{
          ...tableRowStyles,
          cursor: 'pointer',
        }}
        onClick={() => handleRowClick(region)}
      >
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          {page * rowsPerPage + index + 1}
        </TableCell>
        <TableCell
          sx={{
            ...cellWithDividerStyle,
            textAlign: 'center',
            maxWidth: '80px',
          }}
        >
          <CellWithTooltip value={region.regionName}>
            {region.regionName && region.regionName.length > 20
              ? `${region.regionName.substring(0, 20)}...`
              : region.regionName}
          </CellWithTooltip>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          <CellWithTooltip value={region.regionCode}>
            {region.regionCode}
          </CellWithTooltip>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          <CellWithTooltip value={DateUtils.formatDate(region?.submittedOn)}>
            {DateUtils.formatDate(region?.submittedOn)}
          </CellWithTooltip>
        </TableCell>
        <TableCell sx={{ ...cellWithDividerStyle, textAlign: 'center' }}>
          <CellWithTooltip value={region?.submittedBy || '-'}>
            {region?.submittedBy || '-'}
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
        <HeaderTypo sx={{ marginTop: '10px' }}>
          {action ? `${actionLabel} Region` : 'Region List'}
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
          tableData={processedRegions}
          columns={columns}
          renderRow={renderRegionRow}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          searchPlaceholder="Content Search"
          order={order}
          orderBy={orderBy}
          handleRequestSort={handleRequestSort}
          statusOptions={statusOptions}
          totalElement={totalElementData}
          hideSearchButton={true}
        />
      </Box>
    </React.Fragment>
  );
};

export default RegionTab;
