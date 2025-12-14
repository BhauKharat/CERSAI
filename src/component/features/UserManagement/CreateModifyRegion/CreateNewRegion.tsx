import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import { fetchGeographyHierarchy } from '../../../../redux/slices/registerSlice/masterSlice';
import {
  fetchCountryCodes,
  Country as CountryCode,
} from '../../../../utils/countryUtils';
import {
  createRegion,
  modifyRegion,
  clearCreateError,
  resetCreateState,
  clearModifyError,
  resetModifyState,
} from './slice/createRegionSlice';
import { fetchRegionBranches } from './slice/deactivationStatsSlice';
import { fetchAdminUserDetails } from '../../Authenticate/slice/authSlice';
import type {
  CreateRegionRequest,
  ModifyRegionRequest,
} from './types/createRegion';
import type { SingleRegionData } from './types/singleRegion';

// TypeScript interfaces
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

export interface RegionData {
  regionName?: string;
  regionCode?: string;
  userId?: string;
  status?: string;
  address?: {
    line1?: string;
    line2?: string;
    line3?: string;
    countryCode?: string;
    state?: string;
    district?: string;
    cityTown?: string;
    pinCode?: string;
    alternatePinCode?: string;
    digiPin?: string;
  };
}

interface CreateNewRegionProps {
  isModifyMode?: boolean;
  regionCode?: string;
  regionData?: SingleRegionData | null;
  loading?: boolean;
  error?: string | null;
}

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../ErrorModal/ErrorModal';
import {
  maxLengthByIdType,
  ValidationUtils,
  isValidDigipin,
  maxLengthByFieldType,
} from '../../../../utils/validationUtils';
import DeactivateRegionModal from './DeactivateRegionModal/DeactivateRegionModal';
import {
  containerStyles,
  backButtonStyles,
  paperStyles,
  titleStyles,
  formContainerStyles,
  labelStyles,
  inputStyles,
  sectionTitleStyles,
  addressRowStyles,
  addressFieldStyles,
  requiredField,
  selectStyles,
  addressSectionContainer,
  addressSectionTitle,
  formRowStyles,
  // backButtonIconStyles,
  regionFieldStyles,
  formActionsContainer,
  submitButtonStyles,
  modifyButtonsContainer,
  // deactivateButtonStyles,
  // mergeButtonStyles,
  modifyButtonStyles,
} from './CreateNewRegion.style';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../NavigationBreadCrumb/NavigationBreadCrumb';
import StatusScreen from '../TrackStatus/StatusScreen';
import DateUtils from '../../../../utils/dateUtils';

