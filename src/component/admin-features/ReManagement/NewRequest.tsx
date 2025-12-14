/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
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
  Select as MuiSelect,
  Typography,
  Pagination,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  PaginationItem,
  FormControl,
  MenuItem,
  styled,
  tableCellClasses,
  useMediaQuery,
  useTheme,
  // Added import for the correct event type
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchReportingEntities,
  // selectReportingEntitiesData,
} from './slices/applicationSlice';
// import { Application } from './types/applicationTypes';
import { hideLoader } from '../../loader/slices/loaderSlice';
import CircleIcon from '@mui/icons-material/Circle';
import './Dashboard.css';
// import { setWorkFlowId } from './slices/RequestDetailSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useSelector } from 'react-redux';
import { selectStatusOptions } from './slices/selectors';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
interface sortBy {
  key: string;
  type: 'asc' | 'desc';
}

type AdminReManagementProps = {
  action: 'deactivate' | 'suspend' | 'revoke' | 'update'; // or just string if more
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: 300,
  '& .MuiOutlinedInput-root': {
    height: 48,
  },
  '& .MuiInputBase-input': {
    height: '100%',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontFamily: 'Gilroy',
    fontWeight: 600,
    '&::placeholder': {
      color: 'rgba(0, 0, 0, 0.5)',
      fontSize: '14px',
      fontFamily: 'Gilroy',
      fontWeight: 600,
    },
  },

  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(0, 44, 186, 1)',
  width: 100,
  height: 48,
  textTransform: 'none',
  fontSize: '16px',
  fontFamily: 'Gilroy',
  boxShadow: 'none',
  fontWeight: 600,
  color: 'white',
  '&:hover': {
    boxShadow: 'none',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const FiltersContainer = styled(Box)(({ theme }) => ({
  background: '#fff',
  padding: '0 20px',
  borderRadius: '8px',
  [theme.breakpoints.down('md')]: {
    padding: '0',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontWeight: 700,
    fontSize: '14px',
    textAlign: 'center',
    padding: '5px 0',
    fontFamily: 'Gilroy',
    [theme.breakpoints.down('md')]: {
      fontSize: 12,
      width: '80px',
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      fontSize: 12,
      width: '80px',
    },
  },
}));

const StyledTableData = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'isWide',
})<{ isWide?: boolean }>(({ isWide, theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontWeight: 600,
    fontSize: '14px',
    textAlign: 'center',
    fontFamily: 'Gilroy',
    width: isWide ? '100px' : '200px',
    position: 'relative',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Gilroy',
    padding: '5px 0',
    width: isWide ? '100px' : '200px',
    position: 'relative',
    [theme.breakpoints.down('md')]: {
      fontSize: 12,
      width: '80px',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '10%',
      bottom: '10%',
      right: 0,
      width: '1.5px',
      backgroundColor: '#E7EBFD',
    },
  },
}));

const PaginationWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '40px',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const PaginationCountTypo = styled(Typography)(() => ({
  fontFamily: 'Gilroy',
  fontSize: '14px',
  fontWeight: 600,
}));

const SortIconWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  justifyContent: 'center',
}));

const BoxWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '24px',
  alignItems: 'flex-end',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
}));

const DateWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  gap: '24px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
}));

const StatusWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const SearchWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: theme.spacing(3),
  flex: 1,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    gap: '15px',
  },
}));

const TextFieldWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const TableContainerWrapper = styled(Box)(({ theme }) => ({
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  marginTop: '20px',
  marginBottom: '50px',
  width: '100%',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    padding: '10px',
  },
}));

