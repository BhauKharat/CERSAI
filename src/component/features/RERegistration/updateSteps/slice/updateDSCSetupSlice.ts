import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';
export type Severity = 'error' | 'success' | 'warning' | 'info';

// Types based on your API response structure
export interface DSCData {
  dscId?: string;
  certificateSerial?: string;
  certificateValidFrom?: string | null;
  certificateExpiryDate?: string | null;
  certificateIssuer?: string;
  certificateThumbprint?: string;
  isActive?: boolean;
  hasExistingDsc?: boolean;
}

export interface DSCResponse {
  success: boolean;
  data: DSCData;
  message: string;
}

export interface UpdateDSCRequest {
  userId: string;
  base64Certificate: string;
}

export interface UpdateDSCResponse {
  success: boolean;
  data: {
    userId: string;
    dscId: string;
    certificateSerial: string;
    certificateExpiryDate: string;
    message: string;
  };
  message: string;
}

export interface DeleteDSCResponse {
  success: boolean;
  data: {
    userId: string;
    deletedDscId: string;
    message: string;
  };
  message: string;
}

export interface DSCValidationResult {
  isValid: boolean;
  isClass3: boolean;
  nameMatches: boolean;
  /** DSC validity start date */
  validFrom?: string | null;
  /** DSC validity end date */
  validTill?: string | null;
  message: string;
}

export interface ValidationMessage {
  text: string;
  type: Severity;
}

export interface DSCState {
  dscData: DSCData | null;
  loading: boolean;
  error: string | null;
  uploadEnabled: boolean;
  validationResult: DSCValidationResult | null;
  tempBase64Certificate?: string | null;
  isSubmitting: boolean;
  showDeclaration: boolean;
  showDigitalSignaturePopup: boolean;
  successMessage: string | null;
}

const initialState: DSCState = {
  dscData: null,
  loading: false,
  error: null,
  uploadEnabled: false,
  validationResult: null,
  tempBase64Certificate: null,
  isSubmitting: false,
  showDeclaration: false,
  showDigitalSignaturePopup: false,
  successMessage: null,
};

// Define proper error response type
interface ApiErrorResponse {
  message?: string;
  data?: {
    message?: string;
  };
}

// Fetch DSC data
export const fetchDSC = createAsyncThunk(
  'dsc/fetchDSC',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching DSC data for user:', userId);

      const response = await Secured.get(API_ENDPOINTS.get_dsc_details(userId));
      console.log('📥 DSC data response:', response.data);

      const data: DSCResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch DSC data');
      }

      return data;
    } catch (error: unknown) {
      console.error('❌ Error fetching DSC data:', error);
      const apiError = error as {
        response?: ApiErrorResponse;
        message?: string;
      };
      return rejectWithValue(
        apiError.response?.data?.message ||
          apiError.message ||
          'Failed to fetch DSC data'
      );
    }
  }
);

// Update DSC
export const updateDSC = createAsyncThunk(
  'dsc/updateDSC',
  async (updateData: UpdateDSCRequest, { rejectWithValue }) => {
    try {
      console.log('📤 Updating DSC for user:', updateData.userId);

      const payload = {
        userId: updateData.userId,
        base64Certificate: updateData.base64Certificate,
      };

      console.log(
        '📤 Sending payload to API:',
        JSON.stringify({
          userId: payload.userId,
          base64CertificateLength: payload.base64Certificate.length,
        })
      );
      const response = await Secured.post(API_ENDPOINTS.upload_dsc, payload);
      console.log('📥 Update DSC response:', response.data);
      console.log(
        '📥 Response payload data:',
        JSON.stringify(response.data.data)
      );

      const data: UpdateDSCResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Failed to update DSC');
      }

      return data;
    } catch (error: unknown) {
      console.error('❌ Error updating DSC:', error);
      const apiError = error as {
        response?: ApiErrorResponse;
        message?: string;
      };
      return rejectWithValue(
        apiError.response?.data?.message ||
          apiError.message ||
          'Failed to update DSC'
      );
    }
  }
);

// Delete DSC
export const deleteDSC = createAsyncThunk(
  'dsc/deleteDSC',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting DSC for user:', userId);

      const response = await Secured.delete(API_ENDPOINTS.delete_dsc(userId));
      console.log('📥 Delete DSC response:', response.data);

      const data: DeleteDSCResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete DSC');
      }

      return data;
    } catch (error: unknown) {
      console.error('❌ Error deleting DSC:', error);
      const apiError = error as {
        response?: ApiErrorResponse;
        message?: string;
      };
      return rejectWithValue(
        apiError.response?.data?.message ||
          apiError.message ||
          'Failed to delete DSC'
      );
    }
  }
);

// Validate DSC
export const validateDSC = createAsyncThunk(
  'dsc/validateDSC',
  async (
    { file, userId }: { file: File; userId: string },
    { rejectWithValue }
  ) => {
    try {
      console.log('🔍 Validating DSC file:', file.name);

      // Convert file to base64
      const base64Certificate = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const payload = { userId, base64Certificate };
      console.log('📤 Validating DSC with payload:', {
        userId,
        base64CertificateLength: base64Certificate.length,
      });
      const response = await Secured.post(API_ENDPOINTS.upload_dsc, payload);
      console.log('📥 Full validation API response:', response.data);
      if (!response.data.success) {
        console.error(
          '❌ Validation API returned success: false -',
          response.data.message
        );
        throw new Error(response.data.message || 'Validation failed');
      }
      const validationData = response.data.data;
      console.log('📊 Validation data from API:', validationData);
      const validationResult: DSCValidationResult = {
        isValid: validationData.isValid,
        isClass3: validationData.isClass3,
        nameMatches: validationData.nameMatches,
        validFrom: validationData.validFrom || null,
        validTill: validationData.validTill || null,
        message: response.data.message || 'Validation successful',
      };
      console.log('✅ DSC validation result:', validationResult);
      return { base64Certificate, validationResult };

      // const validationResult: DSCValidationResult = {
      //   isValid: true,
      //   isClass3: true,
      //   nameMatches: true,

      // };

      console.log('✅ DSC validation result:', validationResult);
    } catch (error: unknown) {
      console.error('❌ Error validating DSC:', error);
      const fileError = error as Error;
      return rejectWithValue(fileError.message || 'File processing failed');
    }
  }
);

