// import React, {
//   useEffect,
//   useState,
//   useMemo,
//   useCallback,
//   Component,
//   ErrorInfo,
// } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Box, Alert, CircularProgress } from '@mui/material';
// import type { AppDispatch, RootState } from '../../../../redux/store';
// import DynamicExpandCollapseForm from '../DynamicExpandCollapseForm';
// import {
//   buildValidationSchema,
//   FormField as ValidationFormField,
// } from '../../../../utils/formValidation';
// import {
//   fetchAdminUserDetailsFields,
//   fetchAdminUserDropdownOptions,
//   updateFormValue,
//   setFieldError,
//   clearFieldError,
//   clearForm,
//   copySectionValues,
//   clearSectionValues,
//   selectAdminUserDetailsGroupedFields,
//   selectAdminUserDetailsConfiguration,
//   selectAdminUserDetailsFormValues,
//   selectAdminUserDetailsLoading,
//   selectAdminUserDetailsError,
// } from '../slice/adminUserDetailsSlice';
// import type { AdminUserFormField } from '../types/adminUserDetailsTypes';
// import {
//   submitAdminUserDetails,
//   selectAdminUserSubmissionLoading,
//   selectAdminUserSubmissionError,
//   resetSubmissionState,
// } from '../slice/adminUserDetailsSubmissionSlice';
// import {
//   fetchStepData,
//   fetchDocument,
//   selectStepDataLoading,
//   selectStepData,
//   selectStepDocuments,
//   selectFetchedDocuments,
// } from '../slice/stepDataSlice';
// import { FieldErrorProvider } from '../context/FieldErrorContext';
// import { AdminUserDetailsSubmissionError } from '../types/adminUserDetailsSubmissionTypes';
// import { FormField } from '../types/formTypes';

// // Simple Error Boundary for catching render errors
// class FormErrorBoundary extends Component<
//   { children: React.ReactNode },
//   { hasError: boolean; error: Error | null }
// > {
//   constructor(props: { children: React.ReactNode }) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }

//   static getDerivedStateFromError(error: Error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//     console.error('Admin user details form rendering error:', error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           Admin user details form rendering error:{' '}
//           {this.state.error?.message || 'Unknown error'}
//           <br />
//           Please refresh the page and try again.
//         </Alert>
//       );
//     }

//     return this.props.children;
//   }
// }

// // Type adapter function to convert AdminUserFormField to ValidationFormField
// const convertToValidationFormField = (
//   field: AdminUserFormField
// ): ValidationFormField => {
//   return {
//     id: field.id,
//     fieldName: field.fieldName,
//     fieldType: field.fieldType,
//     fieldLabel: field.fieldLabel,
//     validationRules: field.validationRules,
//     conditionalLogic:
//       field.conditionalLogic?.map((logic) => ({
//         when: {
//           field: logic.when.field,
//           operator: logic.when.operator,
//           value: logic.when.value
//             ? Array.isArray(logic.when.value)
//               ? logic.when.value
//               : [logic.when.value]
//             : null,
//         },
//         then: logic.then
//           ? { validationRules: logic.then.validationRules }
//           : undefined,
//         fieldAttributes: logic.fieldAttributes,
//       })) || null,
//   };
// };

// interface AdminUserDetailsStepProps {
//   onSave?: (formData: Record<string, unknown>) => void;
//   onNext?: () => void;
//   onPrevious?: () => void;
//   url?: string;
// }

// const AdminUserDetailsStep: React.FC<AdminUserDetailsStepProps> = ({
//   onSave,
//   onNext,
//   onPrevious,
// }) => {
//   const dispatch = useDispatch<AppDispatch>();

//   // Redux selectors
//   const groupedFields = useSelector((state: RootState) =>
//     selectAdminUserDetailsGroupedFields(state)
//   );
//   const configuration = useSelector((state: RootState) =>
//     selectAdminUserDetailsConfiguration(state)
//   );
//   const formValues = useSelector((state: RootState) =>
//     selectAdminUserDetailsFormValues(state)
//   );
//   const loading = useSelector((state: RootState) =>
//     selectAdminUserDetailsLoading(state)
//   );
//   const error = useSelector((state: RootState) =>
//     selectAdminUserDetailsError(state)
//   );
//   const submissionLoading = useSelector((state: RootState) =>
//     selectAdminUserSubmissionLoading(state)
//   );
//   const submissionError = useSelector((state: RootState) =>
//     selectAdminUserSubmissionError(state)
//   );
//   const stepDataLoading = useSelector((state: RootState) =>
//     selectStepDataLoading(state)
//   );
//   const stepData = useSelector((state: RootState) => selectStepData(state));
//   const stepDocuments = useSelector((state: RootState) =>
//     selectStepDocuments(state)
//   );
//   const fetchedDocuments = useSelector((state: RootState) =>
//     selectFetchedDocuments(state)
//   );

