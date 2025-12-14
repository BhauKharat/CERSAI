/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { styles } from './mytaskDash/css/NewRequest.style';
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
  // Added import for the correct event type
} from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchApplications } from './slices/applicationSlice';
import { Application } from './types/applicationTypes';
import { hideLoader } from '../../loader/slices/loaderSlice';
import CircleIcon from '@mui/icons-material/Circle';
import './Dashboard.css';
// import { setWorkFlowId } from './slices/RequestDetailSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import AdminBreadcrumbUpdateProfile from './mytaskDash/AdminBreadcrumbUpdateProfile';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EventIcon from '@mui/icons-material/Event';
interface sortBy {
  key: string;
  type: string;
}

const ALL_STATUSES = ['PENDING', 'SUBMITTED'];

const statusMap: Record<string, string[]> = {
  All: ALL_STATUSES,
  PendingLevel1: ['SUBMITTED'], // 🔹 Level 1
  PendingLevel2: ['PENDING'],
};

const NewRequest: React.FC = () => {
  const dispatch = useAppDispatch();
  const applicationsState = useAppSelector((state) => state.applicationTask);
  const { data, loading, error } = applicationsState;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = useState<sortBy | undefined>();

  const [date, setDate] = useState<{
    from: string | undefined;
    to: string | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 10;
  const [status, setStatus] = useState(''); // 👈 dropdown state
  // Use a custom debounce hook to get a debounced value of the search query

  // Fetch data on initial mount and when filters, page, or the debounced search query change
  const fetchData = async (page?: number, filterStatus?: string) => {
    // dispatch(showLoader());
    const selectedStatusArray = statusMap[filterStatus ?? status]
      ? statusMap[filterStatus ?? status]
      : ALL_STATUSES;
    try {
      await dispatch(
        fetchApplications({
          page: page ? page - 1 : 0,
          size: pageSize,
          searchQuery: searchQuery || undefined, // Use the debounced value
          fromDate: date.from || undefined,
          toDate: date.to || undefined,
          sortBy: sortBy,
          status: selectedStatusArray,
          isModifiableRequest: false,
        })
      ).unwrap();
      if (!page) {
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
    } finally {
      dispatch(hideLoader());
    }
  };

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [dispatch, pageSize, sortBy]);

  const handleEntitySearch = () => {
    fetchData();
  };

  const handleClearSearch = () => {
    setDate({ from: undefined, to: undefined });
    setStatus('');
    // Directly fetch with cleared parameters instead of relying on state update
    dispatch(
      fetchApplications({
        page: 0,
        size: pageSize,
        searchQuery: searchQuery || undefined,
        fromDate: undefined,
        toDate: undefined,
        sortBy: sortBy,
        status: ALL_STATUSES,
        isModifiableRequest: false,
      })
    )
      .unwrap()
      .then(() => {
        setCurrentPage(1);
      })
      .catch((err: any) => {
        console.error('Failed to fetch applications:', err);
      })
      .finally(() => {
        dispatch(hideLoader());
      });
  };

  const tableData = React.useMemo(() => {
    console.log('tableData;---', data);
    if (!data?.content) {
      return [];
    }
    return data.content.map((app: Application, index: number) => {
      let actionByDisplay = '-';

      // Check if approvalWorkflow exists
      if (app?.payload?.approvalWorkflow) {
        const approvals = app.payload.approvalWorkflow.approvals || [];

        if (approvals.length > 0) {
          // Get the latest approval
          const latestApproval = approvals[approvals.length - 1];
          const actionBy = latestApproval?.actionBy;
          const actionByUserName = latestApproval?.actionByUserName;

          if (actionBy && actionByUserName) {
            actionByDisplay = `${actionByUserName} - ${actionBy}`;
          } else if (actionBy) {
            actionByDisplay = actionBy;
          }
        }
      }

      return {
        key: app?.workflow_id || `app-${index}`,
        // registartionDate: app?.created_at,
        registartionDate: app?.payload?.submission.submittedAt ?? '-',
        Name_FiCODE: 'no data',
        submittedBy:
          (app?.payload?.nodalOfficer?.noFirstName ?? '-') +
          ' ' +
          // (app?.payload?.nodalOfficer?.noLastName ?? '-'),
          ' - ' +
          app?.payload?.userId,
        reportingEntityName:
          app?.payload?.entityDetails?.nameOfInstitution || '-',
        applicationStatus: app?.payload?.approval?.approvalStatus ?? 'PENDING',
        acknowledgementNo:
          app?.payload?.application_esign?.acknowledgementNo || '-',
        workflowId: app?.workflow_id,
        userId: app?.payload?.userId || null,
        pendingAtStage: app?.payload?.approvalWorkflow?.pendingAtLevel ?? 1,
        actionBy: actionByDisplay,
        // pendingAtStage:row.pendingAtStage
      };
    });
  }, [data]);

  const filteredTableData = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return tableData;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return tableData.filter((row: any) =>
      Object.values(row).some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(lowerQuery)
      )
    );
  }, [searchQuery, tableData]);

  const handleViewDetails = (
    acknowledgementNo: string,
    workflowIdDetail: string,
    userId: string
  ) => {
    // dispatch(setWorkFlowId(workflowIdDetail));
    if (!acknowledgementNo || !workflowIdDetail || !userId) {
      console.log('no acknowledgementNo or workflowIdDetail or userId');
      return;
    }
    navigate(
      `/ckycrr-admin/my-task/requests/${acknowledgementNo}/${workflowIdDetail}/${userId}`
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
        // New field clicked → reset to asc
        return { key: field, type: 'asc' };
      }

      // Same field clicked → toggle asc/desc
      return {
        key: field,
        type: prev.type === 'asc' ? 'desc' : 'asc',
      };
    });
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
            label: 'RE Registration',
            href: '/ckycrr-admin/my-task/re-registration',
          },
          { label: 'New Registration' },
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
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="PendingLevel1">Pending Level 1</MenuItem>
                <MenuItem value="PendingLevel2">Pending Level 2</MenuItem>
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
              onClick={handleEntitySearch}
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
                    Name
                    <IconButton
                      onClick={() => handleSort('nameOfInstitution')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    Ack No
                    <IconButton
                      onClick={() => handleSort('acknowledgementNo')}
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
                      onClick={() => handleSort('userId')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1">
                        {searchQuery.trim()
                          ? 'No results found'
                          : 'No applications found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTableData.map((row: any, index: number) => (
                    <TableRow
                      key={row.key}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#E0E5EE',
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() =>
                        handleViewDetails(
                          row?.acknowledgementNo,
                          row?.workflowId,
                          row?.userId
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
                        {row.reportingEntityName}
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
                        {row.acknowledgementNo}
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
                          {/* <span
                                className={`status-dot status-${row.applicationStatus.toLowerCase()}`}
                              ></span> */}
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
                                color:
                                  row.pendingAtStage > 1
                                    ? 'rgba(255, 118, 0, 1)'
                                    : 'rgba(255, 205, 28, 1)',
                              }}
                            />
                            <Typography
                              sx={{
                                color:
                                  row.pendingAtStage > 1
                                    ? 'rgba(255, 118, 0, 1)'
                                    : 'rgba(255, 205, 28, 1)',
                              }}
                            >
                              {formatStatus(row.applicationStatus)}{' '}
                              {`[L${row.pendingAtStage}]`}
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
                        {dayjs(row.registartionDate).format(
                          'DD/MM/YYYY hh:mmA'
                        )}
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
                        {row.actionBy}
                      </TableCell>
                    </TableRow>
                  ))
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
            Showing data {filteredTableData.length} of{' '}
            {searchQuery.trim()
              ? filteredTableData.length
              : data
                ? data.totalElements
                : 0}
          </Typography>
          <Pagination
            count={data ? Math.ceil(data.totalElements / pageSize) : 0}
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
                      backgroundColor: item.selected
                        ? 'rgba(0, 44, 186, 1)'
                        : 'white',
                      borderRadius: 1,
                      p: 0,
                      mx: 3,
                      '&.Mui-selected.Mui-disabled': {
                        backgroundColor: 'rgba(0, 44, 186, 1)', // Example: light grey background
                        color: 'white', // Example: disabled text color
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
    </Box>
  );
};

// Helper function to format status text
const formatStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending Approval';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
};

export default NewRequest;
