/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS, API_URL } from 'Constant';
import {
  FormField,
  FieldAttributes as FormFieldAttributes,
} from '../../types/formTypes';
import axios from 'axios';
export const CMS_URL = process.env.REACT_APP_CMS_URL;

// Interface for User Profile step data
interface UserProfileStepData {
  noCitizenship: string;
  noCkycNumber: string;
  noTitle: string;
  noFirstName: string;
  noMiddleName: string;
  noLastName: string;
  noGender: string;
  noDob: string;
  noDesignation: string;
  noEmployCode: string;
  noEmail: string;
  noCountryCode: string;
  noMobileNumber: string;
  noLandlineNumber: string;
  noOfficeAddress: string;
  noAddresLine1: string;
  noAddresLine2: string;
  noAddresLine3: string;
  noRegisterCountry: string;
  noRegisterState: string;
  noRegisterDistrict: string;
  noRegisterCity: string;
  noRegisterPincode: string;
  noRegisterPincodeOther: string;
  noRegisterDigipin: string;
  noProofOfIdentity: string;
  noProofOfIdentityNumber: string;
  noBoardResoluationDate: string;
  last_updated: string;
  last_updated_by: string;
  status: string;
  step_name: string;
}

interface FormFieldsResponse {
  fields: FormField[];
  groupedFields: {
    [key: string]: {
      label: string;
      fields: FormField[];
    };
  };
  configuration: any;
  formType: string;
}

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownDataState {
  [fieldName: string]: {
    loading: boolean;
    options: DropdownOption[];
    error: string | null;
  };
}

interface UpdateUserProfileState {
  stepData: UserProfileStepData | null;
  documents: any[];
  fields: FormField[];
  groupedFields: {
    [key: string]: {
      label: string;
      fields: FormField[];
    };
  };
  configuration: any;
  formType: string;
  fetchedDocuments: Record<string, any>;
  dropdownData: DropdownDataState;
  loading: boolean;
  error: string | null;
  // PDF and e-sign related state
  workflowId: string | null;
  pdfDocumentId: string | null;
  pdfDocument: any | null;
  pdfDocumentLoading: boolean;
  eSignLoading: boolean;
  signedDocumentId: string | null;
  signedDocument: any | null;
  acknowledgementNo: string | null;
  finalSubmitLoading: boolean;
}

const initialState: UpdateUserProfileState = {
  stepData: null,
  documents: [],
  fields: [],
  groupedFields: {},
  configuration: null,
  formType: '',
  fetchedDocuments: {},
  dropdownData: {},
  loading: false,
  error: null,
  // PDF and e-sign related state
  workflowId: null,
  pdfDocumentId: null,
  pdfDocument: null,
  pdfDocumentLoading: false,
  eSignLoading: false,
  signedDocumentId: null,
  signedDocument: null,
  acknowledgementNo: null,
  finalSubmitLoading: false,
};

