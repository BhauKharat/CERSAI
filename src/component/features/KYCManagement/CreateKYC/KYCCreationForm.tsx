import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { ChangeEvent, useState } from 'react';
import { IAccountType } from '../KYC.types';
import KYCCreationStepper from '../../../../component/stepper/KYCCreationStepper';
import DemographicDetailCreateKyc from './createSteps/DemographicDetailCreateKyc';
import ProofOfIdentityCreateKyc from './createSteps/ProofOfIdentityCreateKyc';
import AddressDetailCreateKyc from './createSteps/AddressDetailCreateKyc';
import ContactDetailsCreateKyc from './createSteps/ContactDetailsCreateKyc';
import NodalOfficerDetailCreateKyc from './createSteps/NodalOfficerDetailCreateKyc';
import AttestationDetailCreationKyc from './createSteps/AttestationDetailCreationKyc';
import PreviewCreateKyc from './createSteps/PreviewCreateKyc';
import {
  IAddressDetail,
  IAttestationDetail,
  IContactDetails,
  ICreateKyc,
  IDemographicDetail,
  INodalOfficerDetail,
  IProofOfIdentity,
} from './interfaceCreateKyc';
import MessageModalProps from '../../../Modal/featuresModals/MessageModal';

const STEPS = [
  'Demographic Details',
  'Proof of Identity and Address',
  'Address Details',
  'Contact Details',
  'Related Party Details',
  'Other & Attestation Details',
  'Preview',
];

const KYCCreationForm = () => {
  const [accountType, setAccountType] = useState<IAccountType | null>();
  const handleEntityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountType(e.target.value as IAccountType);
  };
  const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [creationDetails, setCreationDetails] = useState<ICreateKyc>({
    DemographicDetailForm: undefined,
    ProofOfIdentityForm: undefined,
    AddressDetailForm: undefined,
    ContactDetailsForm: undefined,
    NodalOfficerDetailForm: undefined,
    AttestationDetailForm: undefined,
  });

  const handleModalClose = () => {
    setSuccessModalOpen(false);
  };

  const handleFormUpdate = (
    details:
      | IDemographicDetail
      | IProofOfIdentity
      | IAddressDetail
      | IContactDetails
      | INodalOfficerDetail
      | IAttestationDetail
      | undefined,
    name: string
  ) => {
    setCreationDetails({ ...creationDetails, [name]: details });
    handleSubmit(currentStep);
  };

  const handleFormSubmit = () => {
    console.log(creationDetails);
    setSuccessModalOpen(true);
  };

  const handleEdit = (index: number) => {
    setCurrentStep(index);
  };

  const stepComponents = [
    <DemographicDetailCreateKyc
      demographicDetailForm={creationDetails.DemographicDetailForm}
      setDemographicDetailForm={handleFormUpdate}
      key={0}
    />,
    <ProofOfIdentityCreateKyc
      ProofOfIdentityForm={creationDetails.ProofOfIdentityForm}
      setProofOfIdentityForm={handleFormUpdate}
      key={1}
    />,
    <AddressDetailCreateKyc
      AddressDetailForm={creationDetails.AddressDetailForm}
      setAddressDetailForm={handleFormUpdate}
      key={2}
    />,
    <ContactDetailsCreateKyc
      ContactDetailsForm={creationDetails.ContactDetailsForm}
      setContactDetailsForm={handleFormUpdate}
      key={3}
    />,
    <NodalOfficerDetailCreateKyc
      NodalOfficerDetailForm={creationDetails.NodalOfficerDetailForm}
      setNodalOfficerDetailForm={handleFormUpdate}
      key={4}
    />,
    <AttestationDetailCreationKyc
      AttestationDetailForm={creationDetails.AttestationDetailForm}
      setAttestationDetailForm={handleFormUpdate}
      key={5}
    />,
    <PreviewCreateKyc
      key={6}
      submit={handleFormSubmit}
      handleEdit={handleEdit}
    />,
  ];

  function renderStep(index: number) {
    if (index < 0 || index >= stepComponents.length) {
      throw new Error(`Invalid index: ${index}`);
    }
    return stepComponents[index];
  }

  const handleSubmit = (index: number) => {
    if (currentStep + 1 < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      setCompletedSteps([...completedSteps, index]);
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  return (
    <div>
      <h3>Choose CKYC account type</h3>
      <RadioGroup
        row
        value={accountType}
        onChange={handleEntityChange}
        sx={{ mb: 2 }}
      >
        <FormControlLabel value="Normal" control={<Radio />} label="Normal" />
        <FormControlLabel value="Minor" control={<Radio />} label="Minor" />
        <FormControlLabel
          value="Aadhaar"
          control={<Radio />}
          label="Aadhaar OTP based eKYC (non-face to face mode)"
        />
      </RadioGroup>
      <KYCCreationStepper
        STEPS={STEPS}
        completedSteps={completedSteps}
        currentStep={currentStep}
        setCompletedSteps={setCompletedSteps}
        setCurrentStep={(index) => setCurrentStep(index)}
      />
      <React.Fragment>{renderStep(currentStep)}</React.Fragment>

      <MessageModalProps
        open={isSuccessModalOpen}
        onClose={handleModalClose}
        title="Submitted for approval"
        message=""
        buttonText="Okay"
        imageUrl="/icons/Success-Tick.svg"
      />
    </div>
  );
};

export default KYCCreationForm;
