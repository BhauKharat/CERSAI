import { FormDataType } from '../../../redux/types/register/formDataTypes'; // path might vary

export interface RegistrationState {
  formData: FormDataType;
  loading: boolean;
  errorsubmitRegistration: string | null;
  success: boolean;
}