// Fetch User Profile step data from search API
export const fetchStepDataUserProfile = createAsyncThunk(
  'updateUserProfile/fetchStepData',
  async (
    {
      userId,
      userTypes = ['NO'],
      dataKey = 'nodalOfficer',
    }: {
      userId: string;
      userTypes?: string[];
      dataKey?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload = [
        {
          operation: 'AND',
          filters: {
            userId: userId,
          },
        },
      ];

      const response = await Secured.post(
        `${API_ENDPOINTS.search_sub_registrations}?page=0&size=10`,
        payload
      );

      console.log('📥 API Response:', response.data);

      // Handle the response structure - API returns data.content array
      const content = response.data.data?.content || [];

      // Extract the first user data from content array (direct mapping, no nested data[dataKey])
      const stepData = content.length > 0 ? content[0] : {};

      console.log('📋 Extracted stepData:', stepData);

      // Handle address data if present
      if (stepData.addressResponseDto) {
        const address = stepData.addressResponseDto;
        // Map address fields to form fields
        stepData.addressLine1 = address.line1 || '';
        stepData.addressLine2 = address.line2 || '';
        stepData.addressLine3 = address.line3 || '';
        stepData.country = address.country || '';
        stepData.state = address.state || '';
        stepData.district = address.district || '';
        stepData.city = address.city || '';
        stepData.pincode = address.pincode || '';
        stepData.pincodeOther = address.alternatePincode || '';
        stepData.digipin = address.digiPin || '';
      }

      // Map region fields
      if (stepData.region) {
        stepData.regionName = stepData.region;
      }

      // Map employee ID field
      if (stepData.employeeId) {
        stepData.employeeCode = stepData.employeeId;
      }

      // Map userType to userRole
      if (stepData.userType) {
        stepData.userRole = stepData.userType;
      }

      const documents = response.data.data?.documents || {};

      // Transform documents object into array format (same as UpdateAdminUserDetailsSlice)
      const documentsArray = Object.entries(documents).map(
        ([fieldKey, docData]: [string, any]) => ({
          id: docData.id || docData.documentId,
          fieldKey: docData.fieldKey || fieldKey,
          type: docData.type,
          ...docData,
        })
      );

      return {
        stepData,
        documents: documentsArray,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFormFieldsUserProfile = createAsyncThunk(
  'updateUserProfile/fetchFormFields',
  async (
    {
      formType = 'nodal',
      iauGroup = null,
    }: {
      formType?: 'nodal' | 'iau';
      iauGroup?: 'adminone' | 'admintwo' | null;
    },
    { rejectWithValue }
  ) => {
    try {
      // Determine which endpoint to use based on form type
      const endpoint =
        formType === 'iau'
          ? API_ENDPOINTS.update_admin_user_form_fields
          : API_ENDPOINTS.update_nodal_officer_form_fields;

      const response = await axios.get(endpoint);

      const data = response.data.data || {};
      let fields = data.fields || [];
      const groupedFields = data.groupedFields || {};
      const configuration = data.configuration || {};
      const formTypeResponse = data.formType || '';

      // For IAU forms with grouped fields, extract the appropriate group
      if (formType === 'iau' && iauGroup && groupedFields[iauGroup]) {
        console.log(`📋 Extracting fields from IAU group: ${iauGroup}`);
        fields = groupedFields[iauGroup].fields || [];
        console.log(
          `✅ Extracted ${fields.length} fields from ${iauGroup} group`
        );
      }

      return {
        fields,
        groupedFields,
        configuration,
        formType: formTypeResponse,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDropdownDataUserProfile = createAsyncThunk(
  'updateUserProfile/fetchDropdownData',
  async (
    {
      fieldName,
      fieldAttributes,
      formData,
    }: {
      fieldName: string;
      fieldAttributes: FormFieldAttributes;
      formData: Record<string, any>;
    },
    { rejectWithValue }
  ) => {
    try {
      const { url, method, responseMapping } = fieldAttributes;
      const urlParam =
        (fieldAttributes as any).urldata || (fieldAttributes as any).urlData;

      if (!url || !method || !responseMapping || !urlParam) {
        throw new Error(`Missing required field attributes for ${fieldName}`);
      }

      const paramValue = formData[urlParam];

      if (!paramValue) {
        return {
          fieldName,
          options: [],
        };
      }

      // Replace the dynamic parameter in the URL
      let dynamicUrl = url.replace(`{${urlParam}}`, paramValue);

      // Prepend CMS_URL if the URL is relative (starts with /)
      if (dynamicUrl.startsWith('/')) {
        dynamicUrl = `${CMS_URL}${dynamicUrl}`;
      }

      let response;

      if (method.toUpperCase() === 'GET') {
        response = await Secured.get(dynamicUrl);
      } else if (method.toUpperCase() === 'POST') {
        response = await Secured.post(dynamicUrl);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }

      // Extract data using responseMapping
      const responseData = response.data.data || response.data;
      let options: DropdownOption[] = [];

      if (Array.isArray(responseData)) {
        options = responseData.map((item: any) => {
          // Helper function to safely get nested property
          const getNestedProperty = (obj: any, path: string) => {
            return path.split('.').reduce((acc, part) => acc?.[part], obj);
          };

          // Try to get label and value using responseMapping, then fallback to common properties
          let labelValue = getNestedProperty(item, responseMapping.label);
          let valueValue = getNestedProperty(item, responseMapping.value);

          // Fallback chain for common properties
          if (!labelValue || typeof labelValue === 'object') {
            labelValue =
              item.name || item.pincode || item.label || String(item);
          }

          if (!valueValue || typeof valueValue === 'object') {
            valueValue =
              item.code ||
              item.pincode ||
              item.value ||
              item.id ||
              String(item);
          }

          return {
            label: String(labelValue),
            value: String(valueValue),
          };
        });
      }

      return {
        fieldName,
        options,
      };
    } catch (error: any) {
      return rejectWithValue({
        fieldName,
        error: error.response?.data || error.message,
      });
    }
  }
);

// Submit User Profile Update
export const submitUserProfileUpdate = createAsyncThunk(
  'updateUserProfile/submitUpdate',
  async (
    {
      formValues,
      userId,
      acknowledgementNo,
      changedFields = [],
    }: {
      formValues: Record<
        string,
        string | File | number | boolean | object | null
      >;
      userId: string;
      acknowledgementNo: string;
      changedFields?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      // Fields to exclude from metadata (backend-managed fields)
      const excludedFields = [
        'keyCloakUserId',
        'createdBy',
        'updatedBy',
        'workflowStatus',
        'createdDate',
        'updatedDate',
        'addressResponseDto',
        'regionName',
        'branchName',
        'userRole',
        'acknowledgementNo',
        'workflowId',
        'pdfDocumentId',
      ];

      // Field name mapping (frontend field name -> backend field name)
      const fieldNameMapping: Record<string, string> = {
        poi: 'proofOfIdentity',
        poiNumber: 'proofOfIdentityNumber',
        ckycNo: 'ckycNumber',
      };

      // Prepare metadata object (only user-editable fields)
      const metadata: Record<string, string | number | boolean> = {};
      const fileFields: Record<string, File> = {};

      // Separate metadata fields from file fields
      Object.entries(formValues).forEach(([key, value]) => {
        // Skip excluded fields
        if (excludedFields.includes(key)) {
          return;
        }

        // Map frontend field name to backend field name
        const backendFieldName = fieldNameMapping[key] || key;

        if (value instanceof File) {
          // Only send newly uploaded files
          fileFields[backendFieldName] = value;
        } else if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          typeof value !== 'object'
        ) {
          // Only send non-empty primitive values (no objects)
          metadata[backendFieldName] = value as string | number | boolean;
        }
      });

      // Add userId without quotes (plain string)
      formData.append('userId', userId);

      // Add metadata as JSON string (NOT Blob)
      formData.append('metadata', JSON.stringify(metadata));

      // Map changedFields to backend field names
      const mappedChangedFields = changedFields.map(
        (field) => fieldNameMapping[field] || field
      );

      // Add changedFields as JSON string (NOT Blob)
      if (mappedChangedFields.length > 0) {
        formData.append('changedFields', JSON.stringify(mappedChangedFields));
      }

      // Add files with their field names (only newly uploaded files)
      Object.entries(fileFields).forEach(([fieldName, file]) => {
        formData.append(fieldName, file);
      });

      // Log what's being sent
      console.log('📤 Submitting user profile update:', {
        userId,
        changedFields: mappedChangedFields,
        metadata,
        metadataKeys: Object.keys(metadata),
        fileFields: Object.keys(fileFields),
      });

      const response = await Secured.post(
        API_ENDPOINTS.update_user_profile_submit,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: {
                status?: number;
                code?: string;
                type?: string;
                message?: string;
                errors?: Array<{ field: string; message: string }>;
              };
              status?: number;
              code?: string;
              type?: string;
              errors?: Array<{ field: string; message: string }>;
            };
            status?: number;
            statusText?: string;
            headers?: Record<string, unknown>;
          };
          message?: string;
        };

        const errorData =
          axiosError.response?.data?.error || axiosError.response?.data;

        // Handle form validation errors
        if (
          axiosError.response?.status === 400 &&
          errorData &&
          typeof errorData === 'object' &&
          'type' in errorData &&
          errorData.type === 'ERROR_FORM_VALIDATION' &&
          'errors' in errorData &&
          Array.isArray(errorData.errors)
        ) {
          return rejectWithValue({
            type: 'FIELD_VALIDATION_ERROR',
            message:
              (errorData as { message?: string }).message ||
              'Form validation failed',
            fieldErrors: errorData.errors.reduce(
              (
                acc: Record<string, string>,
                err: { field: string; message: string }
              ) => {
                acc[err.field] = err.message;
                return acc;
              },
              {}
            ),
            status: axiosError.response.status,
            code: (errorData as { code?: string }).code,
          });
        }

        const errorMessage =
          (errorData && typeof errorData === 'object' && 'message' in errorData
            ? (errorData as { message?: string }).message
            : null) ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to submit user profile update';

        // Preserve the full error structure including errors array for workflow errors
        return rejectWithValue({
          type:
            errorData && typeof errorData === 'object' && 'type' in errorData
              ? (errorData as { type?: string }).type
              : 'GENERAL_ERROR',
          message: errorMessage,
          status: axiosError.response?.status,
          code:
            errorData && typeof errorData === 'object' && 'code' in errorData
              ? (errorData as { code?: string }).code
              : undefined,
          errors:
            errorData && typeof errorData === 'object' && 'errors' in errorData
              ? (
                  errorData as {
                    errors?: Array<{ field: string; message: string }>;
                  }
                ).errors
              : undefined,
        });
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit user profile update';
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch User Profile PDF document
export const fetchUserProfilePdf = createAsyncThunk(
  'updateUserProfile/fetchPdf',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.fetch_document_stream(documentId),
        {
          responseType: 'blob',
        }
      );

      // Handle binary response (PDF data)
      const blob = response.data;

      // Force content type to application/pdf for proper iframe display
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });

      // Convert blob to base64 data URL for persistence
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `user_profile_${documentId}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (fileNameMatch) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      const fetchedDocument = {
        id: documentId,
        fileName,
        fileSize: pdfBlob.size,
        mimeType: 'application/pdf',
        base64Content: dataUrl,
        dataUrl,
      };

      return { documentId, document: fetchedDocument };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch PDF document'
      );
    }
  }
);

// eSign User Profile
export const eSignUserProfile = createAsyncThunk(
  'updateUserProfile/eSign',
  async (
    params: {
      workflowId: string;
      userId: string;
      declaration: boolean;
      declarationPlace: string;
      declarationDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await Secured.post(
        API_ENDPOINTS.user_profile_update_esign(params.workflowId),
        {
          userId: params.userId,
          declaration: params.declaration,
          declarationPlace: params.declarationPlace,
          declarationDate: params.declarationDate,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      if (!data.data?.id) {
        throw new Error(data.message || 'Failed to eSign user profile');
      }

      return data;
    } catch (error: unknown) {
      // Handle specific API error responses
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { error?: { message?: string }; message?: string };
          };
        };
        const apiError = axiosError.response?.data;
        if (apiError) {
          return rejectWithValue(
            apiError.error?.message ||
              apiError.message ||
              'eSign user profile failed'
          );
        }
      }

      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Fetch signed User Profile PDF document
export const fetchSignedUserProfilePdf = createAsyncThunk(
  'updateUserProfile/fetchSignedPdf',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.fetch_document_stream(documentId),
        {
          responseType: 'blob',
        }
      );

      // Handle binary response (PDF data)
      const blob = response.data;

      // Force content type to application/pdf for proper iframe display
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });

      // Convert blob to base64 data URL for persistence
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `signed_user_profile_${documentId}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (fileNameMatch) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      const fetchedDocument = {
        id: documentId,
        fileName,
        fileSize: pdfBlob.size,
        mimeType: 'application/pdf',
        base64Content: dataUrl,
        dataUrl,
      };

      return { documentId, document: fetchedDocument };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to fetch signed PDF document'
      );
    }
  }
);

// Final Submit after eSign
export const finalSubmitUserProfile = createAsyncThunk(
  'updateUserProfile/finalSubmit',
  async (
    params: {
      workflowId: string;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('📤 Final submit user profile with:', params);
      const response = await Secured.post(
        `${API_ENDPOINTS.submit_update_user_profile}/submit?workflowId=${params.workflowId}&userId=${params.userId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Final submit response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Final submit failed:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { error?: { message?: string }; message?: string };
          };
        };
        const apiError = axiosError.response?.data;
        if (apiError) {
          return rejectWithValue(
            apiError.error?.message || apiError.message || 'Final submit failed'
          );
        }
      }

      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Delete document
export const deleteDocumentSubUserProfile = createAsyncThunk(
  'updateUserProfile/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.delete(
        `${API_ENDPOINTS.delete_document}/${documentId}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to delete document:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
            status?: number;
          };
          message?: string;
        };

        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Failed to delete document';

        return rejectWithValue(errorMessage);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete document';
      return rejectWithValue(errorMessage);
    }
  }
);

const UpdateSubUserProfileSlice = createSlice({
  name: 'updateUserProfile',
  initialState,
  reducers: {
    clearStepDataUserProfile: (state) => {
      state.stepData = null;
      state.documents = [];
    },
    setFormDataUserProfile: (
      state,
      action: PayloadAction<Record<string, any>>
    ) => {
      if (state.stepData) {
        state.stepData = { ...state.stepData, ...action.payload };
      }
    },
    updateFieldValueUserProfile: (
      state,
      action: PayloadAction<{ fieldName: string; value: any }>
    ) => {
      if (state.stepData) {
        state.stepData = {
          ...state.stepData,
          [action.payload.fieldName]: action.payload.value,
        };
      }
    },
    clearDropdownDataUserProfile: (state, action: PayloadAction<string>) => {
      delete state.dropdownData[action.payload];
    },
    setWorkflowDataUserProfile: (
      state,
      action: PayloadAction<{
        workflowId: string;
        pdfDocumentId: string;
      }>
    ) => {
      state.workflowId = action.payload.workflowId;
      state.pdfDocumentId = action.payload.pdfDocumentId;
    },
    clearPdfDocumentUserProfile: (state) => {
      state.pdfDocumentId = null;
      state.pdfDocument = null;
      state.pdfDocumentLoading = false;
      state.error = null;
    },
    clearSignedDocumentUserProfile: (state) => {
      state.signedDocumentId = null;
      state.signedDocument = null;
      state.eSignLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch step data cases
      .addCase(fetchStepDataUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStepDataUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.stepData = action.payload.stepData;
        state.documents = action.payload.documents;
        state.error = null;
      })
      .addCase(fetchStepDataUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch form fields cases
      .addCase(fetchFormFieldsUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormFieldsUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.fields;
        state.groupedFields = action.payload.groupedFields;
        state.configuration = action.payload.configuration;
        state.formType = action.payload.formType;
        state.error = null;
      })
      .addCase(fetchFormFieldsUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Note: Document fetching is handled by shared updateStepDataSlice.fetchDocument
      // Dropdown data cases
      .addCase(fetchDropdownDataUserProfile.pending, (state, action) => {
        const { fieldName } = action.meta.arg;
        state.dropdownData[fieldName] = {
          loading: true,
          options: [],
          error: null,
        };
      })
      .addCase(fetchDropdownDataUserProfile.fulfilled, (state, action) => {
        const { fieldName, options } = action.payload;
        state.dropdownData[fieldName] = {
          loading: false,
          options,
          error: null,
        };
      })
      .addCase(fetchDropdownDataUserProfile.rejected, (state, action) => {
        const { fieldName } = action.meta.arg;
        state.dropdownData[fieldName] = {
          loading: false,
          options: [],
          error: action.payload as string,
        };
      })
      // Fetch PDF document cases
      .addCase(fetchUserProfilePdf.pending, (state) => {
        state.pdfDocumentLoading = true;
      })
      .addCase(fetchUserProfilePdf.fulfilled, (state, action) => {
        state.pdfDocumentLoading = false;
        state.pdfDocument = action.payload.document;
      })
      .addCase(fetchUserProfilePdf.rejected, (state, action) => {
        state.pdfDocumentLoading = false;
        state.error = action.payload as string;
      })
      // eSign cases
      .addCase(eSignUserProfile.pending, (state) => {
        state.eSignLoading = true;
        state.error = null;
      })
      .addCase(eSignUserProfile.fulfilled, (state, action) => {
        state.eSignLoading = false;
        state.signedDocumentId = action.payload.data.id;
        state.acknowledgementNo = action.payload.data.ackNo;
      })
      .addCase(eSignUserProfile.rejected, (state, action) => {
        state.eSignLoading = false;
        state.error = action.payload as string;
      })
      // Fetch signed PDF document cases
      .addCase(fetchSignedUserProfilePdf.pending, (state) => {
        state.pdfDocumentLoading = true;
      })
      .addCase(fetchSignedUserProfilePdf.fulfilled, (state, action) => {
        state.pdfDocumentLoading = false;
        state.signedDocument = action.payload.document;
      })
      .addCase(fetchSignedUserProfilePdf.rejected, (state, action) => {
        state.pdfDocumentLoading = false;
        state.error = action.payload as string;
      })
      // Submit user profile update cases
      .addCase(submitUserProfileUpdate.fulfilled, (state, action) => {
        // Store workflowId and pdfDocumentId from submission response
        if (action.payload.data) {
          state.workflowId = action.payload.data.workflowId;
          state.pdfDocumentId = action.payload.data.pdfDocumentId;
        }
      })
      // Final submit cases
      .addCase(finalSubmitUserProfile.pending, (state) => {
        state.finalSubmitLoading = true;
        state.error = null;
      })
      .addCase(finalSubmitUserProfile.fulfilled, (state, action) => {
        state.finalSubmitLoading = false;
        console.log('✅ Final submit successful:', action.payload);
      })
      .addCase(finalSubmitUserProfile.rejected, (state, action) => {
        state.finalSubmitLoading = false;
        state.error = action.payload as string;
      })
      // Delete document cases
      .addCase(deleteDocumentSubUserProfile.pending, (state, action) => {
        // Mark document as being deleted
        const documentId = action.meta.arg;
        console.log(`🗑️ Deleting document: ${documentId}`);
      })
      .addCase(deleteDocumentSubUserProfile.fulfilled, (state, action) => {
        const documentId = action.meta.arg;
        console.log(`✅ Document deleted successfully: ${documentId}`);

        // Remove from fetchedDocuments
        if (state.fetchedDocuments) {
          delete state.fetchedDocuments[documentId];
        }

        // Remove from documents list
        if (state.documents) {
          state.documents = state.documents.filter(
            (doc) => doc.id !== documentId
          );
        }
      })
      .addCase(deleteDocumentSubUserProfile.rejected, (state, action) => {
        const documentId = action.meta.arg;
        console.error(`❌ Failed to delete document: ${documentId}`);
        state.error = action.payload as string;
      });
  },
});

export const {
  clearStepDataUserProfile,
  setFormDataUserProfile,
  updateFieldValueUserProfile,
  clearDropdownDataUserProfile,
  setWorkflowDataUserProfile,
  clearPdfDocumentUserProfile,
  clearSignedDocumentUserProfile,
} = UpdateSubUserProfileSlice.actions;

// Selectors
export const selectUserProfileStepDataLoading = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.loading;

export const selectUserProfileFields = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.fields;

export const selectUserProfileGroupedFields = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.groupedFields;

export const selectUserProfileConfiguration = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.configuration;

export const selectUserProfileStepData = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.stepData;

export const selectUserProfileDocuments = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.documents;

// Note: Use selectFetchedDocuments from updateStepDataSlice for document data

export const selectUserProfileDropdownData = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.dropdownData;

export const selectUserProfileDropdownOptions =
  (fieldName: string) =>
  (state: { updateUserProfile: UpdateUserProfileState }) =>
    state.updateUserProfile.dropdownData[fieldName]?.options || [];

export const selectUserProfileDropdownLoading =
  (fieldName: string) =>
  (state: { updateUserProfile: UpdateUserProfileState }) =>
    state.updateUserProfile.dropdownData[fieldName]?.loading || false;

export const selectUserProfileDropdownError =
  (fieldName: string) =>
  (state: { updateUserProfile: UpdateUserProfileState }) =>
    state.updateUserProfile.dropdownData[fieldName]?.error || null;

// PDF and e-sign selectors
export const selectUserProfileWorkflowId = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.workflowId;

export const selectUserProfilePdfDocumentId = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.pdfDocumentId;

export const selectUserProfilePdfDocument = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.pdfDocument;

export const selectUserProfilePdfDocumentLoading = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.pdfDocumentLoading;

export const selectUserProfileESignLoading = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.eSignLoading;

export const selectUserProfileSignedDocumentId = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.signedDocumentId;

export const selectUserProfileSignedDocument = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.signedDocument;

export const selectUserProfileAcknowledgementNo = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.acknowledgementNo;

export const selectUserProfileFinalSubmitLoading = (state: {
  updateUserProfile: UpdateUserProfileState;
}) => state.updateUserProfile.finalSubmitLoading;

export default UpdateSubUserProfileSlice.reducer;
