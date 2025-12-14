import * as Yup from 'yup';

export const adminDetailsSchema = Yup.object().shape({
  adminOneDetails: Yup.object().shape({
    citizenship: Yup.string().required('Citizenship is required'),
    ckycNumber: Yup.string()
      .required('CKYC Number is required')
      .length(14, 'CKYC Number must be 14 digits'),
    title: Yup.string().required('Title is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    gender: Yup.string().required('Gender is required'),
    dateOfBirth: Yup.date()
      .required('Date of Birth is required')
      .max(new Date(), 'Date of Birth cannot be in the future'),
    designation: Yup.string().required('Designation is required'),
    emailId: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    countryCode: Yup.string().required('Country Code is required'),
    mobileNo: Yup.string()
      .required('Mobile Number is required')
      .matches(/^[0-9]{10}$/, 'Mobile Number must be 10 digits'),
    employeeCode: Yup.string().required('Employee Code is required'),
    proofOfIdentity: Yup.string().required('Proof of Identity is required'),
    identityNumber: Yup.string().required(
      'Proof of Identity Number is required'
    ),
    dateOfAuthorization: Yup.date().required(
      'Board Resolution Date is required'
    ),
    regulatorLicence: Yup.mixed().required('Authorization letter is required'),
    // Add other fields as needed
    addressLine1: Yup.string().required('Address 1 is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    district: Yup.string().required('District is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().required('Pin Code is required'),
  }),
  adminTwoDetails: Yup.object().shape({
    citizenship: Yup.string().required('Citizenship is required'),
    ckycNumber: Yup.string()
      .required('CKYC Number is required')
      .length(14, 'CKYC Number must be 14 digits'),
    title: Yup.string().required('Title is required'),
    firstName: Yup.string().required('First Name is required'),

    lastName: Yup.string().required('Last Name is required'),
    gender: Yup.string().required('Gender is required'),
    dateOfBirth: Yup.date()
      .required('Date of Birth is required')
      .max(new Date(), 'Date of Birth cannot be in the future'),
    designation: Yup.string().required('Designation is required'),
    emailId: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    countryCode: Yup.string().required('Country Code is required'),
    mobileNo: Yup.string()
      .required('Mobile Number is required')
      .matches(/^[0-9]{10}$/, 'Mobile Number must be 10 digits'),
    employeeCode: Yup.string().required('Employee Code is required'),
    proofOfIdentity: Yup.string().required('Proof of Identity is required'),
    identityNumber: Yup.string().required(
      'Proof of Identity Number is required'
    ),
    dateOfAuthorization: Yup.date().required(
      'Board Resolution Date is required'
    ),
    regulatorLicence: Yup.mixed().required('Authorization letter is required'),
    // Add other fields as needed
    addressLine1: Yup.string().required('Address 1 is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    district: Yup.string().required('District is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().required('Pin Code is required'),
  }),
});

export const NodelFormSchema = Yup.object({
  citizenship: Yup.string().required('Citizenship is required'),
  ckycNumber: Yup.string().when('citizenship', {
    is: (citizenship: string) => citizenship === 'Indian',
    then: (schema) =>
      schema
        .required('CKYC Number is required')
        .length(14, 'CKYC Number must be 14 digits'),
    otherwise: (schema) => schema.notRequired(),
  }),
  title: Yup.string().required('Title is required'),
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date()
    .required('Date of Birth is required')
    .max(new Date(), 'Date of Birth cannot be in the future'),
  designation: Yup.string().required('Designation is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  countryCode: Yup.string().required('Country Code is required'),
  mobileNumber: Yup.string()
    .required('Mobile Number is required')
    .matches(/^[0-9]{10}$/, 'Mobile Number must be 10 digits'),
  employeeCode: Yup.string().required('Employee Code is required'),
  proofOfIdentity: Yup.string().required('Proof of Identity is required'),
  proofOfIdentityNumber: Yup.string().required(
    'Proof of Identity Number is required'
  ),

  boardResolutionDate: Yup.date().required('Board Resolution Date is required'),
  boardResolution: Yup.mixed().required('Board Resolution is required'),
  certifiedPoi: Yup.mixed().required('Certified POI is required'),
  addressLine1: Yup.string().required('Address 1 is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  district: Yup.string().required('District is required'),
  city: Yup.string().required('City is required'),
  pincode: Yup.string().required('Pin Code is required'),
});

export const headInstituteSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  firstName: Yup.string()
    .required('First name is required')
    .matches(/^[a-zA-Z ]+$/, 'First name can only contain letters'),
  middleName: Yup.string()
    .nullable()
    .matches(/^[a-zA-Z ]*$/, 'Middle name can only contain letters'),
  lastName: Yup.string()
    .required('Last name is required')
    .matches(/^[a-zA-Z ]+$/, 'Last name can only contain letters'),
  designation: Yup.string().required('Designation is required'),
  emailId: Yup.string()
    .required('Email is required')
    .email('Enter a valid email'),
  gender: Yup.string().required('Gender is required'),
  ckycNumber: Yup.string()
    .nullable()
    .matches(/^[0-9]{14}$/, 'CKYC must be 14 digits'),
  citizenship: Yup.string().required('Citizenship is required'),
  mobileNo: Yup.string()
    .required('Mobile number is required')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  landline: Yup.string()
    .nullable()
    .matches(/^\d{5,12}$/, 'Enter a valid landline number'),
  countryCode: Yup.string().required('Country code is required'),
});

export const addressValidationSchema = Yup.object({
  registeredAddress: Yup.object({
    line1: Yup.string().required('Line 1 is required'),
    countryCode: Yup.string().required('Country code is required'),
    state: Yup.string().required('State is required'),
    district: Yup.string().required('District is required'),
    cityTown: Yup.string().required('City/Town is required'),
    pinCode: Yup.string().required('Pin code is required'),
    countryName: Yup.string().required('Country name is required'),
  }),
  correspondenceAddress: Yup.object({
    line1: Yup.string().required('Line 1 is required'),
    countryCode: Yup.string().required('Country code is required'),
    state: Yup.string().required('State is required'),
    district: Yup.string().required('District is required'),
    cityTown: Yup.string().required('City/Town is required'),
    pinCode: Yup.string().required('Pin code is required'),
    countryName: Yup.string().required('Country name is required'),
  }),
  correspondenceAddressSameAsRegisteredAddress: Yup.boolean(),
});
