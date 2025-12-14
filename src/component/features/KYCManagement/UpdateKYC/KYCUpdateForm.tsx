import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { IAccountType } from '../KYC.types';

import MessageModalProps from '../../../Modal/featuresModals/MessageModal';
import {
  IAddressDetail,
  IAttestationDetail,
  IContactDetails,
  ICreateKyc,
  IDemographicDetail,
  INodalOfficerDetail,
  IProofOfIdentity,
} from '../CreateKYC/interfaceCreateKyc';
import DemographicDetailCreateKyc from '../CreateKYC/createSteps/DemographicDetailCreateKyc';
import ProofOfIdentityCreateKyc from '../CreateKYC/createSteps/ProofOfIdentityCreateKyc';
import AddressDetailCreateKyc from '../CreateKYC/createSteps/AddressDetailCreateKyc';
import ContactDetailsCreateKyc from '../CreateKYC/createSteps/ContactDetailsCreateKyc';
import NodalOfficerDetailCreateKyc from '../CreateKYC/createSteps/NodalOfficerDetailCreateKyc';
import AttestationDetailCreationKyc from '../CreateKYC/createSteps/AttestationDetailCreationKyc';
import PreviewCreateKyc from '../CreateKYC/createSteps/PreviewCreateKyc';
import KYCCreationStepper from '../../../../component/stepper/KYCCreationStepper';
import { data } from '../CreateKYC/data-temp';

const STEPS = [
  'Demographic Details',
  'Proof of Identity and Address',
  'Address Details',
  'Contact Details',
  'Related Party Details',
  'Other & Attestation Details',
  'Preview',
];

const KYCUpdateForm = () => {
  const [accountType, setAccountType] = useState<IAccountType | null>();
  const handleEntityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountType(e.target.value as IAccountType);
  };
  const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
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

  useEffect(() => {
    setCreationDetails(data);
  }, []);
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

export default KYCUpdateForm;
