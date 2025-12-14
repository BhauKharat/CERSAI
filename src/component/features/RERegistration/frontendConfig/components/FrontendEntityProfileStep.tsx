// New Entity Profile Step using Frontend Configuration
// This is a parallel implementation that uses frontend config instead of API calls

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, CircularProgress } from '@mui/material';
import DynamicForm from '../../DynamicForm';
import {
  submitEntityProfile,
  selectSubmissionLoading,
  selectSubmissionError,
  resetSubmissionState,
} from '../../slice/entityProfileSubmissionSlice';
import {
  fetchStepData,
  fetchDocument,
  selectStepDataLoading,
  selectStepData,
  selectStepDocuments,
  selectFetchedDocuments,
  clearStepData,
} from '../../slice/stepDataSlice';
import { updateFormValue, setFieldsFromConfig } from '../../slice/formSlice';
import { RootState } from '../../../../../redux/store';
import type { AppDispatch } from '../../../../../redux/store';
import { FieldErrorProvider } from '../../context/FieldErrorContext';
import { EntityProfileSubmissionError } from '../../types/entityProfileSubmissionTypes';
import { useFrontendFormConfig } from '../utils/useFrontendFormConfig';
import { entityProfileConfig } from '../configs/entityProfileConfig';
import { FormField } from '../../types/formTypes';

interface FrontendEntityProfileStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

