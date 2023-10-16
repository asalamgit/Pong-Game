import styles from './ChannelMember.module.scss';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { ChannelUser, UserActions } from '@/pages/Chat/types/Chat';
import { MenuOption } from '../ContextMenu/MenuOption';
import { useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { Link, useNavigate } from 'react-router-dom';
import { UserPicture } from '../UserPicture/UserPicture';

type Props = {
  user: ChannelUser | undefined;
  target: ChannelUser | undefined;
  manageUser: (type: UserActions, user: ChannelUser, timeMute?: number) => void;
  bug: boolean;
};

export function ChannelMember({
  target,
  bug,
  user,
  manageUser,
}: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  const [timeMute, setTimeMute] = useState(600);
  const cardRef = useRef(null);
  const handleTimeMuteChange = (event: any) => setTimeMute(event.target.value);
  const handleClickOutside = () => setOpen(false);
  const navigate = useNavigate();

  useOnClickOutside(cardRef, handleClickOutside);

  if (!user || !target) return <></>;

  return (
    <ContextMenu
      menu={
        <div>
          <MenuOption onClick={() => navigate(`/profile/${target.id}`)}>
            Profile
          </MenuOption>
          {target.id !== user.id && (
            <div>
              {user.isOwner && (
                <>
                  <MenuOption
                    onClick={() => manageUser(UserActions.Kick, target)}
                  >
                    Kick
                  </MenuOption>
                  <MenuOption
                    onClick={() => manageUser(UserActions.Ban, target)}
                  >
                    {target.isBan ? 'Unban' : 'Ban'}
                  </MenuOption>
                  <MenuOption onClick={() => setOpen(true)}>Mute</MenuOption>
                  <MenuOption
                    onClick={() =>
                      manageUser(
                        target.isAdmin
                          ? UserActions.UnsetAsAdmin
                          : UserActions.SetAsAdmin,
                        target
                      )
                    }
                  >
                    {target.isAdmin ? 'unset as admin' : 'set as admin'}
                  </MenuOption>
                </>
              )}
              {!user.isOwner && user.isAdmin && !target.isAdmin && (
                <div>
                  <MenuOption
                    onClick={() => manageUser(UserActions.Kick, target)}
                  >
                    Kick
                  </MenuOption>
                  <MenuOption
                    onClick={() => manageUser(UserActions.Ban, target)}
                  >
                    {target.isBan ? 'Unban' : 'Ban'}
                  </MenuOption>
                  <MenuOption onClick={() => setOpen(true)}>Mute</MenuOption>
                  <MenuOption
                    onClick={() => manageUser(UserActions.SetAsAdmin, target)}
                  >
                    set as admin
                  </MenuOption>
                </div>
              )}
              <MenuOption onClick={() => manageUser(UserActions.Block, target)}>
                {target.isBlocked ? 'Unblock' : 'Block'}
              </MenuOption>
              <MenuOption>
                <Link
                  to={'/game'}
                  state={{ opponent: target.id }}
                  style={{ color: 'white' }}
                >
                  Invite to play
                </Link>
              </MenuOption>
            </div>
          )}
        </div>
      }
      bug={bug}
    >
      <div className={styles.profile}>
        <UserPicture id={target?.id} state={'ONLINE'} alt="Profile user" />
        <p className={styles.userName}>
          {target.username}
          {target.isBlocked && ' -- BLOCKED'}
        </p>
      </div>
      {open && (
        <div className={styles.modal} ref={cardRef}>
          <h3 className={styles.title}>Mute {target.username}</h3>
          <p className={styles.disclaimer}>
            This user will be prevented from sending messages until the end of
            this duration
          </p>
          <div className={styles.duration}>
            <input
              className={styles.input}
              type="number"
              value={timeMute}
              onChange={handleTimeMuteChange}
            />
            <p className={styles.seconds}>seconds</p>
          </div>
          <button
            className={styles.muteButton}
            onClick={() => {
              manageUser(UserActions.Mute, target, timeMute);
              setOpen(false);
            }}
          >
            MUTE
          </button>
        </div>
      )}
    </ContextMenu>
  );
}
