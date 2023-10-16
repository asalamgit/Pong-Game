import { useFile } from '@/core/hooks/useFile';
import { User } from '@/core/types/User';
import { Avatar, Badge, styled } from '@mui/material';
import { CSSProperties } from 'react';

type Props = {
  id: number;
  state?: User['state'];
  alt: string;
};

export function UserPicture({ id, state, alt }: Props) {
  const { imageUrl } = useFile(id);

  let color: CSSProperties['color'];

  switch (state) {
    case 'ONLINE':
      color = '#44b700';
      break;
    case 'OFFLINE':
      color = 'grey';
      break;
    case 'IN_GAME':
      color = 'var(--color-blue)';
      break;
    default:
      color = 'grey';
  }

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: color,
      color,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    },
  }));

  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
    >
      <Avatar src={imageUrl} alt={alt} />
    </StyledBadge>
  );
}
