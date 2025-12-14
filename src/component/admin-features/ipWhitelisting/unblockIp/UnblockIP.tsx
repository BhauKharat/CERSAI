import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
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
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { styles } from '../../myTask/mytaskDash/css/NewRequest.style';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { fetchIPWhitelisting } from '../slices/ipWhitelistingSlice';
import { hideLoader } from '../../../loader/slices/loaderSlice';
import SearchableREDropdown from '../components/SearchableREDropdown';
import { ReEntity } from '../slices/reDropdownSlice';
import {
  blockIpStatusUpdate,
  resetBlockIpState,
  selectBlockIpError,
  selectBlockIpErrorData,
} from '../slices/blockIpSlice';
import RemarkForRejectionModal from '../../../common/modals/RemarkForRejectionModal';
import SuccessModal from '../../../ui/Modal/SuccessModal';
import ViewRemarkModal from '../../../common/modals/ViewRemarkModal';
import DateUtils from '../../../../../src/utils/dateUtils';
interface UnblockIPS {
  id: string;
  srNo: number;
  reName: string;
  fiCode: string;
  ipAddress: string;
  ipWhitelistedFor: string;
  validFrom: string;
  validTill: string;
  lastUpdatedOn: string;
  lastUpdatedBy: string;
  status: string;
  reason?: string;
}

type Order = 'asc' | 'desc';

