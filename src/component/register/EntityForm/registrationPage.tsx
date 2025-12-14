/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { ReactComponent as CKYCRRLogo } from '../../../assets/ckycrr_sign_up_logo.svg';
import { RootState, AppDispatch, store } from '../../../redux/store';
import {
  submitRegistration,
  updateFormData,
} from '../../../redux/slices/registerSlice/registrationSlice';
import './registrationPage.css';
import {
  hideLoader,
  showLoader,
} from '../../../redux/slices/loader/loaderSlice';
import { setFormData } from '../../../redux/slices/registerSlice/registrationSlice';
import ApplicationStepper from '../../../component/stepper/ApplicationStepper';
import {
  setCurrentStep,
  markStepCompleted,
  setApplicationFormData,
} from '../../../redux/slices/registerSlice/applicationSlice';
import {
  formatConstitutionsForSelect,
  formatInstitutionTypesForSelect,
  formatRegulatorsForSelect,
} from '../../../utils/dropDownUtils';
import uploadIcon from '../../../assets/UploadIconNew.svg';
import UploadIconButton from '../../../assets/UploadIconButton.svg';

// Types
interface FormDataType {
  nameOfInstitution?: string;
  institutionType?: string;
  constitution?: string;
  regulator?: string;
  proprietorName?: string;
  registrationNo?: string;
  panNo?: string;
  cinNo?: string;
  cin?: File;
  re_cinPreview?: string;
  llpinNo?: string;
  gstinNo?: string;
  reWebsite?: string;
  pan?: File;
  re_panPreview?: string;
  registration_certificate?: File;
  registration_certificatePreview?: string;
  regulator_licence?: File | null;
  regulator_licencePreview?: string;
  address_proof?: File | null;
  address_proofPreview?: string;
  re_other_file?: File | null;
  re_other_filePreview?: string;
  re_pan?: File | null;
  [key: string]: unknown;
}

const REQUIRED_FIELDS = [
  'nameOfInstitution',
  'institutionType',
  'constitution',
  'regulator',
  'registrationNo',
  'panNo',
  // "cinNo",
  // "llpinNo",
  //'gstinNo',
  'regulator_licence',
  'address_proof',
] as const;

export const CONSTITUTION_OPTIONS = [
  { value: 'A', label: 'Sole Proprietorship' },
  { value: 'B', label: 'Partnership Firm' },
  { value: 'C', label: 'HUF' },
  { value: 'D', label: 'Private Limited Company' },
  { value: 'E', label: 'Public Limited Company' },
  { value: 'F', label: 'Society' },
  {
    value: 'G',
    label: 'Association of Persons (AOP) / Body of Individuals (BOI)',
  },
  { value: 'H', label: 'Trust' },
  { value: 'I', label: 'Liquidator' },
  { value: 'J', label: 'Limited Liability Partnership' },
  { value: 'K', label: 'Public Sector Banks' },
  { value: 'L', label: 'Central/State Government Department or Agency' },
  { value: 'M', label: 'Section 8 Companies (Companies Act, 2013)' },
  { value: 'N', label: 'Artificial Juridical Person' },
  { value: 'O', label: 'Not Categorized' },
];

// const isValidForm = (
//   formData: FormDataType,
//   errors: Partial<FormDataType>
// ): boolean => {
//   const dynamicRequiredFields: (keyof FormDataType)[] = [...REQUIRED_FIELDS];
//   console.log(dynamicRequiredFields, 'DYNAMICREQUIREDFIELDS');
//   // Add cinNo only for selected constitutions
//   if (['D', 'E', 'M'].includes(formData.constitution || '')) {
//     dynamicRequiredFields.push('cinNo');
//   }

//   // Add llpinNo only for LLP
//   if (formData.constitution === 'J') {
//     dynamicRequiredFields.push('llpinNo');
//   }
//   if (formData.constitution === 'A') {
//     dynamicRequiredFields.push('proprietorName');
//   }
//   if (formData.regulator !== 'IFSCA') {
//     dynamicRequiredFields.push('gstinNo');
//   }
//   const allFieldsFilled = REQUIRED_FIELDS.every((key) => {
//     const value = formData[key];
//     // return typeof value === "string" ? value.trim() !== "" : Boolean(value);
//     const isFilled =
//       typeof value === 'string' ? value.trim() !== '' : Boolean(value);
//     console.log(`Checking ${key}:`, value, 'Filled:', isFilled); // ✅ debug
//     return isFilled;
//   });

//   const noErrors = Object.values(errors).every((err) => {
//     // Type guard to check if err is a string
//     if (typeof err === 'string') {
//       return err.trim() === '';
//     }
//     // For non-string errors, consider them as "no error" if falsy
//     return !err;
//   });

//   return allFieldsFilled && noErrors;
// };

