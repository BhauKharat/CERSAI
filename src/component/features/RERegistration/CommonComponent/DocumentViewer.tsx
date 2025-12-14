import React, { useState } from 'react';
import { Box } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TickCircle from '../../../../assets/tick-circle.svg';
import DocumentPreview from './DocumentPreview';

export interface DocumentViewerTrackStatusProps {
  document?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  };
  width?: number | string;
  height?: number | string;
  sx?: object;
}

const DocumentViewerTrackStatus: React.FC<DocumentViewerTrackStatusProps> = ({
  document,
  width = '40px',
  height = '40px',
  sx = {},
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!document) return null;

  const isImage = document.mimeType.startsWith('image/');
  const fileExtension =
    document.fileName.split('.').pop()?.toUpperCase() || 'FILE';
  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width,
          height,
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          // overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9f9f9',
          '&:hover': {
            opacity: 0.8,
            transform: 'scale(1.05)',
            transition: 'all 0.2s ease-in-out',
          },
          ...sx,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '0',
            right: '0',
            transform: 'translate(30%, -30%)',
            width: '16px',
            height: '16px',
            //   backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Box
            component="img"
            src={TickCircle}
            alt="Success"
            sx={{
              width: '16px',
              height: '16px',
            }}
          />
        </Box>
        {isImage ? (
          <Box
            onClick={() => setIsOpen(true)}
            component="img"
            src={document.dataUrl}
            alt={document.fileName}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          />
        ) : (
          <Box
            onClick={() => setIsOpen(true)}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9f9f9',
              cursor: 'pointer',
            }}
          >
            {fileExtension === 'PDF' ? (
              <PictureAsPdfIcon sx={{ fontSize: 24, color: '#d32f2f' }} />
            ) : (
              <DescriptionIcon sx={{ fontSize: 24, color: '#1976d2' }} />
            )}
          </Box>
        )}
      </Box>
      <DocumentPreview
        open={isOpen}
        onClose={() => setIsOpen(false)}
        documentUrl={document.dataUrl}
        documentName={document.fileName}
        showDelete={false}
        showChange={false}
        previewState={document}
      />
    </>
  );
};

export default DocumentViewerTrackStatus;