const UnblockIP: React.FC = () => {
  const dispatch = useAppDispatch();
  const ipWhitelistingState = useAppSelector(
    (state) => state.ipWhitelistingAdmin
  );
  const { data, loading, error } = ipWhitelistingState;
  const submitError = useAppSelector(selectBlockIpError);
  const submitErrorData = useAppSelector(selectBlockIpErrorData);

  const breadcrumbItems = [
    {
      label: 'IP Whitelisting',
      href: '/ckycrr-admin/ip-whitelisting/unblock-ips',
    },
    {
      label: 'Unblock IP Address',
    },
  ];

  const [searchType, setSearchType] = useState<'reName' | 'ipAddress'>(
    'reName'
  );
  const [selectedRe, setSelectedRe] = useState<ReEntity | null>(null);
  const [ipAddressValue, setIpAddressValue] = useState<string>('');
  const [contentSearch, setContentSearch] = useState<string>('');
  const [selectedIPs, setSelectedIPs] = useState<string[]>([]);
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [viewRemarkModalOpen, setViewRemarkModalOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<string>('');

  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('createdAt');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const isInitialMount = useRef(true);

  const fetchData = useCallback(
    async (page?: number) => {
      try {
        await dispatch(
          fetchIPWhitelisting({
            page: page ? page - 1 : 0,
            size: pageSize,
            sortField: orderBy,
            sortDirection: order,
            searchQuery: contentSearch || undefined,
            searchText: searchType === 'ipAddress' ? ipAddressValue : undefined,
            reId:
              searchType === 'reName' && selectedRe ? selectedRe.id : undefined,
            status: 'BLOCKED',
          })
        ).unwrap();
        if (!page) {
          setCurrentPage(1);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch IP whitelisting data:', err);
      } finally {
        dispatch(hideLoader());
      }
    },
    [
      dispatch,
      pageSize,
      orderBy,
      order,
      contentSearch,
      searchType,
      ipAddressValue,
      selectedRe,
    ]
  );

  // Initial load
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when sorting changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (currentPage === 1) {
      fetchData();
    } else {
      fetchData(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy]);

  const handleSearchTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchType(event.target.value as 'reName' | 'ipAddress');
    setSelectedRe(null);
    setIpAddressValue('');
  };

  const handleReChange = async (value: ReEntity | null) => {
    setSelectedRe(value);
    if (value === null) {
      try {
        await dispatch(
          fetchIPWhitelisting({
            page: currentPage - 1,
            size: pageSize,
            sortField: orderBy,
            sortDirection: order,
            searchQuery: contentSearch || undefined,
            searchText: undefined,
            reId: undefined,
            status: 'BLOCKED',
          })
        ).unwrap();
      } catch (err: unknown) {
        console.error('Failed to fetch IP whitelisting data:', err);
      } finally {
        dispatch(hideLoader());
      }
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleClear = async () => {
    setSearchType('reName');
    setSelectedRe(null);
    setIpAddressValue('');
    setContentSearch('');
    try {
      await dispatch(
        fetchIPWhitelisting({
          page: 0,
          size: pageSize,
          sortField: orderBy,
          sortDirection: order,
          searchQuery: undefined,
          searchText: undefined,
          reId: undefined,
          status: 'BLOCKED',
        })
      ).unwrap();
      setCurrentPage(1);
    } catch (err: unknown) {
      console.error('Failed to fetch IP whitelisting data:', err);
    } finally {
      dispatch(hideLoader());
    }
  };

  // Map column IDs to API sort field names
  const sortFieldMap: Record<string, string> = {
    reNameFiCode: 'reportingEntity.name',
    ipAddress: 'ipAddress',
    ipWhitelistedFor: 'ipWhitelistedFor',
    blockedOn: 'updatedBy',
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
    fetchData(value);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIPs((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleUnblockIPs = () => {
    if (selectedIPs.length > 0) {
      setRemarkModalOpen(true);
    }
  };

  const getIpAddressesFromIds = useCallback(
    (ids: string[]): string[] => {
      if (!data?.content) return [];
      return data.content
        .filter((item: UnblockIPS) => ids.includes(item.id))
        .map((item: UnblockIPS) => item.ipAddress);
    },
    [data]
  );

  const handleRemarkSubmit = async (remark: string) => {
    try {
      await dispatch(
        blockIpStatusUpdate({
          ipWhitelistingIds: selectedIPs,
          status: 'UNBLOCKED',
          reason: remark,
        })
      ).unwrap();

      setRemarkModalOpen(false);
      setIsSubmitSuccess(true);
      setResultModalOpen(true);
      setSelectedIPs([]);
      fetchData();
    } catch (error) {
      console.error('Failed to unblock IPs:', error);
      setRemarkModalOpen(false);
      setIsSubmitSuccess(false);
      setResultModalOpen(true);
    }
  };

  const handleResultModalClose = () => {
    setResultModalOpen(false);
    if (!isSubmitSuccess) {
      setSelectedIPs([]);
    }
    dispatch(resetBlockIpState());
  };

  const getErrorMessage = (): string => {
    if (
      submitErrorData?.existingRequestIds &&
      submitErrorData.existingRequestIds.length > 0
    ) {
      const ipAddresses = getIpAddressesFromIds(
        submitErrorData.existingRequestIds
      );
      return `${submitError}: ${ipAddresses.join(', ')}`;
    }
    return submitError || 'Failed to unblock IP addresses';
  };

  const handleViewRemark = (remark: string) => {
    setSelectedRemark(remark);
    setViewRemarkModalOpen(true);
  };

  const handleCloseRemarkModal = () => {
    setViewRemarkModalOpen(false);
    setSelectedRemark('');
  };

  const tableData = useMemo(() => {
    if (!data?.content) {
      return [];
    }
    return data.content.map((item: UnblockIPS) => ({
      id: item.id,
      srNo: item.srNo,
      reNameFiCode:
        `${item.reName || ''} ${item.fiCode ? `(${item.fiCode})` : ''}`.trim(),
      ipAddress: item.ipAddress,
      ipWhitelistedFor: item.ipWhitelistedFor,
      blockedOn: DateUtils.formatDate(item.lastUpdatedOn),
      remarksForBlockIP: item.reason || '-',
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = [...tableData];

    if (contentSearch) {
      const searchLower = contentSearch.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          (row.reNameFiCode || '').toLowerCase().includes(searchLower) ||
          (row.ipAddress || '').toLowerCase().includes(searchLower) ||
          (row.ipWhitelistedFor || '').toLowerCase().includes(searchLower) ||
          (row.remarksForBlockIP || '').toLowerCase().includes(searchLower)
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

  const columns = [
    { id: 'srNo', label: 'Sr.No.', sortable: false },
    { id: 'reNameFiCode', label: 'RE Name/FI Code', sortable: true },
    { id: 'ipAddress', label: 'IP Address', sortable: true },
    { id: 'ipWhitelistedFor', label: 'IP Whitelisted for', sortable: true },
    { id: 'blockedOn', label: 'Blocked On', sortable: true },
    { id: 'remarksForBlockIP', label: 'Remarks for Block IP', sortable: false },
  ];

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
        Unblock IP Address
      </Typography>

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
                  <TableCell sx={styles.tableCell}>Select</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
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
                      key={row.srNo}
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
                        <Button
                          variant="text"
                          onClick={() =>
                            handleViewRemark(row.remarksForBlockIP)
                          }
                          sx={{
                            textTransform: 'none',
                            color: '#002CBA',
                            fontFamily: 'Gilroy, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            padding: 0,
                            minWidth: 'auto',
                            textDecoration: 'underline',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          View Remark
                        </Button>
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
                        <Checkbox
                          checked={selectedIPs.includes(row.id)}
                          onChange={() => handleSelectOne(row.id)}
                          sx={{
                            color: '#002CBA',
                            '&.Mui-checked': { color: '#4CAF50' },
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleUnblockIPs}
          disabled={selectedIPs.length === 0}
          sx={{
            ...styles.searchButton,
            width: 'auto',
            minWidth: 150,
          }}
        >
          Unblock IPs
        </Button>
      </Box>

      <RemarkForRejectionModal
        isOpen={remarkModalOpen}
        onClose={() => setRemarkModalOpen(false)}
        onSubmit={handleRemarkSubmit}
        title="Remark for Unblock IP"
        remarkLabel="Remark"
        remarkPlaceholder="Type your Remark here"
        remarkMaxLength={500}
        cancelLabel="Cancel"
        submitLabel="Submit"
      />

      <SuccessModal
        open={resultModalOpen}
        onClose={handleResultModalClose}
        messageType={isSubmitSuccess ? 'success' : 'reject'}
        title={isSubmitSuccess ? 'Submitted for approval' : getErrorMessage()}
        okText="Okay"
      />

      <ViewRemarkModal
        isOpen={viewRemarkModalOpen}
        onClose={handleCloseRemarkModal}
        remark={selectedRemark}
        title="Remarks for Block IP"
        subtitle="Remark"
      />
    </DashboardContainer>
  );
};

export default UnblockIP;
