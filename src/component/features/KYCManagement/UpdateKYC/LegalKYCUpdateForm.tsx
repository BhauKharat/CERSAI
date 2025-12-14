import React, { useState } from 'react';
import KYCCreationStepper from '../../../../component/stepper/KYCCreationStepper';
import MessageModalProps from '../../../Modal/featuresModals/MessageModal';
import {
  ILegalAddressDetail,
  ILegalAttestationDetail,
  ILegalContactDetails,
  ILegalCreateKyc,
  ILegalDemographicDetail,
  ILegalNodalOfficerDetail,
  ILegalPreview,
  ILegalProofOfIdentity,
} from '../CreateKYC/interfaceCreateLegalKyc';
import DemographicDetailCreateKyc from '../CreateKYC/createLegalSteps/LegalDemographicDetailCreateKyc';
import ProofOfIdentityCreateKyc from '../CreateKYC/createLegalSteps/LegalProofOfIdentityCreateKyc';
import AddressDetailCreateKyc from '../CreateKYC/createLegalSteps/LegalAddressDetailCreateKyc';
import ContactDetailsCreateKyc from '../CreateKYC/createLegalSteps/LegalContactDetailsCreateKyc';
import NodalOfficerDetailCreateKyc from '../CreateKYC/createLegalSteps/LegalNodalOfficerDetailCreateKyc';
import AttestationDetailCreationKyc from '../CreateKYC/createLegalSteps/LegalAttestationDetailCreationKyc';
import PreviewCreateKyc from '../CreateKYC/createLegalSteps/LegalPreviewCreateKyc';

const STEPS = [
  'Entity Details',
  'Proof of Identity and Address',
  'Address Details',
  'Contact Details',
  'Related Party Details',
  'Other & Attestation Details',
  'Preview',
];

const LegalKYCUpdateForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);

  const [creationDetails, setCreationDetails] = useState<ILegalCreateKyc>({
    DemographicDetailForm: undefined,
    ProofOfIdentityForm: undefined,
    AddressDetailForm: undefined,
    ContactDetailsForm: undefined,
    NodalOfficerDetailForm: undefined,
    AttestationDetailForm: undefined,
    PreviewForm: undefined,
  });

  const handleModalClose = () => {
    setSuccessModalOpen(false);
  };

  const handleFormUpdate = (
    details:
      | ILegalDemographicDetail
      | ILegalProofOfIdentity
      | ILegalAddressDetail
      | ILegalContactDetails
      | ILegalNodalOfficerDetail
      | ILegalAttestationDetail
      | ILegalPreview
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
  return (
    <div>
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

export default LegalKYCUpdateForm;
