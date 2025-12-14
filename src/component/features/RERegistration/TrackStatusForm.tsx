/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { RootState, AppDispatch } from '../../../redux/store';
import {
  fetchWorkflowData,
  selectWorkflowLoading,
  selectWorkflowError,
  selectTrackStatusTableData,
  selectWorkflowData,
} from './slice/trackStatusFormSlice';
import { useNavigate } from 'react-router-dom';
import { resetAuth } from '../Authenticate/slice/authSlice';
import { resetForm } from './slice/formSlice';
import { clearConfiguration } from './slice/registrationConfigSlice';
import { Footer } from './CommonComponent';
import RegistrationHeader from './CommonComponent/RegistrationHeader';
import { MainContainer, FormContainer } from './RERegistrationContainer.style';
import SignUpBg from '../../../assets/sign_up_bg.svg';
import TrackStatusFormPreview from './TrackStatusFormPreview';
import { selectWorkflowPayload } from './slice/workflowSlice';

// interface TrackStatusData {
//   ackNumber: string;
//   reName: string;
//   status: string;
//   submittedOn: string;
// }

interface TrackStatusFormProps {
  onSubmit?: (formData: Record<string, unknown>) => void;
  onEdit?: (stepIndex: number) => void;
  applicationId?: string;
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  onHomeClick?: () => void;
  onLogoutClick?: () => void;
  workflowId?: string;
  userId?: string;
}

// Helper function to format status text
const formatStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending Approval';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
};

const getStatusColor = (status: string, pendingAtLevel?: number) => {
  if (status === 'APPROVED') return '#52AE32';
  if (status === 'REJECTED') return '#FF0000';
  if (pendingAtLevel && pendingAtLevel > 1) return 'rgba(255, 118, 0, 1)';
  return 'rgba(255, 205, 28, 1)';
};

