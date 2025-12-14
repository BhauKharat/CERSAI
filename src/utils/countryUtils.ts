export interface Country {
  name: string;
  dial_code: string;
  code: string;
  states?: {
    value: string;
    label: string;
    districts: {
      value: string;
      label: string;
      pincodes?: string[]; // Add this line
    }[];
  }[];
}

export const fetchCountryCodes = async (): Promise<Country[]> => {
  try {
    const response = await fetch('/ckyc/data/CountryCodes.json');
    if (!response.ok) {
      throw new Error('Failed to fetch country codes');
    }
    const data: Country[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading country codes:', error);
    return [];
  }
};
