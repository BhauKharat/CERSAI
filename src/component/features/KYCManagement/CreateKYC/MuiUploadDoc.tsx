import React from 'react';
import { Grid, Button, InputLabel, Typography, Box } from '@mui/material';

interface FileUploadProps {
  label: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  value?: File | null; // optional to show file name
}

const MuiUploadDoc: React.FC<FileUploadProps> = ({
  label,
  name,
  onChange,
  required = false,
  value,
}) => {
  return (
    <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
      <InputLabel required={required}>{label}</InputLabel>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          component="label"
          fullWidth={value ? false : true}
          sx={{
            color: 'rgb(0, 44, 186)',
            borderColor: 'rgb(0, 44, 186)',
            textTransform: 'none',
            width: '100%',
          }}
        >
          Upload
          <input
            type="file"
            name={name}
            hidden
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onChange}
          />
        </Button>

        {value && (
          <>
            {value.type.startsWith('image/') ? (
              <Box
                component="img"
                src={URL.createObjectURL(value)}
                alt="preview"
                sx={{
                  width: 50,
                  height: 50,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #ddd',
                }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: 'gray', wordBreak: 'break-word' }}
              >
                {value.name}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Grid>
  );
};

export default MuiUploadDoc;
