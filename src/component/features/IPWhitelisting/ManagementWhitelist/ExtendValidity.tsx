import React, { useState, useMemo, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
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
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  fetchIPWhitelisting,
  extendValidity,
  SortBy,
} from '../slices/ipWhitelistingSlice';
import DateUtils from '../../../../utils/dateUtils';

// Import the specified breadcrumb component
import NavigationBreadCrumb from '../../../features/UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';

// Import shared Success Modal
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
  StyledDatePicker,
} from '../style/ExtendValidity.styles';

// #region Type Definitions
interface HeadCell {
  id: string;
  label: string;
  sortable: boolean;
}

interface ExtensionDates {
  [key: string]: Dayjs | null;
}
// #endregion

// #region HeadCell Configuration
const headCells: readonly HeadCell[] = [
  { id: 'srNo', label: 'Sr.No.', sortable: false },
  { id: 'ipAddress', label: 'IP Address', sortable: true },
  { id: 'ipWhitelistedFor', label: 'IP Whitelisted for', sortable: true },
  { id: 'validFrom', label: 'Valid From', sortable: true },
  { id: 'validTill', label: 'Valid Till', sortable: true },
  { id: 'extendValidity', label: 'Extend Validity Till', sortable: false },
  { id: 'selectIP', label: 'Select IP', sortable: false },
];
// #endregion

const ExtendValidity = () => {
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
  const [extensionDates, setExtensionDates] = useState<ExtensionDates>({});
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

  // Initialize extension dates when data changes (Valid Till + 1 year)
  useEffect(() => {
    if (data?.content) {
      setExtensionDates((prev) => {
        const initialDates: ExtensionDates = { ...prev };
        let hasNewDates = false;
        data.content.forEach((ip) => {
          // Only initialize if not already set
          if (!prev[ip.id]) {
            initialDates[ip.id] = dayjs(ip.validTill).add(1, 'year');
            hasNewDates = true;
          }
        });
        // Only return new object if there are new dates to add
        return hasNewDates ? initialDates : prev;
      });
    }
  }, [data]);

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

  const handleDateChange = (id: string, newValue: Dayjs | null) => {
    setExtensionDates((prev) => ({ ...prev, [id]: newValue }));
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

  const handleSubmitClick = async () => {
    if (!selectedIP) return;

    // Get the extension date, or use default (1 year from validTill)
    const extensionDate = extensionDates[selectedIP];
    if (!extensionDate) {
      console.error('No extension date set for selected IP');
      return;
    }

    try {
      // Convert to ISO format for API (YYYY-MM-DDTHH:mm:ssZ)
      const extendValidTill = extensionDate.toISOString();

      const resultAction = await dispatch(
        extendValidity({
          id: selectedIP,
          extendValidTill,
        })
      );

      if (extendValidity.fulfilled.match(resultAction)) {
        // Success - show success modal
        setIsSubmitSuccess(true);
        setSuccessModalOpen(true);

        // Refresh the IP list after successful extension
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
          (resultAction.payload as string) || 'Failed to extend validity';
        setSubmitErrorMessage(errorMsg);
        setIsSubmitSuccess(false);
        setSuccessModalOpen(true);
      }
    } catch (error) {
      console.error('Error extending validity:', error);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    setSelectedIP(null);
    setSubmitErrorMessage('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MainContainer>
        <NavigationBreadCrumb
          crumbsData={[
            { label: 'IP Whitelisting' },
            { label: 'Extend Validity' },
          ]}
        />
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, fontFamily: 'Gilroy, sans-serif', mt: 2 }}
        >
          Extend Validity
        </Typography>
        <Typography variant="body2" color="#000000" sx={{ mt: 1 }}>
          Note - If Extension date is not entered, the validity will be extended
          for 1 year by default.
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

        {/* Error State */}
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTableData.length === 0 ? (
                      <TableRow>
                        <StyledTableCell
                          colSpan={7}
                          sx={{ textAlign: 'center' }}
                        >
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
                          <StyledTableCell
                            sx={{
                              position: 'relative',
                              borderRight: 'none',
                            }}
                          >
                            <StyledDatePicker
                              value={extensionDates[row.id] || null}
                              onChange={(value: unknown) =>
                                handleDateChange(
                                  row.id,
                                  value ? dayjs(value as Dayjs) : null
                                )
                              }
                              format="DD/MM/YYYY"
                              minDate={dayjs(row.validTill).add(1, 'day')}
                              slots={{ openPickerIcon: CalendarIcon }}
                            />
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
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Submit'
            )}
          </SubmitButton>
        </Box>

        {/* --- Success/Error Modal --- */}
        <SuccessModal
          open={isSuccessModalOpen}
          onClose={handleCloseSuccessModal}
          messageType={isSubmitSuccess ? 'success' : 'reject'}
          title={
            isSubmitSuccess ? 'Submitted for approval' : submitErrorMessage
          }
          okText="Okay"
        />
      </MainContainer>
    </LocalizationProvider>
  );
};

export default ExtendValidity;
