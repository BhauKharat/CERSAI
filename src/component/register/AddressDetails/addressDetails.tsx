/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { ReactComponent as CKYCRRLogo } from '../../../assets/ckycrr_sign_up_logo.svg';
//import './registrationPage.css';
import { Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
// import Typography from '@mui/material/Typography';
import KeyboardControlKeyRoundedIcon from '@mui/icons-material/KeyboardControlKeyRounded';
import '../EntityForm/registrationPage.css';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router';
// import BackButton from '../../component/backbutton/backButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSameAsRegistrationAddress,
  submitAddressThunk,
} from '../../../redux/slices/registerSlice/addressSlice';

//redux
//import { useSelector, useDispatch } from 'react-redux';
import BackButton from '../backbutton/backButton';
import { AppDispatch, RootState } from '@redux/store';
import {
  hideLoader,
  showLoader,
} from '../../../redux/slices/loader/loaderSlice';
// import { RootState } from '../../redux/store';
import {
  setRegisteredAddress,
  setCorrespondenceAddress,
} from '../../../redux/slices/registerSlice/addressSlice';
import {
  markStepCompleted,
  setApplicationFormData,
  setCurrentStep,
} from '../../../redux/slices/registerSlice/applicationSlice';
import ApplicationStepper from '../../../component/stepper/ApplicationStepper';

interface AddressData {
  [key: string]: string | number | boolean | undefined | any;
}

interface FormData {
  registeredAddress?: AddressData;
  correspondenceAddress?: AddressData;
  [key: string]: unknown; // for other form fields if needed
}

const REQUIRED_KEYS = ['line1', 'pinCode'];
const ADDRESS_DETAILS = 'ADDRESS_DETAILS';

// const isValidForm = (data: FormData): boolean => {
//   const registered = data.registeredAddress || {};
//   const correspondence = data.correspondenceAddress || {};
//   return (
//     REQUIRED_KEYS.every((key) => Boolean(registered[key])) &&
//     REQUIRED_KEYS.every((key) => Boolean(correspondence[key]))
//   );
// };

