/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-irregular-whitespace */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  reinitializeApplication,
  setModifiableFields,
} from '../../redux/slices/registerSlice/authSlice';
import { AppDispatch, RootState } from '@redux/store';
import { fetchApplicationPreview } from '../../redux/slices/registerSlice/applicationPreviewSlice';
import {
  setCompletedSteps,
  setCurrentStep,
} from '../../redux/slices/registerSlice/applicationSlice';
import {
  fetchDropdownMasters,
  fetchGeographyHierarchy,
} from '../../redux/slices/registerSlice/masterSlice';

const pendingSectionToRouteMap: Record<string, string> = {
  REPORTING_ENTITY_DETAILS: '/re-register',
  ADDRESS_DETAILS: '/re-address-details',
  HEAD_OFFICE_DETAILS: '/re-institution-details',
  NODAL_OFFICER_DETAILS: '/re-nodal-officer-details',
  INSTITUTIONAL_ADMIN_DETAILS: '/re-institutional-admin-details',
};

const steps = [
  { label: 'REPORTING_ENTITY_DETAILS', route: '/re-register' },
  { label: 'ADDRESS_DETAILS', route: '/re-address-details' },
  { label: 'HEAD_OFFICE_DETAILS', route: '/re-institution-details' },
  { label: 'NODAL_OFFICER_DETAILS', route: '/re-nodal-officer-details' },
  {
    label: 'INSTITUTIONAL_ADMIN_DETAILS',
    route: '/re-institutional-admin-details',
  },
  { label: 'Form Preview', route: '/re-form-preview' },
];

const modifiableSectionToRouteMap: Record<string, string> = {
  entityDetails: '/re-register',
  addressDetails: '/re-address-details',
  headOfInstitutionDetails: '/re-institution-details',
  nodalOfficerDetails: '/re-nodal-officer-details',
  institutionAdminDetails: '/re-institutional-admin-details',
};

