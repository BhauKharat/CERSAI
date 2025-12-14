import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
  fetchDropdownMasters,
  fetchGeographyHierarchy,
} from '../../../../redux/slices/registerSlice/masterSlice';
import { fetchRegions } from './slice/fetchRegionsSlice';
import { fetchOfficeAddress } from './slice/fetchOfficeAddressSlice';
import { OfficeAddressData } from './types/fetchOfficeAddressTypes';
import { fetchBranches } from '../CreateModifyBranch/slice/fetchBranchesSlice';
import { fetchRegionByCode } from '../CreateModifyRegion/slice/singleRegionSlice';
import { SingleRegionData } from '../CreateModifyRegion/types/singleRegion';
// import { fetchApprovedRegions } from '../CreateModifyRegion/slice/approvedRegionsSlice';
// import { fetchApprovedBranches } from '../CreateModifyBranch/slice/approvedBranchSlice';
// import {
//   fetchUserAddress,
//   clearData as clearAddressData,
// } from './slice/userAddressSlice';
// import { UserAddressParams } from './types/userAddressTypes';
import { fetchUserRoles } from './slice/userRolesSlice';
import { sendOtp, resetState } from './slice/sendOtpSlice';
import { createSubUser } from './slice/createSubUserSlice';
import { CreateSubUserRequest } from './types/createSubUserTypes';
import { ModifyUserRequest } from './types/modifyUserTypes';
import {
  fetchUser,
  clearData as clearFetchUserData,
} from './slice/fetchUserSlice';
import {
  modifyUser,
  clearData as clearModifyUserData,
} from './slice/modifyUserSlice';
import {
  fetchSuspensionDetails,
  clearSuspensionDetails,
} from './slice/suspensionDetailsSlice';
import OTPVerificationModal from './OTPVerificationModal';
import SuspendUserModal from './SuspendUser/SuspendUserModal';
import DeactivateUserModal from './DeactivateUser/DeactivateUserModal';
import RevokeUserModal from './RevokeUser/RevokeUserModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../ErrorModal/ErrorModal';
import CKYCVerificationModal from '../../../ui/Modal/CKYCVerificationModal';
import CkycNumberField from '../../../ui/Input/CkycNumberField';
import { Secured } from '../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  maxLengthByIdType,
  ValidationUtils,
  REGEX,
} from '../../../../utils/validationUtils';
import { USER_ROLES } from '../../../../utils/enumUtils';
import {
  Button,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Box,
  Typography,
  Collapse,
  Paper,
  IconButton,
  BoxProps,
  CircularProgress,
} from '@mui/material';
import {
  FormRow,
  StyledFormControl,
  MainContainer,
  PageTitle,
  ContentWrapper,
  FieldLabel,
  StyledMenuItem,
  customArrowIconStyles,
  BackButton,
} from './CreateNewUser.styles';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../NavigationBreadCrumb/NavigationBreadCrumb';

import StatusScreen from '../TrackStatus/StatusScreen';
import DateUtils from '../../../../utils/dateUtils';
import {
  INVALID_PAN_ERROR_MSG,
  INVALID_AADHAAR_ERROR_MSG,
  INVALID_PASSPORT_ERROR_MSG,
  INVALID_DRIVING_ERROR_MSG,
  INVALID_VOTER_ERROR_MSG,
  INVALID_TITLE_ERROR_MSG,
} from 'constants/messageConstants';

interface DropdownOption {
  value?: string;
  label?: string;
}

interface CountryData {
  name: string;
  dial_code: string;
  code: string;
}

interface PhoneCountry {
  name: string;
  countryCode: string;
  code: string;
}

interface Pincode {
  id: string;
  pincode: string;
  city: string;
}

interface District {
  id: string;
  name: string;
  pincodes: Pincode[];
}

interface State {
  id: string;
  name: string;
  districts: District[];
}

interface Country {
  code: string;
  name: string;
  states: State[];
}

type UserRole =
  | 'NO'
  | 'IAU'
  | 'IU'
  | 'IRA'
  | 'IRU'
  | 'HOI'
  | 'IBU'
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

const CustomArrowIcon = (props: CustomArrowIconProps) => {
  return <KeyboardArrowDownIcon {...props} sx={customArrowIconStyles} />;
};

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

const CreateNewUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const location = useLocation();
  const { deactivate, suspend, revoke, track, status, workflowData, activity } =
    location.state || {};

  // Helper function to format approved by as "username [actionBy]"
  const formatApprovedBy = (
    actionByUserName: string | undefined,
    actionBy: string | undefined
  ): string => {
    if (!actionByUserName && !actionBy) return '';

    const username = actionByUserName?.trim() || '';
    const actionById = actionBy?.trim() || '';

    if (username && actionById) {
      return `${username} [${actionById}]`;
    } else if (username) {
      return username;
    } else if (actionById) {
      return actionById;
    }

    return '';
  };

  // Determine the mode based on the current route
  const currentPath = window.location.pathname;
  const isModifyMode = currentPath.includes('/modify-user/');
  const isSuspendedMode = currentPath.includes('/suspend-user/');
  const isDeactivateMode = deactivate === true; // Check if coming from deactivate-user page
  const isSuspendMode = suspend === true; // Check if coming from suspend-user page
  const isRevokeMode = revoke === true; // Check if coming from revoke-suspension page
  const { titles, genders, citizenships, proofOfIdentities, loading } =
    useSelector((state: RootState) => state.masters);

  const { geographyHierarchy } = useSelector(
    (state: RootState) => state.masters
  );

  const loginUserId = useSelector((state: RootState) => state.auth.loginUserId);

  const authState = useSelector((state: RootState) => state.auth);
  const groupMembership = authState?.groupMembership;

  const {
    data: regionsData,
    loading: regionsLoading,
    error: regionsError,
  } = useSelector((state: RootState) => state.fetchRegionsManagement);

  // Transform regions data to match the expected format
  const regions = useMemo(() => regionsData || [], [regionsData]);

  // Get office addresses from Redux store
  const {
    data: officeAddressData,
    loading: officeAddressLoading,
    error: officeAddressError,
  } = useSelector((state: RootState) => state.fetchOfficeAddress);

  // Get branches from Redux store
  const {
    data: branchesData,
    loading: branchesLoading,
    error: branchesError,
  } = useSelector((state: RootState) => state.fetchBranchesManagement);

  // Transform branches data to match the expected format
  const branches = useMemo(() => branchesData || [], [branchesData]);

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

  // Create Sub User state
  const createSubUserLoading = useSelector(
    (state: RootState) => state.createSubUserManagement.loading
  );

  // Fetch User state
  const {
    data: fetchedUserData,
    loading: fetchUserLoading,
    error: fetchUserError,
  } = useSelector((state: RootState) => state.fetchUser);

  // Modify User state
  const { loading: modifyUserLoading } = useSelector(
    (state: RootState) => state.modifyUser
  );

  // Suspension Details state
  const {
    data: suspensionDetails,
    loading: suspensionDetailsLoading,
    error: suspensionDetailsError,
  } = useSelector((state: RootState) => state.suspensionDetails);

  // Country data state
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [phoneCountries, setPhoneCountries] = useState<PhoneCountry[]>([]);

  const [userRole, setUserRole] = useState<UserRole>('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [regionAddressDetails, setRegionAddressDetails] =
    useState<SingleRegionData | null>(null);
  const [loadingRegionAddress, setLoadingRegionAddress] = useState(false);
  // Store original user data for comparison in modify mode
  console.log(regionAddressDetails, loadingRegionAddress);
  const [originalUserData, setOriginalUserData] = useState<{
    citizenship: string;
    ckycNumber: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    designation: string;
    email: string;
    countryCode: string;
    mobile: string;
    proofOfIdentity: string;
    proofOfIdentityNumber: string;
    dob: string;
    gender: string;
    employeeCode: string;
    regionCode: string;
    branchCode: string;
    sameAsRegisteredAddress: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    citizenship: '',
    ckycNo: '',
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
    branchName: '', // For displaying branch name in IBU modify mode
    // Address fields
    officeAddress: '', // Empty by default - user must select
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressCountryCode: 'IN',
    addressCountryName: 'India',
    state: '',
    district: '',
    city: '',
    pinCode: '',
    otherPinCode: '',
    digipin: '',
    sameAsRegisteredAddress: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showMobileOtpInModal, setShowMobileOtpInModal] = useState(true);
  const [showEmailOtpInModal, setShowEmailOtpInModal] = useState(true);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isCkycVerification, setIsCykcVerification] = useState<boolean>(false);

  // CKYC Verification states
  const [isCkycVerified, setIsCkycVerified] = useState(false);
  const [showCkycOtpModal, setShowCkycOtpModal] = useState(false);
  const [showCkycVerificationModal, setShowCkycVerificationModal] =
    useState(false);
  const [isAllFieldsDisabled, setIsAllFieldsDisabled] = useState(!isModifyMode); // Enable for modify mode, disable for create mode

  const formInitializedRef = useRef(false);
  const userRoleManuallyChangedRef = useRef(false);
  const regionManuallyChangedRef = useRef(false);
  const branchManuallyChangedRef = useRef(false);
  const lastFetchedRegionCodeRef = useRef<string>('');

  // Track last validated email and mobile to detect changes after validation
  const lastValidatedEmailRef = useRef<string>('');
  const lastValidatedMobileRef = useRef<string>('');

  // Track if user has actively interacted with these fields (not just initial load)
  const [userRoleUserInteracted, setUserRoleUserInteracted] = useState(false);
  const [regionUserInteracted, setRegionUserInteracted] = useState(false);
  const [branchUserInteracted, setBranchUserInteracted] = useState(false);
  const [dobUserInteracted, setDobUserInteracted] = useState(false);
  const [officeAddressUserInteracted, setOfficeAddressUserInteracted] =
    useState(false);

  // Modal states for success and error
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Location fields state variables
  const [selectedCountry, setSelectedCountry] = useState('IN'); // Default to India
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPincode, setPincode] = useState('');

  // Geography utility functions
  const allCountries = React.useMemo(
    () => geographyHierarchy || [],
    [geographyHierarchy]
  );

  const getStatesForCountry = (countryCode: string): State[] => {
    const country = allCountries.find((c: Country) => c.code === countryCode);
    return country?.states || [];
  };

  const getDistrictsForState = (
    countryCode: string,
    stateName: string
  ): District[] => {
    const country = allCountries.find((c: Country) => c.code === countryCode);
    const state = country?.states?.find((s: State) => s.name === stateName);
    return state?.districts || [];
  };

  const getCitiesForDistrict = (
    countryCode: string,
    stateName: string,
    districtName: string
  ): Pincode[] => {
    const country = allCountries.find((c: Country) => c.code === countryCode);
    const state = country?.states?.find((s: State) => s.name === stateName);
    const district = state?.districts?.find(
      (d: District) => d.name === districtName
    );
    return district?.pincodes || [];
  };

  // Location field handlers
  const handleCountryChange = (event: SelectChangeEvent) => {
    const countryCode = event.target.value;
    setSelectedCountry(countryCode);
    // Reset dependent fields
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCity('');
    setPincode('');

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

    // Update form data
    setFormData((prev) => ({
      ...prev,
      district: districtName,
      city: '',
      pinCode: '',
    }));
  };

  const handleCityChange = (event: SelectChangeEvent) => {
    const cityName = event.target.value;
    setSelectedCity(cityName);
    // Reset pincode when city changes
    setPincode('');

    // Update form data
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      pinCode: '',
      otherPinCode: '', // Clear otherPinCode when city changes
    }));
  };

  const handlePincodeChange = (event: SelectChangeEvent) => {
    const pincodeValue = event.target.value;
    setPincode(pincodeValue);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      pinCode: pincodeValue,
      // Clear otherPinCode when pincode changes from '000000'
      otherPinCode: pincodeValue === '000000' ? prev.otherPinCode : '',
    }));
  };

  // Function to handle address API call - COMMENTED OUT (Not in use)
  // const handleAddressApiCall = useCallback(
  //   (
  //     roleKey: string,
  //     addressType?: string,
  //     regionName?: string,
  //     branchName?: string
  //   ) => {
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

  //     // Make API call
  //     dispatch(fetchUserAddress(params));
  //   },
  //   [dispatch, selectedRegion, selectedBranch]
  // );

  // Reset sendOtp state on component mount to clear any persisted loading state
  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);

  // Reset form data when switching from modify-user to create-new-user
  useEffect(() => {
    // If we're not in modify mode and there's no id, reset the form
    if (!isModifyMode && !id && !track) {
      setFormData({
        citizenship: '',
        ckycNo: '',
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
        branchName: '',
        officeAddress: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        addressCountryCode: '',
        addressCountryName: '',
        state: '',
        district: '',
        city: '',
        pinCode: '',
        otherPinCode: '',
        digipin: '',
        sameAsRegisteredAddress: '',
      });

      // Reset all state variables
      setUserRole('');
      setSelectedRegion('');
      setSelectedBranch('');
      setErrors({});
      setIsValidated(false);
      setIsCkycVerified(false);
      setIsAllFieldsDisabled(true);
      setSelectedCountry('');
      setSelectedState('');
      setSelectedDistrict('');
      setSelectedCity('');
      setPincode('');

      // Reset refs
      formInitializedRef.current = false;
      userRoleManuallyChangedRef.current = false;
      regionManuallyChangedRef.current = false;
      branchManuallyChangedRef.current = false;
      lastValidatedEmailRef.current = '';
      lastValidatedMobileRef.current = '';

      // Reset interaction tracking
      setUserRoleUserInteracted(false);
      setRegionUserInteracted(false);
      setBranchUserInteracted(false);
      setDobUserInteracted(false);

      // Clear Redux data
      dispatch(clearFetchUserData());
      dispatch(clearModifyUserData());
    }
  }, [isModifyMode, id, track, dispatch]);

  // Fetch suspension details when in revoke mode or when user is suspended
  useEffect(() => {
    // Check if user is suspended from location.state or fetchedUserData
    const isUserSuspended =
      status === 'SUSPENDED' ||
      (fetchedUserData as { status?: string })?.status === 'SUSPENDED';

    // Fetch suspension details if in revoke mode OR if user is suspended
    if (id && (isRevokeMode || isUserSuspended)) {
      dispatch(fetchSuspensionDetails(id));
    }

    // Cleanup when component unmounts or mode changes
    return () => {
      if (isRevokeMode || isUserSuspended) {
        dispatch(clearSuspensionDetails());
      }
    };
  }, [isRevokeMode, id, dispatch, status, fetchedUserData]);

  // Fetch dropdown masters, regions, office addresses, and user roles on component mount
  useEffect(() => {
    dispatch(fetchDropdownMasters());
    dispatch(fetchGeographyHierarchy());
    dispatch(fetchUserRoles());

    // Fetch regions using userId from userDetails
    const userId = authState.userDetails?.userId;
    if (userId) {
      dispatch(fetchRegions({ userId: userId }));
    }

    // Fetch office addresses
    dispatch(fetchOfficeAddress({}));
  }, [dispatch, loginUserId, authState.userDetails?.userId]);

  useEffect(() => {
    if (!formData.officeAddress) {
      return; // Don't show anything by default
    }

    // Use API data from Redux store
    const officeAddresses = officeAddressData;

    if (officeAddresses && Array.isArray(officeAddresses)) {
      const selectedAddressType =
        formData.officeAddress === 'registered'
          ? 'REGISTERED'
          : 'CORRESPONDENCE';
      const selectedAddress = officeAddresses.find(
        (addr) =>
          (addr.address_type || addr.addressType) === selectedAddressType
      );

      if (selectedAddress) {
        // Find the country object to get the country code
        const country = allCountries.find(
          (c: Country) => c.name === selectedAddress.country
        );

        // Access additional address properties that may exist in API response
        const addressData = selectedAddress as typeof selectedAddress & {
          line2?: string;
          line_2?: string;
          line3?: string;
          line_3?: string;
          countryCode?: string;
          pinCode?: string;
          pincode?: string;
          pin_code?: string;
          alternatePinCode?: string;
          otherPinCode?: string;
          pincode_other?: string;
          digiPin?: string;
          digipin?: string;
          digi_pin?: string;
        };

        setFormData((prev) => ({
          ...prev,
          addressLine1: selectedAddress.line1 || '',
          addressLine2: addressData.line2 || addressData.line_2 || '',
          addressLine3: addressData.line3 || addressData.line_3 || '',
          city: selectedAddress.city || '',
          district: selectedAddress.district || '',
          state: selectedAddress.state || '',
          addressCountryCode:
            country?.code ||
            addressData.countryCode ||
            selectedAddress.country ||
            'IN',
          pinCode:
            addressData.pinCode ||
            addressData.pincode ||
            addressData.pin_code ||
            '',
          otherPinCode:
            addressData.alternatePinCode ||
            addressData.otherPinCode ||
            addressData.pincode_other ||
            '',
          digipin:
            addressData.digiPin ||
            addressData.digipin ||
            addressData.digi_pin ||
            '',
        }));

        // Update location state variables
        setSelectedCountry(country?.code || addressData.countryCode || 'IN');
        setSelectedState(selectedAddress.state || '');
        setSelectedDistrict(selectedAddress.district || '');
        setSelectedCity(selectedAddress.city || '');
        setPincode(addressData.pinCode || addressData.pincode || '');
      }
    }
    // eslint-disable-next-line
  }, [formData.officeAddress, officeAddressData, allCountries]);

  // Fetch user data when in modify or suspended mode
  useEffect(() => {
    // Skip API call if we have workflow data from track status page
    if (workflowData && track) {
      return;
    }

    if ((isModifyMode || isSuspendedMode) && id) {
      dispatch(fetchUser({ userId: id }));
    }

    // Cleanup function to clear data when component unmounts or mode changes
    return () => {
      if (isModifyMode || isSuspendedMode) {
        dispatch(clearFetchUserData());
        dispatch(clearModifyUserData());
      }
    };
  }, [dispatch, isModifyMode, isSuspendedMode, id, workflowData, track]);

  // Populate form data when user data is fetched in modify or suspended mode
  // If API fails, use static data as fallback
  useEffect(() => {
    // Helper function to convert userType from API format to component format
    const normalizeUserType = (userType: string): UserRole => {
      switch (userType) {
        case 'INSTITUTIONAL_ADMIN_USER':
        case 'IAU':
          return 'IAU';
        case 'INSTITUTIONAL_REGIONAL_ADMIN':
        case 'IRA':
          return 'IRA';
        case 'INSTITUTIONAL_REGIONAL_USER':
        case 'IRU':
          return 'IRU';
        case 'INSTITUTIONAL_BRANCH_USER':
        case 'IBU':
          return 'IBU';
        case 'INSTITUTIONAL_USER':
        case 'IU':
          return 'IU';
        case 'INDIVIDUAL_USER':
          return 'INDIVIDUAL_USER';
        case 'NODAL_OFFICER':
        case 'NO':
          return 'NO';
        case 'HEAD_OF_INSTITUTION':
        case 'HOI':
          return 'HOI';
        default:
          return userType as UserRole; // Return as-is if already a valid UserRole
      }
    };

    let userData: {
      userType?: string;
      regionName?: string;
      region?: string;
      branchName?: string;
      citizenship?: string;
      ckycNo?: string;
      title?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      designation?: string;
      emailAddress?: string;
      email?: string;
      gender?: string;
      countryCode?: string;
      mobileNumber?: string;
      mobile?: string;
      dob?: string;
      poi?: string;
      poiNumber?: string;
      employeeId?: string;
      regionCode?: string;
      branchCode?: string;
      sameAsRegisteredAddress?: string;
    } | null = null;

    // Check if activity is not "Creation" and we need to fetch from API
    const isCreation =
      activity === 'RE_USER_CREATION' ||
      activity === 'Creation' ||
      workflowData?.workflow_type === 'RE_USER_CREATION';

    // First check if we have workflowData from track status page and it's Creation
    if (
      workflowData &&
      track &&
      workflowData.payload?.userDetails &&
      isCreation
    ) {
      const userDetails = workflowData.payload.userDetails;

      // Convert date of birth array [year, month, day] to string format
      const dobArray = userDetails.dob;
      let dobString = '';
      if (dobArray && Array.isArray(dobArray) && dobArray.length === 3) {
        const [year, month, day] = dobArray;
        dobString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      // For IU users in Creation workflow, extract address based on sameAsRegisteredAddress
      let addressData: OfficeAddressData | Record<string, unknown> = {};
      const isIUUser =
        userDetails.role === 'IU' || userDetails.role === 'INSTITUTIONAL_USER';

      if (
        isIUUser &&
        officeAddressData &&
        Array.isArray(officeAddressData) &&
        officeAddressData.length > 0
      ) {
        const sameAsRegistered = userDetails.sameAsRegisteredAddress;
        const shouldUseCorrespondence =
          sameAsRegistered === false || sameAsRegistered === 'false';

        if (shouldUseCorrespondence) {
          const correspondenceAddress = officeAddressData.find(
            (addr) =>
              (addr.address_type || addr.addressType) === 'CORRESPONDENCE'
          );
          addressData = correspondenceAddress || officeAddressData[0];
        } else {
          const registeredAddress = officeAddressData.find(
            (addr) => (addr.address_type || addr.addressType) === 'REGISTERED'
          );
          addressData = registeredAddress || officeAddressData[0];
        }
      }

      userData = {
        userType: userDetails.role || '',
        regionName: userDetails.regionName || userDetails.region || '',
        branchName: userDetails.branchName || userDetails.branch || '',
        citizenship: userDetails.citizenship || '',
        ckycNo: userDetails.ckycNumber || userDetails.ckycNo || '',
        title: userDetails.title || '',
        firstName: userDetails.firstName || '',
        middleName: userDetails.middleName || '',
        lastName: userDetails.lastName || '',
        designation: userDetails.designation || '',
        emailAddress: userDetails.email || '',
        email: userDetails.email || '',
        gender: userDetails.gender || '',
        countryCode: userDetails.countryCode || '+91',
        mobileNumber: userDetails.mobile || '',
        mobile: userDetails.mobile || '',
        dob: dobString,
        poi: userDetails.proofOfIdentity || '',
        poiNumber: userDetails.proofOfIdentityNumber || '',
        employeeId: userDetails.employeeCode || '',
        sameAsRegisteredAddress: String(
          userDetails.sameAsRegisteredAddress || ''
        ),
      };

      // Store address data for workflow Creation
      if (isIUUser && Object.keys(addressData).length > 0) {
        (
          userData as {
            addressData?: OfficeAddressData | Record<string, unknown>;
          }
        ).addressData = addressData;
      }
    }
    // Then try to use API data if available
    else if ((isModifyMode || isSuspendedMode) && fetchedUserData) {
      // Extract address data from API response
      // For IU users, address is an array with REGISTERED and CORRESPONDENCE addresses
      let addressData: OfficeAddressData | Record<string, unknown> = {};

      // Only extract address for IU (Institutional User) users
      const userType = fetchedUserData.userType;
      const isIUUser = userType === 'IU' || userType === 'INSTITUTIONAL_USER';

      if (isIUUser) {
        if (
          officeAddressData &&
          Array.isArray(officeAddressData) &&
          officeAddressData.length > 0
        ) {
          let sameAsRegistered: string | boolean | undefined;

          if (
            workflowData?.payload?.userDetails?.sameAsRegisteredAddress !==
            undefined
          ) {
            // First priority: workflow data (from track status page)
            sameAsRegistered =
              workflowData.payload.userDetails.sameAsRegisteredAddress;
          } else {
            // Second priority: check addressResponseDto.sameAsRegisteredAddress (nested in API response)
            const addressDto = (
              fetchedUserData as {
                addressResponseDto?: {
                  sameAsRegisteredAddress?: boolean;
                };
              }
            )?.addressResponseDto;

            if (
              addressDto &&
              addressDto.sameAsRegisteredAddress !== undefined
            ) {
              // Convert boolean to string for consistency
              sameAsRegistered = addressDto.sameAsRegisteredAddress
                ? 'true'
                : 'false';
            }
          }

          // If still undefined, try to infer from officeAddress field
          if (sameAsRegistered === undefined) {
            const officeAddress = (
              fetchedUserData as { officeAddress?: string }
            )?.officeAddress;
            if (officeAddress === 'correspondence') {
              sameAsRegistered = 'false';
            } else if (officeAddress === 'registered') {
              sameAsRegistered = 'true';
            } else {
              // If both are undefined (old users), default to registered address
              // This is the safest default for existing users where we don't have the info
              sameAsRegistered = 'true';
            }
          }

          const shouldUseCorrespondence =
            sameAsRegistered === false || sameAsRegistered === 'false';

          if (shouldUseCorrespondence) {
            // Find CORRESPONDENCE address
            const correspondenceAddress = officeAddressData.find(
              (addr) =>
                (addr.address_type || addr.addressType) === 'CORRESPONDENCE'
            );
            addressData = correspondenceAddress || officeAddressData[0];
          } else {
            // Find REGISTERED address (default behavior)
            const registeredAddress = officeAddressData.find(
              (addr) => (addr.address_type || addr.addressType) === 'REGISTERED'
            );
            addressData = registeredAddress || officeAddressData[0];
          }
        }
      } else {
        // For IRA/IRU users, address will be fetched from region API in separate useEffect
      }

      userData = {
        userType: fetchedUserData.userType,
        regionName:
          (fetchedUserData as { region?: string })?.region ||
          fetchedUserData.regionName,
        region:
          (fetchedUserData as { region?: string })?.region ||
          fetchedUserData.regionName,
        regionCode: (fetchedUserData as { regionCode?: string })?.regionCode,
        branchName:
          (fetchedUserData as { branch?: string })?.branch ||
          fetchedUserData.branchName ||
          '',
        branchCode: (fetchedUserData as { branchCode?: string })?.branchCode,
        citizenship: fetchedUserData.citizenship || '',
        ckycNo: fetchedUserData.ckycNumber || fetchedUserData.ckycNo || '', // Try ckycNumber first, then ckycNo
        title: fetchedUserData.title || '',
        firstName: fetchedUserData.firstName || '',
        middleName: fetchedUserData.middleName || '',
        lastName: fetchedUserData.lastName || '',
        designation: fetchedUserData.designation || '',
        emailAddress:
          fetchedUserData.emailAddress || fetchedUserData.email || '',
        email: fetchedUserData.email || fetchedUserData.emailAddress || '',
        gender: fetchedUserData.gender || '',
        countryCode: fetchedUserData.countryCode || '+91',
        mobileNumber:
          fetchedUserData.mobileNumber || fetchedUserData.mobile || '',
        mobile: fetchedUserData.mobile || fetchedUserData.mobileNumber || '',
        dob: fetchedUserData.dob || '',
        poi: fetchedUserData.poi || '',
        poiNumber: fetchedUserData.poiNumber || '',
        employeeId: fetchedUserData.employeeId || '',
        sameAsRegisteredAddress: String(
          (fetchedUserData as { sameAsRegisteredAddress?: string | boolean })
            ?.sameAsRegisteredAddress || ''
        ),
      };

      // Store address data separately for later use
      (
        userData as {
          addressData?: OfficeAddressData | Record<string, unknown>;
        }
      ).addressData = addressData;

      // Also store the full address array for IU users
      if (Array.isArray(officeAddressData)) {
        (userData as { addressArray?: unknown[] }).addressArray =
          officeAddressData;
      }
    }

    // If we have user data (either from API or static), populate the form
    if (userData) {
      const normalizedUserType = normalizeUserType(userData.userType || '');

      // Store original data for comparison in modify mode
      if (isModifyMode && userData) {
        // Get region and branch codes from the selected values
        const regionName =
          userData.regionName || (userData as { region?: string })?.region;
        const branchName =
          userData.branchName || (userData as { branch?: string })?.branch;
        const regionCodeFromAPI = (userData as { regionCode?: string })
          ?.regionCode;

        // Try to find region code from region name if not provided in API
        const originalRegionCode =
          regionCodeFromAPI ||
          (regionName
            ? regions.find(
                (r: { regionName?: string; regionCode?: string }) =>
                  r.regionName === regionName
              )?.regionCode || ''
            : '');
        const originalBranchCode = branchName
          ? branches.find(
              (b: { branchName?: string; branchCode?: string }) =>
                b.branchName === branchName
            )?.branchCode || ''
          : '';

        setOriginalUserData({
          citizenship: userData.citizenship || '',
          ckycNumber: userData.ckycNo || '',
          title: userData.title || '',
          firstName: userData.firstName || '',
          middleName: userData.middleName || '',
          lastName: userData.lastName || '',
          designation: userData.designation || '',
          email: userData.emailAddress || userData.email || '',
          countryCode: userData.countryCode || '+91',
          mobile: userData.mobileNumber || userData.mobile || '',
          proofOfIdentity: userData.poi || '',
          proofOfIdentityNumber: userData.poiNumber || '',
          dob: userData.dob || '',
          gender: userData.gender || '',
          employeeCode: userData.employeeId || '',
          regionCode: workflowData?.meta_data?.regionCode || originalRegionCode,
          branchCode:
            (userData as { branchCode?: string })?.branchCode ||
            originalBranchCode ||
            '',
          sameAsRegisteredAddress:
            (userData as { sameAsRegisteredAddress?: string })
              ?.sameAsRegisteredAddress || '',
        });
      }

      // Set user role first - only if not manually changed by user
      if (!userRoleManuallyChangedRef.current || !formInitializedRef.current) {
        setUserRole(normalizedUserType);
      }
      const regionValue =
        workflowData?.meta_data?.region ||
        (userData as { region?: string })?.region;
      if (
        regionValue &&
        (!regionManuallyChangedRef.current || !formInitializedRef.current)
      ) {
        const regionExists =
          regions.length > 0
            ? regions.some((r) => r.regionName === regionValue)
            : true;

        if (regionExists || regions.length === 0) {
          setSelectedRegion(regionValue);
        }
      }

      // Mark form as initialized after first population
      if (!formInitializedRef.current) {
        formInitializedRef.current = true;
      }
      const branchNameValue =
        userData.branchName || (userData as { branch?: string })?.branch;
      if (
        branchNameValue &&
        (!branchManuallyChangedRef.current || !formInitializedRef.current)
      ) {
        // First try to use branchCode directly from API if available
        const branchCodeFromAPI = (userData as { branchCode?: string })
          ?.branchCode;
        if (branchCodeFromAPI) {
          // Verify the branch exists in branches list
          const branchExists = branches.some(
            (b: { branchCode?: string }) => b.branchCode === branchCodeFromAPI
          );
          if (branchExists || branches.length === 0) {
            setSelectedBranch(branchCodeFromAPI);
          } else {
            // Fallback: Find branchCode from branchName
            const branch = branches.find(
              (b: { branchName?: string; branchCode?: string }) =>
                b.branchName === branchNameValue
            );
            if (branch?.branchCode) {
              setSelectedBranch(branch.branchCode);
            }
          }
        } else {
          // Fallback: Find branchCode from branchName if branchCode not available
          const branch = branches.find(
            (b: { branchName?: string; branchCode?: string }) =>
              b.branchName === branchNameValue
          );
          if (branch?.branchCode) {
            setSelectedBranch(branch.branchCode);
          }
        }
      }

      // Extract address data from userData
      const addressData =
        (userData as { addressData?: Record<string, unknown> })?.addressData ||
        {};

      // For other cases, check if region was manually changed
      const hasAddressDataFromAPI =
        addressData && Object.keys(addressData).length > 0;
      const shouldPopulateAddress =
        hasAddressDataFromAPI ||
        !regionManuallyChangedRef.current ||
        !formInitializedRef.current;

      // TypeScript guard: ensure userData is not null and store in const for type narrowing
      if (!userData) {
        return;
      }

      // Store in const so TypeScript knows it's not null inside the callback
      const safeUserData = userData;

      setFormData((prev) => {
        const baseData = {
          citizenship: safeUserData.citizenship || '',
          ckycNo: safeUserData.ckycNo || '',
          title: safeUserData.title || '',
          firstName: safeUserData.firstName || '',
          middleName: safeUserData.middleName || '',
          lastName: safeUserData.lastName || '',
          designation: safeUserData.designation || '',
          email: safeUserData.emailAddress || safeUserData.email || '',
          gender: safeUserData.gender || '',
          countryCode: safeUserData.countryCode || '+91',
          mobileNumber: safeUserData.mobileNumber || safeUserData.mobile || '',
          dateOfBirth: safeUserData.dob || '',
          proofOfIdentity: safeUserData.poi || '',
          proofOfIdentityNumber: safeUserData.poiNumber || '',
          employeeCode: safeUserData.employeeId || '',
          branchName: safeUserData.branchName || prev.branchName || '',
          officeAddress:
            (addressData.address_type || addressData.addressType) ===
            'CORRESPONDENCE'
              ? 'correspondence'
              : (addressData.address_type || addressData.addressType) ===
                  'REGISTERED'
                ? 'registered'
                : prev.officeAddress || '',
          sameAsRegisteredAddress:
            (addressData.address_type || addressData.addressType) ===
            'CORRESPONDENCE'
              ? 'false'
              : (addressData.address_type || addressData.addressType) ===
                  'REGISTERED'
                ? 'true'
                : prev.sameAsRegisteredAddress || '',
        };

        // Only update address fields if region hasn't been manually changed
        if (shouldPopulateAddress) {
          return {
            ...baseData,
            addressLine1: (addressData.line1 as string) || '',
            addressLine2: (addressData.line2 as string) || '',
            addressLine3: (addressData.line3 as string) || '',
            addressCountryCode:
              (addressData.country as string) ||
              (addressData.countryCode as string) ||
              'IN',
            addressCountryName: (addressData.countryName as string) || 'India',
            city: (addressData.city as string) || '',
            district: (addressData.district as string) || '',
            state: (addressData.state as string) || '',
            pinCode:
              (addressData.pincode as string) ||
              (addressData.pinCode as string) ||
              (addressData.pin_code as string) ||
              '',
            otherPinCode:
              (addressData.alternatePinCode as string) ||
              (addressData.otherPinCode as string) ||
              (addressData.pincode_other as string) ||
              '',
            digipin:
              (addressData.digiPin as string) ||
              (addressData.digipin as string) ||
              (addressData.digi_pin as string) ||
              '',
          };
        } else {
          // Keep existing address fields if region was manually changed
          return {
            ...baseData,
            addressLine1: prev.addressLine1,
            addressLine2: prev.addressLine2,
            addressLine3: prev.addressLine3,
            addressCountryCode: prev.addressCountryCode,
            addressCountryName: prev.addressCountryName,
            city: prev.city,
            district: prev.district,
            state: prev.state,
            pinCode: prev.pinCode,
            otherPinCode: prev.otherPinCode,
            digipin: prev.digipin,
          };
        }
      });
      if (
        addressData &&
        Object.keys(addressData).length > 0 &&
        shouldPopulateAddress
      ) {
        const countryCode =
          (addressData.countryCode as string) ||
          (addressData.country as string) ||
          'IN';
        const stateName = (addressData.state as string) || '';
        const districtName = (addressData.district as string) || '';
        const cityName = (addressData.city as string) || '';

        if (countryCode) {
          setSelectedCountry(countryCode);
        }

        if (stateName) {
          setSelectedState(stateName);
        }

        if (districtName) {
          setSelectedDistrict(districtName);
        }

        if (cityName) {
          if (countryCode && stateName && districtName) {
            const availableCities = getCitiesForDistrict(
              countryCode,
              stateName,
              districtName
            );
            const matchingCity = availableCities.find(
              (p: Pincode) =>
                p.city &&
                cityName &&
                typeof p.city === 'string' &&
                typeof cityName === 'string' &&
                p.city.toLowerCase() === cityName.toLowerCase()
            );
            if (matchingCity) {
              setSelectedCity(matchingCity.city);
            } else {
              setSelectedCity(cityName);
            }
          } else {
            setSelectedCity(cityName);
          }
        }
        const pincodeValue =
          (addressData.pincode as string) ||
          (addressData.pinCode as string) ||
          '';
        if (pincodeValue) {
          setFormData((prev) => ({
            ...prev,
            pinCode: pincodeValue,
          }));
        }
      }

      if (
        (workflowData && track) ||
        isDeactivateMode ||
        isSuspendMode ||
        isRevokeMode
      ) {
        setIsValidated(true); // Set validated to true for view-only modes
        setIsAllFieldsDisabled(true); // Disable all fields when viewing workflow data or from deactivate-user page or suspend-user page or revoke-suspension page
      } else {
        setIsValidated(false); // Require validation in modify mode - same as create user flow
        setIsAllFieldsDisabled(false); // Enable fields for modify mode
      }

      setIsCkycVerified(true); // Mark CKYC as verified for existing users
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchedUserData,
    fetchUserError,
    isModifyMode,
    isSuspendedMode,
    id,
    // handleAddressApiCall, // Commented out - not in use
    workflowData,
    track,
    isDeactivateMode,
    isSuspendMode,
    isRevokeMode,
    activity,
    branches,
    regions,
    officeAddressData,
  ]);

  // Debug useEffect to monitor ckycNo changes
  useEffect(() => {}, [formData.ckycNo]);

  useEffect(() => {
    if (
      formData.pinCode &&
      (isModifyMode || isSuspendedMode) &&
      selectedPincode !== formData.pinCode
    ) {
      // If we have a city selected, try to match the pincode
      if (
        selectedCity &&
        selectedState &&
        selectedDistrict &&
        selectedCountry
      ) {
        // Get available pincodes for the selected city (case-insensitive match)
        const allPincodes = getCitiesForDistrict(
          selectedCountry,
          selectedState,
          selectedDistrict
        );
        const availablePincodes = allPincodes.filter(
          (p: Pincode) =>
            p &&
            p.city &&
            selectedCity &&
            typeof p.city === 'string' &&
            typeof selectedCity === 'string' &&
            p.city.toLowerCase() === selectedCity.toLowerCase()
        );

        // Check if the pincode from formData exists in the available options
        const matchingPincode = availablePincodes.find(
          (p: Pincode) => p.pincode === formData.pinCode
        );

        if (matchingPincode) {
          setPincode(formData.pinCode);
          return;
        }
      }

      if (formData.pinCode) {
        // Use a small delay to ensure dropdown is ready
        const timer = setTimeout(() => {
          setPincode(formData.pinCode);
        }, 300);

        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCity,
    selectedCountry,
    selectedState,
    selectedDistrict,
    formData.pinCode,
    selectedPincode,
    isModifyMode,
    isSuspendedMode,
  ]);

  // Fetch branches when region is selected for IBU role (works for both create and modify mode)
  // useEffect(() => {
  //   if (
  //     (userRole === 'INSTITUTIONAL_BRANCH_USER' || userRole === 'IBU') &&
  //     selectedRegion
  //   ) {
  //     // Find the selected region to get its ID
  //     const selectedRegionData = regions.find(
  //       (r) => r.regionName === selectedRegion
  //     );
  //     if (selectedRegionData?.id) {
  //       dispatch(fetchBranches({ regionId: selectedRegionData.id }));
  //     }
  //   }
  // }, [userRole, selectedRegion, regions, dispatch]);

  // Set region from fetched user data after regions are loaded
  useEffect(() => {
    if (
      fetchedUserData &&
      regions.length > 0 &&
      !selectedRegion &&
      (isModifyMode || isSuspendedMode) &&
      !regionManuallyChangedRef.current // Don't override if user manually changed it
    ) {
      const regionValue =
        (fetchedUserData as { region?: string })?.region ||
        (fetchedUserData as { regionName?: string })?.regionName;

      if (regionValue) {
        const exactMatch = regions.find((r) => r.regionName === regionValue);
        if (exactMatch) {
          setSelectedRegion(exactMatch.regionName);
        } else {
          // Try case-insensitive match
          const caseInsensitiveMatch = regions.find(
            (r) => r.regionName?.toLowerCase() === regionValue.toLowerCase()
          );
          if (caseInsensitiveMatch) {
            setSelectedRegion(caseInsensitiveMatch.regionName);
          } else {
            setSelectedRegion(regionValue);
          }
        }
      }
    }
  }, [fetchedUserData, regions, selectedRegion, isModifyMode, isSuspendedMode]);

  // Update address fields when branch is selected (only if manually changed)
  useEffect(() => {
    // Helper function to handle null, undefined, and "null" string values
    const getValue = (value: string | null | undefined): string => {
      if (value === null || value === undefined || value === 'null') {
        return '';
      }
      return String(value);
    };

    if (
      selectedBranch &&
      branches.length > 0 &&
      branchManuallyChangedRef.current
    ) {
      // Find the selected branch to get its address data
      const selectedBranchData = branches.find(
        (b) => b.branchCode === selectedBranch
      );

      // Auto-populate address fields from selected branch's address data
      if (selectedBranchData && selectedBranchData.address) {
        const address = selectedBranchData.address;

        setFormData((prev) => ({
          ...prev,
          addressLine1: getValue(address.line1),
          addressLine2: getValue(address.line2),
          addressLine3: getValue(address.line3),
          city: getValue(address.city),
          state: getValue(address.state),
          district: getValue(address.district),
          addressCountryCode: getValue(address.countryCode) || 'IN',
          pinCode: getValue(address.pinCode),
          otherPinCode: getValue(address.alternatePinCode),
          digipin: getValue(address.digiPin),
        }));

        // Update location state variables
        setSelectedCountry(getValue(address.countryCode) || 'IN');
        setSelectedState(getValue(address.state));
        setSelectedDistrict(getValue(address.district));
        setSelectedCity(getValue(address.city));
        setPincode(getValue(address.pinCode));
      }
    } else if (!selectedBranch && branchManuallyChangedRef.current) {
      // Clear address fields if branch is cleared
      setFormData((prev) => ({
        ...prev,
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        district: '',
        addressCountryCode: 'IN',
        pinCode: '',
        otherPinCode: '',
        digipin: '',
      }));

      // Reset location state variables
      setSelectedCountry('IN');
      setSelectedState('');
      setSelectedDistrict('');
      setSelectedCity('');
      setPincode('');
    }
  }, [selectedBranch, branches]);

  // Fetch user data for non-Creation activities from track status
  useEffect(() => {
    const fetchUserForNonCreation = async () => {
      // Check if we're in track mode, activity is not Creation, and we have userId
      const isCreation =
        activity === 'RE_USER_CREATION' ||
        activity === 'Creation' ||
        workflowData?.workflow_type === 'RE_USER_CREATION';

      if (track && !isCreation && id) {
        try {
          // Use userId from URL params (id) - not hardcoded
          const payload = [
            {
              operation: 'OR',
              filters: {
                userId: id, // id comes from useParams - the userId in the URL
              },
            },
          ];

          const response = await Secured.post(
            `${API_ENDPOINTS.get_sub_users}?page=0&size=1000&sort=branchCode,asc`,
            payload
          );

          if (
            response.data?.success !== false &&
            response.data?.data?.content?.length > 0
          ) {
            const userData = response.data.data.content[0];
            const addressData = userData.addressResponseDto || {};

            // Map API response to form data
            setFormData((prev) => ({
              ...prev,
              citizenship: userData.citizenship || '',
              ckycNo: userData.ckycNumber || userData.ckycNo || '',
              title: userData.title || '',
              firstName: userData.firstName || '',
              middleName: userData.middleName || '',
              lastName: userData.lastName || '',
              designation: userData.designation || '',
              email: userData.email || '',
              emailAddress: userData.email || '',
              gender: userData.gender || '',
              countryCode: userData.countryCode || '+91',
              mobileNumber: userData.mobile || '',
              mobile: userData.mobile || '',
              dateOfBirth: userData.dob || '',
              proofOfIdentity: userData.poi || '',
              proofOfIdentityNumber: userData.poiNumber || '',
              employeeCode: userData.employeeId || '',
              officeAddress:
                addressData.addressType === 'CORRESPONDENCE'
                  ? 'correspondence'
                  : addressData.addressType === 'REGISTERED'
                    ? 'registered'
                    : prev.officeAddress || 'registered',
              addressLine1: addressData.line1 || '',
              addressLine2: addressData.line2 || '',
              addressLine3: addressData.line3 || '',
              addressCountryCode: addressData.country || 'IN',
              state: addressData.state || '',
              district: addressData.district || '',
              city: addressData.city || '',
              pinCode: addressData.pincode || addressData.pinCode || '',
              otherPinCode: addressData.alternatePinCode || '',
            }));

            if (userData.userType) {
              setUserRole(userData.userType as UserRole);
            }
            if (userData.region) {
              setSelectedRegion(userData.region);
            }
            if (addressData.country || addressData.countryCode) {
              // addressData.country or addressData.countryCode might be country code (e.g., "IN")
              const countryCode =
                addressData.countryCode || addressData.country || 'IN';
              // Try to find by code first
              const country = allCountries.find(
                (c: Country) => c.code === countryCode
              );
              if (country) {
                setSelectedCountry(country.code);
              } else {
                // Default to IN if country not found
                setSelectedCountry('IN');
              }
            } else {
              setSelectedCountry('IN');
            }

            if (addressData.state) {
              setSelectedState(addressData.state);
            }

            if (addressData.district) {
              setSelectedDistrict(addressData.district);
            }

            if (addressData.city) {
              setSelectedCity(addressData.city);
            }

            if (addressData.pincode || addressData.pinCode) {
              setPincode(addressData.pincode || addressData.pinCode || '');
            }

            // Store original data for comparison
            setOriginalUserData({
              citizenship: userData.citizenship || '',
              ckycNumber: userData.ckycNumber || userData.ckycNo || '',
              title: userData.title || '',
              firstName: userData.firstName || '',
              middleName: userData.middleName || '',
              lastName: userData.lastName || '',
              designation: userData.designation || '',
              email: userData.email || '',
              countryCode: userData.countryCode || '+91',
              mobile: userData.mobile || '',
              proofOfIdentity: userData.poi || '',
              proofOfIdentityNumber: userData.poiNumber || '',
              dob: userData.dob || '',
              gender: userData.gender || '',
              employeeCode: userData.employeeId || '',
              regionCode: '',
              branchCode: '',
              sameAsRegisteredAddress: 'false',
            });

            setIsCkycVerified(true);
          }
        } catch {
          // Error handling
        }
      }
    };

    fetchUserForNonCreation();
  }, [track, activity, workflowData, id, allCountries]);

  // Fetch region address for IRA and IRU users ONLY (not IBU - IBU gets address from branch)
  useEffect(() => {
    const fetchRegionAddressForRegionalUsers = async () => {
      // Check if user role is IRA or IRU (NOT IBU)
      const isRegionalUserNotBranch =
        userRole === 'IRA' ||
        userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
        userRole === 'IRU' ||
        userRole === 'INSTITUTIONAL_REGIONAL_USER';

      // Don't proceed if we don't have user role yet
      if (!isRegionalUserNotBranch) {
        return;
      }

      // Get regionCode from multiple sources
      const regionCodeFromAPI = (fetchedUserData as { regionCode?: string })
        ?.regionCode;
      const regionNameFromAPI =
        (fetchedUserData as { region?: string })?.region ||
        (fetchedUserData as { regionName?: string })?.regionName;
      const regionCodeFromWorkflow =
        workflowData?.payload?.userDetails?.regionCode ||
        workflowData?.payload?.concernedUserDetails?.regionCode ||
        workflowData?.meta_data?.regionCode;

      // If we have region name but not code, look it up in regions array
      let regionCodeFromName = '';
      if (!regionCodeFromAPI && regionNameFromAPI && regions.length > 0) {
        const foundRegion = regions.find(
          (r) => r.regionName === regionNameFromAPI
        );
        regionCodeFromName = foundRegion?.regionCode || '';
      }

      // Determine which region code to use - prioritize API regionCode, then lookup by name, then workflow
      const regionCodeToFetch =
        regionCodeFromAPI || regionCodeFromName || regionCodeFromWorkflow;

      console.log('🎯 Region codes available:', {
        regionCodeFromAPI,
        regionNameFromAPI,
        regionCodeFromName,
        regionCodeFromWorkflow,
        regionCodeToFetch,
        lastFetched: lastFetchedRegionCodeRef.current,
        regionsCount: regions.length,
      });

      // Only continue if we have a region code to fetch
      if (!regionCodeToFetch) {
        console.log('⚠️ No region code available to fetch');
        return;
      }

      // Skip if we already fetched this region code to prevent duplicate calls
      if (lastFetchedRegionCodeRef.current === regionCodeToFetch) {
        console.log('⏭️ Already fetched this region code, skipping');
        return;
      }

      console.log('✅ Fetching region with code:', regionCodeToFetch);

      if (regionCodeToFetch) {
        try {
          setLoadingRegionAddress(true);
          lastFetchedRegionCodeRef.current = regionCodeToFetch;

          const response = await Secured.get(
            API_ENDPOINTS.get_region_by_code(regionCodeToFetch)
          );

          if (response.data?.success && response.data?.data) {
            const data = response.data.data;
            setRegionAddressDetails(data);

            if (data.regionName && !regionManuallyChangedRef.current) {
              setSelectedRegion(data.regionName);
            }

            // Helper function to get safe value
            const getValue = (value: string | null | undefined): string => {
              if (value === null || value === undefined || value === 'null') {
                return '';
              }
              return String(value);
            };

            // Populate address fields from region address
            const address = data.address;
            if (address) {
              setFormData((prev) => ({
                ...prev,
                addressLine1: getValue(address.line1),
                addressLine2: getValue(address.line2),
                addressLine3: getValue(address.line3),
                city: getValue(address.city),
                state: getValue(address.state),
                district: getValue(address.district),
                addressCountryCode: getValue(address.countryCode) || 'IN',
                pinCode: getValue(address.pinCode),
                otherPinCode: getValue(address.alternatePinCode),
                digipin: getValue(address.digiPin),
              }));

              // Update location state variables
              setSelectedCountry(getValue(address.countryCode) || 'IN');
              setSelectedState(getValue(address.state));
              setSelectedDistrict(getValue(address.district));
              setSelectedCity(getValue(address.city));
              setPincode(getValue(address.pinCode));
            }
          }
        } catch (error) {
          console.error('Error fetching region data:', error);
        } finally {
          setLoadingRegionAddress(false);
        }
      }
    };

    fetchRegionAddressForRegionalUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, fetchedUserData, workflowData, regions, track]);

  // Fetch branch details for IBU users (branch name, region name, and address)
  useEffect(() => {
    const fetchBranchDetailsForIBU = async () => {
      // Check if user role is IBU
      const isBranchUser =
        userRole === 'IBU' || userRole === 'INSTITUTIONAL_BRANCH_USER';

      // Get branchCode from multiple sources
      const branchCodeFromAPI = (fetchedUserData as { branchCode?: string })
        ?.branchCode;
      const branchCodeFromWorkflow =
        workflowData?.payload?.userDetails?.branchCode ||
        workflowData?.payload?.concernedUserDetails?.branchCode ||
        workflowData?.meta_data?.branchCode;
      const branchCodeFromState = selectedBranch;

      const branchCodeToFetch =
        branchCodeFromAPI || branchCodeFromWorkflow || branchCodeFromState;

      if (isBranchUser && branchCodeToFetch) {
        try {
          const response = await Secured.get(
            API_ENDPOINTS.get_branch_by_code(branchCodeToFetch)
          );

          if (response.data?.success && response.data?.data) {
            const branchData = response.data.data;
            if (branchData.regionName && !regionManuallyChangedRef.current) {
              setSelectedRegion(branchData.regionName);
            }

            // Set branch code and branch name
            if (!branchManuallyChangedRef.current) {
              setSelectedBranch(branchData.branchCode);

              // Also set branch name in formData for display purposes
              setFormData((prev) => ({
                ...prev,
                branchName: branchData.branchName || '',
              }));
            }

            // Helper function to get safe value
            const getValue = (value: string | null | undefined): string => {
              if (value === null || value === undefined || value === 'null') {
                return '';
              }
              return String(value);
            };

            // Populate address fields from branch address
            const address = branchData.address;
            console.log(address, 'address');
            if (address) {
              const newFormData = {
                addressLine1: address?.line1 ? getValue(address.line1) : '',
                addressLine2: address.line2,
                addressLine3: address.line3, // May be empty/undefined
                city: address.city,
                state: getValue(address.state),
                district: getValue(address.district),
                addressCountryCode:
                  getValue(address.countryCode) ||
                  getValue(address.country) ||
                  'IN',
                pinCode: getValue(address.pinCode),
                otherPinCode: getValue(address.alternatePinCode),
                digipin: address.digiPin,
              };

              setFormData((prev) => {
                const updated = {
                  ...prev,
                  ...newFormData,
                };
                return updated;
              });

              // Update location state variables
              const countryCode =
                getValue(address.countryCode) ||
                getValue(address.country) ||
                'IN';
              setSelectedCountry(countryCode);
              setSelectedState(getValue(address.state));
              setSelectedDistrict(getValue(address.district));
              setSelectedCity(getValue(address.city));
              setPincode(getValue(address.pinCode));
            }
            console.log(address, 'address');
          }
        } catch (error) {
          console.error('Error fetching branch details for IBU:', error);
        }
      }
    };

    fetchBranchDetailsForIBU();
  }, [userRole, fetchedUserData, workflowData, selectedBranch]);

  // Helper function to get citizenship label
  const getCitizenshipLabel = (citizenshipValue: string): string => {
    const citizenship = citizenshipOptions.find(
      (c) => c.value === citizenshipValue
    );
    return citizenship?.label || citizenshipValue;
  };

  // Helper function to check if citizenship is not India/Indian
  const isNonIndianCitizenship = (): boolean => {
    if (!formData.citizenship) return false;
    const citizenshipLabel = getCitizenshipLabel(formData.citizenship);
    return citizenshipLabel !== 'Indian' && citizenshipLabel !== 'India';
  };

  // Helper function to convert text to title case (first letter of each word capitalized)
  const toTitleCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get role label from role code
  const getRoleLabel = (roleCode: string): string => {
    // Find the role in userRolesData
    const roleObj = userRolesData?.find((r) => r.role === roleCode);
    if (roleObj) {
      const roleFullForm = toTitleCase(roleObj.roleFullForm);
      return `${roleFullForm} [${roleObj.role}]`;
    }

    // Fallback to static labels if not found in API data
    const roleLabels: Record<string, string> = {
      NO: 'Nodal Officer [NO]',
      IAU: 'Institutional Admin User [IAU]',
      IU: 'Institutional User [IU]',
      IRA: 'Institutional Regional Admin [IRA]',
      IRU: 'Institutional Regional User [IRU]',
      HOI: 'Head of Institution [HOI]',
      IBU: 'Institutional Branch User [IBU]',
      INSTITUTIONAL_USER: 'Institutional User [IU]',
      INSTITUTIONAL_ADMIN_USER: 'Institutional Admin User [IAU]',
      INSTITUTIONAL_REGIONAL_ADMIN: 'Institutional Regional Admin [IRA]',
      INSTITUTIONAL_BRANCH_USER: 'Institutional Branch User [IBU]',
      INSTITUTIONAL_REGIONAL_USER: 'Institutional Regional User [IRU]',
      INDIVIDUAL_USER: 'Individual User [INDU]',
    };
    return roleLabels[roleCode] || toTitleCase(roleCode.replace(/_/g, ' '));
  };

  // Helper function to normalize dropdown options
  const normalizeOptions = (apiData: unknown[]): DropdownOption[] => {
    return apiData.map((item: unknown) => {
      const obj = item as Record<string, unknown>;
      const labelValue = obj.label || obj.name || obj.displayName || item;
      const valueValue = obj.value || obj.code || obj.name || item;

      // Convert to string and replace underscores if it's a string
      const labelString =
        typeof labelValue === 'string' ? labelValue : String(labelValue);
      const valueString =
        typeof valueValue === 'string' ? valueValue : String(valueValue);

      return {
        value: valueString,
        label: labelString.replace(/_/g, ' '),
      };
    });
  };

  // Prepare dropdown options from API data
  const titleOptions = normalizeOptions(titles);
  const genderOptions = normalizeOptions(genders);

  // Special handling for citizenship: use 'name' as value instead of 'code'
  // because 'code' contains dial codes (e.g., "+1 264") not citizenship codes
  const citizenshipOptions: DropdownOption[] = citizenships.map(
    (item: unknown) => {
      const obj = item as Record<string, unknown>;
      const name = obj.name || obj.label || obj.displayName || item;
      const nameString = typeof name === 'string' ? name : String(name);

      return {
        value: nameString, // Use name as value (e.g., "Anguilla")
        label: nameString.replace(/_/g, ' '), // Use name as label too
      };
    }
  );

  const proofOfIdentityOptions = normalizeOptions(proofOfIdentities);

  // Show loading indicator for dropdowns
  const isDropdownLoading =
    loading &&
    titles.length === 0 &&
    genders.length === 0 &&
    citizenships.length === 0 &&
    proofOfIdentities.length === 0;

  // Set default citizenship to "Indian" when options are loaded and in create mode
  useEffect(() => {
    if (
      citizenshipOptions.length > 0 &&
      !formData.citizenship &&
      !isModifyMode &&
      !id &&
      !track
    ) {
      const indianCitizenship = citizenshipOptions.find(
        (c) =>
          c.label === 'Indian' ||
          c.label === 'India' ||
          c.value?.toLowerCase().includes('indian') ||
          c.value?.toLowerCase().includes('india')
      );
      if (indianCitizenship) {
        setFormData((prev) => ({
          ...prev,
          citizenship: indianCitizenship.value || '',
        }));
      }
    }
  }, [citizenshipOptions, isModifyMode, id, track, formData.citizenship]);

  // Load country data - use fallback approach since fetch is failing
  useEffect(() => {
    const loadCountryData = async () => {
      try {
        setLoadingCountries(true);

        // Try fetch first, but use fallback if it fails
        try {
          const response = await fetch(
            `${window.location.origin}/ckyc/data/CountryCodes.json`
          );
          if (response.ok) {
            const data: CountryData[] = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              // Map to phone countries format
              const mapped: PhoneCountry[] = data.map((c) => ({
                name: c.name,
                countryCode: c.dial_code,
                code: c.code,
              }));
              setPhoneCountries(mapped);

              const india = data.find((country) => country.code === 'IN');
              if (india) {
                setFormData((prev) => ({
                  ...prev,
                  countryCode: india.dial_code,
                }));
              }
              return;
            }
          }
        } catch (error) {
          console.log(error);
          // Silently handle error during country data loading
        }
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizePoi = (v: string) =>
    (v || '').toUpperCase().replace(/[\s-]/g, '_');

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = e.target;

    // Don't validate at the top for proofOfIdentityNumber - we'll do it after uppercasing
    if (name !== 'proofOfIdentityNumber') {
      const validationError = validateField(name as string, value as string);
      if (validationError) {
        setErrors((prev) => ({
          ...prev,
          [name as string]: validationError,
        }));
      }
    }

    if (name === 'mobileNumber') {
      const digits = String(value).replace(/\D/g, '');
      const max = formData.countryCode.trim() === '+91' ? 10 : 15;
      const clipped = digits.slice(0, max);

      setFormData((prev) => ({ ...prev, mobileNumber: clipped }));

      // Reset validation if mobile number changes after being validated
      if (isValidated && clipped !== lastValidatedMobileRef.current) {
        setIsValidated(false);
      }

      // live validation to keep UX tight
      const err =
        formData.countryCode.trim() === '+91'
          ? clipped.length === 0
            ? 'Mobile number is required'
            : clipped.length !== 10
              ? 'Indian mobile number must be exactly 10 digits'
              : null
          : clipped.length === 0
            ? 'Mobile number is required'
            : clipped.length < 8
              ? 'Mobile number must be at least 8 digits'
              : clipped.length > 15
                ? 'Mobile number cannot exceed 15 digits'
                : null;

      setErrors((prev) => {
        const next = { ...prev };
        if (err) {
          next.mobileNumber = err;
        } else {
          // Only clear client-side validation errors, preserve server-side errors
          // Server-side errors typically contain messages like "already exists", "duplicate", etc.
          const currentError = prev.mobileNumber || '';
          const isServerError =
            currentError.includes('already exists') ||
            currentError.includes('duplicate') ||
            currentError.includes('already') ||
            currentError.includes('invalid') ||
            currentError.includes('not found');
          if (!isServerError) {
            delete next.mobileNumber;
          }
        }
        return next;
      });

      return; // stop here; we've handled this field
    }

    if (name === 'ckycNo') {
      const digitsOnly = String(value).replace(/\D/g, '').slice(0, 14);
      setFormData((prev) => ({ ...prev, ckycNo: digitsOnly }));

      // live-validate
      const err = (() => {
        if (!isNonIndianCitizenship() && digitsOnly.length === 0) {
          return 'CKYC Number is required for Indian citizens';
        }
        if (digitsOnly.length > 0 && digitsOnly.length !== 14) {
          return 'CKYC Number must be exactly 14 digits';
        }
        return null;
      })();

      setErrors((prev) => {
        const next = { ...prev };
        if (err) next.ckycNo = err;
        else delete next.ckycNo;
        return next;
      });
      return;
    }

    // Handle date formatting for dateOfBirth
    let formattedValue = value;
    if (name === 'dateOfBirth' && value) {
      // Mark DOB as manually changed by user
      setDobUserInteracted(true);

      // Ensure date is in YYYY-MM-DD format
      const date = new Date(value as string);
      if (!isNaN(date.getTime())) {
        formattedValue = date.toISOString().split('T')[0];

        // Validate: Date must be at least 18 years ago and not more than 100 years ago
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        const maxDate = new Date(today);
        maxDate.setFullYear(today.getFullYear() - 18);
        maxDate.setHours(0, 0, 0, 0); // Set to start of day
        const minDate = new Date(today);
        minDate.setFullYear(today.getFullYear() - 100);
        minDate.setHours(0, 0, 0, 0); // Set to start of day
        const selectedDate = new Date(formattedValue as string);
        selectedDate.setHours(0, 0, 0, 0); // Set to start of day

        // If selected date is after the max date (less than 18 years old), reject it
        if (selectedDate > maxDate) {
          setErrors((prev) => ({
            ...prev,
            dateOfBirth: 'Date of birth must be at least 18 years ago',
          }));
          setIsValidated(false); // Disable validate button
          return; // Don't update the form data
        } else if (selectedDate < minDate) {
          // If selected date is before the min date (more than 100 years old), reject it
          setErrors((prev) => ({
            ...prev,
            dateOfBirth: 'Date of birth cannot be more than 100 years ago',
          }));
          setIsValidated(false); // Disable validate button
          return; // Don't update the form data
        } else {
          // Clear error if date is valid
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.dateOfBirth;
            return newErrors;
          });
        }
      }
    }

    // Convert proof of identity number to uppercase for all proof of identity types
    if (name === 'proofOfIdentityNumber') {
      formattedValue = String(value).toUpperCase();

      // Validate the uppercased value
      const validationError = validateProofNumber(
        formData.proofOfIdentity,
        String(formattedValue)
      );
      if (validationError) {
        setErrors((prev) => ({
          ...prev,
          proofOfIdentityNumber: validationError,
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.proofOfIdentityNumber;
          return newErrors;
        });
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name as string]: formattedValue,
    }));

    // Reset validation if email changes after being validated
    if (
      name === 'email' &&
      isValidated &&
      formattedValue !== lastValidatedEmailRef.current
    ) {
      setIsValidated(false);
    }

    // Clear error when user starts typing (except for proofOfIdentityNumber which we handle above)
    if (errors[name as string] && name !== 'proofOfIdentityNumber') {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  };

  // Central validator for Proof of Identity Number
  const validateProofNumber = (poiRaw: string, raw: string): string | null => {
    const poi = normalizePoi(poiRaw);
    const value = String(raw || '')
      .trim()
      .toUpperCase();
    switch (poi) {
      case 'AADHAAR':
      case 'AADHAR': {
        // Aadhaar: Last 4 digits only (exactly 4 numeric digits)
        if (!ValidationUtils.isValidAadhaar(value)) {
          return INVALID_AADHAAR_ERROR_MSG;
        }
        return null;
      }

      case 'PAN':
      case 'PAN_CARD': {
        // PAN: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
        if (!ValidationUtils.isValidPAN(value)) {
          return INVALID_PAN_ERROR_MSG;
        }
        return null;
      }

      case 'PASSPORT': {
        // Indian Passport: 1 letter (excluding rarely used series) + 7 digits
        // Pragmatic rule: 1 capital letter + 7 digits
        if (!ValidationUtils.isValidPassport(value)) {
          return INVALID_PASSPORT_ERROR_MSG;
        }
        return null;
      }

      case 'DRIVING_LICENSE':
      case 'DRIVING_LICENCE':
      case 'DRIVINGLICENSE':
      case 'DRIVINGLICENCE':
      case 'DRIVERLICENSE':
      case 'DRIVERLICENCE':
      case 'DL': {
        // DL: Common format — 2-letter state + 2-digit RTO + 11–13 digits
        // Allow optional space/hyphen between segments.
        if (!ValidationUtils.isValidDrivingLicense(value)) {
          return INVALID_DRIVING_ERROR_MSG;
        }
        return null;
      }

      case 'VOTER_ID':
      case 'VOTERID':
      case 'EPIC':
      case 'ELECTOR_PHOTO_IDENTITY_CARD':
      case 'ELECTORS_PHOTO_IDENTITY_CARD':
      case 'VOTER': {
        if (!ValidationUtils.isValidVoterId(value)) {
          return INVALID_VOTER_ERROR_MSG;
        }
        return null;
      }

      default:
        return null; // Unknown type → skip format check
    }
  };

  // Central field validator
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'citizenship':
        if (!value) return 'Citizenship is required';
        return null;
      case 'ckycNo': {
        const v = String(value ?? '');
        const digits = v.replace(/\D/g, '');
        // Required for Indian citizens
        if (!isNonIndianCitizenship()) {
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
        if (!value) return INVALID_TITLE_ERROR_MSG;
        return null;
      case 'firstName':
        if (!value) return 'First Name is required';
        if (value.length > 33) return 'First Name cannot exceed 33 characters';
        if (!ValidationUtils.isValidFirstName(value))
          return 'First Name contains only letters, dot(.), apostrophe and spaces';
        return null;
      case 'middleName':
        if (value.length > 33) return 'Middle Name cannot exceed 33 characters';
        if (value && !ValidationUtils.isValidMiddleLastName(value))
          return 'Middle Name contains only letters, dot(.), apostrophe and spaces';
        return null;
      case 'lastName':
        // Last name is optional, but if provided, validate it
        if (value && value.length > 33)
          return 'Last Name cannot exceed 33 characters';
        if (value && !ValidationUtils.isValidMiddleLastName(value)) {
          return 'Last Name contains only letters, dot(.), apostrophe and spaces';
        }
        return null;
      case 'email':
        if (!value) return 'Email is required';
        if (value.length > 254) return 'Email cannot exceed 254 characters';
        if (!ValidationUtils.isValidEmail(value))
          return 'Email format is not correct';
        return null;
      case 'mobileNumber':
        if (!value) return 'Mobile Number is required';
        // Allow only digits
        if (!/^\d+$/.test(value))
          return 'Mobile Number must contain only digits';
        // Use utility function for validation
        if (
          !ValidationUtils.isValidMobileNumber(
            value,
            formData.countryCode.trim()
          )
        ) {
          if (formData.countryCode.trim() === '+91') {
            return 'Indian mobile number must be exactly 10 digits';
          }
          return 'Mobile number must be 8-15 digits';
        }
        return null;
      case 'proofOfIdentityNumber': {
        if (!value) return 'Identity number is required';
        const msg = validateProofNumber(formData.proofOfIdentity, value);
        return msg;
      }
      case 'designation':
        if (!value) return 'Designation is required';
        if (!ValidationUtils.isValidAlphanumeric(value))
          return 'Designation must contain only alphanumeric characters';
        return null;
      case 'employeeCode':
        if (!value) return 'Employee Code is required';
        if (!REGEX.ALPHANUM_PLUS.test(value))
          return 'Employee Code must contain only alphanumeric characters and + symbol';
        return null;
      default:
        return null;
    }
  };

  // Handle field blur to show validation errors
  const handleFieldBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const validationError = validateField(name as string, value as string);

    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        [name as string]: validationError,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;

    if (name === 'officeAddress' && value && userRole) {
      // handleAddressApiCall(userRole, value);

      // Update sameAsRegisteredAddress when officeAddress changes (for IU role)
      if (userRole === 'INSTITUTIONAL_USER' || userRole === 'IU') {
        setOfficeAddressUserInteracted(true); // Track manual change
        setFormData((prev) => ({
          ...prev,
          officeAddress: value,
          sameAsRegisteredAddress: value === 'registered' ? 'true' : 'false',
        }));
        return; // Exit early to prevent double update
      }
    }

    // Auto-update country code when citizenship changes
    if (name === 'citizenship') {
      // Handle empty value (clearing selection)
      if (!value || value === '') {
        setFormData((prev) => ({
          ...prev,
          [name]: '',
          ckycNo: '', // Reset CKYC Number when citizenship is cleared
        }));
        return;
      }

      // CRITICAL: Ensure value is NOT a dial code
      let citizenshipValue = String(value);
      if (citizenshipValue.startsWith('+')) {
        // Try to find the actual citizenship value
        const citizenshipOption = citizenshipOptions.find((c) =>
          c.label
            ?.toLowerCase()
            .includes(citizenshipValue.replace('+', '').trim())
        );
        if (citizenshipOption && citizenshipOption.value) {
          citizenshipValue = citizenshipOption.value;
        }
        // Still set the value even if we can't find a match - let user fix it
      }

      // Only try to auto-update country code if phoneCountries are loaded
      if (phoneCountries.length > 0) {
        // Find matching country based on citizenship value
        const citizenshipLabel = getCitizenshipLabel(citizenshipValue);

        let matchingCountry = phoneCountries.find((country) => {
          return (
            country.name.toLowerCase() === citizenshipLabel.toLowerCase() ||
            country.name.toLowerCase() === citizenshipValue.toLowerCase()
          );
        });

        // Special handling for "Indian" -> "India" mapping
        if (
          !matchingCountry &&
          (citizenshipLabel.toLowerCase() === 'indian' ||
            citizenshipValue.toLowerCase() === 'indian')
        ) {
          matchingCountry = phoneCountries.find(
            (country) => country.name.toLowerCase() === 'india'
          );
        }

        // Also try matching by removing common suffixes/prefixes
        if (!matchingCountry) {
          const normalizedLabel = citizenshipLabel
            .toLowerCase()
            .replace(/\s+/g, '');
          matchingCountry = phoneCountries.find((country) => {
            const normalizedCountryName = country.name
              .toLowerCase()
              .replace(/\s+/g, '');
            return (
              normalizedCountryName === normalizedLabel ||
              normalizedLabel.includes(normalizedCountryName) ||
              normalizedCountryName.includes(normalizedLabel)
            );
          });
        }

        if (matchingCountry && matchingCountry.countryCode) {
          const countryCode = matchingCountry.countryCode;
          setFormData((prev) => ({
            ...prev,
            [name]: citizenshipValue,
            countryCode: countryCode,
            ckycNo: '', // Reset CKYC Number when citizenship changes
          }));
          return; // Exit early after setting form data
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: citizenshipValue,
        ckycNo: '', // Reset CKYC Number when citizenship changes
      }));
    } else {
      if (name === 'proofOfIdentity' && value) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          proofOfIdentityNumber: '', // Reset the proof number
        }));

        // Set error for empty proof number field (it's required)
        setErrors((prev) => ({
          ...prev,
          proofOfIdentityNumber: 'Identity number is required',
        }));

        return; // Early return to prevent double update
      }

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

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      const maxDate = new Date(today);
      maxDate.setFullYear(today.getFullYear() - 18);
      maxDate.setHours(0, 0, 0, 0); // Set to start of day
      const minDate = new Date(today);
      minDate.setFullYear(today.getFullYear() - 100);
      minDate.setHours(0, 0, 0, 0); // Set to start of day
      const selectedDate = new Date(formData.dateOfBirth);
      selectedDate.setHours(0, 0, 0, 0); // Set to start of day
      if (selectedDate > maxDate) {
        newErrors.dateOfBirth = 'Date of birth must be at least 18 years ago';
      } else if (selectedDate < minDate) {
        newErrors.dateOfBirth =
          'Date of birth cannot be more than 100 years ago';
      }
    }
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
    if (!userRole) newErrors.userRole = 'User role is required';

    // Country code validation
    if (!formData.countryCode) {
      newErrors.countryCode = 'Country code is required';
    }

    // Mobile number validation
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile Number must contain only digits';
    } else if (
      !ValidationUtils.isValidMobileNumber(
        formData.mobileNumber,
        formData.countryCode.trim()
      )
    ) {
      if (formData.countryCode.trim() === '+91') {
        newErrors.mobileNumber =
          'Indian mobile number must be exactly 10 digits';
      } else {
        newErrors.mobileNumber = 'Mobile number must be 8-15 digits';
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email cannot exceed 254 characters';
    } else if (!ValidationUtils.isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      } else if (age > 100) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    // CKYC Number validation
    {
      const digits = String(formData.ckycNo ?? '').replace(/\D/g, '');
      if (!isNonIndianCitizenship()) {
        if (!digits)
          newErrors.ckycNo = 'CKYC Number is required for Indian citizens';
        else if (digits.length !== 14)
          newErrors.ckycNo = 'CKYC Number must be exactly 14 digits';
      } else if (digits && digits.length !== 14) {
        newErrors.ckycNo = 'If provided, enter a 14-digit CKYC Number';
      }
    }

    // Designation validation
    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    } else if (!ValidationUtils.isValidAlphanumeric(formData.designation)) {
      newErrors.designation =
        'Designation must contain only alphanumeric characters with `~@#$%^&*()_+-=';
    }

    // Employee Code validation
    if (!formData.employeeCode) {
      newErrors.employeeCode = 'Employee Code is required';
    } else if (!REGEX.ALPHANUM_PLUS.test(formData.employeeCode)) {
      newErrors.employeeCode =
        'Employee Code must contain only alphanumeric characters and + symbol';
    }

    // Role-specific validations
    if (
      (userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
        userRole === 'IRA' ||
        userRole === 'INSTITUTIONAL_REGIONAL_USER' ||
        userRole === 'IRU') &&
      !selectedRegion
    ) {
      newErrors.region = 'Region is required for this role';
    }
    if (
      (userRole === 'INSTITUTIONAL_BRANCH_USER' || userRole === 'IBU') &&
      !selectedBranch
    ) {
      newErrors.branch = 'Branch is required for Branch User';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to normalize values for comparison
  const normalizeValue = (value: string | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };

  // Check if mobile or email has been changed
  const hasMobileOrEmailChanged = useMemo(() => {
    const normalizedMobile = normalizeValue(formData.mobileNumber);
    const normalizedEmail = normalizeValue(formData.email);

    if (isModifyMode && originalUserData) {
      // Modify mode: check against original data
      const normalizedOriginalMobile = normalizeValue(originalUserData.mobile);
      const normalizedOriginalEmail = normalizeValue(originalUserData.email);

      return (
        normalizedMobile !== normalizedOriginalMobile ||
        normalizedEmail !== normalizedOriginalEmail
      );
    } else {
      if (!lastValidatedEmailRef.current && !lastValidatedMobileRef.current) {
        return true;
      }
      // If validated, check if values changed from last validated values
      return (
        normalizedMobile !== normalizeValue(lastValidatedMobileRef.current) ||
        normalizedEmail !== normalizeValue(lastValidatedEmailRef.current)
      );
    }
  }, [isModifyMode, originalUserData, formData.mobileNumber, formData.email]);

  const hasNonMobileEmailFieldsChanged = useMemo(() => {
    if (!isModifyMode || !originalUserData) {
      return false;
    }

    if (
      originalUserData.firstName &&
      !formData.firstName &&
      !formData.lastName &&
      !formData.email &&
      !formData.designation &&
      !formData.employeeCode
    ) {
      return false;
    }

    const originalRegionName =
      regions.find((r) => r.regionCode === originalUserData.regionCode)
        ?.regionName || '';

    const normalizedFormData = {
      citizenship: normalizeValue(formData.citizenship),
      ckycNo: normalizeValue(formData.ckycNo),
      title: normalizeValue(formData.title),
      firstName: normalizeValue(formData.firstName),
      middleName: normalizeValue(formData.middleName),
      lastName: normalizeValue(formData.lastName),
      designation: normalizeValue(formData.designation),
      gender: normalizeValue(formData.gender),
      dateOfBirth: normalizeValue(formData.dateOfBirth),
      proofOfIdentity: normalizeValue(formData.proofOfIdentity),
      proofOfIdentityNumber: normalizeValue(formData.proofOfIdentityNumber),
      employeeCode: normalizeValue(formData.employeeCode),
      countryCode: normalizeValue(formData.countryCode),
      userRole: normalizeValue(userRole),
      selectedRegion: normalizeValue(selectedRegion),
      selectedBranch: normalizeValue(selectedBranch),
      sameAsRegisteredAddress: normalizeValue(formData.sameAsRegisteredAddress),
    };

    const normalizedOriginal = {
      citizenship: normalizeValue(originalUserData.citizenship),
      ckycNumber: normalizeValue(originalUserData.ckycNumber),
      title: normalizeValue(originalUserData.title),
      firstName: normalizeValue(originalUserData.firstName),
      middleName: normalizeValue(originalUserData.middleName || ''),
      lastName: normalizeValue(originalUserData.lastName),
      designation: normalizeValue(originalUserData.designation),
      gender: normalizeValue(originalUserData.gender),
      dob: normalizeValue(originalUserData.dob),
      proofOfIdentity: normalizeValue(originalUserData.proofOfIdentity),
      proofOfIdentityNumber: normalizeValue(
        originalUserData.proofOfIdentityNumber
      ),
      employeeCode: normalizeValue(originalUserData.employeeCode),
      countryCode: normalizeValue(originalUserData.countryCode),
      userRole: normalizeValue(
        (originalUserData as { userRole?: string })?.userRole || ''
      ),
      regionName: normalizeValue(originalRegionName),
      branchCode: normalizeValue(originalUserData.branchCode || ''),
      sameAsRegisteredAddress: normalizeValue(
        originalUserData.sameAsRegisteredAddress || ''
      ),
    };

    const changes = {
      citizenship:
        normalizedFormData.citizenship !== normalizedOriginal.citizenship,
      ckycNo: normalizedFormData.ckycNo !== normalizedOriginal.ckycNumber,
      title: normalizedFormData.title !== normalizedOriginal.title,
      firstName: normalizedFormData.firstName !== normalizedOriginal.firstName,
      middleName:
        normalizedFormData.middleName !== normalizedOriginal.middleName,
      lastName: normalizedFormData.lastName !== normalizedOriginal.lastName,
      designation:
        normalizedFormData.designation !== normalizedOriginal.designation,
      gender: normalizedFormData.gender !== normalizedOriginal.gender,
      dateOfBirth: normalizedFormData.dateOfBirth !== normalizedOriginal.dob,
      proofOfIdentity:
        normalizedFormData.proofOfIdentity !==
        normalizedOriginal.proofOfIdentity,
      proofOfIdentityNumber:
        normalizedFormData.proofOfIdentityNumber !==
        normalizedOriginal.proofOfIdentityNumber,
      employeeCode:
        normalizedFormData.employeeCode !== normalizedOriginal.employeeCode,
      countryCode:
        normalizedFormData.countryCode !== normalizedOriginal.countryCode,
      userRole: normalizedFormData.userRole !== normalizedOriginal.userRole,
      selectedRegion:
        normalizedFormData.selectedRegion !== normalizedOriginal.regionName,
      selectedBranch:
        normalizedFormData.selectedBranch !== normalizedOriginal.branchCode,
      sameAsRegisteredAddress:
        normalizedFormData.sameAsRegisteredAddress !==
        normalizedOriginal.sameAsRegisteredAddress,
    };

    const hasChanges = Object.values(changes).some((changed) => changed);
    if (hasChanges) {
      const hasRealEditableChanges =
        (changes.citizenship && !errors.citizenship) ||
        (changes.ckycNo && !errors.ckycNo) ||
        (changes.title && !errors.title) ||
        (changes.firstName && !errors.firstName) ||
        (changes.middleName && !errors.middleName) ||
        (changes.lastName && !errors.lastName) ||
        (changes.designation && !errors.designation) ||
        (changes.gender && !errors.gender) ||
        (changes.dateOfBirth && dobUserInteracted && !errors.dateOfBirth) ||
        (changes.proofOfIdentity && !errors.proofOfIdentity) ||
        (changes.proofOfIdentityNumber && !errors.proofOfIdentityNumber) ||
        (changes.employeeCode && !errors.employeeCode) ||
        (changes.userRole && userRoleUserInteracted && !errors.userRole) ||
        (changes.selectedRegion && regionUserInteracted) ||
        (changes.selectedBranch && branchUserInteracted) ||
        (changes.sameAsRegisteredAddress && officeAddressUserInteracted);

      if (!hasRealEditableChanges) {
        return false;
      }
    }
    return hasChanges;
  }, [
    isModifyMode,
    originalUserData,
    formData.citizenship,
    formData.ckycNo,
    formData.title,
    formData.firstName,
    formData.middleName,
    formData.lastName,
    formData.designation,
    formData.gender,
    formData.dateOfBirth,
    formData.proofOfIdentity,
    formData.proofOfIdentityNumber,
    formData.employeeCode,
    formData.countryCode,
    formData.email,
    formData.sameAsRegisteredAddress,
    userRole,
    selectedRegion,
    selectedBranch,
    regions,
    userRoleUserInteracted,
    regionUserInteracted,
    branchUserInteracted,
    dobUserInteracted,
    officeAddressUserInteracted,
    errors,
  ]);

  const hasAnyFieldChanged = useMemo(() => {
    if (!isModifyMode || !originalUserData) {
      return false;
    }
    return hasNonMobileEmailFieldsChanged || hasMobileOrEmailChanged;
  }, [
    isModifyMode,
    originalUserData,
    hasNonMobileEmailFieldsChanged,
    hasMobileOrEmailChanged,
  ]);

  const isSubmitDisabledInModifyMode = useMemo(() => {
    if (!isModifyMode) {
      return false;
    }

    if (!originalUserData) {
      return true; // DISABLED
    }

    if (modifyUserLoading) {
      return true; // DISABLED
    }

    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      return true; // DISABLED
    }

    if (!hasNonMobileEmailFieldsChanged && !hasMobileOrEmailChanged) {
      return true;
    }
    const onlyMobileEmailChanged =
      hasMobileOrEmailChanged && !hasNonMobileEmailFieldsChanged;
    console.log(onlyMobileEmailChanged);

    // If mobile/email changed (regardless of other fields), MUST be validated before enabling submit
    if (hasMobileOrEmailChanged && !isValidated) {
      return true; // DISABLED - mobile/email changed but not validated yet
    }

    // Enable submit button when:
    // 1. Mobile/email changed AND validated, OR
    // 2. Non-mobile/email fields have changed (no validation needed)
    return false; // ENABLED
  }, [
    isModifyMode,
    originalUserData,
    modifyUserLoading,
    errors,
    hasMobileOrEmailChanged,
    isValidated,
    hasNonMobileEmailFieldsChanged,
  ]);

  // Check if form is valid for enabling Validate button (without setting errors)
  const isFormValid = () => {
    // Basic validation for required fields
    // Note: lastName is optional, so it's not checked here
    if (!formData.title || !formData.firstName) return false;
    if (!formData.designation) return false;
    if (!formData.dateOfBirth || !formData.gender || !formData.citizenship)
      return false;

    // Validate: Date must be at least 18 years ago
    if (formData.dateOfBirth) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      const maxDate = new Date(today);
      maxDate.setFullYear(today.getFullYear() - 18);
      maxDate.setHours(0, 0, 0, 0); // Set to start of day
      const selectedDate = new Date(formData.dateOfBirth);
      selectedDate.setHours(0, 0, 0, 0); // Set to start of day
      if (selectedDate > maxDate) return false;
    }
    if (!formData.proofOfIdentity || !formData.proofOfIdentityNumber)
      return false;
    if (!userRole) return false;

    // Country code validation
    if (!formData.countryCode) return false;

    // Mobile number validation - 10 digits for India, up to 15 for other countries
    if (!formData.mobileNumber) return false;
    if (!/^\d+$/.test(formData.mobileNumber)) return false;
    if (
      !ValidationUtils.isValidMobileNumber(
        formData.mobileNumber,
        formData.countryCode.trim()
      )
    )
      return false;

    // Email validation
    if (!formData.email || formData.email.length > 255) return false;
    if (!ValidationUtils.isValidEmail(formData.email)) return false;

    // Role-specific validations
    if (
      (userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
        userRole === 'IRA' ||
        userRole === 'INSTITUTIONAL_REGIONAL_USER' ||
        userRole === 'IRU') &&
      !selectedRegion
    ) {
      return false;
    }
    if (
      (userRole === 'INSTITUTIONAL_BRANCH_USER' || userRole === 'IBU') &&
      !selectedBranch
    ) {
      return false;
    }

    return true;
  };

  // Handle validate button click
  const handleValidate = async () => {
    if (validateFormWithErrors()) {
      setIsCykcVerification(false);
      let mobileChanged = false;
      let emailChanged = false;

      if (isModifyMode && originalUserData) {
        // Only in modify mode: detect which fields changed
        const normalizedMobile = normalizeValue(formData.mobileNumber);
        const normalizedEmail = normalizeValue(formData.email);

        // Check against last validated values if they exist, otherwise against original data
        const compareAgainstEmail =
          lastValidatedEmailRef.current ||
          normalizeValue(originalUserData.email);
        const compareAgainstMobile =
          lastValidatedMobileRef.current ||
          normalizeValue(originalUserData.mobile);

        mobileChanged = normalizedMobile !== compareAgainstMobile;
        emailChanged = normalizedEmail !== compareAgainstEmail;
      } else {
        // Create mode: detect which fields changed from last validation
        const normalizedMobile = normalizeValue(formData.mobileNumber);
        const normalizedEmail = normalizeValue(formData.email);

        if (!lastValidatedEmailRef.current && !lastValidatedMobileRef.current) {
          // First validation - send both OTPs
          mobileChanged = true;
          emailChanged = true;
        } else {
          // After first validation - only send OTP for changed fields
          mobileChanged =
            normalizedMobile !== normalizeValue(lastValidatedMobileRef.current);
          emailChanged =
            normalizedEmail !== normalizeValue(lastValidatedEmailRef.current);
        }
      }

      // Prepare OTP request data
      const otpRequestData: {
        emailId?: string;
        mobileNo?: string;
        countryCode: string;
        requestType: string;
      } = {
        countryCode: formData.countryCode,
        requestType: 'DIRECT',
      };

      // Prepare OTP request data based on which fields changed
      if (emailChanged && !mobileChanged) {
        // Only email changed
        otpRequestData.emailId = formData.email;
        otpRequestData.mobileNo = '-';
      } else if (mobileChanged && !emailChanged) {
        // Only mobile changed
        otpRequestData.emailId = '-';
        otpRequestData.mobileNo = formData.mobileNumber;
        console.log(otpRequestData);
      } else if (emailChanged && mobileChanged) {
        // Both changed - send both
        otpRequestData.emailId = formData.email;
        otpRequestData.mobileNo = formData.mobileNumber;
        console.log(otpRequestData);
      }

      console.log(otpRequestData);
      try {
        // Dispatch send OTP action
        const result = await dispatch(sendOtp(otpRequestData));
        if (sendOtp.fulfilled.match(result)) {
          // Show OTP fields only for changed fields (works for both modes)
          setShowMobileOtpInModal(mobileChanged);
          setShowEmailOtpInModal(emailChanged);
          // Open OTP verification modal
          setShowOtpModal(true);
        } else {
          // Handle error - show backend error message
          const errorMsg =
            (result.payload as string) ||
            'Failed to send OTP. Please try again.';
          setErrorMessage(errorMsg);
          setShowErrorModal(true);
        }
      } catch {
        // Handle unexpected errors
        setErrorMessage('An unexpected error occurred. Please try again.');
        setShowErrorModal(true);
      }
    }
  };

  // Handle successful CKYC verification - auto-populate form fields
  const handleCkycVerificationSuccess = (data?: unknown) => {
    try {
      setIsCkycVerified(true);

      // Extract data from API response
      const response = data as { data?: Record<string, unknown> } | undefined;
      const ckycData = response?.data || {};

      if (ckycData && Object.keys(ckycData).length > 0) {
        // Auto-populate form fields with CKYC data
        setFormData((prev) => ({
          ...prev,
          // Handle title with multiple possible field names
          title: String(ckycData.title || ckycData.salutation || prev.title),
          // Handle name fields with multiple possible field names
          firstName: String(
            ckycData.firstName ||
              ckycData.first_name ||
              ckycData.fname ||
              prev.firstName
          ),
          middleName: String(
            ckycData.middleName ||
              ckycData.middle_name ||
              ckycData.mname ||
              prev.middleName
          ),
          lastName: String(
            ckycData.lastName ||
              ckycData.last_name ||
              ckycData.lname ||
              ckycData.surname ||
              prev.lastName
          ),
          // Handle gender with multiple possible field names
          gender: String(ckycData.gender || ckycData.sex || prev.gender),
          // Handle date of birth with multiple possible field names
          dateOfBirth: String(
            ckycData.dateOfBirth ||
              ckycData.dob ||
              ckycData.date_of_birth ||
              prev.dateOfBirth
          ),
          // Also populate address fields if available
          addressLine1: String(
            ckycData.addressLine1 ||
              ckycData.line1 ||
              ckycData.address_line_1 ||
              prev.addressLine1
          ),
          addressLine2: String(
            ckycData.addressLine2 ||
              ckycData.line2 ||
              ckycData.address_line_2 ||
              prev.addressLine2
          ),
          addressLine3: String(
            ckycData.addressLine3 ||
              ckycData.line3 ||
              ckycData.address_line_3 ||
              prev.addressLine3
          ),
          state: String(ckycData.state || ckycData.stateCode || prev.state),
          district: String(ckycData.district || prev.district),
          city: String(ckycData.city || ckycData.town || prev.city),
          pinCode: String(
            ckycData.pinCode ||
              ckycData.pincode ||
              ckycData.pin_code ||
              prev.pinCode
          ),
          countryCode: String(
            ckycData.countryCode || ckycData.country_code || prev.countryCode
          ),
        }));

        // Also update location state variables if available
        if (ckycData.countryCode)
          setSelectedCountry(String(ckycData.countryCode));
        if (ckycData.state) setSelectedState(String(ckycData.state));
        if (ckycData.district) setSelectedDistrict(String(ckycData.district));
        if (ckycData.city) setSelectedCity(String(ckycData.city));
        if (ckycData.pinCode || ckycData.pincode)
          setPincode(String(ckycData.pinCode || ckycData.pincode));
      }

      // Enable all fields after CKYC verification
      setIsAllFieldsDisabled(false);
    } catch {
      // Still enable fields even if auto-population fails
      setIsCkycVerified(true);
      setIsAllFieldsDisabled(false);
    }
  };

  // Handle successful OTP verification
  const handleOtpVerification = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mobileOtp: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _emailOtp: string
  ): Promise<boolean> => {
    setIsValidated(true);
    setShowOtpModal(false);

    // Store the validated email and mobile values
    lastValidatedEmailRef.current = formData.email;
    lastValidatedMobileRef.current = formData.mobileNumber;

    return true;
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    const role = event.target.value as UserRole;
    setUserRole(role);
    userRoleManuallyChangedRef.current = true; // Mark as manually changed
    setUserRoleUserInteracted(true); // Track user interaction

    // Reset region and branch selections when role changes
    setSelectedRegion('');
    setSelectedBranch('');

    // Clear all User Address Details when role changes
    setFormData((prev) => ({
      ...prev,
      officeAddress: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      state: '',
      district: '',
      addressCountryCode: 'IN',
      pinCode: '',
      otherPinCode: '',
      digipin: '',
    }));

    // Reset location state variables
    setSelectedCountry('IN');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCity('');
    setPincode('');

    // Reset dependent fields when role changes
    if (
      role !== 'IRA' &&
      role !== 'INSTITUTIONAL_REGIONAL_ADMIN' &&
      role !== 'IBU' &&
      role !== 'INSTITUTIONAL_BRANCH_USER' &&
      role !== 'IRU' &&
      role !== 'INSTITUTIONAL_REGIONAL_USER'
    ) {
      setSelectedRegion('');
      setSelectedBranch('');
    }

    // Trigger address API call when role is selected for Institutional User
    if (role === 'IU' || role === 'INSTITUTIONAL_USER') {
      // Set default office address to 'registered' for IU role
      setFormData((prev) => ({
        ...prev,
        officeAddress: 'registered',
      }));

      // handleAddressApiCall('INSTITUTIONAL_USER', 'registered');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // In modify mode, prevent submission if no changes detected
    if (isModifyMode && !hasAnyFieldChanged) {
      setErrorMessage(
        'No changes detected. Please make changes before submitting.'
      );
      setShowErrorModal(true);
      return;
    }

    if (isModifyMode) {
      const onlyMobileEmailChanged =
        hasMobileOrEmailChanged && !hasNonMobileEmailFieldsChanged;
      if (onlyMobileEmailChanged && !isValidated) {
        setErrorMessage(
          'Please validate your mobile number and/or email before submitting.'
        );
        setShowErrorModal(true);
        return;
      }

      // Check if button should be disabled (safety check)
      if (isSubmitDisabledInModifyMode) {
        setErrorMessage(
          'Cannot submit at this time. Please check the form and try again.'
        );
        setShowErrorModal(true);
        return;
      }
    }

    const canSubmit = isModifyMode
      ? hasNonMobileEmailFieldsChanged ||
        (hasMobileOrEmailChanged && isValidated) ||
        (hasMobileOrEmailChanged && hasNonMobileEmailFieldsChanged)
      : isValidated;

    if (canSubmit) {
      try {
        // Helper function to convert role to short code
        const getRoleCode = (role: UserRole): string => {
          // If it's already a short code, return it
          if (['NO', 'IAU', 'IU', 'IRA', 'IRU', 'HOI', 'IBU'].includes(role)) {
            return role;
          }

          // Otherwise, convert long form to short code
          switch (role) {
            case 'INSTITUTIONAL_USER':
              return 'IU';
            case 'INSTITUTIONAL_REGIONAL_USER':
              return 'IRU';
            case 'INSTITUTIONAL_BRANCH_USER':
              return 'IBU';
            case 'INSTITUTIONAL_REGIONAL_ADMIN':
              return 'IRA';
            case 'INSTITUTIONAL_ADMIN_USER':
              return 'IAU';
            case 'INDIVIDUAL_USER':
              return 'INDU';
            default:
              return role;
          }
        };

        // Helper function to get region code from region name
        const getRegionCode = (regionName: string): string => {
          const region = regions.find((r) => r.regionName === regionName);
          return region?.regionCode || '';
        };

        if (isModifyMode && id) {
          const selectedPhoneCountry = phoneCountries.find(
            (c) => c.countryCode === formData.countryCode
          );
          const countryCodeForApi = selectedPhoneCountry
            ? selectedPhoneCountry.code === 'IN'
              ? 'IND'
              : selectedPhoneCountry.code.toUpperCase()
            : formData.countryCode || '';

          const currentData: {
            citizenship: string;
            ckycNumber: string;
            title: string;
            firstName: string;
            middleName: string;
            lastName: string;
            designation: string;
            email: string;
            countryCode: string;
            mobile: string;
            proofOfIdentity: string;
            proofOfIdentityNumber: string;
            dob: string;
            gender: string;
            employeeCode: string;
            regionCode?: string;
            branchCode?: string;
            sameAsRegisteredAddress?: string;
          } = {
            // Ensure citizenship is the actual citizenship value (country name), not a dial code
            citizenship: (() => {
              let citizenshipValue = formData.citizenship || '';
              // If it's a dial code, try to fix it
              if (citizenshipValue && citizenshipValue.startsWith('+')) {
                const countryByDialCode = phoneCountries.find(
                  (c) => c.countryCode === citizenshipValue
                );
                if (countryByDialCode) {
                  citizenshipValue = countryByDialCode.name || '';
                } else {
                  // Try to find in citizenship options
                  const matchingCitizenship = citizenshipOptions.find((c) =>
                    c.label
                      ?.toLowerCase()
                      .includes(citizenshipValue.replace('+', '').trim())
                  );
                  if (matchingCitizenship && matchingCitizenship.value) {
                    citizenshipValue = matchingCitizenship.value;
                  }
                }
              } else {
                // Verify it exists in options
                const citizenshipOption = citizenshipOptions.find(
                  (c) =>
                    c.value === citizenshipValue || c.label === citizenshipValue
                );
                if (citizenshipOption && citizenshipOption.value) {
                  citizenshipValue = citizenshipOption.value;
                }
              }
              return citizenshipValue;
            })(),
            ckycNumber: formData.ckycNo,
            title: formData.title,
            firstName: formData.firstName,
            middleName: formData.middleName || '',
            lastName: formData.lastName,
            designation: formData.designation,
            email: formData.email,
            countryCode: countryCodeForApi,
            mobile: formData.mobileNumber,
            proofOfIdentity: formData.proofOfIdentity,
            proofOfIdentityNumber: formData.proofOfIdentityNumber,
            dob: formData.dateOfBirth,
            gender: formData.gender,
            employeeCode: formData.employeeCode,
          };

          // Add role-specific fields
          if (
            userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
            userRole === 'IRA' ||
            userRole === 'INSTITUTIONAL_REGIONAL_USER' ||
            userRole === 'IRU'
          ) {
            currentData.regionCode = getRegionCode(selectedRegion);
          }

          if (userRole === 'INSTITUTIONAL_BRANCH_USER' || userRole === 'IBU') {
            currentData.regionCode = getRegionCode(selectedRegion);
            // selectedBranch already contains the branchCode
            currentData.branchCode = selectedBranch || '';
          }

          // Note: sameAsRegisteredAddress is NOT added to currentData here
          // It will be handled separately in the comparison logic below

          // Compare with original data and only include changed fields
          const changedFields: Partial<ModifyUserRequest> = {};
          if (originalUserData) {
            // Compare each field
            if (currentData.citizenship !== originalUserData.citizenship) {
              changedFields.citizenship = currentData.citizenship;
            }
            if (currentData.ckycNumber !== originalUserData.ckycNumber) {
              changedFields.ckycNumber = currentData.ckycNumber;
            }
            if (currentData.title !== originalUserData.title) {
              changedFields.title = currentData.title;
            }
            if (currentData.firstName !== originalUserData.firstName) {
              changedFields.firstName = currentData.firstName;
            }
            if (currentData.middleName !== originalUserData.middleName) {
              changedFields.middleName = currentData.middleName;
            }
            if (currentData.lastName !== originalUserData.lastName) {
              changedFields.lastName = currentData.lastName;
            }
            if (currentData.designation !== originalUserData.designation) {
              changedFields.designation = currentData.designation;
            }
            if (currentData.email !== originalUserData.email) {
              changedFields.email = currentData.email;
            }
            if (currentData.countryCode !== originalUserData.countryCode) {
              changedFields.countryCode = currentData.countryCode;
            }
            if (currentData.mobile !== originalUserData.mobile) {
              changedFields.mobile = currentData.mobile;
            }
            if (
              currentData.proofOfIdentity !== originalUserData.proofOfIdentity
            ) {
              changedFields.proofOfIdentity = currentData.proofOfIdentity;
            }
            if (
              currentData.proofOfIdentityNumber !==
              originalUserData.proofOfIdentityNumber
            ) {
              changedFields.proofOfIdentityNumber =
                currentData.proofOfIdentityNumber;
            }
            if (currentData.dob !== originalUserData.dob) {
              changedFields.dob = currentData.dob;
            }
            if (currentData.gender !== originalUserData.gender) {
              changedFields.gender = currentData.gender;
            }
            if (currentData.employeeCode !== originalUserData.employeeCode) {
              changedFields.employeeCode = currentData.employeeCode;
            }
            if (currentData.regionCode !== originalUserData.regionCode) {
              changedFields.regionCode = currentData.regionCode;
            }
            // Only include branchCode if it changed
            if (currentData.branchCode !== originalUserData.branchCode) {
              changedFields.branchCode = currentData.branchCode;
            }
            // Only include sameAsRegisteredAddress for IU users when user actually changed office address
            if (
              (userRole === 'INSTITUTIONAL_USER' || userRole === 'IU') &&
              officeAddressUserInteracted &&
              formData.sameAsRegisteredAddress &&
              formData.sameAsRegisteredAddress !==
                originalUserData.sameAsRegisteredAddress
            ) {
              changedFields.sameAsRegisteredAddress =
                formData.sameAsRegisteredAddress;
            }
          }

          const result = await dispatch(
            modifyUser({
              userId: id,
              requestData: changedFields as ModifyUserRequest,
            })
          );

          if (modifyUser.fulfilled.match(result)) {
            setSuccessMessage('Submitted for approval');
            setShowSuccessModal(true);
          } else if (modifyUser.rejected.match(result)) {
            const errorPayload = result.payload as
              | { message: string; fieldErrors?: Record<string, string> }
              | string
              | undefined;

            let errorMessage = 'Unknown error';
            let fieldErrors: Record<string, string> | undefined;

            if (typeof errorPayload === 'object' && errorPayload !== null) {
              errorMessage = errorPayload.message || 'Failed to modify user';
              fieldErrors = errorPayload.fieldErrors;
            } else if (typeof errorPayload === 'string') {
              errorMessage = errorPayload;
            }

            // Map API field names to form field names
            const fieldNameMap: Record<string, string> = {
              mobile: 'mobileNumber',
              email: 'email',
              firstName: 'firstName',
              lastName: 'lastName',
              middleName: 'middleName',
              proofOfIdentity: 'proofOfIdentity',
              proofOfIdentityNumber: 'proofOfIdentityNumber',
              dob: 'dateOfBirth',
              designation: 'designation',
              employeeCode: 'employeeCode',
              ckycNumber: 'ckycNo',
              citizenship: 'citizenship',
            };

            // Set field-specific errors if available
            if (fieldErrors) {
              const formErrors: Record<string, string> = {};
              Object.entries(fieldErrors).forEach(([apiField, message]) => {
                const formField = fieldNameMap[apiField] || apiField;
                formErrors[formField] = message;
              });
              setErrors((prev) => {
                const updated = { ...prev, ...formErrors };
                return updated;
              });
            }

            setErrorMessage(`${errorMessage}`);
            setShowErrorModal(true);
          }
        } else {
          let countryCodeForApi = formData.countryCode || '';

          if (countryCodeForApi && !countryCodeForApi.startsWith('+')) {
            // If it doesn't start with "+", try to find the dial code
            if (phoneCountries.length > 0) {
              const selectedPhoneCountry = phoneCountries.find(
                (c) =>
                  c.code === countryCodeForApi ||
                  c.code === countryCodeForApi.toUpperCase()
              );
              if (selectedPhoneCountry && selectedPhoneCountry.countryCode) {
                countryCodeForApi = selectedPhoneCountry.countryCode;
              }
            }
          }

          // Add space at the end if not present
          if (countryCodeForApi && !countryCodeForApi.endsWith(' ')) {
            countryCodeForApi = countryCodeForApi + ' ';
          }

          let citizenshipValue = formData.citizenship;

          if (citizenshipValue && citizenshipValue.startsWith('+')) {
            const countryByDialCode = phoneCountries.find(
              (c) => c.countryCode === citizenshipValue
            );
            if (countryByDialCode) {
              // Try to find citizenship option that matches the country name
              const matchingCitizenship = citizenshipOptions.find(
                (c) =>
                  c.label?.toLowerCase() ===
                  countryByDialCode.name.toLowerCase()
              );
              if (matchingCitizenship && matchingCitizenship.value) {
                citizenshipValue = matchingCitizenship.value;
              } else {
                // Fallback: use country name as citizenship
                citizenshipValue = countryByDialCode.name || '';
              }
            } else {
              // Try to find in citizenship options by matching label
              const matchingCitizenship = citizenshipOptions.find((c) =>
                c.label
                  ?.toLowerCase()
                  .includes(citizenshipValue.replace('+', '').trim())
              );
              if (matchingCitizenship && matchingCitizenship.value) {
                citizenshipValue = matchingCitizenship.value;
              }
            }
          } else {
            const citizenshipOption = citizenshipOptions.find(
              (c) =>
                c.value === citizenshipValue || c.label === citizenshipValue
            );
            if (citizenshipOption && citizenshipOption.value) {
              // Use the value from options (should be country name)
              citizenshipValue = citizenshipOption.value;
            }
          }

          const userRequestData: CreateSubUserRequest = {
            role: getRoleCode(userRole),
            citizenship: citizenshipValue,
            ckycNumber: formData.ckycNo,
            title: formData.title,
            firstName: formData.firstName,
            middleName: formData.middleName || '',
            lastName: formData.lastName,
            designation: formData.designation,
            email: formData.email,
            countryCode: countryCodeForApi,
            mobile: formData.mobileNumber,
            proofOfIdentity: formData.proofOfIdentity,
            proofOfIdentityNumber: formData.proofOfIdentityNumber,
            dob: formData.dateOfBirth,
            gender: formData.gender,
            employeeCode: formData.employeeCode,
          };

          // Add role-specific fields
          if (
            userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
            userRole === 'IRA' ||
            userRole === 'INSTITUTIONAL_REGIONAL_USER' ||
            userRole === 'IRU'
          ) {
            userRequestData.regionCode = getRegionCode(selectedRegion);
          }

          if (userRole === 'INSTITUTIONAL_BRANCH_USER' || userRole === 'IBU') {
            userRequestData.regionCode = getRegionCode(selectedRegion);
            // selectedBranch already contains the branchCode
            userRequestData.branchCode = selectedBranch || '';
          }

          if (userRole === 'INSTITUTIONAL_USER' || userRole === 'IU') {
            userRequestData.sameAsRegisteredAddress =
              formData.officeAddress === 'registered' ? 'true' : 'false';
          }

          const result = await dispatch(createSubUser(userRequestData));

          if (createSubUser.fulfilled.match(result)) {
            // Success - show success modal with backend message
            setSuccessMessage('Submitted for approval');
            setShowSuccessModal(true);
          } else if (createSubUser.rejected.match(result)) {
            // Handle error - show error modal and field errors

            // Extract error message and field errors
            const errorPayload = result.payload as
              | { message: string; fieldErrors?: Record<string, string> }
              | string
              | undefined;

            let errorMessage = 'Unknown error';
            let fieldErrors: Record<string, string> | undefined;

            if (typeof errorPayload === 'object' && errorPayload !== null) {
              errorMessage = errorPayload.message || 'Failed to create user';
              fieldErrors = errorPayload.fieldErrors;
            } else if (typeof errorPayload === 'string') {
              errorMessage = errorPayload;
            }

            // Map API field names to form field names
            const fieldNameMap: Record<string, string> = {
              mobile: 'mobileNumber',
              email: 'email',
              firstName: 'firstName',
              lastName: 'lastName',
              middleName: 'middleName',
              proofOfIdentity: 'proofOfIdentity',
              proofOfIdentityNumber: 'proofOfIdentityNumber',
              dob: 'dateOfBirth',
              designation: 'designation',
              employeeCode: 'employeeCode',
              ckycNumber: 'ckycNo',
              citizenship: 'citizenship',
            };

            // Set field-specific errors if available
            if (fieldErrors) {
              const formErrors: Record<string, string> = {};
              Object.entries(fieldErrors).forEach(([apiField, message]) => {
                const formField = fieldNameMap[apiField] || apiField;
                formErrors[formField] = message;
              });
              setErrors((prev) => {
                const updated = { ...prev, ...formErrors };
                return updated;
              });
            }

            setErrorMessage(`${errorMessage}`);
            setShowErrorModal(true);
          }
        }
      } catch {
        setErrorMessage('Error in form submission');
        setShowErrorModal(true);
      }
    }
  };

  const handleRegionChange = (event: SelectChangeEvent) => {
    const regionName = event.target.value;
    setSelectedRegion(regionName);
    regionManuallyChangedRef.current = true; // Mark as manually changed
    setRegionUserInteracted(true); // Track user interaction
    setSelectedBranch(''); // Reset branch when region changes

    // Find the selected region to get its ID and address data
    const selectedRegionData = regions.find((r) => r.regionName === regionName);

    // Fetch region address details for IRA and IRU roles
    if (
      (userRole === 'IRA' ||
        userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
        userRole === 'IRU' ||
        userRole === 'INSTITUTIONAL_REGIONAL_USER') &&
      selectedRegionData?.regionCode
    ) {
      setLoadingRegionAddress(true);
      dispatch(fetchRegionByCode(selectedRegionData.regionCode))
        .unwrap()
        .then((data: SingleRegionData) => {
          setRegionAddressDetails(data);
          setLoadingRegionAddress(false);

          // Update address fields from fetched region data for IRA and IRU
          const getValue = (value: string | null | undefined): string => {
            if (value === null || value === undefined || value === 'null') {
              return '';
            }
            return String(value);
          };

          if (data.address) {
            const address = data.address;
            setFormData((prev) => ({
              ...prev,
              addressLine1: getValue(address.line1),
              addressLine2: getValue(address.line2),
              addressLine3: getValue(address.line3),
              city: getValue(address.cityTown),
              state: getValue(address.state),
              district: getValue(address.district),
              addressCountryCode: getValue(address.countryCode) || 'IN',
              pinCode: getValue(address.pinCode),
              otherPinCode: getValue(address.alternatePinCode),
              digipin: getValue(address.digiPin),
            }));

            // Update location state variables
            setSelectedCountry(getValue(address.countryCode) || 'IN');
            setSelectedState(getValue(address.state));
            setSelectedDistrict(getValue(address.district));
            setSelectedCity(getValue(address.cityTown));
            setPincode(getValue(address.pinCode));
          }
        })
        .catch((error: unknown) => {
          console.error('Failed to fetch region address:', error);
          setRegionAddressDetails(null);
          setLoadingRegionAddress(false);
        });
    } else {
      setRegionAddressDetails(null);
    }
    const getValue = (value: string | null | undefined): string => {
      if (value === null || value === undefined || value === 'null') {
        return '';
      }
      return String(value);
    };
    const isRegionalUser =
      userRole === 'IRA' ||
      userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
      userRole === 'IRU' ||
      userRole === 'INSTITUTIONAL_REGIONAL_USER';

    if (selectedRegionData && selectedRegionData.address && !isRegionalUser) {
      const address = selectedRegionData.address;

      setFormData((prev) => ({
        ...prev,
        addressLine1: getValue(address.line1),
        addressLine2: getValue(address.line2),
        addressLine3: getValue(address.line3),
        city: getValue(address.city),
        state: getValue(address.state),
        district: getValue(address.district),
        addressCountryCode: getValue(address.countryCode) || 'IN',
        pinCode: getValue(address.pinCode),
        otherPinCode: getValue(address.alternatePinCode),
        digipin: getValue(address.digiPin),
      }));

      // Update location state variables
      setSelectedCountry(getValue(address.countryCode) || 'IN');
      setSelectedState(getValue(address.state));
      setSelectedDistrict(getValue(address.district));
      setSelectedCity(getValue(address.city));
      setPincode(getValue(address.pinCode));
    } else if (!isRegionalUser) {
      // Clear address fields if no region is selected (but not for IRA users)
      setFormData((prev) => ({
        ...prev,
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        district: '',
        addressCountryCode: 'IN',
        pinCode: '',
        otherPinCode: '',
        digipin: '',
      }));

      // Reset location state variables
      setSelectedCountry('IN');
      setSelectedState('');
      setSelectedDistrict('');
      setSelectedCity('');
      setPincode('');
    }

    if (
      (userRole === 'INSTITUTIONAL_BRANCH_USER' || userRole === 'IBU') &&
      regionName &&
      selectedRegionData
    ) {
      // Fetch branches for the selected region using regionId
      dispatch(fetchBranches({ regionId: selectedRegionData.id }));
    }
  };

  const handleBranchChange = (event: SelectChangeEvent) => {
    const branchCode = event.target.value;
    setSelectedBranch(branchCode);
    branchManuallyChangedRef.current = true; // Mark as manually changed
    setBranchUserInteracted(true); // Track user interaction
    // Address update will be handled by useEffect that watches selectedBranch
  };

  const handleSuspendClick = () => {
    setShowSuspendModal(true);
  };

  const handleDeactivateClick = () => {
    setShowDeactivateModal(true);
  };

  // Handle success modal close - navigate to track user status page
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
    // Redirect to track user status page
    navigate('/re/track-user-status');
  };

  // Handle error modal close
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const breadCrumbsList = useMemo(
    () => [
      {
        label: 'User Management',
        path: '/re/dashboard',
      },
      {
        label: 'User',
        path: '/re/modify-user',
      },
    ],
    []
  );

  const [crumbsData, setCrumbsData] = useState<ICrumbs[]>(breadCrumbsList);

  useEffect(() => {
    const { pathname } = location;

    // Create base breadcrumb with conditional path for "User"
    const baseBreadcrumb = [
      {
        label: 'User Management',
        path: '/re/dashboard',
      },
      {
        label: 'User',
        // Only redirect to track-user-status if on track status page
        path: track ? '/re/track-user-status' : '/re/modify-user',
      },
    ];

    if (pathname.includes('create-new-user')) {
      setCrumbsData([...baseBreadcrumb, { label: 'Create' }]);
    } else if (
      pathname.includes('modify-user') &&
      !deactivate &&
      !suspend &&
      !revoke &&
      !track
    ) {
      setCrumbsData([
        ...baseBreadcrumb,
        { label: 'Modify', path: '/re/modify-user' },
        { label: 'User Details' },
      ]);
    } else if (pathname.includes('modify-user') && deactivate) {
      setCrumbsData([
        {
          label: 'User Management',
          path: '/re/dashboard',
        },
        {
          label: 'User',
          path: '/re/modify-user',
        },
        { label: 'De-activate', path: '/re/deactivate-user' },
        { label: 'User Details' },
      ]);
    } else if (pathname.includes('modify-user') && suspend) {
      setCrumbsData([
        {
          label: 'User Management',
          path: '/re/dashboard',
        },
        {
          label: 'User',
          path: '/re/modify-user',
        },
        { label: 'Suspend', path: '/re/suspend-user' },
        { label: 'User Details' },
      ]);
    } else if (pathname.includes('modify-user') && revoke) {
      setCrumbsData([
        {
          label: 'User Management',
          path: '/re/dashboard',
        },
        {
          label: 'User',
          path: '/re/modify-user',
        },
        { label: 'Revoke Suspension', path: '/re/revoke-suspension' },
        { label: 'User Details' },
      ]);
    } else if (pathname.includes('modify-user') && track) {
      setCrumbsData([
        ...baseBreadcrumb,
        { label: 'Track Status', path: '/re/track-user-status' },
        { label: 'User Details' },
      ]);
    }
  }, [breadCrumbsList, deactivate, location, revoke, suspend, track]);

  const handleCkycVerification = () => {
    setIsCkycVerified(true);
    setIsAllFieldsDisabled(false);
  };

  return (
    <MainContainer maxWidth={false}>
      {/* Header with Breadcrumb and Back Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <NavigationBreadCrumb crumbsData={crumbsData} />
        {isModifyMode && (
          <BackButton
            startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 0,
              ml: 'auto',
            }}
          >
            Back
          </BackButton>
        )}
      </Box>

      {track &&
        status &&
        (() => {
          const approval =
            workflowData?.payload?.approvalWorkflow?.approvals?.[0];
          const normalizedStatus =
            status === 'APPROVED'
              ? 'Approved'
              : status === 'REJECTED'
                ? 'Rejected'
                : status;

          return (
            <StatusScreen
              status={normalizedStatus}
              approvedBy={
                normalizedStatus === 'Approved' && approval
                  ? formatApprovedBy(
                      approval.actionByUserName,
                      approval.actionBy
                    )
                  : undefined
              }
              approvedOn={
                normalizedStatus === 'Approved' && approval
                  ? DateUtils.formatDate(approval.actionDateTime)
                  : undefined
              }
              rejectedBy={
                normalizedStatus === 'Rejected' && approval
                  ? formatApprovedBy(
                      approval.actionByUserName,
                      approval.actionBy
                    )
                  : undefined
              }
              rejectedOn={
                normalizedStatus === 'Rejected' && approval
                  ? DateUtils.formatDate(approval.actionDateTime)
                  : undefined
              }
              remark={
                normalizedStatus === 'Rejected' && approval
                  ? approval.remarks
                  : undefined
              }
            />
          );
        })()}

      <ContentWrapper>
        <PageTitle variant="h6" gutterBottom>
          {isSuspendedMode
            ? 'Revoke User Suspension'
            : isModifyMode
              ? 'User Details'
              : 'Create User'}
        </PageTitle>

        {/* Suspension Status Display - Only for revoke suspension mode or when user is suspended */}
        {(isRevokeMode ||
          status === 'SUSPENDED' ||
          (fetchedUserData as { status?: string })?.status === 'SUSPENDED') && (
          <Box
            sx={{
              mb: 3,
              p: 3,
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            {suspensionDetailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Typography
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                    color: '#666666',
                  }}
                >
                  Loading suspension details...
                </Typography>
              </Box>
            ) : suspensionDetailsError ? (
              <Box sx={{ py: 2 }}>
                <Typography
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                    color: '#d32f2f',
                  }}
                >
                  Failed to load suspension details
                </Typography>
              </Box>
            ) : suspensionDetails ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#666666',
                      mb: 1,
                    }}
                  >
                    Suspended by
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#1A1A1A',
                    }}
                  >
                    {suspensionDetails.suspendedByName} [
                    {suspensionDetails.suspendedBy}]
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#666666',
                      mb: 1,
                    }}
                  >
                    Suspended on
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#1A1A1A',
                    }}
                  >
                    {DateUtils.formatDate(suspensionDetails.suspendedOn)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#666666',
                      mb: 1,
                    }}
                  >
                    Suspension Remark
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#1A1A1A',
                    }}
                  >
                    {suspensionDetails.suspensionRemark || '-'}
                  </Typography>
                </Box>
              </Box>
            ) : null}
          </Box>
        )}

        {/* Error display for fetch user in modify/suspended mode */}
        {(isModifyMode || isSuspendedMode) && fetchUserError && (
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

        {/* Loading indicator for fetch user in modify/suspended mode */}
        {(isModifyMode || isSuspendedMode) &&
          fetchUserLoading &&
          !(workflowData && track) &&
          !fetchedUserData && (
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

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            width: '100%',
          }}
        >
          {/* User Role Field */}
          <div style={{ width: 'calc(33.333% - 16px)', minWidth: '280px' }}>
            <StyledFormControl fullWidth required>
              <FieldLabel>User Role</FieldLabel>
              <Select
                name="userRole"
                value={userRole}
                displayEmpty
                onChange={handleRoleChange}
                IconComponent={CustomArrowIcon}
                disabled={
                  isSuspendedMode ||
                  isSuspendMode ||
                  isRevokeMode ||
                  userRolesLoading ||
                  (workflowData && track) ||
                  isDeactivateMode
                }
                sx={{
                  '& .MuiSelect-select': {
                    py: '12px',
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
                  '&.Mui-disabled': {
                    backgroundColor: '#F6F6F6',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D1D1',
                    },
                    '& .MuiSelect-select': {
                      backgroundColor: '#F6F6F6',
                      color: '#1A1A1A',
                      WebkitTextFillColor: '#1A1A1A',
                    },
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography
                        style={{
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: 'rgba(0, 0, 0, 0.6)',
                        }}
                      >
                        {userRolesLoading
                          ? 'Loading roles...'
                          : 'Select User Role'}
                      </Typography>
                    );
                  }
                  return getRoleLabel(selected);
                }}
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
                ) : userRolesData && userRolesData.length > 0 ? (
                  userRolesData
                    .filter((roleObj) => {
                      // Filter based on logged-in user's group membership
                      if (
                        groupMembership &&
                        groupMembership.includes(
                          USER_ROLES.INSTITUTIONAL_ADMIN_USER
                        )
                      ) {
                        // Show only IU & IRA for Institutional_Admin_User
                        return roleObj.role === 'IU' || roleObj.role === 'IRA';
                      } else if (
                        groupMembership &&
                        groupMembership.includes('Institutional_Regional_Admin')
                      ) {
                        // Show only IBU & IRU for Institutional_Regional_Admin
                        return roleObj.role === 'IBU' || roleObj.role === 'IRU';
                      }
                      // Default: show all roles if group membership is not recognized
                      return (
                        roleObj.role === 'IU' ||
                        roleObj.role === 'IRA' ||
                        roleObj.role === 'IBU' ||
                        roleObj.role === 'IRU'
                      );
                    })
                    .map((roleObj) => (
                      <StyledMenuItem key={roleObj.role} value={roleObj.role}>
                        {toTitleCase(roleObj.roleFullForm)} [{roleObj.role}]
                      </StyledMenuItem>
                    ))
                ) : (
                  <StyledMenuItem disabled>
                    No user roles available
                  </StyledMenuItem>
                )}
              </Select>
            </StyledFormControl>
          </div>

          {/* Region Field - Always Rendered */}
          <div style={{ width: 'calc(33.333% - 16px)', minWidth: '280px' }}>
            {track ? (
              // Show as TextField when Track Status mode - Only show meta_data value
              <Box sx={{ width: '100%' }}>
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
                  Region Name
                </Typography>
                <TextField
                  fullWidth
                  value={workflowData?.meta_data?.region || '-'}
                  disabled={true}
                  InputProps={{
                    sx: {
                      height: '45px',
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '&.Mui-disabled input': {
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              <StyledFormControl
                fullWidth
                required={
                  userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
                  userRole === 'IRA' ||
                  userRole === 'INSTITUTIONAL_REGIONAL_USER' ||
                  userRole === 'IRU' ||
                  userRole === 'INSTITUTIONAL_BRANCH_USER' ||
                  userRole === 'IBU'
                }
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
                    ...(userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
                    userRole === 'IRA' ||
                    userRole === 'INSTITUTIONAL_REGIONAL_USER' ||
                    userRole === 'IRU' ||
                    userRole === 'INSTITUTIONAL_BRANCH_USER' ||
                    userRole === 'IBU'
                      ? {
                          '&:after': {
                            content: '" *"',
                            color: 'error.main',
                          },
                        }
                      : {}),
                  }}
                >
                  Region Name
                </Typography>
                <Select
                  id="region"
                  value={selectedRegion}
                  displayEmpty
                  IconComponent={CustomArrowIcon}
                  onChange={handleRegionChange}
                  disabled={
                    !(
                      userRole === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
                      userRole === 'IRA' ||
                      userRole === 'INSTITUTIONAL_BRANCH_USER' ||
                      userRole === 'IBU' ||
                      userRole === 'INSTITUTIONAL_REGIONAL_USER' ||
                      userRole === 'IRU'
                    ) ||
                    isSuspendedMode ||
                    isSuspendMode ||
                    isRevokeMode ||
                    (workflowData && track) ||
                    isDeactivateMode
                  }
                  sx={{
                    '& .MuiSelect-select': {
                      py: '12px',
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
                    '&.Mui-disabled': {
                      backgroundColor: '#F6F6F6',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '& .MuiSelect-select': {
                        backgroundColor: '#F6F6F6',
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
                      },
                    },
                  }}
                  renderValue={(selected) =>
                    selected ? (
                      Array.isArray(regions) ? (
                        regions.find((r) => r.regionName === selected)
                          ?.regionName
                      ) : (
                        selected
                      )
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
                  ) : Array.isArray(regions) && regions.length > 0 ? (
                    regions.map((region) => (
                      <StyledMenuItem
                        key={region.regionCode}
                        value={region.regionName}
                      >
                        {region.regionName}
                      </StyledMenuItem>
                    ))
                  ) : (
                    <StyledMenuItem disabled>
                      No regions available
                    </StyledMenuItem>
                  )}
                </Select>
              </StyledFormControl>
            )}
          </div>

          {/* Branch Field - Always Rendered */}
          <div style={{ width: 'calc(33.333% - 16px)', minWidth: '280px' }}>
            {track ? (
              // Show as TextField when Track Status mode - Only show meta_data value
              <Box sx={{ width: '100%' }}>
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
                  Branch Name
                </Typography>
                <TextField
                  fullWidth
                  value={workflowData?.meta_data?.branch || '-'}
                  disabled={true}
                  InputProps={{
                    sx: {
                      height: '45px',
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '&.Mui-disabled input': {
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              <StyledFormControl
                fullWidth
                sx={{ width: '100%' }}
                required={
                  userRole === 'INSTITUTIONAL_BRANCH_USER' || userRole === 'IBU'
                }
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
                    ...(userRole === 'INSTITUTIONAL_BRANCH_USER' ||
                    userRole === 'IBU'
                      ? {
                          '&:after': {
                            content: '" *"',
                            color: 'error.main',
                          },
                        }
                      : {}),
                  }}
                >
                  Branch Name
                </Typography>
                <Select
                  id="branch"
                  value={selectedBranch}
                  displayEmpty
                  IconComponent={CustomArrowIcon}
                  disabled={
                    !(
                      userRole === 'INSTITUTIONAL_BRANCH_USER' ||
                      userRole === 'IBU'
                    ) ||
                    !selectedRegion ||
                    isSuspendedMode ||
                    isSuspendMode ||
                    isRevokeMode ||
                    (workflowData && track) ||
                    isDeactivateMode
                  }
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
                    '&.Mui-disabled': {
                      backgroundColor: '#F6F6F6',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '& .MuiSelect-select': {
                        backgroundColor: '#F6F6F6',
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
                      },
                    },
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
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
                      );
                    }
                    // First try to find in branches array
                    const branchFromList = branches.find(
                      (b) => b.branchCode === selected
                    )?.branchName;
                    // If not found in list, use formData.branchName as fallback (for IBU modify mode)
                    return branchFromList || formData.branchName || selected;
                  }}
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
            )}
          </div>
        </div>

        {/* Region Address Details - Only show for IRA role when region is selected */}
        {/* {(userRole === 'IRA' || userRole === 'INSTITUTIONAL_REGIONAL_ADMIN') && selectedRegion && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#F9F9F9', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
            <Typography
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: '#1A1A1A',
                mb: 2,
              }}
            >
              Region Address Details
            </Typography>
            {loadingRegionAddress ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px' }}>
                  Loading region address...
                </Typography>
              </Box>
            ) : regionAddressDetails ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '12px', color: '#666', mb: 0.5 }}>
                    Address Line 1
                  </Typography>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px', color: '#1A1A1A' }}>
                    {regionAddressDetails.address?.line1 || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '12px', color: '#666', mb: 0.5 }}>
                    City
                  </Typography>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px', color: '#1A1A1A' }}>
                    {regionAddressDetails.address?.cityTown || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '12px', color: '#666', mb: 0.5 }}>
                    State
                  </Typography>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px', color: '#1A1A1A' }}>
                    {regionAddressDetails.address?.state || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '12px', color: '#666', mb: 0.5 }}>
                    District
                  </Typography>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px', color: '#1A1A1A' }}>
                    {regionAddressDetails.address?.district || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '12px', color: '#666', mb: 0.5 }}>
                    Pin Code
                  </Typography>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px', color: '#1A1A1A' }}>
                    {regionAddressDetails.address?.pinCode || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '12px', color: '#666', mb: 0.5 }}>
                    Country
                  </Typography>
                  <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px', color: '#1A1A1A' }}>
                    {regionAddressDetails.address?.countryCode || '-'}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ fontFamily: 'Gilroy, sans-serif', fontSize: '14px', color: '#666' }}>
                No address details available for this region
              </Typography>
            )}
          </Box>
        )} */}

        <CollapsibleSection
          title="User Details"
          defaultExpanded={true}
          sx={{ mt: 4 }}
        >
          <form onSubmit={handleSubmit}>
            <FormRow>
              {/* Row 1: Citizenship | CKYC Number | Title */}
              <div>
                <StyledFormControl
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
                    disabled={
                      isDropdownLoading ||
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      isCkycVerified ||
                      track ||
                      isDeactivateMode
                    }
                    renderValue={(selected) => {
                      if (!selected) return 'Select Citizenship';
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
                </StyledFormControl>
              </div>

              <div>
                <Box width="100%">
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.ckycNo ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after': !isNonIndianCitizenship()
                        ? {
                            content: '" *"',
                            color: 'error.main',
                          }
                        : {},
                    }}
                  >
                    CKYC Number
                  </Typography>
                  <CkycNumberField
                    name="ckycNo"
                    value={formData.ckycNo}
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
                        !isModifyMode &&
                        !isSuspendedMode
                    )}
                    onVerificationSuccess={handleCkycVerificationSuccess}
                    verifyDisabled={formData.ckycNo.length !== 14}
                    disabled={
                      isModifyMode ||
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      isCkycVerified ||
                      track ||
                      isDeactivateMode ||
                      !formData.citizenship ||
                      isNonIndianCitizenship()
                    }
                    error={!!errors.ckycNo}
                    helperText={errors.ckycNo}
                    placeholder="Enter CKYC number"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
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
                <StyledFormControl
                  fullWidth
                  sx={{ width: '100%' }}
                  required
                  error={!!errors.title}
                >
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
                  <Select
                    name="title"
                    value={formData.title}
                    onChange={handleSelectChange}
                    IconComponent={CustomArrowIcon}
                    displayEmpty
                    disabled={
                      isDropdownLoading ||
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      track ||
                      isDeactivateMode ||
                      (!isModifyMode &&
                        !id &&
                        isCkycVerified &&
                        !isNonIndianCitizenship()) ||
                      !isNonIndianCitizenship() // Disable when Indian citizenship is selected
                    }
                    renderValue={(selected) => {
                      if (isDropdownLoading) return 'Loading...';
                      return selected || 'Select Title';
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
                        {isDropdownLoading ? 'Loading...' : 'Select Title'}
                      </em>
                    </MenuItem>
                    {isDropdownLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading options...
                      </MenuItem>
                    ) : (
                      titleOptions.map((title: DropdownOption) => (
                        <MenuItem key={title.value} value={title.value}>
                          {title.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <FormHelperText>{errors.title}</FormHelperText>
                </StyledFormControl>
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
                      mb: 1,
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
                    inputProps={{ maxLength: 33 }}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    placeholder="Enter first name"
                    disabled={
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      track ||
                      isDeactivateMode ||
                      (!isModifyMode &&
                        !id &&
                        isCkycVerified &&
                        !isNonIndianCitizenship()) ||
                      !isNonIndianCitizenship() // Disable when Indian citizenship is selected
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                          '& fieldset': {
                            borderColor: '#D1D1D1',
                          },
                          '& input': {
                            color: '#1A1A1A',
                            WebkitTextFillColor: '#1A1A1A',
                          },
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
                    inputProps={{ maxLength: 33 }}
                    onChange={handleInputChange}
                    error={!!errors.middleName}
                    helperText={errors.middleName}
                    placeholder="Enter middle name"
                    disabled={
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      track ||
                      isDeactivateMode ||
                      (!isModifyMode &&
                        !id &&
                        isCkycVerified &&
                        !isNonIndianCitizenship()) ||
                      !isNonIndianCitizenship() // Disable when Indian citizenship is selected
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                          '& fieldset': {
                            borderColor: '#D1D1D1',
                          },
                          '& input': {
                            color: '#1A1A1A',
                            WebkitTextFillColor: '#1A1A1A',
                          },
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
                    }}
                  >
                    Last Name123
                  </Typography>
                  <TextField
                    fullWidth
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    inputProps={{ maxLength: 33 }}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    placeholder="Enter last name"
                    disabled={
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      track ||
                      isDeactivateMode ||
                      (!isModifyMode &&
                        !id &&
                        isCkycVerified &&
                        !isNonIndianCitizenship()) ||
                      !isNonIndianCitizenship() // Disable when Indian citizenship is selected
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
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
                </Box>
              </div>

              {/* Row 3: Gender | Date of Birth | Designation */}
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
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      disabled={
                        isDropdownLoading ||
                        isSuspendedMode ||
                        isSuspendMode ||
                        isRevokeMode ||
                        track ||
                        isDeactivateMode ||
                        (!isModifyMode &&
                          !id &&
                          isCkycVerified &&
                          !isNonIndianCitizenship()) ||
                        !isNonIndianCitizenship() // Disable when Indian citizenship is selected
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
                            Select Gender
                          </Typography>
                        );
                      }}
                    >
                      {genderOptions.map((gender: DropdownOption) => (
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
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth}
                    InputLabelProps={{ shrink: true }}
                    disabled={
                      isDeactivateMode || isSuspendMode || isRevokeMode || track
                    }
                    inputProps={{
                      style: {
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                          '& fieldset': {
                            borderColor: '#D1D1D1',
                          },
                          '& input': {
                            color: '#1A1A1A',
                            WebkitTextFillColor: '#1A1A1A',
                          },
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
                    placeholder="Enter designation"
                    disabled={
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      track ||
                      isDeactivateMode
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                          '& fieldset': {
                            borderColor: '#D1D1D1',
                          },
                          '& input': {
                            color: '#1A1A1A',
                            WebkitTextFillColor: '#1A1A1A',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </div>

              {/* Row 4: Employee Code | Email | Country Code */}
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
                    onBlur={handleFieldBlur}
                    error={!!errors.employeeCode}
                    helperText={errors.employeeCode}
                    placeholder="Enter employee code"
                    disabled={
                      isSuspendedMode ||
                      track ||
                      (workflowData && track) ||
                      isDeactivateMode ||
                      isSuspendMode ||
                      isRevokeMode
                    }
                    inputProps={{ maxLength: 20 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                          '& fieldset': {
                            borderColor: '#D1D1D1',
                          },
                          '& input': {
                            color: '#1A1A1A',
                            WebkitTextFillColor: '#1A1A1A',
                          },
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
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 255 }}
                    onBlur={handleFieldBlur}
                    error={!!errors.email}
                    helperText={errors.email || ' '}
                    placeholder="Enter email address"
                    disabled={
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      track ||
                      isDeactivateMode
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                          '& fieldset': {
                            borderColor: '#D1D1D1',
                          },
                          '& input': {
                            color: '#1A1A1A',
                            WebkitTextFillColor: '#1A1A1A',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </div>

              <div>
                <Box sx={{ width: '100%' }}>
                  <FormControl fullWidth error={!!errors.countryCode}>
                    <Typography
                      component="label"
                      sx={{
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: errors.countryCode ? 'error.main' : '#000',
                        display: 'block',
                        mb: 1,
                        '&:after': {
                          content: '" *"',
                          color: 'error.main',
                        },
                      }}
                    >
                      Country Code
                    </Typography>
                    <Select
                      name="countryCode"
                      disabled={true} // Always disabled
                      inputProps={{ name: 'countryCode' }}
                      value={formData.countryCode ?? ''}
                      onChange={handleSelectChange}
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      sx={{
                        height: '45px',
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#002CBA',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#D1D1D1',
                          },
                          '& .MuiSelect-select': {
                            backgroundColor: '#F6F6F6',
                            color: '#1A1A1A',
                            WebkitTextFillColor: '#1A1A1A',
                          },
                        },
                      }}
                      renderValue={(value) => {
                        const v = String(value ?? '').trim();
                        if (!v) {
                          return (
                            <em style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                              +00 | Select country
                            </em>
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

              {/* Row 5: Mobile Number | Proof of Identity | Proof of Identity Number */}
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
                      isDeactivateMode || isSuspendMode || isRevokeMode || track
                    }
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber || ''}
                    inputProps={{
                      inputMode: 'numeric', // mobile number keypad
                      pattern: '[0-9]*', // hint numeric keypad on iOS
                      maxLength:
                        formData.countryCode.trim() === '+91' ? 10 : 15, // dynamic cap
                    }}
                    placeholder={
                      formData.countryCode.trim() === '+91'
                        ? 'Enter 10 digits number'
                        : 'Enter up to 15 digits number'
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#002CBA',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                          '& fieldset': {
                            borderColor: '#D1D1D1',
                          },
                          '& input': {
                            color: '#1A1A1A',
                            WebkitTextFillColor: '#1A1A1A',
                          },
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
                      name="proofOfIdentity"
                      value={formData.proofOfIdentity}
                      onChange={handleSelectChange}
                      IconComponent={CustomArrowIcon}
                      displayEmpty
                      disabled={
                        isDropdownLoading ||
                        isSuspendedMode ||
                        track ||
                        isDeactivateMode ||
                        isSuspendMode ||
                        isRevokeMode
                      }
                      renderValue={(selected) => {
                        if (isDropdownLoading) return 'Loading...';
                        if (selected) {
                          const selectedOption = proofOfIdentityOptions.find(
                            (option) => option.value === selected
                          );
                          return selectedOption
                            ? selectedOption.label
                            : selected;
                        }
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
                    error={!!errors.proofOfIdentityNumber}
                    inputProps={{
                      maxLength: maxLengthByIdType[formData.proofOfIdentity],
                    }}
                    helperText={errors.proofOfIdentityNumber}
                    placeholder="Enter Proof of identity number"
                    disabled={
                      isSuspendedMode ||
                      track ||
                      isDeactivateMode ||
                      isSuspendMode ||
                      isRevokeMode
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          textTransform: 'uppercase',
                          '&::placeholder': {
                            textTransform: 'none',
                          },
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
          sx={{ mt: 4 }}
        >
          <form>
            {/* Office Address - Only show for Institutional User */}
            {userRole === 'IU' && (
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
                      handleSelectChange(e);
                    }}
                    displayEmpty
                    disabled={
                      (workflowData && track) ||
                      isDeactivateMode ||
                      isRevokeMode
                    }
                    IconComponent={CustomArrowIcon}
                    sx={{
                      height: '45px',
                      '& .MuiOutlinedInput-root': {
                        '& .MuiSelect-select': {
                          py: '12px',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        },
                      },
                    }}
                  >
                    {officeAddressLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading address data...
                      </MenuItem>
                    ) : officeAddressError ? (
                      <MenuItem disabled>
                        <Typography
                          sx={{
                            fontFamily: 'Gilroy, sans-serif',
                            fontSize: '14px',
                            color: 'error.main',
                          }}
                        >
                          Error loading addresses
                        </Typography>
                      </MenuItem>
                    ) : officeAddressData && officeAddressData.length > 0 ? (
                      // Dynamically show only available address types from API
                      officeAddressData
                        .filter(
                          (address) =>
                            address.address_type || address.addressType
                        )
                        .map((address) => {
                          const addressType = (address.address_type ||
                            address.addressType)!;
                          return (
                            <MenuItem
                              key={addressType.toLowerCase()}
                              value={addressType.toLowerCase()}
                            >
                              <Typography
                                sx={{
                                  fontFamily: 'Gilroy, sans-serif',
                                  fontSize: '14px',
                                  fontWeight: 400,
                                }}
                              >
                                {addressType === 'REGISTERED'
                                  ? 'Registered Address'
                                  : 'Correspondence Address'}
                              </Typography>
                            </MenuItem>
                          );
                        })
                    ) : (
                      <MenuItem disabled>
                        <Typography
                          sx={{
                            fontFamily: 'Gilroy, sans-serif',
                            fontSize: '14px',
                            color: 'rgba(0, 0, 0, 0.6)',
                          }}
                        >
                          No addresses available
                        </Typography>
                      </MenuItem>
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
                  error={!!errors.addressLine1}
                  helperText={errors.addressLine1}
                  placeholder="Enter address line 1"
                  disabled={true}
                  InputProps={{
                    sx: {
                      height: '45px',
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '&.Mui-disabled input': {
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
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
                  onChange={handleInputChange}
                  placeholder="Enter address line 2"
                  disabled={true}
                  InputProps={{
                    sx: {
                      height: '45px',
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '&.Mui-disabled input': {
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
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
                  onChange={handleInputChange}
                  disabled={true}
                  placeholder="Enter address line 3"
                  InputProps={{
                    sx: {
                      height: '45px',
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                      },
                      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '&.Mui-disabled input': {
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
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
                <Select
                  fullWidth
                  name="addressCountryCode"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  disabled={true}
                  IconComponent={CustomArrowIcon}
                  displayEmpty
                  sx={{
                    height: '45px',
                    '& .MuiSelect-select': {
                      py: '12px',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#002CBA',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#F6F6F6',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '& .MuiSelect-select': {
                        backgroundColor: '#F6F6F6',
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
                      },
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
                      >
                        {country.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
                {errors.addressCountryCode && (
                  <FormHelperText error>
                    {errors.addressCountryCode}
                  </FormHelperText>
                )}
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
                    '&:after':
                      selectedCountry === 'IN' || !selectedCountry
                        ? {
                            content: '" *"',
                            color: 'error.main',
                          }
                        : {},
                  }}
                >
                  State / UT
                </Typography>
                <Select
                  fullWidth
                  name="state"
                  value={selectedState}
                  onChange={handleStateChange}
                  disabled={true}
                  IconComponent={CustomArrowIcon}
                  displayEmpty
                  sx={{
                    height: '45px',
                    '& .MuiSelect-select': {
                      py: '12px',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#002CBA',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#F6F6F6',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '& .MuiSelect-select': {
                        backgroundColor: '#F6F6F6',
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
                      },
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
                          {!selectedCountry
                            ? 'Select Country first'
                            : 'Select State/UT'}
                        </Typography>
                      );
                    }
                    return value;
                  }}
                >
                  {getStatesForCountry(selectedCountry).map((state: State) => (
                    <MenuItem key={state.id} value={state.name}>
                      <Typography
                        fontFamily="Gilroy, sans-serif"
                        fontSize="14px"
                      >
                        {state.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
                {errors.state && (
                  <FormHelperText error>{errors.state}</FormHelperText>
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
                    '&:after':
                      selectedCountry === 'IN' || !selectedCountry
                        ? {
                            content: '" *"',
                            color: 'error.main',
                          }
                        : {},
                  }}
                >
                  District
                </Typography>
                <Select
                  fullWidth
                  name="district"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={true}
                  IconComponent={CustomArrowIcon}
                  displayEmpty
                  sx={{
                    height: '45px',
                    '& .MuiSelect-select': {
                      py: '12px',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#002CBA',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#F6F6F6',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '& .MuiSelect-select': {
                        backgroundColor: '#F6F6F6',
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
                      },
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
                        >
                          {district.name}
                        </Typography>
                      </MenuItem>
                    )
                  )}
                </Select>
                {errors.district && (
                  <FormHelperText error>{errors.district}</FormHelperText>
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
                    color: errors.city ? 'error.main' : '#000',
                    display: 'block',
                    mb: 1,
                    '&:after':
                      selectedCountry === 'IN' || !selectedCountry
                        ? {
                            content: '" *"',
                            color: 'error.main',
                          }
                        : {},
                  }}
                >
                  City/Town
                </Typography>
                <Select
                  fullWidth
                  name="city"
                  value={selectedCity}
                  onChange={handleCityChange}
                  disabled={true}
                  IconComponent={CustomArrowIcon}
                  displayEmpty
                  sx={{
                    height: '45px',
                    '& .MuiSelect-select': {
                      py: '12px',
                      fontFamily: 'Gilroy, sans-serif',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#002CBA',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#F6F6F6',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#D1D1D1',
                      },
                      '& .MuiSelect-select': {
                        backgroundColor: '#F6F6F6',
                        color: '#1A1A1A',
                        WebkitTextFillColor: '#1A1A1A',
                      },
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
                </Select>
                {errors.city && (
                  <FormHelperText error>{errors.city}</FormHelperText>
                )}
              </div>
              <div>
                <StyledFormControl
                  fullWidth
                  required={selectedCountry === 'IN' || !selectedCountry}
                  error={!!errors.pinCode}
                  sx={{ width: '100%' }}
                >
                  <Typography
                    component="label"
                    sx={{
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: errors.pinCode ? 'error.main' : '#000',
                      display: 'block',
                      mb: 1,
                      '&:after':
                        selectedCountry === 'IN' || !selectedCountry
                          ? {
                              content: '" *"',
                              color: 'error.main',
                            }
                          : {},
                    }}
                  >
                    Pin Code
                  </Typography>
                  <Select
                    name="pinCode"
                    value={selectedPincode}
                    onChange={handlePincodeChange}
                    IconComponent={CustomArrowIcon}
                    displayEmpty
                    disabled={
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      isDeactivateMode ||
                      track ||
                      !selectedCity ||
                      (!isModifyMode &&
                        !id &&
                        isCkycVerified &&
                        !isNonIndianCitizenship()) ||
                      (isAllFieldsDisabled && isNonIndianCitizenship()) ||
                      (isModifyMode && !track) ||
                      isAllFieldsDisabled
                    }
                    sx={{
                      height: '45px',
                      '& .MuiSelect-select': {
                        py: '12px',
                        minHeight: 'auto',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#002CBA',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#F6F6F6',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D9D9D9',
                        },
                        '& .MuiSelect-select': {
                          backgroundColor: '#F6F6F6',
                          color: '#1A1A1A',
                          WebkitTextFillColor: '#1A1A1A',
                        },
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
                            {!selectedCity
                              ? 'Select City first'
                              : 'Select Pin Code'}
                          </Typography>
                        );
                      }
                      if (value === '000000') {
                        return 'Other';
                      }
                      return value;
                    }}
                  >
                    {selectedCity &&
                      getCitiesForDistrict(
                        selectedCountry,
                        selectedState,
                        selectedDistrict
                      )
                        .filter((p: Pincode) => p.city === selectedCity)
                        .map((pincode: Pincode) => (
                          <MenuItem key={pincode.id} value={pincode.pincode}>
                            <Typography
                              fontFamily="Gilroy, sans-serif"
                              fontSize="14px"
                            >
                              {pincode.pincode}
                            </Typography>
                          </MenuItem>
                        ))}
                    {selectedCity && (
                      <MenuItem value="000000">
                        <Typography
                          fontFamily="Gilroy, sans-serif"
                          fontSize="14px"
                        >
                          Other
                        </Typography>
                      </MenuItem>
                    )}
                  </Select>
                  {errors.pinCode && (
                    <FormHelperText error>{errors.pinCode}</FormHelperText>
                  )}
                </StyledFormControl>
              </div>
              {/* Show "Pin Code (in case of others)" ONLY when pincode is '000000' (Other is selected) */}
              {(formData.pinCode === '000000' ||
                selectedPincode === '000000') && (
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
                    disabled={
                      isSuspendedMode ||
                      isSuspendMode ||
                      isRevokeMode ||
                      track ||
                      isDeactivateMode ||
                      (!isModifyMode &&
                        !id &&
                        isCkycVerified &&
                        !isNonIndianCitizenship()) ||
                      (isAllFieldsDisabled && isNonIndianCitizenship()) ||
                      (isModifyMode && !track)
                    }
                    placeholder="Enter 6-digit pin code"
                    type="number"
                    error={!!errors.otherPinCode}
                    helperText={errors.otherPinCode}
                    InputProps={{
                      sx: {
                        height: '45px',
                        '& input': {
                          py: '12px',
                          height: '100%',
                          boxSizing: 'border-box',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button':
                            {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                          '&[type=number]': {
                            MozAppearance: 'textfield',
                          },
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#F6F6F6',
                        },
                        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D9D9D9',
                        },
                        '&.Mui-disabled input': {
                          color: '#1A1A1A',
                          WebkitTextFillColor: '#1A1A1A',
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
                  onChange={handleInputChange}
                  placeholder="Enter digipin"
                  disabled={true}
                  type="text"
                  InputProps={{
                    sx: {
                      height: '45px',
                      width: '340px',
                      '& input': {
                        py: '12px',
                        height: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '14px',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#E8E8E8',
                      },
                      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0',
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

        {/* Action Buttons - Hidden when viewing workflow data */}
        {!workflowData && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 4,
              mb: 4,
              p: 2,
            }}
          >
            {isSuspendedMode ? (
              <>
                {!deactivate && (
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
                    Revoke
                  </Button>
                )}

                {deactivate && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => setShowDeactivateModal(true)}
                    sx={{
                      borderColor: '#002CBA',
                      color: '#002CBA',
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      textTransform: 'none',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: '#001F8B',
                        backgroundColor: 'rgba(0, 44, 186, 0.04)',
                        color: '#001F8B',
                      },
                    }}
                  >
                    De-activate
                  </Button>
                )}
              </>
            ) : isModifyMode ? (
              <>
                {/* Show only De-activate button when coming from deactivate-user page */}
                {isDeactivateMode ? (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleDeactivateClick}
                    sx={{
                      borderColor: '#002CBA',
                      color: '#fff',
                      background: '#002CBA',
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      textTransform: 'none',
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    De-activate
                  </Button>
                ) : isSuspendMode ? (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleSuspendClick}
                    sx={{
                      borderColor: '#002CBA',
                      color: '#fff',
                      background: '#002CBA',
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      textTransform: 'none',
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Suspend
                  </Button>
                ) : isRevokeMode ? (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => setShowRevokeModal(true)}
                    sx={{
                      borderColor: '#002CBA',
                      color: '#fff',
                      background: '#002CBA',
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      textTransform: 'none',
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Revoke Suspension
                  </Button>
                ) : (
                  <>
                    {suspend ||
                      (revoke && (
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
                          {suspend ? 'Suspend' : 'Revoke Suspension'}
                        </Button>
                      ))}

                    {/* Show Validate button - only enabled once phone number or email is changed */}
                    {!suspend && !revoke && (
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleValidate}
                        disabled={
                          !hasMobileOrEmailChanged ||
                          sendOtpLoading ||
                          isValidated
                        }
                        sx={{
                          borderColor: hasMobileOrEmailChanged
                            ? '#002CBA'
                            : '#E0E0E0',
                          color: hasMobileOrEmailChanged
                            ? '#002CBA'
                            : '#757575',
                          fontFamily: 'Gilroy, sans-serif',
                          fontWeight: 600,
                          fontSize: '16px',
                          textTransform: 'none',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            borderColor: hasMobileOrEmailChanged
                              ? '#001F8B'
                              : '#BDBDBD',
                            backgroundColor: hasMobileOrEmailChanged
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

                    {/* Show Submit button - disabled until validation is complete for mobile/email changes */}
                    {!suspend && !revoke && (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabledInModifyMode}
                        sx={{
                          backgroundColor: !isSubmitDisabledInModifyMode
                            ? '#002CBA'
                            : 'rgba(0, 0, 0, 0.12)',
                          color: !isSubmitDisabledInModifyMode
                            ? '#FFFFFF'
                            : 'rgba(0, 0, 0, 0.26)',
                          fontFamily: 'Gilroy, sans-serif',
                          fontWeight: 600,
                          fontSize: '16px',
                          textTransform: 'none',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: !isSubmitDisabledInModifyMode
                              ? '#001F8B'
                              : 'rgba(0, 0, 0, 0.12)',
                          },
                          '&:disabled': {
                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                            color: 'rgba(0, 0, 0, 0.26)',
                          },
                        }}
                      >
                        {modifyUserLoading ? 'Modifying User...' : 'Submit'}
                      </Button>
                    )}
                  </>
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
                    isModifyMode
                      ? isSubmitDisabledInModifyMode
                      : !isValidated || createSubUserLoading
                  }
                  sx={{
                    backgroundColor:
                      isModifyMode && !isSubmitDisabledInModifyMode
                        ? '#002CBA'
                        : !isModifyMode && isValidated
                          ? '#002CBA'
                          : 'rgba(0, 0, 0, 0.12)',
                    color:
                      isModifyMode && !isSubmitDisabledInModifyMode
                        ? '#FFFFFF'
                        : !isModifyMode && isValidated
                          ? '#FFFFFF'
                          : 'rgba(0, 0, 0, 0.26)',
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor:
                        isModifyMode && !isSubmitDisabledInModifyMode
                          ? '#001F8B'
                          : !isModifyMode && isValidated
                            ? '#001F8B'
                            : 'rgba(0, 0, 0, 0.12)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                  }}
                >
                  {createSubUserLoading
                    ? 'Creating Sub User...'
                    : modifyUserLoading
                      ? 'Modifying User...'
                      : isModifyMode
                        ? 'Modify User'
                        : 'Submit'}
                </Button>
              </>
            )}
          </Box>
        )}

        {/* OTP Verification Modal */}
        <OTPVerificationModal
          open={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          mobileNumber={formData.mobileNumber || ''}
          email={formData.email || ''}
          onVerify={handleOtpVerification}
          onCkycVerify={handleCkycVerification}
          isCkycVerification={isCkycVerification}
          countryCode={formData.countryCode || '+91'}
          showMobileOtp={showMobileOtpInModal}
          showEmailOtp={showEmailOtpInModal}
        />

        {/* Suspend User Modal */}
        <SuspendUserModal
          open={showSuspendModal}
          onClose={() => setShowSuspendModal(false)}
          userId={id || ''}
          mode={revoke ? 'revoke' : 'suspend'}
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
          onClose={() => setShowRevokeModal(false)}
          userId={id || ''}
        />

        {/* Success Modal */}
        <ConfirmationModal
          open={showSuccessModal}
          onClose={handleSuccessModalClose}
          message={successMessage}
          confirmButtonText="Okay"
          onConfirm={handleSuccessModalClose}
        />

        {/* Error Modal */}
        <ErrorModal
          open={showErrorModal}
          onClose={handleErrorModalClose}
          title="Error"
          primaryMessage={errorMessage}
          buttonText="Okay"
        />

        {/* CKYC OTP Verification Modal */}
        <OTPVerificationModal
          open={showCkycOtpModal}
          onClose={() => setShowCkycOtpModal(false)}
          mobileNumber={formData.mobileNumber || ''}
          email={formData.email || ''}
          onVerify={async (
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _mobileOtp: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _emailOtp: string
          ): Promise<boolean> => {
            setShowCkycOtpModal(false);
            handleCkycVerificationSuccess();

            return true;
          }}
          onCkycVerify={handleCkycVerification}
          isCkycVerification={true}
        />

        {/* CKYC Verification Modal */}
        <CKYCVerificationModal
          open={showCkycVerificationModal}
          onClose={() => setShowCkycVerificationModal(false)}
          onVerificationSuccess={(data?: unknown) => {
            handleCkycVerificationSuccess(data);
            setShowCkycVerificationModal(false);
          }}
        />
      </ContentWrapper>
    </MainContainer>
  );
};

export default CreateNewUser;
