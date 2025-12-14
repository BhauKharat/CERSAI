/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import { State, Country } from 'country-state-city';
import { ReactComponent as CKYCRRLogo } from '../../../assets/ckycrr_sign_up_logo.svg';
// import '../Registration/registrationPage.css';
import CalendarIcon from '../../../assets/Icon.svg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardControlKeyRoundedIcon from '@mui/icons-material/KeyboardControlKeyRounded';
// import OTPModal from '../../Authentication/OTPModal/OTPModal';
import OTPModalRegister from '../OTPModalregister/otpModalRegister';
import SuccessModal from '../SuccessModalOkay/successModal';

import 'react-datepicker/dist/react-datepicker.css';
import {
  Typography,
  FormGroup,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// import Typography from '@mui/material/Typography';
//import '../../pages/Registration/registrationPage.css';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router';
import './institutionAdminDetails.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCkycDetails,
  setAdminOne,
  setAdminTwo,
  submitAdminOfficers,
} from '../../../redux/slices/registerSlice/institutionadminSlice';
import { AppDispatch, RootState } from '../../../redux/store'; // adjust path as needed
import {
  hideLoader,
  showLoader,
} from '../../../redux/slices/loader/loaderSlice';
import { sendOtp } from '../../features/Authenticate/slice/passSetupOtpSlice';
import ReusableModal from '../../../component/Modal/ReusableModalPreview/reusableModal';
import ApplicationStepper from '../../../component/stepper/ApplicationStepper';
import {
  markStepCompleted,
  setApplicationFormData,
  setCurrentStep,
} from '../../../redux/slices/registerSlice/applicationSlice';
import PreviewConfirmationModal from '../../../component/Modal/ReusableModalPreview/previewModal';
import uploadIcon from '../../../assets/UploadIconNew.svg';
import UploadIconButton from '../../../assets/UploadIconButton.svg';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Form steps (you can name them accordingly)

const REQUIRED_KEYS = [
  'firstName',
  'citizenship',
  // "ckycNumber",
  // "lastName",
  'designation',
  'emailId',
  'mobileNo',
  'proofOfIdentity',
  'identityNumber',
  'employeeCode',
  'dateOfBirth',
  'gender',
  'authorizationLetterDetails',
  'dateOfAuthorization',
  // "iau_two_certified_poi",
  // "iau_one_certified_poi",
  // "iau_one_certified_photoIdentity",
  // "iau_two_certified_photoIdentity"
];

// const isAdminFormValid = (data: Record<string, any>): boolean =>
//   REQUIRED_KEYS.every((key) => Boolean(data[key]));
const isAdminFormValid = (
  data: Record<string, any>,
  adminErrors: Record<string, string> = {}
): boolean => {
  // Check if all required fields are filled
  const isRequiredFieldsFilled = REQUIRED_KEYS.every((key) =>
    Boolean(data[key])
  );

  // Check if there are no validation errors for any field
  const hasNoValidationErrors = Object.values(adminErrors).every(
    (error) => !error
  );

  // CKYC required only if citizenship is Indian
  const isCkycValid =
    data?.citizenship === 'Indian' ? Boolean(data?.ckycNumber) : true;

  return isRequiredFieldsFilled && isCkycValid && hasNoValidationErrors;
};

