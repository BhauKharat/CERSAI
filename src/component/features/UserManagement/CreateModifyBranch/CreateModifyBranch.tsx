import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { fetchBranches } from './slice/branchSlice';
import { fetchBranchWorkflows } from './slice/branchWorkflowSlice';
import DeactivateBranchModal from './DeactivateBranchModal/DeactivateBranchModal';

import {
  Box,
  Paper,
  Container,
  TextField,
  Button,
  MenuItem,
  // IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputAdornment,
  SelectChangeEvent,
  Typography,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  containerStyles,
  paperStyles,
  searchContainerStyles,
  searchInputContainerStyles,
  searchLabelStyles,
  searchInputWrapperStyles,
  textFieldStyles,
  buttonStyles,
  tableHeadRowStyles,
  tableCellStyles,
  tableBodyStyles,
  tableRowStyles,
  cellStyles,
  statusContainerStyles,
  statusFilterContainerStyles,
  statusFilterLabelStyles,
  statusTextStyles,
  paginationContainerStyles,
  paginationTextStyles,
  paginationButtonContainerStyles,
  paginationButtonStyles,
  pageButtonStyles,
  menuItemStyles,
  // actionButtonStyles,
  // actionCellStyles,
  selectStyles,
  createNewButtonStyles,
  tableColumnStyles,
  searchFilterRowStyles,
  tableContainerStyles,
  backButtonStyles,
  headerContainerStyles,
} from './CreateModifyBranch.styles';
import DateUtils from '../../../../utils/dateUtils';
import { formatActivity } from '../../../../utils/enumUtils';

// import { Branch } from './types/branch';
import {
  StyledSearchField,
  StyledSearchFieldContainer,
  StyledSearchInput,
} from '../CreateModifyRegion/CreateModifyRegion.style';
import { Branch } from './types/branch';

type Props = {
  showBackButton: boolean;
  showSearchFilter: boolean;
  showStatusFilter: boolean;
  showCreateNewButton: boolean;
  showContentSearch: boolean;
  handleRowClick: (branchCode: string, branch: Branch, status?: string) => void;
  isTrackStatus: boolean;
};

// Status mapping from API to display
const getDisplayStatus = (
  apiStatus: string
): 'Approved' | 'Rejected' | 'Approval Pending' => {
  switch (apiStatus) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'SUBMITTED_PENDING_APPROVAL':
    case 'APPROVAL_PENDING':
      return 'Approval Pending';
    default:
      return 'Approval Pending';
  }
};

// Status mapping from display to API
const getApiStatus = (displayStatus: 'Approved' | 'Rejected' | ''): string => {
  switch (displayStatus) {
    case 'Approved':
      return 'ACTIVE';
    case 'Rejected':
      return 'REJECTED';
    default:
      return '';
  }
};

