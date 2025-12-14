import React, { useEffect, useState } from 'react';
import { IError } from '../interfaceCreateKyc';
import InputField from '../../../../../component/ui/Input/InputField';
import MuiUploadDoc from '../MuiUploadDoc';
import MuiCheckBox from '../MuiChecBox';
import { Box, Button, SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SectionDivider } from '../../DownloadKYC/DownloadKYC.styles';
import MuiDropDown from '../MuiDropDown';
import { ILegalAddressDetail } from '../interfaceCreateLegalKyc';

const AddressDetailCreateKyc = ({
  AddressDetailForm,
  setAddressDetailForm,
}: {
  AddressDetailForm: ILegalAddressDetail | undefined;
  setAddressDetailForm: (details: ILegalAddressDetail, name: string) => void;
}) => {
  const [error, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<ILegalAddressDetail>({
    // Registered Address
    regFlatNo: '',
    regPlotNo: '',
    regLocality: '',
    regCity: '',
    regState: '',
    regCountry: '',
    regPincode: '',
    regIsoCountryCode: '',
    regAddressProofDoc: '',
    regExactMatchWithCVD: false,
    regPartialMatchWithCVD: false,

    // Principal Place of Business
    sameAsRegistered: false,
    prinFlatNo: '',
    prinPlotNo: '',
    prinLocality: '',
    prinCity: '',
    prinState: '',
    prinCountry: '',
    prinPincode: '',
    prinIsoCountryCode: '',
    prinAddressProofDoc: '',
    prinCvdVerified: false,
    prinDeclaredSame: false,
    prinVerifiedByThirdParty: false,
    prinPhysicallyVerified: false,

    // Document Upload
    otherDocument: null,
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
        <h1>Registered Address</h1>
        <Grid container spacing={2}>
          {/* Registered Address */}
          <InputField
            label="Plot no/ house no*"
            name="regPlotNo"
            value={formData.regPlotNo}
            onChange={handleChange}
            required
            placeholder="Enter house no"
            type="text"
            error={
              error.find((e) => e.name === 'regPlotNo')?.errorMessage || ''
            }
          />

          <InputField
            label="Flat no/ apartment name"
            name="regFlatNo"
            placeholder="Enter Flat no"
            type="text"
            value={formData.regFlatNo}
            onChange={handleChange}
            error={
              error.find((e) => e.name === 'regFlatNo')?.errorMessage || ''
            }
          />

          <InputField
            label="Locality/ Street"
            name="regLocality"
            value={formData.regLocality}
            onChange={handleChange}
            placeholder="Enter Locality/ Street"
            type="text"
            error={
              error.find((e) => e.name === 'regLocality')?.errorMessage || ''
            }
          />

          <InputField
            label="City/Town/Village*"
            name="regCity"
            type="text"
            placeholder="Enter City"
            value={formData.regCity}
            onChange={handleChange}
            required
            error={error.find((e) => e.name === 'regCity')?.errorMessage || ''}
          />

          <MuiDropDown
            label="State*"
            name="regState"
            value={formData.regState}
            onChange={handleChange}
            options={[]}
            required
            error={error.find((e) => e.name === 'regState')?.errorMessage || ''}
          />

          <MuiDropDown
            label="Country*"
            name="regCountry"
            value={formData.regCountry}
            onChange={handleChange}
            options={[]}
            required
            error={
              error.find((e) => e.name === 'regCountry')?.errorMessage || ''
            }
          />

          <InputField
            label="Pin Code*"
            name="regPincode"
            value={formData.regPincode}
            onChange={handleChange}
            required
            type="number"
            placeholder="Enter Pincode"
            error={
              error.find((e) => e.name === 'regPincode')?.errorMessage || ''
            }
          />

          <MuiDropDown
            label="ISO 3166 country code*"
            name="regIsoCountryCode"
            value={formData.regIsoCountryCode}
            onChange={handleChange}
            options={[]}
            required
            error={
              error.find((e) => e.name === 'regIsoCountryCode')?.errorMessage ||
              ''
            }
          />

          <MuiDropDown
            label="Address is supported with document*"
            name="regAddressProofDoc"
            value={formData.regAddressProofDoc}
            onChange={handleChange}
            options={[]}
            required
            error={
              error.find((e) => e.name === 'regAddressProofDoc')
                ?.errorMessage || ''
            }
          />

          <MuiCheckBox
            label="Exactly match with CVD"
            name="regExactMatchWithCVD"
            value={formData.regExactMatchWithCVD ? 'Yes' : 'No'}
            onChange={handleChange}
          />

          <MuiCheckBox
            label="Partial match with CVD"
            name="regPartialMatchWithCVD"
            value={formData.regPartialMatchWithCVD ? 'Yes' : 'No'}
            onChange={handleChange}
          />
        </Grid>
        <SectionDivider />
        <h1>Same as permanent address</h1>
        <Grid container spacing={2}>
          <MuiCheckBox
            label="Same as permanent address"
            name="sameAsRegistered"
            value={formData.sameAsRegistered ? 'Yes' : 'No'}
            onChange={handleChange}
          />

          <InputField
            label="Plot no/ house no*"
            name="prinPlotNo"
            type="text"
            placeholder="Enter Here"
            value={formData.prinPlotNo}
            onChange={handleChange}
            required
            error={
              error.find((e) => e.name === 'prinPlotNo')?.errorMessage || ''
            }
          />

          <InputField
            label="Flat no/ apartment name"
            name="prinFlatNo"
            type="text"
            placeholder="Enter Here"
            value={formData.prinFlatNo}
            onChange={handleChange}
            error={
              error.find((e) => e.name === 'prinFlatNo')?.errorMessage || ''
            }
          />

          <InputField
            label="Locality/ Street"
            name="prinLocality"
            type="text"
            placeholder="Enter Here"
            value={formData.prinLocality}
            onChange={handleChange}
            error={
              error.find((e) => e.name === 'prinLocality')?.errorMessage || ''
            }
          />

          <InputField
            label="City/Town/Village*"
            name="prinCity"
            type="text"
            placeholder="Enter Here"
            value={formData.prinCity}
            onChange={handleChange}
            required
            error={error.find((e) => e.name === 'prinCity')?.errorMessage || ''}
          />

          <MuiDropDown
            label="State*"
            name="prinState"
            value={formData.prinState}
            onChange={handleChange}
            options={[]}
            required
            error={
              error.find((e) => e.name === 'prinState')?.errorMessage || ''
            }
          />

          <MuiDropDown
            label="Country*"
            name="prinCountry"
            value={formData.prinCountry}
            onChange={handleChange}
            options={[]}
            required
            error={
              error.find((e) => e.name === 'prinCountry')?.errorMessage || ''
            }
          />

          <InputField
            label="Pin Code*"
            name="prinPincode"
            value={formData.prinPincode}
            onChange={handleChange}
            placeholder="Enter Pin Code"
            type="number"
            required
            error={
              error.find((e) => e.name === 'prinPincode')?.errorMessage || ''
            }
          />

          <MuiDropDown
            label="ISO 3166 country code*"
            name="prinIsoCountryCode"
            value={formData.prinIsoCountryCode}
            onChange={handleChange}
            options={[]}
            required
            error={
              error.find((e) => e.name === 'prinIsoCountryCode')
                ?.errorMessage || ''
            }
          />

          <MuiDropDown
            label="Principal proof of address*"
            name="prinAddressProofDoc"
            value={formData.prinAddressProofDoc}
            onChange={handleChange}
            options={[]}
            required
            error={
              error.find((e) => e.name === 'prinAddressProofDoc')
                ?.errorMessage || ''
            }
          />

          <MuiCheckBox
            label="Governed PoA Verified"
            name="prinCvdVerified"
            value={formData.prinCvdVerified ? 'Yes' : 'No'}
            onChange={handleChange}
          />

          <MuiCheckBox
            label="Declared same as current address"
            name="prinDeclaredSame"
            value={formData.prinDeclaredSame ? 'Yes' : 'No'}
            onChange={handleChange}
          />

          <MuiCheckBox
            label="PoA Verified by third party"
            name="prinVerifiedByThirdParty"
            value={formData.prinVerifiedByThirdParty ? 'Yes' : 'No'}
            onChange={handleChange}
          />

          <MuiCheckBox
            label="Physically Verified by RE official"
            name="prinPhysicallyVerified"
            value={formData.prinPhysicallyVerified ? 'Yes' : 'No'}
            onChange={handleChange}
          />

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
