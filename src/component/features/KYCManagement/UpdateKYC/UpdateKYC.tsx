import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Tab, Tabs } from '@mui/material';
import {
  ContentBox,
  PageContainer,
  SectionDivider,
} from '../DownloadKYC/DownloadKYC.styles';

import { EntityType, KYCResult, SearchType } from '../KYC.types';
import SingleKYCUpdate from './SingleKYCUpdate';
import BuilkKYCUpdate from './BuilkKYCUpdate';

const mockResults: KYCResult[] = [
  {
    name: 'Sandeep Sharma',
    dob: '16-04-1996',
    gender: 'Male',
    ref: 'KWGU2768327JGL12',
    docs: true,
  },
  {
    name: 'Kunal Sharma',
    dob: '16-04-2000',
    gender: 'Male',
    ref: 'KWGU2768327JGL12',
    docs: true,
  },
];

const UpdateKYC: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  const [entityType, setEntityType] = useState<EntityType>(null);
  const [searchType, setSearchType] = useState<SearchType>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<KYCResult[]>([]);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [, setBulkUploadResults] = useState<File[]>([]);

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.history.back();
  };

  const handleTabChange = (e: React.SyntheticEvent, val: number) => {
    setTab(val);
    setEntityType(null);
    setSearchType(null);
    setSearchValue('');
    setSearchResults([]);
    setSearchAttempted(false);
    setBulkUploadResults([]);
  };

  return (
    <PageContainer>
      <ContentBox>
        <button
          onClick={handleBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#2563eb',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            marginBottom: 16,
            paddingLeft: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowBackIcon style={{ marginRight: 4, fontSize: 20 }} />
          Back
        </button>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, px: 3 } }}
        >
          <Tab label="Single" />
          <Tab label="Bulk" />
        </Tabs>
        <SectionDivider />
        {tab === 0 && (
          <SingleKYCUpdate
            entityType={entityType}
            setEntityType={setEntityType}
            searchType={searchType}
            setSearchType={setSearchType}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            searchAttempted={searchAttempted}
            setSearchAttempted={setSearchAttempted}
            mockResults={mockResults} // Pass mock data
          />
        )}
        {tab === 1 && (
          <BuilkKYCUpdate
            onSearch={(searchType, file) => {
              console.log('Search Type:', searchType);
              console.log('Uploaded File:', file);
              // Handle the bulk search logic here
            }}
          />
        )}
      </ContentBox>
    </PageContainer>
  );
};

export default UpdateKYC;
