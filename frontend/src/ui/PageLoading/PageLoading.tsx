import { CircularProgress, Backdrop } from '@mui/material';

export function PageLoading() {
  return (
    <Backdrop open={true} sx={{ color: 'white' }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