const InstitutionAdminDetails = () => {
  interface Country {
    name: string;
    dial_code: string;
    code: string;
  }

  interface FormDataType {
    adminOne: {
      title?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      designation?: string;
      emailId?: string;
      ckycNumber?: string;
      gender?: string;
      citizenship?: string;
      mobileNo?: string;
      landline?: string;
      proofOfIdentity?: string;
      identityNumber?: string;
      dateOfBirth?: string;
      employeeCode?: string;
      authorizationLetterDetails?: string;
      countryCode?: string;
      countryName?: string;
      authorizationLetterDetailsPreview?: string;
      sameAsRegisteredAddress?: boolean;
      authorizationLetterFile?: string;
      authorizationLetterFilePreview?: string;
      dateOfAuthorization?: string;
    };
    adminTwo: {
      title?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      designation?: string;
      emailId?: string;
      ckycNumber?: string;
      gender?: string;
      citizenship?: string;
      mobileNo?: string;
      landline?: string;
      proofOfIdentity?: string;
      identityNumber?: string;
      dateOfBirth?: string;
      employeeCode?: string;
      authorizationLetterDetails?: string;
      authorizationLetterDetailsPreview?: string;
      countryCode?: string;
      countryName?: string;

      authorizationLetterFile?: string;
      authorizationLetterFilePreview?: string;

      sameAsRegisteredAddress?: boolean;
      dateOfAuthorization?: string;
    };
    iau_one_certified_poi?: File;
    iau_one_certified_poiPreview?: string;
    iau_one_certified_photoIdentity?: File;
    iau_one_certified_photoIdentityPreview?: string;
    iau_one_authorization_letter?: File;

    iau_one_authorization_letterPreview?: string;
    iau_two_authorization_letter?: File;
    iau_two_authorization_letterPreview?: string;
    iau_two_certified_poi?: File;
    iau_two_certified_poiPreview?: string;
    iau_two_certified_photoIdentity?: File;
    iau_two_certified_photoIdentityPreview?: string;

    institution?: string;
    regulator?: string;
    pan?: File;
    panPreview?: string;
    registrationCert?: File;
    registrationCertPreview?: string;

    // Add other expected fields...
    [key: string]: any; // still allow dynamic keys
  }
  const [formData, setFormData] = useState<FormDataType>({
    adminOne: { countryCode: '+91' },
    adminTwo: { countryCode: '+91' },
  });

  const { adminOneDetails } = useSelector(
    (state: RootState) => state.applicationPreview
  );
  const { adminTwoDetails } = useSelector(
    (state: RootState) => state.applicationPreview
  );

  //debugger
  const reduxAdminOne =
    useSelector((state: RootState) => state.adminOfficer.adminOne) || {};
  const reduxAdminTwo =
    useSelector((state: RootState) => state.adminOfficer.adminTwo) || {};
  const { ckycDataAdminOne, ckycDataAdminTwo } = useSelector(
    (state: RootState) => state.adminOfficer
  );
  const { errorInstitutionadminDetails, validationErrors } = useSelector(
    (state: RootState) => state.adminOfficer
  );
  const documents = useSelector(
    (state: RootState) => state.applicationPreview.documents
  );

  const iauTwoCertifiedPOI = documents?.find(
    (doc) => doc.documentType === 'IAU_TWO_CERTIFIED_POI'
  );

  const iauTwoCertifiedPhotoIdentity = documents?.find(
    (doc) => doc.documentType === 'IAU_TWO_CERTIFIED_PHOTO_IDENTITY'
  );

  const iauOneCertifiedPOI = documents?.find(
    (doc) => doc.documentType === 'IAU_ONE_CERTIFIED_POI'
  );

  const iauOneCertifiedPhotoIdentity = documents?.find(
    (doc) => doc.documentType === 'IAU_ONE_CERTIFIED_PHOTO_IDENTITY'
  );

  const iauOneAuthorizationLetter = documents?.find(
    (doc) => doc.documentType === 'IAU_ONE_AUTHORIZATION_LETTER'
  );
  const iauTwoAuthorizationLetter = documents?.find(
    (doc) => doc.documentType === 'IAU_TWO_AUTHORIZATION_LETTER'
  );

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [, setStates] = useState<unknown[]>([]);
  const [activeTab, setActiveTab] = useState('register');
  const [isOTPAdminModalOpen, setOTPAdminModalOpen] = useState(false);
  const [isOtpVerified, setOtpVerified] = useState(false);
  const [isOTPAdmin2ModalOpen, setOTPAdmin2ModalOpen] = useState(false);
  const [isOtpVerifiedAdmin2, setOtpVerifiedAdmin2] = useState(false);
  const [isSuccessAdminModalOpen, setSuccessAdminModalOpen] = useState(false);
  const [isSuccessAdmin2ModalOpen, setSuccessAdmin2ModalOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isAdminOneValidated, setIsAdminOneValidated] = useState(false);
  const [isAdminTwoValidated, setIsAdminTwoValidated] = useState(false);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFieldName, setPendingFieldName] = useState<string | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null
  );
  const [isPreviewConfirmationOpen, setIsPreviewConfirmationOpen] =
    useState<boolean>(false);

  const [isAuthorizationLetterModalOpen, setIsAuthorizationLetterModalOpen] =
    useState(false);
  const [isPoiModalOpen, setIsPoiModalOpen] = useState(false);
  const [isPhotoIdentityModalOpen, setIsPhotoIdentityModalOpen] =
    useState(false);

  const [
    isAuthorizationLetterAdminTwoModalOpen,
    setIsAuthorizationLetterAdminTwoModalOpen,
  ] = useState(false);
  const [isPoiAdminTwoModalOpen, setIsPoiAdminTwoModalOpen] = useState(false);
  const [
    isPhotoIdentityAdminTwoModalOpen,
    setIsPhotoIdentityAdminTwoModalOpen,
  ] = useState(false);
  const [openDobAdminOne, setOpenDobAdminOne] = useState(false); // state for Date of Birth
  const [openDobAdminTwo, setOpenDobAdminTwo] = useState(false); // state for adminTwo DOB calendar
  const [openAuthDate, setOpenAuthDate] = useState(false); // new state for this field
  const [openAuthorizationDate, setOpenAuthorizationDate] = useState(false);
  const [adminOneCkycVerified, setAdminOneCkycVerified] = useState(false);
  const [adminTwoCkycVerified, setAdminTwoCkycVerified] = useState(false);
  const [ckycLoading, setCkycLoading] = useState(false);
  const [APIError, setAPIError] = useState('');
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  const userEmail = useSelector(
    (state: RootState) => state.auth.userDetails?.email
  );

  const { proofOfIdentities, citizenships, titles, genders } = useSelector(
    (state: RootState) => state.masters
  );
  const geographyHierarchy = useSelector(
    (state: RootState) => state.masters.geographyHierarchy
  );

  interface ErrorState {
    adminOne?: Record<string, string>;
    adminTwo?: Record<string, string>;
    // Add specific flat fields as needed
    iau_one_certified_photoIdentity?: string;
    iau_two_certified_photoIdentity?: string;
    iau_one_certified_poi?: string;
    iau_two_certified_poi?: string;
    iau_one_authorization_letter?: string;
    iau_two_authorization_letter?: string;

    // Add other document fields as needed
  }

  const [errors, setErrors] = useState<ErrorState>({});

  const Reinitializestatus = useSelector(
    (state: RootState) => state.auth.reinitializeData?.approvalStatus
  );
  const modifiableFields = useSelector(
    (state: RootState) => state.auth.reinitializeData?.modifiableFields
  );

  const getFirstValidationError = () => {
    if (!validationErrors || validationErrors.length === 0) return null;
    return validationErrors[0]; // This will always be the first (and only) error now
  };

  const firstError = getFirstValidationError();
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

  const INSTITUTIONAL_ADMIN_DETAILS = 'INSTITUTIONAL_ADMIN_DETAILS';

  const isViewOnlyAdmin = viewOnlyStatuses.includes(Reinitializestatus ?? '');

  const isEditableField = (section: string, field: string): boolean => {
    // ✅ Restrict only for modification flow
    if (Reinitializestatus === 'REQUEST_FOR_MODIFICATION') {
      return !!modifiableFields?.[section]?.includes(field);
    }
    // const viewOnlyStatuses = [
    //   "SUBMITTED_PENDING_APPROVAL",
    //   "APPROVED",
    //   "REJECTED",
    //   "READY_FOR_SUBMISSION",
    // ];
    if (viewOnlyStatuses.includes(Reinitializestatus ?? '')) {
      return false;
    }

    // ✅ All fields editable otherwise
    return true;
  };

  const setNestedValue = (obj: any, path: string[], value: any) => {
    if (path.length === 1) {
      obj[path[0]] = value;
    } else {
      if (!obj[path[0]]) obj[path[0]] = {};
      setNestedValue(obj[path[0]], path.slice(1), value);
    }
  };
  const isIndianCitizen = formData.adminOne?.citizenship === 'Indian';
  const isIndianCitizenAdminTwo = formData.adminTwo?.citizenship === 'Indian';
  const validateField = (
    name: string,
    value: string,
    formData: any
  ): string => {
    const isAlpha = /^[A-Za-z.' ]+$/;
    const isAlphaNoSpace = /^[A-Za-z.']+$/;
    const isAlphanumericSpecial = /^[A-Za-z0-9`~@#$%^&*()_+\-=]+$/;
    const isEmail =
      /^[A-Za-z0-9`~@#$%^&*()._+\-=]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const isNumeric = /^\d+$/;
    const isMobileIndia = /^\d{10}$/;
    const isMobileIntl = /^\d{8,15}$/;

    switch (name) {
      // First Name
      case 'adminOne.firstName':
      case 'adminTwo.firstName':
        if (!value.trim()) return 'First name is required.';
        if (!isAlpha.test(value))
          return 'First name can only contain letters, space, apostrophe, and dot.';
        if (value.length > 33) return 'First name must be under 33 characters.';
        break;

      // Middle Name
      case 'adminOne.middleName':
      case 'adminTwo.middleName':
        if (value && (!isAlphaNoSpace.test(value) || value.includes(' '))) {
          return 'Middle name can only contain letters, apostrophe, and dot (no spaces).';
        }
        if (value.length > 33)
          return 'Middle name must be under 33 characters.';
        break;

      // Last Name
      case 'adminOne.lastName':
      case 'adminTwo.lastName':
        if (!value && (!isAlphaNoSpace.test(value) || value.includes(' '))) {
          return 'Last name can only contain letters and apostrophe (no spaces).';
        }
        if (value.length > 33) return 'Last name must be under 33 characters.';
        break;

      // Designation
      case 'adminOne.designation':
      case 'adminTwo.designation':
        if (!value.trim()) return 'Designation is required.';
        if (!isAlphanumericSpecial.test(value)) {
          return 'Designation can only contain alphanumeric and special characters `~@#$%^&*()_+-=.';
        }
        if (value.length > 100)
          return 'Designation must be under 100 characters.';
        break;

      // Email
      case 'adminOne.emailId':
      case 'adminTwo.emailId':
        if (!value.trim()) return 'Email is required.';
        if (!isEmail.test(value)) return 'Invalid email format.';
        if (value.length > 254) return 'Email must be under 254 characters.';
        break;

      // CKYC Number
      case 'adminOne.ckycNumber':
      case 'adminTwo.ckycNumber':
        if (!value.trim()) return 'CKYC number is required.';
        if (value.length !== 14) {
          return 'CKYC number must be 14 digits.';
        }

        if (value.length > 14) {
          return 'CKYC number cannot exceed 14 digits.';
        }
        break;

      // Country Code
      case 'adminOne.countryCode':
      case 'adminTwo.countryCode':
        if (!value) return 'Country code is required.';
        break;

      // Mobile Number
      case 'adminOne.mobileNo':
      case 'adminTwo.mobileNo':
        if (!value.trim()) return 'Mobile number is required.';

        const countryCode = name.startsWith('adminOne')
          ? formData.adminOne?.countryCode
          : formData.adminTwo?.countryCode;

        // Check if it contains only digits
        if (!/^\d+$/.test(value)) {
          return 'Mobile number must contain only digits';
        }

        if (countryCode === '+91') {
          // For India: exactly 10 digits required
          if (value.length < 10) {
            return 'Indian mobile number must be exactly 10 digits';
          }
          if (value.length > 10) {
            return 'Indian mobile number cannot exceed 10 digits';
          }
          // Additional validation: Indian mobile numbers should start with 6-9
          if (!/^[6-9]/.test(value)) {
            return 'Indian mobile number should start with 6, 7, 8, or 9';
          }
        } else {
          // For other countries: 8-15 digits
          if (value.length < 8) {
            return 'Mobile number must be at least 8 digits';
          }
          if (value.length > 15) {
            return 'Mobile number cannot exceed 15 digits';
          }
        }
        break;

      // Proof of Identity
      case 'adminOne.proofOfIdentity':
      case 'adminTwo.proofOfIdentity':
        if (!value.trim()) return 'Proof of identity is required.';
        break;

      // Proof of Identity Number
      case 'adminOne.identityNumber':
      case 'adminTwo.identityNumber':
        const poiType = name.startsWith('adminOne')
          ? formData?.adminOne?.proofOfIdentity
          : formData?.adminTwo?.proofOfIdentity;
        console.log(poiType, 'Poitype');

        if (!value.trim()) return 'Proof of identity number is required.';
        const citizenship = name.startsWith('adminOne')
          ? formData.adminOne?.citizenship
          : formData.adminTwo?.citizenship;
        if (citizenship === 'Indian') {
          // Additional PoI-based validation logic can go here
        }
        switch (poiType) {
          case 'AADHAAR':
            if (!/^\d{12}$/.test(value))
              return 'Aadhaar must be a 12-digit number';
            break;

          case 'VOTER_ID':
            if (!/^[A-Z]{3}[0-9]{7}$/.test(value))
              return 'Voter ID must be 3 uppercase letters followed by 7 digits';
            break;

          case 'PASSPORT':
            if (!/^[A-PR-WY][0-9]{7}$/.test(value))
              return 'Passport must be 1 letter followed by 7 digits';
            break;

          case 'DRIVING_LICENSE':
            if (!/^[A-Z]{2}[0-9]{2}[0-9A-Z]{11,13}$/.test(value))
              return 'Driving License format is invalid';
            break;

          case 'PAN_CARD':
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value))
              return 'PAN must be in format: 5 letters, 4 digits, 1 letter';
            break;

          default:
            return 'Invalid Proof of Identity selected';
        }
        break;

      // Date of Birth
      case 'adminOne.dateOfBirth':
      case 'adminTwo.dateOfBirth':
        if (!value.trim()) return 'Date of birth is required.';
        // if (!isDate.test(value)) return "Date must be in DDMMYYYY format.";
        break;

      // Gender
      case 'adminOne.gender':
      case 'adminTwo.gender':
        if (!value.trim()) return 'Gender is required.';
        break;

      // Citizenship
      case 'adminOne.citizenship':
      case 'adminTwo.citizenship':
        if (!value.trim()) return 'Citizenship is required.';
        break;

      // Employee Code
      case 'adminOne.employeeCode':
      case 'adminTwo.employeeCode':
        if (!value.trim()) return 'Employee code is required.';
        if (!/^[A-Za-z0-9+]+$/.test(value))
          return "Employee code can contain alphanumeric characters and '+'.";
        if (value.length > 20)
          return 'Employee code must be under 20 characters.';
        break;

      // Landline
      case 'adminOne.landline':
      case 'adminTwo.landline':
        if (value && !/^[A-Za-z0-9+]+$/.test(value))
          return "Landline number can contain alphanumeric and '+'.";
        if (value.length > 15) return 'Landline must be under 15 characters.';
        break;

      // Authorization Letter Details
      case 'adminOne.authorizationLetterDetails':
      case 'adminTwo.authorizationLetterDetails':
        if (!value.trim()) return 'Authorization letter details are required.';
        if (!/^[A-Za-z0-9+]+$/.test(value))
          return "Only alphanumeric characters and '+' are allowed.";
        if (value.length > 20) return 'Must be under 20 characters.';
        break;

      // (Optional) Date of Authorization — if needed
      // case "adminOne.dateOfAuthorization":
      // case "adminTwo.dateOfAuthorization":
      //   if (!value.trim()) return "Date of authorization is required.";
      //   if (!isDate.test(value)) return "Date must be in DDMMYYYY format.";
      //   break;

      default:
        return '';
    }

    return '';
  };

  // const validateFile = (name: string, file: File): string => {
  //   const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
  //   const maxSize = 500 * 1024; // 500KB

  //   switch (name) {
  //     case 'iau_one_certified_poi':
  //     case 'iau_two_certified_poi':
  //     case 'iau_one_certified_photoIdentity':
  //     case 'iau_two_certified_photoIdentity':
  //       if (!allowedTypes.includes(file.type)) {
  //         return 'Invalid file format. Only PDF, JPG, JPEG allowed';
  //       }

  //       if (file.size > maxSize) {
  //         return 'File size must be less than 500KB';
  //       }
  //       break;

  //     default:
  //       return '';
  //   }

  //   return '';
  // };
  const validateFile = (name: string, file: File): string => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    const maxSize = 500 * 1024; // 500KB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file format. Only PDF, JPG, JPEG, PNG allowed';
    }
    if (file.size > maxSize) {
      return 'File size must be less than 500KB';
    }

    return '';
  };
  const handleAuthorizationPreviewClick = () => {
    if (formData?.iau_one_authorization_letterPreview) {
      setIsAuthorizationLetterModalOpen(true);
    }
  };

  const handlePoiPreviewClick = () => {
    if (formData?.iau_one_certified_poiPreview) {
      setIsPoiModalOpen(true);
    }
  };

  const handlePhotoIdentityPreviewClick = () => {
    if (formData?.iau_one_certified_photoIdentityPreview) {
      setIsPhotoIdentityModalOpen(true);
    }
  };
  const handleAuthorizationAdminTwoPreviewClick = () => {
    if (formData?.iau_two_authorization_letterPreview) {
      setIsAuthorizationLetterAdminTwoModalOpen(true);
    }
  };

  const handlePoiAdminTwoPreviewClick = () => {
    if (formData?.iau_two_certified_poiPreview) {
      setIsPoiAdminTwoModalOpen(true);
    }
  };

  const handlePhotoIdentityAdminTwoPreviewClick = () => {
    if (formData?.iau_two_certified_photoIdentityPreview) {
      setIsPhotoIdentityAdminTwoModalOpen(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;

    console.log('🔍 HandleChange Debug:', {
      name,
      value,
      currentFormData: formData,
      adminOne: formData.adminOne,
    });
    const isNestedField = name.includes('.');
    const path = isNestedField ? name.split('.') : [name];
    const section = isNestedField ? path[0] : null;
    const field = isNestedField ? path[1] : name;
    console.log('🔍 Parsed:', { isNestedField, path, section, field });

    if (target instanceof HTMLInputElement && target.type === 'file') {
      const file = target.files?.[0];
      if (file) {
        const errorMessage = validateFile(name, file);
        if (errorMessage) {
          if (
            isNestedField &&
            (section === 'adminOne' || section === 'adminTwo')
          ) {
            setErrors((prev) => ({
              ...prev,
              [section]: {
                ...prev[section],
                [field]: errorMessage,
              },
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              [field]: errorMessage,
            }));
          }
          return;
        }

        const previewURL = URL.createObjectURL(file);

        setFormData((prev) => {
          const copy = { ...prev };
          if (isNestedField) {
            setNestedValue(copy, path, file);
            setNestedValue(
              copy,
              [...path.slice(0, -1), `${field}Preview`],
              previewURL
            );
          } else {
            copy[field] = file;
            copy[`${field}Preview`] = previewURL;
          }
          return copy;
        });

        // Clear error
        if (
          isNestedField &&
          (section === 'adminOne' || section === 'adminTwo')
        ) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [section]: {
              ...prevErrors[section],
              [field]: '',
            },
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: '',
          }));
        }
      }
      return;
    }

    // Handle non-file inputs (these should be nested)
    if (isNestedField && (section === 'adminOne' || section === 'adminTwo')) {
      // 🟢 NEW: If Proof of Identity changes → clear identityNumber field
      if (field === 'proofOfIdentity') {
        setFormData((prev) => {
          const copy = { ...prev };
          setNestedValue(copy, path, value); // set new proofOfIdentity
          setNestedValue(copy, [section, 'identityNumber'], ''); // clear identityNumber
          return copy;
        });

        // clear errors for both proofOfIdentity & identityNumber
        setErrors((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            proofOfIdentity: '',
            identityNumber: '',
          },
        }));

        return; // stop here since we cleared the field
      }

      // 🟢 NEW: If CKYC number changes → reset verification status
      if (field === 'ckycNumber') {
        // Reset verification status when CKYC number changes
        if (section === 'adminOne') {
          setAdminOneCkycVerified(false);
        } else if (section === 'adminTwo') {
          setAdminTwoCkycVerified(false);
        }
      }
      // Normal flow for all other fields
      setFormData((prev) => {
        const copy = { ...prev };
        setNestedValue(copy, path, value);
        return copy;
      });

      // Validate current field
      const error = validateField(name, value, formData);

      setErrors((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: error,
        },
      }));

      // Reset validation if critical fields change
      const criticalFields = ['mobileNo', 'emailId', 'countryCode'];
      if (criticalFields.includes(field)) {
        if (section === 'adminOne' && hasAdminOneData()) {
          const newAdminOneData = { ...formData.adminOne, [field]: value };
          const hasChanged =
            newAdminOneData.mobileNo !== originalAdminOneValues.mobile ||
            newAdminOneData.emailId !== originalAdminOneValues.email ||
            newAdminOneData.countryCode !== originalAdminOneValues.countryCode;
          if (hasChanged) {
            setOtpVerified(false);
          }
        }

        if (section === 'adminTwo' && hasAdminTwoData()) {
          const newAdminTwoData = { ...formData.adminTwo, [field]: value };
          const hasChanged =
            newAdminTwoData.mobileNo !== originalAdminTwoValues.mobile ||
            newAdminTwoData.emailId !== originalAdminTwoValues.email ||
            newAdminTwoData.countryCode !== originalAdminTwoValues.countryCode;
          if (hasChanged) {
            setOtpVerifiedAdmin2(false);
          }
        }
      }

      // // CKYC checks remain unchanged
      // if (name === 'adminOne.ckycNumber' && value.length === 14) {
      //   dispatch(fetchCkycDetails({ ckycNo: value, role: 'adminOne' }));
      // }
      // if (name === 'adminTwo.ckycNumber' && value.length === 14) {
      //   dispatch(fetchCkycDetails({ ckycNo: value, role: 'adminTwo' }));
      // }
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fieldName = e.target.name;

    if (!file) return;

    // Validate file
    const errorMessage = validateFile(fieldName, file);
    if (errorMessage) {
      // Handle errors based on your existing error structure
      const isNestedField = fieldName.includes('.');
      const path = isNestedField ? fieldName.split('.') : [fieldName];
      const section = isNestedField ? path[0] : null;
      const field = isNestedField ? path[1] : fieldName;

      if (isNestedField && (section === 'adminOne' || section === 'adminTwo')) {
        setErrors((prev: any) => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: errorMessage,
          },
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [field]: errorMessage,
        }));
      }
      return;
    }

    // Set pending file for preview confirmation
    setPendingFile(file);
    setPendingFieldName(fieldName);
    setPendingPreviewUrl(URL.createObjectURL(file));
    setIsPreviewConfirmationOpen(true);
  };

  const handleCkycVerification = async (section: any) => {
    const ckycNumber =
      section === 'adminOne'
        ? formData.adminOne?.ckycNumber
        : formData.adminTwo?.ckycNumber;

    if (!ckycNumber || ckycNumber.length !== 14) {
      console.error('Invalid CKYC number');
      return;
    }

    setCkycLoading(true);
    dispatch(showLoader('Please wait...'));
    try {
      const resultAction = await dispatch(
        fetchCkycDetails({ ckycNo: ckycNumber.trim(), role: section })
      );

      if (fetchCkycDetails.fulfilled.match(resultAction)) {
        // Set verification status
        if (section === 'adminOne') {
          setAdminOneCkycVerified(true);
        } else {
          setAdminTwoCkycVerified(true);
        }

        // Auto-populate fields from CKYC response
        const ckycData = resultAction.payload.data;
        setFormData((prev) => {
          const copy = { ...prev };

          // Populate the verified data (adjust field names as per your API response)
          setNestedValue(
            copy,
            [section, 'firstName'],
            ckycData.firstName || ''
          );
          setNestedValue(copy, [section, 'lastName'], ckycData.lastName || '');
          setNestedValue(
            copy,
            [section, 'middleName'],
            ckycData.middleName || ''
          );
          setNestedValue(
            copy,
            [section, 'countryCode'],
            ckycData.countryCode || '+91'
          );
          setNestedValue(copy, [section, 'gender'], ckycData.gender || '');
          setNestedValue(copy, [section, 'title'], ckycData.title || '');
          // setNestedValue(copy, [section, 'dateOfBirth'], ckycData.dateOfBirth || '');
          // setNestedValue(copy, [section, 'panNumber'], ckycData.panNumber || '');
          // Add more fields as needed

          return copy;
        });

        // You can also open OTP modal if needed
        // setotpIdentifier(resultAction.payload.otp_identifier);
        // setCkycOTPModalOpen(true);
      } else {
        console.error('CKYC verification failed');
        // Handle error - maybe show error message
      }
    } catch (error) {
      console.error('Error during CKYC verification:', error);
    } finally {
      setCkycLoading(false);
      dispatch(hideLoader());
    }
  };
  const handleConfirmFile = (): void => {
    if (!pendingFile || !pendingFieldName) return;

    const fieldName = pendingFieldName;
    const file = pendingFile;
    const previewURL = pendingPreviewUrl;

    const isNestedField = fieldName.includes('.');
    const path = isNestedField ? fieldName.split('.') : [fieldName];
    const section = isNestedField ? path[0] : null;
    const field = isNestedField ? path[1] : fieldName;

    // Update form data
    setFormData((prev: any) => {
      const copy = { ...prev };
      if (isNestedField) {
        setNestedValue(copy, path, file);
        setNestedValue(
          copy,
          [...path.slice(0, -1), `${field}Preview`],
          previewURL
        );
      } else {
        copy[field] = file;
        copy[`${field}Preview`] = previewURL;
      }
      return copy;
    });

    // Clear errors
    if (isNestedField && (section === 'adminOne' || section === 'adminTwo')) {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        [section]: {
          ...prevErrors[section],
          [field]: '',
        },
      }));
    } else {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        [field]: '',
      }));
    }

    // Close preview modal
    setIsPreviewConfirmationOpen(false);
    setPendingFile(null);
    setPendingFieldName(null);
    setPendingPreviewUrl(null);
  };

  const handleCancelFile = (): void => {
    setIsPreviewConfirmationOpen(false);
    setPendingFile(null);
    setPendingFieldName(null);
    setPendingPreviewUrl(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAPIError('');
    console.log(formData, 'submit for preview');

    const tempAdminOne = { ...formData.adminOne };
    const tempAdminTwo = { ...formData.adminTwo };

    const {
      // authorizationLetterFilePreview: _,
      // authorizationLetterFile: __,
      countryName: ___,
      ...cleanedAdminOne
    } = formData.adminOne;

    const {
      // authorizationLetterFilePreview: ____,
      // authorizationLetterFile: _____,
      countryName: ______,
      ...cleanedAdminTwo
    } = formData.adminTwo;

    const adminOne = cleanedAdminOne;
    const adminTwo = cleanedAdminTwo;

    try {
      dispatch(showLoader('Please Wait...'));
      const resultAction = await dispatch(
        submitAdminOfficers({
          adminOne,
          adminTwo,
          iau_one_certified_poi: formData.iau_one_certified_poi!,
          iau_one_certified_photoIdentity:
            formData.iau_one_certified_photoIdentity!,
          iau_two_certified_poi: formData.iau_two_certified_poi!,
          iau_two_certified_photoIdentity:
            formData.iau_two_certified_photoIdentity!,
          iau_one_authorization_letter: formData.iau_one_authorization_letter!,
          iau_two_authorization_letter: formData.iau_two_authorization_letter!,
        })
      );

      if (submitAdminOfficers.fulfilled.match(resultAction)) {
        console.log('Submission successful!');
        // ✅ Save current section's data
        dispatch(
          setApplicationFormData({
            section: 'institutionalAdmin',
            data: formData,
          })
        );
        // ✅ Mark this step as complete
        dispatch(markStepCompleted(4));

        // ✅ Move to next step
        dispatch(setCurrentStep(5));

        navigate('/re-form-preview'); // navigate only if successful
        dispatch(setAdminOne(tempAdminOne));
        dispatch(setAdminTwo(tempAdminTwo));
      } else {
        console.error('Submission failed:', resultAction.payload);
        setAPIError(resultAction?.payload?.message || 'Submission failed');
        // alert(`Submission failed: ${resultAction.payload}`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Unexpected error occurred.');
    } finally {
      dispatch(hideLoader());
    }
  };

  // Track original values from API/Redux to detect changes
  const [originalAdminOneValues, setOriginalAdminOneValues] = useState({
    mobile: '',
    email: '',
    countryCode: '',
  });
  const [originalAdminTwoValues, setOriginalAdminTwoValues] = useState({
    mobile: '',
    email: '',
    countryCode: '',
  });

  // Check if admin form has data (was previously validated/filled)
  const hasAdminOneData = () => {
    const adminOne = formData.adminOne;
    return !!(adminOne.mobileNo || adminOne.emailId || adminOne.countryCode);
  };

  const hasAdminTwoData = () => {
    const adminTwo = formData.adminTwo;
    return !!(adminTwo.mobileNo || adminTwo.emailId || adminTwo.countryCode);
  };

  // Track if form was prefilled
  const [isAdminOnePreFilled, setIsAdminOnePreFilled] = useState(false);
  const [isAdminTwoPreFilled, setIsAdminTwoPreFilled] = useState(false);

  useEffect(() => {
    dispatch(setCurrentStep(4)); // 0 = first step
  }, [dispatch]);

  useEffect(() => {
    if (ckycDataAdminOne) {
      setFormData((prev) => ({
        ...prev,
        adminOne: {
          ...prev.adminOne,
          firstName: ckycDataAdminOne.firstName || '',
          middleName: ckycDataAdminOne.middleName || '',
          lastName: ckycDataAdminOne.lastName || '',
          title: ckycDataAdminOne.title || '',
          gender: ckycDataAdminOne.gender || '',
        },
      }));
    }
  }, [ckycDataAdminOne]);

  useEffect(() => {
    if (ckycDataAdminTwo) {
      setFormData((prev) => ({
        ...prev,
        adminTwo: {
          ...prev.adminTwo,
          firstName: ckycDataAdminTwo.firstName || '',
          middleName: ckycDataAdminTwo.middleName || '',
          lastName: ckycDataAdminTwo.lastName || '',
          title: ckycDataAdminTwo.title || '',
          gender: ckycDataAdminTwo.gender || '',
        },
      }));
    }
  }, [ckycDataAdminTwo]);

  useEffect(() => {
    //debugger
    console.log(reduxAdminOne);
    const source =
      Object.keys(reduxAdminOne).length > 0 ? reduxAdminOne : adminOneDetails;

    if (source && Object.keys(source).length > 0) {
      // Store original values for change detection
      const originalValues = {
        mobile: source.mobileNo || '',
        email: source.emailId || '',
        countryCode: source.countryCode || '',
      };
      setOriginalAdminOneValues(originalValues);
      setIsAdminOnePreFilled(true);

      // If form has critical data, consider it as previously validated
      if (
        originalValues.mobile ||
        originalValues.email ||
        originalValues.countryCode
      ) {
        setOtpVerified(true);
      }

      setFormData((prevData) => {
        const updatedData = {
          ...prevData,
          adminOne: {
            ...prevData.adminOne,
            ...source,
          },
        };

        const mimeTypes: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          pdf: 'application/pdf',
        };

        const base64ToFile = (doc: {
          base64Content: string;
          fileName: string;
        }): File | undefined => {
          if (!doc?.base64Content || !doc?.fileName) return undefined;
          const extension = doc.fileName.split('.').pop()?.toLowerCase() || '';
          const mimeType = mimeTypes[extension] || 'application/octet-stream';
          const byteString = atob(doc.base64Content);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new File([ab], doc.fileName, { type: mimeType });
        };

        // Set preview images only if they’re not already present
        if (
          !prevData.iau_two_certified_poiPreview &&
          iauTwoCertifiedPOI?.base64Content
        ) {
          updatedData.iau_two_certified_poiPreview = `data:image/png;base64,${iauTwoCertifiedPOI.base64Content}`;
          updatedData.iau_two_certified_poi = base64ToFile(iauTwoCertifiedPOI);
        }

        if (
          !prevData.iau_two_certified_photoIdentityPreview &&
          iauTwoCertifiedPhotoIdentity?.base64Content
        ) {
          updatedData.iau_two_certified_photoIdentityPreview = `data:image/png;base64,${iauTwoCertifiedPhotoIdentity.base64Content}`;
          updatedData.iau_two_certified_photoIdentity = base64ToFile(
            iauTwoCertifiedPhotoIdentity
          );
        }

        if (
          !prevData.iau_one_certified_poiPreview &&
          iauOneCertifiedPOI?.base64Content
        ) {
          updatedData.iau_one_certified_poiPreview = `data:image/png;base64,${iauOneCertifiedPOI.base64Content}`;
          updatedData.iau_one_certified_poi = base64ToFile(iauOneCertifiedPOI);
        }

        if (
          !prevData.iau_one_certified_photoIdentityPreview &&
          iauOneCertifiedPhotoIdentity?.base64Content
        ) {
          updatedData.iau_one_certified_photoIdentityPreview = `data:image/png;base64,${iauOneCertifiedPhotoIdentity.base64Content}`;
          updatedData.iau_one_certified_photoIdentity = base64ToFile(
            iauOneCertifiedPhotoIdentity
          );
        }
        if (
          !prevData.iau_one_authorization_letterPreview &&
          iauOneAuthorizationLetter?.base64Content
        ) {
          updatedData.iau_one_authorization_letterPreview = `data:image/png;base64,${iauOneAuthorizationLetter.base64Content}`;
          updatedData.iau_one_authorization_letter = base64ToFile(
            iauOneAuthorizationLetter
          );
        }
        if (
          !prevData.iau_two_authorization_letterPreview &&
          iauTwoAuthorizationLetter?.base64Content
        ) {
          updatedData.iau_two_authorization_letterPreview = `data:image/png;base64,${iauTwoAuthorizationLetter.base64Content}`;
          updatedData.iau_two_authorization_letter = base64ToFile(
            iauTwoAuthorizationLetter
          );
        }

        return updatedData;
      });
    }
  }, [
    reduxAdminOne,
    adminOneDetails,
    iauTwoCertifiedPOI,
    iauTwoCertifiedPhotoIdentity,
    iauOneCertifiedPOI,
    iauOneCertifiedPhotoIdentity,
    iauOneAuthorizationLetter,
  ]);

  useEffect(() => {
    //debugger
    console.log(reduxAdminTwo);
    const source =
      Object.keys(reduxAdminTwo).length > 0 ? reduxAdminTwo : adminTwoDetails;

    if (source && Object.keys(source).length > 0) {
      // Store original values for change detection
      const originalValues = {
        mobile: source.mobileNo || '',
        email: source.emailId || '',
        countryCode: source.countryCode || '',
      };
      setOriginalAdminTwoValues(originalValues);
      setIsAdminTwoPreFilled(true);

      // If form has critical data, consider it as previously validated
      if (
        originalValues.mobile ||
        originalValues.email ||
        originalValues.countryCode
      ) {
        console.log(
          'Inside use effect original form consideration setting true otps'
        );
        setOtpVerifiedAdmin2(true);
      }

      setFormData((prevData) => ({
        ...prevData,
        adminTwo: {
          ...prevData.adminTwo,
          ...source,
        },
      }));
    }
  }, [reduxAdminTwo, adminTwoDetails]);

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

  //  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //         const selectedCode = e.target.value;
  //         const selectedCountry = countries.find(c => c.dial_code === selectedCode);
  //         setFormData(prev => ({
  //             ...prev,
  //             countryCode: selectedCode,
  //              countryName: selectedCountry ? selectedCountry.name : '',
  //         }));
  //         };
  // const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const { name, value } = e.target; // e.g. "adminOne.countryCode"
  //   const path = name.split('.');     // ["adminOne", "countryCode"]
  //   const section = path[0];          // adminOne
  //   const field = path[1];            // countryCode
  //   const selectedCountry = countries.find(c => c.dial_code === value);

  //   setFormData(prev => {
  //     const updated = { ...prev };

  //     // Deep copy relevant nested object (adminOne or adminTwo)
  //     if (path.length >= 2) {
  //       updated[section] = { ...prev[section] };
  //     }

  //     setNestedValue(updated, path, value);

  //     // Attach countryName at root (if needed)
  //     updated.countryName = selectedCountry?.name || '';

  //     return updated;
  //   });

  //   // Perform validation
  //   const error = validateField(name, value, formData);

  //   // Update error state
  //   setErrors((prev:any) => ({
  //     ...prev,
  //     [section]: {
  //       ...prev[section],
  //       [field]: error
  //     }
  //   }));
  // };

  // Helper functions for change detection
  // Check if critical fields have changed for Admin One
  const hasAdminOneChanged = () => {
    const current = formData.adminOne;
    return (
      current.mobileNo !== originalAdminOneValues.mobile ||
      current.emailId !== originalAdminOneValues.email ||
      current.countryCode !== originalAdminOneValues.countryCode
    );
  };

  const hasAdminTwoChanged = () => {
    const current = formData.adminTwo;
    return (
      current.mobileNo !== originalAdminTwoValues.mobile ||
      current.emailId !== originalAdminTwoValues.email ||
      current.countryCode !== originalAdminTwoValues.countryCode
    );
  };

  // Button disable logic functions
  const shouldDisableAdminOneValidation = () => {
    if (isAdminOneValidated && !hasAdminOneChanged()) return true;

    console.log(isAdminOneValidated, 'isAdminOneValidated');

    // Get admin one errors from your ErrorState
    const adminOneErrors = errors?.adminOne || {};

    // Check form validity including nested errors
    const isFormValid = isAdminFormValid(formData.adminOne, adminOneErrors);

    // Check for file validation errors at the root level
    const hasFileErrors =
      Boolean(errors?.iau_one_certified_poi) ||
      Boolean(errors?.iau_one_certified_photoIdentity) ||
      Boolean(errors?.iau_one_authorization_letter);

    // Check if required files are present/uploaded
    const hasRequiredFiles =
      Boolean(formData.iau_one_certified_poi) &&
      Boolean(formData.iau_one_certified_photoIdentity) &&
      Boolean(formData.iau_one_authorization_letter);

    const hasData = hasAdminOneData();

    // If form is not valid OR has file errors OR missing required files, disable button
    if (!isFormValid || hasFileErrors || !hasRequiredFiles) return true;

    // If form has no data (not pre-populated), enable based on form validity
    if (!hasData) return false;

    // If form has data (was pre-populated/validated), only enable if fields changed
    return !hasAdminOneChanged();
  };

  const shouldDisableAdminTwoValidation = () => {
    if (isAdminTwoValidated && !hasAdminTwoChanged()) return true;

    console.log(isAdminTwoValidated, 'isAdminTwoValidated');

    // Get admin two errors from your ErrorState
    const adminTwoErrors = errors?.adminTwo || {};

    // Check form validity including nested errors
    const isFormValid = isAdminFormValid(formData.adminTwo, adminTwoErrors);

    // Check for file validation errors at the root level - Admin Two specific files
    const hasFileErrors =
      Boolean(errors?.iau_two_certified_poi) ||
      Boolean(errors?.iau_two_certified_photoIdentity) ||
      Boolean(errors?.iau_two_authorization_letter);

    // Check if required files are present/uploaded for Admin Two
    const hasRequiredFiles =
      Boolean(formData.iau_two_certified_poi) &&
      Boolean(formData.iau_two_certified_photoIdentity) &&
      Boolean(formData.iau_two_authorization_letter);

    const hasData = hasAdminTwoData();

    console.log('Admin Two Validation Debug:', {
      isFormValid,
      hasFileErrors,
      hasRequiredFiles, // Added this to debug
      hasData,
      adminTwoErrors,
      fileErrors: {
        poi: errors?.iau_two_certified_poi,
        photoIdentity: errors?.iau_two_certified_photoIdentity,
        authLetter: errors?.iau_two_authorization_letter,
      },
      fileData: {
        // Added this to debug file presence
        poi: formData.iau_two_certified_poi,
        photoIdentity: formData.iau_two_certified_photoIdentity,
        authLetter: formData.iau_two_authorization_letter,
      },
    });

    // If form is not valid OR has file errors OR missing required files, disable button
    if (!isFormValid || hasFileErrors || !hasRequiredFiles) return true;

    // If form has no data (not pre-populated), enable based on form validity
    if (!hasData) return false;

    // If form has data (was pre-populated/validated), only enable if fields changed
    return !hasAdminTwoChanged();
  };

  const canSaveAndNext = () => {
    // 1. Check OTP verification for both admins
    const areBothAdminsVerified = isOtpVerified && isOtpVerifiedAdmin2;

    // 2. Check if Admin One's form is valid
    const isAdminOneFormValid = isAdminFormValid(
      formData.adminOne,
      errors?.adminOne
    );
    const hasAdminOneFiles =
      Boolean(formData.iau_one_certified_poi) &&
      Boolean(formData.iau_one_certified_photoIdentity) &&
      Boolean(formData.iau_one_authorization_letter);
    const hasNoAdminOneFileErrors =
      !errors?.iau_one_certified_poi &&
      !errors?.iau_one_certified_photoIdentity &&
      !errors?.iau_one_authorization_letter;

    // 3. Check if Admin Two's form is valid
    const isAdminTwoFormValid = isAdminFormValid(
      formData.adminTwo,
      errors?.adminTwo
    );
    const hasAdminTwoFiles =
      Boolean(formData.iau_two_certified_poi) &&
      Boolean(formData.iau_two_certified_photoIdentity) &&
      Boolean(formData.iau_two_authorization_letter);
    const hasNoAdminTwoFileErrors =
      !errors?.iau_two_certified_poi &&
      !errors?.iau_two_certified_photoIdentity &&
      !errors?.iau_two_authorization_letter;

    // The button should be enabled only if ALL conditions are true
    return (
      areBothAdminsVerified &&
      isAdminOneFormValid &&
      hasAdminOneFiles &&
      hasNoAdminOneFileErrors &&
      isAdminTwoFormValid &&
      hasAdminTwoFiles &&
      hasNoAdminTwoFileErrors
    );
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target; // e.g. "adminOne.countryCode"
    const path = name.split('.'); // ["adminOne", "countryCode"]
    const section = path[0]; // adminOne
    const field = path[1]; // countryCode
    const selectedCountry = countries.find((c) => c.dial_code === value);

    setFormData((prev) => {
      const updated = { ...prev };

      // Deep copy relevant nested object (adminOne or adminTwo)
      if (path.length >= 2) {
        updated[section] = { ...prev[section] };
      }

      // Set the country code
      setNestedValue(updated, path, value);

      // Set the country name in the same section
      if (selectedCountry) {
        updated[section] = {
          ...updated[section],
          countryName: selectedCountry.name,
        };
      } else {
        // Clear country name if no country selected
        updated[section] = {
          ...updated[section],
          countryName: '',
        };
      }

      return updated;
    });

    // Perform validation
    const error = validateField(name, value, formData);

    // Update error state
    setErrors((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: error,
      },
    }));

    // --- ADD THIS: Revalidate existing mobile number after country code change ---
    const mobileKey = `${section}.mobileNo`;
    const currentMobile = formData?.[section]?.mobileNo || '';

    if (currentMobile) {
      const mobileError = validateField(mobileKey, currentMobile, {
        ...formData,
        [section]: { ...formData[section], countryCode: value },
      });

      setErrors((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          mobileNo: mobileError,
        },
      }));
    }
  };
  useEffect(() => {
    if (countries.length > 0) {
      const defaultCountry =
        countries.find((c) => c.dial_code === '+91') || countries[0];
      setFormData((prev) => ({
        ...prev,
        adminOne: {
          ...prev.adminOne,
          countryCode: defaultCountry.dial_code,
          countryName: defaultCountry.name,
        },
        adminTwo: {
          ...prev.adminTwo,
          countryCode: defaultCountry.dial_code,
          countryName: defaultCountry.name,
        },
      }));
    }
  }, [countries]);
  // const handlePhoneChange = (phone: string, country: CountryData) => {
  //     setFormData({
  //       ...formData,
  //       phone,
  //       country: country.name,
  //       countryCode: `+${country.dialCode}`,
  //     });
  //   };
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = Country.getAllCountries().find(
        (c) => c.name === formData.country
      );

      if (selectedCountry) {
        const fetchedStates = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(fetchedStates);
      }
    }
  }, [formData.country]);

  useEffect(() => {
    if (countries.length > 0) {
      ['adminOne', 'adminTwo'].forEach((section) => {
        const countryCode = formData[section]?.countryCode;
        const countryName = formData[section]?.countryName;

        if (countryCode && !countryName) {
          const matchedCountry = countries.find(
            (c) => c.dial_code === countryCode
          );
          if (matchedCountry) {
            setFormData((prev) => ({
              ...prev,
              [section]: {
                ...prev[section],
                countryName: matchedCountry.name,
              },
            }));
          }
        }
      });
    }
  }, [
    countries,
    formData.adminOne?.countryCode,
    formData.adminTwo?.countryCode,
  ]);

  const handleBack = () => {
    navigate('/re-nodal-officer-details');
    console.log(formData, 'FormData for Preview');
  };

  const handleOkay = () => {
    setSuccessAdminModalOpen(false);
    setIsAdminOneValidated(true); // Mark as validated
  };

  const handleOkayTwo = () => {
    setSuccessAdmin2ModalOpen(false);
    setIsAdminTwoValidated(true);
  };

  const handleValidate = async (
    e: React.FormEvent,
    admin: 'adminOne' | 'adminTwo'
  ) => {
    e.preventDefault();

    if (!authToken || !userEmail) {
      alert('Missing email or token');
      return;
    }

    try {
      dispatch(showLoader('Please Wait...'));
      const result = await dispatch(
        sendOtp({
          emailId: formData?.[admin]?.emailId || '',
          mobileNo: formData?.[admin]?.mobileNo || '',
          token: authToken,
        })
      );

      if (sendOtp.fulfilled.match(result)) {
        // Open corresponding modal
        if (admin === 'adminOne') setOTPAdminModalOpen(true);
        else setOTPAdmin2ModalOpen(true);
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  // Render form step content

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
              style={{ cursor: 'not-allowed' }}
              disabled
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

          {isOTPAdminModalOpen && (
            <OTPModalRegister
              isOpen={isOTPAdminModalOpen}
              onClose={() => setOTPAdminModalOpen(false)}
              onOtpSubmit={(otp) => {
                // handle OTP submission
                console.log('Submitted OTP:', otp);
                setOTPAdminModalOpen(false); // Close OTP modal
                setSuccessAdminModalOpen(true); // Open success modal
                setOtpVerified(true); // <--- mark OTP as verified

                setOriginalAdminOneValues({
                  mobile: formData.adminOne.mobileNo || '',
                  email: formData.adminOne.emailId || '',
                  countryCode: formData.adminOne.countryCode || '',
                });
              }}
              countryCode={formData.adminOne?.countryCode}
              email={formData.adminOne?.emailId}
              mobile={formData.adminOne?.mobileNo}
            />
          )}

          {isOTPAdmin2ModalOpen && (
            <OTPModalRegister
              isOpen={isOTPAdmin2ModalOpen}
              onClose={() => setOTPAdmin2ModalOpen(false)}
              onOtpSubmit={(otp) => {
                console.log('Submitted OTP for Admin 2:', otp);
                setOTPAdmin2ModalOpen(false);
                setSuccessAdmin2ModalOpen(true);
                setOtpVerifiedAdmin2(true); // Set only Admin 2 as verified

                setOriginalAdminTwoValues({
                  mobile: formData.adminTwo.mobileNo || '',
                  email: formData.adminTwo.emailId || '',
                  countryCode: formData.adminTwo.countryCode || '',
                });
              }}
              countryCode={formData.adminTwo?.countryCode}
              email={formData.adminTwo?.emailId}
              mobile={formData.adminTwo?.mobileNo}
            />
          )}

          <SuccessModal
            isOpen={isSuccessAdminModalOpen}
            onClose={() => setSuccessAdminModalOpen(false)}
            onOkay={handleOkay}
            title="Details Verified Successfully!"
            message="The  Institution details have been verified successfully"
          />

          <SuccessModal
            isOpen={isSuccessAdmin2ModalOpen}
            onClose={() => setSuccessAdmin2ModalOpen(false)}
            onOkay={handleOkayTwo}
            title=" Details Verified Successfully!"
            message="The Institution details have been verified successfully"
          />

          <div className="step-indicator">Institutional Admin User Details</div>
          <form className="entity-form">
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: '#F7F8FF' }}
              >
                <Typography component="span">Add Admin 1</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ padding: '8px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <div className="form-row" style={{ marginTop: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="citizenship">
                        Citizenship<span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        name="adminOne.citizenship"
                        onChange={handleChange}
                        value={formData.adminOne?.citizenship || ''}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneCitizenship'
                          )
                        }
                      >
                        <option value="">Select Citizenship</option>
                        {/* {citizenshipOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))} */}

                        {citizenships.map((citizenship: any) => (
                          <option
                            key={citizenship.code}
                            value={citizenship.name}
                          >
                            {citizenship.name}
                          </option>
                        ))}
                      </select>
                      {errors?.adminOne?.citizenship && (
                        <span className="error-text">
                          {errors.adminOne.citizenship}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>
                        CKYC number
                        {isIndianCitizen && (
                          <span style={{ color: 'red' }}>*</span>
                        )}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="adminOne.ckycNumber"
                          placeholder="Enter ckyc number"
                          value={formData.adminOne?.ckycNumber || ''}
                          onChange={handleChange}
                          disabled={
                            !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminOneCkycNumbe'
                            )
                          }
                          style={{
                            paddingRight: adminOneCkycVerified
                              ? '100px'
                              : '80px', // Space for button/verified text
                          }}
                          maxLength={14}
                        />

                        {/* Show Verified status or Verify button */}
                        {adminOneCkycVerified ? (
                          <span
                            style={{
                              color: '#52AE32',
                              fontWeight: '500',
                              fontSize: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pointerEvents: 'none',
                            }}
                          >
                            <CheckCircleOutlineIcon
                              style={{ fontSize: '16px' }}
                            />
                            Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCkycVerification('adminOne')}
                            className="verify-button"
                            disabled={
                              !formData.adminOne?.ckycNumber ||
                              formData.adminOne?.ckycNumber.length !== 14 ||
                              !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneCkycNumbe'
                              ) ||
                              ckycLoading
                            }
                            style={{
                              background: '#002CBA',
                              color: 'white',
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              padding: '10px 15px',
                              // padding: '15px 25px', // Increased from '10px 15px'
                              fontSize: '12px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            {ckycLoading ? 'Verifying...' : 'Verify'}
                          </button>
                        )}
                      </div>

                      {errors?.adminOne?.ckycNumber && (
                        <span className="error-text">
                          {errors.adminOne.ckycNumber}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="title">
                        Title<span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        name="adminOne.title"
                        onChange={handleChange}
                        value={
                          ckycDataAdminOne?.title ||
                          formData?.adminOne?.title ||
                          ''
                        }
                        defaultValue="Select Title"
                        //  disabled={!isEditableField(INSTITUTIONAL_ADMIN_DETAILS, 'adminOneTitle')}
                        disabled={
                          !adminOneCkycVerified ||
                          !isIndianCitizen ||
                          Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                            ? !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneTitle'
                              )
                            : true // 🔒 keep disabled for all other statuses
                        }
                      >
                        <option value="">Select Title</option>
                        {/* <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms">Ms</option> */}

                        {titles.map((title: any) => (
                          <option key={title.code} value={title.name}>
                            {title.name}
                          </option>
                        ))}
                      </select>
                      {errors?.adminOne?.title && (
                        <span className="error-text">
                          {errors.adminOne.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '5px' }}>
                    <div className="form-group">
                      <label htmlFor="first-name">
                        First Name<span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="adminOne.firstName"
                        placeholder="Enter first name"
                        onChange={handleChange}
                        value={
                          ckycDataAdminOne?.firstName ||
                          formData?.adminOne?.firstName ||
                          ''
                        }
                        // disabled={!isEditableField(INSTITUTIONAL_ADMIN_DETAILS, 'adminOneFirstName')}
                        disabled={
                          !isIndianCitizen ||
                          Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                            ? !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneFirstName'
                              )
                            : true // 🔒 keep disabled for all other statuses
                        }
                      />
                      {errors?.adminOne?.firstName && (
                        <span className="error-text">
                          {errors.adminOne.firstName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="middle-name">Middle Name</label>
                      <input
                        type="text"
                        name="adminOne.middleName"
                        placeholder="Enter middle name"
                        onChange={handleChange}
                        value={
                          ckycDataAdminOne?.middleName ||
                          formData?.adminOne?.middleName ||
                          ''
                        }
                        // disabled={!isEditableField(INSTITUTIONAL_ADMIN_DETAILS, 'adminOneMiddleName')}
                        disabled={
                          !isIndianCitizen ||
                          Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                            ? !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneMiddleName'
                              )
                            : true // 🔒 keep disabled for all other statuses
                        }
                      />
                      {errors?.adminOne?.middleName && (
                        <span className="error-text">
                          {errors.adminOne.middleName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="last-name">Last Name</label>
                      <input
                        type="text"
                        name="adminOne.lastName"
                        placeholder="Enter last name"
                        onChange={handleChange}
                        value={
                          ckycDataAdminOne?.lastName ||
                          formData?.adminOne?.lastName ||
                          ''
                        }
                        // disabled={!isEditableField(INSTITUTIONAL_ADMIN_DETAILS, 'adminOneLastName')}

                        disabled={
                          !isIndianCitizen ||
                          Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                            ? !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneLastName'
                              )
                            : true // 🔒 keep disabled for all other statuses
                        }
                      />
                      {errors?.adminOne?.lastName && (
                        <span className="error-text">
                          {errors.adminOne.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '5px' }}>
                    <div className="form-group">
                      <label htmlFor="designation">
                        Designation<span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="adminOne.designation"
                        placeholder="Enter designation"
                        onChange={handleChange}
                        value={formData.adminOne?.designation || ''}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneDesignation'
                          )
                        }
                      />
                      {errors?.adminOne?.designation && (
                        <span className="error-text">
                          {errors.adminOne.designation}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="emial">
                        Email<span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="adminOne.emailId"
                        placeholder="Enter email"
                        onChange={handleChange}
                        value={formData.adminOne?.emailId || ''}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneEmailId'
                          )
                        }
                      />
                      {errors?.adminOne?.emailId && (
                        <span className="error-text">
                          {errors.adminOne.emailId}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender">
                        Gender<span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        name="adminOne.gender"
                        onChange={handleChange}
                        value={
                          ckycDataAdminOne?.gender ||
                          formData.adminOne?.gender ||
                          ''
                        }
                        disabled={
                          isIndianCitizen ||
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneGender'
                          )
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
                      {errors?.adminOne?.gender && (
                        <span className="error-text">
                          {errors.adminOne.gender}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '5px' }}>
                    <div className="form-group">
                      <label
                        htmlFor="countryCode_one"
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
                          name="adminOne.countryCode"
                          value={formData.adminOne?.countryCode}
                          onChange={handleCountryChange}
                          disabled={
                            !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminOneCountryCode'
                            )
                          }
                        >
                          {countries.map((country) => (
                            <option
                              key={country.code}
                              value={country.dial_code}
                            >
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

                        {formData.adminOne?.countryName?.length === 0 ? (
                          <label
                            htmlFor="country"
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
                            {formData.adminOne?.countryName || 'India'}
                          </label>
                        )}
                      </div>

                      {errors?.adminOne?.countryCode && (
                        <div className="error-message">
                          {errors.adminOne.countryCode}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="mobile-no">
                        Mobile Number<span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="adminOne.mobileNo"
                        placeholder="Enter mobile number"
                        onChange={handleChange}
                        onKeyPress={(e) => {
                          // Only allow digits
                          if (
                            !/\d/.test(e.key) &&
                            !['Backspace', 'Delete', 'Tab', 'Enter'].includes(
                              e.key
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          const countryCode = formData.adminOne?.countryCode;
                          let value = target.value.replace(/\D/g, ''); // Remove non-digits

                          if (countryCode === '+91') {
                            // Limit to 10 digits for India
                            if (value.length > 10) {
                              value = value.slice(0, 10);
                            }
                          } else {
                            // Limit to 15 digits for other countries
                            if (value.length > 15) {
                              value = value.slice(0, 15);
                            }
                          }

                          target.value = value;
                        }}
                        value={formData.adminOne?.mobileNo || ''}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneMobileNo'
                          )
                        }
                      />
                      {errors?.adminOne?.mobileNo && (
                        <span className="error-text">
                          {errors.adminOne.mobileNo}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="landline-no">Landline Number</label>
                      <input
                        type="text"
                        name="adminOne.landline"
                        placeholder="Enter landline number"
                        onChange={handleChange}
                        value={formData.adminOne?.landline || ''}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneLandline'
                          )
                        }
                      />
                      {errors?.adminOne?.landline && (
                        <span className="error-text">
                          {errors.adminOne.landline}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '5px' }}>
                    <div className="form-group">
                      <label htmlFor="p-o-identity">
                        Proof of Identity<span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        name="adminOne.proofOfIdentity"
                        onChange={handleChange}
                        value={formData.adminOne?.proofOfIdentity || ''}
                        defaultValue="Select proof of identity"
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneProofOfIdentity'
                          )
                        }
                      >
                        {/* <option value="">Select proof of identity</option>
                      <option value="AADHAAR">Aadhar </option>
                      <option value="PAN_CARD">Pan</option>
                      <option value="VOTER_ID">Voter ID</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option> */}
                        <option value="">Select proof of identity</option>
                        {/* Dynamically render options from API */}
                        {proofOfIdentities.map((identity) => (
                          <option key={identity.code} value={identity.code}>
                            {identity.name}
                          </option>
                        ))}
                      </select>
                      {errors?.adminOne?.proofOfIdentity && (
                        <span className="error-text">
                          {errors.adminOne.proofOfIdentity}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="p-o-identity-number">
                        Proof of Identity Number
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="adminOne.identityNumber"
                        placeholder="Enter proof of identity number"
                        value={formData.adminOne?.identityNumber || ''}
                        onChange={handleChange}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneIdentityNumber'
                          )
                        }
                      />

                      {errors?.adminOne?.identityNumber && (
                        <span className="error-text">
                          {errors.adminOne.identityNumber}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="enployee-code">
                        Employee code
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="adminOne.employeeCode"
                        placeholder="Enter Employee Code"
                        value={formData.adminOne?.employeeCode || ''}
                        onChange={handleChange}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneEmployeeCode'
                          )
                          // || isOtpVerified
                        }
                      />
                      {errors?.adminOne?.employeeCode && (
                        <span className="error-text">
                          {errors.adminOne.employeeCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-row" style={{ marginBottom: '5px' }}>
                    <div className="form-group">
                      <label htmlFor="office-address">
                        Office Address <span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        style={{ fontFamily: 'inherit' }}
                        id="office-address"
                        name="sameAsRegisteredAddress"
                        value={
                          formData.adminOne?.sameAsRegisteredAddress?.toString() ||
                          'true'
                        }
                        onChange={(e) => {
                          const val = e.target.value === 'true';
                          setFormData((prev) => ({
                            ...prev,
                            adminOne: {
                              ...prev.adminOne,
                              sameAsRegisteredAddress: val,
                            },
                          }));
                        }}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneSameAsRegisteredAddress'
                          )
                        }
                      >
                        <option value="true">Same as Registered Address</option>
                        <option value="false">
                          Same as Correspondence Address
                        </option>
                      </select>
                      {errors?.adminOne?.sameAsRegisteredAddress && (
                        <span className="error-text">
                          {errors.adminOne.sameAsRegisteredAddress}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="letter">
                        Authorization letter by Competent Authority
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="input-with-preview">
                        <div className="custom-file-input">
                          <input
                            type="text"
                            placeholder="Enter authorization details"
                            name="adminOne.authorizationLetterDetails"
                            value={
                              formData.adminOne?.authorizationLetterDetails ||
                              ''
                            }
                            onChange={handleChange}
                            disabled={
                              !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneAuthorizationLetterDetails'
                              )
                            }
                          />

                          {/* Upload icon for file input */}
                          <label
                            htmlFor="authorization-letter-upload"
                            className="upload-icon"
                            aria-label="Upload authorization letter"
                          >
                            <img
                              src={uploadIcon} // path to your PNG
                              alt="Upload"
                              style={{
                                width: '24px',
                                height: '24px',
                                objectFit: 'contain',
                              }}
                            />
                          </label>

                          {/* FILE INPUT for preview only (not sent in payload) */}
                          <input
                            id="authorization-letter-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,"
                            name="iau_one_authorization_letter"
                            onChange={handleFileSelection}
                            className="hidden-file-input"
                            aria-label="Upload authorization letter file"
                            disabled={
                              !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneAuthorizationLetterDetails'
                              )
                            }
                          />
                        </div>

                        {/* Preview box */}
                        {formData?.iau_one_authorization_letterPreview && (
                          <div
                            className="preview-box"
                            onClick={handleAuthorizationPreviewClick}
                            style={{ cursor: 'pointer' }}
                          >
                            <img
                              src={
                                formData?.iau_one_authorization_letterPreview
                              }
                              alt="Authorization Letter Preview"
                              className="preview-img"
                            />
                            <span className="tick-icon">
                              <CheckCircleIcon />
                            </span>
                          </div>
                        )}
                      </div>
                      {errors?.iau_one_authorization_letter && (
                        <span className="error-text">
                          {errors?.iau_one_authorization_letter}
                        </span>
                      )}
                    </div>

                    {/*  Add PreviewConfirmationModal before your ReusableModal */}
                    <PreviewConfirmationModal
                      isOpen={isPreviewConfirmationOpen}
                      onClose={handleCancelFile}
                      imageUrl={pendingPreviewUrl}
                      altText="Document Preview"
                      onConfirm={handleConfirmFile}
                      onCancel={handleCancelFile}
                    />
                    {/* Modal for Authorization Letter */}
                    <ReusableModal
                      isOpen={isAuthorizationLetterModalOpen}
                      onClose={() => setIsAuthorizationLetterModalOpen(false)}
                      imageUrl={formData?.iau_one_authorization_letterPreview}
                      altText="Authorization Letter Preview"
                      // onFileChange={(e) => {
                      //   handleChange(e);
                      //   const file = e.target.files?.[0];
                      //   if (file) {
                      //     const previewUrl = URL.createObjectURL(file);
                      //     setFormData((prev) => ({
                      //       ...prev,
                      //       iau_one_authorization_letter: file,
                      //       iau_one_authorization_letterPreview: previewUrl,
                      //     }));
                      //   }
                      // }}
                      onFileChange={handleFileSelection}
                      inputId="modal-authorization-letter-upload"
                      inputName="iau_one_authorization_letter"
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminOneAuthorizationLetterDetails'
                        )
                      }
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div className="form-group">
                        <label htmlFor="authorizationDate">
                          Date of Authorization
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <div className="date-input-wrapper">
                          <DatePicker
                            open={openAuthorizationDate}
                            onOpen={() => setOpenAuthorizationDate(true)}
                            onClose={() => setOpenAuthorizationDate(false)}
                            value={
                              formData?.adminOne?.dateOfAuthorization
                                ? dayjs(formData.adminOne.dateOfAuthorization)
                                : null
                            }
                            onAccept={(date: any) => {
                              // Only closes on OK/accept
                              setOpenAuthorizationDate(false);
                            }}
                            onChange={(date: any) => {
                              const formattedDate = date
                                ? dayjs(date).format('YYYY-MM-DD')
                                : '';
                              handleChange({
                                target: {
                                  name: 'adminOne.dateOfAuthorization',
                                  value: formattedDate,
                                },
                              } as React.ChangeEvent<HTMLInputElement>);
                            }}
                            maxDate={dayjs()}
                            disabled={
                              !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneDateOfAuthorization'
                              )
                            }
                            format="DD/MM/YYYY"
                            slotProps={{
                              textField: {
                                readOnly: true, // prevent typing
                                id: 'authorizationDate',
                                name: 'adminOne.dateOfAuthorization',
                                fullWidth: true,
                                size: 'small',
                                error: Boolean(
                                  errors?.adminOne?.dateOfAuthorization
                                ),
                                helperText:
                                  errors?.adminOne?.dateOfAuthorization || '',
                                placeholder: 'DD/MM/YYYY',
                                sx: {
                                  flex: 1,
                                  '& .MuiInputBase-root': { height: '70px' },
                                  '& .MuiInputBase-input': {
                                    padding: '14px 16px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit !important',
                                  },
                                  cursor: !isEditableField(
                                    INSTITUTIONAL_ADMIN_DETAILS,
                                    'adminOneDateOfAuthorization'
                                  )
                                    ? 'not-allowed'
                                    : 'pointer',
                                },
                                onClick: () => {
                                  // Only allow opening if field is editable
                                  if (
                                    isEditableField(
                                      INSTITUTIONAL_ADMIN_DETAILS,
                                      'adminOneDateOfAuthorization'
                                    )
                                  ) {
                                    setOpenAuthorizationDate(true);
                                  }
                                },
                              },
                            }}
                          />

                          <div
                            className="calendar-icon-wrapper"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent outer div click conflicts
                              // Only allow opening if field is editable
                              if (
                                isEditableField(
                                  INSTITUTIONAL_ADMIN_DETAILS,
                                  'adminOneDateOfAuthorization'
                                )
                              ) {
                                setOpenAuthorizationDate(true);
                              }
                            }}
                            style={{
                              cursor: !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneDateOfAuthorization'
                              )
                                ? 'not-allowed'
                                : 'pointer',
                              opacity: !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneDateOfAuthorization'
                              )
                                ? 0.5
                                : 1,
                            }}
                          >
                            <img
                              src={CalendarIcon}
                              alt="calendar"
                              className="calendar-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </LocalizationProvider>
                  </div>

                  <div className="form-row" style={{ marginTop: '-8px' }}>
                    <div className="form-group">
                      <label htmlFor="identity">
                        Certified copy of the Proof of the Identity
                        <span style={{ color: 'red' }}>*</span>
                      </label>

                      <input
                        type="file"
                        id="iau-one-certified-poi"
                        name="iau_one_certified_poi"
                        aria-label="Upload certified copy of proof of identity"
                        accept=".pdf,.jpg,.jpeg"
                        onChange={handleFileSelection}
                        className="hidden-upload"
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneCertifiedPoi'
                          )
                        }
                      />
                      <div className="input-with-preview">
                        <label
                          htmlFor="iau-one-certified-poi"
                          className="upload-doc-btn"
                          aria-label="Upload certified copy of proof of identity"
                        >
                          <img
                            src={UploadIconButton} // path to your PNG
                            alt="Upload"
                            style={{
                              width: '24px',
                              height: '24px',
                              objectFit: 'contain',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '13px',
                              marginLeft: '5px',
                              marginBottom: '-2px',
                              display: 'inline-block',
                              transform:
                                'translateY(1px)' /* Fine-tune as needed */,
                            }}
                            aria-hidden="true"
                          >
                            Upload
                          </span>
                        </label>
                        {formData?.iau_one_certified_poiPreview && (
                          <div
                            className="preview-box"
                            onClick={handlePoiPreviewClick}
                            style={{ cursor: 'pointer' }}
                          >
                            <img
                              src={formData.iau_one_certified_poiPreview}
                              alt="POI Preview"
                              className="preview-img"
                            />
                            <span className="tick-icon">
                              <CheckCircleIcon />
                            </span>
                          </div>
                        )}
                      </div>

                      {errors?.iau_one_certified_poi && (
                        <span className="error-text">
                          {errors?.iau_one_certified_poi}
                        </span>
                      )}
                    </div>

                    {/* Single Preview Confirmation Modal for all file types */}
                    <PreviewConfirmationModal
                      isOpen={isPreviewConfirmationOpen}
                      onClose={handleCancelFile}
                      imageUrl={pendingPreviewUrl}
                      altText="Document Preview"
                      onConfirm={handleConfirmFile}
                      onCancel={handleCancelFile}
                    />

                    {/* Modal for Proof of Identity */}
                    <ReusableModal
                      isOpen={isPoiModalOpen}
                      onClose={() => setIsPoiModalOpen(false)}
                      imageUrl={formData?.iau_one_certified_poiPreview}
                      altText="Proof of Identity Preview"
                      // onFileChange={(e) => {
                      //   handleChange(e);
                      //   const file = e.target.files?.[0];
                      //   if (file) {
                      //     const previewUrl = URL.createObjectURL(file);
                      //     setFormData((prev) => ({
                      //       ...prev,
                      //       iau_one_certified_poi: file,
                      //       iau_one_certified_poiPreview: previewUrl,
                      //     }));
                      //   }
                      // }}
                      onFileChange={handleFileSelection}
                      inputId="modal-poi-upload"
                      inputName="iau_one_certified_poi"
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminOneCertifiedPoi'
                        )
                      }
                    />

                    <div className="form-group">
                      <label htmlFor="license-upload">
                        Certified copy of Photo Identity Card
                        <span style={{ color: 'red' }}>*</span>
                      </label>

                      <input
                        type="file"
                        id="license-upload"
                        name="iau_one_certified_photoIdentity"
                        aria-label="Upload certified copy of photo identity card"
                        accept=".pdf,.jpg,.jpeg"
                        onChange={handleFileSelection}
                        className="hidden-upload"
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminOneCertifiedPhotoIdentity'
                          )
                        }
                      />
                      <div className="input-with-preview">
                        <label
                          htmlFor="license-upload"
                          className="upload-doc-btn"
                          aria-label="Upload certified copy of photo identity card"
                        >
                          <img
                            src={UploadIconButton} // path to your PNG
                            alt="Upload"
                            style={{
                              width: '24px',
                              height: '24px',
                              objectFit: 'contain',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '13px',
                              marginLeft: '5px',
                              marginBottom: '-2px',
                              display: 'inline-block',
                              transform:
                                'translateY(4px)' /* Fine-tune as needed */,
                            }}
                            aria-hidden="true"
                          >
                            Upload
                          </span>
                        </label>
                        {formData.iau_one_certified_photoIdentityPreview && (
                          <div
                            className="preview-box"
                            onClick={handlePhotoIdentityPreviewClick}
                            style={{ cursor: 'pointer' }}
                          >
                            <img
                              src={
                                formData.iau_one_certified_photoIdentityPreview
                              }
                              alt="iau_one_certified_photoIdentityPreview Preview"
                              className="preview-img"
                            />
                            <span className="tick-icon">
                              <CheckCircleIcon />
                            </span>
                          </div>
                        )}
                      </div>

                      {errors?.iau_one_certified_photoIdentity && (
                        <span className="error-text">
                          {errors.iau_one_certified_photoIdentity}
                        </span>
                      )}
                    </div>

                    {/* //previewModal for confirmation */}
                    <PreviewConfirmationModal
                      isOpen={isPreviewConfirmationOpen}
                      onClose={handleCancelFile}
                      imageUrl={pendingPreviewUrl}
                      altText="Document Preview"
                      onConfirm={handleConfirmFile}
                      onCancel={handleCancelFile}
                    />
                    {/* Modal for Photo Identity Card */}
                    <ReusableModal
                      isOpen={isPhotoIdentityModalOpen}
                      onClose={() => setIsPhotoIdentityModalOpen(false)}
                      imageUrl={
                        formData?.iau_one_certified_photoIdentityPreview
                      }
                      altText="Photo Identity Card Preview"
                      // onFileChange={(e) => {
                      //   handleChange(e);
                      //   const file = e.target.files?.[0];
                      //   if (file) {
                      //     const previewUrl = URL.createObjectURL(file);
                      //     setFormData((prev) => ({
                      //       ...prev,
                      //       iau_one_certified_photoIdentity: file,
                      //       iau_one_certified_photoIdentityPreview: previewUrl,
                      //     }));
                      //   }
                      // }}
                      onFileChange={handleFileSelection}
                      inputId="modal-photo-identity-upload"
                      inputName="iau_one_certified_photoIdentity"
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminOneCertifiedPhotoIdentity'
                        )
                      }
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div className="form-group">
                        <label htmlFor="dob_actual">
                          Date of Birth<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div className="date-input-wrapper">
                          <DatePicker
                            open={openDobAdminOne}
                            onOpen={() => setOpenDobAdminOne(true)}
                            onClose={() => setOpenDobAdminOne(false)}
                            value={
                              formData?.adminOne?.dateOfBirth
                                ? dayjs(formData.adminOne.dateOfBirth)
                                : null
                            }
                            onChange={(date: any) => {
                              const formatted = date
                                ? dayjs(date).format('YYYY-MM-DD')
                                : '';
                              handleChange({
                                target: {
                                  name: 'adminOne.dateOfBirth',
                                  value: formatted,
                                },
                              } as React.ChangeEvent<HTMLInputElement>);
                            }}
                            onAccept={() => {
                              // Close calendar when OK is clicked
                              setOpenDobAdminOne(false);
                            }}
                            maxDate={dayjs()}
                            disabled={
                              !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneDateOfBirth'
                              )
                            }
                            format="DD/MM/YYYY"
                            slotProps={{
                              textField: {
                                readOnly: true, // prevent typing
                                id: 'dob_actual',
                                name: 'adminOne.dateOfBirth',
                                fullWidth: true,
                                size: 'small',
                                error: Boolean(errors?.adminOne?.dateOfBirth),
                                helperText: errors?.adminOne?.dateOfBirth || '',
                                placeholder: 'DD/MM/YYYY',
                                sx: {
                                  flex: 1,
                                  '& .MuiInputBase-root': { height: '70px' },
                                  '& .MuiInputBase-input': {
                                    padding: '14px 16px',
                                    boxSizing: 'border-box',
                                  },
                                  cursor: !isEditableField(
                                    INSTITUTIONAL_ADMIN_DETAILS,
                                    'adminOneDateOfBirth'
                                  )
                                    ? 'not-allowed'
                                    : 'pointer',
                                },
                                onClick: () => {
                                  // Only allow opening if field is editable
                                  if (
                                    isEditableField(
                                      INSTITUTIONAL_ADMIN_DETAILS,
                                      'adminOneDateOfBirth'
                                    )
                                  ) {
                                    setOpenDobAdminOne(true);
                                  }
                                },
                              },
                            }}
                          />

                          <div
                            className="calendar-icon-wrapper"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent outer div conflict
                              // Only allow opening if field is editable
                              if (
                                isEditableField(
                                  INSTITUTIONAL_ADMIN_DETAILS,
                                  'adminOneDateOfBirth'
                                )
                              ) {
                                setOpenDobAdminOne(true);
                              }
                            }}
                            style={{
                              cursor: !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneDateOfBirth'
                              )
                                ? 'not-allowed'
                                : 'pointer',
                              opacity: !isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminOneDateOfBirth'
                              )
                                ? 0.5
                                : 1,
                            }}
                          >
                            <img
                              src={CalendarIcon}
                              alt="calendar"
                              className="calendar-icon"
                            />
                          </div>
                        </div>
                      </div>
                    </LocalizationProvider>
                  </div>
                  <hr
                    style={{
                      marginBottom: '30px',
                      opacity: 0.3,
                      marginTop: '10px',
                    }}
                  />

                  <button
                    className="validate-btn"
                    onClick={(e) => handleValidate(e, 'adminOne')}
                    disabled={shouldDisableAdminOneValidation()}
                    style={{
                      backgroundColor: shouldDisableAdminOneValidation()
                        ? 'white'
                        : 'white',
                      color: shouldDisableAdminOneValidation()
                        ? '#999999'
                        : '#002CBA', // Change text color for disabled state
                      cursor: shouldDisableAdminOneValidation()
                        ? 'not-allowed'
                        : 'pointer',
                      fontFamily: 'Gilroy',
                      // padding: "10px 20px",
                      // borderRadius: "7px",
                      border: shouldDisableAdminOneValidation()
                        ? '1px solid #CCCCCC'
                        : '1px solid #002CBA',
                    }}
                  >
                    Validate Admin 1
                  </button>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                style={{ backgroundColor: '#F7F8FF' }}
              >
                <Typography component="span">Add Admin 2</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="form-row" style={{ marginTop: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="citizenship">
                      Citizenship<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="adminTwo.citizenship"
                      onChange={handleChange}
                      value={formData.adminTwo?.citizenship || ''}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoCitizenship'
                        )
                      }
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
                    {errors?.adminTwo?.citizenship && (
                      <span className="error-text">
                        {errors?.adminTwo?.citizenship}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="cyck-number">
                      CKYC number
                      {isIndianCitizenAdminTwo && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </label>
                    {/* <input
                      type="text"
                      name="adminTwo.ckycNumber"
                      placeholder="Enter ckyc number"
                      value={formData.adminTwo?.ckycNumber || ''}
                      onChange={handleChange}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoCkycNumbe'
                        )
                      }
                    /> */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="adminTwo.ckycNumber"
                        placeholder="Enter ckyc number"
                        value={formData.adminTwo?.ckycNumber || ''}
                        onChange={handleChange}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminTwoCkycNumber'
                          )
                        }
                        style={{
                          paddingRight: adminTwoCkycVerified ? '100px' : '80px',
                        }}
                        maxLength={14}
                      />

                      {adminTwoCkycVerified ? (
                        <span
                          style={{
                            color: '#52AE32',
                            fontWeight: '500',
                            fontSize: '14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                          }}
                        >
                          <CheckCircleOutlineIcon
                            style={{ fontSize: '16px' }}
                          />
                          Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCkycVerification('adminTwo')}
                          className="verify-button"
                          disabled={
                            !formData.adminTwo?.ckycNumber ||
                            formData.adminTwo?.ckycNumber.length !== 14 ||
                            !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoCkycNumber'
                            ) ||
                            ckycLoading
                          }
                          style={{
                            background: '#002CBA',
                            color: 'white',
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '10px 15px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          {ckycLoading ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                    </div>
                    {errors?.adminTwo?.ckycNumber && (
                      <span className="error-text">
                        {errors?.adminTwo?.ckycNumber}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="title">
                      Title<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="adminTwo.title"
                      onChange={handleChange}
                      value={
                        ckycDataAdminTwo?.title ||
                        formData?.adminTwo?.title ||
                        ''
                      }
                      defaultValue="Select Title"
                      // disabled={!isEditableField(INSTITUTIONAL_ADMIN_DETAILS, 'adminTwoTitle')}
                      disabled={
                        !isIndianCitizenAdminTwo ||
                        Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                          ? !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoTitle'
                            )
                          : true // 🔒 keep disabled for all other statuses
                      }
                    >
                      <option value="">Select Title</option>
                      {/* <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms">Ms</option> */}
                      {titles.map((title: any) => (
                        <option key={title.code} value={title.name}>
                          {title.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors?.adminTwo?.title && (
                    <span className="error-text">
                      {errors?.adminTwo?.title}
                    </span>
                  )}
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="f_name">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="adminTwo.firstName"
                      placeholder="Enter First Name"
                      value={
                        ckycDataAdminTwo?.firstName ||
                        formData?.adminTwo.firstName ||
                        ''
                      }
                      onChange={handleChange}
                      disabled={
                        !isIndianCitizenAdminTwo ||
                        Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                          ? !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoFirstName'
                            )
                          : true // 🔒 keep disabled for all other statuses
                      }
                      //  disabled={!isEditableField(INSTITUTIONAL_ADMIN_DETAILS, 'adminTwoFirstName')}
                    />
                    {errors?.adminTwo?.firstName && (
                      <span className="error-text">
                        {errors?.adminTwo?.firstName}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="m_name">Middle Name</label>
                    <input
                      type="text"
                      name="adminTwo.middleName"
                      placeholder="Enter Middle Name"
                      value={
                        ckycDataAdminTwo?.middleName ||
                        formData?.adminTwo.middleName ||
                        ''
                      }
                      onChange={handleChange}
                      //  disabled={!isEditableField(INSTITUTIONAL_ADMIN_DETAILS, 'adminTwoMiddleName')}
                      disabled={
                        !isIndianCitizenAdminTwo ||
                        Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                          ? !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoMiddleName'
                            )
                          : true // 🔒 keep disabled for all other statuses
                      }
                    />
                    {errors?.adminTwo?.middleName && (
                      <span className="error-text">
                        {errors?.adminTwo?.middleName}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="l_name">Last Name</label>
                    <input
                      type="text"
                      name="adminTwo.lastName"
                      placeholder="Enter Last Name"
                      value={
                        ckycDataAdminTwo?.lastName ||
                        formData?.adminTwo.lastName ||
                        ''
                      }
                      onChange={handleChange}
                      //  disabled={!isEditableField(INSTITUTIONAL_ADMIN_DETAILS, 'adminTwoLastName')}
                      disabled={
                        !isIndianCitizenAdminTwo ||
                        Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                          ? !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoLastName'
                            )
                          : true // 🔒 keep disabled for all other statuses
                      }
                    />
                    {errors?.adminTwo?.lastName && (
                      <span className="error-text">
                        {errors?.adminTwo?.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="designation">
                      Designation<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="adminTwo.designation"
                      placeholder="Enter Designation"
                      value={formData?.adminTwo?.designation || ''}
                      onChange={handleChange}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoDesignation'
                        )
                      }
                    />
                    {errors?.adminTwo?.designation && (
                      <span className="error-text">
                        {errors?.adminTwo?.designation}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      Email<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="adminTwo.emailId"
                      placeholder="Enter Email Id"
                      value={formData?.adminTwo?.emailId || ''}
                      onChange={handleChange}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoEmailId'
                        )
                      }
                    />
                    {errors?.adminTwo?.emailId && (
                      <span className="error-text">
                        {errors?.adminTwo?.emailId}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">
                      Gender<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="adminTwo.gender"
                      onChange={handleChange}
                      value={
                        ckycDataAdminTwo?.gender ||
                        formData?.adminTwo?.gender ||
                        ''
                      }
                      defaultValue="Select Gender"
                      disabled={
                        isIndianCitizenAdminTwo ||
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoGender'
                        )
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
                    {errors?.adminTwo?.gender && (
                      <span className="error-text">
                        {errors?.adminTwo?.gender}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label
                      htmlFor="countryCode_two"
                      className="required"
                      style={{ marginBottom: '1px' }}
                    >
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{
                        height: '47px',
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid grey',
                        borderRadius: '7px',
                        position: 'relative',
                        width: '100%', // Ensures responsiveness
                      }}
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
                        name="adminTwo.countryCode"
                        value={formData.adminTwo?.countryCode}
                        onChange={handleCountryChange}
                        disabled={
                          !isEditableField(
                            INSTITUTIONAL_ADMIN_DETAILS,
                            'adminTwoCountryCode'
                          )
                        }
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

                      {formData.adminTwo?.countryName?.length === 0 ? (
                        <label
                          htmlFor="country-code"
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
                          {formData.adminTwo?.countryName || 'India'}
                        </label>
                      )}
                    </div>

                    {errors?.adminTwo?.countryCode && (
                      <div className="error-message">
                        {errors?.adminTwo?.countryCode}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile_no">
                      Mobile Number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="adminTwo.mobileNo"
                      placeholder="Enter mobile number"
                      value={formData?.adminTwo?.mobileNo || ''}
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        if (
                          !/\d/.test(e.key) &&
                          !['Backspace', 'Delete', 'Tab', 'Enter'].includes(
                            e.key
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        const countryCode = formData.adminTwo?.countryCode;
                        let value = target.value.replace(/\D/g, '');

                        if (countryCode === '+91') {
                          if (value.length > 10) {
                            value = value.slice(0, 10);
                          }
                        } else {
                          if (value.length > 15) {
                            value = value.slice(0, 15);
                          }
                        }

                        target.value = value;
                      }}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoMobileNo'
                        )
                      }
                    />
                    {errors?.adminTwo?.mobileNo && (
                      <span className="error-text">
                        {errors?.adminTwo?.mobileNo}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="landline">Landline Number</label>
                    <input
                      type="text"
                      name="adminTwo.landline"
                      placeholder="Enter landline number"
                      value={formData?.adminTwo?.landline || ''}
                      onChange={handleChange}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoLandline'
                        )
                      }
                    />
                    {errors?.adminTwo?.landline && (
                      <span className="error-text">
                        {errors?.adminTwo?.landline}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="po_identity">
                      Proof of Identity<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="adminTwo.proofOfIdentity"
                      onChange={handleChange}
                      value={formData?.adminTwo?.proofOfIdentity || ''}
                      defaultValue="Select proof of identity"
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoProofOfIdentity'
                        )
                      }
                    >
                      {/* <option value="">Select proof of identity</option>
                      <option value="AADHAAR">Aadhar </option>
                      <option value="PAN_CARD">PAN card</option>
                      <option value="VOTER_ID">Voter ID</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option> */}
                      <option value="">Select proof of identity</option>
                      {/* Dynamically render options from API */}
                      {proofOfIdentities.map((identity) => (
                        <option key={identity.code} value={identity.code}>
                          {identity.name}
                        </option>
                      ))}
                    </select>
                    {errors?.adminTwo?.proofOfIdentity && (
                      <span className="error-text">
                        {errors?.adminTwo?.proofOfIdentity}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="identity_number">
                      Proof of Identity Number
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="adminTwo.identityNumber"
                      placeholder="Enter proof of identity number"
                      value={formData?.adminTwo?.identityNumber || ''}
                      onChange={handleChange}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoIdentityNumber'
                        )
                      }
                    />
                    {errors?.adminTwo?.identityNumber && (
                      <span className="error-text">
                        {errors?.adminTwo?.identityNumber}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="employee_code">
                      Employee code
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="adminTwo.employeeCode"
                      placeholder="Enter Employee code"
                      value={formData?.adminTwo?.employeeCode || ''}
                      onChange={handleChange}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoEmployeeCode'
                        )
                      }
                    />
                    {errors?.adminTwo?.employeeCode && (
                      <span className="error-text">
                        {errors?.adminTwo?.employeeCode}
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="office_address">
                      Office Address<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      style={{ fontFamily: 'inherit' }}
                      id="office_address"
                      name="sameAsRegisteredAddress"
                      value={
                        formData.adminTwo.sameAsRegisteredAddress?.toString() ||
                        'true'
                      }
                      onChange={(e) => {
                        const val = e.target.value === 'true';
                        setFormData((prev) => ({
                          ...prev,
                          adminTwo: {
                            ...prev.adminTwo,
                            sameAsRegisteredAddress: val,
                          },
                        }));
                      }}
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoSameAsRegisteredAddress'
                        )
                      }
                    >
                      <option value="true">Same as Registered Address</option>
                      <option value="false">
                        Same as Correspondence Address
                      </option>
                    </select>
                    {errors?.adminTwo?.sameAsRegisteredAddress && (
                      <span className="error-text">
                        {errors?.adminTwo?.sameAsRegisteredAddress}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="letter">
                      Authorization letter by Competent Authority
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="input-with-preview">
                      <div className="custom-file-input">
                        {/* TEXT FIELD for the payload (authorizationLetterDetails) */}
                        <input
                          type="text"
                          placeholder="Enter authorization details"
                          name="adminTwo.authorizationLetterDetails"
                          value={
                            formData.adminTwo?.authorizationLetterDetails || ''
                          }
                          onChange={handleChange}
                          disabled={
                            !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoAuthorizationLetterDetails'
                            )
                          }
                        />

                        {/* Upload icon for file input */}
                        <label
                          htmlFor="authorization-letter-upload-two"
                          className="upload-icon"
                          aria-label="Upload authorization letter"
                        >
                          <img
                            src={uploadIcon} // path to your PNG
                            alt="Upload"
                            style={{
                              width: '24px',
                              height: '24px',
                              objectFit: 'contain',
                            }}
                          />
                        </label>

                        {/* FILE INPUT for preview only (not sent in payload) */}
                        <input
                          id="authorization-letter-upload-two"
                          type="file"
                          accept=".pdf,.jpg,.jpeg"
                          name="iau_two_authorization_letter"
                          onChange={handleFileSelection}
                          className="hidden-file-input"
                          aria-label="Upload authorization letter file"
                          disabled={
                            !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoAuthorizationLetterDetails'
                            )
                          }
                        />
                      </div>

                      {/* Preview box */}
                      {formData?.iau_two_authorization_letterPreview && (
                        <div
                          className="preview-box"
                          onClick={handleAuthorizationAdminTwoPreviewClick}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={formData?.iau_two_authorization_letterPreview}
                            alt="Authorization Letter Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                    {errors?.iau_two_authorization_letter && (
                      <span className="error-text">
                        {errors?.iau_two_authorization_letter}
                      </span>
                    )}
                  </div>

                  <PreviewConfirmationModal
                    isOpen={isPreviewConfirmationOpen}
                    onClose={handleCancelFile}
                    imageUrl={pendingPreviewUrl}
                    altText="Document Preview"
                    onConfirm={handleConfirmFile}
                    onCancel={handleCancelFile}
                  />
                  <ReusableModal
                    isOpen={isAuthorizationLetterAdminTwoModalOpen}
                    onClose={() =>
                      setIsAuthorizationLetterAdminTwoModalOpen(false)
                    }
                    imageUrl={formData?.iau_two_authorization_letterPreview}
                    altText="Authorization Letter Preview"
                    // onFileChange={(e) => {
                    //   handleChange(e);
                    //   const file = e.target.files?.[0];
                    //   if (file) {
                    //     const previewUrl = URL.createObjectURL(file);
                    //     setFormData((prev) => ({
                    //       ...prev,
                    //       iau_two_authorization_letter: file,
                    //       iau_two_authorization_letterPreview: previewUrl,
                    //     }));
                    //   }
                    // }}
                    onFileChange={handleFileSelection}
                    inputId="modal-authorization-letter-upload"
                    inputName="iau_two_authorization_letter"
                    disabled={
                      !isEditableField(
                        INSTITUTIONAL_ADMIN_DETAILS,
                        'adminTwoAuthorizationLetterDetails'
                      )
                    }
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="form-group">
                      <label htmlFor="adminTwoDateOfAuthorization">
                        Date of Authorization
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="date-input-wrapper">
                        <DatePicker
                          open={openAuthDate}
                          onOpen={() => setOpenAuthDate(true)}
                          onClose={() => setOpenAuthDate(false)}
                          value={
                            formData?.adminTwo?.dateOfAuthorization
                              ? dayjs(formData.adminTwo.dateOfAuthorization)
                              : null
                          }
                          onAccept={(date: any) => {
                            // Close calendar only when user clicks OK
                            setOpenAuthDate(false);
                          }}
                          onChange={(date: any) => {
                            const formatted = date
                              ? dayjs(date).format('YYYY-MM-DD')
                              : '';
                            handleChange({
                              target: {
                                name: 'adminTwo.dateOfAuthorization',
                                value: formatted,
                              },
                            } as React.ChangeEvent<HTMLInputElement>);
                          }}
                          maxDate={dayjs()}
                          disabled={
                            !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoDateOfAuthorization'
                            )
                          }
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              readOnly: true, // ✅ Prevent typing
                              id: 'adminTwoDateOfAuthorization',
                              name: 'adminTwo.dateOfAuthorization',
                              fullWidth: true,
                              size: 'small',
                              error: Boolean(
                                errors?.adminTwo?.dateOfAuthorization
                              ),
                              helperText:
                                errors?.adminTwo?.dateOfAuthorization || '',
                              placeholder: 'DD/MM/YYYY',
                              sx: {
                                flex: 1,
                                '& .MuiInputBase-root': { height: '70px' },
                                '& .MuiInputBase-input': {
                                  padding: '14px 16px',
                                  boxSizing: 'border-box',
                                  fontFamily: 'inherit !important',
                                },
                                cursor: !isEditableField(
                                  INSTITUTIONAL_ADMIN_DETAILS,
                                  'adminTwoDateOfAuthorization'
                                )
                                  ? 'not-allowed'
                                  : 'pointer',
                              },
                              onClick: () => {
                                // Only allow opening if field is editable
                                if (
                                  isEditableField(
                                    INSTITUTIONAL_ADMIN_DETAILS,
                                    'adminTwoDateOfAuthorization'
                                  )
                                ) {
                                  setOpenAuthDate(true);
                                }
                              },
                            },
                          }}
                        />

                        <div
                          className="calendar-icon-wrapper"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent outer div click conflicts
                            // Only allow opening if field is editable
                            if (
                              isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminTwoDateOfAuthorization'
                              )
                            ) {
                              setOpenAuthDate(true);
                            }
                          }}
                          style={{
                            cursor: !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoDateOfAuthorization'
                            )
                              ? 'not-allowed'
                              : 'pointer',
                            opacity: !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoDateOfAuthorization'
                            )
                              ? 0.5
                              : 1,
                          }}
                        >
                          <img
                            src={CalendarIcon}
                            alt="calendar"
                            className="calendar-icon"
                          />
                        </div>
                      </div>
                    </div>
                  </LocalizationProvider>
                </div>

                <div className="form-row" style={{ marginTop: '-8px' }}>
                  <div className="form-group">
                    <label htmlFor="certified">
                      Certified copy of the Proof of the Identity
                      <span style={{ color: 'red' }}>*</span>
                    </label>

                    <input
                      type="file"
                      id="iau_one_certified_poi_upload"
                      aria-label="Upload certified copy of proof of identity"
                      name="iau_two_certified_poi"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={handleFileSelection}
                      className="hidden-upload"
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoCertifiedPoi'
                        )
                      }
                    />
                    <div className="input-with-preview">
                      <label
                        htmlFor="iau_one_certified_poi_upload"
                        className="upload-doc-btn"
                        aria-label="Upload certified copy of proof of identity"
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '5px',
                            marginBottom: '-2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                          aria-hidden="true"
                        >
                          Upload
                        </span>
                      </label>
                      {formData.iau_two_certified_poiPreview && (
                        <div
                          className="preview-box"
                          onClick={handlePoiAdminTwoPreviewClick}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={formData.iau_two_certified_poiPreview}
                            alt="iau_two_certified_poiPreview Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                    {errors?.iau_two_certified_poi && (
                      <span className="error-text">
                        {errors?.iau_two_certified_poi}
                      </span>
                    )}
                  </div>

                  <PreviewConfirmationModal
                    isOpen={isPreviewConfirmationOpen}
                    onClose={handleCancelFile}
                    imageUrl={pendingPreviewUrl}
                    altText="Document Preview"
                    onConfirm={handleConfirmFile}
                    onCancel={handleCancelFile}
                  />
                  {/* Modal for Proof of Identity */}
                  <ReusableModal
                    isOpen={isPoiAdminTwoModalOpen}
                    onClose={() => setIsPoiAdminTwoModalOpen(false)}
                    imageUrl={formData?.iau_two_certified_poiPreview}
                    altText="Proof of Identity Preview"
                    // onFileChange={(e) => {
                    //   handleChange(e);
                    //   const file = e.target.files?.[0];
                    //   if (file) {
                    //     const previewUrl = URL.createObjectURL(file);
                    //     setFormData((prev) => ({
                    //       ...prev,
                    //       iau_two_certified_poi: file,
                    //       iau_two_certified_poiPreview: previewUrl,
                    //     }));
                    //   }
                    // }}
                    onFileChange={handleFileSelection}
                    inputId="modal-poi-upload"
                    inputName="iau_two_certified_poi"
                    disabled={
                      !isEditableField(
                        INSTITUTIONAL_ADMIN_DETAILS,
                        'adminTwoCertifiedPoi'
                      )
                    }
                  />

                  <div className="form-group">
                    <label htmlFor="certified-copy">
                      Certified copy of Photo Identity Card
                      <span style={{ color: 'red' }}>*</span>
                    </label>

                    <input
                      type="file"
                      id="iau_two_certified_photo_Identity_upload"
                      aria-label="Upload certified copy of photo identity card"
                      name="iau_two_certified_photoIdentity"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={handleFileSelection}
                      className="hidden-upload"
                      disabled={
                        !isEditableField(
                          INSTITUTIONAL_ADMIN_DETAILS,
                          'adminTwoCertifiedPhotoIdentity'
                        )
                      }
                    />
                    <div className="input-with-preview">
                      <label
                        htmlFor="iau_two_certified_photo_Identity_upload"
                        className="upload-doc-btn"
                        aria-label="Upload certified copy of photo identity card"
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '5px',
                            marginBottom: '-2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                          aria-hidden="true"
                        >
                          Upload
                        </span>
                      </label>
                      {formData.iau_two_certified_photoIdentityPreview && (
                        <div
                          className="preview-box"
                          onClick={handlePhotoIdentityAdminTwoPreviewClick}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={
                              formData.iau_two_certified_photoIdentityPreview
                            }
                            alt="iau_two_certified_photoIdentityPreview Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                    {errors?.iau_two_certified_photoIdentity && (
                      <span className="error-text">
                        {errors?.iau_two_certified_photoIdentity}
                      </span>
                    )}
                  </div>

                  {/* Preview for confirmation */}
                  <PreviewConfirmationModal
                    isOpen={isPreviewConfirmationOpen}
                    onClose={handleCancelFile}
                    imageUrl={pendingPreviewUrl}
                    altText="Document Preview"
                    onConfirm={handleConfirmFile}
                    onCancel={handleCancelFile}
                  />
                  <ReusableModal
                    isOpen={isPhotoIdentityAdminTwoModalOpen}
                    onClose={() => setIsPhotoIdentityAdminTwoModalOpen(false)}
                    imageUrl={formData?.iau_two_certified_photoIdentityPreview}
                    altText="Photo Identity Card Preview"
                    // onFileChange={(e) => {
                    //   handleChange(e);
                    //   const file = e.target.files?.[0];
                    //   if (file) {
                    //     const previewUrl = URL.createObjectURL(file);
                    //     setFormData((prev) => ({
                    //       ...prev,
                    //       iau_two_certified_photoIdentity: file,
                    //       iau_two_certified_photoIdentityPreview: previewUrl,
                    //     }));
                    //   }
                    // }}
                    onFileChange={handleFileSelection}
                    inputId="modal-photo-identity-upload"
                    inputName="iau_two_certified_photoIdentity"
                    disabled={
                      !isEditableField(
                        INSTITUTIONAL_ADMIN_DETAILS,
                        'adminTwoCertifiedPhotoIdentity'
                      )
                    }
                  />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="form-group">
                      <label htmlFor="dob_actual_two">
                        Date of Birth<span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="date-input-wrapper">
                        <DatePicker
                          open={openDobAdminTwo}
                          onOpen={() => setOpenDobAdminTwo(true)}
                          onClose={() => setOpenDobAdminTwo(false)}
                          value={
                            formData?.adminTwo?.dateOfBirth
                              ? dayjs(formData.adminTwo.dateOfBirth)
                              : null
                          }
                          onChange={(date: any) => {
                            const formattedDate = date
                              ? dayjs(date).format('YYYY-MM-DD')
                              : '';
                            handleChange({
                              target: {
                                name: 'adminTwo.dateOfBirth',
                                value: formattedDate,
                              },
                            } as React.ChangeEvent<HTMLInputElement>);
                          }}
                          onAccept={() => {
                            // Close the calendar only when OK is clicked
                            setOpenDobAdminTwo(false);
                          }}
                          maxDate={dayjs()}
                          disabled={
                            !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoDateOfBirth'
                            )
                          }
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              readOnly: true, // Prevent typing
                              id: 'dob_actual_two',
                              name: 'adminTwo.dateOfBirth',
                              fullWidth: true,
                              size: 'small',
                              error: Boolean(errors?.adminTwo?.dateOfBirth),
                              helperText: errors?.adminTwo?.dateOfBirth || '',
                              placeholder: 'DD/MM/YYYY',
                              sx: {
                                flex: 1,
                                '& .MuiInputBase-root': { height: '70px' },
                                '& .MuiInputBase-input': {
                                  padding: '14px 16px',
                                  boxSizing: 'border-box',
                                  fontFamily: 'inherit !important',
                                },
                                cursor: !isEditableField(
                                  INSTITUTIONAL_ADMIN_DETAILS,
                                  'adminTwoDateOfBirth'
                                )
                                  ? 'not-allowed'
                                  : 'pointer',
                              },
                              onClick: () => {
                                // Only allow opening if field is editable
                                if (
                                  isEditableField(
                                    INSTITUTIONAL_ADMIN_DETAILS,
                                    'adminTwoDateOfBirth'
                                  )
                                ) {
                                  setOpenDobAdminTwo(true);
                                }
                              },
                            },
                          }}
                        />

                        <div
                          className="calendar-icon-wrapper"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent outer div conflicts
                            // Only allow opening if field is editable
                            if (
                              isEditableField(
                                INSTITUTIONAL_ADMIN_DETAILS,
                                'adminTwoDateOfBirth'
                              )
                            ) {
                              setOpenDobAdminTwo(true);
                            }
                          }}
                          style={{
                            cursor: !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoDateOfBirth'
                            )
                              ? 'not-allowed'
                              : 'pointer',
                            opacity: !isEditableField(
                              INSTITUTIONAL_ADMIN_DETAILS,
                              'adminTwoDateOfBirth'
                            )
                              ? 0.5
                              : 1,
                          }}
                        >
                          <img
                            src={CalendarIcon}
                            alt="calendar"
                            className="calendar-icon"
                          />
                        </div>
                      </div>
                    </div>
                  </LocalizationProvider>
                </div>

                <hr
                  style={{
                    marginBottom: '30px',
                    opacity: 0.3,
                    marginTop: '10px',
                  }}
                />

                <button
                  className="validate-btn"
                  onClick={(e) => handleValidate(e, 'adminTwo')}
                  disabled={shouldDisableAdminTwoValidation()}
                  style={{
                    backgroundColor: shouldDisableAdminTwoValidation()
                      ? 'white'
                      : 'white',
                    color: shouldDisableAdminTwoValidation()
                      ? '#999999'
                      : '#002CBA',
                    cursor: shouldDisableAdminTwoValidation()
                      ? 'not-allowed'
                      : 'pointer',
                    fontFamily: 'Gilroy',
                    // padding: "10px 20px",
                    // borderRadius: "7px",
                    border: shouldDisableAdminTwoValidation()
                      ? '1px solid #CCCCCC'
                      : '1px solid #002CBA',
                  }}
                >
                  Validate Admin2
                </button>
              </AccordionDetails>
            </Accordion>
            <div className="form-footer">
              <button
                type="submit"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!canSaveAndNext() || isViewOnlyAdmin}
                style={{
                  backgroundColor:
                    canSaveAndNext() && !isViewOnlyAdmin
                      ? '#002CBA'
                      : '#CCCCCC',
                  color: 'white',
                  cursor:
                    canSaveAndNext() && !isViewOnlyAdmin
                      ? 'pointer'
                      : 'not-allowed',
                  fontFamily: 'Gilroy',
                  // padding: "10px 20px",
                  // borderRadius: "4px",
                  border: 'none',
                }}
              >
                Save & Next
              </button>
            </div>
            {/* {errorInstitutionadminDetails && (
              <div
                className="error-message"
                style={{ color: 'red', marginTop: '10px' }}
              >
                {errorInstitutionadminDetails}
              </div>
            )} */}
            {firstError && (
              <div className="error-message-main">
                {/* <span className="error-message">Field: {firstError.field}</span> */}
                <span className="error-message-main"> {firstError.issue}</span>
              </div>
            )}
            {/* {APIError !== '' && (
              <div className="error-message-main">                
                <span className="error-message-main"> {APIError}</span>
              </div>
            )} */}
          </form>
        </div>
      </div>
    </>
  );
};

export default InstitutionAdminDetails;
