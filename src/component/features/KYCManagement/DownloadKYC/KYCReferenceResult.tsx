import React from 'react';
import KYCReferenceNumber from './KYCReferenceNumber';
import { KYCRefrenceNumber } from '../KYC.types';
import { KYCNotFoundBox } from './DownloadKYC.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const KYCReferenceResult: React.FC = () => {
  const [refrenceSearchAttempted, setRefrenceSearchAttempted] =
    React.useState(false);
  const onFindOtherDetail = (e: KYCRefrenceNumber) => {
    // e.preventDefault();
    if (e.authencationFactor !== '') {
      setRefrenceSearchAttempted(true);
    } else {
      setRefrenceSearchAttempted(false);
    }
  };
  return (
    <React.Fragment>
      <KYCReferenceNumber onFind={onFindOtherDetail} loading={false} />
      {refrenceSearchAttempted ? (
        <></>
      ) : (
        <KYCNotFoundBox>
          <ErrorOutlineIcon sx={{ color: '#ff6666', mr: 1 }} />
          No KYC record found
        </KYCNotFoundBox>
      )}
    </React.Fragment>
  );
};

export default KYCReferenceResult;