const AddressDetails = () => {
  interface FormDataType {
    registeredAddress: {
      line1?: string;
      line2?: string;
      line3?: string;
      state?: string;
      district?: string;
      cityTown?: string;
      pinCode?: string;
      phone?: string;
      alternatePinCode?: string;
      countryCode?: string;
      countryName?: string;
    };
    correspondenceAddress: {
      line1?: string;
      line2?: string;
      line3?: string;
      state?: string;
      district?: string;
      cityTown?: string;
      pinCode?: string;
      phone?: string;
      alternatePinCode?: string;
      countryCode?: string;
      countryName?: string;
    };

    // Add other expected fields...

    [key: string]: unknown; // still allow dynamic keys
  }
  interface AddressErrors {
    line1?: string;
    line2?: string;
    line3?: string;
    state?: string;
    district?: string;
    cityTown?: string;
    pinCode?: string;
    phone?: string;
    alternatePinCode?: string;
    countryCode?: string;
    countryName?: string;
  }

  interface FormErrors {
    registeredAddress: AddressErrors;
    correspondenceAddress: AddressErrors;
    [key: string]: AddressErrors | Record<string, string> | undefined; // Include AddressErrors in the union
  }

  interface Country {
    name: string;
    dial_code: string;
    code: string;
    states?: {
      value: string;
      label: string;
      districts: {
        value: string;
        label: string;
        pincodes?: string[]; // Add this line
      }[];
    }[];
  }
  const [formData, setFormData] = useState<FormDataType>({
    registeredAddress: {
      countryCode: '+91', // ✅ Set the default explicitly in state
    },
    correspondenceAddress: {
      countryCode: '+91',
    },
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    registeredAddress: {},
    correspondenceAddress: {},
  });

  const navigate = useNavigate();

  const [isFormValid, setIsFormValid] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [useSameAddress, setUseSameAddress] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  const geographyHierarchy = useSelector(
    (state: RootState) => state.masters.geographyHierarchy
  );
  // const { fieldErrors } = useSelector((state: RootState) => state.address);
  const { error } = useSelector((state: RootState) => state.address);

  const [registeredStates, setRegisteredStates] = useState<
    {
      value: string;
      label: string;
      districts: {
        value: string;
        label: string;
        pincodes?: string[];
      }[];
    }[]
  >([]);

  const [registeredDistricts, setRegisteredDistricts] = useState<
    {
      value: string;
      label: string;
      pincodes?: string[];
    }[]
  >([]);

  const [registeredPincodes, setRegisteredPincodes] = useState<string[]>([]);

  const [correspondenceStates, setCorrespondenceStates] = useState<
    {
      value: string;
      label: string;
      districts: {
        value: string;
        label: string;
        pincodes?: string[];
      }[];
    }[]
  >([]);

  const [correspondenceDistricts, setCorrespondenceDistricts] = useState<
    {
      value: string;
      label: string;
      pincodes?: string[];
    }[]
  >([]);

  const [correspondencePincodes, setCorrespondencePincodes] = useState<
    string[]
  >([]);
  const dispatch = useDispatch<AppDispatch>();

  const reduxRegistered =
    useSelector((state: RootState) => state.address.registeredAddress) || {};
  const reduxCorrespondence =
    useSelector((state: RootState) => state.address.correspondenceAddress) ||
    {};
  console.log(' Redux Registered Address:', reduxRegistered);
  console.log(' Redux correspondanceAddress Address:', reduxCorrespondence);
  const previewRegistered = useSelector(
    (state: RootState) => state.applicationPreview.registeredAddress
  );
  const previewCorrespondence = useSelector(
    (state: RootState) => state.applicationPreview.correspondanceAddress
  );

  console.log(' API Registered Address:', previewRegistered);
  console.log(' API correspondanceAddress Address:', previewCorrespondence);
  const correspondenceAddressSameAsRegisteredAddress = useSelector(
    (state: RootState) =>
      state.applicationPreview.correspondenceAddressSameAsRegisteredAddress
  );
  console.log(
    ' API tick Address:',
    correspondenceAddressSameAsRegisteredAddress
  );

  // Add this selector for the checkbox state from Redux
  const reduxUseSameAddress = useSelector(
    (state: RootState) => state.address.sameAsRegistrationAddress
  ); //
  console.log(' Redux tick Address:', reduxUseSameAddress);
  const modifiableFields = useSelector(
    (state: RootState) => state.auth.reinitializeData?.modifiableFields
  );
  const Reinitializestatus = useSelector(
    (state: RootState) => state.auth.reinitializeData?.approvalStatus
  );

  const viewOnlyStatuses = [
    'SUBMITTED_PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'READY_FOR_SUBMISSION',
  ];

  const isViewOnlyAddress = viewOnlyStatuses.includes(Reinitializestatus ?? '');
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

  const isIndia = formData?.registeredAddress?.countryCode === '+91';
  const isCorrespondenceIndia =
    formData?.correspondenceAddress?.countryCode === '+91';

  useEffect(() => {
    dispatch(setCurrentStep(1)); // 0 = first step
  }, [dispatch]);

  useEffect(() => {
    setIsFormValid(isValidForm(formData));
  }, [formData]);

  useEffect(() => {
    setIsFormValid(isValidForm(formData));
  }, [formData]);

  useEffect(() => {
    if (countries.length === 0) return; // Wait for countries to load

    // Initialize registered address dropdowns
    const regCountryCode = formData?.registeredAddress?.countryCode;
    const regState = formData?.registeredAddress?.state;
    const regDistrict = formData?.registeredAddress?.district;

    if (regCountryCode) {
      const regCountry = countries.find((c) => c.dial_code === regCountryCode);
      if (regCountry?.states) {
        setRegisteredStates(regCountry.states);

        if (regState) {
          const regStateObj = regCountry.states.find(
            (s) => s.value === regState
          );
          if (regStateObj?.districts) {
            setRegisteredDistricts(regStateObj.districts);

            if (regDistrict) {
              const regDistrictObj = regStateObj.districts.find(
                (d) => d.value === regDistrict
              );
              if (regDistrictObj?.pincodes) {
                setRegisteredPincodes(regDistrictObj.pincodes);
              }
            }
          }
        }
      }
    }

    // Initialize correspondence address dropdowns
    const corrCountryCode = formData?.correspondenceAddress?.countryCode;
    const corrState = formData?.correspondenceAddress?.state;
    const corrDistrict = formData?.correspondenceAddress?.district;

    if (corrCountryCode) {
      const corrCountry = countries.find(
        (c) => c.dial_code === corrCountryCode
      );
      if (corrCountry?.states) {
        setCorrespondenceStates(corrCountry.states);

        if (corrState) {
          const corrStateObj = corrCountry.states.find(
            (s) => s.value === corrState
          );
          if (corrStateObj?.districts) {
            setCorrespondenceDistricts(corrStateObj.districts);

            if (corrDistrict) {
              const corrDistrictObj = corrStateObj.districts.find(
                (d) => d.value === corrDistrict
              );
              if (corrDistrictObj?.pincodes) {
                setCorrespondencePincodes(corrDistrictObj.pincodes);
              }
            }
          }
        }
      }
    }
  }, [
    countries,
    formData?.registeredAddress?.countryCode,
    formData?.registeredAddress?.state,
    formData?.registeredAddress?.district,
    formData?.correspondenceAddress?.countryCode,
    formData?.correspondenceAddress?.state,
    formData?.correspondenceAddress?.district,
  ]);
  // const handleChange = (
  //     section: 'registeredAddress' | 'correspondenceAddress',
  //     field: string,
  //     value: string
  //   ) => {
  //     setFormData((prevData) => {
  //       const updatedSection = {
  //         ...prevData[section],
  //         [field]: value,
  //       };
  //       const updatedData = {
  //         ...prevData,
  //         [section]: updatedSection,
  //       };

  //       if (section === 'registeredAddress') {
  //         dispatch(setRegisteredAddress(updatedSection));
  //       } else {
  //         dispatch(setCorrespondenceAddress(updatedSection));
  //       }

  //       // Run validation using updated data
  //       const errorMsg = validateSingleField(section, field, value, updatedData);

  //       // Set error based on validation
  //       setFormErrors((prevErrors:any) => ({
  //         ...prevErrors,
  //         [section]: {
  //           ...prevErrors[section],
  //           [field]: errorMsg,
  //         },
  //       }));

  //       return updatedData;
  //     });
  //   };

  const handleChange = (
    section: 'registeredAddress' | 'correspondenceAddress',
    field: string,
    value: string
  ) => {
    setFormData((prevData) => {
      const updatedSection = {
        ...prevData[section],
        [field]: value,
      };

      // Clear alternatePinCode when pinCode is changed to something other than OTHERS
      if (field === 'pinCode' && value !== 'OTHERS' && value !== '') {
        updatedSection.alternatePinCode = '';
      }

      const updatedData = {
        ...prevData,
        [section]: updatedSection,
      };

      if (section === 'registeredAddress') {
        dispatch(setRegisteredAddress(updatedSection));
      } else {
        dispatch(setCorrespondenceAddress(updatedSection));
      }

      // Run validation using updated data
      const errorMsg = validateSingleField(section, field, value, updatedData);

      // Set error based on validation
      setFormErrors((prevErrors: FormErrors) => ({
        ...prevErrors,
        [section]: {
          ...prevErrors[section],
          [field]: errorMsg,
          // Also clear alternatePinCode error when pinCode is changed to non-OTHERS
          ...(field === 'pinCode' &&
            value !== 'OTHERS' &&
            value !== '' && {
              alternatePinCode: '',
            }),
        },
      }));

      return updatedData;
    });
  };
  const validateSingleField = (
    section: 'registeredAddress' | 'correspondenceAddress',
    name: string,
    value: string | undefined, // Replace any with string | undefined
    data: FormDataType // Replace any with your FormDataType
  ): string | undefined => {
    const allowedSpecialCharsRegex = /^[A-Za-z0-9 `~@#$%^&*()_+\-=]*$/;
    const alphanumericRegex = /^[A-Za-z0-9 ]*$/;
    const pinCodeRegex = /^\d{6}$/;

    switch (`${section}.${name}`) {
      // Line 1 (Mandatory)
      case `${section}.line1`:
        if (!value?.trim()) return 'Address Line 1 is required';
        if (value.length > 60)
          return 'Address length exceeds only 60 characters allowed';
        if (!allowedSpecialCharsRegex.test(value))
          return 'Only alphanumeric and specific special characters allowed- `~@#$%^&*()_+-=';
        break;

      // Line 2 & 3 (Optional)
      case `${section}.line2`:
      case `${section}.line3`:
        if (value && value.length > 60)
          return 'Address length exceeds only 60 characters allowed';
        if (value && !allowedSpecialCharsRegex.test(value))
          return 'Only alphanumeric and specific special characters allowed- `~@#$%^&*()_+-=';
        break;

      // Country Code (Mandatory)
      case `${section}.countryCode`:
        if (!value) return 'Country Code is required';
        break;

      // State (Mandatory)
      case `${section}.state`:
        if (!value) return 'State / UT is required';
        break;

      // District (Conditional Mandatory)
      case `${section}.district`:
        if (data?.[section]?.state && !value)
          return 'District is required when State is selected';
        break;

      // City/Town (Conditional Mandatory)
      case `${section}.cityTown`:
        if (data?.[section]?.district && !value?.trim())
          return 'City/Town is required when District is selected';
        if (value && value.length > 60)
          return 'City/Town length exceeds only 60 characters allowed';
        if (value && !alphanumericRegex.test(value))
          return 'Only alphanumeric  characters allowed , specials character not allowed like `~@#$%^&*()_+-=...';
        break;

      // Pin Code (Conditional Mandatory)
      case `${section}.pinCode`:
        if (data?.[section]?.district && !value?.trim())
          return 'Pin Code is required when District is selected';
        if (value && value !== 'OTHERS' && !pinCodeRegex.test(value))
          return 'Pin Code must be exactly 6 digits';
        break;

      // Pin Code Other (Optional)
      case `${section}.alternatePinCode`:
        // Only validate if main pinCode is "OTHERS"
        if (data?.[section]?.pinCode === 'OTHERS') {
          if (!value?.trim()) {
            return "Alternate PinCode is required when 'OTHERS' is selected";
          }

          if (!pinCodeRegex.test(value)) {
            return 'Alternate Pin Code does not contains alphabets and must be exactly 6 digits';
          }

          // Get the appropriate pincode list based on section
          const pincodeList =
            section === 'registeredAddress'
              ? registeredPincodes
              : correspondencePincodes;

          // Check if entered pin code exists in the master list
          if (pincodeList.includes(value)) {
            return 'This Value already exists in  pincode list.';
          }
        } else {
          // If main pinCode is not "OTHERS", alternatePinCode should be empty or ignored
          if (value?.trim()) {
            return "Alternate Pin Code is only allowed when 'OTHERS' is selected";
          }
        }
        break;

      // Same as Registered Checkbox
      case `correspondenceAddress.sameAsRegistered`:
        if (value !== 'Y' && value !== 'N')
          return 'Same as Registered Address must be Yes or No';
        break;

      default:
        break;
    }

    return undefined; // Valid field
  };
  const isValidForm = (data: FormData): boolean => {
    const registered = data.registeredAddress;
    const correspondence = data.correspondenceAddress;

    // Type guard to ensure addresses exist
    if (!registered || !correspondence) return false;

    // Check required fields exist
    const hasRequiredFields =
      REQUIRED_KEYS.every((key) => Boolean(registered[key])) &&
      REQUIRED_KEYS.every((key) => Boolean(correspondence[key]));

    if (!hasRequiredFields) return false;

    // Cast to FormDataType to satisfy TypeScript
    const typedData = data as FormDataType;

    // Check for validation errors
    const allFields = [
      'line1',
      'line2',
      'line3',
      'countryCode',
      'state',
      'district',
      'cityTown',
      'pinCode',
      'alternatePinCode',
    ];

    const hasRegisteredErrors = allFields.some((field) =>
      validateSingleField(
        'registeredAddress',
        field,
        registered[field as keyof typeof registered],
        typedData
      )
    );

    const hasCorrespondenceErrors = allFields.some((field) =>
      validateSingleField(
        'correspondenceAddress',
        field,
        correspondence[field as keyof typeof correspondence],
        typedData
      )
    );

    return !hasRegisteredErrors && !hasCorrespondenceErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      registeredAddress: stripUIFields(formData.registeredAddress),
      correspondenceAddress: useSameAddress
        ? stripUIFields(formData.registeredAddress)
        : stripUIFields(formData.correspondenceAddress),
      sameAsRegistrationAddress: useSameAddress,
    };
    // const cleanRegistered = stripUIFields(formData.registeredAddress);
    // const cleanCorrespondence = useSameAddress
    //     ? stripUIFields(formData.registeredAddress)
    //     : stripUIFields(formData.correspondenceAddress);

    // 👇 Override 'state' temporarily
    // cleanRegistered.state = 'Karnataka';
    // cleanCorrespondence.state = 'Karnataka';

    // const payload = {
    //     registeredAddress: cleanRegistered,
    //     correspondenceAddress: cleanCorrespondence,
    //     sameAsRegistrationAddress: useSameAddress,
    // };

    try {
      dispatch(showLoader('Please Wait...'));
      const resultAction = await dispatch(
        submitAddressThunk({ data: payload })
      );

      if (submitAddressThunk.fulfilled.match(resultAction)) {
        const { success } = resultAction.payload as { success: boolean };

        if (success) {
          // ✅ Save current section's data
          dispatch(
            setApplicationFormData({
              section: 'addressDetails',
              data: formData,
            })
          );
          // ✅ Mark this step as complete
          dispatch(markStepCompleted(1));

          // ✅ Move to next step
          dispatch(setCurrentStep(2));
          // toast.success(message || 'Address saved successfully');
          navigate('/re-institution-details');
        } else {
          // toast.error(message || 'Address submission failed');
        }
      } else if (submitAddressThunk.rejected.match(resultAction)) {
        // toast.error(resultAction.payload || 'Something went wrong');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      // toast.error('Unexpected error occurred!');
    } finally {
      dispatch(hideLoader());
    }
  };

  // useEffect(() => {
  //   const loadCountries = async () => {
  //     const countryList = await fetchCountryCodes();
  //     setCountries(countryList);
  //   };
  //   loadCountries();
  // }, []);

  useEffect(() => {
    if (geographyHierarchy?.length) {
      const countryList = geographyHierarchy.map((country: any) => ({
        name: country.name,
        code: country.code,
        dial_code: country.countryCode,
        states: country.states.map(
          (state: {
            name: string;
            districts: {
              name: string;
              pincodes: { pincode: string | number }[];
            }[];
          }) => ({
            label: state.name,
            value: state.name,
            districts: state.districts.map(
              (district: {
                name: string;
                pincodes: { pincode: string | number }[];
              }) => ({
                label: district.name,
                value: district.name,
                pincodes: district.pincodes.map(
                  (p: { pincode: string | number }) => p.pincode
                ),
              })
            ),
          })
        ),
      }));

      setCountries(countryList);
    }
  }, [geographyHierarchy]);

  // const handleCountryChange = (
  //     section: 'registeredAddress' | 'correspondenceAddress',
  //     e: React.ChangeEvent<HTMLSelectElement>
  // ) => {
  //     const selectedCode = e.target.value;
  //     const selectedCountry = countries.find(c => c.dial_code === selectedCode);

  //     const updatedSection = {
  //         ...formData[section],
  //         countryCode: selectedCode,
  //         countryName: selectedCountry ? selectedCountry.name : '',
  //     };
  //     setFormData(prev => ({
  //         ...prev,
  //         [section]: updatedSection,
  //     }));

  //     if (section === 'registeredAddress') {
  //         dispatch(setRegisteredAddress(updatedSection));
  //     } else {
  //         dispatch(setCorrespondenceAddress(updatedSection));
  //     }
  // };

  const handleCountryChange = (
    section: 'registeredAddress' | 'correspondenceAddress',
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find((c) => c.dial_code === selectedCode);

    const updatedSection = {
      ...formData[section],
      countryCode: selectedCode,
      countryName: selectedCountry ? selectedCountry.name : '',
      state: '',
      district: '',
      pinCode: '',
    };

    setFormData((prev) => ({
      ...prev,
      [section]: updatedSection,
    }));

    if (section === 'registeredAddress') {
      dispatch(setRegisteredAddress(updatedSection));
      // Update only registered address arrays
      setRegisteredStates(selectedCountry?.states || []);
      setRegisteredDistricts([]);
      setRegisteredPincodes([]);
    } else {
      dispatch(setCorrespondenceAddress(updatedSection));
      // Update only correspondence address arrays
      setCorrespondenceStates(selectedCountry?.states || []);
      setCorrespondenceDistricts([]);
      setCorrespondencePincodes([]);
    }
  };

  const handleStateChange = (
    section: 'registeredAddress' | 'correspondenceAddress',
    selectedState: string
  ) => {
    // Use the appropriate state array based on section
    const stateArray =
      section === 'registeredAddress' ? registeredStates : correspondenceStates;
    const selectedStateObj = stateArray.find((s) => s.value === selectedState);

    const updatedSection = {
      ...formData[section],
      state: selectedState,
      district: '',
      pinCode: '', // Reset pincode when state changes
    };

    setFormData((prev) => ({
      ...prev,
      [section]: updatedSection,
    }));

    if (section === 'registeredAddress') {
      dispatch(setRegisteredAddress(updatedSection));
      setRegisteredDistricts(selectedStateObj?.districts || []);
      setRegisteredPincodes([]);
    } else {
      dispatch(setCorrespondenceAddress(updatedSection));
      setCorrespondenceDistricts(selectedStateObj?.districts || []);
      setCorrespondencePincodes([]);
    }
  };

  const handleDistrictChange = (
    section: 'registeredAddress' | 'correspondenceAddress',
    selectedDistrict: string
  ) => {
    const districtArray =
      section === 'registeredAddress'
        ? registeredDistricts
        : correspondenceDistricts;
    const selectedDistrictObj = districtArray.find(
      (d) => d.value === selectedDistrict
    );

    const updatedSection = {
      ...formData[section],
      district: selectedDistrict,
      pinCode: '', // Reset pincode when district changes
    };

    setFormData((prev) => ({
      ...prev,
      [section]: updatedSection,
    }));

    if (section === 'registeredAddress') {
      dispatch(setRegisteredAddress(updatedSection));
      setRegisteredPincodes(selectedDistrictObj?.pincodes || []);
    } else {
      dispatch(setCorrespondenceAddress(updatedSection));
      setCorrespondencePincodes(selectedDistrictObj?.pincodes || []);
    }
  };

  const stripUIFields = (
    address:
      | FormDataType['registeredAddress']
      | FormDataType['correspondenceAddress']
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { countryName, ...rest } = address;
    return rest;
  };

  useEffect(() => {
    const updateCountryNames = () => {
      (['registeredAddress', 'correspondenceAddress'] as const).forEach(
        (section) => {
          // Type assertion to tell TypeScript this is an address object, not unknown
          const sectionData = formData[
            section
          ] as FormDataType['registeredAddress'];
          const countryCode = sectionData?.countryCode;

          if (countryCode && !sectionData?.countryName) {
            const matchedCountry = countries.find(
              (c) => c.dial_code === countryCode
            );

            if (matchedCountry) {
              const updatedSection = {
                ...sectionData,
                countryName: matchedCountry.name,
              };

              setFormData((prev) => ({
                ...prev,
                [section]: updatedSection,
              }));

              // Optional: sync to Redux if needed
              if (section === 'registeredAddress') {
                dispatch(setRegisteredAddress(updatedSection));
              } else {
                dispatch(setCorrespondenceAddress(updatedSection));
              }
            }
          }
        }
      );
    };

    if (countries.length > 0) {
      updateCountryNames();
    }
  }, [countries, formData]); // or [countries] if formData is always available

  useEffect(() => {
    const source =
      Object.keys(reduxRegistered).length > 0
        ? reduxRegistered
        : previewRegistered;

    if (source && Object.keys(source).length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        registeredAddress: {
          ...prevData.registeredAddress,
          ...source,
        },
      }));
    }

    // FIXED: Handle checkbox state - prioritize Redux over API preview
    // Check if Redux has a valid boolean value (not null/undefined)
    console.log('Form DATA' + formData);

    const hasReduxCheckboxValue =
      reduxUseSameAddress !== null && reduxUseSameAddress !== undefined;

    console.log('Has Redux checkbox value:', hasReduxCheckboxValue);
    console.log('Redux checkbox value:', reduxUseSameAddress);
    console.log(
      'API checkbox value:',
      correspondenceAddressSameAsRegisteredAddress
    );

    // Prioritize Redux value if it exists, otherwise use API value
    const checkboxSource = hasReduxCheckboxValue
      ? reduxUseSameAddress
      : correspondenceAddressSameAsRegisteredAddress;

    // Set checkbox state
    if (checkboxSource !== undefined) {
      console.log('setting ', checkboxSource);

      setUseSameAddress(checkboxSource);
    }
  }, [
    reduxRegistered,
    previewRegistered,
    correspondenceAddressSameAsRegisteredAddress,
  ]);

  useEffect(() => {
    const source =
      Object.keys(reduxCorrespondence).length > 0
        ? reduxCorrespondence
        : previewCorrespondence;

    if (source && Object.keys(source).length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        correspondenceAddress: {
          ...prevData.correspondenceAddress,
          ...source,
        },
      }));
    }
  }, [reduxCorrespondence, previewCorrespondence]);

  useEffect(() => {
    if (useSameAddress) {
      setFormData((prev) => ({
        ...prev,
        correspondenceAddress: { ...formData.registeredAddress },
      }));
      dispatch(setCorrespondenceAddress({ ...formData.registeredAddress }));
    }
  }, [formData.registeredAddress]); // only when registered address changes

  // Do the same for correspondence address if needed
  // useEffect(() => {
  //   if (correspondanceAddress && Object.keys(correspondanceAddress).length > 0) {
  //     setFormData(prevData => ({
  //       ...prevData,
  //       correspondenceAddress: {
  //         ...prevData.correspondenceAddress,
  //         ...correspondanceAddress
  //       }
  //     }));
  //   }
  // }, [correspondanceAddress]);
  const handleBack = () => {
    navigate('/re-register');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <BackButton />
      <div className="signup-container">
        <div className="signup-card">
          <div className="logo-container">
            <button className="backButton" onClick={handleBack}>
              <ArrowBackIosIcon className="back-icon" />
              <span className="back-text">Back</span>
            </button>
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
          <div className="step-indicator">Address Details</div>
          <form className="entity-form">
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: '#F7F8FF', marginBottom: '15px' }}
              >
                <Typography component="span">Registered Adrress</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="address-lineone">
                      Address Line 1<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="address-lineone"
                      type="text"
                      name="line1"
                      placeholder="Add address here"
                      value={formData.registeredAddress.line1 || ''}
                      onChange={(e) =>
                        handleChange(
                          'registeredAddress',
                          'line1',
                          e.target.value
                        )
                      }
                      disabled={
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressLine1'
                        )
                      }
                      required={isEditableField(
                        ADDRESS_DETAILS,
                        'registeredAddressLine1'
                      )}
                    />
                    {formErrors.registeredAddress?.line1 && (
                      <span className="error-message">
                        {formErrors.registeredAddress.line1}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address-linetwo">Address Line 2</label>
                    <input
                      id="address-linetwo"
                      type="text"
                      name="line2"
                      placeholder="Add adress here"
                      value={formData.registeredAddress?.line2 || ''}
                      onChange={(e) =>
                        handleChange(
                          'registeredAddress',
                          'line2',
                          e.target.value
                        )
                      }
                      disabled={
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressLine2'
                        )
                      }
                      required={isEditableField(
                        ADDRESS_DETAILS,
                        'registeredAddressLine2'
                      )}
                    />
                    {formErrors.registeredAddress?.line2 && (
                      <span className="error-message">
                        {formErrors.registeredAddress.line2}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="address-linethree">Address Line 3</label>
                    <input
                      id="address-linethree"
                      type="text"
                      name="line3"
                      placeholder="Add adress here"
                      value={formData.registeredAddress?.line3 || ''}
                      onChange={(e) =>
                        handleChange(
                          'registeredAddress',
                          'line3',
                          e.target.value
                        )
                      }
                      disabled={
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressLine3'
                        )
                      }
                      required={isEditableField(
                        ADDRESS_DETAILS,
                        'registeredAddressLine3'
                      )}
                    />
                    {formErrors.registeredAddress?.line3 && (
                      <span className="error-message">
                        {formErrors.registeredAddress.line3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label
                      htmlFor="countryCode"
                      className="required"
                      style={{ marginBottom: '1px' }}
                    >
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{
                        height: '47px',
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid grey',
                        borderRadius: '7px',
                        position: 'relative',
                      }}
                    >
                      {/* Country Code Dropdown - disabled with visual indication */}
                      <select
                        className="country-code-dropdown"
                        style={{
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          paddingRight: '10px',
                          minWidth: '70px',
                          height: '100%',
                          opacity: !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressCountryCode'
                          )
                            ? 0.6
                            : 1, // Visual indication when disabled
                          cursor: !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressCountryCode'
                          )
                            ? 'not-allowed'
                            : 'pointer',
                        }}
                        name="countryCode"
                        value={formData?.registeredAddress?.countryCode || ''}
                        onChange={(e) =>
                          handleCountryChange('registeredAddress', e)
                        }
                        disabled={
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressCountryCode'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressCountryCode'
                        )}
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.dial_code}>
                            {country.dial_code}
                          </option>
                        ))}
                      </select>

                      {/* Vertical divider line */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '65px',
                          top: '5px',
                          bottom: '8px',
                          width: '1px',
                          backgroundColor: '#ccc',
                        }}
                      ></div>

                      {/* Country Name - disabled but looks normal */}
                      <label
                        className="country-name-input"
                        style={{
                          marginLeft: '15px',
                          fontSize: '14px',
                          color: '#555', // Keep normal color even when disabled
                          whiteSpace: 'nowrap',
                          flex: 1,
                          opacity: 1, // Keep fully visible even when disabled
                          cursor: !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressCountryCode'
                          )
                            ? 'not-allowed'
                            : 'default',
                          pointerEvents: !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressCountryCode'
                          )
                            ? 'none'
                            : 'auto', // Disable interactions when field is disabled
                        }}
                      >
                        {formData.registeredAddress.countryName || 'India'}
                      </label>
                    </div>
                    {formErrors.registeredAddress?.countryCode && (
                      <span className="error-message">
                        {formErrors.registeredAddress.countryCode}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="registered-address-state">
                      State/ UT<span style={{ color: 'red' }}>*</span>
                    </label>
                    {isIndia ? (
                      <select
                        id="registered-address-state"
                        name="state"
                        value={formData.registeredAddress?.state || ''}
                        onChange={(e) =>
                          handleStateChange('registeredAddress', e.target.value)
                        }
                        disabled={
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressState'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressState'
                        )}
                      >
                        <option value="">Select a state</option>
                        {registeredStates.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="registered-address-state"
                        type="text"
                        name="state"
                        value={formData.registeredAddress?.state || ''}
                        onChange={(e) =>
                          handleChange(
                            'registeredAddress',
                            'state',
                            e.target.value
                          )
                        }
                        placeholder="Enter State/UT"
                        disabled={
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressState'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressState'
                        )}
                      />
                    )}
                    {formErrors.registeredAddress?.state && (
                      <span className="error-message">
                        {formErrors.registeredAddress.state}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="registered-address-district">
                      District<span style={{ color: 'red' }}>*</span>
                    </label>
                    {isIndia ? (
                      <select
                        id="registered-address-district"
                        name="district"
                        value={formData?.registeredAddress?.district || ''}
                        onChange={(e) =>
                          handleDistrictChange(
                            'registeredAddress',
                            e.target.value
                          )
                        }
                        disabled={
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressDistrict'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressDistrict'
                        )}
                      >
                        <option value="">Select District</option>
                        {registeredDistricts.map((district) => (
                          <option key={district.value} value={district.value}>
                            {district.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="registered-address-district"
                        type="text"
                        name="district"
                        value={formData?.registeredAddress?.district || ''}
                        onChange={(e) =>
                          handleChange(
                            'registeredAddress',
                            'district',
                            e.target.value
                          )
                        }
                        placeholder="Enter District"
                        disabled={
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressDistrict'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressDistrict'
                        )}
                      />
                    )}

                    {formErrors.registeredAddress?.district && (
                      <span className="error-message">
                        {formErrors.registeredAddress.district}
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="countryCode" className="required">
                      City/Town<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="cityTown"
                      placeholder="Enter city/town"
                      value={formData.registeredAddress?.cityTown || ''}
                      onChange={(e) =>
                        handleChange(
                          'registeredAddress',
                          'cityTown',
                          e.target.value
                        )
                      }
                      disabled={
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressCityTown'
                        )
                      }
                      required={isEditableField(
                        ADDRESS_DETAILS,
                        'registeredAddressCityTown'
                      )}
                    />
                    {formErrors.registeredAddress?.cityTown && (
                      <span className="error-message">
                        {formErrors.registeredAddress.cityTown}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="registeredaddress-pincode">
                      Pin Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    {isIndia ? (
                      <select
                        id="registeredaddress-pincode"
                        name="pinCode"
                        value={formData?.registeredAddress?.pinCode || ''}
                        onChange={(e) =>
                          handleChange(
                            'registeredAddress',
                            'pinCode',
                            e.target.value
                          )
                        }
                        disabled={
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressPinCode'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressPinCode'
                        )}
                      >
                        <option value="">Select Pin Code</option>
                        <option value="OTHERS">OTHERS</option>
                        {registeredPincodes.map((pin) => (
                          <option key={pin} value={pin}>
                            {pin}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="registeredaddress-pincode"
                        type="text"
                        name="pinCode"
                        value={formData?.registeredAddress?.pinCode || ''}
                        onChange={(e) =>
                          handleChange(
                            'registeredAddress',
                            'pinCode',
                            e.target.value
                          )
                        }
                        placeholder="Enter Pin Code"
                        disabled={
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'registeredAddressPinCode'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressPinCode'
                        )}
                      />
                    )}

                    {formErrors.registeredAddress?.pinCode && (
                      <span className="error-message">
                        {formErrors.registeredAddress.pinCode}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="registeredaddress-pincode-others">
                      Pin Code (in case of Others)
                      {/* Only show asterisk when OTHERS is selected */}
                      {formData?.registeredAddress?.pinCode === 'OTHERS' && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </label>
                    <input
                      id="registeredaddress-pincode-others"
                      type="text"
                      name="alternatePinCode"
                      placeholder="Enter Pin Code"
                      value={
                        formData?.registeredAddress?.alternatePinCode || ''
                      }
                      onChange={(e) =>
                        handleChange(
                          'registeredAddress',
                          'alternatePinCode',
                          e.target.value
                        )
                      }
                      onInput={(e) => {
                        // Only allow digits and limit to 6 characters
                        const target = e.target as HTMLInputElement;
                        target.value = target.value
                          .replace(/\D/g, '')
                          .slice(0, 6);
                      }}
                      disabled={
                        formData?.registeredAddress?.pinCode !== 'OTHERS' ||
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressAlternatePinCode'
                        )
                      }
                      required={
                        formData?.registeredAddress?.pinCode === 'OTHERS' &&
                        isEditableField(
                          ADDRESS_DETAILS,
                          'registeredAddressAlternatePinCode'
                        )
                      }
                    />
                    {formErrors.registeredAddress?.alternatePinCode && (
                      <span className="error-message">
                        {formErrors.registeredAddress.alternatePinCode}
                      </span>
                    )}
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            {/* ✅ Checkbox Between Accordions */}
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="useSameAddress"
                name="useSameAddress"
                checked={useSameAddress}
                // value={formData.correspondenceAddress || ''}
                disabled={isViewOnlyAddress} // Add this line to disable based on condition
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setUseSameAddress(isChecked);

                  // Dispatch to Redux to save checkbox state
                  dispatch(setSameAsRegistrationAddress(isChecked));

                  if (isChecked) {
                    const updatedCorrespondenceAddress = {
                      ...formData.registeredAddress,
                    };
                    setFormData((prev) => ({
                      ...prev,
                      correspondenceAddress: updatedCorrespondenceAddress,
                    }));
                    // Also dispatch correspondence address to Redux
                    dispatch(
                      setCorrespondenceAddress(updatedCorrespondenceAddress)
                    );
                  } else {
                    const defaultCorrespondenceAddress = {
                      countryCode: '+91', // Keep the default country code
                      // countryName: 'India', // Keep the default country name if you have it
                      // Add other default values if needed
                    };

                    setFormData((prev) => ({
                      ...prev,
                      correspondenceAddress: defaultCorrespondenceAddress,
                    }));
                    // Clear correspondence address in Redux too
                    dispatch(setCorrespondenceAddress({}));
                  }
                }}
                style={{
                  marginRight: '8px',
                  accentColor: '#52AE32',
                  color: 'white',
                }}
              />
              <label htmlFor="useSameAddress" style={{ fontFamily: 'Gilroy' }}>
                Use same address details
              </label>
            </div>

            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                style={{ backgroundColor: '#F7F8FF', marginBottom: '15px' }}
              >
                <Typography component="span">Correspondence Address</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="correspondence-address-line-one">
                      Address Line 1<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="correspondence-address-line-one"
                      type="text"
                      placeholder="Add address here"
                      value={formData.correspondenceAddress.line1 || ''}
                      onChange={(e) =>
                        handleChange(
                          'correspondenceAddress',
                          'line1',
                          e.target.value
                        )
                      }
                      disabled={
                        useSameAddress ||
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressLine1'
                        )
                      }
                      required={isEditableField(
                        ADDRESS_DETAILS,
                        'correspondenceAddressLine1'
                      )}
                    />
                    {formErrors.correspondenceAddress?.line1 && (
                      <span className="error-message">
                        {formErrors.correspondenceAddress?.line1}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="correspondence-address-line-two">
                      Address Line 2
                    </label>
                    <input
                      id="correspondence-address-line-two"
                      type="text"
                      name="institution"
                      placeholder="Add adress here"
                      value={formData.correspondenceAddress.line2 || ''}
                      onChange={(e) =>
                        handleChange(
                          'correspondenceAddress',
                          'line2',
                          e.target.value
                        )
                      }
                      disabled={
                        useSameAddress ||
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressLine2'
                        )
                      }
                      required={isEditableField(
                        ADDRESS_DETAILS,
                        'correspondenceAddressLine2'
                      )}
                    />
                    {formErrors.correspondenceAddress?.line2 && (
                      <span className="error-message">
                        {formErrors.correspondenceAddress.line2}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="correspondence-address-line-three">
                      Address Line 3
                    </label>
                    <input
                      id="correspondence-address-line-three"
                      type="text"
                      name="line3"
                      placeholder="Add adress here"
                      value={formData.correspondenceAddress.line3 || ''}
                      onChange={(e) =>
                        handleChange(
                          'correspondenceAddress',
                          'line3',
                          e.target.value
                        )
                      }
                      disabled={
                        useSameAddress ||
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressLine3'
                        )
                      }
                      required={isEditableField(
                        ADDRESS_DETAILS,
                        'correspondenceAddressLine3'
                      )}
                    />
                    {formErrors.correspondenceAddress?.line3 && (
                      <span className="error-message">
                        {formErrors.correspondenceAddress.line3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label
                      htmlFor="countryCode"
                      className="required"
                      style={{ marginBottom: '1px' }}
                    >
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{
                        height: '47px',
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #DDDDDD',
                        borderRadius: '7px',
                        position: 'relative',
                      }}
                    >
                      <select
                        className="country-code-dropdown"
                        style={{
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          paddingRight: '10px',
                          minWidth: '70px',
                          height: '100%',
                        }}
                        name="countryCode"
                        value={
                          formData?.correspondenceAddress?.countryCode || '+91'
                        }
                        onChange={(e) =>
                          handleCountryChange('correspondenceAddress', e)
                        }
                        disabled={
                          useSameAddress ||
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'correspondenceAddressCountryCode'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressCountryCode'
                        )}
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.dial_code}>
                            {country.dial_code}
                          </option>
                        ))}
                      </select>

                      {/* Vertical divider line - adjust left position here */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '65px', // Adjust this value to move the line left/right
                          top: '8px',
                          bottom: '8px',
                          width: '1px',
                          backgroundColor: '#ccc',
                        }}
                      ></div>

                      <label
                        className="country-name-input"
                        style={{
                          marginLeft: '15px', // Reduced from 20px to bring text closer to line
                          fontSize: '14px',
                          color: '#555',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {formData.correspondenceAddress.countryName || 'Indian'}
                      </label>
                    </div>
                    {formErrors.correspondenceAddress?.countryCode && (
                      <span className="error-message">
                        {formErrors.correspondenceAddress?.countryCode}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="correspondence-address-state">
                      State/ UT<span style={{ color: 'red' }}>*</span>
                    </label>
                    {isCorrespondenceIndia ? (
                      <select
                        id="correspondence-address-state"
                        disabled={
                          useSameAddress ||
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'correspondenceAddressState'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressState'
                        )}
                        name="state"
                        value={formData.correspondenceAddress?.state || ''}
                        onChange={(e) =>
                          handleStateChange(
                            'correspondenceAddress',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select a state</option>
                        {correspondenceStates.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="correspondence-address-state"
                        type="text"
                        name="state"
                        value={formData.correspondenceAddress?.state || ''}
                        onChange={(e) =>
                          handleChange(
                            'correspondenceAddress',
                            'state',
                            e.target.value
                          )
                        }
                        placeholder="Enter State/UT"
                        disabled={
                          useSameAddress ||
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'correspondenceAddressState'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressState'
                        )}
                      />
                    )}

                    {formErrors.correspondenceAddress?.state && (
                      <span className="error-message">
                        {formErrors.correspondenceAddress.state}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="correspondence-address-district">
                      District<span style={{ color: 'red' }}>*</span>
                    </label>
                    {isCorrespondenceIndia ? (
                      <select
                        id="correspondence-address-state"
                        disabled={
                          useSameAddress ||
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'correspondenceAddressDistrict'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressDistrict'
                        )}
                        name="district"
                        value={formData?.correspondenceAddress?.district || ''}
                        onChange={(e) =>
                          handleChange(
                            'correspondenceAddress',
                            'district',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select District</option>
                        {correspondenceDistricts.map((district) => (
                          <option key={district.value} value={district.value}>
                            {district.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="correspondence-address-state"
                        type="text"
                        name="district"
                        value={formData.correspondenceAddress?.district || ''}
                        onChange={(e) =>
                          handleChange(
                            'correspondenceAddress',
                            'district',
                            e.target.value
                          )
                        }
                        placeholder="Enter District"
                        disabled={
                          useSameAddress ||
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'correspondenceAddressDistrict'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressDistrict'
                        )}
                      />
                    )}

                    {formErrors.correspondenceAddress?.district && (
                      <span className="error-message">
                        {formErrors.correspondenceAddress?.district}
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="countryCode" className="required">
                      City/Town<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="pin"
                      placeholder="Enter city/town"
                      value={formData.correspondenceAddress.cityTown || ''}
                      onChange={(e) =>
                        handleChange(
                          'correspondenceAddress',
                          'cityTown',
                          e.target.value
                        )
                      }
                      disabled={
                        useSameAddress ||
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressCityTown'
                        )
                      }
                      required={isEditableField(
                        ADDRESS_DETAILS,
                        'correspondenceAddressCityTown'
                      )}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="correspondence-address-pincode">
                      Pin Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    {isCorrespondenceIndia ? (
                      <select
                        id="correspondence-address-pincode"
                        name="pinCode"
                        value={formData?.correspondenceAddress?.pinCode || ''}
                        onChange={(e) =>
                          handleChange(
                            'correspondenceAddress',
                            'pinCode',
                            e.target.value
                          )
                        }
                        disabled={
                          useSameAddress ||
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'correspondenceAddressPinCode'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressPinCode'
                        )}
                      >
                        <option value="">Select Pin Code</option>
                        <option value="OTHERS">OTHERS</option>
                        {correspondencePincodes.map((pin) => (
                          <option key={pin} value={pin}>
                            {pin}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="correspondence-address-pincode"
                        type="text"
                        name="pinCode"
                        value={formData?.correspondenceAddress?.pinCode || ''}
                        onChange={(e) =>
                          handleChange(
                            'correspondenceAddress',
                            'pinCode',
                            e.target.value
                          )
                        }
                        placeholder="Enter Pin Code"
                        disabled={
                          useSameAddress ||
                          !isEditableField(
                            ADDRESS_DETAILS,
                            'correspondenceAddressPinCode'
                          )
                        }
                        required={isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressPinCode'
                        )}
                      />
                    )}

                    {formErrors.correspondenceAddress?.pinCode && (
                      <span className="error-message">
                        {formErrors.correspondenceAddress?.pinCode}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="correspondence-address-pincode-other">
                      Pin Code (in case of Others)
                      {/* Only show asterisk when OTHERS is selected for correspondence address */}
                      {formData?.correspondenceAddress?.pinCode ===
                        'OTHERS' && <span style={{ color: 'red' }}>*</span>}
                    </label>
                    <input
                      id="correspondence-address-pincode-other"
                      type="text"
                      name="alternatePinCode"
                      placeholder="Enter Pin Code"
                      value={
                        formData?.correspondenceAddress?.alternatePinCode || ''
                      }
                      onChange={(e) =>
                        handleChange(
                          'correspondenceAddress',
                          'alternatePinCode',
                          e.target.value
                        )
                      }
                      disabled={
                        formData?.correspondenceAddress?.pinCode !== 'OTHERS' ||
                        useSameAddress ||
                        !isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressAlternatePinCode'
                        )
                      }
                      required={
                        formData?.correspondenceAddress?.pinCode === 'OTHERS' &&
                        isEditableField(
                          ADDRESS_DETAILS,
                          'correspondenceAddressAlternatePinCode'
                        )
                      }
                    />
                    {formErrors.correspondenceAddress?.alternatePinCode && (
                      <span className="error-message">
                        {formErrors.correspondenceAddress.alternatePinCode}
                      </span>
                    )}
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
            <div className="form-footer">
              <button
                type="submit"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!isFormValid || isViewOnlyAddress}
                style={{
                  backgroundColor:
                    isFormValid && !isViewOnlyAddress ? '#002CBA' : '#CCCCCC',
                  cursor:
                    isFormValid && !isViewOnlyAddress
                      ? 'pointer'
                      : 'not-allowed',
                }}
              >
                Save & Next
              </button>
            </div>
            {/* Error Display */}
            {error && (
              <div className="error-message general-error">{error}</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default AddressDetails;