const NewRequest: React.FC<AdminReManagementProps> = ({ action }) => {
  const dispatch = useAppDispatch();
  const applicationsState = useAppSelector((state) => state.reportingEntities);
  const { data, loading, error } = applicationsState;
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [actionType, setActionType] = useState(action);
  console.log('Action type in Remanagement NewRequest ', actionType);
  console.log('applicationsState Remanagement NewRequest :', applicationsState);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = useState<sortBy | undefined>();
  const statusOptions = useSelector(selectStatusOptions);

  const [selectStatus, setSelectStatus] = useState('ALL');
  const filters = {
    searchQuery: '',
    statusFilter: '',
    registrationDate: {
      fromDate: '',
      toDate: '',
    },
    currentPage: 1,
    pageSize: 10,
  };

  const [date, setDate] = useState<{
    from: string | undefined;
    to: string | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 10;

  // Use a custom debounce hook to get a debounced value of the search query

  // Fetch data on initial mount and when filters, page, or the debounced search query change
  const fetchData = async (page?: number) => {
    // dispatch(showLoader());
    try {
      await dispatch(
        fetchReportingEntities({
          page: page ? page - 1 : 0,
          size: pageSize,
          searchQuery: searchQuery || undefined,
          fromDate: date.from || undefined,
          toDate: date.to || undefined,
          sort: sortBy,
          status: selectStatus.toUpperCase() || undefined,
          name: searchQuery || undefined,
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
  }, [dispatch, pageSize, date.from, date.to, sortBy, selectStatus]);

  const handleEntitySearch = () => {
    fetchData();
  };

  const tableData = React.useMemo(() => {
    console.log('tableData;---', data);
    if (!data?.content) {
      return [];
    }
    return data.content.map((app: any, index: number) => ({
      key: index + 1,
      createdAt: app.createdAt,
      pan: app.panNo,
      status: app.operationalStatus,
      reportingEntityCode: app.fiCode,
      reId: app.reId,
    }));
  }, [data]);

  const handleViewDetails = (reId: string) => {
    // dispatch(setWorkFlowId(workflowIdDetail));
    console.log('Reid in handleViewDetails :', reId);
    if (!reId) {
      console.log('no acknowledgementNo or workflowIdDetail');
      return;
    }

    if (actionType === 'update') {
      navigate(
        `/ckycrr-admin/re-management/update-nodal-officer-and-iau/${reId}`
      );
    } else {
      navigate(`/ckycrr-admin/re-management/re-details/${reId}`, {
        state: { actionType: actionType },
      });
    }
  };

  const formatStatus = useCallback((apiStatus: string): string => {
    const statusMap: Record<string, string> = {
      ACTIVE: 'Approved',
      REJECTED: 'Rejected',
      SUSPENDED: 'Suspended',
      INACTIVE: 'Inactive',
      DEACTIVATED: 'Deactivated',
    };
    return statusMap[apiStatus] || apiStatus;
  }, []);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    fetchData(value);
    setCurrentPage(value);
  };

  const handleStatusChange = () => {
    filters.statusFilter = selectStatus;
    console.log('handleStatusChange called in Remanagement : ', selectStatus);
  };

  const handleSort = (field: string) => {
    setSortBy((prev) => {
      if (!prev || prev.key !== field) {
        return { key: field, type: 'asc' };
      }

      // Same field clicked → toggle asc/desc
      return {
        key: field,
        type: prev.type === 'asc' ? 'desc' : 'asc',
      };
    });
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <main className="main-content">
          <Button
            startIcon={<ArrowBackIcon sx={{ color: 'black' }} />}
            onClick={() => navigate(-1)}
            sx={{
              color: 'black',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Gilroy',
              textTransform: 'none',
            }}
          >
            Back
          </Button>
          <FiltersContainer>
            <BoxWrapper>
              <SearchWrapper>
                <TextFieldWrapper>
                  <Typography
                    sx={{
                      color: 'black',
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: 'Gilroy',
                    }}
                  >
                    Reporting Entity Search
                  </Typography>
                  <StyledTextField
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search Reporting Entity"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </TextFieldWrapper>
                <StyledButton onClick={handleEntitySearch} variant="contained">
                  Search
                </StyledButton>
              </SearchWrapper>

              <DateWrapper>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box>
                    <Typography
                      sx={{
                        color: 'black',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: 'Gilroy',
                      }}
                    >
                      From
                    </Typography>
                    <DatePicker
                      value={date?.from ? dayjs(date.from) : null}
                      onChange={(date: any) => {
                        console.log(date);
                        const formattedDate = date
                          ? dayjs(date).format('YYYY-MM-DD')
                          : '';
                        setDate((prev) => ({ ...prev, from: formattedDate }));
                      }}
                      maxDate={dayjs()}
                      format="DD-MM-YYYY"
                      slots={{
                        openPickerIcon: CalendarMonthIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          inputProps: {
                            placeholder: 'DD-MM-YYYY',
                            style: {
                              color: 'black',
                              fontWeight: 600,
                              fontFamily: 'Gilroy',
                              fontSize: '10px',
                            },
                          },
                          sx: {
                            flex: 1,
                            '& .MuiInputBase-root': {
                              height: '70px',
                            },
                            '& .MuiInputBase-input': {
                              padding: '14px 16px',
                              boxSizing: 'border-box',
                            },
                          },
                        },
                        openPickerIcon: {
                          sx: { color: 'black' },
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        color: 'black',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: 'Gilroy',
                      }}
                    >
                      To
                    </Typography>
                    <DatePicker
                      value={date?.to ? dayjs(date.to) : null}
                      onChange={(date: any) => {
                        const formattedDate = date
                          ? dayjs(date).format('YYYY-MM-DD')
                          : '';
                        setDate((prev) => ({ ...prev, to: formattedDate }));
                      }}
                      maxDate={dayjs()}
                      minDate={date?.from ? dayjs(date.from) : undefined}
                      format="DD-MM-YYYY"
                      slots={{
                        openPickerIcon: CalendarMonthIcon,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          placeholder: 'DD-MM-YYYY',
                          sx: {
                            flex: 1,
                            '& .MuiInputBase-root': {
                              height: '70px',
                            },
                            '& .MuiInputBase-input': {
                              padding: '14px 16px',
                              boxSizing: 'border-box',
                            },
                          },
                        },
                        openPickerIcon: {
                          sx: { color: 'black' },
                        },
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </DateWrapper>

              <StatusWrapper>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'Gilroy',
                    color: 'black',
                  }}
                >
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
                    value={selectStatus}
                    onChange={(e) => {
                      setSelectStatus(e.target.value);
                      handleStatusChange();
                    }}
                    sx={{ height: '48px' }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </StatusWrapper>
            </BoxWrapper>
          </FiltersContainer>

          <TableContainerWrapper>
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
              <TableContainer
                sx={{
                  boxShadow: 'none',
                  border: '1px solid rgba(230, 235, 255, 1)',
                  width: '100%',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  maxWidth: '100%',
                }}
                component={Paper}
              >
                <Table
                  sx={{
                    boxShadow: 'none',
                    minWidth: { xs: '100%', sm: '650px' },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgb(230, 235, 255)' }}>
                      <StyledTableCell>Sr. No.</StyledTableCell>
                      <StyledTableCell>
                        Date of Registration
                        <IconButton
                          onClick={() => handleSort('createdAt')}
                          color={
                            sortBy?.key === 'createdAt' ? 'primary' : 'default'
                          }
                        >
                          <SortIconWrapper>
                            <KeyboardArrowUpIcon sx={{ fontSize: '14px' }} />
                            <KeyboardArrowDownIcon sx={{ fontSize: '14px' }} />
                          </SortIconWrapper>
                        </IconButton>
                      </StyledTableCell>
                      <StyledTableCell>
                        PAN
                        <IconButton
                          onClick={() => handleSort('entityName')}
                          color={
                            sortBy?.key === 'entityName' ? 'primary' : 'default'
                          }
                        >
                          <SortIconWrapper>
                            <KeyboardArrowUpIcon sx={{ fontSize: '14px' }} />
                            <KeyboardArrowDownIcon sx={{ fontSize: '14px' }} />
                          </SortIconWrapper>
                        </IconButton>
                      </StyledTableCell>
                      <StyledTableCell>
                        Re Code / FI code
                        <IconButton
                          onClick={() => handleSort('fiCode')}
                          color={
                            sortBy?.key === 'fiCode' ? 'primary' : 'default'
                          }
                        >
                          <SortIconWrapper>
                            <KeyboardArrowUpIcon sx={{ fontSize: '14px' }} />
                            <KeyboardArrowDownIcon sx={{ fontSize: '14px' }} />
                          </SortIconWrapper>
                        </IconButton>
                      </StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body1">
                            No applications found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tableData?.map((row: any, index: any) => (
                        <TableRow key={row.key}>
                          <StyledTableData isWide={true}>
                            {String(
                              (currentPage - 1) * pageSize + index + 1
                            ).padStart(2, '0')}
                          </StyledTableData>
                          <StyledTableData>
                            {dayjs(row.createdAt).format('DD/MM/YY')}
                          </StyledTableData>
                          <StyledTableData>{row.pan}</StyledTableData>
                          <StyledTableData>
                            {row.reportingEntityCode}
                          </StyledTableData>
                          <StyledTableData>
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  gap: '5px',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  textAlign: 'center',
                                }}
                              >
                                {(() => {
                                  const statusColors: Record<string, string> = {
                                    INACTIVE: 'rgba(255, 205, 28, 1)', // yellow
                                    ACTIVE: 'rgba(82, 196, 26, 1)', // green
                                    DEACTIVATED: 'rgba(255, 205, 28, 1)', // yellow
                                    SUSPENDED: 'rgba(255, 77, 79, 1)', // red
                                  };

                                  const color =
                                    statusColors[row.status] ||
                                    'rgba(0,0,0,0.6)'; // fallback gray

                                  return (
                                    <>
                                      <CircleIcon
                                        sx={{
                                          fontSize: { xs: 10, md: 15 },
                                          color,
                                        }}
                                      />
                                      <Typography
                                        sx={{
                                          color,
                                          fontSize: { xs: 12, md: 14 },
                                        }}
                                      >
                                        {formatStatus(row.status)}
                                      </Typography>
                                    </>
                                  );
                                })()}
                              </Box>
                            </Box>
                          </StyledTableData>
                          <StyledTableData isWide={true}>
                            <IconButton
                              component="span"
                              onClick={() => handleViewDetails(row?.reId)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </StyledTableData>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <PaginationWrapper>
              <PaginationCountTypo>
                Showing data {tableData?.length} of{' '}
                {data ? data.totalElements : 0}
              </PaginationCountTypo>
              <Pagination
                count={data ? Math.ceil(data.totalElements / pageSize) : 0}
                page={currentPage}
                onChange={handlePageChange}
                disabled={loading}
                siblingCount={isMobile ? 0 : 1}
                boundaryCount={isMobile ? 1 : 2}
                renderItem={(item) => {
                  if (item.type === 'page') {
                    return (
                      <PaginationItem
                        {...item}
                        disabled={item.selected}
                        sx={{
                          fontSize: isMobile ? '12px' : '14px',
                          minWidth: isMobile ? '32px' : '40px',
                          height: isMobile ? '32px' : '40px',
                          color: item.selected ? 'white' : 'black',
                          backgroundColor: item.selected
                            ? 'rgba(0, 44, 186, 1)'
                            : 'white',
                          borderRadius: 1,
                          p: 0,
                          mx: 1,
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
                            sx={{
                              color: 'black',
                              borderColor: 'gray',
                              height: '40px',
                              px: 3,
                              mx: 1,
                              textTransform: 'none',
                              fontSize: '16px !important',
                              fontWeight: 500,
                              fontFamily: 'Gilroy',
                            }}
                            {...props}
                          >
                            <KeyboardArrowLeftIcon />
                            Previous
                          </Button>
                        ),
                        next: (props) => (
                          <Button
                            variant="outlined"
                            sx={{
                              color: 'black',
                              borderColor: 'rgba(209, 209, 209, 1)',
                              height: '40px',
                              px: 3,
                              mx: 1,
                              textTransform: 'none',
                              fontSize: '16px !important',
                              fontWeight: 500,
                              fontFamily: 'Gilroy',
                            }}
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
            </PaginationWrapper>
          </TableContainerWrapper>
        </main>
      </div>
    </div>
  );
};

// Helper function to format status text

export default NewRequest;