const dscSlice = createSlice({
  name: 'dsc',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setUploadEnabled: (state, action: PayloadAction<boolean>) => {
      state.uploadEnabled = action.payload;
    },
    setShowDeclaration: (state, action: PayloadAction<boolean>) => {
      state.showDeclaration = action.payload;
    },
    setShowDigitalSignaturePopup: (state, action: PayloadAction<boolean>) => {
      state.showDigitalSignaturePopup = action.payload;
    },
    resetValidationResult: (state) => {
      state.validationResult = null;
    },
    resetState: () => initialState,

    setDSCData: (state, action: PayloadAction<DSCData | null>) => {
      state.dscData = action.payload;
      state.uploadEnabled = !action.payload?.hasExistingDsc;
    },

    clearFileAndValidation: (state) => {
      state.validationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch DSC
      .addCase(fetchDSC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDSC.fulfilled, (state, action) => {
        state.loading = false;
        console.log('📊 Payload received:', action.payload);
        console.log('📊 Payload data:', action.payload.data);
        state.dscData = action.payload.data;
        state.uploadEnabled = !action.payload.data.hasExistingDsc;
        state.error = null;
        console.log('✅ DSC data fetched successfully:', state.dscData);
      })
      .addCase(fetchDSC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.dscData = null;
        state.uploadEnabled = true;
        console.error('❌ Failed to fetch DSC data:', action.payload);
      })
      // Update DSC
      .addCase(updateDSC.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateDSC.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.showDeclaration = false;
        state.showDigitalSignaturePopup = false;
        state.uploadEnabled = false;
        state.successMessage = action.payload.message;
        state.error = null;

        if (state.dscData) {
          state.dscData = {
            ...state.dscData,
            certificateSerial: action.payload.data.certificateSerial,
            certificateExpiryDate: action.payload.data.certificateExpiryDate,
            hasExistingDsc: true,
          };
        } else {
          state.dscData = {
            dscId: action.payload.data.dscId,
            certificateSerial: action.payload.data.certificateSerial,
            certificateIssuer: '',
            certificateExpiryDate: action.payload.data.certificateExpiryDate,
            certificateThumbprint: '',
            isActive: true,
            hasExistingDsc: true,
          };
        }

        console.log('✅ DSC updated successfully');
      })
      .addCase(updateDSC.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
        state.successMessage = null;
        console.error('❌ Failed to update DSC:', action.payload);
      })
      // Delete DSC
      .addCase(deleteDSC.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteDSC.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.dscData = null;
        state.uploadEnabled = true;
        state.successMessage = action.payload.message;
        state.error = null;
        console.log('✅ DSC deleted successfully');
      })
      .addCase(deleteDSC.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
        state.successMessage = null;
        console.error('❌ Failed to delete DSC:', action.payload);
      })
      // Validate DSC
      // Validate DSC fulfilled
      .addCase(validateDSC.fulfilled, (state, action) => {
        // action.payload should be { base64Certificate, validationResult }
        state.validationResult = action.payload.validationResult;
        state.tempBase64Certificate = action.payload.base64Certificate;
        console.log('✅ DSC validation completed');
      })
      .addCase(validateDSC.rejected, (state, action) => {
        state.validationResult = {
          isValid: false,
          isClass3: false,
          nameMatches: false,
          message: action.payload as string,
        };
        state.tempBase64Certificate = null;
        console.error('❌ DSC validation failed:', action.payload);
      });
  },
});

export const {
  resetError,
  resetSuccessMessage,
  setUploadEnabled,
  setShowDeclaration,
  setShowDigitalSignaturePopup,
  resetValidationResult,
  resetState,
  setDSCData,
  clearFileAndValidation,
} = dscSlice.actions;

// Selectors
export const selectDSCLoading = (state: { dsc: DSCState }) => state.dsc.loading;
export const selectDSCData = (state: { dsc: DSCState }) => state.dsc.dscData;
export const selectDSCError = (state: { dsc: DSCState }) => state.dsc.error;
export const selectDSCUploadEnabled = (state: { dsc: DSCState }) =>
  state.dsc.uploadEnabled;
export const selectDSCValidationResult = (state: { dsc: DSCState }) =>
  state.dsc.validationResult;
export const selectDSCSubmitting = (state: { dsc: DSCState }) =>
  state.dsc.isSubmitting;
export const selectDSCShowDeclaration = (state: { dsc: DSCState }) =>
  state.dsc.showDeclaration;
export const selectDSCShowDigitalSignaturePopup = (state: { dsc: DSCState }) =>
  state.dsc.showDigitalSignaturePopup;
export const selectDSCSuccessMessage = (state: { dsc: DSCState }) =>
  state.dsc.successMessage;

export default dscSlice.reducer;
