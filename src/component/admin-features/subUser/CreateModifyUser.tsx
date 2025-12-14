/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Button as MuiButton,
  // InputLabel,Ffetch
  Select as MuiSelect,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  // ArrowBack as ArrowBackIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Search as SearchIcon,
} from '@mui/icons-material';
// import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { jwtDecode } from 'jwt-decode';
import DateUtils from '../../../utils/dateUtils';
import NavigationBreadCrumb from '../../features/UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import './CreateModifyUser.css';

// Redux imports - SubUser slice
// import type { AppDispatch } from '../../../redux/store';
import {
  selectCurrentPageData,
  selectError,
  selectFilters,
  selectHasNextPage,
  selectHasPrevPage,
  selectLoading,
  selectSelectedUser,
  selectTotalUsers,
} from '../subUser/slices/selectors';
import {
  clearError,
  fetchTrackStatusUsers,
  fetchUsers,
  // setSearchQuery,
  // setStatusFilter,
  setCurrentPage,
  type SubUser,
} from '../subUser/slices/subUserSlice';

// Redux imports - CreateUser slice for deactivation and suspension
import { CERSAIUserRoles } from '../../../../src/enums/userRoles.enum';
import { RootState } from '../../../redux/store';
import {
  clearDeactivateError,
  clearDeactivateSuccess,
  clearRevokeSuspensionError,
  clearRevokeSuspensionSuccess,
  clearSuspendError,
  clearSuspendSuccess,
  deactivateUser,
  revokeSuspension,
  selectDeactivateData,
  selectDeactivateError,
  selectDeactivateLoading,
  selectDeactivateSuccess,
  selectRevokeSuspensionData,
  selectRevokeSuspensionError,
  selectRevokeSuspensionLoading,
  selectRevokeSuspensionSuccess,
  selectSuspendData,
  selectSuspendError,
  selectSuspendLoading,
  selectSuspendSuccess,
  suspendUser,
  type DeactivateUserRequest,
  type RevokeSuspensionRequest,
  type SuspendUserRequest,
} from '../subUser/CreateNewUser/slices/createUserSlice';

// === Custom Styled Components for layout ===
const DashboardContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#FFFFFF',
});

const MainContent = styled(Box)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
});

// const PageHeader = styled(Box)({
//   display: 'flex',
//   alignItems: 'center',
//   padding: '16px 24px',
// });

// const FiltersContainer = styled(Box)({
//   padding: '16px 24px',
//   display: 'flex',
//   gap: '16px',
//   flexWrap: 'wrap',
//   alignItems: 'flex-end',
// });

const TableWrapper = styled(Paper)({
  margin: '0 24px 24px',
  borderRadius: '8px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  '& .MuiTablePagination-toolbar': {
    flexDirection: 'row-reverse',
  },
  '& .MuiTablePagination-actions': {
    marginLeft: 0,
    marginRight: 'auto',
  },
});

// interface StatusDotProps {
//   status: string;
// }

// const StatusDot = styled('span')<StatusDotProps>(({ status }) => ({
//   height: '10px',
//   width: '10px',
//   borderRadius: '50%',
//   display: 'inline-block',
//   marginRight: '8px',
//   backgroundColor:
//     status === 'Approved'
//       ? 'green'
//       : status === 'Pending'
//         ? 'orange'
//         : status === 'Suspended'
//           ? 'red'
//           : status === 'Deactivated'
//             ? 'grey'
//             : 'transparent',
// }));

// === Custom Modals using MUI Dialog ===

