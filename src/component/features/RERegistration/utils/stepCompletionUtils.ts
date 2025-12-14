/**
 * Utility functions for determining step completion status
 * based on actual data availability in the registration flow
 */

export interface StepCompletionPayload {
  entityDetails?: Record<string, unknown>;
  addresses?: Record<string, unknown>;
  hoi?: Record<string, unknown>;
  nodalOfficer?: Record<string, unknown>;
  adminUserDetails?: Record<string, unknown>;
  institutionalAdminUser?: Record<string, unknown>;
  application_esign?: {
    declarationDate: number[];
    declarationPlace: string;
    declarationAccepted: boolean;
  };
  submission?: {
    submittedAt: string;
    submittedBy: string;
  };
  [key: string]: unknown;
}

/**
 * Determines completed steps based on actual data availability
 * @param payload - The payload data from reinitialize API response
 * @returns Array of completed step indices
 */
export const getCompletedStepsFromData = (
  payload: StepCompletionPayload | Record<string, unknown> | null | undefined
): number[] => {
  if (!payload) {
    return [];
  }

  const completedIndices: number[] = [];

  console.log('🔍 Checking step completion based on data availability:', {
    payload: Object.keys(payload),
  });

  // Check each step for data availability
  // Step 0: Entity Profile - check for entityDetails
  if (payload.entityDetails && Object.keys(payload.entityDetails).length > 0) {
    completedIndices.push(0);
    console.log('✅ Entity Profile step has data - marking as completed');
  }

  // Step 1: Address Details - check for addresses
  if (payload.addresses && Object.keys(payload.addresses).length > 0) {
    completedIndices.push(1);
    console.log('✅ Address Details step has data - marking as completed');
  }

  // Step 2: Head of Institution - check for hoi
  if (payload.hoi && Object.keys(payload.hoi).length > 0) {
    completedIndices.push(2);
    console.log('✅ Head of Institution step has data - marking as completed');
  }

  // Step 3: Nodal Officer - check for nodalOfficer
  if (payload.nodalOfficer && Object.keys(payload.nodalOfficer).length > 0) {
    completedIndices.push(3);
    console.log('✅ Nodal Officer step has data - marking as completed');
  }

  // Step 4: Admin User Details - check for adminUserDetails
  if (
    payload.institutionalAdminUser &&
    Object.keys(payload.institutionalAdminUser).length > 0
  ) {
    completedIndices.push(4);
    console.log('✅ Admin User Details step has data - marking as completed');
  }

  // Step 5: Form Preview - if user has reached this step, mark as completed
  // This step is completed when user has sufficient data to reach preview OR when explicitly on preview
  const hasMinimumSteps = completedIndices.length >= 3; // At least 3 steps completed to reach preview
  const hasFormPreviewData = payload.application_esign || payload.submission; // Has preview-related data

  if (hasMinimumSteps || hasFormPreviewData) {
    completedIndices.push(5);
    console.log(
      '✅ Form Preview step - user has reached preview stage, marking as completed'
    );
  }

  console.log(
    '🟢 Completed steps based on data availability:',
    completedIndices
  );
  return completedIndices;
};

/**
 * Checks if a specific step has data
 * @param payload - The payload data from reinitialize API response
 * @param stepIndex - The step index to check (0-4)
 * @returns boolean indicating if the step has data
 */
export const isStepCompleted = (
  payload: StepCompletionPayload | null | undefined,
  stepIndex: number
): boolean => {
  if (!payload) {
    return false;
  }

  const stepDataKeys = [
    'entityDetails',
    'addresses',
    'hoi',
    'nodalOfficer',
    'adminUserDetails',
    'formPreview', // Step 5: Form Preview
  ];

  const dataKey = stepDataKeys[stepIndex];
  if (!dataKey) {
    return false;
  }

  // Special handling for step 5 (Form Preview)
  if (stepIndex === 5) {
    // Form Preview step is completed if user has reached this stage
    // Check if at least 4 previous steps have data
    const completedSteps = getCompletedStepsFromData(payload);
    return completedSteps.includes(5);
  }

  const stepData = payload[dataKey] as Record<string, unknown> | undefined;
  return !!(stepData && Object.keys(stepData).length > 0);
};

/**
 * Gets the completion status for all steps
 * @param payload - The payload data from reinitialize API response
 * @returns Object with step completion status
 */
export const getStepCompletionStatus = (
  payload: StepCompletionPayload | null | undefined
) => {
  const stepNames = [
    'Entity Profile',
    'Address Details',
    'Head of Institution',
    'Nodal Officer',
    'Admin User Details',
    'Form Preview',
  ];

  return stepNames.map((name, index) => ({
    stepIndex: index,
    stepName: name,
    isCompleted: isStepCompleted(payload, index),
  }));
};
