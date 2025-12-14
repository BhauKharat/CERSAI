/**
 * Utility functions for managing localStorage and preventing quota exceeded errors
 */

export interface StorageInfo {
  used: number;
  available: number;
  total: number;
  usedPercentage: number;
}

/**
 * Clear old Redux persist data and force fresh state
 */
export const clearReduxPersistData = (): void => {
  console.log('🗑️ Clearing Redux persist data to free up storage');

  // Remove the main persist key
  localStorage.removeItem('persist:root');

  // Remove any other persist-related keys
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (key.startsWith('persist:')) {
      console.log(`🗑️ Removing persist key: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

/**
 * Initialize storage monitoring
 */
export const initializeStorageMonitoring = (): void => {
  // Clear Redux persist data immediately to prevent quota issues
  clearReduxPersistData();

  console.log('✅ Storage monitoring initialized and persist data cleared');
};
