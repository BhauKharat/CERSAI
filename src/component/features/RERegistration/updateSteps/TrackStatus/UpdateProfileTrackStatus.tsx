/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import dayjs from 'dayjs';
import { styles } from './NewRequest.style';

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
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../../redux/store';
import { useDispatch } from 'react-redux';
import {
  fetchTrackStatusByUserId,
  selectTrackStatusData,
  selectTrackStatusLoading,
  selectTrackStatusError,
  Application,
} from './UpdateProfileTrackStatusSlice';
import { hideLoader } from '../../../../loader/slices/loaderSlice';
import AdminBreadcrumbUpdateProfile from '../../../../admin-features/myTask/mytaskDash/AdminBreadcrumbUpdateProfile';

const UpdateProfileTrackStatus: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  // Use the new selectors from UpdateProfileTrackStatusSlice
  const data = useSelector(selectTrackStatusData);
  const loading = useSelector(selectTrackStatusLoading);
  const error = useSelector(selectTrackStatusError);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const [contentSearchQuery, setContentSearchQuery] = React.useState('');

  // Sorting state
  const [sortBy, setSortBy] = React.useState<string>('createdAt');
  const [sortOrder, setSortOrder] = React.useState<boolean>(false); // false = descending, true = ascending

  // Pagination state
  const [page, setPage] = React.useState<number>(0);
  const [pageSize] = React.useState<number>(20);

  // Fetch data with sorting and pagination
  const fetchData = async (currentPage?: number, searchTerm?: string) => {
    try {
      const userId = userDetails?.userId;

      if (!userId) {
        console.warn('⚠️ No userId found in auth state');
        return;
      }

      console.log('🔍 Fetching track status for userId:', userId);

      await dispatch(
        fetchTrackStatusByUserId({
          userId,
          page: currentPage ?? page,
          pageSize,
          sortBy,
          sortOrder,
          searchTerm: searchTerm ?? contentSearchQuery,
        })
      ).unwrap();
    } catch (err: any) {
      console.error('❌ Failed to fetch track status:', err);
    } finally {
      dispatch(hideLoader());
    }
  };

  // Separate effect for search (debounced) and sort/page (immediate)
  React.useEffect(() => {
    if (userDetails?.userId) {
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 500); // 500ms debounce for search

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line
  }, [contentSearchQuery]);

  // Immediate effect for sorting and pagination changes
  React.useEffect(() => {
    if (userDetails?.userId) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [sortBy, sortOrder, page]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(!sortOrder);
    } else {
      // New field, default to descending (false)
      setSortBy(field);
      setSortOrder(false);
    }
    setPage(0); // Reset to first page on sort change
  };

  // Handle pagination
  // const handlePageChange = (
  //   _event: React.ChangeEvent<unknown>,
  //   newPage: number
  // ) => {
  //   setPage(newPage - 1); // MUI Pagination is 1-based, our API is 0-based
  // };
  const tableData = React.useMemo(() => {
    console.log('tableData;---', data);
    if (!data?.applications) {
      return [];
    }
    return data.applications
      .filter((app: Application | null): app is Application => app !== null)
      .map((app: Application) => ({
        key: app.workflowId || `app-${app.srNo}`,
        registartionDate: app.submittedOn,
        submittedBy: app.submittedBy,
        profileType: app.profileType,
        applicationStatus: app.status ?? 'PENDING',
        displayStatus: app.displayStatus || app.status || 'PENDING',
        acknowledgementNo: app.acknowledgementNo || '-',
        workflowId: app.workflowId,
        serialNumber: app.srNo,
      }));
  }, [data]);

  // API handles search filtering now, so we just use tableData directly
  const filteredTableData = React.useMemo(() => {
    return tableData;
  }, [tableData]);

  const hasActiveFilters = React.useMemo(() => {
    return Boolean(contentSearchQuery.trim());
  }, [contentSearchQuery]);
  const handleViewDetails = (
    acknowledgementNo: string,
    workflowIdDetail: string,
    profileType: string,
    submittedBy: string
  ) => {
    // dispatch(setWorkFlowId(workflowIdDetail));
    if (!workflowIdDetail) {
      console.log('no acknowledgementNo or workflowIdDetail');
      return;
    }

    // Navigate based on profileType with userId query parameter
    if (profileType === 'User') {
      navigate(
        `../update-trackstatus-user-details-view/${workflowIdDetail}?userId=${submittedBy}`
      );
    } else {
      // Entity or other profile types
      navigate(
        `../update-trackstatus-view/${workflowIdDetail}?userId=${submittedBy}`
      );
    }
  };

  return (
    <Box className="filters-container" sx={styles.filtersContainer}>
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          {
            label: 'Update Profile',
            href: '#',
          },
          { label: 'Track Status' },
        ]}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          sx={{
            mb: 2,
            fontWeight: 600,
            fontSize: '20px',
            color: '#000000',
            fontFamily: 'Gilroy',
          }}
        >
          Track Status
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          value={contentSearchQuery}
          onChange={(e) => setContentSearchQuery(e.target.value)}
          placeholder="Content Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9E9E9E', fontSize: '20px' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 260,
            '& .MuiOutlinedInput-root': {
              height: 40,
              backgroundColor: '#fff',
            },
            '& .MuiInputBase-input': {
              fontSize: '14px',
            },
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
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={styles.tableHeadRow}>
                    <TableCell sx={{ ...styles.tableCell, width: '60px' }}>
                      Sr.No.
                    </TableCell>
                    <TableCell
                      sx={{ ...styles.tableCell, cursor: 'pointer' }}
                      onClick={() => handleSort('workflowType')}
                    >
                      Profile Type
                      <UnfoldMoreIcon
                        sx={{
                          fontSize: '16px',
                          ml: 0.5,
                          verticalAlign: 'middle',
                          color:
                            sortBy === 'workflow_type' ? '#002CBA' : '#666666',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ ...styles.tableCell, cursor: 'pointer' }}
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <UnfoldMoreIcon
                        sx={{
                          fontSize: '16px',
                          ml: 0.5,
                          verticalAlign: 'middle',
                          color: sortBy === 'status' ? '#002CBA' : '#666666',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ ...styles.tableCell, cursor: 'pointer' }}
                      onClick={() => handleSort('createdAt')}
                    >
                      Submitted On
                      <UnfoldMoreIcon
                        sx={{
                          fontSize: '16px',
                          ml: 0.5,
                          verticalAlign: 'middle',
                          color: sortBy === 'createdAt' ? '#002CBA' : '#666666',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ ...styles.tableCell, cursor: 'pointer' }}
                      onClick={() => handleSort('submittedBy')}
                    >
                      Submitted By
                      <UnfoldMoreIcon
                        sx={{
                          fontSize: '16px',
                          ml: 0.5,
                          verticalAlign: 'middle',
                          color:
                            sortBy === 'submittedBy' ? '#002CBA' : '#666666',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredTableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body1">
                          {hasActiveFilters
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
                            backgroundColor: '#E6F3FF',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() =>
                          handleViewDetails(
                            row?.acknowledgementNo,
                            row?.workflowId,
                            row?.profileType,
                            row?.submittedBy
                          )
                        }
                      >
                        {/* Sr.No. */}
                        <TableCell
                          sx={{
                            ...styles.tableCellBlue,
                            borderRight: 'none',
                            paddingRight: '22px',
                            position: 'relative',
                          }}
                        >
                          <Box
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {String(row.serialNumber ?? index + 1).padStart(
                              2,
                              '0'
                            )}
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

                        {/* Profile Type */}
                        <TableCell
                          sx={{
                            ...styles.tableCellBlue,
                            borderRight: 'none',
                            paddingRight: '22px',
                            position: 'relative',
                          }}
                        >
                          {row.profileType}
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

                        {/* Status */}
                        <TableCell
                          sx={{
                            borderRight: 'none',
                            paddingRight: '22px',
                            position: 'relative',
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            <Typography
                              sx={{
                                color:
                                  row.applicationStatus === 'APPROVED'
                                    ? '#52AE32'
                                    : row.applicationStatus === 'REJECTED'
                                      ? '#FF0000'
                                      : row.applicationStatus === 'SUBMITTED' ||
                                          row.applicationStatus ===
                                            'IN_PROGRESS'
                                        ? '#FFCD1C'
                                        : '#FF7600',
                              }}
                            >
                              {row.displayStatus}
                            </Typography>
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

                        {/* Submitted On */}
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

                        {/* Submitted By */}
                        <TableCell sx={styles.tableCellBlue}>
                          {row.submittedBy}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Box>
  );
};

// Helper function to format status text

export default UpdateProfileTrackStatus;
