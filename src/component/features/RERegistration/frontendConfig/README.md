# Frontend Form Configuration

This directory contains the frontend form configuration implementation for the 6-step Registration Stepper Form.

## Overview

This implementation moves form configuration (field structure, validation rules, options, etc.) from backend APIs to the frontend. Backend APIs are now only used to fetch master data (dropdown/options).

## Structure

```
frontendConfig/
├── configs/           # Form configuration files for each step
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and hooks
├── components/       # Reusable components (if needed)
└── README.md        # This file
```

## Configuration Files

Each step has its own configuration file in `configs/`:

- `entityProfileConfig.ts` - Step 1: Entity Profile
- `headOfInstitutionConfig.ts` - Step 3: Head of Institution Details
- `nodalOfficerConfig.ts` - Step 4: Nodal Officer Details
- `addressDetailsConfig.ts` - Step 2: Address Details
- `adminUserDetailsConfig.ts` - Step 5: Admin User Details
- `formPreviewConfig.ts` - Step 6: Form Preview (if needed)

## Usage

### Using the Hook

```typescript
import { useFrontendFormConfig } from './frontendConfig/utils/useFrontendFormConfig';
import { entityProfileConfig } from './frontendConfig/configs/entityProfileConfig';

const MyComponent = () => {
  const { fields, configuration, loading, error } = useFrontendFormConfig(
    entityProfileConfig
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  // Use fields and configuration to render form
  return <DynamicForm fields={fields} configuration={configuration} />;
};
```

### Master Data Fetching

Master data (dropdown options) is automatically fetched from backend APIs using the `masterDataFetcher` utility. Fields with `fieldMaster` property will have their options populated from the API.

## Migration Notes

- **Existing implementation is preserved** - This is a new implementation alongside the existing one
- **No breaking changes** - Existing code continues to work
- **Future removal** - Once validated, the old API-driven implementation can be removed

## Benefits

1. **Faster form loading** - No need to wait for form config API calls
2. **Better offline support** - Form structure is available immediately
3. **Easier testing** - Form configs can be easily modified for testing
4. **Version control** - Form changes are tracked in git
5. **Reduced API calls** - Only master data needs to be fetched

## Master Data Keys

Common master data keys that need to be fetched from API:

- `regulators` - List of regulators
- `institutionTypes` - Institution types (may be dependent on regulator)
- `constitutions` - Constitution types
- `citizenship` - Citizenship options
- `titles` - Title options (Mr., Mrs., etc.)
- `gender` - Gender options
- `countryCode` - Country code options
- `proofOfIdentities` - Proof of identity types

## Adding New Fields

To add a new field to a form:

1. Open the appropriate config file in `configs/`
2. Add the field definition to the `fields` array
3. Ensure proper `fieldOrder` and `fieldOrderGroup`
4. Add validation rules as needed
5. If the field needs dropdown options, set `fieldMaster` to the appropriate master data key

## Conditional Logic

Fields can have conditional logic that changes validation rules or field attributes based on other field values. See the existing configs for examples.

