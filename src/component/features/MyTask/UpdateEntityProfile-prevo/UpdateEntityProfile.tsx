import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { FormControl } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ActionButton } from '../../../common/buttons/ActionButtons';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  StyledContainer,
  StyledFormContainer,
  StyledAccordion,
  StyledAccordionSummary,
  StyledAccordionDetails,
  FormRow,
  FormFieldContainer,
  FileUploadArea,
  UploadedFileItem,
  ActionButtonsContainer,
  fieldSx,
  disabledFieldSx,
  sectionTitleSx,
  subsectionTitleSx,
  pageTitleSx,
  checkboxContainerSx,
  checkboxSx,
  checkboxLabelSx,
  uploadButtonSx,
  uploadedFileTextSx,
  deleteButtonSx,
  dividerSx,
  uploadHelpTextSx,
} from './UpdateEntityProfile.styles';

interface FormData {
  // Entity Profile
  institutionName: string;
  regulator: string;
  institutionType: string;
  constitution: string;
  proprietorName: string;
  registrationNumber: string;
  pan: string;
  cin: string;
  lipn: string;
  gstn: string;
  website: string;
  regulatorLicense: string;

  // Address Details
  registeredAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  correspondenceAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  sameAsRegistered: boolean;

  // Head of Institution Details
  headOfInstitution: {
    ckycNumber: string;
    title: string;
    fullName: string;
    designation: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    countryCode: string;
    mobileNumber: string;
    landline: string;
  };

  // Nodal Officer Details
  nodalOfficer: {
    ckycNumber: string;
    title: string;
    fullName: string;
    designation: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    countryCode: string;
    mobileNumber: string;
    landline: string;
    dateOfAuthorization: string;
  };

  // Institutional Admin User 1 Details
  admin1: {
    ckycNumber: string;
    title: string;
    fullName: string;
    designation: string;
    email: string;
    gender: string;
    countryCode: string;
    mobileNumber: string;
    landline: string;
    employeeCode: string;
  };

  // Institutional Admin User 2 Details
  admin2: {
    ckycNumber: string;
    title: string;
    fullName: string;
    designation: string;
    email: string;
    gender: string;
    countryCode: string;
    mobileNumber: string;
    landline: string;
    employeeCode: string;
  };
}

