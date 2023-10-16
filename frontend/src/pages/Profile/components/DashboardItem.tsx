import { Box, Divider, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
};

export function DashboardItem({ title, children, titleIcon }: Props) {
  return (
    <Box
      width="80%"
      height="100%"
      borderRadius="12px"
      bgcolor="var(--color-white)"
      boxShadow="rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px"
    >
      <Box padding="1rem" height="100%">
        <Box display="flex" alignItems="center" gap="1rem">
          {titleIcon}
          <Typography variant="h4" color="primary">
            {title}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ width: '100%', height: 450, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
