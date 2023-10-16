import {
  Button,
  Dialog,
  Typography,
  Box,
  Divider,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useTwoFactor } from '../hooks/useTwoFactor';
import { TwoFactorInput } from '@/ui/TwoFactorInput/TwoFactorInput';

export function TwoFactor() {
  const {
    open,
    qrCode,
    secret,
    handleClose,
    handleOpen,
    onTwoFactorInputChange,
    onEnableTwoFactor,
    onDisableTwoFactor,
    isTwoFaEnable,
    error,
  } = useTwoFactor();

  const onSubmit = () => {
    isTwoFaEnable ? onDisableTwoFactor() : onEnableTwoFactor();
  };

  return (
    <div>
      <Button onClick={handleOpen} variant="contained">
        {isTwoFaEnable ? 'Disable 2FA' : 'Enable 2FA'}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="2fa-title"
        aria-describedby="configure-two-factor-authentication"
      >
        <DialogTitle id="2fa-title">
          Two-Factor Authentication (2FA)
        </DialogTitle>
        <Divider />
        <DialogContent id="configure-two-factor-authentication" dividers>
          <Box display="flex" flexDirection="column" gap="1rem">
            {isTwoFaEnable ? (
              <TwoFactorInput
                onChange={onTwoFactorInputChange}
                onSubmit={onSubmit}
              />
            ) : (
              <>
                <Box>
                  <Typography variant="h6" color="var(--color-blue)">
                    Configuring Google Authenticator
                  </Typography>
                  <Divider />
                </Box>
                <Box>
                  <Typography variant="body1">
                    1. Install Google Authenticator (IOS - android).
                  </Typography>
                  <Typography variant="body1">
                    2. In the authenticator app, select "+" icon.
                  </Typography>
                  <Typography variant="body1">
                    3. Select "Scan a barcode (or QR code)" and use the phone's
                    camera to scan this barcode
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" color="var(--color-blue)">
                    Scan QR Code
                  </Typography>
                  <Divider />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center">
                  {qrCode && <img src={qrCode} />}
                </Box>

                <Box>
                  <Typography variant="h6" color="var(--color-blue)">
                    Or Enter Code Into Your App
                  </Typography>
                  <Divider />
                </Box>
                <Typography variant="body1">SecretKey: {secret}</Typography>

                <Box>
                  <Typography variant="h6" color="var(--color-blue)">
                    Verify Code
                  </Typography>
                  <Divider />
                </Box>
                <Box>
                  <Typography variant="body1" marginBottom="1rem">
                    For changing the setting, please verify the authentication
                    code
                  </Typography>
                  <TwoFactorInput
                    onChange={onTwoFactorInputChange}
                    onSubmit={onSubmit}
                  />
                </Box>

                <Divider />
              </>
            )}
            <Box display="flex" alignItems="center" gap="1rem">
              <Button onClick={handleClose} variant="outlined">
                Close
              </Button>
              <Button
                onClick={onSubmit}
                variant="contained"
                color={error ? 'error' : 'primary'}
              >
                Verify & {isTwoFaEnable ? 'Disable' : 'Activate'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}
