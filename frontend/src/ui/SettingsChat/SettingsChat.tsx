import { useOnClickOutside } from 'usehooks-ts';

import styles from './SettingsChat.module.scss';
import { useRef, useState } from 'react';
import { Channel, ChannelUser } from '@/pages/Chat/types/Chat';
import { ChannelCreate } from '../ChannelCreate/ChannelCreate';
import { ChannelMember } from '../ChannelMember/ChannelMember';
import { useUser } from '@/core/hooks/useUser';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import BlockIcon from '@mui/icons-material/Block';
import clsx from 'clsx';
import Tooltip from '@mui/material/Tooltip';

type Props = {
  editChannel: any;
  userQuit: (userId: number | undefined) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  channel: Channel;
  createChannel: any;
  usersBanList: ChannelUser[];
  manageUser: any;
  usersChannelList: ChannelUser[];
};

enum Tag {
  Info,
  Edit,
  UserBan,
}

export const SettingsChat = ({
  userQuit,
  setOpen,
  usersChannelList,
  manageUser,
  editChannel,
  channel,
  createChannel,
  usersBanList,
}: Props): JSX.Element => {
  const [selectedTag, setSelectedTag] = useState<Tag>(Tag.Info);
  const cardRef = useRef(null);
  const { user } = useUser();

  const handleClickOutside = () => {
    setOpen(false);
  };

  useOnClickOutside(cardRef, handleClickOutside);

  return (
    <div className={styles.settingsChat} ref={cardRef}>
      <ul className={styles.tags}>
        <li className={styles.tag} onClick={() => setSelectedTag(Tag.Info)}>
          <InfoIcon />
        </li>
        <li className={styles.tag} onClick={() => setSelectedTag(Tag.Edit)}>
          <EditIcon />
        </li>
        <li className={styles.tag} onClick={() => setSelectedTag(Tag.UserBan)}>
          <BlockIcon className={styles.blockIcon} />
        </li>
      </ul>
      {selectedTag === Tag.Info && (
        <div className={styles.containers}>
          <div className={styles.info}>
            <b className={styles.name}>{channel.name}</b>
            {channel.description ? (
              <Tooltip
                title={
                  channel.description.length > 300
                    ? `${channel.description.slice(0, 300)}...`
                    : channel.description
                }
                placement="bottom-end"
                arrow
              >
                <p className={styles.description}>{channel.description}</p>
              </Tooltip>
            ) : (
              <p className={styles.description}>
                This channel doesn't have a description yet
              </p>
            )}
            <p>Channel type: {channel.type}</p>
            <p>Members: {usersChannelList.length}</p>
          </div>
          <div className={styles.flex}>
            <button
              className={styles.quitButton}
              onClick={() => userQuit(user?.id)}
            >
              Leave channel
            </button>
          </div>
        </div>
      )}
      {selectedTag === Tag.Edit && (
        <ChannelCreate
          editChannel={editChannel}
          createChannel={createChannel}
          setOpenCreateChannel={setOpen}
          top="0"
          left="7.5%"
          defaultCreateChannel={{
            name: channel.name,
            description: channel.description,
            type: channel.type,
            password: '',
            action: 'edit',
          }}
        />
      )}
      {selectedTag === Tag.UserBan && (
        <div className={clsx(styles.containers, styles.center)}>
          <b className={styles.bannedTitle}>Banned users</b>
          {usersBanList.length ? (
            usersBanList.map((userChannel: ChannelUser, index: number) => (
              <ChannelMember
                user={usersChannelList.find((value) => value.id === user?.id)}
                target={usersBanList.find((val) => val.id === userChannel?.id)}
                manageUser={manageUser}
                bug={true}
                key={index}
              />
            ))
          ) : (
            <p>There are no banned members yet</p>
          )}
        </div>
      )}
    </div>
  );
};
