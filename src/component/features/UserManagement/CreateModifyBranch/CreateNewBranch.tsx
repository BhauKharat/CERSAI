/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';

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
import DeactivateBranchModal from './DeactivateBranchModal/DeactivateBranchModal';
import {
  fetchRegions,
  clearFetchRegionsData,
} from '../CreateModifyUser/slice/fetchRegionsSlice';
import { RegionData } from '../CreateModifyUser/types/fetchRegionsTypes';
import { fetchGeographyHierarchy } from '../../../../redux/slices/registerSlice/masterSlice';
import {
  createBranch,
  clearCreateError,
  resetCreateState,
} from './slice/createBranchSlice';
import {
  modifyBranch,
  clearModifyError,
  resetModifyState,
} from './slice/modifyBranchSlice';
import {
  getBranch,
  clearGetBranchError,
  resetGetBranchState,
} from './slice/getBranchSlice';
import {
  fetchBranchTrackStatus,
  clearError as clearTrackStatusError,
  resetBranchTrackStatusState,
} from './slice/branchTrackStatusSlice';
import type { CreateBranchRequest } from './types/createBranch';
import type { ModifyBranchRequest } from './types/modifyBranch';

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
import {
  containerStyles,
  backButtonStyles,
  titleStyles,
  sectionTitleStyles,
  labelStyles,
  requiredIndicatorStyles,
  textFieldStyles,
  selectStyles,
  submitButtonContainerStyles,
  submitButtonStyles,
  transferButtonStyles,
  modifyButtonStyles,
  paperStyles,
  addressSectionStyles,
} from './CreateNewBranch.styles';
import NavigationBreadCrumb, {
  ICrumbs,
} from '../NavigationBreadCrumb/NavigationBreadCrumb';
import StatusScreen from '../TrackStatus/StatusScreen';
import DateUtils from '../../../../utils/dateUtils';
import {
  ValidationUtils,
  maxLengthByFieldType,
  isValidDigipin,
  maxLengthByIdType,
} from '../../../../utils/validationUtils';

