import { Profile } from './Profile';
import { Provider } from './Provider';

export type User = {
  id: number;
  username: string;
  image: string | undefined;
  state: 'OFFLINE' | 'ONLINE' | 'IN_GAME';
  isTwoFa: boolean;
  provider?: Provider;
  profile?: Profile;
};
