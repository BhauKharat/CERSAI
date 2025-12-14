import React, { useState, useMemo, useEffect } from 'react';
// import dayjs from 'dayjs';
import {
  Box,
  Typography,
  InputAdornment,
  Table,
  TableBody,
  TableRow,
  TableContainer,
  TableHead,
  Radio,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  fetchIPWhitelisting,
  removeIPAddress,
  SortBy,
} from '../slices/ipWhitelistingSlice';
import DateUtils from '../../../../utils/dateUtils';

// Import the specified breadcrumb component
import NavigationBreadCrumb from '../../../features/UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';

// Import RemarkForRejectionModal
import RemarkForRejectionModal from '../../../common/modals/RemarkForRejectionModal';

// Import SuccessModal
import SuccessModal from '../../../ui/Modal/SuccessModal';

// Import styled components
import {
  MainContainer,
  HeaderContainer,
  TableWrapper,
  StyledTableHeadCell,
  StyledTableCell,
  FooterContainer,
  PaginationContainer,
  NavButton,
  PageButton,
  SearchTextField,
  SubmitButton,
} from '../style/RemoveIPAddress.styles';

// #region Type Definitions
interface HeadCell {
  id: string;
  label: string;
  sortable: boolean;
}
// #endregion

// #region HeadCell Configuration
const headCells: readonly HeadCell[] = [
  { id: 'srNo', label: 'Sr.No.', sortable: false },
  { id: 'ipAddress', label: 'IP Address', sortable: true },
  { id: 'ipWhitelistedFor', label: 'IP Whitelisted for', sortable: true },
  { id: 'validFrom', label: 'Valid From', sortable: true },
  { id: 'validTill', label: 'Valid Till', sortable: true },
];
// #endregion

