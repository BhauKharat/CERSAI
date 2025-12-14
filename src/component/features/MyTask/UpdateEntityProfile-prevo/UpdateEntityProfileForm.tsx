import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  markStepCompleted,
  setCurrentStep,
} from '../../../../redux/slices/registerSlice/applicationSlice';
import { useSelector } from 'react-redux';
import { KeyboardArrowDown } from '@mui/icons-material';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileUploadComponent from '../../../common/FileUploadDocument';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  DOCUMENT_TYPE_MAPPING,
  fetchEntityProfile,
  updateDocument,
  updateEntityProfile,
} from '../../../../redux/slices/REEntityUpdateSlice';
import {
  formatConstitutionsForSelect,
  formatInstitutionTypesForSelect,
  formatRegulatorsForSelect,
} from '../../../../utils/dropDownUtils';
import { fetchDropdownMasters } from '../../../../redux/slices/registerSlice/masterSlice';
import { useNavigate } from 'react-router-dom';
import {
  hideLoader,
  showLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import ApplicationStepperUpdate from './ApplicationStepperUpdate';
import BreadcrumbUpdateProfile from './BreadcrumbUpdateProfile';
import {
  inputStyles,
  labelStyles,
  selectStyles,
  titleStyles,
} from './RegionCreationRequest.style';
import '../../MyTask/UpdateEntityProfile-prevo/update.css';
import {
  EntityFormContainer,
  StyledAccordion,
  StyledAccordionSummary,
  StyledAccordionDetails,
  SaveButton,
  ButtonActionsBox,
} from './UpdateProfileAddressDetails.style';
import { RootState } from '@redux/store';
import { fetchUpdateAdminDetails } from '../../../../redux/slices/updateProfileSlice/updateInstituteAdminSlice';
// interface EntityProfileFormState {
//   nameOfInstitution: string;
//   regulator: string;
//   institutionType: string;
//   constitution: string;
//   proprietorName: string;
//   registrationNumber: string;
//   pan: string;
//   cin: string;
//   llpin: string;
//   gstin: string;
//   reWebsite: string;
// }
interface Document {
  documentType: string;
  base64Content?: string;
  file?: File;
  fileName?: string;
  fileSize?: number;
  id?: string;
}

const UpdateEntityProfileForm: React.FC = () => {
  // We will remove all local state related to form fields

  const [isEditing] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { entityDetails, documents, loading } = useAppSelector(
    (state) => state.entityProfile
  );
  const { regulators, institutionTypes, constitutions } = useAppSelector(
    (state) => state.masters
  );

  const validationSchema = useMemo(() => {
    const MAX_FILE_SIZE = 512000; // 500 KB

    // Base validation schema that applies regardless of editing state
    const baseSchema = {
      nameOfInstitution: Yup.string().max(
        99,
        'Name of Institution must be 99 characters or less'
      ),
      regulator: Yup.string(),
      institutionType: Yup.string(),
      constitution: Yup.string(),
      proprietorName: Yup.string().when(
        'constitution',
        ([constitution], schema) => {
          return constitution === 'A' && isEditing
            ? schema.required(
                'Proprietor Name is required for this Constitution'
              )
            : schema;
        }
      ),
      // registrationNumber: Yup.string()
      //   .max(50, 'Registration Number must be 50 characters or less'),
      pan: Yup.string().matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        'Invalid PAN format'
      ),
      cin: Yup.string().when('constitution', ([constitution], schema) => {
        const baseSchema = schema
          .max(21, 'CIN Number must be 21 characters or less')
          .matches(
            /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
            'Invalid CIN format'
          );

        if (['D', 'E', 'M'].includes(constitution) && isEditing) {
          return baseSchema.required('CIN is required for this Constitution');
        } else {
          return baseSchema.nullable();
        }
      }),
      llpin: Yup.string().when('constitution', ([constitution], schema) => {
        if (constitution === 'J' && isEditing) {
          return schema
            .max(7, 'LLPIN Number must be 7 characters or less')
            .matches(
              /^[A-Za-z0-9]{7}$/,
              'LLPIN must be 7 alphanumeric characters'
            )
            .required('LLPIN is required for this Constitution');
        } else {
          return schema
            .max(7, 'LLPIN Number must be 7 characters or less')
            .matches(
              /^[A-Za-z0-9]{7}$/,
              'LLPIN must be 7 alphanumeric characters'
            )
            .nullable();
        }
      }),
      gstin: Yup.string().when('regulator', ([regulator], schema) => {
        const baseSchema = schema
          .max(15, 'GSTIN Number must be 15 characters or less')
          .matches(
            /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            'Invalid GSTIN format'
          );

        if (regulator !== 'IFSCA' && isEditing) {
          return baseSchema.required('GSTIN is required for this Regulator');
        } else {
          return baseSchema.nullable();
        }
      }),
      reWebsite: Yup.string().max(
        100,
        'RE Website must be 100 characters or less'
      ),
    };

    // File validation schema - only strict when editing
    const fileValidationSchema = {
      regulator_licence: Yup.mixed()
        .test(
          'required-when-editing',
          'Regulator License is required',
          (value) => {
            if (!isEditing) return true; // Don't validate when not editing
            return (
              value &&
              ((typeof value === 'string' && value.length > 0) ||
                value instanceof File)
            );
          }
        )
        .test('file-size', 'File is too large. Max size is 500KB.', (value) => {
          if (!value) return !isEditing; // Only fail if editing and no value
          if (typeof value === 'string' && value.length > 0) return true;
          if (value instanceof File) {
            return value.size <= MAX_FILE_SIZE;
          }
          return !isEditing;
        }),

      address_proof: Yup.mixed()
        .test('required-when-editing', 'Address Proof is required', (value) => {
          if (!isEditing) return true;
          return (
            value &&
            ((typeof value === 'string' && value.length > 0) ||
              value instanceof File)
          );
        })
        .test('file-size', 'File is too large. Max size is 500KB.', (value) => {
          if (!value) return !isEditing;
          if (typeof value === 'string' && value.length > 0) return true;
          if (value instanceof File) {
            return value.size <= MAX_FILE_SIZE;
          }
          return !isEditing;
        }),

      re_pan: Yup.mixed()
        .test(
          'required-when-editing',
          'RE PAN document is required',
          (value) => {
            if (!isEditing) return true;
            return (
              value &&
              ((typeof value === 'string' && value.length > 0) ||
                value instanceof File)
            );
          }
        )
        .test('file-size', 'File is too large. Max size is 500KB.', (value) => {
          if (!value) return !isEditing;
          if (typeof value === 'string' && value.length > 0) return true;
          if (value instanceof File) {
            return value.size <= MAX_FILE_SIZE;
          }
          return !isEditing;
        }),

      re_cin: Yup.mixed().when('constitution', ([constitution], schema) => {
        if (['D', 'E', 'M'].includes(constitution)) {
          return schema
            .test(
              'required-when-editing',
              'RE CIN document is required for this Constitution',
              (value) => {
                if (!isEditing) return true;
                return (
                  value &&
                  ((typeof value === 'string' && value.length > 0) ||
                    value instanceof File)
                );
              }
            )
            .test(
              'file-size',
              'File is too large. Max size is 500KB.',
              (value) => {
                if (!value) return !isEditing;
                if (typeof value === 'string' && value.length > 0) return true;
                if (value instanceof File) {
                  return value.size <= MAX_FILE_SIZE;
                }
                return !isEditing;
              }
            );
        } else {
          return schema.nullable();
        }
      }),

      re_other_file: Yup.mixed().test(
        'file-size',
        'File is too large. Max size is 500KB.',
        (value) => {
          if (!value) return true; // Optional field
          if (typeof value === 'string' && value.length > 0) return true;
          if (value instanceof File) {
            return value.size <= MAX_FILE_SIZE;
          }
          return true;
        }
      ),
    };

    // Add required validation only when editing
    if (isEditing) {
      return Yup.object().shape({
        ...baseSchema,
        nameOfInstitution: baseSchema.nameOfInstitution.required(
          'Name of Institution is required'
        ),
        regulator: baseSchema.regulator.required('Regulator is required'),
        institutionType: baseSchema.institutionType.required(
          'Institution Type is required'
        ),
        constitution: baseSchema.constitution.required(
          'Constitution is required'
        ),
        //registrationNumber: baseSchema.registrationNumber.required('Registration Number is required'),
        pan: baseSchema.pan.required('PAN is required'),
        ...fileValidationSchema,
      });
    }

    // When not editing, still validate format but don't require fields
    return Yup.object().shape({
      ...baseSchema,
      ...fileValidationSchema,
    });
  }, [isEditing]);

  const formik = useFormik({
    initialValues: {
      nameOfInstitution: entityDetails.nameOfInstitution || '',
      regulator: entityDetails.regulator || '',
      institutionType: entityDetails.institutionType || '',
      constitution: entityDetails.constitution || '',
      //   proprietorName: entityDetails.proprietorName || '',
      proprietorName: entityDetails.proprietorName || null,
      registrationNumber: entityDetails.registrationNo || '',
      pan: entityDetails.panNo || '',
      //   cin: entityDetails.cinNo || '',
      //   llpin: entityDetails.llpinNo || '',
      //   gstin: entityDetails.gstinNo || '',
      cin: entityDetails.cinNo || null,
      llpin: entityDetails.llpinNo || null,
      gstin: entityDetails.gstinNo || null,
      reWebsite: entityDetails.reWebsite || '',
      regulator_licence: '',
      address_proof: '',
      registration_certificate: '',
      re_pan: '', // ➡️ Add this new document field
      re_cin: '', // ➡️ Add this new document field
      re_other_file: '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const formData = new FormData();

      const entityDetailsPayload = {
        nameOfInstitution: values.nameOfInstitution,
        regulator: values.regulator,
        institutionType: values.institutionType,
        constitution: values.constitution,
        proprietorName: values.proprietorName,
        registrationNo: values.registrationNumber,
        panNo: values.pan,
        cinNo: values.cin,
        llpinNo: values.llpin,
        gstinNo: values.gstin,
        reWebsite: values.reWebsite || null,
      };
      formData.append('entityDetails', JSON.stringify(entityDetailsPayload));
      documents.forEach((doc: Document) => {
        // Check if the 'file' property (the binary File object) exists
        if (doc.file) {
          // Use the API key from your mapping
          const apiKey =
            DOCUMENT_TYPE_MAPPING[
              doc.documentType as keyof typeof DOCUMENT_TYPE_MAPPING
            ];
          if (apiKey) {
            console.log(`Appending file for key: ${apiKey}`, doc.file);
            // Append the binary File object itself
            formData.append(apiKey, doc.file, doc.file.name);
          } else {
            console.log(`No file found for document type: ${doc.documentType}`);
          }
        }
      });

      // Convert FormData to a regular object for logging
      const formDataObject = Object.fromEntries(formData.entries());
      console.log(formDataObject);
      dispatch(updateEntityProfile(formData))
        .unwrap() // Use .unwrap() to handle success/rejection in a single chain
        .then(() => {
          // Action for a successful submission
          console.log('Submission successful!');
          dispatch(markStepCompleted(0));

          // ✅ Move to next step
          dispatch(setCurrentStep(1));
          // Use a state management tool or a router to navigate
          // useNavigate() from react-router-dom is the standard approach
          navigate('/re/update-address-details');
        })
        .catch((error) => {
          // Action for a failed submission
          console.error('Submission failed:', error);
          // Handle API error messages here, e.g., using a toast notification
        });
    },
    validateOnChange: true,
  });

  const isGstinRequired = formik.values.regulator !== 'IFSCA';
  const isProprietorNameRequired = formik.values.constitution === 'A';
  const isCinRequired = ['D', 'E', 'M'].includes(formik.values.constitution);
  const isLlpinRequired = formik.values.constitution === 'J';
  const regulatorOptions = formatRegulatorsForSelect(regulators);
  const constitutionOptions = formatConstitutionsForSelect(constitutions);
  const institutionTypeOptions = formatInstitutionTypesForSelect(
    institutionTypes,
    formik.values.regulator
  );

  // const handleChange =
  //   () => (event: React.SyntheticEvent, isExpanded: boolean) => {
  //     setExpanded(isExpanded);
  //   };

  const handleFileRemove = (documentType: string) => {
    // Option 1: Using updateDocument with empty values to remove
    dispatch(
      updateDocument({
        documentType,
        base64Content: '',
        file: undefined,
        fileName: '',
      })
    );

    // Option 2: If you created removeDocument action:
    // dispatch(removeDocument(documentType));

    // Clear the Formik field value
    const formikFieldName = documentType.toLowerCase();
    formik.setFieldValue(formikFieldName, '');

    // Also clear any related validation errors
    formik.setFieldError(formikFieldName, undefined);
  };
  const { setFieldValue } = formik;

  const syncDocuments = useCallback(() => {
    if (documents.length > 0) {
      const documentsToSync = [
        'REGULATOR_LICENCE',
        'ADDRESS_PROOF',
        'REGISTRATION_CERTIFICATE',
        'RE_PAN',
        'RE_CIN',
        'RE_OTHER_FILE',
      ];

      documentsToSync.forEach((docType) => {
        const doc = documents.find((d: Document) => d.documentType === docType);
        const formikFieldName = docType.toLowerCase();

        if (doc && doc.fileName) {
          setFieldValue(formikFieldName, doc.fileName);
        } else if (doc && doc.file) {
          setFieldValue(formikFieldName, doc.file);
        }
      });
    }
  }, [documents, setFieldValue]);

  useEffect(() => {
    syncDocuments();
  }, [syncDocuments]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     dispatch(
  //         fetchUpdateAdminDetails({ token: authToken })
  //        );
  //     dispatch(fetchDropdownMasters());
  //     // 1. Show the loader immediately before the API call
  //     dispatch(showLoader('Please Wait...'));

  //     try {
  //       // 2. Dispatch the thunk and wait for it to complete
  //       await dispatch(fetchEntityProfile());
  //     } finally {
  //       dispatch(hideLoader());
  //     }
  //   };

  //   fetchData();
  // }, [dispatch]);
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  // Get the current workflowStatus from Redux state

  useEffect(() => {
    const fetchData = async () => {
      // Show loader FIRST, before any API calls
      dispatch(showLoader('Please Wait...'));

      try {
        const response = await dispatch(
          fetchUpdateAdminDetails({ token: authToken })
        );

        if (!response?.payload) {
          console.error('No response payload received');
          return;
        }
        if ('error' in response.payload) {
          console.error(
            'Error fetching admin details:',
            response.payload.error
          );
          return;
        }
        if (response.payload.workflowStatus === 'SUBMITTED_PENDING_APPROVAL') {
          dispatch(hideLoader());
          navigate('/re/update-track-status');
          return;
        }

        dispatch(fetchDropdownMasters());
        await dispatch(fetchEntityProfile());
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        dispatch(hideLoader());
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, authToken]);

  const handleFileUpload =
    (documentType: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file) {
        console.log(`Uploading file for ${documentType}:`, file.name);
        formik.setFieldValue(documentType.toLowerCase(), file);
        console.log(documentType, 'documentType NAme');

        const reader = new FileReader();
        reader.onloadend = () => {
          dispatch(
            updateDocument({
              documentType,
              base64Content: reader.result as string,
              file,
            })
          );
        };
        reader.readAsDataURL(file);
      }
    };

  const getDocumentBase64 = (documentType: string): string => {
    const doc = documents.find(
      (d: Document) => d.documentType === documentType
    );
    return doc?.base64Content || '';
  };

  const getDocumentFileName = (documentType: string): string => {
    const doc = documents.find(
      (d: Document) => d.documentType === documentType
    );
    return doc?.fileName || '';
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#fefefeff' }}>
      <BreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'Update Profile', href: '/re/dashboard' },
          { label: 'Entity Profile' },
        ]}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'center',
          mt: 3,
          ml: 0.5,
        }}
      >
        <Typography
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: {
              xs: '0.9rem',
              sm: '1.05rem',
              md: '1.15rem',
              lg: '1.25rem',
              xl: '1.35rem',
            },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {'Entity Profile'}
        </Typography>
      </Box>
      <ApplicationStepperUpdate />

      <AccordionDetails sx={{ pl: 0, ml: -12 }}>
        <EntityFormContainer className="entity-form">
          <StyledAccordion
            sx={{
              border: '1px solid #e0e0e0',
              boxShadow: 'none',
              borderRadius: '5px',
            }}
            defaultExpanded
          >
            <StyledAccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#e6ebff !important',
                marginBottom: '0px !important',
                '&.Mui-expanded': {
                  minHeight: '50px !important',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  height: '0px',
                  minHeight: 'auto',
                }}
              >
                <Typography sx={titleStyles}>Entity Profile</Typography>
                {/* <Button
              style={{
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 500,
                color: '#002CBA',
              }}
              onClick={(event) => {
                event.stopPropagation();
                setIsEditing(true);
              }}
            >
              Edit
            </Button> */}
              </Box>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2} className="form-grid">
                  {/* Row 1 */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      variant="body2"
                      className="form-label"
                      sx={labelStyles}
                    >
                      Name of Institution{' '}
                      <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      name="nameOfInstitution"
                      value={formik.values.nameOfInstitution}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      sx={inputStyles}
                      error={
                        formik.touched.nameOfInstitution &&
                        Boolean(formik.errors.nameOfInstitution)
                      }
                      helperText={
                        formik.touched.nameOfInstitution &&
                        formik.errors.nameOfInstitution
                      }
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      variant="body2"
                      className="form-label"
                      sx={labelStyles}
                    >
                      Regulator <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        name="regulator"
                        sx={selectStyles}
                        value={formik.values.regulator}
                        onChange={formik.handleChange}
                        IconComponent={KeyboardArrowDown}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.regulator &&
                          Boolean(formik.errors.regulator)
                        }
                        disabled={!isEditing}
                      >
                        {regulatorOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formik.touched.regulator && formik.errors.regulator && (
                      <Typography color="error" variant="caption">
                        {formik.errors.regulator}
                      </Typography>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <Typography
                        variant="body2"
                        className="form-label"
                        sx={labelStyles}
                      >
                        Institution Type <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <Select
                        name="institutionType"
                        sx={selectStyles}
                        value={formik.values.institutionType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        IconComponent={KeyboardArrowDown}
                        error={
                          formik.touched.institutionType &&
                          Boolean(formik.errors.institutionType)
                        }
                        disabled={!isEditing}
                      >
                        {institutionTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formik.touched.institutionType &&
                      formik.errors.institutionType && (
                        <Typography color="error" variant="caption">
                          {formik.errors.institutionType}
                        </Typography>
                      )}
                  </Grid>

                  {/* Row 2 */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      variant="body2"
                      className="form-label"
                      sx={labelStyles}
                    >
                      Constitution <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        name="constitution"
                        sx={selectStyles}
                        IconComponent={KeyboardArrowDown}
                        value={formik.values.constitution}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.constitution &&
                          Boolean(formik.errors.constitution)
                        }
                        disabled={!isEditing}
                      >
                        {constitutionOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formik.touched.constitution &&
                      formik.errors.constitution && (
                        <Typography color="error" variant="caption">
                          {formik.errors.constitution}
                        </Typography>
                      )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      variant="body2"
                      className="form-label"
                      sx={labelStyles}
                    >
                      Proprietor Name
                      {isProprietorNameRequired && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    <TextField
                      fullWidth
                      name="proprietorName"
                      sx={inputStyles}
                      value={formik.values.proprietorName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.proprietorName &&
                        Boolean(formik.errors.proprietorName)
                      }
                      helperText={
                        formik.touched.proprietorName &&
                        formik.errors.proprietorName
                      }
                      disabled={!isEditing}
                    />
                  </Grid>
                  <FileUploadComponent
                    label="Regulator License/Certificate"
                    required={true}
                    documentType="REGULATOR_LICENCE"
                    textFieldProps={{
                      name: 'pan',
                      value: formik.values.pan,
                      onChange: formik.handleChange,
                      onBlur: formik.handleBlur,
                      error: formik.touched.pan && Boolean(formik.errors.pan),
                      helperText: formik.touched.pan && formik.errors.pan,
                    }}
                    base64Content={getDocumentBase64('REGULATOR_LICENCE')}
                    onFileChange={handleFileUpload('REGULATOR_LICENCE')}
                    documentFileValue={formik.values.regulator_licence}
                    documentTouched={formik.touched.regulator_licence}
                    documentError={formik.errors.regulator_licence}
                    disabled={!isEditing}
                  />
                  {/* <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" className="form-label">
                    Registration Number <span className="required-star">*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    name="registrationNumber"
                    value={formik.values.registrationNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.registrationNumber &&
                      Boolean(formik.errors.registrationNumber)
                    }
                    helperText={
                      formik.touched.registrationNumber &&
                      formik.errors.registrationNumber
                    }
                    disabled={!isEditing}
                  />
                </Grid> */}

                  {/* Row 3 - PAN, CIN, LLPIN */}

                  <FileUploadComponent
                    label="PAN"
                    required={true}
                    documentType="RE_PAN"
                    base64Content={getDocumentBase64('RE_PAN')}
                    fileName={getDocumentFileName('RE_PAN')}
                    onFileChange={handleFileUpload('RE_PAN')}
                    textFieldProps={{
                      name: 'pan',
                      value: formik.values.pan,
                      onChange: formik.handleChange,
                      onBlur: formik.handleBlur,
                      error: formik.touched.pan && Boolean(formik.errors.pan),
                      helperText: formik.touched.pan && formik.errors.pan,
                    }}
                    documentFileValue={formik.values.re_pan}
                    documentTouched={formik.touched.re_pan}
                    documentError={formik.errors.re_pan}
                    disabled={!isEditing}
                  />

                  <FileUploadComponent
                    label="CIN"
                    required={isCinRequired}
                    documentType="RE_CIN"
                    base64Content={getDocumentBase64('RE_CIN')}
                    onFileChange={handleFileUpload('RE_CIN')}
                    textFieldProps={{
                      name: 'cin',
                      value: formik.values.cin,
                      onChange: formik.handleChange,
                      onBlur: formik.handleBlur,
                      error: formik.touched.cin && Boolean(formik.errors.cin),
                      helperText: formik.touched.cin && formik.errors.cin,
                    }}
                    documentFileValue={formik.values.re_cin}
                    documentTouched={formik.touched.re_cin}
                    documentError={formik.errors.re_cin}
                    disabled={!isEditing}
                  />

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      variant="body2"
                      className="form-label"
                      sx={labelStyles}
                    >
                      LLPIN (Limited liability Partnership firm)
                      {isLlpinRequired && (
                        <span className="required-star">*</span>
                      )}
                    </Typography>
                    <TextField
                      fullWidth
                      name="llpin"
                      sx={inputStyles}
                      value={formik.values.llpin}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.llpin && Boolean(formik.errors.llpin)
                      }
                      helperText={formik.touched.llpin && formik.errors.llpin}
                      disabled={!isEditing}
                    />
                  </Grid>

                  {/* Row 4 - GSTIN, RE Website, etc. */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      variant="body2"
                      className="form-label"
                      sx={labelStyles}
                    >
                      GSTIN
                      {isGstinRequired && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    <TextField
                      fullWidth
                      name="gstin"
                      sx={inputStyles}
                      value={formik.values.gstin}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.gstin && Boolean(formik.errors.gstin)
                      }
                      helperText={formik.touched.gstin && formik.errors.gstin}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography
                      variant="body2"
                      className="form-label"
                      sx={labelStyles}
                    >
                      RE Website URL
                    </Typography>
                    <TextField
                      fullWidth
                      name="reWebsite"
                      sx={inputStyles}
                      value={formik.values.reWebsite}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.reWebsite &&
                        Boolean(formik.errors.reWebsite)
                      }
                      helperText={
                        formik.touched.reWebsite && formik.errors.reWebsite
                      }
                      disabled={!isEditing}
                    />
                  </Grid>

                  {/* Row 5 - Certificate Uploads */}

                  {/* <FileUploadComponent
                    label="Registration Certificate"
                    required={true}
                    documentType="REGISTRATION_CERTIFICATE"
                    base64Content={getDocumentBase64('REGISTRATION_CERTIFICATE')}
                    onFileChange={handleFileUpload('REGISTRATION_CERTIFICATE')}
                    documentFileValue={formik.values.registration_certificate}
                    documentTouched={formik.touched.registration_certificate}
                    documentError={formik.errors.registration_certificate}
                    disabled={!isEditing}
                  /> */}

                  <FileUploadComponent
                    label="Address Proof"
                    required={true}
                    documentType="ADDRESS_PROOF"
                    base64Content={getDocumentBase64('ADDRESS_PROOF')}
                    onFileRemove={() => handleFileRemove('ADDRESS_PROOF')}
                    onFileChange={handleFileUpload('ADDRESS_PROOF')}
                    documentFileValue={formik.values.address_proof}
                    documentTouched={formik.touched.address_proof}
                    documentError={formik.errors.address_proof}
                    disabled={!isEditing}
                  />

                  <FileUploadComponent
                    label="Other"
                    documentType="RE_OTHER_FILE"
                    base64Content={getDocumentBase64('RE_OTHER_FILE')}
                    onFileRemove={() => handleFileRemove('RE_OTHER_FILE')}
                    onFileChange={handleFileUpload('RE_OTHER_FILE')}
                    documentFileValue={formik.values.re_other_file}
                    documentTouched={formik.touched.re_other_file}
                    documentError={formik.errors.re_other_file}
                    disabled={!isEditing}
                  />
                </Grid>
              </form>
            </StyledAccordionDetails>
          </StyledAccordion>

          {/* Buttons */}
          <ButtonActionsBox
            sx={{
              mt: 2,
            }}
          >
            {/* <Button
              style={{
                textTransform: 'none',
                borderColor: '#002cba',
                color: '#002cba',
                padding: '10px 50px',
              }}
              variant="outlined"
              className="cancel-button"
              onClick={() => navigate('/re/dashboard')}
            >
              Cancel
            </Button> */}
            <SaveButton
              sx={{
                px: [3, 4, 5], // [xs, sm, md] and up
                py: [0.8, 1, 1], // [xs, sm, md] and up
              }}
              style={{ textTransform: 'none' }}
              variant="contained"
              onClick={() => formik.handleSubmit()}
              //disabled={(!formik.isValid) || loading}
            >
              {loading ? 'Saving...' : 'Save and Next'}
            </SaveButton>
          </ButtonActionsBox>
        </EntityFormContainer>
      </AccordionDetails>
    </Box>
  );
};

export default UpdateEntityProfileForm;
