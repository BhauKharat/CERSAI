/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { ReactComponent as CKYCRRLogo } from '../../../assets/ckycrr_sign_up_logo.svg';
//import './registrationPage.css';
// import br from '../../assets/ckycrr_sign_up_logo.svg';
// import logo from '../../assets/ckycrr_sign_up_logo.svg'
// import upload from '../../assets/upload.svg'
import CalendarIcon from '../../../assets/Icon.svg';
import KeyboardControlKeyRoundedIcon from '@mui/icons-material/KeyboardControlKeyRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SuccessModal from '../SuccessModalOkay/successModal';
import {
  Typography,
  FormGroup,
  Container,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import DocumentSummary from '../DocumentSummary/documentSummary';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// import Typography from '@mui/material/Typography';
import '../EntityForm/registrationPage.css';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { fetchCountryCodes } from '../../../utils/countryUtils';
import ApplicationStepper from '../../../component/stepper/ApplicationStepper';
import { CONSTITUTION_OPTIONS } from '../EntityForm/registrationPage';

//import '../institutionAdminDetails/institutuionAdminDetails.css'

// Form steps (you can name them accordingly)

const TrackStatus = () => {
  interface FormDataType {
    pan?: File;
    panPreview?: string;
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
    [key: string]: unknown; // This allows for flexible types for other properties
  }
  const [, setFormData] = useState<FormDataType>({
    registeredAddress: {},
    correspondenceAddress: {},
  });

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('register');
  const [isSuccessAdminModalOpen, setSuccessAdminModalOpen] = useState(false);

  const getConstitutionLabel = (value: string) => {
    return (
      CONSTITUTION_OPTIONS.find((option) => option.value === value)?.label ||
      value
    );
  };

  const documents = useSelector(
    (state: RootState) => state.applicationPreview.documents
  );
  const registrationDoc = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'REGISTRATION_CERTIFICATE'
  );
  const regulatorDOC = documents?.find(
    (doc: { documentType: string }) => doc.documentType === 'REGULATOR_LICENCE'
  );
  const addressDOC = documents?.find(
    (doc: { documentType: string }) => doc.documentType === 'ADDRESS_PROOF'
  );
  const otherDOC = documents?.find(
    (doc: { documentType: string }) => doc.documentType === 'RE_OTHER_FILE'
  );
  const boardDOC = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'NO_BOARD_RESOLUTION'
  );
  const certifiedDOC = documents?.find(
    (doc: { documentType: string }) => doc.documentType === 'NO_CERTIFIED_POI'
  );
  const photoDOC = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'NO_CERTIFIED_PHOTO_IDENTITY'
  );
  const iauCertifiedDOC = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'IAU_ONE_CERTIFIED_POI'
  );
  const iauCertifiedPhotoDOC = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'IAU_ONE_CERTIFIED_PHOTO_IDENTITY'
  );
  const iauOneCertifiedDOC = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'IAU_TWO_CERTIFIED_POI'
  );
  const iauOneCertifiedPhotoDOC = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'IAU_TWO_CERTIFIED_PHOTO_IDENTITY'
  );
  const iauOneAuthorizationLetterDOC = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'IAU_ONE_AUTHORIZATION_LETTER'
  );
  const iauTwoAuthorizationLetterDOC = documents?.find(
    (doc: { documentType: string }) =>
      doc.documentType === 'IAU_TWO_AUTHORIZATION_LETTER'
  );
  const panDOC = documents?.find(
    (doc: { documentType: string }) => doc.documentType === 'RE_PAN'
  );
  const cinDOC = documents?.find(
    (doc: { documentType: string }) => doc.documentType === 'RE_CIN'
  );

  const entityDetails = useSelector(
    (state: RootState) => state.applicationPreview.entityDetails
  );
  const correspondenceAddressSameAsRegisteredAddress = useSelector(
    (state: RootState) =>
      state.applicationPreview.correspondenceAddressSameAsRegisteredAddress
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

  const handleBack = () => {
    navigate('/form-preview');
  };
  const handleOkay = () => {
    setSuccessAdminModalOpen(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  function setChecked(isSameAsRegistered: boolean) {
    throw new Error('Function not implemented.' + isSameAsRegistered);
  }

  return (
    <>
      <div className="signup-container">
        <div className="signup-card">
          <div className="logo-container">
            <button
              onClick={handleBack}
              style={{
                position: 'absolute',
                left: '130px',
                fontFamily: 'Gilroy',
                border: 'none',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '4px', // small gap between icon and text
                fontSize: '16px', // match icon size to text size
                cursor: 'pointer',
              }}
            >
              <ArrowBackIosIcon
                sx={{ fontSize: '16px', verticalAlign: 'middle' }}
              />
              Back
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
          {/* {isOTPAdminModalOpen && (
  <OTPModal isOpen={isOTPAdminModalOpen}
  onClose={() => setOTPAdminModalOpen(false)}
  onOtpSubmit={(otp) => {
    // handle OTP submission
    console.log("Submitted OTP:", otp);
    setOTPAdminModalOpen(false); // Close OTP modal
    setSuccessAdminModalOpen(true); // Open success modal
  }} />
)} */}
          <SuccessModal
            isOpen={isSuccessAdminModalOpen}
            onClose={() => setSuccessAdminModalOpen(false)}
            onOkay={handleOkay}
            title="Details Verified Successfully!"
            message="The Head of Institution's details have been verified successfully"
          />{' '}
          <div className="step-indicator">Track Status</div>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <DocumentSummary />
          </Container>
          <div
            className="step-indicator"
            style={{ marginTop: '25px', marginBottom: '-5px' }}
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
              </AccordionSummary>
              <AccordionDetails>
                {entityDetails && (
                  <>
                    <div className="form-row" style={{ marginTop: '15px' }}>
                      <div className="form-group">
                        <label htmlFor="name-of-institution">
                          Name Of Institution
                        </label>
                        <input
                          id="name-of-institution"
                          type="text"
                          value={entityDetails.nameOfInstitution}
                          disabled
                          placeholder="Enter name of institution"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="regulator">Regulator</label>
                        <input
                          id="regulator"
                          type="text"
                          value={entityDetails.regulator}
                          disabled
                          placeholder="Enter name of institution"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="institution-type">
                          Institution Type
                        </label>
                        <input
                          id="institution-type"
                          type="text"
                          value={entityDetails.institutionType}
                          placeholder="Enter name of institution"
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="constitution">
                          Constitution <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="constitution"
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
                        <label htmlFor="proprietor-name">
                          Proprietor Name<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="proprietor-name"
                          value={entityDetails.proprietorName}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="registration-number">
                          Registration Number
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="registration-number"
                          value={entityDetails.registrationNo}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="pan-number">
                          PAN<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div className="input-with-preview">
                          <div
                            className="custom-file-input"
                            style={{ height: '48px' }}
                          >
                            <input
                              id="pan-number"
                              type="text"
                              value={entityDetails.panNo}
                              disabled
                              style={{ width: '100%' }}
                            />

                            <div className="upload-icon upload-icon-disabled">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 
    17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 
    21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 
    2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 
    8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 
    10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 
    22 9.34784 22 12Z"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 15.5L12 9.5"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M15 11.5L12 8.5L9 11.5"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

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
                        <label htmlFor="cin-number">
                          CIN<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div className="input-with-preview">
                          <div
                            className="custom-file-input"
                            style={{ height: '48px' }}
                          >
                            <input
                              id="cin-number"
                              type="text"
                              value={entityDetails.cinNo}
                              disabled
                              style={{ width: '100%' }}
                            />

                            <div className="upload-icon upload-icon-disabled">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 
        17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 
        21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 
        2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 
        8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 
        10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 
        22 9.34784 22 12Z"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 15.5L12 9.5"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M15 11.5L12 8.5L9 11.5"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

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
                        <label htmlFor="llpin-number">
                          LLPIN<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="llpin-number"
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
                        <label htmlFor="gstin-number">
                          GSTIN No.<span style={{ color: 'red' }}>*</span>
                        </label>

                        <input
                          id="gstin-number"
                          type="text"
                          placeholder="Enter PAN number"
                          value={entityDetails.gstinNo}
                          disabled
                          //   onChange={handlePanChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="re-website">
                          RE Website<span style={{ color: 'red' }}>*</span>
                        </label>

                        <input
                          id="re-website"
                          type="text"
                          placeholder="Enter RWebsite"
                          value={entityDetails.reWebsite}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="regulator-license">
                          Regulator License/Certificate/Notification
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="file"
                          id="regulator-license"
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
                            <svg
                              style={{ marginLeft: '60px' }}
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 15.5L12 9.5"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M15 11.5L12 8.5L9 11.5"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span
                              style={{
                                fontSize: '13px',
                                marginLeft: '2px',
                                display: 'inline-block',
                                transform:
                                  'translateY(4px)' /* Fine-tune as needed */,
                              }}
                            >
                              Upload Document
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
                        <label htmlFor="registration-certificate">
                          Registration Certificate
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          type="file"
                          id="registration-certificate"
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
                            <svg
                              style={{ marginLeft: '60px' }}
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 15.5L12 9.5"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M15 11.5L12 8.5L9 11.5"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span
                              style={{
                                fontSize: '13px',
                                marginLeft: '2px',
                                display: 'inline-block',
                                transform:
                                  'translateY(4px)' /* Fine-tune as needed */,
                              }}
                            >
                              Upload Document
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
                        <label htmlFor="address-proof">
                          Address Proof<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="address-proof"
                          type="file"
                          disabled
                          className="hidden-upload"
                        />
                        <div className="input-with-preview">
                          <label
                            htmlFor="license-upload"
                            className="upload-doc-btn"
                            style={{ cursor: 'not-allowed' }}
                          >
                            <svg
                              style={{ marginLeft: '60px' }}
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 15.5L12 9.5"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M15 11.5L12 8.5L9 11.5"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span
                              style={{
                                fontSize: '13px',
                                marginLeft: '2px',
                                display: 'inline-block',
                                transform:
                                  'translateY(4px)' /* Fine-tune as needed */,
                              }}
                            >
                              Upload Document
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
                        <label htmlFor="other-doc">
                          Other<span style={{ color: 'red' }}>*</span>
                        </label>

                        <input
                          id="other-doc"
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
                            <svg
                              style={{ marginLeft: '40px' }}
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 15.5L12 9.5"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M15 11.5L12 8.5L9 11.5"
                                stroke="#002CBA"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span
                              style={{
                                fontSize: '13px',
                                marginLeft: '2px',
                                display: 'inline-block',
                                transform:
                                  'translateY(4px)' /* Fine-tune as needed */,
                              }}
                            >
                              Upload Document
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
              </AccordionSummary>
              <AccordionDetails>
                {registeredAddress && (
                  <>
                    <label htmlFor="register-address">Registered Address</label>
                    <div className="form-row" style={{ marginTop: '15px' }}>
                      <div className="form-group">
                        <label htmlFor="address-line-1-registered">
                          Address Line 1<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="address-line-1-registered"
                          type="text"
                          placeholder="Add address here"
                          value={registeredAddress.line1}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="address-line-2-registered">
                          Address Line 2
                        </label>
                        <input
                          id="address-line-2-registered"
                          type="text"
                          value={registeredAddress.line2}
                          placeholder="Add adress here"
                          disabled

                          // }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="address-line-3-registered">
                          Address Line 3
                        </label>
                        <input
                          id="address-line-3-registered"
                          type="text"
                          value={registeredAddress.line3}
                          placeholder="Add adress here"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label
                          htmlFor="registered-country-code"
                          className="required"
                        >
                          Country Code<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div
                          className="country-code-wrapper"
                          style={{ height: '45px' }}
                        >
                          <input
                            id="registered-country-code"
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
                            htmlFor="registered-country-code"
                            className="country-name-input"
                            style={{ marginBottom: '19px' }}
                          >
                            {registeredAddressCountryName}
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="state-correspondence">
                          State<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="state-correspondence"
                          value={correspondenceAddress?.state}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="district-registered">
                          District<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="district-registered"
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
                        <label
                          htmlFor="city-town-registered"
                          className="required"
                        >
                          City/ town<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="city-town-registered"
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
                        <label htmlFor="pin-code-registered">
                          Pin Code<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="pin-code-registered"
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
                        <label htmlFor="alternate-pin-code-registered">
                          Pin Code (in case of Others
                          <span style={{ color: 'red' }}>*</span>)
                        </label>
                        <input
                          id="alternate-pin-code-registered"
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
                        marginLeft: '470px',
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
                    <label htmlFor="correspondence-address">
                      Correspondence Adress
                    </label>
                    <div className="form-row" style={{ marginTop: '15px' }}>
                      <div className="form-group">
                        <label htmlFor="address-line-1-correspondence">
                          Address Line 1<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="address-line-1-correspondence"
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
                        <label htmlFor="address-line-2-correspondence">
                          Address Line 2
                        </label>
                        <input
                          id="address-line-2-correspondence"
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
                        <label htmlFor="address-line-3-correspondence">
                          Address Line 3
                        </label>
                        <input
                          id="address-line-3-correspondence"
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
                        <label
                          htmlFor="correspondence-country-code"
                          className="required"
                        >
                          Country Code<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div
                          className="country-code-wrapper"
                          style={{ height: '45px' }}
                        >
                          <input
                            id="correspondence-country-code"
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
                            htmlFor="correspondence-country-code"
                            className="country-name-input"
                            style={{ marginBottom: '19px' }}
                          >
                            {corresspondenceAddressCountryName}
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="state-registered">
                          State<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="state-registered"
                          value={registeredAddress?.state || ''}
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="district-correspondence">
                          District<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="district-correspondence"
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
                        <label
                          htmlFor="city-town-correspondence"
                          className="required"
                        >
                          City/ town<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="city-town-correspondence"
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
                        <label htmlFor="pin-code-correspondence">
                          Pin Code<span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="pin-code-correspondence"
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
                        <label htmlFor="alternate-pin-code-correspondence">
                          Pin Code (in case of Others)
                          <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                          id="alternate-pin-code-correspondence"
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
                <Typography component="span" style={{ marginRight: '100px' }}>
                  Head of institution Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="form-row" style={{ marginTop: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="citizenship-head">
                      Citizenship<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      id="citizenship-head"
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
                    <label htmlFor="ckyc-number-head">
                      CKYC number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="ckyc-number-head"
                      type="text"
                      name="ckycnum"
                      placeholder="Enter CKYC number"
                      value={headOfInstitutionDetails?.ckycNumber || ''}
                      disabled
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="title-head">
                      Title<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      id="title-head"
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
                    <label htmlFor="first-name-head">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="first-name-head"
                      type="text"
                      name="firstName"
                      placeholder="Enter First Name"
                      value={headOfInstitutionDetails?.firstName || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="middle-name-head">Middle Name</label>
                    <input
                      id="middle-name-head"
                      type="text"
                      name="middleName"
                      placeholder="Enter middle name"
                      value={headOfInstitutionDetails?.middleName || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="last-name-head">Last Name</label>
                    <input
                      id="last-name-head"
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
                    <label htmlFor="designation-head">
                      Designation<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="designation-head"
                      type="text"
                      name="designation"
                      placeholder="Enter Designation"
                      value={headOfInstitutionDetails?.designation || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email-head">
                      Email<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="email-head"
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
                    <label htmlFor="gender-head">
                      Gender<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      id="gender-head"
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
                    <label htmlFor="countryCode-head" className="required">
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{ height: '45px' }}
                    >
                      <input
                        id="countryCode-head"
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
                        htmlFor="countryCode-head"
                        className="country-name-input"
                        style={{ marginBottom: '19px' }}
                      >
                        {headOfInstitutionDetailsCountryName}
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile-number-head">
                      Mobile Number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="mobile-number-head"
                      type="number"
                      name="mobileNo"
                      placeholder="Enter mobile number"
                      value={headOfInstitutionDetails?.mobileNo || ''}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="landline-number-head">
                      Landline Number
                    </label>
                    <input
                      id="landline-number-head"
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
              </AccordionSummary>
              <AccordionDetails>
                <div className="form-row" style={{ marginTop: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="citizenship-nodal">
                      Citizenship<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="citizenship-nodal"
                      value={nodalOfficerDetails?.citizenship}
                      placeholder="Enter Citizenship"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ckyc-number-nodal">
                      CKYC number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="ckyc-number-nodal"
                      type="text"
                      value={nodalOfficerDetails?.ckycNo}
                      placeholder="Enter Ckyc No"
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
                      id="title-nodal"
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
                    <label htmlFor="first-name-nodal">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="first-name-nodal"
                      type="text"
                      value={nodalOfficerDetails?.firstName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="middle-name-nodal">Middle Name</label>
                    <input
                      id="middle-name-nodal"
                      type="text"
                      value={nodalOfficerDetails?.middleName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-name-nodal">Last Name</label>
                    <input
                      id="last-name-nodal"
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
                      id="designation-nodal"
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
                      id="email-nodal"
                      type="text"
                      value={nodalOfficerDetails?.email}
                      placeholder="Enter proprieator name"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    {/* <input value={nodalOfficerDetails?.gender} placeholder='Select Gender' disabled /> */}
                    <label htmlFor="gender-nodal">
                      Gender<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      id="gender-nodal"
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
                    <label htmlFor="countryCode-nodal" className="required">
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{ height: '45px' }}
                    >
                      <input
                        id="countryCode-nodal"
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
                        htmlFor="countryCode-nodal"
                        className="country-name-input"
                        style={{ marginBottom: '19px' }}
                      >
                        {nodalOfficerDetailsCountryName}
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile-number-nodal">
                      Mobile Number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="mobile-number-nodal"
                      type="number"
                      value={nodalOfficerDetails?.mobileNumber}
                      placeholder="Enter mobile number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="landline-number-nodal">
                      Landline Number
                    </label>
                    <input
                      id="landline-number-nodal"
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
                    <label htmlFor="proof-of-identity-nodal">
                      Proof of Identity<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="proof-of-identity-nodal"
                      value={nodalOfficerDetails?.proofOfIdentity}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="proof-of-identity-number-nodal">
                      Proof of Identity Number
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="proof-of-identity-number-nodal"
                      type="number"
                      value={nodalOfficerDetails?.identityNumber}
                      placeholder="Enter proof of identity number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dob-nodal">
                      Date of Birth<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        id="dob-nodal"
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
                    <label htmlFor="office-address-nodal">Office Address</label>

                    <FormGroup>
                      <FormControl fullWidth>
                        <Select
                          id="office-address-nodal"
                          labelId="address-select-label"
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
                          disabled // 👈 disables the select but keeps the structure
                          sx={{ borderRadius: '6px', height: '45px' }}
                        >
                          <MenuItem
                            value="registered"
                            style={{ fontFamily: 'inherit' }}
                          >
                            Same as registered address
                          </MenuItem>
                          <MenuItem
                            value="office"
                            style={{ fontFamily: 'inherit' }}
                          >
                            Same as Correspondence address
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </FormGroup>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dob-board-resolution">
                      Date of Board Resolution for Appointment
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        id="dob-board-resolution"
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
                    <label htmlFor="board-resolution-nodal">
                      Board Resolution<span style={{ color: 'red' }}>*</span>
                    </label>
                    {/* <input type="number" name="proofidentitynumber" placeholder='Enter proof of identity number' onChange={handleChange} /> */}
                    <div className="input-with-preview">
                      <label
                        htmlFor="board-resolution-nodal"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <svg
                          style={{ marginLeft: '45px' }}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15.5L12 9.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 11.5L12 8.5L9 11.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload Document
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

                <div className="form-row">
                  <div className="form-group">
                    <label
                      htmlFor="certified-copy-poi-nodal"
                      style={{ font: 'small-caption' }}
                    >
                      Certified copy of proof of Identity
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    {/* <input type="number" name="proofidentitynumber" placeholder='Enter proof of identity number' onChange={handleChange} /> */}
                    <div className="input-with-preview">
                      <label
                        htmlFor="certified-copy-poi-nodal"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <svg
                          style={{ marginLeft: '45px' }}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15.5L12 9.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 11.5L12 8.5L9 11.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload Document
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
                      htmlFor="certified-copy-photo-id-nodal"
                      style={{ font: 'small-caption' }}
                    >
                      Certified copy of photo Identity Card
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    {/* <input type="number" name="proofidentitynumber" placeholder='Enter proof of identity number' onChange={handleChange} /> */}
                    <div className="input-with-preview">
                      <label
                        htmlFor="certified-copy-photo-id-nodal"
                        className="upload-doc-btn"
                        style={{ cursor: 'not-allowed' }}
                      >
                        <svg
                          style={{ marginLeft: '45px' }}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15.5L12 9.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 11.5L12 8.5L9 11.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload Document
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
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: '#F7F8FF' }}
              >
                <Typography component="span">
                  Institutional Admin User Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <label htmlFor="Add-Admin">Add Admin 1</label>
                <div className="form-row" style={{ marginTop: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="Citizenship-doc">
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
                    <label htmlFor="ckyc-number">
                      CKYC number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminOneDetails?.ckycNumber}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="title">
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="admin-one-first-name">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="admin-one-first-name"
                      type="text"
                      value={adminOneDetails?.firstName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="admin-one-middle-name">Middle Name</label>
                    <input
                      id="admin-one-middle-name"
                      type="text"
                      value={adminOneDetails?.middleName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="admin-one-last-name">Last Name</label>
                    <input
                      id="admin-one-last-name"
                      type="text"
                      value={adminOneDetails?.lastName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="admin-one-designation">
                      Designation<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="admin-one-designation"
                      type="text"
                      value={adminOneDetails?.designation}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-one-email">
                      Email<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="admin-one-email"
                      type="text"
                      value={adminOneDetails?.email}
                      placeholder="Enter proprieator name"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-one-gender">
                      Gender<span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      id="admin-one-gender"
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

                <div className="form-row">
                  <div className="form-group">
                    <label
                      htmlFor="admin-one-country-code"
                      className="required"
                    >
                      Country Code<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div
                      className="country-code-wrapper"
                      style={{ height: '45px' }}
                    >
                      <input
                        id="admin-one-country-code"
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
                        htmlFor="admin-one-country-code"
                        className="country-name-input"
                        style={{ marginBottom: '19px' }}
                      >
                        {adminOneCountryName}
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="admin-one-mobile-number">
                      Mobile Number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="admin-one-mobile-number"
                      type="number"
                      value={adminOneDetails?.mobileNumber}
                      placeholder="Enter mobile number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="admin-one-landline-number">
                      Landline Number
                    </label>
                    <input
                      id="admin-one-landline-number"
                      type="text"
                      value={adminOneDetails?.landline}
                      placeholder="Enter landline number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: '-15px' }}>
                  <div className="form-group">
                    <label htmlFor="admin-one-poi">
                      Proof of Identity<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="admin-one-poi"
                      value={adminOneDetails?.proofOfIdentity}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="admin-one-poi-number">
                      Proof of Identity Number
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      id="admin-one-poi-number"
                      type="number"
                      value={adminOneDetails?.identityNumber}
                      placeholder="Enter proof of identity number"
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-one-dob">
                      Date of Birth<span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        id="admin-one-dob"
                        value={adminOneDetails?.dateOfBirth}
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
                <div className="form-row" style={{ marginBottom: '5px' }}>
                  <div className="form-group">
                    <label htmlFor="admin-one-office-address">
                      Office Address
                    </label>

                    <FormGroup>
                      <FormControl fullWidth>
                        <Select
                          id="admin-one-office-address"
                          labelId="address-select-label"
                          value={
                            adminOneDetails?.sameAsRegisteredAddress
                              ? 'registered'
                              : 'office'
                          }
                          onChange={(e) => {
                            const isSameAsRegistered =
                              e.target.value === 'registered';
                            setChecked(isSameAsRegistered);
                            // Optionally also update adminOneDetails:
                            // setadminOneDetails(prev => ({
                            //   ...prev,
                            //   sameAsRegisteredAddress: isSameAsRegistered
                            // }));
                          }}
                          disabled // 👈 disables the select but keeps the structure
                          sx={{ borderRadius: '6px', height: '45px' }}
                        >
                          <MenuItem
                            value="registered"
                            style={{ fontFamily: 'inherit' }}
                          >
                            Same as registered address
                          </MenuItem>
                          <MenuItem
                            value="office"
                            style={{ fontFamily: 'inherit' }}
                          >
                            Same as Correspondence address
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </FormGroup>
                  </div>

                  <div className="form-group">
                    <label style={{ width: '1000px' }}>
                      Authorization letter by Competent Authority
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="input-with-preview">
                      <div className="custom-file-input">
                        <input
                          type="text"
                          placeholder="Enter PAN number"
                          disabled
                          value={adminOneDetails?.authorizationLetterDetails}
                        />

                        <div className="upload-icon upload-icon-disabled">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 
    17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 
    21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 
    2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 
    8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 
    10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 
    22 9.34784 22 12Z"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15.5L12 9.5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15 11.5L12 8.5L9 11.5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

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
                    <label htmlFor="Certificate">
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
                        <svg
                          style={{ marginLeft: '45px' }}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15.5L12 9.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 11.5L12 8.5L9 11.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload Document
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
                    <label htmlFor="certificate-copy">
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
                        <svg
                          style={{ marginLeft: '45px' }}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15.5L12 9.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 11.5L12 8.5L9 11.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload Document
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
                <label htmlFor="add-admin2">Add Admin 2</label>
                <div className="form-row" style={{ marginTop: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="Citizenship">
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
                    <label htmlFor="ckyc-number">
                      CKYC number<span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={adminTwoDetails?.ckycNumber}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="title">
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
                    <label htmlFor="first-name">
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
                    <label htmlFor="middle-name">Middle Name</label>
                    <input
                      type="text"
                      value={adminTwoDetails?.middleName}
                      placeholder="Enter name of institution"
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last-name">Last Name</label>
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
                    <label htmlFor="designation">
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
                    <label htmlFor="email">
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
                    <label htmlFor="gender">
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
                    <label htmlFor="mobileNumber">
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
                    <label htmlFor="landline">Landline Number</label>
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
                    <label htmlFor="proof">
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
                    <label htmlFor="identityNumber">
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
                    <label htmlFor="employeeCode">Employee code</label>
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
                    <label htmlFor="sameAsRegisteredAddress">
                      Office Address
                    </label>

                    <FormControl fullWidth>
                      <Select
                        labelId="address-select-label"
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
                        disabled // 👈 disables the select but keeps the structure
                        sx={{ borderRadius: '10px', height: '45px' }}
                      >
                        <MenuItem value="registered">
                          Same as registered address
                        </MenuItem>
                        <MenuItem value="office">
                          Same as correspondence address
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <div className="form-group">
                    <label style={{ width: '1500px' }}>
                      Authorization letter by Competent Authority
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div className="input-with-preview">
                      <div className="custom-file-input">
                        <input
                          type="text"
                          placeholder="Enter Authorization letter by Competent Authority"
                          disabled
                          value={adminTwoDetails?.authorizationLetterDetails}
                        />

                        <div className="upload-icon upload-icon-disabled">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 
     17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 
     21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 
     2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 
     8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 
     10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 
     22 9.34784 22 12Z"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15.5L12 9.5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15 11.5L12 8.5L9 11.5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

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
                    <label htmlFor="license-copy">
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
                        <svg
                          style={{ marginLeft: '45px' }}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15.5L12 9.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 11.5L12 8.5L9 11.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload Document
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
                    <label htmlFor="certificate-copy">
                      Certified copy of Photo Identity Card{' '}
                      {/* Label for certificate-copy */}
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
                        <svg
                          style={{ marginLeft: '45px' }}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8079C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17317C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 15.5L12 9.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 11.5L12 8.5L9 11.5"
                            stroke="#002CBA"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          style={{
                            fontSize: '13px',
                            marginLeft: '2px',
                            display: 'inline-block',
                            transform:
                              'translateY(4px)' /* Fine-tune as needed */,
                          }}
                        >
                          Upload Document
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
            <div className="form-footer"></div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TrackStatus;