const RemoveIPAddress = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(
    (state) => state.ipWhitelisting
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortBy | undefined>();
  const pageSize = 10;
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');

  // Fetch data on mount and when page/sort changes
  useEffect(() => {
    const sortField = sortBy?.key || 'createdAt';
    const sortDirection = sortBy?.type || 'desc';

    dispatch(
      fetchIPWhitelisting({
        page: currentPage - 1,
        size: pageSize,
        sortField,
        sortDirection,
      })
    );
  }, [dispatch, currentPage, sortBy]);

  // Handle sort
  const handleRequestSort = (field: string) => {
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

  // Filter data based on search query (client-side)
  const filteredTableData = useMemo(() => {
    if (!data?.content) return [];
    if (!searchQuery.trim()) return data.content;

    const lowerQuery = searchQuery.toLowerCase();
    return data.content.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(lowerQuery)
      )
    );
  }, [data, searchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = data?.totalPages || 0;

  const handleSubmitClick = () => {
    if (!selectedIP) return;
    // Open the RejectConfirmationModal to get the reason
    setRejectModalOpen(true);
  };

  const handleRejectConfirmation = async (reason: string) => {
    if (!selectedIP) return;

    try {
      const resultAction = await dispatch(
        removeIPAddress({
          id: selectedIP,
          reason: reason,
        })
      );

      setRejectModalOpen(false);

      if (removeIPAddress.fulfilled.match(resultAction)) {
        // Success - show success modal
        setIsSubmitSuccess(true);
        setSuccessModalOpen(true);

        // Refresh the IP list after successful removal
        dispatch(
          fetchIPWhitelisting({
            page: currentPage - 1,
            size: pageSize,
            sortField: sortBy?.key || 'createdAt',
            sortDirection: sortBy?.type || 'desc',
          })
        );
      } else {
        // Error handling - show error modal (error message extracted in slice)
        const errorMsg =
          (resultAction.payload as string) || 'Failed to remove IP address';
        setSubmitErrorMessage(errorMsg);
        setIsSubmitSuccess(false);
        setSuccessModalOpen(true);
      }
    } catch (error) {
      console.error('Error removing IP address:', error);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    setSelectedIP(null);
    setSubmitErrorMessage('');
  };

  return (
    <MainContainer>
      <NavigationBreadCrumb
        crumbsData={[{ label: 'IP Whitelisting' }, { label: 'Remove IP' }]}
      />
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, fontFamily: 'Gilroy, sans-serif', mt: 2 }}
      >
        Remove IP Address
      </Typography>

      <HeaderContainer>
        <SearchTextField
          size="small"
          variant="outlined"
          placeholder="Content Search"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: '#999999',
                    fontSize: 24,
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      </HeaderContainer>

      {/* Loading State */}
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

      {/* Error State for table API */}
      {error && !loading && (
        <Alert severity="error" style={{ margin: '20px 0' }}>
          <Typography>Failed to load data: {error}</Typography>
          <Button
            onClick={() =>
              dispatch(
                fetchIPWhitelisting({
                  page: currentPage - 1,
                  size: pageSize,
                })
              )
            }
          >
            Retry
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <>
          <TableWrapper>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {headCells.map((headCell) => (
                      <StyledTableHeadCell
                        key={headCell.id}
                        onClick={() =>
                          headCell.sortable && handleRequestSort(headCell.id)
                        }
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: headCell.sortable ? 'pointer' : 'default',
                          }}
                        >
                          {headCell.label}
                          {headCell.sortable && (
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                ml: 0.5,
                              }}
                            >
                              <ArrowDropUpIcon
                                sx={{
                                  height: 16,
                                  color:
                                    sortBy?.key === headCell.id &&
                                    sortBy?.type === 'asc'
                                      ? 'text.primary'
                                      : 'text.disabled',
                                }}
                              />
                              <ArrowDropDownIcon
                                sx={{
                                  height: 16,
                                  mt: '-6px',
                                  color:
                                    sortBy?.key === headCell.id &&
                                    sortBy?.type === 'desc'
                                      ? 'text.primary'
                                      : 'text.disabled',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </StyledTableHeadCell>
                    ))}
                    <StyledTableHeadCell>Select IP</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTableData.length === 0 ? (
                    <TableRow>
                      <StyledTableCell colSpan={6} sx={{ textAlign: 'center' }}>
                        <Typography variant="body1">
                          {searchQuery.trim()
                            ? 'No results found'
                            : 'No IP addresses found'}
                        </Typography>
                      </StyledTableCell>
                    </TableRow>
                  ) : (
                    filteredTableData.map((row, index) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#E4F6FF',
                          },
                        }}
                      >
                        <StyledTableCell
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {String(
                            (currentPage - 1) * pageSize + index + 1
                          ).padStart(2, '0')}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {row.ipAddress}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {row.ipWhitelistedFor}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {DateUtils.formatOnlyDate(row.validFrom)}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            position: 'relative',
                            borderRight: 'none',
                          }}
                        >
                          {DateUtils.formatOnlyDate(row.validTill)}
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '1px',
                              height: '44px',
                              border: '1px solid #002CBA',
                              opacity: 0.1,
                            }}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <Radio
                            checked={selectedIP === row.id}
                            onChange={() => setSelectedIP(row.id)}
                            value={row.id}
                            name="ip-select-radio"
                            sx={{ '&.Mui-checked': { color: '#D32F2F' } }}
                          />
                        </StyledTableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TableWrapper>

          <FooterContainer>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Showing data {filteredTableData.length} of{' '}
              {searchQuery.trim()
                ? filteredTableData.length
                : data?.totalElements || 0}
            </Typography>

            <PaginationContainer>
              <NavButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ArrowBackIosIcon
                  fontSize="small"
                  sx={{ mr: 0.5, width: 14, height: 14 }}
                />
                Previous
              </NavButton>

              {/* Page numbers */}
              {[...Array(Math.min(totalPages, 4)).keys()].map((i) => {
                const pageNum = i + 1;
                return currentPage === pageNum ? (
                  <PageButton
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    isActive={true}
                  >
                    {pageNum}
                  </PageButton>
                ) : (
                  <Typography
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    sx={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {pageNum}
                  </Typography>
                );
              })}

              <NavButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
                <ArrowForwardIosIcon
                  fontSize="small"
                  sx={{ ml: 0.5, width: 14, height: 14 }}
                />
              </NavButton>
            </PaginationContainer>
          </FooterContainer>
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <SubmitButton
          variant="contained"
          disabled={!selectedIP || loading}
          onClick={handleSubmitClick}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
        </SubmitButton>
      </Box>

      {/* Remark Modal */}
      <RemarkForRejectionModal
        isOpen={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectConfirmation}
        title="Remove IP Address"
        remarkLabel="Remark"
        remarkPlaceholder="Type your Remark here"
        remarkMaxLength={500}
        cancelLabel="Cancel"
        submitLabel="Submit"
      />

      {/* Success/Error Modal */}
      <SuccessModal
        open={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title={isSubmitSuccess ? 'Submitted for approval' : submitErrorMessage}
        okText="Okay"
        messageType={isSubmitSuccess ? 'success' : 'reject'}
      />
    </MainContainer>
  );
};

export default RemoveIPAddress;
