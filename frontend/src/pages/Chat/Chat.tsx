import styles from './Chat.module.scss';

import { JSX, useEffect, useRef, useState } from 'react';

import { MessageType, Channel, ChannelUser, Type } from './types/Chat';
import { useMessage } from './hooks/useMessage';
import { useChannel } from './hooks/useChannel';
import { useUsersChannel } from './hooks/useUserChannel';
import { ChannelMember } from '@/ui/ChannelMember/ChannelMember';
import { SearchBar } from '@/ui/SearchBar/SearchBar';
import { Message } from '@/ui/Message/Message';
import { MessageInput } from '@/ui/MessageInput/MessageInput';
import { ChannelCreate } from '@/ui/ChannelCreate/ChannelCreate';
import { JoinProtected } from '@/ui/JoinProtected/JoinProtected';
import { useUser } from '@/core/hooks/useUser';
import SettingsIcon from '@mui/icons-material/Settings';
import { SettingsChat } from '@/ui/SettingsChat/SettingsChat';
import { useOnClickOutside } from 'usehooks-ts';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import { ReactComponent as Close } from '@/assets/close.svg';
import { ReactComponent as Menu } from '@/assets/menu.svg';

export function Chat(): JSX.Element {
  const {
    userQuit,
    blockUser,
    createChannel,
    leaveChannel,
    joinChannel,
    manageUser,
    editChannel,
    directMessagesExist,
    channels,
    selectedChannel,
    directMessages,
  } = useChannel();
  const { sendMessage, messages } = useMessage(selectedChannel?.id);
  const {
    usersChannelList,
    getUsersDirectMessage,
    directMessageList,
    usersBanList,
  } = useUsersChannel(selectedChannel?.id);
  const inputRef = useRef(null);
  const [openCreateChannel, setOpenCreateChannel] = useState(false);
  const [openNewMsg, setOpenNewMsg] = useState(false);

  const [protectedChannelClicked, setProtectedChannelClicked] =
    useState<Channel>();
  const messagesRef = useRef<HTMLDivElement>(null);
  const [searchDirectMessage, setSearchDirectMessage] = useState('');
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [showTab, setShowTab] = useState(false);

  useEffect(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current?.scrollHeight;
  }, [messages]);
  const handleLeaveChannel = () => {
    if (selectedChannel) leaveChannel(selectedChannel?.id);
  };

  const createDirectMessageChannel = (user: ChannelUser) => {
    directMessagesExist(user.username);
  };

  const handleClickOutside = () => {
    setOpenNewMsg(false);
  };

  useOnClickOutside(inputRef, handleClickOutside);

  // const ifShowTab = () => {
  //   if (!showTab) return styles.hideTab;
  //   return styles.showTab;
  // };

  return (
    <div className={styles.chat}>
      <div
        className={clsx(styles.tab, !showTab ? styles.hideTab : styles.showTab)}
      >
        <button className={styles.closeTab} onClick={() => setShowTab(false)}>
          <Close />
        </button>
        {selectedChannel ? (
          <div>
            <div className={styles.tabHeader}>
              <p className={styles.channelReturnHeader}>
                <span
                  className={styles.channelReturn}
                  onClick={handleLeaveChannel}
                >
                  {'< '}
                </span>
                All Channels
              </p>
            </div>
            <div className={styles.channelSettings}>
              <p className={styles.currentChannelName}>
                {selectedChannel.name}
              </p>
              <SettingsIcon
                className={styles.settingIcon}
                onClick={() => setOpen(!open)}
              />
            </div>
            {open && (
              <SettingsChat
                usersChannelList={usersChannelList}
                manageUser={manageUser}
                usersBanList={usersBanList}
                userQuit={userQuit}
                editChannel={editChannel}
                setOpen={setOpen}
                channel={selectedChannel}
                createChannel={createChannel}
              />
            )}
            <Tooltip
              title={
                selectedChannel.description.length > 300
                  ? `${selectedChannel.description.slice(0, 300)}...`
                  : selectedChannel.description
              }
              placement="bottom-end"
              arrow
            >
              <p className={styles.currentChannelDescription}>
                {selectedChannel.description}
              </p>
            </Tooltip>
            <p className={styles.members}>MEMBERS</p>
            <div className={styles.channelMember}>
              {usersChannelList &&
                usersChannelList.map(
                  (userChannel: ChannelUser, index: number) => (
                    <ChannelMember
                      user={usersChannelList.find(
                        (value) => value.id === user?.id
                      )}
                      target={usersChannelList.find(
                        (val) => val.id === userChannel?.id
                      )}
                      manageUser={manageUser}
                      bug={false}
                      key={index}
                    />
                  )
                )}
            </div>
          </div>
        ) : (
          <div className={styles.channelsList}>
            <div className={styles.channelSection}>
              <div className={styles.tabHeader}>
                <p className={styles.channelsHeader}>
                  Channels{' '}
                  <span
                    className={styles.newChannelIcon}
                    onClick={() => setOpenCreateChannel(true)}
                  >
                    +
                  </span>
                </p>
              </div>
              {openCreateChannel && (
                <ChannelCreate
                  createChannel={createChannel}
                  editChannel={editChannel}
                  setOpenCreateChannel={setOpenCreateChannel}
                  top={'30%'}
                  left={'35%'}
                  defaultCreateChannel={{
                    name: '',
                    description: '',
                    type: Type.PUBLIC,
                    password: '',
                    action: 'create',
                  }}
                />
              )}
              <SearchBar
                channels={channels}
                setProtectedChannelClicked={setProtectedChannelClicked}
                joinChannel={joinChannel}
              />
            </div>
            <div className={styles.channelSection}>
              <div className={styles.directHeader} ref={inputRef}>
                Messages
                <span
                  className={styles.newChannelIcon}
                  onClick={() => setOpenNewMsg(true)}
                >
                  +
                </span>
                {openNewMsg && (
                  <div className={styles.searchDirect}>
                    <input
                      className={styles.newMsgInput}
                      type="text"
                      placeholder="Start a conversation"
                      autoFocus={true}
                      value={searchDirectMessage}
                      onChange={(e) => setSearchDirectMessage(e.target.value)}
                      onFocus={getUsersDirectMessage}
                    />
                    <div className={styles.directMessageWrapper}>
                      {directMessageList &&
                        searchDirectMessage &&
                        directMessageList
                          .filter((user) =>
                            user.username.includes(searchDirectMessage)
                          )
                          .map((user: ChannelUser, index: number) => (
                            <p
                              className={styles.directName}
                              key={index}
                              onClick={() => {
                                createDirectMessageChannel(user);
                                setSearchDirectMessage('');
                              }}
                            >
                              {user.username}
                            </p>
                          ))}
                    </div>
                  </div>
                )}
              </div>
              <SearchBar
                channels={directMessages}
                setProtectedChannelClicked={setProtectedChannelClicked}
                joinChannel={joinChannel}
              />
              {protectedChannelClicked && (
                <JoinProtected
                  protectedChannelClicked={protectedChannelClicked}
                  setProtectedChannelClicked={setProtectedChannelClicked}
                  joinChannel={joinChannel}
                />
              )}
            </div>
          </div>
        )}
      </div>
      <div className={styles.message}>
        <div className={styles.messageHeader}>
          <button
            className={styles.showTabButton}
            onClick={() => setShowTab(!showTab)}
          >
            <Menu />
          </button>
        </div>

        {selectedChannel ? (
          <div className={styles.messageWrapper}>
            <div ref={messagesRef} className={styles.messagesScroll}>
              {messages &&
                messages.map((message: MessageType, index: number) => (
                  <Message message={message} key={index} />
                ))}
            </div>
            <MessageInput
              usersList={usersChannelList.filter(
                (value) => value.id !== user?.id
              )}
              selectedChannel={selectedChannel}
              unblock={blockUser}
              sendMessage={sendMessage}
            />
          </div>
        ) : (
          <div className={styles.actions}>
            <p className={styles.select}>Select a channel or a message</p>
            <p>Choose from your existing conversations or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
