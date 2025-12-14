/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { styles } from '../../../admin-features/myTask/mytaskDash/css/NewRequest.style';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import AdminBreadcrumbUpdateProfile from '../../../admin-features/myTask/mytaskDash/AdminBreadcrumbUpdateProfile';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../admin-features/app/hooks';
import {
  fetchUserProfileSubUserApprovalList,
  clearUserProfileSubUserApprovalList,
} from './userProfileSubUserApprovalSlice';
import { UserProfileSubUserApprovalData } from './userProfileSubUserApprovalTypes';
import { useSelector } from 'react-redux';

interface SortBy {
  key: string;
  type: string;
}

const UserProfileSubUserApprovalList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get userId from Redux auth store
  const userId = useSelector(
    (state: any) => state.auth?.userDetails?.userId || ''
  );

  // Get state from Redux - use userProfileSubUserApproval slice
  const approvalState = useAppSelector(
    (state: any) => state.userProfileSubUserApproval
  );

  console.log('🔍 Redux approvalState:', approvalState);

  const approvalData: UserProfileSubUserApprovalData[] =
    approvalState?.data || [];
  const pendingLoading = approvalState?.loading || false;
  const pendingError = approvalState?.error || null;

  console.log('📦 Extracted approvalData:', approvalData);
  console.log('⏳ Loading state:', pendingLoading);
  console.log('❌ Error state:', pendingError);

  const [sortBy, setSortBy] = useState<SortBy | undefined>();

  // Fetch data function
  const fetchData = async () => {
    if (!userId) {
      console.error('Missing userId');
      return;
    }

    try {
      await dispatch(
        fetchUserProfileSubUserApprovalList({
          approverId: userId,
        })
      ).unwrap();
    } catch (err: any) {
      console.error(
        'Failed to fetch user profile sub user approval list:',
        err
      );
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
    return () => {
      dispatch(clearUserProfileSubUserApprovalList());
    };
    // eslint-disable-next-line
  }, [dispatch, userId, sortBy]);

  const handleViewDetails = (userId: string, workflowId: string) => {
    if (!userId || !workflowId) {
      console.error('Cannot navigate: userId or workflowId is missing');
      return;
    }

    navigate(`/re/user-profile-sub-user-details/${userId}/${workflowId}`);
  };

  const handleSort = (field: string) => {
    setSortBy((prev) => {
      if (!prev || prev.key !== field) {
        return { key: field, type: 'asc' };
      }
      return {
        key: field,
        type: prev.type === 'asc' ? 'desc' : 'asc',
      };
    });
  };

  const formatStatus = (status: string): string => {
    switch (status) {
      case 'SUBMITTED':
        return 'Approval Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'APPROVED_BY_CA1':
        return 'Approved by CA1';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    if (status === 'APPROVED') return 'rgba(0, 200, 83, 1)';
    if (status === 'REJECTED') return 'rgba(255, 0, 0, 1)';
    return 'rgba(255, 205, 28, 1)';
  };

  return (
    <Box className="filters-container" sx={styles.filtersContainer}>
      <Box sx={styles.backButtonContainer}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: 'black' }} />}
          onClick={() => navigate(-1)}
          sx={styles.backButton}
          style={{ textTransform: 'none' }}
        >
          Back
        </Button>
      </Box>

      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'My Task', href: '/re/update-profile' },
          { label: 'User Profile' },
        ]}
      />

      <Box>
        {pendingLoading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {pendingError && !pendingLoading && (
          <Alert severity="error" style={{ margin: '20px' }}>
            <Typography>Failed to load data: {pendingError}</Typography>
            <Button onClick={() => fetchData()}>Retry</Button>
          </Alert>
        )}

        {!pendingLoading && !pendingError && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={styles.tableHeadRow}>
                  <TableCell sx={styles.tableCell}>Sr.No.</TableCell>
                  <TableCell sx={styles.tableCell}>
                    Username & User ID
                    <IconButton
                      onClick={() => handleSort('requestorName')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    FI Name & FI Code
                    <IconButton
                      onClick={() => handleSort('fiCode')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    Status
                    <IconButton
                      onClick={() => handleSort('status')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    Submitted On
                    <IconButton
                      onClick={() => handleSort('submittedOn')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    Submitted By
                    <IconButton
                      onClick={() => handleSort('submittedBy')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {approvalData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1">
                        No pending approvals found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  approvalData.map((row: UserProfileSubUserApprovalData) => (
                    <TableRow
                      key={row.workflowId}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#E0E5EE',
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() =>
                        handleViewDetails(row.requestorUserId, row.workflowId)
                      }
                    >
                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        <Typography
                          sx={{ color: '#002CBA', cursor: 'pointer' }}
                        >
                          {String(row.srNo).padStart(2, '0')}
                        </Typography>
                        <Box
                          sx={{
                            position: 'absolute',
                            right: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '1px',
                            height: '44px',
                            border: '1px solid #002CBA',
                            opacity: 0.1,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        {row.requestorName} [{row.requestorUserId}]
                        <Box
                          sx={{
                            position: 'absolute',
                            right: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '1px',
                            height: '44px',
                            border: '1px solid #002CBA',
                            opacity: 0.1,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        {row.institutionName} [{row.fiCode}]
                        <Box
                          sx={{
                            position: 'absolute',
                            right: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '1px',
                            height: '44px',
                            border: '1px solid #002CBA',
                            opacity: 0.1,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              gap: '5px',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <CircleIcon
                              sx={{
                                fontSize: 15,
                                color: getStatusColor(row.status),
                              }}
                            />
                            <Typography
                              sx={{
                                color: getStatusColor(row.status),
                              }}
                            >
                              {formatStatus(row.status)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            right: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '1px',
                            height: '44px',
                            border: '1px solid #002CBA',
                            opacity: 0.1,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        {dayjs(row.submittedOn).format('DD/MM/YYYY hh:mmA')}
                        <Box
                          sx={{
                            position: 'absolute',
                            right: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '1px',
                            height: '44px',
                            border: '1px solid #002CBA',
                            opacity: 0.1,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={styles.tableCellBlue}>
                        {row.submittedByName || row.submittedBy}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" justifyContent="flex-start" sx={{ mt: 2, gap: 2 }}>
          <Typography>
            Showing {approvalData.length}{' '}
            {approvalData.length === 1 ? 'record' : 'records'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfileSubUserApprovalList;
