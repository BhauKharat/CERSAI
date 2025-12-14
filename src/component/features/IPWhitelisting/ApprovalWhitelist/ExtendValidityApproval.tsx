/* eslint-disable prettier/prettier */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  fetchPendingRequests,
  approveMultipleIPWhitelistRequests,
  rejectMultipleIPWhitelistRequests,
} from '../slices/ipWhitelistingSlice';
import { styles } from '../style/style';
import RemarkForRejectionModal from '../../../common/modals/RemarkForRejectionModal';
import SuccessModal from '../../../ui/Modal/SuccessModal';
import IPBreadcrumbDashboard from '../IPBreadcrumbDashboard';
import {
  PageContainer,
  TopBarContainer,
  ActionButtonContainer,
} from '../style/ApprovalWhitelisting.style';
import DateUtils from '../../../../utils/dateUtils';

// Interface for the table data
interface ExtendValidityData {
  id: string;
  ipAddress: string;
  ipWhitelistedFor: string;
  validFrom: string;
  validTill: string;
  extendValidityTill: string;
  submittedOn: string;
  submittedBy: string;
}

const ExtendValidityApproval: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pendingRequests, loading, error } = useAppSelector(
    (state) => state.ipWhitelisting
  );

  // State to manage modals
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // State for table functionality
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof ExtendValidityData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State for selected checkboxes (multiple selection)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch pending requests on mount and when page changes
  useEffect(() => {
    dispatch(
      fetchPendingRequests({
        workflowType: 'IP_WHITELISTING_EXTEND_VALIDATION',
        page: currentPage - 1,
        pageSize: pageSize,
        status: ['PENDING'],
        sortBy: 'created_at',
        sortDesc: true,
      })
    );
  }, [dispatch, currentPage, pageSize]);

  // Map API data to table format
  const requestData: ExtendValidityData[] = useMemo(() => {
    if (!pendingRequests?.content) return [];
    return pendingRequests.content.map((item: Record<string, unknown>) => {
      // Extract data from nested payload structure
      const payload = item.payload as Record<string, unknown> | undefined;
      const ipWhitelisting = (payload?.ipWhitelisting as Record<string, unknown>) || {};
      const initiatorDetails = (payload?.initiatorDetails as Record<string, unknown>) || {};

      return {
        id: (item.workflow_id) as string,
        ipAddress: (ipWhitelisting.ipAddress || '-') as string,
        ipWhitelistedFor: (ipWhitelisting.ipWhitelistedFor || '-') as string,
        validFrom: (ipWhitelisting.validFrom) as string,
        validTill: (ipWhitelisting.validTill) as string,
        extendValidityTill: (ipWhitelisting.extendValidTill || '-') as string,
        submittedOn: (item.created_at) as string,
        submittedBy: (initiatorDetails.userId || '-') as string,
      };
    });
  }, [pendingRequests]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requestData;
    return requestData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(query)
      )
    );
  }, [requestData, search]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = String(a[sortField] ?? '').toLowerCase();
      const bValue = String(b[sortField] ?? '').toLowerCase();
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // Handlers
  const handleGoBack = () => navigate(-1);

  // Handle checkbox selection (multiple selection)
  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Handle approve button click
  const handleApproveClick = async () => {
    if (selectedIds.length === 0) return;

    try {
      // Call approve API with multiple workflow IDs
      await dispatch(
        approveMultipleIPWhitelistRequests({
          workflowIds: selectedIds,
          remarks: 'IP whitelisting extend validity approval ok',
        })
      ).unwrap();

      // Show success modal
      setActionType('approve');
      setSuccessModalOpen(true);

      // Clear selection
      setSelectedIds([]);

      // Refresh the pending requests
      dispatch(
        fetchPendingRequests({
          workflowType: 'IP_WHITELISTING_EXTEND_VALIDATION',
          page: currentPage - 1,
          pageSize: pageSize,
          status: ['PENDING'],
          sortBy: 'created_at',
          sortDesc: true,
        })
      );
    } catch (error) {
      console.error('Error approving requests:', error);
      // You can add error handling here, like showing an error toast/modal
    }
  };

  // Handler for the rejection flow
  const handleRejectSubmit = async (remark: string) => {
    if (selectedIds.length === 0) return;

    try {
      // Call reject API with array of workflow IDs
      await dispatch(
        rejectMultipleIPWhitelistRequests({
          workflowIds: selectedIds,
          remark: remark,
        })
      ).unwrap();

      // Close the remark modal
      setRejectModalOpen(false);

      // Open the success modal with reject type
      setActionType('reject');
      setSuccessModalOpen(true);

      // Clear selection
      setSelectedIds([]);

      // Refresh the pending requests
      dispatch(
        fetchPendingRequests({
          workflowType: 'IP_WHITELISTING_EXTEND_VALIDATION',
          page: currentPage - 1,
          pageSize: pageSize,
          status: ['PENDING'],
          sortBy: 'created_at',
          sortDesc: true,
        })
      );
    } catch (error) {
      console.error('Error rejecting requests:', error);
      // You can add error handling here, like showing an error toast/modal
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: keyof ExtendValidityData) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const breadcrumbItems = [
    { label: 'My Task', href: '/re/dashboard' },
    { label: 'IP Whitelisting', href: '/re/ip-whitelisting/dashboard' },
    { label: 'Extend Validity' },
  ];

  return (
    <PageContainer>
      <TopBarContainer>
        {/* <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
          Back
        </Button> */}
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
      </TopBarContainer>

      <IPBreadcrumbDashboard breadcrumbItems={breadcrumbItems} />

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
        Extend Validity
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <TextField
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Content Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 220,
            height: 48,
            '& .MuiOutlinedInput-root': { height: 48 },
            '& .MuiInputBase-input': { height: '100%', boxSizing: 'border-box' },
            '@media (max-width: 1200px)': { width: 200 },
            '@media (max-width: 600px)': { width: '100%' },
          }}
        />
      </Box>

      <Box>
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" style={{ margin: '20px' }}>
            <Typography>Failed to load data: {error}</Typography>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Alert>
        )}

        {!loading && !error && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={styles.tableHeadRow}>
                  <TableCell sx={styles.tableCell}>Sr.No.</TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      IP Address
                      <IconButton
                        onClick={() => handleSort('ipAddress')}
                        sx={{ color: '#000000', p: 0.5 }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      IP Whitelisted For
                      <IconButton
                        onClick={() => handleSort('ipWhitelistedFor')}
                        sx={{ color: '#000000', p: 0.5 }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Valid From
                      <IconButton
                        onClick={() => handleSort('validFrom')}
                        sx={{ color: '#000000', p: 0.5 }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Valid Till
                      <IconButton
                        onClick={() => handleSort('validTill')}
                        sx={{ color: '#000000', p: 0.5 }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Extend Validity Till
                      <IconButton
                        onClick={() => handleSort('extendValidityTill')}
                        sx={{ color: '#000000', p: 0.5 }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Submitted On
                      <IconButton
                        onClick={() => handleSort('submittedOn')}
                        sx={{ color: '#000000', p: 0.5 }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Submitted By
                      <IconButton
                        onClick={() => handleSort('submittedBy')}
                        sx={{ color: '#000000', p: 0.5 }}
                      >
                        <UnfoldMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>Select</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1">
                        {search.trim()
                          ? 'No results found'
                          : 'No pending requests found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((row, index) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#E4F6FF',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        <Typography >
                          {String((currentPage - 1) * pageSize + index + 1).padStart(2, '0')}
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
                        {row.ipAddress}
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
                          textAlign: 'center',
                        }}
                      >
                        {row.ipWhitelistedFor}
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
                        {row.validFrom !== '-' ? DateUtils.formatOnlyDate(row.validFrom) : '-'}
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
                        {row.validTill !== '-' ? DateUtils.formatOnlyDate(row.validTill) : '-'}
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
                        {row.extendValidityTill !== '-' ? DateUtils.formatDate(row.extendValidityTill) : '-'}
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
                        {row.submittedOn !== '-' ? DateUtils.formatDate(row.submittedOn) : '-'}
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
                        {row.submittedBy}
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
                        <Checkbox
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleCheckboxChange(row.id)}
                          sx={{
                            color: '#9E9E9E',
                            '&.Mui-checked': {
                              color: '#4CAF50',
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" justifyContent="space-between" sx={{ mt: 2, gap: 2 }}>
          <Typography>
            Showing data {sortedData.length} of{' '}
            {search.trim()
              ? sortedData.length
              : pendingRequests
                ? pendingRequests.totalElements
                : 0}
          </Typography>
          <Pagination
            count={pendingRequests ? Math.ceil(pendingRequests.totalElements / pageSize) : 0}
            page={currentPage}
            onChange={handlePageChange}
            disabled={loading}
            renderItem={(item) => {
              if (item.type === 'page') {
                return (
                  <PaginationItem
                    {...item}
                    disabled={item.selected}
                    sx={{
                      color: item.selected ? 'white' : 'black',
                      backgroundColor: item.selected ? 'rgba(0, 44, 186, 1)' : 'white',
                      borderRadius: 1,
                      p: 0,
                      mx: 3,
                      '&.Mui-selected.Mui-disabled': {
                        backgroundColor: 'rgba(0, 44, 186, 1)',
                        color: 'white',
                      },
                    }}
                  />
                );
              }

              return (
                <PaginationItem
                  components={{
                    previous: (props) => (
                      <Button
                        variant="outlined"
                        sx={styles.paginationNextPrevButton}
                        {...props}
                      >
                        <KeyboardArrowLeftIcon />
                        Previous
                      </Button>
                    ),
                    next: (props) => (
                      <Button
                        variant="outlined"
                        sx={styles.paginationNextPrevButton}
                        {...props}
                      >
                        Next
                        <KeyboardArrowRightIcon />
                      </Button>
                    ),
                  }}
                  {...item}
                />
              );
            }}
          />
        </Box>
      </Box>

      <ActionButtonContainer>
        <Button
          variant="outlined"
          onClick={() => setRejectModalOpen(true)}
          disabled={selectedIds.length === 0 || loading}
          sx={{
            mr: 2,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            fontSize: '16px',
            fontFamily: 'Gilroy, sans-serif',
            color: '#002CBA',
            borderColor: '#002CBA',
            borderRadius: '4px',
            minWidth: '120px',
            '&:hover': {
              borderColor: '#001F8E',
              backgroundColor: 'rgba(0, 44, 186, 0.04)',
            },
            '&.Mui-disabled': {
              borderColor: '#ccc',
              color: '#999',
            },
          }}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          onClick={handleApproveClick}
          disabled={selectedIds.length === 0 || loading}
          sx={{
            textTransform: 'none',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            fontSize: '16px',
            fontFamily: 'Gilroy, sans-serif',
            backgroundColor: '#002CBA',
            borderRadius: '4px',
            minWidth: '120px',
            '&:hover': {
              backgroundColor: '#001F8E',
            },
            '&.Mui-disabled': {
              backgroundColor: '#ccc',
              color: '#666',
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
            ? 'Request Approved'
            : 'Request Rejected'
        }
        okText="Okay"
      />
    </PageContainer>
  );
};

export default ExtendValidityApproval;