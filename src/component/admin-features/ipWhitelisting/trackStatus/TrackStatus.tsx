import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import dayjs from 'dayjs';
import DateUtils, { formatOnlyDate } from '../../../../utils/dateUtils';
import AdminBreadcrumbUpdateProfile from '../../myTask/mytaskDash/AdminBreadcrumbUpdateProfile';
import { DashboardContainer } from '../../myTask/mytaskDash/css/MyTaskDashboard.style';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Pagination,
  PaginationItem,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { styles } from '../../myTask/mytaskDash/css/NewRequest.style';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { fetchTrackStatus } from '../slices/ipWhitelistingTrackStatusSlice';
import { hideLoader } from '../../../loader/slices/loaderSlice';
import SearchableREDropdown from '../components/SearchableREDropdown';
import { ReEntity } from '../slices/reDropdownSlice';
import ViewRemarkModal from '../../../common/modals/ViewRemarkModal';
import type { WorkflowItem } from '../slices/ipWhitelistingTrackStatusSlice';

type Order = 'asc' | 'desc';

const TrackStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const trackStatusState = useAppSelector(
    (state) => state.ipWhitelistingTrackStatus
  );
  const { data, loading, error } = trackStatusState;

  const breadcrumbItems = [
    {
      label: 'IP Whitelisting',
      href: '/ckycrr-admin/ip-whitelisting/track-status',
    },
    {
      label: 'Track Status',
    },
  ];

  const [ipActionType, setIpActionType] = useState<'block' | 'unblock'>(
    'block'
  );
  const [searchType, setSearchType] = useState<'reName' | 'ipAddress'>(
    'reName'
  );
  const [selectedRe, setSelectedRe] = useState<ReEntity | null>(null);
  const [ipAddressValue, setIpAddressValue] = useState<string>('');
  const [contentSearch, setContentSearch] = useState<string>('');
  const [filtersActive, setFiltersActive] = useState(false);
  const [viewRemarkModalOpen, setViewRemarkModalOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<string>('');

  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('created_at');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const isInitialMount = useRef(true);

  const fetchData = useCallback(
    async (page: number = 1, includeFilters: boolean = false) => {
      try {
        const workflowType:
          | 'IP_WHITELISTING_BLOCKED_IP_ADDRESS'
          | 'IP_WHITELISTING_UNBLOCKED_IP_ADDRESS' =
          ipActionType === 'block'
            ? 'IP_WHITELISTING_BLOCKED_IP_ADDRESS'
            : 'IP_WHITELISTING_UNBLOCKED_IP_ADDRESS';

        const params: {
          workflowType:
            | 'IP_WHITELISTING_BLOCKED_IP_ADDRESS'
            | 'IP_WHITELISTING_UNBLOCKED_IP_ADDRESS';
          page: number;
          pageSize: number;
          sortBy: string;
          sortDesc: boolean;
          ipAddress?: string;
          reId?: string;
        } = {
          workflowType,
          page,
          pageSize,
          sortBy: orderBy,
          sortDesc: order === 'desc',
        };

        if (includeFilters) {
          if (searchType === 'ipAddress' && ipAddressValue) {
            params.ipAddress = ipAddressValue;
          }
          if (searchType === 'reName' && selectedRe) {
            params.reId = selectedRe.id;
          }
        }

        await dispatch(fetchTrackStatus(params)).unwrap();
      } catch (err: unknown) {
        console.error('Failed to fetch track status data:', err);
      } finally {
        dispatch(hideLoader());
      }
    },
    [
      dispatch,
      ipActionType,
      pageSize,
      orderBy,
      order,
      searchType,
      ipAddressValue,
      selectedRe,
    ]
  );

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchData(1);
    setCurrentPage(1);
  }, [ipActionType, fetchData]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    fetchData(currentPage, filtersActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy]);

  const handleIpActionTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIpActionType(event.target.value as 'block' | 'unblock');
    setFiltersActive(false);
  };

  const handleSearchTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchType(event.target.value as 'reName' | 'ipAddress');
    setSelectedRe(null);
    setIpAddressValue('');
  };

  const handleReChange = (value: ReEntity | null) => {
    setSelectedRe(value);
    if (value === null) {
      setFiltersActive(false);
      setCurrentPage(1);
      fetchData(1, false);
    }
  };

  const handleSearch = () => {
    setFiltersActive(true);
    setCurrentPage(1);
    fetchData(1, true);
  };

  const handleClear = () => {
    setSearchType('reName');
    setSelectedRe(null);
    setIpAddressValue('');
    setContentSearch('');
    setFiltersActive(false);
    setCurrentPage(1);
    fetchData(1, false);
  };

  // Map column IDs to API sort field names
  const sortFieldMap: Record<string, string> = {
    reName: 'reportingEntity.name',
    ipAddress: 'ipAddress',
    whitelistedFor: 'ipWhitelistedFor',
    validFrom: 'validFrom',
    validTill: 'validTill',
    blockedOn: 'created_at',
    blockedBy: 'created_by',
    status: 'status',
    statusUpdatedOn: 'created_at',
    statusUpdatedBy: 'updated_by',
  };

  const handleRequestSort = (property: string) => {
    const sortField = sortFieldMap[property] || property;
    const isAsc = orderBy === sortField && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(sortField);
  };

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    fetchData(value, filtersActive);
  };

  const [selectedRejectionRemark, setSelectedRejectionRemark] = useState<
    string | undefined
  >(undefined);
  const [selectedBlockedReason, setSelectedBlockedReason] = useState<
    string | undefined
  >(undefined);
  const [modalSubtitle, setModalSubtitle] = useState<string>(
    'Remark for Block IP'
  );

  const handleViewRemark = (
    remark: string,
    status: string,
    rejectionRemark?: string,
    blockedReason?: string
  ) => {
    setSelectedRemark(remark);
    const statusLower = status.toLowerCase();

    if (ipActionType === 'block') {
      // Block IP: Pending/Approved = Reason only, Rejected = Reason + Rejection Remark
      setModalSubtitle('Reason for Block IP');
      setSelectedBlockedReason(undefined);
      if (statusLower === 'rejected') {
        setSelectedRejectionRemark(rejectionRemark);
      } else {
        setSelectedRejectionRemark(undefined);
      }
    } else {
      // Unblock IP: Pending/Approved = Reason + Remark, Rejected = Reason + Remark + BlockedReason
      setModalSubtitle('Remark for Unblock IP');
      setSelectedRejectionRemark(rejectionRemark); // Always show remark for unblock IP
      if (statusLower === 'rejected') {
        setSelectedBlockedReason(blockedReason);
      } else {
        setSelectedBlockedReason(undefined);
      }
    }
    setViewRemarkModalOpen(true);
  };

  const handleCloseRemarkModal = () => {
    setViewRemarkModalOpen(false);
    setSelectedRemark('');
    setSelectedRejectionRemark(undefined);
    setSelectedBlockedReason(undefined);
  };

  const tableData = useMemo(() => {
    if (!data?.content) {
      return [];
    }
    return data.content.map((item: WorkflowItem, index: number) => {
      const reName =
        item.payload?.reportingEntityDetails?.reName || item.reName || '';
      const fiCode =
        item.payload?.reportingEntityDetails?.fiCode || item.fiCode || '';
      const rawStatus = item.status || '-';
      const displayStatus =
        rawStatus.toLowerCase() === 'pending'
          ? 'Approval Pending'
          : rawStatus.charAt(0).toUpperCase() +
            rawStatus.slice(1).toLowerCase();

      return {
        id: (currentPage - 1) * pageSize + index + 1,
        reNameFiCode: `${reName} ${fiCode ? `(${fiCode})` : ''}`.trim() || '-',
        ipAddress:
          item.payload?.ipWhitelisting?.ipAddress || item.ipAddress || '-',
        whitelistedFor:
          item.payload?.ipWhitelisting?.ipWhitelistedFor ||
          item.whitelistedFor ||
          '-',
        validFrom: formatOnlyDate(
          item.payload?.ipWhitelisting?.validFrom || item.validFrom
        ),
        validTill: formatOnlyDate(
          item.payload?.ipWhitelisting?.validTill || item.validTill
        ),
        blockedOn: item.created_at
          ? dayjs(item.created_at).format('DD/MM/YYYY hh:mmA')
          : '-',
        blockedBy:
          item.meta_data?.initiatedBy ||
          item.payload?.initiatorDetails?.userId ||
          '-',
        status: rawStatus,
        displayStatus,
        remark: item.payload?.ipWhitelisting?.reason || '-',
        rejectionRemark: item.payload?.remark || '-',
        blockedReason: item.payload?.ipWhitelisting?.blockedReason || '-',
        statusUpdatedOn: DateUtils.formatDate(
          item.updated_at || item.statusUpdatedOn
        ),
        statusUpdatedBy:
          item.payload?.initiatorDetails?.userId || item.statusUpdatedOn || '-',
      };
    });
  }, [data, currentPage, pageSize]);

  const filteredData = useMemo(() => {
    let filtered = [...tableData];

    if (contentSearch) {
      const searchLower = contentSearch.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          (row.reNameFiCode || '').toLowerCase().includes(searchLower) ||
          (row.ipAddress || '').toLowerCase().includes(searchLower) ||
          (row.whitelistedFor || '').toLowerCase().includes(searchLower) ||
          (row.displayStatus || '').toLowerCase().includes(searchLower) ||
          (row.statusUpdatedBy || '').toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [tableData, contentSearch]);

  const totalPages = useMemo(() => {
    if (contentSearch) {
      return filteredData.length > 0
        ? Math.ceil(filteredData.length / pageSize)
        : 0;
    }
    return data ? data.totalPages : 0;
  }, [contentSearch, filteredData.length, pageSize, data]);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
        return '#52AE32';
      case 'approval pending':
      case 'pending':
        return '#FF7600';
      case 'rejected':
        return '#FF0000';
      default:
        return '#000';
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      { id: 'id', label: 'Sr.No.', sortable: false },
      { id: 'reName', label: 'RE Name/FI Code', sortable: true },
      { id: 'ipAddress', label: 'IP Address', sortable: true },
      { id: 'whitelistedFor', label: 'IP Whitelisted for', sortable: true },
    ];

    const dateColumns =
      ipActionType === 'block'
        ? [
            { id: 'validFrom', label: 'Valid From', sortable: true },
            { id: 'validTill', label: 'Valid Till', sortable: true },
          ]
        : [
            { id: 'blockedOn', label: 'Blocked On', sortable: true },
            { id: 'blockedBy', label: 'Blocked By', sortable: true },
          ];

    const endColumns = [
      { id: 'status', label: 'Status', sortable: true },
      { id: 'remark', label: 'Remark', sortable: false },
      { id: 'statusUpdatedOn', label: 'Status Updated On', sortable: true },
      { id: 'statusUpdatedBy', label: 'Status Updated By', sortable: true },
    ];

    return [...baseColumns, ...dateColumns, ...endColumns];
  }, [ipActionType]);

  return (
    <DashboardContainer>
      <AdminBreadcrumbUpdateProfile breadcrumbItems={breadcrumbItems} />
      <Typography
        variant="h5"
        sx={{
          fontFamily: 'Gilroy-Bold, sans-serif',
          fontWeight: 600,
          fontSize: '20px',
          color: '#000',
          mt: 3,
          mb: 3,
        }}
      >
        Track Status
      </Typography>
      <Box sx={{ mb: 3 }}>
        <RadioGroup
          row
          value={ipActionType}
          onChange={handleIpActionTypeChange}
        >
          <FormControlLabel
            value="block"
            control={
              <Radio
                sx={{
                  color: ipActionType === 'block' ? '#002CBA' : '#9E9E9E',
                  '&.Mui-checked': { color: '#002CBA' },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: ipActionType === 'block' ? '#002CBA' : '#9E9E9E',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Gilroy',
                }}
              >
                Block IP
              </Typography>
            }
          />
          <FormControlLabel
            value="unblock"
            control={
              <Radio
                sx={{
                  color: ipActionType === 'unblock' ? '#002CBA' : '#9E9E9E',
                  '&.Mui-checked': { color: '#002CBA' },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: ipActionType === 'unblock' ? '#002CBA' : '#9E9E9E',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Gilroy',
                }}
              >
                Unblock IP
              </Typography>
            }
          />
        </RadioGroup>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 3,
          p: 3,
          backgroundColor: '#F7F9FF',
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RadioGroup
              row
              value={searchType}
              onChange={handleSearchTypeChange}
            >
              <FormControlLabel
                value="reName"
                control={
                  <Radio
                    sx={{
                      '&.Mui-checked': { color: '#002CBA' },
                    }}
                  />
                }
                label=""
              />
            </RadioGroup>
            <Box>
              <Typography
                sx={{
                  color: 'black',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Gilroy',
                  mb: 0.5,
                }}
              >
                Search by RE Name/FI Code
              </Typography>
              <SearchableREDropdown
                value={selectedRe}
                onChange={handleReChange}
                disabled={searchType !== 'reName'}
                placeholder="Search RE Name/FI Code..."
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RadioGroup
              row
              value={searchType}
              onChange={handleSearchTypeChange}
            >
              <FormControlLabel
                value="ipAddress"
                control={
                  <Radio
                    sx={{
                      '&.Mui-checked': { color: '#002CBA' },
                    }}
                  />
                }
                label=""
              />
            </RadioGroup>
            <Box>
              <Typography
                sx={{
                  color: 'black',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Gilroy',
                }}
              >
                Search by IP Address
              </Typography>
              <TextField
                placeholder="Enter IP Address"
                value={ipAddressValue}
                onChange={(e) => setIpAddressValue(e.target.value)}
                disabled={searchType !== 'ipAddress'}
                size="small"
                sx={{
                  minWidth: 250,
                  '& .MuiInputBase-root': {
                    backgroundColor:
                      searchType !== 'ipAddress' ? '#f5f5f5' : '#ffffff',
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                    padding: '10px 14px',
                    color: searchType !== 'ipAddress' ? '#9e9e9e' : '#000000',
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: '#9e9e9e',
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            onClick={handleSearch}
            variant="contained"
            sx={styles.searchButton}
            disabled={
              (searchType === 'reName' && !selectedRe) ||
              (searchType === 'ipAddress' && !ipAddressValue.trim())
            }
          >
            Search
          </Button>
          <Button
            onClick={handleClear}
            variant="outlined"
            sx={styles.clearButton}
            disabled={!selectedRe && !ipAddressValue.trim()}
          >
            Clear
          </Button>
        </Box>
      </Box>
      <Box sx={{ ...styles.reportingEntityRow, mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          value={contentSearch}
          onChange={(e) => setContentSearch(e.target.value)}
          placeholder="Content Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            ...styles.reportingEntityTextField,
            mr: 1,
          }}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
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
            <Button onClick={() => fetchData()}>Retry</Button>
          </Alert>
        )}

        {!loading && !error && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={styles.tableHeadRow}>
                  {columns.map((column) => (
                    <TableCell key={column.id} sx={styles.tableCell}>
                      {column.label}
                      {column.sortable && (
                        <IconButton
                          onClick={() => handleRequestSort(column.id)}
                          sx={{ color: '#000000' }}
                        >
                          <UnfoldMoreIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      align="center"
                      sx={{
                        py: 4,
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        color: '#666',
                      }}
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, index) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#E4F6FF',
                          cursor: 'pointer',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                          color: '#000',
                        }}
                      >
                        <Typography sx={{ color: '#000' }}>
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
                          color: '#000',
                        }}
                      >
                        {row.reNameFiCode}
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
                          color: '#000',
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
                          color: '#000',
                        }}
                      >
                        {row.whitelistedFor}
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
                      {ipActionType === 'block' ? (
                        <>
                          <TableCell
                            sx={{
                              ...styles.tableCellBlue,
                              borderRight: 'none',
                              paddingRight: '22px',
                              position: 'relative',
                              color: '#000',
                            }}
                          >
                            {row.validFrom}
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
                              color: '#000',
                            }}
                          >
                            {row.validTill}
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
                        </>
                      ) : (
                        <>
                          <TableCell
                            sx={{
                              ...styles.tableCellBlue,
                              borderRight: 'none',
                              paddingRight: '22px',
                              position: 'relative',
                              color: '#000',
                            }}
                          >
                            {row.blockedOn}
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
                              color: '#000',
                            }}
                          >
                            {row.blockedBy}
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
                        </>
                      )}
                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        <Typography
                          sx={{
                            color: getStatusColor(row.status),
                            fontWeight: 600,
                            fontFamily: 'Gilroy, sans-serif',
                          }}
                        >
                          {row.status.toLowerCase() === 'pending'
                            ? 'Approval Pending'
                            : row.status.charAt(0).toUpperCase() +
                              row.status.slice(1).toLowerCase()}
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
                        <Link
                          component="button"
                          onClick={() =>
                            handleViewRemark(
                              row.remark,
                              row.status,
                              row.rejectionRemark,
                              row.blockedReason
                            )
                          }
                          sx={{
                            color: '#002CBA',
                            textDecoration: 'underline',
                            fontFamily: 'Gilroy, sans-serif',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          View Remark
                        </Link>
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
                          color: '#000',
                        }}
                      >
                        {row.statusUpdatedOn}
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
                        sx={{ ...styles.tableCellBlue, color: '#000' }}
                      >
                        {row.statusUpdatedBy}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <Box display="flex" justifyContent="space-between" sx={{ mt: 2, gap: 2 }}>
        <Typography>
          Showing data {filteredData.length} of{' '}
          {contentSearch ? filteredData.length : data ? data.totalElements : 0}
        </Typography>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handleChangePage}
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

      <ViewRemarkModal
        isOpen={viewRemarkModalOpen}
        onClose={handleCloseRemarkModal}
        remark={selectedRemark}
        title="View Remarks"
        subtitle={modalSubtitle}
        rejectionRemark={selectedRejectionRemark}
        rejectionRemarkLabel="Remark for Rejection"
        blockedReason={selectedBlockedReason}
        blockedReasonLabel="Remark for Block IP"
      />
    </DashboardContainer>
  );
};

export default TrackStatus;
