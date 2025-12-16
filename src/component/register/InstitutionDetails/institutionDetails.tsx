/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import './institutionDetails.css';
import { ReactComponent as CKYCRRLogo } from '../../../assets/ckycrr_sign_up_logo.svg';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
//import './registrationPage.css';
import { useNavigate } from 'react-router';
import SuccessModal from '../SuccessModalOkay/successModal';
import OTPModalRegister from '../OTPModalregister/otpModalRegister';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCkycDetails,
  setHeadInstitutionFormData,
  submitHeadInstitutionThunk,
  setCkycData,
} from '../../../redux/slices/registerSlice/institutiondetailSlice'; // adjust path if needed
import { AppDispatch, RootState } from '@redux/store';
import { sendOtp } from '../../features/Authenticate/slice/passSetupOtpSlice';
import {
  showLoader,
  hideLoader,
} from '../../../redux/slices/loader/loaderSlice';
import ApplicationStepper from '../../../component/stepper/ApplicationStepper';
import {
  markStepCompleted,
  setApplicationFormData,
  setCurrentStep,
} from '../../../redux/slices/registerSlice/applicationSlice';
import CkycrrVerifyModal from '../../../component/authentication/OTPModal/CkycrrVerifyModal';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Form steps (you can name them accordingly)
const steps = [
  'Entity Profile',
  'Address Details',
  'Head of institution details',
  'Nodal Officer Details',
  'Institutional Admin User Details',
  'Form Preview',
];

const REQUIRED_KEYS = [
  'firstName',
  // 'lastName',
  'designation',
  'emailId',
  'mobileNo',
  // "countryCode",
  'citizenship',
  'title',
  'gender',
  // "phone",
  // "state",
  // "district",
  // "city",
  // "cinNumber",
  // "llpin",
  // "gstin",
  // "license",
  // "addressProof",
  // "panPreview",
  // "cinPreview",
];

// const isValidForm = (data: Record<string, any>): boolean =>
//   REQUIRED_KEYS.every((key) => Boolean(data[key]));
const validateMobileNumber = (data: Record<string, any>): boolean => {
  const { mobileNo, countryCode } = data;

  // If mobile number is empty, let the required field validation handle it
  if (!mobileNo?.trim()) {
    return false;
  }

  // Check if mobile number contains only digits
  if (!/^\d+$/.test(mobileNo)) {
    return false;
  }

  // Validate based on country code
  if (countryCode === '+91') {
    // For India: exactly 10 digits
    return mobileNo.length === 10;
  } else {
    // For international: between 8 and 15 digits
    return mobileNo.length >= 8 && mobileNo.length <= 15;
  }
};
const isValidForm = (data: Record<string, any>): boolean => {
  const isBasicValid = REQUIRED_KEYS.every((key) => Boolean(data[key]));

  const isCkycValid =
    data?.citizenship === 'Indian' ? Boolean(data?.ckycNumber) : true;
  const isMobileValid = validateMobileNumber(data);

  return isBasicValid && isCkycValid && isMobileValid;
};

