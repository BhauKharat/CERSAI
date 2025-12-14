/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { styles } from './css/NewRequest.style';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  TextField,
  Button,
  Typography,
  Pagination,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  PaginationItem,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EventIcon from '@mui/icons-material/Event';
import AdminBreadcrumbUpdateProfile from './AdminBreadcrumbUpdateProfile';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchUserProfilePendingApprovals,
  clearUserProfilePendingApprovals,
} from '../../request-details/slices/userProfileApprovalSlice';
import { UserProfilePendingApprovalItem } from '../../request-details/types/userProfileApprovalTypes';
import DateUtils from '../../../../utils/dateUtils';
interface SortBy {
  key: string;
  type: string;
}

const UserProfileApprovalList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get state from Redux
  const { pendingApprovals, pagination, pendingLoading, pendingError } =
    useAppSelector(
      (state: any) =>
        state.userProfileApproval || {
          pendingApprovals: [],
          pagination: null,
          pendingLoading: false,
          pendingError: null,
        }
    );

  // Debug: Log Redux state
  // eslint-disable-next-line no-console
  console.log('Redux State - pendingApprovals:', pendingApprovals);
  // eslint-disable-next-line no-console
  console.log('Redux State - pagination:', pagination);
  // eslint-disable-next-line no-console
  console.log('Redux State - pendingLoading:', pendingLoading);
  // eslint-disable-next-line no-console
  console.log('Redux State - pendingError:', pendingError);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy | undefined>();
  const [date, setDate] = useState<{
    from: string | undefined;
    to: string | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [status, setStatus] = useState('');

  // Fetch data function
  const fetchData = async (page?: number, filterStatus?: string) => {
    try {
      await dispatch(
        fetchUserProfilePendingApprovals({
          page: page ? page - 1 : 0,
          pageSize,
          searchTerm: searchQuery || undefined,
          fromDate: date.from || undefined,
          toDate: date.to || undefined,
          status: filterStatus || status || undefined,
          sortBy: sortBy?.key || 'created_at',
          sortDesc: sortBy?.type !== 'asc',
        })
      ).unwrap();

      if (!page) {
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error('Failed to fetch user profile approvals:', err);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      dispatch(clearUserProfilePendingApprovals());
    };
    // eslint-disable-next-line
  }, [dispatch, sortBy]);

  const handleSearch = () => {
    fetchData();
  };

  const handleClearSearch = () => {
    setDate({ from: undefined, to: undefined });
    setStatus('');
    setSearchQuery('');

    dispatch(
      fetchUserProfilePendingApprovals({
        page: 0,
        pageSize,
        sortBy: 'created_at',
        sortDesc: true,
      })
    )
      .unwrap()
      .then(() => {
        setCurrentPage(1);
      })
      .catch((err: any) => {
        console.error('Failed to fetch approvals:', err);
      });
  };

  // Table data from Redux (same as EntityProfileApprovalList)
  const tableData = useMemo(() => {
    return pendingApprovals || [];
  }, [pendingApprovals]);

  // Content search filtering (client-side)
  const filteredData = useMemo(() => {
    let filtered = [...tableData];

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (row: UserProfilePendingApprovalItem) =>
          (row.requestorName || row.userName || '')
            .toLowerCase()
            .includes(searchLower) ||
          (row.requestorUserId || row.userId || '')
            .toLowerCase()
            .includes(searchLower) ||
          (row.institutionName || '').toLowerCase().includes(searchLower) ||
          (row.fiCode || '').toLowerCase().includes(searchLower) ||
          (row.status || '').toLowerCase().includes(searchLower) ||
          (row.submittedByName || row.submittedBy || '')
            .toLowerCase()
            .includes(searchLower)
      );
    }

    return filtered;
  }, [tableData, searchQuery]);

  // Calculate total pages based on content search
  const totalPages = useMemo(() => {
    if (searchQuery) {
      return filteredData.length > 0
        ? Math.ceil(filteredData.length / pageSize)
        : 0;
    }
    return pagination?.totalPages || 0;
  }, [searchQuery, filteredData.length, pageSize, pagination]);

  const handleViewDetails = (
    workflowId: string,
    acknowledgementNo: string,
    requestorUserId: string
  ) => {
    if (!workflowId) {
      console.log('No workflowId available');
      return;
    }
    navigate(
      `/ckycrr-admin/my-task/update-profile/user-profile/details/${acknowledgementNo}/${workflowId}/${requestorUserId}`
    );
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    fetchData(value);
    setCurrentPage(value);
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

  const formatStatus = (status: string, level?: number): string => {
    switch (status) {
      case 'SUBMITTED':
        return `Approval Pending [L${level || 1}]`;
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

  const getStatusColor = (status: string, level?: number): string => {
    if (status === 'APPROVED') return 'rgba(0, 200, 83, 1)';
    if (status === 'REJECTED') return 'rgba(255, 0, 0, 1)';
    if (level && level > 1) return 'rgba(255, 118, 0, 1)';
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
          { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
          {
            label: 'Update Profile',
            href: '/ckycrr-admin/my-task/update-profile',
          },
          { label: 'User Profile' },
        ]}
      />

      <Box sx={styles.searchSection}>
        {/* First Row: Status + From Date + To Date + Buttons */}
        <Box sx={styles.firstRow}>
          {/* Status */}
          <Box sx={styles.inputBox}>
            <Typography sx={styles.statusLabel}>Status</Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  fetchData(undefined, e.target.value);
                }}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  height: 48,
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                    color: '#666',
                  },
                }}
              >
                <MenuItem disabled value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="SUBMITTED">Pending Approval</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* From Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={styles.inputBox}>
              <Typography sx={styles.statusLabel}>From Date</Typography>
              <DatePicker
                value={date?.from ? dayjs(date.from, 'YYYY-MM-DD') : null}
                onChange={(d) =>
                  setDate((prev) => ({
                    ...prev,
                    from: d ? dayjs(d).format('YYYY-MM-DD') : '',
                  }))
                }
                maxDate={dayjs()}
                format="DD/MM/YYYY"
                slots={{
                  openPickerIcon: EventIcon,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    placeholder: 'DD/MM/YYYY',
                    sx: styles.datePickerInput,
                  },
                  openPickerButton: {
                    sx: {
                      color: '#666',
                      fontSize: '20px',
                    },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          {/* To Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={styles.inputBox}>
              <Typography sx={styles.statusLabel}>To Date</Typography>
              <DatePicker
                value={date?.to ? dayjs(date.to, 'YYYY-MM-DD') : null}
                onChange={(d: any) =>
                  setDate((prev) => ({
                    ...prev,
                    to: d ? dayjs(d).format('YYYY-MM-DD') : '',
                  }))
                }
                maxDate={dayjs()}
                format="DD/MM/YYYY"
                slots={{
                  openPickerIcon: EventIcon,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    placeholder: 'DD/MM/YYYY',
                    sx: styles.datePickerInput,
                  },
                  openPickerButton: {
                    sx: {
                      color: '#666',
                      fontSize: '20px',
                    },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              onClick={handleSearch}
              variant="contained"
              sx={styles.searchButton}
            >
              Search
            </Button>
            <Button
              onClick={handleClearSearch}
              variant="outlined"
              sx={styles.clearButton}
            >
              Clear Search
            </Button>
          </Box>
        </Box>

        {/* Second Row: Search Input */}
        <Box sx={{ ...styles.reportingEntityRow }}>
          <TextField
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Content Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={styles.reportingEntityTextField}
          />
        </Box>
      </Box>

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
                    User Name & User ID
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
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1">
                        No pending approvals found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map(
                    (row: UserProfilePendingApprovalItem, index: number) => (
                      <TableRow
                        key={row.workflowId}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#E0E5EE',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() =>
                          handleViewDetails(
                            row.workflowId,
                            row.acknowledgementNo,
                            row.requestorUserId || row.userId || ''
                          )
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
                            {String(
                              (currentPage - 1) * pageSize + index + 1
                            ).padStart(2, '0')}
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
                          {row.requestorName || row.userName} -{' '}
                          {row.requestorUserId || row.userId}
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
                                  color: getStatusColor(
                                    row.status,
                                    row.approvalLevel
                                  ),
                                }}
                              />
                              <Typography
                                sx={{
                                  color: getStatusColor(
                                    row.status,
                                    row.approvalLevel
                                  ),
                                }}
                              >
                                {row.displayStatus ||
                                  formatStatus(row.status, row.approvalLevel)}
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
                          {DateUtils.formatOnlyDate(row.submittedOn)}
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
                    )
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ mt: 2, gap: 2 }}
        >
          <Typography>
            Showing data {filteredData.length} of{' '}
            {searchQuery ? filteredData.length : pagination?.totalCount || 0}
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            disabled={pendingLoading}
            renderItem={(item) => {
              if (item.type === 'page') {
                return (
                  <PaginationItem
                    {...item}
                    disabled={item.selected}
                    sx={{
                      color: item.selected ? 'white' : 'black',
                      backgroundColor: item.selected
                        ? 'rgba(0, 44, 186, 1)'
                        : 'white',
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
                  slots={{
                    previous: () => (
                      <Box
                        component="span"
                        sx={{
                          ...styles.paginationNextPrevButton,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <KeyboardArrowLeftIcon />
                        Previous
                      </Box>
                    ),
                    next: () => (
                      <Box
                        component="span"
                        sx={{
                          ...styles.paginationNextPrevButton,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        Next
                        <KeyboardArrowRightIcon />
                      </Box>
                    ),
                  }}
                  {...item}
                  sx={styles.paginationNextPrevButton}
                />
              );
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfileApprovalList;
