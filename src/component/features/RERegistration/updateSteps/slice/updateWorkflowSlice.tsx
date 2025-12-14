/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { submitUpdatedEntityProfile } from './updateEntityProfileSlice';
import { submitUpdatedAddressDetails } from './updateAddressDetailsSlice';
import { submitUpdatedHoiDetails } from './updateHeadOfInstitutionSubmissionSlice';
import { submitUpdatedNodalOfficerDetails } from './updateNodalOfficerSubmissionSlice';
import { submitUpdatedAdminUserDetails } from './updateAdminUserDetailsSubmissionSlice';

interface UpdateWorkflowState {
  workflowId: string | null;
  currentStep: string | null | any;
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

const initialState: UpdateWorkflowState = {
  workflowId: null,
  currentStep: null,
  status: 'IDLE',
};

const updateWorkflowSlice = createSlice({
  name: 'updateWorkflow',
  initialState,
  reducers: {
    // Set workflowId and step info after successful submission
    setUpdateWorkflowData: (
      state,
      action: PayloadAction<{
        workflowId: string;
        stepName: string;
        status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
      }>
    ) => {
      state.workflowId = action.payload.workflowId;
      state.currentStep = action.payload.stepName;
      state.status = action.payload.status;
    },

    // Update only the workflowId (for backward compatibility)
    setUpdateWorkflowId: (state, action: PayloadAction<string>) => {
      state.workflowId = action.payload;
      console.log('📝 Update workflowId set:', action.payload);
    },

    // Update current step
    setCurrentStep: (state, action: PayloadAction<string>) => {
      state.currentStep = action.payload;
    },

    // Update status
    setUpdateWorkflowStatus: (
      state,
      action: PayloadAction<'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'>
    ) => {
      state.status = action.payload;
    },

    // Reset workflow state (e.g., when starting a new update process)
    resetUpdateWorkflow: () => initialState,
  },
  extraReducers: (builder) => {
    // Listen to Entity Profile submission success
    builder.addCase(submitUpdatedEntityProfile.fulfilled, (state, action) => {
      if (action.payload?.data) {
        state.workflowId = action.payload.data.workflowId ?? null;
        state.currentStep = action.payload.data.stepName ?? null;
        state.status =
          (action.payload.data.status as
            | 'IN_PROGRESS'
            | 'COMPLETED'
            | 'FAILED') ?? 'IDLE';
        console.log(
          '✅ Entity Profile submitted - workflowId updated:',
          action.payload.data
        );
      }
    });

    // Listen to Address Details submission success
    builder.addCase(submitUpdatedAddressDetails.fulfilled, (state, action) => {
      if (action.payload?.data) {
        state.workflowId = action.payload.data.workflowId ?? null;
        state.currentStep = action.payload.data.stepName ?? null;
        state.status =
          (action.payload.data.status as
            | 'IN_PROGRESS'
            | 'COMPLETED'
            | 'FAILED') ?? 'IDLE';
        console.log(
          '✅ Address Details submitted - workflowId updated:',
          action.payload.data
        );
      }
    });

    // Listen to Head of Institution submission success
    builder.addCase(submitUpdatedHoiDetails.fulfilled, (state, action) => {
      if (action.payload?.data) {
        state.workflowId = action.payload.data.workflowId ?? null;
        state.currentStep = action.payload.data.stepName ?? null;
        state.status =
          (action.payload.data.status as
            | 'IN_PROGRESS'
            | 'COMPLETED'
            | 'FAILED') ?? 'IDLE';
        console.log(
          '✅ Head of Institution submitted - workflowId updated:',
          action.payload.data
        );
      }
    });

    // Listen to Nodal Officer submission success
    builder.addCase(
      submitUpdatedNodalOfficerDetails.fulfilled,
      (state, action) => {
        if (action.payload?.data) {
          state.workflowId = action.payload.data.workflowId ?? null;
          state.currentStep = action.payload.data.stepName ?? null;
          state.status =
            (action.payload.data.status as
              | 'IN_PROGRESS'
              | 'COMPLETED'
              | 'FAILED') ?? 'IDLE';
          console.log(
            '✅ Nodal Officer submitted - workflowId updated:',
            action.payload.data
          );
        }
      }
    );

    // Listen to Admin User submission success
    builder.addCase(
      submitUpdatedAdminUserDetails.fulfilled,
      (state, action) => {
        if (action.payload?.data) {
          state.workflowId = action.payload.data.workflowId ?? null;
          state.currentStep = action.payload.data.stepName ?? null;
          state.status =
            (action.payload.data.status as
              | 'IN_PROGRESS'
              | 'COMPLETED'
              | 'FAILED') ?? 'IDLE';
          console.log(
            '✅ Admin User submitted - workflowId updated:',
            action.payload.data
          );
        }
      }
    );
  },
});

export const {
  setUpdateWorkflowData,
  setUpdateWorkflowId,
  setCurrentStep,
  setUpdateWorkflowStatus,
  resetUpdateWorkflow,
} = updateWorkflowSlice.actions;

// Selectors
export const selectUpdateWorkflowId = (state: {
  updateWorkflow: UpdateWorkflowState;
}) => state.updateWorkflow.workflowId;
export const selectUpdateCurrentStep = (state: {
  updateWorkflow: UpdateWorkflowState;
}) => state.updateWorkflow.currentStep;
export const selectUpdateWorkflowStatus = (state: {
  updateWorkflow: UpdateWorkflowState;
}) => state.updateWorkflow.status;

export default updateWorkflowSlice.reducer;
