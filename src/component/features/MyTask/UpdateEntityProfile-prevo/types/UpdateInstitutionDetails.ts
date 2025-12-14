import { Dayjs } from 'dayjs';

export interface Country {
  name: string;
  dial_code: string;
  code: string;
}

export interface FormDataType {
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  designation?: string;
  emailId?: string;
  gender?: string;
  ckycNumber?: string;
  citizenship?: string;
  phone?: string;
  mobileNo?: string;
  landline?: string;
  countryCode?: string;
  countryName?: string;
  [key: string]: string | number | boolean | undefined | null | Dayjs;
}
