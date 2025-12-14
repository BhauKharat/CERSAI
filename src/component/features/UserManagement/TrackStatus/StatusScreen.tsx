/* eslint-disable prettier/prettier */
import { Box, styled, Typography } from '@mui/material';
import React from 'react';
import ApprovalPending from '../../../../assets/app_pending.svg';
import RejectedIcon from '../../../../assets/rejected_icon.svg';
import ApprovedIcon from '../../../../assets/approved_icon.svg'

type Status = 'Approval Pending' | 'Approved' | 'Pending' | 'PENDING' | 'Rejected';
type Props = {
  status: Status;
  rejectedBy?: string;
  rejectedOn?: string;
  remark?: string;
  approvedBy?: string;
  approvedOn?: string;
};

const ApprovalPendingWrapper = styled(Box)(() => ({
  background: 'rgba(255, 255, 185, 1)',
  margin: '10px 0',
  padding: '15px 15px',
  borderRadius: '4px',
}));

const RejectedStatusWrapper = styled(Box)(() => ({
  background: 'rgba(255, 234, 234, 1)',
  margin: '10px 0',
  padding: '15px 15px',
  borderRadius: '4px',
}));

const ApprovedStatusWrapper = styled(RejectedStatusWrapper)(() => ({
    background: 'rgba(230, 255, 228, 1)',
}))

const RejectedContent = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));



const RejectedContentDetails = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

const RejectedDetails = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  marginTop:'20px'
}));

const ApprovalContent = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const StatusTypo = styled(Typography)(() => ({
  marginLeft: '10px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '24px',
}));

const DetailsHeadTypo = styled(Typography)(() => ({
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '24px',
  color:'rgba(123, 123, 123, 1)'
}));

const DetailsValueTypo = styled(Typography)(() => ({
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  lineHeight: '24px',
}));

const StatusScreen: React.FC<Props> = ({
  status,
    rejectedBy,
    rejectedOn,
    remark,
    approvedBy,
    approvedOn,
}) => {
  const renderCard = (
    status: Status,
      rejectedBy?: string,
      rejectedOn?: string,
      remark?: string,
      approvedBy?: string,
      approvedOn?: string
  ) => {
    if (status === 'Approval Pending' || status === 'PENDING') {
      return (
        <React.Fragment>
          <ApprovalPendingWrapper>
            <ApprovalContent>
              <img src={ApprovalPending} alt="Approval Pending" />
              <StatusTypo>Approval Pending</StatusTypo>
            </ApprovalContent>
          </ApprovalPendingWrapper>
        </React.Fragment>
      );
    } else if (status === 'Approved') { 
      return <React.Fragment>
        <ApprovedStatusWrapper>
            <RejectedContent>
              <img src={ApprovedIcon} alt="Approved" />
              <StatusTypo>Request {status}</StatusTypo>
            </RejectedContent>
             <RejectedDetails>
              <RejectedContentDetails>
                <DetailsHeadTypo>Approved By</DetailsHeadTypo>
                <DetailsValueTypo>{approvedBy}</DetailsValueTypo>
              </RejectedContentDetails>
              <RejectedContentDetails>
                <DetailsHeadTypo>Approved On</DetailsHeadTypo>
                <DetailsValueTypo>{approvedOn}</DetailsValueTypo>
              </RejectedContentDetails>
              {/* <RejectedContentDetails>
                <DetailsHeadTypo>Remark</DetailsHeadTypo>
                <DetailsValueTypo>{remark}</DetailsValueTypo>
              </RejectedContentDetails> */}
            </RejectedDetails>
        </ApprovedStatusWrapper>
      </React.Fragment>;
    } else {
      return (
        <React.Fragment>
          <RejectedStatusWrapper>
            <RejectedContent>
              <img src={RejectedIcon} alt="Rejected" />
              <StatusTypo>Request {status}</StatusTypo>
            </RejectedContent>
            <RejectedDetails>
              <RejectedContentDetails>
                <DetailsHeadTypo>Rejected By</DetailsHeadTypo>
                <DetailsValueTypo>{rejectedBy}</DetailsValueTypo>
              </RejectedContentDetails>
              <RejectedContentDetails>
                <DetailsHeadTypo>Rejected On</DetailsHeadTypo>
                <DetailsValueTypo>{rejectedOn}</DetailsValueTypo>
              </RejectedContentDetails>
              <RejectedContentDetails>
                <DetailsHeadTypo>Remark</DetailsHeadTypo>
                <DetailsValueTypo>{remark}</DetailsValueTypo>
              </RejectedContentDetails>
            </RejectedDetails>
          </RejectedStatusWrapper>
        </React.Fragment>
      );
    }
  };
  return <React.Fragment>{renderCard(status, rejectedBy, rejectedOn, remark, approvedBy, approvedOn)}</React.Fragment>;
};

export default StatusScreen;