const FrontendEntityProfileStep: React.FC<FrontendEntityProfileStepProps> = ({
  onSave,
  onNext,
  onValidationChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Use frontend form configuration
  const { fields, configuration, loading: configLoading, error: configError } =
    useFrontendFormConfig(entityProfileConfig);

  // Redux selectors
  const submissionLoading = useSelector(selectSubmissionLoading);
  const submissionError = useSelector(selectSubmissionError);

  // Clear submission errors on component mount
  useEffect(() => {
    dispatch(resetSubmissionState());
  }, [dispatch]);

  // Step data selectors
  const stepDataLoading = useSelector(selectStepDataLoading);
  const stepData = useSelector(selectStepData);
  const stepDocumentsFromStore = useSelector(selectStepDocuments);
  const stepDocuments = useMemo(
    () => stepDocumentsFromStore || [],
    [stepDocumentsFromStore]
  );
  const fetchedDocuments = useSelector(selectFetchedDocuments);

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );

  // Update Redux form slice with frontend config fields
  useEffect(() => {
    if (fields && fields.length > 0 && !configLoading && configuration) {
      // Dispatch action to set fields in Redux
      dispatch(
        setFieldsFromConfig({
          fields: fields as FormField[],
          configuration: configuration as any,
        })
      );
      console.log('Frontend config fields loaded:', fields.length);
    }
  }, [fields, configLoading, configuration, dispatch]);

  // Fetch step data after form fields are loaded
  const stepDataFetched = useRef(false);
  useEffect(() => {
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    const testWorkflowId =
      currentWorkflowId || '19c166c7-aecd-4d0f-93cf-0ff9fa07caf7';
    const testUserId = userId || 'NO_6149';

    if (
      testWorkflowId &&
      testUserId &&
      fields &&
      fields.length > 0 &&
      !configLoading &&
      !stepDataFetched.current &&
      !stepDataLoading
    ) {
      stepDataFetched.current = true;
      dispatch(
        fetchStepData({
          stepKey: 'entityDetails',
          workflowId: testWorkflowId,
          userId: testUserId,
        })
      );
    }
  }, [
    dispatch,
    authWorkflowId,
    userDetails,
    fields,
    configLoading,
    stepDataLoading,
  ]);

  // Reset the fetch flag when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearStepData());
      stepDataFetched.current = false;
    };
  }, [dispatch, authWorkflowId, userDetails?.userId]);

  // Populate form fields when step data is loaded
  useEffect(() => {
    if (stepData && stepData.data && Object.keys(stepData.data).length > 0) {
      Object.entries(stepData.data).forEach(([fieldName, fieldValue]) => {
        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          const stringValue =
            typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
          dispatch(updateFormValue({ fieldName, value: stringValue }));
        }
      });
    }
  }, [dispatch, stepData, stepDocuments]);

  // Fetch documents when step documents are available
  useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0) {
      stepDocuments.forEach((doc) => {
        if (!fetchedDocuments || !fetchedDocuments[doc.id]) {
          dispatch(fetchDocument(doc.id));
        }
      });
    }
  }, [dispatch, stepDocuments, fetchedDocuments]);

  // Create document field mapping
  const documentFieldMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    if (stepDocuments && stepDocuments.length > 0) {
      stepDocuments.forEach((doc) => {
        mapping[doc.fieldKey] = doc.id;
      });
    }
    return mapping;
  }, [stepDocuments]);

  // Handle form save
  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      const processedData = { ...formData };
      const constitution = String(processedData.constitution || '');
      const isSoleProprietorship = constitution === 'A'; // 'A' is Sole Proprietorship code

      if (!isSoleProprietorship) {
        delete processedData.proprietorName;
      }

      const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
      const userId = userDetails?.userId || userDetails?.id;

      if (!currentWorkflowId || !userId) {
        alert('Missing workflow ID or user ID. Please try logging in again.');
        return;
      }

      try {
        dispatch(resetSubmissionState());

        const result = await dispatch(
          submitEntityProfile({
            formValues: processedData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: (fields || []) as FormField[],
            stepDocuments: stepDocuments || [],
          })
        ).unwrap();

        if (onSave) {
          onSave(formData);
        }

        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Entity profile submission failed:', error);
      }
    },
    [
      dispatch,
      userDetails,
      authWorkflowId,
      fields,
      stepDocuments,
      onSave,
      onNext,
    ]
  );

  // Extract field errors
  const fieldErrors = useMemo(() => {
    if (
      submissionError &&
      typeof submissionError === 'object' &&
      'type' in submissionError &&
      (submissionError as EntityProfileSubmissionError).type ===
        'FIELD_VALIDATION_ERROR'
    ) {
      const rawFieldErrors =
        (submissionError as EntityProfileSubmissionError).fieldErrors || {};
      const mappedFieldErrors: Record<string, string> = {};

      Object.entries(rawFieldErrors).forEach(([fieldName, errorMessage]) => {
        const field = fields?.find((f) => f.fieldName === fieldName);
        if (
          field &&
          (field.fieldType === 'file' ||
            field.fieldType === 'textfield_with_image')
        ) {
          if (field.fieldType === 'textfield_with_image') {
            const fileFieldName =
              field.fieldFileName || `${field.fieldName}_file`;
            mappedFieldErrors[fileFieldName] = errorMessage;
          } else {
            mappedFieldErrors[fieldName] = errorMessage;
          }
        } else {
          mappedFieldErrors[fieldName] = errorMessage;
        }
      });

      return mappedFieldErrors;
    }
    return {};
  }, [submissionError, fields]);

  // Get general error message
  const generalErrorMessage = useMemo(() => {
    if (!submissionError) return null;
    if (typeof submissionError === 'string') {
      return submissionError;
    }
    if (typeof submissionError === 'object' && 'message' in submissionError) {
      const errorObj = submissionError as EntityProfileSubmissionError;
      if (errorObj.type !== 'FIELD_VALIDATION_ERROR') {
        return errorObj.message;
      }
    }
    return null;
  }, [submissionError]);

  useEffect(() => {
    if (generalErrorMessage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [generalErrorMessage]);

  // Show loading state
  if (configLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  // Show config error
  if (configError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading form configuration: {configError}
      </Alert>
    );
  }

  // Show error if no fields loaded
  if (!fields || fields.length === 0) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No form fields available. Please check the configuration.
      </Alert>
    );
  }

  return (
    <>
      {generalErrorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalErrorMessage}
        </Alert>
      )}

      <FieldErrorProvider fieldErrors={fieldErrors}>
        <DynamicForm
          onSave={handleSave}
          urlDynamic="entity_profile"
          existingDocuments={fetchedDocuments}
          documentFieldMapping={documentFieldMapping}
          loading={submissionLoading}
          hasStepData={
            !!(
              stepData &&
              stepData.data &&
              Object.keys(stepData.data).length > 0
            )
          }
          onValidationChange={onValidationChange}
        />
      </FieldErrorProvider>
    </>
  );
};

export default FrontendEntityProfileStep;

