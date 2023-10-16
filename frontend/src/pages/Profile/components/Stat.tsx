import { Box, Typography } from '@mui/material';

type Props = {
  value: number;
  type: string;
};

export function Stat({ value, type }: Props) {
  return (
    <Box
      padding="0.5rem 2rem"
      bgcolor="var(--color-gray-600)"
      borderRadius="12px"
    >
      <Typography
        fontFamily="Poppins"
        fontWeight={600}
        color="var(--color-gray-1000)"
        textAlign="center"
      >
        {value}
      </Typography>
      <Typography
        color="var(--color-light-gray)"
        fontFamily="Poppins"
        fontWeight={600}
        textAlign="center"
      >
        {type}
      </Typography>
    </Box>
  );
}