const CreateNewRegion: React.FC<CreateNewRegionProps> = ({
  isModifyMode = false,
  regionData,
  error: singleRegionError,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const location = useLocation();
  const { deactivate, track, status } = location.state || {};

  const initialNavigationItem = React.useMemo<ICrumbs[]>(
    () => [
      {
        label: 'User Management',
        path: '/re/dashboard',
      },
      {
        label: 'Region',
        path: '/re/modify-region',
      },
    ],
    []
  );

  const [navigationItem, setNavigationItem] = useState<ICrumbs[]>(
    initialNavigationItem
  );

  useEffect(() => {
    if (isModifyMode && !deactivate && !track) {
      setNavigationItem((prev) => [
        ...prev,
        { label: 'Modify', path: '/re/modify-region' },
        { label: 'Region Details' },
      ]);
    } else if (deactivate) {
      setNavigationItem([
        {
          label: 'User Management',
          path: '/re/dashboard',
        },
        {
          label: 'Region',
          path: '/re/modify-region',
        },
        { label: 'De-activate', path: '/re/deactivate-region' },
        { label: 'Region Details' },
      ]);
    } else if (track) {
      setNavigationItem((prev) => [
        ...prev,
        { label: 'Track Status', path: '/re/track-region-status' },
        { label: 'Region Details' },
      ]);
    } else {
      setNavigationItem((prev) => [...prev, { label: 'Create' }]);
    }
  }, [isModifyMode, initialNavigationItem, deactivate, track]);

  // Redux state
  const { geographyHierarchy, loading } = useSelector(
    (state: RootState) => state.masters
  );
  const {
    createLoading,
    createSuccess,
    createError,
    workflowId,
    createSuccessMessage,
    modifyLoading,
    modifySuccess,
    modifyError,
    modifyWorkflowId,
    modifySuccessMessage,
  } = useSelector((state: RootState) => state.createRegion);
  const { deactivateSuccess } = useSelector(
    (state: RootState) => state.deactivationStats
  );
  const trackStatusData = useSelector(
    (state: RootState) => state.trackStatusDetails.data
  );
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const userRole = useSelector(
    (state: RootState) =>
      state.auth.userDetails?.role ||
      state.auth.adminUserDetails?.data?.attributes?.userDetails?.userType ||
      ''
  );

  // Check the full auth state
  const authState = useSelector((state: RootState) => state.auth);

  // Get group membership for additional role info
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership || []
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showModifySuccessModal, setShowModifySuccessModal] = useState(false);
  const [showDeactivateSuccessModal, setShowDeactivateSuccessModal] =
    useState(false);

  console.log(groupMembership, userRole);

  const [formData, setFormData] = useState({
    regionName: '',
    regionCode: '',
    status: 'Active',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    countryCode: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    otherPincode: '',
    digipin: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    regionCode: '',
    regionName: '',
    pincode: '',
    otherPincode: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    state: '',
    district: '',
    city: '',
    digipin: '',
  });

  // Local state for cascading dropdowns
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availablePincodes, setAvailablePincodes] = useState<Pincode[]>([]);
  const [allCountries, setAllCountries] = useState<CountryCode[]>([]);

  // Check if selected country is India
  const isIndiaSelected = formData.countryCode === 'IN';

  // Track if we've already fetched admin user details to prevent multiple calls
  const hasFetchedUserDetails = useRef(false);

  // Fetch geography data and country codes on component mount
  useEffect(() => {
    dispatch(fetchGeographyHierarchy());
    // Load all countries from CountryCodes.json
    fetchCountryCodes()
      .then((countries) => {
        setAllCountries(countries);
      })
      .catch((error) => {
        console.error('Failed to load country codes:', error);
      });
  }, [dispatch]);

  // Ensure user details are fetched with role information (only once)
  useEffect(() => {
    const userId = userDetails?.userId;
    const hasRole =
      userDetails?.role ||
      authState.adminUserDetails?.data?.attributes?.userDetails?.userType;
    const isLoading = authState.adminUserDetailsLoading;

    if (userId && !hasRole && !isLoading && !hasFetchedUserDetails.current) {
      console.log('Fetching admin user details to update role information');
      hasFetchedUserDetails.current = true;
      dispatch(fetchAdminUserDetails({ userId }));
    }
  }, [
    dispatch,
    userDetails?.userId,
    userDetails?.role,
    authState.adminUserDetails?.data?.attributes?.userDetails?.userType,
    authState.adminUserDetailsLoading,
  ]);

  // Populate form data if in modify mode
  useEffect(() => {
    if (isModifyMode && regionData) {
      // Find and populate country, state, and district dropdowns
      const countryCode = regionData.address?.countryCode || '';
      const stateValue = regionData.address?.state || '';
      const districtValue = regionData.address?.district || '';

      let stateId = '';
      let districtId = '';

      // Only process dropdowns if geography hierarchy is loaded and country is India
      if (geographyHierarchy.length > 0) {
        // Find country and populate states
        const selectedCountry = geographyHierarchy.find(
          (country: Country) => country.code === countryCode
        );

        // If country is India (IN), use dropdown logic
        if (selectedCountry && countryCode === 'IN') {
          setAvailableStates(selectedCountry.states || []);

          // Find state - handle both ID and name from backend
          let selectedState = selectedCountry.states?.find(
            (state: State) => state.id.toString() === stateValue
          );

          // If not found by ID, try to find by name
          if (!selectedState) {
            selectedState = selectedCountry.states?.find(
              (state: State) =>
                state.name.toLowerCase() === stateValue.toLowerCase()
            );
          }

          if (selectedState) {
            stateId = selectedState.id.toString();
            setAvailableDistricts(selectedState.districts || []);

            // Find district - handle both ID and name from backend
            let selectedDistrict = selectedState.districts?.find(
              (district: District) => district.id.toString() === districtValue
            );

            // If not found by ID, try to find by name
            if (!selectedDistrict) {
              selectedDistrict = selectedState.districts?.find(
                (district: District) =>
                  district.name.toLowerCase() === districtValue.toLowerCase()
              );
            }

            if (selectedDistrict) {
              districtId = selectedDistrict.id.toString();
              setAvailablePincodes(selectedDistrict.pincodes || []);
            }
          }
        } else {
          // For non-India countries, use text values directly
          stateId = stateValue;
          districtId = districtValue;
          setAvailableStates([]);
          setAvailableDistricts([]);
          setAvailablePincodes([]);
        }
      } else {
        // If geography hierarchy not loaded yet, use text values directly
        // They will be updated when hierarchy loads
        stateId = stateValue;
        districtId = districtValue;
      }

      setFormData({
        regionName: regionData.regionName || '',
        regionCode: regionData.regionCode || '',
        status: 'Active', // Default status since API doesn't return status
        addressLine1: regionData.address?.line1 || '',
        addressLine2: regionData.address?.line2 || '',
        addressLine3: regionData.address?.line3 || '',
        countryCode: countryCode,
        state: stateId || stateValue,
        district: districtId || districtValue,
        city: regionData.address?.cityTown || '',
        pincode: regionData.address?.pinCode || '',
        otherPincode: regionData.address?.alternatePinCode || '',
        digipin: regionData.address?.digiPin || '',
      });
    }
  }, [isModifyMode, regionData, geographyHierarchy]);

  // Handle country selection and update states
  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = geographyHierarchy.find(
      (country: Country) => country.code === countryCode
    );
    if (selectedCountry) {
      setAvailableStates(selectedCountry.states || []);
      setAvailableDistricts([]);
      setAvailablePincodes([]);
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        countryCode,
        state: '',
        district: '',
        pincode: '',
      }));
    } else {
      // If country not found in hierarchy (non-India), reset dependent fields
      setAvailableStates([]);
      setAvailableDistricts([]);
      setAvailablePincodes([]);
      setFormData((prev) => ({
        ...prev,
        countryCode,
        state: '',
        district: '',
        pincode: '',
      }));
    }
  };

  // Handle state selection and update districts
  const handleStateChange = (stateId: string) => {
    const selectedState = availableStates.find(
      (state: State) => state.id.toString() === stateId
    );
    if (selectedState && selectedState.districts) {
      setAvailableDistricts(selectedState.districts || []);
      setAvailablePincodes([]);
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        state: stateId,
        district: '',
        pincode: '',
      }));
    }
  };

  // Handle district selection and update pincodes
  const handleDistrictChange = (districtId: string) => {
    const selectedDistrict = availableDistricts.find(
      (district: District) => district.id.toString() === districtId
    );
    if (selectedDistrict) {
      setAvailablePincodes(selectedDistrict.pincodes || []);
      // Reset pincode
      setFormData((prev) => ({
        ...prev,
        district: districtId,
        pincode: '',
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const { name, value } = e.target as { name: string; value: string };

    // Handle cascading dropdown changes
    if (name === 'countryCode') {
      handleCountryChange(value);
    } else if (name === 'state') {
      // If India is selected, use dropdown handler; otherwise, validate text input
      if (isIndiaSelected) {
        handleStateChange(value);
      } else {
        // Validate state - alphanumeric only, max 50 characters
        let processedValue = value;

        // Limit to max characters
        if (processedValue.length > maxLengthByFieldType.STATE) {
          processedValue = processedValue.substring(
            0,
            maxLengthByFieldType.STATE
          );
        }

        if (processedValue && processedValue.trim().length === 0) {
          setValidationErrors((prev) => ({
            ...prev,
            state: 'State/UT cannot contain only spaces',
          }));
        } else if (
          processedValue &&
          !ValidationUtils.isValidAlphanumeric(processedValue)
        ) {
          setValidationErrors((prev) => ({
            ...prev,
            state: 'State/UT can only contain alphanumeric characters',
          }));
        } else if (processedValue.length > maxLengthByFieldType.STATE) {
          setValidationErrors((prev) => ({
            ...prev,
            state: `State/UT cannot exceed ${maxLengthByFieldType.STATE} characters`,
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            state: '',
          }));
        }

        setFormData((prev) => ({
          ...prev,
          state: processedValue,
        }));
      }
    } else if (name === 'district') {
      // If India is selected, use dropdown handler; otherwise, validate text input
      if (isIndiaSelected) {
        handleDistrictChange(value);
      } else {
        // Validate district - alphanumeric only, max 50 characters
        let processedValue = value;

        // Limit to max characters
        if (processedValue.length > maxLengthByFieldType.DISTRICT) {
          processedValue = processedValue.substring(
            0,
            maxLengthByFieldType.DISTRICT
          );
        }

        if (processedValue && processedValue.trim().length === 0) {
          setValidationErrors((prev) => ({
            ...prev,
            district: 'District cannot contain only spaces',
          }));
        } else if (
          processedValue &&
          !ValidationUtils.isValidAlphanumeric(processedValue)
        ) {
          setValidationErrors((prev) => ({
            ...prev,
            district: 'District can only contain alphanumeric characters',
          }));
        } else if (processedValue.length > maxLengthByFieldType.DISTRICT) {
          setValidationErrors((prev) => ({
            ...prev,
            district: `District cannot exceed ${maxLengthByFieldType.DISTRICT} characters`,
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            district: '',
          }));
        }

        setFormData((prev) => ({
          ...prev,
          district: processedValue,
        }));
      }
    } else if (name === 'city') {
      // Validate city - alphanumeric only, max 50 characters
      let processedValue = value;
      // Limit to max characters
      if (processedValue.length > maxLengthByFieldType.CITY) {
        processedValue = processedValue.substring(0, maxLengthByFieldType.CITY);
      }

      // City is required only for India
      if (
        isIndiaSelected &&
        (!processedValue || processedValue.trim() === '')
      ) {
        setValidationErrors((prev) => ({
          ...prev,
          city: 'City/Town is required',
        }));
      } else if (
        processedValue &&
        !ValidationUtils.isValidAlphanumeric(processedValue)
      ) {
        setValidationErrors((prev) => ({
          ...prev,
          city: 'City/Town can only contain alphanumeric characters',
        }));
      } else if (processedValue.length > maxLengthByFieldType.CITY) {
        setValidationErrors((prev) => ({
          ...prev,
          city: `City/Town cannot exceed ${maxLengthByFieldType.CITY} characters`,
        }));
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          city: '',
        }));
      }

      setFormData((prev) => ({
        ...prev,
        city: processedValue,
      }));
    } else {
      // Convert regionCode to uppercase automatically
      let processedValue = value;
      if (name === 'regionCode') {
        processedValue = value.toUpperCase();

        // Validate regionCode format - same as regionName
        if (!ValidationUtils.isValidAlphanumeric(processedValue)) {
          setValidationErrors((prev) => ({
            ...prev,
            regionCode:
              'Region code must contain only alphanumeric characters ',
          }));
        } else if (processedValue && processedValue.trim().length === 0) {
          // Check if value contains only spaces
          setValidationErrors((prev) => ({
            ...prev,
            regionCode: 'Region code cannot contain only spaces',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            regionCode: '',
          }));
        }
      } else if (name === 'regionName') {
        if (
          processedValue &&
          !ValidationUtils.isValidAlphanumeric(processedValue)
        ) {
          setValidationErrors((prev) => ({
            ...prev,
            regionName: 'Region name must contain only alphanumeric characters',
          }));
        } else if (processedValue && processedValue.trim().length === 0) {
          // Check if value contains only spaces
          setValidationErrors((prev) => ({
            ...prev,
            regionName: 'Region name cannot contain only spaces',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            regionName: '',
          }));
        }
      } else if (name === 'pincode') {
        // Validate pincode - for India: numeric only max 6, for others: alphanumeric max 50
        let processedValue = value;
        const maxLength = isIndiaSelected ? 6 : maxLengthByFieldType.PINCODE;

        // For India, only allow numeric; for others, allow alphanumeric
        if (isIndiaSelected) {
          processedValue = processedValue.replace(/\D/g, '');
        }

        // Limit to max characters
        if (processedValue.length > maxLength) {
          processedValue = processedValue.substring(0, maxLength);
        }

        if (
          !isIndiaSelected &&
          processedValue &&
          !ValidationUtils.isValidAlphanumeric(processedValue)
        ) {
          setValidationErrors((prev) => ({
            ...prev,
            pincode: 'Pin Code can only contain alphanumeric characters',
          }));
        } else if (processedValue && processedValue.trim().length === 0) {
          setValidationErrors((prev) => ({
            ...prev,
            pincode: 'Pin Code cannot contain only spaces',
          }));
        } else if (processedValue.length > maxLength) {
          setValidationErrors((prev) => ({
            ...prev,
            pincode: `Pin Code cannot exceed ${maxLength} characters`,
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            pincode: '',
          }));
        }
      } else if (name === 'otherPincode') {
        // Validate other pincode - numeric only, max 6 characters (for India)
        processedValue = value;

        // Only allow numeric
        processedValue = processedValue.replace(/\D/g, '');

        // Limit to 6 characters
        if (processedValue.length > 6) {
          processedValue = processedValue.substring(0, 6);
        }

        if (processedValue && processedValue.trim().length === 0) {
          setValidationErrors((prev) => ({
            ...prev,
            otherPincode: 'Pin Code cannot contain only spaces',
          }));
        } else if (processedValue.length > 6) {
          setValidationErrors((prev) => ({
            ...prev,
            otherPincode: 'Pin Code cannot exceed 6 characters',
          }));
        } else if (processedValue && processedValue.trim() !== '') {
          // Check if the entered pincode matches any existing pincode in the dropdown
          const matchingPincode = availablePincodes.find(
            (pincode: Pincode) =>
              String(pincode.pincode).toLowerCase() ===
              processedValue.toLowerCase()
          );

          if (matchingPincode) {
            // Pincode exists in configured options - "Others" should not be allowed
            setValidationErrors((prev) => ({
              ...prev,
              otherPincode:
                'Please select entered Pincode from Pincode dropdown.',
            }));
          } else {
            setValidationErrors((prev) => ({
              ...prev,
              otherPincode: '',
            }));
          }
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            otherPincode: '',
          }));
        }
      } else if (name === 'digipin') {
        // Convert to uppercase automatically
        processedValue = processedValue.toUpperCase();

        if (processedValue.length > maxLengthByIdType.DIGIPIN) {
          processedValue = processedValue.substring(
            0,
            maxLengthByIdType.DIGIPIN
          );
        }

        // Validate digipin if value is provided
        if (processedValue && !isValidDigipin(processedValue)) {
          setValidationErrors((prev) => ({
            ...prev,
            digipin:
              'Invalid Digipin. Format: XXX-XXX-XXXX. Allowed characters: 2-9, C, F, J, K, L, M, P, T.',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            digipin: '',
          }));
        }
      } else if (name === 'addressLine1') {
        // Validate addressLine1 - mandatory field
        if (!processedValue || processedValue.trim() === '') {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine1: 'Address Line 1 is required',
          }));
        } else if (!ValidationUtils.isValidAddressLine(processedValue)) {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine1:
              'Address Line 1 can only contain alphanumeric characters, spaces, and special characters (~@#$%^&*()_+-=)',
          }));
        } else if (processedValue.trim().length === 0) {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine1: 'Address Line 1 cannot contain only spaces',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine1: '',
          }));
        }
      } else if (name === 'addressLine2') {
        // Validate addressLine2 - optional field
        if (
          processedValue &&
          !ValidationUtils.isValidAddressLine(processedValue)
        ) {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine2:
              'Address Line 2 can only contain alphanumeric characters, spaces, and special characters (~@#$%^&*()_+-=)',
          }));
        } else if (processedValue && processedValue.trim().length === 0) {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine2: 'Address Line 2 cannot contain only spaces',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine2: '',
          }));
        }
      } else if (name === 'addressLine3') {
        // Validate addressLine3 - optional field
        if (
          processedValue &&
          !ValidationUtils.isValidAddressLine(processedValue)
        ) {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine3:
              'Address Line 3 can only contain alphanumeric characters, spaces, and special characters (~@#$%^&*()_+-=)',
          }));
        } else if (processedValue && processedValue.trim().length === 0) {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine3: 'Address Line 3 cannot contain only spaces',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            addressLine3: '',
          }));
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For India, find the state and district names from the ID
    // For other countries, use the text values directly
    let stateValue = formData.state;
    let districtValue = formData.district;

    if (isIndiaSelected) {
      const selectedState = availableStates.find(
        (state: State) => state.id.toString() === formData.state
      );
      const selectedDistrict = availableDistricts.find(
        (district: District) => district.id.toString() === formData.district
      );
      stateValue = selectedState?.name || formData.state;
      districtValue = selectedDistrict?.name || formData.district;
    }

    // Find country name from country code
    const selectedCountry = allCountries.find(
      (country: CountryCode) => country.code === formData.countryCode
    );
    const countryName = selectedCountry?.name || formData.countryCode;

    // Create region request payload
    const regionRequest: CreateRegionRequest = {
      regionName: formData.regionName,
      regionCode: formData.regionCode,
      userId: userDetails?.userId || '',
      address: {
        line1: formData.addressLine1,
        line2: formData.addressLine2 || undefined,
        line3: formData.addressLine3 || undefined,
        city: formData.city,
        state: stateValue,
        district: districtValue,
        countryCode: formData.countryCode,
        country: countryName,
        pinCode: formData.pincode,
        alternatePinCode: formData.otherPincode || null,
        digiPin: formData.digipin || null,
      },
    };

    // Dispatch the createRegion action
    dispatch(createRegion(regionRequest));
  };

  const handleDeactivate = () => {
    // Fetch region branches before opening modal
    if (formData.regionCode) {
      dispatch(fetchRegionBranches(formData.regionCode));
    }
    setShowDeactivateModal(true);
  };

  // const handleMerge = () => {
  //   // Navigate to merge region screen
  //   navigate('/re/merge-region', { state: { regionData: formData } });
  // };

  const handleModify = async () => {
    // For India, find the state and district names from the ID
    // For other countries, use the text values directly
    let stateValue = formData.state;
    let districtValue = formData.district;

    if (isIndiaSelected) {
      const selectedState = availableStates.find(
        (state: State) => state.id.toString() === formData.state
      );
      const selectedDistrict = availableDistricts.find(
        (district: District) => district.id.toString() === formData.district
      );
      stateValue = selectedState?.name || formData.state;
      districtValue = selectedDistrict?.name || formData.district;
    }

    // Find country name from country code
    const selectedCountry = allCountries.find(
      (country: CountryCode) => country.code === formData.countryCode
    );
    const countryName = selectedCountry?.name || formData.countryCode;

    // Create modify request payload (includes regionCode)
    const modifyRequest: ModifyRegionRequest = {
      regionName: formData.regionName,
      regionCode: formData.regionCode,
      userId: userDetails?.userId || '',
      address: {
        line1: formData.addressLine1,
        line2: formData.addressLine2 || undefined,
        line3: formData.addressLine3 || undefined,
        city: formData.city,
        state: stateValue,
        district: districtValue,
        countryCode: formData.countryCode,
        country: countryName,
        pinCode: formData.pincode,
        alternatePinCode: formData.otherPincode || null,
        digiPin: formData.digipin || null,
      },
    };

    // Dispatch the modifyRegion action
    dispatch(
      modifyRegion({
        regionCode: formData.regionCode,
        regionData: modifyRequest,
      })
    );
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    dispatch(resetCreateState());
    dispatch(clearModifyError());
    // Redirect to track region status page
    navigate('/re/track-region-status');
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    dispatch(clearCreateError());
    dispatch(clearModifyError());
  };

  const handleModifyModalClose = () => {
    setShowModifySuccessModal(false);
    dispatch(resetModifyState());
    // Redirect to modify region page
    navigate('/re/modify-region');
  };

  // Handle Redux state changes for success/error
  useEffect(() => {
    if (createSuccess && workflowId) {
      setShowSuccessModal(true);
    }
  }, [createSuccess, workflowId]);

  useEffect(() => {
    if (createError) {
      setShowErrorModal(true);
    }
  }, [createError]);

  // Handle modify success/error
  useEffect(() => {
    if (modifySuccess && modifyWorkflowId) {
      setShowModifySuccessModal(true);
    }
  }, [modifySuccess, modifyWorkflowId]);

  useEffect(() => {
    if (modifyError) {
      setShowErrorModal(true);
    }
  }, [modifyError]);

  // Handle deactivate success
  useEffect(() => {
    if (deactivateSuccess) {
      setShowDeactivateSuccessModal(true);
    }
  }, [deactivateSuccess]);

  // Handle single region fetch error - show error modal when API fails
  useEffect(() => {
    console.log('🚀 singleRegionError changed:', singleRegionError);
    if (singleRegionError) {
      console.log(
        '🚀 Setting showErrorModal to true for error:',
        singleRegionError
      );
      setShowErrorModal(true);
    }
  }, [singleRegionError]);

  return (
    <Container maxWidth={false} sx={containerStyles}>
      {/* Header with Breadcrumb and Back Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <NavigationBreadCrumb crumbsData={navigationItem} />
        {isModifyMode && (
          <Button
            startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
            onClick={() => navigate(-1)}
            sx={{
              ...backButtonStyles,
              mb: 0,
              ml: 'auto',
            }}
          >
            Back
          </Button>
        )}
      </Box>

      {track && (
        <StatusScreen
          status={status}
          rejectedBy={
            trackStatusData?.workflowDetails?.rejected?.rejectedBy ||
            trackStatusData?.deactivationDetails?.deactivationInitiatedBy
          }
          rejectedOn={DateUtils.formatDate(
            trackStatusData?.workflowDetails?.rejected?.rejectedOn ||
              trackStatusData?.deactivationDetails?.deactivationInitiatedOn
          )}
          remark={
            trackStatusData?.workflowDetails?.rejected?.remark ||
            trackStatusData?.deactivationDetails?.remarks ||
            trackStatusData?.workflowCompletion?.remark
          }
          approvedBy={
            trackStatusData?.workflowCompletion?.approvedBy ||
            trackStatusData?.actionBy ||
            undefined
          }
          approvedOn={DateUtils.formatDate(
            trackStatusData?.workflowCompletion?.approvedOn ||
              trackStatusData?.actionOn
          )}
        />
      )}

      <Paper elevation={0} sx={paperStyles}>
        <Typography variant="h6" className="medium-text" sx={titleStyles}>
          {isModifyMode ? 'Region Details' : 'Create New Region'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={formContainerStyles}>
            {/* Region Name and Code Row */}
            <Box sx={formRowStyles}>
              <Box sx={regionFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Region Name <span style={requiredField}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="regionName"
                  value={formData.regionName}
                  onChange={handleChange}
                  inputProps={{ maxLength: 50 }}
                  placeholder="Enter region name here"
                  required
                  size="small"
                  sx={inputStyles}
                  disabled={deactivate || track ? true : false}
                  error={!!validationErrors.regionName}
                  helperText={validationErrors.regionName}
                />
              </Box>
              <Box sx={regionFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Region Code <span style={requiredField}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="regionCode"
                  value={formData.regionCode}
                  inputProps={{ maxLength: 20 }}
                  onChange={handleChange}
                  placeholder="Enter region code here"
                  required
                  size="small"
                  disabled={isModifyMode}
                  sx={inputStyles}
                  error={!!validationErrors.regionCode}
                  helperText={validationErrors.regionCode}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={addressSectionContainer}>
            {/* Address Details Section */}
            <Box sx={addressSectionTitle}>
              <Typography
                variant="h6"
                className="medium-text"
                sx={sectionTitleStyles}
              >
                Address Details
              </Typography>

              {/* Row 1: Address Lines */}
              <Box sx={addressRowStyles}>
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Address Line 1 <span style={requiredField}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="addressLine1"
                    value={formData.addressLine1}
                    inputProps={{ maxLength: 60 }}
                    onChange={handleChange}
                    placeholder="Enter address line 1"
                    required
                    size="small"
                    disabled={deactivate || track ? true : false}
                    sx={inputStyles}
                    error={!!validationErrors.addressLine1}
                    helperText={validationErrors.addressLine1}
                  />
                </Box>
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Address Line 2
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="addressLine2"
                    value={formData.addressLine2}
                    inputProps={{ maxLength: 60 }}
                    onChange={handleChange}
                    placeholder="Enter address line 2"
                    size="small"
                    disabled={deactivate || track ? true : false}
                    sx={inputStyles}
                    error={!!validationErrors.addressLine2}
                    helperText={validationErrors.addressLine2}
                  />
                </Box>
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Address Line 3
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="addressLine3"
                    value={formData.addressLine3}
                    inputProps={{ maxLength: 60 }}
                    onChange={handleChange}
                    placeholder="Enter address line 3"
                    size="small"
                    disabled={deactivate || track ? true : false}
                    sx={inputStyles}
                    error={!!validationErrors.addressLine3}
                    helperText={validationErrors.addressLine3}
                  />
                </Box>
              </Box>

              {/* Row 2: Country, State, District */}
              <Box sx={formRowStyles}>
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Country <span style={requiredField}>*</span>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      required
                      sx={selectStyles}
                      disabled={loading || deactivate || track ? true : false}
                      displayEmpty
                    >
                      <MenuItem value="">Select Country</MenuItem>
                      {allCountries.map((country: CountryCode) => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    State / UT{' '}
                    {isIndiaSelected && <span style={requiredField}>*</span>}
                  </Typography>
                  {!formData.countryCode || isIndiaSelected ? (
                    <FormControl fullWidth size="small">
                      <Select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        inputProps={{ maxLength: 60 }}
                        required={isIndiaSelected}
                        sx={selectStyles}
                        disabled={
                          !formData.countryCode ||
                          availableStates.length === 0 ||
                          deactivate ||
                          track
                            ? true
                            : false
                        }
                        displayEmpty
                      >
                        <MenuItem value="">Select State</MenuItem>
                        {availableStates.map((state: State) => (
                          <MenuItem key={state.id} value={state.id.toString()}>
                            {state.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state/UT"
                      required={false}
                      size="small"
                      disabled={deactivate || track}
                      sx={inputStyles}
                      inputProps={{ maxLength: maxLengthByFieldType.STATE }}
                      error={!!validationErrors.state}
                      helperText={validationErrors.state}
                    />
                  )}
                </Box>
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    District{' '}
                    {isIndiaSelected && <span style={requiredField}>*</span>}
                  </Typography>
                  {!formData.countryCode || isIndiaSelected ? (
                    <FormControl fullWidth size="small">
                      <Select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required={isIndiaSelected}
                        sx={selectStyles}
                        disabled={
                          !formData.state ||
                          availableDistricts.length === 0 ||
                          deactivate ||
                          track
                            ? true
                            : false
                        }
                        displayEmpty
                      >
                        <MenuItem value="">Select District</MenuItem>
                        {availableDistricts.map((district: District) => (
                          <MenuItem
                            key={district.id}
                            value={district.id.toString()}
                          >
                            {district.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="Enter district"
                      required={false}
                      size="small"
                      disabled={deactivate || track}
                      sx={inputStyles}
                      inputProps={{ maxLength: maxLengthByFieldType.DISTRICT }}
                      error={!!validationErrors.district}
                      helperText={validationErrors.district}
                    />
                  )}
                </Box>
              </Box>

              {/* Row 3: City, Pincode, Other Pincode */}
              <Box sx={formRowStyles}>
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    City/Town{' '}
                    {isIndiaSelected && <span style={requiredField}>*</span>}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city/town"
                    required={isIndiaSelected}
                    size="small"
                    disabled={deactivate || track ? true : false}
                    inputProps={{ maxLength: 60 }}
                    sx={inputStyles}
                    error={!!validationErrors.city}
                    helperText={validationErrors.city}
                  />
                </Box>
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Pin Code{' '}
                    {isIndiaSelected && <span style={requiredField}>*</span>}
                  </Typography>
                  {!formData.countryCode || isIndiaSelected ? (
                    <FormControl fullWidth size="small" sx={inputStyles}>
                      <Select
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pincode: e.target.value,
                          }))
                        }
                        displayEmpty
                        disabled={
                          deactivate ||
                          track ||
                          !formData.district ||
                          availableDistricts.length === 0
                        }
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
                        {formData.district && availableDistricts.length > 0 && (
                          <MenuItem value="000000">
                            <Typography
                              fontFamily="Gilroy, sans-serif"
                              fontSize="14px"
                              fontWeight={500}
                            >
                              Other
                            </Typography>
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Enter pin code"
                      required={false}
                      size="small"
                      disabled={deactivate || track}
                      sx={inputStyles}
                      error={!!validationErrors.pincode}
                      helperText={validationErrors.pincode}
                      inputProps={{
                        maxLength: isIndiaSelected
                          ? 6
                          : maxLengthByFieldType.PINCODE,
                      }}
                    />
                  )}
                </Box>
                {formData.pincode === '000000' ? (
                  <Box sx={addressFieldStyles}>
                    <Typography variant="subtitle2" sx={labelStyles}>
                      Pin Code (in case of others){' '}
                      <span style={requiredField}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="otherPincode"
                      value={formData.otherPincode}
                      onChange={handleChange}
                      placeholder="Enter Pin Code"
                      required={formData.pincode === '000000'}
                      size="small"
                      disabled={deactivate || track ? true : false}
                      sx={inputStyles}
                      error={!!validationErrors.otherPincode}
                      helperText={validationErrors.otherPincode}
                      inputProps={{
                        maxLength: isIndiaSelected
                          ? 6
                          : maxLengthByFieldType.PINCODE,
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={addressFieldStyles}>
                    <Typography variant="subtitle2" sx={labelStyles}>
                      Digipin
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="digipin"
                      value={formData.digipin}
                      inputProps={{ maxLength: maxLengthByIdType.DIGIPIN }}
                      onChange={handleChange}
                      placeholder="Enter Digipin"
                      size="small"
                      disabled={deactivate || track ? true : false}
                      sx={inputStyles}
                      error={!!validationErrors.digipin}
                      helperText={validationErrors.digipin}
                    />
                  </Box>
                )}
              </Box>

              {/* Row 4: Digipin (only shown when Other is selected) */}
              {formData.pincode === '000000' && (
                <Box sx={formRowStyles}>
                  <Box sx={{ ...addressFieldStyles, maxWidth: '350px' }}>
                    <Typography variant="subtitle2" sx={labelStyles}>
                      Digipin
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="digipin"
                      value={formData.digipin}
                      inputProps={{ maxLength: maxLengthByIdType.DIGIPIN }}
                      onChange={handleChange}
                      placeholder="Enter Digipin"
                      size="small"
                      disabled={deactivate || track ? true : false}
                      sx={inputStyles}
                      error={!!validationErrors.digipin}
                      helperText={validationErrors.digipin}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {isModifyMode ? (
              <Box sx={modifyButtonsContainer}>
                {deactivate && (
                  <Button
                    variant="contained"
                    onClick={handleDeactivate}
                    className="medium-text"
                    sx={modifyButtonStyles}
                  >
                    De-activate
                  </Button>
                )}

                {/* <Button
                  variant="outlined"
                  onClick={handleMerge}
                  className="medium-text"
                  sx={mergeButtonStyles}
                >
                  Merge
                </Button> */}

                {!deactivate && !track && (
                  <Button
                    variant="contained"
                    onClick={handleModify}
                    disabled={
                      !formData.regionName ||
                      !formData.regionCode ||
                      !formData.addressLine1 ||
                      !formData.countryCode ||
                      (isIndiaSelected && !formData.state) ||
                      (isIndiaSelected && !formData.district) ||
                      (isIndiaSelected && !formData.city) ||
                      (isIndiaSelected && !formData.pincode) ||
                      (isIndiaSelected &&
                        formData.pincode === '000000' &&
                        !formData.otherPincode) ||
                      !!validationErrors.regionCode ||
                      !!validationErrors.regionName ||
                      !!validationErrors.addressLine1 ||
                      !!validationErrors.addressLine2 ||
                      !!validationErrors.addressLine3 ||
                      !!validationErrors.digipin ||
                      modifyLoading
                    }
                    className="medium-text"
                    sx={modifyButtonStyles}
                  >
                    {modifyLoading ? 'Modifying...' : 'Submit'}
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={formActionsContainer}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    !formData.regionName ||
                    !formData.regionCode ||
                    !formData.addressLine1 ||
                    !formData.countryCode ||
                    (isIndiaSelected && !formData.state) ||
                    (isIndiaSelected && !formData.district) ||
                    (isIndiaSelected && !formData.city) ||
                    (isIndiaSelected && !formData.pincode) ||
                    (isIndiaSelected &&
                      formData.pincode === '000000' &&
                      !formData.otherPincode) ||
                    !!validationErrors.regionCode ||
                    !!validationErrors.regionName ||
                    !!validationErrors.addressLine1 ||
                    !!validationErrors.addressLine2 ||
                    !!validationErrors.addressLine3 ||
                    !!validationErrors.digipin ||
                    createLoading
                  }
                  className="medium-text"
                  sx={submitButtonStyles}
                >
                  {createLoading ? 'Creating...' : 'Submit'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <ConfirmationModal
        open={showSuccessModal}
        onClose={handleModalClose}
        message={createSuccessMessage || 'Submitted for approval'}
        confirmButtonText="Okay"
      />

      <ErrorModal
        open={showErrorModal}
        onClose={isModifyMode ? handleModifyModalClose : handleErrorModalClose}
        primaryMessage={
          singleRegionError ||
          (isModifyMode
            ? modifyError?.includes('Only approved Region can be modified')
              ? 'Only approved Region can be modified.'
              : modifyError?.includes('Authorization token')
                ? 'Authorization token is missing or invalid or expired.'
                : modifyError || 'An error occurred while modifying the region.'
            : createError?.includes('already exists')
              ? 'This region already exists.\nPlease enter unique region details.'
              : createError || 'An error occurred while creating the region.')
        }
        buttonText="Okay"
      />

      <DeactivateRegionModal
        open={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        regionCode={formData.regionCode}
      />

      <ConfirmationModal
        open={showModifySuccessModal}
        onClose={handleModifyModalClose}
        message={modifySuccessMessage || 'Submitted for approval'}
        confirmButtonText="Okay"
      />

      <ConfirmationModal
        open={showDeactivateSuccessModal}
        onClose={() => {
          setShowDeactivateSuccessModal(false);
          navigate('/re/track-region-status');
        }}
        onConfirm={() => {
          setShowDeactivateSuccessModal(false);
          navigate('/re/track-region-status');
        }}
        message="Submitted for approval"
        confirmButtonText="Okay"
      />
    </Container>
  );
};

export default CreateNewRegion;
