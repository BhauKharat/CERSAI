import React, { useState, useMemo, useEffect } from 'react';
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
  FormControlLabel,
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
import { fetchTrackStatus } from '../slices/ipWhitelistingSlice';

// Import the specified breadcrumb component
import NavigationBreadCrumb from '../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import DateUtils from '../../../../utils/dateUtils';
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
  RadioGroupContainer,
  StatusDisplay,
} from '../style/IPWhitelistTrackStatus.styles';

// #region Type Definitions
type TransactionType = 'uploadKey' | 'addIp' | 'removeIp' | 'extendValidity';
type StatusType =
  | 'Approved'
  | 'Rejected'
  | 'Approval Pending'
  | 'IP Verified'
  | 'IP Verification Failed'
  | 'IP Verification in-process'
  | 'PENDING'
  | string;

interface BaseData {
  id: number | string;
  status: StatusType;
  remark: string;
}

interface UploadKeyData extends BaseData {
  publicKey: string;
  validFrom: string;
  validTill: string;
  submittedOn: string;
  submittedBy: string;
}

interface IPData extends BaseData {
  srNo: string;
  ipAddress: string;
  whitelistedFor: 'API' | 'SFTP' | string;
  validFrom: string;
  validTill: string;
  statusUpdatedOn: string;
  statusUpdatedBy: string;
}

// Added the specific type for the Extend Validity view
interface ExtendValidityData extends IPData {
  validityExtendedTill: string;
}

// API Response type
interface APIWorkflowItem {
  workflow_id: string;
  workflow_type: string;
  initiator_service: string;
  status: string;
  current_step: string;
  payload: {
    initiatorDetails: {
      userId: string;
    };
    ipWhitelisting?: {
      id?: string;
      ipAddress: string;
      validFrom: string;
      validTill: string;
      ipWhitelistedFor?: string;
      extendValidTill?: string;
      reason?: string;
    };
    publicKey?: {
      key?: string;
      fileName?: string;
      validFrom?: string;
      validTill?: string;
    };
    ipWhitelistingPublicKey?: {
      id?: string;
      fileName?: string;
      validFrom?: string;
      validTill?: string;
      publicKeyId?: string;
    };
    approval?: {
      remark?: string;
      approvedBy: string;
      approvedOn: string;
    };
    remark?: string;
  };
  meta_data: {
    reId: string;
    activity: string;
    ipAddress?: string;
    canApproveBy: string;
    userId?: string;
    entityType?: string;
    ipWhitelistingId?: string;
  };
  search_tags: string;
  created_at: string;
  updated_at: string;
}

type Order = 'asc' | 'desc';

// Defined a specific type for head cell configurations
interface HeadCellConfig {
  id: string;
  label: string;
  sortable?: boolean;
}
// #endregion

// #region HeadCell Configurations
const uploadKeyHeadCells: HeadCellConfig[] = [
  { id: 'publicKey', label: 'Public Key' },
  { id: 'validFrom', label: 'Valid From' },
  { id: 'validTill', label: 'Valid Till' },
  { id: 'status', label: 'Status' },
  { id: 'remark', label: 'Remark' },
  { id: 'submittedOn', label: 'Submitted On' },
  { id: 'submittedBy', label: 'Submitted By' },
];
const addRemoveIpHeadCells: HeadCellConfig[] = [
  { id: 'srNo', label: 'Sr.No.', sortable: false },
  { id: 'ipAddress', label: 'IP Address', sortable: true },
  { id: 'whitelistedFor', label: 'IP Whitelisted for', sortable: true },
  { id: 'validFrom', label: 'Valid From', sortable: true },
  { id: 'validTill', label: 'Valid Till', sortable: true },
  { id: 'status', label: 'Status', sortable: false },
  { id: 'remark', label: 'Remark', sortable: false },
  { id: 'statusUpdatedOn', label: 'Status Updated On', sortable: true },
  { id: 'statusUpdatedBy', label: 'Status Updated By', sortable: true },
];
const extendValidityHeadCells: HeadCellConfig[] = [
  ...addRemoveIpHeadCells.slice(0, 5),
  {
    id: 'validityExtendedTill',
    label: 'Validity Extended Till',
    sortable: true,
  },
  ...addRemoveIpHeadCells.slice(5),
];
// #endregion

