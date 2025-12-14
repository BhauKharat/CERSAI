import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as EyeIcon,
} from '@mui/icons-material';
import './approvals.css';

// Redux imports
import type { AppDispatch } from '../../../../redux/store';
import {
  // fetchPendingApprovals,
  setSearchQuery,
  // setStatusFilter,
  setCurrentPage,
  setSelectedApproval,
  clearError,
  applyFilters,
  type WorkflowApproval,
} from '../approvals/slice/workFlowSLice';
import {
  selectCurrentPageData,
  selectLoading,
  selectError,
  selectFilters,
  selectTotalApprovals,
  selectHasNextPage,
  selectHasPrevPage,
  selectStatusOptions,
} from '../approvals/slice/workFlowSelectore';

// Transform workflow data to match table format
interface TableApprovalData {
  requisitionReason?: string;
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  suspensionPeriodDays?: number;
  key: string;
  srNo: number;
  userName: string;
  role: string;
  status: string;
  activity: string;
  originalData: WorkflowApproval;
  userId: string;
}

const Approvals: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const currentPageData = useSelector(selectCurrentPageData);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const filters = useSelector(selectFilters);
  const totalApprovals = useSelector(selectTotalApprovals);
  const hasNextPage = useSelector(selectHasNextPage);
  const hasPrevPage = useSelector(selectHasPrevPage);
  const statusOptions = selectStatusOptions();

  // Local state for Snackbar
  const [, setSnackbarOpen] = useState(false);
  const [, setSnackbarMessage] = useState('');
  const [, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Show MUI Snackbar message
  const showMessage = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Initialize data on component mount
  // useEffect(() => {
  //   dispatch(fetchPendingApprovals());
  // }, [dispatch]);

  // Apply filters when search query or status changes
  useEffect(() => {
    dispatch(applyFilters());
  }, [dispatch, filters.searchQuery, filters.statusFilter]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === 'string'
          ? error
          : `${error.errorCode}: ${error.errorMessage}`;
      showMessage(errorMessage, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Transform API data to table format - FIXED MAPPING
  const transformApprovalData = (
    approvals: WorkflowApproval[]
  ): TableApprovalData[] => {
    return approvals.map((approval, index) => ({
      key: approval.workflowId,
      srNo: index + 1,
      // Fixed: Get userName from userDto.user
      userName:
        `${approval.userDto.user.firstName} ${approval.userDto.user.middleName} ${approval.userDto.user.lastName}`.trim(),
      // Fixed: Get role from userDto.user.role
      userId: approval.userDto.user.id,
      role: getRoleDisplayName(approval.userDto.user.role),
      status: getDisplayStatus(approval.approvalStatus),
      activity: getDisplayActivity(approval.userAccountAction),
      requisitionReason: approval.requisitionReason,
      suspensionStartDate: approval.suspensionStartDate,
      suspensionEndDate: approval.suspensionEndDate,
      suspensionPeriodDays: approval.suspensionPeriodDays,
      originalData: approval,
    }));
  };

  // Map role codes to display names
  const getRoleDisplayName = (roleCode: string): string => {
    const roleMap: Record<string, string> = {
      AU: 'Admin User',
      OU: 'Operator User',
      VU: 'View User',
      SU: 'Super User',
      MU: 'Manager User',
      // Add more role mappings as needed
    };
    return roleMap[roleCode] || roleCode;
  };

  // Map API status to display status
  const getDisplayStatus = (apiStatus: string): string => {
    const statusMap: Record<string, string> = {
      PENDING: 'Pending Approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      IN_PROGRESS: 'In Progress',
    };
    return statusMap[apiStatus] || apiStatus;
  };

  // Map API activity to display activity
  const getDisplayActivity = (userAccountAction: string): string => {
    const activityMap: Record<string, string> = {
      CREATE: 'Creation',
      MODIFY: 'Modification',
      DEACTIVATE: 'De-activation',
      SUSPEND: 'Suspension',
      SUSPENSION_REVOKE: 'Suspension Revoke',
    };
    return activityMap[userAccountAction] || userAccountAction;
  };

  const handleSearch = () => {
    dispatch(applyFilters());
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  // const handleStatusChange = (e: React.ChangeEvent<{ value: unknown }>) => {
  //   dispatch(setStatusFilter(e.target.value as string));
  // };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(setCurrentPage(newPage + 1));
  };

  // Updated navigation logic based on activity
  const handleViewDetails = (record: TableApprovalData) => {
    dispatch(setSelectedApproval(record.originalData));

    // Method 1: Access from transformed data
    const userId = record.userId;

    // Method 2: Access directly from original data
    const userIdFromOriginal = record.originalData.userDto.user.id;

    // Method 3: Access from userData object
    const userData = record.originalData.userDto;
    const userIdFromUserData = userData.user.id;

    console.log('User ID (from transformed):', userId);
    console.log('User ID (from original):', userIdFromOriginal);
    console.log('User ID (from userData):', userIdFromUserData);
    console.log('All user details:', userData);

    const activity = record.originalData.userAccountAction;

    // Use user ID in navigation
    switch (activity) {
      case 'DEACTIVATE':
        navigate('/sub-users/approval-details', {
          state: {
            approvalData: {
              workflowId: record.originalData.workflowId,
              userId: userId, // Pass user ID
              userName: record.userName,
              userRole: record.role,
              activity: record.activity,
              status: record.status,
              initiatedBy: record.originalData.initiatedBy,
              createdDate: record.originalData.createdDate,
              pendingAtStage: record.originalData.pendingAtStage,
              totalNoOfApprovals: record.originalData.totalNoOfApprovals,
              remark: record.requisitionReason,
              userData: userData,
              requisitionReason: record.requisitionReason,
              suspensionStartDate: record.suspensionStartDate,
              suspensionEndDate: record.suspensionEndDate,
            },
          },
        });
        break;

      case 'SUSPEND':
        navigate('/approvals-suspension-user', {
          state: {
            workflowId: record.originalData.workflowId,
            workflowData: record.originalData,
            userData: userData,
            userId: userId, // Pass user ID
            activity: activity,
            isApprovalView: true,
            requisitionReason: record.requisitionReason,
            suspensionStartDate: record.suspensionStartDate,
            suspensionEndDate: record.suspensionEndDate,
            suspensionPeriodDays: record.suspensionPeriodDays,
            userName: record.userName || '-',
            userRole: record.role || '-',
          },
        });
        break;

      case 'MODIFY':
      case 'CREATE':
        navigate('/approvals-modify-user', {
          state: {
            workflowId: record.originalData.workflowId,
            workflowData: record.originalData,
            userData: userData,
            userId: userId, // Pass user ID
            activity: activity,
            isApprovalView: true,
            requisitionReason: record.requisitionReason,
          },
        });
        break;

      case 'SUSPENSION_REVOKE':
        navigate('/approvals-revoke-suspension-user', {
          state: {
            approvalData: {
              workflowId: record.originalData.workflowId,
              userId: userId,
              userName: record.userName,
              userRole: record.role,
              activity: record.activity,
              status: record.status,
              initiatedBy: record.originalData.initiatedBy,
              createdDate: record.originalData.createdDate,
              pendingAtStage: record.originalData.pendingAtStage,
              totalNoOfApprovals: record.originalData.totalNoOfApprovals,
              remark:
                record.requisitionReason ||
                `${record.activity} request is pending for approval`,
              userData: userData,
              region: '-', // You might want to get this from userData if available
              branch: '-', // You might want to get this from userData if available
              requisitionReason: record.requisitionReason,
            },
            // Also pass the additional fields at root level for easier access
            requisitionReason: record.requisitionReason,
            suspensionStartDate: record.suspensionStartDate,
            suspensionEndDate: record.suspensionEndDate,
            suspensionPeriodDays: record.suspensionPeriodDays,
            workflowData: record.originalData,
            userData: userData,
            userId: userId,
            activity: activity,
            isApprovalView: true,
          },
        });
        break;
      default:
        navigate('/sub-users/approval-details', {
          state: {
            approvalData: {
              workflowId: record.originalData.workflowId,
              userId: userId, // Pass user ID
              userName: record.userName,
              userRole: record.role,
              activity: record.activity,
              status: record.status,
              initiatedBy: record.originalData.initiatedBy,
              createdDate: record.originalData.createdDate,
              pendingAtStage: record.originalData.pendingAtStage,
              totalNoOfApprovals: record.originalData.totalNoOfApprovals,
              remark: record.originalData.requisitionReason,
              userData: userData,
            },
          },
        });
        break;
    }
  };

  // Columns for the MUI Table
  const columns = [
    { id: 'srNo', label: 'Sr.No.', minWidth: 80, align: 'left' },
    { id: 'userName', label: 'User Name', minWidth: 170, align: 'left' },
    { id: 'role', label: 'Role', minWidth: 100, align: 'left' },
    { id: 'status', label: 'Status', minWidth: 100, align: 'left' },
    { id: 'activity', label: 'Activity', minWidth: 100, align: 'left' },
    { id: 'action', label: 'Action', minWidth: 80, align: 'center' },
  ];

  const tableData = transformApprovalData(currentPageData);

  return (
    <Box className="dashboard">
      <Box className="dashboard-content">
        <Box component="main" className="main-content">
          {/* Header Section */}
          <Box
            className="page-header"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box className="header-left">
              <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                className="back-button"
              >
                Back
              </Button>
            </Box>
          </Box>

          {/* Filters Section */}
          <Box
            className="filters-container"
            sx={{ my: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}
          >
            <Box
              className="search-section"
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 2,
                flexGrow: 1,
              }}
            >
              <FormControl variant="standard" sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Search by
                </Typography>
                <TextField
                  placeholder="search by workflow ID/user name/employee code/email"
                  value={filters.searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  height: '40px',
                  backgroundColor: '#002CBA',
                  '&:hover': {
                    backgroundColor: '#002299',
                  },
                }}
              >
                Search
              </Button>
            </Box>

            <Box
              className="status-group"
              sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}
            >
              <FormControl variant="standard" sx={{ minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Select
                  value={filters.statusFilter}
                  // onChange={handleStatusChange}
                  size="small"
                  sx={{
                    '.MuiSelect-select': {
                      padding: '8px 14px', // Adjust padding to match AntD's height
                    },
                  }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Table Section */}
          <Paper
            className="table-container"
            sx={{ width: '100%', overflow: 'hidden' }}
          >
            <TableContainer sx={{ maxHeight: 640 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align as 'left' | 'center' | 'right'}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={24} />
                        <Typography sx={{ mt: 2 }}>Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : tableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography>No approvals found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableData.map((row) => (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.key}
                      >
                        <TableCell>{row.srNo}</TableCell>
                        <TableCell>{row.userName}</TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              className={`status-dot ${row.status.toLowerCase().replace(' ', '-')}`}
                              sx={{
                                height: 8,
                                width: 8,
                                borderRadius: '50%',
                                mr: 1,
                                backgroundColor:
                                  row.status === 'Pending Approval'
                                    ? '#ffc107'
                                    : row.status === 'Approved'
                                      ? '#28a745'
                                      : row.status === 'Rejected'
                                        ? '#dc3545'
                                        : '#6c757d',
                              }}
                            />
                            {row.status}
                          </Box>
                        </TableCell>
                        <TableCell>{row.activity}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleViewDetails(row)}>
                            <EyeIcon style={{ fontSize: '18px' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalApprovals}
              page={filters.currentPage - 1}
              rowsPerPage={filters.pageSize}
              onPageChange={handlePageChange}
              rowsPerPageOptions={[]}
              labelDisplayedRows={({ from, to, count }) =>
                `Showing data ${from} to ${to} of ${count}`
              }
              nextIconButtonProps={{ disabled: !hasNextPage }}
              backIconButtonProps={{ disabled: !hasPrevPage }}
              slotProps={{
                actions: {
                  previousButton: {
                    children: (
                      <Button variant="text" disabled={!hasPrevPage}>
                        Previous
                      </Button>
                    ),
                  },
                  nextButton: {
                    children: (
                      <Button variant="text" disabled={!hasNextPage}>
                        Next
                      </Button>
                    ),
                  },
                },
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Approvals;
