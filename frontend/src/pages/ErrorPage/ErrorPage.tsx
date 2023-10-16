import { Box, Button, Typography } from '@mui/material';

export function ErrorPage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="4rem"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Typography variant="h2">Something went wrong</Typography>
      <Button
        variant="outlined"
        onClick={() => {
          window.location.href = `http://${window.location.hostname}:8080/`;
        }}
      >
        BACK HOME
      </Button>
    </Box>
  );
}