const CreateNewBranch: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Determine if this is modify mode
  const isModifyMode = Boolean(id);
  const branchData = location.state?.branchData;
  const isApprovedBranch = branchData?.status === 'Approved';

  const {
    deactivateBranch,
    isTrack,
    status,
    workflowId: trackStatusWorkflowId,
  } = location.state || {};

  // Get auth state for userId
  const authState = useSelector((state: RootState) => state.auth);
  const userId = authState?.userDetails?.userId || '';

  // Get regions from fetchRegions slice
  const { data: approvedRegions } = useSelector(
    (state: RootState) => state.fetchRegionsManagement
  );

  // Get geography hierarchy from Redux store
  const { geographyHierarchy, loading } = useSelector(
    (state: RootState) => state.masters
  );

  // Get branch creation state from Redux store
  const {
    createLoading,
    createSuccess,
    createError,
    workflowId,
    message: createMessage,
  } = useSelector((state: RootState) => state.createBranch);

  // Get branch modification state from Redux store
  const {
    loading: modifyLoading,
    success: modifySuccess,
    error: modifyError,
    workflowId: modifyWorkflowId,
  } = useSelector((state: RootState) => state.modifyBranch);

  // Get branch details state from Redux store
  const { data: branchDetails, error: getBranchError } = useSelector(
    (state: RootState) => state.getBranch
  );

  // Get branch track status state from Redux store
  const { data: branchTrackStatusData, error: branchTrackStatusError } =
    useSelector((state: RootState) => state.branchTrackStatus);

  // Local state for cascading dropdowns (matching CreateNewRegion)
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availablePincodes, setAvailablePincodes] = useState<Pincode[]>([]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const initialFormDataValues = {
    regionName: '',
    regionCode: '',
    branchName: '',
    branchCode: '',
    status: 'Active',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    countryCode: '',
    countryName: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    otherPincode: '',
    digiPin: '',
  };
  const [formData, setFormData] = useState(initialFormDataValues);

  const [validationErrors, setValidationErrors] = useState({
    branchName: '',
    branchCode: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    otherPincode: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    digiPin: '',
  });

  // Check if selected country is India
  const isIndiaSelected = formData.countryCode === 'IN';

  // Handle country selection and update states (matching CreateNewRegion)
  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = geographyHierarchy.find(
      (country: Country) => country.code === countryCode
    );
    if (selectedCountry) {
      setAvailableStates(selectedCountry.states || []);
      setAvailableDistricts([]);
      setAvailablePincodes([]); // Reset pincodes when country changes
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        countryCode,
        countryName: selectedCountry.name || '',
        state: '',
        district: '',
        pincode: '',
      }));
    } else {
      // If country not found in hierarchy (non-India), reset dependent fields
      setAvailableStates([]);
      setAvailableDistricts([]);
      setAvailablePincodes([]);
      const countryName =
        geographyHierarchy.find(
          (country: Country) => country.code === countryCode
        )?.name || '';
      setFormData((prev) => ({
        ...prev,
        countryCode,
        countryName,
        state: '',
        district: '',
        pincode: '',
      }));
    }
  };

  // Handle state selection and update districts (matching CreateNewRegion)
  const handleStateChange = (stateId: string) => {
    const selectedState = availableStates.find(
      (state: State) => state.id.toString() === stateId
    );
    if (selectedState && selectedState.districts) {
      setAvailableDistricts(selectedState.districts || []);
      setAvailablePincodes([]); // Reset pincodes when state changes
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        state: stateId,
        district: '',
        pincode: '',
      }));
    }
  };

  // Handle district selection and update pincodes (matching CreateNewRegion)
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

    // Handle cascading dropdown changes (matching CreateNewRegion)
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
    } else {
      // Convert branchCode to uppercase automatically
      let processedValue = value;
      if (name === 'branchName') {
        // Limit to 50 characters
        if (processedValue.length > 50) {
          processedValue = processedValue.substring(0, 50);
        }
        // Validate branchName - alphanumeric only, max 50 characters
        if (!processedValue || processedValue.trim() === '') {
          setValidationErrors((prev) => ({
            ...prev,
            branchName: 'Branch Name is required',
          }));
        } else if (!ValidationUtils.isValidAlphanumeric(processedValue)) {
          setValidationErrors((prev) => ({
            ...prev,
            branchName: 'Branch Name can only contain alphanumeric characters',
          }));
        } else if (processedValue.length > 50) {
          setValidationErrors((prev) => ({
            ...prev,
            branchName: 'Branch Name cannot exceed 50 characters',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            branchName: '',
          }));
        }
      } else if (name === 'branchCode') {
        processedValue = value.toUpperCase();
        // Limit to 20 characters
        if (processedValue.length > 20) {
          processedValue = processedValue.substring(0, 20);
        }
        // Validate branchCode - alphanumeric only, max 20 characters
        if (!processedValue || processedValue.trim() === '') {
          setValidationErrors((prev) => ({
            ...prev,
            branchCode: 'Branch Code is required',
          }));
        } else if (!ValidationUtils.isValidAlphanumeric(processedValue)) {
          setValidationErrors((prev) => ({
            ...prev,
            branchCode: 'Branch Code can only contain alphanumeric characters',
          }));
        } else if (processedValue.length > 20) {
          setValidationErrors((prev) => ({
            ...prev,
            branchCode: 'Branch Code cannot exceed 20 characters',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            branchCode: '',
          }));
        }
      } else if (name === 'city') {
        // Limit to 60 characters
        if (processedValue.length > 60) {
          processedValue = processedValue.substring(0, 60);
        }
        // Validate city - alphanumeric only, max 60 characters
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
        } else if (processedValue.length > 60) {
          setValidationErrors((prev) => ({
            ...prev,
            city: 'City/Town cannot exceed 60 characters',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            city: '',
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
          const matchingPincode = availablePincodes.find(
            (pincode: Pincode) =>
              String(pincode.pincode).toLowerCase() ===
              processedValue.toLowerCase()
          );

          if (matchingPincode) {
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
      } else if (name === 'digiPin') {
        processedValue = processedValue.toUpperCase();
        if (processedValue.length > maxLengthByIdType.DIGIPIN) {
          processedValue = processedValue.substring(
            0,
            maxLengthByIdType.DIGIPIN
          );
        }
        if (processedValue && !isValidDigipin(processedValue)) {
          setValidationErrors((prev) => ({
            ...prev,
            digiPin:
              'Invalid Digipin. Format: XXX-XXX-XXXX. Allowed characters: 2-9, C, F, J, K, L, M, P, T.',
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            digiPin: '',
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

  // Handle action button clicks
  const handleDeactivate = () => {
    setShowDeactivateModal(true);
  };

  const handleDeactivateClose = () => {
    setShowDeactivateModal(false);
  };

  const handleTransfer = () => {
    // Find the region name from the selected region code
    const selectedRegion = (approvedRegions || []).find(
      (region: RegionData) => region.regionCode === formData.regionName
    );

    navigate('/re/transfer-branch', {
      state: {
        branchData: {
          ...branchData,
          regionName: selectedRegion?.regionName || formData.regionName,
          regionCode: formData.regionName,
        },
      },
    });
  };

  // const handleMerge = () => {
  //   // Find the region name from the selected region code
  //   const selectedRegion = approvedRegions.find(
  //     (region) => region.regionCode === formData.regionName
  //   );

  //   navigate('/re/merge-branch', {
  //     state: {
  //       branchData: {
  //         ...branchData,
  //         regionName: selectedRegion?.regionName || formData.regionName,
  //         regionCode: formData.regionName,
  //       },
  //     },
  //   });
  // };

  const handleModify = () => {
    // For India, find the state and district names from the ID
    // For other countries, use the text values directly
    let stateValue = formData.state;
    let districtValue = formData.district;
    let pincodeValue = formData.pincode;

    if (isIndiaSelected) {
      const selectedState = availableStates.find(
        (state: State) => state.id.toString() === formData.state
      );
      const selectedDistrict = availableDistricts.find(
        (district: District) => district.id.toString() === formData.district
      );
      const selectedPincode = availablePincodes.find(
        (pincode: Pincode) => pincode.pincode === formData.pincode
      );
      stateValue = selectedState?.name || formData.state;
      districtValue = selectedDistrict?.name || formData.district;
      pincodeValue = selectedPincode?.pincode || formData.pincode;
    }

    // Find the region name from the selected region code
    const selectedRegion = (approvedRegions || []).find(
      (region: RegionData) => region.regionCode === formData.regionName
    );

    const modifyRequest: ModifyBranchRequest = {
      branchName: formData.branchName,
      branchCode: formData.branchCode,
      regionCode: formData.regionName,
      regionName: selectedRegion?.regionName || formData.regionName,
      userId: userId,
      address: {
        line1: formData.addressLine1,
        line2: formData.addressLine2 || undefined,
        line3: formData.addressLine3 || undefined,
        countryCode: formData.countryCode,
        country: formData.countryName,
        state: stateValue,
        district: districtValue,
        city: formData.city,
        pinCode: pincodeValue,
        alternatePinCode: formData.otherPincode || undefined,
        digiPin: formData.digiPin || undefined,
      },
    };

    dispatch(
      modifyBranch({ branchCode: formData.branchCode, data: modifyRequest })
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If in modify mode, call handleModify instead
    if (isModifyMode) {
      handleModify();
      return;
    }

    // For India, find the state and district names from the ID
    // For other countries, use the text values directly
    let stateValue = formData.state;
    let districtValue = formData.district;
    let pincodeValue = formData.pincode;

    if (isIndiaSelected) {
      const selectedState = availableStates.find(
        (state: State) => state.id.toString() === formData.state
      );
      const selectedDistrict = availableDistricts.find(
        (district: District) => district.id.toString() === formData.district
      );
      const selectedPincode = availablePincodes.find(
        (pincode: Pincode) => pincode.pincode === formData.pincode
      );
      stateValue = selectedState?.name || formData.state;
      districtValue = selectedDistrict?.name || formData.district;
      pincodeValue = selectedPincode?.pincode || formData.pincode;
    }

    // Find the region name from the selected region code
    const selectedRegion = (approvedRegions || []).find(
      (region: RegionData) => region.regionCode === formData.regionName
    );

    const branchRequest: CreateBranchRequest = {
      branchCode: formData.branchCode,
      branchName: formData.branchName,
      regionCode: formData.regionName, // formData.regionName contains the region code value
      regionName: selectedRegion?.regionName || formData.regionName,
      userId: userId,
      address: {
        line1: formData.addressLine1,
        line2: formData.addressLine2 || undefined,
        line3: formData.addressLine3 || undefined,
        countryCode: formData.countryCode,
        country: formData.countryName,
        state: stateValue,
        district: districtValue,
        city: formData.city,
        digiPin: formData.digiPin || undefined,
        pinCode: pincodeValue,
        alternatePinCode: formData.otherPincode || undefined,
      },
    };

    dispatch(createBranch(branchRequest));
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    dispatch(resetCreateState());
    dispatch(resetModifyState());
    // Redirect to track-branch-status page
    navigate('/re/track-branch-status');
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    dispatch(clearCreateError());
    dispatch(clearModifyError());
    dispatch(clearGetBranchError());
    dispatch(clearTrackStatusError());
  };

  // Fetch regions and geography hierarchy on component mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchRegions({ userId }));
    }
    dispatch(fetchGeographyHierarchy());

    // Fetch branch details if in modify mode
    if (isModifyMode && id) {
      // If coming from track status page, use track status API
      if (isTrack && trackStatusWorkflowId) {
        dispatch(fetchBranchTrackStatus(trackStatusWorkflowId));
      } else {
        // Otherwise use regular get branch API
        dispatch(getBranch(id));
      }
    }

    return () => {
      dispatch(clearFetchRegionsData());
      if (isTrack) {
        dispatch(resetBranchTrackStatusState());
      }
    };
  }, [dispatch, userId, isModifyMode, id, isTrack, trackStatusWorkflowId]);

  // Handle Redux state changes for success/error
  useEffect(() => {
    if (createSuccess && workflowId) {
      setShowSuccessModal(true);
      setShowErrorModal(false); // Close error modal on success
      dispatch(clearCreateError()); // Clear any previous errors
    }
  }, [createSuccess, workflowId, dispatch]);

  useEffect(() => {
    if (modifySuccess && modifyWorkflowId) {
      setShowSuccessModal(true);
      setShowErrorModal(false); // Close error modal on success
      dispatch(clearModifyError()); // Clear any previous errors
    }
  }, [modifySuccess, modifyWorkflowId, dispatch]);

  useEffect(() => {
    if (createError) {
      setShowErrorModal(true);
    }
  }, [createError]);

  useEffect(() => {
    if (modifyError) {
      setShowErrorModal(true);
    }
  }, [modifyError]);

  useEffect(() => {
    if (getBranchError) {
      setShowErrorModal(true);
    }
  }, [getBranchError]);

  useEffect(() => {
    if (branchTrackStatusError) {
      setShowErrorModal(true);
    }
  }, [branchTrackStatusError]);

  // Populate form fields when branch details are fetched (regular API)
  useEffect(() => {
    if (branchDetails && isModifyMode && !isTrack) {
      console.log('Populating form with branch details:', branchDetails);

      // Always populate basic fields first
      const address = branchDetails.address;
      const basicFormData = {
        regionName: branchDetails.regionCode || '',
        regionCode: branchDetails.regionCode || '',
        branchName: branchDetails.branchName || '',
        branchCode: branchDetails.branchCode || '',
        status: 'Active',
        addressLine1: address?.line1 || '',
        addressLine2: address?.line2 || '',
        addressLine3: address?.line3 || '',
        city: address?.cityTown || '',
        otherPincode: address?.alternatePinCode || '',
        digiPin: address?.digiPin || '',
        countryCode: address?.countryCode || '',
        countryName:
          geographyHierarchy.find(
            (country: Country) => country.code === address?.countryCode
          )?.name || '',
        state: address?.state || '',
        district: address?.district || '',
        pincode: address?.pinCode || '',
      };

      // Set form data immediately with API values
      setFormData(basicFormData);
      console.log('Basic form data populated:', basicFormData);
    }
  }, [branchDetails, isModifyMode, isTrack, geographyHierarchy]);

  // Ensure region is set correctly once both branchDetails and approvedRegions are available
  useEffect(() => {
    if (branchDetails?.regionCode && isModifyMode && !isTrack) {
      const regionCode = branchDetails.regionCode;

      // Find the region in approvedRegions if available
      const region = approvedRegions?.find(
        (region: RegionData) => region.regionCode === regionCode
      );

      // Find region name from approvedRegions if available
      const regionName = region?.regionName || regionCode;

      console.log('Region lookup:', {
        branchRegionCode: regionCode,
        branchRegionName: regionName,
        foundRegion: region,
        approvedRegionsCount: approvedRegions?.length || 0,
        currentFormRegion: formData.regionName,
      });

      // Always ensure region is set, regardless of whether it's in approvedRegions
      if (formData.regionName !== regionCode) {
        console.log('Setting region from branchDetails:', regionCode);
        setFormData((prev) => ({
          ...prev,
          regionName: regionCode,
          regionCode: regionCode,
        }));
      }
    }
  }, [
    branchDetails?.regionCode,
    approvedRegions,
    isModifyMode,
    isTrack,
    formData.regionName,
  ]);

  // Ensure region is set correctly for track status path once both data and approvedRegions are available
  useEffect(() => {
    if (
      branchTrackStatusData?.entityDetails?.regionCode &&
      approvedRegions &&
      approvedRegions.length > 0 &&
      isModifyMode &&
      isTrack
    ) {
      const regionCode = branchTrackStatusData.entityDetails.regionCode;
      // Verify that the regionCode exists in approvedRegions
      const regionExists = approvedRegions.some(
        (region: RegionData) => region.regionCode === regionCode
      );

      if (regionExists && formData.regionName !== regionCode) {
        console.log(
          'Updating region after approvedRegions loaded (track status):',
          regionCode
        );
        setFormData((prev) => ({
          ...prev,
          regionName: regionCode || '',
          regionCode: regionCode || '',
        }));
      }
    }
  }, [
    branchTrackStatusData?.entityDetails?.regionCode,
    approvedRegions,
    isModifyMode,
    isTrack,
    formData.regionName,
  ]);

  // Populate form fields when branch track status data is fetched
  useEffect(() => {
    if (branchTrackStatusData && isModifyMode && isTrack) {
      console.log(
        'Populating form with branch track status data:',
        branchTrackStatusData
      );

      const entityDetails = branchTrackStatusData.entityDetails;
      if (!entityDetails) {
        console.error('Entity details not found in branch track status data');
        return;
      }
      const address = entityDetails.address || {};

      const basicFormData = {
        regionName: entityDetails.regionCode || '',
        regionCode: entityDetails.regionCode || '',
        branchName: entityDetails.branchName || '',
        branchCode: entityDetails.branchCode || '',
        status: entityDetails.status === 'ACTIVE' ? 'Active' : 'Inactive',
        addressLine1: address?.line1 || '',
        addressLine2: address?.line2 || '',
        addressLine3: address?.line3 || '',
        city: address?.city || '',
        otherPincode: address?.alternatePinCode || '',
        digiPin: address?.digiPin || '',
        countryCode: address?.countryCode || '',
        countryName:
          geographyHierarchy.find(
            (country: Country) => country.code === address?.countryCode
          )?.name || '',
        state: address?.state || '',
        district: address?.district || '',
        pincode: address?.pinCode || '',
      };

      // Set form data immediately with API values
      setFormData(basicFormData);
      console.log(
        'Basic form data populated from track status:',
        basicFormData
      );
    }
  }, [branchTrackStatusData, isModifyMode, isTrack, geographyHierarchy]);

  // Handle cascading dropdowns separately when geography hierarchy is loaded
  useEffect(() => {
    if (
      (branchDetails || branchTrackStatusData) &&
      isModifyMode &&
      geographyHierarchy.length > 0 &&
      formData.countryCode
    ) {
      console.log(
        'Setting up cascading dropdowns for country:',
        formData.countryCode
      );

      // Find the country and set up cascading dropdowns
      const selectedCountry = geographyHierarchy.find(
        (country: Country) => country.code === formData.countryCode
      );

      // If country is India (IN), use dropdown logic
      if (selectedCountry && formData.countryCode === 'IN') {
        console.log('Found country:', selectedCountry.name);
        setAvailableStates(selectedCountry.states || []);

        // Find the state by ID or name
        const selectedState = selectedCountry.states?.find(
          (state: State) =>
            state.id.toString() === formData.state ||
            state.name === formData.state
        );

        if (selectedState) {
          console.log(
            'Found state:',
            selectedState.name,
            'ID:',
            selectedState.id
          );
          setAvailableDistricts(selectedState.districts || []);

          // Update form data to use the correct state ID
          setFormData((prev) => ({
            ...prev,
            state: selectedState.id.toString(),
          }));

          // Find the district by ID or name
          const selectedDistrict = selectedState.districts?.find(
            (district: District) =>
              district.id.toString() === formData.district ||
              district.name === formData.district
          );

          if (selectedDistrict) {
            console.log(
              'Found district:',
              selectedDistrict.name,
              'ID:',
              selectedDistrict.id
            );
            setAvailablePincodes(selectedDistrict.pincodes || []);

            // Update form data to use the correct district ID
            setFormData((prev) => ({
              ...prev,
              district: selectedDistrict.id.toString(),
            }));

            // Find the pincode object that matches the API pincode value
            const selectedPincode = selectedDistrict.pincodes?.find(
              (p: Pincode) => p.pincode === formData.pincode
            );

            if (selectedPincode) {
              console.log('Found pincode:', selectedPincode.pincode);
            } else {
              console.log(
                'Pincode not found in geography hierarchy, keeping API value:',
                formData.pincode
              );
            }
          } else {
            console.log(
              'District not found in geography hierarchy by ID or name:',
              formData.district
            );
          }
        } else {
          console.log(
            'State not found in geography hierarchy by ID or name:',
            formData.state
          );
        }
      } else {
        // For non-India countries, use text values directly
        console.log(
          'Non-India country or country not found, using text values:',
          formData.countryCode
        );
        setAvailableStates([]);
        setAvailableDistricts([]);
        setAvailablePincodes([]);
      }
    }
  }, [
    branchDetails,
    branchTrackStatusData,
    isModifyMode,
    geographyHierarchy,
    formData.countryCode,
    formData.state,
    formData.district,
    formData.pincode,
  ]);

  // Debug logging to check data structure
  useEffect(() => {}, [
    geographyHierarchy,
    approvedRegions,
    availableStates,
    availableDistricts,
    availablePincodes,
  ]);

  const initialBreadCrumb = [
    {
      label: 'User Management',
      path: '/re/dashboard',
    },
    {
      label: 'Branch',
      path: '/re/modify-branch',
    },
  ];

  const [navigationItem, setNavigationItem] =
    useState<ICrumbs[]>(initialBreadCrumb);

  useEffect(() => {
    const { pathname } = location;

    if (pathname.includes('create-new-branch')) {
      setNavigationItem([...initialBreadCrumb, { label: 'Create' }]);
    } else if (pathname.includes('modify-branch')) {
      setNavigationItem([
        ...initialBreadCrumb,
        { label: 'Modify', path: '/re/modify-branch' },
        { label: 'Branch Details', path: '/re/modify-branch' },
      ]);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (deactivateBranch) {
      setNavigationItem([
        {
          label: 'User Management',
          path: '/re/dashboard',
        },
        {
          label: 'Branch',
          path: '/re/modify-branch',
        },
        { label: 'De-activate', path: '/re/deactivate-branch' },
        { label: 'Branch Details', path: '/re/modify-branch' },
      ]);
    }
  }, [deactivateBranch]);

  useEffect(() => {
    if (isTrack) {
      setNavigationItem([
        ...initialBreadCrumb,
        { label: 'Track Status', path: '/re/track-branch-status' },
        { label: 'Branch Details', path: '/re/modify-branch' },
      ]);
    }
  }, [isTrack]);

  useEffect(() => {
    return () => {
      dispatch(resetGetBranchState());
      setFormData(initialFormDataValues);
    };
  }, [location.pathname]);

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

      {isTrack &&
        (() => {
          // Get status from branchTrackStatusData if available, otherwise use status from location state
          const currentStatus =
            branchTrackStatusData?.status || status || 'Approval Pending';
          const normalizedStatus =
            currentStatus === 'APPROVED'
              ? 'Approved'
              : currentStatus === 'REJECTED'
                ? 'Rejected'
                : currentStatus === 'APPROVAL_PENDING'
                  ? 'Approval Pending'
                  : currentStatus;

          // For approved items, use actionOn (when it was approved), for others use submittedOn
          const isApproved =
            normalizedStatus === 'Approved' ||
            branchTrackStatusData?.status === 'APPROVED';
          const isRejected =
            normalizedStatus === 'Rejected' ||
            branchTrackStatusData?.status === 'REJECTED';

          return (
            <StatusScreen
              status={
                normalizedStatus as 'Approved' | 'Rejected' | 'Approval Pending'
              }
              approvedBy={
                isApproved &&
                (branchTrackStatusData?.workflowCompletion?.approvedBy ||
                  branchTrackStatusData?.submittedBy)
                  ? branchTrackStatusData.workflowCompletion?.approvedBy ||
                    branchTrackStatusData.submittedBy
                  : undefined
              }
              approvedOn={
                isApproved &&
                (branchTrackStatusData?.workflowCompletion?.approvedOn ||
                  branchTrackStatusData?.actionOn)
                  ? DateUtils.formatDate(
                      branchTrackStatusData.workflowCompletion?.approvedOn ||
                        branchTrackStatusData.actionOn
                    )
                  : undefined
              }
              rejectedBy={
                isRejected &&
                (branchTrackStatusData?.workflowCompletion?.rejectedBy ||
                  branchTrackStatusData?.submittedBy)
                  ? branchTrackStatusData.workflowCompletion?.rejectedBy ||
                    branchTrackStatusData.submittedBy
                  : undefined
              }
              rejectedOn={
                isRejected &&
                (branchTrackStatusData?.workflowCompletion?.rejectedOn ||
                  branchTrackStatusData?.actionOn)
                  ? DateUtils.formatDate(
                      branchTrackStatusData.workflowCompletion?.rejectedOn ||
                        branchTrackStatusData.actionOn
                    )
                  : undefined
              }
              remark={
                isRejected && branchTrackStatusData?.workflowCompletion?.remark
                  ? branchTrackStatusData.workflowCompletion.remark
                  : undefined
              }
            />
          );
        })()}

      <Paper elevation={0} sx={paperStyles}>
        <Typography variant="h6" sx={titleStyles}>
          {isModifyMode ? 'Branch Details' : 'Create New Branch'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Select Region - Responsive Width */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={labelStyles}>
              {isModifyMode ? 'Region' : 'Select Region'}{' '}
              <span style={requiredIndicatorStyles}>*</span>
            </Typography>
            <FormControl
              size="small"
              sx={{
                width: { xs: '100%', sm: '350px' },
                maxWidth: '100%',
              }}
            >
              <Select
                name="regionName"
                value={formData.regionName}
                onChange={handleChange}
                displayEmpty
                required
                disabled={isModifyMode}
                sx={selectStyles}
              >
                <MenuItem value="" disabled>
                  Select region
                </MenuItem>
                {(() => {
                  // Create a combined list of regions
                  const regionsList = [...(approvedRegions || [])];

                  // In modify mode, if the current region is not in approvedRegions, add it
                  if (
                    isModifyMode &&
                    branchDetails?.regionCode &&
                    !regionsList.some(
                      (r: RegionData) =>
                        r.regionCode === branchDetails.regionCode
                    )
                  ) {
                    // Find region name from approvedRegions or use regionCode as fallback
                    const regionFromList = approvedRegions?.find(
                      (r: RegionData) =>
                        r.regionCode === branchDetails.regionCode
                    );
                    // Add the region from branchDetails if it's not in the list
                    regionsList.push({
                      regionCode: branchDetails.regionCode,
                      regionName:
                        regionFromList?.regionName || branchDetails.regionCode,
                      status: regionFromList?.status || 'ACTIVE',
                    } as RegionData);
                  }

                  // In track status mode, if the current region is not in approvedRegions, add it
                  if (
                    isModifyMode &&
                    isTrack &&
                    branchTrackStatusData?.entityDetails?.regionCode &&
                    !regionsList.some(
                      (r: RegionData) =>
                        r.regionCode ===
                        branchTrackStatusData.entityDetails.regionCode
                    )
                  ) {
                    // Add the region from branchTrackStatusData if it's not in the list
                    regionsList.push({
                      regionCode:
                        branchTrackStatusData.entityDetails.regionCode,
                      regionName:
                        branchTrackStatusData.entityDetails.regionName ||
                        branchTrackStatusData.entityDetails.regionCode,
                      status: 'ACTIVE',
                    } as RegionData);
                  }

                  return regionsList
                    .filter((region: RegionData) => {
                      // In modify mode, show all regions (including the current one even if inactive)
                      const isCurrentRegion =
                        (isModifyMode &&
                          formData.regionCode === region.regionCode) ||
                        (isModifyMode &&
                          branchDetails?.regionCode === region.regionCode) ||
                        (isModifyMode &&
                          isTrack &&
                          branchTrackStatusData?.entityDetails?.regionCode ===
                            region.regionCode);
                      if (isCurrentRegion) {
                        return true;
                      }
                      // Otherwise, only show ACTIVE regions
                      return region.status === 'ACTIVE';
                    })
                    .map((region: RegionData) => (
                      <MenuItem
                        key={region.regionCode}
                        value={region.regionCode}
                      >
                        {region.regionName}
                      </MenuItem>
                    ));
                })()}
              </Select>
            </FormControl>
          </Box>

          {/* Branch Name and Branch Code - No Gap */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 1 },
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={labelStyles}>
                Branch Name <span style={requiredIndicatorStyles}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                placeholder="Enter branch name here"
                inputProps={{ maxLength: 50 }}
                required
                disabled={deactivateBranch || isTrack ? true : false}
                size="small"
                error={!!validationErrors.branchName}
                helperText={validationErrors.branchName}
                sx={{
                  ...textFieldStyles,
                  width: { xs: '100%', sm: '350px' },
                  mr: { xs: 0, sm: '8px' },
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={labelStyles}>
                Branch Code <span style={requiredIndicatorStyles}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                name="branchCode"
                value={formData.branchCode}
                onChange={handleChange}
                placeholder="Enter branch code here"
                required
                disabled={isModifyMode}
                size="small"
                error={!!validationErrors.branchCode}
                helperText={validationErrors.branchCode}
                inputProps={{ maxLength: 20 }}
                sx={{
                  ...textFieldStyles,
                  width: { xs: '100%', sm: '350px' },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ width: '100%' }}>
            {/* Address Details Section */}
            <Box sx={addressSectionStyles}>
              <Typography variant="h6" sx={sectionTitleStyles}>
                Address Details
              </Typography>

              {/* Row 1: Address Lines */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Address Line 1{' '}
                    <span style={requiredIndicatorStyles}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    inputProps={{ maxLength: 60 }}
                    placeholder="Enter Address Line 1"
                    required
                    disabled={deactivateBranch || isTrack ? true : false}
                    size="small"
                    sx={textFieldStyles}
                    error={!!validationErrors.addressLine1}
                    helperText={validationErrors.addressLine1}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
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
                    disabled={deactivateBranch || isTrack ? true : false}
                    placeholder="Enter Address Line 2"
                    size="small"
                    sx={textFieldStyles}
                    error={!!validationErrors.addressLine2}
                    helperText={validationErrors.addressLine2}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Address Line 3
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="addressLine3"
                    value={formData.addressLine3}
                    onChange={handleChange}
                    inputProps={{ maxLength: 60 }}
                    placeholder="Enter Address Line 3"
                    size="small"
                    sx={textFieldStyles}
                    disabled={deactivateBranch || isTrack ? true : false}
                    error={!!validationErrors.addressLine3}
                    helperText={validationErrors.addressLine3}
                  />
                </Box>
              </Box>

              {/* Row 2: Country, State, District */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Country <span style={requiredIndicatorStyles}>*</span>
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      displayEmpty
                      required
                      sx={selectStyles}
                      disabled={loading || deactivateBranch || isTrack}
                    >
                      <MenuItem value="" disabled>
                        Select Country
                      </MenuItem>
                      {geographyHierarchy.map((country: Country) => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    State / UT{' '}
                    {isIndiaSelected && (
                      <span style={requiredIndicatorStyles}>*</span>
                    )}
                  </Typography>
                  {!formData.countryCode || isIndiaSelected ? (
                    <FormControl fullWidth size="small">
                      <Select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        displayEmpty
                        inputProps={{ maxLength: 60 }}
                        required={isIndiaSelected}
                        sx={selectStyles}
                        disabled={
                          !formData.countryCode ||
                          availableStates.length === 0 ||
                          deactivateBranch ||
                          isTrack
                        }
                      >
                        <MenuItem value="" disabled>
                          Select State/UT
                        </MenuItem>
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
                      disabled={deactivateBranch || isTrack}
                      sx={textFieldStyles}
                      inputProps={{ maxLength: maxLengthByFieldType.STATE }}
                      error={!!validationErrors.state}
                      helperText={validationErrors.state}
                    />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    District{' '}
                    {isIndiaSelected && (
                      <span style={requiredIndicatorStyles}>*</span>
                    )}
                  </Typography>
                  {!formData.countryCode || isIndiaSelected ? (
                    <FormControl fullWidth size="small">
                      <Select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        displayEmpty
                        required={isIndiaSelected}
                        sx={selectStyles}
                        disabled={
                          !formData.state ||
                          availableDistricts.length === 0 ||
                          deactivateBranch ||
                          isTrack
                        }
                      >
                        <MenuItem value="" disabled>
                          Select District
                        </MenuItem>
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
                      disabled={deactivateBranch || isTrack}
                      sx={textFieldStyles}
                      inputProps={{ maxLength: maxLengthByFieldType.DISTRICT }}
                      error={!!validationErrors.district}
                      helperText={validationErrors.district}
                    />
                  )}
                </Box>
              </Box>

              {/* Row 3: City, Pincode, Digipin (default) or Pin Code (in case of others) when Other is selected */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    City/Town{' '}
                    {isIndiaSelected && (
                      <span style={requiredIndicatorStyles}>*</span>
                    )}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter City/Town"
                    required={isIndiaSelected}
                    size="small"
                    error={!!validationErrors.city}
                    helperText={validationErrors.city}
                    inputProps={{ maxLength: maxLengthByFieldType.CITY }}
                    sx={textFieldStyles}
                    disabled={deactivateBranch || isTrack ? true : false}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Pin Code{' '}
                    {isIndiaSelected && (
                      <span style={requiredIndicatorStyles}>*</span>
                    )}
                  </Typography>
                  {!formData.countryCode || isIndiaSelected ? (
                    <FormControl fullWidth size="small">
                      <Select
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        displayEmpty
                        required={isIndiaSelected}
                        sx={selectStyles}
                        disabled={
                          deactivateBranch ||
                          isTrack ||
                          !formData.district ||
                          availableDistricts.length === 0
                        }
                      >
                        <MenuItem value="" disabled>
                          Select Pin Code
                        </MenuItem>
                        {availablePincodes.map((pincode: Pincode) => (
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
                      disabled={deactivateBranch || isTrack}
                      sx={textFieldStyles}
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
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={labelStyles}>
                      Pin Code (in case of others){' '}
                      <span style={requiredIndicatorStyles}>*</span>
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
                      sx={textFieldStyles}
                      disabled={deactivateBranch || isTrack ? true : false}
                      error={!!validationErrors.otherPincode}
                      helperText={validationErrors.otherPincode}
                      inputProps={{ maxLength: 6 }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={labelStyles}>
                      Digipin
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="digiPin"
                      inputProps={{ maxLength: maxLengthByFieldType.DIGIPIN }}
                      value={formData.digiPin}
                      onChange={handleChange}
                      placeholder="Enter Digipin"
                      size="small"
                      disabled={deactivateBranch || isTrack}
                      sx={textFieldStyles}
                      error={!!validationErrors.digiPin}
                      helperText={validationErrors.digiPin}
                    />
                  </Box>
                )}
              </Box>

              {/* Row 4: Digipin (only shown when Other is selected) */}
              {formData.pincode === '000000' && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box sx={{ flex: 1, maxWidth: '350px' }}>
                    <Typography variant="subtitle2" sx={labelStyles}>
                      Digipin
                    </Typography>
                    <TextField
                      variant="outlined"
                      name="digiPin"
                      inputProps={{ maxLength: 10 }}
                      value={formData.digiPin}
                      onChange={handleChange}
                      placeholder="Enter Digipin"
                      size="small"
                      disabled={deactivateBranch || isTrack}
                      sx={{
                        ...textFieldStyles,
                        width: '100%',
                      }}
                      error={!!validationErrors.digiPin}
                      helperText={validationErrors.digiPin}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {!isTrack && (
              <Box sx={submitButtonContainerStyles}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: { xs: 1, sm: 2 },
                    mt: 4,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                  }}
                >
                  {isModifyMode && (isApprovedBranch || deactivateBranch) ? (
                    // Show action buttons for approved branches in modify mode or when coming from deactivate page
                    <>
                      {deactivateBranch && (
                        <Button
                          type="button"
                          variant="contained"
                          onClick={handleDeactivate}
                          sx={{
                            ...modifyButtonStyles,
                            width: { xs: '100%', sm: '150px' },
                            maxWidth: '300px',
                          }}
                        >
                          De-activate
                        </Button>
                      )}

                      {!deactivateBranch && (
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={handleTransfer}
                          sx={{
                            ...transferButtonStyles,
                            width: { xs: '100%', sm: '150px' },
                            maxWidth: '300px',
                          }}
                        >
                          Transfer
                        </Button>
                      )}

                      {!deactivateBranch && (
                        <Button
                          type="button"
                          variant="contained"
                          onClick={handleModify}
                          disabled={
                            !formData.regionName ||
                            !formData.branchName ||
                            !formData.branchCode ||
                            !formData.addressLine1 ||
                            !formData.countryCode ||
                            (isIndiaSelected && !formData.state) ||
                            (isIndiaSelected && !formData.district) ||
                            (isIndiaSelected && !formData.city) ||
                            (isIndiaSelected && !formData.pincode) ||
                            (isIndiaSelected &&
                              formData.pincode === '000000' &&
                              !formData.otherPincode) ||
                            !!validationErrors.addressLine1 ||
                            !!validationErrors.addressLine2 ||
                            !!validationErrors.addressLine3 ||
                            !!validationErrors.otherPincode ||
                            !!validationErrors.digiPin ||
                            modifyLoading
                          }
                          sx={{
                            ...modifyButtonStyles,
                            width: { xs: '100%', sm: '150px' },
                            maxWidth: '300px',
                          }}
                        >
                          {modifyLoading ? 'Modifying...' : 'Modify'}
                        </Button>
                      )}
                    </>
                  ) : (
                    // Show submit button for create mode or non-approved branches
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        !formData.regionName ||
                        !formData.branchName ||
                        !formData.branchCode ||
                        !formData.addressLine1 ||
                        !formData.countryCode ||
                        (isIndiaSelected && !formData.state) ||
                        (isIndiaSelected && !formData.district) ||
                        (isIndiaSelected && !formData.city) ||
                        (isIndiaSelected && !formData.pincode) ||
                        (isIndiaSelected &&
                          formData.pincode === '000000' &&
                          !formData.otherPincode) ||
                        !!validationErrors.branchName ||
                        !!validationErrors.branchCode ||
                        !!validationErrors.addressLine1 ||
                        !!validationErrors.addressLine2 ||
                        !!validationErrors.addressLine3 ||
                        !!validationErrors.otherPincode ||
                        !!validationErrors.digiPin ||
                        createLoading
                      }
                      sx={{
                        ...submitButtonStyles,
                        width: { xs: '100%', sm: '150px' },
                        maxWidth: '300px',
                      }}
                    >
                      {createLoading
                        ? 'Creating...'
                        : isModifyMode
                          ? 'Update'
                          : 'Submit'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <ConfirmationModal
        open={showSuccessModal}
        onClose={handleModalClose}
        message={
          isModifyMode
            ? 'Submitted for approval'
            : createMessage || 'Submitted for approval'
        }
        confirmButtonText="Okay"
      />

      <ErrorModal
        open={showErrorModal}
        onClose={handleErrorModalClose}
        primaryMessage={
          (createError ||
            modifyError ||
            getBranchError ||
            branchTrackStatusError) === 'HTTP_ERROR_400_500'
            ? 'Something went wrong, Unable to process your request!'
            : (
                  createError ||
                  modifyError ||
                  getBranchError ||
                  branchTrackStatusError
                )?.includes('Request already exists for this entity')
              ? 'Request already exists for this entity'
              : (
                    createError ||
                    modifyError ||
                    getBranchError ||
                    branchTrackStatusError
                  )?.includes('already exists')
                ? 'This branch already exists.\nPlease enter unique branch details.'
                : (
                      createError ||
                      modifyError ||
                      getBranchError ||
                      branchTrackStatusError
                    )?.includes('Region not found')
                  ? 'Region not found.\nPlease select a valid region.'
                  : (
                        createError ||
                        modifyError ||
                        getBranchError ||
                        branchTrackStatusError
                      )?.includes('Branch not found')
                    ? 'Branch not found.\nPlease check the branch code.'
                    : (
                          createError ||
                          modifyError ||
                          getBranchError ||
                          branchTrackStatusError
                        )?.includes('Only approved branch can be modified')
                      ? 'Only approved branch can be modified.'
                      : (
                            createError ||
                            modifyError ||
                            getBranchError ||
                            branchTrackStatusError
                          )?.includes('Authorization token')
                        ? 'Authorization token is missing or invalid or expired.'
                        : createError ||
                          modifyError ||
                          getBranchError ||
                          branchTrackStatusError ||
                          `An error occurred while ${isModifyMode ? 'modifying' : 'creating'} the branch.`
        }
        buttonText="Okay"
      />

      <DeactivateBranchModal
        open={showDeactivateModal}
        onClose={handleDeactivateClose}
        branchName={formData.branchName}
        branchCode={formData.branchCode}
      />
    </Container>
  );
};

export default CreateNewBranch;
