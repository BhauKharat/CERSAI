/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchFields } from '../../../request-details/slices/applicationPreviewSlice';
import { updateApplicationStatus } from '../re-details/slices/applicationActionSlice';
import { showLoader, hideLoader } from '../../../../loader/slices/loaderSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../../Constant';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// MUI Components
import {
  Button,
  Card,
  Grid,
  Typography,
  Modal,
  TextField,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  styled,
  IconButton,
  Tooltip,
} from '@mui/material';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Assets & Styles
import reqForModificationImage from '../assets/icons/modified_reg.png';
// We'll remove the Ant Design specific CSS and handle styling with MUI's system
// import './RequestDetails.css';
import FilePreview from '../../../DocPreview/FilePreview';
import RejectRequestSucessModal from './RejectRequestSucessModal';
import { useSelector } from 'react-redux';
import { fetchApplicationDetailsAdmincms } from '../../../request-details/slices/applicationDetailsAdminSlice';
import AdminBreadcrumbUpdateProfile from '../../../myTask/mytaskDash/AdminBreadcrumbUpdateProfile';
import { styles } from '../../../myTask/mytaskDash/css/NewRequest.style';
// Custom styled components for Antd's Collapse functionality
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: 'none',
  border: '1px solid #E6EBFF',
  borderRadius: '8px',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: 0,
    marginBottom: theme.spacing(3),
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)({
  padding: '0 16px',
  minHeight: '48px !important',
  '& .MuiAccordionSummary-content': {
    margin: '12px 0 !important',
    fontWeight: 600,
  },
});

interface FieldValidation {
  [key: string]: boolean;
}

// Dynamic type - no hardcoded section names needed
type SelectedFieldsState = Record<string, string[]>;

interface DocumentFile {
  id: string;
  documentType?: string; // For backward compatibility
  type?: string; // From API response
  fieldKey?: string;
  fileName?: string;
  fileSize?: number;
  base64Content?: string;
}

interface IEntityRequest {
  entityName: string;
  requestFields: string[];
}

// Use the imported ApplicationActionRequest type from applicationActionTypes
// and extend it with the additional fields needed for modification

