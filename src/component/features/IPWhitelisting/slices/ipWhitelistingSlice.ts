/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS } from '../../../../utils/constants';
import { Secured } from '../../../../utils/HelperFunctions/api';

export interface IPWhitelistData {
  id: string;
  ipAddress: string;
  ipWhitelistedFor: string;
  validFrom: string;
  validTill: string;
  status: 'BLOCKED' | 'UNBLOCKED';
  createdBy?: string;
  lastUpdatedBy?: string;
  lastUpdatedOn: string;
}

export interface PublicKeyData {
  id: string;
  publicKeyId: string;
  fileName: string;
  validFrom: string;
  validTill: string;
}

export interface IPWhitelistingResponse {
  content: IPWhitelistData[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface IPWhitelistingState {
  data: IPWhitelistingResponse | null;
  pendingRequests: any | null;
  publicKeyData: PublicKeyData | null;
  publicKeyLoading: boolean;
  publicKeyError: string | null;
  uploadedPublicKeyId: string | null;
  loading: boolean;
  error: string | null;
}

export interface SortBy {
  key: string;
  type: 'asc' | 'desc';
}

const initialState: IPWhitelistingState = {
  data: null,
  pendingRequests: null,
  publicKeyData: null,
  publicKeyLoading: false,
  publicKeyError: null,
  uploadedPublicKeyId: null,
  loading: false,
  error: null,
};

export const fetchIPWhitelisting = createAsyncThunk<
  IPWhitelistingResponse,
  {
    page?: number;
    size?: number;
    sortField?: string;
    sortDirection?: string;
  }
>(
  'ipWhitelisting/fetchAll',
  async (
    { page = 0, size = 10, sortField = 'createdAt', sortDirection = 'desc' },
    { rejectWithValue }
  ) => {
    try {
      const url = `${ENDPOINTS.IP_WHITELISTING}?page=${page}&size=${size}&sortField=${sortField}&sortDirection=${sortDirection}`;

      const response = await Secured.get(url);

      console.log('IP Whitelisting API Response:', response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to fetch IP whitelisting data'
        );
      }
    } catch (error: any) {
      console.error('Error in fetchIPWhitelisting:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch IP whitelisting data'
      );
    }
  }
);

export const removeIPAddress = createAsyncThunk<
  any,
  {
    id: string;
    reason: string;
  }
>('ipWhitelisting/remove', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const url = `${ENDPOINTS.IP_WHITELISTING}/${id}/remove`;

    const response = await Secured.delete(url, {
      data: { reason },
    });

    console.log('Remove IP Address API Response:', response.data);

    // Check if response has success field or if status is 2xx (successful)
    if (
      response.data.success !== false &&
      response.status >= 200 &&
      response.status < 300
    ) {
      return response.data;
    } else {
      return rejectWithValue(
        response.data.message || 'Failed to remove IP address'
      );
    }
  } catch (error: any) {
    console.error('Error in removeIPAddress:', error);
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'Failed to remove IP address';
    return rejectWithValue(errorMessage);
  }
});

export const extendValidity = createAsyncThunk<
  any,
  {
    id: string;
    extendValidTill: string;
  }
>(
  'ipWhitelisting/extendValidity',
  async ({ id, extendValidTill }, { rejectWithValue }) => {
    try {
      const url = `${ENDPOINTS.IP_WHITELISTING}/${id}/extend-validity`;

      const response = await Secured.put(url, {
        extendValidTill,
      });

      console.log('Extend Validity API Response:', response.data);

      // Check if response has success field or if status is 2xx (successful)
      if (
        response.data.success !== false &&
        response.status >= 200 &&
        response.status < 300
      ) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to extend validity'
        );
      }
    } catch (error: any) {
      console.error('Error in extendValidity:', error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to extend validity';
      return rejectWithValue(errorMessage);
    }
  }
);

