/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import * as styles from './NewUserCreationRequest.styles';
import ActionButtons from '../../../../common/buttons/ActionButtons';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import DecisionModal from '../../../../common/modals/DecisionModal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../redux/store';
import { fetchSubUserUserById } from './slice/SubUserSingleUserSlice';
import { getBranch } from '../../../UserManagement/CreateModifyBranch/slice/getBranchSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import { formatOnlyDate } from '../../../../../utils/dateUtils';
import {
  fetchCountryCodes,
  Country as CountryCode,
} from '../../../../../utils/countryUtils';

const UserDeactivationRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const [workFlowId, setWorkFlowId] = useState('');
  const location = useLocation();
  const [, setIsFormDisabled] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'reject',
    title: '',
    message: '',
    listBefore: [] as string[],
    listAfter: [] as string[],
  });
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [allCountries, setAllCountries] = useState<CountryCode[]>([]);
  const [formData, setFormData] = useState({
    userName: '',
    userRole: '',
    userId: '',
    regionName: '',
    regionCode: '',
    branchName: '',
    branchCode: '',
    citizenship: '',
    ckycNumber: '',
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    designation: '',
    emailAddress: '',
    gender: '',
    countryCode: '',
    mobileNumber: '',
    dob: '',
    poi: '',
    poiNumber: '',
    employeeId: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    country: '',
    stateUT: '',
    district: '',
    cityTown: '',
    pinCode: '',
    pinCodeOther: '',
    digipin: '',
  });
  const [deactivationDetails, setDeactivationDetails] = useState({
    deactivationInitiatedBy: '',
    deactivationInitiatedOn: '',
    deactivationRemark: '',
  });

  // Helper function to format date
  const formatDateOnly = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Helper function to format date from array
  const formatDateFromArray = (
    dateArray: number[] | string | undefined
  ): string => {
    if (!dateArray) return '';
    if (typeof dateArray === 'string') {
      // If it's already a string, parse it and reformat to DD-MM-YYYY
      const dateObj = new Date(dateArray);
      if (!isNaN(dateObj.getTime())) {
        return formatOnlyDate(dateObj).replace(/\//g, '/');
      }
      return dateArray; // Return as-is if invalid date
    }
    if (Array.isArray(dateArray) && dateArray.length === 3) {
      const [year, month, day] = dateArray;
      // Create a Date object and use the common date utility
      const dateObj = new Date(year, month - 1, day);
      // formatOnlyDate returns DD/MM/YYYY, so we replace / with -
      return formatOnlyDate(dateObj).replace(/\//g, '/');
    }
    return '';
  };

  // Helper function to get user role display name
  const getUserRoleDisplayName = (userType: string): string => {
    const roleMap: Record<string, string> = {
      IU: 'Institutional User [IU]',
      IRA: 'Institutional Regional Admin [IRA]',
      IBU: 'Institutional Branch User [IBU]',
    };
    return roleMap[userType] || userType;
  };

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchCountryCodes();
        setAllCountries(countries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Helper function to get country name from code
  const getCountryName = (countryCode: string | undefined): string => {
    if (!countryCode) return '-';
    const country = allCountries.find(
      (c) => c.code.toUpperCase() === countryCode.toUpperCase()
    );
    return country ? country.name : countryCode;
  };

  useEffect(() => {
    if (id) {
      setLoading(true);

      // Get data from navigation state (passed from list page)
      const locationState = location.state as any;
      const passedUserData = locationState?.userData;
      const passedWorkflowId = locationState?.workflowId;
      const passedUserId = locationState?.userId;
      const passedWorkflowData = locationState?.workflowData;

      // Helper function to populate form from workflow data
      const populateFormFromWorkflowData = (workflowData: any) => {
        const userDetails = workflowData?.payload?.userDetails || {};
        const concernedUserDetails =
          workflowData?.payload?.concernedUserDetails || {};
        const metaData = workflowData?.meta_data || {};
        const initiatorDetails = workflowData?.payload?.initiatorDetails || {};

        const userTypeToUse =
          userDetails.role ||
          concernedUserDetails.userType ||
          metaData.role ||
          '';

        const userName =
          userDetails.firstName && userDetails.lastName
            ? `${userDetails.firstName} ${userDetails.middleName || ''} ${userDetails.lastName}`.trim()
            : concernedUserDetails.username || metaData.username || '';

        setFormData({
          userName: userName,
          userRole: userTypeToUse,
          userId: metaData.userId || concernedUserDetails.userId || id || '',
          regionName:
            userDetails.regionName || concernedUserDetails.regionName || '',
          regionCode:
            userDetails.regionCode || concernedUserDetails.regionCode || '',
          branchName:
            userDetails.branchName || concernedUserDetails.branchName || '',
          branchCode:
            userDetails.branchCode || concernedUserDetails.branchCode || '',
          citizenship: userDetails.citizenship || '',
          ckycNumber:
            userDetails.ckycNumber ||
            userDetails.ckycNo ||
            metaData.ckycNo ||
            '',
          title: userDetails.title || '',
          firstName: userDetails.firstName || '',
          middleName: userDetails.middleName || '',
          lastName: userDetails.lastName || '',
          designation: userDetails.designation || '',
          emailAddress: userDetails.email || metaData.email || '',
          gender: userDetails.gender || '',
          countryCode: userDetails.countryCode || '',
          mobileNumber: userDetails.mobile || metaData.mobile || '',
          dob: formatDateFromArray(userDetails.dob) || '',
          poi: userDetails.proofOfIdentity || '',
          poiNumber: userDetails.proofOfIdentityNumber || '',
          employeeId: userDetails.employeeCode || '',
          addressLine1:
            userDetails.address?.line1 || userDetails.addressLine1 || '',
          addressLine2:
            userDetails.address?.line2 || userDetails.addressLine2 || '',
          addressLine3:
            userDetails.address?.line3 || userDetails.addressLine3 || '',
          country:
            userDetails.country ||
            userDetails.address?.countryCode ||
            userDetails.address?.country ||
            '',
          stateUT: userDetails.address?.state || '',
          district: userDetails.address?.district || '',
          cityTown:
            userDetails.address?.cityTown || userDetails.address?.city || '',
          pinCode:
            userDetails.address?.pinCode || userDetails.address?.pincode || '',
          pinCodeOther:
            userDetails.address?.alternatePinCode ||
            userDetails.address?.alternatePincode ||
            '',
          digipin:
            userDetails.address?.digiPin || userDetails.address?.digipin || '',
        });

        // Set deactivation details
        const initiatedBy =
          initiatorDetails.actionByUserName || metaData.initiatedBy || '';
        const initiatedByUserId =
          initiatorDetails.userId || metaData.initiatedBy || '';
        const initiatedByDisplay =
          initiatedBy && initiatedByUserId
            ? `${initiatedBy} [${initiatedByUserId}]`
            : initiatedBy || initiatedByUserId || '-';

        // Extract deactivation remark from userDetails
        const deactivationRemark =
          userDetails.remarks || userDetails.reason || '';

        setDeactivationDetails({
          deactivationInitiatedBy: initiatedByDisplay,
          deactivationInitiatedOn: formatDateOnly(
            initiatorDetails.actionDateTime ||
              metaData.lastActionOn ||
              workflowData.created_at ||
              ''
          ),
          deactivationRemark: deactivationRemark,
        });

        // Fetch branch address for IBU users
        if (
          userTypeToUse === 'IBU' ||
          userTypeToUse === 'INSTITUTIONAL_BRANCH_USER'
        ) {
          const branchCodeToUse =
            userDetails.branchCode ||
            concernedUserDetails.branchCode ||
            metaData.branchCode ||
            '';
          if (branchCodeToUse) {
            dispatch(getBranch(branchCodeToUse))
              .unwrap()
              .then((branchData: any) => {
                console.log('Branch data fetched for IBU user:', branchData);
                // Update address fields with branch address
                setFormData((prev) => ({
                  ...prev,
                  addressLine1:
                    branchData.address?.line1 || prev.addressLine1 || '',
                  addressLine2:
                    branchData.address?.line2 || prev.addressLine2 || '',
                  country:
                    branchData.address?.countryCode || prev.country || '',
                  stateUT: branchData.address?.state || prev.stateUT || '',
                  district: branchData.address?.district || prev.district || '',
                  cityTown: branchData.address?.city || prev.cityTown || '',
                  pinCode: branchData.address?.pinCode || prev.pinCode || '',
                }));
              })
              .catch((error) => {
                console.error('Failed to fetch branch data:', error);
              });
          }
        }

        setIsFormDisabled(true);
        setLoading(false);
      };

      // Helper function to populate form from user data
      const populateFormFromData = (userData: any) => {
        console.log('populateFormFromData - userData:', userData);
        const userTypeToUse = userData?.userType || '';
        const userName =
          userData?.firstName && userData?.lastName
            ? `${userData.firstName} ${userData.middleName || ''} ${userData.lastName}`.trim()
            : '';

        setFormData((prev) => ({
          ...prev,
          userName: userName || prev.userName,
          userRole: userTypeToUse || prev.userRole,
          userId: id || prev.userId,
          regionName:
            userData?.regionName || userData?.region || prev.regionName,
          regionCode: userData?.regionCode || prev.regionCode,
          branchName: userData?.branchName || prev.branchName,
          branchCode: userData?.branchCode || prev.branchCode,
          citizenship: userData?.citizenship || prev.citizenship,
          ckycNumber:
            userData?.ckycNumber || userData?.ckycNo || prev.ckycNumber,
          title: userData?.title || prev.title,
          firstName: userData?.firstName || prev.firstName,
          middleName: userData?.middleName || prev.middleName,
          lastName: userData?.lastName || prev.lastName,
          designation: userData?.designation || prev.designation,
          emailAddress: userData?.emailAddress || prev.emailAddress,
          gender: userData?.gender || prev.gender,
          countryCode: userData?.countryCode || prev.countryCode,
          mobileNumber: userData?.mobileNumber || prev.mobileNumber,
          dob: formatDateFromArray(userData?.dob) || prev.dob,
          poi: userData?.poi || prev.poi,
          poiNumber: userData?.poiNumber || prev.poiNumber,
          employeeId: userData?.employeeId || prev.employeeId,
          addressLine1: userData?.address?.line1 || prev.addressLine1,
          addressLine2: userData?.address?.line2 || prev.addressLine2,
          addressLine3: userData?.address?.line3 || prev.addressLine3,
          country:
            userData?.country ||
            userData?.address?.countryCode ||
            userData?.address?.country ||
            prev.country,
          stateUT: userData?.address?.state || prev.stateUT,
          district: userData?.address?.district || prev.district,
          cityTown: userData?.address?.cityTown || prev.cityTown,
          pinCode: userData?.address?.pinCode || prev.pinCode,
          pinCodeOther:
            userData?.address?.alternatePinCode || prev.pinCodeOther,
          digipin: userData?.address?.digiPin || prev.digipin,
        }));
        setIsFormDisabled(true);
        setLoading(false);
      };

      // If we have workflow data from navigation state, use it first for prepopulation
      if (passedWorkflowData) {
        // Set workflowId if available
        if (passedWorkflowId || passedWorkflowData.workflow_id) {
          setWorkFlowId(passedWorkflowId || passedWorkflowData.workflow_id);
        }

        // Populate form from workflow data immediately
        populateFormFromWorkflowData(passedWorkflowData);

        // Optionally fetch fresh data in background (but don't wait for it)
        const userIdToFetch =
          passedUserId ||
          passedWorkflowData.meta_data?.userId ||
          passedWorkflowData.payload?.concernedUserDetails?.userId;
        if (userIdToFetch) {
          dispatch(fetchSubUserUserById(userIdToFetch))
            .then((action: any) => {
              const userData = action?.payload || action;
              console.log('Fetched user data for deactivation:', userData);
              // Update form with fresh data if available
              populateFormFromData(userData);
            })
            .catch(() => {
              // If fetch fails, keep the workflow data
              console.log('Failed to fetch fresh data, using workflow data');
            });
        }
        return;
      }

      // Check if we have user data from navigation state
      if (passedUserData) {
        // User data already available from navigation state
      } else {
        // Try to fetch workflow data to get userId
        const workflowPayload = {
          page: 0,
          size: 1000,
          sort: 'createdAt,desc',
          searchText: '',
          status: 'APPROVAL_PENDING',
          workflowType: 'RE_USER_DEACTIVATION',
        };

        Secured.post(
          API_ENDPOINTS.get_sub_users_workflow_pending_requests,
          workflowPayload
        )
          .then((workflowResponse: any) => {
            const workflowData = workflowResponse.data;
            const content = workflowData?.data?.content || [];
            const workflowItem =
              content.find(
                (item: any) =>
                  item.workflow_id === id ||
                  item.workflowId === id ||
                  item.meta_data?.userId === id ||
                  item.payload?.concernedUserDetails?.userId === id
              ) ||
              content[0] ||
              {};
            const workflowId =
              workflowItem.workflow_id || workflowItem.workflowId;
            const metaData =
              workflowItem.meta_data || workflowItem.metaData || {};
            const payload = workflowItem.payload || {};
            const concernedUserDetails = payload.concernedUserDetails || {};

            // Extract userId from metadata, if not found use workflowId
            const extractedUserId =
              metaData.userId ||
              concernedUserDetails.userId ||
              workflowItem.userId;

            if (workflowId) {
              setWorkFlowId(workflowId);
            }

            // Use extracted userId if found, otherwise use workflowId
            const finalUserId = extractedUserId || workflowId || id;

            if (!extractedUserId && workflowId) {
              // If userId is not found, use workflowId for fetching
              console.log('userId not found, using workflowId:', workflowId);
            }

            // Populate from workflow data
            populateFormFromWorkflowData(workflowItem);

            // Fetch user data
            if (finalUserId) {
              dispatch(fetchSubUserUserById(finalUserId))
                .then((action: any) => {
                  const userData = action?.payload || action;
                  console.log('User data received:', userData);
                  populateFormFromData(userData);
                })
                .catch((error) => {
                  console.error('Failed to fetch user data:', error);
                  setLoading(false);
                });
            }
          })
          .catch((error) => {
            console.error('Failed to fetch workflow data:', error);
            // If workflow fetch fails, try using id directly as userId or workflowId
            dispatch(fetchSubUserUserById(id))
              .then((action: any) => {
                const userData = action?.payload || action;
                populateFormFromData(userData);
              })
              .catch((userError) => {
                console.error('Failed to fetch user data:', userError);
                setLoading(false);
              });
          });
      }
    }
  }, [dispatch, id, location.pathname, location.state]);

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!workFlowId) {
      console.error('Workflow ID is missing');
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: 'Workflow ID is missing. Cannot approve request.',
        listBefore: [],
        listAfter: [],
      });
      return;
    }

    try {
      // Prepare approval payload
      const approvalPayload = {
        workflowId: workFlowId,
        action: 'APPROVE',
        reason: 'ok approve',
        remarks: 'ok approve',
      };

      console.log('Approval payload:', approvalPayload);

      // Call the approval API
      const response = await Secured.post(
        API_ENDPOINTS.sub_users_workflow_approval,
        approvalPayload
      );

      console.log('Approval API response:', response.data);

      // Check if the response indicates success
      if (
        response.data &&
        (response.data.success === true || response.status === 200)
      ) {
        const userName = formData?.userName || 'User';
        const userRole = formData?.userRole || ''; // Use role code directly (e.g., "IBU")
        const userId = formData?.userId || '';
        const regionName = formData?.regionName || '';
        const regionCode = formData?.regionCode || '';
        const branchName = formData?.branchName || '';
        const branchCode = formData?.branchCode || '';

        // Format: "User\n\n[Name] - [Role] - [Id]\n\nde-activated successfully\n\nfor Region [Name - Code]\n\nand Branch [Name - Code]"
        const userInfo = `${userName} - ${userRole} - ${userId}`;
        const regionInfo =
          regionName && regionCode
            ? `for Region [${regionName} - ${regionCode}]`
            : regionName
              ? `for Region [${regionName}]`
              : '';
        const branchInfo =
          branchName && branchCode
            ? `and Branch [${branchName} - ${branchCode}]`
            : branchName
              ? `and Branch [${branchName}]`
              : '';

        let message = `\n\n${userInfo}\n\nde-activated successfully`;
        if (regionInfo) {
          message += `\n\n${regionInfo}`;
        }
        if (branchInfo) {
          message += `\n\n${branchInfo}`;
        }

        setModalState({
          isOpen: true,
          type: 'approve',
          title: 'User',
          message: message,
          listBefore: [],
          listAfter: [],
        });
      } else {
        // Handle API error response
        const errorMessage =
          response.data?.message ||
          response.data?.errorMessage ||
          'Failed to approve the request';
        setModalState({
          isOpen: true,
          type: 'reject',
          title: 'Error',
          message: errorMessage,
          listBefore: [],
          listAfter: [],
        });
      }
    } catch (error: any) {
      console.error('Error approving form:', error);
      // Handle error response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errorMessage ||
        error?.message ||
        'An error occurred while processing your request.';
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: errorMessage,
        listBefore: [],
        listAfter: [],
      });
    }
  };

  const handleRejectClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (remark: string) => {
    if (!workFlowId) {
      console.error('Workflow ID is missing');
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: 'Workflow ID is missing. Cannot reject request.',
        listBefore: [],
        listAfter: [],
      });
      setRejectModalOpen(false);
      return;
    }

    try {
      // Prepare rejection payload
      const rejectionPayload = {
        workflowId: workFlowId,
        action: 'REJECT',
        reason: remark || 'ok approve',
        remarks: remark || 'ok approve',
      };

      console.log('Rejection payload:', rejectionPayload);

      // Call the rejection API
      const response = await Secured.post(
        API_ENDPOINTS.sub_users_workflow_approval,
        rejectionPayload
      );

      console.log('Rejection API response:', response.data);

      // Check if the response indicates success
      if (
        response.data &&
        (response.data.success === true ||
          response.status === 200 ||
          response.data?.data?.workflowStatus === 'REJECTED')
      ) {
        setModalState({
          isOpen: true,
          type: 'reject',
          title: '',
          message: 'User De-activation Request Rejected',
          listBefore: [],
          listAfter: [],
        });
      } else {
        // Handle API error response
        const errorMessage =
          response.data?.message ||
          response.data?.data?.message ||
          response.data?.errorMessage ||
          'Failed to reject the request';
        setModalState({
          isOpen: true,
          type: 'reject',
          title: 'Error',
          message: errorMessage,
          listBefore: [],
          listAfter: [],
        });
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      // Handle error response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.response?.data?.errorMessage ||
        error?.message ||
        'An error occurred while processing your request.';
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: errorMessage,
        listBefore: [],
        listAfter: [],
      });
    } finally {
      setRejectModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setModalState((prev) => {
      // Redirect based on action after closing modal (for both approve and reject)
      if (prev.type === 'approve' || prev.type === 'reject') {
        // Use setTimeout to ensure modal closes before navigation
        setTimeout(() => {
          navigate('/re/sub-user-management/user/list/de-activate');
        }, 100);
      }
      return { ...prev, isOpen: false };
    });
  };

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'User', path: '/re/sub-user-management/user' },
    {
      label: 'De-activate',
      path: '/re/sub-user-management/user/list/de-activate',
    },
    { label: 'Approval' },
  ];

  const renderField = (children: React.ReactNode) => (
    <Box sx={styles.formFieldStyles}>{children}</Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <styles.FormContainer>
        {/* Breadcrumb and Back Button - Top */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {/* Breadcrumb */}
          <Box sx={{ flex: 1 }}>
            <NavigationBreadCrumb crumbsData={crumbsData} />
          </Box>
          {/* Back Button - Top Right */}
          <Box>
            <Button
              startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
              onClick={() => navigate(-1)}
              sx={{
                color: '#1A1A1A',
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Back
            </Button>
          </Box>
        </Box>
        <Typography variant="h5" sx={styles.headerStyles}>
          Approval
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            {/* De-activation Summary Section */}
            <Box
              sx={{
                backgroundColor: '#F6F6F6',
                borderRadius: '8px',
                padding: '20px',
                margin: '0 10px 16px 10px',
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <Typography
                    sx={{
                      ...styles.labelStyles,
                      color: '#666',
                      marginBottom: 1,
                    }}
                  >
                    De-activation Initiated by
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    {deactivationDetails.deactivationInitiatedBy || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <Typography
                    sx={{
                      ...styles.labelStyles,
                      color: '#666',
                      marginBottom: 1,
                    }}
                  >
                    De-activation Initiated On
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    {deactivationDetails.deactivationInitiatedOn || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <Typography
                    sx={{
                      ...styles.labelStyles,
                      color: '#666',
                      marginBottom: 1,
                    }}
                  >
                    De-activation Remark
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000',
                      fontFamily: 'Gilroy, sans-serif',
                    }}
                  >
                    {deactivationDetails.deactivationRemark || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* User Identification Section */}
            <Grid
              container
              spacing={2}
              sx={{
                p: 2,
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                margin: '0 10px 16px 10px',
              }}
            >
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                {renderField(
                  <>
                    <Typography variant="subtitle2" sx={styles.labelStyles}>
                      User Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData?.userName || '-'}
                      placeholder="Enter User Name"
                      variant="outlined"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                {renderField(
                  <>
                    <Typography variant="subtitle2" sx={styles.labelStyles}>
                      User Role
                    </Typography>
                    <TextField
                      fullWidth
                      value={getUserRoleDisplayName(formData?.userRole) || '-'}
                      placeholder="Enter User Role"
                      variant="outlined"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                {renderField(
                  <>
                    <Typography variant="subtitle2" sx={styles.labelStyles}>
                      User ID
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData?.userId || '-'}
                      placeholder="Enter User ID"
                      variant="outlined"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                {renderField(
                  <>
                    <Typography variant="subtitle2" sx={styles.labelStyles}>
                      Region Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData?.regionName || '-'}
                      placeholder="Enter Region Name"
                      variant="outlined"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                {renderField(
                  <>
                    <Typography variant="subtitle2" sx={styles.labelStyles}>
                      Branch Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData?.branchName || '-'}
                      placeholder="Enter Branch Name"
                      variant="outlined"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </>
                )}
              </Grid>
            </Grid>

            {/* User Details Accordion */}
            <Accordion defaultExpanded sx={styles.accordionStyles}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>User Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Citizenship <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.citizenship || '-'}
                          placeholder="Enter Citizenship"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          CKYC Number <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.ckycNumber || '-'}
                          placeholder="Enter CKYC Number"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Title <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          value={formData?.title || '-'}
                          placeholder="Enter Title"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        >
                          <MenuItem value="Mr.">Mr.</MenuItem>
                          <MenuItem value="Mrs.">Mrs.</MenuItem>
                          <MenuItem value="Ms.">Ms.</MenuItem>
                        </TextField>
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          First Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.firstName || '-'}
                          placeholder="Enter First Name"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Middle Name
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.middleName || '-'}
                          placeholder="Enter Middle Name"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Last Name
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.lastName || '-'}
                          placeholder="Enter Last Name"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Gender <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          value={formData?.gender || '-'}
                          placeholder="Enter Gender"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Date of Birth <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          disabled
                          value={formData?.dob || '-'}
                          placeholder="Enter Date of Birth"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Designation <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.designation || '-'}
                          placeholder="Enter Designation"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Employee Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.employeeId || '-'}
                          placeholder="Enter Employee Code"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Email <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.emailAddress || '-'}
                          placeholder="Enter Email"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Country Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.countryCode || '-'}
                          placeholder="Enter Country Code"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Mobile Number <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.mobileNumber || '-'}
                          placeholder="Enter Mobile Number"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Proof of Identity{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.poi || '-'}
                          placeholder="Enter Proof of Identity"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Proof of Identity Number{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.poiNumber || '-'}
                          placeholder="Enter Proof of Identity Number"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* User Address Details Accordion */}
            <Accordion defaultExpanded sx={styles.accordionStyles}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>User Address Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 1 <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.addressLine1 || '-'}
                          placeholder="Enter Address Line 1"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 2
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.addressLine2 || '-'}
                          placeholder="Enter Address Line 2"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 3
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.addressLine3 || '-'}
                          placeholder="Enter Address Line 3"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Country <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          value={getCountryName(formData?.country) || '-'}
                          placeholder="Enter Country"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          State / UT{' '}
                          {(formData?.country === 'IN' ||
                            formData?.country === 'India' ||
                            !formData?.country) && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.stateUT || '-'}
                          placeholder="Enter State / UT"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          District{' '}
                          {(formData?.country === 'IN' ||
                            formData?.country === 'India' ||
                            !formData?.country) && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.district || '-'}
                          placeholder="Enter District"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          City/Town{' '}
                          {(formData?.country === 'IN' ||
                            formData?.country === 'India' ||
                            !formData?.country) && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.cityTown || '-'}
                          placeholder="Enter City/Town"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Pin Code{' '}
                          {(formData?.country === 'IN' ||
                            formData?.country === 'India' ||
                            !formData?.country) && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData?.pinCode || '-'}
                          placeholder="Enter Pin Code"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  {/* If Pin Code is OTHER/000000 show Pin Code (in case of others), otherwise show Digipin in 3rd column */}
                  {formData?.pinCode &&
                  (formData.pinCode.toString().trim() === '000000' ||
                    formData.pinCode.toString().trim().toLowerCase() ===
                      'other') ? (
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      {renderField(
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={styles.labelStyles}
                          >
                            Pin Code (in case of others)
                          </Typography>
                          <TextField
                            fullWidth
                            value={formData?.pinCodeOther || '-'}
                            placeholder="Enter Pin Code (in case of others)"
                            variant="outlined"
                            size="small"
                            sx={styles.textFieldStyles}
                            disabled
                          />
                        </>
                      )}
                    </Grid>
                  ) : (
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      {renderField(
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={styles.labelStyles}
                          >
                            Digipin
                          </Typography>
                          <TextField
                            fullWidth
                            value={formData?.digipin || '-'}
                            placeholder="Enter Digipin"
                            variant="outlined"
                            size="small"
                            sx={styles.textFieldStyles}
                            disabled
                          />
                        </>
                      )}
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <styles.ActionButtonsContainer>
          <ActionButtons
            onApprove={handleApprove}
            onReject={handleRejectClick}
          />
        </styles.ActionButtonsContainer>
      </styles.FormContainer>

      <DecisionModal
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        listBefore={modalState.listBefore}
        listAfter={modalState.listAfter}
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
      />

      <RejectConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectConfirm}
        title="Are you sure you want to reject user de-activation request?"
        remarkLabel="Remark"
        remarkPlaceholder="Type your Remark here"
        cancelLabel="Cancel"
        submitLabel="Submit"
      />
    </LocalizationProvider>
  );
};

export default UserDeactivationRequest;
