/* eslint-disable prettier/prettier */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  fetchPendingRequests,
  approveMultipleIPWhitelistRequests,
  rejectMultipleIPWhitelistRequests,
} from '../slices/ipWhitelistingSlice';
import { styles } from '../style/style'; // Assuming styles are defined in this path)
import RemarkForRejectionModal from '../../../common/modals/RemarkForRejectionModal';
import SuccessModal from '../../../ui/Modal/SuccessModal';

// import CommonTable from '../CommonIPTable'; // Path to your CommonTable component
import IPBreadcrumbDashboard from '../IPBreadcrumbDashboard'; // Path to your Breadcrumb component
import {
  PageContainer,
  TopBarContainer,
  ActionButtonContainer,
} from '../style/ApprovalWhitelisting.style'; // Path to your styled components
import DateUtils from '../../../../utils/dateUtils';

// Interface for the table data
interface PublicKeyData {
  id: string;
  publicKey: string;
  validFrom: string;
  validTill: string;
  submittedOn: string;
  submittedBy: string;
}

const IPWhitelistApproval: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pendingRequests, loading } = useAppSelector(
    (state) => state.ipWhitelisting
  );

  // State to manage modals
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // Fetch pending requests on mount (only 1 item needed)
  useEffect(() => {
    dispatch(
      fetchPendingRequests({
        workflowType: 'IP_WHITELISTING_UPLOAD_REPLACE_PUBLIC_KEY',
        page: 0,
        pageSize: 1,
        status: ['PENDING'],
        sortBy: 'created_at',
        sortDesc: true,
      })
    );
  }, [dispatch]);

  // Map API data to table format
  const requestData: PublicKeyData[] = useMemo(() => {
    if (!pendingRequests?.content) return [];
    return pendingRequests.content.map((item: Record<string, unknown>) => {
      const payload = item.payload as Record<string, unknown> | undefined;
      const ipWhitelistingPublicKey = payload?.ipWhitelistingPublicKey as Record<string, unknown> | undefined;
      const initiatorDetails = payload?.initiatorDetails as Record<string, unknown> | undefined;

      return {
        id: (item.workflow_id || item.id || '-') as string,
        publicKey: (ipWhitelistingPublicKey?.fileName || '-') as string,
        validFrom: (ipWhitelistingPublicKey?.validFrom || '-') as string,
        validTill: (ipWhitelistingPublicKey?.validTill || '-') as string,
        submittedOn: (item.created_at || '-') as string,
        submittedBy: (initiatorDetails?.userId || '-') as string,
      };
    });
  }, [pendingRequests]);


  // --- Handlers ---
  const handleGoBack = () => navigate(-1);

  // Handle approve button click
  const handleApproveClick = async () => {
    const firstItem = requestData[0];
    if (!firstItem) return;

    try {
      // Call approve API with workflow ID in array and fileName
      await dispatch(
        approveMultipleIPWhitelistRequests({
          workflowIds: [firstItem.id],
          remarks: '',
        })
      ).unwrap();

      // Show success modal
      setActionType('approve');
      setSuccessModalOpen(true);

      // Refresh the pending requests
      dispatch(
        fetchPendingRequests({
          workflowType: 'IP_WHITELISTING_UPLOAD_REPLACE_PUBLIC_KEY',
          page: 0,
          pageSize: 1,
          status: ['PENDING'],
          sortBy: 'created_at',
          sortDesc: true,
        })
      );
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  // Handler for the rejection flow
  const handleRejectSubmit = async (remark: string) => {
    const firstItem = requestData[0];
    if (!firstItem) return;

    try {
      // Call reject API with array of workflow IDs
      await dispatch(
        rejectMultipleIPWhitelistRequests({
          workflowIds: [firstItem.id],
          remark: remark,
        })
      ).unwrap();

      // Close the remark modal only after API success
      setRejectModalOpen(false);

      // Open the success modal with reject type
      setActionType('reject');
      setSuccessModalOpen(true);

      // Refresh the pending requests
      dispatch(
        fetchPendingRequests({
          workflowType: 'IP_WHITELISTING_UPLOAD_REPLACE_PUBLIC_KEY',
          page: 0,
          pageSize: 1,
          status: ['PENDING'],
          sortBy: 'created_at',
          sortDesc: true,
        })
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Keep the modal open on error so user can retry
    }
  };

  const breadcrumbItems = [
    { label: 'My Task', href: '/re/dashboard' },
    { label: 'IP Whitelisting', href: '/re/ip-whitelisting/dashboard' },
    { label: 'Upload/Replace Public Key' },
  ];

  const columns = [
    {
      label: 'Public Key',
      field: 'publicKey' as keyof PublicKeyData,
      sortable: false,
      render: (row: PublicKeyData) => row.publicKey || '-',
    },
    {
      label: 'Valid From',
      field: 'validFrom' as keyof PublicKeyData,
      sortable: false,
      render: (row: PublicKeyData) => DateUtils.formatOnlyDate(row.validFrom) || '-',
    },
    {
      label: 'Valid Till',
      field: 'validTill' as keyof PublicKeyData,
      sortable: false,
      render: (row: PublicKeyData) => DateUtils.formatOnlyDate(row.validTill) || '-',
    },
    {
      label: 'Submitted On',
      field: 'submittedOn' as keyof PublicKeyData,
      sortable: false,
      render: (row: PublicKeyData) => DateUtils.formatDate(row.submittedOn) || '-',
    },
    {
      label: 'Submitted By',
      field: 'submittedBy' as keyof PublicKeyData,
      sortable: false,
      render: (row: PublicKeyData) => row.submittedBy || '-',
    },
  ];

  return (
    <PageContainer>
      <TopBarContainer>
        {/* <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
          Back
        </Button> */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
          onClick={handleGoBack}
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
      </TopBarContainer>

      <IPBreadcrumbDashboard breadcrumbItems={breadcrumbItems} />

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
        Upload/Replace Public Key
      </Typography>

      <TableContainer component={Paper} sx={styles.tableContainer}>
        <Table sx={styles.table}>
          <TableHead>
            <TableRow sx={styles.tableHeadRow}>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={styles.tableHeadCell}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {column.label}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {requestData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body1">
                    {loading ? 'Loading...' : 'No pending requests found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              requestData.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#E4F6FF',
                    },
                  }}
                >
                  {columns.map((column, index) => (
                    <TableCell
                      key={column.field}
                      sx={{
                        ...styles.tableCellBlue,
                        borderRight: 'none',
                        paddingRight: '22px',
                        position: 'relative',
                        textAlign: 'center',
                      }}
                    >
                      {column.render(row)}
                      {index < columns.length - 1 && (
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
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ActionButtonContainer>
        <Button
          variant="outlined"
          onClick={() => setRejectModalOpen(true)}
          disabled={requestData.length === 0 || loading}
          sx={{
            mr: 2,
            textTransform: 'none',
            px: 4,
            py: 1,
            fontWeight: 500,
            fontSize: '16px',
            minWidth: '120px',
            borderColor: '#002CBA',
            color: '#002CBA',
            '&:hover': {
              borderColor: '#0022A3',
              backgroundColor: 'rgba(0, 44, 186, 0.04)',
            },
          }}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          onClick={handleApproveClick}
          disabled={requestData.length === 0 || loading}
          sx={{
            textTransform: 'none',
            px: 4,
            py: 1,
            fontWeight: 500,
            fontSize: '16px',
            minWidth: '120px',
            backgroundColor: '#002CBA',
            color: 'white',
            '&:hover': {
              backgroundColor: '#0022A3',
            },
            '&:disabled': {
              backgroundColor: '#F0F0F0',
              color: '#A0A0A0',
            },
          }}
        >
          Approve
        </Button>
      </ActionButtonContainer>

      {/* Reject Remark Input Modal */}
      <RemarkForRejectionModal
        isOpen={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
        title="Remark for Rejection"
        remarkLabel="Remark"
        remarkPlaceholder="Type your Remark here"
        remarkMaxLength={500}
        cancelLabel="Cancel"
        submitLabel="Submit"
      />

      {/* Success/Reject Modal */}
      <SuccessModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        messageType={actionType === 'approve' ? 'success' : 'reject'}
        title={
          actionType === 'approve'
            ? 'Request Approved '
            : 'Request Rejected '
        }
        okText="Okay"
      />
    </PageContainer>
  );
};

export default IPWhitelistApproval;
