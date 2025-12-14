import {
  ArrowBack as ArrowBackIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Checkbox,
  // DialogTitle,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Button as MuiButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ThunkDispatch } from '@reduxjs/toolkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { AnyAction } from 'redux';
import { API_ADMIN_BASE_URL, API_ENDPOINTS } from '../../../../Constant';
import {
  Country as CountryCode,
  fetchCountryCodes,
} from '../../../../utils/countryUtils';
import DateUtils from '../../../../utils/dateUtils';
import { Secured } from '../../../../utils/HelperFunctions/api';
import {
  NavButton,
  PageNumberBtn,
  PaginationInfo,
  PaginationNav,
  PaginationWrapper,
  StyledBodyCell,
  StyledHeaderCell,
  StyledTableContainer,
  StyledTableRow,
  StyledTableWrapper,
} from '../mytaskDash/css/SubUserApproval.styles';
import {
  selectCurrentPageData,
  selectDetailedUser,
  selectError,
  selectFilters,
  selectLoading,
  selectTotalUsers,
} from '../slices/dashboardSelctor';
import {
  approveOrRejectWorkflow,
  clearDetailedUser,
  clearError,
  fetchUserDetailsById,
  fetchUsers,
  setCurrentPage,
  type SubUser,
  type UserDetail,
  type WorkflowItem,
} from '../slices/dashboardSubUserSlice';
import AdminBreadcrumbUpdateProfile from './AdminBreadcrumbUpdateProfile';

type RootState = unknown;
type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// Updated ApiError interface to include httpCode
interface ApiError {
  errorCode?: string;
  errorMessage?: string;
  httpCode?: number;
}
interface ConcernedUser {
  userId?: string;
  username?: string;
  userType?: string;
}
interface MetaData {
  userId?: string;
  userName?: string;
  userRole?: string;
}

interface SuspensionMetaData {
  status?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  initiatedBy?: string;
  lastActionBy?: string;
  lastActionOn?: string;
  submittedByUserId?: string;
  submittedByFirstName?: string;
}

interface SuspensionUserDetails {
  reason?: string;
  userId?: string;
  remarks?: string;
  actionType?: string;
}

interface SuspensionApproval {
  actionBy?: string;
  action?: string;
  actionDateTime?: string;
  reason?: string;
  remarks?: string;
  actionByUserName?: string;
  approvalLevel?: number;
}

interface SuspensionApprovalWorkflow {
  approvals?: SuspensionApproval[];
  noOfApprovals?: number;
  finalApproval?: string;
  approvalStatus?: string;
}

interface SuspensionPayload {
  userDetails?: SuspensionUserDetails;
  approvalWorkflow?: SuspensionApprovalWorkflow;
}

interface SuspensionData {
  workflow_id?: string;
  workflow_type?: string;
  status?: string;
  payload?: SuspensionPayload;
  meta_data?: SuspensionMetaData;
  created_at?: string;
  updated_at?: string;
}
interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
  actionText: string;
  buttonText: string;
  icon?: React.ReactNode; // optional icon
}

interface UserPayload {
  userId?: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  role?: string;
  email?: string;
  mobile?: string;
  title?: string;
  designation?: string;
  citizenship?: string;
  countryCode?: string;
  ckycNumber?: string;
  dateOfBirth?: string;
  proofOfIdentity?: string;
  proofOfIdentityNumber?: string;
  gender?: string;
  functionalityMapped?: Record<string, string[]>;
}

interface AddressPayload {
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  state?: string;
  pincode?: string;
  district?: string;
  country?: string;
  addressCountryCode?: string;
  pincodeInCaseOfOthers?: string;
}
// Update this interface in your file
interface PreviousVersionData {
  userId?: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  roleType?: string;
  userType?: string;
  email?: string;
  mobile?: string;
  title?: string;
  designation?: string;
  citizenship?: string;
  countryCode?: string;
  ckycNumber?: string;
  dateOfBirth?: string;
  proofOfIdentity?: string;
  proofOfIdentityNumber?: string;
  gender?: string;

  // New fields
  region?: string;
  regionCode?: string;
  branchName?: string;
  branchCode?: string;

  // Flattened Address Fields (Keeping for backward compatibility if needed)
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  state?: string;
  pincode?: string;
  district?: string;
  addressCountryCode?: string;
  alternatePincode?: string;
  digipin?: string;

  // Functionality Mapped
  functionalityMapped?: Record<string, string[]>;
}
interface ConfirmationModalProps {
  visible: boolean;
  onOk: (details: { reason: string }) => void;
  onCancel: () => void;
  loading: boolean;
  title: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  userName,
  userId,
  actionText,
  buttonText,
  icon,
}) => {
  const isSuccess =
    actionText?.toLowerCase()?.includes('success') ||
    actionText?.toLowerCase()?.includes('approved');
  return (
    <Dialog
      open={visible}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '16px', p: 2 } }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', top: 12, right: 12 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          textAlign: 'center',
          py: 4,
        }}
      >
        {/* ICON LOGIC */}
        {icon ? (
          icon
        ) : isSuccess ? (
          <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
        ) : (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#FF0707" />
            <path
              d="M17 17L31 31M31 17L17 31"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}

        {isSuccess && (
          <>
            <Typography
              variant="body1"
              sx={{ mt: 2, fontFamily: 'Gilroy, sans-serif', fontSize: '14px' }}
            >
              User
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{ fontWeight: 'bold', fontFamily: 'Gilroy, sans-serif' }}
            >
              {userName} - {userId}
            </Typography>
          </>
        )}

        <Typography
          variant="body1"
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            fontFamily: '"Gilroy-SemiBold", sans-serif',
            color: '#000',
            mb: 1,
            lineHeight: 1.4,
          }}
        >
          {actionText}
        </Typography>

        <MuiButton
          onClick={onClose}
          variant="contained"
          sx={{
            mt: 3,
            textTransform: 'none',
            borderRadius: '8px',
            py: 1.2,
            px: 8,
            fontWeight: 600,
            bgcolor: '#002CBA',
            fontFamily: 'Gilroy, sans-serif',
            fontSize: '14px',
            '&:hover': { bgcolor: '#001a8c' },
          }}
        >
          {buttonText}
        </MuiButton>
      </DialogContent>
    </Dialog>
  );
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onOk,
  onCancel,
  loading,
  title,
}) => {
  const [remark, setRemark] = useState('');
  const MAX_CHARS = 500;

  useEffect(() => {
    if (visible) {
      setRemark('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (remark.trim()) {
      onOk({ reason: remark });
    }
  };

  return (
    <Dialog
      open={visible}
      onClose={onCancel}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '16px', p: 2 } }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: '#2D2B274D',
          backdropFilter: 'blur(40px)',
        },
      }}
    >
      <IconButton
        onClick={onCancel}
        sx={{ position: 'absolute', top: 12, right: 12 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center',
        }}
      >
        <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />

        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: 'bold', fontFamily: 'Gilroy, sans-serif' }}
        >
          {title}
        </Typography>

        <Box sx={{ width: '100%', textAlign: 'left' }}>
          <Typography
            component="label"
            sx={{
              fontWeight: 500,
              fontSize: '14px',
              display: 'block',
              mb: 1,
              fontFamily: 'Gilroy, sans-serif',
            }}
          >
            Remark
          </Typography>
          <TextField
            placeholder="Type remark here"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            inputProps={{ maxLength: MAX_CHARS }}
            helperText={`${remark.length}/${MAX_CHARS}`}
            FormHelperTextProps={{
              sx: {
                textAlign: 'right',
                mx: 0,
                fontFamily: 'Gilroy, sans-serif',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '14px',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 2 }}>
          <MuiButton
            onClick={onCancel}
            disabled={loading}
            variant="outlined"
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              py: 1.2,
              fontWeight: 600,
              fontFamily: 'Gilroy, sans-serif',
              fontSize: '14px',
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleSubmit}
            disabled={loading || !remark.trim()}
            variant="contained"
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              py: 1.2,
              fontWeight: 600,
              bgcolor: '#002CBA',
              fontFamily: 'Gilroy, sans-serif',
              fontSize: '14px',
              '&:hover': { bgcolor: '#001a8c' },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Submit'
            )}
          </MuiButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const WORKFLOW_TYPES = [
  'CERSAI_USER_CREATION',
  'CERSAI_USER_MODIFICATION',
  'CERSAI_USER_SUSPENSION',
  'CERSAI_USER_SUSPENSION_REVOKE',
  'CERSAI_USER_DEACTIVATION',
];

