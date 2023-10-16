import { CSSProperties } from 'react';
import { Avatar, Skeleton } from '@mui/material';
import { useFile } from '@/core/hooks/useFile';

type Props = {
  id?: number;
  size?: number;
  loading?: boolean;
};

export function Picture({ size = 150, loading = false, id }: Props) {
  const { imageUrl } = useFile(id);
  const style: CSSProperties = {
    height: size,
    width: size,
  };

  if (loading) return <Skeleton sx={style} variant="rounded" />;

  return <Avatar src={imageUrl} sx={style} variant="rounded" />;
}
