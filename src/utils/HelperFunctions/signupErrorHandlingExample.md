# Signup Error Handling Implementation

## Updated Error Response Handling

The signup form now properly handles the standardized error response formats you specified:

### 1. Validation Errors (ERROR_FORM_VALIDATION)
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

**Handling:**
- Field-specific errors are mapped to form fields
- Errors appear under respective input fields
- Unmapped fields show in general error message

### 2. General Errors (400/401/403/500)
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

**Handling:**
- Shows the error message in the general error display
- No field-specific errors set

## Implementation Details

### SignupSlice Updates:
```typescript
// In submitSignUp async thunk
} catch (error) {
  console.error('🚀 SignUp API - Error:', error);
  const processedError = createSliceErrorObject(error);
  console.log('🚀 SignUp API - Processed Error:', processedError);
  return rejectWithValue(processedError);
}
```

### SignUp Component Updates:
```typescript
} catch (error: unknown) {
  console.error('🚀 SignUp Form - Submission error:', error);

  // Process the error using our standardized error handler
  const processedError = processApiError(error);
  console.log('🚀 SignUp Form - Processed Error:', processedError);

  // Handle validation errors with field-specific messages
  if (isValidationError(processedError) && processedError.fieldErrors) {
    // Map API field names to Formik field keys and set field errors
    Object.entries(processedError.fieldErrors).forEach(([field, message]) => {
      const mappedField = mapField(field);
      if (mappedField in formFields) {
        formik.setFieldError(mappedField, message);
      }
    });
  } else {
    // Handle non-validation errors (general errors)
    setSubmitError(processedError.message);
  }
}
```

## Field Mapping

The system maps API field names to form field names:
- `mobile` → `mobile`
- `email` → `email`
- `ckyc` → `ckycNo` or dynamic CKYC field name
- `country code` → `countryCode`
- `first name` → `firstName`
- `middle name` → `middleName`
- `last name` → `lastName`
- `title` → `title`
- `citizenship` → `citizenship`

## Error Flow

1. **API Call**: Form submission calls `submitSignUp`
2. **Error Processing**: API errors are processed by `createSliceErrorObject`
3. **Error Classification**: Errors are classified as validation or general errors
4. **Field Mapping**: Validation errors are mapped to form fields
5. **Display**: Errors appear under respective fields or as general message

## Benefits

- **Consistent Error Handling**: All error formats handled uniformly
- **Field-Specific Validation**: Validation errors appear under correct fields
- **User-Friendly Messages**: Appropriate error messages for different scenarios
- **Debugging Support**: Detailed logging for development
- **Maintainable Code**: Centralized error processing logic

This implementation ensures that all the error response formats you specified are properly handled and displayed to users in an intuitive way.