const UpdateEntityProfile: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    // Entity Profile
    institutionName: '',
    regulator: '',
    institutionType: '',
    constitution: '',
    proprietorName: '',
    registrationNumber: '',
    pan: '',
    cin: '',
    lipn: '',
    gstn: '',
    website: '',
    regulatorLicense: '',

    // Address Details
    registeredAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    correspondenceAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    sameAsRegistered: false,

    // Head of Institution Details
    headOfInstitution: {
      ckycNumber: '',
      title: '',
      fullName: '',
      designation: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      countryCode: '+91',
      mobileNumber: '',
      landline: '',
    },

    // Nodal Officer Details
    nodalOfficer: {
      ckycNumber: '',
      title: '',
      fullName: '',
      designation: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      countryCode: '+91',
      mobileNumber: '',
      landline: '',
      dateOfAuthorization: '',
    },

    // Institutional Admin User 1 Details
    admin1: {
      ckycNumber: '',
      title: '',
      fullName: '',
      designation: '',
      email: '',
      gender: '',
      countryCode: '+91',
      mobileNumber: '',
      landline: '',
      employeeCode: '',
    },

    // Institutional Admin User 2 Details
    admin2: {
      ckycNumber: '',
      title: '',
      fullName: '',
      designation: '',
      email: '',
      gender: '',
      countryCode: '+91',
      mobileNumber: '',
      landline: '',
      employeeCode: '',
    },
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );

  const handleInputChange = (section: string, field: string, value: string) => {
    if (section === 'main') {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setFormData((prev) => {
        const currentSection = prev[section as keyof FormData];
        return {
          ...prev,
          [section]: {
            ...(currentSection && typeof currentSection === 'object'
              ? currentSection
              : {}),
            [field]: value,
          },
        };
      });
    }
  };

  const handleSameAddressChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsRegistered: checked,
      correspondenceAddress: checked
        ? prev.registeredAddress
        : {
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
          },
    }));
  };

  const handleFileUpload = (section: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setUploadedFiles((prev) => ({
        ...prev,
        [section]: [...(prev[section] || []), ...fileArray],
      }));
    }
  };

  const handleFileDelete = (section: string, fileIndex: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [section]: prev[section]?.filter((_, index) => index !== fileIndex) || [],
    }));
  };

  const FileUploadSection: React.FC<{ title: string; section: string }> = ({
    title,
    section,
  }) => (
    <Box sx={{ marginBottom: 2 }}>
      <Typography variant="subtitle2" sx={subsectionTitleSx}>
        {title}
      </Typography>
      <FileUploadArea>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileUpload(section, e.target.files)}
          style={{ display: 'none' }}
          id={`file-upload-${section}`}
        />
        <label htmlFor={`file-upload-${section}`}>
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={uploadButtonSx}
          >
            Choose Files
          </Button>
        </label>
        <Typography variant="body2" sx={uploadHelpTextSx}>
          Drag and drop files here or click to browse
        </Typography>
      </FileUploadArea>
      {uploadedFiles[section]?.map((file, index) => (
        <UploadedFileItem key={index}>
          <Typography variant="body2" sx={uploadedFileTextSx}>
            {file.name}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleFileDelete(section, index)}
            sx={deleteButtonSx}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </UploadedFileItem>
      ))}
    </Box>
  );

  return (
    <StyledContainer>
      <Typography variant="h4" sx={pageTitleSx}>
        Update Entity Profile
      </Typography>

      {/* Entity Profile Section */}
      <StyledFormContainer>
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={sectionTitleSx}>
              Entity Profile
            </Typography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            {/* First Row - 3 columns */}
            <FormRow>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Name of Institution *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="HDFC Bank"
                  value={formData.institutionName}
                  onChange={(e) =>
                    handleInputChange('main', 'institutionName', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Regulator *
                </Typography>
                <FormControl fullWidth sx={fieldSx}>
                  <Select
                    value={formData.regulator}
                    onChange={(e) =>
                      handleInputChange('main', 'regulator', e.target.value)
                    }
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <span style={{ color: '#999' }}>
                            Government Agency
                          </span>
                        );
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="Government Agency">
                      Government Agency
                    </MenuItem>
                    <MenuItem value="RBI">RBI</MenuItem>
                    <MenuItem value="SEBI">SEBI</MenuItem>
                    <MenuItem value="IRDAI">IRDAI</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Institution Type
                </Typography>
                <FormControl fullWidth sx={fieldSx}>
                  <Select
                    value={formData.institutionType}
                    onChange={(e) =>
                      handleInputChange(
                        'main',
                        'institutionType',
                        e.target.value
                      )
                    }
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <span style={{ color: '#999' }}>
                            Government Agency
                          </span>
                        );
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="Government Agency">
                      Government Agency
                    </MenuItem>
                    <MenuItem value="Bank">Bank</MenuItem>
                    <MenuItem value="NBFC">NBFC</MenuItem>
                    <MenuItem value="Insurance">Insurance</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            {/* Second Row - 3 columns */}
            <FormRow>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Constitution *
                </Typography>
                <FormControl fullWidth sx={fieldSx}>
                  <Select
                    value={formData.constitution}
                    onChange={(e) =>
                      handleInputChange('main', 'constitution', e.target.value)
                    }
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <span style={{ color: '#999' }}>
                            Government Agency
                          </span>
                        );
                      }
                      return selected;
                    }}
                  >
                    <MenuItem value="Government Agency">
                      Government Agency
                    </MenuItem>
                    <MenuItem value="Private Limited">Private Limited</MenuItem>
                    <MenuItem value="Public Limited">Public Limited</MenuItem>
                    <MenuItem value="Partnership">Partnership</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Proprietor Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="-"
                  value={formData.proprietorName || ''}
                  onChange={(e) =>
                    handleInputChange('main', 'proprietorName', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Registration Number *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Government Agency"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    handleInputChange(
                      'main',
                      'registrationNumber',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            {/* Third Row - PAN with thumbnail, CIN, LIPN */}
            <FormRow>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  PAN *
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="AAAAA9999A"
                    value={formData.pan}
                    onChange={(e) =>
                      handleInputChange('main', 'pan', e.target.value)
                    }
                    sx={fieldSx}
                  />
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#e8f4fd',
                      border: '1px solid #3498db',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 20,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '2px',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          right: '2px',
                          height: '2px',
                          backgroundColor: '#3498db',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '6px',
                          left: '2px',
                          right: '2px',
                          height: '1px',
                          backgroundColor: '#ccc',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '9px',
                          left: '2px',
                          right: '2px',
                          height: '1px',
                          backgroundColor: '#ccc',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  CIN
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="AAAAA9999A"
                    value={formData.cin}
                    onChange={(e) =>
                      handleInputChange('main', 'cin', e.target.value)
                    }
                    sx={fieldSx}
                  />
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#e8f4fd',
                      border: '1px solid #3498db',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 20,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '2px',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          right: '2px',
                          height: '2px',
                          backgroundColor: '#3498db',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '6px',
                          left: '2px',
                          right: '2px',
                          height: '1px',
                          backgroundColor: '#ccc',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '9px',
                          left: '2px',
                          right: '2px',
                          height: '1px',
                          backgroundColor: '#ccc',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  LLPIN (Limited liability Partnership firm)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="ABC-1234"
                  value={formData.lipn}
                  onChange={(e) =>
                    handleInputChange('main', 'lipn', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            {/* Fourth Row - GSTIN, RE Website, Regulator License with thumbnail */}
            <FormRow>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  GSTIN
                </Typography>
                <TextField
                  fullWidth
                  placeholder="22ABCDE1234F1Z5"
                  value={formData.gstn}
                  onChange={(e) =>
                    handleInputChange('main', 'gstn', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  RE Website
                </Typography>
                <TextField
                  fullWidth
                  placeholder="reportingentity.com"
                  value={formData.website}
                  onChange={(e) =>
                    handleInputChange('main', 'website', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Regulator License/Certificate/Notification
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#e8f4fd',
                    border: '1px solid #3498db',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 20,
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '2px',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                        right: '2px',
                        height: '2px',
                        backgroundColor: '#3498db',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '6px',
                        left: '2px',
                        right: '2px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '9px',
                        left: '2px',
                        right: '2px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                  </Box>
                </Box>
              </FormFieldContainer>
            </FormRow>

            {/* Document Upload Thumbnails Row */}
            <FormRow sx={{ marginTop: 3 }}>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Registration Certificate
                </Typography>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 32,
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      position: 'relative',
                      marginBottom: 1,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        height: '3px',
                        backgroundColor: '#3498db',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '9px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '13px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '17px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 16,
                      height: 16,
                      backgroundColor: '#4CAF50',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 3,
                        borderLeft: '2px solid white',
                        borderBottom: '2px solid white',
                        transform: 'rotate(-45deg)',
                        marginTop: '-1px',
                      }}
                    />
                  </Box>
                </Box>
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Address Proof
                </Typography>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 32,
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      position: 'relative',
                      marginBottom: 1,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        height: '3px',
                        backgroundColor: '#3498db',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '9px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '13px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '17px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 16,
                      height: 16,
                      backgroundColor: '#4CAF50',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 3,
                        borderLeft: '2px solid white',
                        borderBottom: '2px solid white',
                        transform: 'rotate(-45deg)',
                        marginTop: '-1px',
                      }}
                    />
                  </Box>
                </Box>
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontFamily: 'Gilroy, sans-serif',
                  }}
                >
                  Other
                </Typography>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 32,
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      position: 'relative',
                      marginBottom: 1,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        height: '3px',
                        backgroundColor: '#3498db',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '9px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '13px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '17px',
                        left: '3px',
                        right: '3px',
                        height: '1px',
                        backgroundColor: '#ccc',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 16,
                      height: 16,
                      backgroundColor: '#4CAF50',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 3,
                        borderLeft: '2px solid white',
                        borderBottom: '2px solid white',
                        transform: 'rotate(-45deg)',
                        marginTop: '-1px',
                      }}
                    />
                  </Box>
                </Box>
              </FormFieldContainer>
            </FormRow>
          </StyledAccordionDetails>
        </StyledAccordion>
      </StyledFormContainer>

      {/* Address Details Section */}
      <StyledFormContainer>
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={sectionTitleSx}>
              Address Details
            </Typography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <Typography variant="h6" sx={subsectionTitleSx}>
              Registered Address
            </Typography>
            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Address Line 1 *"
                  value={formData.registeredAddress.addressLine1}
                  onChange={(e) =>
                    handleInputChange(
                      'registeredAddress',
                      'addressLine1',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={formData.registeredAddress.addressLine2}
                  onChange={(e) =>
                    handleInputChange(
                      'registeredAddress',
                      'addressLine2',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="City *"
                  value={formData.registeredAddress.city}
                  onChange={(e) =>
                    handleInputChange(
                      'registeredAddress',
                      'city',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="State *"
                  value={formData.registeredAddress.state}
                  onChange={(e) =>
                    handleInputChange(
                      'registeredAddress',
                      'state',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Pincode *"
                  value={formData.registeredAddress.pincode}
                  onChange={(e) =>
                    handleInputChange(
                      'registeredAddress',
                      'pincode',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Country *"
                  value={formData.registeredAddress.country}
                  onChange={(e) =>
                    handleInputChange(
                      'registeredAddress',
                      'country',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <Box sx={checkboxContainerSx}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.sameAsRegistered}
                    onChange={(e) => handleSameAddressChange(e.target.checked)}
                    sx={checkboxSx}
                  />
                }
                label="Same as Registered Address"
                sx={checkboxLabelSx}
              />
            </Box>

            <Typography variant="h6" sx={subsectionTitleSx}>
              Correspondence Address
            </Typography>
            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Address Line 1 *"
                  value={formData.correspondenceAddress.addressLine1}
                  onChange={(e) =>
                    handleInputChange(
                      'correspondenceAddress',
                      'addressLine1',
                      e.target.value
                    )
                  }
                  disabled={formData.sameAsRegistered}
                  sx={disabledFieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={formData.correspondenceAddress.addressLine2}
                  onChange={(e) =>
                    handleInputChange(
                      'correspondenceAddress',
                      'addressLine2',
                      e.target.value
                    )
                  }
                  disabled={formData.sameAsRegistered}
                  sx={disabledFieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="City *"
                  value={formData.correspondenceAddress.city}
                  onChange={(e) =>
                    handleInputChange(
                      'correspondenceAddress',
                      'city',
                      e.target.value
                    )
                  }
                  disabled={formData.sameAsRegistered}
                  sx={disabledFieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="State *"
                  value={formData.correspondenceAddress.state}
                  onChange={(e) =>
                    handleInputChange(
                      'correspondenceAddress',
                      'state',
                      e.target.value
                    )
                  }
                  disabled={formData.sameAsRegistered}
                  sx={disabledFieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Pincode *"
                  value={formData.correspondenceAddress.pincode}
                  onChange={(e) =>
                    handleInputChange(
                      'correspondenceAddress',
                      'pincode',
                      e.target.value
                    )
                  }
                  disabled={formData.sameAsRegistered}
                  sx={disabledFieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Country *"
                  value={formData.correspondenceAddress.country}
                  onChange={(e) =>
                    handleInputChange(
                      'correspondenceAddress',
                      'country',
                      e.target.value
                    )
                  }
                  disabled={formData.sameAsRegistered}
                  sx={disabledFieldSx}
                />
              </FormFieldContainer>
            </FormRow>
          </StyledAccordionDetails>
        </StyledAccordion>
      </StyledFormContainer>

      {/* Head of Institution Details Section */}
      <StyledFormContainer>
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={sectionTitleSx}>
              Head of Institution Details
            </Typography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="CKYC Number"
                  value={formData.headOfInstitution.ckycNumber}
                  onChange={(e) =>
                    handleInputChange(
                      'headOfInstitution',
                      'ckycNumber',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Title *</InputLabel>
                  <Select
                    value={formData.headOfInstitution.title}
                    onChange={(e) =>
                      handleInputChange(
                        'headOfInstitution',
                        'title',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={formData.headOfInstitution.fullName}
                  onChange={(e) =>
                    handleInputChange(
                      'headOfInstitution',
                      'fullName',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Designation *"
                  value={formData.headOfInstitution.designation}
                  onChange={(e) =>
                    handleInputChange(
                      'headOfInstitution',
                      'designation',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.headOfInstitution.email}
                  onChange={(e) =>
                    handleInputChange(
                      'headOfInstitution',
                      'email',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    value={formData.headOfInstitution.gender}
                    onChange={(e) =>
                      handleInputChange(
                        'headOfInstitution',
                        'gender',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Date of Birth *"
                  type="date"
                  value={formData.headOfInstitution.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange(
                      'headOfInstitution',
                      'dateOfBirth',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                  InputLabelProps={{ shrink: true }}
                />
              </FormFieldContainer>
              <FormFieldContainer></FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer width="quarter">
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Country Code *</InputLabel>
                  <Select
                    value={formData.headOfInstitution.countryCode}
                    onChange={(e) =>
                      handleInputChange(
                        'headOfInstitution',
                        'countryCode',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="+91">+91 (India)</MenuItem>
                    <MenuItem value="+1">+1 (USA)</MenuItem>
                    <MenuItem value="+44">+44 (UK)</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
              <FormFieldContainer width="quarter">
                <TextField
                  fullWidth
                  label="Mobile Number *"
                  value={formData.headOfInstitution.mobileNumber}
                  onChange={(e) =>
                    handleInputChange(
                      'headOfInstitution',
                      'mobileNumber',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Landline"
                  value={formData.headOfInstitution.landline}
                  onChange={(e) =>
                    handleInputChange(
                      'headOfInstitution',
                      'landline',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <Divider sx={dividerSx} />

            <Typography variant="h6" sx={subsectionTitleSx}>
              Document Uploads
            </Typography>
            <FormRow>
              <FormFieldContainer width="third">
                <FileUploadSection
                  title="Proof of Identity *"
                  section="headProofId"
                />
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <FileUploadSection
                  title="Certified copy of Photo Identity *"
                  section="headPhotoId"
                />
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <FileUploadSection
                  title="Board Resolution *"
                  section="headBoardResolution"
                />
              </FormFieldContainer>
            </FormRow>
          </StyledAccordionDetails>
        </StyledAccordion>
      </StyledFormContainer>

      {/* Nodal Officer Details Section */}
      <StyledFormContainer>
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={sectionTitleSx}>
              Nodal Officer Details
            </Typography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="CKYC Number"
                  value={formData.nodalOfficer.ckycNumber}
                  onChange={(e) =>
                    handleInputChange(
                      'nodalOfficer',
                      'ckycNumber',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Title *</InputLabel>
                  <Select
                    value={formData.nodalOfficer.title}
                    onChange={(e) =>
                      handleInputChange('nodalOfficer', 'title', e.target.value)
                    }
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={formData.nodalOfficer.fullName}
                  onChange={(e) =>
                    handleInputChange(
                      'nodalOfficer',
                      'fullName',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Designation *"
                  value={formData.nodalOfficer.designation}
                  onChange={(e) =>
                    handleInputChange(
                      'nodalOfficer',
                      'designation',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.nodalOfficer.email}
                  onChange={(e) =>
                    handleInputChange('nodalOfficer', 'email', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    value={formData.nodalOfficer.gender}
                    onChange={(e) =>
                      handleInputChange(
                        'nodalOfficer',
                        'gender',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Date of Birth *"
                  type="date"
                  value={formData.nodalOfficer.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange(
                      'nodalOfficer',
                      'dateOfBirth',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                  InputLabelProps={{ shrink: true }}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Date of Authorization *"
                  type="date"
                  value={formData.nodalOfficer.dateOfAuthorization}
                  onChange={(e) =>
                    handleInputChange(
                      'nodalOfficer',
                      'dateOfAuthorization',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                  InputLabelProps={{ shrink: true }}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer width="quarter">
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Country Code *</InputLabel>
                  <Select
                    value={formData.nodalOfficer.countryCode}
                    onChange={(e) =>
                      handleInputChange(
                        'nodalOfficer',
                        'countryCode',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="+91">+91 (India)</MenuItem>
                    <MenuItem value="+1">+1 (USA)</MenuItem>
                    <MenuItem value="+44">+44 (UK)</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
              <FormFieldContainer width="quarter">
                <TextField
                  fullWidth
                  label="Mobile Number *"
                  value={formData.nodalOfficer.mobileNumber}
                  onChange={(e) =>
                    handleInputChange(
                      'nodalOfficer',
                      'mobileNumber',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Landline"
                  value={formData.nodalOfficer.landline}
                  onChange={(e) =>
                    handleInputChange(
                      'nodalOfficer',
                      'landline',
                      e.target.value
                    )
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <Divider sx={dividerSx} />

            <Typography variant="h6" sx={subsectionTitleSx}>
              Document Uploads
            </Typography>
            <FormRow>
              <FormFieldContainer width="third">
                <FileUploadSection
                  title="Proof of Identity *"
                  section="nodalProofId"
                />
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <FileUploadSection
                  title="Authorization Letter by Competent Authority *"
                  section="nodalAuthLetter"
                />
              </FormFieldContainer>
              <FormFieldContainer width="third">
                <FileUploadSection
                  title="Financial Authorization Letter *"
                  section="nodalFinancialAuth"
                />
              </FormFieldContainer>
            </FormRow>
          </StyledAccordionDetails>
        </StyledAccordion>
      </StyledFormContainer>

      {/* Institutional Admin User 1 Details Section */}
      <StyledFormContainer>
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={sectionTitleSx}>
              Institutional Admin User 1 Details
            </Typography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="CKYC Number"
                  value={formData.admin1.ckycNumber}
                  onChange={(e) =>
                    handleInputChange('admin1', 'ckycNumber', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Title *</InputLabel>
                  <Select
                    value={formData.admin1.title}
                    onChange={(e) =>
                      handleInputChange('admin1', 'title', e.target.value)
                    }
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={formData.admin1.fullName}
                  onChange={(e) =>
                    handleInputChange('admin1', 'fullName', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Designation *"
                  value={formData.admin1.designation}
                  onChange={(e) =>
                    handleInputChange('admin1', 'designation', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.admin1.email}
                  onChange={(e) =>
                    handleInputChange('admin1', 'email', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    value={formData.admin1.gender}
                    onChange={(e) =>
                      handleInputChange('admin1', 'gender', e.target.value)
                    }
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Employee Code *"
                  value={formData.admin1.employeeCode}
                  onChange={(e) =>
                    handleInputChange('admin1', 'employeeCode', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer></FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer width="quarter">
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Country Code *</InputLabel>
                  <Select
                    value={formData.admin1.countryCode}
                    onChange={(e) =>
                      handleInputChange('admin1', 'countryCode', e.target.value)
                    }
                  >
                    <MenuItem value="+91">+91 (India)</MenuItem>
                    <MenuItem value="+1">+1 (USA)</MenuItem>
                    <MenuItem value="+44">+44 (UK)</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
              <FormFieldContainer width="quarter">
                <TextField
                  fullWidth
                  label="Mobile Number *"
                  value={formData.admin1.mobileNumber}
                  onChange={(e) =>
                    handleInputChange('admin1', 'mobileNumber', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Landline"
                  value={formData.admin1.landline}
                  onChange={(e) =>
                    handleInputChange('admin1', 'landline', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <Divider sx={dividerSx} />

            <Typography variant="h6" sx={subsectionTitleSx}>
              Document Uploads
            </Typography>
            <FormRow>
              <FormFieldContainer>
                <FileUploadSection
                  title="Proof of Identity *"
                  section="admin1ProofId"
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FileUploadSection
                  title="Authorization Letters *"
                  section="admin1AuthLetters"
                />
              </FormFieldContainer>
            </FormRow>
          </StyledAccordionDetails>
        </StyledAccordion>
      </StyledFormContainer>

      {/* Institutional Admin User 2 Details Section */}
      <StyledFormContainer>
        <StyledAccordion>
          <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={sectionTitleSx}>
              Institutional Admin User 2 Details
            </Typography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="CKYC Number"
                  value={formData.admin2.ckycNumber}
                  onChange={(e) =>
                    handleInputChange('admin2', 'ckycNumber', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Title *</InputLabel>
                  <Select
                    value={formData.admin2.title}
                    onChange={(e) =>
                      handleInputChange('admin2', 'title', e.target.value)
                    }
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={formData.admin2.fullName}
                  onChange={(e) =>
                    handleInputChange('admin2', 'fullName', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Designation *"
                  value={formData.admin2.designation}
                  onChange={(e) =>
                    handleInputChange('admin2', 'designation', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.admin2.email}
                  onChange={(e) =>
                    handleInputChange('admin2', 'email', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    value={formData.admin2.gender}
                    onChange={(e) =>
                      handleInputChange('admin2', 'gender', e.target.value)
                    }
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Employee Code *"
                  value={formData.admin2.employeeCode}
                  onChange={(e) =>
                    handleInputChange('admin2', 'employeeCode', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer></FormFieldContainer>
            </FormRow>

            <FormRow>
              <FormFieldContainer width="quarter">
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Country Code *</InputLabel>
                  <Select
                    value={formData.admin2.countryCode}
                    onChange={(e) =>
                      handleInputChange('admin2', 'countryCode', e.target.value)
                    }
                  >
                    <MenuItem value="+91">+91 (India)</MenuItem>
                    <MenuItem value="+1">+1 (USA)</MenuItem>
                    <MenuItem value="+44">+44 (UK)</MenuItem>
                  </Select>
                </FormControl>
              </FormFieldContainer>
              <FormFieldContainer width="quarter">
                <TextField
                  fullWidth
                  label="Mobile Number *"
                  value={formData.admin2.mobileNumber}
                  onChange={(e) =>
                    handleInputChange('admin2', 'mobileNumber', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <TextField
                  fullWidth
                  label="Landline"
                  value={formData.admin2.landline}
                  onChange={(e) =>
                    handleInputChange('admin2', 'landline', e.target.value)
                  }
                  sx={fieldSx}
                />
              </FormFieldContainer>
            </FormRow>

            <Divider sx={dividerSx} />

            <Typography variant="h6" sx={subsectionTitleSx}>
              Document Uploads
            </Typography>
            <FormRow>
              <FormFieldContainer>
                <FileUploadSection
                  title="Proof of Identity *"
                  section="admin2ProofId"
                />
              </FormFieldContainer>
              <FormFieldContainer>
                <FileUploadSection
                  title="Authorization Letters *"
                  section="admin2AuthLetters"
                />
              </FormFieldContainer>
            </FormRow>
          </StyledAccordionDetails>
        </StyledAccordion>
      </StyledFormContainer>

      {/* Action Buttons */}
      <ActionButtonsContainer>
        <ActionButton buttonType="reject">Reject</ActionButton>
        <ActionButton buttonType="approve">Approve</ActionButton>
      </ActionButtonsContainer>
    </StyledContainer>
  );
};

export default UpdateEntityProfile;