export const addIPAddress = createAsyncThunk<
  any,
  {
    ipAddress: string;
    ipWhitelistedFor: string;
    validFrom: string;
    validTill: string;
  }
>(
  'ipWhitelisting/addIPAddress',
  async (
    { ipAddress, ipWhitelistedFor, validFrom, validTill },
    { rejectWithValue }
  ) => {
    try {
      const url = ENDPOINTS.IP_WHITELISTING;

      const response = await Secured.post(url, {
        ipAddress,
        ipWhitelistedFor,
        validFrom,
        validTill,
      });

      console.log('Add IP Address API Response:', response.data);

      // Check if response has success field or if status is 2xx (successful)
      if (
        response.data.success !== false &&
        response.status >= 200 &&
        response.status < 300
      ) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to add IP address'
        );
      }
    } catch (error: any) {
      console.error('Error in addIPAddress:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add IP address'
      );
    }
  }
);

export const fetchPendingRequests = createAsyncThunk<
  any,
  {
    workflowType: string;
    page: number;
    pageSize: number;
    status?: string[];
    sortBy?: string;
    sortDesc?: boolean;
  }
>(
  'ipWhitelisting/fetchPendingRequests',
  async (
    {
      workflowType,
      page,
      pageSize,
      status = ['pending'],
      sortBy = 'created_at',
      sortDesc = true,
    },
    { rejectWithValue }
  ) => {
    try {
      const url = `${ENDPOINTS.IP_WHITELISTING}-workflows/pending-requests`;

      const response = await Secured.post(url, {
        filters: [
          {
            operation: 'AND',
            filters: {
              workflow_type: workflowType,
              ...(status.length > 0 && { status: status }),
            },
          },
        ],
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDesc,
      });

      console.log('Pending Requests API Response:', response.data);
      console.log('Response data structure:', {
        hasSuccess: 'success' in response.data,
        hasData: 'data' in response.data,
        hasContent: 'content' in response.data,
        keys: Object.keys(response.data),
      });

      // Handle both wrapped and direct response structures
      if (response.status >= 200 && response.status < 300) {
        // If response has success and data properties, return data.data
        if (response.data.success !== false && response.data.data) {
          return response.data.data;
        }
        // Otherwise return response.data directly
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to fetch pending requests'
        );
      }
    } catch (error: any) {
      console.error('Error in fetchPendingRequests:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch pending requests'
      );
    }
  }
);

export const fetchTrackStatus = createAsyncThunk<
  any,
  {
    workflowType: string;
    page: number;
    pageSize: number;
    status?: string[];
    sortBy?: string;
    sortDesc?: boolean;
  }
>(
  'ipWhitelisting/fetchTrackStatus',
  async (
    {
      workflowType,
      page,
      pageSize,
      status = [],
      sortBy = 'created_at',
      sortDesc = true,
    },
    { rejectWithValue }
  ) => {
    try {
      const url = `${ENDPOINTS.IP_WHITELISTING}-workflows/track-status`;

      const response = await Secured.post(url, {
        filters: [
          {
            operation: 'AND',
            filters: {
              workflow_type: workflowType,
              ...(status.length > 0 && { status: status }),
            },
          },
        ],
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDesc,
      });

      console.log('Track Status API Response:', response.data);

      // Handle both wrapped and direct response structures
      if (response.status >= 200 && response.status < 300) {
        // If response has success and data properties, return data.data
        if (response.data.success !== false && response.data.data) {
          return response.data.data;
        }
        // Otherwise return response.data directly
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to fetch track status'
        );
      }
    } catch (error: any) {
      console.error('Error in fetchTrackStatus:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch track status'
      );
    }
  }
);

export const approveIPWhitelistRequest = createAsyncThunk<
  any,
  {
    id: string;
  }