const ACTION_TO_WORKFLOW_MAP: Record<string, string> = {
  'Create User': 'CERSAI_USER_CREATION',
  'Modify User': 'CERSAI_USER_MODIFICATION',
  'De-activate User': 'CERSAI_USER_DEACTIVATION',
  'Suspend User': 'CERSAI_USER_SUSPENSION',
  'Revoke User Suspension': 'CERSAI_USER_SUSPENSION_REVOKE',
};

const PAGE_SIZE = 10;
const SORT_BY = 'created_at';
const SORT_DESC = true;

interface WorkflowFetchPayload {
  filters: {
    operation: string;
    filters: {
      workflow_type: string | string[];
      status?: string | string[];
      [key: string]: string | string[] | number | boolean | undefined;
    };
  }[];
  page: number;
  pageSize: number;
  sortBy: string;
  sortDesc: boolean;
  search?: string;
}

interface FunctionalitySubModule {
  name: string;
  selected: boolean;
}

interface FunctionalityModule {
  module: string;
  submodules: FunctionalitySubModule[];
}

interface SelectedUserDetail extends SubUser {
  userName: string;
  title?: string;
  designation?: string;
  citizenship?: string;
  ckycNumber?: string;
  dateOfBirth?: string;
  employeeCode?: string;
  proofOfIdentity?: string;
  proofOfIdentityNumber?: string;
  gender?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  state?: string;
  pincode?: string;
  district?: string;
  country?: string;
  countryCode?: string;
  pincodeInCaseOfOthers?: string;
  deactivationInitiatedBy?: string;
  addressCountryCode?: string;
  deactivationRemark?: string;
  functionalities?: FunctionalityModule[];
  originalData: WorkflowItem;
}
interface TransformedUser {
  key: string;
  srNo: number;
  userId: string;
  userName: string;
  role: string;
  submittedOn: string;
  submittedBy: string;
  originalData: WorkflowItem;
}

const styles = {
  accordionStyles: {
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    marginBottom: '16px',
    marginLeft: '10px',
    marginRight: '10px',
    '.MuiAccordionSummary-root': {
      backgroundColor: '#E6EBFF',
      borderRadius: '8px',
      color: '#24222B',
      fontWeight: 500,
      fontFamily: 'Gilroy, sans-serif',
    },
    '.MuiAccordionDetails-root': {
      padding: '24px',
      fontFamily: 'Gilroy, sans-serif',
    },
  },
  labelStyles: {
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
    fontFamily: 'Gilroy, sans-serif',
  },
  textFieldStyles: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'Gilroy, sans-serif',
      fontWeight: 500,
      height: '48px',
      '&.Mui-disabled': {
        backgroundColor: '#F5F5F5',
      },
    },
  },
  formRowStyles: {
    display: 'flex',
    gap: '24px',
    ml: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  formFieldStyles: {
    flex: '1 1 calc(33.333% - 16px)',
    minWidth: '250px',
  },
};

const DashboardContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
});

const MainContent = styled(Box)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#FFFFFF',
});

// const TableWrapper = styled(Paper)({
//   margin: '0 24px 24px',
//   borderRadius: '8px',
//   boxShadow: 'none',
//   border: '1px solid #E0E0E0',
// });

const StyledAccordion = styled(Accordion)({
  boxShadow: 'none',
  border: '1px solid #E0E0E0',
  borderRadius: '8px !important',
  '&:before': {
    display: 'none',
  },
  margin: '16px 0 !important',
});

const StyledAccordionSummary = styled(AccordionSummary)({
  backgroundColor: '#E6EBFF',
  borderRadius: '8px',
  '.MuiAccordionSummary-content': {
    margin: '12px 0 !important',
  },
});
interface FormTextFieldProps {
  label: string;
  value: string | number | undefined;
  isMandatory?: boolean;
  isModified?: boolean;

  inputProps?: Record<string, unknown>;
  InputProps?: Record<string, unknown>;
  sx?: Record<string, unknown>;
  placeholder?: string;
  size?: 'small' | 'medium';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  [key: string]: unknown;
}

const FormTextField: React.FC<FormTextFieldProps> = ({
  label,
  value,
  isMandatory = false,
  isModified = false,
  inputProps,
  InputProps,
  sx,
  ...rest
}) => {
  return (
    <Box>
      <Typography
        component="label"
        sx={{
          fontFamily: 'Gilroy, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          color: '#000',
          display: 'block',
          mb: 1,
          ...(isModified && {
            backgroundColor: '#FFD952', // Updated Color
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            width: '100%',
          }),
          ...(isMandatory && {
            '&::after': {
              content: '" *"',
              color: 'error.main',
            },
          }),
        }}
      >
        {label}
      </Typography>

      <TextField
        value={value ?? '-'}
        disabled
        fullWidth
        variant="outlined"
        inputProps={{
          style: { padding: '12px 14px' },
          ...inputProps,
        }}
        {...rest}
        InputProps={{
          ...InputProps,
          style: {
            backgroundColor: '#F5F7FA',
            fontSize: '14px',
            height: '45px',
            ...((InputProps?.['style'] as Record<string, unknown>) ?? {}),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '45px',
            fontFamily: 'Gilroy, sans-serif',
            fontSize: '14px',
            '& input': {
              py: '12px',
            },
          },
          ...(sx ?? {}),
        }}
      />
    </Box>
  );
};

interface FunctionalityTableProps {
  functionalities: FunctionalityModule[];
}

