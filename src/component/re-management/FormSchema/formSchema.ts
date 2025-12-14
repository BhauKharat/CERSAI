/* eslint-disable prettier/prettier */
import * as yup from "yup";

export type FormValue = "citizenship" | "ckycNumber" | "title" | "firstName" | "lastName" | "gender" | "dateOfBirth" | "email" | "mobileNumber" | "landlineNumber" | "proofOfIdentity" | "proofOfIdentityNumber" | "boardResolutionDate" | "middleName" | "designation" | "officeAddress" | "countryCode" | "employeeCode" | "board_resolution" | "certified_copy" | "photo_id_card"


interface IOption {
    label: string
    value: string
}
interface FormSchema {
    name: FormValue,
    label: string,
    type: string,
    required?: boolean,
    options?: IOption[],
    value: string
    file_field?: string
}




export const formSchema: FormSchema[] = [
    {
        name: 'citizenship',
        label: 'Citizenship',
        type: 'select',
        required: true,
        options: [{ label: 'Indian', value: 'Indian' }, { label: 'NRI', value: 'NRI' }],
        value: "indian"
    },
    { name: 'ckycNumber', label: 'CKYC Number', type: 'text', required: true, value: "99999999999999" },
    {
        name: 'title',
        label: 'Title',
        type: 'select',
        required: true,
        options: [{ label: 'Mr.', value: 'Mr' }, { label: 'Mrs.', value: 'Mrs' }, { label: 'Ms.', value: 'Ms' }],
        value: "Mr."
    },
    { name: 'firstName', label: 'First Name', type: 'text', required: true, value: "Hardik" },
    { name: 'middleName', label: 'Middle Name', type: 'text', value: "Jayantibhai", required: true, },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true, value: "Patel" },
    {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [{ label: 'Male', value: 'Male' }, { label: "Female", value: 'Female' }, { label: "Other", value: 'Other' }],
        value: "M"
    },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, value: "20-07-2025" },
    { name: 'designation', label: 'Designation', type: 'text', required: true, "value": "Assistant Vice President" },
    {
        name: 'officeAddress',
        label: 'Office Address',
        type: 'select',
        options: [{ label: "Registered", value: "registered" }, { label: "Correspondence Address", value: "correspondence" }],
        required: true,
        value: "registered"
    },
    { name: 'email', label: 'Email', type: 'text', required: true, value: "hardik.jp@proteantech.in" },
    {
        name: 'countryCode',
        label: 'Country Code',
        type: 'select',
        required: true,
        options: [{ label: '+91 | India', value: '+91' }, { label: "+1 | USA", value: '+1' }, { label: "+44 | UK", value: "+44" }],
        value: "+91|India"
    },
    {
        name: 'mobileNumber',
        label: 'Mobile Number',
        type: 'text',
        required: true,
        value: "9913167789"
    },
    { name: 'landlineNumber', label: 'Landline Number', type: 'text', value: "020-576-8899" },
    { name: 'employeeCode', label: 'Employee Code', type: 'text', value: "", required: true },
    {
        name: 'proofOfIdentity',
        label: 'Proof of Identity',
        type: 'select',
        required: true,
        options: [
            { label: "Aadhar Card", value: "AADHAAR" },
            { label: "Passport", value: "PASSPORT" },
            { label: "Driving License", value: "DRIVING_LICENSE" },
            { label: "Voter ID", value: "VOTER_ID" }
        ],
        value: "aadhar"
    },
    {
        name: 'proofOfIdentityNumber',
        label: 'Proof of Identity Number',
        type: 'text',
        required: true,
        value: "ABCD9009000009"
    },
    {
        name: 'boardResolutionDate',
        label: 'Date of Board Resolution for Appointment',
        type: 'date',
        required: true,
        value: "01-01-2020"
    },
    {
        name: "board_resolution",
        label: "Board Resolution",
        type: "file",
        required: true,
        value: "",
        file_field: "board_resolution_file"

    },
    {
        name: "certified_copy",
        label: "Certified copy of Proof of Identity Document",
        type: "file",
        required: true,
        value: "",
        file_field: "certified_copy_file"
    },
    {
        name: "photo_id_card",
        label: "Certified Copy of Photo Identity Card",
        type: "file",
        required: true,
        value: "",
        file_field: "photo_id_card_file"
    }
];


