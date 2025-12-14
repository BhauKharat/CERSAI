/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import ArrowUpwardSharpIcon from '@mui/icons-material/ArrowUpwardSharp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Controller, useFormContext } from 'react-hook-form';

const UploadMainWrapper = styled(Box)({
  display: 'flex',
  gap: '10px',
  alignItems: 'center'
});

const UploadMainButtonDiv = styled('label')({
  flex: 1,
  minWidth: '200px',
  padding: '12px',
  border: '1px solid #002cba',
  background: "#fff",
  color: "#002cba",
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  justifyContent: 'center',
  fontSize: '16px',
  boxSizing: 'border-box',
  fontWeight: '400'
});

const ImagePreviewBox = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  borderRadius: '3px',
  overflow: 'hidden',
  flexShrink: 0,
  border: '1px solid #ccc',
  marginTop: '0px',
  height: '50px',
  width: '50px'
});

const Image = styled("img")({
  width: '100%',
  height: '100%',
  objectFit: 'cover'
});

const StatusIcon = styled(Box)({
  position: 'absolute',
  top: '-4px',
  right: '-8px',
  fontSize: '18px',
  borderRadius: '50%',
  padding: '2px 6px',
  pointerEvents: 'none',
  userSelect: 'none',
  lineHeight: '1',
  color: '#4caf50'
});

interface FileUploadFieldProps {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  initialFile: string
}

const ErrorMessage = styled('span')(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 500,
  color: 'red',

}))

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  name,
  label,
  accept = '.jpg,.jpeg',
  required = false,
  initialFile
}) => {

  const { watch, control, setValue, formState: { errors }, trigger, clearErrors, setError } = useFormContext();

  const fieldValue = watch(initialFile)


  const [uploadedFile, setUploadedFile] = useState<{
    file: File | null;
    preview: string | null;
  }>({ file: null, preview: null });



  useEffect(() => {
    if (fieldValue) {
      setUploadedFile({ file: null, preview: fieldValue });
    } else {
      setUploadedFile({ file: null, preview: null });
    }
  }, [fieldValue]);

  const getImageSrc = (base64?: string | null) => {
    if (!base64) return undefined;

    if (base64.startsWith('blob')) {
      return base64
    } else {
      return base64.startsWith("data:")
        ? base64
        : `data:image/png;base64,${base64}`;
    }

  };

  return (

    <Controller
      name={name}
      control={control}
      render={({ field: { onChange } }) => {
        const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (file) {
            const isJpeg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name);
            if (!isJpeg) {
              setValue(name, null);
              setValue(initialFile, '');
              setUploadedFile({ file: null, preview: null });
              setError(name, { type: 'validate', message: 'Only JPG/JPEG files are allowed' });
              event.target.value = '';
              return;
            }
            const previewUrl = URL.createObjectURL(file);
            onChange(file)

            setValue(name, file);
            setValue(initialFile, previewUrl)
            clearErrors(name)
            await trigger(name)

          }
          event.target.value = '';
        };

        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 0, fontWeight: 500 }}>
              {label} {required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <UploadMainWrapper>
              <UploadMainButtonDiv>
                <span className="icon-circle">
                  <ArrowUpwardSharpIcon />
                </span>
                Upload
                <input
                  type="file"
                  accept={accept}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  name={name}
                />

                
              </UploadMainButtonDiv>

         

              {uploadedFile.preview && (
                <ImagePreviewBox>
                  <Image src={getImageSrc(uploadedFile.preview)} alt={`${label} Preview`} />
                  <StatusIcon>
                    <CheckCircleIcon style={{ fontSize: '18px', color: 'green' }} />
                  </StatusIcon>
                </ImagePreviewBox>
              )}
            </UploadMainWrapper>

            {errors[name] && (
                  <ErrorMessage>
                    {errors[name]?.message as string} *
                  </ErrorMessage>
                )}
          </Box>
        )
      }}
    />

  );
};

export default FileUploadField;