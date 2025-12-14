/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, data, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchApplicationDetails,
  clearApplicationDetail,
} from './slices/applicationPreviewSlice';
import {
  updateApplicationStatus,
  resetActionState,
} from './slices/applicationActionSlice';
import { showLoader, hideLoader } from '../../loader/slices/loaderSlice';
import DeactivateUserModal from './DeactivateUser/DeactivateUserModal';
import SuspendUserModal from './SuspendUser/SuspendUserModal';
import RevokeUserModal from './RevokeUser/RevokeUserModal';

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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  styled,
  FormHelperText,
  IconButton,
  Divider,
} from '@mui/material';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Assets & Styles
import reqForModificationImage from '../../../assets/reqformodifiction.png';
// We'll remove the Ant Design specific CSS and handle styling with MUI's system
// import './RequestDetails.css';
import FilePreview from '../DocPreview/FilePreview';
import { fetchReportingEntityDetails } from './slices/reportingEntitySlice';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import ErrorModal from './ErrorModal/ErrorModal';
// import RejectRequestSucessModal from './RejectRequestSucessModal';

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
  backgroundColor: '#E6EBFF',
  borderRadius: '8px',
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

interface SelectedFieldsState {
  entityDetails: string[];
  addressDetails: string[];
  registeredAddress: string[];
  correspondanceAddress: string[];
  headOfInstitutionDetails: string[];
  nodalOfficerDetails: string[];
  adminOneDetails: string[];
  adminTwoDetails: string[];
  adminDetails: string[];
}

interface DocumentFile {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  base64Content: string;
}

// Use the imported ApplicationActionRequest type from applicationActionTypes
// and extend it with the additional fields needed for modification

