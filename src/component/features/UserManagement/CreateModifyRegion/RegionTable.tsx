import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../redux/store';
import { fetchRegions, setPageNumber } from './slice/regionSlice';
import {
  fetchRegionWorkflows,
  setPageNumber as setWorkflowPageNumber,
} from './slice/regionWorkflowSlice';
import { Region as ApiRegion } from './types/region';
import { RegionWorkflow } from './types/regionWorkflow';
import {
  TextField,
  Table,
  TableBody,
  TableHead,
  FormControl,
  InputAdornment,
  SelectChangeEvent,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DateUtils from '../../../../utils/dateUtils';
import { formatActivity } from '../../../../utils/enumUtils';

import {
  StyledSearchContainer,
  StyledSearchBox,
  StyledSearchField,
  StyledSearchInput,
  StyledButton,
  StyledTableHead,
  StyledTableBody,
  StyledTableCell,
  StyledContainer,
  StyledPaper,
  StyledTableContainer,
  StyledStatusIndicator,
  StyledPaginationContainer,
  StyledPaginationInfo,
  StyledPaginationButton,
  // StyledIconButton,
  StyledLabel,
  StyledSearchFieldContainer,
  StyledStatusSelect,
  StyledStatusMenuItem,
  StyledBackButton,
  StyledBackButtonContainer,
  StyledStatusFilterContainer,
  StyledButtonContainer,
  StyledCreateButton,
  StyledSerialHeaderCell,
  StyledSortableHeaderCell,
  StyledSortContainer,
  StyledSortIconContainer,
  StyledPaginationButtonContainer,
  tableColumnWidths,
  mobileTableColumnWidths,
} from './CreateModifyRegion.style';
import SearchIcon from '@mui/icons-material/Search';
// import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Map API region to component region for compatibility
interface Region {
  id: number;
  name: string;
  code: string;
  status: 'Approved' | 'Rejected' | 'Approval Pending';
  workflowId?: string; // Optional workflowId for track status to uniquely identify workflows
}

const mapApiRegionToRegion = (
  apiRegion: ApiRegion | null | undefined,
  index: number
): Region | null => {
  if (!apiRegion) return null;
  return {
    id: index + 1, // Use index as ID since API doesn't provide numeric ID
    name: apiRegion.regionName || '',
    code: apiRegion.regionCode || '',
    status:
      apiRegion.status === 'REJECTED' || apiRegion.status === 'Rejected'
        ? 'Rejected'
        : apiRegion.status === 'SUBMITTED_PENDING_APPROVAL'
          ? 'Approval Pending'
          : 'Approved',
  };
};

// Map workflow to region for track status
const mapWorkflowToRegion = (
  workflow: RegionWorkflow | null | undefined,
  index: number
): Region | null => {
  if (!workflow) return null;
  return {
    id: index + 1,
    name: workflow.regionName || '',
    code: workflow.regionCode || '',
    status:
      workflow.status === 'APPROVAL_PENDING'
        ? 'Approval Pending'
        : workflow.status === 'REJECTED'
          ? 'Rejected'
          : 'Approved',
    workflowId: workflow.workflowId, // Store workflowId to uniquely identify each workflow
  };
};

type Props = {
  showBackButton: boolean;
  showSearchFilter: boolean;
  showStatusFilter: boolean;
  showCreateNewButton: boolean;
  showContentSearch: boolean;
  handleRowClick: (
    id: number,
    regionCode: string,
    status?: string,
    regionData?: ApiRegion,
    workflowData?: RegionWorkflow
  ) => void;
  isTrackStatus: boolean;
  isDeactivate?: boolean;
};

const RegionTable: React.FC<Props> = ({
  showBackButton,
  showSearchFilter,
  showCreateNewButton,
  showStatusFilter,
  showContentSearch,
  handleRowClick,
  isTrackStatus,
  isDeactivate = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  // Redux state
  const {
    regions: apiRegions,
    totalPages: apiTotalPages,
    totalElements,
    pageNumber: apiPageNumber,
    error,
  } = useSelector((state: RootState) => state.region);

  // Redux state for workflows (track status)
  const {
    workflows: apiWorkflows,
    totalPages: workflowTotalPages,
    totalElements: workflowTotalElements,
    pageNumber: workflowPageNumber,
    error: workflowError,
  } = useSelector((state: RootState) => state.regionWorkflow);

  const [searchTerm, setSearchTerm] = useState('');

  const [contentSearchTerm, setContentSearchTerm] = useState<string>('');

  // Helper function to get valid search term (min 3 characters)
  const getValidSearchTerm = useCallback((searchValue: string): string => {
    // Only return search term if it has at least 3 characters, otherwise return empty string
    return searchValue && searchValue.trim().length >= 3
      ? searchValue.trim()
      : '';
  }, []);

  // const [filteredRows, setFilteredRows] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'Approved' | 'Rejected' | 'SUBMITTED_PENDING_APPROVAL' | ''
  >('');
  const [rowsPerPage] = useState(10); // Match API default
  const [sortField, setSortField] = useState<
    | 'name'
    | 'code'
    | 'lastUpdatedOn'
    | 'lastUpdatedBy'
    | 'status'
    | 'activity'
    | 'submittedOn'
    | 'submittedBy'
    | null
  >(isTrackStatus ? 'submittedOn' : null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Ref to track if we're currently sorting to prevent useEffect interference
  const isSortingRef = useRef(false);

  const getApiSortField = useCallback(
    (
      field:
        | 'name'
        | 'code'
        | 'lastUpdatedOn'
        | 'lastUpdatedBy'
        | 'status'
        | 'activity'
        | 'submittedOn'
        | 'submittedBy'
        | null
    ): string => {
      if (!field) return isTrackStatus ? 'submittedOn' : 'createdAt';
      const fieldMap: Record<string, string> = {
        name: 'name',
        code: 'code',
        lastUpdatedOn: isDeactivate ? 'updatedAt' : 'updatedAt',
        lastUpdatedBy: isDeactivate ? 'updatedBy' : 'updatedBy',
        status: 'status',
        activity: 'activity',
        submittedOn: 'submittedOn',
        submittedBy: 'submittedBy',
      };
      return fieldMap[field] || 'createdAt';
    },
    [isTrackStatus, isDeactivate]
  );

  const regions: Region[] = useMemo(() => {
    const mappedRegions = isTrackStatus
      ? (apiWorkflows || [])
          .filter(Boolean)
          .map(mapWorkflowToRegion)
          .filter((region): region is Region => region !== null)
      : (apiRegions || [])
          .filter(Boolean)
          .map(mapApiRegionToRegion)
          .filter((region): region is Region => region !== null);

    console.log('Regions array calculated:', {
      isTrackStatus,
      apiRegionsLength: apiRegions?.length || 0,
      apiWorkflowsLength: apiWorkflows?.length || 0,
      mappedRegionsLength: mappedRegions.length,
      isSorting: isSortingRef.current,
    });

    return mappedRegions;
  }, [isTrackStatus, apiRegions, apiWorkflows]);

  // Use appropriate pagination values based on mode
  const currentPageNumber = isTrackStatus ? workflowPageNumber : apiPageNumber;
  const currentTotalPages = isTrackStatus ? workflowTotalPages : apiTotalPages;
  const currentTotalElements = isTrackStatus
    ? workflowTotalElements
    : totalElements;
  const currentError = isTrackStatus ? workflowError : error;

  // Use appropriate column widths based on screen size
  const columnWidths = isMobile ? mobileTableColumnWidths : tableColumnWidths;

  // Fetch regions or workflows on component mount and when status filter changes
  // Note: sortField and sortDirection are handled by handleSort, not here
  useEffect(() => {
    // Don't run if we're currently sorting (handleSort will handle the API call)
    if (isSortingRef.current) {
      return;
    }

    // Don't call API if contentSearchTerm has less than 3 characters (and is not empty)
    if (
      contentSearchTerm &&
      contentSearchTerm.trim().length > 0 &&
      contentSearchTerm.trim().length < 3
    ) {
      return; // Don't make API call if less than 3 characters
    }

    // Only call API if contentSearchTerm is empty or has at least 3 characters
    const validSearchTerm = getValidSearchTerm(contentSearchTerm);

    if (isTrackStatus) {
      // Fetch workflows for track status
      dispatch(
        fetchRegionWorkflows({
          page: 0,
          size: rowsPerPage,
          searchText: validSearchTerm,
          status: '',
          sortField: getApiSortField(sortField),
          sortDirection: sortDirection,
        })
      );
    } else {
      // Fetch regular regions
      dispatch(
        fetchRegions({
          page: 0,
          size: rowsPerPage,
          search: validSearchTerm,
          status: statusFilter ? statusFilter.toUpperCase() : 'ACTIVE',
          sortField: getApiSortField(sortField),
          sortDirection: sortDirection,
        })
      );
    }
  }, [
    dispatch,
    rowsPerPage,
    statusFilter,
    isTrackStatus,
    sortField,
    sortDirection,
    getApiSortField,
    contentSearchTerm,
    getValidSearchTerm,
    // isSortingRef check prevents double API calls when handleSort is called
  ]);

  // Handle error clearing
  useEffect(() => {
    if (currentError) {
      console.error('Region/Workflow fetch error:', currentError);
    }
  }, [currentError]);

  const handleSearch = () => {
    const searchValue = contentSearchTerm || searchTerm || '';

    // Don't call API if search term has less than 3 characters (and is not empty)
    if (
      searchValue &&
      searchValue.trim().length > 0 &&
      searchValue.trim().length < 3
    ) {
      return; // Don't make API call if less than 3 characters
    }

    // Only search if contentSearchTerm has at least 3 characters or is empty
    const validSearchTerm = getValidSearchTerm(searchValue);

    // Reset to first page when searching
    if (isTrackStatus) {
      dispatch(setWorkflowPageNumber(0));
      dispatch(
        fetchRegionWorkflows({
          page: 0,
          size: rowsPerPage,
          searchText: validSearchTerm,
          status: '',
          sortField: getApiSortField(sortField),
          sortDirection: sortDirection,
        })
      );
    } else {
      dispatch(setPageNumber(0));
      dispatch(
        fetchRegions({
          page: 0,
          size: rowsPerPage,
          search: validSearchTerm,
          status: statusFilter ? statusFilter.toUpperCase() : 'ACTIVE',
          sortField: 'createdAt',
          sortDirection: 'desc',
        })
      );
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value || '';
    setSearchTerm(value);

    // If search term is cleared, reload data without search filter
    if (value === '') {
      const validSearchTerm = getValidSearchTerm(contentSearchTerm);
      if (isTrackStatus) {
        dispatch(setWorkflowPageNumber(0));
        dispatch(
          fetchRegionWorkflows({
            page: 0,
            size: rowsPerPage,
            searchText: validSearchTerm,
            status: '',
            sortField: getApiSortField(sortField),
            sortDirection: sortDirection,
          })
        );
      } else {
        dispatch(setPageNumber(0));
        dispatch(
          fetchRegions({
            page: 0,
            size: rowsPerPage,
            search: validSearchTerm,
            status: statusFilter ? statusFilter.toUpperCase() : 'ACTIVE',
            sortField: 'createdAt',
            sortDirection: 'desc',
          })
        );
      }
    }
    // Don't call API if search term has less than 3 characters (and is not empty)
    // The useEffect will handle the API call when contentSearchTerm changes
  };

  const handleStatusChange = (e: SelectChangeEvent<unknown>) => {
    const newStatus = (e?.target?.value || '') as 'Approved' | 'Rejected';
    setStatusFilter(newStatus);
    // Reset to first page when changing status filter
    dispatch(setPageNumber(0));
    dispatch(
      fetchRegions({
        page: 0,
        size: rowsPerPage,
        search: searchTerm,
        status: newStatus.toUpperCase(),
        sortField: 'createdAt',
        sortDirection: 'desc',
      })
    );
  };

  // const handleClickAction = (
  //   event: React.MouseEvent<HTMLButtonElement>,
  //   region: Region
  // ) => {
  //   // Only allow navigation for approved regions
  //   if (region.status === 'Approved') {
  //     navigate(`/re/modify-region/${region.code}`, {
  //       state: { regionId: region.id },
  //     });
  //   }
  // };

  const handleCreateNew = () => {
    navigate('/re/create-new-region');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Note: Filtering is now handled by the API via contentSearchTerm parameter
  // Client-side filtering removed since API handles it
  const sortedRegions = regions;

  const handleSort = (
    field:
      | 'name'
      | 'code'
      | 'lastUpdatedOn'
      | 'lastUpdatedBy'
      | 'status'
      | 'activity'
      | 'submittedOn'
      | 'submittedBy'
  ) => {
    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    const newSortField = field;

    // Set flag to prevent useEffect from interfering
    isSortingRef.current = true;

    // Trigger API call with new sort parameters
    const apiSortField = getApiSortField(newSortField);

    console.log('Sort clicked:', {
      field,
      newSortField,
      newDirection,
      apiSortField,
      searchTerm,
      statusFilter,
      currentRegionsCount: isTrackStatus
        ? apiWorkflows.length
        : apiRegions.length,
      apiRegionsLength: apiRegions.length,
      apiWorkflowsLength: apiWorkflows.length,
    });

    const searchValue = contentSearchTerm || searchTerm || '';

    // Don't call API if search term has less than 3 characters (and is not empty)
    if (
      searchValue &&
      searchValue.trim().length > 0 &&
      searchValue.trim().length < 3
    ) {
      // Reset flag even if we don't make API call
      isSortingRef.current = false;
      return; // Don't make API call if less than 3 characters
    }

    const validSearchTerm = getValidSearchTerm(searchValue);

    if (isTrackStatus) {
      dispatch(setWorkflowPageNumber(0));
      dispatch(
        fetchRegionWorkflows({
          page: 0,
          size: rowsPerPage,
          searchText: validSearchTerm,
          status: '',
          sortField: apiSortField,
          sortDirection: newDirection,
        })
      )
        .then(() => {
          // Reset flag after API call completes
          isSortingRef.current = false;
        })
        .catch(() => {
          // Reset flag even on error
          isSortingRef.current = false;
        });
    } else {
      dispatch(setPageNumber(0));
      dispatch(
        fetchRegions({
          page: 0,
          size: rowsPerPage,
          search: validSearchTerm,
          status: statusFilter ? statusFilter.toUpperCase() : 'ACTIVE',
          sortField: apiSortField,
          sortDirection: newDirection,
        })
      )
        .then(() => {
          // Reset flag after API call completes
          isSortingRef.current = false;
        })
        .catch(() => {
          // Reset flag even on error
          isSortingRef.current = false;
        });
    }

    // Update state after dispatching API call
    setSortField(newSortField);
    setSortDirection(newDirection);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    const searchValue = contentSearchTerm || searchTerm || '';

    // Don't call API if search term has less than 3 characters (and is not empty)
    if (
      searchValue &&
      searchValue.trim().length > 0 &&
      searchValue.trim().length < 3
    ) {
      return; // Don't make API call if less than 3 characters
    }

    const validSearchTerm = getValidSearchTerm(searchValue);

    if (isTrackStatus) {
      dispatch(setWorkflowPageNumber(newPage));
      dispatch(
        fetchRegionWorkflows({
          page: newPage,
          size: rowsPerPage,
          searchText: validSearchTerm,
          status: '',
          sortField: getApiSortField(sortField),
          sortDirection: sortDirection,
        })
      );
    } else {
      dispatch(setPageNumber(newPage));
      dispatch(
        fetchRegions({
          page: newPage,
          size: rowsPerPage,
          search: validSearchTerm,
          status: statusFilter ? statusFilter.toUpperCase() : 'ACTIVE',
          sortField: getApiSortField(sortField),
          sortDirection: sortDirection,
        })
      );
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      {/* Back Button */}

      {showBackButton && (
        <StyledBackButtonContainer>
          <StyledBackButton
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </StyledBackButton>
        </StyledBackButtonContainer>
      )}

      {/* Search and Filter Section */}
      <StyledPaper className="search-paper">
        <StyledSearchContainer>
          <StyledSearchBox>
            {showSearchFilter && (
              <StyledSearchField>
                <StyledLabel variant="subtitle2">Search by</StyledLabel>
                <StyledSearchFieldContainer>
                  <TextField
                    placeholder="Region name or code"
                    variant="outlined"
                    sx={StyledSearchInput}
                    size="small"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: StyledSearchInput,
                    }}
                  />
                  <StyledButton variant="contained" onClick={handleSearch}>
                    Search
                  </StyledButton>
                </StyledSearchFieldContainer>
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
                    <StyledStatusMenuItem value="Approved">
                      Approved
                    </StyledStatusMenuItem>
                    <StyledStatusMenuItem value="Rejected">
                      Rejected
                    </StyledStatusMenuItem>
                  </StyledStatusSelect>
                </FormControl>
              </StyledStatusFilterContainer>
            )}
          </StyledSearchBox>

          {showCreateNewButton && (
            <StyledButtonContainer>
              <StyledCreateButton variant="contained" onClick={handleCreateNew}>
                Create New
              </StyledCreateButton>
            </StyledButtonContainer>
          )}

          {showContentSearch && (
            <React.Fragment>
              <StyledSearchField>
                <StyledSearchFieldContainer>
                  <TextField
                    placeholder="Content Search"
                    variant="outlined"
                    sx={StyledSearchInput}
                    size="small"
                    value={contentSearchTerm || ''}
                    onChange={(e) =>
                      setContentSearchTerm(e?.target?.value || '')
                    }
                    // onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                </StyledSearchFieldContainer>
              </StyledSearchField>
            </React.Fragment>
          )}
        </StyledSearchContainer>
      </StyledPaper>

      {/* Table Section */}
      <StyledPaper>
        <StyledTableContainer>
          <Table>
            <colgroup>
              <col style={{ width: columnWidths.serial }} />
              <col style={{ width: columnWidths.name }} />
              <col style={{ width: columnWidths.code }} />
              {isTrackStatus && <col style={{ width: columnWidths.status }} />}
              {isTrackStatus && (
                <col style={{ width: columnWidths.activity }} />
              )}
              {isTrackStatus && (
                <col style={{ width: columnWidths.submittedOn }} />
              )}
              {isTrackStatus && (
                <col style={{ width: columnWidths.submittedBy }} />
              )}
              {!isTrackStatus && (
                <col style={{ width: columnWidths.lastUpdatedOn }} />
              )}
              {!isTrackStatus && (
                <col style={{ width: columnWidths.lastUpdatedBy }} />
              )}
            </colgroup>
            <TableHead>
              <StyledTableHead>
                <StyledSerialHeaderCell>Sr. No.</StyledSerialHeaderCell>
                <StyledSortableHeaderCell onClick={() => handleSort('name')}>
                  <StyledSortContainer>
                    Region Name
                    <StyledSortIconContainer>
                      <UnfoldMoreIcon fontSize="small" />
                    </StyledSortIconContainer>
                  </StyledSortContainer>
                </StyledSortableHeaderCell>
                <StyledSortableHeaderCell onClick={() => handleSort('code')}>
                  <StyledSortContainer>
                    Region Code
                    <StyledSortIconContainer>
                      <UnfoldMoreIcon fontSize="small" />
                    </StyledSortIconContainer>
                  </StyledSortContainer>
                </StyledSortableHeaderCell>

                {isTrackStatus && (
                  <StyledSortableHeaderCell
                    onClick={() => handleSort('status')}
                  >
                    <StyledSortContainer>
                      Status
                      <StyledSortIconContainer>
                        <UnfoldMoreIcon fontSize="small" />
                      </StyledSortIconContainer>
                    </StyledSortContainer>
                  </StyledSortableHeaderCell>
                )}

                {!isTrackStatus && (
                  <StyledSortableHeaderCell
                    onClick={() => handleSort('lastUpdatedOn')}
                  >
                    <StyledSortContainer>
                      Last Updated On
                      <StyledSortIconContainer>
                        <UnfoldMoreIcon fontSize="small" />
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
                        <UnfoldMoreIcon fontSize="small" />
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
                        <UnfoldMoreIcon fontSize="small" />
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
                        <UnfoldMoreIcon fontSize="small" />
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
                        <UnfoldMoreIcon fontSize="small" />
                      </StyledSortIconContainer>
                    </StyledSortContainer>
                  </StyledSortableHeaderCell>
                )}

                {/* <StyledTableHeaderCell>Action</StyledTableHeaderCell> */}
              </StyledTableHead>
            </TableHead>
            <TableBody>
              {sortedRegions.length === 0
                ? (() => {
                    console.log('⚠️ No data found - Debug info:', {
                      sortedRegionsLength: sortedRegions.length,
                      regionsLength: regions.length,
                      apiRegionsLength: apiRegions?.length || 0,
                      apiWorkflowsLength: apiWorkflows?.length || 0,
                      isTrackStatus,
                      contentSearchTerm,
                      isSorting: isSortingRef.current,
                    });
                    return (
                      <StyledTableBody>
                        <StyledTableCell
                          colSpan={isTrackStatus ? 7 : 5}
                          align="center"
                          sx={{ textAlign: 'center' }}
                        >
                          <Typography variant="body1" color="textSecondary">
                            No data found
                          </Typography>
                        </StyledTableCell>
                      </StyledTableBody>
                    );
                  })()
                : sortedRegions.map((region: Region, index: number) => {
                    // Find the original API region or workflow data
                    const originalRegionData = isTrackStatus
                      ? undefined
                      : (apiRegions || []).find(
                          (apiRegion) => apiRegion?.regionCode === region?.code
                        );
                    // For track status, match workflow by workflowId to ensure correct workflow is found
                    // even when multiple workflows have the same regionCode
                    const originalWorkflowData = isTrackStatus
                      ? (apiWorkflows || []).find(
                          (workflow) =>
                            workflow?.workflowId === region?.workflowId
                        ) || undefined
                      : undefined;

                    return (
                      <StyledTableBody
                        key={region.id}
                        onClick={() =>
                          handleRowClick(
                            region.id,
                            region.code,
                            region.status,
                            originalRegionData,
                            originalWorkflowData
                          )
                        }
                      >
                        <StyledTableCell>
                          {currentPageNumber * rowsPerPage + index + 1}
                        </StyledTableCell>
                        <StyledTableCell>
                          <CellWithTooltip value={region.name}>
                            {region.name && region.name.length > 20
                              ? `${region.name.substring(0, 20)}...`
                              : region.name}
                          </CellWithTooltip>
                        </StyledTableCell>
                        <StyledTableCell>
                          <CellWithTooltip value={region.code}>
                            {region.code}
                          </CellWithTooltip>
                        </StyledTableCell>

                        {isTrackStatus && (
                          <StyledTableCell>
                            <StyledStatusIndicator status={region.status}>
                              <Typography
                                variant="body2"
                                className="status-text"
                              >
                                {region.status}
                              </Typography>
                            </StyledStatusIndicator>
                          </StyledTableCell>
                        )}

                        {!isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={DateUtils.formatDate(
                                originalRegionData?.lastUpdatedOn
                              )}
                            >
                              {DateUtils.formatDate(
                                originalRegionData?.lastUpdatedOn
                              )}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {!isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={originalRegionData?.lastUpdatedBy || '-'}
                            >
                              {originalRegionData?.lastUpdatedBy || '-'}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={formatActivity(
                                originalWorkflowData?.activity
                              )}
                            >
                              {formatActivity(originalWorkflowData?.activity)}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={DateUtils.formatDate(
                                originalWorkflowData?.submittedOn || null
                              )}
                            >
                              {DateUtils.formatDate(
                                originalWorkflowData?.submittedOn || null
                              )}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}

                        {isTrackStatus && (
                          <StyledTableCell>
                            <CellWithTooltip
                              value={originalWorkflowData?.submittedBy || '-'}
                            >
                              {originalWorkflowData?.submittedBy || '-'}
                            </CellWithTooltip>
                          </StyledTableCell>
                        )}
                      </StyledTableBody>
                    );
                  })}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </StyledPaper>

      {/* Pagination */}
      <StyledPaginationContainer>
        <StyledPaginationInfo variant="body2">
          Showing data {Math.min(rowsPerPage, sortedRegions.length)} of{' '}
          {currentTotalElements}
        </StyledPaginationInfo>

        <StyledPaginationButtonContainer>
          <StyledPaginationButton
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, currentPageNumber - 1)}
            disabled={currentPageNumber === 0}
            isDisabled={currentPageNumber === 0}
          >
            &lt; Previous
          </StyledPaginationButton>

          {Array.from(
            { length: Math.min(4, currentTotalPages || 1) },
            (_, i) => {
              const pageNumber = i;
              return (
                <StyledPaginationButton
                  key={pageNumber}
                  variant={
                    currentPageNumber === pageNumber ? 'contained' : 'outlined'
                  }
                  size="small"
                  onClick={() => handleChangePage(null, pageNumber)}
                  isActive={currentPageNumber === pageNumber}
                  className="page-button"
                >
                  {pageNumber + 1}
                </StyledPaginationButton>
              );
            }
          )}

          <StyledPaginationButton
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, currentPageNumber + 1)}
            disabled={currentPageNumber >= currentTotalPages - 1}
            isDisabled={currentPageNumber >= currentTotalPages - 1}
          >
            Next &gt;
          </StyledPaginationButton>
        </StyledPaginationButtonContainer>
      </StyledPaginationContainer>
    </StyledContainer>
  );
};

export default RegionTable;
