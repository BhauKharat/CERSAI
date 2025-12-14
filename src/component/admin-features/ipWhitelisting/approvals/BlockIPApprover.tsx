import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DateUtils, { formatOnlyDate } from '../../../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styles } from '../../myTask/mytaskDash/css/NewRequest.style';
import SearchableREDropdown from '../components/SearchableREDropdown';
import { ReEntity } from '../slices/reDropdownSlice';
import RemarkForRejectionModal from '../../../common/modals/RemarkForRejectionModal';
import SuccessModal from '../../../ui/Modal/SuccessModal';
import ViewRemarkModal from '../../../common/modals/ViewRemarkModal';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  fetchIPWhitelistingWorkflows,
  approveRejectIPWhitelistingWorkflows,
} from '../slices/ipWhitelistingWorkflowSlice';
import { hideLoader } from '../../../loader/slices/loaderSlice';

interface sortBy {
  key: string;
  type: string;
}

const BlockIPApprover: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const ipWhitelistingWorkflowState = useAppSelector(
    (state) => state.ipWhitelistingWorkflow
  );
  const { data, loading, error } = ipWhitelistingWorkflowState;
  const breadcrumbItems = [
    {
      label: 'My Task',
      href: '/ckycrr-admin/my-task/dashboard',
    },
    {
      label: 'IP Whitelisting',
      href: '/ckycrr-admin/my-task/ip-whitelisting',
    },
    {
      label: 'Block',
    },
  ];

  const [searchType, setSearchType] = useState<'reName' | 'ipAddress'>(
    'reName'
  );
  const [selectedRe, setSelectedRe] = useState<ReEntity | null>(null);
  const [ipAddressValue, setIpAddressValue] = useState<string>('');
  const [contentSearch, setContentSearch] = useState<string>('');
  const [selectedIPs, setSelectedIPs] = useState<string[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [viewRemarkModalOpen, setViewRemarkModalOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<string>('');

  const [sortBy, setSortBy] = useState<sortBy>({
    key: 'created_at',
    type: 'desc',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const fetchData = useCallback(
    async (page?: number) => {
      try {
        await dispatch(
          fetchIPWhitelistingWorkflows({
            page: page || currentPage,
            size: pageSize,
            sortBy: sortBy,
            workflowType: 'IP_WHITELISTING_BLOCKED_IP_ADDRESS',
            reId:
              searchType === 'reName' && selectedRe ? selectedRe.id : undefined,
            searchText: searchType === 'ipAddress' ? ipAddressValue : undefined,
          })
        ).unwrap();
        if (!page) {
          setCurrentPage(1);
        }
      } catch (err) {
        console.error('Failed to fetch Block IP workflows:', err);
      } finally {
        dispatch(hideLoader());
      }
    },
    [
      dispatch,
      currentPage,
      pageSize,
      sortBy,
      searchType,
      selectedRe,
      ipAddressValue,
    ]
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [sortBy]);

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
          fetchIPWhitelistingWorkflows({
            page: currentPage,
            size: pageSize,
            sortBy: sortBy,
            workflowType: 'IP_WHITELISTING_BLOCKED_IP_ADDRESS',
            reId: undefined,
            searchText: undefined,
          })
        ).unwrap();
      } catch (err) {
        console.error('Failed to fetch Block IP workflows:', err);
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
        fetchIPWhitelistingWorkflows({
          page: 1,
          size: pageSize,
          sortBy: sortBy,
          workflowType: 'IP_WHITELISTING_BLOCKED_IP_ADDRESS',
          reId: undefined,
          searchText: undefined,
        })
      ).unwrap();
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch Block IP workflows:', err);
    } finally {
      dispatch(hideLoader());
    }
  };

  // Map column IDs to API sort field names
  const sortFieldMap: Record<string, string> = {
    reNameFiCode: 'reportingEntity.name',
    ipAddress: 'ipAddress',
    ipWhitelistedFor: 'ipWhitelistedFor',
    validFrom: 'validFrom',
    validTill: 'validTill',
    submittedOn: 'created_at',
    submittedBy: 'updated_by',
  };

  const handleRequestSort = (property: string) => {
    const sortField = sortFieldMap[property] || property;
    setSortBy((prev) => {
      if (!prev || prev.key !== sortField) {
        return { key: sortField, type: 'asc' };
      }
      return {
        key: sortField,
        type: prev.type === 'asc' ? 'desc' : 'asc',
      };
    });
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

  const handleApprove = async () => {
    if (selectedIPs.length > 0) {
      try {
        await dispatch(
          approveRejectIPWhitelistingWorkflows({
            workflowIds: selectedIPs,
            remark: '',
            action: 'approve',
          })
        ).unwrap();

        setActionType('approve');
        setSuccessModalOpen(true);
        setSelectedIPs([]);
        fetchData();
      } catch (error) {
        console.error('Failed to approve IPs:', error);
      }
    }
  };

  const handleReject = () => {
    if (selectedIPs.length > 0) {
      setActionType('reject');
      setRejectModalOpen(true);
    }
  };

  const handleRejectSubmit = async (remark: string) => {
    try {
      await dispatch(
        approveRejectIPWhitelistingWorkflows({
          workflowIds: selectedIPs,
          remark: remark,
          action: 'reject',
        })
      ).unwrap();

      setRejectModalOpen(false);
      setActionType('reject');
      setSuccessModalOpen(true);
      setSelectedIPs([]);
      fetchData();
    } catch (error) {
      console.error('Failed to reject IPs:', error);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
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
    return data.content.map((item, index: number) => ({
      id: item.workflow_id || `workflow-${index}`,
      srNo: index + 1,
      reNameFiCode:
        `${item.payload?.reportingEntityDetails?.reName || ''} ${item.payload?.reportingEntityDetails?.fiCode ? `(${item.payload?.reportingEntityDetails?.fiCode})` : ''}`.trim() ||
        '-',
      ipAddress:
        item.payload?.ipWhitelisting?.ipAddress ||
        item.payload?.ipAddress ||
        '-',
      ipWhitelistedFor:
        item.payload?.ipWhitelisting?.ipWhitelistedFor ||
        item.payload?.ipWhitelistedFor ||
        '-',
      validFrom: formatOnlyDate(
        item.payload?.ipWhitelisting?.validFrom ||
          item.payload?.validFrom ||
          '-'
      ),
      validTill: formatOnlyDate(
        item.payload?.ipWhitelisting?.validTill ||
          item.payload?.validTill ||
          '-'
      ),
      submittedOn: item.created_at
        ? DateUtils.formatOnlyDate(item.created_at)
        : '-  ',
      submittedBy:
        item.payload?.initiatorDetails?.userId ||
        item.payload?.requestedBy ||
        item.payload?.userId ||
        '-',
      remark:
        item.payload?.ipWhitelisting?.reason || item.payload?.reason || '-',
      status: item.status || 'PENDING',
      workflowId: item.workflow_id,
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
          (row.submittedBy || '').toLowerCase().includes(searchLower) ||
          (row.remark || '').toLowerCase().includes(searchLower)
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
    return data?.totalPages || 0;
  }, [contentSearch, filteredData.length, pageSize, data]);
  const totalElements = data?.totalElements || 0;

  const columns = [
    { id: 'srNo', label: 'Sr.No.', sortable: false },
    { id: 'reNameFiCode', label: 'RE Name/FI Code', sortable: true },
    { id: 'ipAddress', label: 'IP Address', sortable: true },
    { id: 'ipWhitelistedFor', label: 'IP Whitelisted for', sortable: true },
    { id: 'validFrom', label: 'Valid From', sortable: true },
    { id: 'validTill', label: 'Valid Till', sortable: true },
    { id: 'submittedOn', label: 'Submitted On', sortable: true },
    { id: 'submittedBy', label: 'Submitted By', sortable: true },
    { id: 'remark', label: 'Remarks', sortable: false },
  ];

  return (
    <DashboardContainer>
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
        Block IP Address
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
                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                          color: '#000',
                        }}
                      >
                        {row.submittedOn}
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
                          onClick={() => handleViewRemark(row.remark)}
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
          {contentSearch ? filteredData.length : totalElements}
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleReject}
          disabled={selectedIPs.length === 0}
          sx={{
            ...styles.clearButton,
            width: 'auto',
            minWidth: 150,
          }}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          onClick={handleApprove}
          disabled={selectedIPs.length === 0}
          sx={{
            ...styles.searchButton,
            width: 'auto',
            minWidth: 150,
          }}
        >
          Approve
        </Button>
      </Box>

      <RemarkForRejectionModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
        title="Remark for Rejection"
        remarkLabel="Remark"
        remarkPlaceholder="Type your Remark here"
        remarkMaxLength={500}
        cancelLabel="Cancel"
        submitLabel="Submit"
      />

      <SuccessModal
        open={successModalOpen}
        onClose={handleSuccessModalClose}
        messageType={actionType === 'approve' ? 'success' : 'reject'}
        title={
          actionType === 'approve'
            ? 'Selected IP Addresses are blocked'
            : 'Request rejected for blocking selected IP Addresses'
        }
        okText="Okay"
      />

      <ViewRemarkModal
        isOpen={viewRemarkModalOpen}
        onClose={handleCloseRemarkModal}
        remark={selectedRemark}
        title="View Remark"
        subtitle="Remark for Block IP by Level 1 User"
      />
    </DashboardContainer>
  );
};

export default BlockIPApprover;