const ApplicationDetailsView: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { reId } = useParams<{ reId: string }>();
  const location = useLocation();
  const actionType = location.state?.actionType;
  console.log('ReId and ActionType : ', reId, actionType);

  // const workFlowId = useAppSelector(
  //   (state: any) => state.applicationTask?.workFlowId
  // );
  const [userDetailData, setUserDetailData] = useState<any>();
  const {
    loading: actionLoading,
    success: actionSuccess,
    error: actionError,
  } = useAppSelector(
    (state: any) =>
      state.selectReportingEntity || {
        loading: false,
        success: false,
        error: null,
      }
  );

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  function RenderDocumentFile({
    keyName,
    documentArray,
  }: {
    keyName: string;
    documentArray: DocumentFile[];
  }) {
    const keyToDocTypeMap: Record<string, string> = {
      registrationCertificate: 'REGISTRATION_CERTIFICATE',
      addressProof: 'ADDRESS_PROOF',
      reOther: 'RE_OTHER_FILE',
      pan: 'RE_PAN',
      cin: 'RE_CIN',
      noBoardResolution: 'NO_BOARD_RESOLUTION',
      noCertifiedPhotoIdentity: 'NO_CERTIFIED_POI',
      noCertifiedPoi: 'NO_CERTIFIED_PHOTO_IDENTITY',
      adminOneCertifiedPoi: 'IAU_ONE_CERTIFIED_POI',
      adminOneCertifiedPhotoIdentity: 'IAU_ONE_CERTIFIED_PHOTO_IDENTITY',
      adminOneAuthorizationLetterDetails: 'IAU_ONE_AUTHORIZATION_LETTER',
      adminTwoCertifiedPoi: 'IAU_TWO_CERTIFIED_POI',
      adminTwoCertifiedPhotoIdentity: 'IAU_TWO_CERTIFIED_PHOTO_IDENTITY',
      adminTwoAuthorizationLetterDetails: 'IAU_TWO_AUTHORIZATION_LETTER',
    };

    // console.log(
    //   'matched documnets',
    //   keyToDocTypeMap[keyName],
    //   documentArray,
    //   keyName
    // );
    if (!keyToDocTypeMap[keyName]) return null;

    const match = documentArray.find(
      (item) => item.documentType === keyToDocTypeMap[keyName]
    );
    if (match) {
      return (
        <img
          src={`data:image/jpeg;base64,${match.base64Content}`}
          alt=""
          style={{
            height: 50,
            width: 50,
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
      );
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
          'reOther',
        ],
        addressDetails: [],
        registeredAddress: [
          'registeredAddressLine1',
          'registeredAddressLine2',
          'registeredAddressLine3',
          'registeredAddressCountryCode',
          'registeredAddressState',
          'registeredAddressDistrict',
          'registeredAddressCityTown',
          'registeredAddressPinCode',
          'registeredAddressAlternatePinCode',
        ],
        correspondanceAddress: [
          'correspondenceAddressLine1',
          'correspondenceAddressLine2',
          'correspondenceAddressLine3',
          'correspondenceAddressCountryCode',
          'correspondenceAddressState',
          'correspondenceAddressDistrict',
          'correspondenceAddressCityTown',
          'correspondenceAddressPinCode',
          'correspondenceAddressAlternatePinCode',
        ],
        headOfInstitutionDetails: [
          'hoiCitizenship',
          'hoiCkycNumber',
          'hoiTitle',
          'hoiFirstName',
          'hoiMiddleName',
          'hoiLastName',
          'hoiDesignation',
          'hoiEmailId',
          'hoiGender',
          'hoiCountryCode',
          'hoiMobileNo',
          'hoiLandline',
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
          'noCountryCode',
          'noMobileNo',
          'noLandline',
          'noIdentityNumber',
          'noProofOfIdentity',
          'noDateOfBirth',
          'noSameAsRegisteredAddress',
          'noDateOfBoardResolution',
          'noBoardResolution',
          'noCertifiedPhotoIdentity',
          'noCertifiedPoi',
        ],
        adminOneDetails: [
          'adminOneCitizenship',
          'adminOneCkycNumber',
          'adminOneTitle',
          'adminOneFirstName',
          'adminOneMiddleName',
          'adminOneLastName',
          'adminOneDesignation',
          'adminOneEmailId',
          'adminOneGender',
          'adminOneCountryCode',
          'adminOneMobileNo',
          'adminOneLandline',
          'adminOneProofOfIdentity',
          'adminOneIdentityNumber',
          'adminOneEmployeeCode',
          'adminOneSameAsRegisteredAddress',
          'adminOneAuthorizationLetterDetails',
          'adminOneDateOfAuthorization',
          'adminOneCertifiedPoi',
          'adminOneCertifiedPhotoIdentity',
        ],
        adminTwoDetails: [
          'adminTwoCitizenship',
          'adminTwoCkycNumber',
          'adminTwoTitle',
          'adminTwoFirstName',
          'adminTwoMiddleName',
          'adminTwoLastName',
          'adminTwoDesignation',
          'adminTwoEmailId',
          'adminTwoGender',
          'adminTwoCountryCode',
          'adminTwoMobileNo',
          'adminTwoLandline',
          'adminTwoProofOfIdentity',
          'adminTwoIdentityNumber',
          'adminTwoEmployeeCode',
          'adminTwoSameAsRegisteredAddress',
          'adminTwoAuthorizationLetterDetails',
          'adminTwoDateOfAuthorization',
          'adminTwoCertifiedPoi',
          'adminTwoCertifiedPhotoIdentity',
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

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const showRejectModal = () => {
    setRejectReasonError('');
    setIsRejectModalVisible(true);
  };

  const showModifyModal = () => setIsModifyModalVisible(true);
  const workFlowId = params.workFlowId || '';

  const handleApprove = () => {
    if (!userDetailData?.acknowledgementNo) {
      setSnackbar({
        open: true,
        message: 'No application selected',
        severity: 'error',
      });
      return;
    }

    // const requestData: ApplicationActionRequest = {
    //   acknowledgmentNo: userDetailData.acknowledgementNo,
    //   action: 'APPROVE',
    // };
    // const Id = params?.workflowId;
    const requestData = {
      workflowId: workFlowId,
      reason: 'Approve ',
      remarks: 'Approve remarks',
      apiType: 'approve',
    };
    console.log('requestData===', requestData);
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
    if (!rejectReasonType) {
      setRejectReasonError('Please select a reason for rejection');
      return;
    }

    if (!userDetailData?.acknowledgementNo) {
      setSnackbar({
        open: true,
        message: 'No application selected',
        severity: 'error',
      });
      return;
    }

    const requestData = {
      workflowId: workFlowId,
      acknowledgmentNo: userDetailData.acknowledgementNo,
      reason: rejectReasonType,
      remarks: rejectReason || '',
      apiType: 'reject',
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

  const getAllSectionFields = (
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
        'reOther',
      ],
      registeredAddress: [
        'registeredAddressLine1',
        'registeredAddressLine2',
        'registeredAddressLine3',
        'registeredAddressCountryCode',
        'registeredAddressState',
        'registeredAddressDistrict',
        'registeredAddressCityTown',
        'registeredAddressPinCode',
        'registeredAddressAlternatePinCode',
      ],
      correspondanceAddress: [
        'correspondenceAddressLine1',
        'correspondenceAddressLine2',
        'correspondenceAddressLine3',
        'correspondenceAddressCountryCode',
        'correspondenceAddressState',
        'correspondenceAddressDistrict',
        'correspondenceAddressCityTown',
        'correspondenceAddressPinCode',
        'correspondenceAddressAlternatePinCode',
      ],
      headOfInstitutionDetails: [
        'hoiCitizenship',
        'hoiCkycNumber',
        'hoiTitle',
        'hoiFirstName',
        'hoiMiddleName',
        'hoiLastName',
        'hoiDesignation',
        'hoiEmailId',
        'hoiGender',
        'hoiCountryCode',
        'hoiMobileNo',
        'hoiLandline',
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
        'noCountryCode',
        'noMobileNo',
        'noLandline',
        'noIdentityNumber',
        'noProofOfIdentity',
        'noDateOfBirth',
        'noSameAsRegisteredAddress',
        'noDateOfBoardResolution',
        'noBoardResolution',
        'noCertifiedPhotoIdentity',
        'noCertifiedPoi',
      ],
      adminOneDetails: [
        'adminOneCitizenship',
        'adminOneCkycNumber',
        'adminOneTitle',
        'adminOneFirstName',
        'adminOneMiddleName',
        'adminOneLastName',
        'adminOneDesignation',
        'adminOneEmailId',
        'adminOneGender',
        'adminOneCountryCode',
        'adminOneMobileNo',
        'adminOneLandline',
        'adminOneProofOfIdentity',
        'adminOneIdentityNumber',
        'adminOneEmployeeCode',
        'adminOneSameAsRegisteredAddress',
        'adminOneAuthorizationLetterDetails',
        'adminOneDateOfAuthorization',
        'adminOneCertifiedPoi',
        'adminOneCertifiedPhotoIdentity',
      ],
      adminTwoDetails: [
        'adminTwoCitizenship',
        'adminTwoCkycNumber',
        'adminTwoTitle',
        'adminTwoFirstName',
        'adminTwoMiddleName',
        'adminTwoLastName',
        'adminTwoDesignation',
        'adminTwoEmailId',
        'adminTwoGender',
        'adminTwoCountryCode',
        'adminTwoMobileNo',
        'adminTwoLandline',
        'adminTwoProofOfIdentity',
        'adminTwoIdentityNumber',
        'adminTwoEmployeeCode',
        'adminTwoSameAsRegisteredAddress',
        'adminTwoAuthorizationLetterDetails',
        'adminTwoDateOfAuthorization',
        'adminTwoCertifiedPoi',
        'adminTwoCertifiedPhotoIdentity',
      ],
    };
    return sectionFields[section] || [];
  };

  const getToggledFields = (section: keyof SelectedFieldsState): string[] => {
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

  const handleModify = () => {
    if (!modifyReason.trim()) {
      setModifyError('Modification reason is required');
      return;
    }

    if (!userDetailData?.acknowledgementNo) {
      setSnackbar({
        open: true,
        message: 'No application selected',
        severity: 'error',
      });
      return;
    }

    const toggledEntityFields = getToggledFields('entityDetails');
    const toggledHoiFields = getToggledFields('headOfInstitutionDetails');
    const toggledRegisteredAddressFields =
      getToggledFields('registeredAddress');
    const toggledCorrespondanceAddressFields = getToggledFields(
      'correspondanceAddress'
    );
    const toggledNodalOfficerFields = getToggledFields('nodalOfficerDetails');
    const toggledAdminOneFields = getToggledFields('adminOneDetails');
    const toggledAdminTwoFields = getToggledFields('adminTwoDetails');

    const modifiableFields: any = {};

    if (toggledEntityFields.length > 0) {
      modifiableFields.REPORTING_ENTITY_DETAILS = mapToApiFields(
        'REPORTING_ENTITY_DETAILS',
        toggledEntityFields
      );
    }
    if (toggledHoiFields.length > 0) {
      modifiableFields.HEAD_OFFICE_DETAILS = mapToApiFields(
        'HEAD_OFFICE_DETAILS',
        toggledHoiFields
      );
    }
    if (toggledRegisteredAddressFields.length > 0) {
      modifiableFields.ADDRESS_DETAILS = mapToApiFields(
        'registeredAddress',
        toggledRegisteredAddressFields
      );
    }
    if (toggledCorrespondanceAddressFields.length > 0) {
      modifiableFields.ADDRESS_DETAILS = [
        ...modifiableFields.ADDRESS_DETAILS,
        ...mapToApiFields(
          'correspondanceAddress',
          toggledCorrespondanceAddressFields
        ),
      ];
    }
    if (toggledNodalOfficerFields.length > 0) {
      modifiableFields.NODAL_OFFICER_DETAILS = mapToApiFields(
        'NODAL_OFFICER_DETAILS',
        toggledNodalOfficerFields
      );
    }

    const adminOneFields =
      toggledAdminOneFields.length > 0
        ? mapToApiFields('adminOneDetails', toggledAdminOneFields)
        : [];
    const adminTwoFields =
      toggledAdminTwoFields.length > 0
        ? mapToApiFields('adminTwoDetails', toggledAdminTwoFields)
        : [];

    if (adminOneFields.length > 0 || adminTwoFields.length > 0) {
      modifiableFields.INSTITUTIONAL_ADMIN_DETAILS = [
        ...adminOneFields,
        ...adminTwoFields,
      ];
    }

    const requestData: any = {
      acknowledgmentNo: userDetailData?.acknowledgementNo,
      action: 'REQUEST_FOR_MODIFICATION',
      reason: modifyReason,
      modifiableFields: modifiableFields,
      apiType: 'request-for-modification',
      remarks: modifyReason || '',
      workflowId: workFlowId,
    };

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

  const hasSelectedCheckboxes = React.useMemo(() => {
    const sectionKeys = Object.keys(selectedFields) as Array<
      keyof SelectedFieldsState
    >;
    return sectionKeys.some((section) => {
      const allSectionFields = getAllSectionFields(section);
      const selectedSectionFields = selectedFields[section] || [];
      return allSectionFields.some(
        (field) => !selectedSectionFields.includes(field)
      );
    });
  }, [selectedFields]);

  const isFieldToggleable = (
    section: keyof SelectedFieldsState,
    fieldKey: string
  ): boolean => {
    const restrictedSections = [
      'headOfInstitutionDetails',
      'nodalOfficerDetails',
      'adminOneDetails',
      'adminTwoDetails',
    ];

    const restrictedFields = [
      'title',
      'firstName',
      'middleName',
      'lastName',
      'gender',
    ];

    if (restrictedSections.includes(section)) {
      return !restrictedFields.some((field) =>
        fieldKey.toLowerCase().includes(field.toLowerCase())
      );
    }

    return true;
  };

  const toggleFieldValidation = (
    section: keyof SelectedFieldsState,
    fieldKey: string
  ) => {
    if (!isFieldToggleable(section, fieldKey)) {
      setSnackbar({
        open: true,
        message: 'This field cannot be modified',
        severity: 'warning',
      });
      return;
    }

    setSelectedFields((prev) => {
      if (!prev[section]) {
        return prev;
      }
      const currentSectionFields = prev[section] || [];
      const isSelected = currentSectionFields.includes(fieldKey);
      let newState;
      if (isSelected) {
        newState = {
          ...prev,
          [section]: currentSectionFields.filter((field) => field !== fieldKey),
        };
      } else {
        newState = {
          ...prev,
          [section]: [...currentSectionFields, fieldKey],
        };
      }
      return newState;
    });
  };

  const applicationId =
    params.acknowledgementNo || params.id || params.applicationId;

  useEffect(() => {
    console.log('reId====', reId);
    const loadData = async () => {
      if (!reId) {
        console.error('No Reporting entity ID found in URL');
        return;
      }
      dispatch(showLoader());
      try {
        await dispatch(fetchReportingEntityDetails(reId)).then(
          (detail: any) => {
            console.log('details : ', detail);
            // data = detail;
            setUserDetailData(detail?.payload);
            // setWorkFlowId(detail?.)
            // console.log('data Responbnse:-----', detail?.payload);
          }
        );
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
  }, [applicationId, dispatch, params, workFlowId, reId]);

  console.log('UserDetailData : ', userDetailData);

  if (!reId) {
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

  const getSectionKey = (title: string): keyof SelectedFieldsState => {
    const sectionMap: Record<string, keyof SelectedFieldsState> = {
      'Entity Profile': 'entityDetails',
      'Registered Address': 'registeredAddress',
      'Correspondence Address': 'correspondanceAddress',
      'Head of Institution Details': 'headOfInstitutionDetails',
      'Nodal Officer Details': 'nodalOfficerDetails',
      'Institution Admin 1': 'adminOneDetails',
      'Institution Admin 2': 'adminTwoDetails',
      'Address Details': 'addressDetails',
      'Institutional Admin User Details': 'adminDetails',
    };
    return sectionMap[title] || 'entityDetails';
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
    fields: { label: string; value: any; key?: string }[]
  ) => {
    const sectionKey = getSectionKey(title);
    const validFields = fields.filter((field) => field.value);
    const allSectionFields = getAllSectionFields(sectionKey);
    const selectedSectionFields = selectedFields[sectionKey] || [];
    const allFieldsSelected =
      allSectionFields.length > 0 &&
      allSectionFields.every((field) => selectedSectionFields.includes(field));

    return (
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${sectionKey}-content`}
          id={`${sectionKey}-header`}
        >
          <Box sx={{ position: 'relative', width: '100%', pr: '40px' }}>
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontSize: '16px',
                fontFamily: 'Gilroy',
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
          </Box>
        </StyledAccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Grid container className="no-margin">
            {validFields.map((field, index) => {
              let fileUrl = '';
              if (
                title === 'Entity Profile' &&
                (field.key === 'pan' || field.key === 'cin')
              ) {
                fileUrl = getFileOrNot(field.key);
              }

              return (
                <React.Fragment key={index}>
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    key={index}
                    sx={{
                      p: 2,
                      backgroundColor: '#fff',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, pr: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: '400',
                            fontFamily: 'Gilroy',
                            fontSize: '14px',
                          }}
                        >
                          {field.label}{' '}
                          {requiredFields.includes(field.key ?? '') && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.primary',
                            fontWeight: 600,
                            mt: 0.5,
                            fontSize: '14px',
                            fontFamily: 'Gilroy',
                          }}
                        >
                          {!fileUrl && (field.value || '-')}{' '}
                          {
                            fileUrl && (
                              <FilePreview
                                base64String={fileUrl}
                                fileName={field.value}
                                fileIcon={true}
                                onlyIcon={true}
                              />
                            ) /* Render FilePreview only if fileUrl is available */
                          }
                        </Typography>
                      </Box>

                      {field.key && (
                        <RenderDocumentFile
                          keyName={field.key}
                          documentArray={userDetailData?.documents ?? []}
                        />
                      )}
                    </Box>
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
        </AccordionDetails>
      </StyledAccordion>
    );
  };

  const renderMutiSection = ({
    fieldsOne,
    fieldsTwo,
    titleOne,
    titleTwo,
    title,
  }: {
    title: string;
    titleOne: string;
    fieldsOne: { label: string; value: any; key?: string }[];
    titleTwo: string;
    fieldsTwo: { label: string; value: any; key?: string }[];
  }) => {
    const sectionKeyOne = getSectionKey(titleOne);
    const validFieldsOne = fieldsOne.filter((field) => field.value);
    const allSectionFieldsOne = getAllSectionFields(sectionKeyOne);

    const selectedSectionFieldsOne = selectedFields[sectionKeyOne] || [];
    const allFieldsSelectedOne =
      allSectionFieldsOne.length > 0 &&
      allSectionFieldsOne.every((field) =>
        selectedSectionFieldsOne.includes(field)
      );

    //

    const sectionKeyTwo = getSectionKey(titleTwo);
    const validFieldsTwo = fieldsTwo.filter((field) => field.value);
    const allSectionFieldsTwo = getAllSectionFields(sectionKeyTwo);

    const selectedSectionFieldsTwo = selectedFields[sectionKeyTwo] || [];
    const allFieldsSelectedTwo =
      allSectionFieldsTwo.length > 0 &&
      allSectionFieldsTwo.every((field) =>
        selectedSectionFieldsTwo.includes(field)
      );

    const SectionCheckmarkClick = (
      e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
    ) => {
      handleSectionCheckmarkClick(e, sectionKeyOne);
      handleSectionCheckmarkClick(e, sectionKeyTwo);
    };

    return (
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${getSectionKey(title)}-content`}
          id={`${getSectionKey(title)}-header`}
        >
          <Box sx={{ position: 'relative', width: '100%', pr: '40px' }}>
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '16px',
                fontFamily: 'Gilroy',
              }}
            >
              {title}
            </Typography>
            {/* <Box
              className="section-status-icon"
              sx={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onClick={SectionCheckmarkClick}
            >
              <IconButton>
                {allFieldsSelectedOne && allFieldsSelectedTwo ? (
                  <CheckCircleIcon
                    fontSize="medium"
                    sx={{ color: '#54B749' }}
                  />
                ) : (
                  <CancelIcon fontSize="medium" sx={{ color: 'red' }} />
                )}
              </IconButton>
            </Box> */}
          </Box>
        </StyledAccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Typography
            variant="h6"
            sx={{
              p: 1,
              fontWeight: 'bold',
              fontFamily: 'Gilroy',
              fontSize: '16px',
            }}
          >
            {titleOne}
          </Typography>
          <Grid container>
            {validFieldsOne.map((field, index) => {
              const fieldKey = field.key || field.label;
              const isSelected = (selectedFields[sectionKeyOne] || []).includes(
                fieldKey
              );
              return (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={index}
                  sx={{
                    p: 2,
                    backgroundColor: '#fff',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, pr: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 400,
                          fontSize: '14px',
                          fontFamily: 'Gilroy',
                        }}
                      >
                        {field.label}{' '}
                        {requiredFields.includes(field.key ?? '') && (
                          <span style={{ color: 'red' }}>*</span>
                        )}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.primary',
                          fontWeight: 600,
                          mt: 0.5,
                          fontSize: '14px',
                          fontFamily: 'Gilroy',
                        }}
                      >
                        {field.value || '-'}
                      </Typography>
                    </Box>

                    {field.key && (
                      <RenderDocumentFile
                        keyName={field.key}
                        documentArray={userDetailData?.documents ?? []}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          <Typography
            variant="h6"
            sx={{
              p: 1,
              fontWeight: 'bold',
              fontFamily: 'Gilroy',
              fontSize: '16px',
            }}
          >
            {titleTwo}
          </Typography>
          <Grid container>
            {validFieldsTwo.map((field, index) => {
              const fieldKey = field.key || field.label;
              const isSelected = (selectedFields[sectionKeyTwo] || []).includes(
                fieldKey
              );
              return (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={index}
                  sx={{
                    p: 2,
                    backgroundColor: '#fff',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, pr: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 400,
                          fontSize: '14px',
                          fontFamily: 'Gilroy',
                        }}
                      >
                        {field.label}{' '}
                        {requiredFields.includes(field.key ?? '') && (
                          <span style={{ color: 'red' }}>*</span>
                        )}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.primary',
                          fontWeight: 600,
                          mt: 0.5,
                          fontSize: '14px',
                          fontFamily: 'Gilroy',
                        }}
                      >
                        {field.value || '-'}
                      </Typography>
                    </Box>

                    {/* <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFieldValidation(sectionKeyTwo, fieldKey);
                      }}
                      disabled={!isFieldToggleable(sectionKeyTwo, fieldKey)}
                      title={
                        isFieldToggleable(sectionKeyTwo, fieldKey)
                          ? isSelected
                            ? 'Approved - Click to reject'
                            : 'Rejected - Click to approve'
                          : 'This field cannot be modified'
                      }
                    >
                      {isSelected ? (
                        <CheckCircleIcon
                          fontSize="medium"
                          sx={{ color: '#52c41a' }}
                        />
                      ) : (
                        <CancelIcon fontSize="medium" sx={{ color: 'red' }} />
                      )}
                    </IconButton> */}
                    {field.key && (
                      <RenderDocumentFile
                        keyName={field.key}
                        documentArray={userDetailData?.documents ?? []}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </AccordionDetails>
      </StyledAccordion>
    );
  };

  // helper: find document by type
  const getDocument = (type: string) =>
    userDetailData?.entityDetails?.documents?.find(
      (doc: any) => doc.documentType === type
    );

  const getNodalDoc = (type: string) =>
    userDetailData?.nodalOfficerDetails?.documents?.find(
      (doc: any) => doc.documentType === type
    );

  const getAdminOneDoc = (type: string) =>
    userDetailData?.adminOneDetails?.documents?.find(
      (doc: any) => doc.documentType === type
    );

  const getAdminTwoDoc = (type: string) =>
    userDetailData?.adminTwoDetails?.documents?.find(
      (doc: any) => doc.documentType === type
    );

  const handleDeactivate = () => {
    setShowDeactivateModal(true);
    console.log('handle Deactivate is clicked');
  };

  const handleSuspend = () => {
    setShowSuspendModal(true);
    console.log('handle Suspend is clicked');
  };

  const handleRevoke = () => {
    setShowRevokeModal(true);
    console.log('handle Revoke is clicked');
  };

  const getFileOrNot = (key: string) => {
    const file = userDetailData?.entityDetails?.documents?.find(
      (doc: any) => doc.documentType === `RE_${key.toUpperCase()}`
    );

    console.log('file data : ', file);
    return file ? file.base64Content : null;
  };

  // if (!data) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon sx={{ color: 'blac' }} />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: 'black' }}
      >
        Back
      </Button>

      <Box>
        {renderSection('Entity Profile', [
          {
            key: 'nameOfInstitution',
            label: 'Name of Institution',
            value: userDetailData?.entityDetails?.nameOfInstitution,
          },
          {
            key: 'regulator',
            label: 'Regulator',
            value: userDetailData?.entityDetails?.regulator,
          },
          {
            key: 'institutionType',
            label: 'Institution Type',
            value: userDetailData?.entityDetails?.institutionType,
          },
          {
            key: 'constitution',
            label: 'First Constitution',
            value:
              constitutionObject.find(
                (x) => x.code === userDetailData?.entityDetails?.constitution
              )?.name ?? '-',
          },
          {
            key: 'proprietorName',
            label: 'Proprietor Name',
            value: userDetailData?.entityDetails?.proprietorName,
          },
          {
            key: 'registrationNo',
            label: 'Registration Number',
            value: userDetailData?.entityDetails?.registrationNo,
          },
          {
            key: 'pan',
            label: 'PAN',
            value: userDetailData?.entityDetails?.panNo,
          },
          {
            key: 'cin',
            label: 'CIN',
            value: userDetailData?.entityDetails?.cinNo,
          },
          {
            key: 'llpin',
            label: 'LLPIN (Limited liability Partnership firm)',
            value: userDetailData?.entityDetails?.llpinNo,
          },
          {
            key: 'gstin',
            label: 'GSTIN',
            value: userDetailData?.entityDetails?.gstinNo,
          },
          {
            key: 'reWebsite',
            label: 'RE Website',
            value: userDetailData?.entityDetails?.reWebsite ?? 'Not provided',
          },
          {
            key: 'regulatorLicense',
            label: 'Regulator License/Certificate/Notification',
            value: (() => {
              const doc = getDocument('REGULATOR_LICENCE');
              return doc ? (
                <FilePreview
                  base64String={doc.base64Content}
                  fileName={doc.fileName}
                  mimeType="application/pdf"
                  fileIcon={true}
                />
              ) : (
                'Not provided'
              );
            })(),
          },
          {
            key: 'registrationCertificate',
            label: 'Registration Certificate',
            value: (() => {
              const doc = getDocument('REGISTRATION_CERTIFICATE');
              return doc ? (
                <FilePreview
                  base64String={doc.base64Content}
                  fileName={doc.fileName}
                  mimeType="application/pdf"
                  fileIcon={true}
                />
              ) : (
                'Not provided'
              );
            })(),
          },
          {
            key: 'addressProof',
            label: 'Address Proof',
            value: (() => {
              const doc = getDocument('ADDRESS_PROOF');
              return doc ? (
                <FilePreview
                  base64String={doc.base64Content}
                  fileName={doc.fileName}
                  mimeType="application/pdf"
                  fileIcon={true}
                />
              ) : (
                'Not provided'
              );
            })(),
          },
          {
            key: 'reOther',
            label: 'Other Document',
            value: (() => {
              const doc = getDocument('RE_OTHER');
              return doc ? (
                <FilePreview
                  base64String={doc.base64Content}
                  fileName={doc.fileName}
                  mimeType="application/pdf"
                  fileIcon={true}
                />
              ) : (
                'Not provided'
              );
            })(),
          },
        ])}

        {renderMutiSection({
          title: 'Address Details',
          titleOne: 'Registered Address',
          fieldsOne: [
            {
              key: 'registeredAddressLine1',
              label: 'Address Line',
              value: userDetailData?.registeredAddress?.line1,
            },
            {
              key: 'registeredAddressLine2',
              label: 'Address Line 2',
              value: userDetailData?.registeredAddress?.line2,
            },
            {
              key: 'registeredAddressLine3',
              label: 'Address Line 3',
              value: userDetailData?.registeredAddress?.line3,
            },
            {
              key: 'registeredAddressCountryCode',
              label: 'Country Code',
              value: userDetailData?.registeredAddress?.countryCode,
            },
            {
              key: 'registeredAddressState',
              label: 'State Code',
              value: userDetailData?.registeredAddress?.state,
            },
            {
              key: 'registeredAddressDistrict',
              label: 'District',
              value: userDetailData?.registeredAddress?.district,
            },
            {
              key: 'registeredAddressCityTown',
              label: 'City/Town',
              value: userDetailData?.registeredAddress?.cityTown,
            },
            {
              key: 'registeredAddressPinCode',
              label: 'PIN Code',
              value: userDetailData?.registeredAddress?.pinCode,
            },
            {
              key: 'registeredAddressAlternatePinCode',
              label: 'Alternate PIN Code',
              value: userDetailData?.registeredAddress?.alternatePinCode,
            },
          ],
          fieldsTwo: [
            {
              key: 'correspondenceAddressLine1',
              label: 'Address Line ',
              value: userDetailData?.correspondanceAddress?.line1,
            },
            {
              key: 'correspondenceAddressLine2',
              label: 'Address Line 2',
              value: userDetailData?.correspondanceAddress?.line2,
            },
            {
              key: 'correspondenceAddressLine3',
              label: 'Address Line 3',
              value: userDetailData?.correspondanceAddress?.line3,
            },
            {
              key: 'correspondenceAddressCountryCode',
              label: 'Country Code',
              value: userDetailData?.correspondanceAddress?.countryCode,
            },
            {
              key: 'correspondenceAddressState',
              label: 'State Code',
              value: userDetailData?.correspondanceAddress?.state,
            },
            {
              key: 'correspondenceAddressDistrict',
              label: 'District',
              value: userDetailData?.correspondanceAddress?.district,
            },
            {
              key: 'correspondenceAddressCityTown',
              label: 'City/Town',
              value: userDetailData?.correspondanceAddress?.cityTown,
            },
            {
              key: 'correspondenceAddressPinCode',
              label: 'PIN Code',
              value: userDetailData?.correspondanceAddress?.pinCode,
            },
            {
              key: 'correspondenceAddressAlternatePinCode',
              label: 'Pin Code (in case of others)',
              value: userDetailData?.correspondanceAddress?.alternatePinCode,
            },
          ],
          titleTwo: 'Correspondence Address',
        })}

        {renderSection('Head of Institution Details', [
          // {
          //   key: 'hoiCitizenship',
          //   label: 'Citizenship',
          //   value: userDetailData?.headOfInstitutionDetails?.citizenship,
          // },
          // {
          //   key: 'hoiCkycNumber',
          //   label: 'CKYC Number',
          //   value: userDetailData?.headOfInstitutionDetails?.ckycNumber,
          // },
          // {
          //   key: 'hoiTitle',
          //   label: 'Title',
          //   value: userDetailData?.headOfInstitutionDetails?.title,
          // },
          {
            key: 'hoiFirstName',
            label: 'First Name',
            value: userDetailData?.headOfInstitutionDetails?.firstName,
          },
          {
            key: 'hoiMiddleName',
            label: 'Middle Name',
            value: userDetailData?.headOfInstitutionDetails?.middleName,
          },
          {
            key: 'hoiLastName',
            label: 'Last Name',
            value: userDetailData?.headOfInstitutionDetails?.lastName,
          },
          {
            key: 'hoiDesignation',
            label: 'Designation',
            value: userDetailData?.headOfInstitutionDetails?.designation,
          },
          {
            key: 'hoiEmailId',
            label: 'Email',
            value: userDetailData?.headOfInstitutionDetails?.emailId,
          },
          {
            key: 'hoiGender',
            label: 'Gender',
            value: userDetailData?.headOfInstitutionDetails?.gender,
          },
          {
            key: 'hoiCkycNumber',
            label: 'CKYC Number',
            value: userDetailData?.headOfInstitutionDetails?.ckycNumber,
          },
          {
            key: 'hoiCitizenship',
            label: 'Citizenship',
            value: userDetailData?.headOfInstitutionDetails?.citizenship,
          },
          {
            key: 'hoiCountryCode',
            label: 'Country Code',
            value: userDetailData?.headOfInstitutionDetails?.countryCode,
          },
          {
            key: 'hoiMobileNo',
            label: 'Mobile No',
            value: userDetailData?.headOfInstitutionDetails?.mobileNo,
          },
          {
            key: 'hoiLandline',
            label: 'Landline',
            value: userDetailData?.headOfInstitutionDetails?.landline,
          },
          {
            key: 'hoiProofOfIdentitye',
            label: 'proof of Identity',
            value: userDetailData?.headOfInstitutionDetails?.proofOfIdentity,
          },
          {
            key: 'hoiProofOfIdentityeNumber',
            label: 'proof of Identity Number',
            value: userDetailData?.headOfInstitutionDetails?.identityNumber,
          },
          {
            key: 'hoiDateOfBirth',
            label: 'Date of Birth',
            value: userDetailData?.headOfInstitutionDetails?.identityNumber,
          },
          {
            key: 'hoiDateOfBoardResolutionForAppointment',
            label: 'Date of Board Resolution for Appointment',
            value:
              userDetailData?.headOfInstitutionDetails?.dateOfBoardResolution,
          },
          {
            key: 'hoiBoardResolution',
            label: 'Board Resolution',
            value: userDetailData?.headOfInstitutionDetails?.boardResolution,
          },
          {
            key: 'hoiCertifiedCopyOfProofOfIdentityDocument',
            label: 'Certified copy of Proof of Identity Document',
            value: userDetailData?.headOfInstitutionDetails?.boardResolution,
          },
          {
            key: 'hoiCertifiedCopyOfProofOfIdentityDocument',
            label: 'Certified copy of Proof of Identity Document',
            value: userDetailData?.headOfInstitutionDetails?.boardResolution,
          },
        ])}

        {/* {renderSection('Nodal Officer Details', [
          {
            key: 'noCitizenship',
            label: 'Citizenship',
            value: userDetailData?.nodalOfficerDetails?.citizenship,
          },
          {
            key: 'noCkycNumber',
            label: 'CKYC Number',
            value: userDetailData?.nodalOfficerDetails?.ckycNo,
          },
          {
            key: 'noTitle',
            label: 'Title',
            value: userDetailData?.nodalOfficerDetails?.title,
          },
          {
            key: 'noFirstName',
            label: 'First Name',
            value: userDetailData?.nodalOfficerDetails?.firstName,
          },
          {
            key: 'noMiddleName',
            label: 'Middle Name',
            value: userDetailData?.nodalOfficerDetails?.middleName,
          },
          {
            key: 'noLastName',
            label: 'Last Name',
            value: userDetailData?.nodalOfficerDetails?.lastName,
          },
          {
            key: 'noDesignation',
            label: 'Designation',
            value: userDetailData?.nodalOfficerDetails?.designation,
          },
          {
            key: 'noEmailId',
            label: 'Email',
            value: userDetailData?.nodalOfficerDetails?.email,
          },
          {
            key: 'noGender',
            label: 'Gender',
            value: userDetailData?.nodalOfficerDetails?.gender,
          },
          {
            key: 'noCountryCode',
            label: 'Country Code',
            value: userDetailData?.nodalOfficerDetails?.countryCode,
          },
          {
            key: 'noMobileNo',
            label: 'Mobile No',
            value: userDetailData?.nodalOfficerDetails?.mobileNo,
          },
          {
            key: 'noLandline',
            label: 'Landline',
            value: userDetailData?.nodalOfficerDetails?.landline,
          },
          {
            key: 'noIdentityNumber',
            label: 'Identity Number',
            value: userDetailData?.nodalOfficerDetails?.identityNumber,
          },
          {
            key: 'noProofOfIdentity',
            label: 'Proof Of Identity',
            value: userDetailData?.nodalOfficerDetails?.proofOfIdentity,
          },
          {
            key: 'noDateOfBirth',
            label: 'Date of Birth',
            value: userDetailData?.nodalOfficerDetails?.dateOfBirth,
          },
          {
            key: 'noSameAsRegisteredAddress',
            label: 'Office Address',
            value: userDetailData?.nodalOfficerDetails?.sameAsRegisteredAddress,
          },
          {
            key: 'noDateOfBoardResolution',
            label: 'Date of Board Resolution for Appointment',
            value: userDetailData?.nodalOfficerDetails?.dateOfBoardResolution,
          },
          {
            key: 'noBoardResolution',
            label: 'Board Resolution',
            value: userDetailData?.nodalOfficerDetails?.noBoardResolution ? (
              <FilePreview
                base64String={
                  userDetailData?.nodalOfficerDetails.noBoardResolution
                }
                fileName="Board Resolution"
                mimeType="application/pdf"
              />
            ) : (
              'Not provided'
            ),
          },
          {
            key: 'noCertifiedPoi',
            label: 'Certified copy of Proof of Identity Document',
            value: userDetailData?.nodalOfficerDetails?.noCertifiedPoi ? (
              <FilePreview
                base64String={
                  userDetailData?.nodalOfficerDetails.noCertifiedPoi
                }
                fileName="Proof of Identity Document"
                mimeType="application/pdf"
              />
            ) : (
              'Not provided'
            ),
          },
          {
            key: 'noCertifiedPhotoIdentity',
            label: 'Certified copy of Photo Identity Card',
            value: userDetailData?.nodalOfficerDetails
              ?.noCertifiedPhotoIdentity ? (
              <FilePreview
                base64String={
                  userDetailData?.nodalOfficerDetails.noCertifiedPhotoIdentity
                }
                fileName="Photo Identity Card"
                mimeType="application/pdf"
              />
            ) : (
              'Not provided'
            ),
          },
        ])} */}

        {/* {renderSection('Nodal Officer Details', [
          // {
          //   key: 'noCitizenship',
          //   label: 'Citizenship',
          //   value: userDetailData?.nodalOfficerDetails?.citizenship,
          // },
          // {
          //   key: 'noCkycNumber',
          //   label: 'CKYC Number',
          //   value: userDetailData?.nodalOfficerDetails?.ckycNo,
          // },
          // {
          //   key: 'noTitle',
          //   label: 'Title',
          //   value: userDetailData?.nodalOfficerDetails?.title,
          // },
          {
            key: 'noFirstName',
            label: 'First Name',
            value: userDetailData?.nodalOfficerDetails?.firstName,
          },
          {
            key: 'noMiddleName',
            label: 'Middle Name',
            value: userDetailData?.nodalOfficerDetails?.middleName,
          },
          {
            key: 'noLastName',
            label: 'Last Name',
            value: userDetailData?.nodalOfficerDetails?.lastName,
          },
          {
            key: 'noDesignation',
            label: 'Designation',
            value: userDetailData?.nodalOfficerDetails?.designation,
          },
          {
            key: 'noEmailId',
            label: 'Email',
            value: userDetailData?.nodalOfficerDetails?.email,
          },
          {
            key: 'noGender',
            label: 'Gender',
            value: userDetailData?.nodalOfficerDetails?.gender,
          },
          {
            key: 'noCkycNumber',
            label: 'CKYC Number',
            value: userDetailData?.nodalOfficerDetails?.ckycNo,
          },
          {
            key: 'noCitizenship',
            label: 'Citizenship',
            value: userDetailData?.nodalOfficerDetails?.citizenship,
          },
          {
            key: 'noCountryCode',
            label: 'Country Code',
            value: userDetailData?.nodalOfficerDetails?.countryCode,
          },
          {
            key: 'noMobileNo',
            label: 'Mobile Number',
            value: userDetailData?.nodalOfficerDetails?.mobileNumber,
          },
          {
            key: 'noLandline',
            label: 'Landline Number',
            value: userDetailData?.nodalOfficerDetails?.landline,
          },
          {
            key: 'noIdentityNumber',
            label: 'Proof of Identity',
            value: userDetailData?.nodalOfficerDetails?.proofOfIdentity,
          },
          {
            key: 'noIdentityNumber',
            label: 'Proof of Identity Number',
            value: userDetailData?.nodalOfficerDetails?.identityNumber,
          },
          {
            key: 'noDateOfBirth',
            label: 'Date of Birth',
            value: userDetailData?.nodalOfficerDetails?.dateOfBirth,
          },
          // {
          //   key: 'noSameAsRegisteredAddress',
          //   label: 'Office Address',
          //   value: userDetailData?.nodalOfficerDetails?.sameAsRegisteredAddress,
          // },
          {
            key: 'noDateOfBoardResolution',
            label: 'Date of Board Resolution for Appointment',
            value: userDetailData?.nodalOfficerDetails?.dateOfBoardResolution,
          },
          {
            key: 'noBoardResolution',
            label: 'Board Resolution',
            value: userDetailData?.nodalOfficerDetails?.noBoardResolution ? (
              <FilePreview
                base64String={
                  userDetailData?.nodalOfficerDetails.noBoardResolution
                }
                fileName="Board Resolution"
                mimeType="application/pdf"
              />
            ) : (
              'Not provided'
            ),
          },
          {
            key: 'noCertifiedPhotoIdentity',
            label: 'Certified copy of Proof of Identity Document',
            value: userDetailData?.nodalOfficerDetails?.noCertifiedPoi ? (
              <FilePreview
                base64String={
                  userDetailData?.nodalOfficerDetails.noCertifiedPoi
                }
                fileName="Proof of Identity Document"
                mimeType="application/pdf"
              />
            ) : (
              'Not provided'
            ),
          },
          {
            key: 'noCertifiedPoi',
            label: 'Certified copy of Photo Identity Card',
            value: userDetailData?.nodalOfficerDetails
              ?.noCertifiedPhotoIdentity ? (
              <FilePreview
                base64String={
                  userDetailData?.nodalOfficerDetails.noCertifiedPhotoIdentity
                }
                fileName="Photo Identity Card"
                mimeType="application/pdf"
              />
            ) : (
              'Not provided'
            ),
          },
        ])} */}
        {renderSection('Nodal Officer Details', [
          {
            key: 'noFirstName',
            label: 'First Name',
            value: userDetailData?.nodalOfficerDetails?.firstName,
          },
          {
            key: 'noMiddleName',
            label: 'Middle Name',
            value: userDetailData?.nodalOfficerDetails?.middleName,
          },
          {
            key: 'noLastName',
            label: 'Last Name',
            value: userDetailData?.nodalOfficerDetails?.lastName,
          },
          {
            key: 'noDesignation',
            label: 'Designation',
            value: userDetailData?.nodalOfficerDetails?.designation,
          },
          {
            key: 'noEmailId',
            label: 'Email',
            value: userDetailData?.nodalOfficerDetails?.email,
          },
          {
            key: 'noGender',
            label: 'Gender',
            value: userDetailData?.nodalOfficerDetails?.gender,
          },
          {
            key: 'noCkycNumber',
            label: 'CKYC Number',
            value: userDetailData?.nodalOfficerDetails?.ckycNo,
          },
          {
            key: 'noCitizenship',
            label: 'Citizenship',
            value: userDetailData?.nodalOfficerDetails?.citizenship,
          },
          {
            key: 'noCountryCode',
            label: 'Country Code',
            value: userDetailData?.nodalOfficerDetails?.countryCode,
          },
          {
            key: 'noMobileNo',
            label: 'Mobile Number',
            value: userDetailData?.nodalOfficerDetails?.mobileNumber,
          },
          {
            key: 'noLandline',
            label: 'Landline Number',
            value: userDetailData?.nodalOfficerDetails?.landline,
          },
          {
            key: 'noIdentityNumber',
            label: 'Proof of Identity',
            value: userDetailData?.nodalOfficerDetails?.proofOfIdentity,
          },
          {
            key: 'noIdentityNumber',
            label: 'Proof of Identity Number',
            value: userDetailData?.nodalOfficerDetails?.identityNumber,
          },
          {
            key: 'noDateOfBirth',
            label: 'Date of Birth',
            value: userDetailData?.nodalOfficerDetails?.dateOfBirth,
          },
          {
            key: 'noDateOfBoardResolution',
            label: 'Date of Board Resolution for Appointment',
            value: userDetailData?.nodalOfficerDetails?.dateOfBoardResolution,
          },
          {
            key: 'noBoardResolution',
            label: 'Board Resolution',
            value: (() => {
              const doc = getNodalDoc('NO_BOARD_RESOLUTION');
              return doc ? (
                <FilePreview
                  base64String={doc.base64Content}
                  fileName={doc.fileName}
                  mimeType="application/pdf"
                  fileIcon={true}
                />
              ) : (
                'Not provided'
              );
            })(),
          },
          {
            key: 'noCertifiedPoi',
            label: 'Certified copy of Proof of Identity Document',
            value: (() => {
              const doc = getNodalDoc('NO_CERTIFIED_POI');
              return doc ? (
                <FilePreview
                  base64String={doc.base64Content}
                  fileName={doc.fileName}
                  mimeType="application/pdf"
                  fileIcon={true}
                />
              ) : (
                'Not provided'
              );
            })(),
          },
          {
            key: 'noCertifiedPhotoIdentity',
            label: 'Certified copy of Photo Identity Card',
            value: (() => {
              const doc = getNodalDoc('NO_CERTIFIED_PHOTO_IDENTITY');
              return doc ? (
                <FilePreview
                  base64String={doc.base64Content}
                  fileName={doc.fileName}
                  mimeType="application/pdf"
                  fileIcon={true}
                />
              ) : (
                'Not provided'
              );
            })(),
          },
        ])}

        {/* {renderMutiSection({
          title: 'Institutional Admin User Details',
          titleOne: 'Institution Admin 1',
          titleTwo: 'Institution Admin 2',
          fieldsOne: [
            // {
            //   key: 'adminOneTitle',
            //   label: 'Title',
            //   value: userDetailData?.adminOneDetails?.title,
            // },
            {
              key: 'adminOneFirstName',
              label: 'First Name',
              value: userDetailData?.adminOneDetails?.firstName,
            },
            {
              key: 'adminOneMiddleName',
              label: 'Middle Name',
              value: userDetailData?.adminOneDetails?.middleName,
            },
            {
              key: 'adminOneLastName',
              label: 'Last Name',
              value: userDetailData?.adminOneDetails?.lastName,
            },
            {
              key: 'adminOneDesignation',
              label: 'Designation',
              value: userDetailData?.adminOneDetails?.designation,
            },
            {
              key: 'adminOneEmailId',
              label: 'Email',
              value: userDetailData?.adminOneDetails?.email,
            },
            {
              key: 'adminOneGender',
              label: 'Gender',
              value: userDetailData?.adminOneDetails?.gender,
            },
            {
              key: 'adminOneCkycNumber',
              label: 'CKYC Number',
              value: userDetailData?.adminOneDetails?.ckycNumber,
            },
            {
              key: 'adminOneCitizenship',
              label: 'Citizenship',
              value: userDetailData?.adminOneDetails?.citizenship,
            },
            {
              key: 'adminOneCountryCode',
              label: 'Country Code',
              value: userDetailData?.adminOneDetails?.countryCode,
            },
            {
              key: 'adminOneMobileNo',
              label: 'Mobile No',
              value: userDetailData?.adminOneDetails?.mobileNo,
            },
            {
              key: 'adminOneLandline',
              label: 'Landline',
              value: userDetailData?.adminOneDetails?.landline,
            },
            {
              key: 'adminOneProofOfIdentity',
              label: 'Proof of Identity',
              value: userDetailData?.adminOneDetails?.proofOfIdentity,
            },
            {
              key: 'adminOneIdentityNumber',
              label: 'Identity Number',
              value: userDetailData?.adminOneDetails?.identityNumber,
            },
            {
              key: 'adminOneEmployeeCode',
              label: 'Employee Code',
              value: userDetailData?.adminOneDetails?.employeeCode,
            },
            // {
            //   key: 'adminOneSameAsRegisteredAddress',
            //   label: 'Office Address',
            //   value: userDetailData?.adminOneDetails?.sameAsRegisteredAddress,
            // },
            {
              key: 'adminOneAuthorizationLetterDetails',
              label: 'Authorization letter by Competent Authority',
              value:
                userDetailData?.adminOneDetails?.authorizationLetterDetails,
            },
            {
              key: 'adminOneDateOfAuthorization',
              label: 'Date of Authorization',
              value: userDetailData?.adminOneDetails?.dateOfAuthorization,
            },
            {
              key: 'adminOneCertifiedPoi',
              label: 'Certified copy of the Proof of the Identity',
              value: userDetailData?.adminOneDetails?.iauCertifiedPoi ? (
                <FilePreview
                  base64String={userDetailData?.adminOneDetails.iauCertifiedPoi}
                  fileName="Admin One Proof of Identity"
                  mimeType="application/pdf"
                />
              ) : (
                'Not provided'
              ),
            },
            {
              key: 'adminOneCertifiedPhotoIdentity',
              label: 'Certified copy of the Photo Identity Card',
              value: userDetailData?.adminOneDetails
                ?.iauCertifiedPhotoIdentity ? (
                <FilePreview
                  base64String={
                    userDetailData?.adminOneDetails.iauCertifiedPhotoIdentity
                  }
                  fileName="Admin One Photo Identity Card"
                  mimeType="application/pdf"
                />
              ) : (
                'Not provided'
              ),
            },
          ],
          fieldsTwo: [
            {
              key: 'adminTwoCitizenship',
              label: 'Citizenship',
              value: userDetailData?.adminTwoDetails?.citizenship,
            },
            {
              key: 'adminTwoCkycNumber',
              label: 'CKYC Number',
              value: userDetailData?.adminTwoDetails?.ckycNumber,
            },
            {
              key: 'adminTwoTitle',
              label: 'Title',
              value: userDetailData?.adminTwoDetails?.title,
            },
            {
              key: 'adminTwoFirstName',
              label: 'First Name',
              value: userDetailData?.adminTwoDetails?.firstName,
            },
            {
              key: 'adminTwoMiddleName',
              label: 'Middle Name',
              value: userDetailData?.adminTwoDetails?.middleName,
            },
            {
              key: 'adminTwoLastName',
              label: 'Last Name',
              value: userDetailData?.adminTwoDetails?.lastName,
            },
            {
              key: 'adminTwoDesignation',
              label: 'Designation',
              value: userDetailData?.adminTwoDetails?.designation,
            },
            {
              key: 'adminTwoEmailId',
              label: 'Email',
              value: userDetailData?.adminTwoDetails?.email,
            },
            {
              key: 'adminTwoGender',
              label: 'Gender',
              value: userDetailData?.adminTwoDetails?.gender,
            },
            {
              key: 'adminTwoCountryCode',
              label: 'Country Code',
              value: userDetailData?.adminTwoDetails?.countryCode,
            },
            {
              key: 'adminTwoMobileNo',
              label: 'Mobile No',
              value: userDetailData?.adminTwoDetails?.mobileNo,
            },
            {
              key: 'adminTwoLandline',
              label: 'Landline Number',
              value: userDetailData?.adminTwoDetails?.landline,
            },
            {
              key: 'adminTwoProofOfIdentity',
              label: 'Proof of Identity',
              value: userDetailData?.adminTwoDetails?.proofOfIdentity,
            },
            {
              key: 'adminTwoIdentityNumber',
              label: 'Proof of Identity Number',
              value: userDetailData?.adminTwoDetails?.identityNumber,
            },
            {
              key: 'adminTwoEmployeeCode',
              label: 'Employee Code',
              value: userDetailData?.adminTwoDetails?.employeeCode,
            },
            {
              key: 'adminTwoSameAsRegisteredAddress',
              label: 'Office Address',
              value: userDetailData?.adminTwoDetails?.sameAsRegisteredAddress,
            },
            {
              key: 'adminTwoAuthorizationLetterDetails',
              label: 'Authorization letter by Competent Authority',
              value:
                userDetailData?.adminTwoDetails?.authorizationLetterDetails,
            },
            {
              key: 'adminTwoDateOfAuthorization',
              label: 'Date of Authorization',
              value: userDetailData?.adminTwoDetails?.dateOfAuthorization,
            },
            {
              key: 'adminTwoCertifiedPoi',
              label: 'Certified copy of the Proof of the Identity',
              value: userDetailData?.adminTwoDetails?.iauCertifiedPoi ? (
                <FilePreview
                  base64String={userDetailData?.adminTwoDetails.iauCertifiedPoi}
                  fileName="Admin Two Proof of Identity"
                  mimeType="application/pdf"
                />
              ) : (
                'Not provided'
              ),
            },
            {
              key: 'adminTwoCertifiedPhotoIdentity',
              label: 'Certified copy of Photo Identity Card',
              value: userDetailData?.adminTwoDetails
                ?.iauCertifiedPhotoIdentity ? (
                <FilePreview
                  base64String={
                    userDetailData?.adminTwoDetails.iauCertifiedPhotoIdentity
                  }
                  fileName="Admin Two Photo Identity Card"
                  mimeType="application/pdf"
                />
              ) : (
                'Not provided'
              ),
            },
          ],
        })} */}

        {renderMutiSection({
          title: 'Institutional Admin User Details',
          titleOne: 'Institution Admin 1',
          titleTwo: 'Institution Admin 2',
          fieldsOne: [
            {
              key: 'adminOneFirstName',
              label: 'First Name',
              value: userDetailData?.adminOneDetails?.firstName,
            },
            {
              key: 'adminOneMiddleName',
              label: 'Middle Name',
              value: userDetailData?.adminOneDetails?.middleName,
            },
            {
              key: 'adminOneLastName',
              label: 'Last Name',
              value: userDetailData?.adminOneDetails?.lastName,
            },
            {
              key: 'adminOneDesignation',
              label: 'Designation',
              value: userDetailData?.adminOneDetails?.designation,
            },
            {
              key: 'adminOneEmailId',
              label: 'Email',
              value: userDetailData?.adminOneDetails?.emailId,
            },
            {
              key: 'adminOneGender',
              label: 'Gender',
              value: userDetailData?.adminOneDetails?.gender,
            },
            {
              key: 'adminOneCkycNumber',
              label: 'CKYC Number',
              value: userDetailData?.adminOneDetails?.ckycNumber,
            },
            {
              key: 'adminOneCitizenship',
              label: 'Citizenship',
              value: userDetailData?.adminOneDetails?.citizenship,
            },
            {
              key: 'adminOneCountryCode',
              label: 'Country Code',
              value: userDetailData?.adminOneDetails?.countryCode,
            },
            {
              key: 'adminOneMobileNo',
              label: 'Mobile No',
              value: userDetailData?.adminOneDetails?.mobileNo,
            },
            {
              key: 'adminOneLandline',
              label: 'Landline',
              value: userDetailData?.adminOneDetails?.landline,
            },
            {
              key: 'adminOneProofOfIdentity',
              label: 'Proof of Identity',
              value: userDetailData?.adminOneDetails?.proofOfIdentity,
            },
            {
              key: 'adminOneIdentityNumber',
              label: 'Identity Number',
              value: userDetailData?.adminOneDetails?.identityNumber,
            },
            {
              key: 'adminOneEmployeeCode',
              label: 'Employee Code',
              value: userDetailData?.adminOneDetails?.employeeCode,
            },
            {
              key: 'adminOneAuthorizationLetterDetails',
              label: 'Authorization Letter Details',
              value:
                userDetailData?.adminOneDetails?.authorizationLetterDetails,
            },
            {
              key: 'adminOneDateOfAuthorization',
              label: 'Date of Authorization',
              value: userDetailData?.adminOneDetails?.dateOfAuthorization,
            },

            // documents from array
            {
              key: 'adminOneAuthorizationLetter',
              label: 'Authorization Letter by Competent Authority',
              value: (() => {
                const doc = getAdminOneDoc('IAU_ONE_AUTHORIZATION_LETTER');
                return doc ? (
                  <FilePreview
                    base64String={doc.base64Content}
                    fileName={doc.fileName}
                    mimeType="application/pdf"
                    fileIcon={true}
                  />
                ) : (
                  'Not provided'
                );
              })(),
            },
            {
              key: 'adminOneCertifiedPoi',
              label: 'Certified copy of Proof of Identity',
              value: (() => {
                const doc = getAdminOneDoc('IAU_ONE_CERTIFIED_POI');
                return doc ? (
                  <FilePreview
                    base64String={doc.base64Content}
                    fileName={doc.fileName}
                    mimeType="application/pdf"
                    fileIcon={true}
                  />
                ) : (
                  'Not provided'
                );
              })(),
            },
            {
              key: 'adminOneCertifiedPhotoIdentity',
              label: 'Certified copy of Photo Identity Card',
              value: (() => {
                const doc = getAdminOneDoc('IAU_ONE_CERTIFIED_PHOTO_IDENTITY');
                return doc ? (
                  <FilePreview
                    base64String={doc.base64Content}
                    fileName={doc.fileName}
                    mimeType="application/pdf"
                    fileIcon={true}
                  />
                ) : (
                  'Not provided'
                );
              })(),
            },
          ],

          fieldsTwo: [
            {
              key: 'adminTwoFirstName',
              label: 'First Name',
              value: userDetailData?.adminTwoDetails?.firstName,
            },
            {
              key: 'adminTwoMiddleName',
              label: 'Middle Name',
              value: userDetailData?.adminTwoDetails?.middleName,
            },
            {
              key: 'adminTwoLastName',
              label: 'Last Name',
              value: userDetailData?.adminTwoDetails?.lastName,
            },
            {
              key: 'adminTwoDesignation',
              label: 'Designation',
              value: userDetailData?.adminTwoDetails?.designation,
            },
            {
              key: 'adminTwoEmailId',
              label: 'Email',
              value: userDetailData?.adminTwoDetails?.emailId,
            },
            {
              key: 'adminTwoGender',
              label: 'Gender',
              value: userDetailData?.adminTwoDetails?.gender,
            },
            {
              key: 'adminTwoCkycNumber',
              label: 'CKYC Number',
              value: userDetailData?.adminTwoDetails?.ckycNumber,
            },
            {
              key: 'adminTwoCitizenship',
              label: 'Citizenship',
              value: userDetailData?.adminTwoDetails?.citizenship,
            },
            {
              key: 'adminTwoCountryCode',
              label: 'Country Code',
              value: userDetailData?.adminTwoDetails?.countryCode,
            },
            {
              key: 'adminTwoMobileNo',
              label: 'Mobile No',
              value: userDetailData?.adminTwoDetails?.mobileNo,
            },
            {
              key: 'adminTwoLandline',
              label: 'Landline',
              value: userDetailData?.adminTwoDetails?.landline,
            },
            {
              key: 'adminTwoProofOfIdentity',
              label: 'Proof of Identity',
              value: userDetailData?.adminTwoDetails?.proofOfIdentity,
            },
            {
              key: 'adminTwoIdentityNumber',
              label: 'Identity Number',
              value: userDetailData?.adminTwoDetails?.identityNumber,
            },
            {
              key: 'adminTwoEmployeeCode',
              label: 'Employee Code',
              value: userDetailData?.adminTwoDetails?.employeeCode,
            },
            {
              key: 'adminTwoAuthorizationLetterDetails',
              label: 'Authorization Letter Details',
              value:
                userDetailData?.adminTwoDetails?.authorizationLetterDetails,
            },
            {
              key: 'adminTwoDateOfAuthorization',
              label: 'Date of Authorization',
              value: userDetailData?.adminTwoDetails?.dateOfAuthorization,
            },

            // documents from array
            {
              key: 'adminTwoAuthorizationLetter',
              label: 'Authorization Letter by Competent Authority',
              value: (() => {
                const doc = getAdminTwoDoc('IAU_TWO_AUTHORIZATION_LETTER');
                return doc ? (
                  <FilePreview
                    base64String={doc.base64Content}
                    fileName={doc.fileName}
                    mimeType="application/pdf"
                    fileIcon={true}
                  />
                ) : (
                  'Not provided'
                );
              })(),
            },
            {
              key: 'adminTwoCertifiedPoi',
              label: 'Certified copy of Proof of Identity',
              value: (() => {
                const doc = getAdminTwoDoc('IAU_TWO_CERTIFIED_POI');
                return doc ? (
                  <FilePreview
                    base64String={doc.base64Content}
                    fileName={doc.fileName}
                    mimeType="application/pdf"
                    fileIcon={true}
                  />
                ) : (
                  'Not provided'
                );
              })(),
            },
            {
              key: 'adminTwoCertifiedPhotoIdentity',
              label: 'Certified copy of Photo Identity Card',
              value: (() => {
                const doc = getAdminTwoDoc('IAU_TWO_CERTIFIED_PHOTO_IDENTITY');
                return doc ? (
                  <FilePreview
                    base64String={doc.base64Content}
                    fileName={doc.fileName}
                    mimeType="application/pdf"
                    fileIcon={true}
                  />
                ) : (
                  'Not provided'
                );
              })(),
            },
          ],
        })}
      </Box>

      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        {actionType === 'deactivate' && (
          <Button
            variant="contained"
            onClick={handleDeactivate}
            sx={{
              backgroundColor: '#002CBA',
              '&:hover': { backgroundColor: '#001a8b' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 44, 186, 0.5)',
              },
              px: 4,
              py: 1,
              textTransform: 'none',
            }}
          >
            De-activate
          </Button>
        )}

        {actionType === 'suspend' && (
          <Button
            variant="contained"
            onClick={handleSuspend}
            sx={{
              backgroundColor: '#002CBA',
              '&:hover': { backgroundColor: '#001a8b' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 44, 186, 0.5)',
              },
              px: 4,
              py: 1,
              textTransform: 'none',
            }}
          >
            Suspend
          </Button>
        )}
        {actionType === 'revoke' && (
          <Button
            variant="contained"
            onClick={handleRevoke}
            sx={{
              backgroundColor: '#002CBA',
              '&:hover': { backgroundColor: '#001a8b' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 44, 186, 0.5)',
              },
              px: 4,
              py: 1,
              textTransform: 'none',
            }}
          >
            Revoke
          </Button>
        )}
      </Box> */}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        {(() => {
          const actions: Record<
            string,
            { label: string; onClick: () => void }
          > = {
            deactivate: { label: 'De-activate', onClick: handleDeactivate },
            suspend: { label: 'Suspend', onClick: handleSuspend },
            revoke: { label: 'Revoke', onClick: handleRevoke },
          };

          const action = actions[actionType ?? ''];
          return action ? (
            <Button
              variant="contained"
              onClick={action.onClick}
              sx={{
                backgroundColor: '#002CBA',
                '&:hover': { backgroundColor: '#001a8b' },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 44, 186, 0.5)',
                },
                px: 4,
                py: 1,
                textTransform: 'none',
              }}
            >
              {action.label}
            </Button>
          ) : null;
        })()}
      </Box>

      <DeactivateUserModal
        open={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        userId={reId || ''}
      />

      <SuspendUserModal
        open={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
        }}
        userId={reId || ''}
      />

      <RevokeUserModal
        open={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
        }}
        userId={reId || ''}
      />

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
              placeholder="Enter reason for rejection"
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

      {/* <RejectRequestSucessModal
        isOpen={isRejectSuccessModal}
        onClose={() => {
          setRejectSuccessModal(false);
          navigate(-1);
        }}
      /> */}

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

const requiredFields = [
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
  'regulatorLicense',
  'registrationCertificate',
  'addressProof',
  // 'reOther',
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
  'hoiCkycNumber',
  'hoiTitle',
  'hoiFirstName',
  // 'hoiLastName',
  'hoiDesignation',
  'hoiEmailId',
  'hoiCountryCode',
  'hoiMobileNo',
  'hoiGender',
  'noCitizenship',
  'noCkycNumber',
  'noTitle',
  'noFirstName',
  // 'noLastName',
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
  'adminOneCkycNumber',
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
  'adminTwoCkycNumber',
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

export default ApplicationDetailsView;
