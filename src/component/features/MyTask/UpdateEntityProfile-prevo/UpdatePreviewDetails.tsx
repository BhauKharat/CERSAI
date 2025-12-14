/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Select,
  Typography,
  TextField,
  Box,
  FormControl,
  InputAdornment,
  Button,
  IconButton,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import '../../../register/EntityForm/registrationPage.css';
import './update.css';
import 'react-phone-input-2/lib/style.css';
import {
  formatConstitutionsForSelect,
  formatInstitutionTypesForSelect,
  formatRegulatorsForSelect,
} from '../../../../utils/dropDownUtils';
import dayjs, { Dayjs } from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUpdatePreviewDetails,
  generatePdfPreviewUpdate,
  initiateESignatureUpdate,
} from '../../../../redux/slices/updateProfileSlice/updatePreviwSlice';
import { useNavigate } from 'react-router';
import { useAppSelector } from '../../../../redux/store';
import { AppDispatch, RootState } from '@redux/store';
import {
  hideLoader,
  showLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import {
  labelStyles,
  inputStyles,
  selectStyles,
  titleStyles,
  trackTitle,
} from './RegionCreationRequest.style';
import {
  fetchDropdownMasters,
  fetchGeographyHierarchy,
} from '../../../../redux/slices/registerSlice/masterSlice';
import { useFormik } from 'formik';

import PdfPreviewModalUpdate from '../../../register/DocumentSummary/pdfViewerUpdate';
import BreadcrumbUpdateProfile from './BreadcrumbUpdateProfile';
import ApplicationStepperUpdate from './ApplicationStepperUpdate';
import { KeyboardArrowDown } from '@mui/icons-material';
import {
  EntityFormContainer,
  StyledAccordion,
  StyledAccordionDetails,
  StyledAccordionSummary,
} from './UpdateProfileAddressDetails.style';
const UpdatePreviewDetails = () => {
  interface Country {
    name: string;
    dial_code: string;
    code: string;
    states?: {
      value: string;
      label: string;
      districts: {
        value: string;
        label: string;
        pincodes?: string[]; // Add this line
      }[];
    }[];
  }

  const authToken = useSelector((state: RootState) => state.auth.authToken);
  const geographyHierarchy = useSelector(
    (state: RootState) => state.masters.geographyHierarchy
  );
  const { proofOfIdentities, citizenships, genders } = useSelector(
    (state: RootState) => state.masters
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);

  const [registeredStates, setRegisteredStates] = useState<
    {
      value: string;
      label: string;
      districts: {
        value: string;
        label: string;
        pincodes?: string[];
      }[];
    }[]
  >([]);

  const [registeredDistricts, setRegisteredDistricts] = useState<
    {
      value: string;
      label: string;
      pincodes?: string[];
    }[]
  >([]);

  const [correspondenceStates, setCorrespondenceStates] = useState<
    {
      value: string;
      label: string;
      districts: {
        value: string;
        label: string;
        pincodes?: string[];
      }[];
    }[]
  >([]);

  const [correspondenceDistricts, setCorrespondenceDistricts] = useState<
    {
      value: string;
      label: string;
      pincodes?: string[];
    }[]
  >([]);
  const { regulators, institutionTypes, constitutions } = useAppSelector(
    (state) => state.masters
  );
  interface HoiDetails {
    citizenship: string;
    ckycNumber: string;
    countryCode: string;
    countryName: string;
    designation: string;
    emailId: string;
    firstName: string;
    gender: string;
    landline: string | null;
    lastName: string;
    middleName: string;
    mobileNo: string;
    title: string;
  }
  interface NodalOfficerDetails {
    citizenship: string;
    ckycNo: string;
    countryCode: string;
    countryName: string;
    dateOfBirth: string;
    dateOfBoardResolution: string;
    designation: string;
    email: string;
    firstName: string;
    gender: string;
    id: string;
    identityNumber: string;
    landline: string | null;
    lastName: string;
    middleName: string;
    mobileNumber: string;
    proofOfIdentity: string;
    sameAsRegisteredAddress: boolean;
    title: string;
    boardResolution: string | null;
    certifiedPoi: string | null;
    certifiedPic?: string | null;
  }
  interface NodalDocumentData {
    base64Content: string;
    documentType: string;
    fileName: string;
    fileSize: string;
    id: string;
  }
  interface RegisteredAddress {
    line1: string;
    line2: string;
    line3: string;
    countryCode: string;
    state: string;
    district: string;
    cityTown: string;
    pinCode: string;
    alternatePinCode: string;
    id: string;
  }
  interface CorrespondenceAddress {
    line1: string;
    line2: string;
    line3: string;
    countryCode: string;
    state: string;
    district: string;
    cityTown: string;
    pinCode: string;
    alternatePinCode: string;
    id: string;
  }
  // interface CorrespondenceAddressSameAsRegisteredAddressDeatil {
  //   correspondenceAddressSameAsRegisteredAddress: boolean
  // }
  interface EntityDetails {
    cinNo: string;
    constitution: string;
    fiCode: string;
    gstinNo: string;
    institutionType: string;
    llpinNo: string;
    nameOfInstitution: string;
    operationalStatus: string;
    panNo: string;
    proprietorName: string;
    reId: string;
    reWebsite: string;
    registrationNo: string;
    regulator: string;
  }
  interface AdminOneDetails {
    authorizationLetterDetails: string;
    citizenship: string;
    ckycNumber: string;
    countryCode: string;
    dateOfAuthorization: string;
    dateOfBirth: string;
    designation: string;
    emailId: string;
    employeeCode: string;
    firstName: string;
    gender: string;
    id: string;
    identityNumber: string;
    landline: string;
    lastName: string;
    middleName: string;
    mobileNo: string;
    proofOfIdentity: string;
    sameAsRegisteredAddress: string;
    title: '';
  }

  interface AdminTwoDetails {
    authorizationLetterDetails: string;
    citizenship: string;
    ckycNumber: string;
    countryCode: string;
    dateOfAuthorization: string;
    dateOfBirth: string;
    designation: string;
    emailId: string;
    employeeCode: string;
    firstName: string;
    gender: string;
    id: string;
    identityNumber: string;
    landline: string;
    lastName: string;
    middleName: string;
    mobileNo: string;
    proofOfIdentity: string;
    sameAsRegisteredAddress: string;
    title: '';
  }

  interface NodalDataResponse {
    entityDetails: EntityDetails;
    correspondenceAddressSameAsRegisteredAddress: boolean;
    updationRequestId: string;
    headOfInstitutionDetails: HoiDetails;
    nodalOfficerDetails: NodalOfficerDetails;
    documents: NodalDocumentData[];
    registeredAddress: RegisteredAddress;
    correspondanceAddress: CorrespondenceAddress;
    adminOneDetails: AdminOneDetails;
    adminTwoDetails: AdminTwoDetails;
  }

  const [updationId, setUpdationId] = useState<string>('');
  useEffect(() => {
    if (geographyHierarchy?.length) {
      const countryList = geographyHierarchy.map((country) => ({
        name: country.name,
        code: country.code,
        dial_code: country.countryCode,
        states: country.states.map(
          (state: {
            name: string;
            districts: {
              name: string;
              pincodes: { pincode: string | number }[];
            }[];
          }) => ({
            label: state.name,
            value: state.name,
            districts: state.districts.map(
              (district: {
                name: string;
                pincodes: { pincode: string | number }[];
              }) => ({
                label: district.name,
                value: district.name,
                pincodes: district.pincodes.map(
                  (p: { pincode: string | number }) => p.pincode
                ),
              })
            ),
          })
        ),
      }));

      setCountries(countryList);
    }
  }, [geographyHierarchy]);
  const [allPreviewData, setAllPreviewData] = useState([]);
  const [empCode, setEmpCode] = useState('');

  const fetchDetails = async () => {
    try {
      dispatch(showLoader('Please Wait...'));
      const action = await dispatch(
        fetchUpdatePreviewDetails({ token: authToken })
      );
      if (fetchUpdatePreviewDetails.fulfilled.match(action)) {
        const fetchedData = action.payload?.data;
        const empCode = action.payload?.data?.adminOneDetails?.employeeCode;
        // const disableSection=action.payload?.data?.disabledSections
        if (fetchedData) {
          //const isDisabled = action.payload?.data?.disabledSections?.includes("NODAL_OFFICER");
          // setDisableSection(!!isDisabled);
          setEmpCode(empCode);
          setAllPreviewData(fetchedData);

          console.log('Fetched update nodal details:', fetchedData);
        }
      } else {
        dispatch(hideLoader());
        console.error('Error fetching address details:', action.payload);
      }
    } catch (error) {
      dispatch(hideLoader());
      console.error('Unexpected error:', error);
    } finally {
      dispatch(hideLoader());
    }
  };
  const fetchDetailsDD = async () => {
    try {
      const action = await dispatch(fetchDropdownMasters());
      console.log(action, 'Actioooooo');
      if (fetchDropdownMasters.fulfilled.match(action)) {
        const fetchedData = action.payload?.data;

        if (fetchedData) {
          console.log('Fetched update dd:', fetchedData);
        }
      } else {
        console.error('Error fetching address details:', action.payload);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };
  const fetchgeographicalDD = async () => {
    try {
      const action = await dispatch(fetchGeographyHierarchy());
      if (fetchGeographyHierarchy.fulfilled.match(action)) {
        const fetchedData = action.payload?.data;

        if (fetchedData) {
          console.log('Fetched update dd:', fetchedData);
        }
      } else {
        console.error('Error fetching address details:', action.payload);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };
  useEffect(() => {
    fetchDetailsDD();
    fetchgeographicalDD();
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isNodalDataResponse(data: unknown): data is NodalDataResponse {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;

    return (
      typeof obj.entityDetails === 'object' &&
      obj.entityDetails !== null &&
      typeof obj.headOfInstitutionDetails === 'object' &&
      obj.headOfInstitutionDetails !== null &&
      typeof obj.nodalOfficerDetails === 'object' &&
      obj.nodalOfficerDetails !== null &&
      Array.isArray(obj.documents) &&
      typeof obj.registeredAddress === 'object' &&
      obj.registeredAddress !== null &&
      typeof obj.correspondanceAddress === 'object' &&
      obj.correspondanceAddress !== null &&
      typeof obj.correspondenceAddressSameAsRegisteredAddress === 'boolean' &&
      typeof obj.updationRequestId === 'string' &&
      typeof obj.adminOneDetails === 'object' &&
      obj.adminOneDetails !== null &&
      typeof obj.adminTwoDetails === 'object' &&
      obj.adminTwoDetails !== null
    );
  }

  const formik = useFormik({
    initialValues: {
      nodalOfficer: {
        citizenship: '',
        ckycNumber: '',
        title: '',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dateOfBirth: null as Dayjs | null | string,
        designation: '',
        officeAddress: '',
        email: '',
        countryCode: '',
        mobileNumber: '',
        landlineNumber: '',
        employeeCode: '',
        proofOfIdentity: '',
        proofOfIdentityNumber: '',
        boardResolutionDate: null as Dayjs | null | string,
        boardResolution: null,
        certifiedPoi: null,
        certifiedPic: null,
        countryName: '',
        sameAsRegisteredAddress: false,
      },
      hoi: {
        citizenship: '',
        ckycNumber: '',
        title: '',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        designation: '',
        email: '',
        countryCode: '',
        mobileNumber: '',
        landlineNumber: '',
        countryName: '',
      },
      registerAddress: {
        line1: '',
        line2: '',
        line3: '',
        countryCode: '',
        state: '',
        district: '',
        cityTown: '',
        pinCode: '',
        alternatePinCode: '',
        id: '',
        countryName: '',
      },
      correspondenceAddress: {
        line1: '',
        line2: '',
        line3: '',
        countryCode: '',
        state: '',
        district: '',
        cityTown: '',
        pinCode: '',
        alternatePinCode: '',
        id: '',
        countryName: '',
      },
      correspondenceAddressSameAsRegisteredAddress: false,
      entityDetails: {
        cinNo: '',
        constitution: '',
        fiCode: '',
        gstinNo: '',
        institutionType: '',
        llpinNo: '',
        nameOfInstitution: '',
        operationalStatus: '',
        panNo: '',
        proprietorName: '',
        reId: '',
        reWebsite: '',
        registrationNo: '',
        regulator: '',
      },
      adminOneDetails: {
        authorizationLetterDetails: '',
        citizenship: '',
        ckycNumber: '',
        countryCode: '',
        dateOfAuthorization: null as Dayjs | null | string,
        dateOfBirth: null as Dayjs | null | string,
        designation: '',
        emailId: '',
        employeeCode: '',
        firstName: '',
        gender: '',
        id: '',
        identityNumber: '',
        landline: '',
        lastName: '',
        middleName: '',
        mobileNo: '',
        proofOfIdentity: '',
        sameAsRegisteredAddress: '',
        countryName: '',
        title: '',
      },
      adminTwoDetails: {
        authorizationLetterDetails: '',
        citizenship: '',
        ckycNumber: '',
        countryCode: '',
        dateOfAuthorization: null as Dayjs | null | string,
        dateOfBirth: null as Dayjs | null | string,
        designation: '',
        emailId: '',
        employeeCode: '',
        firstName: '',
        gender: '',
        id: '',
        identityNumber: '',
        landline: '',
        lastName: '',
        middleName: '',
        mobileNo: '',
        proofOfIdentity: '',
        sameAsRegisteredAddress: '',
        countryName: '',
        title: '',
      },
    },
    onSubmit: async (values: any, { setSubmitting }: any) => {
      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(mockEvent);
      setSubmitting(false);
    },
  });
  const [boardResolutionDoc, setBoardResolutionDoc] = useState<any>(null);
  const [certifiedPoiDoc, setCertifiedPoiDoc] = useState<any>(null);
  const [regulatorLiscence, setRegulatorLiscence] = useState<any>(null);

  const [reCinDoc, setReCinDoc] = useState<any>(null);
  const [rePanDOC, setRePanDOC] = useState<any>(null);
  const [addressProofDoc, setAddressProofDoc] = useState<any>(null);
  const [reOtherDoc, setReOtherDoc] = useState<any>(null);

  const [authLetterDocadmin1, setauthLetterDocadmin1] = useState<any>(null);
  const [certifiedPoiDocadmin1, setCertifiedPoiDocadmin1] = useState<any>(null);
  const [authLetterDocadmin2, setauthLetterDocadmin2] = useState<any>(null);
  const [certifiedPoiDocadmin2, setCertifiedPoiDocadmin2] = useState<any>(null);

  const [pdfData, setPdfData] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [regulationOptionDD, setRegulationOptionDD] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [institutionTypeOptionsDD, setInstitutionTypeOptionsDD] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [constitutionOptionsDD, setconstitutionOptionsDD] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  useEffect(() => {
    const nodalDataResponse = allPreviewData as unknown;

    if (Array.isArray(nodalDataResponse)) {
      console.error('Expected object but received array:', nodalDataResponse);
      return;
    }

    if (isNodalDataResponse(nodalDataResponse)) {
      const regiAdd = nodalDataResponse.registeredAddress;
      const CorrAdd = nodalDataResponse.correspondanceAddress;
      const hoi = nodalDataResponse.headOfInstitutionDetails;
      const nodalData = nodalDataResponse.nodalOfficerDetails;
      const documents = nodalDataResponse.documents || [];
      const correspondenceAddressSameAsRegisteredAddress =
        nodalDataResponse.correspondenceAddressSameAsRegisteredAddress || false;
      const entDetail = nodalDataResponse.entityDetails;
      const adminOneDetails = nodalDataResponse.adminOneDetails;
      const adminTwoDetails = nodalDataResponse.adminTwoDetails;
      const updationRequestId = nodalDataResponse.updationRequestId;
      setUpdationId(updationRequestId);

      // Format date strings to Dayjs objects
      const dateOfBirth = nodalData.dateOfBirth
        ? dayjs(nodalData.dateOfBirth)
        : null;
      const boardResolutionDate = nodalData.dateOfBoardResolution
        ? dayjs(nodalData.dateOfBoardResolution)
        : null;
      const dateOfBirthadmin1 = adminOneDetails.dateOfBirth
        ? dayjs(adminOneDetails.dateOfBirth)
        : null;
      const dateOfAuthorizationadmin1 = adminOneDetails.dateOfAuthorization
        ? dayjs(adminOneDetails.dateOfAuthorization)
        : null;
      const dateOfBirthadmin2 = adminOneDetails.dateOfBirth
        ? dayjs(adminOneDetails.dateOfBirth)
        : null;
      const dateOfAuthorizationadmin2 = adminOneDetails.dateOfAuthorization
        ? dayjs(adminOneDetails.dateOfAuthorization)
        : null;

      //country wise
      const selectedCountry = countries.find(
        (c) => c.dial_code === nodalData.countryCode
      );
      const countryName = selectedCountry ? selectedCountry.name : '';
      const selectedCountryhoi = countries.find(
        (c) => c.dial_code === hoi.countryCode
      );
      const countryNamehoi = selectedCountryhoi ? selectedCountryhoi.name : '';
      const selectedCountryRegAdd = countries.find(
        (c) => c.dial_code === regiAdd.countryCode
      );
      const countryRegAdd = selectedCountryRegAdd
        ? selectedCountryRegAdd.name
        : '';
      const selectedCountryCorAdd = countries.find(
        (c) => c.dial_code === CorrAdd.countryCode
      );
      const countryCorrAdd = selectedCountryCorAdd
        ? selectedCountryCorAdd.name
        : '';
      const selectedCountryiau1 = countries.find(
        (c) => c.dial_code === adminOneDetails.countryCode
      );
      const countryselectedCountryiau1 = selectedCountryiau1
        ? selectedCountryiau1.name
        : '';
      const selectedCountryiau2 = countries.find(
        (c) => c.dial_code === adminTwoDetails.countryCode
      );
      const countryselectedCountryiau2 = selectedCountryiau2
        ? selectedCountryiau2.name
        : '';
      if (selectedCountryRegAdd?.states) {
        setRegisteredStates(selectedCountryRegAdd.states);
        if (regiAdd.state) {
          const regStateObj = selectedCountryRegAdd.states.find(
            (s) => s.label === regiAdd.state
          );
          if (regStateObj?.districts) {
            setRegisteredDistricts(regStateObj.districts);

            // if (regiAdd.district) {
            //   const regDistrictObj = regStateObj.districts.find(
            //     (d) => d.label === regiAdd.district
            //   );

            // }
          }
        }
      }

      if (selectedCountryCorAdd?.states) {
        setCorrespondenceStates(selectedCountryCorAdd.states);
        if (CorrAdd.state) {
          const regStateObj = selectedCountryCorAdd.states.find(
            (s) => s.label === CorrAdd.state
          );
          if (regStateObj?.districts) {
            setCorrespondenceDistricts(regStateObj.districts);

            // if (regiAdd.district) {
            //   const regDistrictObj = regStateObj.districts.find(
            //     (d) => d.label === CorrAdd.district
            //   );

            // }
          }
        }
      }

      const regulatorOptions = formatRegulatorsForSelect(regulators);
      const constitutionOptions = formatConstitutionsForSelect(constitutions);
      const institutionTypeOptions = formatInstitutionTypesForSelect(
        institutionTypes,
        entDetail.regulator
      );
      setRegulationOptionDD(regulatorOptions);
      setconstitutionOptionsDD(constitutionOptions);
      setInstitutionTypeOptionsDD(institutionTypeOptions);

      // Find specific documents
      const boardResolution = documents.find(
        (doc) => doc.documentType === 'NO_BOARD_RESOLUTION'
      );

      const certifiedPoi = documents.find(
        (doc) => doc.documentType === 'NO_CERTIFIED_POI'
      );
      const rePan = documents.find((doc) => doc.documentType === 'RE_PAN');
      const reCin = documents.find((doc) => doc.documentType === 'RE_CIN');
      const reRL = documents.find(
        (doc) => doc.documentType === 'REGULATOR_LICENCE'
      );
      const AddProof = documents.find(
        (doc) => doc.documentType === 'ADDRESS_PROOF'
      );
      const other = documents.find(
        (doc) => doc.documentType === 'RE_OTHER_FILE'
      );
      const aLadminone = documents.find(
        (doc) => doc.documentType === 'IAU_ONE_AUTHORIZATION_LETTER'
      );
      const aLadmintwo = documents.find(
        (doc) => doc.documentType === 'IAU_TWO_AUTHORIZATION_LETTER'
      );
      const poiadminone = documents.find(
        (doc) => doc.documentType === 'IAU_ONE_CERTIFIED_POI'
      );
      const poiadmintwo = documents.find(
        (doc) => doc.documentType === 'IAU_TWO_CERTIFIED_POI'
      );
      setBoardResolutionDoc(boardResolution);
      setCertifiedPoiDoc(certifiedPoi);
      //setCertifiedPicDoc(certifiedPic);
      setRePanDOC(rePan);
      setReCinDoc(reCin);
      setRegulatorLiscence(reRL);
      //setRegistrationCerDoc(reCer);
      setAddressProofDoc(AddProof);
      setReOtherDoc(other);
      setauthLetterDocadmin1(aLadminone);
      setauthLetterDocadmin2(aLadmintwo);
      setCertifiedPoiDocadmin1(poiadminone);
      setCertifiedPoiDocadmin2(poiadmintwo);
      // setCertifiedPicDocadmin1(picadminone);
      //setCertifiedPicDocadmin2(picadmintwo);
      // Convert base64 to File objects if documents exist

      formik.setValues({
        ...formik.values,
        nodalOfficer: {
          ...formik.values.nodalOfficer,
          citizenship: nodalData.citizenship || '',
          countryName: countryName,
          ckycNumber: nodalData.ckycNo || '',
          title: nodalData.title || '',
          firstName: nodalData.firstName || '',
          middleName: nodalData.middleName || '',
          lastName: nodalData.lastName || '',
          gender: nodalData.gender || '',
          dateOfBirth: dateOfBirth,
          designation: nodalData.designation || '',
          officeAddress: '', // Not in API response
          email: nodalData.email || '',
          countryCode: nodalData.countryCode || '',
          mobileNumber: nodalData.mobileNumber || '',
          landlineNumber: nodalData.landline || '',
          employeeCode: empCode, // Not in API response
          proofOfIdentity: nodalData.proofOfIdentity || '',
          proofOfIdentityNumber: nodalData.identityNumber || '',
          boardResolutionDate: boardResolutionDate,
          sameAsRegisteredAddress: nodalData.sameAsRegisteredAddress || false,
          // boardResolution: boardResolutionFile,
          // certifiedPoi: certifiedPoiFile,
        },
        hoi: {
          ...formik.values.hoi,
          citizenship: hoi.citizenship || '',
          countryName: countryNamehoi,
          ckycNumber: hoi.ckycNumber || '',
          title: hoi.title || '',
          firstName: hoi.firstName || '',
          middleName: hoi.middleName || '',
          lastName: hoi.lastName || '',
          gender: hoi.gender || '',
          designation: hoi.designation || '',
          email: hoi.emailId || '',
          countryCode: hoi.countryCode || '',
          mobileNumber: hoi.mobileNo || '',
          landlineNumber: hoi.landline || '',
        },
        registerAddress: {
          line1: regiAdd.line1,
          line2: regiAdd.line2 || '',
          line3: regiAdd.line3 || '',
          countryName: countryRegAdd,
          countryCode: regiAdd.countryCode || '',
          state: regiAdd.state || '',
          district: regiAdd.district || '',
          cityTown: regiAdd.cityTown || '',
          pinCode: regiAdd.pinCode || '',
          alternatePinCode: regiAdd.alternatePinCode || '',
          id: '',
        },
        correspondenceAddress: {
          line1: CorrAdd.line1,
          line2: CorrAdd.line2 || '',
          line3: CorrAdd.line3 || '',
          countryName: countryCorrAdd,
          countryCode: CorrAdd.countryCode || '',
          state: CorrAdd.state || '',
          district: CorrAdd.district || '',
          cityTown: CorrAdd.cityTown || '',
          pinCode: CorrAdd.pinCode || '',
          alternatePinCode: CorrAdd.alternatePinCode || '',
          id: '',
        },
        correspondenceAddressSameAsRegisteredAddress:
          correspondenceAddressSameAsRegisteredAddress,
        entityDetails: {
          ...formik.values.entityDetails,
          regulator: entDetail.regulator,
          constitution: entDetail.constitution,
          institutionType: entDetail.institutionType,
          cinNo: entDetail.cinNo,

          fiCode: '',
          gstinNo: entDetail.gstinNo,

          llpinNo: entDetail.llpinNo || '',
          nameOfInstitution: entDetail.nameOfInstitution || '',
          operationalStatus: '',
          panNo: entDetail.panNo,
          proprietorName: entDetail.proprietorName || '',
          reId: '',
          reWebsite: entDetail.reWebsite || '',
          registrationNo: entDetail.registrationNo || '',
        },
        adminOneDetails: {
          ...formik.values.adminOneDetails,
          authorizationLetterDetails:
            adminOneDetails.authorizationLetterDetails,
          citizenship: adminOneDetails.citizenship,
          ckycNumber: adminOneDetails.ckycNumber,
          countryCode: adminOneDetails.countryCode,
          dateOfAuthorization: dateOfAuthorizationadmin1,
          dateOfBirth: dateOfBirthadmin1,
          designation: adminOneDetails.designation,
          emailId: adminOneDetails.emailId,
          employeeCode: adminOneDetails.employeeCode,
          firstName: adminOneDetails.firstName,
          gender: adminOneDetails.gender,
          id: '',
          identityNumber: adminOneDetails.identityNumber,
          landline: adminOneDetails.landline,
          lastName: adminOneDetails.lastName,
          middleName: adminOneDetails.middleName,
          mobileNo: adminOneDetails.mobileNo,
          proofOfIdentity: adminOneDetails.proofOfIdentity,
          sameAsRegisteredAddress:
            adminOneDetails.sameAsRegisteredAddress || '',
          title: adminOneDetails.title,
          countryName: countryselectedCountryiau1,
        },
        adminTwoDetails: {
          ...formik.values.adminOneDetails,
          authorizationLetterDetails:
            adminTwoDetails.authorizationLetterDetails,
          citizenship: adminTwoDetails.citizenship,
          ckycNumber: adminTwoDetails.ckycNumber,
          countryCode: adminTwoDetails.countryCode,
          dateOfAuthorization: dateOfAuthorizationadmin2,
          dateOfBirth: dateOfBirthadmin2,
          designation: adminTwoDetails.designation,
          emailId: adminTwoDetails.emailId,
          employeeCode: adminTwoDetails.employeeCode,
          firstName: adminTwoDetails.firstName,
          gender: adminTwoDetails.gender || '',
          id: '',
          identityNumber: adminTwoDetails.identityNumber,
          landline: adminTwoDetails.landline,
          lastName: adminTwoDetails.lastName,
          middleName: adminTwoDetails.middleName,
          mobileNo: adminTwoDetails.mobileNo,
          proofOfIdentity: adminTwoDetails.proofOfIdentity,
          sameAsRegisteredAddress:
            adminTwoDetails.sameAsRegisteredAddress || '',
          title: adminTwoDetails.title || '',
          countryName: countryselectedCountryiau2,
        },
      });
    } else {
      console.error('Unexpected data structure:', nodalDataResponse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPreviewData]);

  const [isESigned, setIsESigned] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(showLoader('Please wait...'));
    try {
      setIsESigned(false);
      const response = await dispatch(
        generatePdfPreviewUpdate({ updationId })
      ).unwrap();

      if (response?.data?.pdf) {
        setPdfData(response.data.pdf);
        setShowViewer(true);
      } else {
        console.warn('No PDF returned');
        console.log('In the pdf Preview response else');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF');
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleESign = async (formData: {
    place: string;
    date: string;
    consent: boolean;
    updationId: string;
  }): Promise<string> => {
    try {
      const resultAction = await dispatch(initiateESignatureUpdate(formData));

      if (initiateESignatureUpdate.fulfilled.match(resultAction)) {
        const signedPdfBase64 = resultAction.payload.data.pdf;
        setPdfData(signedPdfBase64);
        setShowViewer(true);
        setIsESigned(true);
        return signedPdfBase64; // <-- return this string to satisfy the type
      } else {
        console.error(
          'ESign failed:',
          resultAction.payload || resultAction.error
        );
        throw new Error(resultAction.payload || 'eSignature failed');
      }
      console.log('Esignn');
    } catch (error) {
      console.error('Unexpected error:', error);
      throw error;
    }
  };

  return (
    <>
      <Box sx={{ p: 4, backgroundColor: '#fefefeff' }}>
        <BreadcrumbUpdateProfile
          breadcrumbItems={[
            { label: 'Update Profile', href: '/re/dashboard' },
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
        <Box sx={{ mt: 5 }}>
          <Typography sx={trackTitle}>Form Preview</Typography>
        </Box>

        <AccordionDetails sx={{ pl: 0, ml: -12 }}>
          <>
            <EntityFormContainer sx={{ mt: 0 }}>
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
                      '&.Mui-expanded': {
                        minHeight: '50px !important',
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
                      <Typography sx={titleStyles}>Entity Profile</Typography>
                      <Typography
                        sx={{
                          color: '#002cba',
                          fontWeight: '500',
                          fontSize: '16px',
                          mr: 1,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // stop accordion toggle
                          e.preventDefault();
                          navigate('/re/update-entity-details');
                        }}
                      >
                        Edit
                      </Typography>
                    </Box>

                    {/* Arrow still rotates */}
                  </StyledAccordionSummary>

                  <StyledAccordionDetails>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* Address Line 1 */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Name of Institution
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="HDFC Bank"
                          value={formik.values.entityDetails.nameOfInstitution}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Regulator */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Regulator<span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="correspondence-address-state"
                            name="state"
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                            value={formik.values.entityDetails.regulator}
                            displayEmpty
                            disabled={true}
                            native // This makes it a native select, so you need native options
                          >
                            <option value="">Select</option>
                            {regulationOptionDD.length > 0 &&
                              regulationOptionDD.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                          </Select>
                        </FormControl>
                      </Box>
                      {/* Institution Type */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Institution Type
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="correspondence-address-state"
                            name="state"
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                            value={
                              formik.values.entityDetails.institutionType || ''
                            }
                            displayEmpty
                            disabled={true}
                            native
                          >
                            <option value="">Select</option>
                            {institutionTypeOptionsDD.length > 0 &&
                              institutionTypeOptionsDD.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* Constitution */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Constitution <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="correspondence-address-state"
                            name="state"
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                            value={
                              formik.values.entityDetails.constitution || ''
                            }
                            displayEmpty
                            disabled={true}
                            native
                          >
                            <option value="">Select</option>
                            {constitutionOptionsDD.length > 0 &&
                              constitutionOptionsDD.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Proprietor Name */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Proprietor Name
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="HDFC Bank"
                          value={formik.values.entityDetails.proprietorName}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          //className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          Regulator License/Certificate
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            placeholder="Enter PAN Number"
                            value={formik.values.entityDetails.panNo}
                            disabled={true}
                            sx={inputStyles}
                            fullWidth
                            size="small"
                          />

                          {regulatorLiscence && (
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 1.5, // tighter spacing like screenshot
                                width: 48, // 👈 smaller width
                                height: 48, // 👈 smaller height
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${regulatorLiscence?.base64Content}` ||
                                  ''
                                }
                                alt="Uploaded Document"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ccc',
                                }}
                              />
                            </Box>
                          )}
                        </Box>

                        {/* File Preview with Success Tick */}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* PAN  */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          // className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          PAN <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {/* Input + Upload Button + Preview */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            placeholder="Enter PAN Number"
                            value={formik.values.entityDetails.panNo}
                            disabled={true}
                            sx={inputStyles}
                            fullWidth
                            size="small"
                          />

                          {/* Preview with success tick */}
                          {rePanDOC && (
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 1,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${rePanDOC?.base64Content}` ||
                                  ''
                                }
                                alt="Preview"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                      {/* CIN  */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          // className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          CIN <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {/* Input + Upload Button + Preview */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            placeholder="Enter CIN Number"
                            value={formik.values.entityDetails.cinNo}
                            disabled={true}
                            fullWidth
                            size="small"
                            sx={inputStyles}
                          />

                          {/* Preview with success tick */}
                          {reCinDoc && (
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 1,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${reCinDoc?.base64Content}` ||
                                  ''
                                }
                                alt="Preview"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                      {/* LLPIN  */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          LLPIN (Limited liability Partnership firm)
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          placeholder="ABC-1234"
                          sx={inputStyles}
                          value={formik.values.entityDetails.llpinNo}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* GSTIN  */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          GSTIN<span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="22ABCDE1234F1Z5"
                          value={formik.values.entityDetails.gstinNo}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      {/* RE Website  */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          RE Website URL
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="reportingentity.com"
                          value={formik.values.entityDetails.reWebsite}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          //className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          Address Proof
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {addressProofDoc && (
                            <Box
                              sx={{
                                position: 'relative',
                                width: 48, // 👈 smaller width
                                height: 48, // 👈 smaller height
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${addressProofDoc?.base64Content}` ||
                                  ''
                                }
                                alt="Uploaded Document"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ccc',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* Other */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          //className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          Other
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {/* File Preview with Success Tick */}
                          {reOtherDoc && (
                            <Box
                              sx={{
                                position: 'relative',
                                // ml: 1.5, // tighter spacing like screenshot
                                width: 48, // 👈 smaller width
                                height: 48, // 👈 smaller height
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${reOtherDoc?.base64Content}` ||
                                  ''
                                }
                                alt="Uploaded Document"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ccc',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
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
                      '&.Mui-expanded': {
                        minHeight: '50px !important',
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
                        Registered Address
                      </Typography>
                      <Typography
                        sx={{
                          color: '#002cba',
                          fontWeight: '500',
                          fontSize: '16px',
                          mr: 1,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // stop accordion toggle
                          e.preventDefault();
                          navigate('/re/update-address-details');
                        }}
                      >
                        Edit
                      </Typography>
                    </Box>
                  </StyledAccordionSummary>
                  <StyledAccordionDetails>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 2,
                      }}
                    >
                      {/* Address Line 1 */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant="body2" sx={labelStyles}>
                            Address Line 1
                          </Typography>
                          <TextField
                            sx={inputStyles}
                            id="address-linetwo"
                            name="registeredAddress.line1"
                            placeholder="Add address here"
                            value={formik.values.registerAddress.line1 || ''}
                            disabled={true}
                            fullWidth
                            size="small"
                          />
                        </Box>
                      </Box>

                      {/* Address Line 2 */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Address Line 2
                        </Typography>
                        <TextField
                          sx={inputStyles}
                          id="address-linetwo"
                          name="registeredAddress.line2"
                          placeholder="Add address here"
                          value={formik.values.registerAddress.line2 || ''}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Address Line 3 */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Address Line 3 <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          sx={inputStyles}
                          id="address-linetwo"
                          name="registeredAddress.line3"
                          placeholder="Add address here"
                          value={formik.values.registerAddress.line3 || ''}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Wrapper Box */}
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant="body2" sx={labelStyles}>
                            Country<span style={{ color: 'red' }}>*</span>
                          </Typography>

                          <FormControl fullWidth size="small">
                            <Select
                              value={formik?.values.registerAddress.countryCode}
                              disabled={true}
                              displayEmpty
                              sx={selectStyles}
                              IconComponent={KeyboardArrowDown}
                            >
                              {countries.map((country) => (
                                <MenuItem
                                  key={country.code}
                                  value={country.dial_code}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                    }}
                                  >
                                    <Typography>{country.name}</Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200, mb: 2 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          State/UT <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        {formik.values.registerAddress?.countryCode ===
                        '+91' ? (
                          <FormControl fullWidth size="small">
                            <Select
                              sx={selectStyles}
                              id="registeredAddress.state"
                              name="registeredAddress.state"
                              IconComponent={KeyboardArrowDown}
                              value={formik.values.registerAddress.state}
                              displayEmpty
                              native
                              disabled={true}
                            >
                              <option value="">Select a state</option>
                              {registeredStates.map((state) => (
                                <option key={state.value} value={state.value}>
                                  {state.label}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            id="registeredAddress.state"
                            name="registeredAddress.state"
                            type="text"
                            placeholder="Enter State/UT"
                            disabled={true}
                            value={formik.values.registerAddress.state}
                          />
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          District <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {formik.values.registerAddress?.countryCode ===
                        '+91' ? (
                          <FormControl fullWidth size="small">
                            <Select
                              sx={selectStyles}
                              id="registered-address-district"
                              IconComponent={KeyboardArrowDown}
                              native
                              name="district"
                              value={
                                formik.values?.registerAddress?.district || ''
                              }
                              disabled={true}
                            >
                              {' '}
                              <option value="">Select District</option>
                              {registeredDistricts.map((district) => (
                                <option
                                  key={district.value}
                                  value={district.value}
                                >
                                  {district.label}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            id="address-linethree"
                            name="registerAddress.district"
                            placeholder="Add address here"
                            value={
                              formik.values.registerAddress?.district || ''
                            }
                            disabled={true}
                            fullWidth
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        mb: 2,
                      }}
                    >
                      {/* City/Town */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography
                          className="label"
                          variant="body2"
                          sx={labelStyles}
                        >
                          City/Town<span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <TextField
                          sx={inputStyles}
                          id="address-linetwo"
                          name="registerAddress.cityTown"
                          placeholder="Add address here"
                          value={formik.values.registerAddress.cityTown || ''}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Pin Code */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Pin Code <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <TextField
                          sx={inputStyles}
                          id="address-linetwo"
                          name="registerAddress.pinCode"
                          placeholder="Add address here"
                          value={formik.values.registerAddress.pinCode || ''}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Alternate Pin Code */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Digipin
                        </Typography>
                        <TextField
                          sx={inputStyles}
                          id="registeredaddress-pincode-others"
                          fullWidth
                          size="small"
                          type="text"
                          name="alternatePinCode"
                          placeholder="Enter Pin Code"
                          value={
                            formik.values.registerAddress?.alternatePinCode ||
                            ''
                          }
                          disabled={true}
                        />
                      </Box>
                    </Box>
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
                      '&.Mui-expanded': {
                        minHeight: '50px !important',
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
                        Correspondence Address
                      </Typography>
                      <Typography
                        sx={{
                          color: '#002cba',
                          fontWeight: '500',
                          fontSize: '16px',
                          mr: 1,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // stop accordion toggle
                          e.preventDefault();
                          navigate('/re/update-address-details');
                        }}
                      >
                        Edit
                      </Typography>
                    </Box>
                  </StyledAccordionSummary>
                  <StyledAccordionDetails>
                    <div
                      className="checkbox-container"
                      style={{
                        marginBottom: '15px',
                        marginTop: '0px',
                        display: 'flex',
                        alignItems: 'center',
                        // gap: '8px',
                      }}
                    >
                      <label
                        htmlFor="useSameAddress"
                        style={{
                          fontFamily: 'Gilroy-Semibold, sans-serif',
                          fontWeight: 500, // Medium weight
                          fontSize: '16px',
                          marginLeft: '-5px', // Remove default margins
                          cursor: 'pointer', // Show pointer on hover
                        }}
                      >
                        Same as registered address
                      </label>
                      <input
                        type="checkbox"
                        className="input-quie"
                        id="useSameAddress"
                        name="useSameAddress"
                        disabled={true}
                        checked={
                          formik.values
                            .correspondenceAddressSameAsRegisteredAddress
                        }
                        style={{
                          marginLeft: '17px',
                          maxWidth: '27px',
                          height: '18px',
                        }} // Remove default margins
                      />
                    </div>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* Address Line 1 */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Address Line 1 <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          sx={inputStyles}
                          id="address-linetwo"
                          name="correspondenceAddress.line2"
                          placeholder="Add address here"
                          value={
                            formik.values.correspondenceAddress.line1 || ''
                          }
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Address Line 2 */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Address Line 2
                        </Typography>
                        <TextField
                          sx={inputStyles}
                          id="address-linetwo"
                          name="correspondenceAddress.line2"
                          placeholder="Add address here"
                          value={
                            formik.values.correspondenceAddress.line2 || ''
                          }
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Address Line 3 */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Address Line 3
                        </Typography>
                        <TextField
                          sx={inputStyles}
                          id="address-linethree"
                          name="correspondenceAddress.line3"
                          placeholder="Add address here"
                          value={
                            formik.values.correspondenceAddress.line3 || ''
                          }
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Country<span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            value={
                              formik?.values.correspondenceAddress.countryCode
                            }
                            //onChange={(e) => handleCountryChange(e)}
                            disabled={true}
                            displayEmpty
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                          >
                            {countries.map((country) => (
                              <MenuItem
                                key={country.code}
                                value={country.dial_code}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Typography>{country.name}</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200, mb: 2 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          State/UT <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {formik.values.correspondenceAddress?.countryCode ===
                        '+91' ? (
                          <FormControl fullWidth size="small">
                            <Select
                              sx={selectStyles}
                              id="correspondence-address-state"
                              name="state"
                              value={
                                formik.values.correspondenceAddress?.state || ''
                              }
                              disabled={true}
                              displayEmpty
                              IconComponent={KeyboardArrowDown}
                              native
                            >
                              <option value="">Select a state</option>
                              {correspondenceStates.map((state) => (
                                <option key={state.value} value={state.value}>
                                  {state.label}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            sx={inputStyles}
                            id="address-linethree"
                            name="correspondenceAddress.line3"
                            placeholder="Add address here"
                            value={
                              formik.values.correspondenceAddress?.state || ''
                            }
                            disabled={true}
                            fullWidth
                            size="small"
                          />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          District <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        {formik.values.correspondenceAddress?.countryCode ===
                        '+91' ? (
                          <FormControl fullWidth size="small">
                            {' '}
                            <Select
                              sx={selectStyles}
                              id="registered-address-district"
                              native
                              name="district"
                              value={
                                formik.values?.correspondenceAddress
                                  ?.district || ''
                              }
                              disabled={true}
                              IconComponent={KeyboardArrowDown}
                            >
                              <option value="">Select District</option>
                              {correspondenceDistricts.map((district) => (
                                <option
                                  key={district.value}
                                  value={district.value}
                                >
                                  {district.label}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            sx={inputStyles}
                            id="address-linethree"
                            name="correspondenceAddress.line3"
                            placeholder="Add address here"
                            value={
                              formik.values?.correspondenceAddress?.district ||
                              ''
                            }
                            disabled={true}
                            fullWidth
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          City/Town <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          sx={inputStyles}
                          id="address-linethree"
                          name="correspondenceAddress.cityTown"
                          placeholder="Add address here"
                          value={
                            formik.values.correspondenceAddress.cityTown || ''
                          }
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Pin Code */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Pin Code <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <TextField
                          sx={inputStyles}
                          id="address-linethree"
                          name="correspondenceAddress.pinCode"
                          placeholder="Add address here"
                          value={
                            formik.values.correspondenceAddress.pinCode || ''
                          }
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Alternate Pin Code */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Digipin
                        </Typography>
                        <TextField
                          sx={inputStyles}
                          id="registeredaddress-pincode-others"
                          fullWidth
                          size="small"
                          type="text"
                          name="alternatePinCode"
                          placeholder="Enter Pin Code"
                          value={
                            formik.values?.correspondenceAddress
                              ?.alternatePinCode || ''
                          }
                          disabled={true}
                        />
                      </Box>
                    </Box>
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
                      '&.Mui-expanded': {
                        minHeight: '50px !important',
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
                        Head of Institution Details
                      </Typography>
                      <Typography
                        sx={{
                          color: '#002cba',
                          fontWeight: '500',
                          fontSize: '16px',
                          mr: 1,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // stop accordion toggle
                          e.preventDefault();
                          navigate('/re/update-institutional-details');
                        }}
                      >
                        Edit
                      </Typography>
                    </Box>
                  </StyledAccordionSummary>

                  <StyledAccordionDetails>
                    {/* First Row */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* Citizenship */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Citizenship <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="citizenship"
                            sx={selectStyles}
                            value={formik.values.hoi.citizenship}
                            disabled={true}
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select Citizenship</option>
                            {citizenships.map(
                              (citizenship: { code: string; name: string }) => (
                                <option
                                  key={citizenship.code}
                                  value={citizenship.name}
                                >
                                  {citizenship.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* CKYC Number */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          CKYC Number {<span style={{ color: 'red' }}>*</span>}
                        </Typography>
                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            type="text"
                            sx={inputStyles}
                            name="ckycNumber"
                            placeholder="Enter CKYC number"
                            value={formik.values.hoi.ckycNumber}
                            disabled={true}
                            fullWidth
                            size="small"
                          />

                          <Box
                            sx={{
                              color: '#52AE32',
                              fontWeight: 600,
                              px: 1.5,
                              fontSize: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              borderRadius: '4px',
                              height: '32px',
                            }}
                          >
                            <CheckCircleOutlineIcon sx={{ fontSize: '20px' }} />
                            Verified
                          </Box>
                        </Box>
                      </Box>

                      {/* Title */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Title <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="hoi.title"
                            sx={selectStyles}
                            disabled={true}
                            value={formik.values.hoi.title}
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select Title</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms">Ms</option>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

                    {/* Second Row - Names */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* First Name */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          First Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="firstName"
                          name="firstName"
                          sx={inputStyles}
                          placeholder="Enter First Name"
                          value={formik.values.hoi.firstName}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Middle Name */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Middle Name
                        </Typography>
                        <TextField
                          id="middleName"
                          name="middleName"
                          sx={inputStyles}
                          placeholder="Enter Middle Name"
                          value={formik.values.hoi.middleName}
                          fullWidth
                          disabled={true}
                          size="small"
                        />
                      </Box>

                      {/* Last Name */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Last Name <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <TextField
                          id="lastName"
                          name="lastName"
                          sx={inputStyles}
                          placeholder="Enter Last Name"
                          value={formik.values.hoi.lastName}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Third Row */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* Gender */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Gender <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="hoi.gender"
                            sx={selectStyles}
                            value={formik.values.hoi.gender}
                            IconComponent={KeyboardArrowDown}
                            disabled={true}
                          >
                            <option value="">Select Gender</option>
                            {genders.map(
                              (gender: { code: string; name: string }) => (
                                <option key={gender.code} value={gender.name}>
                                  {gender.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Designation <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="designation"
                          name="designation"
                          sx={inputStyles}
                          placeholder="Enter Designation"
                          value={formik.values.hoi.designation}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Email<span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="emailId"
                          name="emailId"
                          sx={inputStyles}
                          placeholder="Enter EmailId"
                          value={formik.values.hoi.email}
                          fullWidth
                          size="small"
                          disabled={true}
                        />
                      </Box>
                    </Box>

                    {/* Email */}

                    {/* Designation */}

                    {/* Fourth Row */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      {/* Country Code */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Country Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={formik?.values.hoi.countryCode}
                            disabled={true}
                            displayEmpty
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                          >
                            {countries.map((country) => (
                              <MenuItem
                                key={country.code}
                                value={country.dial_code}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Typography>{country.name}</Typography>
                                  <Typography>({country.dial_code})</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Mobile Number */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Mobile Number<span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="mobileNo"
                          name="mobileNo"
                          sx={inputStyles}
                          placeholder="Enter mobile number"
                          value={formik.values.hoi.mobileNumber}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      {/* Landline Number */}
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Landline Number
                        </Typography>
                        <TextField
                          id="landline"
                          sx={inputStyles}
                          name="landline"
                          placeholder="Enter landline number"
                          value={formik.values.hoi.landlineNumber}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>
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
                      '&.Mui-expanded': {
                        minHeight: '50px !important',
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
                        Nodal Officer Details
                      </Typography>
                      <Typography
                        sx={{
                          color: '#002cba',
                          fontWeight: '500',
                          fontSize: '16px',
                          mr: 1,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // stop accordion toggle
                          e.preventDefault();
                          navigate('/re/update-nodal-officer-details');
                        }}
                      >
                        Edit
                      </Typography>
                    </Box>
                  </StyledAccordionSummary>
                  <StyledAccordionDetails>
                    {/* new code start */}
                    {/* first step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Citizenship <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="citizenship"
                            sx={selectStyles}
                            value={formik.values.nodalOfficer.citizenship}
                            disabled={true}
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select Citizenship</option>
                            {citizenships.map(
                              (citizenship: { code: string; name: string }) => (
                                <option
                                  key={citizenship.code}
                                  value={citizenship.name}
                                >
                                  {citizenship.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          // className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          CKYC Number <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {/* Input with Verified status */}
                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            fullWidth
                            size="small"
                            sx={inputStyles}
                            name="nodalOfficer.ckycNumber"
                            disabled={true}
                            value={formik.values.nodalOfficer.ckycNumber}
                          />
                          <Box
                            sx={{
                              color: '#52AE32',
                              fontWeight: 600,
                              px: 1.5,
                              fontSize: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              borderRadius: '4px',
                              height: '32px',
                            }}
                          >
                            <CheckCircleOutlineIcon sx={{ fontSize: '20px' }} />
                            Verified
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Title <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="title"
                            sx={selectStyles}
                            disabled={true}
                            value={formik.values.nodalOfficer.title}
                          >
                            <option value="">Select Title</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms">Ms</option>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* second step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          First Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="First Name"
                          value={formik.values.nodalOfficer.firstName}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Middle Name
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Middle Name"
                          value={formik.values.nodalOfficer.middleName}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Last Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Last Name"
                          disabled={true}
                          value={formik.values.nodalOfficer.lastName}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>
                    {/* third step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Gender <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            value={formik.values.nodalOfficer.gender}
                            disabled={true}
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select Gender</option>
                            {genders.map(
                              (gender: { code: string; name: string }) => (
                                <option key={gender.code} value={gender.name}>
                                  {gender.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Date of Birth <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              disabled={true}
                              value={
                                formik.values.nodalOfficer?.dateOfBirth
                                  ? dayjs(
                                      formik.values.nodalOfficer?.dateOfBirth
                                    )
                                  : null
                              }
                              maxDate={dayjs()}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  fullWidth: true, // 👈 make input take full width
                                  size: 'small', // optional: consistent with other inputs
                                  sx: {
                                    height: 45,
                                    '&.Mui-disabled': {
                                      backgroundColor: '#f5f5f5',
                                      '& fieldset': {
                                        borderColor: '#D9D9D9',
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Designation <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.nodalOfficer.designation}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>
                    {/* Four step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Employee Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="empCode"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.nodalOfficer.employeeCode}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Email <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="email"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.nodalOfficer.email}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Country Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={formik?.values.nodalOfficer.countryCode}
                            disabled={true}
                            displayEmpty
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                          >
                            {countries.map((country) => (
                              <MenuItem
                                key={country.code}
                                value={country.dial_code}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Typography>{country.name}</Typography>
                                  <Typography>({country.dial_code})</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* Five step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Mobile Number <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="mobileNumber"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.nodalOfficer.mobileNumber}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Landline Number
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="landlineNumber"
                          sx={inputStyles}
                          placeholder="Add Landline here"
                          value={
                            formik.values.nodalOfficer.landlineNumber || ''
                          }
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Office Address <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="sameAsRegisteredAddress"
                            name="sameAsRegisteredAddress"
                            sx={selectStyles}
                            className="only-input"
                            disabled={true}
                            value={
                              formik.values.nodalOfficer.sameAsRegisteredAddress
                                ? 'true'
                                : 'false'
                            } // Convert boolean to string
                            // onChange={(e) => {
                            //   // Convert string back to boolean
                            //   formik.setFieldValue("sameAsRegisteredAddress", e.target.value === "true");
                            // }}
                            onBlur={formik.handleBlur}
                            IconComponent={KeyboardArrowDown}
                          >
                            <MenuItem
                              value="true"
                              style={{ fontFamily: 'inherit' }}
                            >
                              Same as entity registered address
                            </MenuItem>
                            <MenuItem
                              value="false"
                              style={{ fontFamily: 'inherit' }}
                            >
                              Same as correspondence address
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* Six step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        <Typography variant="body2" sx={labelStyles}>
                          Proof of Identity{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small" disabled={true}>
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            value={formik.values.nodalOfficer.proofOfIdentity}
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select</option>
                            {proofOfIdentities.map(
                              (identity: { code: string; name: string }) => (
                                <option
                                  key={identity.code}
                                  value={identity.code}
                                >
                                  {identity.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>

                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          // className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          Proof of Identity Number{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {/* Input + Upload Button + Preview */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            placeholder="Enter PAN Number"
                            value={
                              formik.values.nodalOfficer.proofOfIdentityNumber
                            }
                            disabled={true}
                            sx={inputStyles}
                            fullWidth
                            size="small"
                          />

                          {certifiedPoiDoc && (
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 1,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${certifiedPoiDoc?.base64Content}` ||
                                  ''
                                }
                                alt="Preview"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                }}
                              />
                            </Box>
                          )}
                          {/* Preview with success tick */}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      ></Box>
                    </Box>
                    {/* Seven step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        <Typography variant="body2" sx={labelStyles}>
                          Date of Board Resolution for Appointment
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              //   open={open}
                              //   onOpen={() => setOpen(true)}
                              //   onClose={() => setOpen(false)}
                              value={
                                formik.values.nodalOfficer.dateOfBirth
                                  ? dayjs(
                                      formik.values.nodalOfficer.dateOfBirth
                                    )
                                  : null
                              }
                              // onChange={(date: Dayjs | null) => {
                              //   const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                              //   setFormData((prev: any) => ({
                              //     ...prev,
                              //     dateOfBirth: formatted,
                              //   }));
                              // }}
                              disabled={true}
                              maxDate={dayjs()}
                              //disabled={!isEditableField("NODAL_OFFICER_DETAILS", "noDateOfBirth")}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  // error: Boolean(formErrors.dateOfBirth),
                                  // helperText: formErrors.dateOfBirth || "",
                                  placeholder: 'DD/MM/YYYY',
                                  sx: {
                                    '& .MuiInputBase-root': {
                                      height: '35px', // ⬅ reduce overall height
                                    },
                                    '& .MuiInputBase-input': {
                                      padding: '0px 10px', // ⬅ smaller padding
                                      fontFamily: 'inherit',
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: '#f5f5f5',
                                      '& fieldset': {
                                        borderColor: '#D9D9D9',
                                      },
                                    },
                                  },
                                  InputProps: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton disabled={true}>
                                          <CalendarMonthIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        <Typography variant="body2" sx={labelStyles}>
                          Board Resolution{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <Box>
                          <div className="input-with-preview">
                            {boardResolutionDoc && (
                              <Box
                                sx={{
                                  position: 'relative',
                                  ml: 1,
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                <Box
                                  component="img"
                                  src={
                                    `data:image/jpeg;base64,${boardResolutionDoc?.base64Content}` ||
                                    ''
                                  }
                                  alt="Preview"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '4px',
                                    objectFit: 'cover',
                                    border: '1px solid #ddd',
                                  }}
                                />
                              </Box>
                            )}
                          </div>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      ></Box>
                    </Box>
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
                      '&.Mui-expanded': {
                        minHeight: '50px !important',
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
                          color: '#002cba',
                          fontWeight: '500',
                          fontSize: '16px',
                          mr: 1,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // stop accordion toggle
                          e.preventDefault();
                          navigate('/re/update-institutional-admin-details');
                        }}
                      >
                        Edit
                      </Typography>
                    </Box>
                  </StyledAccordionSummary>
                  <StyledAccordionDetails>
                    {/* new code start */}
                    {/* first step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Citizenship <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            value={formik.values.adminOneDetails.citizenship}
                            disabled={true}
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select Citizenship</option>
                            {citizenships.map(
                              (citizenship: { code: string; name: string }) => (
                                <option
                                  key={citizenship.code}
                                  value={citizenship.name}
                                >
                                  {citizenship.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>

                        {/* {formErrors.registeredAddress?.district && ( */}
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {/* {formErrors.registeredAddress.district} */}
                        </Typography>
                        {/* )} */}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          // className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          CKYC Number <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            fullWidth
                            size="small"
                            sx={inputStyles}
                            value={formik.values.adminOneDetails.ckycNumber}
                            disabled={true}
                          />
                          <Box
                            sx={{
                              color: '#52AE32',
                              fontWeight: 600,
                              px: 1.5,
                              fontSize: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              borderRadius: '4px',
                              height: '32px',
                            }}
                          >
                            <CheckCircleOutlineIcon sx={{ fontSize: '20px' }} />
                            Verified
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Title <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            disabled={true}
                            IconComponent={KeyboardArrowDown}
                            value={formik.values.adminOneDetails.title}
                          >
                            <option value="">Select Title</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms">Ms</option>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* second step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          First Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="First Name"
                          disabled={true}
                          value={formik.values.adminOneDetails.firstName}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Middle Name
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Middle Name"
                          disabled={true}
                          value={formik.values.adminOneDetails.middleName}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Last Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Last Name"
                          disabled={true}
                          value={formik.values.adminOneDetails.lastName}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>
                    {/* third step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Gender <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            disabled={true}
                            IconComponent={KeyboardArrowDown}
                            value={formik.values.adminOneDetails.gender}
                          >
                            <option value="">Select Gender</option>
                            {genders.map(
                              (gender: { code: string; name: string }) => (
                                <option key={gender.code} value={gender.name}>
                                  {gender.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Date of Birth <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              // open={open}
                              // onOpen={() => setOpen(true)}
                              // onClose={() => setOpen(false)}
                              value={
                                formik.values?.adminOneDetails.dateOfBirth
                                  ? dayjs(
                                      formik.values.adminOneDetails?.dateOfBirth
                                    )
                                  : null
                              }
                              // onChange={(date: Dayjs | null) => {
                              //   const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                              //   setFormData((prev: any) => ({
                              //     ...prev,
                              //     dateOfBirth: formatted,
                              //   }));
                              // }}
                              // maxDate={dayjs()}
                              disabled={true}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  placeholder: 'DD/MM/YYYY',
                                  sx: {
                                    '& .MuiInputBase-root': {
                                      height: '35px', // ⬅ reduce overall height
                                    },
                                    '& .MuiInputBase-input': {
                                      padding: '0px 10px', // ⬅ smaller padding
                                      fontFamily: 'inherit',
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: '#f5f5f5',
                                      '& fieldset': {
                                        borderColor: '#D9D9D9',
                                      },
                                    },
                                  },
                                  InputProps: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton disabled={true}>
                                          <CalendarMonthIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Designation <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="adminOneDetails.designation"
                          sx={inputStyles}
                          placeholder="Add address here"
                          disabled={true}
                          value={formik.values.adminOneDetails.designation}
                          fullWidth
                          size="small"
                        />
                      </Box>
                    </Box>
                    {/* Four step */}

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Employee Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          disabled={true}
                          value={formik.values.adminOneDetails.employeeCode}
                          fullWidth
                          size="small"
                          // error={!!formErrors.registeredAddress?.line1}
                          // helperText={formErrors.registeredAddress?.line1}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Email <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          disabled={true}
                          value={formik.values.adminOneDetails.emailId}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Country Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={formik?.values.adminOneDetails.countryCode}
                            disabled={true}
                            displayEmpty
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                          >
                            {countries.map((country) => (
                              <MenuItem
                                key={country.code}
                                value={country.dial_code}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Typography>{country.name}</Typography>
                                  <Typography>({country.dial_code})</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* Five step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Mobile Number <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="adminOneDetails.mobileNo"
                          sx={inputStyles}
                          placeholder="Add address here"
                          disabled={true}
                          value={formik.values.adminOneDetails.mobileNo}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Landline Number{' '}
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          disabled={true}
                          value={formik.values.adminOneDetails.landline}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Office Address <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="sameAsRegisteredAddress"
                            name="adminOneDetails.sameAsRegisteredAddress"
                            sx={selectStyles}
                            disabled={true}
                            value={
                              formik.values.adminOneDetails
                                .sameAsRegisteredAddress
                                ? 'true'
                                : 'false'
                            } // Convert boolean to string
                            // onChange={(e) => {
                            //   // Convert string back to boolean
                            //   formik.setFieldValue("sameAsRegisteredAddress", e.target.value === "true");
                            // }}
                            IconComponent={KeyboardArrowDown}
                            onBlur={formik.handleBlur}
                          >
                            <MenuItem
                              value="true"
                              style={{ fontFamily: 'inherit' }}
                            >
                              Same as entity registered address
                            </MenuItem>
                            <MenuItem
                              value="false"
                              style={{ fontFamily: 'inherit' }}
                            >
                              Same as correspondence address
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* Six step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        <Typography variant="body2" sx={labelStyles}>
                          Proof of Identity{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            disabled={true}
                            value={
                              formik.values.adminOneDetails.proofOfIdentity
                            }
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select</option>
                            {proofOfIdentities.map(
                              (identity: { code: string; name: string }) => (
                                <option
                                  key={identity.code}
                                  value={identity.code}
                                >
                                  {identity.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          // className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          Proof of Identity Number{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {/* Input + Upload Button + Preview */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            placeholder="Enter PAN Number"
                            value={formik.values.adminOneDetails.identityNumber}
                            disabled={true}
                            sx={inputStyles}
                            fullWidth
                            size="small"
                          />

                          {certifiedPoiDocadmin1 && (
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 1,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${certifiedPoiDocadmin1?.base64Content}` ||
                                  ''
                                }
                                alt="Preview"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                }}
                              />
                            </Box>
                          )}
                          {/* Preview with success tick */}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      ></Box>
                    </Box>
                    {/* Seven step */}

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        <Typography variant="body2" sx={labelStyles}>
                          Date of Authorization
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              //   open={open}
                              //   onOpen={() => setOpen(true)}
                              //   onClose={() => setOpen(false)}

                              value={
                                formik.values.adminOneDetails
                                  .dateOfAuthorization
                                  ? dayjs(
                                      formik.values.adminOneDetails
                                        .dateOfAuthorization
                                    )
                                  : null
                              }
                              // onChange={(date: Dayjs | null) => {
                              //   const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                              //   setFormData((prev: any) => ({
                              //     ...prev,
                              //     dateOfBirth: formatted,
                              //   }));
                              // }}
                              //   maxDate={dayjs()}
                              disabled={true}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  //   error: Boolean(formErrors.dateOfBirth),
                                  //   helperText: formErrors.dateOfBirth || "",
                                  placeholder: 'DD/MM/YYYY',
                                  sx: {
                                    '& .MuiInputBase-root': {
                                      height: '35px', // ⬅ reduce overall height
                                    },
                                    '& .MuiInputBase-input': {
                                      padding: '0px 10px', // ⬅ smaller padding
                                      fontFamily: 'inherit',
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: '#f5f5f5',
                                      '& fieldset': {
                                        borderColor: '#D9D9D9',
                                      },
                                    },
                                  },
                                  InputProps: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton disabled={true}>
                                          <CalendarMonthIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          // className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          Authorization Letter by competent Authority{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {/* Input + Upload Button + Preview */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            placeholder="Enter PAN Number"
                            value={
                              formik.values.adminOneDetails
                                .authorizationLetterDetails
                            }
                            disabled={true}
                            sx={inputStyles}
                            fullWidth
                            size="small"
                          />

                          {/* Preview with success tick */}
                          {authLetterDocadmin2 && (
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 1,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${authLetterDocadmin2?.base64Content}` ||
                                  ''
                                }
                                alt="Preview"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      ></Box>
                    </Box>

                    {/* new code start */}
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
                      '&.Mui-expanded': {
                        minHeight: '50px !important',
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
                        Institutional Admin User 2 Details
                      </Typography>
                      <Typography
                        sx={{
                          color: '#002cba',
                          fontWeight: '500',
                          fontSize: '16px',
                          mr: 1,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // stop accordion toggle
                          e.preventDefault();
                          navigate('/re/update-institutional-admin-details');
                        }}
                      >
                        Edit
                      </Typography>
                    </Box>
                  </StyledAccordionSummary>
                  <StyledAccordionDetails>
                    {/* new code start */}
                    {/* first step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Citizenship <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="citizenship"
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                            value={formik.values.adminTwoDetails.citizenship}
                            disabled={true}
                          >
                            <option value="">Select Citizenship</option>
                            {citizenships.map(
                              (citizenship: { code: string; name: string }) => (
                                <option
                                  key={citizenship.code}
                                  value={citizenship.name}
                                >
                                  {citizenship.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={{ mb: 0.5, fontWeight: 500 }}
                          className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          CKYC Number <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            fullWidth
                            size="small"
                            sx={inputStyles}
                            disabled={true}
                            value={formik.values.adminTwoDetails.ckycNumber}
                          />
                          <Box
                            sx={{
                              color: '#52AE32',
                              fontWeight: 600,
                              px: 1.5,
                              fontSize: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              borderRadius: '4px',
                              height: '32px',
                            }}
                          >
                            <CheckCircleOutlineIcon sx={{ fontSize: '20px' }} />
                            Verified
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Title <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            disabled={true}
                            IconComponent={KeyboardArrowDown}
                            value={formik.values.adminTwoDetails.title || ''}
                          >
                            <option value="">Select Title</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms">Ms</option>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* second step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          First Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="First Name"
                          value={formik.values.adminTwoDetails.firstName}
                          disabled={true}
                          fullWidth
                          size="small"
                          // error={!!formErrors.registeredAddress?.line1}
                          // helperText={formErrors.registeredAddress?.line1}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Middle Name
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Middle Name"
                          value={formik.values.adminTwoDetails.middleName}
                          disabled={true}
                          // required={isEditableField("ADDRESS_DETAILS", "registeredAddressLine1")}
                          fullWidth
                          size="small"
                          // error={!!formErrors.registeredAddress?.line1}
                          // helperText={formErrors.registeredAddress?.line1}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Last Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Last Name"
                          value={formik.values.adminTwoDetails.lastName}
                          disabled={true}
                          fullWidth
                          size="small"
                          // error={!!formErrors.registeredAddress?.line1}
                          // helperText={formErrors.registeredAddress?.line1}
                        />
                      </Box>
                    </Box>
                    {/* third step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Gender <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            value={formik.values.adminTwoDetails.gender}
                            disabled={true}
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select Gender</option>
                            {genders.map(
                              (gender: { code: string; name: string }) => (
                                <option key={gender.code} value={gender.name}>
                                  {gender.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>

                        {/* )} */}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Date of Birth<span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={
                                formik.values?.adminTwoDetails.dateOfBirth
                                  ? dayjs(
                                      formik.values?.adminTwoDetails.dateOfBirth
                                    )
                                  : null
                              }
                              disabled={true}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  // error: Boolean(formErrors.dateOfBirth),
                                  // helperText: formErrors.dateOfBirth || "",
                                  placeholder: 'DD/MM/YYYY',
                                  sx: {
                                    '& .MuiInputBase-root': {
                                      height: '15px', // ⬅ reduce overall height
                                    },
                                    '& .MuiInputBase-input': {
                                      padding: '0px', // ⬅ smaller padding
                                      fontFamily: 'inherit',
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: '#f5f5f5',
                                      '& fieldset': {
                                        borderColor: '#D9D9D9',
                                      },
                                    },
                                  },
                                  InputProps: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton disabled={true}>
                                          <CalendarMonthIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Designation <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.adminTwoDetails.designation}
                          disabled={true}
                          fullWidth
                          size="small"
                          // error={!!formErrors.registeredAddress?.line1}
                          // helperText={formErrors.registeredAddress?.line1}
                        />
                      </Box>
                    </Box>
                    {/* Four step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Employee Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.adminTwoDetails.employeeCode}
                          disabled={true}
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Email <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.adminTwoDetails.emailId}
                          disabled={true}
                          fullWidth
                          size="small"
                          // error={!!formErrors.registeredAddress?.line1}
                          // helperText={formErrors.registeredAddress?.line1}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Country Code <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            value={formik?.values.adminTwoDetails.countryCode}
                            disabled={true}
                            displayEmpty
                            sx={selectStyles}
                            IconComponent={KeyboardArrowDown}
                          >
                            {countries.map((country) => (
                              <MenuItem
                                key={country.code}
                                value={country.dial_code}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Typography>{country.name}</Typography>
                                  <Typography>({country.dial_code})</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* Five step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Mobile Number <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.adminTwoDetails.mobileNo}
                          disabled={true}
                          fullWidth
                          size="small"
                          // error={!!formErrors.registeredAddress?.line1}
                          // helperText={formErrors.registeredAddress?.line1}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Landline Number
                        </Typography>
                        <TextField
                          id="address-lineone"
                          name="line1"
                          sx={inputStyles}
                          placeholder="Add address here"
                          value={formik.values.adminTwoDetails.landline}
                          disabled={true}
                          fullWidth
                          size="small"
                          // error={!!formErrors.registeredAddress?.line1}
                          // helperText={formErrors.registeredAddress?.line1}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" sx={labelStyles}>
                          Office Address <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="sameAsRegisteredAddress"
                            name="adminTwoDetails.sameAsRegisteredAddress"
                            sx={selectStyles}
                            disabled={true}
                            value={
                              formik.values.adminTwoDetails
                                .sameAsRegisteredAddress
                                ? 'true'
                                : 'false'
                            } // Convert boolean to string
                            // onChange={(e) => {
                            //   // Convert string back to boolean
                            //   formik.setFieldValue("sameAsRegisteredAddress", e.target.value === "true");
                            // }}
                            IconComponent={KeyboardArrowDown}
                            onBlur={formik.handleBlur}
                          >
                            <MenuItem
                              value="true"
                              style={{ fontFamily: 'inherit' }}
                            >
                              Same as entity registered address
                            </MenuItem>
                            <MenuItem
                              value="false"
                              style={{ fontFamily: 'inherit' }}
                            >
                              Same as correspondence address
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    {/* Six step */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        <Typography variant="body2" sx={labelStyles}>
                          Proof of Identity{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth size="small">
                          <Select
                            id="registered-address-district"
                            native
                            name="district"
                            sx={selectStyles}
                            disabled={true}
                            value={
                              formik.values.adminTwoDetails.proofOfIdentity
                            }
                            IconComponent={KeyboardArrowDown}
                          >
                            <option value="">Select</option>
                            {proofOfIdentities.map(
                              (identity: { code: string; name: string }) => (
                                <option
                                  key={identity.code}
                                  value={identity.code}
                                >
                                  {identity.name}
                                </option>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={labelStyles}
                          // className="Gilroy-SemiBold font-16 margin-bottom-10px"
                        >
                          Proof of Identity Number{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {/* Input + Upload Button + Preview */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            placeholder="Enter PAN Number"
                            value={formik.values.adminOneDetails.identityNumber}
                            disabled={true}
                            sx={inputStyles}
                            fullWidth
                            size="small"
                          />

                          {certifiedPoiDocadmin2 && (
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 1,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${certifiedPoiDocadmin2?.base64Content}` ||
                                  ''
                                }
                                alt="Preview"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                }}
                              />
                            </Box>
                          )}
                          {/* Preview with success tick */}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      ></Box>
                    </Box>
                    {/* Seven step */}

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        <Typography variant="body2" sx={labelStyles}>
                          Date of Authorization
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              //   open={open}
                              //   onOpen={() => setOpen(true)}
                              //   onClose={() => setOpen(false)}
                              value={
                                formik.values.adminTwoDetails
                                  .dateOfAuthorization
                                  ? dayjs(
                                      formik.values.adminTwoDetails
                                        .dateOfAuthorization
                                    )
                                  : null
                              }
                              disabled={true}
                              //   maxDate={dayjs()}
                              //   disabled={!isEditableField("NODAL_OFFICER_DETAILS", "noDateOfBirth")}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  //   error: Boolean(formErrors.dateOfBirth),
                                  //   helperText: formErrors.dateOfBirth || "",
                                  placeholder: 'DD/MM/YYYY',
                                  sx: {
                                    '& .MuiInputBase-root': {
                                      height: '35px', // ⬅ reduce overall height
                                    },
                                    '& .MuiInputBase-input': {
                                      padding: '0px 10px', // ⬅ smaller padding
                                      fontFamily: 'inherit',
                                    },
                                    '&.Mui-disabled': {
                                      backgroundColor: '#f5f5f5',
                                      '& fieldset': {
                                        borderColor: '#D9D9D9',
                                      },
                                    },
                                  },
                                  InputProps: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          //   onClick={() => {
                                          //     if (
                                          //       isEditableField("NODAL_OFFICER_DETAILS", "noDateOfBirth")
                                          //     ) {
                                          //       setOpen(true);
                                          //     }
                                          //   }}
                                          disabled={true}
                                        >
                                          <CalendarMonthIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      >
                        {/* Label */}
                        <Typography variant="body2" sx={labelStyles}>
                          Authorization Letter by competent Authority{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        {/* Input + Upload Button + Preview */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            placeholder="Enter PAN Number"
                            value={
                              formik.values.adminTwoDetails
                                .authorizationLetterDetails
                            }
                            disabled={true}
                            sx={inputStyles}
                            fullWidth
                            size="small"
                          />

                          {/* Preview with success tick */}
                          {authLetterDocadmin1 && (
                            <Box
                              sx={{
                                position: 'relative',
                                ml: 1,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <Box
                                component="img"
                                src={
                                  `data:image/jpeg;base64,${authLetterDocadmin1?.base64Content}` ||
                                  ''
                                }
                                alt="Preview"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: '1 1 calc(33.333% - 16px)',
                          minWidth: 200,
                        }}
                      ></Box>
                    </Box>

                    {/* new code start */}
                  </StyledAccordionDetails>
                </StyledAccordion>
                <Box textAlign="end">
                  <Button
                    style={{ textTransform: 'none' }}
                    variant="contained"
                    sx={{
                      px: 6,
                      py: 1.2,
                      fontSize: '14px',
                      backgroundColor: '#0044cc',
                      borderRadius: '4px',
                      marginLeft: '0px',
                    }}
                    type="submit"
                    className="submit-btn"
                    //  onClick={handleSubmit}
                    //  disabled={!isFormValid || isViewOnlyAddress}
                    //  style={{
                    //    backgroundColor:
                    //      isFormValid && !isViewOnlyAddress ? '#002CBA' : '#CCCCCC',
                    //    cursor:
                    //      isFormValid && !isViewOnlyAddress
                    //        ? 'pointer'
                    //        : 'not-allowed',
                    //  }}
                  >
                    Submit
                  </Button>
                </Box>
              </form>
            </EntityFormContainer>
            {pdfData && updationId !== undefined && (
              <PdfPreviewModalUpdate
                open={showViewer}
                onClose={() => setShowViewer(false)}
                base64Pdf={pdfData}
                onESign={handleESign}
                isESigned={isESigned}
                applicationId={updationId} // <-- ensure this comes from props or state
              />
            )}
          </>
        </AccordionDetails>
      </Box>
    </>
  );
};

export default UpdatePreviewDetails;
