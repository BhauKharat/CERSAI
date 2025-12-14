import React, { useState } from 'react';
import {
  PageContainer,
  ContentBox,
  SectionDivider,
} from './DownloadKYC.styles';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import SingleKYCDownload from './SingleKYCDownload'; // Import the new Single component
import BulkKYCDownload from './BulkKYCDownload'; // Import the new Bulk component

import type { KYCResult, EntityType, SearchType } from '../KYC.types';

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

const DownloadKYC: React.FC = () => {
  // Back link handler
  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.history.back();
  };

  const [tab, setTab] = useState<number>(0);

  // States for SingleKYCSearch
  const [entityType, setEntityType] = useState<EntityType>(null);
  const [searchType, setSearchType] = useState<SearchType>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<KYCResult[]>([]);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);

  // States for BulkKYCSearch
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setBulkUploadResults] = useState<File[]>([]);
  // const [bulkUploadAttempted, setBulkUploadAttempted] =
  useState<boolean>(false);
  // const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);

  // Handles tab change and resets relevant states
  const handleTabChange = (e: React.SyntheticEvent, val: number) => {
    setTab(val);
    // Reset all states when tab changes to ensure clean slate for each tab
    setEntityType(null);
    setSearchType(null);
    setSearchValue('');
    setSearchResults([]);
    setSearchAttempted(false);

    // setSelectedFile(null);
    setBulkUploadResults([]);
    // setBulkUploadAttempted(false);
    // setBulkUploadError(null);
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
          <SingleKYCDownload
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
          <BulkKYCDownload
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

export default DownloadKYC;