const TrackStatusForm: React.FC<TrackStatusFormProps> = ({
  onSubmit,
  onEdit,
  onHomeClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );
  const currentWorkflowId = authWorkflowId;
  const userId = userDetails?.userId || userDetails?.id;

  // Redux selectors
  const workflowLoading = useSelector((state: RootState) =>
    selectWorkflowLoading(state)
  );
  const workflowError = useSelector((state: RootState) =>
    selectWorkflowError(state)
  );
  const trackStatusData = useSelector((state: RootState) =>
    selectTrackStatusTableData(state)
  );
  const workflowData = useSelector((state: RootState) =>
    selectWorkflowData(state)
  );
  const workflowPayload = useSelector(selectWorkflowPayload);
  type LocalApprovalWorkflow = { approvals?: Array<{ reason?: string }> };

  const remarkOfAdmin1 = (
    workflowPayload as { approvalWorkflow?: LocalApprovalWorkflow } | null
  )?.approvalWorkflow?.approvals?.[0]?.reason;

  const remarkOfAdmin2 = (
    workflowPayload as { approvalWorkflow?: LocalApprovalWorkflow } | null
  )?.approvalWorkflow?.approvals?.[1]?.reason;

  const showRemarkColumn = !(trackStatusData || []).some((row) =>
    [1, 2].includes(row.pendingAtLevel || 0)
  );

  // Logout handler
  const handleLogout = () => {
    // Clear all Redux state except address details to preserve user progress
    dispatch(resetAuth()); // Clear authentication state
    dispatch(resetForm()); // Clear form state (entity profile, etc.)
    dispatch(clearConfiguration()); // Clear registration configuration

    // Note: NOT clearing addressDetails Redux state to preserve user's address data
    console.log(
      '🔄 Logout: Preserving address details data for user convenience'
    );

    // Clear any local storage or session storage if needed
    localStorage.clear();
    sessionStorage.clear();

    // Navigate to re-signup with registration tab active
    navigate('/re-signup?tab=1');
  };

  // Fetch workflow data on component mount
  useEffect(() => {
    // console.log('🔄 Fetching workflow data:', { currentWorkflowId, userId });
    if (currentWorkflowId && userId) {
      // console.log('🔄 Fetching workflow data:', { currentWorkflowId, userId });
      dispatch(fetchWorkflowData({ workflowId: currentWorkflowId, userId }));
    }
  }, [currentWorkflowId, userId]);

  // Loading state
  if (workflowLoading) {
    return (
      <MainContainer
        maxWidth={false}
        sx={{
          backgroundImage: `url(${SignUpBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Gilroy',
        }}
      >
        <FormContainer
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
            fontFamily: 'Gilroy',
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2, fontFamily: 'Gilroy' }}>
            Loading workflow data...
          </Typography>
        </FormContainer>
        <Footer />
      </MainContainer>
    );
  }

  // Error state
  if (workflowError) {
    return (
      <MainContainer
        maxWidth={false}
        sx={{
          backgroundImage: `url(${SignUpBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Gilroy',
        }}
      >
        <FormContainer
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
            fontFamily: 'Gilroy',
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: 'Gilroy' }}>
              {workflowError}
            </Typography>
          </Alert>
        </FormContainer>
        <Footer />
      </MainContainer>
    );
  }

  return (
    <MainContainer
      maxWidth={false}
      sx={{
        backgroundImage: `url(${SignUpBg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Gilroy',
      }}
    >
      <FormContainer
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: 4,
          fontFamily: 'Gilroy',
          mx: { xs: 2, sm: 4, md: 6, lg: 8 },
        }}
      >
        <RegistrationHeader
          onHomeClick={onHomeClick}
          onLogoutClick={handleLogout}
        />

        <Box sx={{ mb: 0, width: '100%' }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Gilroy',
              fontWeight: 600,
              color: '#333',
              fontSize: '20px',
              mb: 3,
              textAlign: 'center',
            }}
          >
            Track Status
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              mb: 0,
              mx: 'auto',
              maxWidth: 'calc(100% - 94px)',
              boxShadow: '0 0px 8px rgba(0,0,0,0.1)',
              borderRadius: 2,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#E6EBFF' }}>
                  <TableCell
                    sx={{
                      fontFamily: 'Gilroy',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333',
                      padding: '16px',
                    }}
                  >
                    Ack Number
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Gilroy',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333',
                      padding: '16px',
                    }}
                  >
                    RE Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Gilroy',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    Status
                  </TableCell>
                  {showRemarkColumn && (
                    <TableCell
                      sx={{
                        fontFamily: 'Gilroy',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#333',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      Remark
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      fontFamily: 'Gilroy',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    Submitted On
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(trackStatusData || []).map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    <TableCell
                      sx={{
                        fontFamily: 'Gilroy',
                        fontSize: '14px',
                        color: '#333',
                        padding: '16px',
                      }}
                    >
                      {row.ackNumber}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Gilroy',
                        fontSize: '14px',
                        color: '#333',
                        padding: '16px',
                      }}
                    >
                      {row.reName}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Gilroy',
                        fontSize: '14px',
                        color: '#FF8C00',
                        fontWeight: 600,
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          color: getStatusColor(row.status, row.pendingAtLevel),
                          fontWeight: 600,
                          fontFamily: 'Gilroy',
                        }}
                      >
                        {formatStatus(row.status)}{' '}
                        {row.status === 'PENDING' &&
                          row.pendingAtLevel &&
                          `[L${row.pendingAtLevel}]`}
                      </Typography>
                    </TableCell>
                    {showRemarkColumn && (
                      <TableCell
                        sx={{
                          fontFamily: 'Gilroy',
                          fontSize: '14px',
                          color: '#333',
                          padding: '16px',
                          textAlign: 'center',
                        }}
                      >
                        {remarkOfAdmin2 || remarkOfAdmin1}
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        fontFamily: 'Gilroy',
                        fontSize: '14px',
                        color: '#333',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      {row.submittedOn}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Form Preview Section */}
        <Box sx={{ width: '100%' }}>
          <TrackStatusFormPreview
            onSave={onSubmit}
            onEdit={onEdit}
            formData={(workflowData?.payload as Record<string, unknown>) || {}}
          />
        </Box>
      </FormContainer>
      <Footer />
    </MainContainer>
  );
};

export default TrackStatusForm;
