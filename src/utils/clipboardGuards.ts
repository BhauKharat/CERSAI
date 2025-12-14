/**
 * Utility helpers to centrally control clipboard interactions.
 */

let copyListener: ((event: ClipboardEvent) => void) | null = null;
let contextMenuListener: ((event: MouseEvent) => void) | null = null;

const preventCopy = (event: ClipboardEvent) => {
  // Stop any copy action and clear clipboard payload
  event.preventDefault();
  event.stopPropagation();

  if (event.clipboardData) {
    event.clipboardData.clearData();
    event.clipboardData.setData('text/plain', '');
  }
};

// Block right-click context menu so copy options are hidden
const preventContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

/**
 * Attach a single global listener that suppresses copy operations.
 * Uses capture phase to ensure it runs before component-level handlers.
 */
export const attachCopyGuard = () => {
  if (copyListener) {
    return;
  }

  copyListener = preventCopy;
  contextMenuListener = preventContextMenu;

  document.addEventListener('copy', copyListener, true);
  document.addEventListener('contextmenu', contextMenuListener, true);
};

/**
 * Remove the global copy guard. Useful for cleanup in tests/unmounts.
 */
export const detachCopyGuard = () => {
  if (copyListener) {
    document.removeEventListener('copy', copyListener, true);
    copyListener = null;
  }

  if (contextMenuListener) {
    document.removeEventListener('contextmenu', contextMenuListener, true);
    contextMenuListener = null;
  }
};