//   // Add a ref to track if step data has been fetched
//   const stepDataFetched = React.useRef(false);

//   // Get user details from auth state
//   const userDetails = useSelector((state: RootState) => state.auth.userDetails);
//   const authWorkflowId = useSelector(
//     (state: RootState) => state.auth.workflowId
//   );

//   // Local state for validation
//   const [validationErrors, setValidationErrors] = useState<
//     Record<string, string>
//   >({});
//   const [clearKey, setClearKey] = useState<number>(0);

//   // Create validation schema from fields
//   const validationSchema = useMemo(() => {
//     if (!groupedFields || Object.keys(groupedFields).length === 0) {
//       return null;
//     }

//     // Flatten all fields from all groups and convert to ValidationFormField
//     const allFields = Object.values(groupedFields).flatMap(
//       (group) => group.fields
//     );
//     const convertedFields = allFields.map(convertToValidationFormField);
//     return buildValidationSchema(convertedFields);
//   }, [groupedFields]);

//   // Create flattened fields array for dependent dropdown support
//   const flattenedFields = useMemo(() => {
//     if (!groupedFields) return [];
//     return Object.values(groupedFields).flatMap((group) => group.fields);
//   }, [groupedFields]);

//   // Fetch admin user details fields on component mount
//   useEffect(() => {
//     dispatch(fetchAdminUserDetailsFields());
//   }, [dispatch]);

//   // Fetch step data when form fields are available
//   React.useEffect(() => {
//     // Try multiple sources for workflowId and userId
//     const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
//     const userId = userDetails?.userId || userDetails?.id;

//     // Fallback test values (same as other steps)
//     const testWorkflowId = currentWorkflowId;
//     const testUserId = userId;

//     // Only fetch step data if form fields are available (fields API has completed)
//     // Add check to prevent multiple API calls
//     if (
//       testWorkflowId &&
//       testUserId &&
//       flattenedFields &&
//       flattenedFields.length > 0 &&
//       !loading &&
//       !stepDataFetched.current &&
//       !stepDataLoading
//     ) {
//       stepDataFetched.current = true; // Mark as fetched to prevent loops

//       dispatch(
//         fetchStepData({
//           stepKey: 'institutionalAdminUser',
//           workflowId: testWorkflowId,
//           userId: testUserId,
//         })
//       );
//     }
//   }, [
//     dispatch,
//     authWorkflowId,
//     userDetails,
//     flattenedFields,
//     loading,
//     error,
//     stepDataLoading,
//   ]);

//   // Reset the fetch flag when component unmounts or key dependencies change
//   React.useEffect(() => {
//     return () => {
//       stepDataFetched.current = false;
//     };
//   }, [authWorkflowId, userDetails?.userId]);

//   // Populate form fields when step data is loaded
//   React.useEffect(() => {
//     if (stepData && stepData.data && Object.keys(stepData.data).length > 0) {
//       console.log(
//         'Populating admin user details form fields with step data:',
//         stepData.data
//       );

//       // Populate each field from step data
//       Object.entries(stepData.data).forEach(([fieldName, fieldValue]) => {
//         if (
//           fieldValue !== null &&
//           fieldValue !== undefined &&
//           fieldValue !== ''
//         ) {
//           console.log(`Setting admin field ${fieldName} = ${fieldValue}`);
//           // Convert value to string for form compatibility
//           const stringValue =
//             typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
//           dispatch(updateFormValue({ fieldName, value: stringValue }));
//         }
//       });

//       // Log documents if available
//       if (stepDocuments && stepDocuments.length > 0) {
//         console.log('Available admin user documents:', stepDocuments);
//       }
//     }
//   }, [dispatch, stepData, stepDocuments]);

//   // Fetch documents when step documents are available
//   React.useEffect(() => {
//     if (stepDocuments && stepDocuments.length > 0) {
//       console.log('Fetching documents for admin user step data:', stepDocuments);
//       console.log('Current fetched documents:', fetchedDocuments);

//       stepDocuments.forEach((doc) => {
//         // Only fetch if not already fetched (handle undefined fetchedDocuments)
//         if (!fetchedDocuments || !fetchedDocuments[doc.id]) {
//           console.log(`🔄 Fetching admin user document: ${doc.id} (${doc.type})`);
//           dispatch(fetchDocument(doc.id));
//         } else {
//           console.log(`✅ Admin user document already fetched: ${doc.id}`);
//         }
//       });
//     }
//   }, [dispatch, stepDocuments, fetchedDocuments]);

