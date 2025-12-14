import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 24px;
  background: #f9f9f9;
  min-height: 100vh;
`;

export const ContentBox = styled.div`
  // background: #fff;
  // border-radius: 8px;
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
`;

export const KYCFoundBox = styled.div`
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const KYCNotFoundBox = styled.div`
  background: #ffebee;
  border: 1px solid #ef9a9a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 0px 0 24px 0;
`;

export const SearchTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
`;
