// Helper functions
export const formatDate = (date: string | number | Date): string =>
  new Date(date).toLocaleDateString();
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
