import React, { useEffect, useState } from 'react';
import { IAddressDetail, IError } from '../interfaceCreateKyc';
import InputField from '../../../../../component/ui/Input/InputField';
import MuiUploadDoc from '../MuiUploadDoc';
import MuiCheckBox from '../MuiChecBox';
import { Box, Button, SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SectionDivider } from '../../DownloadKYC/DownloadKYC.styles';
import MuiDropDown from '../MuiDropDown';

const AddressDetailCreateKyc = ({
  AddressDetailForm,
  setAddressDetailForm,
}: {
  AddressDetailForm: IAddressDetail | undefined;
  setAddressDetailForm: (details: IAddressDetail, name: string) => void;
}) => {
  const [error, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<IAddressDetail>({
    // Permanent Address
    permanentHouseNo: '',
    permanentApartmentName: '',
    permanentStreet: '',
    permanentVillage: '',
    permanentState: '',
    permanentCity: '',
    permanentPinCode: '',
    permanentCountryCode: '',
    permanentAddressSupported: '',
    permanentExactlyMatchWithOvd: '',
    permanentPartialMatchWithOvd: '',

    // Current Address
    sameAsPermanent: '',
    currentHouseNo: '',
    currentApartmentName: '',
    currentStreet: '',
    currentVillage: '',
    currentState: '',
    currentCity: '',
    currentPinCode: '',
    currentCountryCode: '',
    deemedProofOfAddress: '',
    deemedPoAVerified: '',
    declaredAddress: '',
    geoTagged: '',
    currentAddressExactlyMatchWithOvd: '',
    currentPositiveVerification: '',
    currentPhysicalVerificationByThirdParty: '',
    currentPhysicalVerificationByReOfficial: '',

    // Upload
    otherDocument: null as File | null,
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | number>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, type } = target;
    if (!name) return;

    setFormData((prev) => {
      // ✅ handle file upload
      if (type === 'file') {
        const updated = { ...prev, [name]: target.files?.[0] || null };
        target.value = ''; // clear file input
        return updated;
      }

      // ✅ handle checkbox
      if (type === 'checkbox') {
        const [base, option] = name.split('.');
        return {
          ...prev,
          [base]: option,
        };
      }

      return { ...prev, [name]: target.value };
    });
  };

  useEffect(() => {
    if (AddressDetailForm) {
      setFormData(AddressDetailForm);
    }
    console.log(setError);
  }, [AddressDetailForm]);
  return (
    <div>
      <div style={{ backgroundColor: 'rgb(230, 235, 255)', padding: 10 }}>
        <h1>Address Details</h1>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          backgroundColor: 'rgb(255, 255, 255)',
          padding: 20,
        }}
      >
        <h1>Permanent Address</h1>
        <Grid container spacing={2}>
          <InputField
            label="Flat no./house no."
            name="permanentHouseNo"
            value={formData.permanentHouseNo}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'permanentHouseNo')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="Plot no./apartment name"
            name="permanentApartmentName"
            value={formData.permanentApartmentName}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'permanentApartmentName')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="Locality/Street"
            name="permanentStreet"
            value={formData.permanentStreet}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'permanentStreet')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="City/Town/Village"
            name="permanentVillage"
            value={formData.permanentVillage}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'permanentVillage')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="State"
            name="permanentState"
            value={formData.permanentState}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'permanentState')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="City/Town/Village"
            name="permanentCity"
            value={formData.permanentCity}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'permanentCity')?.errorMessage ||
              ''
            }
          />
          <InputField
            label="Pin Code"
            name="permanentPinCode"
            value={formData.permanentPinCode}
            onChange={handleChange}
            placeholder="Enter here"
            type="number"
            error={
              error.find((err) => err.name === 'permanentPinCode')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="ISO 3166 country code"
            name="permanentCountryCode"
            value={formData.permanentCountryCode}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'permanentCountryCode')
                ?.errorMessage || ''
            }
          />

          <MuiCheckBox
            label="Address (supported with document)"
            name="permanentAddressSupported"
            value={formData.permanentAddressSupported}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'permanentAddressSupported')
                ?.errorMessage || ''
            }
          />
          <MuiCheckBox
            label="Exactly match with OVD"
            name="permanentExactlyMatchWithOvd"
            value={formData.permanentExactlyMatchWithOvd}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'permanentExactlyMatchWithOvd')
                ?.errorMessage || ''
            }
          />
          <MuiCheckBox
            label="Partial match with OVD"
            name="permanentPartialMatchWithOvd"
            value={formData.permanentPartialMatchWithOvd}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'permanentPartialMatchWithOvd')
                ?.errorMessage || ''
            }
          />
        </Grid>

        <SectionDivider />

        {/* Current Address */}
        <h1>Current Address</h1>
        <MuiCheckBox
          label="Same as permanent address"
          name="sameAsPermanent"
          value={formData.sameAsPermanent}
          onChange={handleChange}
          error={
            error.find((err) => err.name === 'sameAsPermanent')?.errorMessage ||
            ''
          }
        />

        <Grid container spacing={2}>
          <InputField
            label="Flat no./house no."
            name="currentHouseNo"
            value={formData.currentHouseNo}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'currentHouseNo')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="Plot no./apartment name"
            name="currentApartmentName"
            value={formData.currentApartmentName}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'currentApartmentName')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="Locality/Street"
            name="currentStreet"
            value={formData.currentStreet}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'currentStreet')?.errorMessage ||
              ''
            }
          />
          <InputField
            label="City/Town/Village"
            name="currentVillage"
            value={formData.currentVillage}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'currentVillage')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="State"
            name="currentState"
            value={formData.currentState}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'currentState')?.errorMessage ||
              ''
            }
          />
          <InputField
            label="City/Town/Village"
            name="currentCity"
            value={formData.currentCity}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'currentCity')?.errorMessage ||
              ''
            }
          />
          <InputField
            label="Pin Code"
            name="currentPinCode"
            value={formData.currentPinCode}
            onChange={handleChange}
            placeholder="Enter here"
            type="number"
            error={
              error.find((err) => err.name === 'currentPinCode')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="ISO 3166 country code"
            name="currentCountryCode"
            value={formData.currentCountryCode}
            onChange={handleChange}
            placeholder="Enter here"
            type="text"
            error={
              error.find((err) => err.name === 'currentCountryCode')
                ?.errorMessage || ''
            }
          />
          <MuiDropDown
            label="Deemed Proof of Address"
            name="deemedProofOfAddress"
            placeholder="Select Proof of Address"
            value={formData.deemedProofOfAddress}
            onChange={handleChange}
            options={[
              { label: 'Utility Bill', value: 'Utility Bill' },
              { label: 'Bank Statement', value: 'Bank Statement' },
              { label: 'Driving License', value: 'Driving License' },
              { label: 'Passport', value: 'Passport' },
              { label: 'Voter ID', value: 'Voter ID' },
            ]}
            disabled={false}
            required
            error={
              error.find((err) => err.name === 'deemedProofOfAddress')
                ?.errorMessage || ''
            }
          />
          <MuiCheckBox
            label="Deemed PoA Verified"
            name="deemedPoAVerified"
            value={formData.deemedPoAVerified}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'deemedPoAVerified')
                ?.errorMessage || ''
            }
          />

          <MuiCheckBox
            label="Declared address"
            name="declaredAddress"
            value={formData.declaredAddress}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'declaredAddress')
                ?.errorMessage || ''
            }
          />

          <MuiCheckBox
            label="Geo Tagged"
            name="geoTagged"
            value={formData.geoTagged}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'geoTagged')?.errorMessage || ''
            }
          />
          <MuiCheckBox
            label="Address exactly match with OVD"
            name="currentAddressExactlyMatchWithOvd"
            value={formData.currentAddressExactlyMatchWithOvd}
            onChange={handleChange}
            error={
              error.find(
                (err) => err.name === 'currentAddressExactlyMatchWithOvd'
              )?.errorMessage || ''
            }
          />
          <MuiCheckBox
            label="Positive verification of current address"
            name="currentPositiveVerification"
            value={formData.currentPositiveVerification}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'currentPositiveVerification')
                ?.errorMessage || ''
            }
          />
          <MuiCheckBox
            label="Physical verification by third party"
            name="currentPhysicalVerificationByThirdParty"
            value={formData.currentPhysicalVerificationByThirdParty}
            onChange={handleChange}
            error={
              error.find(
                (err) => err.name === 'currentPhysicalVerificationByThirdParty'
              )?.errorMessage || ''
            }
          />
          <MuiCheckBox
            label="Physical verification by RE official"
            name="currentPhysicalVerificationByReOfficial"
            value={formData.currentPhysicalVerificationByReOfficial}
            onChange={handleChange}
            error={
              error.find(
                (err) => err.name === 'currentPhysicalVerificationByReOfficial'
              )?.errorMessage || ''
            }
          />
          <br />
          {/* Upload */}
          <MuiUploadDoc
            label="Other Document"
            name="otherDocument"
            value={formData.otherDocument}
            onChange={handleChange}
            required
          />
        </Grid>
      </div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'center', lg: 'flex-end' },
        }}
      >
        <Button
          variant="contained"
          onClick={() => setAddressDetailForm(formData, 'AddressDetailForm')}
          sx={{ backgroundColor: 'rgb(0, 44, 186)', paddingX: 5, paddingY: 2 }}
        >
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default AddressDetailCreateKyc;