export const formSchemaInstitutionalAdmin = [
    {
        name: 'citizenship',
        label: 'Citizenship',
        type: 'select',
        required: true,
        options: [{ label: 'Indian', value: 'Indian' }, { label: 'NRI', value: 'NRI' }],
        value: "indian"
    },
    { name: 'ckycNumber', label: 'CKYC Number', type: 'text', required: true, value: "99999999999999" },
    {
        name: 'title',
        label: 'Title',
        type: 'select',
        required: true,
        options: [{ label: 'Mr.', value: 'Mr.' }, { label: 'Mrs.', value: 'Mrs.' }, { label: 'Ms.', value: 'Ms' }],
        value: "Mr."
    },
    { name: 'firstName', label: 'First Name', type: 'text', required: true, value: "Hardik" },
    { name: 'middleName', label: 'Middle Name', type: 'text', value: "Jayantibhai", required: true, },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true, value: "Patel" },
    {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [{ label: 'Male', value: 'Male' }, { label: "Female", value: 'Female' }, { label: "Other", value: 'Other' }],
        value: "M"
    },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, value: "20-07-2025" },
    { name: 'designation', label: 'Designation', type: 'text', required: true, "value": "Assistant Vice President" },
    {
        name: 'officeAddress',
        label: 'Office Address',
        type: 'select',
        options: [{ label: "Registered", value: "registered" }, { label: "Correspondence Address", value: "correspondence" }],
        required: true,
        value: "registered"
    },
    { name: 'email', label: 'Email', type: 'text', required: true, value: "hardik.jp@proteantech.in" },
    {
        name: 'countryCode',
        label: 'Country Code',
        type: 'select',
        required: true,
        options: [{ label: '+91 | India', value: '+91' }, { label: "+1 | USA", value: '+1' }, { label: "+44 | UK", value: "+44" }],
        value: "+91|India"
    },
    {
        name: 'mobileNumber',
        label: 'Mobile Number',
        type: 'text',
        required: true,
        value: "9913167789"
    },
    { name: 'landlineNumber', label: 'Landline Number', type: 'text', value: "020-576-8899" },
    {
        name: 'proofOfIdentity',
        label: 'Proof of Identity',
        type: 'select',
        required: true,
        options: [
            { label: "Aadhar Card", value: "AADHAAR" },
            { label: "Passport", value: "PASSPORT" },
            { label: "Driving License", value: "DRIVING_LICENSE" },
            { label: "Voter ID", value: "VOTER_ID" }
        ],
        value: "aadhar"
    },
    {
        name: 'proofOfIdentityNumber',
        label: 'Proof of Identity Number',
        type: 'text',
        required: true,
        value: "ABCD9009000009"
    },
    { name: 'employeeCode', label: 'Employee Code', type: 'text', value: "" },

    {
        name: "authorisation_letter",
        label: "Authorization letter by Competent Authority",
        type: "file",
        required: true,
        value: "",
        file_field: 'authorisation_letter_file'
    },

    {
        name: 'authorization_date',
        label: 'Date of Authorization',
        type: 'date',
        required: true,
        value: "01-01-2020",

    },
    {
        name: "proof_of_identity",
        label: "Certified Copy of the Proof of the identity",
        type: "file",
        required: true,
        value: "",
        file_field: 'proof_of_identity_file'
    },
    {
        name: "proof_of_identity_card",
        label: "Certified copy of Photo Identity Card",
        type: "file",
        required: true,
        value: "",
        file_field: 'proof_of_identity_card_file'
    }
]



export const validationSchema = yup.object().shape({
    citizenship: yup.string().required("Citizenship is required"),
    ckycNumber: yup.string().required("CKYC Number is required").length(14, "Must be 14 digits"),
    title: yup.string().required("Title is required"),
    firstName: yup.string().required("First Name is required"),
    middleName: yup.string().required('Middle Name is Required'),
    lastName: yup.string().required("Last Name is required"),
    gender: yup.string().required("Gender is required"),
    dateOfBirth: yup.date().required("Date of Birth is required"),
    designation: yup.string().required('Designation is Required'),
    email: yup.string().email("Invalid email").required("Email is required").matches(
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        "Invalid Email"
    ),
    countryCode: yup.string().required('Country Code is Required'),
    mobileNumber: yup.string().matches(/^[0-9]{10}$/, "Must be 10 digits").required("Mobile number is required"),
    landlineNumber: yup.string().nullable(),
    proofOfIdentity: yup.string().required("Proof of Identity is required"),
    proofOfIdentityNumber: yup.string().required("Proof of Identity Number is required"),
    boardResolutionDate: yup.date().required("Resolution Date is required"),
    employeeCode: yup.string().required(`Employee Code is Required`),
    officeAddress: yup.string().required('Office Address is Required'),
    board_resolution: yup
        .mixed().required('Board Resolution Document is Required'),
    board_resolution_file: yup.string().optional(),
    certified_copy: yup.mixed().required('Certified copy of Proof of Identity Document is Required'),
    certified_copy_file: yup.string().optional(),
    photo_id_card: yup.mixed().required('Certified Copy of Photo Identity Card'),
    photo_id_card_file: yup.string().optional()

});


export const validationSchemaInstitutionalAdmin = yup.object().shape({
    citizenship: yup.string().required("Citizenship is required"),
    ckycNumber: yup.string().required("CKYC Number is required").length(14, "Must be 14 digits"),
    title: yup.string().required("Title is required"),
    firstName: yup.string().required("First Name is required"),
    middleName: yup.string().required('Middle Name is Required'),
    lastName: yup.string().required("Last Name is required"),
    gender: yup.string().required("Gender is required"),
    dateOfBirth: yup.date().required("Date of Birth is required"),
    designation: yup.string().required('Designation is Required'),
    email: yup.string().email("Invalid email").required("Email is required"),
    countryCode: yup.string().required('Country Code is Required'),
    mobileNumber: yup.string().matches(/^[0-9]{10}$/, "Must be 10 digits").required("Mobile number is required"),
    landlineNumber: yup.string().nullable(),
    proofOfIdentity: yup.string().required("Proof of Identity is required"),
    proofOfIdentityNumber: yup.string().required("Proof of Identity Number is required"),
    employeeCode: yup.string().required(`Employee Code is Required`),
    officeAddress: yup.string().required('Office Address is Required'),
    authorization_date: yup.date().required(`Authorization Date is Required`),
    authorisation_letter: yup.mixed().required('Authorization letter by Competent Authority Document is Required'),
    authorisation_letter_file: yup.string().optional(),
    proof_of_identity: yup.mixed().required('Certified Copy of the Proof of the identity Document is Required'),
    proof_of_identity_file: yup.string().optional(),
    proof_of_identity_card: yup.mixed().required('Certified copy of Photo Identity Card is Required'),
    proof_of_identity_card_file: yup.string().optional()
})

export type NodalFormData = yup.InferType<typeof validationSchema>;

export type InstitutionalData = yup.InferType<typeof validationSchemaInstitutionalAdmin>;