const FunctionalityApprovalTable: React.FC<FunctionalityTableProps> = ({
  functionalities,
}) => (
  <>
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: '8px',
        overflow: 'hidden',
        mb: 4,
        border: '1px solid #E0E0E0',
        boxShadow: 'none',
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {['Sr.No.', 'Module', 'Sub-Module', 'Select'].map((label) => (
              <TableCell
                key={label}
                align={label === 'Select' ? 'center' : 'left'}
                sx={{
                  backgroundColor: '#E6EBFF',
                  fontWeight: 600,
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  borderBottom: 'none',
                }}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {functionalities.map((func, index) => {
            const rowSpan = func.submodules.length;
            return func.submodules.map((sm, smIndex) => (
              <TableRow
                key={`${index}-${smIndex}`}
                sx={{
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                {smIndex === 0 && (
                  <>
                    <TableCell
                      rowSpan={rowSpan}
                      component="th"
                      scope="row"
                      align="center"
                      sx={{
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        borderRight: '8px solid transparent',
                        backgroundClip: 'padding-box',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          right: '-4px',
                          top: '8px',
                          bottom: '8px',
                          width: '1px',
                          backgroundColor: 'rgba(224, 224, 224, 0.5)',
                        },
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </TableCell>
                    <TableCell
                      rowSpan={rowSpan}
                      sx={{
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        borderRight: '8px solid transparent',
                        backgroundClip: 'padding-box',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          right: '-4px',
                          top: '8px',
                          bottom: '8px',
                          width: '1px',
                          backgroundColor: 'rgba(224, 224, 224, 0.5)',
                        },
                      }}
                    >
                      {func.module}
                    </TableCell>
                  </>
                )}
                <TableCell
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                    borderRight: '8px solid transparent',
                    backgroundClip: 'padding-box',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: '-4px',
                      top: '8px',
                      bottom: '8px',
                      width: '1px',
                      backgroundColor: 'rgba(224, 224, 224, 0.5)',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                    }}
                  >
                    {smIndex + 1}. {sm.name}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Checkbox
                      disabled
                      checked={sm.selected}
                      sx={{
                        color: 'rgba(0, 0, 0, 0.38)',
                        '&.Mui-checked': {
                          color: '#000000',
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: '18px',
                        },
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </>
);

const FlexGridContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  mx: -1,
  my: -1,
};

const FlexGridItemStyle = {
  px: 2,
  py: 1,
  width: { xs: '100%', sm: '33.333%' },
};

type SortableKeys = keyof Omit<TransformedUser, 'originalData' | 'key'>;

const PROOF_OF_IDENTITY_MAP: Record<string, string> = {
  PAN_CARD: 'PAN Card',
  VOTER_ID: 'Voter ID',
  DRIVING_LICENSE: 'Driving License',
  OTHERS: 'Others',
};

const getProofOfIdentityLabel = (value: string | undefined): string => {
  if (!value) return '';
  return (
    PROOF_OF_IDENTITY_MAP[value] ||
    value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c: string) => c.toUpperCase())
  );
};

const SubUserApproval: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const menuAction = (searchParams.get('action') || 'User Approval').trim();
  const sanitizedAction = menuAction.replace(/user/i, '').trim();

  // --- Redux Selectors ---
  const currentPageData = useSelector(selectCurrentPageData);
  const loading = useSelector(selectLoading);
  const actionLoading: boolean = useSelector(selectLoading);
  const error: ApiError | string | null | undefined = useSelector(selectError);
  const filters = useSelector(selectFilters);
  const detailedUser: UserDetail | null = useSelector(selectDetailedUser);

  // --- Local State ---
  const [selectedUser, setSelectedUser] = useState<SelectedUserDetail | null>(
    null
  );
  const [previousVersionModalOpen, setPreviousVersionModalOpen] =
    useState(false);
  const [previousVersionLoading, setPreviousVersionLoading] = useState(false);
  const [previousVersionData, setPreviousVersionData] =
    useState<PreviousVersionData | null>(null);
  const [contentSearch, setContentSearch] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'error'
  );
  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [successInfo, setSuccessInfo] = useState({
    name: '',
    id: '',
    action: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys;
    direction: 'ascending' | 'descending';
  }>({
    key: 'submittedOn',
    direction: 'descending',
  });
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  const totalUsers = useSelector(selectTotalUsers) || 0;
  const [allCountries, setAllCountries] = useState<CountryCode[]>([]);
  const [suspensionData, setSuspensionData] = useState<SuspensionData | null>(
    null
  );
  const [suspensionLoading, setSuspensionLoading] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(totalUsers / PAGE_SIZE)) return;

    // Update Redux
    dispatch(setCurrentPage(newPage));

    // Trigger Fetch
    handleFetchPendingWorkflows(newPage, contentSearch);
  };

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchCountryCodes();
        setAllCountries(countries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (
      selectedUser?.originalData?.workflow_type !==
        'CERSAI_USER_MODIFICATION' ||
      !detailedUser
    ) {
      setModifiedFields(new Set());
      return;
    }

    const newModifiedFields = new Set<string>();
    const pendingUser = selectedUser.originalData.payload?.userDetails?.user;
    const pendingAddress =
      selectedUser.originalData.payload?.userDetails?.address;

    if (pendingUser) {
      for (const key of Object.keys(pendingUser)) {
        const pKey = key as keyof UserPayload;
        const pendingValue = pendingUser[pKey];

        if (pendingValue === null || pendingValue === undefined) continue;

        if (pKey === 'functionalityMapped') {
          if (
            JSON.stringify(pendingValue) !==
            JSON.stringify(detailedUser.functionalityMapped)
          ) {
            newModifiedFields.add('functionalityMapped');
          }
          continue;
        }

        const originalValue = detailedUser[pKey as keyof UserDetail];
        if (String(pendingValue) !== String(originalValue)) {
          newModifiedFields.add(pKey);
        }
      }
    }

    if (pendingAddress) {
      const addressKeyMap: {
        [key in keyof AddressPayload]?: keyof UserDetail;
      } = {
        line1: 'line1',
        line2: 'line2',
        line3: 'line3',
        city: 'city',
        state: 'state',
        pincode: 'pincode',
        district: 'district',
        addressCountryCode: 'addressCountryCode',
        pincodeInCaseOfOthers: 'pincodeInCaseOfOthers',
      };

      for (const key of Object.keys(pendingAddress)) {
        const pKey = key as keyof AddressPayload;
        const pendingValue = pendingAddress[pKey];
        const detailedUserKey = addressKeyMap[pKey];

        if (
          pendingValue === null ||
          pendingValue === undefined ||
          !detailedUserKey
        )
          continue;

        const originalValue = detailedUser[detailedUserKey];
        if (String(pendingValue) !== String(originalValue)) {
          newModifiedFields.add(pKey);
        }
      }
    }

    setModifiedFields(newModifiedFields);
  }, [selectedUser, detailedUser]);

  // Fetch suspension data when workflow_type is CERSAI_USER_SUSPENSION_REVOKE
  useEffect(() => {
    const fetchSuspensionData = async () => {
      if (
        selectedUser?.originalData?.workflow_type ===
          'CERSAI_USER_SUSPENSION_REVOKE' &&
        selectedUser
      ) {
        try {
          setSuspensionLoading(true);
          const userId =
            detailedUser?.userId ||
            selectedUser?.id ||
            selectedUser?.originalData?.meta_data?.userId;

          if (!userId) {
            console.error('User ID not available');
            setSuspensionLoading(false);
            return;
          }

          const payload = {
            filters: [
              {
                operation: 'AND',
                filters: {
                  workflow_type: ['CERSAI_USER_SUSPENSION'],
                  status: ['APPROVED'],
                  userId: userId,
                },
              },
            ],
            page: 0,
            pageSize: 10,
            sortBy: 'created_at',
            sortDesc: true,
          };

          const apiEndpoint = `${API_ADMIN_BASE_URL}/api/v1/user-workflow/track-status?ignoreInitiatedBy=true`;
          const response = await Secured.post(apiEndpoint, payload);

          if (
            response.data?.data?.content &&
            response.data.data.content.length > 0
          ) {
            setSuspensionData(response.data.data.content[0]);
          } else {
            setSuspensionData(null);
          }
        } catch (error) {
          console.error('Error fetching suspension data:', error);
          setSuspensionData(null);
        } finally {
          setSuspensionLoading(false);
        }
      } else {
        setSuspensionData(null);
      }
    };

    fetchSuspensionData();
  }, [selectedUser, detailedUser]);

  const mapFunctionalities = useCallback(
    (mapped: Record<string, string[]> | undefined): FunctionalityModule[] => {
      if (!mapped || typeof mapped !== 'object') return [];
      return Object.keys(mapped).map((moduleKey) => ({
        module: moduleKey.replace(/_/g, ' '),
        submodules: mapped[moduleKey].map((subName: string) => ({
          name: subName.replace(/_/g, ' '),
          selected: true,
        })),
      }));
    },
    []
  );

  useEffect(() => {
    if (selectedUser && detailedUser) {
      const hasNoFunctionalities =
        !selectedUser.functionalities ||
        selectedUser.functionalities.length === 0;

      if (hasNoFunctionalities && detailedUser.functionalityMapped) {
        const functionalitiesFromDetails = mapFunctionalities(
          detailedUser.functionalityMapped
        );

        if (functionalitiesFromDetails.length > 0) {
          setSelectedUser((currentUser) => {
            if (!currentUser) return null;
            return {
              ...currentUser,
              functionalities: functionalitiesFromDetails,
            };
          });
        }
      }
    }
  }, [detailedUser, selectedUser, mapFunctionalities]);

  const handleFetchPendingWorkflows = useCallback(
    (page: number, search: string) => {
      const workflowTypeToFetch = ACTION_TO_WORKFLOW_MAP[menuAction];
      const effectiveWorkflowTypes = workflowTypeToFetch
        ? [workflowTypeToFetch]
        : WORKFLOW_TYPES;

      const requestBody: WorkflowFetchPayload = {
        filters: [
          {
            operation: 'AND',
            filters: {
              workflow_type: effectiveWorkflowTypes,
              status: ['PENDING'],
            },
          },
        ],
        page: page - 1,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortDesc: SORT_DESC,
        ...(search.trim() && { search: search.trim() }),
      };
      dispatch(fetchUsers(requestBody));
    },
    [dispatch, menuAction]
  );

  useEffect(() => {
    if (!selectedUser) {
      handleFetchPendingWorkflows(1, contentSearch);
      dispatch(setCurrentPage(1));
    }
  }, [selectedUser, contentSearch, handleFetchPendingWorkflows, dispatch]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === 'string'
          ? error
          : (error as ApiError).errorMessage
            ? `${(error as ApiError).errorCode}: ${(error as ApiError).errorMessage}`
            : 'An unknown error occurred.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSearchClick = () => {
    handleFetchPendingWorkflows(1, contentSearch);
    dispatch(setCurrentPage(1));
  };

  const transformUserData = useCallback(
    (workflows: WorkflowItem[] = []): TransformedUser[] => {
      if (!Array.isArray(workflows)) return [];
      return workflows.map((workflow, index) => {
        const concernedUser = (workflow.payload?.concernedUserDetails ||
          {}) as ConcernedUser;
        const metaData = (workflow?.meta_data || {}) as MetaData;
        const userDetailsPayload = (workflow?.payload?.userDetails?.user ||
          {}) as UserPayload;
        const userId =
          concernedUser.userId ||
          metaData.userId ||
          userDetailsPayload.userId ||
          '-';
        const userRole =
          concernedUser.userType ||
          metaData.userRole ||
          userDetailsPayload.role ||
          '-';
        const getRoleLabel = (role: string): string => {
          switch (role) {
            case 'SA':
              return 'Super Admin';
            case 'RA':
            case 'CU':
            case 'OU':
              return 'Operational';
            case 'AU':
              return 'Admin';
            case 'SAU':
              return 'Super Admin';
            default:
              return role || '-';
          }
        };

        const initiatorDetails = workflow?.payload?.initiatorDetails || {};

        return {
          key: workflow?.workflow_id || `no-id-${index}`,
          srNo: index + 1 + (filters.currentPage - 1) * filters.pageSize,
          userName: concernedUser.username || metaData.userName || '-',
          userId: userId,
          role: getRoleLabel(userRole),
          submittedOn: DateUtils.formatDate(workflow?.created_at),
          submittedBy: initiatorDetails.userId || '-',
          originalData: workflow,
        };
      });
    },
    [filters.currentPage, filters.pageSize]
  );

  const handleRowClick = (workflowRecord: TransformedUser) => {
    const workflow = workflowRecord.originalData;
    const workflowType = workflow.workflow_type;
    if (workflowType !== 'CERSAI_USER_CREATION') {
      const userIdToFetch =
        workflow.meta_data?.userId ||
        (workflow.payload?.concernedUserDetails as ConcernedUser)?.userId;
      if (userIdToFetch) {
        dispatch(fetchUserDetailsById(userIdToFetch));
      } else {
        setSnackbarMessage(
          'Error: User ID is missing, cannot fetch current details.'
        );
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }

    const userPayload: UserPayload =
      (workflow?.payload?.userDetails?.user as UserPayload) || {};
    const addressPayload: AddressPayload =
      (workflow?.payload?.userDetails?.address as AddressPayload) || {};

    const mappedUserDetail: SelectedUserDetail = {
      id:
        userPayload.userId ||
        userPayload.employeeCode ||
        workflowRecord.userId ||
        '-',
      firstName: userPayload.firstName || '',
      lastName: userPayload.lastName || '',
      middleName: userPayload.middleName || '',
      role: userPayload.role || '',
      emailId: userPayload.email || '',
      mobileNumber: userPayload.mobile || '',
      createdDate: workflow.created_at,
      createdBy: workflow.payload?.initiatorDetails?.userId || '',
      status: workflow.status,
      userName: workflowRecord.userName || '',
      title: userPayload.title || '',
      designation: userPayload.designation || '',
      citizenship: userPayload.citizenship || '',
      ckycNumber: userPayload.ckycNumber || '',
      countryCode: userPayload.countryCode || '',
      dateOfBirth: userPayload.dateOfBirth || '',
      employeeCode: userPayload.employeeCode || '',
      proofOfIdentity: userPayload.proofOfIdentity || '',
      proofOfIdentityNumber: userPayload.proofOfIdentityNumber || '',
      gender: userPayload.gender || '',
      addressLine1: addressPayload.line1 || '',
      addressLine2: addressPayload.line2 || '',
      addressLine3: addressPayload.line3 || '',
      city: addressPayload.city || '',
      state: addressPayload.state || '',
      pincode: addressPayload.pincode || '',
      district: addressPayload.district || '',
      country: addressPayload.country || '',
      addressCountryCode: addressPayload.addressCountryCode || '',
      pincodeInCaseOfOthers: addressPayload.pincodeInCaseOfOthers || '',
      functionalities: mapFunctionalities(userPayload.functionalityMapped),
      deactivationInitiatedBy: workflowRecord.submittedBy || '',
      deactivationRemark:
        workflow.payload?.userDetails?.remarks ||
        (workflow.payload?.remarks as string) ||
        '-',
      originalData: workflow,
    };

    setSelectedUser(mappedUserDetail);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    dispatch(clearDetailedUser());
  };

  const handleFetchPreviousVersion = async () => {
    // Get userId from various sources
    type UserIdType = { id?: string; userId?: string };

    const userIdToUse =
      (selectedUser as UserIdType)?.id || (selectedUser as UserIdType)?.userId;

    if (!userIdToUse) {
      console.error('User ID not available');
      return;
    }

    try {
      setPreviousVersionLoading(true);
      setPreviousVersionModalOpen(true);

      const payload = [
        {
          operation: 'OR',
          filters: {
            userId: userIdToUse,
          },
        },
      ];

      // Use existing API endpoint for fetching sub-users
      const apiEndpoint = `${API_ENDPOINTS.get_all_user}?page=0&size=10`;

      const response = await Secured.post(apiEndpoint, payload);

      if (
        response.data?.data?.content &&
        response.data.data.content.length > 0
      ) {
        setPreviousVersionData(response.data.data.content[0]);
      } else {
        console.error('No previous version data found');
        setPreviousVersionData(null);
      }
    } catch (error) {
      console.error('Error fetching previous version:', error);
      setPreviousVersionData(null);
    } finally {
      setPreviousVersionLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    handleBackToList();
  };

  const handleGoBack = useCallback(() => {
    window.history.back();
  }, []);

  const submitWorkflowAction = async (
    action: 'APPROVE' | 'REJECT',
    reason: string,
    remarks: string
  ) => {
    if (!selectedUser?.originalData?.workflow_id) {
      setSnackbarMessage('Error: Workflow ID is missing.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      workflowId: selectedUser.originalData.workflow_id,
      action,
      reason,
      remarks,
    };

    try {
      await dispatch(approveOrRejectWorkflow(payload)).unwrap();
      setSuccessInfo({
        name: selectedUser.userName,
        id: selectedUser.id,
        action:
          action === 'APPROVE'
            ? selectedUser.originalData.workflow_type === 'CERSAI_USER_CREATION'
              ? 'created successfully'
              : selectedUser.originalData.workflow_type ===
                  'CERSAI_USER_MODIFICATION'
                ? 'modified successfully'
                : selectedUser.originalData.workflow_type ===
                    'CERSAI_USER_DEACTIVATION'
                  ? 'de-activated successfully'
                  : selectedUser.originalData.workflow_type ===
                      'CERSAI_USER_SUSPENSION'
                    ? 'suspended successfully'
                    : selectedUser.originalData.workflow_type ===
                        'CERSAI_USER_SUSPENSION_REVOKE'
                      ? 'revoked successfully'
                      : `${action.toLowerCase()}d successfully`
            : `User ${sanitizedAction} Request Rejected`,
      });
      setSuccessModalVisible(true);
      setConfirmationModalVisible(false);
    } catch (rejectedValue: unknown) {
      const rejectedError = rejectedValue as ApiError;
      let message = `Failed to ${action.toLowerCase()} the request.`;
      const status = rejectedError.httpCode;

      if (status === 200) {
        message = '200';
      } else if (status === 400) {
        message = rejectedError.errorMessage || 'API Error';
      } else if (status === 500) {
        message = 'Something went wrong, Unable to process your request !';
      } else if (rejectedError.errorMessage) {
        message = rejectedError.errorMessage;
      }

      setSnackbarMessage(message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setConfirmationModalVisible(false);
    }
  };

  const handleApprove = () =>
    submitWorkflowAction('APPROVE', 'user approval ok', 'user approval ok');
  const handleReject = () => setConfirmationModalVisible(true);
  const handleConfirmationOk = ({ reason }: { reason: string }) =>
    submitWorkflowAction('REJECT', reason, reason);

  const tableData = useMemo(
    () => transformUserData(currentPageData),
    [currentPageData, transformUserData]
  );

  const handleSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTableData = useMemo(() => {
    const sortableData = [...tableData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        // Special case for date sorting
        if (sortConfig.key === 'submittedOn') {
          const dateA = new Date(a.originalData.created_at).getTime();
          const dateB = new Date(b.originalData.created_at).getTime();
          if (dateA < dateB)
            return sortConfig.direction === 'ascending' ? -1 : 1;
          if (dateA > dateB)
            return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue)
          return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [tableData, sortConfig]);

  const tableHeaders: {
    label: string;
    key: SortableKeys;
    sortable: boolean;
  }[] = [
    { label: 'Sr.No.', key: 'srNo', sortable: false },
    { label: 'User Name', key: 'userName', sortable: true },
    { label: 'User ID', key: 'userId', sortable: true },
    { label: 'Role', key: 'role', sortable: true },
    { label: 'Submitted On', key: 'submittedOn', sortable: true },
    { label: 'Submitted By', key: 'submittedBy', sortable: true },
  ];

  const renderUserList = () => {
    // --- 1. PAGINATION LOGIC ---
    const totalPages = Math.ceil(totalUsers / PAGE_SIZE);
    // Ensure we don't show "Showing 1 to 10" if there are 0 users
    const startRecord =
      totalUsers === 0 ? 0 : (filters.currentPage - 1) * PAGE_SIZE + 1;
    const endRecord = Math.min(filters.currentPage * PAGE_SIZE, totalUsers);

    // Create array of page numbers [1, 2, 3...]
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* --- HEADER & BACK BUTTON --- */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            mx: 3,
            mt: 1,
            justifyContent: 'flex-end',
          }}
        >
          <Box
            onClick={handleGoBack}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              // '&:hover': { borderRadius: '4px' },
              p: 0.5,
            }}
          >
            <IconButton
              sx={{ mr: 1, p: 0, fontSize: '14px', color: '#1A1A1A' }}
            >
              <ArrowBackIcon sx={{ color: '#000000' }} />
            </IconButton>
            <Typography
              sx={{
                color: '#000000',
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                textTransform: 'none',
              }}
            >
              Back
            </Typography>
          </Box>
        </Box>

        {/* --- BREADCRUMBS --- */}
        <Box sx={{ mb: 3, mx: 3 }}>
          <AdminBreadcrumbUpdateProfile
            breadcrumbItems={[
              { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
              {
                label: 'User Management',
                href: '/ckycrr-admin/my-task/dashboard',
              },
              { label: menuAction.replace('User', '').trim() },
            ]}
          />
        </Box>

        {/* --- TITLE --- */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            mb: 2,
            mx: 3,
            fontFamily: 'Gilroy-SemiBold, sans-serif',
            fontSize: '18px',
            color: '#000000',
          }}
        >
          {menuAction}
        </Typography>

        {/* --- SEARCH BAR --- */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mx: 3 }}>
          <TextField
            placeholder="Content Search"
            size="small"
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchClick();
            }}
            InputProps={{
              startAdornment: (
                <IconButton
                  onClick={handleSearchClick}
                  disabled={loading}
                  size="small"
                >
                  <SearchIcon sx={{ color: '#D1D1D1' }} />
                </IconButton>
              ),
            }}
            sx={{
              width: 280,
              backgroundColor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                height: '45px',
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                paddingRight: '6px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#D1D1D1',
                opacity: 1,
              },
            }}
          />
        </Box>

        {/* --- TABLE --- */}
        <StyledTableWrapper>
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header) => (
                    <StyledHeaderCell
                      key={header.key}
                      onClick={() => header.sortable && handleSort(header.key)}
                    >
                      <div className="header-content">
                        {header.label}
                        {header.sortable && (
                          <div className="sort-icons">
                            <ArrowDropUpIcon
                              sx={{
                                fontSize: 18,
                                color:
                                  sortConfig.key === header.key &&
                                  sortConfig.direction === 'ascending'
                                    ? '#002CBA'
                                    : '#000',
                                marginBottom: '-6px',
                              }}
                            />
                            <ArrowDropDownIcon
                              sx={{
                                fontSize: 18,
                                color:
                                  sortConfig.key === header.key &&
                                  sortConfig.direction === 'descending'
                                    ? '#002CBA'
                                    : '#000',
                                marginTop: '-6px',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </StyledHeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : sortedTableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No pending tasks found for {menuAction}.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTableData.map((row, index) => (
                    <StyledTableRow
                      key={row.key}
                      onClick={() => handleRowClick(row)}
                    >
                      <StyledBodyCell>
                        {(filters.currentPage - 1) * PAGE_SIZE + index + 1}
                      </StyledBodyCell>
                      <StyledBodyCell>{row.userName}</StyledBodyCell>
                      <StyledBodyCell>{row.userId}</StyledBodyCell>
                      <StyledBodyCell>{row.role}</StyledBodyCell>
                      <StyledBodyCell>{row.submittedOn}</StyledBodyCell>
                      <StyledBodyCell>{row.submittedBy}</StyledBodyCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </StyledTableWrapper>

        {/* --- 2. PAGINATION COMPONENT --- */}
        {totalUsers > 0 && (
          <PaginationWrapper>
            {/* Left Side: Showing X to Y of Z */}
            <PaginationInfo>
              Showing data {startRecord} to {endRecord} of {totalUsers}
            </PaginationInfo>

            {/* Right Side: Buttons */}
            <PaginationNav>
              <NavButton
                variant="outlined"
                onClick={() => handlePageChange(filters.currentPage - 1)}
                disabled={filters.currentPage === 1}
                startIcon={<KeyboardArrowLeft />}
              >
                Previous
              </NavButton>

              <Box sx={{ display: 'flex', gap: '4px' }}>
                {pageNumbers.map((page) => (
                  <PageNumberBtn
                    key={page}
                    active={filters.currentPage === page}
                    onClick={() => handlePageChange(page)}
                    disableRipple
                  >
                    {page}
                  </PageNumberBtn>
                ))}
              </Box>

              <NavButton
                variant="outlined"
                onClick={() => handlePageChange(filters.currentPage + 1)}
                disabled={filters.currentPage === totalPages}
                endIcon={<KeyboardArrowRightIcon />}
              >
                Next
              </NavButton>
            </PaginationNav>
          </PaginationWrapper>
        )}
      </Box>
    );
  };

  const renderUserApprovalForm = () => {
    if (!selectedUser) return null;

    const workflowType = selectedUser.originalData?.workflow_type;
    const showHeaderFallback = workflowType !== 'CERSAI_USER_CREATION';
    const workflowPayload: UserPayload | undefined =
      selectedUser.originalData?.payload?.userDetails?.user;
    const addressPayload: AddressPayload | undefined = selectedUser.originalData
      ?.payload?.userDetails?.address as AddressPayload;

    console.log('addressPayload', addressPayload);
    const getUserFieldValue = (key: keyof UserPayload): string | undefined => {
      if (key === 'functionalityMapped') {
        return undefined;
      }

      const requestedValue = workflowPayload?.[key];
      if (typeof requestedValue === 'string' && requestedValue) {
        return requestedValue;
      }

      if (showHeaderFallback && detailedUser) {
        const detailValue = (detailedUser as Record<string, unknown>)[key];
        if (typeof detailValue === 'string' && detailValue) {
          return detailValue;
        }
        if (typeof detailValue === 'number') {
          return String(detailValue);
        }
      }

      const selectedValue = (
        selectedUser as unknown as Record<string, unknown>
      )[key];
      if (typeof selectedValue === 'string' && selectedValue) {
        return selectedValue;
      }

      return undefined;
    };

    const getCountryDailCodeName = (): string => {
      if (showHeaderFallback && detailedUser?.countryCode) {
        const countryCodeToUse =
          detailedUser?.countryCode?.toUpperCase() === 'IND'
            ? 'IN'
            : detailedUser?.countryCode?.toUpperCase();

        const country = allCountries.find(
          (c) => c.code.toUpperCase() === countryCodeToUse
        );
        return country ? `${country.dial_code} | ${country.name}` : '';
      } else {
        const country = allCountries.find(
          (c) =>
            c.code.toUpperCase() === workflowPayload?.countryCode?.toUpperCase()
        );
        return country ? `${country.dial_code} | ${country.name}` : '';
      }
    };

    const getCountryName = (): string => {
      if (showHeaderFallback && detailedUser?.addressCountryCode) {
        return detailedUser?.addressCountryCode || '-';
      } else if (addressPayload?.country) {
        const countryCodeToUse =
          addressPayload?.country?.toUpperCase() === 'IN'
            ? '+91'
            : addressPayload?.country?.toUpperCase();
        const country = allCountries.find(
          (c) => c.dial_code.toUpperCase() === countryCodeToUse
        );
        return country ? `${country.name}` : '-';
      }
      return '-';
    };

    const getAddressFieldValue = (
      key: keyof AddressPayload
    ): string | undefined => {
      const requestedValue = addressPayload?.[key];
      if (requestedValue) return requestedValue;

      if (showHeaderFallback && detailedUser) {
        const detailValue = (detailedUser as Record<string, unknown>)[key];
        if (detailValue) return String(detailValue);
      }

      const selectedUserKeyMap: Record<
        keyof AddressPayload,
        keyof SelectedUserDetail
      > = {
        line1: 'addressLine1',
        line2: 'addressLine2',
        line3: 'addressLine3',
        city: 'city',
        state: 'state',
        pincode: 'pincode',
        district: 'district',
        country: 'country',
        addressCountryCode: 'addressCountryCode',
        pincodeInCaseOfOthers: 'pincodeInCaseOfOthers',
      };
      const mappedKey = selectedUserKeyMap[key];
      const selectedValue = selectedUser[mappedKey];
      if (typeof selectedValue === 'string' && selectedValue) {
        return selectedValue;
      }
    };

    const actionLabel = menuAction.replace('User ', '');
    const displayAction =
      actionLabel === 'Suspension' ? 'Suspend' : actionLabel;

    const detailBreadcrumbs = [
      { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
      { label: 'User Management', href: '/ckycrr-admin/my-task/dashboard' },
      { label: displayAction },
      // { label: menuAction },
      { label: 'Approval' },
    ];

    const showDeactivationHeader =
      workflowType?.includes('DEACTIVATION') ||
      workflowType?.includes('SUSPENSION');

    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            // mx: 3,
            mt: 1,
            justifyContent: 'flex-end',
          }}
        >
          <Box
            onClick={handleGoBack}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              // '&:hover': { borderRadius: '4px' },
              // p: 0.5,
            }}
          >
            <IconButton
              sx={{ mr: 1, p: 0, fontSize: '14px', color: '#1A1A1A' }}
            >
              <ArrowBackIcon sx={{ color: '#000000' }} />
            </IconButton>
            <Typography
              sx={{
                color: '#000000',
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                textTransform: 'none',
              }}
            >
              Back
            </Typography>
          </Box>
        </Box>

        {/* --- BREADCRUMBS --- */}
        <Box sx={{ mb: 3, fontSize: '18px', fontWeight: '400' }}>
          <AdminBreadcrumbUpdateProfile breadcrumbItems={detailBreadcrumbs} />
        </Box>
        {/* <Box  sx={{ mb: 3, mx: 3 }}>
            <NavigationBreadCrumb crumbsData={detailBreadcrumbs} />
          </Box> */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            mb: 2,
            fontFamily: 'Gilroy-SemiBold, sans-serif',
            fontSize: '18px',
            color: '#000000',
          }}
        >
          {selectedUser.originalData.workflow_type === 'CERSAI_USER_CREATION'
            ? 'User Details'
            : selectedUser.originalData.workflow_type ===
                'CERSAI_USER_MODIFICATION'
              ? 'User Details'
              : selectedUser.originalData.workflow_type ===
                  'CERSAI_USER_DEACTIVATION'
                ? 'User De-activation Details'
                : selectedUser.originalData.workflow_type ===
                    'CERSAI_USER_SUSPENSION'
                  ? 'User Suspension Details'
                  : selectedUser.originalData.workflow_type ===
                      'CERSAI_USER_SUSPENSION_REVOKE'
                    ? 'Revoke User Suspension Details'
                    : 'User Details'}
        </Typography>

        {showDeactivationHeader && (
          <>
            <Paper
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: '#F0F4FF',
                borderRadius: '8px',
                border: '1px solid #E0E0E0',
                boxShadow: 'none',
              }}
            >
              <Box sx={FlexGridContainerStyle}>
                <Box sx={FlexGridItemStyle}>
                  <Typography variant="body2" color="textSecondary">
                    {selectedUser.originalData.workflow_type ===
                    'CERSAI_USER_DEACTIVATION'
                      ? 'De-activation Initiated by'
                      : selectedUser.originalData.workflow_type ===
                          'CERSAI_USER_SUSPENSION'
                        ? 'Suspension Initiated by'
                        : selectedUser.originalData.workflow_type ===
                            'CERSAI_USER_SUSPENSION_REVOKE'
                          ? 'Revocation Initiated by'
                          : 'Initiated by'}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedUser?.deactivationInitiatedBy || '-'}
                  </Typography>
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px' }}
                  >
                    {selectedUser.originalData.workflow_type ===
                    'CERSAI_USER_DEACTIVATION'
                      ? 'De-activation Initiated on'
                      : selectedUser.originalData.workflow_type ===
                          'CERSAI_USER_SUSPENSION'
                        ? 'Suspension Initiated on'
                        : selectedUser.originalData.workflow_type ===
                            'CERSAI_USER_SUSPENSION_REVOKE'
                          ? 'Revocation Initiated on'
                          : 'Initiated on'}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                    }}
                  >
                    {DateUtils.formatDate(selectedUser?.createdDate)}
                  </Typography>
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px' }}
                  >
                    {selectedUser.originalData.workflow_type ===
                    'CERSAI_USER_DEACTIVATION'
                      ? 'De-activation Remark'
                      : selectedUser.originalData.workflow_type ===
                          'CERSAI_USER_SUSPENSION'
                        ? 'Suspension Remark'
                        : selectedUser.originalData.workflow_type ===
                            'CERSAI_USER_SUSPENSION_REVOKE'
                          ? 'Remark for Revocation of Suspension'
                          : 'Remark'}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                    }}
                  >
                    {selectedUser?.deactivationRemark || '-'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Suspension Details Card - Only shown for CERSAI_USER_SUSPENSION_REVOKE */}
            {selectedUser.originalData.workflow_type ===
              'CERSAI_USER_SUSPENSION_REVOKE' &&
              (suspensionLoading ? (
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: '#F0F4FF',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    boxShadow: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100px',
                  }}
                >
                  <CircularProgress size={24} />
                </Paper>
              ) : suspensionData ? (
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: '#F0F4FF',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    boxShadow: 'none',
                  }}
                >
                  <Box sx={FlexGridContainerStyle}>
                    <Box sx={FlexGridItemStyle}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        Suspended by
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        {suspensionData?.meta_data?.lastActionBy ||
                          suspensionData?.meta_data?.submittedByFirstName ||
                          '-'}
                      </Typography>
                    </Box>

                    <Box sx={FlexGridItemStyle}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        Suspended on
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        {suspensionData?.meta_data?.lastActionOn
                          ? DateUtils.formatDate(
                              suspensionData.meta_data.lastActionOn
                            )
                          : suspensionData?.created_at
                            ? DateUtils.formatDate(suspensionData.created_at)
                            : '-'}
                      </Typography>
                    </Box>

                    <Box sx={FlexGridItemStyle}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        Suspension remark
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        {suspensionData?.payload?.userDetails?.remarks ||
                          suspensionData?.payload?.approvalWorkflow
                            ?.approvals?.[0]?.remarks ||
                          '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ) : null)}

            <Box sx={{ ...FlexGridContainerStyle }}>
              <Box sx={FlexGridItemStyle}>
                <FormTextField
                  label="User Name"
                  value={selectedUser.userName}
                />
              </Box>
              <Box sx={FlexGridItemStyle}>
                <FormTextField
                  label="User Role"
                  value={detailedUser?.roleType || selectedUser?.role || '-'}
                />
              </Box>
              <Box sx={FlexGridItemStyle}>
                <FormTextField
                  label="User ID"
                  value={detailedUser?.userId || selectedUser?.id}
                />
              </Box>
            </Box>
          </>
        )}

        <Paper sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
          <StyledAccordion defaultExpanded>
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>User Details</Typography>
            </StyledAccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Box sx={FlexGridContainerStyle}>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Citizenship"
                    value={getUserFieldValue('citizenship')}
                    isMandatory
                    isModified={modifiedFields.has('citizenship')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#000',
                      display: 'block',
                      mb: 1,
                      ...(modifiedFields.has('ckycNumber') && {
                        backgroundColor: '#FFD952',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        width: '100%',
                      }),
                      '&::after': { content: '" *"', color: 'error.main' },
                    }}
                  >
                    CKYC Number
                  </Typography>
                  <TextField
                    value={getUserFieldValue('ckycNumber') || '-'}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{
                      endAdornment: getUserFieldValue('ckycNumber') ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'green',
                            pr: 1,
                          }}
                        >
                          <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">Verified</Typography>
                        </Box>
                      ) : null,
                      style: { backgroundColor: '#F5F7FA', height: '45px' },
                    }}
                    inputProps={{ style: { padding: '12px 14px' } }}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Title"
                    value={getUserFieldValue('title')}
                    isMandatory
                    isModified={modifiedFields.has('title')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="First Name"
                    value={getUserFieldValue('firstName')}
                    isMandatory
                    isModified={modifiedFields.has('firstName')}
                  />
                </Box>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Middle Name"
                    value={getUserFieldValue('middleName')}
                    isModified={modifiedFields.has('middleName')}
                  />
                </Box>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Last Name"
                    value={getUserFieldValue('lastName')}
                    isModified={modifiedFields.has('lastName')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Gender"
                    value={getUserFieldValue('gender')}
                    isMandatory
                    isModified={modifiedFields.has('gender')}
                  />
                </Box>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Date of Birth"
                    value={getUserFieldValue('dateOfBirth')}
                    isMandatory
                    isModified={modifiedFields.has('dateOfBirth')}
                  />
                </Box>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Designation"
                    value={getUserFieldValue('designation')}
                    isMandatory
                    isModified={modifiedFields.has('designation')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Employee Code"
                    value={getUserFieldValue('employeeCode')}
                    isMandatory
                    isModified={modifiedFields.has('employeeCode')}
                  />
                </Box>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Email"
                    value={getUserFieldValue('email')}
                    isMandatory
                    isModified={modifiedFields.has('email')}
                  />
                </Box>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Country Code"
                    value={getCountryDailCodeName() || 'India (+91)'}
                    isMandatory
                    isModified={modifiedFields.has('countryCode')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Mobile Number"
                    value={getUserFieldValue('mobile')}
                    isMandatory
                    isModified={modifiedFields.has('mobile')}
                  />
                </Box>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Proof of Identity"
                    value={getProofOfIdentityLabel(
                      getUserFieldValue('proofOfIdentity')
                    )}
                    isMandatory
                    isModified={modifiedFields.has('proofOfIdentity')}
                  />
                </Box>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Proof of Identity Number"
                    value={getUserFieldValue('proofOfIdentityNumber')}
                    isMandatory
                    isModified={modifiedFields.has('proofOfIdentityNumber')}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </StyledAccordion>

          <StyledAccordion defaultExpanded>
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>
                User Address Details
              </Typography>
            </StyledAccordionSummary>

            <AccordionDetails>
              <Box sx={FlexGridContainerStyle}>
                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Address Line 1"
                    value={getAddressFieldValue('line1')}
                    isMandatory
                    isModified={modifiedFields.has('line1')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Address Line 2"
                    value={getAddressFieldValue('line2')}
                    isModified={modifiedFields.has('line2')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Address Line 3"
                    value={getAddressFieldValue('line3')}
                    isModified={modifiedFields.has('line3')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Country"
                    value={getCountryName() || '-'}
                    isMandatory
                    isModified={modifiedFields.has('addressCountryCode')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="State / UT"
                    value={getAddressFieldValue('state')}
                    isMandatory
                    isModified={modifiedFields.has('state')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="District"
                    value={getAddressFieldValue('district')}
                    isMandatory
                    isModified={modifiedFields.has('district')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="City / Town"
                    value={getAddressFieldValue('city')}
                    isMandatory
                    isModified={modifiedFields.has('city')}
                  />
                </Box>

                <Box sx={FlexGridItemStyle}>
                  <FormTextField
                    label="Pin Code"
                    value={getAddressFieldValue('pincode')}
                    isMandatory
                    isModified={modifiedFields.has('pincode')}
                  />
                </Box>

                {getAddressFieldValue('pincode') === 'other' && (
                  <Box sx={FlexGridItemStyle}>
                    <FormTextField
                      label="Pin Code (In case of others)"
                      value={getAddressFieldValue('pincodeInCaseOfOthers')}
                      isModified={modifiedFields.has('pincodeInCaseOfOthers')}
                    />
                  </Box>
                )}

                <Box sx={FlexGridItemStyle}>
                  <FormTextField label="Digipin" value="-" />
                </Box>
              </Box>
            </AccordionDetails>
          </StyledAccordion>

          <Box sx={{ mt: 3, mb: 1 }}>
            <Box sx={{ width: { xs: '100%', sm: '33.333%' } }}>
              <FormTextField
                label="User Role"
                value={(() => {
                  let roleCode = detailedUser?.roleType;

                  if (!roleCode) {
                    roleCode = getUserFieldValue('role');
                  }

                  if (roleCode && typeof roleCode === 'string') {
                    const upperRole = roleCode.toUpperCase();
                    if (upperRole === 'CU') return 'Operational User';
                    if (upperRole === 'SA') return 'Super Admin (SA)';
                    if (upperRole === 'RA') return 'Registry Admin (RA)';
                    return roleCode;
                  }
                  return roleCode;
                })()}
                isMandatory
                isModified={modifiedFields.has('role')}
              />
            </Box>
          </Box>

          <Typography
            sx={{
              fontWeight: 600,
              mt: 3,
              mb: 1,
              ...(modifiedFields.has('functionalityMapped') && {
                backgroundColor: '#FFD952',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                width: '100%',
              }),
              '&::after': {
                content: '" *"',
                color: 'error.main',
              },
            }}
          >
            Select Functionalities
          </Typography>

          <FunctionalityApprovalTable
            functionalities={selectedUser.functionalities || []}
          />

          {selectedUser?.originalData?.workflow_type ===
            'CERSAI_USER_MODIFICATION' && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '100%',
                mt: 2,
              }}
            >
              <Typography
                component="span"
                onClick={handleFetchPreviousVersion}
                sx={{
                  color: '#002CBA',
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#1565c0',
                  },
                }}
              >
                View Previous Version
              </Typography>
            </Box>
          )}

          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}
          >
            <MuiButton
              variant="outlined"
              onClick={handleReject}
              disabled={actionLoading}
              sx={{
                borderColor: '#002CBA',
                color: '#002CBA',
                textTransform: 'none',
                fontWeight: 600,
                px: 5,
                py: 1,
                borderRadius: '4px',
              }}
            >
              Reject
            </MuiButton>
            <MuiButton
              variant="contained"
              onClick={handleApprove}
              disabled={actionLoading}
              sx={{
                bgcolor: '#002CBA',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                px: 5,
                py: 1,
                '&:hover': { bgcolor: '#001a8c' },
                borderRadius: '4px',
              }}
            >
              {actionLoading ? 'Submitting...' : 'Approve'}
            </MuiButton>
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <DashboardContainer>
      <MainContent>
        {selectedUser ? renderUserApprovalForm() : renderUserList()}
      </MainContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={handleSuccessModalClose}
        userName={successInfo.name}
        userId={successInfo.id}
        actionText={successInfo.action}
        buttonText="Okay"
      />

      <ConfirmationModal
        visible={isConfirmationModalVisible}
        onCancel={() => setConfirmationModalVisible(false)}
        onOk={handleConfirmationOk}
        loading={actionLoading}
        title={`Reject ${menuAction}`}
      />

      {/* Previous Version Modal */}
      <Dialog
        open={previousVersionModalOpen}
        onClose={() => setPreviousVersionModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Gilroy, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            pb: 2,
          }}
        >
          <IconButton
            onClick={() => setPreviousVersionModalOpen(false)}
            sx={{
              padding: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <CloseIcon sx={{ color: '#1A1A1A' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {previousVersionLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  color: '#1A1A1A',
                }}
              >
                Loading previous version data...
              </Typography>
            </Box>
          ) : previousVersionData ? (
            <Box>
              {/* Previous User Details Section */}
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  mb: 2,
                }}
              >
                Previous User Details
              </Typography>

              {/* User Details Section */}
              <Accordion defaultExpanded sx={styles.accordionStyles}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>User Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Citizenship
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.citizenship || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          CKYC Number
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.ckycNumber || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Title
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.title || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          First Name
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.firstName || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Middle Name
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.middleName || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Last Name
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.lastName || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Gender
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.gender || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Date of Birth
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.dateOfBirth || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Designation
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.designation || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Employee Code
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.employeeCode || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Email
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.email || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Country Code
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.countryCode || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Mobile Number
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.mobile || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Proof of Identity
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.proofOfIdentity || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Proof of Identity Number
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.proofOfIdentityNumber || ''
                          }
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* User Address Details Section */}
              <Accordion defaultExpanded sx={styles.accordionStyles}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>User Address Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 1
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.line1 || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 2
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.line2 || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 3
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.line3 || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Country
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.addressCountryCode || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          State / UT
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.state || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          District
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.district || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          City/Town
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.city || ''}
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Pin Code
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.pincode === '000000'
                              ? 'Others'
                              : previousVersionData?.pincode || ''
                          }
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    {previousVersionData?.pincode === '000000' ? (
                      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={styles.labelStyles}
                          >
                            Pin Code (in case of others)
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            value={previousVersionData?.alternatePincode || ''}
                            size="small"
                            sx={styles.textFieldStyles}
                            disabled
                          />
                        </Box>
                      </Grid>
                    ) : (
                      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={styles.labelStyles}
                          >
                            Digipin
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            value={previousVersionData?.digipin || '-'}
                            size="small"
                            sx={styles.textFieldStyles}
                            disabled
                          />
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* User Role Section */}
              <Box sx={{ mt: 3, mb: 1, px: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#1A1A1A',
                    mb: 1,
                    '&::after': {
                      content: '" *"',
                      color: '#FF0000',
                    },
                  }}
                >
                  User Role
                </Typography>
                <TextField
                  // fullWidth
                  variant="outlined"
                  value={(() => {
                    const roleCode = previousVersionData?.roleType;
                    if (roleCode && typeof roleCode === 'string') {
                      const upperRole = roleCode.toUpperCase();
                      if (upperRole === 'CU') return 'Operational User';
                      if (upperRole === 'SA') return 'Super Admin (SA)';
                      if (upperRole === 'RA') return 'Registry Admin (RA)';
                      return roleCode;
                    }
                    return roleCode || '';
                  })()}
                  size="small"
                  sx={{
                    ...styles.textFieldStyles,
                    backgroundColor: '#F5F5F5',
                    width: '250px',
                    '& .MuiOutlinedInput-root': {
                      height: '48px',
                      '&.Mui-disabled': {
                        backgroundColor: '#F5F5F5',
                      },
                    },
                  }}
                  disabled
                />
              </Box>

              {/* Select Functionalities Section */}
              <Box sx={{ mt: 3, mb: 2, px: 2 }}>
                <Typography
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#1A1A1A',
                    mb: 2,
                    '&::after': {
                      content: '" *"',
                      color: '#FF0000',
                    },
                  }}
                >
                  Select Functionalities
                </Typography>

                {previousVersionData?.functionalityMapped && (
                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: 'none',
                      border: '1px solid #E0E0E0',
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            backgroundColor: '#E8EAF6',
                          }}
                        >
                          <TableCell
                            sx={{
                              fontFamily: 'Gilroy, sans-serif',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#1A1A1A',
                              width: '80px',
                              borderRight: '1px solid #E0E0E0',
                            }}
                          >
                            Sr.No.
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: 'Gilroy, sans-serif',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#1A1A1A',
                              borderRight: '1px solid #E0E0E0',
                            }}
                          >
                            Module
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: 'Gilroy, sans-serif',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#1A1A1A',
                              borderRight: '1px solid #E0E0E0',
                            }}
                          >
                            Sub-Module
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: 'Gilroy, sans-serif',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#1A1A1A',
                              width: '100px',
                              textAlign: 'center',
                            }}
                          >
                            Select
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(() => {
                          let serialNumber = 0;
                          return Object.entries(
                            previousVersionData.functionalityMapped
                          ).map(
                            ([category, functionalities]: [string, string[]]) =>
                              functionalities.map(
                                (func: string, index: number) => {
                                  serialNumber++;
                                  return (
                                    <TableRow
                                      key={`${category}-${func}`}
                                      sx={{
                                        '&:nth-of-type(odd)': {
                                          backgroundColor: '#FAFAFA',
                                        },
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          fontFamily: 'Gilroy, sans-serif',
                                          fontSize: '14px',
                                          color: '#1A1A1A',
                                          borderRight: '1px solid #E0E0E0',
                                        }}
                                      >
                                        {String(serialNumber).padStart(2, '0')}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontFamily: 'Gilroy, sans-serif',
                                          fontSize: '14px',
                                          color: '#1A1A1A',
                                          textTransform: 'uppercase',
                                          borderRight: '1px solid #E0E0E0',
                                        }}
                                      >
                                        {category.replace(/_/g, ' ')}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontFamily: 'Gilroy, sans-serif',
                                          fontSize: '14px',
                                          color: '#1A1A1A',
                                          borderRight: '1px solid #E0E0E0',
                                        }}
                                      >
                                        {index + 1}. {func.replace(/_/g, ' ')}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: 'center',
                                        }}
                                      >
                                        <Checkbox
                                          checked={true}
                                          disabled
                                          sx={{
                                            color: '#1A1A1A',
                                            '&.Mui-checked': {
                                              color: '#1A1A1A',
                                            },
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                }
                              )
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  color: '#1A1A1A',
                }}
              >
                No previous version data available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'flex-end',
            px: 3,
            pb: 3,
          }}
        >
          <MuiButton
            onClick={() => setPreviousVersionModalOpen(false)}
            sx={{
              backgroundColor: '#002CBA',
              color: 'white',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'Gilroy, sans-serif',
              minWidth: '100px',
              '&:hover': {
                backgroundColor: '#0022A3',
              },
            }}
          >
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default SubUserApproval;
