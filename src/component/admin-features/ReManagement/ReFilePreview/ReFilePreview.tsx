/* eslint-disable prettier/prettier */
import { Box, styled } from '@mui/material';
import React from 'react';
import thumbnail from '../../../../assets/thumbnail.png';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type PreviewProps = {
    file: File | null;
};

const PreviewImage = styled("img")(() => ({
    
    height: "40px",
    objectFit: "contain",
    width:'auto'
}));

const PreviewBoxWrapper = styled("div")( () => ({
    position: "relative",
    display: "inline-block",
    borderRadius: "3px",
    overflow: "hidden",
    marginTop: "10px",
    flexShrink: 0,
    border:`1px solid #ccc`,
}) );

const StatusIconBox = styled(Box)(() => ({
    position: "absolute",
    top: "-4px",
    right: "-8px",
    fontSize: "18px",
    borderRadius: "50%",
    padding: "2px 6px",
    pointerEvents: "none",
    userSelect: "none",
    lineHeight: "1",
    
}))



export const ReFilePreview: React.FC<PreviewProps> = ({ file }) => {
    if (!file) return null;

    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type;

    if (fileType.startsWith('image/')) {

        return <PreviewImage src={fileUrl} alt={file.name} />;
    }






    return (
        <React.Fragment>
            <PreviewBoxWrapper
                
            >
                <PreviewImage
                    src={thumbnail}
                    alt="Preview"
                    className="preview-image"
                    
                />

                <StatusIconBox
              
                >

                    <CheckCircleIcon style={{ fontSize: '18px', color:`#4caf50` }} />

                </StatusIconBox>

            </PreviewBoxWrapper>
        </React.Fragment>
    );
};
