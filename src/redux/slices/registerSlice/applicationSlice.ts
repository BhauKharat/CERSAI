/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/slices/applicationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface ApplicationFormData {
  entityDetails: Record<string, any>;
  addressDetails: Record<string, any>;
  headOfInstitution: Record<string, any>;
  nodalOfficer: Record<string, any>;
  institutionalAdmin: Record<string, any>;
  formPreview: Record<string, any>;
}

interface StepperState {
  completedSteps: number[];
  currentStep: number;
  totalSteps: number;
}

interface ApplicationState {
  applicationFormData: ApplicationFormData;
  stepperState: StepperState;
}

const initialState: ApplicationState = {
  applicationFormData: {
    entityDetails: {},
    addressDetails: {},
    headOfInstitution: {},
    nodalOfficer: {},
    institutionalAdmin: {},
    formPreview: {},
  },
  stepperState: {
    completedSteps: [],
    currentStep: 0,
    totalSteps: 6, // Updated to match your 6 steps
  },
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setApplicationFormData: (
      state,
      action: PayloadAction<{ section: keyof ApplicationFormData; data: any }>
    ) => {
      state.applicationFormData[action.payload.section] = action.payload.data;
    },

    updateApplicationFormData: (
      state,
      action: PayloadAction<
        Partial<ApplicationFormData[keyof ApplicationFormData]>
      >
    ) => {
      const currentSection = state.stepperState.currentStep;
      const sectionKey = Object.keys(state.applicationFormData)[
        currentSection
      ] as keyof ApplicationFormData;
      if (sectionKey) {
        state.applicationFormData[sectionKey] = {
          ...state.applicationFormData[sectionKey],
          ...action.payload,
        };
      }
    },

    markStepCompleted: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (!state.stepperState.completedSteps.includes(step)) {
        state.stepperState.completedSteps.push(step);
        // Sort completed steps to maintain order
        state.stepperState.completedSteps.sort((a, b) => a - b);
      }
    },

    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.stepperState.currentStep = action.payload;
    },

    setCompletedSteps: (state, action: PayloadAction<number[]>) => {
      state.stepperState.completedSteps = action.payload;
    },

    resetStepper: (state) => {
      state.stepperState = { ...initialState.stepperState };
    },
  },
});

export const {
  setApplicationFormData,
  updateApplicationFormData,
  markStepCompleted,
  setCurrentStep,
  setCompletedSteps,
  resetStepper,
} = applicationSlice.actions;

export default applicationSlice.reducer;
