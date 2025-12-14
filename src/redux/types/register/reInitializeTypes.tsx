export interface ReinitializeResponse {
  applicationId?: number;
  acknowledgement_no: string | null;
  approvalStatus: string;
  message: string;
  existingDraft: boolean;
  lastUpdated: string;
  completionPercentage: number;
  pendingSections: string[];
  modificationStatus?: string | null;
  modifiableFields?: Record<string, string[]>;
}