interface ConfirmationModalProps {
  visible: boolean;
  type: 'deactivate' | 'suspend' | 'revoke';
  onOk: (values: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  type,
  onOk,
  onCancel,
  loading,
}) => {
  const [remark, setRemark] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const getTitle = () => {
    switch (type) {
      case 'deactivate':
        return 'De-activate User';
      case 'suspend':
        return 'Suspend User';
      case 'revoke':
        return 'Revoke Suspension';
      default:
        return 'Confirm Action';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'deactivate':
        return 'Are you sure you want to de-activate this user?';
      case 'suspend':
        return 'Are you sure you want to suspend this user?';
      case 'revoke':
        return 'Are you sure you want to revoke the suspension for this user?';
      default:
        return 'Please confirm your action.';
    }
  };

  const handleSubmit = () => {
    onOk({
      reason: remark,
      fromDate,
      toDate,
    });
  };

  return (
    <Dialog open={visible} onClose={onCancel}>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        <DialogContentText>{getMessage()}</DialogContentText>
        <TextField
          margin="dense"
          label="Reason/Remark"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          sx={{ mt: 2 }}
        />
        {type === 'suspend' && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="To Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={onCancel} disabled={loading}>
          Cancel
        </MuiButton>
        <MuiButton
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
  buttonText: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  message,
  buttonText,
}) => {
  return (
    <Dialog open={visible} onClose={onClose}>
      <DialogTitle>Success</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={onClose} variant="contained">
          {buttonText}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

// === Main Component ===

interface ISortBy {
  key: string;
  order: string;
}

const CertifyModifyUser: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const [searchParams] = useSearchParams();

  // Get the menu action from URL params (e.g., ?action=View User Details)
  const menuAction = searchParams.get('action') || 'View User Details';

  // Check if in Track Status mode (either from mode param or action param)
  const isTrackStatusMode =
    searchParams.get('mode') === 'trackStatus' || menuAction === 'Track Status';

  // Redux selectors - SubUser
  const currentPageData = useSelector(selectCurrentPageData);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const filters = useSelector(selectFilters);
  const selectedUser = useSelector(selectSelectedUser);
  const totalUsers = useSelector(selectTotalUsers);
  const hasNextPage = useSelector(selectHasNextPage);
  const hasPrevPage = useSelector(selectHasPrevPage);
  // const statusOptions = useSelector(selectStatusOptions);

  // console.log('currentPageData : ', currentPageData);
  // Redux selectors - Deactivation, Suspension, Revoke
  const deactivateLoading = useSelector(selectDeactivateLoading);
  const deactivateError = useSelector(selectDeactivateError);
  const deactivateSuccess = useSelector(selectDeactivateSuccess);
  const deactivateData = useSelector(selectDeactivateData);

  const suspendLoading = useSelector(selectSuspendLoading);
  const suspendError = useSelector(selectSuspendError);
  const suspendSuccess = useSelector(selectSuspendSuccess);
  const suspendData = useSelector(selectSuspendData);

  const revokeSuspensionLoading = useSelector(selectRevokeSuspensionLoading);
  const revokeSuspensionError = useSelector(selectRevokeSuspensionError);
  const revokeSuspensionSuccess = useSelector(selectRevokeSuspensionSuccess);
  const revokeSuspensionData = useSelector(selectRevokeSuspensionData);

  const totalPagesFromApi = useSelector(
    (state: RootState) => state.subUser.totalPages
  );

  const token: any = useSelector((state: RootState) => state?.auth?.authToken);
  const decoded: any = jwtDecode(token);
  const userType = decoded?.groupMembership[0].replace(/^\//, '');

  // console.log('Total pages on createModifyuser : ', totalPagesFromApi);
  const [sortBy, setSortBy] = useState<ISortBy | undefined>();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [contentSearch, setContentSearch] = useState<string>('');
  // Local state for MUI Menu
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<
    'deactivate' | 'suspend' | 'revoke'
  >('deactivate');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('error');

  const getDisplayStatus = useCallback((apiStatus: string): string => {
    const statusMap: Record<string, string> = {
      ACTIVE: 'Approved',
      APPROVED: 'Approved',
      PENDING: 'Approval Pending',
      IN_ACTIVE: 'Approval Pending',
      INACTIVE: 'Approval Pending',
      REJECTED: 'Rejected',
      SUSPENDED: 'Suspended',
      DEACTIVATED: 'Deactivated',
    };
    return statusMap[apiStatus] || apiStatus;
  }, []);

  const transformUserData = useCallback(
    (users: SubUser[]) => {
      if (!Array.isArray(users)) return [];
      return users.map((user, index) => ({
        key: user.id,
        srNo: index + 1 + (filters.currentPage - 1) * filters.pageSize,
        userId: user.id,
        userName:
          `${user.firstName} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        status: getDisplayStatus(user.status),
        // Use workflowStatus for Activity column (already formatted in fetchTrackStatusUsers)
        activity: user.workflowStatus || (user as any).activity || 'Creation',
        submittedOn:
          (user as any).submittedOn ||
          DateUtils.formatDate(user.createdDate || new Date().toISOString()),
        // Format Submitted By as "Name - UserID" (e.g., "SBI - IA000001")
        submittedBy: user.createdBy
          ? (user as any).initiatorName
            ? `${(user as any).initiatorName} - ${user.createdBy}`
            : user.createdBy
          : (user as any).submittedBy || '-',
        lastUpdatedOn: DateUtils.formatDate(
          user.updatedDate || user.createdDate || new Date().toISOString()
        ),
        lastUpdatedBy: user.modifiedBy || user.createdBy || '-',
        originalData: user,
      }));
    },
    [filters.currentPage, filters.pageSize, getDisplayStatus]
  );

  useEffect(() => {
    dispatch(setCurrentPage(1));

    // In Track Status mode, fetch workflow-based users
    if (isTrackStatusMode) {
      dispatch(fetchTrackStatusUsers({ page: 0, size: 10 }));
      return;
    }

    // Automatically filter for SUSPENDED users when action is "Revoke Suspension"
    const statusFilter =
      menuAction === 'Revoke Suspension'
        ? 'SUSPENDED'
        : ['De-activate', 'Modify', 'Suspend'].includes(menuAction)
          ? 'ACTIVE'
          : filters.statusFilter;

    dispatch(
      fetchUsers({
        page: 0,
        size: 10,
        searchQuery: filters.searchQuery,
        status: statusFilter,
        role:
          userType.toUpperCase() === CERSAIUserRoles.SUPER_ADMIN_USER
            ? 'RA'
            : 'CU',
      })
    );
  }, [
    dispatch,
    filters.searchQuery,
    filters.statusFilter,
    menuAction,
    isTrackStatusMode,
    userType,
  ]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(
        typeof error === 'string'
          ? error
          : `${error.errorCode}: ${error.errorMessage}`
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (deactivateError) {
      setSnackbarMessage(
        typeof deactivateError === 'string'
          ? deactivateError
          : `${deactivateError.errorCode}: ${deactivateError.errorMessage}`
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      dispatch(clearDeactivateError());
    }
  }, [deactivateError, dispatch]);

  useEffect(() => {
    if (suspendError) {
      setSnackbarMessage(
        typeof suspendError === 'string'
          ? suspendError
          : `${suspendError.errorCode}: ${suspendError.errorMessage}`
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      dispatch(clearSuspendError());
    }
  }, [suspendError, dispatch]);

  useEffect(() => {
    if (revokeSuspensionError) {
      setSnackbarMessage(
        typeof revokeSuspensionError === 'string'
          ? revokeSuspensionError
          : `${revokeSuspensionError.errorCode}: ${revokeSuspensionError.errorMessage}`
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      dispatch(clearRevokeSuspensionError());
    }
  }, [revokeSuspensionError, dispatch]);

  useEffect(() => {
    if (deactivateSuccess && deactivateData) {
      setIsConfirmModalVisible(false);
      setSuccessMessage(
        deactivateData.message || 'User deactivated successfully!'
      );
      setIsSuccessModalVisible(true);
      dispatch(clearDeactivateSuccess());
    }
  }, [deactivateSuccess, deactivateData, dispatch]);

  useEffect(() => {
    if (suspendSuccess && suspendData) {
      setIsConfirmModalVisible(false);
      setSuccessMessage(suspendData.message || 'User suspended successfully!');
      setIsSuccessModalVisible(true);
      dispatch(clearSuspendSuccess());
    }
  }, [suspendSuccess, suspendData, dispatch]);

  useEffect(() => {
    if (revokeSuspensionSuccess && revokeSuspensionData) {
      setIsConfirmModalVisible(false);
      setSuccessMessage(
        revokeSuspensionData.message || 'Suspension revoked successfully!'
      );
      setIsSuccessModalVisible(true);
      dispatch(
        fetchUsers({
          page: 0,
          size: 10,
          searchQuery: '',
          role:
            userType.toUpperCase() === CERSAIUserRoles.SUPER_ADMIN_USER
              ? 'RA'
              : 'CU',
        })
      );
      dispatch(clearRevokeSuspensionSuccess());
    }
  }, [revokeSuspensionSuccess, revokeSuspensionData, dispatch, userType]);

  // Clear content search when switching tabs (menuAction changes)
  useEffect(() => {
    setContentSearch('');
  }, [menuAction]);

  const handleSearch = () => {
    // In Track Status mode, use fetchTrackStatusUsers
    if (isTrackStatusMode) {
      dispatch(fetchTrackStatusUsers({ page: 0, size: 10 }));
      dispatch(setCurrentPage(1));
      return;
    }

    // Use SUSPENDED filter for Revoke Suspension, otherwise use selected filter
    const effectiveStatusFilter =
      menuAction === 'Revoke Suspension' ? 'SUSPENDED' : statusFilter;

    dispatch(
      fetchUsers({
        page: 0,
        size: 10,
        searchQuery: filters.searchQuery,
        sortBy: sortBy?.key,
        order: sortBy?.order,
        status: effectiveStatusFilter,
        role: roleFilter,
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handleClear = () => {
    setRoleFilter('');
    setStatusFilter('');

    // Keep SUSPENDED filter for Revoke Suspension even after clear
    const effectiveStatusFilter =
      menuAction === 'Revoke Suspension' ? 'SUSPENDED' : '';

    dispatch(
      fetchUsers({
        page: 0,
        size: 10,
        searchQuery: '',
        status: effectiveStatusFilter,
        role:
          userType.toUpperCase() === CERSAIUserRoles.SUPER_ADMIN_USER
            ? 'RA'
            : 'CU',
      })
    );
    dispatch(setCurrentPage(1));
  };

  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    // console.log('Page click: ', newPage);
    dispatch(setCurrentPage(newPage + 1));

    // In Track Status mode, use fetchTrackStatusUsers
    if (isTrackStatusMode) {
      dispatch(fetchTrackStatusUsers({ page: newPage, size: 10 }));
      return;
    }
    // console.log('Menu Action on page change: ', menuAction);
    // Use SUSPENDED filter for Revoke Suspension
    const effectiveStatusFilter =
      menuAction === 'Revoke Suspension'
        ? 'SUSPENDED'
        : ['De-activate', 'Modify', 'Suspend'].includes(menuAction)
          ? 'ACTIVE'
          : filters.statusFilter;

    dispatch(
      fetchUsers({
        page: newPage,
        size: 10,
        searchQuery: filters.searchQuery,
        status: effectiveStatusFilter,
        sortBy: sortBy?.key,
        order: sortBy?.order,
        role:
          userType.toUpperCase() === CERSAIUserRoles.SUPER_ADMIN_USER
            ? 'RA'
            : 'CU',
      })
    );
  };

  const handleMenuItemClick = (action: string, record: any) => {
    // console.log('JItendra : ', action);
    // console.log('JItendra : ', record.originalData.id);
    // console.log('JItendra : ', record.originalData.emailId);
    // In Track Status mode, navigate to modify-user page with Track Status action
    // Use the actual userId from the workflow data, not the workflow_id
    if (isTrackStatusMode) {
      // The id field might be workflow_id, so we need to extract the actual userId
      // from the record data (it should be in the user object)
      const actualUserId = record.originalData.id;

      navigate(
        `/ckycrr-admin/sub-users/modify-user/${actualUserId}?action=Track Status`,
        {
          state: {
            user: record.originalData,
            fromTrackStatus: true,
            workflowStatus: record.originalData.operationalStatus,
            workflowData: record.originalData,
          },
        }
      );
      return;
    }

    const id = record?.originalData?.id;

    if (action === 'modify') {
      navigate(
        `/ckycrr-admin/sub-users/modify-user/${id}?action=${menuAction}`,
        {
          state: { user: record.originalData },
        }
      );
      return;
    }

    setConfirmModalType(action as 'deactivate' | 'suspend' | 'revoke');
    setIsConfirmModalVisible(true);
  };

  const handleConfirmAction = async (values: any) => {
    if (!selectedUser) return;

    try {
      switch (confirmModalType) {
        case 'deactivate': {
          const deactivatePayload: DeactivateUserRequest = {
            userId: selectedUser.id,
            reason: values.reason || '',
          };
          await dispatch(deactivateUser(deactivatePayload)).unwrap();
          break;
        }
        case 'suspend': {
          const suspendPayload: SuspendUserRequest = {
            userId: selectedUser.id,
            reason: values.reason || '',
            suspensionStartDate: values.fromDate || '',
            suspensionEndDate: values.toDate || '',
          };
          await dispatch(suspendUser(suspendPayload)).unwrap();
          break;
        }
        case 'revoke': {
          const revokePayload: RevokeSuspensionRequest = {
            userId: selectedUser.id,
            reason: values.reason || '',
          };
          await dispatch(revokeSuspension(revokePayload)).unwrap();
          break;
        }
        default:
          throw new Error('Invalid action type');
      }
    } catch (error: any) {
      console.error(`Error ${confirmModalType} user:`, error);
      const errorMessage =
        error?.message ||
        `Failed to ${confirmModalType} user. Please try again.`;
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsConfirmModalVisible(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalVisible(false);
    setSuccessMessage('');
  };

  const getModalLoadingState = () => {
    switch (confirmModalType) {
      case 'deactivate':
        return deactivateLoading;
      case 'suspend':
        return suspendLoading;
      case 'revoke':
        return revokeSuspensionLoading;
      default:
        return false;
    }
  };

  const columns =
    menuAction === 'Track Status'
      ? [
          { id: 'srNo', label: 'Sr.No.', minWidth: 80, align: 'center' },
          {
            id: 'userName',
            label: 'User Name',
            minWidth: 170,
            sortField: 'userName',
            align: 'center',
          },
          {
            id: 'userId',
            label: 'User ID',
            minWidth: 100,
            sortField: 'userId',
            align: 'center',
          },
          {
            id: 'role',
            label: 'Role',
            minWidth: 100,
            sortField: 'userRole',
            align: 'center',
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: 120,
            sortField: 'status',
            align: 'center',
          },
          {
            id: 'activity',
            label: 'Activity',
            minWidth: 150,
            sortField: 'activity',
            align: 'center',
          },
          {
            id: 'submittedOn',
            label: 'Submitted On',
            minWidth: 150,
            sortField: 'submittedOn',
            align: 'center',
          },
          {
            id: 'submittedBy',
            label: 'Submitted By',
            minWidth: 150,
            sortField: 'submittedBy',
            align: 'center',
          },
        ]
      : [
          { id: 'srNo', label: 'Sr.No.', minWidth: 80, align: 'center' },
          {
            id: 'userName',
            label: 'User Name',
            minWidth: 170,
            sortField: 'firstName',
            align: 'center',
          },
          {
            id: 'userId',
            label: 'User ID',
            minWidth: 170,
            sortField: 'userId',
            align: 'center',
          },
          {
            id: 'role',
            label: 'Role',
            minWidth: 170,
            sortField: 'roleType',
            align: 'center',
          },
          // { id: 'status', label: 'Status', minWidth: 100, align: 'center' },
          {
            id: 'lastUpdatedOn',
            label:
              menuAction === 'Revoke Suspension'
                ? 'Suspended On'
                : 'Last Updated On',
            minWidth: 150,
            sortField: 'updatedDate',
            align: 'center',
          },
          {
            id: 'lastUpdatedBy',
            label:
              menuAction === 'Revoke Suspension'
                ? 'Suspended By'
                : 'Last Updated By',
            minWidth: 150,
            sortField: 'modifiedBy',
            align: 'center',
          },
          // { id: 'action', label: 'Action', minWidth: 80, align: 'center' },
        ];

  const sortableFields =
    menuAction === 'Track Status'
      ? [
          'userName',
          'userId',
          'role',
          'submittedOn',
          'status',
          'activity',
          'submittedBy',
        ]
      : ['userName', 'userId', 'role', 'lastUpdatedOn', 'lastUpdatedBy'];

  const updateSort = (prev: ISortBy | undefined, type: string) => {
    if (!prev) {
      return { key: type, order: 'asc' };
    }
    // If same key, toggle asc/desc
    if (prev.key === type) {
      return { ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' };
    }
    // Different key, start fresh with asc
    return { key: type, order: 'asc' };
  };

  const handleSortBy = (type: string) => {
    const newValue = updateSort(sortBy, type);
    setSortBy(newValue);

    // Use SUSPENDED filter for Revoke Suspension
    const effectiveStatusFilter =
      menuAction === 'Revoke Suspension'
        ? 'SUSPENDED'
        : ['De-activate', 'Modify', 'Suspend'].includes(menuAction)
          ? 'ACTIVE'
          : filters.statusFilter;

    dispatch(
      menuAction === 'Track Status'
        ? fetchTrackStatusUsers({
            page: 0,
            size: 10,
            searchQuery: filters.searchQuery,
            status: effectiveStatusFilter,
            sortBy: newValue.key,
            sortDesc: newValue.order === 'desc',
          })
        : fetchUsers({
            page: 0,
            size: 10,
            searchQuery: filters.searchQuery,
            status: effectiveStatusFilter,
            sortBy: newValue.key,
            order: newValue.order,
            role:
              userType.toUpperCase() === CERSAIUserRoles.SUPER_ADMIN_USER
                ? 'RA'
                : 'CU',
          })
    );
    dispatch(setCurrentPage(1));
  };

  const tableData = transformUserData(currentPageData);

  // Filter table data based on content search
  // const filteredTableData = useMemo(() => {
  //   if (!contentSearch.trim()) return tableData;

  //   const searchLower = contentSearch.toLowerCase();
  //   return tableData.filter((row) => {
  //     return (
  //       row.userId?.toLowerCase().includes(searchLower) ||
  //       row.userName?.toLowerCase().includes(searchLower) ||
  //       row.role?.toLowerCase().includes(searchLower) ||
  //       row.status?.toLowerCase().includes(searchLower) ||
  //       row.activity?.toLowerCase().includes(searchLower) ||
  //       row.submittedBy?.toLowerCase().includes(searchLower) ||
  //       row.lastUpdatedBy?.toLowerCase().includes(searchLower) ||
  //       row.submittedOn?.toLowerCase().includes(searchLower) ||
  //       row.lastUpdatedOn?.toLowerCase().includes(searchLower)
  //     );
  //   });
  // }, [tableData, contentSearch]);

  useEffect(() => {
    if (contentSearch.trim().length >= 3) {
      const effectiveStatusFilter =
        menuAction === 'Revoke Suspension' ? 'SUSPENDED' : statusFilter;

      dispatch(
        menuAction === 'Track Status'
          ? fetchTrackStatusUsers({
              page: 0,
              size: 10,
              searchQuery: contentSearch,
              status: effectiveStatusFilter,
              search: contentSearch,
              sortBy: sortBy?.key,
              sortDesc: sortBy?.order === 'desc',
            })
          : fetchUsers({
              page: 0,
              size: 10,
              searchQuery: contentSearch,
              status: effectiveStatusFilter,
              search: contentSearch,
              sortBy: sortBy?.key,
              order: sortBy?.order,
              role: roleFilter,
            })
      );
      dispatch(setCurrentPage(1));
    } else if (contentSearch.trim().length === 0) {
      const effectiveStatusFilter =
        menuAction === 'Revoke Suspension' ? 'SUSPENDED' : statusFilter;

      dispatch(
        menuAction === 'Track Status'
          ? fetchTrackStatusUsers({
              page: 0,
              size: 10,
              searchQuery: '',
              status: effectiveStatusFilter,
              search: '',
              sortBy: sortBy?.key,
              sortDesc: sortBy?.order === 'desc',
            })
          : fetchUsers({
              page: 0,
              size: 10,
              searchQuery: '',
              status: effectiveStatusFilter,
              sortBy: sortBy?.key,
              search: '',
              order: sortBy?.order,
              role: roleFilter,
            })
      );
      dispatch(setCurrentPage(1));
    }
  }, [contentSearch, dispatch, menuAction, statusFilter, roleFilter, sortBy]);

  // const totalPages = Math.ceil(totalUsers / filters.pageSize);
  const totalPages = totalPagesFromApi;
  const pageNumbers = Array.from({ length: totalPages ?? 0 }, (_, i) => i);

  return (
    <DashboardContainer>
      <MainContent>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* Breadcrumb */}
          <Box sx={{ mb: 3, mx: 3 }}>
            <NavigationBreadCrumb
              crumbsData={[
                { label: 'User Management' },
                { label: 'User' },
                { label: menuAction },
              ]}
            />
          </Box>

          {/* Page Title */}
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Gilroy, sans-serif',
              fontWeight: 600,
              fontSize: '24px',
              color: '#000000',
              mb: 3,
              mx: 3,
            }}
          >
            {menuAction == 'Modify' ? 'Modify User' : menuAction}
          </Typography>

          {menuAction === 'View User Details' && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                mx: 3,
                flexWrap: 'wrap',
                alignItems: 'flex-end',
              }}
            >
              {/* Role Filter */}
              <Box sx={{ minWidth: 280 }}>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#000',
                    display: 'block',
                    mb: 1,
                    '&::after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  Role
                </Typography>
                <FormControl fullWidth size="small">
                  <MuiSelect
                    value={roleFilter}
                    onChange={handleRoleFilterChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      height: '45px',
                      fontFamily: 'Gilroy, sans-serif',
                      '& .MuiSelect-select': {
                        py: '12px',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#000',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <Typography
                        sx={{
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        Select Role
                      </Typography>
                    </MenuItem>
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="SA">Super Admin (SA)</MenuItem>
                    <MenuItem value="RA">Registry Admin (RA)</MenuItem>
                    <MenuItem value="CU">Operational User (CU)</MenuItem>
                  </MuiSelect>
                </FormControl>
              </Box>

              {/* Status Filter */}
              <Box sx={{ minWidth: 280 }}>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#000',
                    display: 'block',
                    mb: 1,
                    '&::after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  Status
                </Typography>
                <FormControl fullWidth size="small">
                  <MuiSelect
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      height: '45px',
                      fontFamily: 'Gilroy, sans-serif',
                      '& .MuiSelect-select': {
                        py: '12px',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#000',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <Typography
                        sx={{
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        Select Status
                      </Typography>
                    </MenuItem>
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="IN_ACTIVE">Inactive</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
                  </MuiSelect>
                </FormControl>
              </Box>

              {/* Search Button */}
              <MuiButton
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  bgcolor: '#002CBA',
                  color: 'white',
                  textTransform: 'none',
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  height: '45px',
                  width: '148px',
                  borderRadius: '4px',
                  px: 4,
                  '&:hover': {
                    bgcolor: '#001a8c',
                  },
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </MuiButton>

              {/* Clear Button */}
              <MuiButton
                variant="outlined"
                onClick={handleClear}
                disabled={loading}
                sx={{
                  borderColor: '#002CBA',
                  color: '#002CBA',
                  textTransform: 'none',
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  height: '45px',
                  width: '148px',
                  borderRadius: '4px',
                  px: 4,
                  '&:hover': {
                    borderColor: '#001a8c',
                    bgcolor: 'rgba(0, 44, 186, 0.04)',
                  },
                }}
              >
                Clear
              </MuiButton>
            </Box>
          )}

          {[
            'View User Details',
            'Modify',
            'Track Status',
            'De-activate',
            'Suspend',
            'Revoke Suspension',
          ].includes(menuAction) && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mb: 3,
                mx: 3,
              }}
            >
              <TextField
                placeholder="Content Search"
                size="small"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{
                        color: '#999999',
                        mr: 1,
                        fontSize: 22,
                      }}
                    />
                  ),
                }}
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': {
                    height: '45px',
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                    '& input': {
                      py: '12px',
                      '&::placeholder': {
                        color: '#999999',
                        opacity: 1,
                      },
                    },
                  },
                }}
              />
            </Box>
          )}

          {/* <PageHeader>
            <MuiButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ color: '#002CBA', textTransform: 'none' }}
            >
              Back
            </MuiButton>
          </PageHeader> */}

          {/* <FiltersContainer>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Search by
              </Typography>
              <TextField
                fullWidth
                placeholder="search by username/user ID/email address"
                value={filters.searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{ color: 'action.active', mr: 1, fontSize: 23 }}
                    />
                  ),
                }}
              />
            </Box>

            <MuiButton
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{
                bgcolor: '#002CBA',
                '&:hover': { bgcolor: '#001a8c' },
                height: '56px',
                mt: { xs: 2, sm: 0 },
              }}
            >
              Search
            </MuiButton>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <MuiSelect
                labelId="status-select-label"
                value={filters.statusFilter}
                label="Status"
                onChange={handleStatusChange}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>

            <Box
              sx={{ ml: 'auto', alignSelf: 'flex-end', mt: { xs: 2, sm: 0 } }}
            >
              <MuiButton
                variant="contained"
                onClick={() =>
                  navigate('/ckycrr-admin/sub-users/create-new-user')
                }
                sx={{
                  bgcolor: '#002CBA',
                  '&:hover': { bgcolor: '#001a8c' },
                  height: '56px',
                }}
              >
                Create New
              </MuiButton>
            </Box>
          </FiltersContainer> */}

          {/* <FiltersContainer>
           
            <Box sx={{ flex: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Search by
                </Typography>
                <TextField
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 48, // controls the input box height
                    },
                    width: '100%',
                  }}
                  placeholder="search by username/user ID/email address"
                  value={filters.searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon
                        sx={{ color: 'action.active', fontSize: 23 }}
                      />
                    ),
                  }}
                />
              </Box>

              <MuiButton
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  bgcolor: '#002CBA',
                  '&:hover': { bgcolor: '#001a8c' },
                  width: '148px',
                  height: '48px',
                  alignSelf: 'end',
                }}
              >
                Search
              </MuiButton>

             
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Status
                </Typography>
                <FormControl
                  sx={{
                    minWidth: 200,
                    height: '48px',
                    alignSelf: 'end',
                    width: '50%',
                  }}
                >
                  <MuiSelect
                    labelId="status-select-label"
                    value={filters.statusFilter}
                    onChange={handleStatusChange}
                    sx={{ height: '48px', width: '100%' }} // matches button height
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </Box>
            </Box>

           
            <Box sx={{ flex: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <MuiButton
                variant="contained"
                onClick={() =>
                  navigate('/ckycrr-admin/sub-users/create-new-user')
                }
                sx={{
                  bgcolor: '#002CBA',
                  '&:hover': { bgcolor: '#001a8c' },
                  height: '48px',
                  width: '40%',
                }}
              >
                Create New
              </MuiButton>
            </Box>
          </FiltersContainer> */}

          {/* <FiltersContainer> */}
          {/* Left section - Search and filters */}

          {/* Search input */}
          {/* <Grid container spacing={2} sx={{ mt: 3, p: 3 }}> */}
          {/* <Grid size={{ xs: 12, sm: 12, md: 6, lg: 5, xl: 5 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Search by
              </Typography>
              <TextField
                sx={{
                  '& .MuiInputBase-root': { height: 48 },
                  width: {
                    xs: '100%',
                    sm: '100%',
                    md: '100%',
                    lg: '90%',
                    xl: '90%',
                  },
                }}
                placeholder="search by username/user ID/email address"
                value={filters.searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'action.active', fontSize: 23 }} />
                  ),
                }}
              />
            </Grid> */}
          {/* Search button */}
          {/* <Grid
              size={{ xs: 12, sm: 12, md: 6, lg: 2, xl: 2 }}
              sx={{ mt: 3.5, ml: { xs: 0, sm: 0, md: 0, lg: -3, xl: 2 } }}
            >
              <MuiButton
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  bgcolor: '#002CBA',
                  '&:hover': { bgcolor: '#001a8c' },
                  height: '48px',
                  width: {
                    xs: '100%',
                    sm: '100%',
                    md: '50%',
                    lg: '90%',
                    xl: '100%',
                  },
                  // mt: { xs: 0, sm: '24px' }, // offset for the label height
                }}
              >
                SEARCH
              </MuiButton>
            </Grid> */}
          {/* <Grid size={{ xs: 12, sm: 12, md: 6, lg: 2, xl: 2 }} sx={{}}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Status
              </Typography>
              <FormControl
                sx={{
                  width: '100%',
                  height: '48px',
                }}
              >
                <MuiSelect
                  labelId="status-select-label"
                  value={filters.statusFilter}
                  onChange={handleStatusChange}
                  sx={{ height: '48px' }}
                >
                  <MenuItem value="">Select status</MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </Grid> */}

          {/* <Grid
              sx={{
                display: 'flex',

                alignItems: 'flex-end',
                ml: { xs: 0, sm: 0, lg: 'auto' },
              }}
            >
              <MuiButton
                variant="contained"
                onClick={() =>
                  navigate('/ckycrr-admin/sub-users/create-new-user')
                }
                sx={{
                  bgcolor: '#002CBA',
                  '&:hover': { bgcolor: '#001a8c' },
                  width: { xs: '100%', sm: '100%', md: '165px' },
                  height: '48px',
                  mt: { xs: 0, md: '24px' }, // offset for alignment with other elements
                }}
              >
                CREATE NEW
              </MuiButton>
            </Grid> */}
          {/* </Grid> */}

          {/* Right section - Create New button */}
          {/* </FiltersContainer> */}

          <TableWrapper>
            <TableContainer>
              <Table stickyHeader aria-label="user table">
                <TableHead>
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableCell
                        key={column.id}
                        align={(column as any).align || 'left'}
                        sx={{
                          width:
                            index === 0
                              ? '10%' // first column fixed smaller
                              : `${90 / (columns.length - 1)}%`, // remaining share equal
                          backgroundColor: '#E6EBFF',
                          fontWeight: 600,
                          position: 'sticky',
                          top: 0,
                          zIndex: 3,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          ...(index === 0 && { borderTopLeftRadius: '8px' }),
                          ...(index === columns.length - 1 && {
                            borderTopRightRadius: '8px',
                          }),
                        }}
                      >
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                          }}
                        >
                          {column.label}
                          {sortableFields.includes(column.id) ? (
                            <IconButton
                              onClick={() => {
                                if (!column?.sortField) {
                                  return;
                                }
                                handleSortBy(column.sortField);
                              }}
                              sx={{ padding: 0, ml: 0.5 }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 0,
                                }}
                              >
                                <KeyboardArrowUpIcon
                                  sx={{
                                    fontSize: '18px',
                                    color:
                                      sortBy?.key === column.sortField &&
                                      sortBy?.order === 'asc'
                                        ? '#002CBA'
                                        : '#000000',
                                    marginBottom: '-6px',
                                  }}
                                />
                                <KeyboardArrowDownIcon
                                  sx={{
                                    fontSize: '18px',
                                    color:
                                      sortBy?.key === column.sortField &&
                                      sortBy?.order === 'desc'
                                        ? '#002CBA'
                                        : '#000000',
                                    marginTop: '-6px',
                                  }}
                                />
                              </Box>
                            </IconButton>
                          ) : null}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        align="center"
                        sx={{ py: 5 }}
                      >
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : tableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        {contentSearch.trim()
                          ? 'No matching users found'
                          : 'No users found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableData.map((row) => (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.key}
                        onClick={() => handleMenuItemClick('modify', row)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#E4F6FF !important' },
                          // Make each cell in this row a positioned container
                          '& .MuiTableCell-root': {
                            position: 'relative',
                            // adjust vertical padding if needed so the line hits exactly top->bottom
                            py: 2,
                          },
                          // Draw the vertical divider for every cell except the last cell
                          '& .MuiTableCell-root:not(:last-of-type)::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '1px',
                            bgcolor: '#E0E0E0',
                            pointerEvents: 'none',
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            width: '10%',
                            textAlign: 'center',
                            color: '#002CBA',
                          }}
                        >
                          {row.srNo}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: 'center', color: '#002CBA' }}
                        >
                          {row.userName}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: 'center', color: '#002CBA' }}
                        >
                          {row.userId}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: 'center', color: '#002CBA' }}
                        >
                          {row.role === 'SA'
                            ? 'Super Admin'
                            : row.role === 'RA'
                              ? // ? 'Registry Admin'
                                'Operational'
                              : row.role === 'CU'
                                ? // ? 'CERSAI User'
                                  'Operational'
                                : row.role === 'AU'
                                  ? 'Admin'
                                  : row.role === 'OU'
                                    ? 'Operational'
                                    : row.role === 'SAU'
                                      ? 'Super Admin'
                                      : row.role}
                        </TableCell>
                        {menuAction === 'Track Status' ? (
                          <>
                            {/* Status Column */}
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography
                                sx={{
                                  fontFamily: 'Gilroy, sans-serif',
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color:
                                    row.status === 'Approval Pending'
                                      ? '#F57C00'
                                      : row.status === 'Approved'
                                        ? '#388E3C'
                                        : row.status === 'Rejected'
                                          ? '#D32F2F'
                                          : '#000000',
                                }}
                              >
                                {row.status || '-'}
                              </Typography>
                            </TableCell>
                            {/* Activity Column */}
                            <TableCell
                              sx={{ textAlign: 'center', color: '#002CBA' }}
                            >
                              {row.activity || '-'}
                            </TableCell>
                            {/* Submitted On Column */}
                            <TableCell
                              sx={{ textAlign: 'center', color: '#002CBA' }}
                            >
                              {row.submittedOn || '-'}
                            </TableCell>
                            {/* Submitted By Column */}
                            <TableCell
                              sx={{ textAlign: 'center', color: '#002CBA' }}
                            >
                              {row.submittedBy || '-'}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            {/* Last Updated On / Suspended On Column */}
                            <TableCell
                              sx={{ textAlign: 'center', color: '#002CBA' }}
                            >
                              {row.lastUpdatedOn || '-'}
                            </TableCell>
                            {/* Last Updated By / Suspended By Column */}
                            <TableCell
                              sx={{ textAlign: 'center', color: '#002CBA' }}
                            >
                              {row.lastUpdatedBy || '-'}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TableWrapper>
          {/* Pagination Section (outside table) */}
          <Box
            component="section"
            aria-label="table footer"
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '0 0 8px 8px',
              py: 2,
              px: 0,
              mx: { xs: 1.5, sm: 2, md: '24px' },
              mb: '24px',

              // Layout: 1 column on small screens, two columns (info | pagination) on md+
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
              alignItems: 'center',
              rowGap: 1.5,
            }}
          >
            {/* Left: "Showing data X–Y of Z" */}
            <Typography
              variant="body2"
              sx={{
                textAlign: { xs: 'left', md: 'inherit' },
                pl: 2,
              }}
            >
              Showing data{' '}
              {tableData.length > 0
                ? (filters.currentPage - 1) * filters.pageSize + 1
                : 0}{' '}
              to {Math.min(filters.currentPage * filters.pageSize, totalUsers)}{' '}
              of {totalUsers}
            </Typography>

            {/* Right: Pagination controls */}
            <Box
              sx={{
                justifySelf: { xs: 'stretch', md: 'end' },
                display: 'flex',
                alignItems: 'center',
                gap: '40px',

                // On very small widths, keep numbers in a single line with horizontal scroll
                flexWrap: { xs: 'nowrap', sm: 'wrap' },
                overflowX: { xs: 'auto', sm: 'visible' },
                maxWidth: '100%',
                py: { xs: 0.5, md: 0 },

                // hide scrollbar on WebKit (optional)
                '::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
              }}
            >
              <MuiButton
                variant="outlined"
                onClick={() => handlePageChange(null, filters.currentPage - 2)}
                disabled={!hasPrevPage}
                startIcon={<KeyboardArrowLeft />}
                sx={{
                  width: '106px',
                  height: '32px',
                  borderRadius: '4px',
                  border: '1px solid #D0D5DD',
                  color: '#344054',
                  textTransform: 'none',
                  padding: '12px',
                  gap: '6px',
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  '&:hover': {
                    bgcolor: '#F9FAFB',
                    borderColor: '#D0D5DD',
                  },
                }}
              >
                Previous
              </MuiButton>

              {/* Numbers: keep them in their own flex so they can scroll on xs */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: { xs: 'nowrap', sm: 'wrap' },
                }}
              >
                {pageNumbers.map((page) => {
                  const isActive = filters.currentPage === page + 1;
                  return (
                    <MuiButton
                      key={page}
                      onClick={() => handlePageChange(null, page)}
                      variant="text"
                      disableRipple
                      sx={{
                        minWidth: '32px',
                        height: '32px',
                        p: 0,
                        fontFamily: 'Gilroy-Medium',
                        fontSize: '14px',
                        color: isActive ? '#fff' : '#667085',
                        bgcolor: isActive ? '#002CBA' : 'transparent',
                        borderRadius: '6px',
                        '&:hover': {
                          bgcolor: isActive ? '#001a8c' : '#F9FAFB',
                        },
                      }}
                    >
                      {page + 1}
                    </MuiButton>
                  );
                })}
              </Box>

              <MuiButton
                variant="outlined"
                onClick={() => handlePageChange(null, filters.currentPage)}
                disabled={!hasNextPage}
                endIcon={<KeyboardArrowRight />}
                sx={{
                  width: '82px',
                  height: '32px',
                  borderRadius: '4px',
                  border: '1px solid #D0D5DD',
                  color: '#344054',
                  textTransform: 'none',
                  padding: '12px',
                  gap: '6px',
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  // fontWeight: 500,
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: { xs: 0, sm: 0, md: 0 },
                  '&:hover': {
                    bgcolor: '#F9FAFB',
                    borderColor: '#D0D5DD',
                  },
                }}
              >
                Next
              </MuiButton>
            </Box>
          </Box>
        </Box>
      </MainContent>

      <ConfirmationModal
        visible={isConfirmModalVisible}
        type={confirmModalType}
        onOk={handleConfirmAction}
        onCancel={() => setIsConfirmModalVisible(false)}
        loading={getModalLoadingState()}
      />

      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={handleSuccessModalClose}
        message={successMessage || 'Submitted for approval'}
        buttonText="Okay"
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default CertifyModifyUser;
