import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress, // Added for loading state if needed
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { KycDetailsDisplayProps } from '../KYC.types';
import Success from '../../../common/Message/Success';

const KYCDetailsDisplay: React.FC<KycDetailsDisplayProps> = ({ kycData }) => {
  if (!kycData) {
    // You could render a loading spinner or a message here if kycData is null
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading KYC Details...
        </Typography>
      </Box>
    );
  }

  const sections = [
    {
      title: 'Personal Details',
      data: kycData.submittedDocuments.personalDetails,
    },
    {
      title: 'Proof of Identity and Address',
      data: kycData.submittedDocuments.proofOfIdentityAndAddress,
    },
    {
      title: 'Address Details',
      data: kycData.submittedDocuments.addressDetails,
    },
    {
      title: 'Related party details',
      data: kycData.submittedDocuments.relatedPartyDetails,
    },
    {
      title: 'Other Details and Attestation',
      data: kycData.submittedDocuments.otherDetailsAndAttestation,
    },
  ];

  return (
    <Box sx={{ mt: 4, p: 2 }}>
      {/* Success message box */}
      <Success message={'KYC Details Found'} />

      {/* Main KYC Details Summary */}
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: '8px',
          p: { xs: 2, sm: 3 },
          mb: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {kycData.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Mobile Number
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {kycData.mobileNumber}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Last updated on
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {kycData.lastUpdated}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Gender
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {kycData.gender}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Email ID
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {kycData.emailId}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              CKYC Reference Number
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {kycData.ckycReferenceNumber}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
        Submitted Documents
      </Typography>
      {sections.map((section, index) => (
        <Accordion
          key={index}
          sx={{
            mb: 1.5,
            border: '1px solid #E6EBFF',
            borderRadius: '8px',
            '&.Mui-expanded': {
              margin: '8px 0',
              boxShadow: '0 4px 12px #E6EBFF',
            },
            '&:before': { display: 'none' }, // Remove default Accordion border
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            sx={{
              backgroundColor: '#E6EBFF',
              borderRadius: '8px',
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                minHeight: 48, // Ensure consistent height when expanded
              },
              '.MuiAccordionSummary-content': {
                my: 1, // Vertical padding for content
              },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              sx={{ color: '#555' }}
            >
              {section.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {Object.entries(section.data).map(([key, value]) => (
                <Grid size={{ xs: 12, sm: 6 }} key={key}>
                  <Typography variant="body2" color="text.secondary">
                    {key}
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'right', mt: 4 }}>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className="buttonClass"
        >
          Download PDF
        </Button>
      </Box>
    </Box>
  );
};

export default KYCDetailsDisplay;
