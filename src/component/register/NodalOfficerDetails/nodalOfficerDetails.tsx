/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import '../InstitutionDetails/institutionDetails.css';

import CalendarIcon from '../../../assets/Icon.svg';
import { Select, MenuItem, InputLabel } from '@mui/material';

import ReusableModal from '../../../component/Modal/ReusableModalPreview/reusableModal';
import PreviewConfirmationModal from '../../../component/Modal/ReusableModalPreview/previewModal';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { ReactComponent as CKYCRRLogo } from '../../../assets/ckycrr_sign_up_logo.svg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { format, parse, isValid } from 'date-fns';

import { useNavigate } from 'react-router';

import { AppDispatch, RootState } from '@redux/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  setNodalOfficerFormData,
  submitNodalOfficerDetails,
  updateNodalOfficerForm,
} from '../../../redux/slices/registerSlice/nodalOfficerSlice';
import {
  hideLoader,
  showLoader,
} from '../../../redux/slices/loader/loaderSlice';

import ApplicationStepper from '../../../component/stepper/ApplicationStepper';

import {
  markStepCompleted,
  setApplicationFormData,
  setCurrentStep,
} from '../../../redux/slices/registerSlice/applicationSlice';
import UploadIconButton from '../../../assets/UploadIconButton.svg';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const REQUIRED_KEYS = [
  'firstName',
  'designation',
  'email',
  'no_certified_photoIdentity',
  'no_certified_poi',
  'identityNumber',
  'no_board_resolution',
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

const isValidForm = (
  data: Record<string, any>,
  errors: Record<string, string>
): boolean => {
  // Check if all required fields are filled
  const allRequiredFieldsFilled = REQUIRED_KEYS.every((key) =>
    Boolean(data[key])
  );

  // Check if there are no validation errors for required fields
  const noValidationErrorsForRequiredFields = REQUIRED_KEYS.every(
    (key) => !errors[key]
  );

  console.log('Form validation:', {
    allRequiredFieldsFilled,
    noValidationErrorsForRequiredFields,
    requiredFieldErrors: REQUIRED_KEYS.reduce(
      (acc, key) => ({ ...acc, [key]: errors[key] }),
      {}
    ),
    allErrors: errors,
    formData: data,
  });

  return allRequiredFieldsFilled && noValidationErrorsForRequiredFields;
};

const NodalOfficerDetails = () => {
  interface FormDataType {
    title?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    countryCode?: string;
    mobileNumber?: string;
    ckycNo?: string;
    designation?: string;
    gender?: string;
    citizenship?: string;
    landline?: string; // aligned with NodalOfficerFormData
    proofOfIdentity?: string;
    identityNumber?: string;
    dateOfBirth?: string;
    dateOfBoardResolution?: string; // make it a string for compatibility
    sameAsRegisteredAddress?: boolean;
    countryName?: string;

    // File inputs
    no_board_resolution?: File;
    no_certified_poi?: File;
    no_certified_photoIdentity?: File;

    // Previews (used only on frontend)
    no_board_resolutionPreview?: string;
    no_certified_poiPreview?: string;
    no_certified_photoIdentityPreview?: string;

    // Additional fields used in your form
    institution?: string;
    regulator?: string;
    pan?: File | null;
    panPreview?: string;
    registrationCert?: File | null;
    registrationCertPreview?: string;

    // Address and dynamic properties
    [key: string]: string | boolean | File | null | undefined | number;
  }
  const [formData, setFormData] = useState<FormDataType>({
    sameAsRegisteredAddress: true,
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const modifiableFields = useSelector(
    (state: RootState) => state.auth.reinitializeData?.modifiableFields
  );
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [isBoardResolutionModalOpen, setIsBoardResolutionModalOpen] =
    useState(false);
  const [isPoiModalOpen, setIsPoiModalOpen] = useState(false);
  const [isPhotoIdentityModalOpen, setIsPhotoIdentityModalOpen] =
    useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null
  );
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [isPreviewConfirmationOpen, setIsPreviewConfirmationOpen] =
    useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [activeTab, setActiveTab] = useState('register'); // Assuming 'register' is the default active tab
  const [countries, setCountries] = useState<
    { name: string; code: string; dial_code: string }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [openBoardResolution, setOpenBoardResolution] = useState(false);

  const isIndianCitizen = formData?.citizenship === 'Indian';

  const Reinitializestatus = useSelector(
    (state: RootState) => state.auth.reinitializeData?.approvalStatus
  );

  const viewOnlyStatuses = [
    'SUBMITTED_PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'READY_FOR_SUBMISSION',
  ];

  const NODAL_OFFICER_DETAILS = 'NODAL_OFFICER_DETAILS';

  const isViewOnlyNodal = viewOnlyStatuses.includes(Reinitializestatus ?? '');

  const isEditableField = (section: string, field: string): boolean => {
    if (Reinitializestatus === 'REQUEST_FOR_MODIFICATION') {
      return !!modifiableFields?.[section]?.includes(field);
    }
    if (viewOnlyStatuses.includes(Reinitializestatus ?? '')) {
      return false;
    }

    return true;
  };

  const nodalDataFromRedux = useSelector(
    (state: RootState) => state.nodalOfficer.formData
  );
  const previewNodalForm = useSelector(
    (state: RootState) => state.applicationPreview.nodalOfficerDetails
  );
  const documents = useSelector(
    (state: RootState) => state.applicationPreview.documents
  );
  console.log(previewNodalForm, 'previewNodalForm');
  console.log(nodalDataFromRedux, 'nodalDataFromRedux');
  console.log('Current formData:', formData);
  // const nodalError = useSelector(
  //   (state: RootState) => state.nodalOfficer.Nodalerror
  // );
  const nodalError = useSelector(
    (state: RootState) => state.nodalOfficer.Nodalerror
  ) as {
    fieldErrors?: Record<string, string>;
    rawMessage?: string;
  } | null;

  const { proofOfIdentities, citizenships, genders } = useSelector(
    (state: RootState) => state.masters
  );
  const geographyHierarchy = useSelector(
    (state: RootState) => state.masters.geographyHierarchy
  );

  const parsed = formData?.dateOfBirth
    ? parse(formData.dateOfBirth, 'dd-MM-yyyy', new Date())
    : null;

  const parsedDOB = parsed && isValid(parsed) ? parsed : null;

  const formattedDOB = parsedDOB ? format(parsedDOB, 'dd-MM-yyyy') : null;

  console.log('parsedDOB (Date):', parsedDOB); // Date object
  console.log('formattedDOB (String):', formattedDOB); // '09-06-2025'
  useEffect(() => {
    dispatch(setCurrentStep(3)); // 0 = first step
  }, [dispatch]);

  useEffect(() => {
    // MIME types mapping
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
    };

    // Convert base64 + fileName to File
    const base64ToFile = (doc: {
      base64Content: string;
      fileName: string;
    }): File => {
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

    // Extract specific documents from Redux state
    const noBoardResolution = documents?.find(
      (doc) => doc.documentType === 'NO_BOARD_RESOLUTION'
    );
    const noCertifiedPOI = documents?.find(
      (doc) => doc.documentType === 'NO_CERTIFIED_POI'
    );
    const noCertifiedPhotoIdentity = documents?.find(
      (doc) => doc.documentType === 'NO_CERTIFIED_PHOTO_IDENTITY'
    );

    // Build document-related fields only if they don't exist as File objects in Redux
    // (meaning they haven't been manually uploaded by the user)
    const getDocumentFields = (currentFormData: any) => {
      const docFields: Partial<FormDataType> = {};

      // Only add document fields if they're not already File objects (user uploads)
      if (
        noBoardResolution &&
        !(currentFormData?.no_board_resolution instanceof File)
      ) {
        docFields.no_board_resolution = base64ToFile(noBoardResolution);
        docFields.no_board_resolutionPreview = `data:${
          mimeTypes[
            noBoardResolution.fileName.split('.').pop()?.toLowerCase() || 'pdf'
          ]
        };base64,${noBoardResolution.base64Content}`;
      }

      if (
        noCertifiedPOI &&
        !(currentFormData?.no_certified_poi instanceof File)
      ) {
        docFields.no_certified_poi = base64ToFile(noCertifiedPOI);
        docFields.no_certified_poiPreview = `data:${
          mimeTypes[
            noCertifiedPOI.fileName.split('.').pop()?.toLowerCase() || 'pdf'
          ]
        };base64,${noCertifiedPOI.base64Content}`;
      }

      if (
        noCertifiedPhotoIdentity &&
        !(currentFormData?.no_certified_photoIdentity instanceof File)
      ) {
        docFields.no_certified_photoIdentity = base64ToFile(
          noCertifiedPhotoIdentity
        );
        docFields.no_certified_photoIdentityPreview = `data:${
          mimeTypes[
            noCertifiedPhotoIdentity.fileName.split('.').pop()?.toLowerCase() ||
              'pdf'
          ]
        };base64,${noCertifiedPhotoIdentity.base64Content}`;
      }

      return docFields;
    };

    // Your original logic with document handling
    if (previewNodalForm && Object.keys(nodalDataFromRedux).length === 0) {
      console.log('inside if - loading from previewNodalForm');

      const documentFields = getDocumentFields(previewNodalForm);
      const mergedData = { ...previewNodalForm, ...documentFields };

      setFormData(mergedData);
      dispatch(updateNodalOfficerForm(mergedData));
    } else {
      console.log('inside else - loading from redux');

      const documentFields = getDocumentFields(nodalDataFromRedux);
      const mergedData = { ...nodalDataFromRedux, ...documentFields };

      setFormData(mergedData);
    }
  }, [nodalDataFromRedux, previewNodalForm, dispatch, documents]);

  // useEffect(() => {
  //     if (ckycData) {
  //       setFormData(prev => ({
  //         ...prev,
  //         firstName: ckycData.firstName || '',
  //         middleName: ckycData.middleName || '',
  //         lastName: ckycData.lastName || '',
  //         title: ckycData.title || '',
  //       }));
  //     }
  //   }, [ckycData]);

  useEffect(() => {
    if (userDetails) {
      // setFormData({
      //   title: userDetails.title || '',
      //   firstName: userDetails.firstName || '',
      //   middleName: userDetails.middleName || '',
      //   lastName: userDetails.lastName || '',
      //   email: userDetails.email || '',
      // });
      setFormData((prev) => ({
        ...prev,
        title: userDetails.title || '',
        firstName: userDetails.firstName || '',
        middleName: userDetails.middleName || '',
        lastName: userDetails.lastName || '',
        mobileNumber: userDetails.mobileNo || '',
        countryCode: userDetails.countryCode || '',
        citizenship: userDetails.citizenship || '',
        ckycNo: userDetails.ckycNumber || '',
        email: userDetails.email || '',
      }));
    }
  }, [userDetails]);

  useEffect(() => {
    setIsFormValid(isValidForm(formData, formErrors));
  }, [formData, formErrors]);

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const target = e.target;
  //   const { name, value } = target;

  //   if (target instanceof HTMLInputElement && target.type === 'file') {
  //     const file = target.files?.[0];
  //     if (file) {
  //       const previewURL = URL.createObjectURL(file);
  //       setFormData(prev => ({
  //         ...prev,
  //         [name]: file,
  //         [`${name}Preview`]: previewURL,
  //       }));
  //     }
  //   } else {
  //     setFormData(prev => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   }
  // };

  // Adapter function to bridge MUI SelectChangeEvent to your existing handleChange
  const handleSelectChange = (name: string, newValue: string) => {
    // Convert string to boolean for sameAsRegisteredAddress field
    const processedValue =
      name === 'sameAsRegisteredAddress' ? newValue === 'true' : newValue;

    const updated = {
      ...formData,
      [name]: processedValue,
    };

    setFormData(updated);
    dispatch(setNodalOfficerFormData(updated));

    const errorMessage = validateField(name, newValue, updated);
    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  //   // New file selection handler
  // const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const target = e.target as HTMLInputElement;
  //   const { name, files } = target;

  //   if (files?.[0]) {
  //     const file = files[0];

  //     // Validate file first
  //     const errorMessage = validateFile(name, file);
  //     if (errorMessage) {
  //       setFormErrors((prev) => ({
  //         ...prev,
  //         [name]: errorMessage,
  //       }));
  //       return;
  //     }

  //     // Clear any previous errors
  //     setFormErrors((prev) => ({
  //       ...prev,
  //       [name]: "",
  //     }));

  //     // Create preview URL and show confirmation modal
  //     const previewURL = URL.createObjectURL(file);
  //     setPendingFile(file);
  //     setPendingPreviewUrl(previewURL);
  //     setPendingFileName(name);
  //     setIsPreviewConfirmationOpen(true);
  //   }

  //   // Reset the input value to allow selecting the same file again
  //   target.value = '';
  // };

  // Generic file selection handler
  // const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const target = e.target as HTMLInputElement;
  //   const { name, files } = target;

  //   if (files?.[0]) {
  //     const file = files[0];

  //     // Validate file first
  //     const errorMessage = validateFile(name, file);
  //     if (errorMessage) {
  //       setFormErrors((prev) => ({
  //         ...prev,
  //         [name]: errorMessage,
  //       }));
  //       return;
  //     }

  //     // Clear any previous errors
  //     setFormErrors((prev) => ({
  //       ...prev,
  //       [name]: '',
  //     }));

  //     // Create preview URL and show confirmation modal
  //     const previewURL = URL.createObjectURL(file);
  //     setPendingFile(file);
  //     setPendingPreviewUrl(previewURL);
  //     setPendingFileName(name);
  //     setIsPreviewConfirmationOpen(true);
  //   }

  //   // Reset the input value
  //   target.value = '';
  // };
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔵 handleFileSelection called for:', e.target.name);
    const target = e.target as HTMLInputElement;
    const { name, files } = target;

    if (files?.[0]) {
      const file = files[0];
      console.log('📁 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeInKB: Math.round(file.size / 1024),
      });

      // Validate file first
      const errorMessage = validateFile(name, file);
      console.log('⚠️ Validation result:', errorMessage || 'No error');

      if (errorMessage) {
        console.log('❌ Setting form error for field:', name);
        setFormErrors((prev) => {
          const newErrors = {
            ...prev,
            [name]: errorMessage,
          };
          console.log('📝 Updated form errors:', newErrors);
          return newErrors;
        });
        return; // Don't proceed with file processing
      }

      // Clear any previous errors
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));

      // Create preview URL and show confirmation modal
      const previewURL = URL.createObjectURL(file);
      setPendingFile(file);
      setPendingPreviewUrl(previewURL);
      setPendingFileName(name);
      setIsPreviewConfirmationOpen(true);
      console.log('✅ File validation passed, showing preview modal');
    }

    // Reset the input value
    target.value = '';
  };
  // // Handle file confirmation
  // const handleConfirmFile = () => {
  //   if (pendingFile && pendingPreviewUrl && pendingFileName) {
  //     // Process the file using existing logic
  //     const updated = {
  //       ...formData,
  //       [pendingFileName]: pendingFile,
  //       [`${pendingFileName}Preview`]: pendingPreviewUrl,
  //     };

  //     setFormData(updated);
  //     dispatch(setNodalOfficerFormData(updated));

  //     // Close the confirmation modal
  //     setIsPreviewConfirmationOpen(false);

  //     // Reset pending states
  //     setPendingFile(null);
  //     setPendingPreviewUrl(null);
  //     setPendingFileName("");
  //   }
  // };

  const handleConfirmFile = () => {
    if (pendingFile && pendingPreviewUrl && pendingFileName) {
      // Process the file using existing logic
      const updated = {
        ...formData,
        [pendingFileName]: pendingFile,
        [`${pendingFileName}Preview`]: pendingPreviewUrl,
      };

      setFormData(updated);
      dispatch(setNodalOfficerFormData(updated));

      // Close the confirmation modal
      setIsPreviewConfirmationOpen(false);

      // Reset pending states
      setPendingFile(null);
      setPendingPreviewUrl(null);
      setPendingFileName('');
    }
  };

  // Generic cancel handler
  const handleCancelFile = () => {
    setIsPreviewConfirmationOpen(false);
    setPendingFile(null);
    setPendingPreviewUrl(null);
    setPendingFileName('');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked, files } = target;

    if (type === 'file') {
      const file = files?.[0];
      if (file) {
        const errorMessage = validateFile(name, file);
        if (errorMessage) {
          setFormErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
          }));
          return;
        }
        const previewURL = URL.createObjectURL(file);
        const updated = {
          ...formData,
          [name]: file,
          [`${name}Preview`]: previewURL,
        };
        setFormData(updated);
        dispatch(setNodalOfficerFormData(updated));
      }

      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    } else if (type === 'checkbox') {
      const updated = {
        ...formData,
        [name]: checked,
      };
      setFormData(updated);
      dispatch(setNodalOfficerFormData(updated));

      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    } else {
      let updated = {
        ...formData,
        [name]: value,
      };

      // Clear identityNumber when proofOfIdentity changes
      if (name === 'proofOfIdentity') {
        updated = {
          ...updated,
          identityNumber: '', // Reset the identity number
        };

        // Clear any existing error for identityNumber
        setFormErrors((prev) => ({
          ...prev,
          [name]: '',
          identityNumber: '', // Clear identity number error too
        }));
      }
      // Auto-update country code when citizenship changes
      else if (name === 'citizenship' && value && countries.length > 0) {
        const matchingCountry = countries.find(
          (country) => country.name.toLowerCase() === value.toLowerCase()
        );

        if (matchingCountry) {
          console.log(
            `Auto-selected country code: ${matchingCountry.dial_code} for citizenship: ${value}`
          );
          updated = {
            ...updated,
            countryCode: matchingCountry.dial_code,
            countryName: matchingCountry.name,
          };
        }

        // For other fields, just clear the error for that field
        const errorMessage = validateField(name, value, updated);
        setFormErrors((prev) => ({
          ...prev,
          [name]: errorMessage,
        }));
      } else {
        // For other fields, just clear the error for that field
        const errorMessage = validateField(name, value, updated);
        setFormErrors((prev) => ({
          ...prev,
          [name]: errorMessage,
        }));
      }

      setFormData(updated);
      dispatch(setNodalOfficerFormData(updated));
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    navigate('/re-institution-details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevents form from submitting and adding query params

    try {
      dispatch(showLoader('Please Wait...'));
      await dispatch(submitNodalOfficerDetails(formData)).unwrap();
      // ✅ Navigate only if API call succeeded
      // ✅ Save current section's data
      dispatch(
        setApplicationFormData({ section: 'nodalOfficer', data: formData })
      );
      // ✅ Mark this step as complete
      dispatch(markStepCompleted(3));

      // ✅ Move to next step
      dispatch(setCurrentStep(4));

      navigate('/re-institutional-admin-details');
    } catch (error) {
      console.error('Nodal officer submission failed:', error);
      // You can show a toast or error message here
    } finally {
      dispatch(hideLoader());
    }
  };
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
    const error = validateField('countryCode', selectedCode, {
      ...formData,
      countryCode: selectedCode,
    });
    setFormErrors((prevErrors) => ({ ...prevErrors, countryCode: error }));
  };

  type ValidationErrors = {
    [key: string]: string;
  };

  const validateFile = (name: string, file: File): string => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    const maxSize = 500 * 1024; // 500KB

    switch (name) {
      case 'no_board_resolution':
      case 'no_certified_poi':
      case 'no_certified_photoIdentity':
        if (!allowedTypes.includes(file.type)) {
          return 'Invalid file format. Only PDF, JPG, JPEG allowed';
        }

        if (file.size > maxSize) {
          return 'File size must be less than 500KB';
        }
        break;

      default:
        return '';
    }

    return '';
  };

  const validateField = (
    name: string,
    value: string,
    formData: FormDataType
  ): string => {
    let countryCode: string;
    let poiType: string | undefined;

    switch (name) {
      case 'firstName':
        if (!value) return 'First Name is required';
        if (/\s/.test(value)) return 'Spaces are not allowed in First Name';
        if (!/^[A-Za-z'.]+$/.test(value))
          return "Only A-Z, a-z, dot (.) and apostrophe (') allowed";
        break;

      case 'middleName':
        if (value && !/^[A-Za-z\s']+$/.test(value))
          return 'Only letters, apostrophes, and spaces allowed';
        break;

      case 'lastName':
        if (value && /\s/.test(value))
          return 'Spaces are not allowed in Last Name';
        if (value && !/^[A-Za-z']+$/.test(value))
          return 'Only letters and apostrophes allowed';
        break;

      case 'designation':
        if (!value) return 'Designation is required';
        if (value.length > 100)
          return 'Designation cannot exceed 100 characters';
        if (!/^[A-Za-z0-9 `~@#$%^&*()_+\-=]+$/.test(value))
          return 'Invalid characters in Designation';
        break;

      case 'email':
        if (!value) return 'Email is required';
        if (
          !/^[A-Za-z0-9`~@#$%^&*()._+\-=]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
            value
          )
        )
          return 'Invalid email format';
        break;

      case 'ckycNo':
        if (!value) return 'CKYC number is required';
        if (!/^\d{14}$/.test(value)) return 'CKYC number must be 14 digits';
        break;

      case 'mobileNumber':
        countryCode = formData?.countryCode || '+91';
        if (!value) return 'Mobile Number is required';
        if (countryCode === '+91') {
          if (!/^\d{10}$/.test(value))
            return 'For India, mobile number must be 10 digits';
        } else {
          if (!/^\d{8,15}$/.test(value))
            return 'Mobile number must be 8-15 digits';
        }
        break;

      case 'landline':
        // Alphanumeric with `+` allowed, length between 3 and 20 (adjust as needed)
        if (!/^[a-zA-Z0-9+]+$/.test(value))
          return "Landline must be alphanumeric and can include '+' only";
        if (value.length > 15)
          return 'Landline number must be less than 15 characters';
        break;

      case 'citizenship':
        if (!value) return 'Citizenship is required';
        break;

      case 'proofOfIdentity':
        if (!value) return 'Proof of Identity is required';
        break;

      case 'identityNumber':
        poiType = formData?.proofOfIdentity;
        if (!value) return 'Proof of Identity Number is required';
        if (value.length > 50)
          return 'Proof of Identity Number cannot exceed 50 characters';
        if (formData?.citizenship === 'Indian') {
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
        }

        break;

      // Add more cases here...

      default:
        return '';
    }

    return '';
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

          <div className="step-indicator">Nodal Officer Details</div>
          <form className="entity-form" onSubmit={handleSubmit}>
            <div className="form-row" style={{ marginBottom: '-10px' }}>
              <div className="form-group">
                <label htmlFor="citizenship">
                  Citizenship<span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  id="citizenship"
                  name="citizenship"
                  onChange={handleChange}
                  value={formData.citizenship || ''}
                  // disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noCitizenship')}
                  disabled={
                    Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(NODAL_OFFICER_DETAILS, 'noCitizenship')
                      : true // 🔒 keep disabled for all other statuses
                  }
                >
                  <option value="">Select Citizenship</option>
                  {/* {citizenshipOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))} */}

                  {citizenships.map(
                    (citizenship: { code: string; name: string }) => (
                      <option key={citizenship.code} value={citizenship.name}>
                        {citizenship.name}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ckycNo">
                  CKYC Number
                  {isIndianCitizen && <span style={{ color: 'red' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id="ckycNo"
                    name="ckycNo"
                    placeholder="Enter CKYC number"
                    value={formData.ckycNo || ''}
                    onChange={handleChange}
                    disabled={
                      Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                        ? !isEditableField(
                            NODAL_OFFICER_DETAILS,
                            'noCkycNumber'
                          )
                        : true
                    }
                    style={{ paddingRight: '100px' }} // Add padding to prevent text overlap with verification span
                  />
                  {formData.ckycNo !== '' ? (
                    <span
                      style={{
                        color: '#52AE32',
                        fontWeight: '500',
                        padding: '10px 20px',
                        fontSize: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none', // Prevents the span from interfering with input clicks
                      }}
                    >
                      <CheckCircleOutlineIcon style={{ fontSize: '16px' }} />
                      Verified
                    </span>
                  ) : (
                    ''
                  )}
                </div>
                {formErrors.ckycNo && (
                  <span className="error-text">{formErrors.ckycNo}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="title">
                  Title<span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  id="title"
                  name="title"
                  onChange={handleChange}
                  value={formData.title || ''}
                  defaultValue="Select title"
                  // disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noTitle')}
                  disabled={
                    Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(NODAL_OFFICER_DETAILS, 'noTitle')
                      : true // 🔒 keep disabled for all other statuses
                  }
                >
                  <option value="">Select Title</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms">Ms</option>

                  {/* {titles.map((title: any) => (
                                            <option key={title.code} value={title.name}>
                                                {title.name}
                                            </option>
                                        ))} */}
                </select>
                {formErrors.title && (
                  <span className="error-text">{formErrors.title}</span>
                )}
              </div>
            </div>

            <div
              className="form-row"
              style={{ marginBottom: '-10px', marginTop: '10px' }}
            >
              <div className="form-group">
                <label htmlFor="firstName">
                  First Name<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter First Name"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  // disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noFirstName')}
                  disabled={
                    Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(NODAL_OFFICER_DETAILS, 'noFirstName')
                      : true // 🔒 keep disabled for all other statuses
                  }
                />
                {formErrors.firstName && (
                  <span className="error-text">{formErrors.firstName}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="middleName">Middle Name</label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  placeholder="Enter Middle Name"
                  value={formData.middleName || ''}
                  onChange={handleChange}
                  // disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noMiddleName')}
                  disabled={
                    Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(NODAL_OFFICER_DETAILS, 'noMiddleName')
                      : true // 🔒 keep disabled for all other statuses
                  }
                />
                {formErrors.middleName && (
                  <span className="error-text">{formErrors.middleName}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter Last Name"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  // disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noLastName')}
                  disabled={
                    Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(NODAL_OFFICER_DETAILS, 'noLastName')
                      : true // 🔒 keep disabled for all other statuses
                  }
                />
                {formErrors.lastName && (
                  <span className="error-text">{formErrors.lastName}</span>
                )}
              </div>
            </div>

            <div
              className="form-row"
              style={{ marginBottom: '-10px', marginTop: '10px' }}
            >
              <div className="form-group">
                <label htmlFor="designation">
                  Designation<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  placeholder="Enter  designation"
                  value={formData?.designation || ''}
                  onChange={handleChange}
                  disabled={
                    !isEditableField(NODAL_OFFICER_DETAILS, 'noDesignation')
                  }
                />
                {formErrors.designation && (
                  <span className="error-text">{formErrors.designation}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Enter Email address"
                  value={formData?.email || ''}
                  onChange={handleChange}
                  // disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noEmailId')}
                  disabled={
                    Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(NODAL_OFFICER_DETAILS, 'noEmailId')
                      : true // 🔒 keep disabled for all other statuses
                  }
                />
                {formErrors.email && (
                  <span className="error-text">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Gender<span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  onChange={handleChange}
                  value={formData?.gender || ''}
                  defaultValue="Select Gender"
                  disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noGender')}
                >
                  <option value="">Select Gender</option>
                  {/* <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option> */}
                  {genders.map((gender: { code: string; name: string }) => (
                    <option key={gender.code} value={gender.name}>
                      {gender.name}
                    </option>
                  ))}
                </select>
                {formErrors.gender && (
                  <span className="error-text">{formErrors.gender}</span>
                )}
              </div>
            </div>

            <div
              className="form-row"
              style={{ marginBottom: '-10px', marginTop: '10px' }}
            >
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
                    name="countryCode"
                    value={formData?.countryCode}
                    onChange={handleCountryChange}
                    disabled={
                      Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                        ? !isEditableField(
                            NODAL_OFFICER_DETAILS,
                            'noCountryCode'
                          )
                        : true // 🔒 keep disabled for all other statuses
                    }
                  >
                    <option value="">+00</option>
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
                      htmlFor="select-country"
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
                      {formData.countryName || 'India'}
                    </label>
                  )}
                </div>

                {formErrors.countryCode && (
                  <span
                    className="error-text"
                    style={{ display: 'block', marginTop: '5px' }}
                  >
                    {formErrors.countryCode}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="mobileNumber">
                  Mobile Number<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder="Enter mobile number"
                  value={formData?.mobileNumber || ''}
                  onChange={handleChange}
                  // disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noMobileNo')}
                  disabled={
                    Reinitializestatus === 'REQUEST_FOR_MODIFICATION'
                      ? !isEditableField(NODAL_OFFICER_DETAILS, 'noMobileNo')
                      : true // 🔒 keep disabled for all other statuses
                  }
                />
                {formErrors.mobileNumber && (
                  <span className="error-text">{formErrors.mobileNumber}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="landline">Landline Number</label>
                <input
                  type="text"
                  id="landline"
                  name="landline"
                  placeholder="Enter landline number"
                  value={formData?.landline || ''}
                  onChange={handleChange}
                  disabled={
                    !isEditableField(NODAL_OFFICER_DETAILS, 'noLandline')
                  }
                />
                {formErrors.landline && (
                  <span className="error-text">{formErrors.landline}</span>
                )}
              </div>
            </div>

            <div
              className="form-row"
              style={{ marginBottom: '-20px', marginTop: '10px' }}
            >
              <div className="form-group">
                <label htmlFor="proofOfIdentity">
                  Proof of Identity<span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  id="proofOfIdentity"
                  name="proofOfIdentity"
                  onChange={handleChange}
                  value={formData?.proofOfIdentity || ''}
                  defaultValue="Select proof of identity"
                  disabled={
                    !isEditableField(NODAL_OFFICER_DETAILS, 'noProofOfIdentity')
                  }
                >
                  <option value="">Select proof of identity</option>
                  {/* <option value="AADHAAR">Aadhar</option>
                  <option value="PAN_CARD">Pan</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option> */}
                  {proofOfIdentities.map(
                    (identity: { code: string; name: string }) => (
                      <option key={identity.code} value={identity.code}>
                        {identity.name}
                      </option>
                    )
                  )}
                </select>
                {formErrors.proofOfIdentity && (
                  <span
                    style={{
                      color: 'red',
                      fontFamily: 'Gilroy',
                      fontSize: '12px',
                      marginTop: '4px',
                    }}
                    className="error-text"
                  >
                    {formErrors.proofOfIdentity}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="identityNumber">
                  Proof of Identity Number
                  <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="identityNumber"
                  name="identityNumber"
                  placeholder="Enter proof of identity number"
                  value={formData?.identityNumber || ''}
                  onChange={handleChange}
                  disabled={
                    !isEditableField(NODAL_OFFICER_DETAILS, 'noIdentityNumber')
                  }
                />
                {formErrors.identityNumber && (
                  <span
                    style={{
                      color: 'red',
                      fontFamily: 'Gilroy',
                      fontSize: '12px',
                      marginTop: '4px',
                    }}
                    className="error-text"
                  >
                    {formErrors.identityNumber}
                  </span>
                )}
              </div>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="form-group">
                  <label htmlFor="dob">
                    Date of Birth<span style={{ color: 'red' }}>*</span>
                  </label>
                  <div className="date-input-wrapper">
                    <DatePicker
                      open={open}
                      onOpen={() => setOpen(true)}
                      onClose={() => setOpen(false)}
                      value={
                        formData?.dateOfBirth
                          ? dayjs(formData.dateOfBirth)
                          : null
                      }
                      onChange={(date: any) => {
                        const formatted = date
                          ? dayjs(date).format('YYYY-MM-DD')
                          : '';
                        handleChange({
                          target: { name: 'dateOfBirth', value: formatted },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      maxDate={dayjs()}
                      disabled={
                        !isEditableField(NODAL_OFFICER_DETAILS, 'noDateOfBirth')
                      }
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          readOnly: true, // ✅ Prevent typing
                          id: 'dob',
                          name: 'dateOfBirth',
                          fullWidth: true,
                          size: 'small',
                          error: Boolean(formErrors.dateOfBirth),
                          helperText: formErrors.dateOfBirth || '',
                          placeholder: 'DD/MM/YYYY',
                          sx: {
                            flex: 1,
                            width: {
                              xs: '100%',
                              sm: '400px',
                              md: '500px',
                              lg: '600px',
                            },
                            '& .MuiInputBase-root': { height: '70px' },
                            '& .MuiInputBase-input': {
                              padding: '14px 16px',
                              boxSizing: 'border-box',
                              fontFamily: 'inherit !important',
                            },
                            cursor: !isEditableField(
                              NODAL_OFFICER_DETAILS,
                              'noDateOfBirth'
                            )
                              ? 'not-allowed'
                              : 'pointer',
                          },
                          onClick: () => {
                            // Only allow opening if field is editable
                            if (
                              isEditableField(
                                NODAL_OFFICER_DETAILS,
                                'noDateOfBirth'
                              )
                            ) {
                              setOpen(true);
                            }
                          },
                        },
                      }}
                    />
                    <button
                      type="button"
                      className="calendar-icon-wrapper"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent outer div conflicts
                        // Only allow opening if field is editable
                        if (
                          isEditableField(
                            NODAL_OFFICER_DETAILS,
                            'noDateOfBirth'
                          )
                        ) {
                          setOpen(true);
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: !isEditableField(
                          NODAL_OFFICER_DETAILS,
                          'noDateOfBirth'
                        )
                          ? 'not-allowed'
                          : 'pointer',
                        opacity: !isEditableField(
                          NODAL_OFFICER_DETAILS,
                          'noDateOfBirth'
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
                    </button>
                  </div>
                </div>
              </LocalizationProvider>
            </div>

            <div
              className="form-row"
              style={{ marginBottom: '-30px', marginTop: '-10px' }}
            >
              <div className="form-group">
                <InputLabel id="same-address-label">Office Address</InputLabel>
                <Select
                  style={{ fontFamily: 'inherit' }}
                  labelId="same-address-label"
                  id="same-address-select"
                  name="sameAsRegisteredAddress"
                  value={formData.sameAsRegisteredAddress?.toString() || 'true'} // Default to 'true'
                  onChange={(e) =>
                    handleSelectChange(
                      'sameAsRegisteredAddress',
                      e.target.value
                    )
                  }
                  sx={{ borderRadius: '6px', height: '45px' }}
                  disabled={
                    !isEditableField(
                      NODAL_OFFICER_DETAILS,
                      'noSameAsRegisteredAddress'
                    )
                  }
                >
                  <MenuItem value="true" style={{ fontFamily: 'inherit' }}>
                    Same as entity registered address
                  </MenuItem>
                  <MenuItem value="false" style={{ fontFamily: 'inherit' }}>
                    Same as correspondence address
                  </MenuItem>
                </Select>
              </div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="form-group">
                  <label htmlFor="dateOfBoardResolution">
                    Date of Board Resolution for Appointment
                    <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div className="date-input-wrapper">
                    <DatePicker
                      open={openBoardResolution} // track open state
                      onOpen={() => setOpenBoardResolution(true)}
                      onClose={() => setOpenBoardResolution(false)}
                      value={
                        formData?.dateOfBoardResolution
                          ? dayjs(formData.dateOfBoardResolution)
                          : null
                      }
                      onChange={(date: any) => {
                        const formatted = date
                          ? dayjs(date).format('YYYY-MM-DD')
                          : '';
                        handleChange({
                          target: {
                            name: 'dateOfBoardResolution',
                            value: formatted,
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      maxDate={dayjs()}
                      disabled={
                        !isEditableField(
                          NODAL_OFFICER_DETAILS,
                          'noDateOfBoardResolution'
                        )
                      }
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          readOnly: true, // Prevent typing
                          id: 'dateOfBoardResolution',
                          name: 'dateOfBoardResolution',
                          fullWidth: true,
                          size: 'small',
                          error: Boolean(formErrors.dateOfBoardResolution),
                          helperText: formErrors.dateOfBoardResolution || '',
                          placeholder: 'DD/MM/YYYY',
                          sx: {
                            fontFamily: 'inherit',
                            flex: 1,
                            '& .MuiInputBase-root': {
                              height: '70px',
                              fontFamily: 'inherit',
                            },
                            '& .MuiInputBase-input': {
                              fontFamily: 'inherit',
                              padding: '14px 16px',
                              boxSizing: 'border-box',
                            },
                            '& .MuiFormHelperText-root': {
                              fontFamily: 'inherit',
                            },
                            '& .MuiInputLabel-root': { fontFamily: 'inherit' },
                            cursor: !isEditableField(
                              NODAL_OFFICER_DETAILS,
                              'noDateOfBoardResolution'
                            )
                              ? 'not-allowed'
                              : 'pointer',
                          },
                          onClick: () => {
                            // Only allow opening if field is editable
                            if (
                              isEditableField(
                                NODAL_OFFICER_DETAILS,
                                'noDateOfBoardResolution'
                              )
                            ) {
                              setOpenBoardResolution(true);
                            }
                          },
                        },
                      }}
                    />
                    <button
                      type="button"
                      className="calendar-icon-wrapper"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent outer div conflicts
                        // Only allow opening if field is editable
                        if (
                          isEditableField(
                            NODAL_OFFICER_DETAILS,
                            'noDateOfBoardResolution'
                          )
                        ) {
                          setOpenBoardResolution(true);
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: !isEditableField(
                          NODAL_OFFICER_DETAILS,
                          'noDateOfBoardResolution'
                        )
                          ? 'not-allowed'
                          : 'pointer',
                        opacity: !isEditableField(
                          NODAL_OFFICER_DETAILS,
                          'noDateOfBoardResolution'
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
                    </button>
                  </div>
                </div>
              </LocalizationProvider>

              <div className="form-group">
                <label htmlFor="license-upload">
                  Board Resolution<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="file"
                  id="license-upload"
                  name="no_board_resolution"
                  // onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                  onChange={handleFileSelection}
                  className="hidden-upload"
                  disabled={
                    !isEditableField(NODAL_OFFICER_DETAILS, 'noBoardResolution')
                  }
                />
                <div className="input-with-preview">
                  <label htmlFor="license-upload" className="upload-doc-btn">
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
                        transform: 'translateY(4px)',
                      }}
                    >
                      Upload
                    </span>
                  </label>
                  {formData.no_board_resolutionPreview && (
                    <div
                      className="preview-box"
                      style={{ marginBottom: '5px' }}
                    >
                      <div
                        onClick={() => setIsBoardResolutionModalOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ')
                            setIsBoardResolutionModalOpen(true);
                        }}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={formData.no_board_resolutionPreview}
                          alt="Board Resolution Preview"
                          className="preview-img"
                        />
                      </div>
                      <span className="tick-icon">
                        <CheckCircleIcon />
                      </span>
                    </div>
                  )}
                </div>
                {formErrors.no_board_resolution && (
                  <span
                    style={{
                      color: 'red',
                      fontFamily: 'gilroy',
                      fontSize: '12px',
                    }}
                    className="error-text"
                  >
                    {formErrors.no_board_resolution}
                  </span>
                )}
              </div>

              {/* Preview Confirmation Modal */}
              {/* <PreviewConfirmationModal
  isOpen={isPreviewConfirmationOpen}
  onClose={() => {
    setIsPreviewConfirmationOpen(false);
    setPendingFile(null);
    setPendingPreviewUrl(null);
  }}
  imageUrl={pendingPreviewUrl}
  altText="Document Preview"
  onConfirm={handleConfirmFile}
  onCancel={() => {
    setIsPreviewConfirmationOpen(false);
    setPendingFile(null);
    setPendingPreviewUrl(null);
  }}
/> */}
              {/* Single Preview Confirmation Modal for all file types */}
              <PreviewConfirmationModal
                isOpen={isPreviewConfirmationOpen}
                onClose={handleCancelFile}
                imageUrl={pendingPreviewUrl}
                altText="Document Preview"
                onConfirm={handleConfirmFile}
                onCancel={handleCancelFile}
              />

              {/* Use the reusable modal */}
              <ReusableModal
                isOpen={isBoardResolutionModalOpen}
                onClose={() => setIsBoardResolutionModalOpen(false)}
                imageUrl={formData.no_board_resolutionPreview}
                altText="Board Resolution Preview"
                onFileChange={handleFileSelection} // Changed to new handler
                inputId="license-upload-modal"
                inputName="no_board_resolution"
                disabled={
                  !isEditableField(NODAL_OFFICER_DETAILS, 'noBoardResolution')
                }
              />
            </div>

            <div
              className="form-row"
              style={{ marginBottom: '-20px', marginTop: '13px' }}
            >
              <div className="form-group">
                <label htmlFor="proff" style={{ font: 'small-caption' }}>
                  Certified copy of proof of Identity Document
                  <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="file"
                  id="poi-upload"
                  name="no_certified_poi"
                  // onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg"
                  onChange={handleFileSelection}
                  className="hidden-upload"
                  disabled={
                    !isEditableField(NODAL_OFFICER_DETAILS, 'noCertifiedPoi')
                  }
                  // required={isEditableField('entityDetails', 'nameOfInstitution')}
                />
                <div className="input-with-preview">
                  <label htmlFor="poi-upload" className="upload-doc-btn">
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
                        transform: 'translateY(4px)' /* Fine-tune as needed */,
                      }}
                    >
                      Upload
                    </span>
                  </label>
                  {formData.no_certified_poiPreview && (
                    <div
                      className="preview-box"
                      style={{ marginBottom: '5px' }}
                    >
                      <img
                        src={formData.no_certified_poiPreview}
                        alt="PAN Preview"
                        className="preview-img"
                        onClick={() => setIsPoiModalOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ')
                            setIsPoiModalOpen(true);
                        }}
                        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                      />
                      <span className="tick-icon">
                        <CheckCircleIcon />
                      </span>
                    </div>
                  )}
                </div>
                {formErrors.no_certified_poi && (
                  <span
                    style={{
                      color: 'red',
                      fontFamily: 'gilroy',
                      fontSize: '12px',
                    }}
                    className="error-text"
                  >
                    {formErrors.no_certified_poi}
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

              {/* POI Modal */}
              <ReusableModal
                isOpen={isPoiModalOpen}
                onClose={() => setIsPoiModalOpen(false)}
                imageUrl={formData.no_certified_poiPreview}
                altText="POI Preview"
                onFileChange={handleFileSelection}
                inputId="poi-upload-modal"
                inputName="no_certified_poi"
                disabled={
                  !isEditableField(NODAL_OFFICER_DETAILS, 'noCertifiedPoi')
                }
              />

              <div className="form-group">
                <label
                  htmlFor="poidentity-upload"
                  style={{ font: 'small-caption' }}
                >
                  Certified copy of photo Identity Card
                  <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="file"
                  id="poidentity-upload"
                  name="no_certified_photoIdentity"
                  // onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                  onChange={handleFileSelection} // Uses handleChange
                  className="hidden-upload"
                  disabled={
                    !isEditableField(
                      NODAL_OFFICER_DETAILS,
                      'noCertifiedPhotoIdentity'
                    )
                  }
                />
                <div className="input-with-preview">
                  <label htmlFor="poidentity-upload" className="upload-doc-btn">
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
                        transform: 'translateY(4px)' /* Fine-tune as needed */,
                      }}
                    >
                      Upload
                    </span>
                  </label>
                  {formData.no_certified_photoIdentityPreview && (
                    <div
                      className="preview-box"
                      style={{ marginBottom: '5px' }}
                    >
                      <div
                        onClick={() => setIsPhotoIdentityModalOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ')
                            setIsPhotoIdentityModalOpen(true);
                        }}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={formData.no_certified_photoIdentityPreview}
                          alt="PAN Preview"
                          className="preview-img"
                        />
                      </div>
                      <span className="tick-icon">
                        <CheckCircleIcon />
                      </span>
                    </div>
                  )}
                </div>

                {formErrors.no_certified_photoIdentity && (
                  <span
                    style={{
                      color: 'red',
                      fontFamily: 'gilroy',
                      fontSize: '12px',
                    }}
                    className="error-text"
                  >
                    {formErrors.no_certified_photoIdentity}
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
              {/* Photo Identity Modal */}
              <ReusableModal
                isOpen={isPhotoIdentityModalOpen}
                onClose={() => setIsPhotoIdentityModalOpen(false)}
                imageUrl={formData.no_certified_photoIdentityPreview}
                altText="Photo Identity Preview"
                onFileChange={handleFileSelection}
                inputId="poidentity-upload-modal"
                inputName="no_certified_photoIdentity"
                disabled={
                  !isEditableField(
                    NODAL_OFFICER_DETAILS,
                    'noCertifiedPhotoIdentity'
                  )
                }
              />

              {/* <div className="form-group">

              <label>
                 Employee Code
                </label>
                <input
                  type="text"
                  name="employeeCode"
                  placeholder="Enter Employee Code"
                  value={formData?.employeeCode || ""}
                  onChange={handleChange}
                  // disabled={!isEditableField(NODAL_OFFICER_DETAILS, 'noMobileNo')}
                  disabled={
                    Reinitializestatus === "REQUEST_FOR_MODIFICATION"
                      ? !isEditableField("nodalOfficerDetails", "noemployeeCode")
                      : true // 🔒 keep disabled for all other statuses
                  }
                />
                {formErrors.employeeCode && (
                  <span className="error-text">{formErrors.employeeCode}</span>
                )}
              </div> */}
              <div className="form-group"></div>
            </div>

            <div className="form-footer">
              {/* <button type="submit" className="validate-btn" onClick={handleValidate} disabled={isValidateDisabled} >Validate</button> */}
              <button
                type="submit"
                className="submit-nodal-btn"
                disabled={!isFormValid || isViewOnlyNodal}
                style={{
                  backgroundColor:
                    isFormValid && !isViewOnlyNodal ? '#002CBA' : '#CCCCCC',
                  cursor:
                    isFormValid && !isViewOnlyNodal ? 'pointer' : 'not-allowed',
                }}
              >
                Save & Next
              </button>
            </div>
            {nodalError?.fieldErrors &&
              Object.keys(nodalError.fieldErrors).length > 0 && (
                <div
                  className="error-message-nodal"
                  style={{ color: 'red', marginTop: '10px', textAlign: 'left' }}
                >
                  {Object.values(nodalError.fieldErrors)[0]}
                </div>
              )}
          </form>
        </div>
      </div>
    </>
  );
};

export default NodalOfficerDetails;
