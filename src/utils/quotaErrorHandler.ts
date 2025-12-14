/**
 * Emergency handler for localStorage quota exceeded errors
 */

/**
 * Handle QuotaExceededError by clearing storage and reloading
 */
export const handleQuotaExceededError = (): void => {
  console.error(
    '❌ localStorage quota exceeded - performing emergency cleanup'
  );

  try {
    // Clear all localStorage data
    localStorage.clear();

    // Clear sessionStorage as well
    sessionStorage.clear();

    console.log('✅ All storage cleared successfully');

    // Show user notification
    alert(
      'Storage limit reached. The application has been reset to free up space. ' +
        'You will need to log in again.'
    );

    // Reload the page to start fresh
    window.location.reload();
  } catch (error) {
    console.error('❌ Failed to clear storage:', error);

    // Last resort - redirect to login
    window.location.href = '/re-signup?tab=1';
  }
};

/**
 * Wrap localStorage.setItem with quota error handling
 */
export const safeLocalStorageSetItem = (
  key: string,
  value: string
): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.code === 22 || error.name === 'QuotaExceededError')
    ) {
      handleQuotaExceededError();
      return false;
    }
    throw error;
  }
};

/**
 * Monitor for quota exceeded errors in Redux Persist
 */
export const setupQuotaErrorMonitoring = (): void => {
  // Listen for unhandled errors that might be quota exceeded
  window.addEventListener('error', (event) => {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes('QuotaExceededError')
    ) {
      console.error('Detected QuotaExceededError:', event.error);
      handleQuotaExceededError();
    }
  });

  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.includes('QuotaExceededError')
    ) {
      console.error('Detected QuotaExceededError in promise:', event.reason);
      handleQuotaExceededError();
    }
  });

  console.log('✅ Quota error monitoring setup complete');
};
