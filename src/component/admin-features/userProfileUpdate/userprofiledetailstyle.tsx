import { styled, Accordion, AccordionSummary } from '@mui/material';

// Styled Accordion matching ModifiedRequestDetailsView
export const StyledAccordion = styled(Accordion)(({ theme }) => ({
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

export const StyledAccordionSummary = styled(AccordionSummary)({
  padding: '0 16px',
  minHeight: '48px !important',
  backgroundColor: '#E6EBFF',
  borderRadius: '8px 8px 0 0',
  '& .MuiAccordionSummary-content': {
    margin: '12px 0 !important',
    fontWeight: 600,
  },
});

// Styles
export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 2,
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
  },
  backButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
  },
  backButton: {
    color: 'black',
    textTransform: 'none',
    fontSize: '14px',
    fontFamily: 'Gilroy',
  },
  viewSignedDocLink: {
    color: '#002CBA',
    cursor: 'pointer',
    textDecoration: 'underline', // ← EXACT underline style
    textUnderlineOffset: '3px',
    fontWeight: 600,
    fontSize: '14px',
    fontFamily: 'Gilroy',
  },
  sectionTitle: {
    fontFamily: 'Gilroy',
    fontWeight: 700,
    fontSize: '18px',
    color: '#1A1A1A',
    mb: 0,
    mt: -2,
  },
  fieldLabel: {
    fontSize: '14px',
    color: '#1A1A1A',
    fontFamily: 'Gilroy',
    fontWeight: 600,
    mb: 0.2,
  },
  fieldInput: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#F8F9FA',
      borderRadius: '4px',
      height: '40px',
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '14px',
      fontFamily: 'Gilroy',
      color: '#1A1A1A',
      padding: '8px 12px',
    },
    '& .MuiOutlinedInput-input.Mui-disabled': {
      WebkitTextFillColor: '#1A1A1A',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E0E0E0',
    },
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    mt: 0,
    pt: 0,
  },
  rejectButton: {
    backgroundColor: '#fff',
    border: '1px solid #002CBA',
    color: '#002CBA',
    textTransform: 'none',
    px: 4,
    py: 1,
    borderRadius: '4px',
    fontFamily: 'Gilroy',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      border: '1px solid #002CBA',
    },
  },
  approveButton: {
    backgroundColor: '#002CBA',
    color: '#fff',
    textTransform: 'none',
    px: 4,
    py: 1,
    borderRadius: '4px',
    fontFamily: 'Gilroy',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: 'rgba(0, 44, 186, 0.9)',
    },
  },
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    textAlign: 'center',
  },
  // === Document Field Styles ===
  docFieldLabel: {
    fontSize: '12px',
    color: '#5D6272',
    fontWeight: 400,
    marginBottom: '4px',
    fontFamily: 'Gilroy',
  },

  docPreviewBox: {
    width: '52px',
    height: '52px',
    borderRadius: '6px',
    backgroundColor: '#F8F9FD',
    border: '1px solid #DCE3FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: '0.2s ease',
    '&:hover': {
      borderColor: '#002CBA',
      backgroundColor: '#F2F5FF',
    },
  },

  docPreviewBoxDisabled: {
    width: '52px',
    height: '52px',
    borderRadius: '6px',
    backgroundColor: '#F0F0F0',
    border: '1px solid #D1D1D1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  docPreviewNA: {
    fontSize: '10px',
    color: '#9A9A9A',
    fontFamily: 'Gilroy',
  },

  docImageIcon: {
    fontSize: '26px',
    color: '#002CBA',
  },
  // Document Viewer Overlay Section
  docViewerOverlay: {
    position: 'relative',
    width: '100%',
    background: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E6EBFF',
    padding: '16px',
    marginTop: '22px',
  },
  docViewContainer: {
    marginTop: '24px',
    width: '1079px',
    margin: '0 auto',
    backgroundColor: '#F8F9FD',
    border: '1px solid #E6EBFF',
    borderRadius: '4px',
  },

  // Header bar
  docViewerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '10px',
    borderBottom: '1px solid #ECEFFA',
  },

  // Title
  docViewerTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1A1A1A',
    fontFamily: 'Gilroy',
  },

  // Close Button
  docViewerCloseBtn: {
    textTransform: 'none',
    fontSize: '13px',
    background: '#002CBA',
    color: '#FFF',
    borderRadius: '6px',
    padding: '4px 18px',
    fontFamily: 'Gilroy-Medium',
    '&:hover': {
      background: 'rgba(0, 44, 186, 0.85)',
    },
  },

  // Viewer Body
  docViewerBody: {
    width: '100%',
    height: '70vh',
    marginTop: '12px',
    overflow: 'hidden',
  },

  // For loader centering
  docViewerCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  // ==== Document Viewer Box ====

  docViewHeader: {
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E6EBFF',
    padding: '0 14px',
  },

  docViewTitle: {
    fontSize: '14px',
    color: '#1A1A1A',
    fontWeight: 600,
    fontFamily: 'Gilroy',
  },

  docViewCloseBtn: {
    textTransform: 'none',
    backgroundColor: '#002CBA',
    color: '#FFFFFF',
    borderRadius: '6px',
    padding: '3px 16px',
    fontSize: '13px',
    fontFamily: 'Gilroy',
    '&:hover': {
      backgroundColor: 'rgba(0, 44, 186, 0.9)',
    },
  },

  docViewBody: {
    width: '100%',
    height: '70vh',
    overflow: 'hidden',
    padding: '12px',
  },

  docViewLoader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },

  signedDocBanner: {
    width: '100%',
    height: '50px',
    backgroundColor: '#F8F9FD',
    border: '1px solid #E6EBFF',
    borderRadius: '4px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
  },
};