>('ipWhitelisting/approve', async ({ id }, { rejectWithValue }) => {
  try {
    const url = `${ENDPOINTS.IP_WHITELISTING}/${id}/approve`;

    const response = await Secured.put(url);

    console.log('Approve IP Whitelist Request API Response:', response.data);

    if (
      response.data.success !== false &&
      response.status >= 200 &&
      response.status < 300
    ) {
      return response.data;
    } else {
      return rejectWithValue(
        response.data.message || 'Failed to approve request'
      );
    }
  } catch (error: any) {
    console.error('Error in approveIPWhitelistRequest:', error);
    return rejectWithValue(
      error.response?.data?.message || 'Failed to approve request'
    );
  }
});

export const approveMultipleIPWhitelistRequests = createAsyncThunk<
  any,
  {
    workflowIds: string[];
    remarks: string;
    fileName?: string;
  }
>(
  'ipWhitelisting/approveMultiple',
  async ({ workflowIds, remarks, fileName }, { rejectWithValue }) => {
    try {
      const url = `${ENDPOINTS.IP_WHITELISTING}-workflows/approve`;

      const response = await Secured.post(url, {
        workflowIds,
        remarks,
        ...(fileName && { fileName }),
      });

      console.log(
        'Approve Multiple IP Whitelist Requests API Response:',
        response.data
      );

      if (
        response.data.success !== false &&
        response.status >= 200 &&
        response.status < 300
      ) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to approve requests'
        );
      }
    } catch (error: any) {
      console.error('Error in approveMultipleIPWhitelistRequests:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve requests'
      );
    }
  }
);

export const rejectIPWhitelistRequest = createAsyncThunk<
  any,
  {
    id: string;
    reason: string;
  }
>('ipWhitelisting/reject', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const url = `${ENDPOINTS.IP_WHITELISTING}/${id}/reject`;

    const response = await Secured.put(url, {
      reason,
    });

    // console.log('Reject IP Whitelist Request API Response:', response.data);

    if (
      response.data.success !== false &&
      response.status >= 200 &&
      response.status < 300
    ) {
      return response.data;
    } else {
      return rejectWithValue(
        response.data.message || 'Failed to reject request'
      );
    }
  } catch (error: any) {
    console.error('Error in rejectIPWhitelistRequest:', error);
    return rejectWithValue(
      error.response?.data?.message || 'Failed to reject request'
    );
  }
});

export const rejectIPWhitelistWorkflowRequest = createAsyncThunk<
  any,
  {
    workflowId: string;
    remarks: string;
  }
>(
  'ipWhitelisting/rejectWorkflow',
  async ({ workflowId, remarks }, { rejectWithValue }) => {
    try {
      // Using the base part of IP_WHITELISTING endpoint to construct the URL
      const baseUrl = ENDPOINTS.IP_WHITELISTING.split('/ip-whitelisting')[0];
      const url = `${baseUrl}/user-workflow/reject`;

      const response = await Secured.post(url, {
        workflowId,
        remarks,
      });

      // console.log(
      //   'Reject IP Whitelist Workflow Request API Response:',
      //   response.data
      // );

      if (
        response.data.success !== false &&
        response.status >= 200 &&
        response.status < 300
      ) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to reject request'
        );
      }
    } catch (error: any) {
      console.error('Error in rejectIPWhitelistWorkflowRequest:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject request'
      );
    }
  }
);

export const rejectMultipleIPWhitelistRequests = createAsyncThunk<
  any,
  {
    workflowIds: string[];
    remark: string;
  }
>(
  'ipWhitelisting/rejectMultiple',
  async ({ workflowIds, remark }, { rejectWithValue }) => {
    try {
      const url = `${ENDPOINTS.IP_WHITELISTING}-workflows/reject`;

      const response = await Secured.post(url, {
        workflowIds,
        remark,
      });

      // console.log(
      //   'Reject Multiple IP Whitelist Requests API Response:',
      //   response.data
      // );

      if (
        response.data.success !== false &&
        response.status >= 200 &&
        response.status < 300
      ) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to reject requests'
        );
      }
    } catch (error: any) {
      console.error('Error in rejectMultipleIPWhitelistRequests:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject requests'
      );
    }
  }
);

