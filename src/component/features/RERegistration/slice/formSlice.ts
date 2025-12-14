import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { postFormData, Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';
import axios from 'axios';
import {
  FormFieldsResponse,
  FormState,
  FormField,
  FormStep,
  FormValues,
} from '../types/formTypes';

// Initial state
const initialState: FormState = {
  fields: [],
  configuration: null,
  formValues: {},
  fieldErrors: [],
  loading: false,
  error: null,
  currentStep: 0,
  totalSteps: 0,
  dropdownOptions: {},
};

// Async thunk to fetch form fields
export const fetchFormFields = createAsyncThunk(
  'dynamicForm/fetchFormFields',
  async (
    {
      url,
    }: {
      url: string;
    },
    { rejectWithValue }
  ) => {
    try {
      let APICall = '';
      if (url === 'entity_profile') {
        APICall = API_ENDPOINTS.get_form_fields;
      } else if (url === 'head_of_institution') {
        APICall = API_ENDPOINTS.get_head_of_institution_fields;
      } else if (url === 'nodal_officer') {
        APICall = API_ENDPOINTS.get_nodal_officer_fields;
      }
      // Use direct axios call since CMS APIs use different base URL than Secured instance
      const response = await axios.get(APICall);
      return response.data as FormFieldsResponse;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch form fields';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch dropdown options
export const fetchDropdownOptions = createAsyncThunk(
  'dynamicForm/fetchDropdownOptions',
  async (
    {
      url,
      method = 'GET',
      fieldId,
      headers = {},
      payload = null,
    }: {
      url: string;
      method?: string;
      fieldId: number;
      headers?: Record<string, string>;
      payload?: Record<string, unknown> | null;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log(`fetchDropdownOptions called for field ${fieldId}:`, {
        url,
        method,
        headers,
        payload,
      });

      // Check if options are already cached
      // const state = getState() as { dynamicForm: FormState };
      // if (state.dynamicForm.dropdownOptions[fieldId]) {
      //   console.log(`Using cached options for field ${fieldId}:`, state.dynamicForm.dropdownOptions[fieldId]);
      //   return { fieldId, options: state.dynamicForm.dropdownOptions[fieldId], cached: true };
      // }

      let response;
      if (method.toUpperCase() === 'POST') {
        console.log(`Making POST request to ${url} for field ${fieldId}`);
        response = await Secured.post(url, payload, { headers });
      } else {
        console.log(`Making GET request to ${url} for field ${fieldId}`);
        response = await Secured.get(url, { headers });
      }

      console.log(`API response for field ${fieldId}:`, response.data);
      console.log(`Full response object for field ${fieldId}:`, response);
      console.log(
        `Response data type:`,
        typeof response.data,
        Array.isArray(response.data)
      );

      // Try different response paths
      let responseOptions = response.data;
      if (response.data && response.data.data) {
        console.log(
          `Using response.data.data for field ${fieldId}:`,
          response.data.data
        );
        responseOptions = response.data.data;
      }

      return { fieldId, options: responseOptions, cached: false };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to fetch options for field ${fieldId}`;
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to submit entity profile
export const submitEntityProfile = createAsyncThunk(
  'dynamicForm/submitEntityProfile',
  async (
    {
      formData,
      workflowId,
      userId,
      files,
    }: {
      formData: Record<string, unknown>;
      workflowId: string;
      userId: string;
      files: {
        panFile?: File;
        cinFile?: File;
        other?: File;
        addressProof?: File;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('Submitting entity profile with data:', {
        formData,
        workflowId,
        userId,
        files: Object.keys(files),
      });

      // Combine formData and files into a single object
      const allData = { ...formData };
      // Add files from files object to the data
      Object.entries(files).forEach(([key, file]) => {
        if (file instanceof File) {
          allData[key] = file;
        }
      });

      // Use the reusable postFormData function
      const responseData = await postFormData(
        API_ENDPOINTS.submit_entity_profile,
        allData,
        {
          additionalFields: {
            workflowId: workflowId,
            userId: userId,
          },
          cleanMetadata: true,
          metadataKey: 'metadata',
        }
      );

      console.log('Entity profile submission response:', responseData);
      return responseData;
    } catch (error: unknown) {
      console.error('Entity profile submission error:', error);

      // Handle structured API errors
      if (
        error &&
        typeof error === 'object' &&
        'type' in error &&
        'status' in error &&
        'code' in error
      ) {
        const apiError = error as {
          type: string;
          status: number;
          code: string;
          message?: string;
          errors?: Array<{ field: string; message: string }>;
        };

        const structuredError = {
          status: apiError.status,
          code: apiError.code,
          type: apiError.type,
          message: apiError.message || 'API Error',
          errors: apiError.errors || [],
        };

        console.log(
          'Returning structured error for UI handling:',
          structuredError
        );
        return rejectWithValue(structuredError);
      }

      // Handle generic errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit entity profile';
      return rejectWithValue(errorMessage);
    }
  }
);

// Helper function to group fields into steps (9 fields per step - 3 rows of 3 fields each)
const groupFieldsIntoSteps = (fields: FormField[]): FormStep[] => {
  const steps: FormStep[] = [];
  const fieldsPerStep = 9; // Show 9 fields per step (3 rows of 3 fields)

  for (let i = 0; i < fields.length; i += fieldsPerStep) {
    const stepFields = fields.slice(i, i + fieldsPerStep);
    steps.push({
      stepNumber: Math.floor(i / fieldsPerStep) + 1,
      fields: stepFields,
      title: `Step ${Math.floor(i / fieldsPerStep) + 1}`,
    });
  }

  return steps;
};

// Helper function to validate field
export const validateField = (
  field: FormField,
  value: string | File | null,
  formValues: FormValues
): string | null => {
  const rules = field.validationRules;
  if (!rules) return null;

  // Required validation
  if (
    rules.required &&
    (!value || (typeof value === 'string' && value.trim() === ''))
  ) {
    return rules.requiredMessage || `${field.fieldLabel} is required`;
  }

  // String validations
  if (typeof value === 'string' && value) {
    // Max length validation
    if (rules.maxLength && value.length > parseInt(rules.maxLength)) {
      return (
        rules.maxLengthMessage ||
        `${field.fieldLabel} cannot exceed ${rules.maxLength} characters`
      );
    }

    // Min length validation
    if (rules.minLength && value.length < parseInt(rules.minLength)) {
      return (
        rules.minLengthMessage ||
        `${field.fieldLabel} must be at least ${rules.minLength} characters`
      );
    }
    let regx = rules.regx;
    let regxMessage = rules.regxMessage;
    if (field.fieldFileName === 'panFile') {
      let constitution: string = formValues?.constitution as string;
      if (constitution) {
        constitution = constitution.toUpperCase();
      }

      switch (constitution) {
        case 'INDIVIDUAL':
          regx = '^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAAPA9999A';
          break;
        case 'PARTNERSHIP FIRM':
          regx = '^[A-Z]{3}F[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAAFA9999A';
          break;
        case 'COMPANY':
          regx = '^[A-Z]{3}C[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAACA9999A';
          break;
        case 'CENTRAL/STATE GOVT DEPT OR AGENCY':
          regx = '^[A-Z]{3}G[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAAGA9999A';
          break;
        case 'HUF':
          regx = '^[A-Z]{3}H[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAAHA9999A';
          break;
        case 'LOCAL AUTHORITY':
          regx = '^[A-Z]{3}L[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAALA9999A';
          break;
        case 'ARTIFICIAL JURIDICAL PERSON':
          regx = '^[A-Z]{3}J[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAAJA9999A';
          break;
        case 'ASSOCIATION OF PERSONS (AOP) / BODY OF INDIVIDUALS (BOI)':
          regx = '^[A-Z]{3}[AB][A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAA{A-B}A9999A ';
          break;
        case 'LIMITED LIABILITY PARTNERSHIP':
          regx = '^[A-Z]{3}E[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAAEA9999A';
          break;
        case 'TRUST':
          regx = '^[A-Z]{3}T[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAATA9999A';
          break;
        case 'SOLE PROPRIETORSHIP':
          regx = '^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAAPA9999A';
          break;
        case 'PRIVATE LIMITED COMPANY':
          regx = '^[A-Z]{3}C[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAACA9999A';
          break;
        case 'PUBLIC LIMITED COMPANY':
          regx = '^[A-Z]{3}C[A-Z][0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAACA9999A';
          break;
        default:
          regx = '^[A-Z]{5}[0-9]{4}[A-Z]$';
          regxMessage = 'PAN must be in the format AAAAA9999A';
      }
    }
    // Handle proof of identity number validation for both Nodal Officer (noProofOfIdentityNumber)
    // and Admin User (iauProofOfIdentityNumber1, iauProofOfIdentityNumber2, etc.)
    const fieldNameLower = field.fieldName.toLowerCase();
    if (fieldNameLower.includes('proofofidentitynumber')) {
      let proofOfIdentity: string = '';

      // Determine the proof type field name based on the number field name
      if (field.fieldName === 'noProofOfIdentityNumber') {
        proofOfIdentity = (formValues?.noProofOfIdentity as string) || '';
      } else if (fieldNameLower.startsWith('iau')) {
        // Extract admin number from field name (e.g., iauProofOfIdentityNumber1 -> 1)
        const adminMatch = field.fieldName.match(/(\d+)$/);
        const adminNum = adminMatch ? adminMatch[1] : '';
        const proofTypeFieldName = `iauProofOfIdentity${adminNum}`;
        proofOfIdentity = (formValues?.[proofTypeFieldName] as string) || '';
      }

      if (proofOfIdentity) {
        proofOfIdentity = proofOfIdentity.toUpperCase();
      }

      // Min/Max length validation based on proof type
      let minLen = 0;
      let maxLen = 0;
      let lengthMessage = '';

      switch (proofOfIdentity) {
        case 'AADHAAR':
          regx = '^[0-9]{4}$';
          regxMessage = 'Enter last 4 digits of Aadhar ';
          break;

        case 'DRIVING LICENSE':
          regx = '^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$';
          regxMessage =
            'Invalid Driving License format (e.g., MH1420110062821)';
          minLen = 15;
          maxLen = 18;
          lengthMessage = 'Driving License must be 15-18 characters';
          break;

        case 'PAN CARD':
          regx = '^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$';
          regxMessage =
            'Invalid PAN format (4th character must be P, e.g., AAAPA1234A)';
          minLen = 10;
          maxLen = 10;
          lengthMessage = 'PAN must be exactly 10 characters';
          break;

        case 'PASSPORT':
          regx = '^[A-Z]{1}[0-9]{7}$';
          regxMessage = 'Invalid Passport number (e.g., A1234567)';
          minLen = 8;
          maxLen = 8;
          lengthMessage = 'Passport must be exactly 8 characters';
          break;

        case 'VOTER ID':
          regx = '^[A-Z]{3}[0-9]{7}$';
          regxMessage = 'Invalid Voter ID format (e.g., ABC1234567)';
          minLen = 10;
          maxLen = 10;
          lengthMessage = 'Voter ID must be exactly 10 characters';
          break;

        default:
          regx = '';
          regxMessage = '';
      }

      // Check min/max length first before regex
      if (minLen > 0 && maxLen > 0) {
        if (value.length < minLen) {
          return lengthMessage || `Must be at least ${minLen} characters`;
        }
        if (value.length > maxLen) {
          return lengthMessage || `Must not exceed ${maxLen} characters`;
        }
      }
    }
    if (regx && !new RegExp(regx).test(value)) {
      // Regex validation
      return regxMessage || `${field.fieldLabel} format is invalid`;
    }
  }

  // File validations
  if (value instanceof File) {
    // File size validation
    const fileRules = rules.validationFile || rules;
    if (fileRules.size) {
      const maxSizeInBytes =
        parseFloat(fileRules.size.replace(/mb|MB/i, '')) * 1024 * 1024;
      if (value.size > maxSizeInBytes) {
        return (
          fileRules.sizeMessage || `File size must not exceed ${fileRules.size}`
        );
      }
    }

    // File format validation
    if (fileRules.imageFormat && fileRules.imageFormat.length > 0) {
      const fileExtension = value.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !fileRules.imageFormat.includes(fileExtension)) {
        return `File must be in one of these formats: ${fileRules.imageFormat.join(', ')}`;
      }
    }
  }

  // Image required validation for textfield_with_image
  if (
    field.fieldType === 'textfield_with_image' &&
    (rules.imageRequired || rules.validationFile?.imageRequired) &&
    !value
  ) {
    return (
      rules.imageRequiredMessage ||
      rules.validationFile?.imageRequiredMessage ||
      `Image is required for ${field.fieldLabel}`
    );
  }

  return null;
};

// Form slice
const formSlice = createSlice({
  name: 'dynamicForm',
  initialState,
  reducers: {
    // Update form value
    updateFormValue: (
      state,
      action: PayloadAction<{ fieldName: string; value: string | File | null }>
    ) => {
      const { fieldName, value } = action.payload;
      state.formValues[fieldName] = value;

      // Clear existing error for this field
      state.fieldErrors = state.fieldErrors.filter(
        (error) => error.field !== fieldName
      );

      // Validate the field
      const field = state.fields.find((f) => f.fieldName === fieldName);

      if (fieldName === 'constitution') {
        const llpinFieldIndex = state.fields.findIndex(
          (f: FormField) => f.fieldName === 'llpin'
        );
        const updatedFields = [...state.fields];
        updatedFields[llpinFieldIndex] = {
          ...updatedFields[llpinFieldIndex],
          validationRules: {
            required: value === 'Limited Liability Partnership',
          },
        };
        const index = state.fields.findIndex(
          (f: FormField) =>
            f.fieldName === updatedFields[llpinFieldIndex].fieldName
        );
        if (index !== -1) {
          // Replace the existing field with the updated one
          state.fields[index] = {
            ...state.fields[index],
            ...updatedFields[llpinFieldIndex], // merge new values
          };
        }
        state.fieldErrors = state.fieldErrors.filter(
          (error) => error.field !== 'llpin'
        );

        const proprietorNameFieldIndex = state.fields.findIndex(
          (f: FormField) => f.fieldName === 'proprietorName'
        );
        updatedFields[proprietorNameFieldIndex] = {
          ...updatedFields[proprietorNameFieldIndex],
          validationRules: {
            required: value === 'Sole Proprietorship',
            maxLength: '50',
          },
        };

        const indexproprietorName = state.fields.findIndex(
          (f: FormField) =>
            f.fieldName === updatedFields[proprietorNameFieldIndex].fieldName
        );
        if (indexproprietorName !== -1) {
          // Replace the existing field with the updated one
          state.fields[indexproprietorName] = {
            ...state.fields[indexproprietorName],
            ...updatedFields[indexproprietorName], // merge new values
          };
        }
        state.fieldErrors = state.fieldErrors.filter(
          (error) => error.field !== 'proprietorName'
        );
      }

      if (field) {
        const error = validateField(field, value, state.formValues);
        if (error) {
          state.fieldErrors.push({ field: fieldName, message: error });
        }
      }
    },
    updateFormValueWithoutvalidateField: (
      state,
      action: PayloadAction<{ fieldName: string; value: string | File | null }>
    ) => {
      const { fieldName, value } = action.payload;
      state.formValues[fieldName] = value;

      // Clear existing error for this field
      state.fieldErrors = state.fieldErrors.filter(
        (error) => error.field !== fieldName
      );
    },

    updateFieldValidation: (state, action: PayloadAction<FormField>) => {
      const updatedField = action.payload;
      // Find the index of the field to update
      const index = state.fields.findIndex(
        (f: FormField) => f.fieldName === updatedField.fieldName
      );
      if (index !== -1) {
        // Replace the existing field with the updated one
        state.fields[index] = {
          ...state.fields[index],
          ...updatedField, // merge new values
        };
      }
    },

    // Set field error
    setFieldError: (
      state,
      action: PayloadAction<{ field: string; message: string }>
    ) => {
      const { field, message } = action.payload;
      state.fieldErrors = state.fieldErrors.filter(
        (error) => error.field !== field
      );
      state.fieldErrors.push({ field, message });
    },

    // Clear field error
    clearFieldError: (state, action: PayloadAction<string>) => {
      state.fieldErrors = state.fieldErrors.filter(
        (error) => error.field !== action.payload
      );
    },

    // Clear all errors
    clearAllErrors: (state) => {
      state.fieldErrors = [];
    },

    // Set current step
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    // Go to next step
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep += 1;
      }
    },

    // Go to previous step
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },

    // Clear form
    clearForm: (state) => {
      state.formValues = {};
      state.fieldErrors = [];
      state.currentStep = 0;
    },

    // Set static dropdown options
    setStaticDropdownOptions: (
      state,
      action: PayloadAction<{
        fieldId: number;
        options: { label: string; value: string }[];
      }>
    ) => {
      const { fieldId, options } = action.payload;
      state.dropdownOptions[fieldId] = options;
    },

    // Reset form state
    resetForm: () => initialState,

    // Set fields from frontend configuration (for new frontend config implementation)
    setFieldsFromConfig: (
      state,
      action: PayloadAction<{
        fields: FormField[];
        configuration: FormFieldsResponse['data']['configuration'] | null;
      }>
    ) => {
      // Create a copy of the array before sorting to avoid mutating read-only array
      const fieldsCopy = [...action.payload.fields];
      state.fields = fieldsCopy.sort(
        (a, b) => a.fieldOrder - b.fieldOrder
      );
      state.configuration = action.payload.configuration;
      state.totalSteps = Math.ceil(state.fields.length / 3);
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch form fields
    builder
      .addCase(fetchFormFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.data.fields.sort(
          (a, b) => a.fieldOrder - b.fieldOrder
        );
        state.configuration = action.payload.data.configuration;
        state.totalSteps = Math.ceil(state.fields.length / 3);
        state.error = null;
      })
      .addCase(fetchFormFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch dropdown options
    builder
      .addCase(fetchDropdownOptions.fulfilled, (state, action) => {
        console.log('fetchDropdownOptions.fulfilled called:', action.payload);
        const { fieldId, options, cached } = action.payload;

        // Skip if already cached
        if (cached) {
          console.log(`Skipping cached options for field ${fieldId}`);
          return;
        }

        // Transform options based on response mapping
        const field = state.fields.find((f) => f.id === fieldId);
        console.log(`Found field for ${fieldId}:`, field);

        // Extract the correct array based on field name
        let fieldOptions = options;
        if (
          field &&
          options &&
          typeof options === 'object' &&
          !Array.isArray(options)
        ) {
          // Map field names to response keys
          const fieldNameMapping: Record<string, string> = {
            regulator: 'regulators',
            institutionType: 'institutionTypes',
            constitution: 'constitutions',
            title: 'titles',
            gender: 'genders',
            citizenship: 'citizenships',
            proofOfIdentity: 'proofOfIdentities',
          };
          let responseKey = fieldNameMapping[field.fieldName];
          // If no explicit mapping, try to use fieldMaster or derive from fieldName
          if (!responseKey && typeof field.fieldName === 'string') {
            // First try fieldMaster if available
            if (field.fieldMaster && options[field.fieldMaster]) {
              responseKey = field.fieldMaster;
            } else if (field.fieldName.includes('_')) {
              const afterUnderscore = field.fieldName
                .split('_')
                .pop() as string;
              if (options[afterUnderscore]) {
                responseKey = afterUnderscore;
              } else if (options[`${afterUnderscore}s`]) {
                // Try simple plural form fallback
                responseKey = `${afterUnderscore}s`;
              }
            }
          }
          if (responseKey && options[responseKey]) {
            fieldOptions = options[responseKey];
            console.log(
              `Extracted ${responseKey} for field ${field.fieldName}:`,
              fieldOptions
            );
            console.log(
              `First option structure for ${field.fieldName}:`,
              fieldOptions[0]
            );

            // Special handling for regulator field - extract regulator names
            if (
              field.fieldName === 'regulator' &&
              Array.isArray(fieldOptions)
            ) {
              const regulatorOptions: Array<{
                regulator: string;
                types: Array<{
                  code: string;
                  name: string;
                  status: string;
                }>;
              }> = [];
              fieldOptions.forEach(
                (regulatorGroup: Record<string, unknown>) => {
                  if (regulatorGroup.regulator) {
                    regulatorOptions.push({
                      regulator: regulatorGroup.regulator as string,
                      types:
                        (regulatorGroup.types as Array<{
                          code: string;
                          name: string;
                          status: string;
                        }>) || [],
                    });
                  }
                }
              );
              fieldOptions = regulatorOptions;
              console.log(`Structured regulator options:`, fieldOptions);
            }

            // Special handling for institutionTypes - flatten the nested structure
            if (
              field.fieldName === 'institutionType' &&
              Array.isArray(fieldOptions)
            ) {
              const flattenedTypes: Array<{
                code: string;
                name: string;
                status: string;
              }> = [];
              fieldOptions.forEach(
                (regulatorGroup: Record<string, unknown>) => {
                  if (
                    regulatorGroup.types &&
                    Array.isArray(regulatorGroup.types)
                  ) {
                    flattenedTypes.push(
                      ...(regulatorGroup.types as Array<{
                        code: string;
                        name: string;
                        status: string;
                      }>)
                    );
                  }
                }
              );
              fieldOptions = flattenedTypes;
              console.log(`Flattened institution types:`, fieldOptions);
            }
          } else {
            console.log(
              `No mapping found for field ${field.fieldName}, using full options`
            );
          }
        }

        // Ensure options is always an array
        const optionsArray = Array.isArray(fieldOptions) ? fieldOptions : [];
        console.log(`abc ${fieldId}:`, optionsArray);

        if (field?.fieldAttributes?.responseMapping) {
          const { label, value } = field.fieldAttributes.responseMapping;
          console.log(`Using response mapping for field ${fieldId}:`, {
            label,
            value,
          });

          state.dropdownOptions[fieldId] = optionsArray.map(
            (option: Record<string, unknown>) => {
              // Special handling for pincode fields
              if (field.fieldName?.toLowerCase().includes('pincode')) {
                return {
                  label: (option.pincode as string) || '',
                  value: (option.pincode as string) || '',
                };
              }

              // Use configured response mapping for other fields
              return {
                label: (option[label] as string) || '',
                value: (option[value] as string) || '',
              };
            }
          );
        } else {
          console.log(`Setting direct options for field ${fieldId}`);
          // Transform options to standard format if they don't have label/value
          state.dropdownOptions[fieldId] = optionsArray.map(
            (option: Record<string, unknown>, index: number) => {
              // Special handling for pincode fields without response mapping
              if (field?.fieldName?.toLowerCase().includes('pincode')) {
                return {
                  label: (option.pincode as string) || `Option ${index + 1}`,
                  value: (option.pincode as string) || `option_${index}`,
                };
              }

              // Try different common property names for label
              const label = (option.label ||
                option.name ||
                option.text ||
                option.title ||
                `Option ${index + 1}`) as string;
              // Try different common property names for value
              const value = (option.value ||
                option.id ||
                option.code ||
                option.key ||
                option.pincode || // Special case for pincode API
                `option_${index}`) as string;

              return { label, value };
            }
          );
        }

        console.log(
          `Final dropdown options for field ${fieldId}:`,
          state.dropdownOptions[fieldId]
        );
      })
      .addCase(fetchDropdownOptions.rejected, (state, action) => {
        // Keep dropdown fetch failures non-blocking for the main DynamicForm UI.
        // We log the error for debugging but do not set the global `error` flag here,
        // so that a single field's options failure (e.g. "Failed to fetch options for field 517")
        // does not replace the entire form with an error screen.
        console.log('fetchDropdownOptions.rejected called:', action.payload);
      })
      // Submit entity profile
      .addCase(submitEntityProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitEntityProfile.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Entity profile submitted successfully:', action.payload);
      })
      .addCase(submitEntityProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Entity profile submission failed:', action.payload);
      });
  },
});

// Export actions
export const {
  updateFormValue,
  setFieldError,
  clearFieldError,
  clearAllErrors,
  setCurrentStep,
  setFieldsFromConfig,
  nextStep,
  previousStep,
  clearForm,
  resetForm,
  setStaticDropdownOptions,
  updateFormValueWithoutvalidateField,
  updateFieldValidation,
} = formSlice.actions;

// Export reducer
export default formSlice.reducer;

// Root state interface for selectors
interface RootState {
  dynamicForm: FormState;
}

// Selectors
export const selectFormFields = (state: RootState) => state.dynamicForm.fields;
export const selectFormConfiguration = (state: RootState) =>
  state.dynamicForm.configuration;
export const selectFormValues = (state: RootState) =>
  state.dynamicForm.formValues;
export const selectFieldErrors = (state: RootState) =>
  state.dynamicForm.fieldErrors;
export const selectFormLoading = (state: RootState) =>
  state.dynamicForm.loading;
export const selectFormError = (state: RootState) => state.dynamicForm.error;
export const selectCurrentStep = (state: RootState) =>
  state.dynamicForm.currentStep;
export const selectTotalSteps = (state: RootState) =>
  state.dynamicForm.totalSteps;
export const selectDropdownOptions = (state: RootState) =>
  state.dynamicForm.dropdownOptions;

// Helper selectors - Show all fields at once
export const selectCurrentStepFields = (state: RootState) => {
  return state.dynamicForm.fields; // Return all fields instead of paginated
};

export const selectFieldError = (fieldName: string) => (state: RootState) => {
  return state.dynamicForm.fieldErrors.find(
    (error) => error.field === fieldName
  )?.message;
};

export const selectFormSteps = (state: RootState) => {
  return groupFieldsIntoSteps(state.dynamicForm.fields);
};

// Proof of Identity validation rules
interface ProofOfIdentityValidation {
  minLength: number;
  maxLength: number;
  minLengthMessage: string;
  maxLengthMessage: string;
  regx: string;
  regxMessage: string;
}

export const getProofOfIdentityValidation = (
  proofType: string
): ProofOfIdentityValidation | null => {
  const normalizedType = proofType?.toUpperCase()?.trim();

  switch (normalizedType) {
    case 'AADHAAR':
    case 'AADHAR CARD':
    case 'AADHAAR CARD':
    case 'AADHAAR_CARD':
      return {
        minLength: 4,
        maxLength: 4,
        minLengthMessage: 'Enter last 4 digits of Aadhar',
        maxLengthMessage: 'Enter last 4 digits of Aadhar',
        regx: '^[0-9]{4}$',
        regxMessage: 'Enter last 4 digits of Aadhar',
      };

    case 'DRIVING LICENSE':
    case 'DRIVING_LICENSE':
    case 'DRIVING LICENCE':
    case 'DL':
      return {
        minLength: 15,
        maxLength: 18,
        minLengthMessage: 'Driving License must be 15-18 characters',
        maxLengthMessage: 'Driving License must be 15-18 characters',
        regx: '^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$',
        regxMessage: 'Invalid Driving License format (e.g., MH1420110062821)',
      };

    case 'PAN':
    case 'PAN CARD':
    case 'PAN_CARD':
      return {
        minLength: 10,
        maxLength: 10,
        minLengthMessage: 'PAN must be exactly 10 characters',
        maxLengthMessage: 'PAN must be exactly 10 characters',
        regx: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
        regxMessage: 'Please enter valid PAN number (e.g., ABCPE1234F)',
      };

    case 'PASSPORT':
      return {
        minLength: 8,
        maxLength: 8,
        minLengthMessage: 'Passport must be exactly 8 characters',
        maxLengthMessage: 'Passport must be exactly 8 characters',
        regx: '^[A-Z]{1}[0-9]{7}$',
        regxMessage: 'Please enter valid Passport number (e.g., A1234567)',
      };

    case 'VOTER ID':
    case 'VOTER_ID':
    case 'VOTERID':
      return {
        minLength: 10,
        maxLength: 10,
        minLengthMessage: 'Voter ID must be exactly 10 characters',
        maxLengthMessage: 'Voter ID must be exactly 10 characters',
        regx: '^[A-Z]{3}[0-9]{7}$',
        regxMessage: 'Please enter valid Voter ID (e.g., ABC1234567)',
      };

    default:
      return null;
  }
};
