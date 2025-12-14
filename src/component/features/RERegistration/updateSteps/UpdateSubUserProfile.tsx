/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';

import {
  fetchStepDataUserProfile,
  //submitUserProfileUpdate,
} from './slice/updateSubUserProfileSlice';
import { submitUserProfileUpdate } from './slice/updateUserProfileSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LabeledDateUpdate from './CommonComponnet/LabeledDateUpdate';
import FormActionButtonsUpdate from './CommonComponnet/ClearAndSaveActionsUpdate';
import OTPModalUpdateEntity from './CommonComponnet/OtpModalUpdateEntity';
import SuccessModalUpdate from './CommonComponnet/SuccessModalUpdate';
import { OTPSend } from '../../Authenticate/slice/authSlice';
import { KeyboardArrowDown } from '@mui/icons-material';
import {
  StyledContainer2,
  StyledFormContainer,
  StyledAccordion,
  StyledAccordionSummary,
  StyledAccordionDetails,
  FormRow,
  FormFieldContainer,
  disabledFieldSx,
  fieldSx,
  sectionTitleSx,
  pageTitleSx,
} from './UpdateEntityProfile.styles';
import BreadcrumbUpdateProfile from '../../MyTask/UpdateEntityProfile-prevo/BreadcrumbUpdateProfile';
import { requestDetailsStyles } from '../../../admin-features/request-details/RequestDetails.style';
import { useNavigate } from 'react-router-dom';
import {
  validateField,
  shouldValidateField,
  validateProofOfIdentityNumber,
} from './utils/nodalOfficerValidations';