//   // Handle form save with API submission
//   const handleSave = useCallback(
//     async (formData: Record<string, unknown>) => {
//       // Try multiple sources for workflowId and userId
//       const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
//       const userId = userDetails?.userId || userDetails?.id;

//       if (!currentWorkflowId || !userId) {
//         console.error('Missing required data for admin user details submission:', {
//           workflowId: currentWorkflowId,
//           userId,
//           userDetails,
//         });
//         alert('Missing workflow ID or user ID. Please try logging in again.');
//         return;
//       }

//       try {
//         // Reset previous submission state
//         dispatch(resetSubmissionState());

//         // Submit admin user details
//         const result = await dispatch(
//           submitAdminUserDetails({
//             formValues: formData as Record<string, string | File | null>,
//             workflowId: currentWorkflowId,
//             userId,
//             formFields: (flattenedFields || []) as FormField[],
//           })
//         ).unwrap();

//         console.log('✅ Admin user details submission successful:', result);

//         // Call original onSave callback if provided
//         if (onSave) {
//           onSave(formData);
//         }

//         // Move to next step if provided
//         if (onNext) {
//           onNext();
//         }
//       } catch (error) {
//         console.error('Admin user details submission failed:', error);
//         // Error is already handled by Redux slice
//         // Additional safety: ensure error doesn't propagate as object
//         if (error && typeof error === 'object') {
//           console.error(
//             'Admin user details error object details:',
//             JSON.stringify(error, null, 2)
//           );
//         }
//       }
//     },
//     [dispatch, userDetails, authWorkflowId, flattenedFields, onSave, onNext]
//   );

//   // Handle section validation
//   const handleValidateSection = (sectionName: string, sectionIndex: number) => {
//     console.log(`Validating section: ${sectionName}, Admin ${sectionIndex}`);

//     if (!validationSchema || !groupedFields) {
//       console.warn('Validation schema or grouped fields not available');
//       return;
//     }

//     // Get fields for this specific section
//     const sectionGroup = groupedFields[sectionName];
//     const sectionFields = sectionGroup?.fields || [];

//     // Clear existing validation errors for this section
//     const currentErrors = Object.entries(validationErrors);
//     const filteredErrors: Record<string, string> = {};

//     currentErrors.forEach(([field, message]) => {
//       if (!field.startsWith(sectionName)) {
//         filteredErrors[field] = message;
//       }
//     });

//     setValidationErrors(filteredErrors);

//     // Validate each field in the section
//     const sectionErrors: Record<string, string> = {};

//     sectionFields.forEach((field) => {
//       const fieldValue = formValues[field.fieldName];

//       // Check if field is required and empty
//       if (
//         field.validationRules?.required &&
//         (!fieldValue || fieldValue === '')
//       ) {
//         sectionErrors[field.fieldName] =
//           field.validationRules.requiredMessage ||
//           `${field.fieldLabel} is required`;
//       }

//       // Additional validation based on field name (for email fields)
//       if (fieldValue && field.fieldName.toLowerCase().includes('email')) {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(fieldValue as string)) {
//           sectionErrors[field.fieldName] =
//             `${field.fieldLabel} must be a valid email`;
//         }
//       }

//       // Check regex validation if provided
//       if (fieldValue && field.validationRules?.regx) {
//         const regex = new RegExp(field.validationRules.regx);
//         if (!regex.test(fieldValue as string)) {
//           sectionErrors[field.fieldName] =
//             field.validationRules.regxMessage ||
//             `${field.fieldLabel} format is invalid`;
//         }
//       }
//     });

//     // Update validation errors
//     if (Object.keys(sectionErrors).length > 0) {
//       setValidationErrors((prev) => ({ ...prev, ...sectionErrors }));
//       console.log(`Admin ${sectionIndex} validation failed:`, sectionErrors);

//       // Show error message
//       alert(
//         `Admin ${sectionIndex} validation failed. Please check the highlighted fields.`
//       );
//     } else {
//       console.log(`Admin ${sectionIndex} validation passed successfully!`);

//       // Show success message
//       alert(`Admin ${sectionIndex} validation passed successfully!`);
//     }
//   };

//   // Special checkbox handlers for copying admin 1 data to admin 2
//   const specialCheckboxHandlers = {
//     copy_admin1_to_admin2: (checked: boolean) => {
//       dispatch(
//         updateFormValue({ fieldName: 'copy_admin1_to_admin2', value: checked })
//       );