const Re_Details: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // const workFlowId = useAppSelector(
  //   (state: any) => state.applicationTask?.workFlowId
  // );
  const [userDetailData, setUserDetailData] = useState<any>();
  const [documentsWithContent, setDocumentsWithContent] = useState<
    DocumentFile[]
  >([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);
  const {
    loading: actionLoading,
    success: actionSuccess,
    error: actionError,
  } = useAppSelector(
    (state: any) =>
      state.applicationAction || { loading: false, success: false, error: null }
  );

  const [requestedModifiedFields] = useState<IEntityRequest[]>([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const [viewDocument, setViewDocument] = useState<{
    open: boolean;
    documentId?: string;
    base64Content?: string;
    fileName: string;
    fileType?: 'pdf' | 'image';
    loading?: boolean;
  }>({ open: false, fileName: '', loading: false });

  function RenderDocumentFile({
    keyName,
    documentArray,
  }: {
    keyName: string;
    documentArray: any; // Can be array or object
  }) {
    // Updated mapping to match API response document types
    const keyToDocTypeMap: Record<string, string> = {
      // Entity Profile fields
      pan: 'panFile',
      panNo: 'panFile',
      cin: 'cinFile',
      cinNo: 'cinFile',
      llpin: 'llpinFile',
      llpinNo: 'llpinFile',
      gstin: 'gstinFile',
      gstinNo: 'gstinFile',
      reWebsite: 'reWebsiteFile',
      website: 'reWebsiteFile',
      regulatorLicense: 'regulatorLicenseNumberFile',
      regulatorLicenseNumber: 'regulatorLicenseNumberFile',
      registrationCertificate: 'registrationCertificate',
      registrationLicenseCertificate: 'registrationCertificate',
      addressProof: 'addressProof',
      other: 'other',
      reOther: 'other',
      reOtherFile: 'other',
      otherDocument: 'other',

      // Nodal Officer fields
      noEmployCode: 'noEmployCodeFile',
      noEmployeeCode: 'noEmployCodeFile',
      noRoardResoluation: 'noRoardResoluation',
      noBoardResolution: 'noRoardResoluation',
      noBoardResoluationDate: 'noRoardResoluation',
      noProofOfIdentity: 'noProofOfIdentityNumberFile',
      noProofOfIdentityNumber: 'noProofOfIdentityNumberFile',
      noIdentityNumber: 'noProofOfIdentityNumberFile',
      noCertifiedPhotoIdentity: 'noCertifiedPhotoIdentityFile',
      noCertifiedPoi: 'noCertifiedPoiFile',

      // IAU 1 / Admin One fields
      iauEmployCode1: 'iauEmployeCode1File',
      iauEmployeeCode1: 'iauEmployeCode1File',
      adminOneEmployeeCode: 'iauEmployeCode1File',
      iauProofOfIdentity1: 'iauProofOf_identityNumber1File',
      iauProofOfIdentityNumber1: 'iauProofOf_identityNumber1File',
      iauIdentityNumber1: 'iauProofOf_identityNumber1File',
      adminOneIdentityNumber: 'iauProofOf_identityNumber1File',
      adminOneProofOfIdentity: 'iauProofOf_identityNumber1File',
      iauAuthorizationLetter1: 'iauAuthorizationLetter1File',
      adminOneAuthorizationLetter: 'iauAuthorizationLetter1File',
      adminOneCertifiedPoi: 'iauCertifiedPoi1File',
      iauCertifiedPoi1: 'iauCertifiedPoi1File',
      adminOneCertifiedPhotoIdentity: 'iauCertifiedPhotoIdentity1File',
      iauCertifiedPhotoIdentity1: 'iauCertifiedPhotoIdentity1File',
      adminOneAuthorizationLetterDetails: 'iauAuthorizationLetter1File',

      // IAU 2 / Admin Two fields
      iauEmployCode2: 'iauEmployCode2File',
      iauEmployeeCode2: 'iauEmployCode2File',
      adminTwoEmployeeCode: 'iauEmployCode2File',
      iauProofOfIdentity2: 'iauProofOfIdentityNumber2File',
      iauProofOfIdentityNumber2: 'iauProofOfIdentityNumber2File',
      iauIdentityNumber2: 'iauProofOfIdentityNumber2File',
      adminTwoIdentityNumber: 'iauProofOfIdentityNumber2File',
      adminTwoProofOfIdentity: 'iauProofOfIdentityNumber2File',
      iauAuthorizationLetter2: 'iauAuthorizationLetter2File',
      adminTwoAuthorizationLetter: 'iauAuthorizationLetter2File',
      adminTwoCertifiedPoi: 'iauCertifiedPoi2File',
      iauCertifiedPoi2: 'iauCertifiedPoi2File',
      adminTwoCertifiedPhotoIdentity: 'iauCertifiedPhotoIdentity2File',
      iauCertifiedPhotoIdentity2: 'iauCertifiedPhotoIdentity2File',
      adminTwoAuthorizationLetterDetails: 'iauAuthorizationLetter2File',
    };

    console.log(`🖼️ RenderDocumentFile called for keyName: ${keyName}`);
    console.log(
      `🖼️ documentArray type:`,
      Array.isArray(documentArray) ? 'Array' : typeof documentArray
    );

    if (!keyToDocTypeMap[keyName]) {
      console.warn(`⚠️ No mapping found for keyName: ${keyName}`);
      return null;
    }

    const docType = keyToDocTypeMap[keyName];
    console.log(`🖼️ Looking for docType: ${docType}`);

    let match: any = null;

    // Handle both array and object structures
    if (Array.isArray(documentArray)) {
      console.log(`🖼️ Documents is Array, length: ${documentArray.length}`);
      const docKeys = documentArray?.map(
        (d) => d.fieldKey || d.type || d.documentType
      );
      console.log(`🖼️ Available document fieldKeys:`, docKeys);
      console.log(`🖼️ Looking for match with:`, docType);
      console.log(
        `🖼️ Available documents:`,
        documentArray?.map((d) => ({
          id: d.id,
          fieldKey: d.fieldKey,
          type: d.type,
          documentType: d.documentType,
        }))
      );

      // Try matching with fieldKey first (this is the correct property!)
      match = documentArray.find(
        (item) =>
          item.fieldKey === docType ||
          item.type === docType ||
          item.documentType === docType
      );

      console.log(
        `🖼️ Match with fieldKey/type/documentType:`,
        match ? 'Found' : 'Not found'
      );

      // If no match, try without 'File' suffix
      if (!match) {
        const docTypeWithoutFile = docType.replace(/File$/, '');
        console.log(`🖼️ Trying without 'File' suffix:`, docTypeWithoutFile);
        match = documentArray.find(
          (item) =>
            item.fieldKey === docTypeWithoutFile ||
            item.type === docTypeWithoutFile ||
            item.documentType === docTypeWithoutFile
        );
      }

      // If still no match, try case-insensitive
      if (!match) {
        const docTypeLower = docType.toLowerCase();
        console.log(`🖼️ Trying case-insensitive:`, docTypeLower);
        match = documentArray.find(
          (item) =>
            item.fieldKey?.toLowerCase() === docTypeLower ||
            item.type?.toLowerCase() === docTypeLower ||
            item.documentType?.toLowerCase() === docTypeLower
        );
      }
    } else if (documentArray && typeof documentArray === 'object') {
      console.log(
        `🖼️ Documents is Object with keys:`,
        Object.keys(documentArray)
      );

      // Documents stored as object with keys like { panFile: "base64...", cinFile: "base64..." }
      // Try exact match first
      let docContent = documentArray[docType];

      // If no exact match, try variations
      if (!docContent) {
        // Try with 'File' suffix removed
        const typeWithoutFile = docType.replace(/File$/, '');
        docContent = documentArray[typeWithoutFile];

        // Try direct field name
        if (!docContent) {
          docContent = documentArray[keyName];
        }

        // Try field name + 'File'
        if (!docContent) {
          docContent = documentArray[keyName + 'File'];
        }

        // Case-insensitive search as last resort
        if (!docContent) {
          const docTypeLower = docType.toLowerCase();
          const foundKey = Object.keys(documentArray).find(
            (key) => key.toLowerCase() === docTypeLower
          );
          if (foundKey) {
            docContent = documentArray[foundKey];
            console.log(`🖼️ Found via case-insensitive match: ${foundKey}`);
          }
        }
      }

      if (docContent) {
        console.log(`🖼️ Found document at key: ${docType}`, typeof docContent);

        // Handle different formats
        if (typeof docContent === 'string') {
          // Direct base64 string
          match = {
            id: docType,
            base64Content: docContent,
            fileName: docType,
          };
        } else if (typeof docContent === 'object') {
          // Object with properties
          match = {
            id: docContent.id || docType,
            base64Content:
              docContent.base64Content || docContent.content || docContent,
            fileName: docContent.fileName || docType,
            ...docContent,
          };
        }
      }
    }

    console.log(`🖼️ Match found for ${keyName}:`, match ? `Yes` : 'No');

    if (match) {
      // If we have base64Content, display it
      if (match.base64Content) {
        return (
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              alignSelf: 'center',
            }}
          >
            <Box
              component="button"
              type="button"
              aria-label={`View ${keyName} document`}
              style={{
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                setViewDocument({
                  open: true,
                  base64Content: match.base64Content || '',
                  fileName: match.fileName || keyName,
                });
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setViewDocument({
                    open: true,
                    base64Content: match.base64Content || '',
                    fileName: match.fileName || keyName,
                  });
                }
              }}
            >
              <img
                src={`data:image/jpeg;base64,${match.base64Content}`}
                alt={`${keyName} document`}
                title="Click to view document"
                style={{
                  height: 54,
                  width: 54,
                  border: '1px solid #D1D1D1',
                  borderRadius: '4px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          </Box>
        );
      } else if (loadingDocuments) {
        // Show loading indicator while fetching
        return (
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              alignSelf: 'center',
            }}
          >
            <Box
              sx={{
                height: 54,
                width: 54,
                border: '1px solid #D1D1D1',
                borderRadius: '4px',
                backgroundColor: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Loading document..."
            >
              <Typography variant="caption" sx={{ fontSize: '18px' }}>
                ⏳
              </Typography>
            </Box>
          </Box>
        );
      } else {
        // If we only have document ID, show placeholder icon
        return (
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              alignSelf: 'center',
            }}
          >
            <Box
              sx={{
                height: 54,
                width: 54,
                border: '1px solid #D1D1D1',
                borderRadius: '4px',
                backgroundColor: '#F0F0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Document available"
            >
              <Typography variant="caption" sx={{ fontSize: '18px' }}>
                📄
              </Typography>
            </Box>
          </Box>
        );
      }
    } else {
      return null;
    }
  }

  // Initialize all fields as selected by default
  const [selectedFields, setSelectedFields] =
    React.useState<SelectedFieldsState>(() => {
      const initialState = {
        entityDetails: [
          'nameOfInstitution',
          'regulator',
          'institutionType',
          'constitution',
          'proprietorName',
          'registrationNo',
          'pan',
          'cin',
          'llpin',
          'gstin',
          'reWebsite',
          'regulatorLicense',
          'registrationCertificate',
          'addressProof',
          'other',
        ],
        addressDetails: [],
        registeredAddress: [
          'addressLine1',
          'addressLine2',
          'addressLine3',
          'registerCountry',
          'registerState',
          'registerDistrict',
          'registerCity',
          'registerPincode',
          'registerPincodeOther',
          'registerDigipin',
        ],
        correspondanceAddress: [
          'sameAsCorrespondenceAddress',
          'correspondenceAddressLine1',
          'correspondenceAddressLine2',
          'correspondenceAddressLine3',
          'correspondenceCountry',
          'correspondenceState',
          'correspondenceDistrict',
          'correspondenceCity',
          'correspondencePincode',
          'correspondencePincodeOther',
          'correspondenceDigipin',
        ],
        headOfInstitutionDetails: [
          'hoiCitizenship',
          'hoiCkycNumber',
          'hoiTitle',
          'hoiFirstName',
          'hoiMiddleName',
          'hoiLastName',
          'hoiDesignation',
          'hoiEmail',
          'hoiGender',
          'hoiCountryCode',
          'hoiMobile',
          'hoiLandlineNumber',
        ],
        nodalOfficerDetails: [
          'noCitizenship',
          'noCkycNumber',
          'noTitle',
          'noFirstName',
          'noMiddleName',
          'noLastName',
          'noDesignation',
          'noEmailId',
          'noGender',
          'noDob',
          'noDesignation',
          'noEmployCode',
          'noEmail',
          'noCountryCode',
          'noNobileNumber',
          'noDateOfBirth',
          'noLandlineNumber',
          'noOfficeAddress',
          'noAddresLine1',
          'noAddresLine2',
          'noAddresLine3',
          'noRegisterCountry',
          'noRegisterState',
          'noRegisterCity',
          'noRegisterDistrict',
          'noRegisterPincode',
          'noRegisterPincodeOther',
          'noRegisterDigipin',
          'noProofOfIdentity',
          'noProofOfIdentityNumber',
          'noBoardResoluationDate',
          'noRoardResoluation',
        ],
        adminOneDetails: [
          'iauCitizenship1',
          'iauCkycNumber1',
          'iauTitle1',
          'iauFirstName1',
          'iauMiddleName1',
          'iauLastName1',
          'iauGender1',
          'iauDob1',
          'iauDesignation1',
          'iauEmployCode1',
          'iauEmail1',
          'iauCountryCode1',
          'iauMobileNumbmer1',
          'iauLandlineNumber1',
          'iauOfficeAddress1',
          'iauProofOfIdentity1',
          'iauProofOfIdentityNumber1',
          'iauDateOfAuthorization1',
          'iauAuthorizationLetter1',
        ],
        adminTwoDetails: [
          'iauCitizenship2',
          'iauCkycNumber2',
          'iauTitle2',
          'iauFirstName2',
          'iauMiddleName2',
          'iauLastName2',
          'iauGender2',
          'iauDob2',
          'iauDesignation2',
          'iauEmployCode2',
          'iauEmail2',
          'iauCountryCode2',
          'iauMobileNumbmer2',
          'iauLandlineNumber2',
          'iauOfficeAddress2',
          'iauProofOfIdentity2',
          'iauProofOfIdentityNumber2',
          'iauDateOfAuthorization2',
          'iauAuthorizationLetter2',
        ],
        adminDetails: [],
      };
      return initialState;
    });

  // Modal states
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonType, setRejectReasonType] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  const [modifyReason, setModifyReason] = useState('');
  const [modifyError, setModifyError] = useState('');
  const [isRejectSuccessModal, setRejectSuccessModal] =
    useState<boolean>(false);
  // 1️⃣ Access all grouped fields from Redux
  const groupedFields = useSelector(
    (state: any) => state.applicationDetails?.data?.groupedFields || {}
  );
  const applicationDetailsData = useSelector(
    (state: any) => state.applicationDetailsdataAdmin?.data
  );

  // Debug log for documents structure
  React.useEffect(() => {
    if (applicationDetailsData) {
      console.log('🔍 REDUX applicationDetailsData:', applicationDetailsData);
      console.log(
        '🔍 REDUX applicationDetailsData.document (singular):',
        applicationDetailsData?.document
      );
      console.log(
        '🔍 REDUX applicationDetailsData.documents (plural):',
        applicationDetailsData?.documents
      );
      console.log(
        '🔍 REDUX applicationDetailsData.payload:',
        applicationDetailsData?.payload
      );
      console.log(
        '🔍 REDUX applicationDetailsData.payload.document:',
        applicationDetailsData?.payload?.document
      );

      // Check both document (singular) and documents (plural)
      const docs =
        applicationDetailsData?.document ||
        applicationDetailsData?.payload?.document ||
        applicationDetailsData?.payload?.documents ||
        applicationDetailsData?.documents;
      if (docs) {
        console.log('🔍 Document/Documents is Array?', Array.isArray(docs));
        console.log('🔍 Document/Documents type:', typeof docs);
        console.log('🔍 Document/Documents keys:', Object.keys(docs));
        console.log('🔍 First few entries:', Object.entries(docs).slice(0, 5));
      }
    }
  }, [applicationDetailsData]);
  const ackNo = useSelector(
    (state: any) =>
      state.applicationDetailsdataAdmin?.data?.payload?.application_esign
        ?.acknowledgementNo || ''
  );
  // 2️⃣ Function to render value (same as before)
  const renderValue = (field: any) => {
    // Map field names from your dynamic fields to the mock data structure
    const fieldMapping: { [key: string]: string } = {
      // Entity Profile fields
      nameOfInstitution: 'entityDetails.nameOfInstitution',
      regulator: 'entityDetails.regulator',
      institutionType: 'entityDetails.institutionType',
      constitution: 'entityDetails.constitution',
      proprietorName: 'entityDetails.proprietorName',
      pan: 'entityDetails.pan',
      cin: 'entityDetails.cin',
      llpin: 'entityDetails.llpin',
      gstin: 'entityDetails.gstin',
      reWebsite: 'entityDetails.reWebsite',

      // Registered Address fields
      addressLine1: 'addresses.registerLine1',
      addressLine2: 'addresses.registerLine2',
      addressLine3: 'addresses.registerLine3',
      registerCountry: 'addresses.registerCountry',
      registerState: 'addresses.registerState',
      registerDistrict: 'addresses.registerDistrict',
      registerCity: 'addresses.registerCity',
      registerPincode: 'addresses.registerPincode',
      registerPincodeOther: 'addresses.registerPincodeOther',
      registerDigipin: 'addresses.registerDigipin',

      // Correspondence Address fields
      sameAsCorrespondenceAddress: 'addresses.sameAsCorrespondenceAddress',
      correspondenceAddressLine1: 'addresses.correspondenceLine1',
      correspondenceAddressLine2: 'addresses.correspondenceLine2',
      correspondenceAddressLine3: 'addresses.correspondenceLine3',
      correspondenceCountry: 'addresses.correspondenceCountry',
      correspondenceState: 'addresses.correspondenceState',
      correspondenceDistrict: 'addresses.correspondenceDistrict',
      correspondenceCity: 'addresses.correspondenceCity',
      correspondencePincode: 'addresses.correspondencePincode',
      correspondencePincodeOther: 'addresses.correspondencePincodeOther',
      correspondenceDigipin: 'addresses.correspondenceDigipin',

      // HOI fields
      hoiCkycNumber: 'hoi.hoiCkycNo', // Changed from hoiCkycNumber to hoiCkycNo
      hoiDesignation: 'hoi.hoiDesignation',
      hoiEmail: 'hoi.hoiEmail',
      hoiTitle: 'hoi.hoiTitle',
      hoiGender: 'hoi.hoiGender',
      hoiLastName: 'hoi.hoiLastName',
      hoiFirstName: 'hoi.hoiFirstName',
      hoiMiddleName: 'hoi.hoiMiddleName',
      hoiCitizenship: 'hoi.hoiCitizenship',
      hoiCountryCode: 'hoi.hoiCountryCode',
      hoiMobile: 'hoi.hoiMobile', // Changed from hoiMobile to hoiMobile
      hoiLandlineNumber: 'hoi.hoiLandline', // Changed from hoiLandlineNumber to hoiLandline

      // Nodal Officer fields

      noCkycNumber: 'nodalOfficer.noCkycNumber',
      noDesignation: 'nodalOfficer.noDesignation',
      noEmail: 'nodalOfficer.noEmail',
      noTitle: 'nodalOfficer.noTitle',
      noGender: 'nodalOfficer.noGender',
      noLastName: 'nodalOfficer.noLastName',
      noFirstName: 'nodalOfficer.noFirstName',
      noMiddleName: 'nodalOfficer.noMiddleName',
      noCitizenship: 'nodalOfficer.noCitizenship',
      noCountryCode: 'nodalOfficer.noCountryCode',
      noDob: 'nodalOfficer.noDob',
      noEmployCode: 'nodalOfficer.noEmployCode',
      noNobileNumber: 'nodalOfficer.noNobileNumber',
      noLandlineNumber: 'nodalOfficer.noLandlineNumber',
      noOfficeAddress: 'nodalOfficer.noOfficeAddress',
      noAddresLine1: 'nodalOfficer.noAddresLine1',
      noAddresLine2: 'nodalOfficer.noAddresLine2',
      noAddresLine3: 'nodalOfficer.noAddresLine3',
      noProofOfIdentity: 'nodalOfficer.noProofOfIdentity',
      noProofOfIdentityNumber: 'nodalOfficer.noProofOfIdentityNumber',
      noBoardResoluationDate: 'nodalOfficer.noBoardResoluationDate',
      noRegisterCity: 'nodalOfficer.noRegisterCity',
      noRegisterState: 'nodalOfficer.noRegisterState',
      noRegisterCountry: 'nodalOfficer.noRegisterCountry',
      noRegisterDistrict: 'nodalOfficer.noRegisterDistrict',
      noRegisterPincode: 'nodalOfficer.noRegisterPincode',
      noRegisterPincodeOther: 'nodalOfficer.noRegisterPincodeOther',
      noRegisterDigipin: 'nodalOfficer.noRegisterDigipin',

      // Admin One fields
      iauCitizenship1: 'institutionalAdminUser.iauCitizenship1',
      iauCkycNumber1: 'institutionalAdminUser.iauCkycNumber1',
      iauTitle1: 'institutionalAdminUser.iauTitle1',
      iauFirstName1: 'institutionalAdminUser.iauFirstName1',
      iauMiddleName1: 'institutionalAdminUser.iauMiddleName1',
      iauLastName1: 'institutionalAdminUser.iauLastName1',
      iauGender1: 'institutionalAdminUser.iauGender1',
      iauDob1: 'institutionalAdminUser.iauDob1',
      iauDesignation1: 'institutionalAdminUser.iauDesignation1',
      iauEmployCode1: 'institutionalAdminUser.iauEmployCode1',
      iauEmail1: 'institutionalAdminUser.iauEmail1',
      iauCountryCode1: 'institutionalAdminUser.iauCountryCode1',
      iauMobileNumbmer1: 'institutionalAdminUser.iauMobileNumbmer1',
      iauLandlineNumber1: 'institutionalAdminUser.iauLandlineNumber1',
      iauOfficeAddress1: 'institutionalAdminUser.iauOfficeAddress1',
      iauProofOfIdentity1: 'institutionalAdminUser.iauProofOfIdentity1',
      iauProofOfIdentityNumber1:
        'institutionalAdminUser.iauProofOfIdentityNumber1',
      iauDateOfAuthorization1: 'institutionalAdminUser.iauDateOfAuthorization1',
      iauAuthorizationLetter1: 'institutionalAdminUser.iauAuthorizationLetter1',

      // Admin Two fields
      iauCitizenship2: 'institutionalAdminUser.iauCitizenship2',
      iauCkycNumber2: 'institutionalAdminUser.iauCkycNumber2',
      iauTitle2: 'institutionalAdminUser.iauTitle2',
      iauFirstName2: 'institutionalAdminUser.iauFirstName2',
      iauMiddleName2: 'institutionalAdminUser.iauMiddleName2',
      iauLastName2: 'institutionalAdminUser.iauLastName2',
      iauGender2: 'institutionalAdminUser.iauGender2',
      iauDob2: 'institutionalAdminUser.iauDob2',
      iauDesignation2: 'institutionalAdminUser.iauDesignation2',
      iauEmployCode2: 'institutionalAdminUser.iauEmployCode2',
      iauEmail2: 'institutionalAdminUser.iauEmail2',
      iauCountryCode2: 'institutionalAdminUser.iauCountryCode2',
      iauMobileNumbmer2: 'institutionalAdminUser.iauMobileNumbmer2',
      iauLandlineNumber2: 'institutionalAdminUser.iauLandlineNumber2',
      iauOfficeAddress2: 'institutionalAdminUser.iauOfficeAddress2',
      iauProofOfIdentity2: 'institutionalAdminUser.iauProofOfIdentity2',
      iauProofOfIdentityNumber2:
        'institutionalAdminUser.iauProofOfIdentityNumber2',
      iauDateOfAuthorization2: 'institutionalAdminUser.iauDateOfAuthorization2',
      iauAuthorizationLetter2: 'institutionalAdminUser.iauAuthorizationLetter2',
    };

    // Helper function to get nested value from object
    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
      }, obj);
    };

    // Helper function to convert dropdown code to display name
    const getDropdownLabel = (value: any, fieldOptions: any[]) => {
      if (!fieldOptions || fieldOptions.length === 0) return value;
      const option = fieldOptions.find(
        (opt) => opt.code === value || opt.name === value
      );
      return option ? option.name : value;
    };

    // First check if we have a mapping for this field
    const mappedPath = fieldMapping[field.fieldName];
    if (mappedPath && applicationDetailsData?.payload) {
      let actualValue = getNestedValue(
        applicationDetailsData.payload,
        mappedPath
      );

      if (
        actualValue !== undefined &&
        actualValue !== null &&
        actualValue !== ''
      ) {
        // Check if this is a dropdown field and convert code to label
        if (
          field.fieldOptions &&
          field.fieldOptions.length > 0 &&
          (field.fieldType === 'select' || field.fieldType === 'dropdown')
        ) {
          actualValue = getDropdownLabel(actualValue, field.fieldOptions);
        }
        return actualValue;
      }
    }

    // Fallback to original logic for files and other fields
    const value = userDetailData?.entityDetails?.[field.fieldName];

    if (
      field.fieldType === 'file' ||
      field.fieldType === 'upload' ||
      field.fieldName?.toLowerCase().includes('certificate') ||
      field.fieldName?.toLowerCase().includes('proof') ||
      field.fieldName?.toLowerCase().includes('license') ||
      field.fieldName?.toLowerCase().includes('authorization') ||
      field.fieldName?.toLowerCase().includes('document')
    ) {
      return value ? (
        <FilePreview
          base64String={value}
          fileName={field.fieldLabel}
          mimeType="application/pdf"
        />
      ) : (
        'Not provided'
      );
    }

    return value || 'Not provided';
  };

  // 3️⃣ Generic helper to generate fields for any section
  const getDynamicFields = (key: string) => {
    const fields = groupedFields?.[key]?.fields || [];
    return fields.map((field: any) => {
      // Use applicationDetailsData.payload instead of userDetailData
      const dataSource = applicationDetailsData?.payload || userDetailData;
      const isRequired = isFieldRequired(
        field.fieldName,
        dataSource,
        field.validationRules?.required || false
      );

      return {
        key: field.fieldName,
        label: field.fieldLabel,
        value: renderValue(field),
        fieldType: field.fieldType,
        fieldOptions: field.fieldOptions,
        required: isRequired,
      };
    });
  };

  const showRejectModal = () => {
    setRejectReasonError('');
    setIsRejectModalVisible(true);
  };

  const showModifyModal = () => setIsModifyModalVisible(true);
  const workFlowId = params.workFlowId || '';
  const userId = params.userId || '';

  const handleApprove = () => {
    const requestData = {
      workflowId: workFlowId,
      action: 'APPROVE', // Changed from apiType to action
      reason: 'Application approved', // More descriptive reason
      remarks: 'Application has been reviewed and approved', // More descriptive remarks
    };

    console.log('Approval requestData===', requestData);

    dispatch(showLoader('Approving application...'));
    dispatch(updateApplicationStatus(requestData as any))
      .unwrap()
      .then(() => {
        dispatch(hideLoader());
        setIsApproveModalVisible(true);
      })
      .catch((error: any) => {
        dispatch(hideLoader());
        console.error('Approval failed:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to approve application',
          severity: 'error',
        });
      });
  };

  const handleReject = () => {
    const requestData = {
      workflowId: workFlowId,
      action: 'REJECT',
      reason: rejectReason || '',
      remarks: rejectReason || '',
    };

    dispatch(showLoader('Rejecting application...'));
    dispatch(updateApplicationStatus(requestData as any))
      .unwrap()
      .then(() => {
        dispatch(hideLoader());
        setSnackbar({
          open: true,
          message: 'Application rejected successfully',
          severity: 'success',
        });
        setIsRejectModalVisible(false);
        setRejectReason('');
        setRejectReasonType('');
        setRejectSuccessModal(true);
      })
      .catch((error: any) => {
        dispatch(hideLoader());
        console.error('Rejection failed:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to reject application',
          severity: 'error',
        });
      });
  };

  const getAllSectionFields = (section: string): string[] => {
    // Dynamic approach - get fields directly from groupedFields
    if (!groupedFields?.[section]) {
      return [];
    }

    const fields = groupedFields[section]?.fields || [];
    const fieldNames = fields.map((field: any) => field.fieldName);

    return fieldNames;
  };

  // Keep old hardcoded version as fallback (commented out)
  /*
  const getAllSectionFieldsOld = (
    section: keyof SelectedFieldsState
  ): string[] => {
    const sectionFields: Record<string, string[]> = {
      entityDetails: [
        'nameOfInstitution',
        'regulator',
        'institutionType',
        'constitution',
        'proprietorName',
        'registrationNo',
        'pan',
        'cin',
        'llpin',
        'gstin',
        'reWebsite',
        'regulatorLicense',
        'registrationCertificate',
        'addressProof',
        'other',
      ],
      registeredAddress: [
        'addressLine1',
        'addressLine2',
        'addressLine3',
        'registerCountry',
        'registerState',
        'registerDistrict',
        'registerCity',
        'registerPincode',
        'registerPincodeOther',
        'registerDigipin',
      ],
      correspondanceAddress: [
        'sameAsCorrespondenceAddress',
        'correspondenceAddressLine1',
        'correspondenceAddressLine2',
        'correspondenceAddressLine3',
        'correspondenceCountry',
        'correspondenceState',
        'correspondenceDistrict',
        'correspondenceCity',
        'correspondencePincode',
        'correspondencePincodeOther',
        'correspondenceDigipin',
      ],
      headOfInstitutionDetails: [
        'hoiCitizenship',
        'hoiCkycNumber',
        'hoiTitle',
        'hoiFirstName',
        'hoiMiddleName',
        'hoiLastName',
        'hoiDesignation',
        'hoiEmail',
        'hoiGender',
        'hoiCountryCode',
        'hoiMobile',
        'hoiLandlineNumber',
      ],
      nodalOfficerDetails: [
        'noCitizenship',
        'noCkycNumber',
        'noTitle',
        'noFirstName',
        'noMiddleName',
        'noLastName',
        'noDesignation',
        'noEmailId',
        'noGender',
        'noDob',
        'noDesignation',
        'noEmployCode',
        'noEmail',
        'noCountryCode',
        'noNobileNumber',
        'noDateOfBirth',
        'noLandlineNumber',
        'noOfficeAddress',
        'noAddresLine1',
        'noAddresLine2',
        'noAddresLine3',
        'noRegisterCountry',
        'noRegisterState',
        'noRegisterCity',
        'noRegisterDistrict',
        'noRegisterPincode',
        'noRegisterPincodeOther',
        'noRegisterDigipin',
        'noProofOfIdentity',
        'noProofOfIdentityNumber',
        'noBoardResoluationDate',
        'noRoardResoluation',
      ],
      adminOneDetails: [
        'iauCitizenship1',
        'iauCkycNumber1',
        'iauTitle1',
        'iauFirstName1',
        'iauMiddleName1',
        'iauLastName1',
        'iauGender1',
        'iauDob1',
        'iauDesignation1',
        'iauEmployCode1',
        'iauEmail1',
        'iauCountryCode1',
        'iauMobileNumbmer1',
        'iauLandlineNumber1',
        'iauOfficeAddress1',
        'iauProofOfIdentity1',
        'iauProofOfIdentityNumber1',
        'iauDateOfAuthorization1',
        'iauAuthorizationLetter1',
      ],
      adminTwoDetails: [
        'iauCitizenship2',
        'iauCkycNumber2',
        'iauTitle2',
        'iauFirstName2',
        'iauMiddleName2',
        'iauLastName2',
        'iauGender2',
        'iauDob2',
        'iauDesignation2',
        'iauEmployCode2',
        'iauEmail2',
        'iauCountryCode2',
        'iauMobileNumbmer2',
        'iauLandlineNumber2',
        'iauOfficeAddress2',
        'iauProofOfIdentity2',
        'iauProofOfIdentityNumber2',
        'iauDateOfAuthorization2',
        'iauAuthorizationLetter2',
      ],
    };
    return sectionFields[section] || [];
  };
  */

  const getToggledFields = (section: string): string[] => {
    const allFields = getAllSectionFields(section);
    return allFields.filter(
      (field) => !selectedFields[section]?.includes(field)
    );
  };

  interface FieldMappings {
    [key: string]: { [key: string]: string };
  }

  const mapToApiFields = (
    section: string,
    internalFields: string[]
  ): string[] => {
    const fieldMappings: FieldMappings = {
      entityDetails: {},
      addressDetails: {},
      headOfInstitutionDetails: {},
      nodalOfficerDetails: {},
      institutionAdminDetails: {},
    };

    const mappedFields = internalFields.map((field) => {
      if (section === 'addressDetails') {
        const sectionMappings = fieldMappings[section];
        if (sectionMappings) {
          if (field.startsWith('registered')) {
            const fieldKey = field.replace('registered', 'registered');
            return sectionMappings[fieldKey] || field;
          } else if (field.startsWith('correspondence')) {
            const fieldKey = field.replace('correspondence', 'correspondence');
            return sectionMappings[fieldKey] || field;
          }
        }
      }

      if (section === 'adminOneDetails' || section === 'adminTwoDetails') {
        const prefix =
          section === 'adminOneDetails' ? 'adminOne.' : 'adminTwo.';
        const sectionMappings = fieldMappings['institutionAdminDetails'];
        const mappedField = sectionMappings
          ? sectionMappings[field]
          : undefined;
        return mappedField ? `${prefix}${mappedField}` : field;
      }

      const sectionMappings = fieldMappings[section];
      return sectionMappings ? sectionMappings[field] || field : field;
    });

    return mappedFields;
  };

  // Dynamic helper - returns the group key itself (no hardcoded mapping needed)
  const getSectionKeyFromGroupKey = (groupKey: string): string => {
    return groupKey;
  };

  // Initialize selectedFields dynamically from groupedFields
  React.useEffect(() => {
    if (!groupedFields || Object.keys(groupedFields).length === 0) return;

    const newSelectedFields: SelectedFieldsState = {};

    Object.keys(groupedFields).forEach((groupKey) => {
      const section = groupedFields[groupKey];
      const sectionKey = getSectionKeyFromGroupKey(groupKey);

      if (section?.fields) {
        newSelectedFields[sectionKey] = section.fields.map(
          (field: any) => field.fieldName
        );
      }
    });

    setSelectedFields(newSelectedFields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedFields]);

  // Helper function to get user-friendly display titles for group fields
  const getDisplayTitle = (groupedFieldKey: string): string => {
    const section = groupedFields?.[groupedFieldKey];

    // Dynamic mapping for group field keys to user-friendly labels
    // PRIORITY: Use our custom mapping first (overrides API labels)
    const groupFieldLabelMap: Record<string, string> = {
      reEntityprofile: 'Entity Profile',
      reentityprofile: 'Entity Profile',
      registeraddress: 'Register Address',
      registerAddress: 'Register Address',
      correspondenceaddress: 'Correspondence Address',
      correspondenceAddress: 'Correspondence Address',
      reHoi: 'Head of Institutional Details',
      rehoi: 'Head of Institutional Details',
      reNodal: 'Nodal Officer Details',
      renodal: 'Nodal Officer Details',
      adminone: 'Institutional Admin User 1 Details',
      adminOne: 'Institutional Admin User 1 Details',
      admintwo: 'Institutional Admin User 2 Details',
      adminTwo: 'Institutional Admin User 2 Details',
      // Additional common variations
      entityProfile: 'Entity Profile',
      entityprofile: 'Entity Profile',
      headOfInstitution: 'Head of Institutional Details',
      headofinstitution: 'Head of Institutional Details',
      nodalOfficer: 'Nodal Officer Details',
      nodalofficer: 'Nodal Officer Details',
    };

    // Try to find a match in the mapping (exact match)
    const mappedLabel = groupFieldLabelMap[groupedFieldKey];
    if (mappedLabel) {
      console.log(`✅ Mapped "${groupedFieldKey}" → "${mappedLabel}"`);
      return mappedLabel;
    }

    // Fallback: Try case-insensitive lookup
    const keyLower = groupedFieldKey.toLowerCase();
    const foundKey = Object.keys(groupFieldLabelMap).find(
      (k) => k.toLowerCase() === keyLower
    );
    if (foundKey) {
      console.log(
        `✅ Mapped (case-insensitive) "${groupedFieldKey}" → "${groupFieldLabelMap[foundKey]}"`
      );
      return groupFieldLabelMap[foundKey];
    }

    // If no custom mapping found, use API labels as fallback
    if (section?.label) {
      console.log(
        `📋 Using API label for "${groupedFieldKey}": "${section.label}"`
      );
      return section.label;
    }
    if (section?.sectionTitle) {
      console.log(
        `📋 Using API sectionTitle for "${groupedFieldKey}": "${section.sectionTitle}"`
      );
      return section.sectionTitle;
    }

    // Final fallback: Convert camelCase/PascalCase to Title Case
    const autoFormatted = groupedFieldKey
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();

    console.log(`🔄 Auto-formatted "${groupedFieldKey}" → "${autoFormatted}"`);
    return autoFormatted;
  };

  // Get API key from group key (for backend communication)
  const getApiKeyFromGroupKey = (groupKey: string): string => {
    const section = groupedFields?.[groupKey];
    return section?.apiKey || groupKey.toUpperCase();
  };

  // Handle modifiable fields from API response
  React.useEffect(() => {
    const fieldsToCheck = applicationDetailsData?.modifiableFields;

    if (fieldsToCheck && Object.keys(fieldsToCheck).length > 0) {
      setSelectedFields((prevState) => {
        const newState = { ...prevState };

        Object.keys(groupedFields || {}).forEach((groupedFieldKey) => {
          const apiKey = getApiKeyFromGroupKey(groupedFieldKey);
          const sectionModifiableFields = fieldsToCheck[apiKey];

          if (
            sectionModifiableFields &&
            Array.isArray(sectionModifiableFields) &&
            sectionModifiableFields.length > 0
          ) {
            const sectionKey = getSectionKeyFromGroupKey(groupedFieldKey);

            if (!newState[sectionKey]) {
              newState[sectionKey] = [];
            }

            newState[sectionKey] = sectionModifiableFields;
          }
        });

        return newState;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationDetailsData?.modifiableFields, groupedFields]);

  // Old hardcoded mapping (kept for reference, but not used)
  /*
  const groupedFieldsToSectionMapping: Record<string, string> = {
    reEntityprofile: 'entityDetails',
    registeraddress: 'registeredAddress',
    correspondenceaddress: 'correspondanceAddress',
    reHoi: 'headOfInstitutionDetails',
    reNodal: 'nodalOfficerDetails',
    adminone: 'adminOneDetails',
    admintwo: 'adminTwoDetails',
  };
  */

  // Old hardcoded section type mapping (no longer needed with dynamic approach)
  /*
  const sectionToTypeMapping: Record<string, string> = {
    entityDetails: 'REPORTING_ENTITY_DETAILS',
    registeredAddress: 'REGISTERED_ADDRESS_DETAILS',
    correspondanceAddress: 'CORRESPONDENCE_ADDRESS_DETAILS',
    headOfInstitutionDetails: 'HEAD_OFFICE_DETAILS',
    nodalOfficerDetails: 'NODAL_OFFICER_DETAILS',
    adminOneDetails: 'ADMIN_ONE_DETAILS',
    adminTwoDetails: 'ADMIN_TWO_DETAILS',
    addressDetails: 'ADDRESS_DETAILS', // fallback
    adminDetails: 'ADMIN_DETAILS', // fallback
  };
  */

  const handleModify = () => {
    if (!modifyReason.trim()) {
      setModifyError('Modification reason is required');
      return;
    }

    const modifiableFields: any = {};

    // Iterate through groupedFields dynamically
    Object.keys(groupedFields || {}).forEach((groupedFieldKey) => {
      const sectionKey = getSectionKeyFromGroupKey(groupedFieldKey);

      if (!sectionKey) {
        return;
      }

      // Get toggled fields for this section
      const toggledFields = getToggledFields(sectionKey);

      // If there are toggled fields, add them to modifiableFields
      if (toggledFields.length > 0) {
        const apiKey = getApiKeyFromGroupKey(groupedFieldKey);
        modifiableFields[apiKey] = toggledFields;
      }
    });

    // ✅ Final payload
    const requestData: any = {
      workflowId: workFlowId,
      action: 'REQUEST_FOR_MODIFICATION',
      reason: modifyReason,
      remarks: modifyReason || '',
      modifiableFields: modifiableFields,
    };

    console.log('Final Payload ===', requestData);

    dispatch(showLoader('Requesting modification...'));
    dispatch(updateApplicationStatus(requestData as any))
      .unwrap()
      .then(() => {
        dispatch(hideLoader());
        setIsModifyModalVisible(false);
        setModifyReason('');
        setModifyError('');
        setSnackbar({
          open: true,
          message: 'Modification request submitted successfully',
          severity: 'success',
        });
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      })
      .catch((error: any) => {
        dispatch(hideLoader());
        console.error('Modification request failed:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to submit modification request',
          severity: 'error',
        });
      });
  };

  const handleModifyReasonChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setModifyReason(e.target.value);
    if (e.target.value.trim()) {
      setModifyError('');
    }
  };

  const handleCancel = () => {
    setIsApproveModalVisible(false);
    setIsRejectModalVisible(false);
    setIsModifyModalVisible(false);
    setRejectReason('');
    setModifyReason('');
  };

  const applicationId =
    params.acknowledgementNo ||
    params.id ||
    params.applicationId ||
    params.userId;

  useEffect(() => {
    const loadData = async () => {
      if (!applicationId) {
        console.error('No application ID found in URL');
        return;
      }
      dispatch(showLoader());
      try {
        await dispatch(
          fetchApplicationDetailsAdmincms({ workFlowId, userId })
        ).then((detail: any) => {
          console.log('🔍 Raw detail response:', detail);
          console.log('🔍 detail.payload:', detail?.payload);
          console.log(
            '🔍 detail.payload.documents:',
            detail?.payload?.documents
          );

          setUserDetailData(detail?.payload);
          console.log('✅ Application Details Response:', detail?.payload);
        });
      } catch (error) {
        console.error('Failed to fetch application details:', error);
      } finally {
        dispatch(hideLoader());
      }
    };
    loadData();
    // return () => {
    //   // dispatch(clearApplicationDetail());
    // };
    // eslint-disable-next-line
  }, [applicationId, dispatch, params, workFlowId]);
  useEffect(() => {
    const loadFormFields = async () => {
      dispatch(showLoader());
      try {
        // Dispatch your fetchFields thunk
        await dispatch(fetchFields()).then((response: any) => {
          if (response?.payload) {
            console.log('✅ Form Fields Fetched:', response.payload);
            // example: setState(response.payload.groupedFields);
          } else {
            console.error('❌ Failed to fetch form fields:', response);
          }
        });
      } catch (error) {
        console.error('❌ Error loading form fields:', error);
      } finally {
        dispatch(hideLoader());
      }
    };

    loadFormFields();
  }, [dispatch]);

  // Fetch document content when documents are available
  useEffect(() => {
    const fetchDocumentContent = async () => {
      // Check for document object (singular) first
      const documentObj =
        applicationDetailsData?.document ||
        applicationDetailsData?.payload?.document;
      const documentsArray =
        applicationDetailsData?.payload?.documents ||
        applicationDetailsData?.documents;

      // Convert document object to array if needed
      let docsToFetch: any[] = [];

      if (
        documentObj &&
        typeof documentObj === 'object' &&
        !Array.isArray(documentObj)
      ) {
        // Convert object like { panFile: "id123", cinFile: "id456" } to array
        docsToFetch = Object.entries(documentObj)
          .map(([key, value]) => {
            if (typeof value === 'string') {
              // Value is just the ID
              return { id: value, type: key, documentType: key };
            } else if (typeof value === 'object' && value !== null) {
              // Value is an object with properties
              return { ...(value as any), type: key, documentType: key };
            }
            return null;
          })
          .filter(Boolean);
      } else if (Array.isArray(documentsArray) && documentsArray.length > 0) {
        docsToFetch = documentsArray;
      }

      if (!docsToFetch || docsToFetch.length === 0) {
        console.warn('⚠️ No documents found to fetch');
        return;
      }

      setLoadingDocuments(true);
      const documentsWithBase64: DocumentFile[] = [];

      console.log(
        `📄 Fetching ${docsToFetch.length} documents...`,
        docsToFetch
      );

      try {
        // Fetch documents in parallel
        await Promise.all(
          docsToFetch.map(async (doc: any) => {
            try {
              console.log(
                `📄 Fetching document ID: ${doc.id}, type: ${doc.type || doc.documentType}`
              );
              const response = await Secured.get(
                `${API_ENDPOINTS.fetch_document}?id=${doc.id}`,
                {
                  responseType: 'blob',
                }
              );

              const blob = response.data;
              const contentType =
                response.headers['content-type'] || 'application/octet-stream';

              console.log(
                `✅ Document ${doc.id} fetched. Size: ${blob.size}, Type: ${contentType}`
              );

              // Convert blob to base64
              const base64Content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string;
                  // Remove data URL prefix to get only base64
                  const base64 = result.split(',')[1];
                  resolve(base64);
                };
                reader.readAsDataURL(blob);
              });

              documentsWithBase64.push({
                ...doc,
                base64Content,
                fileSize: blob.size,
                fileName: doc.type || 'document',
              });
              console.log(`✅ Document ${doc.id} converted to base64`);
            } catch (error) {
              console.error(`❌ Failed to fetch document ${doc.id}:`, error);
            }
          })
        );

        setDocumentsWithContent(documentsWithBase64);
        console.log('✅ All documents fetched:', documentsWithBase64);
      } catch (error) {
        console.error('❌ Failed to fetch documents:', error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocumentContent();
  }, [
    applicationDetailsData?.document,
    applicationDetailsData?.payload?.document,
    applicationDetailsData?.documents,
    applicationDetailsData?.payload?.documents,
  ]);
  if (!applicationId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Error</Typography>
          <Typography>No application ID found in URL.</Typography>
          <Typography>
            Please ensure you are accessing this page with a valid URL that
            includes an application ID.
          </Typography>
          <Typography>Example: /request-details/ABC123</Typography>
        </Alert>
      </Box>
    );
  }

  // Dynamic getSectionKey - finds section by title or key
  const getSectionKey = (title: string): string => {
    const matchingKey = Object.keys(groupedFields || {}).find((key) => {
      const section = groupedFields[key];
      return (
        section?.sectionTitle === title ||
        section?.label === title ||
        key === title
      );
    });
    return matchingKey || title;
  };

  const isDateField = (fieldKey: string, fieldLabel: string): boolean => {
    const dateFieldKeys = [
      'dob',
      'dateofbirth',
      'dateofauthorization',
      'boardresolutiondate',
      'noDob',
      'noDateOfBirth',
      'noBoardResoluationDate',
      'iauDob1',
      'iauDateOfAuthorization1',
      'iauDob2',
      'iauDateOfAuthorization2',
    ];
    const fieldKeyLower = fieldKey.toLowerCase();
    const fieldLabelLower = fieldLabel.toLowerCase();

    return (
      dateFieldKeys.some((key) => fieldKeyLower.includes(key.toLowerCase())) ||
      fieldLabelLower.includes('date') ||
      fieldLabelLower.includes('dob')
    );
  };

  const isCheckboxField = (fieldKey: string, fieldLabel: string): boolean => {
    const checkboxFieldKeys = [
      'sameasregisteredaddress',
      'sameascorrespondenceaddress',
      'noSameAsRegisteredAddress',
      'adminOneSameAsRegisteredAddress',
      'adminTwoSameAsRegisteredAddress',
    ];
    const fieldKeyLower = fieldKey.toLowerCase();
    const fieldLabelLower = fieldLabel.toLowerCase();

    return (
      checkboxFieldKeys.some((key) =>
        fieldKeyLower.includes(key.toLowerCase())
      ) || fieldLabelLower.includes('same as')
    );
  };

  const isDropdownField = (fieldType: string): boolean => {
    return (
      fieldType === 'dropdown' ||
      fieldType === 'select' ||
      fieldType === 'dropdown-select'
    );
  };

  const handleSectionCheckmarkClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    sectionKey: keyof SelectedFieldsState
  ) => {
    e.stopPropagation();
    const allFields = getAllSectionFields(sectionKey);
    const currentSectionFields = selectedFields[sectionKey] || [];
    const allSelected = allFields.every((field) =>
      currentSectionFields.includes(field)
    );
    setSelectedFields((prev) => ({
      ...prev,
      [sectionKey]: allSelected ? [] : [...allFields],
    }));
  };

  const renderSection = (
    title: string,
    fields: {
      label: string;
      value: any;
      key?: string;
      fieldType?: string;
      fieldOptions?: any[];
      required?: boolean;
    }[],
    groupedFieldKey?: string
  ) => {
    // Use dynamic approach - groupedFieldKey is the sectionKey
    const sectionKey = groupedFieldKey || getSectionKey(title);
    const validFields = fields.filter((field) => field.value);
    const allSectionFields = getAllSectionFields(sectionKey);
    const selectedSectionFields = selectedFields[sectionKey] || [];
    const allFieldsSelected =
      allSectionFields.length > 0 &&
      allSectionFields.every((field) => selectedSectionFields.includes(field));
    const isRequestedModifiedFields = requestedModifiedFields.find(
      (item) => item.entityName === sectionKey
    );

    return (
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${sectionKey}-content`}
          id={`${sectionKey}-header`}
          sx={{
            backgroundColor: isRequestedModifiedFields ? '#FFD952' : '#E6EBFF',
          }}
        >
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontFamily: 'Gilroy, sans-serif',
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>
        </StyledAccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Grid container>
            {validFields.map((field, index) => {
              const fieldKey = field.key || field.label;
              const isCheckbox = isCheckboxField(fieldKey, field.label);

              // Render checkbox fields differently
              if (isCheckbox) {
                const isChecked =
                  field.value === true ||
                  field.value === 'true' ||
                  field.value === 'Yes';
                return (
                  <Grid
                    size={{ xs: 12 }}
                    key={index}
                    sx={{
                      px: 2,
                      py: 1.5,
                      backgroundColor: '#fff',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'black',
                          fontWeight: '400',
                          fontSize: '14px',
                        }}
                      >
                        {field.label}
                      </Typography>
                      <Box
                        sx={{
                          borderStyle: 'solid',
                          borderWidth: 2,
                          borderColor: 'gray',
                          width: 20,
                          height: 20,
                          borderRadius: '4px',
                          backgroundColor: isChecked ? 'gray' : 'transparent',
                          cursor: 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isChecked && (
                          <CheckBoxIcon
                            fontSize="small"
                            sx={{ color: 'white' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              }

              return (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={index}
                  sx={{
                    p: 2,
                    backgroundColor: '#fff',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      position: 'relative',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        pr: 1,
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          marginTop: '5px',
                          fontFamily: 'Gilroy, sans-serif',
                          color: 'black',
                          fontWeight: '600',
                          backgroundColor: isRequestedModifiedFields
                            ? isRequestedModifiedFields.requestFields.includes(
                                fieldKey
                              )
                              ? '#FFD952'
                              : undefined
                            : undefined,
                        }}
                      >
                        {field.label}{' '}
                        {checkIfFieldRequired(field, fields) && (
                          <span style={{ color: 'red' }}>*</span>
                        )}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {/* Hide field value box for Address Proof, Other Document, and Board Resolution - show only image */}
                        {!(
                          field.key === 'addressProof' ||
                          field.key === 'other' ||
                          field.key === 'noRoardResoluation' ||
                          field.key === 'noBoardResolution'
                        ) && (
                          <Box
                            sx={{
                              display: 'flex',
                              flex: 1,
                              backgroundColor: '#F6F6F6',
                              padding: 2,
                              borderRadius: 1,
                              borderColor: '#D1D1D1',
                              borderStyle: 'solid',
                              borderWidth: 1,
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              position: 'relative',
                            }}
                          >
                            <Tooltip title={field.value} placement="top" arrow>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'black',
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                  flex: 1,
                                  // For long employ codes
                                  ...(field.label
                                    .toLowerCase()
                                    .includes('employ code') &&
                                    field.value &&
                                    field.value.length > 20 && {
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontFamily: 'monospace',
                                      fontSize: '0.8rem',
                                    }),
                                }}
                              >
                                {field.label
                                  .toLowerCase()
                                  .includes('employ code') &&
                                field.value &&
                                field.value.length > 20
                                  ? field.value.substring(0, 20) + '...'
                                  : field.value || '-'}
                              </Typography>
                            </Tooltip>
                            {isDateField(field.key || '', field.label) && (
                              <CalendarTodayIcon
                                sx={{
                                  color: '#666',
                                  fontSize: '20px',
                                  ml: 1,
                                }}
                              />
                            )}
                            {field.fieldType &&
                              isDropdownField(field.fieldType) && (
                                <KeyboardArrowDownIcon
                                  sx={{
                                    color: '#666',
                                    fontSize: '20px',
                                    ml: 1,
                                  }}
                                />
                              )}
                          </Box>
                        )}
                        {field.key &&
                          (() => {
                            // Try multiple document sources (check both singular and plural)
                            let docSource = null;

                            if (documentsWithContent.length > 0) {
                              docSource = documentsWithContent;
                            } else if (applicationDetailsData?.document) {
                              // Check document (singular) first - THIS IS THE CORRECT PATH!
                              docSource = applicationDetailsData.document;
                            } else if (
                              applicationDetailsData?.payload?.document
                            ) {
                              docSource =
                                applicationDetailsData.payload.document;
                            } else if (userDetailData?.documents) {
                              docSource = userDetailData.documents;
                            } else if (userDetailData?.document) {
                              docSource = userDetailData.document;
                            } else if (
                              applicationDetailsData?.payload?.documents
                            ) {
                              docSource =
                                applicationDetailsData.payload.documents;
                            } else if (applicationDetailsData?.documents) {
                              docSource = applicationDetailsData.documents;
                            }

                            console.log(
                              `📸 Rendering image for field: ${field.key}`
                            );
                            console.log(
                              `📸 documentsWithContent.length: ${documentsWithContent.length}`
                            );
                            console.log(
                              `📸 Document source:`,
                              docSource
                                ? Array.isArray(docSource)
                                  ? 'Array'
                                  : 'Object'
                                : 'None'
                            );
                            if (docSource && !Array.isArray(docSource)) {
                              console.log(
                                `📸 Document keys available:`,
                                Object.keys(docSource).slice(0, 10)
                              );
                            }

                            return (
                              <RenderDocumentFile
                                keyName={field.key}
                                documentArray={docSource}
                              />
                            );
                          })()}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </AccordionDetails>
      </StyledAccordion>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#fff' }}>
      <Box sx={styles.backButtonContainer}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: 'black' }} />}
          onClick={() => navigate(-1)}
          sx={styles.backButton}
          style={{ textTransform: 'none' }}
        >
          Back
        </Button>
      </Box>
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'RE Registration', href: '/' },
          { label: 'Track Status', href: '/ckycrr-admin/my-task/trackstatus' },
          { label: 'RE Details' },
        ]}
      />
      <Box sx={{ paddingY: 2 }}>
        <Typography
          variant="h5"
          sx={{
            color: 'text.primary',
            fontWeight: '600',
            fontFamily: 'Gilroy, sans-serif',
          }}
        >
          Reporting Entity Details [{ackNo}]
        </Typography>
      </Box>

      <Box
        sx={{
          padding: 2,
          width: '100%',
          backgroundColor: '#F8F9FD',
          borderRadius: 2,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: '#E6EBFF',
          marginY: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            textDecorationLine: 'underline',
            color: '#002CBA',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          onClick={async () => {
            try {
              // Find signed document from API
              const documents =
                applicationDetailsData?.document ||
                applicationDetailsData?.payload?.document ||
                applicationDetailsData?.documents ||
                applicationDetailsData?.payload?.documents ||
                [];

              let signedDoc = null;
              if (Array.isArray(documents)) {
                signedDoc = documents.find(
                  (doc) =>
                    doc.fieldKey ===
                      'registration_signed_application_pdf.pdf' ||
                    doc.fieldKey?.includes('registration_signed') ||
                    doc.fieldKey?.includes('signed_application')
                );
              }
              console.log('Signed document found:', signedDoc?.id);
              if (signedDoc && signedDoc.id) {
                // Fetch the document using the ID
                const response = await fetch(
                  `${API_ENDPOINTS.fetch_document}?id=${signedDoc.id}`
                );

                if (!response.ok) {
                  throw new Error('Failed to fetch document');
                }

                const blob = await response.blob();
                const reader = new FileReader();

                reader.onloadend = () => {
                  const base64String = reader.result as string;
                  const base64Content = base64String.split(',')[1];

                  setViewDocument({
                    open: true,
                    base64Content: base64Content,
                    fileName: 'Signed Registration Application',
                    fileType: 'pdf',
                  });
                };

                reader.readAsDataURL(blob);
              } else {
                setSnackbar({
                  open: true,
                  message: 'Signed document not found',
                  severity: 'warning',
                });
              }
            } catch (error) {
              console.error('Error fetching signed document:', error);
              setSnackbar({
                open: true,
                message: 'Failed to load signed document',
                severity: 'error',
              });
            }
          }}
        >
          View Signed Document
        </Typography>
      </Box>

      <Box>
        {Object.keys(groupedFields).map((key) => {
          const section = groupedFields[key];
          const sectionLabel = getDisplayTitle(key); // Use dynamic label mapping

          console.log('🏷️ Group Field Label Mapping:', {
            originalKey: key,
            mappedLabel: sectionLabel,
            sectionLabel: section?.label,
            sectionTitle: section?.sectionTitle,
          });

          return renderSection(sectionLabel, getDynamicFields(key), key);
        })}
      </Box>

      {/* Approve Modal */}
      <Modal
        open={isApproveModalVisible}
        onClose={handleCancel}
        aria-labelledby="approve-modal-title"
        aria-describedby="approve-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            borderRadius: '8px',
          }}
        >
          <CheckCircleOutlineIcon sx={{ color: '#52C41A', fontSize: 60 }} />
          <Typography id="approve-modal-title" variant="h5" sx={{ mt: 2 }}>
            Application is Approved!
          </Typography>
          <Typography id="approve-modal-description" sx={{ mt: 2 }}>
            Application has been successfully reviewed and approved.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setIsApproveModalVisible(false);
              navigate(-1);
            }}
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: '#002CBA',
              '&:hover': { backgroundColor: '#001a8b' },
            }}
          >
            Okay
          </Button>
        </Box>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={isRejectModalVisible}
        onClose={handleCancel}
        aria-labelledby="reject-modal-title"
        aria-describedby="reject-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            borderRadius: '8px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CancelIcon sx={{ fontSize: 80, color: 'red' }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Are you sure you want to reject
            <br />
            this request?
          </Typography>
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            {/* <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Reject Reasons <span style={{ color: 'red' }}>*</span>
            </Typography>
            <FormControl fullWidth sx={{ mt: 1 }} error={!!rejectReasonError}>
              <InputLabel>Select a reason for rejection</InputLabel>
              <Select
                value={rejectReasonType}
                label="Select a reason for rejection"
                onChange={(e) => {
                  setRejectReasonType(e.target.value);
                  setRejectReasonError('');
                }}
              >
                <MenuItem value="Incomplete Information">
                  Incomplete Information
                </MenuItem>
                <MenuItem value="Incorrect Details">Incorrect Details</MenuItem>
                <MenuItem value="Document Verification Failed">
                  Document Verification Failed
                </MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {rejectReasonError && (
                <FormHelperText>{rejectReasonError}</FormHelperText>
              )}
            </FormControl> */}
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Remark
            </Typography>
            <TextField
              multiline
              rows={4}
              placeholder="Enter remark for rejection"
              fullWidth
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ mt: 1 }}
            />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button variant="outlined" fullWidth onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleReject}
                sx={{
                  backgroundColor: '#002CBA',
                  '&:hover': { backgroundColor: '#001a8b' },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modify Modal */}
      <Modal
        open={isModifyModalVisible}
        onClose={handleCancel}
        aria-labelledby="modify-modal-title"
        aria-describedby="modify-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            borderRadius: '8px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={reqForModificationImage}
              alt="Reject Request"
              sx={{ width: 64, height: 64, mb: 2 }}
            />
          </Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Are you sure you want to modify
            <br />
            this application?
          </Typography>
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Modification Remark<span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              multiline
              rows={4}
              placeholder="Type your reason here"
              fullWidth
              value={modifyReason}
              onChange={handleModifyReasonChange}
              error={!!modifyError}
              helperText={modifyError}
              sx={{ mt: 1 }}
            />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button variant="outlined" fullWidth onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleModify}
                sx={{
                  backgroundColor: '#002CBA',
                  '&:hover': { backgroundColor: '#001a8b' },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <RejectRequestSucessModal
        isOpen={isRejectSuccessModal}
        onClose={() => {
          setRejectSuccessModal(false);
          navigate(-1);
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Document Viewer Modal */}
      <Modal
        open={viewDocument.open}
        onClose={() =>
          setViewDocument({ open: false, fileName: '', loading: false })
        }
        aria-labelledby="document-viewer-modal"
        aria-describedby="document-viewer-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #E0E0E0',
            }}
          >
            <Typography variant="h6" component="h2">
              {viewDocument.fileName}
            </Typography>
            <IconButton
              onClick={() =>
                setViewDocument({ open: false, fileName: '', loading: false })
              }
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxHeight: 'calc(90vh - 80px)',
              overflow: 'auto',
              minWidth: '60vw',
              minHeight: '60vh',
            }}
          >
            {viewDocument.base64Content ? (
              viewDocument.fileType === 'pdf' ? (
                <iframe
                  title={viewDocument.fileName}
                  src={`data:application/pdf;base64,${viewDocument.base64Content}`}
                  style={{
                    width: '100%',
                    height: '80vh',
                    border: 'none',
                  }}
                />
              ) : (
                <img
                  src={`data:image/jpeg;base64,${viewDocument.base64Content}`}
                  alt={viewDocument.fileName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'calc(90vh - 120px)',
                    objectFit: 'contain',
                  }}
                />
              )
            ) : (
              <Typography variant="body2" color="text.secondary">
                No document to display.
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

const constitutionObject = [
  {
    code: 'A',
    name: 'Sole Proprietorship',
    status: 'ACTIVE',
  },
  {
    code: 'B',
    name: 'Partnership Firm',
    status: 'ACTIVE',
  },
  {
    code: 'C',
    name: 'HUF',
    status: 'ACTIVE',
  },
  {
    code: 'D',
    name: 'Private Limited Company',
    status: 'ACTIVE',
  },
  {
    code: 'E',
    name: 'Public Limited Company',
    status: 'ACTIVE',
  },
  {
    code: 'F',
    name: 'Society',
    status: 'ACTIVE',
  },
  {
    code: 'G',
    name: 'Association of Persons / Body of Individuals',
    status: 'ACTIVE',
  },
  {
    code: 'H',
    name: 'Trust',
    status: 'ACTIVE',
  },
  {
    code: 'I',
    name: 'Liquidator',
    status: 'ACTIVE',
  },
  {
    code: 'J',
    name: 'Limited Liability Partnership',
    status: 'ACTIVE',
  },
  {
    code: 'K',
    name: 'Public Sector Banks',
    status: 'ACTIVE',
  },
  {
    code: 'L',
    name: 'Central/State Govt Dept or Agency',
    status: 'ACTIVE',
  },
  {
    code: 'M',
    name: 'Section 8 Companies (Companies Act, 2013)',
    status: 'ACTIVE',
  },
  {
    code: 'N',
    name: 'Artificial Juridical Person',
    status: 'ACTIVE',
  },
  {
    code: 'O',
    name: 'Not Categorized/Others',
    status: 'ACTIVE',
  },
];

const baseRequiredFields = [
  'nameOfInstitution',
  'regulator',
  'institutionType',
  'constitution',
  // 'proprietorName', // Removed: conditionally required when constitution is 'A'
  'registrationNo',
  'pan',
  // 'cin', // Removed: conditionally required when constitution is D, E, or M
  // 'llpin', // Removed: conditionally required when constitution is 'J'
  // 'gstin', // Removed: conditionally required based on regulator
  'regulatorLicense',
  'registrationCertificate',
  'addressProof',
  'reOther',
  'registeredAddressLine1',
  'registeredAddressCountryCode',
  'registeredAddressState',
  'registeredAddressDistrict',
  'registeredAddressCityTown',
  'registeredAddressPinCode',
  'correspondenceAddressLine1',
  'correspondenceAddressCountryCode',
  'correspondenceAddressState',
  'correspondenceAddressDistrict',
  'correspondenceAddressCityTown',
  'correspondenceAddressPinCode',
  'hoiCitizenship',
  // 'hoiCkycNumber', // Removed: conditionally required when hoiCitizenship is 'Indian'
  'hoiTitle',
  'hoiFirstName',
  'hoiLastName',
  'hoiDesignation',
  'hoiEmailId',
  'hoiCountryCode',
  'hoiMobileNo',
  'noCitizenship',
  // 'noCkycNumber', // Removed: conditionally required when noCitizenship is 'Indian'
  'noTitle',
  'noFirstName',
  'noLastName',
  'noDesignation',
  'noEmailId',
  'noGender',
  'noCountryCode',
  'noMobileNo',
  'noIdentityNumber',
  'noProofOfIdentity',
  'noDateOfBirth',
  'noSameAsRegisteredAddress',
  'noDateOfBoardResolution',
  'noBoardResolution',
  'noCertifiedPhotoIdentity',
  'noCertifiedPoi',
  'adminOneCitizenship',
  // 'adminOneCkycNumber', // Removed: conditionally required when adminOneCitizenship is 'Indian'
  'adminOneTitle',
  'adminOneFirstName',
  'adminOneLastName',
  'adminOneDesignation',
  'adminOneEmailId',
  'adminOneGender',
  'adminOneCountryCode',
  'adminOneMobileNo',
  'adminOneProofOfIdentity',
  'adminOneIdentityNumber',
  'adminOneEmployeeCode',
  'adminOneSameAsRegisteredAddress',
  'adminOneAuthorizationLetterDetails',
  'adminOneDateOfAuthorization',
  'adminOneCertifiedPoi',
  'adminTwoCitizenship',
  // 'adminTwoCkycNumber', // Removed: conditionally required when adminTwoCitizenship is 'Indian'
  'adminTwoTitle',
  'adminTwoFirstName',
  'adminTwoLastName',
  'adminTwoDesignation',
  'adminTwoEmailId',
  'adminTwoGender',
  'adminTwoCountryCode',
  'adminTwoMobileNo',
  'adminTwoProofOfIdentity',
  'adminTwoIdentityNumber',
  'adminTwoEmployeeCode',
  'adminTwoSameAsRegisteredAddress',
  'adminTwoAuthorizationLetterDetails',
  'adminTwoDateOfAuthorization',
  'adminTwoCertifiedPoi',
];

// Helper function to determine if a field is required based on conditional logic
const checkIfFieldRequired = (field: any, allFields: any[]): boolean => {
  const fieldKey = field.key || field.fieldName;
  const pincodeOtherFields = [
    'registerPincodeOther',
    'correspondencePincodeOther',
    'noRegisterPincodeOther',
  ];

  if (pincodeOtherFields.includes(fieldKey)) {
    return true;
  }
  const constitutionField = allFields.find(
    (f) =>
      f.key === 'constitution' ||
      f.fieldName === 'constitution' ||
      f.label?.toLowerCase() === 'constitution'
  );

  const constitutionValue = constitutionField?.value;

  // PROPRIETOR NAME required ONLY for Sole Proprietorship
  if (fieldKey === 'proprietorName') {
    return constitutionValue === 'Sole Proprietorship';
  }

  // LLPIN required ONLY for LLP
  if (fieldKey === 'llpin') {
    return constitutionValue === 'Limited Liability Partnership';
  }

  // CIN required ONLY for Company types
  if (fieldKey === 'cin') {
    return [
      'Private Limited Company',
      'Public Limited Company',
      'Section 8 Companies (Companies Act, 2013)',
    ].includes(constitutionValue);
  }
  // First check if field has direct validationRules with required = true or "true"
  if (field.validationRules && field.validationRules.required) {
    // Handle both boolean true and string "true"
    if (
      field.validationRules.required === true ||
      field.validationRules.required === 'true'
    ) {
      return true;
    }
  }

  const regulatorField = allFields.find(
    (f) =>
      f.key === 'regulator' ||
      f.fieldName === 'regulator' ||
      f.label?.toLowerCase() === 'regulator'
  );

  const regulatorValue = regulatorField?.value;
  if (fieldKey === 'gstin') {
    // GSTIN NOT required when regulator = IFSCA
    if (regulatorValue === 'IFSCA') {
      return false; // not required
    }

    // Required for all other regulators
    return true;
  }

  // If no direct validationRules or required is not true, check conditionalLogic
  if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
    for (const condition of field.conditionalLogic) {
      if (condition.when && condition.then) {
        const {
          field: dependentFieldName,
          operator,
          value: conditionValue,
        } = condition.when;

        // Find the dependent field in allFields - check multiple name variations
        const dependentField = allFields.find((f) => {
          const fieldKey = f.key || f.fieldName;
          const fieldNameOnly = f.fieldName;

          // Direct match
          if (
            fieldKey === dependentFieldName ||
            fieldNameOnly === dependentFieldName
          ) {
            return true;
          }

          // Handle field name variations (e.g., iauCitizenship1 vs adminOneCitizenship vs iau_citizenship_1)
          const fieldNameMappings: Record<string, string[]> = {
            iauCitizenship1: [
              'adminOneCitizenship',
              'iauCitizenship1',
              'iau_citizenship_1',
            ],
            iauCitizenship2: [
              'adminTwoCitizenship',
              'iauCitizenship2',
              'iau_citizenship_2',
            ],
            adminOneCitizenship: [
              'iauCitizenship1',
              'adminOneCitizenship',
              'iau_citizenship_1',
            ],
            adminTwoCitizenship: [
              'iauCitizenship2',
              'adminTwoCitizenship',
              'iau_citizenship_2',
            ],
            iau_citizenship_1: [
              'iauCitizenship1',
              'adminOneCitizenship',
              'iau_citizenship_1',
            ],
            iau_citizenship_2: [
              'iauCitizenship2',
              'adminTwoCitizenship',
              'iau_citizenship_2',
            ],
          };

          const alternativeNames = fieldNameMappings[dependentFieldName];
          if (alternativeNames) {
            return (
              alternativeNames.includes(fieldKey) ||
              alternativeNames.includes(fieldNameOnly)
            );
          }

          return false;
        });

        if (dependentField) {
          const dependentFieldValue = dependentField.value;

          // Evaluate the condition
          let conditionMet = false;
          if (operator === 'equals' || operator === '==') {
            conditionMet = dependentFieldValue === conditionValue;

            // Handle common variations: "India" vs "Indian"
            if (
              (!conditionMet &&
                conditionValue === 'India' &&
                dependentFieldValue === 'Indian') ||
              (conditionValue === 'Indian' && dependentFieldValue === 'India')
            ) {
              conditionMet = true;
            }
          } else if (operator === 'not_equals' || operator === '!=') {
            conditionMet = dependentFieldValue !== conditionValue;
          }

          // If condition is met, apply the validation rules from then clause
          if (conditionMet && condition.then.validationRules) {
            return condition.then.validationRules.required === true;
          }
        }
      }
    }
  }

  // Fallback to field.required property
  return field.required === true;
};
const isFieldRequired = (
  fieldKey: string,
  userData: any,
  baseRequired: boolean
): boolean => {
  // PRIORITY 1: If validationRules explicitly sets required: true, always show asterisk
  if (baseRequired === true) {
    return true;
  }

  // PRIORITY 2: Only check conditional logic if baseRequired is false/null
  const constitution = userData?.entityDetails?.constitution;
  const regulator = userData?.entityDetails?.regulator;
  const sameAsRegisteredAddress =
    userData?.addresses?.correspondenceAddressSameAsRegisteredAddress;

  // Citizenship values - using correct data paths from field mappings
  const hoiCitizenship = userData?.hoi?.hoiCitizenship;
  const noCitizenship = userData?.nodalOfficer?.noCitizenship;
  const adminOneCitizenship = userData?.institutionalAdminUser?.iauCitizenship1;
  const adminTwoCitizenship = userData?.institutionalAdminUser?.iauCitizenship2;

  // Entity Details Conditional Fields
  if (fieldKey === 'gstin' || fieldKey === 'gstinNo') {
    return regulator === 'IFSCA';
  }

  if (fieldKey === 'proprietorName') {
    return constitution === 'A';
  }

  if (fieldKey === 'cin' || fieldKey === 'cinNo') {
    return ['D', 'E', 'M'].includes(constitution);
  }

  if (fieldKey === 'llpin' || fieldKey === 'llpinNo') {
    return constitution === 'J';
  }

  // Mobile Number - Always required for all roles (Indian and non-Indian)
  // Validation rules differ by citizenship, but required flag is always true
  if (fieldKey === 'hoiMobileNumbmer' || fieldKey === 'hoiMobile') {
    return true;
  }

  if (fieldKey === 'noMobileNumber' || fieldKey === 'noMobile') {
    return true;
  }

  if (
    fieldKey === 'adminOneMobileNumber' ||
    fieldKey === 'adminOneMobile' ||
    fieldKey === 'iauMobileNumbmer1'
  ) {
    return true;
  }

  if (
    fieldKey === 'adminTwoMobileNumber' ||
    fieldKey === 'adminTwoMobile' ||
    fieldKey === 'iauMobileNumbmer2'
  ) {
    return true;
  }

  // CKYC Number Conditional Fields (required only when citizenship is 'Indian')
  if (fieldKey === 'hoiCkycNumber') {
    return hoiCitizenship === 'Indian';
  }

  if (fieldKey === 'noCkycNumber') {
    return noCitizenship === 'Indian';
  }

  if (fieldKey === 'adminOneCkycNumber' || fieldKey === 'iauCkycNumber1') {
    return adminOneCitizenship === 'Indian';
  }

  if (fieldKey === 'adminTwoCkycNumber' || fieldKey === 'iauCkycNumber2') {
    return adminTwoCitizenship === 'Indian';
  }

  // Correspondence Address Conditional Fields
  const correspondenceState = userData?.addresses?.correspondenceState;

  // District and Pincode in correspondence address have additional condition
  if (fieldKey === 'correspondenceDistrict') {
    return (
      !sameAsRegisteredAddress &&
      correspondenceState &&
      correspondenceState.trim() !== ''
    );
  }

  if (fieldKey === 'correspondencePincode') {
    return (
      !sameAsRegisteredAddress &&
      correspondenceState &&
      correspondenceState.trim() !== ''
    );
  }

  // Other correspondence address fields
  const correspondenceAddressFields = [
    'correspondenceAddressLine1',
    'correspondenceAddressLine2',
    'correspondenceAddressLine3',
    'correspondenceCountry',
    'correspondenceState',
    'correspondenceCity',
  ];

  if (correspondenceAddressFields.includes(fieldKey)) {
    return !sameAsRegisteredAddress; // Required only if NOT same as registered
  }

  // Registered Address Conditional Fields
  // District and Pincode are required when registerState is not empty
  const registerState = userData?.addresses?.registerState;

  if (fieldKey === 'registerDistrict') {
    return registerState && registerState.trim() !== '';
  }

  if (fieldKey === 'registerPincode') {
    return registerState && registerState.trim() !== '';
  }

  // Nodal Officer Address Conditional Fields
  // District and Pincode are required when noRegisterState is not empty
  const noRegisterState = userData?.nodalOfficer?.noRegisterState;

  if (fieldKey === 'noRegisterDistrict') {
    return noRegisterState && noRegisterState.trim() !== '';
  }

  if (fieldKey === 'noRegisterPincode') {
    return noRegisterState && noRegisterState.trim() !== '';
  }

  // For all other fields, return false (not required)
  return false;
};

export default Re_Details;
