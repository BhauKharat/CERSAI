/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { styles } from '../mytaskDash/css/NewRequest.style';
import KeyboardControlKeyRoundedIcon from '@mui/icons-material/KeyboardControlKeyRounded';

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
  AccordionDetails,
  Accordion,
  AccordionSummary,
  RadioGroup,
  FormControlLabel,
  Radio,
  // Added import for the correct event type
} from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchApplications } from '../slices/applicationSlice';
import { Application } from '../types/applicationTypes';
import { hideLoader } from '../../../loader/slices/loaderSlice';
import '../Dashboard.css';
// import { setWorkFlowId } from './slices/RequestDetailSlice';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AdminBreadcrumbUpdateProfile from './AdminBreadcrumbUpdateProfile';
import { useNavigate } from 'react-router-dom';

interface sortBy {
  key: string;
  type: string;
}

const ALL_STATUSES = [
  'APPROVED',
  'REJECTED',
  'REQUEST_FOR_MODIFICATION',
  'PENDING',
  'SUBMITTED',
  'RESUBMISSION',
];

const statusMap: Record<string, string[]> = {
  Pending: ['PENDING', 'SUBMITTED', 'RESUBMISSION'],
  PendingLevel1: ['SUBMITTED', 'RESUBMISSION'], // 🔹 Level 1
  PendingLevel2: ['PENDING'],
  Approved: ['APPROVED'],
  Rejected: ['REJECTED'],
  Modification: ['REQUEST_FOR_MODIFICATION'],
  All: ALL_STATUSES,
};

const TrackStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const applicationsState = useAppSelector((state) => state.applicationTask);
  const { data, loading, error } = applicationsState;

  const [ackSearchQuery, setAckSearchQuery] = React.useState('');
  const [ackSearchInput, setAckSearchInput] = React.useState('');
  const [contentSearchQuery, setContentSearchQuery] = React.useState('');
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
  const [status, setStatus] = useState(''); //
  const [filterMode, setFilterMode] = useState('filter1'); //
  const [hasSearched, setHasSearched] = useState(false);
  // Fetch data on initial mount and when filters, page, or the debounced search query change
  const fetchData = async (
    page?: number,
    clearFilters?: boolean,
    filterStatus?: string
  ) => {
    const selectedStatusArray = statusMap[filterStatus ?? status]
      ? statusMap[filterStatus ?? status]
      : ALL_STATUSES;
    try {
      await dispatch(
        fetchApplications({
          page: page ? page - 1 : 0,
          size: pageSize,
          fromDate: clearFilters ? undefined : date.from || undefined,
          toDate: clearFilters ? undefined : date.to || undefined,
          sortBy: sortBy,
          status: selectedStatusArray,
          apiType: 'TRACK_STATUS', // ✅ added line
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
    const appliedAckQuery =
      filterMode === 'filter2' ? ackSearchInput.trim() : '';

    if (filterMode === 'filter2') {
      setAckSearchInput(appliedAckQuery);
    }

    setAckSearchQuery(appliedAckQuery);
    setHasSearched(true);
    fetchData();
  };

  const handleClearSearch = () => {
    setDate({ from: undefined, to: undefined });
    setStatus('');
    setFilterMode('filter1');
    setAckSearchInput('');
    setAckSearchQuery('');
    setContentSearchQuery('');
    setCurrentPage(1);
    setHasSearched(false);
    fetchData(undefined, true, 'All');
  };
  const tableData = React.useMemo(() => {
    // console.log('tableData;---', data);
    if (!data?.content) {
      return [];
    }
    return data.content
      .filter((app: Application | null): app is Application => app !== null)
      .map((app: Application, index: number) => ({
        key: app.workflow_id || `app-${index}`,
        registartionDate: app?.payload?.submission.submittedAt ?? '-',
        Name_FiCODE: 'no data',
        submittedBy:
          (app?.payload?.nodalOfficer?.noFirstName ?? '-') +
          ' ' +
          ' - ' +
          // (app?.payload?.nodalOfficer?.noLastName ?? '-')+
          app?.payload?.userId,
        reportingEntityName:
          app?.payload?.entityDetails?.nameOfInstitution || '-',
        applicationStatus: app?.status ?? 'PENDING',
        acknowledgementNo:
          app?.payload?.application_esign?.acknowledgementNo || '-',
        workflowId: app.workflow_id,
        userId: app?.payload?.userId,
        requestType:
          app?.meta_data?.isModifiableRequest === 'false'
            ? 'Modification'
            : 'New Registration',
        pendingAtStage: app?.payload?.approvalWorkflow?.pendingAtLevel ?? 0,
        serialNumber: (currentPage - 1) * pageSize + index + 1,
      }));
  }, [data, currentPage, pageSize]);

  const filteredTableData = React.useMemo(() => {
    const trimmedContentQuery = contentSearchQuery.trim();

    // Content search is independent - always apply if user types
    if (trimmedContentQuery) {
      const lowerQuery = trimmedContentQuery.toLowerCase();
      const isNumericQuery = /^\d+$/.test(trimmedContentQuery);
      const isDateQuery = /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(trimmedContentQuery);
      const parsedQueryDate = isDateQuery
        ? dayjs(trimmedContentQuery, ['DD/MM/YYYY', 'DD-MM-YYYY'], true)
        : null;

      return tableData.filter((row: any) => {
        const rowDate = row.registartionDate
          ? dayjs(row.registartionDate)
          : null;
        const formattedRowDate = rowDate?.isValid()
          ? rowDate.format('DD/MM/YYYY').toLowerCase()
          : '';

        const searchableValues = [
          row.submittedBy,
          row.reportingEntityName,
          row.applicationStatus,
          row.acknowledgementNo,
          row.requestType,
          row.workflowId,
          row.pendingAtStage,
          row.serialNumber,
          String(row.serialNumber ?? '').padStart(2, '0'),
          formattedRowDate,
        ];

        if (isDateQuery && parsedQueryDate?.isValid()) {
          return rowDate?.isValid()
            ? rowDate.isSame(parsedQueryDate, 'day')
            : false;
        } else if (isNumericQuery) {
          const serialString = String(row.serialNumber ?? '');
          const paddedSerial = serialString.padStart(2, '0');
          return (
            serialString === trimmedContentQuery ||
            paddedSerial === trimmedContentQuery
          );
        } else {
          return searchableValues.some((value) =>
            String(value ?? '')
              .toLowerCase()
              .includes(lowerQuery)
          );
        }
      });
    }

    if (filterMode === 'filter2') {
      if (!ackSearchQuery.trim()) {
        return tableData;
      }

      return tableData.filter((row: any) =>
        String(row.acknowledgementNo ?? '')
          .toLowerCase()
          .includes(ackSearchQuery.trim().toLowerCase())
      );
    }
    if (!hasSearched) {
      return tableData;
    }
    const lowerQuery = trimmedContentQuery.toLowerCase();
    const fromDate = date.from ? dayjs(date.from, 'YYYY-MM-DD') : null;
    const toDate = date.to ? dayjs(date.to, 'YYYY-MM-DD') : null;
    // const normalizedStatus = status.toLowerCase();
    const isNumericQuery = /^\d+$/.test(trimmedContentQuery);
    const isDateQuery = /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(trimmedContentQuery);
    const parsedQueryDate = isDateQuery
      ? dayjs(trimmedContentQuery, ['DD/MM/YYYY', 'DD-MM-YYYY'], true)
      : null;

    return tableData.filter((row: any) => {
      const rowDate = row.registartionDate ? dayjs(row.registartionDate) : null;
      const formattedRowDate = rowDate?.isValid()
        ? rowDate.format('DD/MM/YYYY').toLowerCase()
        : '';
      // const rowStatus = String(row.applicationStatus ?? '').toLowerCase();

      let matchesQuery = true;
      if (trimmedContentQuery) {
        if (isDateQuery && parsedQueryDate?.isValid()) {
          matchesQuery = rowDate?.isValid()
            ? rowDate.isSame(parsedQueryDate, 'day')
            : false;
        } else if (isNumericQuery) {
          const serialString = String(row.serialNumber ?? '');
          const paddedSerial = serialString.padStart(2, '0');
          matchesQuery =
            serialString === trimmedContentQuery ||
            paddedSerial === trimmedContentQuery;
        } else {
          const searchableValues = [
            row.submittedBy,
            row.reportingEntityName,
            row.applicationStatus,
            row.acknowledgementNo,
            row.requestType,
            row.workflowId,
            row.pendingAtStage,
            row.serialNumber,
            String(row.serialNumber ?? '').padStart(2, '0'),
            formattedRowDate,
          ];
          matchesQuery = searchableValues.some((value) =>
            String(value ?? '')
              .toLowerCase()
              .includes(lowerQuery)
          );
        }
      }

      const matchesFromDate = fromDate
        ? rowDate?.isValid() &&
          (rowDate.isAfter(fromDate, 'day') || rowDate.isSame(fromDate, 'day'))
        : true;

      const matchesToDate = toDate
        ? rowDate?.isValid() &&
          (rowDate.isBefore(toDate, 'day') || rowDate.isSame(toDate, 'day'))
        : true;

      const matchesStatus = 'all';
      // normalizedStatus === 'all'
      //   ? true
      //   : normalizedStatus === 'success'
      //     ? rowStatus === 'approved'
      //     : rowStatus === normalizedStatus;

      return matchesQuery && matchesFromDate && matchesToDate && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterMode,
    tableData,
    contentSearchQuery,
    ackSearchQuery,
    hasSearched,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(hasSearched && filterMode === 'filter1'
      ? [date.from, date.to, status]
      : []),
  ]);

  const hasActiveFilters = React.useMemo(() => {
    if (filterMode === 'filter2') {
      return Boolean(ackSearchQuery.trim());
    }
    return Boolean(
      contentSearchQuery.trim() || status !== 'all' || date.from || date.to
    );
  }, [
    filterMode,
    ackSearchQuery,
    contentSearchQuery,
    status,
    date.from,
    date.to,
  ]);
  const handleViewDetails = (
    acknowledgementNo: string,
    workflowIdDetail: string,
    userId: string
  ) => {
    // dispatch(setWorkFlowId(workflowIdDetail));
    if (!acknowledgementNo || !workflowIdDetail || !userId) {
      // console.log('no acknowledgementNo or workflowIdDetail or userId');
      return;
    }
    navigate(
      `/ckycrr-admin/my-task/Re_Details/${acknowledgementNo}/${workflowIdDetail}/${userId}`
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
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          {
            label: 'RE Registration',
            href: '/ckycrr-admin/my-task/re-registration',
          },
          { label: 'Track Status' },
        ]}
      />
      <Typography sx={{ fontWeight: 600 }}>
        Track Status - RE Registration
      </Typography>

      <AccordionDetails sx={{ ml: -1 }}>
        <Accordion defaultExpanded sx={{ backgroundColor: '#F7F9FF' }}>
          <AccordionSummary
            expandIcon={<KeyboardControlKeyRoundedIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ backgroundColor: '#E2E8FF', marginBottom: '15px' }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '0px',
                minHeight: 'auto',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>
                Search Filters
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ pl: 5, pr: 5, backgroundColor: '#F7F9FF' }}>
            {/* FIRST ROW: Status + From Date + To Date */}
            <Box sx={{ ...styles.firstRow, mt: -3 }}>
              {/* Radio Button */}
              <Box sx={styles.radioBtn}>
                <FormControl component="fieldset">
                  <RadioGroup row>
                    <FormControlLabel
                      value="filter1"
                      control={
                        <Radio
                          checked={filterMode === 'filter1'}
                          onChange={() => setFilterMode('filter1')}
                        />
                      }
                      label=""
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Status */}
              <Box sx={styles.inputBox}>
                <Typography sx={styles.statusLabel}>Status</Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      fetchData(undefined, undefined, e.target.value);
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
                    }}
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>

                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="PendingLevel1">Pending Level 1</MenuItem>
                    <MenuItem value="PendingLevel2">Pending Level 2</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Modification">Modification</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* From Date */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={styles.inputBox}>
                  <Typography sx={styles.statusLabel}>
                    From Date <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <DatePicker
                    value={date?.from ? dayjs(date.from, 'YYYY-MM-DD') : null}
                    onChange={(d: any) =>
                      setDate((prev) => ({
                        ...prev,
                        from: d ? dayjs(d).format('YYYY-MM-DD') : '',
                      }))
                    }
                    maxDate={dayjs()}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'DD/MM/YYYY',
                        sx: styles.datePickerInput,
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>

              {/* To Date */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={styles.inputBox}>
                  <Typography sx={styles.statusLabel}>
                    To Date <span style={{ color: 'red' }}>*</span>
                  </Typography>
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
                          '&:hover': {
                            backgroundColor: 'transparent',
                            color: '#333',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>

            {/* SECOND ROW: Search by Acknowledgment Number */}
            <Box sx={{ ...styles.firstRow, mt: 0 }}>
              {/* Radio Button */}
              <Box sx={styles.radioBtn}>
                <FormControl component="fieldset">
                  <RadioGroup row>
                    <FormControlLabel
                      value="filter2"
                      control={
                        <Radio
                          checked={filterMode === 'filter2'}
                          onChange={() => setFilterMode('filter2')}
                        />
                      }
                      label=""
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Search Input */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={styles.statusLabel}>
                  Search by Acknowledgment Number
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  value={ackSearchInput}
                  onChange={(e) => {
                    setAckSearchInput(e.target.value);
                    setFilterMode('filter2');
                  }}
                  placeholder="Enter acknowledgment number here"
                  sx={{
                    width: 333,
                    height: 48,
                    '& .MuiOutlinedInput-root': {
                      height: 48,
                    },
                    '& .MuiInputBase-input': {
                      height: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 16px',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* THIRD ROW: Search and Clear Search Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                mt: 2,
                ml: 'calc(40px + 16px + 6px)',
                '@media (max-width: 600px)': {
                  ml: 0,
                  justifyContent: 'center',
                  width: '100%',
                },
              }}
            >
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
          </AccordionDetails>
        </Accordion>
        {/* Submit Button */}
      </AccordionDetails>

      <Box sx={{ ...styles.reportingEntityRow }}>
        <TextField
          variant="outlined"
          size="small"
          value={contentSearchQuery}
          onChange={(e) => setContentSearchQuery(e.target.value)}
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
                      onClick={() => handleSort('registartionDate')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    Ack No
                    <IconButton
                      onClick={() => handleSort('status')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    Request type
                    <IconButton
                      onClick={() => handleSort('status')}
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
                      onClick={() => handleSort('reportingEntityName')}
                      sx={{ color: '#000000' }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    Submitted By
                    <IconButton
                      onClick={() => handleSort('initiatedBy')}
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
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        {row.requestType}
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
                          <Typography
                            sx={{
                              color:
                                row.applicationStatus === 'APPROVED'
                                  ? '#52AE32'
                                  : row.applicationStatus === 'REJECTED'
                                    ? '#FF0000'
                                    : row.pendingAtStage > 1
                                      ? '#FF7600'
                                      : '#FFCD1C',
                            }}
                          >
                            {formatStatus(row.applicationStatus)}{' '}
                            {(row.applicationStatus === 'SUBMITTED' ||
                              row.applicationStatus === 'RESUBMISSION') &&
                              '[L1]'}
                            {row.applicationStatus === 'PENDING' &&
                              row.pendingAtStage &&
                              `[L${row.pendingAtStage}]`}
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
                      <TableCell
                        sx={{
                          ...styles.tableCellBlue,
                          borderRight: 'none',
                          paddingRight: '22px',
                          position: 'relative',
                        }}
                      >
                        {dayjs(row.registartionDate).format(
                          'DD/MM/YYYY hh:mm A'
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
                        {row.submittedBy}
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
            {hasActiveFilters
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
    </Box>
  );
};

// Helper function to format status text
const formatStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
    case 'SUBMITTED':
    case 'RESUBMISSION':
      return 'Pending Approval';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'REQUEST_FOR_MODIFICATION':
      return 'Request for modification';
    default:
      return status;
    //
  }
};

export default TrackStatus;
