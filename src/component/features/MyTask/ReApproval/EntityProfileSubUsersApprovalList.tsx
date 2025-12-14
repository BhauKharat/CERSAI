/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
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
  fetchWorkflowPendingRequest,
  clearWorkflowPendingRequest,
} from './workflowPendingRequestSlice';
import { WorkflowPendingRequestData } from './workflowPendingRequestTypes';
import { useSelector } from 'react-redux';

interface SortBy {
  key: string;
  type: string;
}

const EntityProfileSubUsersApprovalList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get userId from Redux auth store
  const userId = useSelector(
    (state: any) => state.auth?.userDetails?.userId || ''
  );

  // Get state from Redux - use workflowPendingRequest slice
  const workflowState = useAppSelector(
    (state: any) => state.reApprovalWorkflowPendingRequest
  );

  console.log('🔍 Redux workflowState:', workflowState);

  // Memoize to prevent new array creation and avoid exhaustive-deps warnings
  const workflowData = React.useMemo(
    () => workflowState?.data?.data || workflowState?.data || [],
    [workflowState]
  );

  const pendingLoading = workflowState?.loading || false;
  const pendingError = workflowState?.error || null;

  console.log('📦 Extracted workflowData:', workflowData);
  console.log('⏳ Loading state:', pendingLoading);
  console.log('❌ Error state:', pendingError);

  const [sortBy, setSortBy] = useState<SortBy | undefined>();

  // Fetch data function
  const fetchData = async () => {
    if (!userId) {
      console.error('Missing reId or userId');
      return;
    }

    try {
      await dispatch(
        fetchWorkflowPendingRequest({
          filters: {
            userId: userId,
            workflow_type: 'RE_ENTITY_PROFILE_UPDATE',
            pendingWith: userId,
          },
        })
      ).unwrap();
    } catch (err: any) {
      console.error('Failed to fetch workflow pending requests:', err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
    return () => {
      dispatch(clearWorkflowPendingRequest());
    };
    // eslint-disable-next-line
  }, [dispatch, userId, sortBy]);

  // Transform workflow data to table data
  const tableData = useMemo(() => {
    console.log('🔄 Transforming workflowData to tableData:', workflowData);

    // workflowData may be a single object or an array
    if (!workflowData) {
      console.log('⚠️ No workflowData available');
      return [];
    }

    // Check if workflowData is an empty object
    if (typeof workflowData === 'object' && !Array.isArray(workflowData)) {
      // If it's an object, check if it has a workflowId (valid workflow object)
      if (!workflowData.workflowId) {
        console.log('⚠️ Empty workflow object (no workflowId)');
        return [];
      }
    }

    const list = Array.isArray(workflowData) ? workflowData : [workflowData];
    console.log('📋 Workflow list to transform:', list);

    const transformed = list
      .filter(
        (workflow: WorkflowPendingRequestData) =>
          workflow && workflow.workflowId
      )
      .map((workflow: WorkflowPendingRequestData) => {
        const submittedBy =
          workflow.submission?.submittedBy ||
          workflow.payload?.submission?.submittedBy ||
          workflow.userId;

        const submittedAt =
          workflow.submission?.submittedAt ||
          workflow.payload?.submission?.submittedAt ||
          workflow.createdAt;

        console.log(`✅ Transformed workflow ${workflow.workflowId}:`, {
          submittedBy,
          submittedAt,
          fiCode: workflow.payload?.entityDetails?.fiCode,
          institutionName: workflow.payload?.entityDetails?.nameOfInstitution,
        });

        return {
          workflowId: workflow.workflowId,
          fiCode: workflow.payload?.entityDetails?.fiCode || '',
          institutionName:
            workflow.payload?.entityDetails?.nameOfInstitution || '',
          status: workflow.status || '',
          submittedOn: submittedAt,
          submittedBy: submittedBy,
          acknowledgementNo:
            workflow.payload?.application_esign?.acknowledgementNo || '',
          userId: workflow.userId,
        };
      });

    return transformed;
  }, [workflowData]);

  const handleViewDetails = (row: any) => {
    if (!userId) {
      console.error(' Cannot navigate: user id  is missing');
      return;
    }

    const workflowId = row?.workflowId || workflowData?.workflowId;
    console.log('🔍 Navigating with:', { userId, workflowId });

    if (workflowId) {
      navigate(`/re/entity-profile-sub-user-details/${userId}/${workflowId}`);
    } else {
      navigate(`/re/entity-profile-sub-user-details/${userId}`);
    }
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
          { label: 'Entity Profile' },
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
                    Name & FI Code
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
                      onClick={() => handleSort('created_at')}
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
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1">
                        No pending approvals found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row: any, index: number) => (
                    <TableRow
                      key={row.workflowId}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#E0E5EE',
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => handleViewDetails(row)}
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
                          {String(index + 1).padStart(2, '0')}
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
                        {row.submittedBy}
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
            Showing {tableData.length}{' '}
            {tableData.length === 1 ? 'record' : 'records'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default EntityProfileSubUsersApprovalList;