// Public Key APIs
export const deletePublicKey = createAsyncThunk<
  any,
  {
    id: string;
  }
>('ipWhitelisting/deletePublicKey', async ({ id }, { rejectWithValue }) => {
  try {
    const url = `${ENDPOINTS.IP_WHITELISTING}/${id}/public-key/remove`;

    const response = await Secured.delete(url);

    console.log('Delete Public Key API Response:', response.data);

    if (
      response.data.success !== false &&
      response.status >= 200 &&
      response.status < 300
    ) {
      return response.data;
    } else {
      return rejectWithValue(
        response.data.message || 'Failed to delete public key'
      );
    }
  } catch (error: any) {
    console.error('Error in deletePublicKey:', error);
    return rejectWithValue(
      error.response?.data?.message || 'Failed to delete public key'
    );
  }
});

export const fetchPublicKeyData = createAsyncThunk<PublicKeyData | null, void>(
  'ipWhitelisting/fetchPublicKeyData',
  async (_, { rejectWithValue }) => {
    try {
      const url = ENDPOINTS.PUBLIC_KEY_DATA;
      const response = await Secured.get(url);

      console.log('Fetch Public Key Data API Response:', response.data);

      if (
        response.data.success !== false &&
        response.status >= 200 &&
        response.status < 300
      ) {
        return response.data.data || response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to fetch public key data'
        );
      }
    } catch (error: any) {
      console.error('Error in fetchPublicKeyData:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch public key data'
      );
    }
  }
);

export const uploadPublicKeyFile = createAsyncThunk<
  { publicKeyId: string },
  File
>('ipWhitelisting/uploadPublicKeyFile', async (file, { rejectWithValue }) => {
  try {
    const url = ENDPOINTS.PUBLIC_KEY_UPLOAD;
    const formData = new FormData();
    formData.append('file', file);

    const response = await Secured.post(url, formData);

    // console.log('Upload Public Key File API Response:', response.data);

    if (
      response.data.success !== false &&
      response.status >= 200 &&
      response.status < 300
    ) {
      // Response format: { "message": "...", "data": "document-id-string" }
      const documentId = response.data.data;
      return { publicKeyId: documentId };
    } else {
      return rejectWithValue(
        response.data.message || 'Failed to upload public key file'
      );
    }
  } catch (error: any) {
    console.error('Error in uploadPublicKeyFile:', error);
    return rejectWithValue(
      error.response?.data?.message || 'Failed to upload public key file'
    );
  }
});

export const createReplacePublicKey = createAsyncThunk<
  any,
  {
    publicKeyId: string;
    validFrom: string;
    validTill: string;
    fileName?: string;
  }
>(
  'ipWhitelisting/createReplacePublicKey',
  async (
    { publicKeyId, validFrom, validTill, fileName },
    { rejectWithValue }
  ) => {
    try {
      const url = ENDPOINTS.PUBLIC_KEY_CREATE_REPLACE;

      const response = await Secured.post(url, {
        publicKeyId,
        validFrom,
        validTill,
        ...(fileName && { fileName }),
      });

      console.log('Create/Replace Public Key API Response:', response.data);

      if (
        response.data.success !== false &&
        response.status >= 200 &&
        response.status < 300
      ) {
        return response.data.data || response.data;
      } else {
        return rejectWithValue(
          response.data?.error?.message ||
            response.data.message ||
            'Failed to create/replace public key'
        );
      }
    } catch (error: any) {
      console.error('Error in createReplacePublicKey:', error);
      return rejectWithValue(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Failed to create/replace public key'
      );
    }
  }
);

