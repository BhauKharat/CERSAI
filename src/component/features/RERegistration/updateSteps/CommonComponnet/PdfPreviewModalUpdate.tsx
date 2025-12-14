/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import ReusableButton from '../../CommonComponent/ReusableButton';

interface PdfPreviewModalUpdateProps {
  open: boolean;
  onClose: () => void;
  pdfDocument?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  } | null;
  loading?: boolean;
  error?: string | null;
  onESign: (place: string, date: string) => void;
  onBackToHome?: () => void;
  isSignedDocument?: boolean;
  submissionLoading?: boolean;
}

const PdfPreviewModalUpdate: React.FC<PdfPreviewModalUpdateProps> = ({
  open,
  onClose,
  pdfDocument,
  loading = false,
  error = null,
  onESign,
  onBackToHome,
  isSignedDocument = false,
  submissionLoading = false,
}) => {
  const [place, setPlace] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [declarationChecked, setDeclarationChecked] = useState(false);
  console.log(pdfDocument?.dataUrl, 'pdfDocument?.dataUrl');
  const handleESign = () => {
    if (onESign && place && date && declarationChecked) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onESign(place, formattedDate);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setPlace('');
    setDate(new Date());
    setDeclarationChecked(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          width: '90vw',
          height: '90vh',
          maxWidth: '1100px',
          maxHeight: '1000px',
          // Mobile responsive adjustments
          '@media (max-width: 768px)': {
            width: '95vw',
            height: '95vh',
            margin: '8px',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          fontFamily: 'Gilroy',
          fontWeight: 600,
          fontSize: '18px',
          py: 2,
          // Mobile responsive title
          '@media (max-width: 768px)': {
            fontSize: '16px',
            py: 1.5,
            px: 2,
          },
          '@media (max-width: 480px)': {
            fontSize: '14px',
            py: 1,
            px: 1,
          },
        }}
      >
        {!isSignedDocument
          ? 'Declaration and Digital Signature'
          : 'Reporting Entity Digitally Signed Update Form'}
        <IconButton
          onClick={handleClose}
          sx={{
            color: '#666',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* PDF Viewer Area */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: '#2c2c2c',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            minHeight: '500px',
            mx: 2,
            my: 2,
            borderRadius: '8px',
          }}
        >
          {loading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'white',
              }}
            >
              <CircularProgress sx={{ color: 'white', mb: 2 }} />
              <Typography sx={{ fontFamily: 'Gilroy' }}>
                Loading update PDF document...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 2, fontFamily: 'Gilroy' }}>
              {error}
            </Alert>
          )}

          {pdfDocument && !loading && !error && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
              }}
            >
              <iframe
                src={pdfDocument.dataUrl}
                width="95%"
                height="95%"
                style={{
                  border: 'none',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
                title="Update Form PDF"
                // Disable context menu, printing, and downloading
                onContextMenu={(e) => e.preventDefault()}
                onLoad={(e) => {
                  // Additional security measures
                  const iframe = e.target as HTMLIFrameElement;
                  try {
                    // Disable right-click and keyboard shortcuts in iframe
                    const iframeDoc =
                      iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                      iframeDoc.addEventListener('contextmenu', (e) =>
                        e.preventDefault()
                      );
                      iframeDoc.addEventListener('keydown', (e) => {
                        // Disable Ctrl+S, Ctrl+P, F12, etc.
                        if (
                          (e.ctrlKey && (e.key === 's' || e.key === 'p')) ||
                          e.key === 'F12' ||
                          (e.ctrlKey && e.shiftKey && e.key === 'I')
                        ) {
                          e.preventDefault();
                        }
                      });
                    }
                  } catch {
                    // Cross-origin restrictions may prevent access
                    console.log('Cross-origin iframe access restricted');
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: '#f9f9f9',
          borderTop: '1px solid #e0e0e0',
          flexDirection: 'column',
          alignItems: 'stretch',
          margin: '10px',
        }}
      >
        {!isSignedDocument ? (
          <>
            {/* Declaration Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                  sx={{
                    color: '#1976d2',
                    '&.Mui-checked': {
                      color: '#52AE32',
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontFamily: 'Gilroy',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333',
                  }}
                >
                  I declare that the information provided is true and correct to
                  the best of my knowledge.
                </Typography>
              }
            />

            {/* Place and Date Fields */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'flex-end',
                maxWidth: '600px',
                mt: 2,
                // Mobile responsive layout
                '@media (max-width: 768px)': {
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 2,
                  maxWidth: '100%',
                },
              }}
            >
              {/* Place Field */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Gilroy',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333',
                    mb: 1,
                  }}
                >
                  Place <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Enter place"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Gilroy',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      fontSize: '14px',
                      height: '48px',
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '8px 12px',
                    },
                  }}
                />
              </Box>

              {/* Date Field */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Gilroy',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333',
                    mb: 1,
                  }}
                >
                  Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={date}
                    onChange={(newValue) => {
                      // Date is read-only, no changes allowed
                    }}
                    format="dd-MM-yyyy"
                    disabled={true}
                    readOnly={true}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Gilroy',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            fontSize: '14px',
                            height: '48px',
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '8px 12px',
                            cursor: 'not-allowed',
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            {/* eSign Button */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 3,
                // Mobile responsive button container
                '@media (max-width: 768px)': {
                  justifyContent: 'center',
                },
              }}
            >
              <ReusableButton
                label="Apply Digital Signature"
                onClick={handleESign}
                disabled={!declarationChecked || !place || !date || loading}
                textColor="white"
                isLoading={loading}
                loadingText="Processing..."
                sx={{
                  fontWeight: 600,
                  width: '280px',
                  px: 4,
                  py: 2,
                  // Mobile responsive button
                  '@media (max-width: 768px)': {
                    width: '100%',
                    maxWidth: '300px',
                  },
                }}
              />
            </Box>
          </>
        ) : (
          /* Signed Document State - Submit Button */
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'right',
              p: 2,
              // Mobile responsive padding
              '@media (max-width: 768px)': {
                px: 1,
              },
            }}
          >
            <ReusableButton
              label="Submit"
              onClick={onBackToHome || onClose}
              textColor="white"
              isLoading={submissionLoading}
              loadingText="Submitting..."
              disabled={submissionLoading}
              sx={{
                fontWeight: 600,
                width: '200px',
                px: 4,
                py: 1.5,
                // Mobile responsive button
                '@media (max-width: 768px)': {
                  width: '100%',
                  maxWidth: '300px',
                },
              }}
            />
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PdfPreviewModalUpdate;
