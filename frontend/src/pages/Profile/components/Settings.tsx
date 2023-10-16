import {
  Box,
  Button,
  TextField,
  styled,
  Alert,
  Typography,
  Divider,
} from '@mui/material';
import { TwoFactor } from './TwoFactor';
import { ChangeEvent, useState } from 'react';
import { useUser } from '@/core/hooks/useUser';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckIcon from '@mui/icons-material/Check';
import { useFile } from '@/core/hooks/useFile';
import { useApi } from '@/core/hooks/useApi';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export function Settings() {
  const { user, setUser } = useUser();
  const [username, setUsername] = useState(user?.username);
  const [editUsername, setEditUsername] = useState(true);
  const { sendFile } = useFile(user?.id);
  const [errorUpload, setErrorUpload] = useState('');
  const [errorUsername, setErrorUsername] = useState('');
  const { api } = useApi();

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files?.length > 0) {
      const isUploaded = await sendFile(e.target.files[0]);
      if (isUploaded) {
        setErrorUpload('');
      } else {
        setErrorUpload('Error when uploading avatar');
      }
    }
  };

  const handleEditUsername = async () => {
    try {
      if (!editUsername && username !== user?.username) {
        const response = await api.post('/api/users/update_username', {
          username,
        });

        setUser(
          (prev) => prev && { ...prev, username: response.data.username }
        );
        setUsername(response.data.username);
        setErrorUsername('');
      }

      setEditUsername(!editUsername);
    } catch (err: any) {
      setErrorUsername(err.response.data.message[0]);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="2rem"
      marginTop="1rem"
    >
      <Box display="flex" flexDirection="column" gap="1rem">
        <Typography variant="body1">Change username</Typography>
        <Box display="flex" alignItems="center" gap="1rem">
          <TextField
            label="username"
            size="small"
            value={username}
            disabled={editUsername}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            variant="outlined"
            size="medium"
            color={
              editUsername ? 'primary' : errorUsername ? 'error' : 'success'
            }
            onClick={handleEditUsername}
          >
            {editUsername ? (
              <EditIcon color="primary" fontSize="medium" />
            ) : (
              <CheckIcon color="success" fontSize="medium" />
            )}
          </Button>
        </Box>
        {errorUsername && <Alert severity="error"> {errorUsername}</Alert>}
      </Box>
      <Divider flexItem />
      <TwoFactor />
      <Divider flexItem />
      <Box>
        <Box>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Upload Avatar
            <VisuallyHiddenInput
              type="file"
              accept="image/jpg,image/png,image/jpeg"
              onChange={onFileChange}
            />
          </Button>
        </Box>
        {errorUpload && (
          <Alert severity="error" sx={{ marginTop: '1rem' }}>
            {errorUpload}
          </Alert>
        )}
      </Box>
    </Box>
  );
}
