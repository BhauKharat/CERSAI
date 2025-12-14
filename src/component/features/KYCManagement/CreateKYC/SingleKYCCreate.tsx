import React, { ChangeEvent } from 'react';
import { SectionDivider } from '../DownloadKYC/DownloadKYC.styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import type {
  EntityType,
  KYCRefrence,
  SingleKYCDownloadProps,
} from '../KYC.types';
import KYCReferenceForm from '../DownloadKYC/KYCReferenceForm';
import KYCCreationForm from './KYCCreationForm';
import LegalKYCCreationForm from './LegalKYCCreationForm';

const SingleKYCCreate: React.FC<SingleKYCDownloadProps> = ({
  entityType,
  setEntityType,
  setSearchType,
  setSearchValue,
  setSearchResults,
  setSearchAttempted,
}) => {
  const [refrenceSearchAttempted, setRefrenceSearchAttempted] =
    React.useState(false);

  const handleReferenceSearch = (fields: KYCRefrence) => {
    console.log('fields Single;---', fields);
    if (
      fields.kycReferenceNumber &&
      fields.kycReferenceNumber.toLowerCase() === 'hardik'
    ) {
      setRefrenceSearchAttempted(true);
    } else {
      setRefrenceSearchAttempted(false);
    }
  };

  // Handles entity type change and resets dependent states
  const handleEntityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEntityType(e.target.value as EntityType);
    setSearchType(null); // Clear search type selection when entity type changes
    setSearchValue('');
    setSearchResults([]);
    setSearchAttempted(false);
    setRefrenceSearchAttempted(false);
  };

  return (
    <React.Fragment>
      <RadioGroup
        row
        value={entityType}
        onChange={handleEntityChange}
        sx={{ mb: 2 }}
      >
        <FormControlLabel
          value="individual"
          control={<Radio />}
          label="Individual"
        />
        <FormControlLabel
          value="legal"
          control={<Radio />}
          label="Legal Entity"
        />
      </RadioGroup>
      <SectionDivider />

      {entityType === 'individual' && (
        <>
          {!refrenceSearchAttempted && (
            <React.Fragment>
              <KYCReferenceForm
                onSearch={handleReferenceSearch}
                loading={false}
              />
            </React.Fragment>
          )}
          {refrenceSearchAttempted && <KYCCreationForm />}
        </>
      )}

      {entityType === 'legal' && (
        <>
          {!refrenceSearchAttempted && (
            <React.Fragment>
              <KYCReferenceForm
                onSearch={handleReferenceSearch}
                loading={false}
              />
            </React.Fragment>
          )}
          {refrenceSearchAttempted && <LegalKYCCreationForm />}
        </>
      )}
    </React.Fragment>
  );
};

export default SingleKYCCreate;
