import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  fetchApplicationData,
  clearApplicationData,
} from './slice/getApplicationSlice';
import {
  updateEntityAction,
  clearUpdateEntityAction,
} from './slice/updateEntityActionSlice';
import { fetchPreviousVersionData } from './slice/getPreviousVersionSlice';
import {
  GetApplicationData,
  DocumentDetails,
} from './types/getApplicationTypes';
import PreviousVersionDialog from './PreviousVersionDialog';
import DocumentViewer from './DocumentViewer';
import ConfirmationModal from '../../UserManagement/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../UserManagement/ErrorModal/ErrorModal';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ActionButton } from '../../../common/buttons/ActionButtons';
import {
  StyledContainer,
  StyledFormContainer,
  StyledAccordion,
  StyledAccordionSummary,
  StyledAccordionDetails,
  FormRow,
  FormFieldContainer,
  ActionButtonsContainer,
  disabledFieldSx,
  sectionTitleSx,
  subsectionTitleSx,
  pageTitleSx,
} from './UpdateEntityProfile.styles';

interface FormData {
  // Entity Profile
  institutionName: string;
  regulator: string;
  institutionType: string;
  constitution: string;
  proprietorName: string;
  registrationNumber: string;
  pan: string;
  cin: string;
  lipn: string;
  gstn: string;
  website: string;
  regulatorLicense: string;

  // Address Details
  registeredAddress: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    alternatePincode: string;
    countryCode: string;
    country: string;
  };
  correspondenceAddress: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    alternatePincode: string;
    countryCode: string;
    country: string;
  };
  sameAsRegistered: boolean;

  // Head of Institution Details
  headOfInstitution: {
    citizenship: string;
    ckycNumber: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    designation: string;
    email: string;
    gender: string;
    countryCode: string;
    mobileNumber: string;
    landline: string;
  };

  // Nodal Officer Details
  nodalOfficer: {
    citizenship: string;
    ckycNumber: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    designation: string;
    email: string;
    gender: string;
    countryCode: string;
    mobileNumber: string;
    landline: string;
    proofOfIdentity: string;
    proofOfIdentityNumber: string;
    dateOfBirth: string;
    officeAddress: string;
    dateOfBoardResolution: string;
  };

  // Institutional Admin User 1 Details
  admin1: {
    citizenship: string;
    ckycNumber: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    designation: string;
    email: string;
    gender: string;
    countryCode: string;
    mobileNumber: string;
    landline: string;
    proofOfIdentity: string;
    proofOfIdentityNumber: string;
    employeeCode: string;
    officeAddress: string;
    authorizationLetter: string;
    dateOfAuthorization: string;
  };

  // Institutional Admin User 2 Details
  admin2: {
    citizenship: string;
    ckycNumber: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    designation: string;
    email: string;
    gender: string;
    countryCode: string;
    mobileNumber: string;
    landline: string;
    proofOfIdentity: string;
    proofOfIdentityNumber: string;
    employeeCode: string;
    officeAddress: string;
    authorizationLetter: string;
    dateOfAuthorization: string;
  };
}

const UpdateEntityProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: applicationData, error } = useAppSelector(
    (state) => state.getApplication
  );
  const {
    loading: actionLoading,
    success: actionSuccess,
    error: actionError,
  } = useAppSelector((state) => state.updateEntityAction);

  const [openPreviousVersion, setOpenPreviousVersion] = useState(false);
  const [documents, setDocuments] = useState<DocumentDetails[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(
    null
  );

  const handleOpenPreviousVersion = () => {
    if (applicationData?.updationRequestId) {
      dispatch(fetchPreviousVersionData(applicationData.updationRequestId));
    }
    setOpenPreviousVersion(true);
  };

  const handleClosePreviousVersion = () => {
    setOpenPreviousVersion(false);
  };

  // Handle Success Modal Close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setActionType(null);
    dispatch(clearUpdateEntityAction());
    // Reset section views by clearing application data
    dispatch(clearApplicationData());
    setDocuments([]);
    // Reset form data to initial state
    setFormData({
      // Entity Profile
      institutionName: '',
      regulator: '',
      institutionType: '',
      constitution: '',
      proprietorName: '',
      registrationNumber: '',
      pan: '',
      cin: '',
      lipn: '',
      gstn: '',
      website: '',
      regulatorLicense: '',

      // Address Details
      registeredAddress: {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        alternatePincode: '',
        countryCode: '+91',
        country: 'India',
      },
      correspondenceAddress: {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        alternatePincode: '',
        countryCode: '+91',
        country: 'India',
      },
      sameAsRegistered: false,

      // Head of Institution Details
      headOfInstitution: {
        citizenship: 'Indian',
        ckycNumber: '',
        title: 'Mr.',
        firstName: '',
        middleName: '',
        lastName: '',
        designation: '',
        email: '',
        gender: 'Male',
        countryCode: '+91',
        mobileNumber: '',
        landline: '',
      },

      // Nodal Officer Details
      nodalOfficer: {
        citizenship: 'Indian',
        ckycNumber: '',
        title: 'Mr.',
        firstName: '',
        middleName: '',
        lastName: '',
        designation: '',
        email: '',
        gender: 'Male',
        countryCode: '+91',
        mobileNumber: '',
        landline: '',
        proofOfIdentity: 'Pan Card',
        proofOfIdentityNumber: '',
        dateOfBirth: '',
        officeAddress: 'Same as registered address',
        dateOfBoardResolution: '',
      },

      // Institutional Admin User 1 Details
      admin1: {
        citizenship: 'Indian',
        ckycNumber: '',
        title: 'Mr.',
        firstName: '',
        middleName: '',
        lastName: '',
        designation: '',
        email: '',
        gender: 'Male',
        countryCode: '+91',
        mobileNumber: '',
        landline: '',
        proofOfIdentity: 'Pan Card',
        proofOfIdentityNumber: '',
        employeeCode: '',
        officeAddress: 'Same as registered address',
        authorizationLetter: 'Financial Authorization Letter',
        dateOfAuthorization: '',
      },

      // Institutional Admin User 2 Details
      admin2: {
        citizenship: 'Indian',
        ckycNumber: '',
        title: 'Mr.',
        firstName: '',
        middleName: '',
        lastName: '',
        designation: '',
        email: '',
        gender: 'Male',
        countryCode: '+91',
        mobileNumber: '',
        landline: '',
        proofOfIdentity: 'Pan Card',
        proofOfIdentityNumber: '',
        employeeCode: '',
        officeAddress: 'Same as registered address',
        authorizationLetter: 'Financial Authorization Letter',
        dateOfAuthorization: '',
      },
    });
    // Optionally re-fetch to check for new data
    dispatch(fetchApplicationData());
  };

  // Handle Error Modal Close
  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setActionType(null);
    dispatch(clearUpdateEntityAction());
  };

  // Handle Approve action
  const handleApprove = () => {
    if (applicationData?.workflowId) {
      setActionType('APPROVED');
      dispatch(
        updateEntityAction({
          workflowId: applicationData.workflowId,
          action: 'APPROVED',
        })
      );
    } else {
      alert('Workflow ID not found');
    }
  };

  // Handle Reject action
  const handleReject = () => {
    if (applicationData?.workflowId) {
      setActionType('REJECTED');
      dispatch(
        updateEntityAction({
          workflowId: applicationData.workflowId,
          action: 'REJECTED',
        })
      );
    } else {
      alert('Workflow ID not found');
    }
  };

  // Fetch application data on component mount
  useEffect(() => {
    dispatch(fetchApplicationData());
  }, [dispatch]);

  // Update form data when API response is received
  useEffect(() => {
    if (applicationData) {
      const mappedData = mapApiDataToFormData(applicationData);
      setFormData(mappedData);
      setDocuments(applicationData.documents || []);
    }
  }, [applicationData]);

  // Handle action success/error
  useEffect(() => {
    if (actionSuccess) {
      setShowSuccessModal(true);
    }
    if (actionError) {
      setShowErrorModal(true);
    }
  }, [actionSuccess, actionError]);

  // Map API response to form data
  const mapApiDataToFormData = (apiData: GetApplicationData): FormData => {
    return {
      // Entity Profile
      institutionName: apiData?.entityDetails?.nameOfInstitution || '',
      regulator: apiData?.entityDetails?.regulator || '',
      institutionType: apiData?.entityDetails?.institutionType || '',
      constitution: apiData?.entityDetails?.constitution || '',
      proprietorName: apiData?.entityDetails?.proprietorName || '',
      registrationNumber: apiData?.entityDetails?.registrationNo || '',
      pan: apiData?.entityDetails?.panNo || '',
      cin: apiData?.entityDetails?.cinNo || '',
      lipn: apiData?.entityDetails?.llpinNo || '',
      gstn: apiData?.entityDetails?.gstinNo || '',
      website: apiData?.entityDetails?.reWebsite || '',
      regulatorLicense: '',

      // Address Details
      registeredAddress: {
        addressLine1: apiData?.registeredAddress?.line1 || '',
        addressLine2: apiData?.registeredAddress?.line2 || '',
        addressLine3: apiData?.registeredAddress?.line3 || '',
        city: apiData?.registeredAddress?.cityTown || '',
        district: apiData?.registeredAddress?.district || '',
        state: apiData?.registeredAddress?.state || '',
        pincode: apiData?.registeredAddress?.pinCode || '',
        alternatePincode: '',
        countryCode: apiData?.registeredAddress?.countryCode || '+91',
        country: 'India',
      },
      correspondenceAddress: {
        addressLine1: apiData?.correspondanceAddress?.line1 || '',
        addressLine2: apiData?.correspondanceAddress?.line2 || '',
        addressLine3: apiData?.correspondanceAddress?.line3 || '',
        city: apiData?.correspondanceAddress?.cityTown || '',
        district: apiData?.correspondanceAddress?.district || '',
        state: apiData?.correspondanceAddress?.state || '',
        pincode: apiData?.correspondanceAddress?.pinCode || '',
        alternatePincode: '',
        countryCode: apiData?.correspondanceAddress?.countryCode || '+91',
        country: 'India',
      },
      sameAsRegistered:
        apiData?.correspondenceAddressSameAsRegisteredAddress || false,

      // Head of Institution Details
      headOfInstitution: {
        citizenship: apiData?.headOfInstitutionDetails?.citizenship || '',
        ckycNumber: apiData?.headOfInstitutionDetails?.ckycNumber || '',
        title: apiData?.headOfInstitutionDetails?.title || '',
        firstName: apiData?.headOfInstitutionDetails?.firstName || '',
        middleName: apiData?.headOfInstitutionDetails?.middleName || '',
        lastName: apiData?.headOfInstitutionDetails?.lastName || '',
        designation: apiData?.headOfInstitutionDetails?.designation || '',
        email: apiData?.headOfInstitutionDetails?.emailId || '',
        gender: apiData?.headOfInstitutionDetails?.gender || '',
        countryCode: apiData?.headOfInstitutionDetails?.countryCode || '',
        mobileNumber: apiData?.headOfInstitutionDetails?.mobileNo || '',
        landline: apiData?.headOfInstitutionDetails?.landline || '',
      },

      // Nodal Officer Details
      nodalOfficer: {
        citizenship: apiData?.nodalOfficerDetails?.citizenship || '',
        ckycNumber: apiData?.nodalOfficerDetails?.ckycNo || '',
        title: apiData?.nodalOfficerDetails?.title || '',
        firstName: apiData?.nodalOfficerDetails?.firstName || '',
        middleName: apiData?.nodalOfficerDetails?.middleName || '',
        lastName: apiData?.nodalOfficerDetails?.lastName || '',
        designation: apiData?.nodalOfficerDetails?.designation || '',
        email: apiData?.nodalOfficerDetails?.email || '',
        gender: apiData?.nodalOfficerDetails?.gender || '',
        countryCode: apiData?.nodalOfficerDetails?.countryCode || '',
        mobileNumber: apiData?.nodalOfficerDetails?.mobileNumber || '',
        landline: apiData?.nodalOfficerDetails?.landline || '',
        proofOfIdentity: apiData?.nodalOfficerDetails?.proofOfIdentity || '',
        proofOfIdentityNumber:
          apiData?.nodalOfficerDetails?.identityNumber || '',
        dateOfBirth: apiData?.nodalOfficerDetails?.dateOfBirth || '',
        officeAddress: apiData?.nodalOfficerDetails?.sameAsRegisteredAddress
          ? 'Same as registered address'
          : '',
        dateOfBoardResolution:
          apiData?.nodalOfficerDetails?.dateOfBoardResolution || '',
      },

      // Admin User Details 1
      admin1: {
        citizenship: apiData?.adminOneDetails?.citizenship || '',
        ckycNumber: apiData?.adminOneDetails?.ckycNumber || '',
        title: apiData?.adminOneDetails?.title || '',
        firstName: apiData?.adminOneDetails?.firstName || '',
        middleName: apiData?.adminOneDetails?.middleName || '',
        lastName: apiData?.adminOneDetails?.lastName || '',
        designation: apiData?.adminOneDetails?.designation || '',
        email: apiData?.adminOneDetails?.emailId || '',
        gender: apiData?.adminOneDetails?.gender || '',
        countryCode: apiData?.adminOneDetails?.countryCode || '',
        mobileNumber: apiData?.adminOneDetails?.mobileNo || '',
        landline: apiData?.adminOneDetails?.landline || '',
        proofOfIdentity: apiData?.adminOneDetails?.proofOfIdentity || '',
        proofOfIdentityNumber: apiData?.adminOneDetails?.identityNumber || '',
        employeeCode: apiData?.adminOneDetails?.employeeCode || '',
        officeAddress: '',
        authorizationLetter:
          apiData?.adminOneDetails?.authorizationLetterDetails || '',
        dateOfAuthorization:
          apiData?.adminOneDetails?.dateOfAuthorization || '',
      },

      // Admin User Details 2
      admin2: {
        citizenship: apiData?.adminTwoDetails?.citizenship || '',
        ckycNumber: apiData?.adminTwoDetails?.ckycNumber || '',
        title: apiData?.adminTwoDetails?.title || '',
        firstName: apiData?.adminTwoDetails?.firstName || '',
        middleName: apiData?.adminTwoDetails?.middleName || '',
        lastName: apiData?.adminTwoDetails?.lastName || '',
        designation: apiData?.adminTwoDetails?.designation || '',
        email: apiData?.adminTwoDetails?.emailId || '',
        gender: apiData?.adminTwoDetails?.gender || '',
        countryCode: apiData?.adminTwoDetails?.countryCode || '',
        mobileNumber: apiData?.adminTwoDetails?.mobileNo || '',
        landline: apiData?.adminTwoDetails?.landline || '',
        proofOfIdentity: apiData?.adminTwoDetails?.proofOfIdentity || '',
        proofOfIdentityNumber: apiData?.adminTwoDetails?.identityNumber || '',
        employeeCode: apiData?.adminTwoDetails?.employeeCode || '',
        officeAddress: '',
        authorizationLetter:
          apiData?.adminTwoDetails?.authorizationLetterDetails || '',
        dateOfAuthorization:
          apiData?.adminTwoDetails?.dateOfAuthorization || '',
      },
    };
  };

  // Helper function to get document by type
  const getDocumentByType = (documentType: string): DocumentDetails | null => {
    console.log('Looking for document type:', documentType);
    console.log('Available documents:', documents);

    // Try exact match first
    let found = documents.find((doc) => doc.documentType === documentType);

    // If not found, try case-insensitive match
    if (!found) {
      found = documents.find(
        (doc) => doc.documentType?.toLowerCase() === documentType.toLowerCase()
      );
    }

    // If still not found, try partial matches for common variations
    if (!found) {
      const searchTerm = documentType.toLowerCase();
      found = documents.find((doc) => {
        const docType = doc.documentType?.toLowerCase() || '';
        if (searchTerm === 'pan') {
          return (
            docType.includes('pan') ||
            docType.includes('permanent account number')
          );
        }
        if (searchTerm === 'cin') {
          return (
            docType.includes('cin') ||
            docType.includes('corporate identification number')
          );
        }
        if (searchTerm === 'regulator license') {
          return (
            docType.includes('license') ||
            docType.includes('licence') ||
            docType.includes('certificate') ||
            docType.includes('notification') ||
            docType.includes('regulator_licence') ||
            docType.includes('regulator_license')
          );
        }
        if (searchTerm === 'registration certificate') {
          return (
            docType.includes('registration') && docType.includes('certificate')
          );
        }
        if (searchTerm === 'address proof') {
          return docType.includes('address') && docType.includes('proof');
        }
        if (searchTerm === 'other') {
          return docType.includes('other') || docType.includes('supporting');
        }
        return false;
      });
    }

    console.log('Found document:', found);
    return found || null;
  };

  const [formData, setFormData] = useState<FormData>({
    // Entity Profile
    institutionName: '',
    regulator: '',
    institutionType: '',
    constitution: '',
    proprietorName: '',
    registrationNumber: '',
    pan: '',
    cin: '',
    lipn: '',
    gstn: '',
    website: '',
    regulatorLicense: '',

    // Address Details
    registeredAddress: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      alternatePincode: '',
      countryCode: '+91',
      country: 'India',
    },
    correspondenceAddress: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      alternatePincode: '',
      countryCode: '+91',
      country: 'India',
    },
    sameAsRegistered: false,

    // Head of Institution Details
    headOfInstitution: {
      citizenship: 'Indian',
      ckycNumber: '',
      title: 'Mr.',
      firstName: '',
      middleName: '',
      lastName: '',
      designation: '',
      email: '',
      gender: 'Male',
      countryCode: '+91',
      mobileNumber: '',
      landline: '',
    },

    // Nodal Officer Details
    nodalOfficer: {
      citizenship: 'Indian',
      ckycNumber: '',
      title: 'Mr.',
      firstName: '',
      middleName: '',
      lastName: '',
      designation: '',
      email: '',
      gender: 'Male',
      countryCode: '+91',
      mobileNumber: '',
      landline: '',
      proofOfIdentity: 'Pan Card',
      proofOfIdentityNumber: '',
      dateOfBirth: '',
      officeAddress: 'Same as registered address',
      dateOfBoardResolution: '',
    },

    // Institutional Admin User 1 Details
    admin1: {
      citizenship: 'Indian',
      ckycNumber: '',
      title: 'Mr.',
      firstName: '',
      middleName: '',
      lastName: '',
      designation: '',
      email: '',
      gender: 'Male',
      countryCode: '+91',
      mobileNumber: '',
      landline: '',
      proofOfIdentity: 'Pan Card',
      proofOfIdentityNumber: '',
      employeeCode: '',
      officeAddress: 'Same as registered address',
      authorizationLetter: 'Financial Authorization Letter',
      dateOfAuthorization: '',
    },

    // Institutional Admin User 2 Details
    admin2: {
      citizenship: 'Indian',
      ckycNumber: '',
      title: 'Mr.',
      firstName: '',
      middleName: '',
      lastName: '',
      designation: '',
      email: '',
      gender: 'Male',
      countryCode: '+91',
      mobileNumber: '',
      landline: '',
      proofOfIdentity: 'Pan Card',
      proofOfIdentityNumber: '',
      employeeCode: '',
      officeAddress: 'Same as registered address',
      authorizationLetter: 'Financial Authorization Letter',
      dateOfAuthorization: '',
    },
  });

  return (
    <StyledContainer>
      <Typography variant="h4" sx={pageTitleSx}>
        Update Entity Profile
      </Typography>

      {/* Show message when no data is available */}
      {error && !applicationData && (
        <Box sx={{ mt: 3, mb: 3 }}>
          <Alert severity="info" sx={{ fontFamily: 'Gilroy, sans-serif' }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Show form sections only when data is available */}
      {applicationData && (
        <>
          {/* Entity Profile Section */}
          <StyledFormContainer>
            <StyledAccordion>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Entity Profile
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                {/* First Row - 3 columns */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Name of Institution{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="HDFC Bank"
                      value={formData.institutionName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Regulator <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Government Agency"
                      value={formData.regulator}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Institution Type
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Government Agency"
                      value={formData.institutionType}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Second Row - 3 columns */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Constitution <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Government Agency"
                      value={formData.constitution}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Proprietor Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="-"
                      value={formData.proprietorName || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Registration Number{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Government Agency"
                      value={formData.registrationNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Third Row - PAN with thumbnail, CIN, LIPN */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      PAN <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder="AAAAA9999A"
                        value={formData.pan}
                        InputProps={{ readOnly: true }}
                        sx={disabledFieldSx}
                      />
                      <DocumentViewer
                        document={getDocumentByType('PAN')}
                        documentType="PAN"
                      />
                    </Box>
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      CIN
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder="AAAAA9999A"
                        value={formData.cin}
                        InputProps={{ readOnly: true }}
                        sx={disabledFieldSx}
                      />
                      <DocumentViewer
                        document={getDocumentByType('CIN')}
                        documentType="CIN"
                      />
                    </Box>
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      LLPIN (Limited liability Partnership firm)
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="ABC-1234"
                      value={formData.lipn}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Fourth Row - GSTIN, RE Website, Regulator License with thumbnail */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      GSTIN
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="22ABCDE1234F1Z5"
                      value={formData.gstn}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      RE Website
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="reportingentity.com"
                      value={formData.website}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Regulator License/Certificate/Notification
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('Regulator License')}
                      documentType="Regulator License/Certificate/Notification"
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Document Upload Thumbnails Row */}
                <FormRow sx={{ marginTop: 3 }}>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Registration Certificate
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('Registration Certificate')}
                      documentType="Registration Certificate"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Address Proof
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('Address Proof')}
                      documentType="Address Proof"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Other
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('Other')}
                      documentType="Other"
                    />
                  </FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>
          </StyledFormContainer>

          {/* Address Details Section */}
          <StyledFormContainer>
            <StyledAccordion>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Address Details
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <Typography variant="h6" sx={subsectionTitleSx}>
                  Registered Address
                </Typography>

                {/* First Row - Address Lines */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Address Line 1 <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Lorem Ipsum"
                      value={formData.registeredAddress.addressLine1}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Address Line 2
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Lorem Ipsum"
                      value={formData.registeredAddress.addressLine2}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Address Line 3
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Lorem Ipsum"
                      value={formData.registeredAddress.addressLine3 || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Second Row - Country, State, District */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Country Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="+91 | India"
                      value={formData.registeredAddress.countryCode || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      State / UT <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Maharashtra"
                      value={formData.registeredAddress.state || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      District
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Pune"
                      value={formData.registeredAddress.district || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Third Row - City, Pin Code, Pin Code (others) */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      City/Town <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Pune"
                      value={formData.registeredAddress.city}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Pin Code
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="411045"
                      value={formData.registeredAddress.pincode}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Pin Code (in case of others)
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Pin Code"
                      value={formData.registeredAddress.alternatePincode || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.sameAsRegistered}
                        sx={{
                          color: '#4CAF50',
                          '&.Mui-checked': { color: '#4CAF50' },
                        }}
                      />
                    }
                    label="Use same address details"
                    sx={{ fontFamily: 'Gilroy, sans-serif', fontWeight: 500 }}
                  />
                </Box>

                <Typography variant="h6" sx={subsectionTitleSx}>
                  Correspondence Address
                </Typography>

                {/* First Row - Address Lines */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Address Line 1 <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Lorem Ipsum"
                      value={formData.correspondenceAddress.addressLine1}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Address Line 2
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Lorem Ipsum"
                      value={formData.correspondenceAddress.addressLine2}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Address Line 3
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Lorem Ipsum"
                      value={formData.correspondenceAddress.addressLine3 || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Second Row - Country, State, District */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Country Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="+91 | India"
                      value={formData.correspondenceAddress.countryCode || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      State / UT <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Maharashtra"
                      value={formData.correspondenceAddress.state || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      District
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Pune"
                      value={formData.correspondenceAddress.district || ''}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Third Row - City, Pin Code, Pin Code (others) */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      City/Town <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Pune"
                      value={formData.correspondenceAddress.city}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Pin Code
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="411045"
                      value={formData.correspondenceAddress.pincode}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Pin Code (in case of others)
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Pin Code"
                      value={
                        formData.correspondenceAddress.alternatePincode || ''
                      }
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>
          </StyledFormContainer>

          {/* Head of Institution Details Section */}
          <StyledFormContainer>
            <StyledAccordion>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Head of Institution Details
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                {/* First Row: Citizenship, CKYC Number, Title */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Citizenship <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Indian"
                      value={formData.headOfInstitution.citizenship}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      CKYC Number
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter CKYC Number"
                      value={formData.headOfInstitution.ckycNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Title <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Mr."
                      value={formData.headOfInstitution.title}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Second Row: First Name, Middle Name, Last Name */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      First Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter First Name"
                      value={formData.headOfInstitution.firstName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Middle Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Middle Name"
                      value={formData.headOfInstitution.middleName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Last Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Last Name"
                      value={formData.headOfInstitution.lastName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Third Row: Designation, Email, Gender */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Designation <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Designation"
                      value={formData.headOfInstitution.designation}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Email <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Email"
                      type="email"
                      value={formData.headOfInstitution.email}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Gender <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Male"
                      value={formData.headOfInstitution.gender}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Fourth Row: Country Code, Mobile Number, Landline Number */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Country Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="+91 | India"
                      value={formData.headOfInstitution.countryCode}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Mobile Number <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Mobile Number"
                      value={formData.headOfInstitution.mobileNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Landline Number
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Landline Number"
                      value={formData.headOfInstitution.landline}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>
          </StyledFormContainer>

          {/* Nodal Officer Details Section */}
          <StyledFormContainer>
            <StyledAccordion>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Nodal Officer Details
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                {/* First Row: Citizenship, CKYC Number, Title */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Citizenship <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Indian"
                      value={formData.nodalOfficer.citizenship}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      CKYC Number
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter CKYC Number"
                      value={formData.nodalOfficer.ckycNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Title <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Mr."
                      value={formData.nodalOfficer.title}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Second Row: First Name, Middle Name, Last Name */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      First Name <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter First Name"
                      value={formData.nodalOfficer.firstName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Middle Name <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Middle Name"
                      value={formData.nodalOfficer.middleName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Last Name <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Last Name"
                      value={formData.nodalOfficer.lastName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Third Row: Designation, Email, Gender */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Designation <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Designation"
                      value={formData.nodalOfficer.designation}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Email <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Email"
                      type="email"
                      value={formData.nodalOfficer.email}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Gender <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Male"
                      value={formData.nodalOfficer.gender}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Fourth Row: Country Code, Mobile Number, Landline Number */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Country Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="+91 | India"
                      value={formData.nodalOfficer.countryCode}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Mobile Number <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Mobile Number"
                      value={formData.nodalOfficer.mobileNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Landline Number
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Landline Number"
                      value={formData.nodalOfficer.landline}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Fifth Row: Proof of Identity, Proof of Identity Number, Date of Birth */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Proof of Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Pan Card"
                      value={formData.nodalOfficer.proofOfIdentity}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Proof of Identity Number{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Proof of Identity Number"
                      value={formData.nodalOfficer.proofOfIdentityNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Date of Birth <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="DD-MM-YYYY"
                      type="date"
                      value={formData.nodalOfficer.dateOfBirth}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Sixth Row: Office Address, Date of Board Resolution, Board Resolution Upload */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Office Address
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Same as registered address"
                      value={formData.nodalOfficer.officeAddress}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Date of Board Resolution for Appointment{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="DD-MM-YYYY"
                      type="date"
                      value={formData.nodalOfficer.dateOfBoardResolution}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Board Resolution{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('NO_BOARD_RESOLUTION')}
                      documentType="Board Resolution"
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Seventh Row: Document Uploads */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Certified copy of the Proof of the Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('NO_CERTIFIED_POI')}
                      documentType="Certified copy of the Proof of the Identity"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Certified copy of Photo Identity Card{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType(
                        'NO_CERTIFIED_PHOTO_IDENTITY'
                      )}
                      documentType="Certified copy of Photo Identity Card"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third"></FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>
          </StyledFormContainer>

          {/* Institutional Admin User 1 Details Section */}
          <StyledFormContainer>
            <StyledAccordion>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Institutional Admin User Details 01
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Admin 1
                </Typography>

                {/* First Row: Citizenship, CKYC Number, Title */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Citizenship <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Indian"
                      value={formData.admin1.citizenship}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      CKYC Number
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter CKYC Number"
                      value={formData.admin1.ckycNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Title <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Mr."
                      value={formData.admin1.title}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Second Row: First Name, Middle Name, Last Name */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      First Name <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter First Name"
                      value={formData.admin1.firstName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Middle Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Middle Name"
                      value={formData.admin1.middleName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Last Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Last Name"
                      value={formData.admin1.lastName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Third Row: Designation, Email, Gender */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Designation <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Designation"
                      value={formData.admin1.designation}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Email <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Email"
                      type="email"
                      value={formData.admin1.email}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Gender <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Male"
                      value={formData.admin1.gender}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Fourth Row: Country Code, Mobile Number, Landline Number */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Country Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="+91 | India"
                      value={formData.admin1.countryCode}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Mobile Number <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Mobile Number"
                      value={formData.admin1.mobileNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Landline Number{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Landline Number"
                      value={formData.admin1.landline}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Fifth Row: Proof of Identity, Proof of Identity Number, Employee Code */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Proof of Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Pan Card"
                      value={formData.admin1.proofOfIdentity}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Proof of Identity Number{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Proof of Identity Number"
                      value={formData.admin1.proofOfIdentityNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Employee Code
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter Employee Code"
                      value={formData.admin1.employeeCode}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Sixth Row: Office Address, Authorization Letter, Date of Authorization */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Office Address
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Same as registered address"
                      value={formData.admin1.officeAddress}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Authorization letter by Competent Authority{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder="Financial Authorization Letter"
                        value={formData.admin1.authorizationLetter}
                        sx={disabledFieldSx}
                      />
                      <DocumentViewer
                        document={getDocumentByType(
                          'IAU_ONE_AUTHORIZATION_LETTER'
                        )}
                        documentType="Authorization letter by Competent Authority"
                      />
                    </Box>
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Date of Authorization{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="DD-MM-YYYY"
                      type="date"
                      value={formData.admin1.dateOfAuthorization}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Seventh Row: Document Uploads */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Certified copy of the Proof of the Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('IAU_ONE_CERTIFIED_POI')}
                      documentType="Certified copy of the Proof of the Identity"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Certified copy of Photo Identity Card{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType(
                        'IAU_ONE_CERTIFIED_PHOTO_IDENTITY'
                      )}
                      documentType="Certified copy of Photo Identity Card"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third"></FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>
          </StyledFormContainer>

          {/* Institutional Admin User Details 02 Section */}
          <StyledFormContainer>
            <StyledAccordion>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Institutional Admin User Details 02
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <Typography variant="h6" sx={subsectionTitleSx}>
                  Admin 2
                </Typography>

                {/* Row 1: Citizenship, CKYC Number, Title */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Citizenship <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Indian"
                      value={formData.admin2.citizenship}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      CKYC Number
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.ckycNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Title <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Mr."
                      value={formData.admin2.title}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Row 2: First Name, Middle Name, Last Name */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      First Name <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.firstName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Middle Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.middleName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Last Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.lastName}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Row 3: Designation, Email, Gender */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Designation <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.designation}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Email <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="email"
                      value={formData.admin2.email}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Gender <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Male"
                      value={formData.admin2.gender}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Row 4: Country Code, Mobile Number, Landline Number */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Country Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="+91 | India"
                      value={formData.admin2.countryCode}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Mobile Number <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.mobileNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Landline Number
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.landline}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Row 5: Proof of Identity, Proof of Identity Number, Employee Code */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Proof of Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Pan Card"
                      value={formData.admin2.proofOfIdentity}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Proof of Identity Number{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.proofOfIdentityNumber}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Employee Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.admin2.employeeCode}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Row 6: Office Address, Authorization letter by Competent Authority, Date of Authorization */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Office Address
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Same as registered address"
                      value={formData.admin2.officeAddress}
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Authorization letter by Competent Authority{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder="Financial Authorization Letter"
                        value={formData.admin2.authorizationLetter}
                        sx={disabledFieldSx}
                      />
                      <DocumentViewer
                        document={getDocumentByType(
                          'IAU_TWO_AUTHORIZATION_LETTER'
                        )}
                        documentType="Authorization letter by Competent Authority"
                      />
                    </Box>
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Date of Authorization{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={formData.admin2.dateOfAuthorization}
                      InputProps={{ readOnly: true }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Seventh Row: Document Uploads */}
                <FormRow>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Certified copy of the Proof of the Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('IAU_TWO_CERTIFIED_POI')}
                      documentType="Certified copy of the Proof of the Identity"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Certified copy of Photo Identity Card{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType(
                        'IAU_TWO_CERTIFIED_PHOTO_IDENTITY'
                      )}
                      documentType="Certified copy of Photo Identity Card"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third"></FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>
          </StyledFormContainer>

          {/* View Previous Version Link */}
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, ml: 2 }}
          >
            <Typography
              component="span"
              onClick={handleOpenPreviousVersion}
              sx={{
                color: '#002CBA',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '16px',
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 500,
                '&:hover': {
                  color: '#1565c0',
                },
              }}
            >
              View Previous Version
            </Typography>
          </Box>

          {/* Action Buttons */}
          <ActionButtonsContainer>
            <ActionButton
              buttonType="reject"
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Reject'}
            </ActionButton>
            <ActionButton
              buttonType="approve"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Approve'}
            </ActionButton>
          </ActionButtonsContainer>
        </>
      )}

      {/* Previous Version Dialog - Always available */}
      <PreviousVersionDialog
        open={openPreviousVersion}
        onClose={handleClosePreviousVersion}
      />

      {/* Success Modal */}
      <ConfirmationModal
        open={showSuccessModal}
        onClose={handleSuccessModalClose}
        title=""
        message={
          actionType === 'APPROVED'
            ? 'Entity profile update request has been sent to CERSAI for approval!'
            : actionType === 'REJECTED'
              ? 'The request has been successfully rejected and will not proceed further.'
              : ''
        }
        confirmButtonText="Okay"
        showCloseButton={true}
      />

      {/* Error Modal */}
      <ErrorModal
        open={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error"
        primaryMessage={
          actionError ||
          'An error occurred while processing your request. Please try again.'
        }
        buttonText="Okay"
      />
    </StyledContainer>
  );
};

export default UpdateEntityProfile;
