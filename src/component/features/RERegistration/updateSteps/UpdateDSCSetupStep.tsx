import React, { useState, useEffect } from 'react'; // adjust path to your store.ts
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
// import { CloudUpload} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import BreadcrumbUpdateProfile from '../../MyTask/UpdateEntityProfile-prevo/BreadcrumbUpdateProfile';
import approvedIcon from '../../../../assets/approved_icon.svg';
import deleteIcon from '../../../../assets/delete_icon.svg';

interface DSCData {
  fileName?: string;
  certificateValidFrom?: string | null;
  certificateExpiryDate?: string | null;
  dscId?: string;
  certificateSerial?: string;
  certificateIssuer?: string;
  certificateThumbprint?: string;
  isActive?: boolean;
  hasExistingDsc?: boolean;
}

import { RootState, AppDispatch } from '../../../../redux/store';

// Import your slice actions
import {
  fetchDSC,
  updateDSC,
  deleteDSC,
  //validateDSC,
  resetValidationResult,
  resetError,
} from './slice/updateDSCSetupSlice';
import { useAppSelector } from '../../../../redux/store';
const UpdateDSCSetupStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dscFile, setDscFile] = useState<File | null>(null);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  //const validationResult = useAppSelector(state => state.dsc.validationResult);

  //const isSubmitEnabled = dscFile && validationResult?.isValid;
  const isSubmitEnabled = dscFile;

  const {
    dscData,
    loading,
    // error,
    tempBase64Certificate,
    isSubmitting,
    successMessage,
  } = useSelector((state: RootState) => state.dsc);

  // Get the logged-in userId from auth slice; fall back to empty string if not yet available
  const authUserId = useAppSelector(
    (state) => state.auth.userDetails?.userId || ''
  );

  // Add fallback to get userId from localStorage if Redux state is empty
  const userId = authUserId || localStorage.getItem('userId') || '';

  useEffect(() => {
    if (userId) {
      dispatch(fetchDSC(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (successMessage && userId) {
      dispatch(fetchDSC(userId));
    }
  }, [successMessage, userId, dispatch]);

  const handleDeleteDsc = () => {
    if (dscFile) {
      setDscFile(null);
      dispatch(resetValidationResult());
      return;
    }
    if (!authUserId) return;
    dispatch(deleteDSC(authUserId))
      .unwrap()
      .then(() => {
        // Re-fetch or UI will be updated by slice; still safe to re-fetch
        dispatch(fetchDSC(authUserId));
      })
      .catch((err) => {
        console.error('Delete DSC failed', err);
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.pfx')) {
      setDscFile(file);
    } else {
      dispatch(resetValidationResult());
      if (file && !file.name.endsWith('.pfx')) {
        dispatch(resetError());
        console.warn('⚠️ File is not .pfx format');
      }
    }
  };

  const handleSubmit = async () => {
    if (!dscFile) return;

    // Ensure we have base64 from validation (saved in slice)
    const base64 = tempBase64Certificate;
    if (!base64) {
      // Fallback: convert file again (rare)
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(',')[1]);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      try {
        const b = await toBase64(dscFile);
        // dispatch updateDSC
        await dispatch(
          updateDSC({ userId: authUserId, base64Certificate: b })
        ).unwrap();
        setShowSuccessPopup(true);
        // refresh
        dispatch(fetchDSC(authUserId));
        // clear local file after success
        setDscFile(null);
        dispatch(resetValidationResult());
      } catch (err) {
        console.error('Update DSC failed', err);
      }
      return;
    }

    try {
      await dispatch(
        updateDSC({ userId: authUserId, base64Certificate: base64 })
      ).unwrap();
      setShowSuccessPopup(true);
      // re-fetch updated DSC details from API so UI shows new details
      dispatch(fetchDSC(authUserId));
      // clear uploaded file after successful submit (optional)
      setDscFile(null);
      dispatch(resetValidationResult());
    } catch (err) {
      console.error('Update DSC failed', err);
      // error will be shown from slice.error
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB');
  };

  //  const getValidationMessage = (): ValidationMessage | null => {
  //   if (!validationResult) return null;

  //   if (!validationResult.isValid) {
  //     return { text: 'Invalid DSC. Please upload valid DSC.', type: 'error' };
  //   }

  //   if (!validationResult.isClass3) {
  //     return { text: 'DSC is not Class 3. Please upload Class 3 DSC.', type: 'error' };
  //   }

  //   if (!validationResult.nameMatches) {
  //     return { text: 'Invalid DSC. Please try again.', type: 'error' };
  //   }

  //   return { text: 'DSC Uploaded Successfully. Please click Submit.', type: 'success' };
  // };

  const getDSCFileName = (dscData: DSCData | null): string => {
    if (!dscData?.hasExistingDsc) {
      return 'No DSC uploaded';
    }
    if (dscData.certificateSerial) {
      const fileName = `DSC_${dscData.certificateSerial.slice(-8)}.pfx`;
      return fileName;
    }
    return 'DSC_unknown.pfx';
  };

  // const validationMessage = getValidationMessage();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }} className="Gilroy-Medium">
          Loading DSC data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Content */}
      <Paper sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Track Status Breadcrumb */}
        <Box>
          <BreadcrumbUpdateProfile
            breadcrumbItems={[
              { label: 'Update Profile', href: '/update-profile' },
              { label: 'DSC Setup' },
            ]}
            sx={{
              backgroundColor: 'background: #E4F6FF',
              width: 320,
              height: 30,
              borderRadius: '4px',
              pr: '13px',
              pl: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          />
        </Box>
        {/* Section Header - Updated to match image */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            className="Gilroy-SemiBold"
            sx={{
              mb: 0.5,
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            DSC Setup
          </Typography>
        </Box>

        {/* Instructions Card - Updated CSS applied */}
        {/* Instructions Card - Exact Figma Design */}
        <Card
          sx={{
            mb: 4,
            background: '#FFF3C7',
            width: '100%',
            height: '73px',
            display: 'flex',
            alignItems: 'center',

            p: '16px',
          }}
        >
          <CardContent
            sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <Typography
              className="Gilroy-Bold"
              sx={{
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '100%',
                color: '#000000',
                mb: 1,
                mt: 2,
              }}
            >
              Instructions
            </Typography>

            <Typography
              className="Gilroy"
              sx={{
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '20px',
                color: '#000000',
                mb: 0,
                pl: 2,
              }}
            >
              • Delete the existing DSC to upload a new one.
            </Typography>
          </CardContent>
        </Card>

        {/* Upload Section - Updated to match image */}
        {/* Upload Section - Exact Figma Design */}
        <Box sx={{ mb: 2, width: '1064px', height: '85px', gap: '20px' }}>
          <Typography
            className="Gilroy-Bold"
            sx={{
              mb: '4px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#000000',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              height: '24px',
            }}
          >
            Upload DSC
            <Box component="span" sx={{ color: '#F04438', ml: '2px' }}>
              *{' '}
            </Box>
            <Box
              component="span"
              className="Gilroy-Medium"
              sx={{
                fontWeight: 500,
                fontSize: '16px',
                color: '#727272',
                ml: '4px',
              }}
            >
              [Please upload .pfx file]
            </Box>
          </Typography>

          {/* Upload Box */}
          <Box
            sx={{
              width: '433px',
              height: '48px',
              border: '1px solid #D1D1D1',
              borderRadius: '4px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* File Name Display */}
            <Typography
              className="Gilroy-Medium"
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color:
                  dscFile || dscData?.hasExistingDsc ? '#000000' : '#9E9E9E',
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {dscFile
                ? dscFile.name
                : dscData?.hasExistingDsc
                  ? getDSCFileName(dscData)
                  : 'Browse files to upload'}
            </Typography>

            {/* Browse Button */}
            <Button
              variant="outlined"
              component="label"
              disabled={dscData?.hasExistingDsc && !dscFile}
              className="Gilroy-Medium"
              sx={{
                width: '84px',
                height: '32px',
                border: '1px solid #002CBA',
                borderRadius: '4px',
                padding: '8px 16px',
                color: '#002CBA',
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  borderColor: '#0020A3',
                  backgroundColor: 'rgba(0, 44, 186, 0.04)',
                },
                '&:disabled': {
                  borderColor: '#999999',
                  color: '#999999',
                  backgroundColor: '#F5F5F5',
                },
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                minWidth: 'auto',
                flexShrink: 0,
              }}
            >
              Browse
              <input
                type="file"
                hidden
                accept=".pfx"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </Box>
        {/* DSC Table - Exact Figma Design */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#E6EBFF' }}>
              <TableRow>
                <TableCell
                  className="Gilroy-Bold"
                  sx={{
                    borderRight: '1px solid #E6EBFF',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#000000',
                    padding: '12px 16px',
                  }}
                >
                  DSC
                </TableCell>
                <TableCell
                  className="Gilroy-Bold"
                  sx={{
                    borderRight: '1px solid #E6EBFF',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#000000',
                    padding: '12px 16px',
                  }}
                >
                  Valid From
                </TableCell>
                <TableCell
                  className="Gilroy-Bold"
                  sx={{
                    borderRight: '1px solid #E6EBFF',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#000000',
                    padding: '12px 16px',
                  }}
                >
                  Valid Till
                </TableCell>
                <TableCell
                  className="Gilroy-Bold"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#000000',
                    padding: '12px 16px',
                  }}
                >
                  Delete
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {/* Show ONLY API data in table, NOT uploaded files */}
                <TableCell
                  className="Gilroy-Medium"
                  sx={{
                    borderRight: '1px solid #E6EBFF',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#000000',
                    padding: '12px 16px',
                  }}
                >
                  {(() => {
                    return dscData?.hasExistingDsc
                      ? getDSCFileName(dscData)
                      : 'No DSC uploaded';
                  })()}
                </TableCell>
                {/* VALID FROM - Show ONLY from API data */}
                <TableCell
                  className="Gilroy-Medium"
                  sx={{
                    borderRight: '1px solid #e0e0e0',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#000000',
                    padding: '12px 16px',
                  }}
                >
                  {(() => {
                    return dscData?.certificateValidFrom
                      ? formatDate(dscData?.certificateValidFrom)
                      : '-';
                  })()}
                </TableCell>

                {/* VALID TILL - Show ONLY from API data */}
                <TableCell
                  className="Gilroy-Medium"
                  sx={{
                    borderRight: '1px solid #e0e0e0',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#000000',
                    padding: '12px 16px',
                  }}
                >
                  {(() => {
                    return dscData?.certificateExpiryDate
                      ? formatDate(dscData?.certificateExpiryDate)
                      : '-';
                  })()}
                </TableCell>

                <TableCell
                  sx={{
                    textAlign: 'center',
                    padding: '12px 16px',
                  }}
                >
                  {dscData?.hasExistingDsc === true && (
                    <Button
                      onClick={handleDeleteDsc}
                      disabled={isSubmitting}
                      className="Gilroy-Medium"
                      sx={{
                        minWidth: 'auto',
                        p: 0,
                        '&:hover': { backgroundColor: 'transparent' },
                      }}
                      aria-label="delete-dsc"
                    >
                      <img
                        src={deleteIcon}
                        alt="Delete"
                        style={{
                          width: '24px',
                          height: '24px',
                          objectFit: 'contain',
                          opacity: isSubmitting ? 0.5 : 1,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                      />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            disabled={!isSubmitEnabled || isSubmitting}
            onClick={handleSubmit}
            className="Gilroy-Medium submit-btn"
            size="large"
            sx={{
              backgroundColor: '#1976d2',
              px: 4,
              py: 1.5,
              fontSize: '16px',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#9e9e9e',
              },
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>

        {/* Messages */}
        {/* {error && (
          <Alert severity="error" sx={{ mt: 2 }} className="Gilroy-Medium">
            {error}
          </Alert>
        )} */}

        {/* {validationMessage && (
          <Alert severity={validationMessage.type} sx={{ mt: 2 }} className="Gilroy-Medium">
            {validationMessage.text}
          </Alert>
        )} */}

        {/* {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }} className="Gilroy-Medium">
            {successMessage}
          </Alert>
        )} */}
      </Paper>
      {/* Success Popup */}
      {/* Success Popup */}
      {/* Success Popup */}
      {/* Success Popup */}
      <Dialog
        open={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            width: '426px',
            height: '276px',
            borderRadius: '4px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: '#FFFFFF',
            gap: '12px',
          },
        }}
      >
        {/* Close Icon */}
        <Box
          sx={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            cursor: 'pointer',
            width: '24px',
            height: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000',
          }}
          onClick={() => setShowSuccessPopup(false)}
        >
          ✕
        </Box>

        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '24px',
          }}
        >
          {/* Main Content Container */}
          <Box
            sx={{
              width: '378px',
              height: '192px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
            }}
          >
            {/* APPROVED ICON */}
            <Box
              sx={{
                width: '48px',
                height: '48px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={approvedIcon}
                alt="Approved"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>

            {/* MESSAGE TEXT */}
            <Box
              sx={{
                width: '378px',
                height: '32px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography
                className="Gilroy-SemiBold"
                sx={{
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '26px',
                  textAlign: 'center',
                  color: '#000000',
                  height: '26px',
                }}
              >
                DSC Updated Successfully
              </Typography>
            </Box>

            {/* OKAY BUTTON - Centered */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Button
                variant="contained"
                onClick={() => setShowSuccessPopup(false)}
                sx={{
                  width: '200px',
                  height: '48px',
                  borderRadius: '4px',
                  padding: '8px 47px',
                  backgroundColor: '#002CBA',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontFamily: 'Gilroy',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#0020A3',
                  },
                }}
              >
                Okay
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UpdateDSCSetupStep;
