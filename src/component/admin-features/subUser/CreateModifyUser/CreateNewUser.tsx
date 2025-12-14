/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  fetchDropdownMasters,
  fetchGeographyHierarchy,
} from '../../../../redux/slices/registerSlice/masterSlice';
import { AppDispatch, RootState } from '../../../../redux/store';
// import { fetchApprovedRegions } from '../CreateModifyRegion/slice/approvedRegionsSlice';
// import { fetchApprovedBranches } from '../CreateModifyBranch/slice/approvedBranchSlice';
import {
  clearData as clearAddressData,
  fetchUserAddress,
} from './slice/userAddressSlice';
import { UserAddressParams } from './types/userAddressTypes';
// import { fetchUserRoles } from './slice/userRolesSlice';
import { OTPSend } from '../../../features/Authenticate/slice/authSlice';
// import { validateOtpReq } from '../../../ui/Modal/slice/otpModalSlice';
import { fetchUsers } from '../slices/subUserSlice';
import { fetchCersaiAddress } from './slice/cersaiAddressSlice';
import {
  createUser,
  modifyUserThunk,
  resetState as resetCreateUserState,
} from './slice/createUserSlice';
import { clearData as clearFetchUserData } from './slice/fetchUserSlice';
import { clearData as clearModifyUserData } from './slice/modifyUserSlice';
import { CreateUserRequest } from './types/createUserTypes';
// import OTPVerificationModal from '../../../ui/Modal/OTPVerificationModal';
import CkycNumberField from '../../../ui/Input/CkycNumberField';
import CKYCVerificationModal from './CKYCVerification/CKYCVerificationModal';
import OTPVerificationModal from './OTPVerificationModal';
// import { fetchCkycDetails } from '../../../features/Authenticate/slice/signupSlice';
import DeactivateUserModal from './DeactivateUser/DeactivateUserModal';
import RevokeUserModal from './RevokeUser/RevokeUserModal';
import { revokeSuspendUser } from './slice/revokeSuspendUserSlice';
import SuspendUserModal from './SuspendUser/SuspendUserModal';
// Remove the direct import and use fetch with proper error handling
import {
  KeyboardArrowUp as ExpandLessIcon,
  KeyboardArrowDown as ExpandMoreIcon,
} from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
  Collapse,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../ErrorModal/ErrorModal';
import {
  // BackButton,
  // PageTitle,
  ContentWrapper,
  FieldLabel,
  FormRow,
  MainContainer,
  StyledFormControl,
  StyledMenuItem,
  customArrowIconStyles,
} from './CreateNewUser.styles';
// import { ModifyUserRequest } from './types/modifyUserTypes';
import {
  ValidationUtils,
  maxLengthByIdType,
} from '../../../../utils/validationUtils';
import SelectFunctionalities from '../../../common/SelectFunctionalities/SelectFunctionalities';
import NavigationBreadCrumb from '../../../features/UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import StatusScreen from '../../../features/UserManagement/TrackStatus/StatusScreen';
import { API_ADMIN_BASE_URL } from '../../../../Constant';
import { Secured } from '../../../../utils/HelperFunctions/api';
import DateUtils from '../../../../utils/dateUtils';

// Type definitions for dropdown options
interface DropdownOption {
  value?: string;
  label?: string;
  name?: string;
}

// Country data interface
interface CountryData {
  name: string;
  dial_code: string;
  code: string;
}

// For phone dial codes
type PhoneCountry = {
  code: string; // "IN"
  name: string; // "India"
  countryCode: string; // "+91" (was dial_code in JSON)
};

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

type UserRole =
  | 'INSTITUTIONAL_USER'
  | 'INSTITUTIONAL_ADMIN_USER'
  | 'INSTITUTIONAL_REGIONAL_ADMIN'
  | 'INSTITUTIONAL_REGIONAL_USER'
  | 'INSTITUTIONAL_BRANCH_USER'
  | 'INDIVIDUAL_USER'
  | '';

interface CustomArrowIconProps {
  className?: string;
  style?: React.CSSProperties;
}

// TypeScript interfaces for geography hierarchy (matching CreateNewRegion)
interface Pincode {
  id: number;
  pincode: string;
  city: string;
}

interface District {
  id: number;
  name: string;
  pincodes?: Pincode[];
}
interface State {
  id: number;
  name: string;
  districts?: District[];
}
interface Country {
  code: string;
  name: string;
  states?: State[];
}

interface Pincode {
  id: number;
  pincode: string;
  city: string;
}

const CustomArrowIcon = (props: CustomArrowIconProps) => {
  return <KeyboardArrowDownIcon {...props} sx={customArrowIconStyles} />;
};

