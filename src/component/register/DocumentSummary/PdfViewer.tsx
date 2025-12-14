// // PdfViewer.tsx
// import React, { useState } from 'react';
// import { Document, Page } from 'react-pdf';
// import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.min.mjs';

// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import { log } from 'console';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// interface PdfViewerProps {
//   base64: string;
// }

// const PdfViewer: React.FC<PdfViewerProps> = ({ base64 }) => {
//   const [numPages, setNumPages] = useState<number | null>(null);

//   const onDocumentLoadSuccess = (pdf: any) => {
//     setNumPages(pdf.numPages);
//   };

//   console.log(base64,'recieved base64 in pdf viewer');

//   const dataUrl = `data:application/pdf;base64,${base64}`;
//   console.log(dataUrl,'Data url');

//   return (
//     <div>
//       <Document file={dataUrl} onLoadSuccess={onDocumentLoadSuccess}>
//         {Array.from(new Array(numPages || 0), (_, index) => (
//           <Page key={`page_${index + 1}`} pageNumber={index + 1} />
//         ))}
//       </Document>
//     </div>
//   );
// };

// export default PdfViewer;

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  //  TextField,
  Button,
  Box,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import dayjs from 'dayjs';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { FormControl, FormHelperText } from '@mui/material';
import { submitApplication } from '../../../redux/slices/registerSlice/applicationPreviewSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import {
  hideLoader,
  showLoader,
} from '../../../redux/slices/loader/loaderSlice';
import { resetAuth } from '../../../redux/slices/registerSlice/authSlice';
import { resetAdminOfficerState } from '../../../redux/slices/registerSlice/institutionadminSlice';
import { resetHeadInstitutionState } from '../../../redux/slices/registerSlice/institutiondetailSlice';
import { resetNodal } from '../../../redux/slices/registerSlice/nodalOfficerSlice';
import { resetRegitsration } from '../../../redux/slices/registerSlice/registrationSlice';
import SuccessModal from '../SuccessModalOkay/successModal';

interface PdfModalProps {
  open: boolean;
  onClose: () => void;
  base64Pdf: string; // e.g., from Redux: state.applicationPreview.pdfData
  onESign: (formData: {
    place: string;
    date: string;
    consent: boolean;
  }) => Promise<string>;
  isESigned: boolean;
  applicationId: number;
}

