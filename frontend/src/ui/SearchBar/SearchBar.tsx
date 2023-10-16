import { useState } from 'react';
import styles from './SearchBar.module.scss';
import { Channel, Type } from '@/pages/Chat/types/Chat';
import { ChannelName } from '../ChannelName/ChannelName';
import { Search } from '@mui/icons-material';

type Props = {
  channels: Channel[];
  setProtectedChannelClicked: React.Dispatch<
    React.SetStateAction<Channel | undefined>
  >;
  joinChannel: (channelId: string, password?: string | undefined) => void;
};

export function SearchBar({
  channels,
  setProtectedChannelClicked,
  joinChannel,
}: Props) {
  const [channelInput, setChannelInput] = useState('');

  const handleJoinChannel = (channel: Channel) => {
    switch (channel.type) {
      case Type.PROTECTED:
        setProtectedChannelClicked(channel);
        break;
      default:
        joinChannel(channel.id);
        break;
    }
  };

  if (channels.length)
    return (
      <div className={styles.container}>
        <div className={styles.inputBar}>
          <Search sx={{ color: 'white' }} />
          <input
            className={styles.input}
            type="text"
            placeholder="Search"
            value={channelInput}
            onChange={function handleInputChange(e) {
              setChannelInput(e.target.value);
            }}
          />
        </div>
        <div className={styles.channelsWrapper}>
          {channels &&
            channels
              .filter((channel: Channel) => {
                if (!channelInput) return true;
                return channel.name
                  .toLowerCase()
                  .startsWith(channelInput.trim().toLowerCase());
              })
              .map((channel: Channel, index: number) => (
                <ChannelName
                  channel={channel}
                  onClick={() => handleJoinChannel(channel)}
                  key={index}
                />
              ))}
        </div>
      </div>
    );
}
