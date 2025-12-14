/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  markStepCompleted,
  setCurrentStep,
} from '../../../../redux/slices/registerSlice/applicationSlice';
import './update.css';
import { adminDetailsSchema } from '../../../../component/validation/EntityProfileForm';
import SuccessModal from '../../../register/SuccessModalOkay/successModal';
import { fetchCkycDetailsUpdate } from '../../../../redux/slices/updateProfileSlice/updateNodalOfficerSlice';
import AccordionDetails from '@mui/material/AccordionDetails';
import SelectTag from '../../../form/SelecTag';
import {
  Select,
  Typography,
  FormControl,
  Box,
  Button,
  SelectChangeEvent,
  MenuItem,
  FormHelperText,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import uploadIconBox from '../../../../assets/uploadIconBox.png';
import {
  fetchUpdateAdminDetails,
  submitInstituteAdminUpdateDetails,
} from '../../../../redux/slices/updateProfileSlice/updateInstituteAdminSlice';
import {
  fetchDropdownMasters,
  fetchGeographyHierarchy,
} from '../../../../redux/slices/registerSlice/masterSlice';
import FileTag from '../../../form/FileTag';
import {
  hideLoader,
  showLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import { sendOtp } from '../../Authenticate/slice/passSetupOtpSlice';

import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  labelStyles,
  inputStyles,
  selectStyles,
  titleStyles,
} from './RegionCreationRequest.style';
import {
  AdminFormValues,
  AdminsForm,
} from './types/UpdateInstitutionalAdminDetails';
interface DocumentType {
  documentType: string;
  base64Content: string;
  fileName: string;
}
import BreadcrumbUpdateProfile from './BreadcrumbUpdateProfile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DateTag from '../../../form/DateTag';
import CkycUpdateVerifyModal from './CkycUpdateVerfiyModal';
import OTPModalUpdate from './OtpModalUpdate';
import * as Yup from 'yup';
import {
  EntityFormContainer,
  StyledAccordion,
  StyledAccordionDetails,
  StyledAccordionSummary,
} from './UpdateProfileAddressDetails.style';
import ApplicationStepperUpdate from './ApplicationStepperUpdate';
import { KeyboardArrowDown } from '@mui/icons-material';
import { Country, District, State } from './types/UpdateProfileAddressDetails';
const UpdateInstitutionalAdminDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { authToken } = useSelector((state: RootState) => state.auth);
  const { adminOneDetails, adminTwoDetails, documents } = useSelector(
    (state: RootState) => state.instituteAdmin
  );
  const {
    genders,
    citizenships,
    proofOfIdentities,
    titles,
    geographyHierarchy,
  } = useSelector((state: RootState) => state.masters);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regulatorLicencePreview, setRegulatorLicencePreview] = useState<
    string | null
  >(null);
  const [addressProofDoc, setaddressProofDoc] = useState<DocumentType | null>(
    null
  );
  const [regulatorLicenceDoc, setRegulatorLinceDoc] =
    useState<DocumentType | null>(null);
  const [photoIdentityDoc, setPhontoIdentityDoc] =
    useState<DocumentType | null>(null);
  const [editAccessOne, setEditAccessOne] = useState(false);
  const [editAccessTwo, setEditAccessTwo] = useState(false);
  const [regulatorLicenceTwoPreview, setRegulatorLicenceTwoPreview] = useState<
    string | null
  >(null);
  const [addressProofPreview, setAddressProofPreview] = useState<string | null>(
    null
  );
  const [addressProofTwoPreview, setAddressProofTwoPreview] = useState<
    string | null
  >(null);
  const [addressProofTwoDoc, setaddressProofTwoDoc] =
    useState<DocumentType | null>(null);
  const [regulatorLicenceTwoDoc, setRegulatorLinceTwoDoc] =
    useState<DocumentType | null>(null);
  const [photoIdentityTwoDoc, setPhontoIdentityTwoDoc] =
    useState<DocumentType | null>(null);
  const navigate = useNavigate();
  const [isOTPModalOpen1, setOTPModalOpen1] = useState(false);
  const [isOTPModalOpen2, setOTPModalOpen2] = useState(false);
  const [isMobileVerfied1, setIsMobileVerfied1] = useState(true);
  const [isEmailVerfied1, setIsEmailVerfied1] = useState(true);
  const [isMobileVerfied2, setIsMobileVerfied2] = useState(true);
  const [isEmailVerfied2, setIsEmailVerfied2] = useState(true);
  const [isSuccessModalOpen1, setSuccessModalOpen1] = useState(false);
  const [isSuccessModalOpen2, setSuccessModalOpen2] = useState(false);
  const [otpIdentifier1, setotpIdentifier1] = useState<string | undefined>();
  const [isCkycOTPModalOpen1, setCkycOTPModalOpen1] = useState(false);
  const [isVerified1, setIsVerified1] = useState(false);
  const [otpIdentifier2, setotpIdentifier2] = useState<string | undefined>();
  const [isCkycOTPModalOpen2, setCkycOTPModalOpen2] = useState(false);
  const [isVerified2, setIsVerified2] = useState(false);
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
  };
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [adminTwoStates, setAdminTwoStates] = useState<State[]>([]);
  const [adminTwoDist, setAdminTwoDist] = useState<District[]>([]);
  const [adminTwoPincodes, setAdminTwoPincodes] = useState<string[]>([]);
  const formik = useFormik<AdminsForm>({
    initialValues: {
      adminOneDetails: {
        authorizationLetterDetails: '',
        citizenship: '',
        ckycNumber: '',
        countryCode: '',
        dateOfAuthorization: '',
        dateOfBirth: '',
        designation: '',
        emailId: '',
        employeeCode: '',
        firstName: '',
        gender: '',
        identityNumber: '',
        landline: '',
        lastName: '',
        middleName: '',
        mobileNo: '',
        proofOfIdentity: '',
        sameAsRegisteredAddress: false,
        title: '',
        countryName: '',
        photoIdentity: '' as string | File,
        addressProof: '' as string | File,
        regulatorLicence: '' as string | File,
        addressLine1: 'Times Tower,1st Floor',
        addressLine2: 'Kamala Mills Compound',
        addressLine3: 'Lower Parel, Mumbai',
        country: 'Indian',
        state: 'Maharashtra',
        district: 'Mumbai',
        city: 'Mumbai',
        pincode: '400013',
        digipin: '',
      },
      adminTwoDetails: {
        authorizationLetterDetails: '',
        citizenship: '',
        ckycNumber: '',
        countryCode: '',
        dateOfAuthorization: '',
        dateOfBirth: '',
        designation: '',
        emailId: '',
        employeeCode: '',
        firstName: '',
        gender: '',
        identityNumber: '',
        landline: '',
        lastName: '',
        middleName: '',
        mobileNo: '',
        proofOfIdentity: '',
        sameAsRegisteredAddress: false,
        title: '',
        countryName: '',
        photoIdentity: '' as string | File,
        addressProof: '' as string | File,
        regulatorLicence: '' as string | File,
        addressLine1: 'Times Tower,1st Floor',
        addressLine2: 'Kamala Mills Compound',
        addressLine3: 'Lower Parel, Mumbai',
        country: 'Indian',
        state: 'Maharashtra',
        district: 'Mumbai',
        city: 'Mumbai',
        pincode: '400013',
        digipin: '',
      },
    },
    validationSchema:
      editAccessOne || editAccessTwo
        ? adminDetailsSchema
        : Yup.object().shape({}),
    onSubmit: async (values) => {
      console.log('onSubmit', values);
      try {
        if (editAccessOne || editAccessTwo) {
          const submitData = {
            adminOne: {
              title: values.adminOneDetails.title,
              firstName: values.adminOneDetails.firstName,
              middleName: values.adminOneDetails.middleName,
              lastName: values.adminOneDetails.lastName,
              designation: values.adminOneDetails.designation,
              emailId: values.adminOneDetails.emailId,
              ckycNumber: values.adminOneDetails.ckycNumber,
              gender: values.adminOneDetails.gender,
              citizenship: values.adminOneDetails.citizenship,
              countryCode: values.adminOneDetails.countryCode,
              mobileNo: values.adminOneDetails.mobileNo,
              landline: values.adminOneDetails.landline,
              proofOfIdentity: values.adminOneDetails.proofOfIdentity,
              identityNumber: values.adminOneDetails.identityNumber,
              dateOfBirth: values.adminOneDetails.dateOfBirth,
              employeeCode: values.adminOneDetails.employeeCode,
              sameAsRegisteredAddress:
                values.adminOneDetails.sameAsRegisteredAddress,
              authorizationLetterDetails: 'Authorized+by+Board',
              dateOfAuthorization: values.adminOneDetails.dateOfAuthorization,
            },
            adminTwo: {
              title: values.adminTwoDetails.title,
              firstName: values.adminTwoDetails.firstName,
              middleName: values.adminTwoDetails.middleName,
              lastName: values.adminTwoDetails.lastName,
              designation: values.adminTwoDetails.designation,
              emailId: values.adminTwoDetails.emailId,
              ckycNumber: values.adminTwoDetails.ckycNumber,
              gender: values.adminTwoDetails.gender,
              citizenship: values.adminTwoDetails.citizenship,
              countryCode: values.adminTwoDetails.countryCode,
              mobileNo: values.adminTwoDetails.mobileNo,
              landline: values.adminTwoDetails.landline,
              proofOfIdentity: values.adminTwoDetails.proofOfIdentity,
              identityNumber: values.adminTwoDetails.identityNumber,
              dateOfBirth: values.adminTwoDetails.dateOfBirth,
              employeeCode: values.adminTwoDetails.employeeCode,
              sameAsRegisteredAddress:
                values.adminTwoDetails.sameAsRegisteredAddress,
              authorizationLetterDetails: 'Authorized+by+Board',
              dateOfAuthorization: values.adminTwoDetails.dateOfAuthorization,
            },
            updateState:
              editAccessOne && editAccessTwo
                ? 'BOTH'
                : editAccessOne
                  ? 'ADMIN_ONE'
                  : editAccessTwo
                    ? 'ADMIN_TWO'
                    : '',
            iau_one_certified_poi: values.adminOneDetails.addressProof,
            iau_one_certified_photoIdentity:
              values.adminOneDetails.photoIdentity,
            iau_one_authorization_letter:
              values.adminOneDetails.regulatorLicence,
            iau_two_certified_poi: values.adminTwoDetails.addressProof,
            iau_two_certified_photoIdentity:
              values.adminTwoDetails.photoIdentity,
            iau_two_authorization_letter:
              values.adminTwoDetails.regulatorLicence,
          };
          const res = await dispatch(
            submitInstituteAdminUpdateDetails(submitData)
          ).unwrap();
          if (res.success) {
            // Only update step and navigate if submission is successful
            dispatch(markStepCompleted(4));
            dispatch(setCurrentStep(5));
            navigate('/re/update-preview-details');
          } else {
            // Handle submission failure - don't update step
            console.error('Submission failed:', res.message);
            // You might want to show an error message to the user here
          }
        } else {
          // No edits made, just proceed to next step
          dispatch(markStepCompleted(4));
          dispatch(setCurrentStep(5));
          navigate('/re/update-preview-details');
        }
      } catch (error) {
        console.error('Nodal officer submission failed:', error);
      }
    },
  });
  const isIndianCitizenShip1 =
    formik.values.adminOneDetails.citizenship === 'Indian';
  const isIndianCitizenShip2 =
    formik.values.adminTwoDetails.citizenship === 'Indian';
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(showLoader('Please wait...'));
        dispatch(fetchUpdateAdminDetails({ token: authToken }));
        dispatch(fetchDropdownMasters());
        dispatch(fetchGeographyHierarchy());
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        dispatch(hideLoader());
      }
    };
    fetchData();
  }, [dispatch, authToken]);

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

  useEffect(() => {
    // Convert base64 to File objects if documents exist
    let addressProofFile: File | null = null;
    let certifiedRegulatorFile: File | null = null;
    let photoIdentityFile: File | null = null;
    let addressProofTwoFile: File | null = null;
    let certifiedRegulatorTwoFile: File | null = null;
    let photoIdentityTwoFile: File | null = null;
    if (!editAccessOne && !editAccessTwo && documents.length > 0) {
      // Find specific documents
      const addressProof = documents.find(
        (doc: DocumentType) => doc.documentType === 'IAU_ONE_CERTIFIED_POI'
      );
      const certifiedRegulator = documents.find(
        (doc: DocumentType) =>
          doc.documentType === 'IAU_ONE_AUTHORIZATION_LETTER'
      );
      const photoIdentity = documents.find(
        (doc: DocumentType) =>
          doc.documentType === 'IAU_ONE_CERTIFIED_PHOTO_IDENTITY'
      );
      const addressTwoProof = documents.find(
        (doc: DocumentType) => doc.documentType === 'IAU_TWO_CERTIFIED_POI'
      );
      const certifiedTwoRegulator = documents.find(
        (doc: DocumentType) =>
          doc.documentType === 'IAU_TWO_AUTHORIZATION_LETTER'
      );
      const photoTwoIdentity = documents.find(
        (doc: DocumentType) =>
          doc.documentType === 'IAU_TWO_CERTIFIED_PHOTO_IDENTITY'
      );
      if (addressProof) setaddressProofDoc(addressProof);
      if (certifiedRegulator) {
        setRegulatorLinceDoc(certifiedRegulator);
      }
      if (photoIdentity) {
        setPhontoIdentityDoc(photoIdentity);
      }
      if (addressTwoProof) setaddressProofTwoDoc(addressTwoProof);
      if (certifiedTwoRegulator) {
        setRegulatorLinceTwoDoc(certifiedTwoRegulator);
      }
      if (photoTwoIdentity) {
        setPhontoIdentityTwoDoc(photoTwoIdentity);
      }
      if (addressProofDoc) {
        addressProofFile = base64ToFile(addressProofDoc);
      }
      if (regulatorLicenceDoc) {
        certifiedRegulatorFile = base64ToFile(regulatorLicenceDoc);
      }
      if (photoIdentityDoc) {
        photoIdentityFile = base64ToFile(photoIdentityDoc);
      }
      if (addressProofTwoDoc) {
        addressProofTwoFile = base64ToFile(addressProofTwoDoc);
      }
      if (regulatorLicenceTwoDoc) {
        certifiedRegulatorTwoFile = base64ToFile(regulatorLicenceTwoDoc);
      }
      if (photoIdentityTwoDoc) {
        photoIdentityTwoFile = base64ToFile(photoIdentityTwoDoc);
      }
    }

    if (
      !editAccessOne &&
      !editAccessTwo &&
      adminOneDetails &&
      adminTwoDetails &&
      proofOfIdentities.length > 0
    ) {
      const matchedProof = proofOfIdentities.find(
        (opt) =>
          opt.code.toLowerCase() ===
          (adminOneDetails.proofOfIdentity || '').toLowerCase()
      );
      formik.setValues({
        adminOneDetails: {
          authorizationLetterDetails:
            adminOneDetails.authorizationLetterDetails || '',
          citizenship: adminOneDetails.citizenship || '',
          ckycNumber: adminOneDetails.ckycNumber || '',
          countryCode: adminOneDetails.countryCode || '+91',
          dateOfAuthorization: adminOneDetails.dateOfAuthorization || '',
          dateOfBirth: adminOneDetails.dateOfBirth || '',
          designation: adminOneDetails.designation || '',
          emailId: adminOneDetails.emailId || '',
          employeeCode: adminOneDetails.employeeCode || '',
          firstName: adminOneDetails.firstName || '',
          gender: adminOneDetails.gender || '',
          identityNumber: adminOneDetails.identityNumber || '',
          landline: adminOneDetails.landline || '',
          lastName: adminOneDetails.lastName || '',
          middleName: adminOneDetails.middleName || '',
          mobileNo: adminOneDetails.mobileNo || '',
          proofOfIdentity: matchedProof ? matchedProof.code : '',
          sameAsRegisteredAddress:
            adminOneDetails.sameAsRegisteredAddress || false,
          title: adminOneDetails.title || '',
          countryName: '',
          //document
          photoIdentity: photoIdentityFile || '',
          addressProof: addressProofFile || '',
          regulatorLicence: certifiedRegulatorFile || '',
          addressLine1: 'Times Tower,1st Floor',
          addressLine2: 'Kamala Mills Compound',
          addressLine3: 'Lower Parel, Mumbai',
          country: 'Indian',
          state: 'Maharashtra',
          district: 'Mumbai',
          city: 'Mumbai',
          pincode: '400013',
          digipin: '',
        },
        adminTwoDetails: {
          authorizationLetterDetails:
            adminTwoDetails.authorizationLetterDetails || '',
          citizenship: adminTwoDetails.citizenship || '',
          ckycNumber: adminTwoDetails.ckycNumber || '',
          countryCode: adminTwoDetails.countryCode || '+91',
          dateOfAuthorization: adminTwoDetails.dateOfAuthorization || '',
          dateOfBirth: adminTwoDetails.dateOfBirth || '',
          designation: adminTwoDetails.designation || '',
          emailId: adminTwoDetails.emailId || '',
          employeeCode: adminTwoDetails.employeeCode || '',
          firstName: adminTwoDetails.firstName || '',
          gender: adminTwoDetails.gender || '',
          identityNumber: adminTwoDetails.identityNumber || '',
          landline: adminTwoDetails.landline || '',
          lastName: adminTwoDetails.lastName || '',
          middleName: adminTwoDetails.middleName || '',
          mobileNo: adminTwoDetails.mobileNo || '',
          proofOfIdentity: matchedProof ? matchedProof.code : '',
          sameAsRegisteredAddress:
            adminTwoDetails.sameAsRegisteredAddress || false,
          title: adminTwoDetails.title || '',
          countryName: '',
          //document
          photoIdentity: photoIdentityTwoFile || '',
          addressProof: addressProofTwoFile || '',
          regulatorLicence: certifiedRegulatorTwoFile || '',
          addressLine1: 'Times Tower,1st Floor',
          addressLine2: 'Kamala Mills Compound',
          addressLine3: 'Lower Parel, Mumbai',
          country: 'Indian',
          state: 'Maharashtra',
          district: 'Mumbai',
          city: 'Mumbai',
          pincode: '400013',
          digipin: '',
        },
      });
      setIsVerified1(true);
      setIsVerified2(true);
    }
  }, [documents, adminOneDetails, adminTwoDetails]);

  useEffect(() => {
    if (geographyHierarchy?.length) {
      const transformedCountries = geographyHierarchy.map((country) => ({
        name: country.name,
        code: country.code,
        dial_code: country.countryCode,
      }));
      setCountries(transformedCountries);
      if (countries.length > 0) {
        const selectedCountryOne = transformedCountries.find(
          (c) => c.dial_code === formik.values.adminOneDetails.countryCode
        );

        const selectedCountryTwo = transformedCountries.find(
          (c) => c.dial_code === formik.values.adminTwoDetails.countryCode
        );
        formik.setValues({
          ...formik.values,
          adminOneDetails: {
            ...formik.values.adminOneDetails,
            countryCode: selectedCountryOne?.dial_code || '',
            countryName: selectedCountryOne?.name || '',
          },
          adminTwoDetails: {
            ...formik.values.adminTwoDetails,
            countryCode: selectedCountryTwo?.dial_code || '',
            countryName: selectedCountryTwo?.name || '',
          },
        });
      }
    }
  }, [geographyHierarchy]);

  const handleCountryChange = (
    e: SelectChangeEvent<string>,
    adminKey: 'adminOneDetails' | 'adminTwoDetails'
  ) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find((c) => c.dial_code === selectedCode);

    formik.setValues({
      ...formik.values,
      [adminKey]: {
        ...formik.values[adminKey],
        countryCode: selectedCode,
        countryName: selectedCountry ? selectedCountry.name : '',
      },
    });
  };

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    type?: string,
    docNum?: number
  ) => {
    const file = event.currentTarget.files?.[0];
    console.log('document here', file, docNum);
    if (file) {
      if (type == 'address' && docNum == 1) {
        formik.setFieldValue('adminOneDetails.addressProof', file);
        formik.setFieldValue('adminTwoDetails.addressProof', file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setAddressProofPreview(e.target?.result as string);
        };
        setaddressProofDoc(null);
      } else if (type == 'photo' && docNum == 1) {
        formik.setFieldValue('adminOneDetails.photoIdentity', file);
        formik.setFieldValue('adminTwoDetails.photoIdentity', file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        setPhontoIdentityDoc(null);
      } else if (type == 'licence' && docNum == 1) {
        formik.setFieldValue('adminOneDetails.regulatorLicence', file);
        formik.setFieldValue('adminTwoDetails.regulatorLicence', file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setRegulatorLicencePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setRegulatorLinceDoc(null);
      } else if (type == 'address' && docNum == 2) {
        formik.setFieldValue('adminTwoDetails.addressProof', file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          setAddressProofTwoPreview(e.target?.result as string);
        };
        setaddressProofTwoDoc(null);
      } else if (type == 'photo' && docNum == 2) {
        formik.setFieldValue('adminTwoDetails.photoIdentity', file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        setPhontoIdentityTwoDoc(null);
      } else if (type == 'licence' && docNum == 2) {
        formik.setFieldValue('adminTwoDetails.regulatorLicence', file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setRegulatorLicenceTwoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setRegulatorLinceTwoDoc(null);
      }
    }
  };

  const handleNewNodalAdd = (admin: number) => {
    const initialAdminValues: AdminFormValues = {
      authorizationLetterDetails: '',
      citizenship: '',
      ckycNumber: '',
      countryCode: '+91',
      dateOfAuthorization: '',
      dateOfBirth: '',
      designation: '',
      emailId: '',
      employeeCode: '',
      firstName: '',
      gender: '',
      identityNumber: '',
      landline: '',
      lastName: '',
      middleName: '',
      mobileNo: '',
      proofOfIdentity: '',
      sameAsRegisteredAddress: false,
      title: '',
      countryName: '',
      photoIdentity: '' as string | File,
      addressProof: '' as string | File,
      regulatorLicence: '' as string | File,
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      country: '',
      state: '',
      district: '',
      city: '',
      pincode: '',
      digipin: '',
    };

    if (admin === 1) {
      formik.setValues({
        adminOneDetails: initialAdminValues,
        adminTwoDetails: formik.values.adminTwoDetails, // preserve adminTwo
      });
      setEditAccessOne(true);
      setaddressProofDoc(null);
      setPhontoIdentityDoc(null);
      setRegulatorLinceDoc(null);
      setIsVerified1(false);
      setIsEmailVerfied1(false);
      setIsMobileVerfied1(false);
    }

    if (admin === 2) {
      console.log('enterd 2');
      formik.setValues({
        adminOneDetails: formik.values.adminOneDetails,
        adminTwoDetails: initialAdminValues,
      });
      setEditAccessTwo(true);
      setaddressProofTwoDoc(null);
      setPhontoIdentityTwoDoc(null);
      setRegulatorLinceTwoDoc(null);
      setIsVerified2(false);
      setIsEmailVerfied2(false);
      setIsMobileVerfied2(false);
    }
  };

  const handleValidate = async (validateType: number) => {
    const adminDetails =
      validateType === 1
        ? formik.values.adminOneDetails
        : validateType === 2
          ? formik.values.adminTwoDetails
          : null;

    if (!adminDetails) {
      alert('Invalid validation type');
      return;
    }

    if (!adminDetails.mobileNo || !adminDetails.emailId) {
      alert('Missing email or mobile No.');
      return;
    }

    try {
      dispatch(showLoader('Please Wait...'));
      const result = await dispatch(
        sendOtp({
          emailId: adminDetails.emailId || '',
          mobileNo: adminDetails.mobileNo || '',
          token: authToken ? authToken : '',
        })
      );

      if (sendOtp.fulfilled.match(result)) {
        if (validateType == 1) {
          console.log('entered 11');
          setOTPModalOpen1(true);
          //setEditAccessOne(false);
        }
        if (validateType == 2) {
          setOTPModalOpen2(true);
          //setEditAccessTwo(false);
        }
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
  const handleOkay = (admnType: number) => {
    if (admnType == 1) {
      setSuccessModalOpen1(false);
      //setIsOtpVerified(true);
      setIsEmailVerfied1(true);
      setIsMobileVerfied1(true);
    }
    if (admnType == 2) {
      setSuccessModalOpen2(false);
      //setIsOtpVerified(true);
      setIsEmailVerfied2(true);
      setIsMobileVerfied2(true);
    }
  };

  const handleCountryChangeAdd = (
    event: SelectChangeEvent<string>,
    adminType: 'adminOneDetails' | 'adminTwoDetails'
  ) => {
    const dial = event.target.value;
    const selectedCountry =
      adminType === 'adminOneDetails'
        ? countries.find((c) => c.name === dial)
        : countries.find((c) => c.name === dial);

    if (!selectedCountry) {
      setStates([]);
      setDistricts([]);
      setPincodes([]);
      setAdminTwoStates([]);
      setAdminTwoDist([]);
      setAdminTwoPincodes([]);
      formik.setFieldValue(`${adminType}.country`, '');
      formik.setFieldValue(`${adminType}.state`, '');
      formik.setFieldValue(`${adminType}.district`, '');
      formik.setFieldValue(`${adminType}.pincode`, '');
      return;
    }
    if (!selectedCountry || !selectedCountry.states) {
      return;
    }
    const transformed: State[] = selectedCountry.states.map((st) => ({
      code: st.value,
      name: st.label,
      districts: st.districts.map((d) => ({
        label: d.label,
        value: d.value,
        pincodes: d.pincodes,
      })),
    }));
    if (adminType === 'adminOneDetails') {
      setStates(transformed);
      setDistricts([]);
      setPincodes([]);
    } else {
      setAdminTwoStates(transformed);
      setAdminTwoDist([]);
      setAdminTwoPincodes([]);
    }
    formik.setFieldValue(`${adminType}.country`, selectedCountry.name);
    formik.setFieldValue(`${adminType}.state`, '');
    formik.setFieldValue(`${adminType}.district`, '');
    formik.setFieldValue(`${adminType}.pincode`, '');
  };
  const isIndiaAdd = (countryName: string | undefined) =>
    countryName === 'Indian';

  const handleStateChange = (
    event: SelectChangeEvent<string>,
    adminType: 'adminOneDetails' | 'adminTwoDetails'
  ) => {
    const stateName = event.target.value;
    const sel =
      adminType === 'adminOneDetails'
        ? states.find((s) => s.name === stateName)
        : adminTwoStates.find((s) => s.name === stateName);
    if (!sel) {
      setDistricts([]);
      setPincodes([]);
      setAdminTwoDist([]);
      setAdminTwoPincodes([]);
      formik.setFieldValue(`${adminType}.state`, '');
      formik.setFieldValue(`${adminType}.district`, '');
      formik.setFieldValue(`${adminType}.pincode`, '');
      return;
    }

    if (adminType === 'adminOneDetails') {
      setDistricts(sel.districts || []);
      setPincodes([]);
    } else {
      setAdminTwoDist(sel.districts || []);
      setAdminTwoPincodes([]);
    }

    formik.setFieldValue(`${adminType}.state`, sel.name);
    formik.setFieldValue(`${adminType}.district`, '');
    formik.setFieldValue(`${adminType}.pincode`, '');
  };

  const handleDistrictChange = (
    event: SelectChangeEvent<string>,
    adminType: 'adminOneDetails' | 'adminTwoDetails'
  ) => {
    const districtName = event.target.value;
    const sel =
      adminType === 'adminOneDetails'
        ? districts.find((s) => s.value === districtName)
        : adminTwoDist.find((s) => s.value === districtName);

    if (!sel) {
      setPincodes([]);
      setAdminTwoPincodes([]);
      formik.setFieldValue(`${adminType}.district`, '');
      formik.setFieldValue(`${adminType}.pincode`, '');
      return;
    }
    if (adminType === 'adminOneDetails') {
      setPincodes(sel.pincodes || []);
    } else {
      setAdminTwoPincodes(sel.pincodes || []);
    }
    formik.setFieldValue(`${adminType}.district`, sel.value);
    formik.setFieldValue(`${adminType}.pincode`, '');
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#fefefeff' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ cursor: 'pointer' }}>
          <ArrowBackIcon fontSize="small" /> Back
        </Typography>
      </Box>
      <BreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'Update Profile', href: '/' },
          { label: 'Entity Profile' },
        ]}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'center',
          mt: 3,
          ml: 0.5,
        }}
      >
        <Typography
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: {
              xs: '0.9rem',
              sm: '1.05rem',
              md: '1.15rem',
              lg: '1.25rem',
              xl: '1.35rem',
            },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {'Entity Profile'}
        </Typography>
      </Box>
      <ApplicationStepperUpdate />

      <AccordionDetails sx={{ pl: 0, ml: -12 }}>
        <EntityFormContainer>
          <form onSubmit={formik.handleSubmit}>
            <StyledAccordion
              sx={{
                border: '1px solid #e0e0e0',
                boxShadow: 'none',
                borderRadius: '5px',
              }}
              defaultExpanded
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: '#e6ebff !important',
                  marginBottom: '0px !important',
                  minHeight: { xs: '90px', md: '50px' }, // 90px for mobile, 50px for desktop
                  '&.Mui-expanded': {
                    minHeight: { xs: '90px', md: '50px' }, // !important removed from here
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    height: '0px',
                    minHeight: 'auto',
                  }}
                >
                  <Typography sx={titleStyles}>
                    Institutional Admin User 1 Details
                  </Typography>

                  <Typography
                    sx={{
                      color: editAccessOne ? '#999999' : '#002cba',
                      fontWeight: '500',
                      fontSize: '16px',
                      mr: 1,
                      cursor: editAccessOne ? 'not-allowed' : 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleNewNodalAdd(1);
                    }}
                  >
                    Add New Institutional Admin User
                  </Typography>
                </Box>
              </StyledAccordionSummary>

              <StyledAccordionDetails>
                {/* First Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Citizenship */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <SelectTag
                      label="Citizenship"
                      name="adminOneDetails.citizenship"
                      value={formik.values.adminOneDetails?.citizenship || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      options={citizenships}
                      disabled={!editAccessOne}
                      error={
                        formik.touched?.adminOneDetails?.citizenship &&
                        formik.errors?.adminOneDetails?.citizenship
                          ? formik.errors.adminOneDetails.citizenship
                          : undefined
                      }
                      isCitizenship
                      sx={selectStyles}
                    />
                  </Box>

                  {/* CKYC Number */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      CKYC Number <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        type="text"
                        name="adminOneDetails.ckycNumber"
                        placeholder="Enter CKYC number"
                        value={formik.values.adminOneDetails.ckycNumber || ''}
                        onChange={(e) => {
                          formik.handleChange(e);
                          // Auto reset verification when CKYC number changes
                          if (isIndianCitizenShip1) {
                            setIsVerified1(false);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        disabled={!editAccessOne}
                        fullWidth
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {formik.values.adminOneDetails.ckycNumber &&
                                isIndianCitizenShip1 &&
                                (isVerified1 || !isIndianCitizenShip1 ? (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <CheckCircleOutlineIcon
                                      sx={{
                                        color: 'success.main',
                                        fontSize: 20,
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'success.main',
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      Verified
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    style={{ textTransform: 'none' }}
                                    //startIcon={<VerifyIcon />}
                                    //onClick={handleVerify}
                                    disabled={
                                      !formik.values.adminOneDetails.ckycNumber
                                    } // Disable if no CKYC number
                                    sx={{
                                      px: 2,
                                      py: 1,
                                      fontSize: '14px',
                                      color: 'white',
                                      backgroundColor: '#0044cc',
                                      borderRadius: '6px',
                                    }}
                                    onClick={async () => {
                                      if (
                                        !formik.values.adminOneDetails
                                          .ckycNumber ||
                                        formik.values.adminOneDetails.ckycNumber
                                          .length !== 14
                                      ) {
                                        console.error('Invalid CKYC number');
                                        return;
                                      }
                                      dispatch(showLoader('Please wait...'));
                                      const resultAction = await dispatch(
                                        fetchCkycDetailsUpdate(
                                          formik.values.adminOneDetails.ckycNumber.trim()
                                        )
                                      );
                                      if (
                                        fetchCkycDetailsUpdate.fulfilled.match(
                                          resultAction
                                        )
                                      ) {
                                        dispatch(hideLoader());
                                        setIsVerified1(true);
                                        console.log(
                                          'resultAction.payload',
                                          resultAction.payload
                                        );
                                        setotpIdentifier1(
                                          resultAction.payload.otp_identifier
                                        );
                                        setCkycOTPModalOpen1(true);
                                      } else {
                                        console.error('Error');
                                      }
                                    }}
                                  >
                                    Verify
                                  </Button>
                                ))}
                            </InputAdornment>
                          ),
                        }}
                        sx={inputStyles}
                      />
                    </Box>
                    {formik.touched?.adminOneDetails?.ckycNumber &&
                      formik.errors?.adminOneDetails?.ckycNumber && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.ckycNumber}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Title */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <SelectTag
                      sx={selectStyles}
                      label="Title"
                      name="adminOneDetails.title"
                      value={formik.values.adminOneDetails.title || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      options={titles}
                      disabled={!editAccessOne}
                      error={
                        formik.touched?.adminOneDetails?.title &&
                        formik.errors?.adminOneDetails?.title
                          ? formik.errors.adminOneDetails.title
                          : undefined
                      }
                    />
                  </Box>
                </Box>

                {/* Second Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* First Name */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      First Name <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminOneDetails.firstName"
                      placeholder="First Name"
                      value={formik.values.adminOneDetails.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                    {formik.touched?.adminOneDetails?.firstName &&
                      formik.errors?.adminOneDetails?.firstName && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.firstName}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Middle Name */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Middle Name{' '}
                    </Typography>
                    <TextField
                      name="adminOneDetails.middleName"
                      placeholder="Middle Name"
                      value={formik.values.adminOneDetails.middleName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                  </Box>

                  {/* Last Name */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Last Name <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminOneDetails.lastName"
                      placeholder="Last Name"
                      value={formik.values.adminOneDetails.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                    {formik.touched?.adminOneDetails?.lastName &&
                      formik.errors?.adminOneDetails?.lastName && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.lastName}
                        </FormHelperText>
                      )}
                  </Box>
                </Box>

                {/* Third Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Gender */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <SelectTag
                      sx={selectStyles}
                      label="Gender"
                      name="adminOneDetails.gender"
                      value={formik.values.adminOneDetails.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched?.adminOneDetails?.gender &&
                        formik.errors?.adminOneDetails?.gender
                          ? formik.errors.adminOneDetails.gender
                          : undefined
                      }
                      options={genders}
                      disabled={!editAccessOne}
                      // optional={true}
                    />
                  </Box>

                  {/* Date of Birth */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <DateTag
                      label="Date of Birth"
                      name="adminOneDetails.dateOfBirth"
                      value={formik.values.adminOneDetails.dateOfBirth}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      error={
                        formik.touched?.adminOneDetails?.dateOfBirth &&
                        formik.errors?.adminOneDetails?.dateOfBirth
                          ? formik.errors.adminOneDetails.dateOfBirth
                          : undefined
                      }
                      // optional={true}
                    />
                  </Box>

                  {/* Designation */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Designation <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminOneDetails.designation"
                      placeholder="Designation"
                      value={formik.values.adminOneDetails.designation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                    {formik.touched?.adminOneDetails?.designation &&
                      formik.errors?.adminOneDetails?.designation && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.designation}
                        </FormHelperText>
                      )}
                  </Box>
                </Box>

                {/* Fourth Step */}

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Employee Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Employee Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminOneDetails.employeeCode"
                      placeholder="Enter employee code"
                      value={formik.values.adminOneDetails.employeeCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      error={
                        formik.touched?.adminOneDetails?.employeeCode &&
                        Boolean(formik.errors?.adminOneDetails?.employeeCode)
                      }
                      sx={inputStyles}
                    />
                    {formik.touched?.adminOneDetails?.employeeCode &&
                      formik.errors?.adminOneDetails?.employeeCode && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.employeeCode}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Email */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Email <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminOneDetails.emailId"
                      placeholder="Email"
                      value={formik.values.adminOneDetails.emailId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      error={
                        formik.touched?.adminOneDetails?.emailId &&
                        Boolean(formik.errors?.adminOneDetails?.emailId)
                      }
                      sx={inputStyles}
                    />
                    {formik.touched?.adminOneDetails?.emailId &&
                      formik.errors?.adminOneDetails?.emailId && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.emailId}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Country Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Country Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formik.values.adminOneDetails.countryCode}
                        onChange={(e) =>
                          handleCountryChange(e, 'adminOneDetails')
                        }
                        onBlur={formik.handleBlur}
                        disabled={!editAccessOne}
                        displayEmpty
                        sx={selectStyles}
                        renderValue={(selected) => {
                          if (!selected) {
                            return 'Select Country Code';
                          }
                          const country = countries.find(
                            (c) => c.dial_code === selected
                          );
                          return ` ${country?.name}(${country?.dial_code})`;
                        }}
                      >
                        {countries.map((country) => (
                          <MenuItem
                            key={country.code}
                            value={country.dial_code}
                          >
                            {country.dial_code} - {country.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formik.touched?.adminOneDetails?.countryCode &&
                      formik.errors?.adminOneDetails?.countryCode && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.countryCode}
                        </FormHelperText>
                      )}
                  </Box>
                </Box>

                {/* Fifth Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Mobile Number */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Mobile Number <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminOneDetails.mobileNo"
                      placeholder="Enter mobile number"
                      value={formik.values.adminOneDetails.mobileNo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                    {formik.touched?.adminOneDetails?.mobileNo &&
                      formik.errors?.adminOneDetails?.mobileNo && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.mobileNo}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Landline Number */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Landline Number{' '}
                    </Typography>
                    <TextField
                      name="adminOneDetails.landline"
                      placeholder="Enter landline number"
                      value={formik.values.adminOneDetails.landline}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                    {formik.touched?.adminOneDetails?.landline &&
                      formik.errors?.adminOneDetails?.landline && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.landline}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Office Address */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Office Address <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        name="adminOneDetails.sameAsRegisteredAddress"
                        value={
                          formik.values.adminOneDetails.sameAsRegisteredAddress
                            ? 'true'
                            : 'false'
                        }
                        onChange={(e) => {
                          const value = e.target.value === 'true';
                          formik.setFieldValue(
                            'adminOneDetails.sameAsRegisteredAddress',
                            value
                          );
                        }}
                        onBlur={formik.handleBlur}
                        disabled={!editAccessOne}
                        displayEmpty
                        sx={selectStyles}
                      >
                        <MenuItem value="true">
                          Same as entity registered address
                        </MenuItem>
                        <MenuItem value="false">
                          Same as correspondence address
                        </MenuItem>
                      </Select>
                    </FormControl>
                    {formik.touched?.adminOneDetails?.sameAsRegisteredAddress &&
                      formik.errors?.adminOneDetails
                        ?.sameAsRegisteredAddress && (
                        <FormHelperText error>
                          {
                            formik.errors.adminOneDetails
                              .sameAsRegisteredAddress
                          }
                        </FormHelperText>
                      )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Address Line 1 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 1 <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 1"
                      name="adminOneDetails.addressLine1"
                      value={formik.values.adminOneDetails.addressLine1 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessOne}
                    />
                    {formik.touched?.adminOneDetails?.addressLine1 &&
                      formik.errors?.adminOneDetails?.addressLine1 && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.addressLine1}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Address Line 2 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 2
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 2"
                      name="adminOneDetails.addressLine2"
                      value={formik.values.adminOneDetails.addressLine2 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessOne}
                    />
                  </Box>

                  {/* Address Line 3 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 3
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 3"
                      name="adminOneDetails.addressLine3"
                      value={formik.values.adminOneDetails.addressLine3 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessOne}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Country Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Country <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formik?.values.adminOneDetails.country}
                        onChange={(e) =>
                          handleCountryChangeAdd(e, 'adminOneDetails')
                        }
                        displayEmpty
                        disabled={!editAccessOne}
                        sx={{
                          ...selectStyles,
                        }}
                        // Optional: Use a custom icon if needed
                        IconComponent={KeyboardArrowDown}
                      >
                        {countries.map((c) => (
                          <MenuItem key={c.name} value={c.name}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography>{c.name}</Typography>
                              <Box
                                sx={{
                                  width: 1,
                                  height: 18,
                                  backgroundColor: '#ccc',
                                }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formik.touched?.adminOneDetails?.country &&
                      formik.errors?.adminOneDetails?.country && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.country}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* State/UT */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      State/ UT <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.adminOneDetails.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={{ ...selectStyles, height: '45px' }}
                          name="adminOneDetails.state"
                          value={formik.values.adminOneDetails.state}
                          onChange={(e) =>
                            handleStateChange(e, 'adminOneDetails')
                          }
                          onBlur={formik.handleBlur}
                          renderValue={(selected) =>
                            selected ? selected : 'Select State'
                          }
                          disabled={!editAccessOne || states.length === 0}
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="">Select State</MenuItem>
                          {states.map((s) => (
                            <MenuItem key={s.code} value={s.name}>
                              {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={{
                          ...inputStyles,
                          height: '45px',
                          '& .MuiInputBase-root': {
                            height: '45px',
                          },
                        }}
                        name="adminOneDetails.state"
                        placeholder="Enter State"
                        value={formik.values.adminOneDetails.state || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!editAccessOne}
                      />
                    )}
                    {formik.touched.adminOneDetails?.state &&
                      formik.errors.adminOneDetails?.state && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          {formik.errors.adminOneDetails.state}
                        </Typography>
                      )}
                  </Box>

                  {/* District */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      District <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.adminOneDetails.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={{ ...selectStyles, height: '45px' }}
                          name="adminOneDetails.district"
                          value={formik.values.adminOneDetails.district}
                          onChange={(e) =>
                            handleDistrictChange(e, 'adminOneDetails')
                          }
                          onBlur={formik.handleBlur}
                          renderValue={(selected) =>
                            selected ? selected : 'Select District'
                          }
                          disabled={!editAccessOne || districts.length === 0}
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="">Select District</MenuItem>
                          {districts.map((d) => (
                            <MenuItem key={d.value} value={d.value}>
                              {d.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={{
                          ...inputStyles,
                          height: '45px',
                          '& .MuiInputBase-root': {
                            height: '45px',
                          },
                        }}
                        name="adminOneDetails.district"
                        placeholder="Enter District"
                        value={formik.values.adminOneDetails.district || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!editAccessOne}
                      />
                    )}
                    {formik.touched.adminOneDetails?.district &&
                      formik.errors.adminOneDetails?.district && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          {formik.errors.adminOneDetails.district}
                        </Typography>
                      )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* City/Town */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      City/Town <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                      }}
                      placeholder="Enter city/town"
                      name="adminOneDetails.city"
                      value={formik.values.adminOneDetails.city || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessOne}
                    />
                    {formik.touched?.adminOneDetails?.city &&
                      formik.errors?.adminOneDetails?.city && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.city}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Pin Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Pin Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.adminOneDetails.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={selectStyles}
                          name="adminOneDetails.pincode"
                          value={formik.values.adminOneDetails.pincode}
                          onChange={formik.handleChange}
                          disabled={!editAccessOne || pincodes.length === 0} // Disable when not editing or no pincodes
                          renderValue={(selected) =>
                            selected ? selected : 'Select Pincode'
                          }
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="">Select Pincode</MenuItem>
                          {pincodes?.map((pincode) => (
                            <MenuItem key={pincode} value={pincode}>
                              {pincode}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={inputStyles}
                        name="adminOneDetails.pincode"
                        placeholder="Enter Pin Code"
                        value={formik.values.adminOneDetails.pincode || ''}
                        onChange={formik.handleChange}
                        fullWidth
                        size="small"
                        disabled={!editAccessOne} // Disable when not editing
                      />
                    )}
                    {formik.touched?.adminOneDetails?.pincode &&
                      formik.errors?.adminOneDetails?.pincode && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.pincode}
                        </FormHelperText>
                      )}
                  </Box>
                  {/* Alternate Pin Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Digipin
                      {formik.values?.adminOneDetails?.pincode === 'OTHERS' && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                      }}
                      placeholder="Enter Pin Code"
                      name="adminOneDetails.digipin"
                      value={formik.values?.adminOneDetails?.digipin || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessOne}
                    />
                  </Box>
                </Box>

                {/* Sixth Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Proof of Identity - Takes 1/3 width */}

                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <SelectTag
                      label="Proof of Identity"
                      name="adminOneDetails.proofOfIdentity"
                      value={
                        formik.values.adminOneDetails?.proofOfIdentity || ''
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      options={proofOfIdentities}
                      disabled={!editAccessOne}
                      error={
                        formik.touched?.adminOneDetails?.proofOfIdentity &&
                        formik.errors?.adminOneDetails?.proofOfIdentity
                          ? formik.errors.adminOneDetails.proofOfIdentity
                          : undefined
                      }
                      sx={selectStyles}
                    />
                  </Box>
                  {/* Proof of Identity Number - Takes 1/3 width */}
                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <FileTag
                      label="Proof of Identity Number"
                      required
                      name="addressProof"
                      fileData={addressProofDoc}
                      previewUrl={addressProofPreview}
                      onChange={handleFileSelection}
                      //onDelete={handleBoardResolutionDelete}
                      fileType="poi"
                      docNum={1}
                      uploadIcon={uploadIconBox}
                      textFieldProps={{
                        name: 'adminOneDetails.identityNumber',
                        value: formik.values.adminOneDetails.identityNumber,
                        onChange: formik.handleChange,
                        onBlur: formik.handleBlur,
                        // error:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   Boolean(formik.errors.proofOfIdentityNumber),
                        // helperText:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   formik.errors.proofOfIdentityNumber,
                      }}
                      // error={
                      //   formik.touched?.certifiedPoi &&
                      //   formik.errors?.certifiedPoi
                      //     ? formik.errors.certifiedPoi
                      //     : ''
                      // }
                      disabled={!editAccessOne}
                    />
                    {/* <Typography variant="body2" sx={labelStyles}>
                      Proof of Identity Number
                    </Typography>
                    <TextField
                      name="adminOneDetails.identityNumber"
                      placeholder="Enter identity number"
                      value={formik.values.adminOneDetails.identityNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    /> */}
                    {formik.touched?.adminOneDetails?.identityNumber &&
                      formik.errors?.adminOneDetails?.identityNumber && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.identityNumber}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Empty spacer to maintain same width as three fields above */}
                  <Box
                    sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}
                  ></Box>
                </Box>

                {/* Seventh Step - File Uploads */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Date of Authorization - Takes 1/3 width */}
                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <DateTag
                      label="Date of Authorization"
                      name="adminOneDetails.dateOfAuthorization"
                      value={formik.values.adminOneDetails.dateOfAuthorization}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      error={
                        formik.touched?.adminOneDetails?.dateOfAuthorization &&
                        formik.errors?.adminOneDetails?.dateOfAuthorization
                          ? formik.errors.adminOneDetails.dateOfAuthorization
                          : undefined
                      }
                    />
                    {formik.touched?.adminOneDetails?.dateOfAuthorization &&
                      formik.errors?.adminOneDetails?.dateOfAuthorization && (
                        <FormHelperText error>
                          {formik.errors.adminOneDetails.dateOfAuthorization}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Authorization letter - Takes 1/3 width */}
                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <Typography variant="body2" sx={{ ...labelStyles }}>
                      Authorization letter by Competent Authority
                      <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FileTag
                      label=""
                      required={false} // Set to false since we're showing asterisk in label
                      name="boardResolution"
                      fileData={regulatorLicenceDoc}
                      previewUrl={regulatorLicencePreview}
                      onChange={handleFileSelection}
                      fileType="licence"
                      docNum={1}
                      uploadIcon={uploadIconBox}
                      textFieldProps={{
                        name: 'adminOneDetails.authorizationLetterDetails',
                        value:
                          formik.values.adminOneDetails
                            .authorizationLetterDetails,
                        onChange: formik.handleChange,
                        onBlur: formik.handleBlur,
                        // error:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   Boolean(formik.errors.proofOfIdentityNumber),
                        // helperText:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   formik.errors.proofOfIdentityNumber,
                      }}
                      error={
                        formik.touched?.adminOneDetails?.regulatorLicence &&
                        formik.errors?.adminOneDetails?.regulatorLicence
                          ? formik.errors.adminOneDetails?.regulatorLicence
                          : ''
                      }
                      disabled={!editAccessOne}
                    />
                  </Box>

                  {/* Empty spacer to maintain same width as three fields above */}
                  <Box
                    sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}
                  ></Box>
                </Box>

                {/* Validate Button */}
                {editAccessOne && (
                  <Box textAlign="right">
                    <Button
                      variant="contained"
                      sx={{
                        px: 3,
                        py: 2,
                        fontSize: '14px',
                        backgroundColor: '#002BCA',
                        borderRadius: '4px',
                      }}
                      type="button"
                      onClick={() => handleValidate(1)}
                      disabled={isMobileVerfied1 && isEmailVerfied1}
                    >
                      Validate Admin 1
                    </Button>
                  </Box>
                )}
              </StyledAccordionDetails>
            </StyledAccordion>
            <StyledAccordion
              sx={{
                border: '1px solid #e0e0e0',
                boxShadow: 'none',
                borderRadius: '5px',
              }}
              defaultExpanded
            >
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: '#e6ebff !important',
                  marginBottom: '0px !important',
                  minHeight: { xs: '90px', md: '50px' }, // 90px for mobile, 50px for desktop
                  '&.Mui-expanded': {
                    minHeight: { xs: '90px', md: '50px' }, // !important removed from here
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    height: '0px',
                    minHeight: 'auto',
                  }}
                >
                  <Typography sx={titleStyles}>
                    {' '}
                    Institutional Admin User 2 Details
                  </Typography>

                  <Typography
                    sx={{
                      color: editAccessTwo ? '#999999' : '#002cba',
                      fontWeight: '500',
                      fontSize: '16px',
                      mr: 1,
                      cursor: editAccessTwo ? 'not-allowed' : 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleNewNodalAdd(2);
                    }}
                  >
                    Add New Institutional Admin User
                  </Typography>
                </Box>
              </StyledAccordionSummary>

              <StyledAccordionDetails>
                {/* First Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Citizenship */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <SelectTag
                      sx={selectStyles}
                      label="Citizenship"
                      name="adminTwoDetails.citizenship"
                      value={formik.values.adminTwoDetails.citizenship}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched?.adminTwoDetails?.citizenship &&
                        formik.errors?.adminTwoDetails?.citizenship
                          ? formik.errors.adminTwoDetails.citizenship
                          : undefined
                      } // Ensure error is a string or undefined
                      options={citizenships}
                      disabled={!editAccessTwo}
                      isCitizenship={true}
                      // optional={true}
                    />
                  </Box>

                  {/* CKYC Number */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      CKYC Number <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        type="text"
                        name="adminTwoDetails.ckycNumber"
                        placeholder="Enter CKYC number"
                        value={formik.values.adminTwoDetails.ckycNumber || ''}
                        onChange={(e) => {
                          formik.handleChange(e);
                          if (isIndianCitizenShip2) {
                            setIsVerified2(false);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        disabled={!editAccessTwo}
                        fullWidth
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {formik.values.adminOneDetails.ckycNumber &&
                                isIndianCitizenShip2 &&
                                (isVerified2 || !isIndianCitizenShip2 ? (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <CheckCircleOutlineIcon
                                      sx={{
                                        color: 'success.main',
                                        fontSize: 20,
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'success.main',
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      Verified
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    style={{ textTransform: 'none' }}
                                    //startIcon={<VerifyIcon />}
                                    //onClick={handleVerify}
                                    disabled={
                                      !formik.values.adminOneDetails.ckycNumber
                                    } // Disable if no CKYC number
                                    sx={{
                                      px: 2,
                                      py: 1,
                                      fontSize: '14px',
                                      color: 'white',
                                      backgroundColor: '#0044cc',
                                      borderRadius: '6px',
                                    }}
                                    onClick={async () => {
                                      if (
                                        !formik.values.adminTwoDetails
                                          .ckycNumber ||
                                        formik.values.adminTwoDetails.ckycNumber
                                          .length !== 14
                                      ) {
                                        console.error('Invalid CKYC number');
                                        return;
                                      }
                                      dispatch(showLoader('Please wait...'));
                                      const resultAction = await dispatch(
                                        fetchCkycDetailsUpdate(
                                          formik.values.adminTwoDetails.ckycNumber.trim()
                                        )
                                      );
                                      if (
                                        fetchCkycDetailsUpdate.fulfilled.match(
                                          resultAction
                                        )
                                      ) {
                                        dispatch(hideLoader());
                                        setIsVerified2(true);
                                        console.log(
                                          'resultAction.payload',
                                          resultAction.payload
                                        );
                                        setotpIdentifier2(
                                          resultAction.payload.otp_identifier
                                        );
                                        setCkycOTPModalOpen2(true);
                                      } else {
                                        console.error('Error');
                                      }
                                    }}
                                  >
                                    Verify
                                  </Button>
                                ))}
                            </InputAdornment>
                          ),
                        }}
                        sx={inputStyles}
                      />
                    </Box>
                    {formik.touched?.adminTwoDetails?.ckycNumber &&
                      formik.errors?.adminTwoDetails?.ckycNumber && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.ckycNumber}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Title */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <SelectTag
                      sx={selectStyles}
                      label="Title"
                      name="adminTwoDetails.title"
                      value={formik.values.adminTwoDetails.title}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      options={titles}
                      disabled={!editAccessTwo}
                      error={
                        formik.touched?.adminTwoDetails?.title &&
                        formik.errors?.adminTwoDetails?.title
                          ? formik.errors.adminTwoDetails.title
                          : undefined
                      }
                      // optional={true}
                    />
                  </Box>
                </Box>

                {/* Second Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* First Name */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      First Name <span style={{ color: 'red' }}>*</span>
                    </Typography>

                    <TextField
                      name="adminTwoDetails.firstName"
                      placeholder="First Name"
                      value={formik.values.adminTwoDetails.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />

                    {formik.touched?.adminTwoDetails?.firstName &&
                      formik.errors?.adminTwoDetails?.firstName && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.firstName}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Middle Name */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Middle Name{' '}
                    </Typography>
                    <TextField
                      name="adminTwoDetails.middleName"
                      placeholder="Middle Name"
                      value={formik.values.adminTwoDetails.middleName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                  </Box>

                  {/* Last Name */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Last Name <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminTwoDetails.lastName"
                      placeholder="Last Name"
                      value={formik.values.adminTwoDetails.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      error={
                        formik.touched?.adminTwoDetails?.lastName &&
                        Boolean(formik.errors?.adminTwoDetails?.lastName)
                      }
                      sx={inputStyles}
                    />
                    {formik.touched?.adminTwoDetails?.lastName &&
                      formik.errors?.adminTwoDetails?.lastName && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.lastName}
                        </FormHelperText>
                      )}
                  </Box>
                </Box>

                {/* Third Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Gender */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <SelectTag
                      sx={selectStyles}
                      label="Gender"
                      name="adminTwoDetails.gender"
                      value={formik.values.adminTwoDetails.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched?.adminTwoDetails?.gender &&
                        formik.errors?.adminTwoDetails?.gender
                          ? formik.errors.adminTwoDetails.gender
                          : undefined
                      }
                      options={genders}
                      disabled={!editAccessTwo}
                      // optional={true}
                    />
                  </Box>

                  {/* Date of Birth */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <DateTag
                      label="Date of Birth"
                      name="adminTwoDetails.dateOfBirth"
                      value={formik.values.adminTwoDetails.dateOfBirth}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      error={
                        formik.touched?.adminTwoDetails?.dateOfBirth &&
                        formik.errors?.adminTwoDetails?.dateOfBirth
                          ? formik.errors.adminTwoDetails.dateOfBirth
                          : undefined
                      }
                      // optional={true}
                    />

                    {formik.touched?.adminTwoDetails?.dateOfBirth &&
                      formik.errors?.adminTwoDetails?.dateOfBirth && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.dateOfBirth}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Designation */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Designation <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminTwoDetails.designation"
                      placeholder="Designation"
                      value={formik.values.adminTwoDetails.designation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      error={
                        formik.touched?.adminTwoDetails?.designation &&
                        Boolean(formik.errors?.adminTwoDetails?.designation)
                      }
                      sx={inputStyles}
                    />
                    {formik.touched?.adminTwoDetails?.designation &&
                      formik.errors?.adminTwoDetails?.designation && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.designation}
                        </FormHelperText>
                      )}
                  </Box>
                </Box>

                {/* Fourth Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Office Address */}
                  {/* Employee Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Employee Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminTwoDetails.employeeCode"
                      placeholder="Enter employee code"
                      value={formik.values.adminTwoDetails.employeeCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      error={
                        formik.touched?.adminTwoDetails?.employeeCode &&
                        Boolean(formik.errors?.adminTwoDetails?.employeeCode)
                      }
                      sx={inputStyles}
                    />
                    {formik.touched?.adminTwoDetails?.employeeCode &&
                      formik.errors?.adminTwoDetails?.employeeCode && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.employeeCode}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Email */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Email <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminTwoDetails.emailId"
                      placeholder="Email"
                      value={formik.values.adminTwoDetails.emailId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                    {formik.touched?.adminTwoDetails?.emailId &&
                      formik.errors?.adminTwoDetails?.emailId && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.emailId}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Country Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Country Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formik.values.adminTwoDetails.countryCode}
                        onChange={(e) =>
                          handleCountryChange(e, 'adminTwoDetails')
                        }
                        onBlur={formik.handleBlur}
                        disabled={!editAccessTwo}
                        displayEmpty
                        sx={selectStyles}
                        renderValue={(selected) => {
                          if (!selected) {
                            return 'Select Country Code';
                          }
                          const country = countries.find(
                            (c) => c.dial_code === selected
                          );
                          return `${country?.name}(${country?.dial_code})`;
                        }}
                      >
                        {countries.map((country) => (
                          <MenuItem
                            key={country.code}
                            value={country.dial_code}
                          >
                            {country.dial_code} - {country.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formik.touched?.adminTwoDetails?.countryCode &&
                      formik.errors?.adminTwoDetails?.countryCode && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.countryCode}
                        </FormHelperText>
                      )}
                  </Box>
                </Box>

                {/* Fifth Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Mobile Number */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Mobile Number <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="adminTwoDetails.mobileNo"
                      placeholder="Enter mobile number"
                      value={formik.values.adminTwoDetails.mobileNo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                    {formik.touched?.adminTwoDetails?.mobileNo &&
                      formik.errors?.adminTwoDetails?.mobileNo && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.mobileNo}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Landline Number */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Landline Number{' '}
                    </Typography>
                    <TextField
                      name="adminTwoDetails.landline"
                      placeholder="Enter landline number"
                      value={formik.values.adminTwoDetails.landline}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Office Address <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        name="adminTwoDetails.sameAsRegisteredAddress"
                        value={
                          formik.values.adminTwoDetails.sameAsRegisteredAddress
                            ? 'true'
                            : 'false'
                        }
                        onChange={(e) => {
                          const value = e.target.value === 'true';
                          formik.setFieldValue(
                            'adminTwoDetails.sameAsRegisteredAddress',
                            value
                          );
                        }}
                        onBlur={formik.handleBlur}
                        disabled={!editAccessTwo}
                        displayEmpty
                        sx={selectStyles}
                      >
                        <MenuItem value="true">
                          Same as entity registered address
                        </MenuItem>
                        <MenuItem value="false">
                          Same as correspondence address
                        </MenuItem>
                      </Select>
                    </FormControl>
                    {formik.touched?.adminTwoDetails?.sameAsRegisteredAddress &&
                      formik.errors?.adminTwoDetails
                        ?.sameAsRegisteredAddress && (
                        <FormHelperText error>
                          {
                            formik.errors.adminTwoDetails
                              .sameAsRegisteredAddress
                          }
                        </FormHelperText>
                      )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Address Line 1 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 1 <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 1"
                      name="adminTwoDetails.addressLine1"
                      value={formik.values.adminTwoDetails.addressLine1 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessTwo}
                    />
                    {formik.touched?.adminTwoDetails?.addressLine1 &&
                      formik.errors?.adminTwoDetails?.addressLine1 && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.addressLine1}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Address Line 2 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 2
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 2"
                      name="adminTwoDetails.addressLine2"
                      value={formik.values.adminTwoDetails.addressLine2 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessTwo}
                    />
                  </Box>

                  {/* Address Line 3 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 3
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 3"
                      name="adminTwoDetails.addressLine3"
                      value={formik.values.adminTwoDetails.addressLine3 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessTwo}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Country Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Country <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formik?.values.adminTwoDetails.country}
                        onChange={(e) =>
                          handleCountryChangeAdd(e, 'adminTwoDetails')
                        }
                        displayEmpty
                        disabled={!editAccessTwo}
                        sx={{
                          ...selectStyles,
                        }}
                        // Optional: Use a custom icon if needed
                        IconComponent={KeyboardArrowDown}
                      >
                        {countries.map((c) => (
                          <MenuItem key={c.name} value={c.name}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography>{c.name}</Typography>
                              <Box
                                sx={{
                                  width: 1,
                                  height: 18,
                                  backgroundColor: '#ccc',
                                }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formik.touched?.adminTwoDetails?.country &&
                      formik.errors?.adminTwoDetails?.country && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.country}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* State/UT */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      State/ UT <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.adminTwoDetails.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={{ ...selectStyles, height: '45px' }}
                          name="adminTwoDetails.state"
                          value={formik.values.adminTwoDetails.state}
                          onChange={(e) =>
                            handleStateChange(e, 'adminTwoDetails')
                          }
                          onBlur={formik.handleBlur}
                          renderValue={(selected) =>
                            selected ? selected : 'Select State'
                          }
                          disabled={
                            !editAccessTwo || adminTwoStates.length === 0
                          }
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="">Select State</MenuItem>
                          {adminTwoStates.map((s) => (
                            <MenuItem key={s.code} value={s.name}>
                              {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={{
                          ...inputStyles,
                          height: '45px',
                          '& .MuiInputBase-root': {
                            height: '45px',
                          },
                        }}
                        name="adminTwoDetails.state"
                        placeholder="Enter State"
                        value={formik.values.adminTwoDetails.state || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!editAccessTwo}
                      />
                    )}
                    {formik.touched.adminTwoDetails?.state &&
                      formik.errors.adminTwoDetails?.state && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          {formik.errors.adminTwoDetails.state}
                        </Typography>
                      )}
                  </Box>

                  {/* District */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      District <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.adminTwoDetails.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={{ ...selectStyles, height: '45px' }}
                          name="adminTwoDetails.district"
                          value={formik.values.adminTwoDetails.district}
                          onChange={(e) =>
                            handleDistrictChange(e, 'adminTwoDetails')
                          }
                          onBlur={formik.handleBlur}
                          renderValue={(selected) =>
                            selected ? selected : 'Select District'
                          }
                          disabled={!editAccessTwo || adminTwoDist.length === 0}
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="">Select District</MenuItem>
                          {adminTwoDist.map((d) => (
                            <MenuItem key={d.value} value={d.value}>
                              {d.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={{
                          ...inputStyles,
                          height: '45px',
                          '& .MuiInputBase-root': {
                            height: '45px',
                          },
                        }}
                        name="adminTwoDetails.district"
                        placeholder="Enter District"
                        value={formik.values.adminTwoDetails.district || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!editAccessOne}
                      />
                    )}
                    {formik.touched.adminTwoDetails?.district &&
                      formik.errors.adminTwoDetails?.district && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          {formik.errors.adminTwoDetails.district}
                        </Typography>
                      )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* City/Town */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      City/Town <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                      }}
                      placeholder="Enter city/town"
                      name="adminTwoDetails.city"
                      value={formik.values.adminTwoDetails.city || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessTwo}
                    />
                    {formik.touched?.adminTwoDetails?.city &&
                      formik.errors?.adminTwoDetails?.city && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.city}
                        </FormHelperText>
                      )}
                  </Box>

                  {/* Pin Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Pin Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.adminTwoDetails.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={selectStyles}
                          name="adminTwoDetails.pincode"
                          value={formik.values.adminTwoDetails.pincode}
                          onChange={formik.handleChange}
                          disabled={
                            !editAccessTwo || adminTwoPincodes.length === 0
                          } // Disable when not editing or no pincodes
                          renderValue={(selected) =>
                            selected ? selected : 'Select Pincode'
                          }
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="">Select Pincode</MenuItem>
                          {adminTwoPincodes?.map((pincode) => (
                            <MenuItem key={pincode} value={pincode}>
                              {pincode}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={inputStyles}
                        name="adminTwoDetails.pincode"
                        placeholder="Enter Pin Code"
                        value={formik.values.adminTwoDetails.pincode || ''}
                        onChange={formik.handleChange}
                        fullWidth
                        size="small"
                        disabled={!editAccessTwo} // Disable when not editing
                      />
                    )}
                    {formik.touched?.adminTwoDetails?.pincode &&
                      formik.errors?.adminTwoDetails?.pincode && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.pincode}
                        </FormHelperText>
                      )}
                  </Box>
                  {/* Alternate Pin Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Digipin
                      {formik.values?.adminTwoDetails?.pincode === 'OTHERS' && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                      }}
                      placeholder="Enter Pin Code"
                      name="adminTwoDetails.digipin"
                      value={formik.values?.adminTwoDetails?.digipin || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={!editAccessTwo}
                    />
                  </Box>
                </Box>
                {/* Sixth Step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Proof of Identity - Takes 1/3 width */}
                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <SelectTag
                      label="Proof of Identity"
                      name="adminTwoDetails.proofOfIdentity"
                      value={
                        formik.values.adminTwoDetails?.proofOfIdentity || ''
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      options={proofOfIdentities}
                      disabled={!editAccessTwo}
                      error={
                        formik.touched?.adminTwoDetails?.proofOfIdentity &&
                        formik.errors?.adminTwoDetails?.proofOfIdentity
                          ? formik.errors.adminTwoDetails.proofOfIdentity
                          : undefined
                      }
                      sx={selectStyles}
                    />
                  </Box>

                  {/* Proof of Identity Number - Takes 1/3 width */}

                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <FileTag
                      label="Proof of Identity Number"
                      required
                      name="twoAddressProof"
                      fileData={addressProofTwoDoc}
                      previewUrl={addressProofTwoPreview}
                      onChange={handleFileSelection}
                      //onDelete={handleBoardResolutionDelete}
                      fileType="address"
                      docNum={2}
                      uploadIcon={uploadIconBox}
                      textFieldProps={{
                        name: 'adminTwoDetails.identityNumber',
                        value: formik.values.adminTwoDetails.identityNumber,
                        onChange: formik.handleChange,
                        onBlur: formik.handleBlur,
                        // error:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   Boolean(formik.errors.proofOfIdentityNumber),
                        // helperText:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   formik.errors.proofOfIdentityNumber,
                      }}
                      // error={
                      //   formik.touched?.certifiedPoi &&
                      //   formik.errors?.certifiedPoi
                      //     ? formik.errors.certifiedPoi
                      //     : ''
                      // }
                      disabled={!editAccessTwo}
                    />
                    {/* <Typography variant="body2" sx={labelStyles}>
                      Proof of Identity Number
                    </Typography>
                    <TextField
                      name="adminOneDetails.identityNumber"
                      placeholder="Enter identity number"
                      value={formik.values.adminOneDetails.identityNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessOne}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    /> */}
                  </Box>
                  {/* <Typography variant="body2" sx={labelStyles}>
                      Proof of Identity Number
                    </Typography>
                    <TextField
                      name="adminTwoDetails.identityNumber"
                      placeholder="Enter identity number"
                      value={formik.values.adminTwoDetails.identityNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      fullWidth
                      size="small"
                      sx={inputStyles}
                    />
                    {formik.touched?.adminTwoDetails?.identityNumber &&
                      formik.errors?.adminTwoDetails?.identityNumber && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.identityNumber}
                        </FormHelperText>
                      )}
                  </Box> */}

                  {/* Empty spacer to maintain same width as three fields above */}
                  <Box
                    sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}
                  ></Box>
                </Box>

                {/* Seventh Step - File Uploads */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <DateTag
                      label="Date of Authorization"
                      name="adminTwoDetails.dateOfAuthorization"
                      value={formik.values.adminTwoDetails.dateOfAuthorization}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={!editAccessTwo}
                      error={
                        formik.touched?.adminTwoDetails?.dateOfAuthorization &&
                        formik.errors?.adminTwoDetails?.dateOfAuthorization
                          ? formik.errors.adminTwoDetails.dateOfAuthorization
                          : undefined
                      }
                    />

                    {formik.touched?.adminTwoDetails?.dateOfAuthorization &&
                      formik.errors?.adminTwoDetails?.dateOfAuthorization && (
                        <FormHelperText error>
                          {formik.errors.adminTwoDetails.dateOfAuthorization}
                        </FormHelperText>
                      )}
                  </Box>

                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <Typography variant="body2" sx={{ ...labelStyles }}>
                      Authorization letter by Competent Authority
                      <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FileTag
                      label=""
                      required={false}
                      name="twoBoardResolution"
                      fileData={regulatorLicenceTwoDoc}
                      previewUrl={regulatorLicenceTwoPreview}
                      onChange={handleFileSelection}
                      fileType="licence"
                      docNum={2}
                      uploadIcon={uploadIconBox}
                      textFieldProps={{
                        name: 'adminTwoDetails.authorizationLetterDetails',
                        value:
                          formik.values.adminTwoDetails
                            .authorizationLetterDetails,
                        onChange: formik.handleChange,
                        onBlur: formik.handleBlur,
                        // error:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   Boolean(formik.errors.proofOfIdentityNumber),
                        // helperText:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   formik.errors.proofOfIdentityNumber,
                      }}
                      error={
                        formik.touched?.adminTwoDetails?.regulatorLicence &&
                        formik.errors?.adminTwoDetails?.regulatorLicence
                          ? formik.errors.adminTwoDetails?.regulatorLicence
                          : ''
                      }
                      disabled={!editAccessTwo}
                    />
                  </Box>

                  <Box
                    sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}
                  ></Box>
                </Box>

                {editAccessTwo && (
                  <Box textAlign="center">
                    <Button
                      variant="contained"
                      sx={{
                        px: 3,
                        py: 2,
                        fontSize: '14px',
                        backgroundColor: '#002BCA',
                        borderRadius: '4px',
                      }}
                      type="button"
                      onClick={() => handleValidate(2)}
                      disabled={isMobileVerfied2 && isEmailVerfied2}
                    >
                      Validate Admin 2
                    </Button>
                  </Box>
                )}
              </StyledAccordionDetails>
            </StyledAccordion>
            <Box textAlign="end">
              <Button
                variant="contained"
                sx={{
                  px: 6,
                  py: 1.2,
                  fontSize: '14px',
                  backgroundColor: '#002BCA',
                  borderRadius: '4px',
                  marginLeft: '0px',
                  ml: 2,
                  mb: 2,
                }}
                style={{ textTransform: 'none' }}
                type="submit"
                className="submit-btn"
                disabled={
                  !(isMobileVerfied1 && isEmailVerfied1) ||
                  !(isMobileVerfied2 && isEmailVerfied2)
                }
              >
                Save and Next
              </Button>
            </Box>
          </form>
        </EntityFormContainer>
      </AccordionDetails>
      {isOTPModalOpen1 && (
        <OTPModalUpdate
          mobileChange={!isMobileVerfied1}
          emailChange={!isEmailVerfied1}
          isOpen={isOTPModalOpen1}
          onClose={() => setOTPModalOpen1(false)}
          onOtpSubmit={(otp) => {
            console.log('Submitted OTP:', otp);
            setOTPModalOpen1(false);
            setSuccessModalOpen1(true);
          }}
          countryCode={formik.values?.adminOneDetails.countryCode}
          email={formik.values?.adminOneDetails.emailId}
          mobile={formik.values?.adminOneDetails.mobileNo}
        />
      )}
      <SuccessModal
        isOpen={isSuccessModalOpen1}
        onClose={() => setSuccessModalOpen1(false)}
        onOkay={() => handleOkay(1)}
        title="Email and Mobile OTP Verified Successfully!"
        message="The Institutional Admin 1 details's details have been verified successfully"
      />

      {isOTPModalOpen2 && (
        <OTPModalUpdate
          mobileChange={!isMobileVerfied2}
          emailChange={!isEmailVerfied2}
          isOpen={isOTPModalOpen2}
          onClose={() => setOTPModalOpen2(false)}
          onOtpSubmit={() => {
            setOTPModalOpen2(false);
            setSuccessModalOpen2(true);
          }}
          countryCode={formik.values?.adminTwoDetails.countryCode}
          email={formik.values?.adminTwoDetails.emailId}
          mobile={formik.values?.adminTwoDetails.mobileNo}
        />
      )}
      <SuccessModal
        isOpen={isSuccessModalOpen2}
        onClose={() => setSuccessModalOpen2(false)}
        onOkay={() => handleOkay(2)}
        title="Email and Mobile OTP Verified Successfully!"
        message="The Institutional Admin 1 details's details have been verified successfully"
      />
      <CkycUpdateVerifyModal
        isOpen={isCkycOTPModalOpen1}
        onClose={() => setCkycOTPModalOpen1(false)}
        ckycNumber={formik.values.adminOneDetails.ckycNumber || ''}
        setShowSuccessModal={() => {
          setIsVerified1(true);
        }}
        updateData={(data) => {
          //dispatch(setCkycData(data));
          formik.setValues({
            ...formik.values,
            adminOneDetails: {
              ...formik.values.adminOneDetails,
              firstName: data.firstName || '',
              middleName: data.middleName || '',
              lastName: data.lastName || '',
              gender: data.gender || '',
              title: data.title || '',
              mobileNo: data.mobileNo || '',
              emailId: data.emailAddress || '',
            },
          });
          setCkycOTPModalOpen1(false);
        }}
        otpIdentifier={otpIdentifier1}
        updateOtpIdentifier={(item) => {
          setotpIdentifier1(item);
        }}
      />
      <CkycUpdateVerifyModal
        isOpen={isCkycOTPModalOpen2}
        onClose={() => setCkycOTPModalOpen2(false)}
        ckycNumber={formik.values.adminTwoDetails.ckycNumber || ''}
        setShowSuccessModal={() => {
          setIsVerified2(true);
        }}
        updateData={(data) => {
          //dispatch(setCkycData(data));
          formik.setValues({
            ...formik.values,
            adminTwoDetails: {
              ...formik.values.adminTwoDetails,
              firstName: data.firstName || '',
              middleName: data.middleName || '',
              lastName: data.lastName || '',
              gender: data.gender || '',
              title: data.title || '',
              mobileNo: data.mobileNo || '',
              emailId: data.emailAddress || '',
            },
          });
          setCkycOTPModalOpen2(false);
        }}
        otpIdentifier={otpIdentifier2}
        updateOtpIdentifier={(item) => {
          setotpIdentifier2(item);
        }}
      />
    </Box>
  );
};

export default UpdateInstitutionalAdminDetails;
