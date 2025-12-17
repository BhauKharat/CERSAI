import { RegistrationFormConfiguration } from '../../types/registrationConfigTypes';

/**
 * Frontend stepper configuration for RE Registration
 * This replaces the API call to /forms/config/registrations
 * Based on the API response structure from assets/stepper_API_req_res.txt
 */
export const registrationStepperConfig: RegistrationFormConfiguration = {
  id: 1,
  formType: 'registrations',
  formTitle: 'Registration',
  formSubtitle: 'Registration',
  formDescription: '',
  submitButtonText: '',
  successMessage: '',
  errorMessage: '',
  redirectUrl: '',
  formSettings: {
    formGroup: false,
    showProgress: false,
    enablecaptcha: true,
    ismultisteps: true,
    multistepforms: [
      {
        formorder: 1,
        formtype: 'RE_entity_profile',
        formname: 'Entity Profile',
      },
      {
        formorder: 2,
        formtype: 'RE_addressDetails',
        formname: 'Address Details',
      },
      {
        formorder: 3,
        formtype: 'RE_hoi',
        formname: 'Head of Institution Details',
      },
      {
        formorder: 4,
        formtype: 'RE_nodal',
        formname: 'Nodal Officer Details',
      },
      {
        formorder: 5,
        formtype: 'RE_iau',
        formname: 'Institutional Admin User Details',
      },
      {
        formorder: 6,
        formtype: 'RE_formPreview',
        formname: 'Form Preview',
      },
    ],
  },
  validationSettings: {},
  submissionSettings: {},
  isActive: true,
  languageSlug: 'en',
  formLayout: 'single-column',
  formTheme: 'modern',
  allowMultipleSubmissions: true,
  requiresAuthentication: false,
  parentId: null,
  createdat: '2025-09-24T13:56:17.486Z',
  updatedat: '2025-10-10T04:52:09.811Z',
};

