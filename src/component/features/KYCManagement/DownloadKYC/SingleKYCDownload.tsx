import React, { ChangeEvent } from 'react';
import { SectionDivider } from './DownloadKYC.styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import type {
  EntityType,
  KYCRefrence,
  SingleKYCDownloadProps,
} from '../KYC.types';
import KYCReferenceResult from './KYCReferenceResult';
import KYCReferenceForm from './KYCReferenceForm';

const SingleKYCDownload: React.FC<SingleKYCDownloadProps> = ({
  entityType,
  setEntityType,
  setSearchType,
  setSearchValue,
  setSearchResults,
  setSearchAttempted,
}) => {
  // State for combination search result
  // const [referenceResult, setReferenceResult] =
  //   React.useState<KYCRefrence | null>(null);
  const [refrenceSearchAttempted, setRefrenceSearchAttempted] =
    React.useState(false);
  // const [
  //   legalCombinationFormResetCounter,
  //   setlegalCombinationFormResetCounter,
  // ] = React.useState(0);
  // const [panFormResetCounter, setPanFormResetCounter] = React.useState(0);

  // Handler for combination search
  const handleReferenceSearch = (fields: KYCRefrence) => {
    console.log('fields Single;---', fields);
    // setReferenceResult(fields);
    // Simulate API call: show mock result for demo, ensure kycReferenceNumber is not undefined
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
    // setReferenceResult(null);
    setRefrenceSearchAttempted(false);
    // setlegalCombinationFormResetCounter((c) => c + 1);
  };

  // Handles search type change and resets dependent states

  // Handles input field change
  // const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
  //   setSearchValue(e.target.value);

  // // Handles the search action
  // const handleSearch = (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setSearchAttempted(true); // Indicate that a search attempt has been made

  //   if (searchValue.trim() === '') {
  //     setSearchResults([]); // No results for an empty search query
  //     return;
  //   }

  //   // Simulate API call: return mock results for specific values, otherwise empty
  //   if (
  //     searchValue.toUpperCase() === 'BOAPG2728J' ||
  //     searchValue.toUpperCase() === 'KWGU2768327JGL12'
  //   ) {
  //     setSearchResults(mockResults);
  //   } else {
  //     setSearchResults([]);
  //   }
  // };

  return (
    <>
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
          {/* <SearchTitle style={{ textAlign: 'left' }}>
            Search Reference Number
          </SearchTitle> */}
          <KYCReferenceForm onSearch={handleReferenceSearch} loading={false} />
          {refrenceSearchAttempted ? (
            <>
              <KYCReferenceResult />
            </>
          ) : null}
        </>
      )}

      {/* Updated OVD UI to match screenshot */}
      {entityType === 'legal' && (
        <>
          {/* <SearchTitle style={{ textAlign: 'left' }}>
            Search Reference Number
          </SearchTitle> */}
          <KYCReferenceForm onSearch={handleReferenceSearch} loading={false} />
          {refrenceSearchAttempted ? (
            <>
              <KYCReferenceResult />
            </>
          ) : null}
        </>
      )}
    </>
  );
};

export default SingleKYCDownload;
