import { ReactNode } from 'react';
import { Skeleton, Typography } from '@mui/material';

type Props = {
  children: ReactNode;
  loading?: boolean;
};

export function Name({ children, loading = false }: Props) {
  return (
    <Typography
      variant="h6"
      fontFamily="Poppins"
      fontWeight="600"
      color="var(--color-gray-1000)"
      component="div"
    >
      {loading ? <Skeleton width={100} /> : children}
    </Typography>
  );
}
