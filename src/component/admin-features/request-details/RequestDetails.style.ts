import { SxProps, Theme } from '@mui/material';

export const requestDetailsStyles = {
  container: {
    p: 3,
    bgcolor: '#fff',
  } as SxProps<Theme>,

  backButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    mb: 2,
  } as SxProps<Theme>,

  backButton: {
    color: 'black',
    textTransform: 'none',
  } as SxProps<Theme>,

  pageTitle: {
    color: 'text.primary',
    fontWeight: '600',
    fontFamily: 'Gilroy, sans-serif',
  } as SxProps<Theme>,

  signedDocContainer: {
    padding: 2,
    width: '100%',
    backgroundColor: '#F8F9FD',
    borderRadius: 2,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E6EBFF',
    marginY: 2,
  } as SxProps<Theme>,

  signedDocLink: {
    textDecorationLine: 'underline',
    color: '#002CBA',
    fontWeight: '600',
    cursor: 'pointer',
  } as SxProps<Theme>,

  instructionsContainer: {
    padding: 2,
    width: '100%',
    backgroundColor: '#FFF3C7',
    borderRadius: 2,
    marginY: 2,
  } as SxProps<Theme>,

  instructionsList: {
    listStyleType: 'disc',
    paddingLeft: '20px',
  },

  actionButtonsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    mt: 3,
  } as SxProps<Theme>,

  rejectButton: {
    borderColor: '#003CFF',
    color: '#003CFF',
  } as SxProps<Theme>,

  modifyButton: {
    borderColor: '#003CFF',
    color: '#003CFF',
    '&.Mui-disabled': {
      borderColor: 'rgba(0, 0, 0, 0.12)',
      color: 'rgba(0, 0, 0, 0.26)',
    },
  } as SxProps<Theme>,

  approveButton: {
    backgroundColor: '#002CBA',
    '&:hover': { backgroundColor: '#001a8b' },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(0, 44, 186, 0.5)',
    },
    px: 4,
    py: 1,
    textTransform: 'none',
  } as SxProps<Theme>,

  modalContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as SxProps<Theme>,

  modalBox: {
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
    borderRadius: '8px',
  } as SxProps<Theme>,

  modalBoxLarge: {
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
    borderRadius: '8px',
  } as SxProps<Theme>,

  successIcon: {
    color: '#52C41A',
    fontSize: 60,
  } as SxProps<Theme>,

  cancelIcon: {
    fontSize: 80,
    color: 'red',
  } as SxProps<Theme>,

  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as SxProps<Theme>,

  modalTitle: {
    mt: 2,
  } as SxProps<Theme>,

  modalDescription: {
    mt: 2,
  } as SxProps<Theme>,

  modalContent: {
    textAlign: 'left',
    mb: 2,
  } as SxProps<Theme>,

  okButton: {
    mt: 3,
    backgroundColor: '#002CBA',
    '&:hover': { backgroundColor: '#001a8b' },
  } as SxProps<Theme>,

  submitButton: {
    backgroundColor: '#002CBA',
    '&:hover': { backgroundColor: '#001a8b' },
  } as SxProps<Theme>,

  sectionHeader: {
    position: 'relative',
    width: '100%',
  } as SxProps<Theme>,

  sectionHeaderContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  } as SxProps<Theme>,

  sectionStatusIcon: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as SxProps<Theme>,

  sectionCheckbox: {
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'gray',
    width: 20,
    height: 20,
    borderRadius: 1,
  } as SxProps<Theme>,

  sectionCloseIcon: {
    display: 'flex',
    borderRadius: 1,
    backgroundColor: '#003CFF',
  } as SxProps<Theme>,

  sectionTitle: {
    color: 'text.primary',
    fontWeight: 600,
    fontFamily: 'Gilroy, sans-serif',
  } as SxProps<Theme>,

  accordionDetails: {
    p: 0,
  } as SxProps<Theme>,

  fieldContainer: {
    px: 2,
    py: 1.5,
    backgroundColor: '#fff',
  } as SxProps<Theme>,

  checkboxFieldContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  } as SxProps<Theme>,

  checkboxLabel: {
    color: 'black',
    fontWeight: '400',
    fontSize: '14px',
  } as SxProps<Theme>,

  checkboxBox: {
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#000000',
    width: 20,
    height: 20,
    borderRadius: '4px',
    backgroundColor: '#000000',
    cursor: 'not-allowed',
  } as SxProps<Theme>,

  fieldMainContainer: {
    p: 2,
    backgroundColor: '#fff',
  } as SxProps<Theme>,

  fieldWrapper: {
    display: 'flex',
    position: 'relative',
    alignItems: 'flex-start',
    gap: 1,
  } as SxProps<Theme>,

  fieldCheckboxContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  } as SxProps<Theme>,

  fieldCheckbox: {
    padding: 0.5,
  } as SxProps<Theme>,

  fieldContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    pr: 1,
    gap: 1,
  } as SxProps<Theme>,

  fieldLabel: {
    marginTop: '5px',
    fontFamily: 'Gilroy, sans-serif',
    color: 'black',
    fontWeight: '600',
  } as SxProps<Theme>,

  fieldValueRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  } as SxProps<Theme>,

  fieldValueBox: {
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
  } as SxProps<Theme>,

  fieldValueText: {
    color: 'black',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    flex: 1,
  } as SxProps<Theme>,

  dateIcon: {
    color: '#666',
    fontSize: '20px',
    ml: 1,
  } as SxProps<Theme>,

  dropdownIcon: {
    color: '#666',
    fontSize: '20px',
    ml: 1,
  } as SxProps<Theme>,

  documentPreviewButton: {
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },

  documentIconBox: {
    height: 54,
    width: 54,
    border: '1px solid #D1D1D1',
    borderRadius: '4px',
    backgroundColor: '#F5F5F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as SxProps<Theme>,

  pdfIcon: {
    fontSize: 32,
    color: '#d32f2f',
  } as SxProps<Theme>,

  imageIcon: {
    fontSize: 32,
    color: '#1976d2',
  } as SxProps<Theme>,

  documentThumbnail: {
    height: 54,
    width: 54,
    border: '1px solid #D1D1D1',
    borderRadius: '4px',
    objectFit: 'contain' as const,
    display: 'block',
    backgroundColor: '#f9f9f9',
  },

  loadingIconBox: {
    height: 54,
    width: 54,
    border: '1px solid #D1D1D1',
    borderRadius: '4px',
    backgroundColor: '#F5F5F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as SxProps<Theme>,

  placeholderIconBox: {
    height: 54,
    width: 54,
    border: '1px solid #D1D1D1',
    borderRadius: '4px',
    backgroundColor: '#F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as SxProps<Theme>,

  documentViewerModal: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '8px',
    overflow: 'hidden',
  } as SxProps<Theme>,

  documentViewerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 2,
    borderBottom: '1px solid #E0E0E0',
  } as SxProps<Theme>,

  documentViewerContent: {
    p: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 'calc(90vh - 80px)',
    overflow: 'auto',
  } as SxProps<Theme>,

  documentViewerLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: 2,
  } as SxProps<Theme>,

  documentViewerPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  } as SxProps<Theme>,

  documentIframe: {
    width: '100%',
    height: 'calc(90vh - 120px)',
    border: 'none',
  },

  documentImage: {
    maxWidth: '100%',
    maxHeight: 'calc(90vh - 120px)',
    objectFit: 'contain' as const,
  },
};
