import { createTheme, darkScrollbar } from '@mui/material';
import { grey } from '@mui/material/colors';

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          ...darkScrollbar({
            track: grey[200],
            thumb: grey[400],
            active: grey[400],
          }),
          scrollbarWidth: 'thin',
        },
      },
    },
  },
  typography: {
    fontFamily: ['Noto Sans', 'Poppins'] as any, // material mui does not work very well with typescript
  },
});
