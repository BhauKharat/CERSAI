/**
 * Index file for request-details types
 * Re-exports all types for easier imports
 */

// Existing types for RE Registration
export * from './applicationActionTypes';
export * from './applicationPreviewTypes';

// Types for User Profile Update (Admin Approval Flow)
export * from './userProfileApprovalTypes';
export * from './userProfileTrackStatusTypes';

// Note: userProfileUpdatePreviewTypes not exported to avoid duplicate type conflicts
// Use userProfileApprovalTypes instead (more comprehensive)
