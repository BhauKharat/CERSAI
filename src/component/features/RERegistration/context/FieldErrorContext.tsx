import React, { createContext, useContext, ReactNode } from 'react';

interface FieldErrorContextType {
  fieldErrors: Record<string, string>;
  getFieldError: (fieldName: string) => string | undefined;
  hasFieldError: (fieldName: string) => boolean;
}

const FieldErrorContext = createContext<FieldErrorContextType>({
  fieldErrors: {},
  getFieldError: () => undefined,
  hasFieldError: () => false,
});

interface FieldErrorProviderProps {
  children: ReactNode;
  fieldErrors?: Record<string, string>;
}

export const FieldErrorProvider: React.FC<FieldErrorProviderProps> = ({
  children,
  fieldErrors = {},
}) => {
  const getFieldError = (fieldName: string): string | undefined => {
    return fieldErrors[fieldName];
  };

  const hasFieldError = (fieldName: string): boolean => {
    return Boolean(fieldErrors[fieldName]);
  };

  const value: FieldErrorContextType = {
    fieldErrors,
    getFieldError,
    hasFieldError,
  };

  return (
    <FieldErrorContext.Provider value={value}>
      {children}
    </FieldErrorContext.Provider>
  );
};

export const useFieldError = () => {
  const context = useContext(FieldErrorContext);
  if (!context) {
    // Return default values if context is not available
    return {
      fieldErrors: {},
      getFieldError: () => undefined,
      hasFieldError: () => false,
    };
  }
  return context;
};

export default FieldErrorContext;