export const ReinitializeGuard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const hasInitializedOnce = useRef(false);
  const [initError, setInitError] = useState(false);
  const allowedStepPaths = steps.map((step: { route: any }) => step.route);
  const { initialized, reinitializeData, reinitializeLoading, authToken } =
    useSelector((state: RootState) => state.auth);

  const isAuthenticated = authToken;

  // Only dispatch reinitialize if we have a token and haven't initialized
  useEffect(() => {
    if (!initialized && isAuthenticated && !initError) {
      console.log('Dispatching reinitializeApplication');
      dispatch(reinitializeApplication())
        .unwrap()
        .catch((error) => {
          console.error('Reinitialize failed:', error);
          setInitError(true);
          // Don't redirect here, let the interceptor handle it
        });
    }
  }, [initialized, dispatch, isAuthenticated, initError]);

  // Fetch master data separately - this should use a different API endpoint
  useEffect(() => {
    if (isAuthenticated) {
      // Only fetch if we have auth token
      try {
        dispatch(fetchDropdownMasters());
        dispatch(fetchGeographyHierarchy());
      } catch (error) {
        console.error('Master data fetch failed:', error);
      }
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (initialized && !reinitializeLoading && !hasInitializedOnce.current) {
      hasInitializedOnce.current = true;

      const status = reinitializeData?.approvalStatus;
      const modifiableFields = reinitializeData?.modifiableFields || {};
      const pending = reinitializeData?.pendingSections ?? [];

      console.log('Reinitialize Data:', {
        status,
        pending,
        existingDraft: reinitializeData?.existingDraft,
      });

      // Store modifiableFields into Redux
      dispatch(setModifiableFields(modifiableFields));

      // Handle stepper state and preview fetching if draft exists
      if (reinitializeData?.existingDraft) {
        const sectionToStepMap: Record<string, number> = {
          REPORTING_ENTITY_DETAILS: 0,
          ADDRESS_DETAILS: 1,
          HEAD_OFFICE_DETAILS: 2,
          NODAL_OFFICER_DETAILS: 3,
          INSTITUTIONAL_ADMIN_DETAILS: 4,
        };

        // Check if pending sections contain only submission-related sections
        const submissionSections = [
          'APPLICATION_PDF',
          'APPLICATION_ESIGN',
          'APPLICATION_SUBMITTED',
        ];
        const hasOnlySubmissionSections =
          pending.length > 0 &&
          pending.every((section) => submissionSections.includes(section));

        if (hasOnlySubmissionSections) {
          // If only submission sections are pending, user is on form preview
          // Mark all form steps (0-4) as completed, set current step to 5 (Form Preview)
          console.log(
            'Setting stepper for form preview - all form steps completed'
          );
          const completedSteps = [0, 1, 2, 3, 4];
          dispatch(setCompletedSteps(completedSteps));
          dispatch(setCurrentStep(5));
        } else if (pending.length > 0 && pending.length <= 7) {
          // Regular pending sections logic
          const firstPending = pending[0];
          const currentStep = sectionToStepMap[firstPending] ?? 0;

          const completedSteps = Object.entries(sectionToStepMap)
            .filter(
              ([key, index]) => !pending.includes(key) && index < currentStep
            )
            .map(([, index]) => index);

          console.log('Setting stepper for pending sections:', {
            firstPending,
            currentStep,
            completedSteps,
          });

          dispatch(setCompletedSteps(completedSteps));
          dispatch(setCurrentStep(currentStep));
        } else if (pending.length === 0) {
          // All sections completed including submission
          console.log(
            'All sections completed - setting all steps as completed'
          );
          const completedSteps = [0, 1, 2, 3, 4, 5];
          dispatch(setCompletedSteps(completedSteps));
          dispatch(setCurrentStep(5)); // Set to form preview step
        }

        // Fetch preview data
        try {
          dispatch(fetchApplicationPreview());
        } catch (error) {
          console.error('Preview fetch failed:', error);
        }
      }

      // Check if this is coming from a fresh login
      const isFromLogin = sessionStorage.getItem('fromLogin') === 'true';

      if (isFromLogin) {
        // Clear the flag since we've used it
        sessionStorage.removeItem('fromLogin');
        console.log('Processing fresh login - running navigation logic');
      } else {
        // This is a page reload or direct navigation - skip auto-redirection
        console.log(
          'Detected page reload/direct navigation - skipping auto-redirect'
        );
        return;
      }

      // Navigation logic
      if (status === 'REQUEST_FOR_MODIFICATION') {
        const modifiableKeys = Object.keys(modifiableFields);
        for (const sectionKey of modifiableKeys) {
          const nextRoute = modifiableSectionToRouteMap[sectionKey];
          if (nextRoute) {
            console.log('Navigating for modification:', sectionKey, nextRoute);
            navigate(nextRoute, { replace: true });
            return;
          }
        }
      }

      // Check if pending sections contain only submission-related sections
      const submissionSections = [
        'APPLICATION_PDF',
        'APPLICATION_ESIGN',
        'APPLICATION_SUBMITTED',
      ];
      const hasOnlySubmissionSections =
        pending.length > 0 &&
        pending.every((section) => submissionSections.includes(section));

      if (hasOnlySubmissionSections) {
        console.log(
          'Navigating to form preview - pending sections are submission related:',
          pending
        );
        // Update stepper to show all form steps as completed
        dispatch(setCompletedSteps([0, 1, 2, 3, 4]));
        dispatch(setCurrentStep(5));
        navigate('/re-form-preview', { replace: true });
        return;
      } else if (pending.length > 0) {
        console.log('Pending sections:', pending);
        console.log(
          'First pending route:',
          pendingSectionToRouteMap[pending[0]]
        );
        console.log('Current path before redirect:', location.pathname);
        const nextRoute = pendingSectionToRouteMap[pending[0]];
        if (nextRoute && location.pathname !== nextRoute) {
          console.log('Redirecting because pending section is first in list');
          navigate(nextRoute, { replace: true });
          return;
        }
      } else if (pending.length === 0 && status === 'DRAFT') {
        // All form steps completed, on form preview
        console.log(
          'No pending sections, status DRAFT - navigating to form preview'
        );
        dispatch(setCompletedSteps([0, 1, 2, 3, 4]));
        dispatch(setCurrentStep(5));
        navigate('/re-form-preview', { replace: true });
      } else if (
        pending.length === 0 &&
        (status === 'READY_FOR_SUBMISSION' ||
          status === 'SUBMITTED_PENDING_APPROVAL')
      ) {
        // All steps completed including form preview
        console.log(
          'No pending sections, status ready/submitted - navigating to form preview'
        );
        dispatch(setCompletedSteps([0, 1, 2, 3, 4, 5]));
        dispatch(setCurrentStep(5));
        navigate('/re-form-preview', { replace: true });
      }
      // else if (pending.length === 0 && status === 'APPROVED') {
      //   console.log('Application approved - navigating to KYC search');
      //   navigate('/re/kyc/search');
      // }
    }
  }, [
    initialized,
    reinitializeData,
    reinitializeLoading,
    navigate,
    location.pathname,
    dispatch,
  ]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            Session expired. Please log in again.
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loader
  if (!initialized || reinitializeLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return <Outlet />;
};