const isValidForm = (
  formData: FormDataType,
  errors: Partial<FormDataType>
): boolean => {
  const dynamicRequiredFields: (keyof FormDataType)[] = [...REQUIRED_FIELDS];

  // Add cinNo only for selected constitutions
  if (['D', 'E', 'M'].includes(formData.constitution || '')) {
    dynamicRequiredFields.push('cinNo');
  }

  // Add llpinNo only for LLP
  if (formData.constitution === 'J') {
    dynamicRequiredFields.push('llpinNo');
  }

  if (formData.constitution === 'A') {
    dynamicRequiredFields.push('proprietorName');
  }

  if (formData.regulator !== 'IFSCA') {
    dynamicRequiredFields.push('gstinNo');
  }

  // ✅ Use dynamicRequiredFields instead of REQUIRED_FIELDS
  const allFieldsFilled = dynamicRequiredFields.every((key) => {
    const value = formData[key];
    const isFilled =
      typeof value === 'string' ? value.trim() !== '' : Boolean(value);
    console.log(`Checking ${key}:`, value, 'Filled:', isFilled);
    return isFilled;
  });

  const noErrors = Object.values(errors).every((err) => {
    if (typeof err === 'string') {
      return err.trim() === '';
    }
    return !err;
  });

  return allFieldsFilled && noErrors;
};

const REPORTING_ENTITY_DETAILS = 'REPORTING_ENTITY_DETAILS';

// Upload SVG Icon Component
const UploadIcon: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15.5L12 9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 11.5L12 8.5L9 11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Reusable Components
interface TextInputProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; // add this
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  value,
  placeholder,
  required = false,
  onChange,
  disabled = false,
  error,
}) => (
  <div className="form-group">
    <label>
      {label}
      {required && <span style={{ color: 'red' }}>*</span>}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      required={required}
      // className={error ? 'input-error' : ''}
    />
    {/* ERROR MESSAGE BELOW THE FORM BOX */}
    {error && (
      <div
        className="error-text"
        style={{ color: 'red', fontSize: '12px', marginTop: '6px' }}
      >
        {error}
      </div>
    )}
  </div>
);

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string; // 👈 NEW
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  value,
  options,
  placeholder = 'Please select',
  required = false,
  onChange,
  disabled = false,
  error, // 👈 NEW
}) => (
  <div className="form-group">
    <label>
      {label}
      {required && <span style={{ color: 'red' }}>*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <div className="error-text" style={{ color: 'red', fontSize: '12px' }}>
        {error}
      </div>
    )}
  </div>
);

// Main Component

interface FileInputWithPreviewProps {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl?: string;
  required?: boolean;
  textValue?: string;
  onTextChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  textName?: string;
  textPlaceholder?: string;
  showTextInput?: boolean;
  error?: string | any;
  disabled?: boolean;
}

