import React, { useState, useEffect } from 'react';
import { State, Country } from 'country-state-city';
import { ReactComponent as CKYCRRLogo } from '../../../assets/ckycrr_sign_up_logo.svg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardControlKeyRoundedIcon from '@mui/icons-material/KeyboardControlKeyRounded';
import CalendarIcon from '../../../assets/Icon.svg';
import SuccessModal from '../SuccessModalOkay/successModal';
import { Button, Typography, Container } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router';
//import '../../pages/institutionAdminDetails/institutionAdminDetails.css'
import './formPreview.css';
import {
  fetchApplicationPreview,
  generatePdfPreview,
  initiateESignature,
} from '../../../redux/slices/registerSlice/applicationPreviewSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { pdfjs } from 'react-pdf';
import PdfPreviewModal from '../DocumentSummary/PdfViewer';
import { fetchCountryCodes } from '../../../utils/countryUtils';
import ApplicationStepper from '../../../component/stepper/ApplicationStepper';
import { CONSTITUTION_OPTIONS } from '../EntityForm/registrationPage';
import DocumentSummary from '../DocumentSummary/documentSummary';
import uploadIcon from '../../../assets/UploadIconNew.svg';
import UploadIconButton from '../../../assets/UploadIconButton.svg';
import {
  hideLoader,
  showLoader,
} from '../../../redux/slices/loader/loaderSlice';
import { resetAuth } from '../../../redux/slices/registerSlice/authSlice';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const FormPreview = () => {
  interface StateType {
    isoCode: string | undefined;
    name: string | undefined;
    // Add other properties if your state objects have them
    // countryCode?: string;
    // latitude?: string;
    // longitude?: string;
  }
  interface FormDataType {
    pan?: File;
    panPreview?: string;
    email?: string;
    mobile?: string;
    constitution?: string;
    registeredAddress: {
      addressLine1?: string;
      addressLine2?: string;
      addressLine3?: string;
      state?: string;
      district?: string;
      city?: string;
      pincode?: string;
      phone?: string;
    };
    correspondenceAddress: {
      addressLine1?: string;
      addressLine2?: string;
      addressLine3?: string;
      state?: string;
      district?: string;
      city?: string;
      pincode?: string;
      phone?: string;
    };

    // Add other expected fields...
    [key: string]: string | number | File | boolean | object | undefined;
    countryCode?: string;
  }
  const [formData, setFormData] = useState<FormDataType>({
    registeredAddress: {},
    correspondenceAddress: {},
  });

  const navigate = useNavigate();
  const [states, setStates] = useState<unknown[]>([]);
  const [activeTab, setActiveTab] = useState('register');

  const [, setChecked] = useState(false);
  const [isSuccessAdminModalOpen, setSuccessAdminModalOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isESigned, setIsESigned] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  // const { entityDetails, loading, error } = useSelector((state: RootState) => state.applicationPreview);
  const documents = useSelector(
    (state: RootState) => state.applicationPreview.documents
  );
  const registrationDoc = documents?.find(
    (doc) => doc.documentType === 'REGISTRATION_CERTIFICATE'
  );
  const regulatorDOC = documents?.find(
    (doc) => doc.documentType === 'REGULATOR_LICENCE'
  );
  const addressDOC = documents?.find(
    (doc) => doc.documentType === 'ADDRESS_PROOF'
  );
  const otherDOC = documents?.find(
    (doc) => doc.documentType === 'RE_OTHER_FILE'
  );
  const boardDOC = documents?.find(
    (doc) => doc.documentType === 'NO_BOARD_RESOLUTION'
  );
  const certifiedDOC = documents?.find(
    (doc) => doc.documentType === 'NO_CERTIFIED_POI'
  );
  const photoDOC = documents?.find(
    (doc) => doc.documentType === 'NO_CERTIFIED_PHOTO_IDENTITY'
  );
  const iauCertifiedDOC = documents?.find(
    (doc) => doc.documentType === 'IAU_ONE_CERTIFIED_POI'
  );
  const iauCertifiedPhotoDOC = documents?.find(
    (doc) => doc.documentType === 'IAU_ONE_CERTIFIED_PHOTO_IDENTITY'
  );
  const iauOneCertifiedDOC = documents?.find(
    (doc) => doc.documentType === 'IAU_TWO_CERTIFIED_POI'
  );
  const iauOneCertifiedPhotoDOC = documents?.find(
    (doc) => doc.documentType === 'IAU_TWO_CERTIFIED_PHOTO_IDENTITY'
  );
  const iauOneAuthorizationLetterDOC = documents?.find(
    (doc) => doc.documentType === 'IAU_ONE_AUTHORIZATION_LETTER'
  );
  const iauTwoAuthorizationLetterDOC = documents?.find(
    (doc) => doc.documentType === 'IAU_TWO_AUTHORIZATION_LETTER'
  );
  const panDOC = documents?.find((doc) => doc.documentType === 'RE_PAN');
  const cinDOC = documents?.find((doc) => doc.documentType === 'RE_CIN');

  const entityDetails = useSelector(
    (state: RootState) => state.applicationPreview.entityDetails
  );

  const correspondenceAddressSameAsRegisteredAddress = useSelector(
    (state: RootState) =>
      state.applicationPreview.correspondenceAddressSameAsRegisteredAddress
  );
  const applicationId = useSelector(
    (state: RootState) => state.auth.reinitializeData?.applicationId
  );
  const registeredAddress = useSelector(
    (state: RootState) => state.applicationPreview.registeredAddress
  );
  const correspondenceAddress = useSelector(
    (state: RootState) => state.applicationPreview.correspondanceAddress
  );
  const headOfInstitutionDetails = useSelector(
    (state: RootState) => state.applicationPreview.headOfInstitutionDetails
  );
  const nodalOfficerDetails = useSelector(
    (state: RootState) => state.applicationPreview.nodalOfficerDetails
  );
  const adminOneDetails = useSelector(
    (state: RootState) => state.applicationPreview.adminOneDetails
  );
  const adminTwoDetails = useSelector(
    (state: RootState) => state.applicationPreview.adminTwoDetails
  );

  const Reinitializestatus = useSelector(
    (state: RootState) => state.auth.reinitializeData?.approvalStatus
  );

  const selectConstitution = (state: RootState) =>
    state.applicationPreview.entityDetails?.constitution;
  const selectCitizenship = (state: RootState) =>
    state.applicationPreview.headOfInstitutionDetails?.citizenship;
  const constitution = useSelector(selectConstitution);
  const citizenship = useSelector(selectCitizenship);
  const isCINRequired = ['D', 'E', 'M'].includes(constitution || '');
  const isProperitor = ['A'].includes(constitution || '');
  const isLLPIN = ['J'].includes(constitution || '');
  const isIndianCitizen = citizenship === 'Indian';
  console.log(isCINRequired, 'isCINRequired');

  const [pdfData, setPdfData] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [adminOneCountryName, setAdminOneCountryName] = useState('');
  const [adminTwoDetailsCountryName, setAdminTwoDetailsCountryName] =
    useState('');
  const [
    headOfInstitutionDetailsCountryName,
    setHeadOfInstitutionDetailsCountryName,
  ] = useState('');
  const [nodalOfficerDetailsCountryName, setNodalOfficerDetailsCountryName] =
    useState('');
  const [registeredAddressCountryName, setRegisteredAddressCountryName] =
    useState('');
  const [
    corresspondenceAddressCountryName,
    setCorresspondenceAddressCountryName,
  ] = useState('');

  const [countries, setCountries] = useState<Country[]>([]);
  interface Country {
    name: string;
    dial_code: string;
    code: string;
  }

  const viewOnlyStatuses = [
    'SUBMITTED_PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'READY_FOR_SUBMISSION',
  ];

  const isViewOnlyformPreview = viewOnlyStatuses.includes(
    Reinitializestatus ?? ''
  );

  const getConstitutionLabel = (value: string) => {
    return (
      CONSTITUTION_OPTIONS.find((option) => option.value === value)?.label ||
      value
    );
  };
  // const { pdfdocuments } = useSelector((state: RootState) => state.applicationPreview);
  // useEffect(() => {
  //   dispatch(setCurrentStep(5)); // 0 = first step
  // }, [dispatch]);

  useEffect(() => {
    const loadCountries = async () => {
      const countryList = await fetchCountryCodes();
      setCountries(countryList);
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (countries.length && adminOneDetails?.countryCode) {
      const matched = countries.find(
        (c) => c.dial_code === adminOneDetails.countryCode
      );
      setAdminOneCountryName(matched?.name || '');
    }
    if (countries.length && adminTwoDetails?.countryCode) {
      const matched = countries.find(
        (c) => c.dial_code === adminTwoDetails.countryCode
      );
      setAdminTwoDetailsCountryName(matched?.name || '');
    }
    if (countries.length && registeredAddress?.countryCode) {
      const matched = countries.find(
        (c) => c.dial_code === registeredAddress.countryCode
      );
      setRegisteredAddressCountryName(matched?.name || '');
    }
    if (countries.length && correspondenceAddress?.countryCode) {
      const matched = countries.find(
        (c) => c.dial_code === correspondenceAddress.countryCode
      );
      setCorresspondenceAddressCountryName(matched?.name || '');
    }
    if (countries.length && headOfInstitutionDetails?.countryCode) {
      const matched = countries.find(
        (c) => c.dial_code === headOfInstitutionDetails.countryCode
      );
      setHeadOfInstitutionDetailsCountryName(matched?.name || '');
    }
    if (countries.length && nodalOfficerDetails?.countryCode) {
      const matched = countries.find(
        (c) => c.dial_code === nodalOfficerDetails.countryCode
      );
      setNodalOfficerDetailsCountryName(matched?.name || '');
    }
  }, [
    countries,
    adminOneDetails?.countryCode,
    adminTwoDetails?.countryCode,
    registeredAddress?.countryCode,
    correspondenceAddress?.countryCode,
    headOfInstitutionDetails?.countryCode,
    nodalOfficerDetails?.countryCode,
  ]);

  // useEffect(() => {
  //   dispatch(generatePdfPreview());
  // }, [dispatch]);

  // useEffect(() => {
  //   dispatch(fetchApplicationPreview()); // Replace with dynamic ID if needed
  // }, [dispatch]);
  useEffect(() => {
    // Show loader before dispatching
    dispatch(showLoader('Please wait...'));

    // Dispatch the action
    dispatch(fetchApplicationPreview()).finally(() => {
      // Hide loader regardless of success/failure
      dispatch(hideLoader());
    });
  }, [dispatch]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === 'file') {
      const file = target.files?.[0];
      if (file) {
        const previewURL = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          [name]: file,
          [`${name}Preview`]: previewURL,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    path: string
  ) => {
    event.stopPropagation(); // Prevent accordion toggle
    setIsEditable((prev) => !prev);
    navigate(path);
  };

  // const handleSubmit = async (e: React.FormEvent) =>{
  //   e.preventDefault();

  // try {
  //   // Trigger PDF generation
  //   await dispatch(generatePdfPreview()).unwrap();

  // } catch (error) {
  //   console.error('PDF generation failed:', error);
  //   // Optionally show a toast or error message
  // }
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(showLoader('Please wait...'));
    try {
      setIsESigned(false);
      const response = await dispatch(generatePdfPreview()).unwrap();

      // Debug the response
      console.log('Full response:', response);
      console.log('PDF data exists:', response?.data?.pdf);
      console.log('PDF data type:', typeof response?.data?.pdf);
      console.log('PDF data length:', response?.pdf?.length);

      if (response?.data?.pdf) {
        setPdfData(response.data.pdf);
        setShowViewer(true);
        console.log('In the pdf Preview response');
        console.log('View for PDF', response.data.pdf);
      } else {
        console.warn('No PDF returned');
        console.log('In the pdf Preview response else');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF');
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleESign = async (formData: {
    place: string;
    date: string;
    consent: boolean;
  }): Promise<string> => {
    try {
      const resultAction = await dispatch(initiateESignature(formData));

      if (initiateESignature.fulfilled.match(resultAction)) {
        const signedPdfBase64 = resultAction.payload.data.pdf;
        setPdfData(signedPdfBase64);
        setShowViewer(true);
        setIsESigned(true);
        return signedPdfBase64; // <-- return this string to satisfy the type
      } else {
        console.error(
          'ESign failed:',
          resultAction.payload || resultAction.error
        );
        throw new Error(resultAction.payload || 'eSignature failed');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      throw error;
    }
  };
  console.log(showViewer, 'showViewer after clicking on esignature');

  // const handleSubmit = () => {
  //   // Simulate getting the base64 PDF string (from an API, form data, etc.)
  //   const base64 = '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b250L0hlbHZldGljYS1Cb2xkL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZz4+CmVuZG9iagoyIDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKNCAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDMvS2lkc1s1IDAgUiA3IDAgUiA5IDAgUl0+PgplbmRvYmoKMTAgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDQgMCBSPj4KZW5kb2JqCjExIDAgb2JqCjw8L1Byb2R1Y2VyKGlUZXh0riA1LjUuMTMgqTIwMDAtMjAxOCBpVGV4dCBHcm91cCBOViBcKEFHUEwtdmVyc2lvblwpKS9DcmVhdGlvbkRhdGUoRDoyMDI1MDYwNTExMDExNCswNSczMCcpL01vZERhdGUoRDoyMDI1MDYwNTExMDExNCswNSczMCcpPj4KZW5kb2JqCnhyZWYKMCAxMgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDQ0NjAgMDAwMDAgbiAKMDAwMDAwNDU1MyAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDQ2NDEgMDAwMDAgbiAKMDAwMDAwMTI4OSAwMDAwMCBuIAowMDAwMDAxNDEwIDAwMDAwIG4gCjAwMDAwMDI3NjcgMDAwMDAgbiAKMDAwMDAwMjg4OCAwMDAwMCBuIAowMDAwMDA0MzM5IDAwMDAwIG4gCjAwMDAwMDQ3MDQgMDAwMDAgbiAKMDAwMDAwNDc1MCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgMTIvUm9vdCAxMCAwIFIvSW5mbyAxMSAwIFIvSUQgWzwzNzdjMTI2ZWYxNDI4ZWE0YjMxYzE4MDg3NDdmZWFjZj48Mzc3YzEyNmVmMTQyOGVhNGIzMWMxODA4NzQ3ZmVhY2Y+XT4+CiVpVGV4dC01LjUuMTMKc3RhcnR4cmVmCjQ5MDkKJSVFT0YK'; // Replace with actual logic

  //   // Set state to show PDF
  //   setPdfData(base64);
  //   setShowPdf(true);
  // };
  const { userDetails } = useSelector((state: RootState) => state.auth);

  const handleBack = () => {
    navigate('/re-institutional-admin-details');
    if (userDetails?.approved === true) {
      dispatch(resetAuth());
    }
  };

  // const handlePhoneChange = (phone: string, country: CountryData) => {
  //     setFormData({
  //       ...formData,
  //       phone,
  //       country: country.name,
  //       countryCode: `+${country.dialCode}`,
  //     });
  //   };
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = Country.getAllCountries().find(
        (c) => c.name === formData.country
      );

      if (selectedCountry) {
        const fetchedStates = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(fetchedStates);
      }
    }
  }, [formData.country]);

  const handleOkay = () => {
    setSuccessAdminModalOpen(false);
  };
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="signup-container">
        <div className="signup-card">
          <div className="logo-container">
            <button className="backButton" onClick={handleBack}>
              <ArrowBackIcon className="back-icon" />
              <span className="back-text">Back</span>
            </button>
            <CKYCRRLogo className="signup-logo" />
          </div>
          <div className="tab-container">
            <button
              className={activeTab === 'signup' ? 'active' : ''}
              onClick={() => handleTabChange('signup')}
              style={{ cursor: 'not-allowed' }}
              disabled
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

          <SuccessModal
            isOpen={isSuccessAdminModalOpen}
            onClose={() => setSuccessAdminModalOpen(false)}
            onOkay={handleOkay}
            title="Details Verified Successfully!"
            message="The Head of Institution's details have been verified successfully"
          />
          {isViewOnlyformPreview && (
            <>
              <div className="step-indicator">Track Status</div>
              <Container maxWidth="lg" sx={{ mt: 4 }}>
                <DocumentSummary />
              </Container>
            </>
          )}
          <div
            className="step-indicator"
            style={
              isViewOnlyformPreview
                ? { marginTop: '25px', marginBottom: '-5px' }
                : undefined
            }
          >
            Form Preview
          </div>
          <form className="entity-form">
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: '#F7F8FF' }}
              >
                <Typography component="span">Entity Profile</Typography>
                <Button
                  style={{
                    border: 'none',
                    fontFamily: 'Gilroy',
                    textTransform: 'capitalize',
                  }}
                  onClick={(event) => handleEditClick(event, '/re-register')}
                  sx={{ ml: 'auto' }}
                >
                  {isEditable ? 'Edit' : 'Edit'}
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                {entityDetails && (
                  <>
                    <div className="form-row" style={{ marginTop: '15px' }}>
                      <div className="form-group">
                        <label htmlFor="name-institution">
                          Name Of Institution
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="name-institution"
                          type="text"
                          value={entityDetails.nameOfInstitution}
                          disabled
                          placeholder="Enter name of institution"
                          style={{ cursor: !isEditable ? 'not-allowed' : '' }}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="regulator-entity">
                          Regulator<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="regulator-entity"
                          type="text"
                          value={entityDetails.regulator}
                          disabled
                          placeholder="Enter name of institution"
                          style={{ cursor: !isEditable ? 'not-allowed' : '' }}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="Institution-type-entity">
                          Institution Type
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="Institution-type-entity"
                          type="text"
                          value={entityDetails.institutionType}
                          placeholder="Enter name of institution"
                          onChange={handleChange}
                          disabled={!isEditable}
                          style={{ cursor: !isEditable ? 'not-allowed' : '' }}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="constitution-entity">
                          Constitution <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="constitution-entity"
                          type="text"
                          value={getConstitutionLabel(
                            entityDetails.constitution
                          )}
                          placeholder="Enter name of institution"
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="proprietor-entity">
                          Proprietor Name
                          {isProperitor && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </label>
                        <input
                          id="proprietor-entity"
                          value={entityDetails.proprietorName}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="registration-entity">
                          Registration Number
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input value={entityDetails.registrationNo} disabled />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="pan-entity">
                          PAN<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div className="input-with-preview">
                          <div
                            className="custom-file-input-formpreview"
                            style={{ height: '48px' }}
                          >
                            <input
                              type="text"
                              value={entityDetails.panNo}
                              disabled
                              style={{ width: '100%' }}
                            />

                            {isEditable ? (
                              <label
                                htmlFor="pan-upload"
                                className="upload-icon"
                                aria-label="Upload PAN document"
                              >
                                <img
                                  src={uploadIcon} // path to your PNG
                                  alt="Upload"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    objectFit: 'contain',
                                  }}
                                />
                              </label>
                            ) : (
                              <div className="upload-icon upload-icon-disabled">
                                <img
                                  src={uploadIcon} // path to your PNG
                                  alt="Upload"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    objectFit: 'contain',
                                  }}
                                />
                              </div>
                            )}

                            <input
                              id="pan-upload"
                              type="file"
                              name="pan"
                              onChange={handleChange}
                              className="hidden-file-input"
                            />
                          </div>

                          {panDOC?.base64Content && (
                            <div className="preview-box">
                              <img
                                src={`data:image/jpeg;base64,${panDOC.base64Content}`}
                                alt="PAN Preview"
                                className="preview-img"
                              />
                              <span className="tick-icon">
                                <CheckCircleIcon />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="cin-entity">
                          CIN
                          {isCINRequired && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </label>
                        <div className="input-with-preview">
                          <div
                            className="custom-file-input-formpreview"
                            style={{ height: '48px' }}
                          >
                            <input
                              type="text"
                              value={entityDetails.cinNo}
                              disabled
                              style={{ width: '100%' }}
                              // required={isCINRequired}
                            />

                            {isEditable ? (
                              <label
                                htmlFor="pan-upload"
                                className="upload-icon"
                                aria-label="PAN upload document"
                              >
                                <img
                                  src={uploadIcon} // path to your PNG
                                  alt="Upload"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    objectFit: 'contain',
                                  }}
                                />
                              </label>
                            ) : (
                              <div className="upload-icon upload-icon-disabled">
                                <img
                                  src={uploadIcon} // path to your PNG
                                  alt="Upload"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    objectFit: 'contain',
                                  }}
                                />
                              </div>
                            )}

                            <input
                              id="pan-upload"
                              type="file"
                              name="pan"
                              onChange={handleChange}
                              className="hidden-file-input"
                            />
                          </div>

                          {cinDOC?.base64Content && (
                            <div className="preview-box">
                              <img
                                src={`data:image/jpeg;base64,${cinDOC.base64Content}`}
                                alt="PAN Preview"
                                className="preview-img"
                              />
                              <span className="tick-icon">
                                <CheckCircleIcon />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="llpin-entity">
                          LLPIN
                          {isLLPIN && <span style={{ color: 'red' }}>*</span>}
                        </label>
                        <input
                          type="text"
                          value={entityDetails.llpinNo}
                          placeholder="Enter registration number"
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="gstin-entity">
                          GSTIN No.<span style={{ color: 'red' }}>*</span>
                        </label>

                        <input
                          type="text"
                          placeholder="Enter PAN number"
                          value={entityDetails.gstinNo}
                          disabled
                          //   onChange={handlePanChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="websit-entity">RE Website</label>

                        <input
                          type="text"
                          placeholder="Enter RWebsite"
                          value={entityDetails.reWebsite}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="regulator-entity">
                          Regulator License/Certificate/Notification
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="file"
                          id="license-upload"
                          name="pan"
                          onChange={handleChange}
                          className="hidden-upload"
                          disabled
                        />
                        <div className="input-with-preview">
                          <label
                            htmlFor="license-upload"
                            className="upload-doc-btn"
                            style={{ cursor: 'not-allowed' }}
                          >
                            <img
                              src={UploadIconButton} // path to your PNG
                              alt="Upload"
                              style={{
                                width: '24px',
                                height: '24px',
                                objectFit: 'contain',
                              }}
                            />
                            <span
                              style={{
                                fontSize: '13px',
                                marginLeft: '2px',
                                display: 'inline-block',
                                transform:
                                  'translateY(4px)' /* Fine-tune as needed */,
                              }}
                            >
                              Upload
                            </span>
                          </label>

                          {/* ✅ Show preview if base64 is available */}
                          {registrationDoc?.base64Content && (
                            <div
                              className="preview-box"
                              style={{ marginBottom: '5px' }}
                            >
                              <img
                                src={`data:image/jpeg;base64,${registrationDoc.base64Content}`}
                                alt="License Preview"
                                className="preview-img"
                              />
                              <span className="tick-icon">
                                <CheckCircleIcon />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="certificate-entity">
                          Registration Certificate
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="file"
                          id="license-upload"
                          name="pan"
                          onChange={handleChange}
                          className="hidden-upload"
                          disabled
                        />
                        <div className="input-with-preview">
                          <label
                            htmlFor="license-upload"
                            className="upload-doc-btn"
                            style={{ cursor: 'not-allowed' }}
                          >
                            <img
                              src={UploadIconButton} // path to your PNG
                              alt="Upload"
                              style={{
                                width: '24px',
                                height: '24px',
                                objectFit: 'contain',
                              }}
                            />
                            <span
                              style={{
                                fontSize: '13px',
                                marginLeft: '2px',
                                display: 'inline-block',
                                transform:
                                  'translateY(4px)' /* Fine-tune as needed */,
                              }}
                            >
                              Upload
                            </span>
                          </label>

                          {/* ✅ Show preview if base64 is available */}
                          {regulatorDOC?.base64Content && (
                            <div
                              className="preview-box"
                              style={{ marginBottom: '5px' }}
                            >
                              <img
                                src={`data:image/jpeg;base64,${regulatorDOC.base64Content}`}
                                alt="License Preview"
                                className="preview-img"
                              />
                              <span className="tick-icon">
                                <CheckCircleIcon />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="address-entity">
                          Address Proof<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input type="file" disabled className="hidden-upload" />
                        <div className="input-with-preview">
                          <label
                            htmlFor="license-upload"
                            className="upload-doc-btn"
                            style={{ cursor: 'not-allowed' }}
                          >
                            <img
                              src={UploadIconButton} // path to your PNG
                              alt="Upload"
                              style={{
                                width: '24px',
                                height: '24px',
                                objectFit: 'contain',
                              }}
                            />
                            <span
                              style={{
                                fontSize: '13px',
                                marginLeft: '2px',
                                display: 'inline-block',
                                transform:
                                  'translateY(4px)' /* Fine-tune as needed */,
                              }}
                            >
                              Upload
                            </span>
                          </label>
                          {addressDOC?.base64Content && (
                            <div
                              className="preview-box"
                              style={{ marginBottom: '5px' }}
                            >
                              <img
                                src={`data:image/jpeg;base64,${addressDOC.base64Content}`}
                                alt="License Preview"
                                className="preview-img"
                              />
                              <span className="tick-icon">
                                <CheckCircleIcon />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="other-entity">Other</label>

                        <input
                          onChange={handleChange}
                          className="hidden-upload"
                          disabled
                        />
                        <div className="input-with-preview">
                          <label
                            htmlFor="license-upload"
                            className="upload-doc-btn"
                            style={{ cursor: 'not-allowed' }}
                          >
                            <img
                              src={UploadIconButton} // path to your PNG
                              alt="Upload"
                              style={{
                                width: '24px',
                                height: '24px',
                                objectFit: 'contain',
                              }}
                            />
                            <span
                              style={{
                                fontSize: '13px',
                                marginLeft: '2px',
                                display: 'inline-block',
                                transform:
                                  'translateY(4px)' /* Fine-tune as needed */,
                              }}
                            >
                              Upload
                            </span>
                          </label>
                          {otherDOC?.base64Content && (
                            <div
                              className="preview-box"
                              style={{ marginBottom: '5px' }}
                            >
                              <img
                                src={`data:image/jpeg;base64,${otherDOC.base64Content}`}
                                alt="License Preview"
                                className="preview-img"
                              />
                              <span className="tick-icon">
                                <CheckCircleIcon />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                style={{ backgroundColor: '#F7F8FF' }}
              >
                <Typography component="span">Address Details</Typography>
                <Button
                  style={{
                    border: 'none',
                    fontFamily: 'Gilroy',
                    textTransform: 'capitalize',
                  }}
                  onClick={(event) =>
                    handleEditClick(event, '/re-address-details')
                  }
                  sx={{ ml: 'auto' }}
                >
                  {isEditable ? 'Edit' : 'Edit'}
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                {registeredAddress && (
                  <>
                    <label htmlFor="registeredaddress">
                      Registered Address
                    </label>
                    <div className="form-row" style={{ marginTop: '15px' }}>
                      <div className="form-group">
                        <label htmlFor="line-one-registeredaddress">
                          Address Line 1<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Add address here"
                          value={registeredAddress.line1}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="line-two-registeredaddress">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          value={registeredAddress.line2}
                          placeholder="Add adress here"
                          disabled

                          // }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="line-three-registeredaddress">
                          Address Line 3
                        </label>
                        <input
                          type="text"
                          value={registeredAddress.line3}
                          placeholder="Add adress here"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="countryCode" className="required">
                          Country Code<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div
                          className="country-code-wrapper"
                          style={{ height: '45px' }}
                        >
                          <input
                            className="country-code-dropdown"
                            style={{
                              marginLeft: '-1px',
                              borderColor: 'grey',
                              marginBottom: '2px',
                              borderRadius: '-10px',
                            }}
                            value={registeredAddress?.countryCode}
                            disabled
                          />
                          <label
                            className="country-name-input"
                            style={{ marginBottom: '19px' }}
                          >
                            {registeredAddressCountryName}
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="state-registeredaddress">
                          State/ UT<span style={{ color: 'red' }}>*</span>
                        </label>
                        {(states as StateType[]).map((state) => (
                          <option key={state.isoCode} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                        <input value={registeredAddress.state} disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="district-registeredaddress">
                          District<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={registeredAddress.district}
                          placeholder="Enter District"
                          disabled
                          // onChange={(e) =>
                          //     handleChange('registeredAddress', 'district', e.target.value)
                          // }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="countryCode" className="required">
                          City/ town<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={registeredAddress.cityTown}
                          placeholder="Enter city/town"
                          disabled
                          // onChange={(e) =>
                          //     handleChange('registeredAddress', 'city', e.target.value)
                          // }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="pincode-registeredaddress">
                          Pin Code<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={registeredAddress.pinCode}
                          placeholder="Enter Pin Code"
                          disabled
                          // onChange={(e) =>
                          //     handleChange('registeredAddress', 'pincode', e.target.value)
                          // }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="pincode-others-registeredaddress">
                          Pin Code (in case of Others
                          <span style={{ color: 'red' }}>*</span>)
                        </label>
                        <input
                          type="text"
                          value={registeredAddress.alternatePinCode}
                          placeholder="Enter District"
                          disabled
                          // onChange={(e) =>
                          //     handleChange('registeredAddress', 'pincode', e.target.value)
                          // }
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '16px 0',
                        // marginLeft: '470px',
                      }}
                    >
                      <input
                        type="checkbox"
                        id="useSameAddress"
                        name="useSameAddress"
                        checked={
                          correspondenceAddressSameAsRegisteredAddress || false
                        }
                        readOnly
                        style={{
                          marginRight: '8px',
                          accentColor: '#52AE32', // ✅ green checkmark
                        }}
                      />
                      <label
                        htmlFor="useSameAddress"
                        style={{ fontWeight: '500' }}
                      >
                        Use same address details
                      </label>
                    </div>{' '}
                  </>
                )}
                {correspondenceAddress && (
                  <>
                    {' '}
                    <label htmlFor="correspondencedaddress">
                      Correspondence Adress
                    </label>
                    <div className="form-row" style={{ marginTop: '15px' }}>
                      <div className="form-group">
                        <label htmlFor="line-one-correspondencedaddress">
                          Address Line 1<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Add address here"
                          value={correspondenceAddress.line1 || ''}
                          // onChange={(e) =>
                          //     handleChange('correspondenceAddress', 'addressLine1', e.target.value)
                          // }
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="line-two-correspondencedaddress">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          name="institution"
                          placeholder="Add adress here"
                          value={correspondenceAddress.line2 || ''}
                          disabled
                          //   onChange={(e) =>
                          //     handleChange('correspondenceAddress', 'addressLine2', e.target.value)
                          // }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="line-three-correspondencedaddress">
                          Address Line 3
                        </label>
                        <input
                          type="text"
                          name="institution"
                          placeholder="Add adress here"
                          value={correspondenceAddress.line2 || ''}
                          disabled
                          // onChange={(e) =>
                          //     handleChange('correspondenceAddress', 'addressLine3', e.target.value)
                          // }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="countryCode" className="required">
                          Country Code<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div
                          className="country-code-wrapper"
                          style={{ height: '45px' }}
                        >
                          <input
                            className="country-code-dropdown"
                            style={{
                              marginLeft: '-1px',
                              borderColor: 'grey',
                              marginBottom: '2px',
                              borderRadius: '-10px',
                            }}
                            value={correspondenceAddress?.countryCode}
                            disabled
                          />
                          <label
                            className="country-name-input"
                            style={{ marginBottom: '19px' }}
                          >
                            {corresspondenceAddressCountryName}
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="state-correspondencedaddress">
                          State/ UT<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input value={correspondenceAddress.state} disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="district-correspondencedaddress">
                          District<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="institution"
                          placeholder="Enter District"
                          value={correspondenceAddress.district || ''}
                          disabled
                          // onChange={(e) =>
                          //     handleChange('correspondenceAddress', 'district', e.target.value)
                          // }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="countryCode" className="required">
                          City/ town<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="pin"
                          placeholder="Enter city/town"
                          disabled
                          value={correspondenceAddress.cityTown || ''}
                          // onChange={(e) =>
                          //     handleChange('correspondenceAddress', 'city', e.target.value)
                          // }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="pincode-correspondencedaddress">
                          Pin Code<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Pin Code"
                          disabled
                          value={correspondenceAddress.pinCode || ''}
                          // onChange={(e) =>
                          //     handleChange('correspondenceAddress', 'pincode', e.target.value)
                          // }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="pincode-other-correspondencedaddress">
                          Pin Code (in case of Others)
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="institution"
                          placeholder="Enter District"
                          disabled
                          value={correspondenceAddress.alternatePinCode || ''}
                          // onChange={(e) =>
                          //     handleChange('correspondenceAddress', 'pincode', e.target.value)
                          // }
                        />
                      </div>
                    </div>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                style={{ backgroundColor: '#F7F8FF' }}
              >
                <Typography component="span">
                  Head of institution Details
                </Typography>
                <Button
                  style={{
                    border: 'none',
                    fontFamily: 'Gilroy',
                    textTransform: 'capitalize',
                  }}
                  onClick={(event) =>
                    handleEditClick(event, '/re-institution-details')
                  }
                  sx={{ ml: 'auto' }}
                >
                  {isEditable ? 'Edit' : 'Edit'}
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                <div className="form-row" style={{ marginTop: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="citizenship-hoi">
                      Citizenship<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="citizenship"
                      onChange={handleChange}
                      value={headOfInstitutionDetails?.citizenship || ''}
                      disabled
                    >
                      <option value="">Select citizenship</option>
                      <option value="Indian">Indian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ckyc-hoi">
                      CKYC Number
                      {isIndianCitizen && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="ckycnum"
                      placeholder="Enter CKYC Number"
                      value={headOfInstitutionDetails?.ckycNumber || ''}
                      disabled
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="title-hoi">
                      Title<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="title"
                      onChange={handleChange}
                      value={headOfInstitutionDetails?.title}
                      disabled
                    >
                      <option value="Mr.">Mr</option>
                      <option value="Mrs.">Mrs</option>
                      <option value="Ms">Ms</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first-hoi">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter First Name"
                      value={headOfInstitutionDetails?.firstName || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="middle-hoi">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      placeholder="Enter middle name"
                      value={headOfInstitutionDetails?.middleName || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="last-hoi">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter Last Name"
                      value={headOfInstitutionDetails?.lastName || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="designation-hoi">
                      Designation<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="designation"
                      placeholder="Enter Designation"
                      value={headOfInstitutionDetails?.designation || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email-hoi">
                      Email<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Email"
                      value={headOfInstitutionDetails?.emailId || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    {/* <input value={headOfInstitutionDetails?.gender} placeholder='Enter Gender' disabled /> */}
                    <label htmlFor="gender-hoi">
                      Gender<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={headOfInstitutionDetails?.gender}
                      onChange={handleChange}
                      defaultValue="Select institution type"
                      disabled
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="countryCode" className="required">
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{ height: '45px' }}
                    >
                      <input
                        className="country-code-dropdown"
                        style={{
                          marginLeft: '-1px',
                          borderColor: 'grey',
                          marginBottom: '2px',
                          borderRadius: '-10px',
                        }}
                        value={headOfInstitutionDetails?.countryCode}
                        disabled
                      />
                      <label
                        className="country-name-input"
                        style={{ marginBottom: '19px' }}
                      >
                        {headOfInstitutionDetailsCountryName}
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile-hoi">
                      Mobile Number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="mobileNo"
                      placeholder="Enter mobile number"
                      value={headOfInstitutionDetails?.mobileNo || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="landline-hoi">Landline Number</label>
                    <input
                      type="text"
                      name="landline"
                      placeholder="Enter landline number"
                      value={headOfInstitutionDetails?.landline || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                style={{ backgroundColor: '#F7F8FF' }}
              >
                <Typography component="span">Nodal Officer Details</Typography>
                <Button
                  style={{
                    border: 'none',
                    fontFamily: 'Gilroy',
                    textTransform: 'capitalize',
                  }}
                  onClick={(event) =>
                    handleEditClick(event, '/re-nodal-officer-details')
                  }
                  sx={{ ml: 'auto' }}
                >
                  {isEditable ? 'Edit' : 'Edit'}
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                <div className="form-row" style={{ marginTop: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="citizenship-nodal">
                      Citizenship<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      value={nodalOfficerDetails?.citizenship}
                      placeholder="Enter Citizenship"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ckyc-nodal">
                      CKYC Number
                      {isIndianCitizen && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={nodalOfficerDetails?.ckycNo}
                      placeholder="Enter CKYC Number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    {/* <input type="text" placeholder='Enter Title' onChange={handleChange} disabled /> */}
                    <label htmlFor="title-nodal">
                      Title<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="title"
                      onChange={handleChange}
                      value={nodalOfficerDetails?.title}
                      disabled
                    >
                      <option value="Mr.">Mr</option>
                      <option value="Mrs.">Mrs</option>
                      <option value="Ms">Ms</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first-nodal">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={nodalOfficerDetails?.firstName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="middle-nodal">Middle Name</label>
                    <input
                      type="text"
                      value={nodalOfficerDetails?.middleName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-nodal">Last Name</label>
                    <input
                      type="text"
                      value={nodalOfficerDetails?.lastName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="designation-nodal">
                      Designation<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={nodalOfficerDetails?.designation}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email-nodal">
                      Email<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={nodalOfficerDetails?.email}
                      placeholder="Enter proprieator name"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    {/* <label>Gender<span style={{ color: 'red' }}>*</span></label> */}
                    {/* <input value={nodalOfficerDetails?.gender} placeholder='Select Gender' disabled /> */}
                    <label htmlFor="gender-nodal">
                      Gender<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={nodalOfficerDetails?.gender}
                      onChange={handleChange}
                      defaultValue="Select institution type"
                      disabled
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="countryCode" className="required">
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{ height: '45px' }}
                    >
                      <input
                        className="country-code-dropdown"
                        style={{
                          marginLeft: '-1px',
                          borderColor: 'grey',
                          marginBottom: '2px',
                          borderRadius: '-10px',
                        }}
                        value={nodalOfficerDetails?.countryCode}
                        disabled
                      />
                      <label
                        className="country-name-input"
                        style={{ marginBottom: '19px' }}
                      >
                        {nodalOfficerDetailsCountryName}
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile-nodal">
                      Mobile Number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={nodalOfficerDetails?.mobileNumber}
                      placeholder="Enter mobile number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="landline-nodal">Landline Number</label>
                    <input
                      type="text"
                      value={nodalOfficerDetails?.landline}
                      placeholder="Enter landline number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '-15px' }}>
                  <div className="form-group">
                    <label htmlFor="proof-nodal">
                      Proof of Identity<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      value={nodalOfficerDetails?.proofOfIdentity}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="proofnumber-nodal">
                      Proof of Identity Number
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={nodalOfficerDetails?.identityNumber}
                      placeholder="Enter proof of identity number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dob">
                      Date of Birth<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        id="dob"
                        value={nodalOfficerDetails?.dateOfBirth}
                        onChange={handleChange}
                        className="custom-date-input"
                        disabled
                      />
                      <div className="calendar-icon-wrapper">
                        <img
                          src={CalendarIcon}
                          alt="calendar"
                          className="calendar-icon"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '-20px' }}>
                  <div className="form-group">
                    <label htmlFor="office-nodal">
                      Office Address
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={
                        nodalOfficerDetails?.sameAsRegisteredAddress
                          ? 'registered'
                          : 'office'
                      }
                      onChange={(e) => {
                        const isSameAsRegistered =
                          e.target.value === 'registered';
                        setChecked(isSameAsRegistered);
                        // Optionally also update nodalOfficerDetails:
                        // setNodalOfficerDetails(prev => ({
                        //   ...prev,
                        //   sameAsRegisteredAddress: isSameAsRegistered
                        // }));
                      }}
                      disabled
                      style={{
                        borderRadius: '6px',
                        height: '45px',
                        width: '100%',
                      }}
                    >
                      <option value="registered">
                        Same as registered address
                      </option>
                      <option value="office">
                        Same as Correspondence address
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dob">
                      Date of Board Resolution for Appointment
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        id="dob"
                        value={nodalOfficerDetails?.dateOfBoardResolution}
                        onChange={handleChange}
                        disabled
                        className="custom-date-input"
                      />
                      <div className="calendar-icon-wrapper">
                        <img
                          src={CalendarIcon}
                          alt="calendar"
                          className="calendar-icon"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="board-nodal">
                      Board Resolution<span style={{ color: 'red' }}>*</span>
                    </label>
                    {/* <input type="number" name="proofidentitynumber" placeholder='Enter proof of identity number' onChange={handleChange} /> */}
                    <div className="input-with-preview">
                      <label
                        htmlFor="license-upload"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload
                        </span>
                      </label>
                      {boardDOC?.base64Content && (
                        <div
                          className="preview-box"
                          style={{ marginBottom: '5px' }}
                        >
                          <img
                            src={`data:image/jpeg;base64,${boardDOC.base64Content}`}
                            alt="License Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label
                      htmlFor="certified-nodal"
                      style={{ font: 'small-caption' }}
                    >
                      Certified copy of proof of Identity
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    {/* <input type="number" name="proofidentitynumber" placeholder='Enter proof of identity number' onChange={handleChange} /> */}
                    <div className="input-with-preview">
                      <label
                        htmlFor="license-upload-certified-doc"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload
                        </span>
                      </label>
                      {certifiedDOC?.base64Content && (
                        <div
                          className="preview-box"
                          style={{ marginBottom: '5px' }}
                        >
                          <img
                            src={`data:image/jpeg;base64,${certifiedDOC.base64Content}`}
                            alt="License Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="photo-nodal"
                      style={{ font: 'small-caption' }}
                    >
                      Certified copy of photo Identity Card
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    {/* <input type="number" name="proofidentitynumber" placeholder='Enter proof of identity number' onChange={handleChange} /> */}
                    <div className="input-with-preview">
                      <label
                        htmlFor="license-upload"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload
                        </span>
                      </label>
                      {photoDOC?.base64Content && (
                        <div
                          className="preview-box"
                          style={{ marginBottom: '5px' }}
                        >
                          <img
                            src={`data:image/jpeg;base64,${photoDOC.base64Content}`}
                            alt="License Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group"></div>
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<KeyboardControlKeyRoundedIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                sx={{
                  backgroundColor: '#F7F8FF',
                  py: { xs: 1, sm: 1.5 }, // Responsive vertical padding
                  '& .MuiAccordionSummary-content': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: 0,
                    flexDirection: 'row', // Always horizontal (parallel)
                    minHeight: { xs: '36px', sm: '48px' },
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: '12px', sm: '14px', md: '16px' }, // Smaller text on mobile
                    fontWeight: 500,
                    flex: 1, // Take available space
                    paddingRight: 1, // Space between title and button
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', // Keep on one line
                    maxWidth: {
                      xs: 'calc(100% - 60px)',
                      sm: 'calc(100% - 80px)',
                    }, // Leave space for button
                  }}
                >
                  Institutional Admin Details
                </Typography>

                <Button
                  variant="text"
                  size="small"
                  sx={{
                    fontFamily: 'Gilroy',
                    textTransform: 'capitalize',
                    fontSize: { xs: '10px', sm: '12px', md: '14px' }, // Responsive button text
                    px: { xs: 0.5, sm: 1, md: 1.5 }, // Responsive padding
                    py: { xs: 0.25, sm: 0.5 },
                    minWidth: { xs: '45px', sm: '55px', md: '65px' }, // Responsive button width
                    height: { xs: '28px', sm: '32px', md: '36px' }, // Responsive button height
                    color: 'primary.main',
                    flexShrink: 0, // Don't shrink the button
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEditClick(event, '/re-institutional-admin-details');
                  }}
                >
                  Edit
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                <label htmlFor="adminone">Add Admin 1</label>
                <div className="form-row" style={{ marginTop: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="citizenship-adminone">
                      Citizenship<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminOneDetails?.citizenship}
                      placeholder="Select citizenship"
                      onChange={handleChange}
                      disabled
                    ></input>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ckyc-adminone">
                      CKYC Number
                      {isIndianCitizen && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={adminOneDetails?.ckycNumber}
                      placeholder="Enter CKYC Number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="title-adminone">
                      Title<span style={{ color: 'red' }}>*</span>
                    </label>
                    {/* <input type="text" value={adminOneDetails?.title} placeholder='Select citizenship' onChange={handleChange} disabled></input> */}

                    <select
                      name="title"
                      onChange={handleChange}
                      value={adminOneDetails?.title}
                      disabled
                    >
                      <option value="Mr.">Mr</option>
                      <option value="Mrs.">Mrs</option>
                      <option value="Ms">Ms</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="first-adminone">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminOneDetails?.firstName}
                      placeholder="Enter name of institution"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="middle-adminone">Middle Name</label>
                    <input
                      type="text"
                      value={adminOneDetails?.middleName}
                      placeholder="Enter name of institution"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-adminone">Last Name</label>
                    <input
                      type="text"
                      value={adminOneDetails?.lastName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="designation-adminone">
                      Designation<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminOneDetails?.designation}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email-adminone">
                      Email<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminOneDetails?.emailId}
                      placeholder="Enter proprieator name"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender-adminone">
                      Gender<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={adminOneDetails?.gender}
                      onChange={handleChange}
                      defaultValue="Select institution type"
                      disabled
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="countryCode" className="required">
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{ height: '45px' }}
                    >
                      <input
                        className="country-code-dropdown"
                        style={{
                          marginLeft: '-1px',
                          borderColor: 'grey',
                          marginBottom: '2px',
                          borderRadius: '-10px',
                        }}
                        value={adminOneDetails?.countryCode}
                        disabled
                      />
                      <label
                        className="country-name-input"
                        style={{ marginBottom: '19px' }}
                      >
                        {adminOneCountryName}
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile-adminone">
                      Mobile Number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={adminOneDetails?.mobileNo}
                      placeholder="Enter mobile number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="landline-adminone">Landline Number</label>
                    <input
                      type="text"
                      value={adminOneDetails?.landline}
                      placeholder="Enter landline number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="identity-adminone">
                      Proof of Identity<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="citizenship"
                      onChange={handleChange}
                      value={adminOneDetails?.proofOfIdentity}
                      disabled
                    >
                      <option value="">Select proof of identity</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="AADHAAR">Aadhaar</option>
                      <option value="VOTER_ID">Voter ID</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="PAN_CARD">PAN CARD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="number-adminone">
                      Proof of Identity Number
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminOneDetails?.identityNumber}
                      placeholder="Enter proof of identity number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="eployee-adminone">Employee code</label>
                    <input
                      type="text"
                      value={adminOneDetails?.employeeCode}
                      placeholder="Enter proof of identity number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="office-adminone">
                      Office Address
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={
                        adminOneDetails?.sameAsRegisteredAddress
                          ? 'registered'
                          : 'office'
                      }
                      onChange={(e) => {
                        const isSameAsRegistered =
                          e.target.value === 'registered';
                        setChecked(isSameAsRegistered);
                        // Optionally also update nodalOfficerDetails:
                        // setNodalOfficerDetails(prev => ({
                        //   ...prev,
                        //   sameAsRegisteredAddress: isSameAsRegistered
                        // }));
                      }}
                      disabled
                      style={{
                        borderRadius: '2px',
                        height: '50px',
                        width: '100%',
                        marginTop: '1px',
                      }}
                    >
                      <option value="registered">
                        Same as registered address
                      </option>
                      <option value="office">Same as office address</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="letter-adminone"
                      style={{ width: '1000px' }}
                    >
                      Authorization letter by Competent Authority
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="input-with-preview">
                      <div className="custom-file-input-formpreview">
                        <input
                          type="text"
                          placeholder="Enter PAN number"
                          disabled
                          value={adminOneDetails?.authorizationLetterDetails}
                        />

                        {isEditable ? (
                          <img
                            src={uploadIcon} // path to your PNG
                            alt="Upload"
                            style={{
                              width: '24px',
                              height: '24px',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          <div className="upload-icon upload-icon-disabled">
                            <img
                              src={uploadIcon} // path to your PNG
                              alt="Upload"
                              style={{
                                width: '24px',
                                height: '24px',
                                objectFit: 'contain',
                              }}
                            />
                          </div>
                        )}

                        <input
                          id="pan-upload"
                          type="file"
                          name="pan"
                          onChange={handleChange}
                          className="hidden-file-input"
                        />
                      </div>
                      {iauOneAuthorizationLetterDOC?.base64Content && (
                        <div className="preview-box">
                          <img
                            src={`data:image/jpeg;base64,${iauOneAuthorizationLetterDOC.base64Content}`}
                            alt="PAN Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="dob">
                      Date of Authorization
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        id="dob"
                        name="dob"
                        value={adminOneDetails?.dateOfAuthorization}
                        onChange={handleChange}
                        className="custom-date-input"
                        disabled
                      />
                      <div className="calendar-icon-wrapper">
                        <img
                          src={CalendarIcon}
                          alt="calendar"
                          className="calendar-icon"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: '-5px' }}>
                  <div className="form-group">
                    <label htmlFor="proof-adminone">
                      Certified copy of the Proof of the Identity
                      <span style={{ color: 'red' }}>*</span>
                    </label>

                    <input
                      type="file"
                      id="license-upload"
                      name="license"
                      onChange={handleChange}
                      className="hidden-upload"
                    />
                    <div className="input-with-preview">
                      <label
                        htmlFor="license-upload"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload
                        </span>
                      </label>
                      {iauCertifiedDOC?.base64Content && (
                        <div className="preview-box">
                          <img
                            src={`data:image/jpeg;base64,${iauCertifiedDOC.base64Content}`}
                            alt="PAN Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="identitycard-adminone">
                      Certified copy of Photo Identity Card
                      <span style={{ color: 'red' }}>*</span>
                    </label>

                    <input
                      type="file"
                      id="license-upload"
                      name="license"
                      onChange={handleChange}
                      className="hidden-upload"
                    />
                    <div className="input-with-preview">
                      <label
                        htmlFor="license-upload"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload
                        </span>
                      </label>
                      {iauCertifiedPhotoDOC?.base64Content && (
                        <div className="preview-box">
                          <img
                            src={`data:image/jpeg;base64,${iauCertifiedPhotoDOC.base64Content}`}
                            alt="PAN Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group"></div>
                </div>
                <label htmlFor="admintwo">Add Admin 2</label>
                <div className="form-row" style={{ marginTop: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="citizenship-admintwo">
                      Citizenship<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminTwoDetails?.citizenship}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ckyc-admintwo">
                      CKYC Number
                      {isIndianCitizen && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={adminTwoDetails?.ckycNumber}
                      placeholder="Enter CKYC Number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="title-admintwo">
                      Title<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="title"
                      onChange={handleChange}
                      value={adminTwoDetails?.title}
                      defaultValue="Select citizenship"
                      disabled
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms">Ms</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="first-admintwo">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminTwoDetails?.firstName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="middle-admintwo">Middle Name</label>
                    <input
                      type="text"
                      value={adminTwoDetails?.middleName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-admintwo">Last Name</label>
                    <input
                      type="text"
                      value={adminTwoDetails?.lastName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="designation-admintwo">
                      Designation<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminTwoDetails?.designation}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email-admintwo">
                      Email<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminTwoDetails?.emailId}
                      placeholder="Enter proprieator name"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender-admintwo">
                      Gender<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={adminTwoDetails?.gender}
                      onChange={handleChange}
                      defaultValue="Select institution type"
                      disabled
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="countryCode" className="required">
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{ height: '45px' }}
                    >
                      <input
                        className="country-code-dropdown"
                        style={{
                          marginLeft: '-1px',
                          borderColor: 'grey',
                          marginBottom: '2px',
                          borderRadius: '-10px',
                        }}
                        value={adminTwoDetails?.countryCode}
                        disabled
                      />
                      <label
                        className="country-name-input"
                        style={{ marginBottom: '19px' }}
                      >
                        {adminTwoDetailsCountryName}
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile-admintwo">
                      Mobile Number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={adminTwoDetails?.mobileNo}
                      placeholder="Enter mobile number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="landline-admintwo">Landline Number</label>
                    <input
                      type="text"
                      value={adminTwoDetails?.landline}
                      placeholder="Enter landline number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="identity-admintwo">
                      Proof of Identity<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="citizenship"
                      onChange={handleChange}
                      value={adminTwoDetails?.proofOfIdentity}
                      disabled
                    >
                      <option value="">Select proof of identity</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="AADHAAR">Aadhaar</option>
                      <option value="VOTER_ID">Voter ID</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="PAN_CARD">PAN CARD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="identitynumber-admintwo">
                      Proof of Identity Number
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminTwoDetails?.identityNumber}
                      placeholder="Enter proof of identity number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="employee-admintwo">Employee code</label>
                    <input
                      type="text"
                      value={adminTwoDetails?.employeeCode}
                      placeholder="Enter proof of identity number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="office-admintwo">
                      Office Address
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={
                        adminTwoDetails?.sameAsRegisteredAddress
                          ? 'registered'
                          : 'office'
                      }
                      onChange={(e) => {
                        const isSameAsRegistered =
                          e.target.value === 'registered';
                        setChecked(isSameAsRegistered);
                        // Optionally also update nodalOfficerDetails:
                        // setNodalOfficerDetails(prev => ({
                        //   ...prev,
                        //   sameAsRegisteredAddress: isSameAsRegistered
                        // }));
                      }}
                      disabled
                      style={{
                        borderRadius: '2px',
                        height: '45px',
                        width: '100%',
                      }}
                    >
                      <option value="registered">
                        Same as registered address
                      </option>
                      <option value="office">
                        Same as correspondence address
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="letter-admintwo"
                      style={{ width: '1500px' }}
                    >
                      Authorization letter by Competent Authority
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="input-with-preview">
                      <div className="custom-file-input-formpreview">
                        <input
                          type="text"
                          placeholder="Enter Authorization letter by Competent Authority"
                          disabled
                          value={adminTwoDetails?.authorizationLetterDetails}
                        />
                        {isEditable ? (
                          <img
                            src={uploadIcon} // path to your PNG
                            alt="Upload"
                            style={{
                              width: '24px',
                              height: '24px',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          <div className="upload-icon upload-icon-disabled">
                            <img
                              src={uploadIcon} // path to your PNG
                              alt="Upload"
                              style={{
                                width: '24px',
                                height: '24px',
                                objectFit: 'contain',
                              }}
                            />
                          </div>
                        )}

                        <input
                          id="pan-upload"
                          type="file"
                          name="pan"
                          onChange={handleChange}
                          className="hidden-file-input"
                        />
                      </div>
                      {iauTwoAuthorizationLetterDOC?.base64Content && (
                        <div className="preview-box">
                          <img
                            src={`data:image/jpeg;base64,${iauTwoAuthorizationLetterDOC.base64Content}`}
                            alt="PAN Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="dob">
                      Date of Authorization
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        id="dob"
                        value={adminTwoDetails?.dateOfAuthorization}
                        onChange={handleChange}
                        className="custom-date-input"
                        disabled
                      />
                      <div className="calendar-icon-wrapper">
                        <img
                          src={CalendarIcon}
                          alt="calendar"
                          className="calendar-icon"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="certified-admintwo">
                      Certified copy of the Proof of the Identity
                      <span style={{ color: 'red' }}>*</span>
                    </label>

                    <input
                      type="file"
                      id="license-upload"
                      name="license"
                      onChange={handleChange}
                      className="hidden-upload"
                    />
                    <div className="input-with-preview">
                      <label
                        htmlFor="license-upload"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload
                        </span>
                      </label>
                      {iauOneCertifiedDOC?.base64Content && (
                        <div className="preview-box">
                          <img
                            src={`data:image/jpeg;base64,${iauOneCertifiedDOC.base64Content}`}
                            alt="PAN Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="photo-admintwo">
                      Certified copy of Photo Identity Card
                      <span style={{ color: 'red' }}>*</span>
                    </label>

                    <input
                      type="file"
                      id="license-upload"
                      name="license"
                      onChange={handleChange}
                      className="hidden-upload"
                    />
                    <div className="input-with-preview">
                      <label
                        htmlFor="license-upload"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <img
                          src={UploadIconButton} // path to your PNG
                          alt="Upload"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload
                        </span>
                      </label>
                      {iauOneCertifiedPhotoDOC?.base64Content && (
                        <div className="preview-box">
                          <img
                            src={`data:image/jpeg;base64,${iauOneCertifiedPhotoDOC.base64Content}`}
                            alt="PAN Preview"
                            className="preview-img"
                          />
                          <span className="tick-icon">
                            <CheckCircleIcon />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group"></div>
                </div>
              </AccordionDetails>
            </Accordion>
            <div className="form-footer">
              <button
                type="submit"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isViewOnlyformPreview}
                style={{
                  backgroundColor: isViewOnlyformPreview
                    ? '#CCCCCC'
                    : '#002CBA',
                  color: 'white',
                  cursor: isViewOnlyformPreview ? 'not-allowed' : 'pointer',
                  fontFamily: 'Gilroy',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                }}
              >
                Save & Next
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* {showPdf && pdfData && (
        <div style={{ marginTop: '20px' }}>
          <PdfViewer base64={pdfData} />
        </div>
      )} */}

      {pdfData && applicationId !== undefined && (
        <PdfPreviewModal
          open={showViewer}
          onClose={() => setShowViewer(false)}
          base64Pdf={pdfData}
          onESign={handleESign}
          isESigned={isESigned}
          applicationId={applicationId} // <-- ensure this comes from props or state
        />
      )}
    </>
  );
};

export default FormPreview;
