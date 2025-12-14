// User role constants
export const USER_ROLES = {
  NODAL_OFFICER: 'Nodal_Officer',
  INSTITUTIONAL_ADMIN_USER: 'Institutional_Admin_User',
  INSTITUTIONAL_REGIONAL_ADMIN: 'Institutional_Regional_Admin',
  INSTITUTIONAL_REGIONAL_USER: 'Institutional_Regional_User',
};

// Centralized workflow type map
const WORKFLOW_TYPE_MAP: Record<string, string> = {
  CERSAI_USER_CREATION: 'Creation',
  CERSAI_USER_MODIFICATION: 'Modification',
  CERSAI_USER_SUSPENSION: 'Suspension',
  CERSAI_USER_SUSPENSION_REVOKE: 'Suspension Revoke',
  CERSAI_USER_DEACTIVATION: 'Deactivation',
};

// Centralized activity type map
const ACTIVITY_MAP: Record<string, string> = {
  CREATE: 'Creation',
  UPDATE: 'Update',
  DELETE: 'Deletion',
  MERGE: 'Merger',
  DEACTIVATE: 'De-activation',
  MODIFY: 'Modification',
  TRANSFER: 'Transfer',
  SUSPEND: 'Suspension',
  ACTIVATE: 'Activation',
  SUSPENSION_REVOKE: 'Suspension Revoke',
};

// Generic function for converting enums or codes to labels
export const getEnumLabel = (
  map: Record<string, string>,
  value?: string | null
): string => {
  if (!value) return '-';
  return map[value] ?? value;
};

// Specific formatter for workflow type
export const formatWorkflowType = (workflowType?: string): string => {
  return getEnumLabel(WORKFLOW_TYPE_MAP, workflowType);
};

// Specific formatter for activity type
export const formatActivity = (activity?: string | null): string => {
  if (!activity) return '-';
  // Trim and convert to uppercase for consistent lookup
  const normalizedActivity = activity.trim().toUpperCase();
  return getEnumLabel(ACTIVITY_MAP, normalizedActivity);
};

// Proof of Identity type map
const PROOF_OF_IDENTITY_MAP: Record<string, string> = {
  PAN_CARD: 'PAN Card',
  AADHAAR: 'Aadhaar',
  PASSPORT: 'Passport',
  DRIVING_LICENSE: 'Driving License',
  VOTER_ID: 'Voter ID',
};

// Specific formatter for Proof of Identity
export const formatProofOfIdentity = (poi?: string | null): string => {
  if (!poi) return '';
  const normalizedPoi = poi.trim().toUpperCase();
  return getEnumLabel(PROOF_OF_IDENTITY_MAP, normalizedPoi);
};