const ipWhitelistingSlice = createSlice({
  name: 'ipWhitelisting',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPublicKeyState: (state) => {
      state.publicKeyData = null;
      state.publicKeyError = null;
      state.uploadedPublicKeyId = null;
    },
    clearUploadedPublicKeyId: (state) => {
      state.uploadedPublicKeyId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIPWhitelisting.pending, (state) => {
        console.log('fetchIPWhitelisting.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchIPWhitelisting.fulfilled,
        (state, action: PayloadAction<IPWhitelistingResponse>) => {
          console.log('fetchIPWhitelisting.fulfilled - Payload:', {
            hasContent: !!action.payload?.content,
            contentLength: action.payload?.content?.length || 0,
            firstItem: action.payload?.content?.[0],
            pagination: {
              page: action.payload?.number,
              size: action.payload?.size,
              totalElements: action.payload?.totalElements,
              totalPages: action.payload?.totalPages,
            },
          });

          state.loading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchIPWhitelisting.rejected, (state, action) => {
        console.error('fetchIPWhitelisting.rejected:', {
          error: action.error,
          payload: action.payload,
          meta: action.meta,
        });
        state.loading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch IP whitelisting data';
      })
      .addCase(removeIPAddress.pending, (state) => {
        console.log('removeIPAddress.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(removeIPAddress.fulfilled, (state) => {
        console.log('removeIPAddress.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(removeIPAddress.rejected, (state, action) => {
        console.error('removeIPAddress.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        // Don't set state.error here - error is handled via popup in the component
      })
      .addCase(extendValidity.pending, (state) => {
        console.log('extendValidity.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(extendValidity.fulfilled, (state) => {
        console.log('extendValidity.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(extendValidity.rejected, (state, action) => {
        console.error('extendValidity.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        // Don't set state.error here - error is handled via popup in the component
      })
      .addCase(fetchPendingRequests.pending, (state) => {
        console.log('fetchPendingRequests.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        console.log('fetchPendingRequests.fulfilled');
        state.loading = false;
        state.pendingRequests = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        console.error('fetchPendingRequests.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch pending requests';
      })
      .addCase(fetchTrackStatus.pending, (state) => {
        console.log('fetchTrackStatus.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrackStatus.fulfilled, (state, action) => {
        console.log('fetchTrackStatus.fulfilled');
        state.loading = false;
        state.pendingRequests = action.payload;
        state.error = null;
      })
      .addCase(fetchTrackStatus.rejected, (state, action) => {
        console.error('fetchTrackStatus.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch track status';
      })
      .addCase(addIPAddress.pending, (state) => {
        console.log('addIPAddress.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(addIPAddress.fulfilled, (state) => {
        console.log('addIPAddress.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(addIPAddress.rejected, (state, action) => {
        console.error('addIPAddress.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to add IP address';
      })
      .addCase(approveIPWhitelistRequest.pending, (state) => {
        console.log('approveIPWhitelistRequest.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(approveIPWhitelistRequest.fulfilled, (state) => {
        console.log('approveIPWhitelistRequest.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(approveIPWhitelistRequest.rejected, (state, action) => {
        console.error('approveIPWhitelistRequest.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to approve request';
      })
      .addCase(rejectIPWhitelistRequest.pending, (state) => {
        console.log('rejectIPWhitelistRequest.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectIPWhitelistRequest.fulfilled, (state) => {
        console.log('rejectIPWhitelistRequest.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(rejectIPWhitelistRequest.rejected, (state, action) => {
        console.error('rejectIPWhitelistRequest.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to reject request';
      })
      .addCase(approveMultipleIPWhitelistRequests.pending, (state) => {
        console.log('approveMultipleIPWhitelistRequests.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(approveMultipleIPWhitelistRequests.fulfilled, (state) => {
        console.log('approveMultipleIPWhitelistRequests.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(approveMultipleIPWhitelistRequests.rejected, (state, action) => {
        console.error('approveMultipleIPWhitelistRequests.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        state.error =
          (action.payload as string) || 'Failed to approve requests';
      })
      .addCase(rejectIPWhitelistWorkflowRequest.pending, (state) => {
        console.log('rejectIPWhitelistWorkflowRequest.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectIPWhitelistWorkflowRequest.fulfilled, (state) => {
        console.log('rejectIPWhitelistWorkflowRequest.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(rejectIPWhitelistWorkflowRequest.rejected, (state, action) => {
        console.error('rejectIPWhitelistWorkflowRequest.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to reject request';
      })
      .addCase(rejectMultipleIPWhitelistRequests.pending, (state) => {
        console.log('rejectMultipleIPWhitelistRequests.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectMultipleIPWhitelistRequests.fulfilled, (state) => {
        console.log('rejectMultipleIPWhitelistRequests.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(rejectMultipleIPWhitelistRequests.rejected, (state, action) => {
        console.error('rejectMultipleIPWhitelistRequests.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to reject requests';
      })
      // Public Key API reducers
      .addCase(deletePublicKey.pending, (state) => {
        console.log('deletePublicKey.pending');
        state.publicKeyLoading = true;
        state.publicKeyError = null;
      })
      .addCase(deletePublicKey.fulfilled, (state) => {
        console.log('deletePublicKey.fulfilled');
        state.publicKeyLoading = false;
        state.publicKeyData = null;
        state.publicKeyError = null;
      })
      .addCase(deletePublicKey.rejected, (state, action) => {
        console.error('deletePublicKey.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.publicKeyLoading = false;
        state.publicKeyError =
          (action.payload as string) || 'Failed to delete public key';
      })
      .addCase(fetchPublicKeyData.pending, (state) => {
        console.log('fetchPublicKeyData.pending');
        state.publicKeyLoading = true;
        state.publicKeyError = null;
      })
      .addCase(fetchPublicKeyData.fulfilled, (state, action) => {
        console.log('fetchPublicKeyData.fulfilled');
        state.publicKeyLoading = false;
        state.publicKeyData = action.payload;
        state.publicKeyError = null;
      })
      .addCase(fetchPublicKeyData.rejected, (state, action) => {
        console.error('fetchPublicKeyData.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.publicKeyLoading = false;
        state.publicKeyData = null;
        state.publicKeyError =
          (action.payload as string) || 'Failed to fetch public key data';
      })
      .addCase(uploadPublicKeyFile.pending, (state) => {
        console.log('uploadPublicKeyFile.pending');
        state.publicKeyLoading = true;
        state.publicKeyError = null;
      })
      .addCase(uploadPublicKeyFile.fulfilled, (state, action) => {
        console.log('uploadPublicKeyFile.fulfilled');
        state.publicKeyLoading = false;
        state.uploadedPublicKeyId = action.payload.publicKeyId;
        state.publicKeyError = null;
      })
      .addCase(uploadPublicKeyFile.rejected, (state, action) => {
        console.error('uploadPublicKeyFile.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.publicKeyLoading = false;
        state.publicKeyError =
          (action.payload as string) || 'Failed to upload public key file';
      })
      .addCase(createReplacePublicKey.pending, (state) => {
        console.log('createReplacePublicKey.pending');
        state.publicKeyLoading = true;
        state.publicKeyError = null;
      })
      .addCase(createReplacePublicKey.fulfilled, (state) => {
        console.log('createReplacePublicKey.fulfilled');
        state.publicKeyLoading = false;
        state.uploadedPublicKeyId = null;
        state.publicKeyError = null;
      })
      .addCase(createReplacePublicKey.rejected, (state, action) => {
        console.error('createReplacePublicKey.rejected:', {
          error: action.error,
          payload: action.payload,
        });
        state.publicKeyLoading = false;
        state.publicKeyError =
          (action.payload as string) || 'Failed to create/replace public key';
      });
  },
});

export const { clearError, clearPublicKeyState, clearUploadedPublicKeyId } =
  ipWhitelistingSlice.actions;

export default ipWhitelistingSlice.reducer;