const UpdateUserProfile: React.FC = () => {
  // Add this state near other state declarations
  const [changedFieldsData, setChangedFieldsData] = useState<
    Record<string, any>
  >({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [originalFormData, setOriginalFormData] = useState<Record<string, any>>(
    {}
  );
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // OTP validation states
  const [originalMobile, setOriginalMobile] = useState<string>('');
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [isMobileChanged, setIsMobileChanged] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isOtpValidated, setIsOtpValidated] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState<string>('');

  // Success modal states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [successTitle, setSuccessTitle] = useState<string>('Success');

  // Track if data has been initialized
  const isDataInitialized = useRef(false);
  const prevStepDataRef = useRef<any>(null);

  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const stepData = useSelector(
    (state: any) => state.updateUserProfile.stepData
  );
  const loading = useSelector(
    (state: any) => state.updateUserProfile.stepDataLoading
  );

  // Get user details and groupMembership from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership
  );

  // Determine user role type for conditional field rendering
  const [userRoleType, setUserRoleType] = useState<string>('');

  // Fetch user data on mount
  useEffect(() => {
    const userId = userDetails?.userId || 'NO_0000';

    // Determine userTypes based on groupMembership
    let userTypes: string[] = ['NO'];

    // Mapping from long form to short form
    const groupToShortForm: Record<string, string> = {
      Institutional_User: 'IU',
      INSTITUTIONAL_USER: 'IU',
      Institutional_Regional_Admin: 'IRA',
      INSTITUTIONAL_REGIONAL_ADMIN: 'IRA',
      Institutional_Regional_User: 'IRU',
      INSTITUTIONAL_REGIONAL_USER: 'IRU',
      Institutional_Branch_User: 'IBU',
      INSTITUTIONAL_BRANCH_USER: 'IBU',
    };

    if (
      groupMembership &&
      Array.isArray(groupMembership) &&
      groupMembership.length > 0
    ) {
      const primaryGroup = groupMembership[0].replace(/^\//, '');

      // For all other user types: convert to short form
      const shortForm = groupToShortForm[primaryGroup] || primaryGroup;
      userTypes = [shortForm];

      // Set user role type for conditional rendering
      setUserRoleType(shortForm);
    }

    // Fetch user profile data
    dispatch(
      fetchStepDataUserProfile({ userId, userTypes, dataKey: 'nodalOfficer' })
    );
  }, [dispatch, userDetails?.userId, userDetails?.role, groupMembership]);
  const navigate = useNavigate();
  // Add debugging for changed fields
  useEffect(() => {
    console.log('📊 Changed fields tracking:', {
      changedFields: Array.from(changedFields),
      changedFieldsCount: changedFields.size,
      changedFieldsData: Object.keys(changedFieldsData),
      sampleChangedValues: Object.entries(changedFieldsData).slice(0, 3),
    });
  }, [changedFields, changedFieldsData]);
  // Load API data directly into form (use API field names as-is)
  useEffect(() => {
    console.log(
      '🔄 useEffect triggered - loading:',
      loading,
      'stepData keys:',
      Object.keys(stepData || {}).length,
      'isDataInitialized:',
      isDataInitialized.current
    );

    // Check if we have valid data and not currently loading
    if (stepData && Object.keys(stepData).length > 0 && !loading) {
      // Check if stepData has changed from previous value
      const stepDataChanged =
        JSON.stringify(prevStepDataRef.current) !== JSON.stringify(stepData);

      // Only initialize if we haven't done so yet, or if stepData has changed
      const shouldInitialize = !isDataInitialized.current || stepDataChanged;

      if (shouldInitialize) {
        console.log('📋 Loading API data into form:', stepData);

        setFormData(stepData);
        setOriginalFormData(stepData); // Store original data for change tracking
        setChangedFields(new Set()); // Reset changed fields
        setChangedFieldsData({}); // Reset changed fields data
        // Set original mobile and email values for change detection
        setOriginalMobile(stepData.mobile || '');
        setOriginalEmail(stepData.email || '');

        // Update refs to track initialization state and previous data
        isDataInitialized.current = true;
        prevStepDataRef.current = stepData;

        console.log('✅ Data initialization complete');
      } else {
        console.log('ℹ️ Data already initialized and unchanged, skipping');
      }
    } else {
      console.log(
        '⏳ Waiting for data - loading:',
        loading,
        'stepData empty:',
        !stepData || Object.keys(stepData).length === 0
      );
    }
  }, [stepData, loading]);

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Helper to check if CKYC is verified
  const isCkycVerified = () => {
    const citizenship = formData.citizenship || '';
    const ckycNumber = formData.ckycNo || '';
    return (
      String(citizenship).toLowerCase() === 'indian' && ckycNumber.trim() !== ''
    );
  };

  // CKYC-verified fields should be disabled, others should be editable
  const isCkycField = isCkycVerified();

  // Handle date change
  const handleDateChange = (fieldName: string, value: string | null) => {
    const newValue = value || '';
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    trackFieldChange(fieldName, newValue);
    const isDobField =
      fieldName.toLowerCase().includes('dob') ||
      fieldName.toLowerCase().includes('dateofbirth') ||
      fieldName.toLowerCase().includes('birthdate');

    if (isDobField && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - selectedDate.getFullYear();
      const monthDiff = today.getMonth() - selectedDate.getMonth();
      const dayDiff = today.getDate() - selectedDate.getDate();

      // Adjust age if birthday hasn't occurred this year yet
      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      // Validate age (18-100 years)
      let ageError: string | null = null;
      if (actualAge < 18) {
        ageError = 'Age must be at least 18 years';
      } else if (actualAge > 100) {
        ageError = 'Age must not exceed 100 years';
      }

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (ageError) {
          newErrors[fieldName] = ageError;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    } else {
      // For non-DOB fields, clear any existing errors
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    // Track changed fields
    const originalValue = originalFormData[fieldName];
    if (value !== originalValue) {
      setChangedFields((prev) => new Set([...prev, fieldName]));
    } else {
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  // Handle text field change
  const handleTextFieldChange = (fieldName: string, value: string) => {
    let processedValue = value;
    let updatedFormData: Record<string, any> = {
      [fieldName]: processedValue,
    };

    // Apply specific filtering for mobile field - only allow digits
    if (fieldName === 'mobile') {
      processedValue = value.replace(/[^0-9]/g, '');

      // Apply max length based on country code
      const countryCode = (formData.countryCode || '').trim();
      // Check if country code is India (+91)
      const isIndia =
        countryCode === '+91' || countryCode === '91' || countryCode === 'IN';
      const maxLen = isIndia ? 10 : 15;

      if (processedValue.length > maxLen) {
        processedValue = processedValue.substring(0, maxLen);
      }

      updatedFormData = {
        [fieldName]: processedValue,
      };
    }

    // When country code changes, trim mobile if needed
    if (fieldName === 'countryCode') {
      const currentMobile = formData.mobile || '';
      if (currentMobile) {
        const isIndia = value === '+91' || value === '91' || value === 'IN';
        const maxLen = isIndia ? 10 : 15;

        if (currentMobile.length > maxLen) {
          updatedFormData = {
            ...updatedFormData,
            mobile: currentMobile.substring(0, maxLen),
          };
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      ...updatedFormData,
    }));
    trackFieldChange(fieldName, processedValue);

    // Handle validation errors
    if (processedValue.trim() === '') {
      // Field is cleared - validate to show required error if applicable
      const error = validateField(fieldName, processedValue, {
        ...formData,
        [fieldName]: processedValue,
      });
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    } else {
      // Field has value - clear error (will validate on blur)
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Track changed fields
    const originalValue = originalFormData[fieldName];
    if (processedValue !== originalValue) {
      setChangedFields((prev) => new Set([...prev, fieldName]));
    } else {
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }

    // Track mobile/email changes for OTP validation
    if (fieldName === 'mobile') {
      const hasChanged = processedValue !== originalMobile;
      setIsMobileChanged(hasChanged);
      if (hasChanged) {
        setIsOtpValidated(false);
      }
    } else if (fieldName === 'email') {
      const hasChanged = processedValue !== originalEmail;
      setIsEmailChanged(hasChanged);
      if (hasChanged) {
        setIsOtpValidated(false);
      }
    }
  };
  // Add this helper function to track field changes
  const trackFieldChange = (fieldName: string, newValue: any) => {
    const originalValue = originalFormData[fieldName];

    // Compare values properly
    const hasChanged = String(newValue) !== String(originalValue);

    console.log(`🔍 Tracking field: ${fieldName}`, {
      originalValue,
      newValue,
      hasChanged,
      stringComparison: String(newValue) === String(originalValue),
    });

    if (hasChanged) {
      // Add to changed fields
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.add(fieldName);
        return newSet;
      });

      // Store the changed value
      setChangedFieldsData((prev) => ({
        ...prev,
        [fieldName]: newValue,
      }));
    } else {
      // Remove from changed fields if value is back to original
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });

      // Remove from changed fields data
      setChangedFieldsData((prev) => {
        const newData = { ...prev };
        delete newData[fieldName];
        return newData;
      });
    }
  };

  // Add this helper after other helper functions
  const hasActualChanges = changedFields.size > 0;

  // Handle select change
  const handleSelectChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    trackFieldChange(fieldName, value);

    // Track changed fields
    const originalValue = originalFormData[fieldName];
    if (value !== originalValue) {
      setChangedFields((prev) => new Set([...prev, fieldName]));
    } else {
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }

    // Clear POI number and validation when proof type changes
    if (fieldName === 'poi') {
      // Clear the POI number field since different formats are required
      setFormData((prev) => ({
        ...prev,
        poiNumber: '',
      }));

      // Clear validation errors
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.poiNumber;
        return newErrors;
      });

      // Remove from changed fields if it was there
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete('poiNumber');
        return newSet;
      });
    }

    // Re-validate mobile number when country code changes
    if (fieldName === 'countryCode') {
      const currentMobile = formData.mobile || '';
      if (currentMobile) {
        // Trim mobile if it exceeds new max length
        const isIndia = value === '+91' || value === '91' || value === 'IN';
        const maxLen = isIndia ? 10 : 15;

        if (currentMobile.length > maxLen) {
          setFormData((prev) => ({
            ...prev,
            mobile: currentMobile.substring(0, maxLen),
          }));
        }
      }
    }
  };

  // Handle Proof of Identity Number change with validation
  const handleProofNumberChange = (value: string) => {
    const proofType = formData.poi || '';
    let processedValue = value;

    // Apply character filtering and maxLength based on proof type
    const upperProofType = proofType.toUpperCase();
    let maxLen = 0;

    switch (upperProofType) {
      case 'AADHAAR':
        maxLen = 4;
        // Only allow digits for AADHAAR
        processedValue = value.replace(/[^0-9]/g, '');
        break;

      case 'PAN_CARD':
        maxLen = 10;
        // Only allow uppercase letters and digits
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;

      case 'PASSPORT':
        maxLen = 8;
        // Only allow uppercase letters and digits
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;

      case 'VOTER_ID':
        maxLen = 10;
        // Only allow uppercase letters and digits
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;

      case 'DRIVING_LICENSE':
        maxLen = 18;
        // Allow uppercase letters, digits, spaces, and hyphens
        processedValue = value.toUpperCase().replace(/[^A-Z0-9 -]/g, '');
        break;

      default:
        // If no proof type selected, allow alphanumeric only
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;
    }

    // Enforce maxLength
    if (maxLen > 0 && processedValue.length > maxLen) {
      processedValue = processedValue.substring(0, maxLen);
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      poiNumber: processedValue,
    }));
    trackFieldChange('poiNumber', processedValue);

    // Handle validation errors - validate immediately
    const error = validateProofOfIdentityNumber(processedValue, proofType);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors.poiNumber = error;
      } else {
        delete newErrors.poiNumber;
      }
      return newErrors;
    });

    // Track changed fields
    const originalValue = originalFormData.poiNumber;
    if (processedValue !== originalValue) {
      setChangedFields((prev) => new Set([...prev, 'poiNumber']));
    } else {
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete('poiNumber');
        return newSet;
      });
    }
  };

  // Handle Proof of Identity Number blur validation
  const handleProofNumberBlur = () => {
    const proofType = formData.poi || '';
    const value = formData.poiNumber || '';

    // Validate using the utility function
    const error = validateProofOfIdentityNumber(value, proofType);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors.poiNumber = error;
      } else {
        delete newErrors.poiNumber;
      }
      return newErrors;
    });
  };

  // Handle field blur validation
  const handleFieldBlur = (fieldName: string) => {
    const value = formData[fieldName];

    // Check if field should be validated (not disabled due to CKYC)
    if (!shouldValidateField(fieldName, formData, isCkycVerified())) {
      return;
    }

    // Validate the field
    const error = validateField(fieldName, value, formData);

    // Update validation errors
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  // Calculate date constraints for DOB (18-100 years)
  const today = new Date();

  // Max date: 18 years ago (minimum age 18)
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const maxDateStr = maxDate.toLocaleDateString('en-CA');

  // Min date: 100 years ago (maximum age 100)
  const minDate = new Date(
    today.getFullYear() - 100,
    today.getMonth(),
    today.getDate()
  );
  const minDateStr = minDate.toLocaleDateString('en-CA');

  // Handle Validate button click - Send OTP to mobile/email
  const handleValidate = async () => {
    console.log('🔍 Validating - checking if mobile/email changed');

    // Check if mobile or email has changed
    const shouldValidate = isMobileChanged || isEmailChanged;

    if (shouldValidate) {
      // Send OTP to mobile/email
      const otpData = {
        requestType: 'DIRECT',
        emailId: formData.email || '',
        mobileNo: formData.mobile || '',
        countryCode: formData.countryCode || '+91',
      };

      console.log('📱 Sending OTP with data:', otpData);

      try {
        const response = await dispatch(OTPSend(otpData)).unwrap();
        console.log('✅ OTP sent successfully:', response);

        if (response.data?.otpIdentifier) {
          setOtpIdentifier(response.data.otpIdentifier);
          setIsOtpModalOpen(true);
        } else {
          alert('Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error('❌ Failed to send OTP:', error);
        alert('Failed to send OTP. Please check your mobile number and email.');
      }
    } else {
      console.log('ℹ️  No mobile/email changes detected');
      alert(
        'No mobile or email changes detected. Please modify mobile or email to validate.'
      );
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = (mobileOtp: string, emailOtp: string) => {
    console.log('✅ OTP validated successfully', {
      mobileOtp,
      emailOtp,
      newMobile: formData.mobile,
      newEmail: formData.email,
    });

    // Mark as validated and close OTP modal
    setIsOtpValidated(true);
    setIsOtpModalOpen(false);

    // Update original values after successful validation
    if (formData.mobile) {
      setOriginalMobile(formData.mobile);
      setIsMobileChanged(false);
    }
    if (formData.email) {
      setOriginalEmail(formData.email);
      setIsEmailChanged(false);
    }

    // Show success modal
    setSuccessTitle('Success');
    setSuccessMessage('OTP validated successfully! You can now save the form.');
    setIsSuccessModalOpen(true);
  };

  // Handle Save button click
  const handleSave = async () => {
    console.log('💾 Saving form data:', formData);
    console.log('📝 Changed fields:', Array.from(changedFields));
    console.log('📝 Changed fields data:', changedFieldsData);
    // Check if mobile/email changed but not validated
    if ((isMobileChanged || isEmailChanged) && !isOtpValidated) {
      alert('Please validate mobile/email changes before saving.');
      return;
    }

    // Check if there are any changes
    if (!hasActualChanges) {
      alert(
        'No changes detected. Please modify at least one field before saving.'
      );
      return;
    }

    try {
      // Get userId from userDetails
      const userId = userDetails?.userId || userDetails?.id;
      if (!userId) {
        alert('User ID not found. Please refresh the page and try again.');
        return;
      }
      const filteredChangedFields = Array.from(changedFields).filter(
        (fieldName) => {
          const originalValue = originalFormData[fieldName];
          const currentValue = formData[fieldName];

          // For files, check if a new file was uploaded
          if (changedFieldsData[fieldName] === null && originalValue !== null) {
            // Field was cleared/deleted - count as changed
            return true;
          }

          return String(currentValue) !== String(originalValue);
        }
      );

      console.log('🚀 Submitting user profile update:', {
        userId,
        changedFieldsList: Array.from(changedFields),
        formData,
      });

      // Prepare the submission data
      // const result = await dispatch(
      //   submitUserProfileUpdate({
      //     formValues: formData,
      //     userId,
      //     changedFields: Array.from(changedFields),
      //     acknowledgementNo: stepData?.acknowledgementNo || `ACK${Date.now()}`,
      //   })
      // ).unwrap();
      const acknowledgementNo =
        (stepData as any)?.acknowledgementNo || `ACK${Date.now()}`;
      const result = await dispatch(
        submitUserProfileUpdate({
          formValues: formData,
          userId,
          acknowledgementNo,
          formType: userRoleType,
          changedFields: filteredChangedFields,
          changedFieldsData,
        })
      ).unwrap();

      console.log('✅ User profile updated successfully:', result);
      console.log('📤 Changed fields submitted:', filteredChangedFields);
      // Show success modal
      setSuccessTitle('Success');
      setSuccessMessage('User profile update request submitted for approval');
      setIsSuccessModalOpen(true);

      // Reset change tracking after successful save
      setChangedFields(new Set());
      setOriginalFormData(formData);
      setIsMobileChanged(false);
      setIsEmailChanged(false);
      setIsOtpValidated(false);
    } catch (error: any) {
      console.error('❌ Error saving user profile:', error);
      const errorMessage =
        error?.message ||
        error?.error?.message ||
        'Failed to update user profile. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <Box sx={requestDetailsStyles.container}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: 2 }}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: 'black' }} />}
          onClick={() => navigate(-1)}
          sx={requestDetailsStyles.backButton}
        >
          Back
        </Button>
      </Box>
      <Box sx={{ ml: 3 }}>
        {' '}
        {/* move breadcrumb slightly right */}
        <BreadcrumbUpdateProfile
          breadcrumbItems={[
            { label: 'Update Profile', href: '/re/dashboard' },
            { label: 'User Profile' },
          ]}
        />
      </Box>

      <StyledContainer2>
        <Typography variant="h4" sx={pageTitleSx}>
          Update User Profile
        </Typography>

        {/* User Role, Region Name, Branch Name Section */}
        <FormRow>
          <FormFieldContainer width="third">
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#1A1A1A',
                fontFamily: 'Gilroy, sans-serif',
              }}
            >
              User Role <span style={{ color: '#e74c3c' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter User Role"
              value={formData.userRole || ''}
              disabled
              sx={disabledFieldSx}
            />
          </FormFieldContainer>

          {/* Show Region Name for IRA, IRU, and IBU */}
          {(userRoleType === 'IRA' ||
            userRoleType === 'IRU' ||
            userRoleType === 'IBU') && (
            <FormFieldContainer width="third">
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: '#1A1A1A',
                  fontFamily: 'Gilroy, sans-serif',
                }}
              >
                Region Name <span style={{ color: '#e74c3c' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Region Name"
                value={formData.regionName || ''}
                disabled
                sx={disabledFieldSx}
              />
            </FormFieldContainer>
          )}

          {/* Show Branch Name only for IBU */}
          {userRoleType === 'IBU' && (
            <FormFieldContainer width="third">
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: '#1A1A1A',
                  fontFamily: 'Gilroy, sans-serif',
                }}
              >
                Branch Name <span style={{ color: '#e74c3c' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Branch Name"
                value={formData.branchName || ''}
                disabled
                sx={disabledFieldSx}
              />
            </FormFieldContainer>
          )}
        </FormRow>

        {/* User Details Section */}
        <StyledFormContainer>
          <StyledAccordion defaultExpanded>
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={sectionTitleSx}>
                User Details
              </Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              {/* Row 1: Citizenship, CKYC Number, Title */}
              <FormRow>
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Citizenship <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Citizenship"
                    value={formData.citizenship || ''}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    CKYC Number <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="Enter CKYC Number"
                    value={formData.ckycNo || ''}
                    disabled={isCkycField}
                    InputProps={{
                      endAdornment: isCkycVerified() ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            pr: 1,
                          }}
                        >
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: '#4CAF50' }}
                          />
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#4CAF50',
                              fontFamily: 'Gilroy, sans-serif',
                            }}
                          >
                            Verified
                          </Typography>
                        </Box>
                      ) : null,
                    }}
                    sx={{
                      ...(isCkycField ? disabledFieldSx : fieldSx),
                      ...(isCkycVerified() && {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4CAF50',
                        },
                      }),
                    }}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Title <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Title"
                    value={formData.title || ''}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>
              </FormRow>

              {/* Row 2: First Name, Middle Name, Last Name */}
              <FormRow>
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    First Name <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter First Name"
                    value={formData.firstName || ''}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Middle Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Middle Name"
                    value={formData.middleName || ''}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Last Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Last Name"
                    value={formData.lastName || ''}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>
              </FormRow>

              {/* Row 3: Gender, Date of Birth, Designation */}
              <FormRow>
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Gender
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Gender"
                    value={formData.gender || ''}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>
                {/*  */}
                <FormFieldContainer width="third">
                  <LabeledDateUpdate
                    label="Date of Birth"
                    value={formData.dob || ''}
                    onChange={(newValue) => handleDateChange('dob', newValue)}
                    fieldName="dob"
                    required={true}
                    disabled={false}
                    minDate={minDateStr}
                    maxDate={maxDateStr}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Designation <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Designation"
                    value={formData.designation || ''}
                    onChange={(e) =>
                      handleTextFieldChange('designation', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('designation')}
                    error={!!validationErrors.designation}
                    helperText={validationErrors.designation}
                    sx={fieldSx}
                  />
                </FormFieldContainer>
              </FormRow>

              {/* Row 4: Employee Code, Email, Country Code */}
              <FormRow>
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Employee Code <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Employee Code"
                    value={formData.employeeCode || ''}
                    onChange={(e) =>
                      handleTextFieldChange('employeeCode', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('employeeCode')}
                    error={!!validationErrors.employeeCode}
                    helperText={validationErrors.employeeCode}
                    sx={fieldSx}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Email <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      handleTextFieldChange('email', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('email')}
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                    type="email"
                    sx={fieldSx}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Country Code{' '}
                    <span style={{ color: '#e74c3c' }}>*</span>{' '}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Country Code"
                    value={formData.countryCode || ''}
                    onChange={(e) =>
                      handleTextFieldChange('countryCode', e.target.value)
                    }
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                    InputProps={{
                      endAdornment: (
                        <KeyboardArrowDown sx={{ color: '#666' }} />
                      ),
                    }}
                  />
                </FormFieldContainer>
              </FormRow>

              {/* Row 5: Mobile Number, Proof of Identity, Proof of Identity Number */}
              <FormRow>
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Mobile Number <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Mobile Number"
                    value={formData.mobile || ''}
                    onChange={(e) =>
                      handleTextFieldChange('mobile', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('mobile')}
                    error={!!validationErrors.mobile}
                    helperText={validationErrors.mobile}
                    type="tel"
                    sx={fieldSx}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Proof of Identity{' '}
                    <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.poi || ''}
                      onChange={(e) =>
                        handleSelectChange('poi', e.target.value)
                      }
                      IconComponent={KeyboardArrowDown}
                      displayEmpty
                      sx={{
                        fontFamily: 'Gilroy, sans-serif',
                        borderRadius: '4px',
                        height: '48px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d0d0d0',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3498db',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2980b9',
                          borderWidth: '2px',
                        },
                        '& .MuiSelect-select': {
                          padding: '0 14px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                        },
                        '& .MuiSelect-icon': {
                          color: '#666',
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <span style={{ color: '#999' }}>
                          Select proof of identity
                        </span>
                      </MenuItem>
                      <MenuItem value="AADHAAR">AADHAAR</MenuItem>
                      <MenuItem value="DRIVING_LICENSE">
                        DRIVING LICENSE
                      </MenuItem>
                      <MenuItem value="PAN_CARD">PAN CARD</MenuItem>
                      <MenuItem value="PASSPORT">PASSPORT</MenuItem>
                      <MenuItem value="VOTER_ID">VOTER ID</MenuItem>
                    </Select>
                  </FormControl>
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Proof of Identity Number{' '}
                    <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Proof of Identity Number"
                    value={formData.poiNumber || ''}
                    onChange={(e) => handleProofNumberChange(e.target.value)}
                    onBlur={handleProofNumberBlur}
                    error={!!validationErrors.poiNumber}
                    helperText={validationErrors.poiNumber}
                    inputProps={{
                      type: formData.poi === 'AADHAAR' ? 'tel' : 'text',
                    }}
                    sx={fieldSx}
                  />
                </FormFieldContainer>
              </FormRow>
            </StyledAccordionDetails>
          </StyledAccordion>
        </StyledFormContainer>

        {/* User Address Details Section */}
        <StyledFormContainer>
          <StyledAccordion defaultExpanded>
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={sectionTitleSx}>
                User Address Details
              </Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              {/* Row 1: Address Line 1, Address Line 2, Address Line 3 */}
              <FormRow>
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Address Line 1 <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Address"
                    value={formData.addressLine1 || ''}
                    onChange={(e) =>
                      handleTextFieldChange('addressLine1', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('addressLine1')}
                    error={!!validationErrors.addressLine1}
                    helperText={validationErrors.addressLine1}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Address Line 2
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Address"
                    value={formData.addressLine2 || ''}
                    onChange={(e) =>
                      handleTextFieldChange('addressLine2', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('addressLine2')}
                    error={!!validationErrors.addressLine2}
                    helperText={validationErrors.addressLine2}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Address Line 3
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Address"
                    value={formData.addressLine3 || ''}
                    onChange={(e) =>
                      handleTextFieldChange('addressLine3', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('addressLine3')}
                    error={!!validationErrors.addressLine3}
                    helperText={validationErrors.addressLine3}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>
              </FormRow>

              {/* Row 2: Country, State / UT, District */}
              <FormRow>
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Country <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Country"
                    value={formData.country || ''}
                    onChange={(e) =>
                      handleTextFieldChange('country', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('country')}
                    error={!!validationErrors.country}
                    helperText={validationErrors.country}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                    InputProps={{
                      endAdornment: (
                        <KeyboardArrowDown sx={{ color: '#666' }} />
                      ),
                    }}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    State / UT <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter State"
                    value={formData.state || ''}
                    onChange={(e) =>
                      handleTextFieldChange('state', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('state')}
                    error={!!validationErrors.state}
                    helperText={validationErrors.state}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                    InputProps={{
                      endAdornment: (
                        <KeyboardArrowDown sx={{ color: '#666' }} />
                      ),
                    }}
                  />
                </FormFieldContainer>

                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    District <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter District/City"
                    value={formData.district || ''}
                    onChange={(e) =>
                      handleTextFieldChange('district', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('district')}
                    error={!!validationErrors.district}
                    helperText={validationErrors.district}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                    InputProps={{
                      endAdornment: (
                        <KeyboardArrowDown sx={{ color: '#666' }} />
                      ),
                    }}
                  />
                </FormFieldContainer>
              </FormRow>

              {/* Row 3: City/Town, Pin Code / Pin Code (in case of others), Digipin */}
              <FormRow>
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    City/Town <span style={{ color: '#e74c3c' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter District/City"
                    value={formData.city || ''}
                    onChange={(e) =>
                      handleTextFieldChange('city', e.target.value)
                    }
                    onBlur={() => handleFieldBlur('city')}
                    error={!!validationErrors.city}
                    helperText={validationErrors.city}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>

                {/* Show Pin Code only if it's not "000000" or "other" */}
                {formData.pincode !== '000000' &&
                  formData.pincode?.toLowerCase() !== 'other' && (
                    <FormFieldContainer width="third">
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          color: '#1A1A1A',
                          fontFamily: 'Gilroy, sans-serif',
                        }}
                      >
                        Pin Code <span style={{ color: '#e74c3c' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter Pincode"
                        value={formData.pincode || ''}
                        onBlur={() => handleFieldBlur('pincode')}
                        error={!!validationErrors.pincode}
                        helperText={validationErrors.pincode}
                        disabled={isCkycField}
                        sx={isCkycField ? disabledFieldSx : fieldSx}
                      />
                    </FormFieldContainer>
                  )}

                {/* Show "Pin Code (in case of others)" only if pincode is "000000" or "other" */}
                {(formData.pincode === '000000' ||
                  formData.pincode?.toLowerCase() === 'other') && (
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#1A1A1A',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Pin Code (in case of others)
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Pincode"
                      value={formData.pincodeOther || ''}
                      onBlur={() => handleFieldBlur('pincodeOther')}
                      error={!!validationErrors.pincodeOther}
                      helperText={validationErrors.pincodeOther}
                      disabled={isCkycField}
                      sx={isCkycField ? disabledFieldSx : fieldSx}
                    />
                  </FormFieldContainer>
                )}

                {/* Digipin - Always show in third column */}
                <FormFieldContainer width="third">
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#1A1A1A',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    Digipin
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="-"
                    value={formData.digipin || ''}
                    onBlur={() => handleFieldBlur('digipin')}
                    error={!!validationErrors.digipin}
                    helperText={validationErrors.digipin}
                    disabled={isCkycField}
                    sx={isCkycField ? disabledFieldSx : fieldSx}
                  />
                </FormFieldContainer>
              </FormRow>
            </StyledAccordionDetails>
          </StyledAccordion>
        </StyledFormContainer>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mb: 2 }}>
          <FormActionButtonsUpdate
            onSave={handleSave}
            onValidate={handleValidate}
            validateLabel="Validate"
            showValidate={true}
            showSave={true}
            saveLabel="Save and Next"
            loading={false}
            saveDisabled={
              // Disable save if no actual changes OR other conditions
              !hasActualChanges ||
              ((isMobileChanged || isEmailChanged) && !isOtpValidated)
            }
            validateDisabled={
              (!isMobileChanged && !isEmailChanged) || isOtpValidated
            }
            clearDisabled={true}
          />
        </Box>
      </StyledContainer2>

      {/* OTP Modal for Mobile/Email Validation */}
      <OTPModalUpdateEntity
        data={otpIdentifier}
        mobileChange={isMobileChanged}
        emailChange={isEmailChanged}
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onOtpSubmit={handleOtpSubmit}
        countryCode={formData.countryCode}
        email={formData.email}
        mobile={formData.mobile}
      />

      {/* Success Modal */}
      <SuccessModalUpdate
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successTitle}
        message={successMessage}
        onOkay={() => setIsSuccessModalOpen(false)}
      />
    </Box>
  );
};

export default UpdateUserProfile;