// Collapsible Section Component
interface CollapsibleSectionProps extends BoxProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultExpanded = true,
  children,
  ...props
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      component="div"
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: '4px',
        overflow: 'hidden',
        ...props.sx,
      }}
    >
      <Box
        onClick={toggleExpand}
        sx={{
          height: '55px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#E6EBFF',
          cursor: 'pointer',
        }}
        aria-expanded={expanded}
        aria-controls="collapsible-section"
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: '#24222B',
            fontFamily: 'Gilroy, sans-serif',
            fontSize: '16px',
          }}
        >
          {title}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          sx={{
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
          aria-label={expanded ? 'Collapse section' : 'Expand section'}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

// Helper function to build breadcrumbs based on sidebar menu structure and current route
const buildBreadcrumbs = (menuAction: string, isModifyMode: boolean) => {
  // Define the sidebar menu structure for User Management > User
  const userManagementMenuStructure = {
    'View User Details': ['User Management', 'User', 'View User Details'],
    Create: ['User Management', 'User', 'Create'],
    Modify: ['User Management', 'User', 'Modify'],
    'De-activate': ['User Management', 'User', 'De-activate'],
    Suspend: ['User Management', 'User', 'Suspend'],
    'Revoke Suspension': ['User Management', 'User', 'Revoke Suspension'],
    'Track Status': ['User Management', 'User', 'Track Status'],
  };

  // Get the base breadcrumb path from the menu structure
  const baseBreadcrumbs = userManagementMenuStructure[
    menuAction as keyof typeof userManagementMenuStructure
  ] || ['User Management', 'User', menuAction];

  // If in modify mode (viewing a specific user), add "User Details" at the end
  if (isModifyMode) {
    return [...baseBreadcrumbs, 'User Details'];
  }

  return baseBreadcrumbs;
};

const CreateNewUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();

  // Get workflow data from navigation state (for Track Status mode)
  const navigationState = location.state as {
    user?: any;
    fromTrackStatus?: boolean;
    workflowStatus?: string;
    workflowData?: any;
  } | null;

  // Determine if we're in modify mode
  const [isModifyMode, setIsModifyMode] = useState<boolean>(Boolean(id));

  // Update isModifyMode when id changes (e.g., navigating from modify to create)
  useEffect(() => {
    setIsModifyMode(Boolean(id));
  }, [id]);

  // Get the menu action from URL params
  // If no action parameter, default to 'Create' if no ID, otherwise 'Modify'
  const menuAction = searchParams.get('action') || (id ? 'Modify' : 'Create');

  // Determine if we're in view-only mode (View User Details)
  const isViewOnlyMode = [
    'View User Details',
    'De-activate',
    'Suspend',
    'Revoke Suspension',
    'Track Status',
  ].includes(menuAction);

  // Build breadcrumbs dynamically based on sidebar menu structure
  const breadcrumbs = buildBreadcrumbs(menuAction, isModifyMode);

  const { titles, genders, citizenships, proofOfIdentities, loading } =
    useSelector((state: RootState) => state.masters);

  const [isAllFieldsDisabled, setIsAllFieldsDisabled] = useState(false);

  useEffect(() => {
    if (id && isViewOnlyMode) {
      setIsAllFieldsDisabled(true);
    } else {
      setIsAllFieldsDisabled(false);
    }
  }, [id, isViewOnlyMode]);

  // Redux selectors for regions and branches
  const {
    data: regions,
    loading: regionsLoading,
    error: regionsError,
  } = useSelector((state: RootState) => state.approvedRegions);
  const {
    branches,
    loading: branchesLoading,
    error: branchesError,
  } = useSelector((state: RootState) => state.approvedBranches);
  const { data: addressData, loading: addressLoading } = useSelector(
    (state: RootState) => state.userAddress
  );

  // CERSAI Address state from Redux
  const { data: cersaiAddress, loading: cersaiAddressLoading } = useSelector(
    (state: RootState) => state.cersaiAddress
  );

  const userRolesData = useSelector((state: RootState) => state.userRoles.data);
  const userRolesLoading = useSelector(
    (state: RootState) => state.userRoles.loading
  );
  const userRolesError = useSelector(
    (state: RootState) => state.userRoles.error
  );

  // Send OTP state
  const sendOtpLoading = useSelector(
    (state: RootState) => state.sendOtp.loading
  );

  // Create User state
  const createUserLoading = useSelector(
    (state: RootState) => state.createUserManagement.loading
  );

  // Fetch User state
  const {
    data: fetchedUserData,
    loading: fetchUserLoading,
    error: fetchUserError,
  } = useSelector((state: RootState) => state.fetchUser) as {
    data: any;
    loading: boolean;
    error: string | null;
  };

  // Modify User state
  const { loading: modifyUserLoading } = useSelector(
    (state: RootState) => state.modifyUser
  );

  // Country data state
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // For address hierarchy we already have Country (code,name,states)
  const [phoneCountries, setPhoneCountries] = useState<PhoneCountry[]>([]);
  const [geoCountries, setGeoCountries] = useState<Country[]>([]);

  const [userRole, setUserRole] = useState<UserRole>('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [availablePincodes, setAvailablePincodes] = useState<Pincode[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    citizenship: 'India',
    ckycNumber: '',
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    designation: '',
    email: '',
    gender: '',
    countryCode: '+91',
    mobileNumber: '',
    dateOfBirth: '',
    proofOfIdentity: '',
    proofOfIdentityNumber: '',
    employeeCode: '',
    // Address fields
    officeAddress: 'registered',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressCountryCode: '+91',
    addressCountryName: 'India',
    state: '',
    district: '',
    city: '',
    pinCode: '',
    otherPinCode: '',
    digipin: '',
    sameAsRegisteredAddress: false,
    role: undefined,
    operationalStatus: undefined,
  });

  // Module mapping: Display Label -> API Code
  const MODULE_CODE_MAP = {
    'My Task': 'MY_TASK',
    Dashboard: 'DASHBOARD',
    'RE management': 'RE_MANAGEMENT',
    'Master Management': 'MASTER_MANAGEMENT',
    'Sub-User management': 'SUB_USER_MANAGEMENT',
    'Billing Management System': 'BILLING_MANAGEMENT_SYSTEM',
    'Content Management System': 'CONTENT_MANAGEMENT_SYSTEM',
    'MIS Reports': 'MIS_REPORTS',
    'Beneficial Owner (BO) Registry': 'BENEFICIAL_OWNER_REGISTRY',
    'Ticket Management': 'TICKET_MANAGEMENT',
  } as const;

  // Sub-module mapping: Display Label -> API Code
  const SUB_MODULE_CODE_MAP: Record<string, string> = {
    // My Task
    'New RE registration/ re-submitted RE registration application':
      'RE_REGISTRATION',
    'RE update profile request': 'RE_UPDATE_PROFILE',
    'RE Merger request': 'RE_MERGER',
    'RE deactivation request (Initiated by RE)': 'RE_DEACTIVATION_BY_RE',
    'RE deactivation/ suspension request (Initiated by CERSAI)':
      'RE_DEACTIVATION_BY_CERSAI',

    // Dashboard
    'Access to dashboard': 'ACCESS_TO_DASHBOARD',

    // RE management
    'View RE details': 'VIEW_RE_DETAILS',
    'De-activate RE': 'DEACTIVATE_RE',
    'Suspend RE': 'SUSPEND_RE',
    'Revocation of suspension': 'REVOCATION_OF_RE',
    'Nodal officer / IAUs Update': 'NODAL_OFFICER_AND_IAU_UPDATE',

    // Master Management
    'Dropdown Master': 'DROPDOWN_MASTER',
    'Geography masters': 'GEOGRAPHY_MASTERS',
    'ISO Code masters': 'ISO_CODE_MASTERS',

    // Sub-User management
    'Create/modify User': 'CREATE_MODIFY_USER',
    'De-activate user': 'DEACTIVATE_USER',
    'Suspend user': 'SUSPEND_USER',
    'Revocation of suspension of user': 'REVOCATION_OF_SUSPEND_USER',

    // Billing Management System
    'Balance Ledger': 'BALANCE_LEDGER',
    'Incentive claim process': 'INCENTIVE_CLAIM_PROCESS',
    'Refund request process': 'REFUND_REQUEST_PROCESS',

    // Content Management System
    'Homepage content management': 'HOME_PAGE_CONTENT_MANAGEMENT',
    'Download section management': 'DOWNLOAD_SECTION_MANAGEMENT',
    'FAQ management': 'FAQ_MANAGEMENT',
    'SMS/Email template management': 'SMS_AND_EMAIL_TEMPLATE_MANAGEMENT',
    'Invoice template management': 'INVOICE_TEMPLATE_MANAGEMENT',
    'Document validation settings': 'DOCUMENT_VALIDATION_SETTINGS',
    'Charge management': 'CHARGE_MANAGEMENT',
    'Form validations': 'FORM_VALIDATIONS',
    'Training Content': 'TRAINING_CONTENT',

    // MIS Reports
    'Access to MIS reports': 'ACCESS_TO_MIS_REPORTS',

    // Beneficial Owner (BO) Registry
    'Access to BO Registry': 'ACCESS_TO_BO_REGISTRY',

    // Ticket Management
    'Resolve assigned ticket': 'RESOLVE_ASSIGNED_TICKET',
  };

  // Reverse mapping: API Code -> Display Label
  const SUB_MODULE_LABEL_MAP = Object.fromEntries(
    Object.entries(SUB_MODULE_CODE_MAP).map(([label, code]) => [code, label])
  );

  const [selectedFunctionalities, setSelectedFunctionalities] = useState<
    Record<string, string[]>
  >({});

  // Helper function: Convert API format to display format
  const convertApiToDisplay = (apiData: Record<string, string[]>) => {
    // apiData format: { "MY_TASK": ["RE_REGISTRATION", ...], ... }
    // Returns selected sub-module display labels
    const selected: string[] = [];
    Object.entries(apiData).forEach(([moduleCode, subModuleCodes]) => {
      subModuleCodes.forEach((subModuleCode) => {
        const displayLabel = SUB_MODULE_LABEL_MAP[subModuleCode];
        if (displayLabel) {
          selected.push(displayLabel);
        }
      });
    });
    return selected;
  };

  // Helper function: Convert display format to API format
  const convertDisplayToApi = (selectedLabels: string[]) => {
    // selectedLabels: array of sub-module display labels
    // Returns: { "MY_TASK": ["RE_REGISTRATION", ...], ... }
    const result: Record<string, string[]> = {};

    selectedLabels.forEach((label) => {
      const subModuleCode = SUB_MODULE_CODE_MAP[label];
      if (subModuleCode) {
        // Find which module this sub-module belongs to
        // We need to determine the module from the sub-module
        // For now, we'll build this by checking the SelectFunctionalities structure
        // This will be populated when user selects functionalities
      }
    });

    return result;
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showCkycOtpModal, setShowCkycOtpModal] = useState(false);
  const [otpType, setOtpType] = useState<'both' | 'mobile' | 'email'>('both'); // Track which OTP fields to show
  // const [originalEmail, setOriginalEmail] = useState(''); // Store original email in modify mode
  // const [originalMobile, setOriginalMobile] = useState(''); // Store original mobile in modify mode
  const [originalUserData, setOriginalUserData] = useState<any>(null); // Store original fetched user data for comparison
  const [lastValidatedEmail, setLastValidatedEmail] = useState('');
  const [lastValidatedMobile, setLastValidatedMobile] = useState('');
  const [showCkycVerificationModal, setShowCkycVerificationModal] =
    useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isCkycVerified, setIsCkycVerified] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState<string>(''); // Store OTP identifier

  // Suspension data from track-status API
  const [suspensionData, setSuspensionData] = useState<SuspensionData | null>(
    null
  );
  const [suspensionLoading, setSuspensionLoading] = useState(false);

  // Handle error modal close
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  // Reset CKYC verification state when switching to Create mode
  useEffect(() => {
    if (!id) {
      // Switching to Create mode - reset CKYC verification
      setIsCkycVerified(false);
      setIsAllFieldsDisabled(true);

      // Also reset form data to ensure clean state
      setFormData({
        citizenship: 'India',
        ckycNumber: '',
        title: '',
        firstName: '',
        middleName: '',
        lastName: '',
        designation: '',
        email: '',
        gender: '',
        countryCode: '+91',
        mobileNumber: '',
        dateOfBirth: '',
        proofOfIdentity: '',
        proofOfIdentityNumber: '',
        employeeCode: '',
        officeAddress: 'registered',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        addressCountryCode: '+91',
        addressCountryName: 'India',
        state: '',
        district: '',
        city: '',
        pinCode: '',
        otherPinCode: '',
        digipin: '',
        sameAsRegisteredAddress: false,
        role: undefined,
        operationalStatus: undefined,
      });

      setErrors({});

      setSelectedFunctionalities({});

      setIsValidated(false);
      setLastValidatedEmail('');
      setLastValidatedMobile('');

      setUserRole('');
      setSelectedRegion('');
      setSelectedBranch('');

      setSelectedCountry('IN');
      setSelectedState('');
      setSelectedDistrict('');
      setSelectedCity('');
      setPincode('');

      dispatch(fetchCersaiAddress());
    }
  }, [id, dispatch]);

  // Fetch dropdown masters, regions, and user roles on component mount
  useEffect(() => {
    dispatch(fetchDropdownMasters());
    // dispatch(fetchApprovedRegions());
    // dispatch(fetchUserRoles());

    // Fetch CERSAI address on component mount
    dispatch(fetchCersaiAddress());

    // Reset create user state on component mount to clear any stale loading states
    dispatch(resetCreateUserState());
  }, [dispatch]);

  // Prepopulate address fields when CERSAI address is fetched
  useEffect(() => {
    if (cersaiAddress) {
      setFormData((prev) => ({
        ...prev,
        addressLine1: cersaiAddress.line1 || '',
        addressLine2: cersaiAddress.line2 || '',
        addressLine3: cersaiAddress.line3 || '',
        state: cersaiAddress.state || '',
        district: cersaiAddress.district || '',
        city: cersaiAddress.city || '',
        pinCode: cersaiAddress.pincode || '',
        otherPinCode: cersaiAddress.pincodeInCaseOfOthers || '',
        digipin: cersaiAddress.digiPin || '',
      }));

      // Update selected values for dropdowns
      setSelectedState(cersaiAddress.state || '');
      setSelectedDistrict(cersaiAddress.district || '');
      setSelectedCity(cersaiAddress.city || '');
      setPincode(cersaiAddress.pincode || '');
    }
  }, [cersaiAddress]);

  // Fetch user data when ID is present (for View/Modify modes)
  useEffect(() => {
    if (id && id.trim() !== '' && id !== '-') {
      dispatch(
        fetchUsers({
          page: 0,
          size: 1,
          searchQuery: '',
          userId: id, // Filter by userId
        })
      )
        .unwrap()
        .then((response) => {
          if (response.users && response.users.length > 0) {
            const user = response.users[0];
            // Populate form with user data
            setFormData({
              citizenship: user.citizenship || '',
              ckycNumber: user.ckycNumber || '',
              title: user.title || '',
              firstName: user.firstName || '',
              middleName: user.middleName || '',
              lastName: user.lastName || '',
              designation: user.designation || '',
              email: user.emailId || '',
              gender: user.gender || '',
              countryCode: user.countryCode || '',
              mobileNumber: user.mobileNumber || '',
              dateOfBirth: user.dob || '',
              proofOfIdentity: user.proofOfIdentity || '',
              proofOfIdentityNumber: user.proofOfIdentityNumber || '',
              employeeCode: user.employeeCode || '',
              officeAddress: 'registered',
              addressLine1: user.address?.line1 || '',
              addressLine2: user.address?.line2 || '',
              addressLine3: user.address?.line3 || '',
              addressCountryCode: user.address?.countryCode || '',
              addressCountryName: '',
              state: user.address?.state || '',
              district: user.address?.district || '',
              city: user.address?.city || '',
              pinCode: user.address?.pincode || '',
              otherPinCode: '',
              digipin: '',
              sameAsRegisteredAddress: false,
              role: user.role as any,
              operationalStatus: user.operationalStatus as any,
            });

            // Update selected values for cascading dropdowns
            setSelectedCountry(user.address?.countryCode || 'IN');
            setSelectedState(user.address?.state || '');
            setSelectedDistrict(user.address?.district || '');
            setSelectedCity(user.address?.city || '');
            setPincode(user.address?.pincode || '');
            if (
              user.functionalityMapped &&
              typeof user.functionalityMapped === 'object'
            ) {
              setSelectedFunctionalities(user.functionalityMapped);
            }

            // Set CKYC verification status if user is already verified
            if (user.ckycNumber && user.ckycNumber.trim() !== '') {
              setIsCkycVerified(true);
            }

            // Store original email and mobile for change detection in modify mode
            // setOriginalEmail(user.emailId || '');
            // setOriginalMobile(user.mobileNumber || '');
            setLastValidatedEmail(user.emailId || '');
            setLastValidatedMobile(user.mobileNumber || '');
            setIsValidated(true); // Initially validated in modify mode

            // Store complete original user data for comparison in modify payload
            setOriginalUserData(user);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else if (id === '-') {
      // track status - create user acivity detail page
      const user = navigationState?.workflowData;
      // Populate form with user data
      setFormData({
        citizenship: user.citizenship || '',
        ckycNumber: user.ckycNumber || '',
        title: user.title || '',
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        designation: user.designation || '',
        email: user.emailId || '',
        gender: user.gender || '',
        countryCode: user.countryCode || '',
        mobileNumber: user.mobileNumber || '',
        dateOfBirth: user.dob || '',
        proofOfIdentity: user.proofOfIdentity || '',
        proofOfIdentityNumber: user.proofOfIdentityNumber || '',
        employeeCode: user.employeeCode || '',
        officeAddress: 'registered',
        addressLine1: user.address?.line1 || '',
        addressLine2: user.address?.line2 || '',
        addressLine3: user.address?.line3 || '',
        addressCountryCode: user.address?.countryCode || '',
        addressCountryName: '',
        state: user.address?.state || '',
        district: user.address?.district || '',
        city: user.address?.city || '',
        pinCode: user.address?.pincode || '',
        otherPinCode: '',
        digipin: '',
        sameAsRegisteredAddress: false,
        role: user.role as any,
        operationalStatus: user.operationalStatus as any,
      });

      // Update selected values for cascading dropdowns
      setSelectedCountry(user.address?.countryCode || 'IN');
      setSelectedState(user.address?.state || '');
      setSelectedDistrict(user.address?.district || '');
      setSelectedCity(user.address?.city || '');
      setPincode(user.address?.pincode || '');
      // console.log('Setting pincode to:', user.address?.pincode || '');
      // Set selected functionalities from user data
      if (
        user.functionalityMapped &&
        typeof user.functionalityMapped === 'object'
      ) {
        setSelectedFunctionalities(user.functionalityMapped);
      }

      // Set CKYC verification status if user is already verified
      if (user.ckycNumber && user.ckycNumber.trim() !== '') {
        setIsCkycVerified(true);
      }

      // Store original email and mobile for change detection in modify mode
      // setOriginalEmail(user.emailId || '');
      // setOriginalMobile(user.mobileNumber || '');
      setLastValidatedEmail(user.emailId || '');
      setLastValidatedMobile(user.mobileNumber || '');
      setIsValidated(true); // Initially validated in modify mode

      // Store complete original user data for comparison in modify payload
      setOriginalUserData(user);
    }
  }, [id, dispatch]);

  // Handle address data population when API response is received
  // useEffect(() => {
  //   if (addressData) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       addressLine1: addressData.addressLine1 || '',
  //       addressLine2: addressData.addressLine2 || '',
  //       addressLine3: addressData.addressLine3 || '',
  //       city: addressData.city || '',
  //       district: addressData.district || '',
  //       state: addressData.stateCode || '',
  //       pinCode: addressData.pinCode || '',
  //       otherPinCode: addressData.alternatePinCode || '',
  //       digipin: addressData.digiPin || '',
  //     }));
  //   }
  // }, [addressData]);

  // Fetch user data when in modify mode
  // NOTE: Commented out - now using fetchUsers API with userId filter (see lines 439-500)
  // useEffect(() => {
  //   if (isModifyMode && id) {
  //     dispatch(fetchUser({ userId: id }));
  //   }

  //   //   // Cleanup function to clear data when component unmounts or mode changes
  //   return () => {
  //     if (isModifyMode) {
  //       dispatch(clearFetchUserData());
  //       dispatch(clearModifyUserData());
  //     }
  //   };
  // }, [dispatch, isModifyMode, id]);

  // Reset form data when navigating from modify/view to create mode
  useEffect(() => {
    if (!id && !isModifyMode) {
      // Clear all form data
      setFormData({
        citizenship: 'India',
        ckycNumber: '',
        title: '',
        firstName: '',
        middleName: '',
        lastName: '',
        designation: '',
        email: '',
        gender: '',
        countryCode: '+91',
        mobileNumber: '',
        dateOfBirth: '',
        proofOfIdentity: '',
        proofOfIdentityNumber: '',
        employeeCode: '',
        officeAddress: 'registered',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        addressCountryCode: '+91',
        addressCountryName: 'India',
        state: '',
        district: '',
        city: '',
        pinCode: '',
        otherPinCode: '',
        digipin: '',
        sameAsRegisteredAddress: false,
        role: undefined,
        operationalStatus: undefined,
      });

      // Clear approvals
      // setApprovals([]); // OLD CODE - now using selectedFunctionalities
      setSelectedFunctionalities({});

      // Clear errors
      setErrors({});

      // Clear validation state
      setIsValidated(false);
      setLastValidatedEmail('');
      setLastValidatedMobile('');

      // Clear user role and selections
      setUserRole('');
      setSelectedRegion('');
      setSelectedBranch('');

      // Clear geography selections
      setSelectedCountry('IN');
      setSelectedState('');
      setSelectedDistrict('');
      setSelectedCity('');
      setPincode('');

      // Enable all fields (important for SelectFunctionalities)
      setIsAllFieldsDisabled(true);

      // Clear Redux state
      dispatch(clearFetchUserData());
      dispatch(clearModifyUserData());
      dispatch(clearAddressData());
      dispatch(resetCreateUserState()); // Reset create user loading state
    }
  }, [id, isModifyMode, dispatch]);

  // Function to handle address API call
  const handleAddressApiCall = React.useCallback(
    (
      roleKey: string,
      addressType?: string,
      regionName?: string,
      branchName?: string
    ) => {
      // Clear previous address data
      dispatch(clearAddressData());

      // Convert role key to uppercase API format
      const apiUserType = roleKey.replace(/_/g, '_').toUpperCase();

      // Build API parameters with uppercase userType
      const params: UserAddressParams = { userType: apiUserType };

      // Add address type if provided (for Institutional_User)
      if (addressType && roleKey === 'Institutional_User') {
        params.addressType = addressType.toUpperCase() as
          | 'REGISTERED'
          | 'CORRESPONDENCE';
      }

      // Add region/branch parameters - use passed parameters or current state
      if (
        roleKey === 'Institutional_Regional_Admin' ||
        roleKey === 'Institutional_Regional_User'
      ) {
        const region = regionName || selectedRegion;
        if (region) {
          params.regionName = region;
        }
      } else if (roleKey === 'Institutional_Branch_User') {
        const branch = branchName || selectedBranch;
        if (branch) {
          params.branchName = branch;
        }
      }

      // Make API call
      dispatch(fetchUserAddress(params));
    },
    [dispatch, selectedRegion, selectedBranch]
  );

  // derive from fetchedUserData every render
  const isSuspended = fetchedUserData?.operationalStatus === 'SUSPENDED';
  // const canRevokeSuspension = isSuspended; // revoke only when suspended

  const [modalMode, setModalMode] = useState<'suspend' | 'revoke'>('suspend');

  // NOTE: This useEffect is no longer needed because fetchedUserData is always null.
  // User data is now fetched via fetchUsers API (see lines 565-625) and
  // selectedFunctionalities is set in the .then() block (lines 615-621).
  // Keeping this commented out for reference.

  // useEffect(() => {
  //   console.log('hereeeeeeeee', fetchedUserData);
  //   if (fetchedUserData) {
  //     const functionalityData: any = fetchedUserData.functionalityMapped;
  //     console.log('✅ Functionality data from API: ', functionalityData);
  //     console.log('✅ Type of functionalityData:', typeof functionalityData);
  //     console.log('✅ Is object?', functionalityData && typeof functionalityData === 'object');
  //     // If API returns functionality data, convert and set it
  //     if (functionalityData && typeof functionalityData === 'object') {
  //       console.log('✅ Setting selectedFunctionalities to:', functionalityData);
  //       setSelectedFunctionalities(functionalityData);
  //     } else {
  //       console.warn('⚠️ No valid functionality data found');
  //     }

  //     setSelectedState(fetchedUserData.address?.state || '');
  //     setSelectedDistrict(fetchedUserData.address?.district || '');
  //     setSelectedCity(fetchedUserData.address?.city || '');
  //     setPincode(fetchedUserData.address?.pincode || '');

  //     // setSelectedCountry(fetchedUserData.address?.countryCode || '');
  //     setFormData({
  //       citizenship: fetchedUserData.citizenship || '',
  //       ckycNumber: fetchedUserData.ckycNumber || '',
  //       title: fetchedUserData.title || '',
  //       firstName: fetchedUserData.firstName || '',
  //       middleName: fetchedUserData.middleName || '',
  //       lastName: fetchedUserData.lastName || '',
  //       designation: fetchedUserData.designation || '',
  //       email: fetchedUserData.emailId || '',
  //       gender: fetchedUserData.gender || '',
  //       countryCode: fetchedUserData.countryCode || '+91',
  //       mobileNumber: fetchedUserData.mobileNumber || '',
  //       dateOfBirth: fetchedUserData.dob || '',
  //       proofOfIdentity: fetchedUserData.proofOfIdentity || '',
  //       proofOfIdentityNumber: fetchedUserData.proofOfIdentityNumber || '',
  //       employeeCode: fetchedUserData.employeeCode || '',
  //       officeAddress: 'registered',
  //       addressLine1: fetchedUserData.address?.line1 || '',
  //       addressLine2: fetchedUserData.address?.line2 || '',
  //       addressLine3: fetchedUserData.address?.line3 || '',
  //       addressCountryCode: fetchedUserData.address?.countryCode || '+91',
  //       addressCountryName: 'India', // hardcoded unless API provides it
  //       state: fetchedUserData.address?.state || '',
  //       district: fetchedUserData.address?.district || '',
  //       city: fetchedUserData.address?.city || '',
  //       pinCode: fetchedUserData.address?.pincode || '',
  //       otherPinCode: fetchedUserData.address?.otherPinCode || '',
  //       digipin: fetchedUserData.address?.digipin || '',
  //       sameAsRegisteredAddress: false,
  //       role: fetchedUserData.role || '',
  //       operationalStatus: fetchedUserData.operationalStatus || '',
  //     });
  //   }
  //   // eslint-disable-next-line
  // }, [fetchedUserData]);

  // Helper function to normalize dropdown options
  const normalizeOptions = (apiData: unknown[]): DropdownOption[] => {
    return apiData.map((item: unknown) => {
      const obj = item as Record<string, unknown>;
      return {
        value: (obj.value || obj.code || obj.name || item) as string,
        label: (obj.label || obj.name || obj.displayName || item) as string,
      };
    });
  };

  // Prepare dropdown options from API data
  const titleOptions = normalizeOptions(titles);
  const genderOptions = normalizeOptions(genders);
  // For citizenship, use country name as both value and label
  const citizenshipOptions = citizenships.map((item: any) => ({
    value: item.name || item.label || item.displayName,
    label: item.name || item.label || item.displayName,
  }));
  const proofOfIdentityOptions = normalizeOptions(proofOfIdentities);
  const [showConfirmation, setShowConfirmation] = useState(false); // State to track showConfirmation
  const [createUserResponse, setCreateUserResponse] = useState<{
    userId: string;
    workflowId: string;
    workflowStatus: string;
    message: string;
  } | null>(null); // State to store create user response

  // Show loading indicator for dropdowns
  const isDropdownLoading =
    loading &&
    titles.length === 0 &&
    genders.length === 0 &&
    citizenships.length === 0 &&
    proofOfIdentities.length === 0;

  // Load country data - use fallback approach since fetch is failing
  // useEffect(() => {
  //   const loadCountryData = async () => {
  //     try {
  //       setLoadingCountries(true);

  //       // Try fetch first, but use fallback if it fails
  //       try {
  //         const response = await fetch(
  //           `${window.location.origin}/ckyc/data/CountryCodes.json`
  //         );
  //         if (response.ok) {
  //           const data: CountryData[] = await response.json();
  //           console.log('Fetched country data:', data);
  //           if (Array.isArray(data) && data.length > 0) {
  //             setCountries(data);
  //             const india = data.find((country) => country.code === 'IN');
  //             if (india) {
  //               setFormData((prev) => ({
  //                 ...prev,
  //                 countryCode: india.dial_code,
  //               }));
  //             }
  //             return;
  //           }
  //         }
  //       } catch (fetchError) {
  //         console.log('Fetch failed, using fallback data', fetchError);
  //       }
  //     } finally {
  //       setLoadingCountries(false);
  //     }
  //   };

  //   loadCountryData();
  // }, []);

  useEffect(() => {
    const loadCountryData = async () => {
      try {
        setLoadingCountries(true);
        try {
          const response = await fetch(
            `${window.location.origin}/ckyc/data/CountryCodes.json`
          );
          if (response.ok) {
            // JSON is [{ name, dial_code, code }, ...]
            const data: Array<{
              name: string;
              dial_code: string;
              code: string;
            }> = await response.json();

            const mapped: PhoneCountry[] = data.map((c) => ({
              code: c.code,
              name: c.name,
              countryCode: c.dial_code,
            }));

            setPhoneCountries(mapped);

            // default to India if present
            const india = mapped.find((c) => c.code === 'IN');
            if (india) {
              setFormData((prev) => ({
                ...prev,
                countryCode: india.countryCode,
              }));
            }
          }
        } catch (err) {
          console.log('Fetch failed for CountryCodes.json', err);
        }
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountryData();
  }, []);

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'citizenship':
        if (!value) return 'Citizenship is required';
        return null;
      case 'ckycNumber': {
        const v = String(value ?? '');
        const digits = v.replace(/\D/g, '');
        // Required for Indian citizens (adjust if your rule differs)
        if (formData.citizenship === 'Indian') {
          if (!digits) return 'CKYC Number is required for Indian citizens';
          if (!/^\d{14}$/.test(digits))
            return 'CKYC Number must be exactly 14 digits';
        } else {
          // Optional for non-Indian; if provided, must be 14 digits
          if (digits && !/^\d{14}$/.test(digits))
            return 'If provided, enter a 14-digit CKYC Number';
        }
        return null;
      }

      case 'title':
        if (!value) return 'Title is required';
        return null;
      case 'firstName':
        if (!value) return 'First Name is required';
        if (value.length > 33) return 'First Name cannot exceed 33 characters';
        if (!ValidationUtils.isValidFirstName(value))
          return "First Name can contain letters (A–Z, a–z), spaces, a single apostrophe ('), and dots (.) only.";
        return null;
      case 'middleName':
        if (value.length > 33) return 'Middle Name cannot exceed 33 characters';
        if (value && !ValidationUtils.isValidMiddleLastName(value))
          return "Middle Name can contain letters (A–Z, a–z), spaces, and a single apostrophe (') only.";
        return null;
      // case 'lastName':
      //   if (!/^[A-Za-z.']+$/.test(value))
      //     return 'Last Name contains only letters, dot(.)';
      //   return null;
      case 'lastName':
        if (value) {
          if (value.length > 33) return 'Last Name cannot exceed 33 characters';
          if (!ValidationUtils.isValidMiddleLastName(value)) {
            return "Last Name can contain letters (A–Z, a–z), spaces, and a single apostrophe (') only.";
          }
        }
        return null;

      case 'designation':
        if (value.length > 20)
          return 'Designation Name cannot exceed 20 characters';
        if (value && !ValidationUtils.isValidAlphanumeric(value))
          return 'Designation must contain only alphanumeric characters with `~@#$%^&*()_+-=';
        return null;

      case 'employeeCode':
        if (value.length > 26)
          return 'Employee Code cannot exceed 26 characters';
        if (value && !ValidationUtils.isValidAlphaNumWithSpecialChar(value))
          return "EmployeeCode can contain alphanumeric characters and the special character '+'";
        return null;

      case 'email':
        if (!value) return 'Email is required';
        if (value.length > 255) return 'Email cannot exceed 255 characters';
        if (!ValidationUtils.isValidEmail(value))
          return "Email can contain alphanumeric characters and ~@#$%^&*()._+-= are allowed, and at least one '@' is required.";
        return null;
      // case 'mobileNumber':
      //   if (!value) return 'Mobile Number is required';
      //   if (formData.countryCode === '+91' && value.length > 10)
      //     return 'Indian mobile number cannot exceed 10 digits';
      //   if (formData.countryCode !== '+91' && value.length > 15)
      //     return 'Mobile number cannot exceed 15 digits';
      //   return null;
      case 'mobileNumber':
        if (!value) return 'Mobile Number is required';

        // ✅ Allow only digits
        if (!/^\d+$/.test(value))
          return 'Mobile Number must contain only digits';

        // ✅ Length rules
        if (
          formData.countryCode === '+91' &&
          value.length !== 10 &&
          !ValidationUtils.isValidIndiaMobile(value)
        )
          return 'Indian mobile number must be exactly 10 digits and start with 6-9';
        if (
          formData.countryCode !== '+91' &&
          !ValidationUtils.isValidMobileNumber(value, formData.countryCode)
        )
          return 'Mobile number cannot exceed 15 digits';

        return null;
      case 'proofOfIdentityNumber': {
        if (!value) return 'Identity number is required';
        const msg = validateProofNumber(formData.proofOfIdentity, value);
        return msg;
      }

      case 'addressLine1': {
        if (value && !ValidationUtils.isValidAddressLine(value))
          return 'Address Line 1 can contain alphanumeric characters, spaces, and the special characters ~@#$%^&*()_+-= only.';
        return null;
      }

      case 'addressLine2': {
        if (value && !ValidationUtils.isValidAddressLine(value))
          return 'Address Line 2 can contain alphanumeric characters, spaces, and the special characters ~@#$%^&*()_+-= only.';
        return null;
      }

      case 'addressLine3': {
        if (value && !ValidationUtils.isValidAddressLine(value))
          return 'Address Line 3 can contain alphanumeric characters, spaces, and the special characters ~@#$%^&*()_+-= only.';
        return null;
      }
      // case 'digipin': {
      //   if (value && !ValidationUtils.isValidAlphaNumWithSpecialChar(value))
      //     return "Address Line 3 can contain alphanumeric characters and the special characters ~@#$%^&*()_+-= only.";
      //   return null;
      // }
      case 'city': {
        if (value && !ValidationUtils.isValidAlphaNumWithSpecialChar(value))
          return 'City/Down can contain alphanumeric characters and the special characters ~@#$%^&*()_+-= only.';
        return null;
      }
      case 'state': {
        if (value && !ValidationUtils.isValidAlphaNumWithSpecialChar(value))
          return 'State can contain alphanumeric characters and the special characters ~@#$%^&*()_+-= only.';
        return null;
      }
      case 'district': {
        if (value && !ValidationUtils.isValidAlphaNumWithSpecialChar(value))
          return 'District can contain alphanumeric characters and the special characters ~@#$%^&*()_+-= only.';
        return null;
      }
      case 'pinCode': {
        if (value && !ValidationUtils.isValidAlphaNumWithSpecialChar(value))
          return 'Pin Code can contain alphanumeric characters and the special characters ~@#$%^&*()_+-= only.';
        return null;
      }
      case 'digipin': {
        if (value && !ValidationUtils.isValidAlphaNumWithSpecialChar(value))
          return 'digipin can contain alphanumeric characters and the special characters ~@#$%^&*()_+-= only.';
        return null;
      }
      case 'otherPinCode': {
        if (value && !ValidationUtils.isValidPincode(value))
          return 'Pincode must be 6 digits and cannot start with 0.';
        return null;
      }
      case 'dateOfBirth': {
        if (!value) return 'Date of Birth is required';
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          return 'User must be at least 18 years old';
        }
        return null;
      }
      default:
        return null;
    }
  };

  // Normalize POI value coming from API (e.g., "Pan Card" -> "PAN_CARD")
  const normalizePoi = (v: string) =>
    (v || '').toUpperCase().replace(/[\s-]/g, '_');

  // Central validator for Proof of Identity Number
  const validateProofNumber = (poiRaw: string, raw: string): string | null => {
    const poi = normalizePoi(poiRaw);
    const value = String(raw || '')
      .trim()
      .toUpperCase();

    switch (poi) {
      case 'AADHAAR':
      case 'AADHAR': {
        // Aadhaar: 12 digits, starting 2–9
        if (!ValidationUtils.isValidAadhaar(value, 'IN')) {
          return 'Aadhaar must be last 4 digits';
        }
        return null;
      }

      case 'PAN':
      case 'PAN_CARD': {
        // PAN: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
        if (!ValidationUtils.isValidPAN(value, 'IN')) {
          return 'PAN must be in the format ABCDE1234F (5 letters, 4 digits, 1 letter).';
        }
        return null;
      }

      case 'PASSPORT': {
        // Indian Passport: 1 letter (excluding rarely used series) + 7 digits
        // Pragmatic rule: 1 capital letter + 7 digits
        if (!ValidationUtils.isValidPassport(value, 'IN')) {
          return 'Passport must contain 1 letter followed by 7 digits (e.g., A1234567).';
        }
        return null;
      }

      case 'DRIVING_LICENSE':
      case 'DRIVING_LICENCE': {
        // DL: Common format — 2-letter state + 2-digit RTO + 11–13 digits
        // Allow optional space/hyphen between segments.
        if (!ValidationUtils.isValidDrivingLicense(value, 'IN')) {
          return 'Driving License should look like MH12 20110012345 (State + RTO + number)';
        }
        return null;
      }

      case 'VOTER_ID':
      case 'EPIC': {
        // EPIC (Voter ID): Common canonical format — 3 letters + 7 digits
        if (!ValidationUtils.isValidVoterId(value, 'IN')) {
          return 'Voter ID must be 3 letters followed by 7 digits (e.g., ABC1234567).';
        }
        return null;
      }

      default:
        return null; // Unknown type → skip format check
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for mobileNumber - validate on processed value
    if (name === 'mobileNumber') {
      const digits = String(value).replace(/\D/g, '');
      const max = formData.countryCode === '+91' ? 10 : 15;
      const clipped = digits.slice(0, max);

      setFormData((prev) => ({ ...prev, mobileNumber: clipped }));

      // Check if we can revert to validated state
      if (
        clipped === lastValidatedMobile &&
        formData.email === lastValidatedEmail
      ) {
        setIsValidated(true);
      } else {
        setIsValidated(false);
      }

      // live validation to keep UX tight
      const err =
        formData.countryCode === '+91'
          ? clipped.length === 0
            ? 'Mobile number is required'
            : clipped.length !== 10
              ? 'Indian mobile number must be exactly 10 digits'
              : null
          : clipped.length === 0
            ? 'Mobile number is required'
            : clipped.length > 15 // shouldn't happen after slice, but safe
              ? 'Mobile number cannot exceed 15 digits'
              : null;

      setErrors((prev) => {
        const next = { ...prev };
        if (err) next.mobileNumber = err;
        else delete next.mobileNumber;
        return next;
      });

      return; // stop here; we've handled this field
    }

    // Special handling for ckycNumber - validate on processed value
    if (name === 'ckycNumber') {
      const digitsOnly = String(value).replace(/\D/g, '').slice(0, 14);
      setFormData((prev) => ({ ...prev, ckycNumber: digitsOnly }));

      // live-validate
      const err = (() => {
        if (formData.citizenship === 'Indian' && digitsOnly.length === 0) {
          return 'CKYC Number is required for Indian citizens';
        }
        if (digitsOnly.length > 0 && digitsOnly.length !== 14) {
          return 'CKYC Number must be exactly 14 digits';
        }
        return null;
      })();

      setErrors((prev) => {
        const next = { ...prev };
        if (err) next.ckycNumber = err;
        else delete next.ckycNumber;
        return next;
      });
      return;
    }

    // Handle date formatting for dateOfBirth
    let formattedValue = value;
    if (name === 'dateOfBirth' && value) {
      // Ensure date is in YYYY-MM-DD format
      const date = new Date(value as string);
      if (!isNaN(date.getTime())) {
        formattedValue = date.toISOString().split('T')[0];
      }
    }

    // Update form data first
    setFormData((prev) => ({
      ...prev,
      [name as string]: formattedValue,
    }));

    // Then validate the processed value and set/clear errors
    const validationError = validateField(
      name as string,
      formattedValue as string
    );
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (validationError) {
        newErrors[name as string] = validationError;
      } else {
        delete newErrors[name as string];
      }
      return newErrors;
    });

    // Reset validation status only if email changes
    if (name === 'email') {
      if (
        formattedValue === lastValidatedEmail &&
        formData.mobileNumber === lastValidatedMobile
      ) {
        setIsValidated(true);
      } else {
        setIsValidated(false);
      }
    }
  };

  // Handle field blur to show validation errors
  const handleFieldBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newErrors: Record<string, string> = { ...errors };

    // Validate specific field on blur
    // if (name === 'mobileNumber') {
    //   if (!value) {
    //     newErrors.mobileNumber = 'Mobile number is required';
    //   } else if (!/^\d{10}$/.test(value)) {
    //     newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    //   } else {
    //     delete newErrors.mobileNumber;
    //   }
    // }
    if (name === 'ckycNumber') {
      const digits = String(value ?? '').replace(/\D/g, '');
      if (formData.citizenship === 'Indian' && digits.length === 0) {
        newErrors.ckycNumber = 'CKYC Number is required for Indian citizens';
      } else if (digits.length > 0 && digits.length !== 14) {
        newErrors.ckycNumber = 'CKYC Number must be exactly 14 digits';
      } else {
        delete newErrors.ckycNumber;
      }
    }

    if (name === 'email') {
      if (!value) {
        newErrors.email = 'Email is required';
      } else if (!ValidationUtils.isValidEmail(value)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'firstName') {
      if (!value) {
        newErrors.firstName = 'First name is required';
      } else {
        delete newErrors.firstName;
      }
    }

    if (name === 'lastName') {
      // if (value) {
      //   newErrors.lastName = 'Last name is required';
      // } else {
      //   delete newErrors.lastName;
      // }
      delete newErrors.lastName;
    }

    if (name === 'proofOfIdentityNumber') {
      if (!value) {
        newErrors.proofOfIdentityNumber = 'Identity number is required';
      } else {
        const msg = validateProofNumber(formData.proofOfIdentity, value);
        if (msg) newErrors.proofOfIdentityNumber = msg;
        else delete newErrors.proofOfIdentityNumber;
      }
    }

    if (name === 'dateOfBirth') {
      const error = validateField('dateOfBirth', value);
      if (error) {
        newErrors.dateOfBirth = error;
      } else {
        delete newErrors.dateOfBirth;
      }
    }

    setErrors(newErrors);
  };

  const handleSelectChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;

    if (name === 'proofOfIdentity') {
      setFormData((prev) => ({
        ...prev,
        proofOfIdentity: String(value),
        proofOfIdentityNumber: '', // reset number on type change
      }));

      setErrors((prev) => {
        const next = { ...prev };
        delete next.proofOfIdentityNumber; // clear stale error
        return next;
      });
      return; // important: prevent the generic setter below from running again
    }

    // Handle Office Address selection change
    if (name === 'officeAddress' && value && userRole) {
      handleAddressApiCall(userRole, value);
    }

    if (name === 'countryCode') {
      const v = String(value);
      const nextMax = v === '+91' ? 10 : 15;

      setFormData((prev) => ({
        ...prev,
        countryCode: v,
        mobileNumber: String(prev.mobileNumber ?? '')
          .replace(/\D/g, '')
          .slice(0, nextMax),
      }));

      setErrors((prev) => {
        const next = { ...prev };
        delete next.mobileNumber; // rules changed → drop stale error
        return next;
      });
      return;
    }

    // Handle citizenship change - disable all fields if Indian is selected (until CKYC verified)
    // Also auto-update country code based on citizenship
    if (name === 'citizenship') {
      const selectedValue = String(value);
      // const selectedCitizenshipLabel = getCitizenshipLabel(String(value));
      const selectedCitizenshipLabel = getCitizenshipLabel(selectedValue);

      // console.log(`Citizenship changed to: ${selectedCitizenshipLabel}`);

      // Check if Indian citizenship is selected (could be "Indian" or "India")
      if (
        selectedCitizenshipLabel === 'Indian' ||
        selectedCitizenshipLabel === 'India'
      ) {
        // Only disable if CKYC is not yet verified
        if (!isCkycVerified) {
          setIsAllFieldsDisabled(true);
        }
      } else {
        setIsAllFieldsDisabled(false);
      }

      let newDialCode = formData.countryCode;

      if (selectedCitizenshipLabel && phoneCountries.length > 0) {
        let countryNameToSearch = selectedCitizenshipLabel;
        if (countryNameToSearch === 'Indian') {
          countryNameToSearch = 'India';
        }

        const cleanLabelToMatch = countryNameToSearch.trim().toLowerCase();

        const matchingCountry = phoneCountries.find(
          (country) => country.name.trim().toLowerCase() === cleanLabelToMatch
        );

        if (matchingCountry) {
          // If we found a match, update the dial code
          newDialCode = matchingCountry.countryCode;
        }
      }
      // console.log('newDialCode ', newDialCode)
      // Update state once with the new citizenship value and the (potentially new) dial code
      setFormData((prev) => ({
        ...prev,
        citizenship: selectedValue,
        countryCode: newDialCode,
        ckycNumber:
          selectedCitizenshipLabel === 'Indian' ||
          selectedCitizenshipLabel === 'India'
            ? prev.ckycNumber
            : '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user selects something
    if (errors[name as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  };

  // Comprehensive form validation with error messages
  const validateFormWithErrors = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation for required fields
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    // if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.citizenship)
      newErrors.citizenship = 'Citizenship is required';
    if (!formData.proofOfIdentity)
      newErrors.proofOfIdentity = 'Proof of identity is required';
    if (!formData.proofOfIdentityNumber) {
      newErrors.proofOfIdentityNumber = 'Identity number is required';
    } else {
      const msg = validateProofNumber(
        formData.proofOfIdentity,
        formData.proofOfIdentityNumber
      );
      if (msg) newErrors.proofOfIdentityNumber = msg;
    }
    // if (!userRole) newErrors.userRole = 'User role is required';

    // Country code validation
    if (!formData.countryCode) {
      newErrors.countryCode = 'Country code is required';
    }

    // Mobile number validation
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (formData.countryCode === '+91') {
      if (!ValidationUtils.isValidIndiaMobile(formData.mobileNumber)) {
        newErrors.mobileNumber =
          'Indian mobile number must be exactly 10 digits and start with 6-9';
      }
    } else {
      if (
        !ValidationUtils.isValidMobileNumber(
          formData.mobileNumber,
          formData.countryCode
        )
      ) {
        newErrors.mobileNumber = 'Mobile number must be 1–15 digits';
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!ValidationUtils.isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();

      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      } else {
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }
        if (age < 18) {
          newErrors.dateOfBirth = 'User must be at least 18 years old';
        } else if (age > 100) {
          newErrors.dateOfBirth = 'Please enter a valid date of birth';
        }
      }
      // const age = today.getFullYear() - dob.getFullYear();
      // if (dob > today) {
      //   newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      // } else if (age > 100) {
      //   newErrors.dateOfBirth = 'Please enter a valid date of birth';
      // }
    }

    // Identity number validation based on proof type
    if (
      formData.proofOfIdentity === 'Aadhaar' &&
      formData.proofOfIdentityNumber
    ) {
      if (
        !ValidationUtils.isValidAadhaar(formData.proofOfIdentityNumber, 'IN')
      ) {
        newErrors.proofOfIdentityNumber =
          'Aadhaar number must be exactly 12 digits';
      }
    } else if (
      formData.proofOfIdentity === 'PAN' &&
      formData.proofOfIdentityNumber
    ) {
      if (!ValidationUtils.isValidPAN(formData.proofOfIdentityNumber, 'IN')) {
        newErrors.proofOfIdentityNumber = 'PAN must be in format: ABCDE1234F';
      }
    }
    // CKYC Number
    {
      const digits = String(formData.ckycNumber ?? '').replace(/\D/g, '');
      if (formData.citizenship === 'Indian') {
        if (!digits)
          newErrors.ckycNumber = 'CKYC Number is required for Indian citizens';
        else if (digits.length !== 14)
          newErrors.ckycNumber = 'CKYC Number must be exactly 14 digits';
      } else if (digits && digits.length !== 14) {
        newErrors.ckycNumber = 'If provided, enter a 14-digit CKYC Number';
      }
    }

    // Address validation
    if (!formData.addressLine1) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }
    if (!selectedCountry) {
      newErrors.addressCountryCode = 'Country is required';
    }
    if (!formData.state) {
      newErrors.state = 'State/UT is required';
    }
    if (!formData.district) {
      newErrors.district = 'District is required';
    }
    if (!formData.city) {
      newErrors.city = 'City/Town is required';
    }
    if (!formData.pinCode && !selectedPincode) {
      newErrors.pinCode = 'Pin Code is required';
    }
    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }
    if (!formData.employeeCode) {
      newErrors.employeeCode = 'Employee Code is required';
    }

    // User Role validation
    if (!formData.role) {
      newErrors.role = 'User Role is required';
    }

    // Select Functionalities validation
    const hasFunctionalities =
      selectedFunctionalities &&
      Object.keys(selectedFunctionalities).length > 0 &&
      Object.values(selectedFunctionalities).some((arr) => arr.length > 0);

    if (!hasFunctionalities) {
      newErrors.functionalities = 'Please select at least one functionality';
    }

    if (!formData.pinCode && !selectedPincode) {
      newErrors.pinCode = 'Pin Code is required';
    }

    if (formData.pinCode === 'other' && !formData.otherPinCode) {
      newErrors.otherPinCode = 'Pin code is required when "Others" is selected';
    } else if (
      formData.pinCode === 'other' &&
      !/^\d{6}$/.test(formData.otherPinCode)
    ) {
      newErrors.otherPinCode = 'Pin code must be exactly 6 digits';
    }

    // Role-specific validations
    // if (
    //   (userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
    //     userRole === 'INSTITUTIONAL_REGIONAL_USER') &&
    //   !selectedRegion
    // ) {
    //   newErrors.region = 'Region is required for this role';
    // }
    // if (userRole === 'INSTITUTIONAL_BRANCH_USER' && !selectedBranch) {
    //   newErrors.branch = 'Branch is required for Branch User';
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for enabling Validate button (without setting errors)
  const isFormValid = () => {
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      return false;
    }

    // Check if at least one functionality is selected
    const hasFunctionalities =
      selectedFunctionalities &&
      Object.keys(selectedFunctionalities).length > 0 &&
      Object.values(selectedFunctionalities).some((arr) => arr.length > 0);

    // Basic validation for required fields - return false if any required field is empty
    return !!(
      formData.title &&
      formData.firstName &&
      // formData.lastName &&
      formData.dateOfBirth &&
      formData.gender &&
      formData.citizenship &&
      formData.proofOfIdentity &&
      formData.proofOfIdentityNumber &&
      formData.countryCode &&
      formData.mobileNumber &&
      formData.email &&
      formData.designation &&
      formData.employeeCode &&
      formData.addressLine1 &&
      selectedCountry &&
      formData.state &&
      formData.district &&
      formData.city &&
      (formData.pinCode || selectedPincode) &&
      formData.role && // User Role is required
      hasFunctionalities // At least one functionality must be selected
    );
  };

  // Handle validate button click
  const handleValidate = async () => {
    if (validateFormWithErrors()) {
      // Always send both email and mobile in the payload
      // Use empty string for unchanged fields in modify mode
      let otpTypeToShow: 'both' | 'mobile' | 'email' = 'both';
      let emailToSend = formData.email || '';
      let mobileToSend = formData.mobileNumber || '';

      const emailChanged = formData.email !== lastValidatedEmail;
      const mobileChanged = formData.mobileNumber !== lastValidatedMobile;

      if (lastValidatedEmail || lastValidatedMobile) {
        if (emailChanged && mobileChanged) {
          otpTypeToShow = 'both';
        } else if (emailChanged) {
          otpTypeToShow = 'email';
          mobileToSend = '-';
        } else if (mobileChanged) {
          otpTypeToShow = 'mobile';
          emailToSend = '-';
        } else {
          otpTypeToShow = 'both';
        }
      }

      setOtpType(otpTypeToShow);
      const otpRequestData = {
        requestType: 'DIRECT',
        emailId: emailToSend,
        mobileNo: mobileToSend,
        countryCode: formData.countryCode,
      };

      try {
        const result = await dispatch(OTPSend(otpRequestData));

        if (OTPSend.fulfilled.match(result)) {
          const identifier = result?.payload?.data?.otpIdentifier;
          if (identifier) {
            setOtpIdentifier(identifier);
            setShowOtpModal(true);
          }
        } else if (OTPSend.rejected.match(result)) {
          // Handle error
          const errorPayload = result.payload as
            | { message: string; fieldErrors?: Record<string, string> }
            | string
            | undefined;

          let errorMessage = 'Unknown error';
          if (typeof errorPayload === 'object' && errorPayload !== null) {
            errorMessage = errorPayload.message || 'Failed to Create user';
          } else if (typeof errorPayload === 'string') {
            errorMessage = errorPayload;
          }
          setErrorMessage(`${errorMessage}`);
          setShowErrorModal(true);
          console.error(result.payload);
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
      }
    }
  };

  // Handle successful OTP verification
  const handleOtpVerification = async (
    mobileOtp: string,
    emailOtp: string
  ): Promise<boolean> => {
    try {
      setIsValidated(true);
      setLastValidatedEmail(formData.email);
      setLastValidatedMobile(formData.mobileNumber);
      setShowOtpModal(false);

      return true;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  };

  const handleCkycVerificationSuccess = (data?: unknown) => {
    try {
      setIsCkycVerified(true);

      // Extract data from API response
      const ckycData = (data as any)?.data || {};

      if (ckycData && Object.keys(ckycData).length > 0) {
        // Auto-populate form fields with CKYC data
        setFormData((prev) => ({
          ...prev,
          title: ckycData.title || prev.title,
          firstName: ckycData.firstName || prev.firstName,
          middleName: ckycData.middleName || prev.middleName,
          lastName: ckycData.lastName || prev.lastName,
          gender: ckycData.gender || prev.gender,
          dateOfBirth: ckycData.dateOfBirth || ckycData.dob || prev.dateOfBirth,
          addressLine1:
            ckycData.addressLine1 || ckycData.line1 || prev.addressLine1,
          addressLine2:
            ckycData.addressLine2 || ckycData.line2 || prev.addressLine2,
          addressLine3:
            ckycData.addressLine3 || ckycData.line3 || prev.addressLine3,
          state: ckycData.state || prev.state,
          district: ckycData.district || prev.district,
          city: ckycData.city || prev.city,
          pinCode: ckycData.pinCode || ckycData.pincode || prev.pinCode,
          countryCode: ckycData.countryCode || prev.countryCode,
        }));

        // Update geography selections
        if (ckycData.state) setSelectedState(ckycData.state);
        if (ckycData.district) setSelectedDistrict(ckycData.district);
        if (ckycData.city) setSelectedCity(ckycData.city);
        if (ckycData.pinCode || ckycData.pincode) {
          setPincode(ckycData.pinCode || ckycData.pincode);
        }
        if (ckycData.countryCode) setSelectedCountry(ckycData.countryCode);
      }

      // Enable all fields after CKYC verification
      setIsAllFieldsDisabled(false);
    } catch (error) {
      // Error handling for CKYC data processing
    }
  };

  // Legacy function - kept for backward compatibility with old modal
  const handleCkycVerification = () => {
    handleCkycVerificationSuccess();
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    const role = event.target.value as UserRole;
    setUserRole(role);
    // Reset dependent fields when role changes
    if (
      role !== 'INSTITUTIONAL_REGIONAL_ADMIN' &&
      role !== 'INSTITUTIONAL_BRANCH_USER' &&
      role !== 'INSTITUTIONAL_REGIONAL_USER'
    ) {
      setSelectedRegion('');
      setSelectedBranch('');
    }

    // Trigger address API call when role is selected
    if (role === 'INSTITUTIONAL_USER') {
      // Only IU calls API immediately with the default office address (registered)
      handleAddressApiCall(role, formData.officeAddress || 'registered');
    }
    // IRA and IBU will call API only after region/branch selection respectively
  };

  const token: any = useSelector((state: RootState) => state?.auth?.authToken);
  const decoded: any = jwtDecode(token);
  const userType = decoded?.groupMembership[0].replace(/^\//, '');

  // Helper function to build modify payload with only changed fields
  const buildModifyPayload = (currentData: any, originalData: any) => {
    const payload: any = {
      user: {
        userId: id, // Always include userId for modify
      },
      address: {},
    };

    // Helper to get ISO country code
    const getIsoCountryCode = (phoneCode: string): string => {
      const phoneToIso: Record<string, string> = {
        '+91': 'IND',
        '+1': 'USA',
        '+44': 'GBR',
        '+86': 'CHN',
      };
      return phoneToIso[phoneCode] || '';
    };

    // Helper to get citizenship code
    const getCitizenshipCode = (citizenship: string): string => {
      const citizenshipMap: Record<string, string> = {
        Indian: 'IND',
        American: 'USA',
        British: 'GBR',
        Chinese: 'CHN',
      };
      const iso2to3: Record<string, string> = {
        IN: 'IND',
        US: 'USA',
        GB: 'GBR',
        CN: 'CHN',
      };
      if (
        citizenship.length === 3 &&
        citizenship === citizenship.toUpperCase()
      ) {
        return citizenship;
      }
      if (
        citizenship.length === 2 &&
        citizenship === citizenship.toUpperCase()
      ) {
        return iso2to3[citizenship] || citizenship;
      }
      return citizenshipMap[citizenship] || citizenship;
    };

    // Compare user fields
    if (currentData.title !== originalData.title)
      payload.user.title = currentData.title;
    if (currentData.firstName !== originalData.firstName)
      payload.user.firstName = currentData.firstName;
    if ((currentData.middleName || '') !== (originalData.middleName || ''))
      payload.user.middleName = currentData.middleName || '';
    if (currentData.lastName !== originalData.lastName)
      payload.user.lastName = currentData.lastName;
    if (currentData.designation !== originalData.designation)
      payload.user.designation = currentData.designation;
    if (currentData.email !== originalData.emailId)
      payload.user.email = currentData.email;
    if (
      getCitizenshipCode(currentData.citizenship) !== originalData.citizenship
    )
      payload.user.citizenship = getCitizenshipCode(currentData.citizenship);
    if ((currentData.ckycNumber || null) !== (originalData.ckycNumber || null))
      payload.user.ckycNumber = currentData.ckycNumber || null;
    // Compare countryCode - normalize both values to handle null/undefined
    const getIsoCodeFromDialCode = (dialCode: string): string => {
      // Find the country in the phoneCountries state array
      const country = phoneCountries.find((c) => c.countryCode === dialCode);
      // Return the 2-letter code (e.g., "AL" for Albania) or 'IN' as a fallback
      return country ? country.code : '';
    };

    // Derive the correct ISO code from the form's selected country code
    const derivedIsoCode = getIsoCodeFromDialCode(currentData.countryCode);
    // console.log('derivedIsoCode ', derivedIsoCode);
    const currentCountryCode = currentData.countryCode || null;
    const originalCountryCode = originalData.countryCode || null;
    const normalizedOriginalCode =
      originalCountryCode === 'IND'
        ? originalCountryCode.slice(0, 2)
        : originalCountryCode;
    // console.log('currentCountryCode ', currentCountryCode);
    // console.log('originalCountryCode ', originalCountryCode);
    // console.log('normalizedOriginalCode ', normalizedOriginalCode);
    if (originalCountryCode === 'IND')
      if (derivedIsoCode !== normalizedOriginalCode)
        payload.user.countryCode = derivedIsoCode;
    if (currentData.mobileNumber !== originalData.mobileNumber)
      payload.user.mobile = currentData.mobileNumber;
    if (currentData.proofOfIdentity !== originalData.proofOfIdentity)
      payload.user.proofOfIdentity = currentData.proofOfIdentity;
    if (
      currentData.proofOfIdentityNumber !== originalData.proofOfIdentityNumber
    )
      payload.user.proofOfIdentityNumber = currentData.proofOfIdentityNumber;
    if (currentData.dateOfBirth !== originalData.dob)
      payload.user.dateOfBirth = currentData.dateOfBirth;
    if (currentData.gender !== originalData.gender)
      payload.user.gender = currentData.gender;
    if (currentData.employeeCode !== originalData.employeeCode)
      payload.user.employeeCode = currentData.employeeCode;
    if (currentData.role !== originalData.role)
      payload.user.role = currentData.role;

    // Compare functionalityMapped
    if (
      JSON.stringify(selectedFunctionalities) !==
      JSON.stringify(originalData.functionalityMapped)
    ) {
      payload.user.functionalityMapped = selectedFunctionalities;
    }

    // Compare address fields
    if (currentData.addressLine1 !== originalData.address?.line1)
      payload.address.line1 = currentData.addressLine1;
    if (
      (currentData.addressLine2 || '') !== (originalData.address?.line2 || '')
    )
      payload.address.line2 = currentData.addressLine2 || '';
    if (
      (currentData.addressLine3 || '') !== (originalData.address?.line3 || '')
    )
      payload.address.line3 = currentData.addressLine3 || '';
    // if ((selectedCountry || '') !== (originalData.address?.countryCode || ''))
    // console.log('originalData.address?.countryCode ', originalData.address?.countryCode);
    // console.log('currentData.addressCountryCode ', currentData.addressCountryCode);
    if (
      (currentData.addressCountryCode || '') !==
      (originalData.address?.countryCode || '')
    )
      payload.address.country = originalData.address?.countryCode || '';
    if (currentData.state !== originalData.address?.state)
      payload.address.state = currentData.state;
    if (currentData.district !== originalData.address?.district)
      payload.address.district = currentData.district;
    if (currentData.city !== originalData.address?.city)
      payload.address.city = currentData.city;
    if (currentData.pinCode !== originalData.address?.pincode)
      payload.address.pincode = currentData.pinCode;
    if ((currentData.digipin || '') !== (originalData.address?.digipin || ''))
      payload.address.digipin = currentData.digipin || '';

    // Compare sameAsRegisteredAddress - only send if changed
    const currentSameAsRegistered =
      currentData.sameAsRegisteredAddress || false;
    const originalSameAsRegistered =
      originalData.sameAsRegisteredAddress || false;
    if (currentSameAsRegistered !== originalSameAsRegistered) {
      payload.user.sameAsRegisteredAddress = currentSameAsRegistered;
    }

    // Remove empty address object if no address fields changed
    if (Object.keys(payload.address).length === 0) {
      delete payload.address;
    }

    return payload;
  };

  const formDataChanged = (): boolean => {
    if (!originalUserData) return false; // Not in modify mode

    // Compare all user fields
    if (formData.title !== originalUserData.title) return true;
    if (formData.firstName !== originalUserData.firstName) return true;
    if (formData.lastName !== originalUserData.lastName) return true;
    if ((formData.middleName || '') !== (originalUserData.middleName || ''))
      return true;
    if (formData.designation !== originalUserData.designation) return true;
    if (formData.email !== originalUserData.emailId) return true;
    if (formData.gender !== originalUserData.gender) return true;
    if (formData.mobileNumber !== originalUserData.mobileNumber) return true;
    if (formData.dateOfBirth !== originalUserData.dob) return true;
    if (formData.proofOfIdentity !== originalUserData.proofOfIdentity)
      return true;
    if (
      formData.proofOfIdentityNumber !== originalUserData.proofOfIdentityNumber
    )
      return true;
    if (formData.employeeCode !== originalUserData.employeeCode) return true;
    if (formData.role !== originalUserData.role) return true;

    // Compare functionalities
    if (
      JSON.stringify(selectedFunctionalities) !==
      JSON.stringify(originalUserData.functionalityMapped)
    )
      return true;

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // console.log('handleSubmit called', formData);
    // if (isModifyMode) {
    //   setIsModifyMode(false);
    //   return;
    // }

    // console.log('(id && !hasFormChanged()) ', formDataChanged());
    e.preventDefault();
    if (isValidated) {
      try {
        // Helper function to get the 2-letter ISO code from the selected dial code
        const getIsoCodeFromDialCode = (dialCode: string): string => {
          // Find the country in the phoneCountries state array
          const country = phoneCountries.find(
            (c) => c.countryCode === dialCode
          );
          // Return the 2-letter code (e.g., "AL" for Albania) or 'IN' as a fallback
          return country ? country.code : '';
        };

        // Derive the correct ISO code from the form's selected country code
        const derivedIsoCode = getIsoCodeFromDialCode(formData.countryCode);

        const addressPayload: any = {
          line1: formData.addressLine1,
          line2: formData.addressLine2 || '',
          line3: formData.addressLine3 || '',
          country: formData.addressCountryCode || '',
          state: formData.state,
          district: formData.district,
          city: formData.city,
          pincode: formData.pinCode,
          digipin: formData.digipin || '',
        };

        if (formData.pinCode === 'other') {
          addressPayload.pincodeInCaseOfOthers = formData.otherPinCode;
        }

        // Build user request data with the correctly derived ISO code
        const userRequestData = {
          user: {
            title: formData.title,
            firstName: formData.firstName,
            middleName: formData.middleName || '',
            lastName: formData.lastName,
            designation: formData.designation,
            email: formData.email,
            citizenship: formData.citizenship,
            countryCode: derivedIsoCode,
            ckycNumber: formData.ckycNumber || null,
            mobile: formData.mobileNumber,
            proofOfIdentity: formData.proofOfIdentity,
            proofOfIdentityNumber: formData.proofOfIdentityNumber,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            employeeCode: formData.employeeCode,
            role: formData.role || 'CU',
            functionalityMapped: selectedFunctionalities,
          },
          address: addressPayload,
        };

        // Validate required fields before submission
        if (!userRequestData.user.email || !userRequestData.user.mobile) {
          alert('Email and Mobile are required fields');
          return;
        }

        if (
          !userRequestData.user.functionalityMapped ||
          Object.keys(userRequestData.user.functionalityMapped).length === 0
        ) {
          alert('Please select at least one functionality');
          return;
        }

        if (id) {
          // Modify user mode
          if (!originalUserData) {
            alert('Original user data not loaded. Please try again.');
            return;
          }
          console.log('originalUserData ', originalUserData);
          console.log('formData ', formData);
          const modifyPayload = buildModifyPayload(formData, originalUserData);

          const result = await dispatch(
            modifyUserThunk(modifyPayload as CreateUserRequest)
          );

          if (modifyUserThunk.fulfilled.match(result)) {
            // Success - show success message and redirect
            // console.log('User modified successfully:', result.payload);
            // console.log('Response details:', {
            //   userId: result.payload.userId,
            //   workflowId: result.payload.workflowId,
            //   workflowStatus: result.payload.workflowStatus,
            //   operationalStatus: result.payload.operationalStatus,
            //   actionType: result.payload.actionType,
            //   message: result.payload.message,
            // });

            // Navigate to user list
            setShowConfirmation(true);
            // navigate('/ckycrr-admin/sub-users/certify-modify?action=TrackStatus');
          } else if (modifyUserThunk.rejected.match(result)) {
            // const errorMessage =
            //   typeof result.payload === 'string'
            //     ? result.payload
            //     : JSON.stringify(result.payload, null, 2);
            // alert(`Failed to modify user:\n${errorMessage}`);
            // Extract error message and field errors
            const errorPayload = result.payload as
              | { message: string; fieldErrors?: Record<string, string> }
              | string
              | undefined;

            let errorMessage = 'Unknown error';

            if (typeof errorPayload === 'object' && errorPayload !== null) {
              errorMessage = errorPayload.message || 'Failed to modify user';
            } else if (typeof errorPayload === 'string') {
              errorMessage = errorPayload;
            }

            setErrorMessage(`${errorMessage}`);
            setShowErrorModal(true);
          }
        } else {
          const result = await dispatch(
            createUser(userRequestData as CreateUserRequest)
          );

          if (createUser.fulfilled.match(result)) {
            setCreateUserResponse({
              userId: result.payload.userId,
              workflowId: result.payload.workflowId,
              workflowStatus: result.payload.workflowStatus,
              message: result.payload.message,
            });
            setShowConfirmation(true);
            // navigate('/ckycrr-admin/sub-users/certify-modify?action=TrackStatus');
          } else if (createUser.rejected.match(result)) {
            // alert(
            //   `Failed to create user: ${result.payload || 'Unknown error'}`
            // );
            const errorPayload = result.payload as
              | { message: string; fieldErrors?: Record<string, string> }
              | string
              | undefined;

            let errorMessage = 'Unknown error';

            if (typeof errorPayload === 'object' && errorPayload !== null) {
              errorMessage = errorPayload.message || 'Failed to modify user';
            } else if (typeof errorPayload === 'string') {
              errorMessage = errorPayload;
            }

            setErrorMessage(`${errorMessage}`);
            setShowErrorModal(true);
          }
        }
      } catch (error) {
        console.error('Error in form submission:', error);
        alert(
          `An unexpected error occurred: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  };
  const handleRegionChange = (event: SelectChangeEvent) => {
    const regionName = event.target.value;
    setSelectedRegion(regionName);
    setSelectedBranch(''); // Reset branch when region changes

    if (userRole === 'INSTITUTIONAL_BRANCH_USER' && regionName) {
      // Fetch branches for the selected region
      // dispatch(fetchApprovedBranches(regionName));
    }

    // Trigger address API call when region is selected for Regional Admin and Regional User
    if (
      (userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
        userRole === 'INSTITUTIONAL_REGIONAL_USER') &&
      regionName
    ) {
      handleAddressApiCall(userRole, undefined, regionName);
    }
  };

  const handleBranchChange = (event: SelectChangeEvent) => {
    const branchName = event.target.value;
    setSelectedBranch(branchName);

    // Trigger address API call when branch is selected for Branch User
    if (userRole === 'INSTITUTIONAL_BRANCH_USER' && branchName) {
      handleAddressApiCall(userRole, undefined, undefined, branchName);
    }
  };

  // Function to handle address API call
  // const handleAddressApiCall = useCallback(
  //   (
  //     roleKey: string,
  //     addressType?: string,
  //     regionName?: string,
  //     branchName?: string
  //   ) => {
  //     console.log(
  //       'handleAddressApiCall called with role:',
  //       roleKey,
  //       'addressType:',
  //       addressType,
  //       'regionName:',
  //       regionName,
  //       'branchName:',
  //       branchName
  //     );

  //     // Clear previous address data
  //     dispatch(clearAddressData());

  //     // Convert role key to uppercase API format
  //     const apiUserType = roleKey.replace(/_/g, '_').toUpperCase();

  //     // Build API parameters with uppercase userType
  //     const params: UserAddressParams = { userType: apiUserType };

  //     // Add address type if provided (for Institutional_User)
  //     if (addressType && roleKey === 'INSTITUTIONAL_USER') {
  //       params.addressType = addressType.toUpperCase() as
  //         | 'REGISTERED'
  //         | 'CORRESPONDENCE';
  //     }

  //     // Add region/branch parameters - use passed parameters or current state
  //     if (
  //       roleKey === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
  //       roleKey === 'INSTITUTIONAL_REGIONAL_USER'
  //     ) {
  //       const region = regionName || selectedRegion;
  //       if (region) {
  //         params.regionName = region;
  //       }
  //     } else if (roleKey === 'INSTITUTIONAL_BRANCH_USER') {
  //       const branch = branchName || selectedBranch;
  //       if (branch) {
  //         params.branchName = branch;
  //       }
  //     }

  //     console.log('API params:', params);

  //     // Make API call
  //     dispatch(fetchUserAddress(params));
  //   },
  //   [dispatch, selectedRegion, selectedBranch]
  // );

  const handleSuspendClick = () => {
    const nextMode = isSuspended ? 'revoke' : 'suspend';
    setModalMode(nextMode);
    setShowSuspendModal(true);
  };

  const handleDeactivateClick = () => {
    setShowDeactivateModal(true);
  };

  // Add these state variables to your existing useState declarations
  const [selectedCountry, setSelectedCountry] = useState('IN'); // Default to India
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPincode, setPincode] = useState('');

  // Fetch approved regions and geography hierarchy on component mount
  useEffect(() => {
    // dispatch(fetchApprovedRegions());
    dispatch(fetchGeographyHierarchy());
  }, [dispatch]);

  // Fetch suspension data from track-status API when in revoke suspension mode
  useEffect(() => {
    const fetchSuspensionData = async () => {
      if (menuAction === 'Revoke Suspension' && id) {
        try {
          setSuspensionLoading(true);
          const userId = id;

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
  }, [menuAction, id]);

  // Get geography hierarchy from Redux store
  const { geographyHierarchy } = useSelector(
    (state: RootState) => state.masters
  );
  // console.log('geographyHierarchy :', geographyHierarchy);

  // console.log('FormData : ', formData);

  // Get countries, states, and districts from geography hierarchy
  const allCountries = geographyHierarchy || [];
  // console.log('countries fetched geographyHierarchy: ', allCountries);
  useEffect(() => {
    setGeoCountries(allCountries as Country[]);
    // eslint-disable-next-line
  }, [allCountries]);
  // console.log('countries fetched : ', countries);

  // console.log('geographyHierarchy :', geographyHierarchy);

  // Get states based on selected country
  // Update your existing geography helper functions
  const getStatesForCountry = (countryCode: string): State[] => {
    const country = allCountries.find((c: Country) => c.code === countryCode);
    // console.log('country code in getStatesForCountry', countryCode);
    // console.log('country in getStatesForCountry', country);
    // console.log('States in getStatesForCountry  : ', country?.states);
    return country?.states || [];
  };

  const getDistrictsForState = (
    countryCode: string,
    stateName: string
  ): District[] => {
    // console.log('stateName in getDistrictsForState : ', stateName);
    // console.log('countryCode in getDistrictsForState  : ', countryCode);
    const country = allCountries.find((c: Country) => c.code === countryCode);
    // console.log('country in getDistrictsForState  : ', country);
    const state = country?.states?.find((s: State) => s.name === stateName);
    // console.log('state in getDistrictsForState  : ', state);
    // console.log('Districts in getDistrictsForState  : ', state?.districts);
    return state?.districts || [];
  };

  const getCitiesForDistrict = (
    countryCode: string,
    stateName: string,
    districtName: string
  ): Pincode[] => {
    // console.log('countryCode in getCitiesForDistrict  : ', countryCode);
    // console.log('stateName in getCitiesForDistrict  : ', stateName);
    // console.log('districtName in getCitiesForDistrict  : ', districtName);
    const country = allCountries.find((c: Country) => c.code === countryCode);
    // console.log('country in getCitiesForDistrict  : ', country);
    const state = country?.states?.find((s: State) => s.name === stateName);
    // console.log('state in getCitiesForDistrict  : ', state);
    const district = state?.districts?.find(
      (d: District) => d.name === districtName
    );
    // console.log('district in getCitiesForDistrict  : ', district);
    // console.log('Pincodes in getCitiesForDistrict  : ', district?.pincodes);
    return district?.pincodes || [];
  };

  // Add these handler functions
  const handleCountryChange = (event: SelectChangeEvent) => {
    const countryCode = event.target.value;
    setSelectedCountry(countryCode);
    // Reset dependent fields
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCity('');
    setPincode('');
    setAvailablePincodes([]);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      addressCountryCode: countryCode,
      addressCountryName:
        allCountries.find((c) => c.code === countryCode)?.name || '',
      state: '',
      district: '',
      city: '',
      pinCode: '',
    }));
  };

  const handleStateChange = (event: SelectChangeEvent) => {
    const stateName = event.target.value;

    setSelectedState(stateName);
    // Reset dependent fields
    setSelectedDistrict('');
    setSelectedCity('');
    setPincode('');
    setAvailablePincodes([]);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      state: stateName,
      district: '',
      city: '',
      pinCode: '',
    }));
  };

  const handleDistrictChange = (event: SelectChangeEvent) => {
    const districtName = event.target.value;
    setSelectedDistrict(districtName);
    // Reset dependent fields
    setSelectedCity('');
    setPincode('');

    // Get pincodes from the selected district
    const districts = getDistrictsForState(selectedCountry, selectedState);
    const selectedDistrictObj = districts.find(
      (d: District) => d.name === districtName
    );
    setAvailablePincodes(selectedDistrictObj?.pincodes || []);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      district: districtName,
      city: '',
      pinCode: '',
    }));
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cityName = event.target.value;

    // Validate immediately
    const validationError = validateField('city', cityName);
    if (validationError) {
      setErrors((prev) => ({ ...prev, city: validationError }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.city;
        return next;
      });
    }

    // const selectedPincodeObj = getCitiesForDistrict(
    //   selectedCountry,
    //   selectedState,
    //   selectedDistrict
    // ).find((p) => p.city === cityName);

    setSelectedCity(cityName);
    // setPincode(selectedPincodeObj?.pincode || '');

    // Update form data
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      // pinCode: selectedPincodeObj?.pincode || '',
    }));
  };

  const handlePincodeChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      pinCode: value,
      otherPinCode: value !== 'other' ? '' : prev.otherPinCode,
    }));

    if (value !== 'other') {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.otherPinCode;
        return newErrors;
      });
    }
  };
  // console.log('formData', formData);

  // Citizenship code to label mapping
  const citizenshipCodeMap: Record<string, string> = {
    IND: 'Indian',
    // 'USA': 'American',
    // 'GBR': 'British',
    // 'CAN': 'Canadian',
    // 'AUS': 'Australian',
    // Add more mappings as needed
  };

  // helper (put above the component or memoize inside it)
  const getCitizenshipLabel = (code?: string) => {
    if (!code) return '';
    // console.log('citizenshipOptions ', citizenshipOptions)
    // First try to find in dropdown options
    const option = citizenshipOptions.find((o) => o.value === code);
    if (option) return option.label;

    // If not found, try the code mapping
    if (citizenshipCodeMap[code]) return citizenshipCodeMap[code];

    // If still not found, return the code itself
    return code;
  };

  // Effect to ensure country code is updated when phoneCountries are loaded
  // This handles the race condition where citizenship is selected before phoneCountries are fetched
  useEffect(() => {
    if (formData.citizenship && phoneCountries.length > 0) {
      const label = getCitizenshipLabel(formData.citizenship);
      if (label) {
        let countryNameToSearch = label;
        if (countryNameToSearch === 'Indian') {
          countryNameToSearch = 'India';
        }
        const normalize = (str: string) =>
          str.trim().toLowerCase().replace(/\s+/g, '');
        // const cleanLabel = countryNameToSearch.trim().toLowerCase();
        const cleanLabel = normalize(countryNameToSearch);
        const matchingCountry = phoneCountries.find(
          (c) => normalize(c.name) === cleanLabel
        );
        if (
          matchingCountry &&
          formData.countryCode !== matchingCountry.countryCode
        ) {
          setFormData((prev) => ({
            ...prev,
            countryCode: matchingCountry.countryCode,
          }));
        }
      }
    }
  }, [
    formData.citizenship,
    phoneCountries,
    getCitizenshipLabel,
    formData.countryCode,
  ]);

  // console.log('Countries in component : ', countries);

  const ActionButtons = () => {
    // Only hide buttons for View User Details action when there are role restrictions
    if (id && menuAction === 'View User Details') {
      if (userType === 'Super_Admin_User' && formData.role === 'RA') {
        return null;
      }
      if (userType === 'Admin_User' && formData.role === 'SA') {
        return null;
      }
    }
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          mt: 2,
          mb: 4,
          p: 2,
        }}
      >
        {['View User Details', 'Track Status'].includes(
          menuAction
        ) ? null : isModifyMode &&
          ['Suspend', 'Revoke Suspension', 'De-activate'].includes(
            menuAction
          ) ? (
          <>
            {/* Show Suspend/Revoke button when menuAction is Suspend or Revoke Suspension */}
            {menuAction === 'Suspend' && (
              <Button
                variant="contained"
                size="large"
                onClick={handleSuspendClick}
                sx={{
                  backgroundColor: '#002CBA',
                  color: '#FFFFFF',
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#001F8B',
                  },
                }}
              >
                Suspend
              </Button>
            )}

            {menuAction === 'Revoke Suspension' && (
              <Button
                variant="contained"
                size="large"
                onClick={() => setShowRevokeModal(true)}
                sx={{
                  backgroundColor: '#002CBA',
                  color: '#FFFFFF',
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#001F8B',
                  },
                }}
              >
                Revoke Suspension
              </Button>
            )}

            {/* Show De-activate button only when menuAction is De-activate */}
            {menuAction === 'De-activate' &&
              formData.operationalStatus !== 'DEACTIVATED' && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleDeactivateClick}
                  sx={{
                    backgroundColor: '#002CBA',
                    color: '#FFFFFF',
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#001F8B',
                    },
                  }}
                >
                  De-activate
                </Button>
              )}
          </>
        ) : (
          <>
            {!isValidated && (
              <Button
                variant="outlined"
                size="large"
                onClick={handleValidate}
                disabled={!isFormValid() || sendOtpLoading}
                sx={{
                  borderColor: isFormValid() ? '#002CBA' : '#E0E0E0',
                  color: isFormValid() ? '#002CBA' : '#757575',
                  fontFamily: 'Gilroy, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: isFormValid() ? '#001F8B' : '#BDBDBD',
                    backgroundColor: isFormValid()
                      ? 'rgba(0, 44, 186, 0.04)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                  '&:disabled': {
                    borderColor: '#E0E0E0',
                    color: '#757575',
                  },
                }}
              >
                {sendOtpLoading ? 'Sending OTP...' : 'Validate'}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={
                !isValidated ||
                createUserLoading ||
                modifyUserLoading ||
                !isFormValid() ||
                (Boolean(id) && !formDataChanged())
              }
              sx={{
                backgroundColor: isValidated
                  ? '#002CBA'
                  : 'rgba(0, 0, 0, 0.12)',
                color: isValidated ? '#FFFFFF' : 'rgba(0, 0, 0, 0.26)',
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                textTransform: 'none',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: isValidated
                    ? '#001F8B'
                    : 'rgba(0, 0, 0, 0.12)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                },
              }}
            >
              {createUserLoading
                ? 'Creating User...'
                : modifyUserLoading
                  ? 'Modifying User...'
                  : 'Submit'}
            </Button>
          </>
        )}
      </Box>
    );
  };
  return (
    <MainContainer maxWidth={false}>
      {/* Back Button - Top Right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: 2 }}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: '#000000' }} />}
          onClick={() => navigate(-1)}
          sx={{
            color: '#000000',
            fontFamily: 'Gilroy, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            textTransform: 'none',
            // '&:hover': {
            //   backgroundColor: 'rgba(0, 0, 0, 0.04)',
            // },
          }}
        >
          Back
        </Button>
      </Box>

      {/* Breadcrumb */}
      <Box sx={{ mb: 3, ml: '8px' }}>
        <NavigationBreadCrumb
          crumbsData={breadcrumbs.map((label) => ({ label }))}
        />
      </Box>

      {/* Status Banner - Only show for Track Status action */}
      {menuAction === 'Track Status' &&
        (navigationState?.workflowData || originalUserData) &&
        (() => {
          // console.log('🎯 Track Status - Navigation State:', navigationState);
          // console.log(
          //   '🎯 Track Status - Workflow Data:',
          //   navigationState?.workflowData
          // );
          // console.log(
          //   '🎯 Track Status - Original User Data:',
          //   originalUserData
          // );
          return (
            <Box sx={{ mx: '8px', mb: 2 }}>
              <StatusScreen
                status={
                  (navigationState?.workflowData?.operationalStatus ||
                    originalUserData?.operationalStatus) === 'PENDING' ||
                  (navigationState?.workflowData?.operationalStatus ||
                    originalUserData?.operationalStatus) === 'INACTIVE'
                    ? 'Approval Pending'
                    : (navigationState?.workflowData?.operationalStatus ||
                          originalUserData?.operationalStatus) === 'APPROVED' ||
                        (navigationState?.workflowData?.operationalStatus ||
                          originalUserData?.operationalStatus) === 'ACTIVE'
                      ? 'Approved'
                      : (navigationState?.workflowData?.operationalStatus ||
                            originalUserData?.operationalStatus) === 'REJECTED'
                        ? 'Rejected'
                        : 'Approval Pending'
                }
                rejectedBy={
                  navigationState?.workflowData?.rejectedBy ||
                  originalUserData?.rejectedBy
                }
                rejectedOn={
                  navigationState?.workflowData?.rejectedOn ||
                  originalUserData?.rejectedOn
                }
                remark={
                  navigationState?.workflowData?.remark ||
                  originalUserData?.remark
                }
                approvedBy={
                  navigationState?.workflowData?.approvedBy ||
                  originalUserData?.approvedBy
                }
                approvedOn={
                  navigationState?.workflowData?.approvedOn ||
                  originalUserData?.approvedOn
                }
              />
            </Box>
          );
        })()}

      {/* Page Title */}
      <Typography
        variant="h5"
        sx={{
          fontFamily: 'Gilroy, sans-serif',
          fontWeight: 600,
          fontSize: '24px',
          color: '#000000',
          mb: 3,
          ml: '8px',
        }}
      >
        {isModifyMode ? 'User Details' : 'Create User'}
      </Typography>

      <ContentWrapper>
        {/* <PageTitle variant="h6" gutterBottom>
          {isModifyMode ? 'Modify User' : 'Create New User'}
        </PageTitle> */}

        {/* Error display for fetch user in modify mode */}
        {isModifyMode && fetchUserError && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: '#ffebee',
              borderRadius: 1,
              border: '1px solid #f44336',
            }}
          >
            <Typography color="error" variant="body2">
              Error loading user data: {fetchUserError}
            </Typography>
          </Box>
        )}

        {/* Loading indicator for fetch user in modify mode */}
        {isModifyMode && fetchUserLoading && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CircularProgress size={20} />
            <Typography variant="body2">Loading user data...</Typography>
          </Box>
        )}

        {/* Suspension Details Card - Using track-status API - Only shown for Revoke Suspension mode */}
        {menuAction === 'Revoke Suspension' && (
          <>
            {suspensionLoading ? (
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
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    mx: -1,
                    my: -1,
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      width: { xs: '100%', sm: '33.333%' },
                    }}
                  >
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

                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      width: { xs: '100%', sm: '33.333%' },
                    }}
                  >
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

                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      width: { xs: '100%', sm: '33.333%' },
                    }}
                  >
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
            ) : null}
          </>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            width: '100%',
          }}
        >
          {/* User Role Field */}
          {/* <div>
            <StyledFormControl fullWidth required>
              <FieldLabel>User Role</FieldLabel>
              <Select
                name="userRole"
                value={userRole}
                displayEmpty
                disabled={userRolesLoading}
                IconComponent={CustomArrowIcon}
                sx={{
                  height: '45px',
                  backgroundColor: '#fff',
                  '& .MuiSelect-select': {
                    py: 0,
                    minHeight: 'auto',
                    height: '45px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    backgroundColor: '#fff',
                    '&:focus': {
                      backgroundColor: '#fff',
                    },
                  },
                  '& .MuiOutlinedInput-root': {
                    height: '45px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E0E0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#BDBDBD',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                }}
                renderValue={(selected) => {
                  if (userRolesLoading) return 'Loading user roles...';
                  if (!selected) return 'Select User Role';

                  return selected;
                }}
                onChange={handleRoleChange}
              >
                {userRolesLoading ? (
                  <StyledMenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading user roles...
                  </StyledMenuItem>
                ) : userRolesError ? (
                  <StyledMenuItem disabled>
                    Error loading user roles
                  </StyledMenuItem>
                ) : (
                  userRolesData.map((role) => (
                    <StyledMenuItem key={role} value={role}>
                      {role}
                    </StyledMenuItem>
                  ))
                )}
              </Select>
            </StyledFormControl>
          </div> */}

          {/* Region Field - Conditionally Rendered */}
          {(userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
            userRole === 'INSTITUTIONAL_BRANCH_USER' ||
            userRole === 'INSTITUTIONAL_REGIONAL_USER') && (
            <div>
              <StyledFormControl fullWidth required>
                <FieldLabel>Region</FieldLabel>
                <Select
                  id="region"
                  value={selectedRegion}
                  displayEmpty
                  IconComponent={CustomArrowIcon}
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1,
                      minHeight: 'auto',
                      height: '45px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      backgroundColor: '#fff',
                      '&:focus': {
                        backgroundColor: '#fff',
                      },
                    },
                  }}
                  renderValue={(selected) =>
                    selected ? (
                      regions.find((r) => r.regionName === selected)?.regionName
                    ) : (
                      <Typography
                        style={{
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        {regionsLoading
                          ? 'Loading regions...'
                          : 'Select Region'}
                      </Typography>
                    )
                  }
                  onChange={handleRegionChange}
                >
                  {regionsLoading ? (
                    <StyledMenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading regions...
                    </StyledMenuItem>
                  ) : regionsError ? (
                    <StyledMenuItem disabled>
                      Error loading regions
                    </StyledMenuItem>
                  ) : (
                    regions.map((region) => (
                      <StyledMenuItem
                        key={region.regionCode}
                        value={region.regionName}
                      >
                        {region.regionName}
                      </StyledMenuItem>
                    ))
                  )}
                </Select>
              </StyledFormControl>
            </div>
          )}

          {/* Branch Field - Conditionally Rendered for Institutional Branch User */}
          {userRole === 'INSTITUTIONAL_BRANCH_USER' && (
            <div>
              <StyledFormControl
                fullWidth
                sx={{ width: '100%' }}
                required
                disabled={!selectedRegion}
              >
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#000',
                    display: 'block',
                    mb: 1,
                    '&.Mui-focused': {
                      color: 'inherit',
                    },
                    '&:after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  Branch Name
                </Typography>
                <Select
                  id="branch"
                  value={selectedBranch}
                  displayEmpty
                  IconComponent={CustomArrowIcon}
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1,
                      minHeight: 'auto',
                      height: '45px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      backgroundColor: '#fff',
                      '&:focus': {
                        backgroundColor: '#fff',
                      },
                    },
                  }}
                  renderValue={(selected) =>
                    selected ? (
                      branches.find((b) => b.branchCode === selected)
                        ?.branchName
                    ) : (
                      <Typography
                        style={{
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        {branchesLoading
                          ? 'Loading branches...'
                          : 'Select Branch'}
                      </Typography>
                    )
                  }
                  onChange={handleBranchChange}
                >
                  {branchesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading branches...
                    </MenuItem>
                  ) : branchesError ? (
                    <MenuItem disabled>Error loading branches</MenuItem>
                  ) : branches.length === 0 && selectedRegion ? (
                    <MenuItem disabled>
                      No branches available for selected region
                    </MenuItem>
                  ) : (
                    branches.map((branch) => (
                      <MenuItem
                        sx={{
                          fontFamily: 'Gilroy, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#000',
                        }}
                        key={branch.branchCode}
                        value={branch.branchCode}
                      >
                        {branch.branchName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </StyledFormControl>
            </div>
          )}
        </div>

        <CollapsibleSection
          title="User Details"
          defaultExpanded={true}
          sx={{ mt: 1, border: '2px solid #E0E5EE', borderRadius: '8px' }}
        >
          <form onSubmit={handleSubmit}>
            <FormRow>
              {/* Row 1: Citizenship | CKYC Number | Title */}
              <div>
                {/* <StyledFormControl
                  fullWidth
                  sx={{ width: '100%' }}
                  required
                  error={!!errors.citizenship}
                >
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      mb: 1,
                      color: errors.citizenship ? 'error.main' : '#000',
                      display: 'block',
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Citizenship
                  </Typography>
                  <Select
                    name="citizenship"
                    value={formData.citizenship}
                    onChange={handleSelectChange}
                    IconComponent={CustomArrowIcon}
                    displayEmpty
                    disabled={isDropdownLoading || isModifyMode}
                    renderValue={(selected) => {
                      if (isDropdownLoading) return 'Loading...';
                      return selected || 'Select Citizenship';
                    }}
                    sx={{
                      '& .MuiSelect-select': {
                        py: 1,
                        minHeight: 'auto',
                        height: '45px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        backgroundColor: '#fff',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>
                        {isDropdownLoading
                          ? 'Loading...'
                          : 'Select Citizenship'}
                      </em>
                    </MenuItem>
                    {isDropdownLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading options...
                      </MenuItem>
                    ) : (
                      citizenshipOptions.map((citizenship: DropdownOption) => (
                        <MenuItem
                          key={citizenship.value}
                          value={citizenship.value}
                        >
                          {citizenship.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>{errors.citizenship}</FormHelperText>
                </StyledFormControl> */}

                {/* <StyledFormControl
                  fullWidth
                  sx={{ width: '100%', height: '45px', mb: 2 }}
                  required
                  error={!!errors.citizenship}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      mb: { xs: 2, md: 1, lg: 1 },
                      color: errors.title ? 'error.main' : '#000',
                      display: 'block',
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Citizenship
                  </Typography>

                  <Select
                    name="citizenship"
                    value={formData.citizenship} // <-- stores the CODE (e.g., "IN")
                    onChange={handleSelectChange} // event.target.value === code
                    IconComponent={CustomArrowIcon}
                    displayEmpty
                    disabled={
                      isDropdownLoading || isModifyMode || isCkycVerified
                    }
                    renderValue={(selected) => {
                      if (!selected) return 'Select Citizenship'; // placeholder when empty
                      if (isDropdownLoading) return 'Loading...';
                      return (
                        getCitizenshipLabel(String(selected)) ||
                        'Select Citizenship'
                      );
                    }}
                    sx={{
                      '& .MuiSelect-select': {
                        py: 1,
                        minHeight: 'auto',
                        height: { xs: '45px', md: '46px' },
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        // backgroundColor: '#fff',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>
                        {isDropdownLoading
                          ? 'Loading...'
                          : 'Select Citizenship'}
                      </em>
                    </MenuItem>

                    {isDropdownLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading options...
                      </MenuItem>
                    ) : (
                      citizenshipOptions.map((opt: DropdownOption) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>

                  <FormHelperText>{errors.citizenship}</FormHelperText>
                </StyledFormControl> */}

                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.citizenship ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Citizenship
                  </Typography>
                  <FormControl
                    fullWidth
                    error={!!errors.citizenship}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        borderRadius: '4px',
                        backgroundColor: !formData.citizenship
                          ? '#FFFFFF' // no value selected
                          : '#F6F6F6', // value selected
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },

                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          backgroundColor: '#FFFFFF',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  >
                    <Select
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleSelectChange}
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      disabled={
                        isDropdownLoading || isModifyMode || isCkycVerified
                      }
                      renderValue={(selected) => {
                        if (isDropdownLoading) return 'Loading...';
                        if (!selected) {
                          return (
                            <Typography
                              style={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontFamily: 'Gilroy, sans-serif',
                                fontSize: '14px',
                              }}
                            >
                              Select Citizenship
                            </Typography>
                          );
                        }
                        return getCitizenshipLabel(String(selected));
                      }}
                    >
                      {isDropdownLoading ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading options...
                        </MenuItem>
                      ) : (
                        citizenshipOptions.map((opt: DropdownOption) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            <Typography
                              fontFamily="Gilroy, sans-serif"
                              fontWeight={600}
                              fontSize="14px"
                              color="#000"
                            >
                              {opt.label}
                            </Typography>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <FormHelperText>{errors.citizenship}</FormHelperText>
                  </FormControl>
                </Box>
              </div>

              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      mb: { xs: 2, md: 1, lg: 1 },
                      fontSize: '14px',
                      color: errors.ckycNumber ? 'error.main' : '#000',
                      display: 'block',
                      mt: { xs: 2, md: 0, lg: 0 },
                      '&:after': {
                        content:
                          formData.citizenship &&
                          (getCitizenshipLabel(formData.citizenship) ===
                            'Indian' ||
                            getCitizenshipLabel(formData.citizenship) ===
                              'India')
                            ? '" *"'
                            : '""', // show * only for Indian citizenship
                        color: 'error.main',
                      },
                    }}
                  >
                    CKYC Number
                  </Typography>
                  <CkycNumberField
                    name="ckycNumber"
                    value={formData.ckycNumber}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Reset verification status when CKYC number changes
                      if (isCkycVerified) {
                        setIsCkycVerified(false);
                        setIsAllFieldsDisabled(true); // Disable fields again
                      }
                    }}
                    isVerified={isCkycVerified}
                    showVerifyAction={Boolean(
                      formData.citizenship &&
                        (getCitizenshipLabel(formData.citizenship) ===
                          'Indian' ||
                          getCitizenshipLabel(formData.citizenship) ===
                            'India') &&
                        !isModifyMode
                    )}
                    onVerificationSuccess={handleCkycVerificationSuccess}
                    verifyDisabled={formData.ckycNumber.length !== 14}
                    disabled={
                      isModifyMode ||
                      isCkycVerified ||
                      !formData.citizenship ||
                      (getCitizenshipLabel(formData.citizenship) !== 'Indian' &&
                        getCitizenshipLabel(formData.citizenship) !== 'India')
                    }
                    error={!!errors.ckycNumber}
                    helperText={errors.ckycNumber}
                    placeholder="Enter CKYC number"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        borderRadius: '4px',
                        backgroundColor:
                          (isModifyMode || isCkycVerified) &&
                          formData.ckycNumber
                            ? '#F6F6F6' // has value
                            : '#FFFFFF', // no value
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': { borderColor: '#002CBA' },
                      },
                    }}
                  />
                </Box>
              </div>

              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.title ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Title
                  </Typography>
                  <FormControl
                    fullWidth
                    error={!!errors.title}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  >
                    <Select
                      name="title"
                      value={formData.title}
                      onChange={handleSelectChange}
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      disabled={
                        isDropdownLoading ||
                        isModifyMode ||
                        (!isModifyMode && !id && isCkycVerified) ||
                        isAllFieldsDisabled
                      }
                      renderValue={(selected) => {
                        if (isDropdownLoading) return 'Loading...';
                        return selected ? (
                          selected
                        ) : (
                          <Typography
                            style={{
                              color: 'rgba(0, 0, 0, 0.6)',
                              fontFamily: 'Gilroy, sans-serif',
                              fontSize: '14px',
                            }}
                          >
                            Select Title
                          </Typography>
                        );
                      }}
                    >
                      {isDropdownLoading ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading options...
                        </MenuItem>
                      ) : (
                        titleOptions.map((title: DropdownOption) => (
                          <MenuItem key={title.value} value={title.value}>
                            <Typography
                              fontFamily="Gilroy, sans-serif"
                              fontWeight={600}
                              fontSize="14px"
                              color="#000"
                            >
                              {title.label}
                            </Typography>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <FormHelperText>{errors.title}</FormHelperText>
                  </FormControl>
                </Box>
              </div>

              {/* Row 2: First Name | Middle Name | Last Name */}
              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.firstName ? 'error.main' : '#000',
                      display: 'block',
                      mb: { xs: 2, md: 1, lg: 1 },
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    First Name
                  </Typography>
                  <TextField
                    fullWidth
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) => {
                      const next = e.target.value.replace(/[^A-Za-z.' -]/g, '');
                      handleInputChange(e);
                    }}
                    onBlur={handleFieldBlur}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    inputProps={{ maxLength: 33 }}
                    placeholder="Enter first name"
                    disabled={
                      isModifyMode ||
                      (!isModifyMode && !id && isCkycVerified) ||
                      isAllFieldsDisabled
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>

              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.middleName ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Middle Name
                  </Typography>
                  <TextField
                    fullWidth
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 33 }}
                    error={!!errors.middleName}
                    helperText={errors.middleName}
                    placeholder="Enter middle name"
                    disabled={
                      isModifyMode ||
                      (!isModifyMode && !id && isCkycVerified) ||
                      isAllFieldsDisabled
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>

              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.lastName ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      // '&:after': {
                      //   content: '" *"',
                      //   color: 'error.main',
                      // },
                    }}
                  >
                    Last Name
                  </Typography>
                  <TextField
                    fullWidth
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 33 }}
                    onBlur={handleFieldBlur}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    disabled={
                      isModifyMode ||
                      (!isModifyMode && !id && isCkycVerified) ||
                      isAllFieldsDisabled
                    }
                    placeholder="Enter last name"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>

              {/* Row 3: Gender | DOB | Designation */}
              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.gender ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Gender
                  </Typography>
                  <FormControl
                    fullWidth
                    error={!!errors.gender}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  >
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      disabled={
                        isDropdownLoading ||
                        isModifyMode ||
                        (!isModifyMode && !id && isCkycVerified) ||
                        isAllFieldsDisabled
                      }
                      renderValue={(selected) => {
                        // console.log('selected', selected);
                        if (isDropdownLoading) return 'Loading...';
                        return selected ? (
                          selected
                        ) : (
                          <Typography
                            style={{
                              color: 'rgba(0, 0, 0, 0.6)',
                              fontFamily: 'Gilroy, sans-serif',
                              fontSize: '14px',
                            }}
                          >
                            Select Gender
                          </Typography>
                        );
                      }}
                    >
                      {genderOptions.map((gender: DropdownOption) => (
                        // console.log('gender', gender),
                        <MenuItem key={gender.value} value={gender.value}>
                          <Typography
                            fontFamily="Gilroy, sans-serif"
                            fontWeight={600}
                            fontSize="14px"
                            color="#000"
                          >
                            {gender.label}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.gender}</FormHelperText>
                  </FormControl>
                </Box>
              </div>

              <div>
                <Box sx={{ width: '100%' }}>
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.dateOfBirth ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Date of Birth
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={
                      !id
                        ? isAllFieldsDisabled
                        : menuAction !== 'Modify' || isAllFieldsDisabled
                    }
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0],
                      style: {
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>

              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.designation ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Designation
                  </Typography>
                  <TextField
                    fullWidth
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 100 }}
                    error={!!errors.designation}
                    helperText={errors.designation}
                    disabled={
                      !id
                        ? isAllFieldsDisabled
                        : menuAction !== 'Modify' || isAllFieldsDisabled
                    }
                    placeholder="Enter designation"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>

              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.employeeCode ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Employee Code
                  </Typography>
                  <TextField
                    fullWidth
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleInputChange}
                    error={!!errors.employeeCode}
                    helperText={errors.employeeCode}
                    placeholder="Enter employee code"
                    slotProps={{ htmlInput: { maxLength: 26 } }}
                    disabled={
                      !id
                        ? isAllFieldsDisabled
                        : menuAction !== 'Modify' || isAllFieldsDisabled
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>

              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.email ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    name="email"
                    value={formData.email}
                    inputProps={{ maxLength: 255 }}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={
                      !id
                        ? isAllFieldsDisabled
                        : menuAction !== 'Modify' || isAllFieldsDisabled
                    }
                    placeholder="Enter email address"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>
              <div>
                <Box sx={{ width: '100%' }}>
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.countryCode ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': { content: '" *"', color: 'error.main' },
                    }}
                  >
                    Country Code
                  </Typography>
                  <FormControl
                    fullWidth
                    error={!!errors.countryCode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  >
                    <Select
                      name="countryCode"
                      disabled={
                        isModifyMode ||
                        (!isModifyMode && !id && isCkycVerified) ||
                        isAllFieldsDisabled
                      }
                      inputProps={{ name: 'countryCode' }}
                      value={formData.countryCode ?? ''}
                      onChange={handleSelectChange}
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      renderValue={(value) => {
                        const v = String(value ?? '').trim();
                        if (!v) {
                          return (
                            <Typography
                              style={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontFamily: 'Gilroy, sans-serif',
                                fontSize: '14px',
                              }}
                            >
                              +00 | Select country
                            </Typography>
                          );
                        }
                        const selected = phoneCountries.find(
                          (c) => c.countryCode === v
                        );
                        return selected
                          ? `${selected.countryCode} | ${selected.name}`
                          : v;
                      }}
                      MenuProps={{
                        PaperProps: { style: { maxHeight: 320 } },
                        disableScrollLock: true, // avoids layout shift issues
                      }}
                    >
                      {loadingCountries ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} />
                        </MenuItem>
                      ) : phoneCountries.length === 0 ? (
                        <MenuItem disabled>
                          <Typography
                            fontFamily="Gilroy, sans-serif"
                            fontSize="14px"
                            color="text.secondary"
                          >
                            No countries available
                          </Typography>
                        </MenuItem>
                      ) : (
                        phoneCountries.map((c) => (
                          <MenuItem key={c.code} value={c.countryCode}>
                            <Typography
                              fontFamily="Gilroy, sans-serif"
                              fontSize="14px"
                              fontWeight={600}
                              color="#000"
                            >
                              {c.countryCode} | {c.name}
                            </Typography>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </div>
              <div>
                <Box sx={{ width: '100%' }}>
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.mobileNumber ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Mobile Number
                  </Typography>
                  <TextField
                    fullWidth
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    disabled={
                      !id
                        ? isAllFieldsDisabled
                        : menuAction !== 'Modify' || isAllFieldsDisabled
                    }
                    error={!!errors.mobileNumber}
                    helperText={
                      errors.mobileNumber
                      // ||
                      // (formData.countryCode === '+91'
                      //   ? 'Enter 10 digits'
                      //   : 'Enter up to 15 digits')
                    }
                    inputProps={{
                      inputMode: 'numeric', // mobile number keypad
                      pattern: '[0-9]*', // hint numeric keypad on iOS
                      maxLength: formData.countryCode === '+91' ? 10 : 15, // dynamic cap
                    }}
                    placeholder="Enter mobile number"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>
              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.proofOfIdentity ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Proof of Identity
                  </Typography>
                  <FormControl
                    fullWidth
                    error={!!errors.proofOfIdentity}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  >
                    <Select
                      name="proofOfIdentity"
                      value={formData.proofOfIdentity}
                      onChange={handleSelectChange}
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      disabled={
                        isDropdownLoading ||
                        (!id
                          ? isAllFieldsDisabled
                          : menuAction !== 'Modify' || isAllFieldsDisabled)
                      }
                      renderValue={(selected) => {
                        if (isDropdownLoading) return 'Loading...';
                        if (!selected) {
                          return (
                            <Typography
                              style={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontFamily: 'Gilroy, sans-serif',
                                fontSize: '14px',
                              }}
                            >
                              Select Proof Type
                            </Typography>
                          );
                        }
                        const selectedOption = proofOfIdentityOptions.find(
                          (opt) => opt.value === selected
                        );
                        return selectedOption ? selectedOption.label : selected;
                      }}
                    >
                      {isDropdownLoading ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading options...
                        </MenuItem>
                      ) : (
                        proofOfIdentityOptions.map((type: DropdownOption) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Typography
                              fontFamily="Gilroy, sans-serif"
                              fontSize="14px"
                            >
                              {type.label}
                            </Typography>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <FormHelperText>{errors.proofOfIdentity}</FormHelperText>
                  </FormControl>
                </Box>
              </div>
              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.proofOfIdentityNumber
                        ? 'error.main'
                        : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Proof of Identity Number
                  </Typography>
                  <TextField
                    fullWidth
                    name="proofOfIdentityNumber"
                    value={formData.proofOfIdentityNumber}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={!!errors.proofOfIdentityNumber}
                    inputProps={{
                      maxLength: maxLengthByIdType[formData.proofOfIdentity],
                    }}
                    helperText={errors.proofOfIdentityNumber}
                    placeholder="Enter proof of identity number"
                    disabled={
                      !id
                        ? isAllFieldsDisabled
                        : menuAction !== 'Modify' || isAllFieldsDisabled
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </Box>
              </div>
            </FormRow>
          </form>
        </CollapsibleSection>

        {/* User Address Details Section */}
        <CollapsibleSection
          title="User Address Details"
          defaultExpanded={!isModifyMode}
          sx={{ mt: 1, border: '2px solid #E0E5EE', borderRadius: '8px' }}
        >
          <form>
            {/* Office Address - Only show for Institutional User */}
            {userRole === 'INSTITUTIONAL_USER' && (
              <FormRow>
                <div>
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.officeAddress ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Office Address
                  </Typography>
                  <Select
                    fullWidth
                    name="officeAddress"
                    value={formData.officeAddress}
                    onChange={(e) => {
                      // console.log(
                      //   'Office Address Select onChange triggered:',
                      //   e.target.value
                      // );
                      handleSelectChange(e);
                    }}
                    displayEmpty
                    disabled={addressLoading}
                    IconComponent={CustomArrowIcon}
                    sx={{
                      height: '45px',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                      },
                    }}
                  >
                    {addressLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading address data...
                      </MenuItem>
                    ) : (
                      [
                        <MenuItem key="registered" value="registered">
                          <Typography
                            sx={{
                              fontFamily: 'Gilroy, sans-serif',
                              fontSize: '14px',
                              fontWeight: 400,
                            }}
                          >
                            Registered Address
                          </Typography>
                        </MenuItem>,
                        <MenuItem key="correspondence" value="correspondence">
                          <Typography
                            sx={{
                              fontFamily: 'Gilroy, sans-serif',
                              fontSize: '14px',
                              fontWeight: 400,
                            }}
                          >
                            Correspondence Address
                          </Typography>
                        </MenuItem>,
                      ]
                    )}
                  </Select>
                  {errors.officeAddress && (
                    <FormHelperText error>
                      {errors.officeAddress}
                    </FormHelperText>
                  )}
                </div>
                <div></div>
                <div></div>
              </FormRow>
            )}

            {/* Address Lines */}
            <FormRow>
              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: errors.addressLine1 ? 'error.main' : '#000',
                    display: 'block',
                    mb: 1,
                    '&:after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  Address Line 1
                </Typography>
                <TextField
                  fullWidth
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  // disabled
                  error={!!errors.addressLine1}
                  helperText={errors.addressLine1}
                  placeholder="Enter address line 1"
                  disabled={!!cersaiAddress || Boolean(id)}
                  InputProps={{
                    sx: {
                      height: '45px',
                      // backgroundColor: '#F6F6F6',
                      borderRadius: '4px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      // backgroundColor: '#f5f5f5',
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        color: '#000000',
                      },
                    },
                  }}
                />
              </div>
              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#000',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Address Line 2
                </Typography>
                <TextField
                  fullWidth
                  name="addressLine2"
                  value={formData.addressLine2}
                  error={!!errors.addressLine2}
                  helperText={errors.addressLine2}
                  disabled={!!cersaiAddress || Boolean(id)}
                  onChange={handleInputChange}
                  placeholder="Enter address line 2"
                  InputProps={{
                    sx: {
                      height: '45px',
                      // backgroundColor: '#F6F6F6',
                      borderRadius: '4px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      // backgroundColor: '#f5f5f5',
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        color: '#000000',
                      },
                    },
                  }}
                />
              </div>
              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#000',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Address Line 3
                </Typography>
                <TextField
                  fullWidth
                  name="addressLine3"
                  value={formData.addressLine3}
                  error={!!errors.addressLine3}
                  helperText={errors.addressLine3}
                  onChange={handleInputChange}
                  disabled={!!cersaiAddress || Boolean(id)}
                  // disabled
                  placeholder="Enter address line 3"
                  InputProps={{
                    sx: {
                      height: '45px',
                      // backgroundColor: '#F6F6F6',
                      borderRadius: '4px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      // backgroundColor: '#f5f5f5',
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        color: '#000000',
                      },
                    },
                  }}
                />
              </div>
            </FormRow>

            {/* Location Fields */}
            <FormRow>
              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: errors.addressCountryCode ? 'error.main' : '#000',
                    display: 'block',
                    mb: 1,
                    '&:after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  Country
                </Typography>
                <FormControl
                  fullWidth
                  error={!!errors.addressCountryCode}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '45px',
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6 !important',
                      },
                      '& .MuiSelect-select.Mui-disabled': {
                        backgroundColor: '#F6F6F6 !important',
                      },
                      '& .MuiSelect-select': {
                        py: '12px',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#002CBA',
                      },
                    },
                  }}
                >
                  <Select
                    name="addressCountryCode"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    disabled={!!cersaiAddress || addressLoading || Boolean(id)}
                    IconComponent={CustomArrowIcon}
                    displayEmpty
                    renderValue={(value) => {
                      if (!value) {
                        return (
                          <Typography
                            style={{
                              color: 'rgba(0, 0, 0, 0.6)',
                              fontFamily: 'Gilroy, sans-serif',
                              fontSize: '14px',
                            }}
                          >
                            Select Country
                          </Typography>
                        );
                      }
                      const country = allCountries.find(
                        (c: Country) => c.code === value
                      );
                      return country?.name || value;
                    }}
                  >
                    {allCountries.map((country: Country) => (
                      <MenuItem key={country.code} value={country.code}>
                        <Typography
                          fontFamily="Gilroy, sans-serif"
                          fontSize="14px"
                          fontWeight={600}
                          color="#000"
                        >
                          {country.name}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.addressCountryCode && (
                    <FormHelperText>{errors.addressCountryCode}</FormHelperText>
                  )}
                </FormControl>
              </div>

              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: errors.state ? 'error.main' : '#000',
                    display: 'block',
                    mb: 1,
                    '&:after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  State / UT
                </Typography>
                {selectedCountry === 'IN' ? (
                  <FormControl
                    fullWidth
                    error={!!errors.state}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  >
                    <Select
                      name="state"
                      value={selectedState}
                      onChange={handleStateChange}
                      disabled={
                        !!cersaiAddress ||
                        addressLoading ||
                        !selectedCountry ||
                        Boolean(id)
                      }
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      renderValue={(value) => {
                        if (!value) {
                          return (
                            <Typography
                              style={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontFamily: 'Gilroy, sans-serif',
                                fontSize: '14px',
                              }}
                            >
                              {!selectedCountry
                                ? 'Select Country first'
                                : 'Select State/UT'}
                            </Typography>
                          );
                        }
                        return value;
                      }}
                    >
                      {getStatesForCountry(selectedCountry).map(
                        (state: State) => (
                          <MenuItem key={state.id} value={state.name}>
                            <Typography
                              fontFamily="Gilroy, sans-serif"
                              fontSize="14px"
                              fontWeight={600}
                              color="#000"
                            >
                              {state.name}
                            </Typography>
                          </MenuItem>
                        )
                      )}
                    </Select>
                    {errors.state && (
                      <FormHelperText>{errors.state}</FormHelperText>
                    )}
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!!cersaiAddress || addressLoading || Boolean(id)}
                    placeholder="Enter State / UT"
                    error={!!errors.state}
                    helperText={errors.state}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        backgroundColor: '#F6F6F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                )}
              </div>

              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: errors.district ? 'error.main' : '#000',
                    display: 'block',
                    mb: 1,
                    '&:after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  District
                </Typography>
                {selectedCountry === 'IN' ? (
                  <FormControl
                    fullWidth
                    error={!!errors.district}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  >
                    <Select
                      name="district"
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      disabled={
                        !!cersaiAddress ||
                        addressLoading ||
                        !selectedState ||
                        Boolean(id)
                      }
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      renderValue={(value) => {
                        if (!value) {
                          return (
                            <Typography
                              style={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontFamily: 'Gilroy, sans-serif',
                                fontSize: '14px',
                              }}
                            >
                              {!selectedState
                                ? 'Select State first'
                                : 'Select District'}
                            </Typography>
                          );
                        }
                        return value;
                      }}
                    >
                      {getDistrictsForState(selectedCountry, selectedState).map(
                        (district: District) => (
                          <MenuItem key={district.id} value={district.name}>
                            <Typography
                              fontFamily="Gilroy, sans-serif"
                              fontSize="14px"
                              fontWeight={600}
                              color="#000"
                            >
                              {district.name}
                            </Typography>
                          </MenuItem>
                        )
                      )}
                    </Select>
                    {errors.district && (
                      <FormHelperText>{errors.district}</FormHelperText>
                    )}
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    disabled={
                      !!cersaiAddress ||
                      addressLoading ||
                      !formData.state ||
                      Boolean(id)
                    }
                    placeholder="Enter District"
                    error={!!errors.district}
                    helperText={errors.district}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        backgroundColor: '#F6F6F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                )}
              </div>
            </FormRow>

            {/* City & Pin Fields */}
            <FormRow>
              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#000',
                    display: 'block',
                    mb: 1,
                    '&:after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  City/Town
                </Typography>
                {/* <Select
                  fullWidth
                  name="city"
                  value={selectedCity}
                  onChange={handleCityChange}
                  disabled={addressLoading || !selectedDistrict || Boolean(id)}
                  IconComponent={CustomArrowIcon}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '45px',
                      backgroundColor: '#F6F6F6',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '& input': {
                        py: '12px',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                      '&.Mui-focused fieldset': { borderColor: '#002CBA' },
                    },
                  }}
                  renderValue={(value) => {
                    if (!value) {
                      return (
                        <Typography
                          style={{
                            color: 'rgba(0, 0, 0, 0.6)',
                            fontFamily: 'Gilroy, sans-serif',
                            fontSize: '14px',
                          }}
                        >
                          {!selectedDistrict
                            ? 'Select District first'
                            : 'Select City/Town'}
                        </Typography>
                      );
                    }
                    return value;
                  }}
                >
                  {getCitiesForDistrict(
                    selectedCountry,
                    selectedState,
                    selectedDistrict
                  ).map((pincode: Pincode) => (
                    <MenuItem key={pincode.id} value={pincode.city}>
                      <Typography
                        fontFamily="Gilroy, sans-serif"
                        fontSize="14px"
                      >
                        {pincode.city}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select> */}
                <TextField
                  fullWidth
                  variant="outlined"
                  name="city"
                  value={formData.city}
                  inputProps={{ maxLength: 60 }}
                  error={!!errors.city}
                  helperText={errors.city}
                  onChange={handleCityChange}
                  onBlur={handleFieldBlur}
                  placeholder="Enter city/town"
                  required
                  size="small"
                  disabled={
                    !!cersaiAddress ||
                    addressLoading ||
                    !formData.district ||
                    Boolean(id)
                  }
                  InputProps={{
                    sx: {
                      height: '45px',
                      // backgroundColor: '#F6F6F6',
                      borderRadius: '4px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      // backgroundColor: '#f5f5f5',
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6 !important',
                      },
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        color: '#000000',
                      },
                    },
                  }}
                />
              </div>

              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: errors.pinCode ? 'error.main' : '#000',
                    display: 'block',
                    mb: 1,
                    '&:after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  }}
                >
                  Pin Code
                </Typography>
                {selectedCountry === 'IN' ? (
                  <FormControl
                    fullWidth
                    error={!!errors.pinCode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  >
                    <Select
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handlePincodeChange}
                      disabled={
                        !!cersaiAddress ||
                        addressLoading ||
                        !selectedDistrict ||
                        Boolean(id)
                      }
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      renderValue={(value) => {
                        if (!value) {
                          return (
                            <Typography
                              style={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                fontFamily: 'Gilroy, sans-serif',
                                fontSize: '14px',
                              }}
                            >
                              {!selectedDistrict
                                ? 'Select District first'
                                : 'Select Pin Code'}
                            </Typography>
                          );
                        }
                        return value === 'other' ? 'Others' : value;
                      }}
                    >
                      <MenuItem value="">
                        <Typography
                          fontFamily="Gilroy, sans-serif"
                          fontSize="14px"
                          fontWeight={500}
                        >
                          Select Pin Code
                        </Typography>
                      </MenuItem>
                      {availablePincodes.map((pincode) => (
                        <MenuItem key={pincode.id} value={pincode.pincode}>
                          {pincode.pincode}
                        </MenuItem>
                      ))}
                      <MenuItem value="other">Others</MenuItem>
                    </Select>
                    {errors.pinCode && (
                      <FormHelperText>{errors.pinCode}</FormHelperText>
                    )}
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    disabled={
                      !!cersaiAddress ||
                      addressLoading ||
                      Boolean(id) ||
                      !formData.district
                    }
                    placeholder="Enter Pin Code"
                    error={!!errors.pinCode}
                    helperText={errors.pinCode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                )}
              </div>
              {formData.pinCode === 'other' && !id && (
                <div>
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.otherPinCode ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': {
                        content: '" *"',
                        color: 'error.main',
                      },
                    }}
                  >
                    Pin Code (in case of others)
                  </Typography>
                  <TextField
                    fullWidth
                    name="otherPinCode"
                    value={formData.otherPinCode}
                    onChange={handleInputChange}
                    disabled={!!cersaiAddress || Boolean(id)}
                    placeholder="Enter 6-digit pin code"
                    error={!!errors.otherPinCode}
                    helperText={errors.otherPinCode}
                    type="number"
                    inputProps={{
                      maxLength: 6,
                    }}
                    InputProps={{
                      sx: {
                        height: '45px',
                        // backgroundColor: '#F6F6F6',
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D1D1D1',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6 !important',
                        },
                        '& input': {
                          py: '12px',
                          height: '100%',
                          boxSizing: 'border-box',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                          '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button':
                            {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                          '&[type=number]': {
                            MozAppearance: 'textfield',
                          },
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                      },
                    }}
                  />
                </div>
              )}
              <div>
                <Typography
                  component="label"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: errors.digipin ? 'error.main' : '#000',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Digipin
                </Typography>
                <TextField
                  fullWidth
                  name="digipin"
                  value={formData.digipin}
                  inputProps={{ maxLength: 10 }}
                  onChange={handleInputChange}
                  placeholder="Enter digipin"
                  error={!!errors.digipin}
                  helperText={errors.digipin}
                  type="text"
                  disabled={!!cersaiAddress || Boolean(id)}
                  InputProps={{
                    sx: {
                      height: '45px',
                      // backgroundColor: '#F6F6F6',
                      borderRadius: '4px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6 !important',
                      },
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        color: '#000000',
                        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button':
                          {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                        '&[type=number]': {
                          MozAppearance: 'textfield',
                        },
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#002CBA',
                      },
                    },
                  }}
                />
              </div>
            </FormRow>
          </form>
        </CollapsibleSection>

        <Box>
          {/* User Role Dropdown */}
          <Box sx={{ mb: 4 }}>
            <Typography
              component="label"
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: errors.role ? 'error.main' : '#000',
                display: 'block',
                mb: 1,
                '&::after': {
                  content: '" *"',
                  color: 'error.main',
                },
              }}
            >
              User Role
            </Typography>
            <FormControl
              error={!!errors.role}
              sx={{
                width: '340px',
                '& .MuiOutlinedInput-root': {
                  height: '45px',
                  // backgroundColor: '#F6F6F6',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D1D1',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#F6F6F6 !important',
                  },
                  '& .MuiSelect-select.Mui-disabled': {
                    backgroundColor: '#F6F6F6 !important',
                  },
                  '& .MuiSelect-select': {
                    py: '12px',
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#002CBA',
                  },
                },
              }}
            >
              <Select
                name="role"
                value={formData.role || ''}
                onChange={handleSelectChange}
                IconComponent={CustomArrowIcon}
                displayEmpty
                disabled={isDropdownLoading || isModifyMode}
                renderValue={(selected) => {
                  if (isDropdownLoading) return 'Loading...';
                  if (!selected) {
                    return (
                      <Typography
                        style={{
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        Select Role
                      </Typography>
                    );
                  }
                  // Display role labels
                  if (selected === 'SA') return 'Super Admin (SA)';
                  if (selected === 'RA') return 'Registry Admin (RA)';
                  if (selected === 'CU') return 'Operational User (CU)';
                  return selected;
                }}
              >
                {/* Super Admin can create Admin and Operational users */}
                {userType === 'Super_Admin_User' && (
                  <MenuItem value="RA">
                    <Typography
                      fontFamily="Gilroy, sans-serif"
                      fontWeight={600}
                      fontSize="14px"
                      color="#000"
                    >
                      Registry Admin (RA)
                    </Typography>
                  </MenuItem>
                )}

                {/* Admin user can only create Operational users */}
                {userType === 'Admin_User' && (
                  <MenuItem value="CU">
                    <Typography
                      fontFamily="Gilroy, sans-serif"
                      fontWeight={600}
                      fontSize="14px"
                      color="#000"
                    >
                      Operational User (CU)
                    </Typography>
                  </MenuItem>
                )}

                {/* Fallback: Show all roles for other user types (shouldn't happen) */}
                {userType !== 'Super_Admin_User' &&
                  userType !== 'Admin_User' && (
                    <>
                      <MenuItem value="SA">
                        <Typography
                          fontFamily="Gilroy, sans-serif"
                          fontWeight={600}
                          fontSize="14px"
                          color="#000"
                        >
                          Super Admin (SA)
                        </Typography>
                      </MenuItem>
                      <MenuItem value="RA">
                        <Typography
                          fontFamily="Gilroy, sans-serif"
                          fontWeight={600}
                          fontSize="14px"
                          color="#000"
                        >
                          Registry Admin (RA)
                        </Typography>
                      </MenuItem>
                      <MenuItem value="CU">
                        <Typography
                          fontFamily="Gilroy, sans-serif"
                          fontWeight={600}
                          fontSize="14px"
                          color="#000"
                        >
                          Operational User (CU)
                        </Typography>
                      </MenuItem>
                    </>
                  )}
              </Select>
              <FormHelperText>{errors.role}</FormHelperText>
            </FormControl>
          </Box>

          <SelectFunctionalities
            disabled={menuAction !== 'Modify' && menuAction !== 'Create'}
            isViewMode={menuAction === 'View User Details'}
            userRole={
              formData.role === 'SA'
                ? 'Super_Admin_User'
                : formData.role === 'RA'
                  ? 'Admin_User'
                  : formData.role === 'CU'
                    ? 'Operational_User'
                    : 'Super_Admin_User' // Default fallback
            }
            selectedFunctionalities={selectedFunctionalities}
            onFunctionalitiesChange={(functionalities) => {
              // console.log(
              //   '📩 Received functionalities update from SelectFunctionalities:',
              //   functionalities
              // );
              setSelectedFunctionalities(functionalities);
            }}
          />
        </Box>

        {/* Action Buttons */}

        <ActionButtons />

        {/* OTP Verification Modal (shared UI) */}
        <OTPVerificationModal
          open={showOtpModal}
          otpIdentifier={otpIdentifier}
          onClose={() => setShowOtpModal(false)}
          onVerify={handleOtpVerification}
          mobileNumber={formData.mobileNumber || ''}
          email={formData.email || ''}
          otpType={otpType}
        />

        {/* CKYC OTP Verification Modal (shared UI) */}
        <OTPVerificationModal
          open={showCkycOtpModal}
          otpIdentifier={formData.ckycNumber}
          onClose={() => setShowCkycOtpModal(false)}
          onVerify={async (mobileOtp, emailOtp) => {
            // After CKYC OTP validated, mark CKYC verified and trigger CKYC flow
            setIsCkycVerified(true);
            setShowCkycOtpModal(false);
            handleCkycVerification();
            return true;
          }}
          mobileNumber={formData.mobileNumber || ''}
          email={formData.email || ''}
          otpType="both"
        />

        {/* CKYC Verification Modal */}
        <CKYCVerificationModal
          open={showCkycVerificationModal}
          onClose={() => setShowCkycVerificationModal(false)}
          onVerify={async (otp: string) => {
            // Handle OTP verification for CKYC
            // console.log('CKYC OTP verification:', otp);
            // Call CKYC verification after OTP is verified
            handleCkycVerification();
            setShowCkycVerificationModal(false);
            setIsCkycVerified(true);
            // Enable all fields after CKYC verification
            setIsAllFieldsDisabled(false);
          }}
          ckycNumber={formData.ckycNumber}
        />

        {/* Suspend User Modal */}
        <SuspendUserModal
          open={showSuspendModal}
          onClose={() => setShowSuspendModal(false)}
          userId={id || ''}
          mode={modalMode}
        />

        {/* Deactivate User Modal */}
        <DeactivateUserModal
          open={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          userId={id || ''}
        />

        {/* Revoke User Modal */}
        <RevokeUserModal
          open={showRevokeModal}
          onClose={() => {
            setShowRevokeModal(false);
            // Navigate back to user list after successful revoke
            navigate(
              '/ckycrr-admin/sub-users/certify-modify?action=Track Status'
            );
          }}
          userName={`${formData.firstName} ${formData.lastName}`.trim()}
          onConfirm={async (data) => {
            try {
              const resultAction = await dispatch(
                revokeSuspendUser({
                  userId: id || '',
                  remark: data.remark,
                })
              );

              if (revokeSuspendUser.fulfilled.match(resultAction)) {
                // Don't close the modal here - let RevokeUserModal show success message
                // Refresh user data
                if (id) {
                  dispatch(
                    fetchUsers({
                      page: 0,
                      size: 1,
                      searchQuery: '',
                      userId: id,
                    })
                  );
                }
                return true;
              } else {
                return false;
              }
            } catch (error) {
              return false;
            }
          }}
        />
      </ContentWrapper>

      <ConfirmationModal
        open={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setCreateUserResponse(null);
          navigate(
            '/ckycrr-admin/sub-users/certify-modify?action=Track Status'
          );
        }}
        // message={
        //   createUserResponse
        //     ? 'Submitted for approval'
        //     : // ? `${createUserResponse.message}\n\nUser ID: ${createUserResponse.userId}\nWorkflow ID: ${createUserResponse.workflowId}\nStatus: ${createUserResponse.workflowStatus}`
        //       ''
        // }
        message={
          userType === 'Super_Admin_User' && menuAction === 'Create'
            ? 'User created successfully'
            : userType === 'Super_Admin_User' && menuAction === 'Modify'
              ? 'User modified successfully'
              : 'Submitted for approval'
        }
        onConfirm={() => {
          setShowConfirmation(false);
          setCreateUserResponse(null);
          navigate(
            '/ckycrr-admin/sub-users/certify-modify?action=Track Status'
          );
        }}
      />

      {/* OTP Verification Success Modal */}

      {/* Error Modal */}
      <ErrorModal
        open={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error"
        primaryMessage={errorMessage}
        buttonText="Okay"
      />
    </MainContainer>
  );
};

export default CreateNewUser;