// #region Utility Functions
// Function to capitalize only first letter
const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// #region Sorting Utilities
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator<T>(
  order: Order,
  orderBy: keyof T
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
// #endregion

// Generic Table Component for Add, Remove, and Extend Views
const StatusTable = <T extends IPData | ExtendValidityData>({
  data,
  headCells,
  totalPages,
  totalElements,
  currentPage,
  onPageChange,
}: {
  data: T[];
  headCells: HeadCellConfig[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>('srNo' as keyof T);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property as keyof T);
  };

  const getCellValue = (row: unknown, key: string): unknown => {
    if (
      row &&
      typeof row === 'object' &&
      key in (row as Record<string, unknown>)
    ) {
      return (row as Record<string, unknown>)[key];
    }
    return '';
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    return stableSort(filteredData, getComparator(order, orderBy));
  }, [filteredData, order, orderBy]);

  return (
    <>
      <HeaderContainer>
        <SearchTextField
          size="small"
          variant="outlined"
          placeholder="Content Search"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
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
      <TableWrapper>
        <TableContainer>
          <Table>
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
                                orderBy === headCell.id && order === 'asc'
                                  ? 'text.primary'
                                  : 'text.disabled',
                            }}
                          />
                          <ArrowDropDownIcon
                            sx={{
                              height: 16,
                              mt: '-6px',
                              color:
                                orderBy === headCell.id && order === 'desc'
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
              {sortedData.length === 0 ? (
                <TableRow>
                  <StyledTableCell
                    colSpan={headCells.length}
                    sx={{ textAlign: 'center', py: 5 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm.trim()
                        ? 'No results found'
                        : 'No pending requests found'}
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#E4F6FF',
                      },
                    }}
                  >
                    {headCells.map((cell, index) => (
                      <StyledTableCell
                        key={cell.id}
                        sx={{
                          position: 'relative',
                          borderRight: 'none',
                        }}
                      >
                        {cell.id === 'status' ? (
                          <StatusDisplay statusType={row.status as StatusType}>
                            {row.status}
                          </StatusDisplay>
                        ) : cell.id === 'remark' ? (
                          row.status === 'Rejected' &&
                          row.remark &&
                          row.remark !== '-' ? (
                            <Typography
                              sx={{
                                cursor: 'pointer',
                                fontFamily: 'Gilroy, sans-serif',
                                fontSize: '14px',
                              }}
                            >
                              {row.remark}
                            </Typography>
                          ) : (
                            '-'
                          )
                        ) : (
                          (getCellValue(row, cell.id) as React.ReactNode)
                        )}
                        {index < headCells.length - 1 && (
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
                        )}
                      </StyledTableCell>
                    ))}
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
          Showing data {filteredData.length} of{' '}
          {searchTerm.trim() ? filteredData.length : totalElements}
        </Typography>
        <PaginationContainer>
          <NavButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowBackIosIcon
              fontSize="small"
              sx={{ mr: 0.5, width: 14, height: 14 }}
            />{' '}
            Previous
          </NavButton>
          {[...Array(Math.min(totalPages, 4)).keys()].map((i) => {
            const pageNum = i + 1;
            return currentPage === pageNum ? (
              <PageButton key={pageNum} onClick={() => onPageChange(pageNum)}>
                {pageNum}
              </PageButton>
            ) : (
              <Typography
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next{' '}
            <ArrowForwardIosIcon
              fontSize="small"
              sx={{ ml: 0.5, width: 14, height: 14 }}
            />
          </NavButton>
        </PaginationContainer>
      </FooterContainer>
    </>
  );
};

// Workflow type mapping
const workflowTypeMap: Record<TransactionType, string> = {
  uploadKey: 'IP_WHITELISTING_UPLOAD_REPLACE_PUBLIC_KEY',
  addIp: 'IP_WHITELISTING_ADD_NEW_IP_ADDRESS',
  removeIp: 'IP_WHITELISTING_REMOVE_IP_ADDRESS',
  extendValidity: 'IP_WHITELISTING_EXTEND_VALIDATION',
};

const IPWhitelistTrackStatus = () => {
  const dispatch = useAppDispatch();
  const { pendingRequests, loading, error } = useAppSelector(
    (state) => state.ipWhitelisting
  );

  const [selectedView, setSelectedView] =
    useState<TransactionType>('uploadKey');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Fetch data when view changes
  useEffect(() => {
    const workflowType = workflowTypeMap[selectedView];
    dispatch(
      fetchTrackStatus({
        workflowType,
        page: currentPage,
        pageSize,
        status: [],
      })
    );
  }, [dispatch, selectedView, currentPage]);

  // Format API data based on workflow type
  const getFormattedData = (): (
    | UploadKeyData
    | IPData
    | ExtendValidityData
  )[] => {
    console.log('Pending Requests Data:', pendingRequests);
    console.log('Content:', pendingRequests?.content);

    if (!pendingRequests?.content) return [];

    return pendingRequests.content.map(
      (item: APIWorkflowItem, index: number) => {
        const getDisplayStatus = (status: string | undefined): string => {
          const normalizedStatus = status?.toUpperCase();
          if (normalizedStatus === 'PENDING') return 'Approval Pending';
          if (normalizedStatus === 'FAILED') return 'IP Verification Failed';
          return capitalizeFirstLetter(status || 'Approval Pending');
        };

        const baseData = {
          id: item.workflow_id || index,
          status: getDisplayStatus(item.status),
          remark: item.payload?.remark || item.payload?.approval?.remark || '-',
        };

        if (selectedView === 'uploadKey') {
          // Get publicKey data from either publicKey or ipWhitelistingPublicKey
          const publicKeyData =
            item.payload?.ipWhitelistingPublicKey || item.payload?.publicKey;
          return {
            ...baseData,
            publicKey:
              publicKeyData?.fileName || item.payload?.publicKey?.key || '-',
            validFrom: publicKeyData?.validFrom
              ? DateUtils.formatOnlyDate(publicKeyData.validFrom)
              : '-',
            validTill: publicKeyData?.validTill
              ? DateUtils.formatOnlyDate(publicKeyData.validTill)
              : '-',
            submittedOn: item.created_at
              ? DateUtils.formatDate(item.created_at)
              : '-',
            submittedBy: item.payload?.initiatorDetails?.userId || '-',
          };
        } else {
          const ipData = {
            ...baseData,
            srNo: String((currentPage - 1) * pageSize + index + 1).padStart(
              2,
              '0'
            ),
            ipAddress: item.payload?.ipWhitelisting?.ipAddress || '-',
            whitelistedFor:
              item.payload?.ipWhitelisting?.ipWhitelistedFor || '-',
            validFrom: item.payload?.ipWhitelisting?.validFrom
              ? DateUtils.formatOnlyDate(item.payload.ipWhitelisting.validFrom)
              : '-',
            validTill: item.payload?.ipWhitelisting?.validTill
              ? DateUtils.formatOnlyDate(item.payload.ipWhitelisting.validTill)
              : '-',
            statusUpdatedOn:
              item.payload?.approval?.approvedOn || item.updated_at
                ? DateUtils.formatDate(
                    item.payload?.approval?.approvedOn || item.updated_at
                  )
                : '-',
            statusUpdatedBy:
              item.payload?.approval?.approvedBy ||
              item.payload?.initiatorDetails?.userId ||
              '-',
          };

          if (selectedView === 'extendValidity') {
            return {
              ...ipData,
              validityExtendedTill: item.payload?.ipWhitelisting
                ?.extendValidTill
                ? DateUtils.formatOnlyDate(
                    item.payload.ipWhitelisting.extendValidTill
                  )
                : '-',
            };
          }

          return ipData;
        }
      }
    );
  };

  const formattedData = getFormattedData();
  const totalPages = pendingRequests?.totalPages || 0;
  const totalElements = pendingRequests?.totalElements || 0;

  const renderContent = () => {
    switch (selectedView) {
      case 'uploadKey':
        return (
          <TableWrapper sx={{ mt: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {uploadKeyHeadCells.map((headCell) => (
                      <StyledTableHeadCell key={headCell.id}>
                        {headCell.label}
                      </StyledTableHeadCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!formattedData || formattedData.length === 0 ? (
                    <TableRow>
                      <StyledTableCell
                        colSpan={uploadKeyHeadCells.length}
                        sx={{ textAlign: 'center', py: 5 }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No pending requests found
                        </Typography>
                      </StyledTableCell>
                    </TableRow>
                  ) : (
                    (formattedData as UploadKeyData[]).map(
                      (row: UploadKeyData) => (
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
                            {row.publicKey}
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
                            {row.validFrom}
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
                            {row.validTill}
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
                            <StatusDisplay
                              statusType={row.status as StatusType}
                            >
                              {row.status}
                            </StatusDisplay>
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
                            {row.status === 'Rejected' &&
                            row.remark &&
                            row.remark !== '-' ? (
                              <Typography
                                sx={{
                                  cursor: 'pointer',
                                  fontFamily: 'Gilroy, sans-serif',
                                  fontSize: '14px',
                                }}
                              >
                                {row.remark}
                              </Typography>
                            ) : (
                              '-'
                            )}
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
                            {row.submittedOn}{' '}
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
                            {row.submittedBy}{' '}
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
                        </TableRow>
                      )
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TableWrapper>
        );
      case 'addIp':
        return (
          <StatusTable
            data={formattedData as IPData[]}
            headCells={addRemoveIpHeadCells}
            totalPages={totalPages}
            totalElements={totalElements}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        );
      case 'removeIp':
        return (
          <StatusTable
            data={formattedData as IPData[]}
            headCells={addRemoveIpHeadCells}
            totalPages={totalPages}
            totalElements={totalElements}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        );
      case 'extendValidity':
        return (
          <StatusTable
            data={formattedData as ExtendValidityData[]}
            headCells={extendValidityHeadCells}
            totalPages={totalPages}
            totalElements={totalElements}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MainContainer>
      <NavigationBreadCrumb
        crumbsData={[{ label: 'IP Whitelisting' }, { label: 'Track Status' }]}
      />
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, fontFamily: 'Gilroy, sans-serif', mt: 2 }}
      >
        Track Status
      </Typography>

      <RadioGroupContainer
        row
        value={selectedView}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSelectedView(e.target.value as TransactionType)
        }
      >
        <FormControlLabel
          value="uploadKey"
          control={
            <Radio
              sx={{
                color: '#999999 !important',
                '&.Mui-checked': {
                  color: '#002CBA !important',
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                color: selectedView === 'uploadKey' ? '#002CBA' : '#999999',
              }}
            >
              Upload/Replace Public Key
            </Typography>
          }
        />
        <FormControlLabel
          value="addIp"
          control={
            <Radio
              sx={{
                color: '#999999 !important',
                '&.Mui-checked': {
                  color: '#002CBA !important',
                },
              }}
            />
          }
          label={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: selectedView === 'addIp' ? '#002CBA' : '#999999',
              }}
            >
              Add New IP
            </Box>
          }
        />
        <FormControlLabel
          value="removeIp"
          control={
            <Radio
              sx={{
                color: '#999999 !important',
                '&.Mui-checked': {
                  color: '#002CBA !important',
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                color: selectedView === 'removeIp' ? '#002CBA' : '#999999',
              }}
            >
              Remove IP
            </Typography>
          }
        />
        <FormControlLabel
          value="extendValidity"
          control={
            <Radio
              sx={{
                color: '#999999 !important',
                '&.Mui-checked': {
                  color: '#002CBA !important',
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                color:
                  selectedView === 'extendValidity' ? '#002CBA' : '#999999',
              }}
            >
              Extend Validity
            </Typography>
          }
        />
      </RadioGroupContainer>

      {/* Loading State */}
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
          mt={3}
        >
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" style={{ margin: '20px 0' }}>
          <Typography>Failed to load data: {error}</Typography>
          <Button
            onClick={() => {
              const workflowType = workflowTypeMap[selectedView];
              dispatch(
                fetchTrackStatus({
                  workflowType,
                  page: currentPage,
                  pageSize,
                  status: [],
                })
              );
            }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Table Content */}
      {!loading && !error && renderContent()}
    </MainContainer>
  );
};

export default IPWhitelistTrackStatus;