const PdfPreviewModal: React.FC<PdfModalProps> = ({
  open,
  onClose,
  base64Pdf,
  isESigned,
  onESign,
  applicationId, //  add this
}) => {
  const [place, setPlace] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [consent, setConsent] = useState(false);

  // Local state to hold the PDF to preview (starts with original)
  const [previewPdfBase64, setPreviewPdfBase64] = useState(base64Pdf);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  //  const [placeError] = useState('');
  const [consentError] = useState('');

  useEffect(() => {
    if (open) {
      setConsent(false);
      setDate(dayjs().format('YYYY-MM-DD'));
      setPlace('');
      setPreviewPdfBase64(base64Pdf);
      console.log('base64PDF in pdfVier component open udeeffect', base64Pdf);

      // Apply protection measures
      // const cleanupScreenshotProtection = preventScreenshot();
      // const cleanupTabDetection = detectTabSwitch();

      // return () => {
      //   cleanupScreenshotProtection();
      //   cleanupTabDetection();

      // };
    }
  }, [open, base64Pdf]);
  // const validate = () => {
  //   let valid = true;
  //   if (!place.trim()) {
  //     setPlaceError('Place is required');
  //     valid = false;
  //   } else {
  //     setPlaceError('');
  //   }

  //   if (!consent) {
  //     setConsentError('You must accept the declaration');
  //     valid = false;
  //   } else {
  //     setConsentError('');
  //   }

  //   return valid;
  // };

  useEffect(() => {
    if (open) {
      // Reset form fields & PDF preview on open
      setConsent(false);
      setDate(dayjs().format('YYYY-MM-DD'));
      setPlace('');
      setPreviewPdfBase64(base64Pdf);
      // console.log("base64PDF in second useEffect", base64Pdf);
      // console.log("previewPdfBase64 for 2nd useeffect", previewPdfBase64);
    }
  }, [open, base64Pdf]);

  // const pdfUrl = `data:application/pdf;base64,${previewPdfBase64}`;
  const pdfUrl = !isESigned
    ? `data:application/pdf;base64,${previewPdfBase64}#toolbar=0&navpanes=0&scrollbar=0`
    : `data:application/pdf;base64,${previewPdfBase64}`;

  console.log('pdfUrl', pdfUrl);

  const handleESign = async () => {
    if (consent && place && date) {
      try {
        // Call the passed onESign prop, which returns the signed PDF base64 string
        const signedPdfBase64 = await onESign({ place, date, consent });

        // Update preview with signed PDF
        if (signedPdfBase64) {
          setPreviewPdfBase64(signedPdfBase64);
        }
      } catch (error) {
        console.log(error, 'Errror');

        alert('Error signing the document. Please try again.');
      }
    } else {
      alert('Please complete all fields and check the declaration box.');
    }
  };

  const handleCompleteLogout = () => {
    // Clear all Redux states
    console.log('Enter in handleCompleteLogout');

    dispatch(resetAuth());
    dispatch(resetAdminOfficerState());
    dispatch(resetHeadInstitutionState());
    dispatch(resetNodal());
    dispatch(resetRegitsration());

    // Navigate to login page
    navigate('/re-login');
  };

  const handleModalOk = () => {
    setShowSuccessModal(false);
    handleCompleteLogout();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, fontFamily: 'inherit' }}>
        Reporting Entity Registration Form eSignature{' '}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme: Theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ height: '80vh', overflow: 'hidden', mb: 2 }}>
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            width="100%"
            height="100%"
            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          />
        </Box>
        {!isESigned && (
          <>
            <FormControl
              required
              error={!!consentError}
              component="fieldset"
              variant="standard"
              sx={{ mt: 2 }}
            >
              <FormControlLabel
                sx={{
                  fontFamily: 'inherit',
                  '& .MuiFormControlLabel-label': {
                    fontFamily: 'inherit',
                  },
                }}
                control={
                  <Checkbox
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    // color="primary"
                    sx={{
                      // color: '#52AE32',
                      '&.Mui-checked': {
                        color: '#52AE32',
                      },
                    }}
                  />
                }
                label="Declaration check box"
              />
              {consentError && <FormHelperText>{consentError}</FormHelperText>}
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {/* <TextField
                label="Place"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                error={!!placeError}
                helperText={placeError}
              />
              <TextField
                 label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                 InputLabelProps={{ shrink: true }}
                required
                fullWidth
                disabled
              /> */}
              <div className="input-group">
                <label htmlFor="place">
                  Place <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="place"
                  name="place"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="date">
                  Date <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled
                />
              </div>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {!isESigned ? (
          <Button
            onClick={handleESign}
            variant="contained"
            style={{
              backgroundColor: '#002CBA',
              color: 'white',
              fontFamily: 'Gilroy',
              textTransform: 'none',
            }}
          >
            eSignature
          </Button>
        ) : (
          <Button
            onClick={async () => {
              try {
                dispatch(showLoader('Please Wait...'));
                const resultAction = await dispatch(
                  submitApplication(applicationId.toString())
                );
                if (submitApplication.fulfilled.match(resultAction)) {
                  // handleCompleteLogout();
                  setShowSuccessModal(true);
                } else {
                  alert(
                    resultAction.payload ||
                      'Failed to submit application. Please try again.'
                  );
                }
              } catch (err) {
                console.log(err);

                alert('Unexpected error submitting application.');
              } finally {
                dispatch(hideLoader());
              }
            }}
            // or navigate('/trackStatus') directly if you prefer
            variant="contained"
            style={{ backgroundColor: '#002CBA', color: 'white' }}
          >
            Submit
          </Button>
        )}
      </DialogActions>
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {}} // Disable close
        onOkay={handleModalOk}
        title="Application Submitted Successfully!"
        message="Your application has been submitted successfully. You will be redirected to the login page to continue."
      />
    </Dialog>
  );
};

export default PdfPreviewModal;
