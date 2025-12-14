// Hook to use frontend form configuration instead of API calls
// This hook loads the form config from frontend and fetches fieldOptions from the existing form fields API

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FrontendFormConfig, FrontendFormField } from '../types/configTypes';
import { DropdownOption } from '../types/configTypes';
import { API_ENDPOINTS } from '../../../../../Constant';

interface FormFieldsAPIResponse {
  status: boolean;
  message: string;
  data: {
    fields: Array<{
      id: number;
      fieldName: string;
      fieldOptions?: DropdownOption[];
    }>;
  };
}

interface UseFrontendFormConfigResult {
  fields: FrontendFormField[];
  configuration: FrontendFormConfig['configuration'] | null;
  loading: boolean;
  error: string | null;
  groupedFields?: Record<string, { fields: FrontendFormField[] }>;
}

/**
 * Maps form type to API endpoint
 */
const getFormFieldsAPIEndpoint = (formType: string): string | null => {
  const endpointMap: Record<string, string> = {
    RE_entityProfile: API_ENDPOINTS.get_form_fields,
    RE_hoi: API_ENDPOINTS.get_head_of_institution_fields,
    RE_nodal: API_ENDPOINTS.get_nodal_officer_fields,
    RE_addressDetails: API_ENDPOINTS.get_address_details_fields,
    RE_iau: API_ENDPOINTS.get_admin_user_details_fields,
    RE_formPreview: API_ENDPOINTS.get_form_preview_fields,
  };
  return endpointMap[formType] || null;
};

/**
 * Hook to use frontend form configuration
 * Fetches fieldOptions from the existing form fields API and merges them with frontend config
 * @param formConfig - The frontend form configuration object
 * @returns Form fields, configuration, loading state, and error
 */
export const useFrontendFormConfig = (
  formConfig: FrontendFormConfig
): UseFrontendFormConfigResult => {
  const [loading, setLoading] = useState(true); // Start as true to fetch fieldOptions
  const [error, setError] = useState<string | null>(null);
  const [apiFieldOptions, setApiFieldOptions] = useState<
    Record<number, DropdownOption[]>
  >({});

  // Fetch fieldOptions from the existing form fields API
  useEffect(() => {
    const fetchFieldOptions = async () => {
      const endpoint = getFormFieldsAPIEndpoint(formConfig.formType);
      
      if (!endpoint) {
        console.warn(`No API endpoint found for form type: ${formConfig.formType}`);
        setLoading(false);
        return;
      }

      try {
        console.log(`📡 Fetching fieldOptions from API: ${endpoint}`);
        const response = await axios.get<FormFieldsAPIResponse>(endpoint);
        
        if (response.data.status && response.data.data?.fields) {
          // Create a map of fieldId -> fieldOptions from API response
          const optionsMap: Record<number, DropdownOption[]> = {};
          
          response.data.data.fields.forEach((apiField) => {
            if (apiField.fieldOptions && apiField.fieldOptions.length > 0) {
              optionsMap[apiField.id] = apiField.fieldOptions;
            }
          });
          
          setApiFieldOptions(optionsMap);
          console.log(`✅ FieldOptions loaded from API:`, Object.keys(optionsMap).length, 'fields');
          setError(null);
        } else {
          console.warn('API response does not contain fieldOptions');
        }
      } catch (err) {
        console.error('Error fetching fieldOptions from API:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch fieldOptions'
        );
        // Don't block form loading - continue without fieldOptions
      } finally {
        setLoading(false);
      }
    };

    fetchFieldOptions();
  }, [formConfig.formType]);

  // Enrich fields with fieldOptions from API
  const enrichedFields = useMemo(() => {
    return formConfig.fields.map((field) => {
      // If API has fieldOptions for this field, use them
      if (apiFieldOptions[field.id]) {
        return {
          ...field,
          fieldOptions: apiFieldOptions[field.id],
        };
      }
      // Otherwise return field as-is (may have fieldMaster for DynamicForm to handle)
      return field;
    });
  }, [formConfig.fields, apiFieldOptions]);

  return {
    fields: enrichedFields,
    configuration: formConfig.configuration,
    groupedFields: formConfig.groupedFields,
    loading,
    error,
  };
};

