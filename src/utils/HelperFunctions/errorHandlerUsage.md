# Error Handler Usage Guide

This guide shows how to use the new error handling system in your Redux slices and components.

## 1. In Redux Slices (Async Thunks)

### Before (Old Way):
```typescript
} catch (error: any) {
  if (error.response && error.response.data) {
    return rejectWithValue(
      error.response.data.message || error.response.data.errorMessage
    );
  }
  return rejectWithValue('Something went wrong');
}
```

### After (New Way):
```typescript
import { createSliceErrorObject } from '../../../../utils/HelperFunctions/errorHandler';

} catch (error: any) {
  console.log('🚀 API Error:', error);
  const processedError = createSliceErrorObject(error);
  console.log('🚀 Processed Error:', processedError);
  
  // Return the processed error message
  return rejectWithValue(processedError.message);
}
```

## 2. In Components (Handling Errors)

### Basic Error Display:
```typescript
import { processApiError, getToastErrorMessage } from '../utils/HelperFunctions/errorHandler';
import { toast } from 'react-toastify';

// In your component
const handleApiCall = async () => {
  try {
    await dispatch(someAsyncThunk()).unwrap();
  } catch (error) {
    const processedError = processApiError(error);
    
    // Show toast notification
    toast.error(getToastErrorMessage(processedError));
    
    // Handle validation errors
    if (processedError.isValidationError && processedError.fieldErrors) {
      setFieldErrors(processedError.fieldErrors);
    }
  }
};
```

### Form Validation Error Handling:
```typescript
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

// In your error handling
if (processedError.isValidationError && processedError.fieldErrors) {
  setFieldErrors(processedError.fieldErrors);
} else {
  // Clear field errors for non-validation errors
  setFieldErrors({});
  toast.error(processedError.message);
}
```

## 3. Error Response Formats Handled

### Validation Error (400 with field errors):
```json
{
  "error": {
    "status": 400,
    "code": "ERR_RE_002",
    "type": "ERROR_FORM_VALIDATION",
    "message": "",
    "errors": [
      {
        "field": "name",
        "message": "validation / error message"
      }
    ]
  }
}
```

### General Error (400/500/401/403):
```json
{
  "error": {
    "status": 400,
    "code": "ERR_RE_001",
    "type": "ERROR_INVALID_DATA",
    "message": "some description message"
  }
}
```

## 4. Processed Error Object

The `processApiError` function returns a standardized error object:

```typescript
interface ProcessedError {
  message: string;           // User-friendly error message
  status: number;           // HTTP status code
  code: string;             // Error code from API
  type: string;             // Error type from API
  fieldErrors?: Record<string, string>; // Field-specific errors
  isValidationError: boolean; // True if it's a validation error
}
```

## 5. Utility Functions Available

- `processApiError(error)` - Processes any error into standardized format
- `createSliceErrorObject(error)` - For use in Redux slices
- `createSliceErrorMessage(error)` - Returns just the error message
- `getToastErrorMessage(error)` - Gets user-friendly message for toasts
- `isValidationError(error)` - Checks if error is validation error
- `isAuthError(error)` - Checks if error is authentication error
- `formatFieldErrors(fieldErrors)` - Formats field errors as string

## 6. Complete Example

```typescript
// In your async thunk
export const submitForm = createAsyncThunk(
  'form/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/submit', formData);
      return response.data;
    } catch (error: any) {
      const processedError = createSliceErrorObject(error);
      return rejectWithValue(processedError.message);
    }
  }
);

// In your component
const handleSubmit = async (formData) => {
  try {
    await dispatch(submitForm(formData)).unwrap();
    toast.success('Form submitted successfully!');
  } catch (error) {
    const processedError = processApiError(error);
    
    if (processedError.isValidationError && processedError.fieldErrors) {
      // Handle field-specific errors
      setFieldErrors(processedError.fieldErrors);
      toast.error('Please correct the validation errors');
    } else {
      // Handle general errors
      toast.error(processedError.message);
    }
  }
};
```

This system provides consistent error handling across your entire application and properly handles all the error response formats from your API.
