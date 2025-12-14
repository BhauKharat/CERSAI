import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector } from '../../../../redux/store';
import { DocumentDetails } from './types/getApplicationTypes';
import DocumentViewer from './DocumentViewer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  StyledFormContainer,
  StyledAccordion,
  StyledAccordionSummary,
  StyledAccordionDetails,
  FormRow,
  FormFieldContainer,
  disabledFieldSx,
  sectionTitleSx,
  subsectionTitleSx,
  pageTitleSx,
} from './UpdateEntityProfile.styles';

interface PreviousVersionDialogProps {
  open: boolean;
  onClose: () => void;
}

const PreviousVersionDialog: React.FC<PreviousVersionDialogProps> = ({
  open,
  onClose,
}) => {
  const {
    data: previousVersionData,
    loading: previousVersionLoading,
    error: previousVersionError,
  } = useAppSelector((state) => state.getPreviousVersion);

  const [documents, setDocuments] = useState<DocumentDetails[]>([]);

  // Update documents when previous version API response is received
  useEffect(() => {
    if (previousVersionData) {
      setDocuments(previousVersionData.documents || []);
    }
  }, [previousVersionData]);

  // Helper function to get document by type
  const getDocumentByType = (documentType: string): DocumentDetails | null => {
    const document = documents.find((doc) => doc.documentType === documentType);
    console.log(`Looking for document type: ${documentType}`, document);
    return document || null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
          height: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={pageTitleSx}>
          Previous Version
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, px: 3, py: 2 }}>
        {/* Loading State */}
        {previousVersionLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ color: '#666' }}>
              Loading previous version data...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {previousVersionError && !previousVersionLoading && (
          <Box sx={{ py: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Failed to load previous version data
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {previousVersionError}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Content - Only show when not loading and no error */}
        {!previousVersionLoading && !previousVersionError && (
          <StyledFormContainer>
            {/* Entity Profile Section */}
            <StyledAccordion defaultExpanded>
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
                      value={
                        previousVersionData?.entityDetails?.nameOfInstitution ||
                        ''
                      }
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
                      value={
                        previousVersionData?.entityDetails?.regulator || ''
                      }
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
                      Institution Type{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={
                        previousVersionData?.entityDetails?.institutionType ||
                        ''
                      }
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
                      value={
                        previousVersionData?.entityDetails?.constitution || ''
                      }
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
                      value={
                        previousVersionData?.entityDetails?.proprietorName || ''
                      }
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
                      value={
                        previousVersionData?.entityDetails?.registrationNo || ''
                      }
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Third Row - PAN with thumbnail, CIN, LLPIN */}
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
                        value={previousVersionData?.entityDetails?.panNo || ''}
                        InputProps={{ readOnly: true }}
                        sx={disabledFieldSx}
                      />
                      <DocumentViewer
                        document={getDocumentByType('RE_PAN')}
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
                        value={previousVersionData?.entityDetails?.cinNo || ''}
                        InputProps={{ readOnly: true }}
                        sx={disabledFieldSx}
                      />
                      <DocumentViewer
                        document={getDocumentByType('RE_CIN')}
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
                      value={previousVersionData?.entityDetails?.llpinNo || ''}
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
                      value={previousVersionData?.entityDetails?.gstinNo || ''}
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
                      value={
                        previousVersionData?.entityDetails?.reWebsite || ''
                      }
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
                      document={getDocumentByType('REGULATOR_LICENCE')}
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
                      document={getDocumentByType('REGISTRATION_CERTIFICATE')}
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
                      document={getDocumentByType('ADDRESS_PROOF')}
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
                      document={getDocumentByType('RE_OTHER_FILE')}
                      documentType="Other"
                    />
                  </FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>

            {/* Address Details Section */}
            <StyledAccordion defaultExpanded>
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
                      value={
                        previousVersionData?.registeredAddress?.line1 || ''
                      }
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
                      value={
                        previousVersionData?.registeredAddress?.line2 || ''
                      }
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
                      value={
                        previousVersionData?.registeredAddress?.line3 || ''
                      }
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
                      value={
                        previousVersionData?.registeredAddress?.countryCode ||
                        ''
                      }
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
                      value={
                        previousVersionData?.registeredAddress?.state || ''
                      }
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
                      value={
                        previousVersionData?.registeredAddress?.district || ''
                      }
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
                      value={
                        previousVersionData?.registeredAddress?.cityTown || ''
                      }
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
                      value={
                        previousVersionData?.registeredAddress?.pinCode || ''
                      }
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
                      value=""
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          previousVersionData?.correspondenceAddressSameAsRegisteredAddress ||
                          false
                        }
                        disabled
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
                      value={
                        previousVersionData?.correspondanceAddress?.line1 || ''
                      }
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
                      value={
                        previousVersionData?.correspondanceAddress?.line2 || ''
                      }
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
                      value={
                        previousVersionData?.correspondanceAddress?.line3 || ''
                      }
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
                      value={
                        previousVersionData?.correspondanceAddress
                          ?.countryCode || ''
                      }
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
                      value={
                        previousVersionData?.correspondanceAddress?.state || ''
                      }
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
                      value={
                        previousVersionData?.correspondanceAddress?.district ||
                        ''
                      }
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
                      value={
                        previousVersionData?.correspondanceAddress?.cityTown ||
                        ''
                      }
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
                      value={
                        previousVersionData?.correspondanceAddress?.pinCode ||
                        ''
                      }
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
                      value=""
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>

            {/* Head of Institution Details Section */}
            <StyledAccordion defaultExpanded>
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.citizenship || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.ckycNumber || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails?.title ||
                        ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.firstName || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.middleName || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.lastName || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.designation || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.emailId || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails?.gender ||
                        ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.countryCode || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.mobileNo || ''
                      }
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
                      value={
                        previousVersionData?.headOfInstitutionDetails
                          ?.landline || ''
                      }
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Document Upload Row */}
                {/* <FormRow sx={{ marginTop: 3 }}>
                  <FormFieldContainer width="half">
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontFamily: 'Gilroy, sans-serif',
                      }}
                    >
                      Certified copy of Proof of Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('Proof of Identity')}
                      documentType="Proof of Identity"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="half">
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
                      document={getDocumentByType('Photo Identity Card')}
                      documentType="Photo Identity Card"
                    />
                  </FormFieldContainer>
                </FormRow> */}
              </StyledAccordionDetails>
            </StyledAccordion>

            {/* Nodal Officer Details Section */}
            <StyledAccordion defaultExpanded>
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.citizenship ||
                        ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.ckycNo || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.title || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.firstName ||
                        ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.middleName ||
                        ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.lastName || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.designation ||
                        ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.email || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.gender || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.countryCode ||
                        ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails
                          ?.mobileNumber || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.landline || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails
                          ?.proofOfIdentity || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails
                          ?.identityNumber || ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails?.dateOfBirth ||
                        ''
                      }
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Sixth Row: Office Address, Date of Board Resolution */}
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
                      value={
                        previousVersionData?.nodalOfficerDetails
                          ?.sameAsRegisteredAddress
                          ? 'Same as registered address'
                          : ''
                      }
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
                      value={
                        previousVersionData?.nodalOfficerDetails
                          ?.dateOfBoardResolution || ''
                      }
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
                      Board Resolution{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('NO_BOARD_RESOLUTION')}
                      documentType="Board Resolution"
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Document Upload Row */}
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
                      Certified copy of Proof of Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('NO_CERTIFIED_POI')}
                      documentType="Nodal Officer Proof of Identity"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third">
                    {/* Board Resolution moved to 6th row */}

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
                      documentType="Nodal Officer Photo Identity Card"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third"></FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>

            {/* Institutional Admin User 1 Details Section */}
            <StyledAccordion defaultExpanded>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Institutional Admin User 1 Details
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <Typography variant="h6" sx={subsectionTitleSx}>
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
                      value={
                        previousVersionData?.adminOneDetails?.citizenship || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.ckycNumber || ''
                      }
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
                      value={previousVersionData?.adminOneDetails?.title || ''}
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
                      value={
                        previousVersionData?.adminOneDetails?.firstName || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.middleName || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.lastName || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.designation || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.emailId || ''
                      }
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
                      value={previousVersionData?.adminOneDetails?.gender || ''}
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
                      value={
                        previousVersionData?.adminOneDetails?.countryCode || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.mobileNo || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.landline || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.proofOfIdentity ||
                        ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails?.identityNumber ||
                        ''
                      }
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
                      Employee Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={
                        previousVersionData?.adminOneDetails?.employeeCode || ''
                      }
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
                      value={
                        previousVersionData?.adminOneDetails
                          ?.sameAsRegisteredAddress
                          ? 'Same as registered address'
                          : ''
                      }
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
                        value={
                          previousVersionData?.adminOneDetails
                            ?.authorizationLetterDetails || ''
                        }
                        InputProps={{ readOnly: true }}
                        sx={disabledFieldSx}
                      />
                      <DocumentViewer
                        document={getDocumentByType(
                          'IAU_ONE_AUTHORIZATION_LETTER'
                        )}
                        documentType="Admin 1 Authorization Letter"
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
                      value={
                        previousVersionData?.adminOneDetails
                          ?.dateOfAuthorization || ''
                      }
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Document Upload Row */}
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
                      Certified copy of Proof of Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('IAU_ONE_CERTIFIED_POI')}
                      documentType="Admin 1 Proof of Identity"
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
                      documentType="Admin 1 Photo Identity Card"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third"></FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>

            {/* Institutional Admin User Details 02 Section */}
            <StyledAccordion defaultExpanded>
              <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={sectionTitleSx}>
                  Institutional Admin User Details 02
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <Typography variant="h6" sx={subsectionTitleSx}>
                  Admin 2
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
                      value={
                        previousVersionData?.adminTwoDetails?.citizenship || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.ckycNumber || ''
                      }
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
                      value={previousVersionData?.adminTwoDetails?.title || ''}
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
                      value={
                        previousVersionData?.adminTwoDetails?.firstName || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.middleName || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.lastName || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.designation || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.emailId || ''
                      }
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
                      value={previousVersionData?.adminTwoDetails?.gender || ''}
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
                      value={
                        previousVersionData?.adminTwoDetails?.countryCode || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.mobileNo || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.landline || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.proofOfIdentity ||
                        ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails?.identityNumber ||
                        ''
                      }
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
                      Employee Code <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={
                        previousVersionData?.adminTwoDetails?.employeeCode || ''
                      }
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
                      value={
                        previousVersionData?.adminTwoDetails
                          ?.sameAsRegisteredAddress
                          ? 'Same as registered address'
                          : ''
                      }
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
                        value={
                          previousVersionData?.adminTwoDetails
                            ?.authorizationLetterDetails || ''
                        }
                        InputProps={{ readOnly: true }}
                        sx={disabledFieldSx}
                      />
                      <DocumentViewer
                        document={getDocumentByType(
                          'IAU_TWO_AUTHORIZATION_LETTER'
                        )}
                        documentType="Admin 2 Authorization Letter"
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
                      value={
                        previousVersionData?.adminTwoDetails
                          ?.dateOfAuthorization || ''
                      }
                      InputProps={{ readOnly: true }}
                      sx={disabledFieldSx}
                    />
                  </FormFieldContainer>
                </FormRow>

                {/* Document Upload Row */}
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
                      Certified copy of Proof of Identity{' '}
                      <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <DocumentViewer
                      document={getDocumentByType('IAU_TWO_CERTIFIED_POI')}
                      documentType="Admin 2 Proof of Identity"
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
                      documentType="Admin 2 Photo Identity Card"
                    />
                  </FormFieldContainer>
                  <FormFieldContainer width="third"></FormFieldContainer>
                </FormRow>
              </StyledAccordionDetails>
            </StyledAccordion>
          </StyledFormContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreviousVersionDialog;
