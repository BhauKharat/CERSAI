// Utility for fetching master data (dropdown options) from backend APIs
// This is the only API interaction needed - form configuration is now in frontend

import axios from 'axios';
import { API_ENDPOINTS } from '../../../../../Constant';
import { DropdownOption } from '../types/configTypes';

export interface MasterDataResponse {
  status: boolean;
  message: string;
  data: DropdownOption[];
}

/**
 * Fetches master data (dropdown options) from backend API
 * @param masterDataKey - The key identifying which master data to fetch (e.g., 'regulators', 'constitutions')
 * @returns Promise with dropdown options
 */
export const fetchMasterData = async (
  masterDataKey: string
): Promise<DropdownOption[]> => {
  try {
    // For now, return empty array - master data will be fetched by existing dropdown mechanisms
    // This prevents blocking form loading if master data API is not available
    // TODO: Implement proper master data API endpoint when available
    console.log(`ℹ️ Master data fetch requested for: ${masterDataKey} (using existing dropdown mechanisms)`);
    
    // Return empty array - fields will use fieldOptions from config if available
    // Or existing dropdown fetching mechanisms will handle it
    return [];
    
    // Uncomment below when master data API is ready:
    /*
    // Construct the API endpoint for master data
    // Adjust this based on your actual master data API structure
    const baseUrl = (API_ENDPOINTS as any).baseUrl || (API_ENDPOINTS as any).CMS_URL || '';
    const endpoint = `${baseUrl}/api/masters/${masterDataKey}`;
    
    const response = await axios.get<MasterDataResponse>(endpoint);
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    
    console.warn(`No data returned for master data key: ${masterDataKey}`);
    return [];
    */
  } catch (error) {
    console.warn(`Warning: Could not fetch master data for ${masterDataKey}:`, error);
    // Return empty array instead of throwing - don't block form loading
    return [];
  }
};

/**
 * Fetches multiple master data sets in parallel
 * @param masterDataKeys - Array of master data keys to fetch
 * @returns Promise with a map of master data key to options
 */
export const fetchMultipleMasterData = async (
  masterDataKeys: string[]
): Promise<Record<string, DropdownOption[]>> => {
  const promises = masterDataKeys.map(async (key) => {
    const data = await fetchMasterData(key);
    return { key, data };
  });

  const results = await Promise.all(promises);
  
  return results.reduce((acc, { key, data }) => {
    acc[key] = data;
    return acc;
  }, {} as Record<string, DropdownOption[]>);
};

