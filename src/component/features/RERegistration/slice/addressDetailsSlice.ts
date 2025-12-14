import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../../Constant';
import { Secured } from '../../../../utils/HelperFunctions/api';
import {
  AddressDetailsState,
  AddressDetailsResponse,
  AddressFieldError,
  DropdownOption,
  AddressFormValues,
  AddressFormField,
} from '../types/addressDetailsTypes';

// Initial state
const initialState: AddressDetailsState = {
  fields: [],
  groupedFields: {},
  configuration: null,
  formValues: {},
  fieldErrors: [],
  loading: false,
  error: null,
  dropdownOptions: {},
  dependentDropdownLoading: {},
};

// Async thunk to fetch address details form fields
export const fetchAddressDetailsFields = createAsyncThunk(
  'addressDetails/fetchFields',
  async (_, { rejectWithValue }) => {
    try {
      console.log(
        '🚀 Fetching address details fields from:',
        API_ENDPOINTS.get_address_details_fields
      );
      // Use direct axios call since this is a different base URL than the Secured instance
      const response = await axios.get(
        API_ENDPOINTS.get_address_details_fields
      );
      console.log('✅ Address details API response:', response.data);
      return response.data as AddressDetailsResponse;
    } catch (error: unknown) {
      console.error('❌ Address details API error:', error);
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Failed to fetch address details fields'
          : 'Failed to fetch address details fields';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch dependent dropdown options
export const fetchDependentDropdownOptions = createAsyncThunk(
  'addressDetails/fetchDependentDropdownOptions',
  async (
    {
      url,
      method = 'GET',
      fieldId,
      fieldName,
      headers = {},
      payload = null,
      responseMapping,
    }: {
      url: string;
      method?: string;
      fieldId: number;
      fieldName: string;
      headers?: Record<string, string>;
      payload?: Record<string, unknown> | null;
      responseMapping?: {
        label: string;
        value: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      console.log(
        `🚀 Fetching dependent dropdown options for ${fieldName} (ID: ${fieldId}):`,
        {
          url,
          method,
          headers,
          payload,
          responseMapping,
        }
      );

      let response;
      if (method.toUpperCase() === 'POST') {
        console.log(`📤 Making POST request to ${url} for field ${fieldName}`);
        response = await Secured.post(url, payload, { headers });
      } else {
        console.log(`📥 Making GET request to ${url} for field ${fieldName}`);
        response = await Secured.get(url, { headers });
      }

      console.log(`✅ API response for ${fieldName}:`, response.data);

      // Handle different response structures
      let responseData = response.data;
      if (response.data && response.data.data) {
        responseData = response.data.data;
      }

      // Ensure we have an array
      const optionsArray = Array.isArray(responseData) ? responseData : [];
      // console.log(`📋 Options array for ${fieldName}:`, optionsArray);

      // Transform options based on response mapping
      let transformedOptions: DropdownOption[] = [];
      if (responseMapping) {
        // console.log(`📋 Options array for ${fieldName}:`, optionsArray);
        // console.log(
        //   `🔄 Using response mapping for ${fieldName}:`,
        //   responseMapping
        // );

        // Debug: Show first few raw options to understand structure
        if (fieldName === 'registerPincode') {
          console.log(
            `🔍 First 3 raw pincode options:`,
            JSON.stringify(optionsArray.slice(0, 3), null, 2)
          );
          console.log(
            `🔍 Available properties in first pincode option:`,
            Object.keys(optionsArray[0] || {})
          );
          console.log(`🔍 Response mapping expects:`, responseMapping);
        }
        transformedOptions = optionsArray.map(
          (option: Record<string, unknown>) => {
            let mappedOption;

            // Special handling for pincode fields
            if (
              fieldName === 'registerPincode' ||
              fieldName.toLowerCase().includes('pincode')
            ) {
              mappedOption = {
                label: (option.pincode as string) || '',
                value: (option.pincode as string) || '',
              };
              console.log(`🔧 Using pincode-specific mapping for ${fieldName}`);
            } else {
              // Use configured response mapping for other fields
              mappedOption = {
                label: (option[responseMapping.label] as string) || '',
                value: (option[responseMapping.value] as string) || '',
              };
            }

            // Debug for pincode mapping
            if (
              fieldName === 'registerPincode' &&
              optionsArray.indexOf(option) < 3
            ) {
              console.log(
                `🔍 Mapping option ${optionsArray.indexOf(option)}:`,
                {
                  original: option,
                  mapped: mappedOption,
                  usingPincodeMapping: fieldName
                    .toLowerCase()
                    .includes('pincode'),
                }
              );
            }

            return mappedOption;
          }
        );
      } else {
        console.log(`🔄 Using default mapping for ${fieldName}`);
        // Default mapping - try common property names
        transformedOptions = optionsArray.map(
          (option: Record<string, unknown>, index: number) => {
            const label = (option.label ||
              option.name ||
              option.text ||
              option.title ||
              `Option ${index + 1}`) as string;
            const value = (option.value ||
              option.id ||
              option.code ||
              option.key ||
              option.pincode || // Special case for pincode API
              `option_${index}`) as string;
            return { label, value };
          }
        );
      }

      // Append a single "Others" option if it's not already present
      // Exclude State fields from having "Others" option
      const isStateField = fieldName.toLowerCase().includes('state');
      // const OTHERS_OPTION = { label: 'Other', value: 'other' };

      const hasOthers = transformedOptions.some(
        (opt) =>
          String(opt.label).toLowerCase() === 'others' ||
          String(opt.value).toLowerCase() === 'others'
      );

      if (!hasOthers && !isStateField) {
        // transformedOptions.push(OTHERS_OPTION);
      }

      console.log(
        `🎯 Final transformed options for ${fieldName}:`,
        transformedOptions
      );

      return {
        fieldId,
        fieldName,
        options: transformedOptions,
      };
    } catch (error: unknown) {
      console.error(`❌ Error fetching options for ${fieldName}:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to fetch options for ${fieldName}`;
      return rejectWithValue({ fieldId, fieldName, error: errorMessage });
    }
  }
);

// Address Details Slice
const addressDetailsSlice = createSlice({
  name: 'addressDetails',
  initialState,
  reducers: {
    // Update form value
    updateFormValue: (
      state,
      action: PayloadAction<{
        fieldName: string;
        value: string | File | null | boolean;
      }>
    ) => {
      state.formValues[action.payload.fieldName] = action.payload.value;

      if (
        action.payload.fieldName === 'correspondencePincode' ||
        action.payload.fieldName === 'registerPincode'
      ) {
        const isOther =
          action.payload.value === 'Other' || action.payload.value === 'Others';

        // Determine group and target field
        const groupKey =
          action.payload.fieldName === 'correspondencePincode'
            ? 'correspondenceaddress'
            : 'registeraddress';

        const targetFieldName =
          action.payload.fieldName === 'correspondencePincode'
            ? 'correspondencePincodeOther'
            : 'registerPincodeOther';

        // Find the element inside groupedFields[groupKey].fields
        const fields = state.groupedFields[groupKey]?.fields || [];
        const targetField = fields.find(
          (field) => field.fieldName === targetFieldName
        );

        // Update isRequired based on "Other / Others"
        if (targetField) {
          targetField.isRequired = isOther;
        }
      }
      if (!action.payload.value || !action.payload.fieldName) return;
      // If State changes → clear Pincode for that group

      if (action.payload.fieldName.includes('Country')) {
        const transformFieldList = ['state', 'district', 'pincode'];

        const isCorrespondence = action.payload.fieldName
          .toLowerCase()
          .includes('correspondence');

        const groupKey = isCorrespondence
          ? 'correspondenceaddress'
          : 'registeraddress';

        const fields = state.groupedFields[groupKey]?.fields || [];

        const userValue = action.payload.value.toString().toLowerCase();
        const isIndia =
          userValue.includes('india') || userValue.includes('indian');

        // Update only transform fields
        fields.forEach((f) => {
          const name = f.fieldName.toLowerCase();

          const isCity = name.includes('city');
          const isOther = name.includes('other');
          const isTransform = transformFieldList.some((key) =>
            name.includes(key)
          );

          if (isCity) {
            f.isRequired = isIndia ? true : false;

            if (f.validationRules) {
              f.validationRules.required = isIndia ? true : false;
            } else {
              f.validationRules = { required: isIndia ? true : false };
            }

            return; // don't apply other rules
          }
          if (!isTransform || isOther) return;
          f.fieldType = isIndia ? 'dropdown' : 'textfield';
          f.isRequired = isIndia ? true : false;
          f.fieldPlaceholder = isIndia
            ? f.fieldPlaceholder.replace(/enter/gi, 'Select')
            : f.fieldPlaceholder.replace(/select/gi, 'Enter');
          if (f.validationRules) {
            f.validationRules.required = isIndia ? true : false;
          } else {
            f.validationRules = { required: isIndia ? true : false };
          }
        });
      }
    },
    updateFormValueObject: (
      state,
      action: PayloadAction<AddressFormValues>
    ) => {
      state.formValues = action.payload;
    },

    updateAddressGroupedFields: (
      state,
      action: PayloadAction<{
        groupKey: string;
        updatedFields: AddressFormField[];
      }>
    ) => {
      const { groupKey, updatedFields } = action.payload;

      const existingList = state.groupedFields[groupKey].fields;

      // Create a map for fast lookup
      const updateMap = new Map(updatedFields.map((f) => [f.fieldName, f]));

      // Merge only the updated fields
      state.groupedFields[groupKey].fields = existingList.map((item) => {
        if (updateMap.has(item.fieldName)) {
          return {
            ...item,
            ...updateMap.get(item.fieldName),
          };
        }
        return item;
      });
    },

    // Set field error
    setFieldError: (state, action: PayloadAction<AddressFieldError>) => {
      const existingErrorIndex = state.fieldErrors.findIndex(
        (error) => error.field === action.payload.field
      );
      if (existingErrorIndex >= 0) {
        state.fieldErrors[existingErrorIndex] = action.payload;
      } else {
        state.fieldErrors.push(action.payload);
      }
    },

    // Clear field error
    clearFieldError: (state, action: PayloadAction<string>) => {
      state.fieldErrors = state.fieldErrors.filter(
        (error) => error.field !== action.payload
      );
    },

    // Clear all form data
    clearForm: (state) => {
      state.formValues = {};
      state.fieldErrors = [];
    },

    // Copy values from one section to another (for "same as registered" functionality)
    copySectionValues: (
      state,
      action: PayloadAction<{ fromSection: string; toSection: string }>
    ) => {
      const { fromSection, toSection } = action.payload;

      console.log('🔄 Copying section values:', { fromSection, toSection });
      console.log('📋 Available form values:', Object.keys(state.formValues));

      // Find all fields that belong to the source section
      const sourceFields = Object.keys(state.formValues).filter((key) =>
        key.startsWith(fromSection)
      );

      console.log('📤 Source fields found:', sourceFields);

      // Copy values to target section
      sourceFields.forEach((sourceKey) => {
        const targetKey = sourceKey.replace(fromSection, toSection);
        const value = state.formValues[sourceKey];
        state.formValues[targetKey] = value;
        console.log(`✅ Copied: ${sourceKey} → ${targetKey}`, value);
      });

      // Also try alternative field naming patterns
      const alternativePatterns = [
        { from: 'registered', to: 'correspondence' },
        { from: 'register', to: 'correspondence' },
        { from: 'reg', to: 'corr' },
      ];

      alternativePatterns.forEach(({ from, to }) => {
        const altSourceFields = Object.keys(state.formValues).filter((key) =>
          key.toLowerCase().includes(from.toLowerCase())
        );

        altSourceFields.forEach((sourceKey) => {
          const targetKey = sourceKey
            .toLowerCase()
            .replace(from.toLowerCase(), to.toLowerCase());
          // Check if target field exists in form structure
          const targetExists = Object.keys(state.formValues).some(
            (key) => key.toLowerCase() === targetKey
          );

          if (targetExists) {
            const actualTargetKey = Object.keys(state.formValues).find(
              (key) => key.toLowerCase() === targetKey
            );
            if (actualTargetKey) {
              const value = state.formValues[sourceKey];
              state.formValues[actualTargetKey] = value;
              console.log(
                `✅ Alternative copy: ${sourceKey} → ${actualTargetKey}`,
                value
              );
            }
          }
        });
      });

      console.log('📋 Form values after copy:', state.formValues);
    },

    // Smart copy for address fields - maps specific field types
    copyAddressFields: (
      state,
      action: PayloadAction<{ fromGroup: string; toGroup: string }>
    ) => {
      const { fromGroup, toGroup } = action.payload;

      console.log('🏠 Smart copying address fields:', { fromGroup, toGroup });
      console.log('📋 Available form values:', Object.keys(state.formValues));

      // Define field mappings for address fields
      const addressFieldMappings = [
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'country',
        'pincode',
        'pin_code',
        'postal_code',
        'district',
        'taluka',
        'village',
        'landmark',
      ];

      // Find and copy all address-related fields
      Object.keys(state.formValues).forEach((fieldName) => {
        const fieldValue = state.formValues[fieldName];

        // Check if this field belongs to the source group and matches address patterns
        const belongsToSourceGroup = fieldName
          .toLowerCase()
          .includes(fromGroup.toLowerCase());
        const isAddressField = addressFieldMappings.some((mapping) =>
          fieldName.toLowerCase().includes(mapping.toLowerCase())
        );

        if (belongsToSourceGroup && isAddressField && fieldValue) {
          // Generate target field name
          const targetFieldName = fieldName
            .toLowerCase()
            .replace(fromGroup.toLowerCase(), toGroup.toLowerCase());

          // Find the actual target field name (case-insensitive)
          const actualTargetField = Object.keys(state.formValues).find(
            (key) => key.toLowerCase() === targetFieldName
          );

          if (actualTargetField) {
            state.formValues[actualTargetField] = fieldValue;
            console.log(
              `🏠 Copied address field: ${fieldName} → ${actualTargetField}`,
              fieldValue
            );
          } else {
            // Try direct field name replacement patterns
            const patterns = [
              { from: 'register', to: 'correspondence' },
              { from: 'registered', to: 'correspondence' },
              { from: 'reg', to: 'corr' },
            ];

            patterns.forEach(({ from, to }) => {
              if (fieldName.toLowerCase().includes(from)) {
                const altTargetName = fieldName.toLowerCase().replace(from, to);
                const altActualTarget = Object.keys(state.formValues).find(
                  (key) => key.toLowerCase() === altTargetName
                );

                if (altActualTarget) {
                  state.formValues[altActualTarget] = fieldValue;
                  console.log(
                    `🏠 Alternative copy: ${fieldName} → ${altActualTarget}`,
                    fieldValue
                  );
                }
              }
            });
          }
        }
      });

      console.log('📋 Form values after smart address copy:', state.formValues);
    },

    // Precise field mapping based on actual field structure
    copyRegisterToCorrespondenceFields: (state) => {
      console.log('🎯 Precise field mapping: Register → Correspondence');
      console.log('📋 Available form values:', Object.keys(state.formValues));
      console.log(
        '📋 Available fields:',
        state.fields.map((f) => f.fieldName)
      );

      // Get all field names from the form configuration
      const allFieldNames = state.fields.map((field) => field.fieldName);

      // Find register and correspondence field pairs
      const registerFields = allFieldNames.filter(
        (name) =>
          name.toLowerCase().includes('register') ||
          name.toLowerCase().includes('registered')
      );

      const correspondenceFields = allFieldNames.filter(
        (name) =>
          name.toLowerCase().includes('correspondence') ||
          name.toLowerCase().includes('corr')
      );

      console.log('📤 Register fields found:', registerFields);
      console.log('📥 Correspondence fields found:', correspondenceFields);

      // Create mapping between register and correspondence fields
      const fieldMappings: Array<{ from: string; to: string }> = [];

      registerFields.forEach((registerField) => {
        const registerFieldLower = registerField.toLowerCase();

        // Extract the field type/suffix (like line1, line2, city, state, etc.)
        const fieldTypeParts = registerFieldLower
          .replace(/register[ed]?/g, '')
          .replace(/[_-]/g, '')
          .trim();

        // Find matching correspondence field
        const matchingCorrespondenceField = correspondenceFields.find(
          (corrField) => {
            const corrFieldLower = corrField.toLowerCase();
            const corrFieldTypeParts = corrFieldLower
              .replace(/correspondence/g, '')
              .replace(/corr/g, '')
              .replace(/[_-]/g, '')
              .trim();

            return fieldTypeParts === corrFieldTypeParts;
          }
        );

        if (matchingCorrespondenceField) {
          fieldMappings.push({
            from: registerField,
            to: matchingCorrespondenceField,
          });
        }
      });

      console.log('🔗 Field mappings created:', fieldMappings);

      // Copy values based on precise mappings
      fieldMappings.forEach(({ from, to }) => {
        const sourceValue = state.formValues[from];
        if (
          sourceValue !== undefined &&
          sourceValue !== null &&
          sourceValue !== ''
        ) {
          state.formValues[to] = sourceValue;
          console.log(`✅ Mapped: ${from} → ${to}`, sourceValue);
        }
      });

      // Additional pattern-based mapping for common address field patterns
      const addressPatterns = [
        { pattern: 'line1', variations: ['line1', 'line_1', 'addressline1'] },
        { pattern: 'line2', variations: ['line2', 'line_2', 'addressline2'] },
        { pattern: 'line3', variations: ['line3', 'line_3', 'addressline3'] },
        { pattern: 'city', variations: ['city'] },
        { pattern: 'state', variations: ['state'] },
        { pattern: 'country', variations: ['country'] },
        {
          pattern: 'pincode',
          variations: ['pincode', 'pin_code', 'postal_code', 'zip'],
        },
        { pattern: 'district', variations: ['district'] },
        { pattern: 'taluka', variations: ['taluka', 'tehsil'] },
        { pattern: 'village', variations: ['village'] },
      ];

      addressPatterns.forEach(({ pattern, variations }) => {
        variations.forEach((variation) => {
          // Find register field with this pattern
          const registerField = allFieldNames.find((name) => {
            const nameLower = name.toLowerCase();
            return (
              (nameLower.includes('register') ||
                nameLower.includes('registered')) &&
              nameLower.includes(variation)
            );
          });

          // Find correspondence field with this pattern
          const correspondenceField = allFieldNames.find((name) => {
            const nameLower = name.toLowerCase();
            return (
              (nameLower.includes('correspondence') ||
                nameLower.includes('corr')) &&
              nameLower.includes(variation)
            );
          });

          if (registerField && correspondenceField) {
            const sourceValue = state.formValues[registerField];
            if (
              sourceValue !== undefined &&
              sourceValue !== null &&
              sourceValue !== ''
            ) {
              state.formValues[correspondenceField] = sourceValue;
              console.log(
                `✅ Pattern mapped (${pattern}): ${registerField} → ${correspondenceField}`,
                sourceValue
              );
            }
          }
        });
      });

      console.log('📋 Form values after precise mapping:', state.formValues);
    },

    // Clear values from a specific section
    clearSectionValues: (state, action: PayloadAction<string>) => {
      const sectionPrefix = action.payload;

      // Remove all form values that start with the section prefix
      Object.keys(state.formValues).forEach((key) => {
        if (key.startsWith(sectionPrefix)) {
          delete state.formValues[key];
        }
      });

      // Remove related field errors
      state.fieldErrors = state.fieldErrors.filter(
        (error) => !error.field.startsWith(sectionPrefix)
      );
    },

    // Update field options dynamically
    updateFieldOptions: (
      state,
      action: PayloadAction<{
        fieldId: number;
        options: DropdownOption[];
      }>
    ) => {
      const { fieldId, options } = action.payload;

      // Initialize dropdownOptions if not exists
      if (!state.dropdownOptions) {
        state.dropdownOptions = {};
      }

      state.dropdownOptions[fieldId] = options;

      // Also update the field's fieldOptions in the fields array
      const fieldIndex = state.fields.findIndex(
        (field) => field.id === fieldId
      );
      if (fieldIndex !== -1) {
        state.fields[fieldIndex].fieldOptions = options;
      }

      // Update in grouped fields as well
      Object.keys(state.groupedFields).forEach((groupName) => {
        const group = state.groupedFields[groupName];
        const fieldInGroupIndex = group.fields.findIndex(
          (field) => field.id === fieldId
        );
        if (fieldInGroupIndex !== -1) {
          group.fields[fieldInGroupIndex].fieldOptions = options;
        }
      });
    },

    // Clear dependent field options when parent changes
    clearDependentFieldOptions: (
      state,
      action: PayloadAction<{
        parentFieldName: string;
        dependentFieldIds: number[];
      }>
    ) => {
      const { dependentFieldIds } = action.payload;

      dependentFieldIds.forEach((fieldId) => {
        // Initialize dropdownOptions and dependentDropdownLoading if not exists
        if (!state.dropdownOptions) {
          state.dropdownOptions = {};
        }
        if (!state.dependentDropdownLoading) {
          state.dependentDropdownLoading = {};
        }

        // Clear options in state
        state.dropdownOptions[fieldId] = [];
        state.dependentDropdownLoading[fieldId] = false;

        // Clear options in fields array
        const fieldIndex = state.fields.findIndex(
          (field) => field.id === fieldId
        );
        if (fieldIndex !== -1) {
          state.fields[fieldIndex].fieldOptions = [];
        }

        // Clear options in grouped fields
        Object.keys(state.groupedFields).forEach((groupName) => {
          const group = state.groupedFields[groupName];
          const fieldInGroupIndex = group.fields.findIndex(
            (field) => field.id === fieldId
          );
          if (fieldInGroupIndex !== -1) {
            group.fields[fieldInGroupIndex].fieldOptions = [];
          }
        });

        // Clear form values for dependent fields
        const field = state.fields.find((f) => f.id === fieldId);
        if (field) {
          state.formValues[field.fieldName] = '';
        }
      });
    },
  },
  extraReducers: (builder) => {
    // Fetch address details fields
    builder
      .addCase(fetchAddressDetailsFields.pending, (state) => {
        console.log('⏳ Address details fields loading...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddressDetailsFields.fulfilled, (state, action) => {
        console.log('✅ Address details fields loaded successfully:', {
          fields: action.payload.data.fields?.length || 0,
          groupedFields: Object.keys(action.payload.data.groupedFields || {})
            .length,
          configuration: !!action.payload.data.configuration,
        });
        state.loading = false;
        state.fields = action.payload.data.fields;
        state.groupedFields = action.payload.data.groupedFields;
        state.configuration = action.payload.data.configuration;
        state.error = null;
      })
      .addCase(fetchAddressDetailsFields.rejected, (state, action) => {
        console.error(
          '❌ Address details fields failed to load:',
          action.payload
        );
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch dependent dropdown options
      .addCase(fetchDependentDropdownOptions.pending, (state, action) => {
        const { fieldId } = action.meta.arg;
        console.log(
          `⏳ Loading dependent dropdown options for field ${fieldId}...`
        );

        // Initialize dependentDropdownLoading if not exists
        if (!state.dependentDropdownLoading) {
          state.dependentDropdownLoading = {};
        }

        state.dependentDropdownLoading[fieldId] = true;
      })
      .addCase(fetchDependentDropdownOptions.fulfilled, (state, action) => {
        const { fieldId, options } = action.payload;
        // console.log(
        //   `✅ Dependent dropdown options loaded for ${fieldName} (ID: ${fieldId}):`,
        //   options
        // );
        // console.log(
        //   `✅ Options structure:`,
        //   JSON.stringify(options.slice(0, 3), null, 2)
        // );

        // Initialize objects if not exists
        if (!state.dependentDropdownLoading) {
          state.dependentDropdownLoading = {};
        }
        if (!state.dropdownOptions) {
          state.dropdownOptions = {};
        }

        state.dependentDropdownLoading[fieldId] = false;
        state.dropdownOptions[fieldId] = options;

        // Update the field's fieldOptions in the fields array
        const fieldIndex = state.fields.findIndex(
          (field) => field.id === fieldId
        );
        if (fieldIndex !== -1) {
          state.fields[fieldIndex].fieldOptions = options;
        }

        // Update in grouped fields as well
        Object.keys(state.groupedFields).forEach((groupName) => {
          const group = state.groupedFields[groupName];
          const fieldInGroupIndex = group.fields.findIndex(
            (field) => field.id === fieldId
          );
          if (fieldInGroupIndex !== -1) {
            group.fields[fieldInGroupIndex].fieldOptions = options;
          }
        });
      })
      .addCase(fetchDependentDropdownOptions.rejected, (state, action) => {
        const { fieldId, fieldName } = action.meta.arg;
        console.error(
          `❌ Failed to load dependent dropdown options for ${fieldName} (ID: ${fieldId}):`,
          action.payload
        );

        // Initialize dependentDropdownLoading if not exists
        if (!state.dependentDropdownLoading) {
          state.dependentDropdownLoading = {};
        }

        state.dependentDropdownLoading[fieldId] = false;
        // Keep existing options on error, don't clear them
      });
  },
});

// Export actions
export const {
  updateFormValue,
  updateAddressGroupedFields,
  setFieldError,
  clearFieldError,
  clearForm,
  copySectionValues,
  clearSectionValues,
  copyAddressFields,
  copyRegisterToCorrespondenceFields,
  updateFieldOptions,
  clearDependentFieldOptions,
  updateFormValueObject,
} = addressDetailsSlice.actions;

// Selectors
export const selectAddressDetailsFields = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.fields;

export const selectAddressDetailsGroupedFields = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.groupedFields;

export const selectAddressDetailsConfiguration = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.configuration;

export const selectAddressDetailsFormValues = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.formValues;

export const selectAddressDetailsLoading = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.loading;

export const selectAddressDetailsError = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.error;

export const selectAddressDetailsFieldErrors = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.fieldErrors;

export const selectAddressDetailsDropdownOptions = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.dropdownOptions;

export const selectAddressDetailsDependentDropdownLoading = (state: {
  addressDetails: AddressDetailsState;
}) => state.addressDetails.dependentDropdownLoading;

// Helper selector to get options for a specific field
export const selectFieldDropdownOptions =
  (fieldId: number) => (state: { addressDetails: AddressDetailsState }) =>
    state.addressDetails.dropdownOptions[fieldId] || [];

// Helper selector to check if a field is loading
export const selectFieldDropdownLoading =
  (fieldId: number) => (state: { addressDetails: AddressDetailsState }) =>
    state.addressDetails.dependentDropdownLoading[fieldId] || false;

export default addressDetailsSlice.reducer;
