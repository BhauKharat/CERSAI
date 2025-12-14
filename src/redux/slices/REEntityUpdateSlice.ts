/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from 'Constant';
import { EntityDetails, EntityProfileState } from '../types/REEntityTypes'; // Corrected import path

// Document type mapping between UI and API
export const DOCUMENT_TYPE_MAPPING = {
  // UI Key -> API Key
  RE_PAN: 're_pan',
  REGULATOR_LICENCE: 'regulator_licence',
  RE_OTHER_FILE: 're_other_file',
  REGISTRATION_CERTIFICATE: 'registration_certificate',
  RE_CIN: 're_cin',
  ADDRESS_PROOF: 'address_proof',
} as const;

// Reverse mapping for API response to UI
export const API_TO_UI_DOCUMENT_MAPPING = {
  re_pan: 'RE_PAN',
  regulator_licence: 'REGULATOR_LICENCE',
  re_other_file: 'RE_OTHER_FILE',
  registration_certificate: 'REGISTRATION_CERTIFICATE',
  re_cin: 'RE_CIN',
  address_proof: 'ADDRESS_PROOF',
} as const;

const initialState: EntityProfileState = {
  entityDetails: {},
  documents: [],
  loading: false,
  errors: null,
  success: false,
};

// Fetch entity profile
export const fetchEntityProfile = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>('entityProfile/fetchData', async (_, { rejectWithValue }) => {
  try {
    const response = await Secured.get(API_ENDPOINTS.update_entity);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch entity profile.'
    );
  }
});

// Update entity profile
export const updateEntityProfile = createAsyncThunk<
  any,
  FormData,
  { rejectValue: string }
>('entityProfile/updateData', async (formData, { rejectWithValue }) => {
  try {
    const response = await Secured.put(
      API_ENDPOINTS.get_entity_details,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to update entity profile.'
    );
  }
});

const entityProfileSlice = createSlice({
  name: 'entityProfile',
  initialState,
  reducers: {
    updateEntityDetails: (
      state,
      action: PayloadAction<Partial<EntityDetails>>
    ) => {
      state.entityDetails = { ...state.entityDetails, ...action.payload };
    },

    updateDocument: (
      state,
      action: PayloadAction<{
        documentType: string;
        base64Content?: string; // Make optional
        file?: File; // Make optional
        fileName?: string; // Make optional
      }>
    ) => {
      const { documentType, base64Content, file, fileName } = action.payload;
      const docIndex = state.documents.findIndex(
        (doc: any) => doc.documentType === documentType
      );

      // If all values are empty, remove the document
      if (!base64Content && !file && !fileName) {
        if (docIndex !== -1) {
          state.documents.splice(docIndex, 1);
        }
      }
      // Otherwise, update or add the document
      else if (docIndex !== -1) {
        state.documents[docIndex].base64Content = base64Content || '';
        state.documents[docIndex].file = file;
        state.documents[docIndex].fileName = fileName || '';
        state.documents[docIndex].fileSize = file?.size || 0;
      } else {
        state.documents.push({
          documentType,
          base64Content: base64Content || '',
          file,
          fileName: fileName || '',
          fileSize: file?.size || 0,
        });
      }
    },

    resetEntityProfile: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchEntityProfile.pending, (state) => {
        state.loading = true;
        state.errors = null;
        state.success = false;
      })
      .addCase(fetchEntityProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.entityDetails = action.payload.entityDetails;

        if (action.payload.documents) {
          state.documents = action.payload.documents.map((doc: any) => ({
            id: doc.id,
            documentType:
              API_TO_UI_DOCUMENT_MAPPING[
                doc.documentType as keyof typeof API_TO_UI_DOCUMENT_MAPPING
              ] || doc.documentType,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            base64Content: doc.base64Content,
          }));
        }
      })
      .addCase(fetchEntityProfile.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload as string;
      })
      .addCase(updateEntityProfile.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(updateEntityProfile.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.errors = null;
      })
      .addCase(updateEntityProfile.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload as string;
        state.success = false;
      });
  },
});

export const { updateEntityDetails, updateDocument, resetEntityProfile } =
  entityProfileSlice.actions;
export default entityProfileSlice.reducer;