const CreateModifyBranch: React.FC<Props> = ({
  showBackButton,
  showSearchFilter,
  showStatusFilter,
  showCreateNewButton,
  showContentSearch,
  handleRowClick,
  isTrackStatus,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { branches, totalPages, totalElements } = useSelector(
    (state: RootState) => state.branch
  );
  const {
    workflows: branchWorkflows,
    totalPages: branchWorkflowTotalPages,
    totalElements: branchWorkflowTotalElements,
  } = useSelector((state: RootState) => state.branchWorkflow);

  const [contentSearchTerm, setContentSearchTerm] = useState('');

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

  // Helper function to get valid search term (min 3 characters)
  const getValidSearchTerm = useCallback((searchValue: string): string => {
    // Only return search term if it has at least 3 characters, otherwise return empty string
    return searchValue && searchValue.trim().length >= 3
      ? searchValue.trim()
      : '';
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'Approved' | 'Rejected' | ''
  >('Approved');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const handleSearch = () => {
    console.log('Search triggered with term:', searchTerm);

    // Don't call API if search term has less than 3 characters (and is not empty)
    if (
      searchTerm &&
      searchTerm.trim().length > 0 &&
      searchTerm.trim().length < 3
    ) {
      return; // Don't make API call if less than 3 characters
    }

    setPage(0);
    setAppliedSearchTerm(searchTerm);
    const validSearchTerm = getValidSearchTerm(searchTerm);

    if (isTrackStatus) {
      dispatch(
        fetchBranchWorkflows({
          page: 0,
          size: rowsPerPage,
          searchText: validSearchTerm,
          sortField: 'submittedOn',
          sortDirection: 'desc',
        })
      );
    } else {
      dispatch(
        fetchBranches({
          page: 0,
          size: rowsPerPage,
          search: validSearchTerm,
          status: getApiStatus(statusFilter),
        })
      );
    }
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    const newStatus = event.target.value as 'Approved' | 'Rejected';
    setStatusFilter(newStatus);
    setPage(0);

    const searchValue = contentSearchTerm || appliedSearchTerm || '';
    const validSearchTerm = getValidSearchTerm(searchValue);

    if (isTrackStatus) {
      dispatch(
        fetchBranchWorkflows({
          page: 0,
          size: rowsPerPage,
          searchText: validSearchTerm,
          sortField: 'submittedOn',
          sortDirection: 'desc',
        })
      );
    } else {
      dispatch(
        fetchBranches({
          page: 0,
          size: rowsPerPage,
          search: validSearchTerm,
          status: getApiStatus(newStatus),
        })
      );
    }
  };

  // const handleViewBranch = (branch: Branch) => {
  //   // Navigate to view branch details
  //   navigate(`/re/view-branch/${branch.branchCode}`, {
  //     state: { branchCode: branch.branchCode },
  //   });
  // };

  // const handleActionClick = (branch: Branch) => {
  //   if (branch.status === 'Approved') {
  //     // Navigate to modify branch for approved branches
  //     navigate(`/re/modify-branch/${branch.branchCode}`, {
  //       state: { branchData: branch },
  //     });
  //   } else {
  //     // Navigate to view branch details for non-approved branches
  //     handleViewBranch(branch);
  //   }
  // };

  const handleCreateNew = () => {
    navigate('/re/create-new-branch');
  };

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (isTrackStatus) {
      setStatusFilter('');
    }
  }, [isTrackStatus]);

  // Load branch workflows for track status mode
  useEffect(() => {
    if (isTrackStatus) {
      // Don't call API if contentSearchTerm has less than 3 characters (and is not empty)
      if (
        contentSearchTerm &&
        contentSearchTerm.trim().length > 0 &&
        contentSearchTerm.trim().length < 3
      ) {
        return; // Don't make API call if less than 3 characters
      }

      const validSearchTerm = getValidSearchTerm(contentSearchTerm);
      dispatch(
        fetchBranchWorkflows({
          page,
          size: rowsPerPage,
          searchText: validSearchTerm,
          sortField: 'submittedOn',
          sortDirection: 'desc',
        })
      );
    }
  }, [
    dispatch,
    page,
    rowsPerPage,
    contentSearchTerm,
    isTrackStatus,
    getValidSearchTerm,
  ]);

  // Load regular branches for non-track status mode
  useEffect(() => {
    if (!isTrackStatus) {
      // Don't call API if contentSearchTerm has less than 3 characters (and is not empty)
      if (
        contentSearchTerm &&
        contentSearchTerm.trim().length > 0 &&
        contentSearchTerm.trim().length < 3
      ) {
        return; // Don't make API call if less than 3 characters
      }

      const validSearchTerm = getValidSearchTerm(contentSearchTerm);
      dispatch(
        fetchBranches({
          page,
          size: rowsPerPage,
          search: validSearchTerm,
          status: getApiStatus(statusFilter),
        })
      );
    }
  }, [
    dispatch,
    page,
    rowsPerPage,
    contentSearchTerm,
    statusFilter,
    isTrackStatus,
    getValidSearchTerm,
  ]);

  // Separate state for applied search term
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [sortField, setSortField] = useState<
    | 'branchName'
    | 'branchCode'
    | 'lastUpdatedOn'
    | 'lastUpdatedBy'
    | 'status'
    | 'activity'
    | 'submittedOn'
    | 'submittedBy'
    | null
  >(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Transform branch workflows to Branch format for display
  const transformedBranches = useMemo((): Branch[] => {
    if (isTrackStatus) {
      if (branchWorkflows.length > 0) {
        return branchWorkflows.map(
          (workflow, index): Branch => ({
            id: workflow.workflowId,
            workflowId: workflow.workflowId,
            branchCode: workflow.branchCode,
            branchName: workflow.branchName,
            address: null,
            regionCode: workflow.regionName,
            srNo: page * rowsPerPage + index + 1,
            status: workflow.status,
            activity: workflow.activity,
            submittedOn: workflow.submittedOn,
            submittedBy: workflow.submittedBy,
            lastUpdatedOn: workflow.actionOn,
            lastUpdatedBy: workflow.submittedBy,
            updatedAt: workflow.actionOn,
            updatedBy: workflow.submittedBy,
          })
        );
      }
      return [];
    }
    // Add srNo to regular branches
    return branches.map((branch, index) => ({
      ...branch,
      srNo: page * rowsPerPage + index + 1,
    }));
  }, [isTrackStatus, branchWorkflows, branches, page, rowsPerPage]);

  // Transform and sort API data for display
  // Note: Filtering is now handled by the API via contentSearchTerm parameter
  const displayBranches = useMemo(() => {
    return [...transformedBranches]
      .map((branch) => {
        const branchWithWorkflowId = branch as Branch & { workflowId?: string };
        return {
          ...branch,
          // Preserve workflowId if it exists (for track status), otherwise use srNo
          id: branchWithWorkflowId.workflowId || branch.srNo,
          name: branch.branchName,
          code: branch.branchCode,
          status: getDisplayStatus(branch.status),
        };
      })
      .sort((a, b) => {
        if (!sortField) return 0;

        let aValue: string | number;
        let bValue: string | number;
        let comparison: number;

        switch (sortField) {
          case 'branchName':
            aValue = a.branchName;
            bValue = b.branchName;
            comparison = aValue.localeCompare(bValue);
            break;
          case 'branchCode':
            aValue = a.branchCode;
            bValue = b.branchCode;
            comparison = aValue.localeCompare(bValue);
            break;
          case 'lastUpdatedOn': {
            // Compare dates - convert to timestamps for comparison
            const aDate = new Date(
              a.lastUpdatedOn || a.updatedAt || a.submittedOn || 0
            ).getTime();
            const bDate = new Date(
              b.lastUpdatedOn || b.updatedAt || b.submittedOn || 0
            ).getTime();
            comparison = aDate - bDate;
            break;
          }
          case 'lastUpdatedBy':
            aValue = a.lastUpdatedBy || a.updatedBy || a.submittedBy || '';
            bValue = b.lastUpdatedBy || b.updatedBy || b.submittedBy || '';
            comparison = aValue.localeCompare(bValue);
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            comparison = aValue.localeCompare(bValue);
            break;
          case 'activity':
            aValue = a.activity || '';
            bValue = b.activity || '';
            comparison = aValue.localeCompare(bValue);
            break;
          case 'submittedOn': {
            // Compare dates - convert to timestamps for comparison
            const aDate = new Date(a.submittedOn || 0).getTime();
            const bDate = new Date(b.submittedOn || 0).getTime();
            comparison = aDate - bDate;
            break;
          }
          case 'submittedBy':
            aValue = a.submittedBy || '';
            bValue = b.submittedBy || '';
            comparison = aValue.localeCompare(bValue);
            break;
          default:
            return 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [sortField, sortOrder, transformedBranches]);

  // const displayBranches = branches
  //   .map((branch) => ({
  //     ...branch,
  //     id: branch.srNo,
  //     name: branch.branchName,
  //     code: branch.branchCode,
  //     status: getDisplayStatus(branch.status),
  //   }))
  //   .sort((a, b) => {
  //     if (!sortField) return 0;

  //     const aValue = sortField === 'branchName' ? a.branchName : a.branchCode;
  //     const bValue = sortField === 'branchName' ? b.branchName : b.branchCode;

  //     const comparison = aValue.localeCompare(bValue);
  //     return sortOrder === 'asc' ? comparison : -comparison;
  //   });

  const handleSort = (
    field:
      | 'branchName'
      | 'branchCode'
      | 'lastUpdatedOn'
      | 'lastUpdatedBy'
      | 'status'
      | 'activity'
      | 'submittedOn'
      | 'submittedBy'
  ) => {
    const newOrder =
      sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    const searchValue = contentSearchTerm || appliedSearchTerm || '';

    // Don't call API if search term has less than 3 characters (and is not empty)
    if (
      searchValue &&
      searchValue.trim().length > 0 &&
      searchValue.trim().length < 3
    ) {
      return; // Don't make API call if less than 3 characters
    }

    setPage(newPage);
    const validSearchTerm = getValidSearchTerm(searchValue);

    if (isTrackStatus) {
      dispatch(
        fetchBranchWorkflows({
          page: newPage,
          size: rowsPerPage,
          searchText: validSearchTerm,
          sortField: 'submittedOn',
          sortDirection: 'desc',
        })
      );
    } else {
      dispatch(
        fetchBranches({
          page: newPage,
          size: rowsPerPage,
          search: validSearchTerm,
          status: getApiStatus(statusFilter),
        })
      );
    }
  };

  return (
    <Container maxWidth={false} sx={containerStyles}>
      {/* Header with Back Button */}

      <Box sx={headerContainerStyles}>
        {showBackButton && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={backButtonStyles}
          >
            Back
          </Button>
        )}
      </Box>

      {/* Search and Filter Section */}
      <Paper elevation={0} sx={paperStyles}>
        <Box sx={searchContainerStyles}>
          <Box sx={searchFilterRowStyles}>
            {showSearchFilter && (
              <Box sx={searchInputContainerStyles}>
                <Typography variant="subtitle2" sx={searchLabelStyles}>
                  Search by
                </Typography>
                <Box sx={searchInputWrapperStyles}>
                  <TextField
                    placeholder="search by branch name or code"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      // Clear search when input is empty
                      if (value === '') {
                        setAppliedSearchTerm('');
                        setPage(0);
                        if (isTrackStatus) {
                          dispatch(
                            fetchBranchWorkflows({
                              page: 0,
                              size: rowsPerPage,
                              searchText: '',
                              sortField: 'submittedOn',
                              sortDirection: 'desc',
                            })
                          );
                        } else {
                          dispatch(
                            fetchBranches({
                              page: 0,
                              size: rowsPerPage,
                              search: '',
                              status: getApiStatus(statusFilter),
                            })
                          );
                        }
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    fullWidth
                    sx={textFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: {
                        height: '40px',
                        '& .MuiInputBase-input': {
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    sx={buttonStyles('contained')}
                  >
                    Search
                  </Button>
                </Box>
              </Box>
            )}

            {showStatusFilter && (
              <Box sx={statusFilterContainerStyles}>
                <Typography variant="subtitle2" sx={statusFilterLabelStyles}>
                  Status
                </Typography>
                <FormControl variant="outlined" size="small" fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx={selectStyles}
                  >
                    <MenuItem sx={menuItemStyles} value="Approved">
                      Approved
                    </MenuItem>
                    <MenuItem sx={menuItemStyles} value="Rejected">
                      Rejected
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>

          {showCreateNewButton && (
            <Button
              variant="contained"
              onClick={handleCreateNew}
              sx={createNewButtonStyles('contained')}
            >
              Create New
            </Button>
          )}

          {showContentSearch && (
            <React.Fragment>
              <StyledSearchField sx={{ minWidth: '240px', maxWidth: '300px' }}>
                <StyledSearchFieldContainer>
                  <TextField
                    placeholder="Content Search"
                    variant="outlined"
                    sx={StyledSearchInput}
                    size="small"
                    value={contentSearchTerm}
                    onChange={(e) => setContentSearchTerm(e.target.value)}
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
        </Box>
      </Paper>
      {/* Table Section */}
      <Paper elevation={0} sx={containerStyles}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={tableContainerStyles}
        >
          <Table>
            <colgroup>
              <col style={tableColumnStyles.col1} />
              <col style={tableColumnStyles.col2} />
              <col style={tableColumnStyles.col3} />
              <col style={tableColumnStyles.col4} />
              {/* <col style={tableColumnStyles.col5} /> */}
            </colgroup>
            <TableHead>
              <TableRow sx={tableHeadRowStyles}>
                <TableCell sx={tableCellStyles} align="center">
                  Sr.No.
                </TableCell>
                <TableCell
                  sx={{
                    ...tableCellStyles,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  align="center"
                  onClick={() => handleSort('branchName')}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    Branch Name
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}
                    >
                      <KeyboardArrowUpIcon
                        sx={{
                          color:
                            sortField === 'branchName' && sortOrder === 'asc'
                              ? '#000000'
                              : '#000000',
                          fontSize: '16px',
                          lineHeight: 1,
                          cursor: 'pointer',
                        }}
                      />
                      <KeyboardArrowDownIcon
                        sx={{
                          color:
                            sortField === 'branchName' && sortOrder === 'desc'
                              ? '#000000'
                              : '#000000',
                          fontSize: '16px',
                          lineHeight: 1,
                          mt: -1,
                          cursor: 'pointer',
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    ...tableCellStyles,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  align="center"
                  onClick={() => handleSort('branchCode')}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    Branch Code
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}
                    >
                      <KeyboardArrowUpIcon
                        sx={{
                          color:
                            sortField === 'branchCode' && sortOrder === 'asc'
                              ? '#000000'
                              : '#000000',
                          fontSize: '16px',
                          lineHeight: 1,
                          cursor: 'pointer',
                        }}
                      />
                      <KeyboardArrowDownIcon
                        sx={{
                          color:
                            sortField === 'branchCode' && sortOrder === 'desc'
                              ? '#000000'
                              : '#000000',
                          fontSize: '16px',
                          lineHeight: 1,
                          mt: -1,
                          cursor: 'pointer',
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                {!isTrackStatus && (
                  <TableCell
                    sx={{
                      ...tableCellStyles,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    align="center"
                    onClick={() => handleSort('lastUpdatedOn')}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      Last Updated On
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          ml: 0.5,
                        }}
                      >
                        <KeyboardArrowUpIcon
                          sx={{
                            color:
                              sortField === 'lastUpdatedOn' &&
                              sortOrder === 'asc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        />
                        <KeyboardArrowDownIcon
                          sx={{
                            color:
                              sortField === 'lastUpdatedOn' &&
                              sortOrder === 'desc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            mt: -1,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                )}

                {!isTrackStatus && (
                  <TableCell
                    sx={{
                      ...tableCellStyles,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    align="center"
                    onClick={() => handleSort('lastUpdatedBy')}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      Last Updated By
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          ml: 0.5,
                        }}
                      >
                        <KeyboardArrowUpIcon
                          sx={{
                            color:
                              sortField === 'lastUpdatedBy' &&
                              sortOrder === 'asc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        />
                        <KeyboardArrowDownIcon
                          sx={{
                            color:
                              sortField === 'lastUpdatedBy' &&
                              sortOrder === 'desc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            mt: -1,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                )}

                {isTrackStatus && (
                  <TableCell
                    sx={{
                      ...tableCellStyles,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    align="center"
                    onClick={() => handleSort('status')}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      Status
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          ml: 0.5,
                        }}
                      >
                        <KeyboardArrowUpIcon
                          sx={{
                            color:
                              sortField === 'status' && sortOrder === 'asc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        />
                        <KeyboardArrowDownIcon
                          sx={{
                            color:
                              sortField === 'status' && sortOrder === 'desc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            mt: -1,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                )}

                {isTrackStatus && (
                  <TableCell
                    sx={{
                      ...tableCellStyles,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    align="center"
                    onClick={() => handleSort('activity')}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      Activity
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          ml: 0.5,
                        }}
                      >
                        <KeyboardArrowUpIcon
                          sx={{
                            color:
                              sortField === 'activity' && sortOrder === 'asc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        />
                        <KeyboardArrowDownIcon
                          sx={{
                            color:
                              sortField === 'activity' && sortOrder === 'desc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            mt: -1,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                )}

                {isTrackStatus && (
                  <TableCell
                    sx={{
                      ...tableCellStyles,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    align="center"
                    onClick={() => handleSort('submittedOn')}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      Submitted On
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          ml: 0.5,
                        }}
                      >
                        <KeyboardArrowUpIcon
                          sx={{
                            color:
                              sortField === 'submittedOn' && sortOrder === 'asc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        />
                        <KeyboardArrowDownIcon
                          sx={{
                            color:
                              sortField === 'submittedOn' &&
                              sortOrder === 'desc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            mt: -1,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                )}

                {isTrackStatus && (
                  <TableCell
                    sx={{
                      ...tableCellStyles,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    align="center"
                    onClick={() => handleSort('submittedBy')}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      Submitted By
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          ml: 0.5,
                        }}
                      >
                        <KeyboardArrowUpIcon
                          sx={{
                            color:
                              sortField === 'submittedBy' && sortOrder === 'asc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            cursor: 'pointer',
                          }}
                        />
                        <KeyboardArrowDownIcon
                          sx={{
                            color:
                              sortField === 'submittedBy' &&
                              sortOrder === 'desc'
                                ? 'black'
                                : 'black',
                            fontSize: '16px',
                            lineHeight: 1,
                            mt: -1,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                )}
                {/* <TableCell sx={tableCellStyles}>Action</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody sx={tableBodyStyles}>
              {displayBranches.map((branch, index) => {
                // Preserve workflowId in the branch object for track status
                const branchWithWorkflowId = branch as Branch & {
                  workflowId?: string;
                  id?: string | number;
                };
                const workflowId =
                  branchWithWorkflowId.workflowId ||
                  (typeof branchWithWorkflowId.id === 'string'
                    ? branchWithWorkflowId.id
                    : undefined);
                const branchToPass: Branch = {
                  ...branch,
                  workflowId,
                };
                return (
                  <TableRow
                    key={branch.id || branch.branchCode}
                    sx={tableRowStyles}
                    onClick={() =>
                      handleRowClick(
                        branch.branchCode,
                        branchToPass,
                        branch.status
                      )
                    }
                  >
                    <TableCell sx={cellStyles} align="center">
                      {String(index + 1).padStart(2, '0')}
                    </TableCell>
                    <TableCell sx={cellStyles} align="center">
                      <CellWithTooltip value={branch.name}>
                        {branch.name && branch.name.length > 20
                          ? `${branch.name.substring(0, 20)}...`
                          : branch.name}
                      </CellWithTooltip>
                    </TableCell>
                    <TableCell sx={cellStyles} align="center">
                      <CellWithTooltip value={branch.code}>
                        {branch.code}
                      </CellWithTooltip>
                    </TableCell>

                    {!isTrackStatus && (
                      <TableCell sx={cellStyles} align="center">
                        <CellWithTooltip
                          value={DateUtils.formatDate(
                            branch.lastUpdatedOn ||
                              branch.updatedAt ||
                              branch.submittedOn
                          )}
                        >
                          {DateUtils.formatDate(
                            branch.lastUpdatedOn ||
                              branch.updatedAt ||
                              branch.submittedOn
                          )}
                        </CellWithTooltip>
                      </TableCell>
                    )}

                    {!isTrackStatus && (
                      <TableCell sx={cellStyles} align="center">
                        <CellWithTooltip
                          value={
                            branch.lastUpdatedBy ||
                            branch.updatedBy ||
                            branch.submittedBy ||
                            '-'
                          }
                        >
                          {(() => {
                            const username =
                              branch.lastUpdatedBy ||
                              branch.updatedBy ||
                              branch.submittedBy ||
                              '-';
                            return username !== '-' && username.length > 20
                              ? `${username.substring(0, 20)}...`
                              : username;
                          })()}
                        </CellWithTooltip>
                      </TableCell>
                    )}

                    {isTrackStatus && (
                      <TableCell sx={cellStyles}>
                        <Box sx={statusContainerStyles}>
                          <Typography
                            variant="body2"
                            sx={{
                              ...statusTextStyles(branch.status),
                              color:
                                branch.status === 'Rejected'
                                  ? '#FFC107'
                                  : branch.status === 'Approved'
                                    ? 'rgba(82, 174, 50, 1)'
                                    : branch.status === 'Approval Pending'
                                      ? 'rgba(255, 118, 0, 1)'
                                      : 'rgba(0, 0, 0, 0.6)',
                            }}
                          >
                            {branch.status}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}

                    {isTrackStatus && (
                      <TableCell sx={cellStyles} align="center">
                        <CellWithTooltip
                          value={formatActivity(branch.activity)}
                        >
                          {formatActivity(branch.activity)}
                        </CellWithTooltip>
                      </TableCell>
                    )}

                    {isTrackStatus && (
                      <TableCell sx={cellStyles} align="center">
                        <CellWithTooltip
                          value={DateUtils.formatDate(branch.submittedOn)}
                        >
                          {DateUtils.formatDate(branch.submittedOn)}
                        </CellWithTooltip>
                      </TableCell>
                    )}

                    {isTrackStatus && (
                      <TableCell sx={cellStyles} align="center">
                        <CellWithTooltip value={branch.submittedBy || '-'}>
                          {branch.submittedBy && branch.submittedBy.length > 20
                            ? `${branch.submittedBy.substring(0, 20)}...`
                            : branch.submittedBy || '-'}
                        </CellWithTooltip>
                      </TableCell>
                    )}

                    {/* <TableCell align="center" sx={actionCellStyles}>
                    <IconButton
                      size="small"
                      onClick={() => handleActionClick(branch)}
                      sx={actionButtonStyles}
                      disabled={branch.status !== 'Approved'}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell> */}
                  </TableRow>
                );
              })}
              {/* Show empty state when no results */}
              {displayBranches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {appliedSearchTerm
                        ? 'No branches found matching your search.'
                        : 'No branches available.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box sx={paginationContainerStyles}>
        <Typography variant="body2" sx={paginationTextStyles}>
          {(() => {
            const totalItems = isTrackStatus
              ? branchWorkflowTotalElements
              : totalElements;
            // const startItem = page * rowsPerPage + 1;
            const endItem = Math.min((page + 1) * rowsPerPage, totalItems);
            return `Showing data ${endItem} of ${totalItems}`;
          })()}
        </Typography>

        <Box sx={paginationButtonContainerStyles}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, page - 1)}
            disabled={page === 0}
            sx={paginationButtonStyles(page === 0)}
          >
            &lt; Previous
          </Button>

          {(() => {
            const maxPages = isTrackStatus
              ? branchWorkflowTotalPages
              : totalPages;
            const startPage = Math.max(0, Math.min(page - 1, maxPages - 4));
            const endPage = Math.min(startPage + 4, maxPages);

            return Array.from({ length: endPage - startPage }, (_, i) => {
              const pageNumber = startPage + i;
              return (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleChangePage(null, pageNumber)}
                  sx={pageButtonStyles(page === pageNumber)}
                >
                  {pageNumber + 1}
                </Button>
              );
            });
          })()}

          <Button
            variant="outlined"
            size="small"
            onClick={() => handleChangePage(null, page + 1)}
            disabled={
              page >=
              (isTrackStatus ? branchWorkflowTotalPages : totalPages) - 1
            }
            sx={paginationButtonStyles(
              page >=
                (isTrackStatus ? branchWorkflowTotalPages : totalPages) - 1
            )}
          >
            Next &gt;
          </Button>
        </Box>
      </Box>

      {/* Deactivate Branch Modal */}
      <DeactivateBranchModal
        open={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        branchName={'Branch Name'}
        branchCode={'BRANCH_CODE'} // TODO: Replace with actual branch code
      />
    </Container>
  );
};

export default CreateModifyBranch;
