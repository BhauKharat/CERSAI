import React, { ChangeEvent, FormEvent } from 'react';
import {
  KYCNotFoundBox,
  SectionDivider,
  SearchTitle,
} from './SearchKYC.styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button, Box, Grid } from '@mui/material';

import type {
  EntityType,
  SearchType,
  SingleKYCSearchProps,
  CombinationResult,
  KYCombine,
  KYCPhoto,
  KYCPan,
  KYCLegalCombination,
} from '../KYC.types';
import KYCCombinationForm from './KYCCombinationForm';
import KYCCombinationResult from './KYCCombinationResult';
import KYCPhotoForm from './KYCPhotoForm';
// import KYCPhotoResult from './KYCPhotoResult';
import KYCPanForm from './KYCPanForm';
import KYCLegalCombinationForm from './KYCLegalCombinationForm';

const SingleKYCSearch: React.FC<SingleKYCSearchProps> = ({
  entityType,
  setEntityType,
  searchType,
  setSearchType,
  searchValue,
  setSearchValue,
  setSearchResults,
  searchAttempted,
  setSearchAttempted,
  mockResults,
}) => {
  // State for combination search result
  const [combinationResult, setCombinationResult] =
    React.useState<CombinationResult | null>(null);
  const [combinationSearchAttempted, setCombinationSearchAttempted] =
    React.useState(false);
  const [photoSearchAttempted, setPhotoSearchAttempted] = React.useState(false);
  const [photoFormResetCounter, setPhotoFormResetCounter] = React.useState(0);

  const [panSearchAttempted, setPanSearchAttempted] = React.useState(false);
  const [legalCombinationSearchAttempted, setLegalCombinationSearchAttempted] =
    React.useState(false);
  // const [
  //   legalCombinationFormResetCounter,
  //   setlegalCombinationFormResetCounter,
  // ] = React.useState(0);
  // const [panFormResetCounter, setPanFormResetCounter] = React.useState(0);

  // Handler for combination search
  const handleCombinationSearch = (fields: KYCombine) => {
    setCombinationSearchAttempted(true);
    // Simulate API call: show mock result for demo
    if (
      fields.firstName.toLowerCase() === 'hardik' ||
      fields.middleName.toLowerCase() === 'jayantibhai' ||
      fields.lastName.toLowerCase() === 'patel' ||
      fields.gender.toLowerCase() === 'male' ||
      fields.dob === '1995-03-20'
    ) {
      setCombinationResult({
        dob: '20-03-1995', // Added dob field
        name: 'Sandeep sharma',
        gender: 'Male',
        mobile: '+91 8888 8888 88',
        email: 'Sandeep123@gmail.com',
        lastUpdated: '12 Dec 2024',
        ref: 'KWGU2768327JGL12',
        photoUrl: '/ckyc/images/sample-profile.png', // Update this path as per your local image
        documents: [
          { type: 'voter', label: 'Voter ID', url: '/ckyc/images/voter.png' },
          { type: 'pan', label: 'PAN Card', url: '/ckyc/images/pan.png' },
          { type: 'photo', label: 'Photo', url: '/ckyc/images/photo.png' },
        ],
      });
    } else {
      setCombinationResult(null);
    }
  };

  // Handler for Photo search
  const handlePhotoSearch = (fields: KYCPhoto) => {
    setPhotoSearchAttempted(true);
    // Simulate API call: show mock result for demo
    if (
      fields.firstName.toLowerCase() === 'hardik' ||
      fields.middleName.toLowerCase() === 'jayantibhai' ||
      fields.lastName.toLowerCase() === 'patel'
    ) {
      setCombinationResult({
        dob: '20-03-1995', // Added dob field
        name: 'Sandeep sharma',
        gender: 'Male',
        mobile: '+91 8888 8888 88',
        email: 'Sandeep123@gmail.com',
        lastUpdated: '12 Dec 2024',
        ref: 'KWGU2768327JGL12',
        photoUrl: '/ckyc/images/sample-profile.png', // Update this path as per your local image
        documents: [
          { type: 'voter', label: 'Voter ID', url: '/ckyc/images/voter.png' },
          { type: 'pan', label: 'PAN Card', url: '/ckyc/images/pan.png' },
          { type: 'photo', label: 'Photo', url: '/ckyc/images/photo.png' },
        ],
      });
    } else {
      setCombinationResult(null);
    }
  };

  // Handler for PAN search
  const handlePANSearch = (fields: KYCPan) => {
    setPanSearchAttempted(true);
    // Simulate API call: show mock result for demo
    if (fields.pan.toLowerCase() === 'pan') {
      setCombinationResult({
        dob: '20-03-1995', // Added dob field
        name: 'Sandeep sharma',
        gender: 'Male',
        mobile: '+91 8888 8888 88',
        email: 'Sandeep123@gmail.com',
        lastUpdated: '12 Dec 2024',
        ref: 'KWGU2768327JGL12',
        photoUrl: '/ckyc/images/sample-profile.png', // Update this path as per your local image
        documents: [
          { type: 'voter', label: 'Voter ID', url: '/ckyc/images/voter.png' },
          { type: 'pan', label: 'PAN Card', url: '/ckyc/images/pan.png' },
          { type: 'photo', label: 'Photo', url: '/ckyc/images/photo.png' },
        ],
      });
    } else {
      setCombinationResult(null);
    }
  };

  // Handler for PAN search
  const handleCombinationSearchLegal = (fields: KYCLegalCombination) => {
    setLegalCombinationSearchAttempted(true);
    // Simulate API call: show mock result for demo
    if (fields.name.toLowerCase() === 'pan') {
      setCombinationResult({
        dob: '20-03-1995', // Added dob field
        name: 'Sandeep sharma',
        gender: 'Male',
        mobile: '+91 8888 8888 88',
        email: 'Sandeep123@gmail.com',
        lastUpdated: '12 Dec 2024',
        ref: 'KWGU2768327JGL12',
        photoUrl: '/ckyc/images/sample-profile.png', // Update this path as per your local image
        documents: [
          { type: 'voter', label: 'Voter ID', url: '/ckyc/images/voter.png' },
          { type: 'pan', label: 'PAN Card', url: '/ckyc/images/pan.png' },
          { type: 'photo', label: 'Photo', url: '/ckyc/images/photo.png' },
        ],
      });
    } else {
      setCombinationResult(null);
    }
  };

  // Handles entity type change and resets dependent states
  const handleEntityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEntityType(e.target.value as EntityType);
    setSearchType(null); // Clear search type selection when entity type changes
    setSearchValue('');
    setSearchResults([]);
    setSearchAttempted(false);
    setCombinationResult(null);
    setCombinationSearchAttempted(false);
    setPhotoSearchAttempted(false);
    setPanSearchAttempted(false);
    setPhotoFormResetCounter((c) => c + 1);

    setLegalCombinationSearchAttempted(false);
    // setlegalCombinationFormResetCounter((c) => c + 1);
  };

  // Handles search type change and resets dependent states
  const handleSearchTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchType(e.target.value as SearchType);
    setSearchValue('');
    setSearchResults([]);
    setSearchAttempted(false);
    setCombinationResult(null);
    setCombinationSearchAttempted(false);
    setPhotoSearchAttempted(false);
    setPanSearchAttempted(false);
    setPhotoFormResetCounter((c) => c + 1);

    setLegalCombinationSearchAttempted(false);
    // setlegalCombinationFormResetCounter((c) => c + 1);
    // setPanFormResetCounter((c) => c + 1);
  };

  // Handles input field change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchValue(e.target.value);

  // Handles the search action
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchAttempted(true); // Indicate that a search attempt has been made

    if (searchValue.trim() === '') {
      setSearchResults([]); // No results for an empty search query
      return;
    }

    // Simulate API call: return mock results for specific values, otherwise empty
    if (
      searchValue.toUpperCase() === 'BOAPG2728J' ||
      searchValue.toUpperCase() === 'KWGU2768327JGL12'
    ) {
      setSearchResults(mockResults);
      setCombinationResult({
        dob: '20-03-1995', // Added dob field
        name: 'Sandeep sharma',
        gender: 'Male',
        mobile: '+91 8888 8888 88',
        email: 'Sandeep123@gmail.com',
        lastUpdated: '12 Dec 2024',
        ref: 'KWGU2768327JGL12',
        photoUrl: '/ckyc/images/sample-profile.png', // Update this path as per your local image
        documents: [
          { type: 'voter', label: 'Voter ID', url: '/ckyc/images/voter.png' },
          {
            type: 'pan',
            label: 'PAN Card Details',
            url: '/ckyc/images/pan.png',
          },
          { type: 'photo', label: 'Photo', url: '/ckyc/images/photo.png' },
        ],
      });
    } else {
      setSearchResults([]);
      setCombinationResult(null);
    }
  };

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
      {entityType === 'individual' ? (
        <>
          <RadioGroup
            row
            value={searchType}
            onChange={handleSearchTypeChange}
            sx={{ mb: 2 }}
          >
            <FormControlLabel
              value="ovd"
              control={<Radio />}
              label="OVD/CKYC/PAN Number"
            />
            <FormControlLabel
              value="combination"
              control={<Radio />}
              label="Combination of Name & Date of Incorporation"
            />
            <FormControlLabel
              value="photo"
              control={<Radio />}
              label="Name & Photo"
            />
          </RadioGroup>
          <SectionDivider />
        </>
      ) : null}
      {entityType === 'legal' ? (
        <>
          <RadioGroup
            row
            value={searchType}
            onChange={handleSearchTypeChange}
            sx={{ mb: 2 }}
          >
            <FormControlLabel
              value="pan"
              control={<Radio />}
              label="PAN/CKYC/GSTIN Number"
            />
            <FormControlLabel
              value="combination"
              control={<Radio />}
              label="Combination of Name & Date of Incorporation"
            />
          </RadioGroup>
          <SectionDivider />
        </>
      ) : null}

      {/* Combination of Name & Photo UI */}
      {entityType === 'individual' && searchType === 'photo' && (
        <>
          <SearchTitle style={{ textAlign: 'left' }}>
            Search by Name & Photo
          </SearchTitle>
          <KYCPhotoForm
            onSearch={handlePhotoSearch}
            loading={false} // Placeholder for loading state
            onReset={() => photoFormResetCounter}
          />
          {photoSearchAttempted && (
            <>
              <Typography
                variant="body2"
                sx={{ mb: 1, mt: 2, fontWeight: 500 }}
              >
                Search result
              </Typography>
              {combinationResult ? (
                <KYCCombinationResult
                  result={combinationResult}
                  showPhoto={false}
                />
              ) : (
                <KYCNotFoundBox>
                  <ErrorOutlineIcon sx={{ color: '#ff6666', mr: 1 }} />
                  No KYC record found
                </KYCNotFoundBox>
              )}
            </>
          )}
        </>
      )}

      {/* Combination of Name, DOB & Gender UI */}
      {entityType === 'individual' && searchType === 'combination' && (
        <>
          <SearchTitle style={{ textAlign: 'left' }}>
            Search by Name, Date of Birth and Gender
          </SearchTitle>
          <KYCCombinationForm
            onSearch={handleCombinationSearch}
            loading={false}
          />
          {combinationSearchAttempted && (
            <>
              <Typography
                variant="body2"
                sx={{ mb: 1, mt: 2, fontWeight: 500 }}
              >
                Search result
              </Typography>
              {combinationResult ? (
                <KYCCombinationResult
                  result={combinationResult}
                  showPhoto={true}
                />
              ) : (
                <KYCNotFoundBox>
                  <ErrorOutlineIcon sx={{ color: '#ff6666', mr: 1 }} />
                  No KYC record found
                </KYCNotFoundBox>
              )}
            </>
          )}
        </>
      )}

      {/* Updated OVD UI to match screenshot */}
      {entityType === 'individual' && searchType === 'ovd' && (
        <form onSubmit={handleSearch}>
          <SearchTitle style={{ textAlign: 'left' }}>
            Search by OVD Number or PAN Number
          </SearchTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: '#333',
                  }}
                >
                  OVD Number / PAN
                </Typography>
                <TextField
                  value={searchValue}
                  onChange={handleInputChange}
                  required
                  size="small"
                  placeholder="BOAPG2728J"
                  sx={{ width: '100%' }}
                  className="textFieldStyles"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ mt: { xs: 2, sm: 3.6 } }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  className="buttonClass"
                >
                  Search
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}

      {/* Display search results or "no record found" message only AFTER a search */}
      {entityType === 'individual' &&
        searchType === 'ovd' &&
        searchAttempted && (
          <>
            <Typography variant="body2" sx={{ mb: 1, mt: 2, fontWeight: 500 }}>
              Search result
            </Typography>
            {combinationResult ? (
              <KYCCombinationResult
                result={combinationResult}
                showPhoto={false}
              />
            ) : (
              <KYCNotFoundBox>
                <ErrorOutlineIcon sx={{ color: '#ff6666', mr: 1 }} />
                No KYC record found
              </KYCNotFoundBox>
            )}
          </>
        )}

      {/* Leagal Entity of PAN/CKYC/GSTIN Number */}
      {entityType === 'legal' && searchType === 'pan' && (
        <>
          <SearchTitle style={{ textAlign: 'left' }}>
            Search by PAN/CKYC/GSTIN Number
          </SearchTitle>
          <KYCPanForm onSearch={handlePANSearch} loading={false} />
          {panSearchAttempted && (
            <>
              <Typography
                variant="body2"
                sx={{ mb: 1, mt: 2, fontWeight: 500 }}
              >
                Search result
              </Typography>
              {combinationResult ? (
                <KYCCombinationResult
                  result={combinationResult}
                  showPhoto={false}
                />
              ) : (
                <KYCNotFoundBox>
                  <ErrorOutlineIcon sx={{ color: '#ff6666', mr: 1 }} />
                  No KYC record found
                </KYCNotFoundBox>
              )}
            </>
          )}
        </>
      )}

      {/* Leagal Entity of Combination */}
      {entityType === 'legal' && searchType === 'combination' && (
        <>
          <SearchTitle style={{ textAlign: 'left' }}>
            Search by Combination of Name & Date of Incorporation
          </SearchTitle>
          <KYCLegalCombinationForm
            onSearch={handleCombinationSearchLegal}
            loading={false}
          />
          {legalCombinationSearchAttempted && (
            <>
              <Typography
                variant="body2"
                sx={{ mb: 1, mt: 2, fontWeight: 500 }}
              >
                Search result
              </Typography>
              {combinationResult ? (
                <KYCCombinationResult
                  result={combinationResult}
                  showPhoto={false}
                />
              ) : (
                <KYCNotFoundBox>
                  <ErrorOutlineIcon sx={{ color: '#ff6666', mr: 1 }} />
                  No KYC record found
                </KYCNotFoundBox>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default SingleKYCSearch;