const FileInputWithPreview: React.FC<FileInputWithPreviewProps> = ({
  label,
  name,
  onChange,
  previewUrl,
  required = false,
  textValue,
  onTextChange,
  textName,
  textPlaceholder,
  showTextInput = false,
  error = '',
  disabled = false,
}) => {
  const inputId = `${name}-upload`;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Preview confirmation states
  const [isPreviewConfirmationOpen, setIsPreviewConfirmationOpen] =
    useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null
  );
  const modalInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    console.log('🟡 modalInputRef updated:', modalInputRef.current);
  }, [modalInputRef.current]);
  const openModal = () => {
    if (previewUrl) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle file selection with preview confirmation
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('upload of  file first ');

    if (!file) return;

    if (isModalOpen) {
      setIsModalOpen(false);
    }
    // Set pending file for preview confirmation
    setPendingFile(file);
    setPendingPreviewUrl(URL.createObjectURL(file));
    setIsPreviewConfirmationOpen(true);
    console.log('upload of  file second ');
  };

  const handleConfirmFile = () => {
    if (!pendingFile) return;

    // Create a more complete synthetic event
    const mockInput = document.createElement('input');
    mockInput.type = 'file';
    mockInput.name = name;

    // Create FileList-like object
    const dt = new DataTransfer();
    dt.items.add(pendingFile);
    mockInput.files = dt.files;

    const event = {
      target: mockInput,
      currentTarget: mockInput,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.ChangeEvent<HTMLInputElement>;

    // Call the original onChange handler
    onChange(event);

    // Close preview confirmation modal
    setIsPreviewConfirmationOpen(false);
    setPendingFile(null);
    setPendingPreviewUrl(null);
  };

  const handleCancelFile = () => {
    // Clean up the preview URL to prevent memory leaks
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }

    setIsPreviewConfirmationOpen(false);
    setPendingFile(null);
    setPendingPreviewUrl(null);
  };

  return (
    <>
      <div className="form-group">
        <label>
          {label}
          {required && <span style={{ color: 'red' }}>*</span>}
        </label>
        <div className="input-with-preview">
          {showTextInput && textName && onTextChange ? (
            <div className="custom-file-input" style={{ height: '48px' }}>
              <input
                type="text"
                name={textName}
                placeholder={textPlaceholder}
                value={textValue || ''}
                onChange={onTextChange}
                disabled={disabled}
              />
              <label htmlFor={inputId} className="upload-icon">
                <img
                  src={uploadIcon}
                  alt="Upload"
                  style={{
                    width: '24px',
                    height: '24px',
                    objectFit: 'contain',
                  }}
                />
              </label>
              <input
                id={inputId}
                type="file"
                name={name}
                disabled={disabled}
                onChange={handleFileSelection} // Changed to use preview confirmation
                className="hidden-file-input"
                accept=".pdf,.jpg,.jpeg"
              />
            </div>
          ) : (
            <>
              <input
                type="file"
                id={inputId}
                name={name}
                onChange={handleFileSelection} // Changed to use preview confirmation
                disabled={disabled}
                className="hidden-upload"
                accept=".pdf,.jpg,.jpeg"
              />
              <label htmlFor={inputId} className="upload-doc-btn">
                <img
                  src={UploadIconButton}
                  alt="Upload"
                  style={{
                    width: '24px',
                    height: '24px',
                    objectFit: 'contain',
                  }}
                />
                <span>Upload</span>
              </label>
            </>
          )}
          {previewUrl && (
            <div
              className="preview-box"
              style={{
                border: '1px solid rgb(204, 204, 204)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={openModal}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'block',
                }}
                aria-label={`View ${label} preview in modal`}
              >
                <img
                  src={previewUrl}
                  alt={`${label} Preview`}
                  // className="preview-img"
                  style={{
                    height: '40px',
                    width: '50px',
                    objectFit: 'contain',
                  }}
                />
              </button>
              <span className="tick-icon">
                <CheckCircleIcon />
              </span>
            </div>
          )}
        </div>
        {/* ERROR MESSAGE BELOW THE FORM BOX */}
        {error && (
          <div
            className="error-text"
            style={{ color: 'red', fontSize: '12px', marginTop: '6px' }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Preview Confirmation Modal */}
      {isPreviewConfirmationOpen && pendingPreviewUrl && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1001,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="modal-content"
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <button
              onClick={handleCancelFile}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                lineHeight: 1,
              }}
              aria-label="Close modal"
            >
              ×
            </button>
            <h3
              id="modal-title"
              style={{ marginBottom: '20px', color: '#333' }}
            >
              Confirm File Upload
            </h3>
            <img
              src={pendingPreviewUrl}
              alt={`${label} Preview`}
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                marginBottom: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCancelFile}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFile}
                style={{
                  backgroundColor: 'white',
                  color: '#002CBA',
                  borderColor: '#002CBA',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  border: '1px solid #002CBA', // ✅ Apply border here
                  fontSize: '14px',
                }}
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Original Modal for viewing existing preview */}
      {isModalOpen && previewUrl && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={closeModal}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              closeModal();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Close modal by clicking outside or pressing Escape"
        >
          <div
            className="modal-content"
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()} // ✅ Prevent modal content clicks from closing modal
          >
            <button
              onClick={closeModal}
              // onClick={(e) => e.stopPropagation()} // ← Add this
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                lineHeight: 1,
              }}
              aria-label="Close modal"
            >
              ×
            </button>
            <img
              src={previewUrl}
              alt={`${label} Preview`}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                marginBottom: '20px',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="file"
                // id={`${inputId}-modal`}
                ref={modalInputRef}
                name={name}
                onChange={(e) => {
                  console.log('🟢 Modal file input onChange fired!');
                  console.log('🟢 Selected files:', e.target.files);
                  handleFileSelection(e);
                }}
                disabled={disabled}
                style={{
                  display: 'none',
                  backgroundColor: 'red', // ← Make it visible
                }}
                accept=".pdf,.jpg,.jpeg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // ← Add this
                  console.log('🔵 Upload New Document button clicked');
                  console.log(
                    '🔵 modalInputRef.current:',
                    modalInputRef.current
                  );

                  if (modalInputRef.current) {
                    console.log('🔵 About to call click() on modal input');
                    modalInputRef.current.click();
                    console.log('🔵 click() called successfully');
                  } else {
                    console.log('🔴 ERROR: modalInputRef.current is NULL!');
                  }
                }}
                // onClick={() => modalInputRef.current?.click()}
                disabled={disabled}
                style={{
                  backgroundColor: '#002CBA',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  border: 'none',
                }}
                aria-label="Upload new document"
              >
                <img
                  src={uploadIcon}
                  alt="Upload"
                  style={{
                    width: '24px',
                    height: '24px',
                    objectFit: 'contain',
                  }}
                />
                Upload New Document
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
const RegistrationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { entityDetails } = useSelector(
    (state: RootState) => state.applicationPreview
  );

  // const [errors, setErrors] = useState({
  //   nameOfInstitution: '',
  //   regulator: ''
  //   // ... other fields
  // });

  const [errors, setErrors] = useState<Partial<FormDataType>>({});

  // Redux state
  const { formData, loading, errorsubmitRegistration } = useSelector(
    (state: RootState) => state.registration
  );

  // Local state
  const [activeTab, setActiveTab] = useState<string>('register');
  // Memoized form validation
  // const isFormValid = useMemo(() => isValidForm(formData), [formData]);

  const isFormValid = useMemo(
    () => isValidForm(formData, errors),
    [formData, errors]
  );
  const reduxEntityetails = useSelector(
    (state: RootState) => state.registration.formData
  );
  const previewEntityDetails = useSelector(
    (state: RootState) => state.applicationPreview.entityDetails
  );
  const documents = useSelector(
    (state: RootState) => state.applicationPreview.documents
  );
  const modifiableFields = useSelector(
    (state: RootState) => state.auth.reinitializeData?.modifiableFields
  );
  const Reinitializestatus = useSelector(
    (state: RootState) => state.auth.reinitializeData?.approvalStatus
  );

  const { regulators, institutionTypes, constitutions } = useSelector(
    (state: RootState) => state.masters
  );

  const viewOnlyStatuses = [
    'SUBMITTED_PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'READY_FOR_SUBMISSION',
  ];

  const isViewOnly = viewOnlyStatuses.includes(Reinitializestatus ?? '');
  const isEditableField = (section: string, field: string): boolean => {
    // ✅ Restrict only for modification flow
    if (Reinitializestatus === 'REQUEST_FOR_MODIFICATION') {
      return !!modifiableFields?.[section]?.includes(field);
    }
    // const viewOnlyStatuses = [
    //   "SUBMITTED_PENDING_APPROVAL",
    //   "APPROVED",
    //   "REJECTED",
    //   "READY_FOR_SUBMISSION"
    // ];

    if (viewOnlyStatuses.includes(Reinitializestatus ?? '')) {
      return false;
    }

    // ✅ All fields editable otherwise
    return true;
  };

  // useEffect(() => {
  //   dispatch(fetchDropdownMasters());
  // }, [dispatch]);

  const regulatorOptions = formatRegulatorsForSelect(regulators);
  const constitutionOptions = formatConstitutionsForSelect(constitutions);
  const institutionTypeOptions = formatInstitutionTypesForSelect(
    institutionTypes,
    formData?.regulator
  );

  useEffect(() => {
    dispatch(setCurrentStep(0)); // 0 = first step
  }, [dispatch]);

  useEffect(() => {
    // MIME types mapping
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      // png: 'image/png',
      pdf: 'application/pdf',
    };

    // Convert base64 + fileName to File
    const base64ToFile = (doc: {
      base64Content: string;
      fileName: string;
    }): File => {
      const extension = doc.fileName.split('.').pop()?.toLowerCase() || '';
      const mimeType = mimeTypes[extension] || 'application/octet-stream';
      const byteString = atob(doc.base64Content);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new File([ab], doc.fileName, { type: mimeType });
    };

    // Extract specific documents from Redux state
    const registrationCertificate = documents?.find(
      (doc) => doc.documentType === 'REGISTRATION_CERTIFICATE'
    );
    const regulatorLicense = documents?.find(
      (doc) => doc.documentType === 'REGULATOR_LICENCE'
    );
    const addressProof = documents?.find(
      (doc) => doc.documentType === 'ADDRESS_PROOF'
    );
    const reOtherFile = documents?.find(
      (doc) => doc.documentType === 'RE_OTHER_FILE'
    );
    const rePan = documents?.find((doc) => doc.documentType === 'RE_PAN');
    const reCin = documents?.find((doc) => doc.documentType === 'RE_CIN');

    // Build document-related fields only if they don't exist as File objects in Redux
    // (meaning they haven't been manually uploaded by the user)
    const getDocumentFields = (currentFormData: Partial<FormDataType>) => {
      const docFields: Partial<FormDataType> = {};

      // Only add document fields if they're not already File objects (user uploads)
      if (
        registrationCertificate &&
        !(currentFormData?.registration_certificate instanceof File)
      ) {
        docFields.registration_certificate = base64ToFile(
          registrationCertificate
        );
        docFields.registration_certificatePreview = `data:${
          mimeTypes[
            registrationCertificate.fileName.split('.').pop()?.toLowerCase() ||
              'pdf'
          ]
        };base64,${registrationCertificate.base64Content}`;
      }

      if (
        regulatorLicense &&
        !(currentFormData?.regulator_licence instanceof File)
      ) {
        docFields.regulator_licence = base64ToFile(regulatorLicense);
        docFields.regulator_licencePreview = `data:${
          mimeTypes[
            regulatorLicense.fileName.split('.').pop()?.toLowerCase() || 'pdf'
          ]
        };base64,${regulatorLicense.base64Content}`;
      }

      if (addressProof && !(currentFormData?.address_proof instanceof File)) {
        docFields.address_proof = base64ToFile(addressProof);
        docFields.address_proofPreview = `data:${
          mimeTypes[
            addressProof.fileName.split('.').pop()?.toLowerCase() || 'pdf'
          ]
        };base64,${addressProof.base64Content}`;
      }

      if (reOtherFile && !(currentFormData?.re_other_file instanceof File)) {
        docFields.re_other_file = base64ToFile(reOtherFile);
        docFields.re_other_filePreview = `data:${
          mimeTypes[
            reOtherFile.fileName.split('.').pop()?.toLowerCase() || 'pdf'
          ]
        };base64,${reOtherFile.base64Content}`;
      }

      // Fixed: Check correct property for PAN
      if (rePan && !(currentFormData?.pan instanceof File)) {
        docFields.re_pan = base64ToFile(rePan);
        docFields.re_panPreview = `data:${
          mimeTypes[rePan.fileName.split('.').pop()?.toLowerCase() || 'pdf']
        };base64,${rePan.base64Content}`;
      }

      // Fixed: Check correct property for CIN
      if (reCin && !(currentFormData?.cin instanceof File)) {
        docFields.re_cin = base64ToFile(reCin);
        docFields.re_cinPreview = `data:${
          mimeTypes[reCin.fileName.split('.').pop()?.toLowerCase() || 'pdf']
        };base64,${reCin.base64Content}`;
      }

      return docFields;
    };

    // Your original logic with document handling
    if (previewEntityDetails && Object.keys(reduxEntityetails).length === 0) {
      console.log('inside if - loading from previewNodalForm');

      const documentFields = getDocumentFields(
        previewEntityDetails as Partial<FormDataType>
      );
      const mergedData = { ...previewEntityDetails, ...documentFields };

      setFormData(mergedData);
      dispatch(updateFormData(mergedData));
    } else {
      console.log('inside else - loading from redux');

      const documentFields = getDocumentFields(reduxEntityetails);
      const mergedData = { ...reduxEntityetails, ...documentFields };

      setFormData(mergedData);
    }
  }, [reduxEntityetails, previewEntityDetails, dispatch, documents]);

  // Define a type guard function
  const isFile = (value: any): value is File => {
    return (
      value &&
      typeof value === 'object' &&
      'size' in value &&
      'name' in value &&
      'type' in value &&
      typeof value.size === 'number'
    );
  };

  const validateSingleField = (
    name: keyof FormDataType,
    value: string,
    data: FormDataType
  ): string | undefined => {
    const constitutionMap: Record<string, string> = {
      A: 'P',
      B: 'B',
      C: 'C',
      D: 'C',
      E: 'C',
      F: 'C',
      G: 'A',
      H: 'T',
      I: 'C',
      J: 'E',
      K: 'G',
      L: 'G',
      M: 'C',
      N: 'J',
      // T: 'T'
    };

    switch (name) {
      case 'nameOfInstitution':
        if (!value?.trim()) return 'Name Of Institution is required';
        if (value.length > 99)
          return 'Name of Institution must be under 99 characters.';
        if (!value.match(/^[A-Za-z0-9 `~!@#$%^&*()_.+\-=]+$/))
          return 'Only letters, numbers, spaces, and these special characters are allowed: `~!@#$%^&*()_.+-=';
        break;

      case 'regulator':
        if (!value) return 'Regulator is required';
        break;

      case 'institutionType':
        if (!data.regulator) return 'Please select Regulator';
        if (data.regulator && !value) return 'Institution type is required';
        break;

      case 'constitution':
        if (!value) return 'Constitution is required';
        break;

      case 'proprietorName':
        if (data.constitution === 'A') {
          if (!value?.trim()) return 'Proprietor name is required';
        }
        if (value.length > 50)
          return 'Proprietor Name must be under 50 characters.';
        // Check format if any value is provided, regardless of constitution
        if (value?.trim()) {
          if (!value.match(/^[A-Za-z0-9 ]+$/))
            return 'Proprietor name must contain only letters, numbers, and spaces';
        }
        break;

      case 'registrationNo':
        if (!value?.trim()) return 'Registration number is required';
        if (value.length > 50)
          return 'Registration Number cannot exceed 50 characters.';
        if (!/^[A-Za-z0-9 `~!@#$%^&*()_.+\-=]+$/.test(value)) {
          return 'Invalid registration number';
        }
        break;

      case 'panNo': {
        if (!value?.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/))
          return 'PAN must be in format AAAAA9999A';
        const expectedChar = constitutionMap[data.constitution || ''];
        if (expectedChar && value[3] !== expectedChar)
          return `PAN 4th character should be '${expectedChar}' for selected constitution`;
        break;
      }

      case 'cinNo':
        // Check if CIN is required
        if (['D', 'E', 'M'].includes(data.constitution || '')) {
          if (!value?.trim()) {
            return 'CIN is required';
          }
        }

        // Only validate format if there's actually a value
        if (value?.trim()) {
          if (value.length > 21)
            return 'CIN Number must be under 21 characters.';
          if (
            !/^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(value)
          ) {
            return 'Invalid CIN (e.g., L12345MH2020PLC987654)';
          }
        }

        break;

      case 'llpinNo':
        // if (data.constitution === 'J') {
        // if (!value?.match(/^[A-Za-z0-9]{7}$/))
        //   return 'LLPIN must be 7 alphanumeric characters';
        // Skip validation if field is empty and not required
        if (!value?.trim() && data.constitution !== 'J') {
          return ''; // No error for empty non-required field
        }
        if (value.length > 7) return 'LLPIN Number must be under 7 characters.';
        if (!/^[A-Za-z0-9]{7}$/.test(value)) {
          return 'LLPIN must be 7 alphanumeric characters';
        }
        // }
        break;

      case 'gstinNo':
        if (value.length > 15)
          return 'GSTIN Number must be under 15 characters.';
        if (data.regulator !== 'IFSCA') {
          if (
            !value?.match(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
          )
            return 'Invalid GSTIN (e.g., 22ABCDE1234F1Z5)';
        }
        break;

      case 'reWebsite':
        if (value.length > 100)
          return 'RE Website must be under 100 characters.';
        if (value?.includes(' ')) return 'Website must not contain spaces';
        break;

      case 'regulator_licence':
      case 'address_proof':
      case 're_other_file':
      case 'registration_certificate':
      case 're_pan':
      case 'cin':
        // Check if field is required and file is missing
        if (!value) {
          return `${name.replace(/_/g, ' ')} is required`;
        }
        // Use the type guard
        if (isFile(value)) {
          const maxSizeInBytes = 500 * 1024; // 500KB
          if (value.size > maxSizeInBytes) {
            return 'File size must be less than 500KB';
          }
        }
        break;

      default:
        break;
    }

    return undefined; // valid field
  };
  const isCINRequired = ['D', 'E', 'M'].includes(formData?.constitution || '');

  // 1. Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // This creates a base64 data URL
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    const fileFields = [
      'regulator_licence',
      'registration_certificate',
      'address_proof',
      're_other_file',
    ];

    fileFields.forEach(async (field) => {
      const file = formData[field as keyof FormDataType];
      const preview = formData[`${field}Preview` as keyof FormDataType];

      // If file exists but preview is missing or invalid
      if (
        file instanceof File &&
        (!preview ||
          typeof preview !== 'string' ||
          !preview.startsWith('data:'))
      ) {
        try {
          const base64Preview = await fileToBase64(file);
          dispatch(
            updateFormData({
              [`${field}Preview`]: base64Preview,
            })
          );
        } catch (error) {
          console.error(`Error regenerating preview for ${field}:`, error);
        }
      }
    });
  }, [formData, dispatch]);

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = e.target;
      const { name, value } = target;

      // File input handling
      if (target instanceof HTMLInputElement && target.type === 'file') {
        const file = target.files?.[0];

        if (file) {
          // File size validation (500KB = 500 * 1024 bytes)
          const maxSizeInBytes = 500 * 1024; // 500KB

          if (file.size > maxSizeInBytes) {
            // Set error for file size exceeded
            setErrors((prev) => ({
              ...prev,
              [name]: 'File size must be less than 500KB',
            }));

            // Clear the file input and preview
            target.value = '';
            dispatch(
              updateFormData({
                [name]: null,
                [`${name}Preview`]: null,
              })
            );
            return;
          }

          try {
            const base64Preview = await fileToBase64(file);
            console.log('Generated base64 preview:', base64Preview); // Debug line
            console.log('Preview length:', base64Preview.length); // Debug line
            // Clear any previous error for this field
            setErrors((prev) => ({
              ...prev,
              [name]: '',
            }));

            // Always store the preview as base64 for persistence
            dispatch(
              updateFormData({
                [name]: file,
                [`${name}Preview`]: base64Preview, // This will persist
              })
            );

            // ... any other validation logic you had
          } catch (error) {
            console.error('Error converting file to base64:', error);
            setErrors((prev) => ({
              ...prev,
              [name]: 'Error processing file. Please try again.',
            }));
          }
        } else {
          // File was cleared/removed
          setErrors((prev) => ({
            ...prev,
            [name]: '',
          }));

          dispatch(
            updateFormData({
              [name]: null,
              [`${name}Preview`]: null,
            })
          );
        }
      } else {
        // Text or select input (unchanged)
        const isRegulator = name === 'regulator';
        const updatedValues = isRegulator
          ? { [name]: value, institutionType: '' }
          : { [name]: value };

        dispatch(updateFormData(updatedValues));

        const updatedData = {
          ...store.getState().registration.formData,
          ...updatedValues,
        };

        const fieldError = validateSingleField(
          name as keyof FormDataType,
          value,
          updatedData
        );
        setErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }
    },
    [dispatch]
  );

  function isEmptyValue(val: unknown): boolean {
    if (val === null || val === undefined) return true;
    if (typeof val === 'string' && val.trim() === '') return true;
    if (typeof val === 'object' && Object.keys(val).length === 0) return true;
    return false;
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // const fields = [
        //   'address_proof',
        //   're_cin',
        //   're_pan',
        //   'registration_certificate',
        //   'regulator_licence',
        // ];

        // fields.forEach((field) => {
        //   const previewField = `${field}Preview` as keyof typeof formData;

        //   if (isEmptyValue(formData[field]) && formData[previewField]) {
        //     dispatch(
        //       updateFormData({
        //         [field]: base64ToFile(formData[previewField] as string),
        //       })
        //     );
        //   }
        // });

        dispatch(showLoader('Please Wait...'));
        const result = await dispatch(submitRegistration(formData)).unwrap();
        // Only navigates here if result was successful (e.g., 200 OK)
        // ✅ Save current section's data
        dispatch(
          setApplicationFormData({ section: 'entityDetails', data: formData })
        );
        // ✅ Mark this step as complete
        dispatch(markStepCompleted(0));

        // ✅ Move to next step
        dispatch(setCurrentStep(1));
        navigate('/re-address-details');
      } catch (error) {
        // Handle error (e.g., show a toast or error message)
        console.error('Submission failed:', error);
        console.log(
          'Submission errorsubmitRegistration:',
          errorsubmitRegistration
        );
      } finally {
        dispatch(hideLoader());
      }
      //}
      //}
    },
    [dispatch, formData, isFormValid, navigate]
  );

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Debug effect
  useEffect(() => {
    console.log('Updated formData:', formData);
  }, [formData]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(formData).forEach((value) => {
        if (typeof value === 'string' && value.startsWith('blob:')) {
          URL.revokeObjectURL(value);
        }
      });
    };
  }, []);

  // useEffect(() => {
  //   if (entityDetails) {
  //     dispatch(setFormData({
  //       nameOfInstitution: entityDetails.nameOfInstitution || '',
  //       regulator: entityDetails.regulator || '',
  //       institutionType: entityDetails.institutionType || '',
  //       constitution: entityDetails.constitution || '',
  //       proprietorName: entityDetails.proprietorName || '',
  //       registrationNo: entityDetails.registrationNo || '',
  //       panNo: entityDetails.panNo || '',
  //       cinNo: entityDetails.cinNo || '',
  //       llpinNo: entityDetails.llpinNo || '',
  //       gstinNo: entityDetails.gstinNo || '',
  //       reWebsite: entityDetails.reWebsite || '',
  //       // regulator_licence: entityDetails.regulator_licence || null,
  //       // address_proof: entityDetails.address_proof || null,
  //       // add remaining fields if needed
  //     }));
  //   }
  // }, [entityDetails, dispatch]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && entityDetails) {
      // Only populate formData if it hasn't been updated yet
      const isFormEmpty = Object.keys(formData).length === 0;

      if (isFormEmpty) {
        dispatch(
          setFormData({
            nameOfInstitution: entityDetails.nameOfInstitution || '',
            regulator: entityDetails.regulator || '',
            institutionType: entityDetails.institutionType || '',
            constitution: entityDetails.constitution || '',
            proprietorName: entityDetails.proprietorName || '',
            registrationNo: entityDetails.registrationNo || '',
            panNo: entityDetails.panNo || '',
            cinNo: entityDetails.cinNo || '',
            llpinNo: entityDetails.llpinNo || '',
            gstinNo: entityDetails.gstinNo || '',
            reWebsite: entityDetails.reWebsite || '',
            // include other fields
          })
        );
      }

      initializedRef.current = true;
    }
  }, [entityDetails, dispatch]);

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo-container">
          <CKYCRRLogo className="signup-logo" />
        </div>

        <div className="tab-container">
          <button
            className={activeTab === 'signup' ? 'active' : ''}
            onClick={() => handleTabChange('signup')}
            disabled
            style={{ cursor: 'not-allowed' }}
          >
            Sign Up
          </button>
          <button
            className={activeTab === 'register' ? 'active' : ''}
            onClick={() => handleTabChange('register')}
          >
            Resume Registration
          </button>
        </div>

        <ApplicationStepper />

        <div className="step-indicator">Entity Profile</div>

        {/* Entity Profile Form */}
        <form className="entity-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <TextInput
              label="Name of Institution"
              name="nameOfInstitution"
              value={formData?.nameOfInstitution || ''}
              placeholder="Enter name of institution"
              disabled={
                !isEditableField(REPORTING_ENTITY_DETAILS, 'nameOfInstitution')
              }
              required={
                isEditableField(
                  REPORTING_ENTITY_DETAILS,
                  'nameOfInstitution'
                ) || true
              }
              onChange={handleInputChange}
              error={errors.nameOfInstitution}
            />
            <SelectInput
              label="Regulator"
              name="regulator"
              value={formData?.regulator || ''}
              // options={REGULATOR_OPTIONS}
              options={regulatorOptions}
              placeholder="Select regulator"
              //  required
              onChange={handleInputChange}
              disabled={!isEditableField(REPORTING_ENTITY_DETAILS, 'regulator')}
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'regulator') || true
              }
              error={errors.regulator}
            />
            <SelectInput
              label="Institution Type"
              name="institutionType"
              value={formData?.institutionType || ''}
              // options={
              //   formData.regulator
              //     ? INSTITUTION_TYPE_OPTIONS[
              //         formData.regulator as RegulatorKey
              //       ] || []
              //     : []
              // }
              options={institutionTypeOptions}
              placeholder="Select institution type"
              //  required
              onChange={handleInputChange}
              disabled={
                !isEditableField(REPORTING_ENTITY_DETAILS, 'institutionType')
              }
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'institutionType') ||
                true
              }
              error={errors.institutionType}
            />
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <SelectInput
              label="Constitution"
              name="constitution"
              value={formData?.constitution || ''}
              // options={CONSTITUTION_OPTIONS}
              options={constitutionOptions}
              placeholder="Select constitution"
              disabled={
                !isEditableField(REPORTING_ENTITY_DETAILS, 'constitution')
              }
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'constitution') ||
                true
              }
              onChange={handleInputChange}
              error={errors.constitution}
            />
            <TextInput
              label="Proprietor Name"
              name="proprietorName"
              value={formData?.proprietorName || ''}
              placeholder="Enter proprietor name"
              // required
              disabled={
                !isEditableField(REPORTING_ENTITY_DETAILS, 'proprietorName')
              }
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'proprietorName') &&
                formData.constitution === 'A'
              }
              onChange={handleInputChange}
              error={errors.proprietorName}
            />
            <TextInput
              label="Registration Number"
              name="registrationNo"
              value={formData?.registrationNo || ''}
              placeholder="Enter registration number"
              // required
              disabled={
                !isEditableField(REPORTING_ENTITY_DETAILS, 'registrationNo')
              }
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'registrationNo') ||
                true
              }
              onChange={handleInputChange}
              error={errors.registrationNo}
            />
          </div>

          {/* Row 3 */}
          <div className="form-row">
            <FileInputWithPreview
              label="PAN"
              name="re_pan"
              textName="panNo"
              textValue={formData?.panNo}
              textPlaceholder="Enter PAN number"
              onChange={handleInputChange}
              disabled={!isEditableField(REPORTING_ENTITY_DETAILS, 'pan')}
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'pan') || true
              }
              onTextChange={handleInputChange}
              previewUrl={formData?.re_panPreview}
              // required
              showTextInput
              error={errors.panNo || errors.re_pan}
            />

            <FileInputWithPreview
              label="CIN"
              name="re_cin"
              textName="cinNo"
              textValue={formData?.cinNo}
              textPlaceholder="Enter CIN number"
              onChange={handleInputChange}
              onTextChange={handleInputChange}
              previewUrl={formData?.re_cinPreview}
              error={errors.cinNo || errors.re_cin}
              // required
              disabled={!isEditableField(REPORTING_ENTITY_DETAILS, 'cin')}
              required={
                isCINRequired &&
                isEditableField(REPORTING_ENTITY_DETAILS, 'cin')
              }
              showTextInput
            />
            <TextInput
              label="LLPIN(Limited liability partnership firm)"
              name="llpinNo"
              value={formData?.llpinNo || ''}
              placeholder="Enter LLPIN number"
              error={errors.llpinNo}
              disabled={!isEditableField(REPORTING_ENTITY_DETAILS, 'llpin')}
              required={
                formData?.constitution === 'J' &&
                isEditableField(REPORTING_ENTITY_DETAILS, 'llpin')
              }
              onChange={handleInputChange}
            />
          </div>

          {/* Row 4 */}
          <div className="form-row">
            <TextInput
              label="GSTIN"
              name="gstinNo"
              value={formData?.gstinNo || ''}
              placeholder="Enter GSTIN number"
              disabled={!isEditableField(REPORTING_ENTITY_DETAILS, 'gstin')}
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'gstin') &&
                formData.regulator !== 'IFSCA'
              }
              error={errors.gstinNo}
              // required
              onChange={handleInputChange}
            />
            <TextInput
              label="RE Website"
              name="reWebsite"
              value={formData?.reWebsite || ''}
              placeholder="Enter website here"
              onChange={handleInputChange}
              disabled={!isEditableField(REPORTING_ENTITY_DETAILS, 'reWebsite')}
              // required={isEditableField("entityDetails", "reWebsite")}
              error={errors.reWebsite}
            />
            <FileInputWithPreview
              label="Regulator License/Certificate/Notification"
              name="regulator_licence"
              onChange={handleInputChange}
              previewUrl={formData?.regulator_licencePreview}
              // required
              disabled={
                !isEditableField(REPORTING_ENTITY_DETAILS, 'regulatorLicense')
              }
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'regulatorLicense') ||
                true
              }
              error={errors?.regulator_licence}
            />
          </div>

          {/* Row 5 */}
          <div className="form-row" style={{ marginBottom: '-20px' }}>
            <FileInputWithPreview
              label="Registration Certificate"
              name="registration_certificate"
              onChange={handleInputChange}
              disabled={
                !isEditableField(
                  REPORTING_ENTITY_DETAILS,
                  'registrationCertificate'
                )
              }
              required={
                isEditableField(
                  REPORTING_ENTITY_DETAILS,
                  'registrationCertificate'
                ) || true
              }
              previewUrl={formData?.registration_certificatePreview}
              error={errors?.registration_certificate}
            />
            <FileInputWithPreview
              label="Address Proof"
              name="address_proof"
              onChange={handleInputChange}
              previewUrl={formData?.address_proofPreview}
              // required
              disabled={
                !isEditableField(REPORTING_ENTITY_DETAILS, 'addressProof')
              }
              required={
                isEditableField(REPORTING_ENTITY_DETAILS, 'addressProof') ||
                true
              }
              error={errors?.address_proof} // Add this line to show the error
            />
            <FileInputWithPreview
              label="Other"
              name="re_other_file"
              onChange={handleInputChange}
              previewUrl={formData?.re_other_filePreview}
              disabled={!isEditableField(REPORTING_ENTITY_DETAILS, 'reOther')}
              // required={isEditableField("entityDetails", "reOther")}
              error={errors.re_other_file}
            />
          </div>

          {/* Submit Button */}
          <div className="form-footer">
            <button
              type="submit"
              className="submit-btn"
              disabled={!isFormValid || loading || isViewOnly}
              style={{
                backgroundColor:
                  isFormValid && !loading && !isViewOnly
                    ? '#002CBA'
                    : '#CCCCCC',
                cursor:
                  isFormValid && !loading && !isViewOnly
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              {loading ? 'Saving...' : 'Save & Next'}
            </button>
          </div>

          {/* Error Display */}
          {errorsubmitRegistration && (
            <div
              className="error-message-main"
              style={{ color: 'red', marginTop: '10px' }}
            >
              {errorsubmitRegistration}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