//       if (checked) {
//         // Copy admin 1 values to admin 2
//         dispatch(
//           copySectionValues({
//             fromSection: 'admin1',
//             toSection: 'admin2',
//           })
//         );
//       } else {
//         // Clear admin 2 values
//         dispatch(clearSectionValues('admin2'));
//       }
//     },
//   };

//   // Custom field disabled logic
//   const getFieldDisabled = (field: { fieldGroup?: string }) => {
//     // Disable admin 2 fields if "copy admin 1 to admin 2" is checked
//     if (field.fieldGroup === 'admin2') {
//       return formValues['copy_admin1_to_admin2'] === true;
//     }
//     return false;
//   };

//   // Extract field errors if submission error is a field validation error (must be before conditional returns)
//   const fieldErrors = React.useMemo(() => {
//   if (
//     submissionError &&
//     typeof submissionError === 'object' &&
//     'type' in submissionError &&
//     (submissionError as AdminUserDetailsSubmissionError).type ===
//       'FIELD_VALIDATION_ERROR'
//   ) {
//     return (
//       (submissionError as AdminUserDetailsSubmissionError).fieldErrors || {}
//     );
//   }
//   return {};
// }, [submissionError]);

//   // Get general error message (non-field specific)
//   const generalErrorMessage = React.useMemo(() => {
//   if (!submissionError) return null;

//   if (typeof submissionError === 'string') {
//     return submissionError;
//   }

//   if (
//     typeof submissionError === 'object' &&
//     'message' in submissionError
//   ) {
//     const errorObj = submissionError as AdminUserDetailsSubmissionError;
//     // Only show general message for non-field validation errors
//     if (errorObj.type !== 'FIELD_VALIDATION_ERROR') {
//       return errorObj.message;
//     }
//   }

//   return null;
// }, [submissionError]);

//   // Show loading state during submission, form data fetching, or step data fetching
//   if (submissionLoading || loading || stepDataLoading) {
//     return (
//     <Box
//       display="flex"
//       flexDirection="column"
//       alignItems="center"
//       justifyContent="center"
//       minHeight="200px"
//       gap={2}
//     >
//       <CircularProgress size={40} />
//       <Box>
//         {loading
//           ? 'Loading admin user details form...'
//           : stepDataLoading
//             ? 'Loading saved admin user data...'
//             : 'Submitting admin user details...'}
//       </Box>
//     </Box>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <Alert severity="error" sx={{ mb: 2 }}>
//         Error loading admin user details: {error}
//       </Alert>
//     );
//   }

//   // Don't render if no configuration is loaded
//   if (
//     !configuration ||
//     !groupedFields ||
//     Object.keys(groupedFields).length === 0
//   ) {
//     return (
//       <Alert severity="warning" sx={{ mb: 2 }}>
//         No admin user details form configuration found.
//       </Alert>
//     );
//   }

//   return (
//     <>
//       {/* Show general error if submission failed (not field-specific) */}
//       {generalErrorMessage && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {generalErrorMessage}
//         </Alert>
//       )}

//       {/* Dynamic Form with Field Error Context */}
//       <FormErrorBoundary>
//         <FieldErrorProvider fieldErrors={fieldErrors}>
//           <DynamicExpandCollapseForm
//             groupedFields={groupedFields}
//             configuration={configuration}
//             formValues={formValues}
//             dispatch={dispatch}
//             fields={flattenedFields}
//             fetchDropdownOptionsAction={fetchAdminUserDropdownOptions}
//             onValidateSection={handleValidateSection}
//             updateFormValue={(payload) => dispatch(updateFormValue(payload))}
//             setFieldError={(payload) => dispatch(setFieldError(payload))}
//             clearFieldError={(field) => dispatch(clearFieldError(field))}
//             clearForm={() => dispatch(clearForm())}
//             copySectionValues={(payload) =>
//               dispatch(copySectionValues(payload))
//             }
//             clearSectionValues={(sectionPrefix) =>
//               dispatch(clearSectionValues(sectionPrefix))
//             }
//             validationSchema={validationSchema}
//             validationErrors={validationErrors}
//             setValidationErrors={setValidationErrors}
//             onSave={handleSave}
//             onNext={onNext}
//             onPrevious={onPrevious}
//             specialCheckboxHandlers={specialCheckboxHandlers}
//             getFieldDisabled={getFieldDisabled}
//             clearKey={clearKey}
//             setClearKey={setClearKey}
//           />
//         </FieldErrorProvider>
//       </FormErrorBoundary>
//     </>
//   );
// };

export default {};