const InstitutionDetails = () => {
  interface Country {
    name: string;
    dial_code: string;
    code: string;
  }
  interface FormDataType {
    title?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    designation?: string;
    emailId?: string;
    gender?: string;
    ckycNumber?: string;
    citizenship?: string;
    phone?: string;
    mobileNo?: string;
    landline?: string;
    // Add other expected fields...
    [key: string]: any; // still allow dynamic keys
  }
  const [formData, setFormData] = useState<FormDataType>({
    countryCode: '+91',
  });
  const [activeStep, setActiveStep] = useState(2);
  const [isOTPModalOpen, setOTPModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [errors, setErrors] = React.useState<{
    [key: string]: string | undefined;
  }>({});
  const [otpIdentifier, setotpIdentifier] = useState<string | undefined>();
  const [isKycVerified, setIsKycVerified] = useState<boolean | any>(false);
  const [isCkycOTPModalOpen, setCkycOTPModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();
  const [countryData, setCountryData] = useState('');
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  const userEmail = useSelector(
    (state: RootState) => state.auth.userDetails?.email
  );
  //  const completedSteps: { [key: number]: boolean } = {
  //   0: true,
  //   1: true, // Mark step 1 as completed too
  // };

  const reduxFormData = useSelector(
    (state: RootState) => state.headInstitution.formData
  );
  const previewData = useSelector(
    (state: RootState) => state.applicationPreview.headOfInstitutionDetails
  );
  const { ckycDataHOI } = useSelector(
    (state: RootState) => state.headInstitution
  );
  const { HOIerror } = useSelector((state: RootState) => state.headInstitution);
  console.log(reduxFormData, 'reduxFormData');
  const Reinitializestatus = useSelector(
    (state: RootState) => state.auth.reinitializeData?.approvalStatus
  );
  const modifiableFields = useSelector(
    (state: RootState) => state.auth.reinitializeData?.modifiableFields
  );
  const {
    citizenships,
    loading: mastersLoading,
    error: mastersError,
    titles,
    genders,
  } = useSelector((state: RootState) => state.masters);
  const geographyHierarchy = useSelector(
    (state: RootState) => state.masters.geographyHierarchy
  );

  // const isEditableField = (section: string, field: string): boolean => {
  //   // ✅ Restrict only for modification flow
  //   if (Reinitializestatus === "REQUEST_FOR_MODIFICATION") {
  //     return !!modifiableFields?.[section]?.includes(field);
  //   }

  //   // ✅ All fields editable otherwise
  //   return true;
  // };

  const viewOnlyStatuses = [
    'SUBMITTED_PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'READY_FOR_SUBMISSION',
  ];
  const HEAD_OFFICE_DETAILS = 'HEAD_OFFICE_DETAILS';

  const isViewOnlyHOI = viewOnlyStatuses.includes(Reinitializestatus ?? '');
  const isEditableField = (section: string, field: string): boolean => {
    // ✅ Restrict only for modification flow
    console.log('field====', field);
    console.log('Reinitializestatus====', Reinitializestatus);
    if (Reinitializestatus === 'REQUEST_FOR_MODIFICATION') {
      return !!modifiableFields?.[section]?.includes(field);
    }
    // const viewOnlyStatuses = [
    //   "SUBMITTED_PENDING_APPROVAL",
    //   "APPROVED",
    //   "REJECTED",
    //   "READY_FOR_SUBMISSION"
    // ];
    if (viewOnlyStatuses.includes(Reinitializestatus ?? '')) {
      return false;
    }

    // if (countryData !== 'Indian' && field === 'hoiCkycNumber') {
    //   return false;
    // }
    // ✅ All fields editable otherwise
    return true;
  };

  const isIndianCitizen = formData?.citizenship === 'Indian';
  const [initialFormState, setInitialFormState] = useState({
    mobileNo: '',
    countryCode: '',
    email: '',
  });
  const [isInitialStateSet, setIsInitialStateSet] = useState(false);

  const getCurrentEmail = () => formData.email || formData.emailId || '';

  const isCkycVerifiedFromPreview = () => {
    return (
      previewData?.ckycNumber &&
      formData.ckycNumber &&
      previewData.ckycNumber === formData.ckycNumber &&
      formData.citizenship === 'Indian'
    );
  };
  const hasContactInfoChanged = () => {
    return (
      formData.mobileNo !== initialFormState.mobileNo ||
      formData.countryCode !== initialFormState.countryCode ||
      getCurrentEmail() !== initialFormState.email
    );
  };

  const canSaveAndNext = () => {
    // Can save if OTP verified AND no contact changes since verification
    return isOtpVerified && isValidForm(formData) && !hasContactInfoChanged();
  };

  const hasInitialContactInfo = () => {
    return Boolean(
      initialFormState.mobileNo ||
      initialFormState.email ||
      initialFormState.countryCode
    );
  };

  useEffect(() => {
    dispatch(setCurrentStep(2)); // 0 = first step
  }, [dispatch]);

  // useEffect(() => {
  //   if (ckycDataHOI) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       firstName: ckycDataHOI.firstName || '',
  //       middleName: ckycDataHOI.middleName || '',
  //       lastName: ckycDataHOI.lastName || '',
  //       title: ckycDataHOI.title || '',
  //       gender: ckycDataHOI.gender || '',
  //     }));
  //   }
  // }, [ckycDataHOI]);

  useEffect(() => {
    if (ckycDataHOI) {
      // When CKYC data is available, populate the form
      setFormData((prev) => ({
        ...prev,
        firstName: ckycDataHOI.firstName || '',
        middleName: ckycDataHOI.middleName || '',
        lastName: ckycDataHOI.lastName || '',
        title: ckycDataHOI.title || '',
        gender: ckycDataHOI.gender || '',
      }));
    } else {
      // ✅ When CKYC data is cleared (null), clear the form fields
      // This handles both citizenship change and CKYC number change scenarios
      setFormData((prev) => ({
        ...prev,
        firstName: '',
        middleName: '',
        lastName: '',
        title: '',
        gender: '',
      }));
    }
  }, [ckycDataHOI]);
  useEffect(() => {
    // Only set initial state once, don't update it later
    if (!isInitialStateSet) {
      if (previewData && Object.keys(reduxFormData).length === 0) {
        setFormData(previewData);
        dispatch(setHeadInstitutionFormData(previewData));

        const initialState = {
          mobileNo: previewData.mobileNo || '',
          countryCode: previewData.countryCode || '',
          email: previewData.emailId || '',
        };
        setInitialFormState(initialState);
        setIsInitialStateSet(true); // ← Mark as set
        setIsOtpVerified(true); // ✅ OTP has been verified
      } else if (Object.keys(reduxFormData).length > 0) {
        setFormData(reduxFormData);

        const initialState = {
          mobileNo: reduxFormData.mobileNo || '',
          countryCode: reduxFormData.countryCode || '',
          email: reduxFormData.email || reduxFormData.emailId || '',
        };
        setInitialFormState(initialState);
        setIsInitialStateSet(true); // ← Mark as set
        setIsOtpVerified(true); // ✅ OTP has been verified
      }
    } else {
      // After initial state is set, only update formData, not initialFormState
      if (previewData && Object.keys(reduxFormData).length === 0) {
        setFormData(previewData);
        dispatch(setHeadInstitutionFormData(previewData));
      } else if (Object.keys(reduxFormData).length > 0) {
        setFormData(reduxFormData);
      }
    }
  }, [previewData, reduxFormData, dispatch, isInitialStateSet]);

  useEffect(() => {
    const basicFormValid = isValidForm(formData);
    // Enable validation button if:
    // 1. Form is basically valid AND
    // 2. NOT already OTP verified AND
    // 3. Either it's a new form (no initial contact info) OR contact info has changed
    const shouldEnableValidation =
      basicFormValid &&
      !isOtpVerified &&
      (!hasInitialContactInfo() || hasContactInfoChanged());
    setIsFormValid(shouldEnableValidation);
  }, [
    formData,
    isOtpVerified,
    initialFormState,
    hasInitialContactInfo,
    hasContactInfoChanged,
  ]);

  useEffect(() => {
    if (hasContactInfoChanged() && isOtpVerified) {
      // Contact info changed, reset OTP verification
      setIsOtpVerified(false);
    } else if (
      !hasContactInfoChanged() &&
      !isOtpVerified &&
      hasInitialContactInfo()
    ) {
      // Contact info reverted back to original AND we had initial contact info (meaning it was previously verified)
      setIsOtpVerified(true);
    }
  }, [
    formData.mobileNo,
    formData.countryCode,
    isOtpVerified,
    hasContactInfoChanged,
    hasInitialContactInfo,
  ]);

  useEffect(() => {
    if (countries.length > 0 && formData.countryCode && !formData.countryName) {
      const matchedCountry = countries.find(
        (c) => c.dial_code === formData.countryCode
      );
      if (matchedCountry) {
        setFormData((prev) => ({
          ...prev,
          countryName: matchedCountry.name,
        }));
      }
    }
  }, [countries, formData.countryCode, formData.countryName]);

  // useEffect(() => {
  //   const loadCountries = async () => {
  //     const countryList = await fetchCountryCodes();
  //     setCountries(countryList);
  //   };
  //   loadCountries();
  // }, []);

  useEffect(() => {
    if (geographyHierarchy?.length) {
      const transformedCountries = geographyHierarchy.map((country) => ({
        name: country.name,
        code: country.code,
        dial_code: country.countryCode,
      }));

      setCountries(transformedCountries);
    }
  }, [geographyHierarchy]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find((c) => c.dial_code === selectedCode);
    setFormData((prev) => ({
      ...prev,
      countryCode: selectedCode,
      countryName: selectedCountry ? selectedCountry.name : '',
    }));

    // Trigger validation after setting state
    const error = validateEntityField('countryCode', selectedCode, {
      ...formData,
      countryCode: selectedCode,
    });
    setErrors((prevErrors) => ({ ...prevErrors, countryCode: error }));
  };
  const stripCountryName = (data: Record<string, any>) => {
    const { countryName, ...rest } = data;
    return rest;
  };

  const [citizenshipStatus, setCitizenshipStatus] = useState(false);
  const validateEntityField = (
    name: string,
    value: any,
    formData: any
  ): string | undefined => {
    // Regexes based on your rules
    const nameRegexMandatory = /^[A-Za-z.' ]{1,33}$/; // A-Z/a-z, single apostrophe, dot, space allowed
    const nameRegexOptional = /^[A-Za-z.' ]{0,33}$/; // For middle name: space allowed per SRS
    const lastNameRegex = /^[A-Za-z.']{0,33}$/; // For last name: NO space allowed per SRS
    const designationRegex = /^[A-Za-z0-9 `~@#$%^&*()_+\-=]{0,100}$/;
    const emailRegex =
      /^[A-Za-z0-9`~@#$%^&*.()_+\-=]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const ckycRegex = /^\d{14}$/;
    const mobileIndiaRegex = /^\d{10}$/;
    const mobileIntlRegex = /^\d{8,15}$/;
    const landlineRegex = /^[0-9+ -]*$/;
    const citizenshipStatus = false;

    switch (name) {
      case 'firstName':
        if (!value?.trim()) return 'First Name is required';
        if (value.length > 33) return 'First Name cannot exceed 33 characters';
        if (!nameRegexMandatory.test(value))
          return 'First Name: Only A-Z, a-z, single apostrophe, and dot allowed; no spaces';
        break;

      case 'middleName':
        if (value.length > 33) return 'Middle Name cannot exceed 33 characters';
        if (value && !nameRegexMandatory.test(value))
          return 'Middle Name: Only A-Z, a-z, single apostrophe, dot, and spaces allowed';
        break;

      case 'lastName':
        console.log('🔍 Validating lastName:', { value, length: value?.length, hasSpace: value?.includes(' ') });
        // if (!value?.trim()) return 'Last Name is required';
        if (value.length > 33) return 'Last Name cannot exceed 33 characters';
        // Check for space BEFORE trimming to catch internal spaces
        if (value && value.includes(' ')) {
          console.log('❌ lastName has space, returning error');
          return 'Last Name: Only A-Z, a-z, single apostrophe, and dot allowed; no spaces';
        }
        if (value && !lastNameRegex.test(value.trim())) {
          console.log('❌ lastName failed regex test');
          return 'Last Name: Only A-Z, a-z, single apostrophe, and dot allowed; no spaces';
        }
        console.log('✅ lastName validation passed');
        break;

      case 'designation':
        if (!value?.trim()) return 'Designation is required';
        if (value.length > 100)
          return 'Designation cannot exceed 100 characters';
        if (!designationRegex.test(value))
          return 'Designation: Alphanumeric and `~@#$%^&*()_+-= characters allowed';
        break;

      case 'emailId':
        if (!value?.trim()) return 'Email ID is required';
        if (!emailRegex.test(value))
          return 'Email ID must be valid and contain @';
        if (value.length > 255) return 'Email ID cannot exceed 255 characters';
        break;

      case 'ckycNumber':
        if (formData?.citizenship === 'Indian' && !value?.trim())
          return 'CKYC number is required for Indian citizens';
        if (value && value.length > 14)
          return 'CKYC Number cannot exceed 14 digits';
        break;
      case 'gender':
        if (!value) return 'Gender is required';
        if (!['male', 'female', 'transgender'].includes(value.toLowerCase()))
          return 'Invalid gender selection';
        break;

      case 'citizenship':
        setCitizenshipStatus(true);
        if (!value) return 'Citizenship is required';
        // Additional logic could check if value is in valid citizenship options
        break;

      case 'countryCode':
        if (!value) return 'Country Code is required';
        // Could check valid ISO codes or country dial codes here
        break;

      case 'mobileNo':
        if (!value?.trim()) return 'Mobile Number is required';

        // Check if it contains only digits
        if (!/^\d+$/.test(value)) {
          return 'Mobile number must contain only digits';
        }

        // Check countryCode from formData
        if (formData.countryCode === '+91') {
          // For India: exactly 10 digits
          if (value.length !== 10) {
            return value.length > 10
              ? 'For India, mobile number cannot exceed 10 digits'
              : 'For India, mobile number must be exactly 10 digits';
          }
          if (!/^[6-9]/.test(value)) {
            return 'Indian mobile number should start with 6, 7, 8, or 9';
          }
        } else {
          // For international: 8-15 digits
          if (value.length < 8) {
            return 'Mobile number must be at least 8 digits';
          }
          if (value.length > 15) {
            return 'Mobile number cannot exceed 15 digits';
          }
        }

        break;

      case 'landline':
        if (value && !landlineRegex.test(value))
          return 'Landline number can contain digits, +, space and hyphen only';
        if (value && value.length > 15)
          return 'Landline number cannot exceed 15 characters';
        break;

      default:
        break;
    }

    return undefined; // valid
  };

  useEffect(() => {
    // Check verification status whenever preview data or form data changes
    const isVerifiedFromPreview = isCkycVerifiedFromPreview();
    if (isVerifiedFromPreview && !isKycVerified) {
      setIsKycVerified(true);
    } else if (!isVerifiedFromPreview && isKycVerified && !isVerified) {
      // Only reset if it was verified from preview (not manual verification)
      setIsKycVerified(false);
    }
  }, [previewData, formData.ckycNumber, formData.citizenship]);
  // Function called when preview data is available (if needed)
  const handlePreviewDataUpdate = () => {
    // If current CKYC matches preview data, mark as verified
    if (
      previewData?.ckycNumber &&
      formData.ckycNumber &&
      previewData.ckycNumber === formData.ckycNumber &&
      formData.citizenship === 'Indian'
    ) {
      setIsKycVerified(true);
    }
  };

  // Updated handleChange function with CKYC verification logic
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;
    setCountryData(value);

    if (target instanceof HTMLInputElement && target.type === 'file') {
      const file = target.files?.[0];
      if (file) {
        const previewURL = URL.createObjectURL(file);
        const updated = {
          ...formData,
          [name]: file,
          [`${name}Preview`]: previewURL,
        };
        setFormData(updated);
        dispatch(setHeadInstitutionFormData(updated));
        setErrors((prev: any) => ({ ...prev, [name]: undefined }));
      }
    } else {
      let processedValue = value;
      let updated = { ...formData };

      // MOBILE NUMBER HANDLING
      if (name === 'mobileNo') {
        const numericValue = value.replace(/\D/g, '');
        const maxLength =
          formData.countryCode === '+91' || formData.citizenship === 'Indian'
            ? 10
            : 15;
        processedValue = numericValue.slice(0, maxLength);
      }

      // FIRST NAME HANDLING - Allow A-Z, a-z, apostrophe, dot, space
      if (name === 'firstName') {
        processedValue = value.replace(/[^A-Za-z.' ]/g, '').slice(0, 33);
      }

      // MIDDLE NAME HANDLING - Allow A-Z, a-z, apostrophe, dot, space
      if (name === 'middleName') {
        processedValue = value.replace(/[^A-Za-z.' ]/g, '').slice(0, 33);
      }

      // LAST NAME HANDLING - Allow typing space but validation will show error
      // Filter only invalid chars (numbers, special chars except apostrophe/dot)
      if (name === 'lastName') {
        processedValue = value.replace(/[^A-Za-z.' ]/g, '').slice(0, 33);
        console.log('📝 lastName input filtering:', { original: value, processed: processedValue });
      }

      // CKYC NUMBER HANDLING
      if (name === 'ckycNumber') {
        processedValue = value.replace(/\D/g, '').slice(0, 14);

        // Clear manual verification states when CKYC changes
        setIsVerified(false);
        setotpIdentifier('');
        setCkycOTPModalOpen(false);
        dispatch(setCkycData(null));

        updated = {
          ...updated,
          [name]: processedValue,
          firstName: '',
          lastName: '',
          middleName: '',
          title: '',
          gender: '',
        };

        // Check if the new CKYC matches preview data after state update
        setTimeout(() => {
          const isVerifiedFromPreview =
            previewData?.ckycNumber &&
            processedValue &&
            previewData.ckycNumber === processedValue &&
            formData.citizenship === 'Indian';
          setIsKycVerified(isVerifiedFromPreview);
        }, 0);
      } else {
        updated = { ...updated, [name]: processedValue };
      }

      // CITIZENSHIP HANDLING
      if (name === 'citizenship') {
        updated = {
          ...updated,
          ckycNumber: '',
          title: '',
          firstName: '',
          middleName: '',
          lastName: '',
          gender: '',
        };
        setIsVerified(false);
        setIsKycVerified(false);
        setotpIdentifier('');
        setCkycOTPModalOpen(false);
        dispatch(setCkycData(null));
      }

      // FINAL STATE UPDATE
      setFormData(updated);
      dispatch(setHeadInstitutionFormData(updated));

      // Error handling
      const errorMsg = validateEntityField(name, processedValue, updated);
      if (name === 'lastName') {
        console.log('🔧 handleChange for lastName:', { name, processedValue, errorMsg });
      }
      if (name === 'ckycNumber') {
        setErrors((prev: any) => ({
          ...prev,
          [name]: errorMsg,
          firstName: undefined,
          lastName: undefined,
          middleName: undefined,
          title: undefined,
          gender: undefined,
        }));
      } else {
        setErrors((prev: any) => ({ ...prev, [name]: errorMsg }));
        if (name === 'lastName') {
          console.log('🔧 Error set for lastName:', errorMsg);
        }
      }
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    navigate('/re-address-details');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = stripCountryName(formData);

    try {
      dispatch(showLoader('Please Wait...'));
      await dispatch(submitHeadInstitutionThunk({ data: payload })).unwrap();
      // ✅ Save current section's data
      dispatch(
        setApplicationFormData({ section: 'headOfInstitution', data: formData })
      );
      // ✅ Mark this step as complete
      dispatch(markStepCompleted(2));

      // ✅ Move to next step
      dispatch(setCurrentStep(3));
      navigate('/re-nodal-officer-details');
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      dispatch(hideLoader());
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: value, // or countryCode: value if that's what you're storing
    }));
  };

  const handleValidate = async () => {
    if (!authToken || !userEmail) {
      alert('Missing email or token');
      return;
    }

    try {
      dispatch(showLoader('Please Wait...'));
      const result = await dispatch(
        sendOtp({
          emailId: formData?.emailId || '',
          mobileNo: formData?.mobileNo || '',
          token: authToken,
        })
      );

      if (sendOtp.fulfilled.match(result)) {
        setOTPModalOpen(true); // Open OTP modal only if sendOtp succeeds
      } else {
        alert(
          'Failed to send OTP: ' + (result.payload?.message || 'Unknown error')
        );
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert('Unexpected error while sending OTP');
    } finally {
      dispatch(hideLoader());
    }
  };
  const handleOkay = () => {
    setSuccessModalOpen(false);
    setIsOtpVerified(true); // ✅ OTP has been verified

    // ✅ UPDATE: Reset initial state to current form values after verification
    const currentEmail = formData.email || formData.emailId || '';
    setInitialFormState({
      mobileNo: formData.mobileNo || '',
      countryCode: formData.countryCode || '',
      email: currentEmail,
    });
  };
  const handleSaveAndNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  return (
    <>
      <div className="signup-container">
        <div className="signup-card">
          <div className="logo-container">
            <button className="backButton" onClick={handleBack}>
              <ArrowBackIosIcon className="back-icon" />
              <span className="back-text">Back</span>
            </button>
            <CKYCRRLogo className="signup-logo" />
          </div>
          <div className="tab-container">
            <button
              className={activeTab === 'signup' ? 'active' : ''}
              onClick={() => handleTabChange('signup')}
              disabled
              style={{ cursor: 'not-allowed' }}
            >
              Sign Up
            </button>
            <button
              className={activeTab === 'register' ? 'active' : ''}
              onClick={() => handleTabChange('register')}
            >
              Resume Registration
            </button>
          </div>
          <ApplicationStepper />
          {isOTPModalOpen && (
            <OTPModalRegister
              isOpen={isOTPModalOpen}
              onClose={() => setOTPModalOpen(false)}
              onOtpSubmit={(otp) => {
                // handle OTP submission
                console.log('Submitted OTP:', otp);
                setOTPModalOpen(false); // Close OTP modal
                setSuccessModalOpen(true); // Open success modal
              }}
              countryCode={formData?.countryCode}
              email={formData?.emailId}
              mobile={formData?.mobileNo}
            />
          )}
          <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={() => setSuccessModalOpen(false)}
            onOkay={handleOkay}
            title="Details Verified Successfully!"
            message="The Head of Institution's details have been verified successfully"
          />
          <div className="step-indicator">Head of Institution Details</div>
          <form className="entity-form" onSubmit={handleSubmit}>
            <div className="form-row" style={{ marginBottom: '-10px' }}>
              <div className="form-group">
                <label htmlFor="citizenship">
                  Citizenship<span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="citizenship"
                  onChange={handleChange}
                  value={formData.citizenship || ''}
                  disabled={
                    !isEditableField(HEAD_OFFICE_DETAILS, 'hoiCitizenship')
                  }
                  required={isEditableField(
                    HEAD_OFFICE_DETAILS,
                    'hoiCitizenship'
                  )}
                >
                  <option value="">Select Citizenship</option>
                  {/* {citizenshipOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))} */}

                  {citizenships.map((citizenship: any) => (
                    <option key={citizenship.code} value={citizenship.name}>
                      {citizenship.name}
                    </option>
                  ))}
                </select>
                {errors.citizenship && (
                  <div className="error-message">{errors.citizenship}</div>
                )}
              </div>
              <div className="form-group">
                <label>
                  CKYC number
                  {isIndianCitizen && <span style={{ color: 'red' }}>*</span>}
                </label>
                <div className="ckyc-input-container">
                  <input
                    type="text"
                    name="ckycNumber"
                    placeholder="Enter CKYC number"
                    value={formData.ckycNumber || ''}
                    onChange={handleChange}
                    disabled={
                      !isEditableField(HEAD_OFFICE_DETAILS, 'hoiCkycNumber')
                    }
                    className="ckyc-input-field"
                    maxLength={14}
                  />
                  {isKycVerified || isCkycVerifiedFromPreview() ? (
                    <span
                      style={{
                        color: '#52AE32',
                        fontWeight: '500',
                        padding: '10px 20px',
                        fontSize: '14px',
                        display: 'inline-flex',
                        // alignItems: 'center',
                        gap: '4px', // Add space between icon and text
                        // marginLeft: '12px'
                        position: 'absolute',
                        right: '10px',
                      }}
                    >
                      <CheckCircleOutlineIcon style={{ fontSize: '16px' }} />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          !formData.ckycNumber ||
                          formData.ckycNumber.length !== 14
                        ) {
                          console.error('Invalid CKYC number');
                          return;
                        }
                        dispatch(showLoader('Please wait...'));
                        const resultAction = await dispatch(
                          fetchCkycDetails(formData.ckycNumber.trim())
                        );
                        if (fetchCkycDetails.fulfilled.match(resultAction)) {
                          dispatch(hideLoader());
                          setIsVerified(true);
                          setotpIdentifier(resultAction.payload.otp_identifier);
                          setCkycOTPModalOpen(true);
                        } else {
                          console.error('Error');
                        }
                      }}
                      className="verify-button"
                      disabled={
                        formData.citizenship !== 'Indian' ||
                        !formData.ckycNumber ||
                        formData.ckycNumber.length !== 14 ||
                        !isEditableField(HEAD_OFFICE_DETAILS, 'hoiCkycNumber')
                      }
                      style={{
                        background: '#002CBA',
                        color: 'white',
                        position: 'absolute',
                        right: '10px',
                      }}
                    >
                      Verify
                    </button>
                  )}
                </div>
                {errors.ckycNumber && (
                  <div className="error-message">{errors.ckycNumber}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="title">
                  Title<span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="title"
                  onChange={handleChange}
                  value={ckycDataHOI?.title || formData?.title || ''}
                  defaultValue="Select citizenship"
                  disabled={
                    !isIndianCitizen ||
                      Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(HEAD_OFFICE_DETAILS, 'hoiTitle')
                      : true // 🔒 keep disabled for all other statuses
                  }
                  required={isEditableField(HEAD_OFFICE_DETAILS, 'hoiTitle')}
                >
                  <option value="">Select Title</option>
                  {/* <option value="Mr.">Mr</option>
                  <option value="Mrs.">Mrs</option>
                  <option value="Ms">Ms</option> */}

                  {titles.map((title: any) => (
                    <option key={title.code} value={title.name}>
                      {title.name}
                    </option>
                  ))}
                </select>
                {errors.title && (
                  <div className="error-message">{errors.title}</div>
                )}
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '-10px' }}>
              <div className="form-group">
                <label htmlFor="f_name">
                  First Name<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter First Name"
                  value={ckycDataHOI?.firstName || formData?.firstName || ''}
                  onChange={handleChange}
                  disabled={
                    // Editable for non-Indian, disabled for Indian when CKYC populated
                    (isIndianCitizen && !!ckycDataHOI?.firstName) ||
                    (Reinitializestatus === 'REQUEST_FOR_MODIFICATION' &&
                      !isEditableField(HEAD_OFFICE_DETAILS, 'hoiFirstName')) ||
                    isViewOnlyHOI
                  }
                  required={isEditableField(
                    HEAD_OFFICE_DETAILS,
                    'hoiFirstName'
                  )}
                />
                {errors.firstName && (
                  <div className="error-message">{errors.firstName}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="m-name">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  placeholder="Enter middle name"
                  value={ckycDataHOI?.middleName || formData?.middleName || ''}
                  onChange={handleChange}
                  disabled={
                    // Editable for non-Indian, disabled for Indian when CKYC populated
                    (isIndianCitizen && !!ckycDataHOI?.middleName) ||
                    (Reinitializestatus === 'REQUEST_FOR_MODIFICATION' &&
                      !isEditableField(HEAD_OFFICE_DETAILS, 'hoiMiddleName')) ||
                    isViewOnlyHOI
                  }
                // required={isEditableField(
                //   HEAD_OFFICE_DETAILS,
                //   'hoiMiddleName'
                // )}
                />
                {errors.middleName && (
                  <div className="error-message">{errors.middleName}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="l_name">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={ckycDataHOI?.lastName || formData?.lastName || ''}
                  onChange={handleChange}
                  disabled={
                    // Editable for non-Indian, disabled for Indian when CKYC populated
                    (isIndianCitizen && !!ckycDataHOI?.lastName) ||
                    (Reinitializestatus === 'REQUEST_FOR_MODIFICATION' &&
                      !isEditableField(HEAD_OFFICE_DETAILS, 'hoiLastName')) ||
                    isViewOnlyHOI
                  }
                  required={isEditableField(HEAD_OFFICE_DETAILS, 'hoiLastName')}
                />
                {errors.lastName && (
                  <div className="error-message">{errors.lastName}</div>
                )}
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '-10px' }}>
              <div className="form-group">
                <label htmlFor="designation">
                  Designation<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  placeholder="Enter Designation"
                  value={formData?.designation || ''}
                  onChange={handleChange}
                  disabled={
                    !isEditableField(HEAD_OFFICE_DETAILS, 'hoiDesignation')
                  }
                  required={isEditableField(
                    HEAD_OFFICE_DETAILS,
                    'hoiDesignation'
                  )}
                />
                {errors.designation && (
                  <div className="error-message">{errors.designation}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="emailId"
                  placeholder="Enter EmailId"
                  value={formData?.emailId || ''}
                  onChange={handleChange}
                  disabled={!isEditableField(HEAD_OFFICE_DETAILS, 'hoiEmailId')}
                  required={isEditableField(HEAD_OFFICE_DETAILS, 'hoiEmailId')}
                />
                {errors.emailId && (
                  <div className="error-message">{errors.emailId}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Gender<span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="gender"
                  onChange={handleChange}
                  value={ckycDataHOI?.gender || formData?.gender || ''}
                  defaultValue="Select Gender"
                  disabled={
                    // !isEditableField("headOfInstitutionDetails", "hoiGender")
                    !isIndianCitizen ||
                      Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(HEAD_OFFICE_DETAILS, 'hoiGender')
                      : true // 🔒 keep disabled for all other statuses
                  }
                >
                  <option value="">Select Gender</option>
                  {/* <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option> */}
                  {genders.map((gender: any) => (
                    <option key={gender.code} value={gender.name}>
                      {gender.name}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <div className="error-message">{errors.gender}</div>
                )}
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '-10px' }}>
              <div className="form-group">
                <label
                  htmlFor="countryCode"
                  className="required"
                  style={{ marginBottom: '1px' }}
                >
                  Country Code<span style={{ color: 'red' }}>*</span>
                </label>
                <div
                  className="country-code-wrapper"
                // style={{
                //   height: "47px",
                //   display: "flex",
                //   alignItems: "center",
                //   border: "1px solid grey",
                //   borderRadius: "7px",
                //   position: "relative",
                //   width: "100%", // Ensures responsiveness
                // }}
                >
                  <select
                    className="country-code-dropdown"
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      paddingRight: '10px',
                      minWidth: '70px',
                      maxWidth: '25%', // Responsive: takes max 25% of container width
                      height: '100%',
                    }}
                    name="countryCode"
                    value={formData?.countryCode}
                    onChange={handleCountryChange}
                    disabled={
                      !isEditableField(HEAD_OFFICE_DETAILS, 'hoiCountryCode')
                    }
                    required={isEditableField(
                      HEAD_OFFICE_DETAILS,
                      'hoiCountryCode'
                    )}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.dial_code}>
                        {country.dial_code}
                      </option>
                    ))}
                  </select>

                  {/* Vertical divider line - responsive positioning */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 'min(65px, 25%)', // Responsive: either 65px or 25% of container width, whichever is smaller
                      top: '8px',
                      bottom: '8px',
                      width: '1px',
                      backgroundColor: '#ccc',
                    }}
                  ></div>

                  {formData.countryName?.length === 0 ? (
                    <label
                      htmlFor="country_code"
                      className="country-name-input"
                      style={{
                        marginLeft: '15px',
                        fontSize: '14px',
                        color: '#999',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Select Country Code
                    </label>
                  ) : (
                    <label
                      className="country-name-input"
                      style={{
                        marginLeft: '15px',
                        fontSize: '14px',
                        color: '#555',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {formData.countryName || ''}
                    </label>
                  )}
                </div>

                {errors.countryCode && (
                  <div className="error-message">{errors.countryCode}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="mobile">
                  Mobile Number<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="mobileNo"
                  placeholder="Enter mobile number"
                  value={formData.mobileNo || ''}
                  onChange={handleChange}
                  maxLength={
                    formData.countryCode === '+91' ||
                      formData.citizenship === 'Indian'
                      ? 10
                      : 15
                  }
                  pattern="[0-9]*"
                  inputMode="numeric"
                  disabled={
                    !isEditableField(HEAD_OFFICE_DETAILS, 'hoiMobileNo')
                  }
                  required={isEditableField(HEAD_OFFICE_DETAILS, 'hoiMobileNo')}
                />
                {errors.mobileNo && (
                  <div className="error-message">{errors.mobileNo}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="landline">Landline Number</label>
                <input
                  type="text"
                  name="landline"
                  placeholder="Enter landline number"
                  value={formData.landline || ''}
                  onChange={handleChange}
                  disabled={
                    !isEditableField(HEAD_OFFICE_DETAILS, 'hoiLandline')
                  }
                />
                {errors.landline && (
                  <div className="error-message">{errors.landline}</div>
                )}
              </div>
            </div>

            <div className="form-footer">
              <button
                type="button"
                className="validate-btn-hoi"
                onClick={handleValidate}
                disabled={!isFormValid}
              >
                Validate
              </button>
              <button
                type="submit"
                className="submit-btn-hoi"
                disabled={!canSaveAndNext() || isViewOnlyHOI}
              >
                Save & Next
              </button>
            </div>
            {HOIerror && (
              <div
                className="error-message-main"
                style={{ color: 'red', marginTop: '10px' }}
              >
                {HOIerror}
              </div>
            )}
          </form>
        </div>
      </div>
      <CkycrrVerifyModal
        isOpen={isCkycOTPModalOpen}
        onClose={() => setCkycOTPModalOpen(false)}
        ckycNumber={formData.ckycNumber || ''}
        setShowSuccessModal={() => {
          setIsKycVerified(true);
          console.log(isCkycOTPModalOpen);
        }}
        updateData={(data) => {
          dispatch(setCkycData(data));
          setCkycOTPModalOpen(false);
        }}
        otpIdentifier={otpIdentifier}
        updateOtpIdentifier={(item) => {
          setotpIdentifier(item);
        }}
      />
    </>
  );
};

export default InstitutionDetails;
