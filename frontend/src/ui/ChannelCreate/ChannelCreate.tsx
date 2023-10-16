import { CreateChannel, Type } from '@/pages/Chat/types/Chat';
import { useRef, useState } from 'react';
import styles from './ChannelCreate.module.scss';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';
import { clsx } from 'clsx';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ExpandMore } from '@mui/icons-material';

type Props = {
  createChannel: (data: CreateChannel) => void;
  setOpenCreateChannel: (value: React.SetStateAction<boolean>) => void;
  editChannel: any;
  top: string;
  left: string;
  defaultCreateChannel: CreateChannel;
};

export function ChannelCreate({
  editChannel,
  createChannel,
  setOpenCreateChannel,
  defaultCreateChannel,
  top,
  left,
}: Props) {
  const [openOptions, setOpenOptions] = useState(false);
  const cardRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createChannelData, setCreateChannelData] =
    useState<CreateChannel>(defaultCreateChannel);

  const handleShowPassword = () => setShowPassword(!showPassword);

  const addChannel = (event: React.FormEvent) => {
    event.preventDefault();
    if (createChannelData.action === 'edit')
      editChannel({
        name: createChannelData.name,
        description: createChannelData.description,
        type: createChannelData.type,
        password: createChannelData.password,
      });
    else
      createChannel({
        name: createChannelData.name,
        description: createChannelData.description,
        type: createChannelData.type,
        password: createChannelData.password,
      });
    setCreateChannelData(defaultCreateChannel);
    setOpenCreateChannel(false);
  };

  const handleClickOutside = () => {
    if (createChannelData.action !== 'edit') setOpenCreateChannel(false);
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setOpenCreateChannel(false);
  };

  const handleOpen = () => {
    setOpenOptions(!openOptions);
  };

  useEventListener('keydown', handleEscape);
  useOnClickOutside(cardRef, handleClickOutside);

  return (
    <div className={styles.container} style={{ top, left }}>
      <form
        onSubmit={addChannel}
        className={styles.card}
        ref={cardRef}
        style={{
          borderRadius:
            createChannelData.action === 'edit' ? '0 24px 24px 0' : '24px',
        }}
      >
        <p>
          {createChannelData.action === 'edit' ? 'EDIT CHANNEL' : 'NEW CHANNEL'}
        </p>
        <div>
          <input
            className={styles.name}
            type="text"
            placeholder="Channel name"
            value={createChannelData.name.trim()}
            onChange={(event) =>
              setCreateChannelData((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
          />
        </div>
        <textarea
          className={styles.description}
          placeholder="Channel description"
          value={createChannelData.description}
          onChange={(event) =>
            setCreateChannelData((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
        />
        <div onClick={handleOpen} className={styles.dropdown}>
          <ExpandMore
            className={clsx(
              openOptions && styles.transformExpand,
              styles.expand
            )}
          />
        </div>
        {openOptions && (
          <div className={styles.options}>
            <label className={styles.radio}>
              <input
                type="radio"
                name="type"
                value={createChannelData.type}
                checked={createChannelData.type === Type.PUBLIC}
                onChange={() =>
                  setCreateChannelData((prev) => ({
                    ...prev,
                    type: Type.PUBLIC,
                  }))
                }
              />
              public
            </label>
            <div className={styles.protected}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="type"
                  value={createChannelData.type}
                  data-lpignore="true"
                  checked={createChannelData.type === Type.PROTECTED}
                  onChange={() =>
                    setCreateChannelData((prev) => ({
                      ...prev,
                      type: Type.PROTECTED,
                    }))
                  }
                />
                protected
              </label>
              {createChannelData.type === Type.PROTECTED && (
                <div className={styles.inputContainer}>
                  <input
                    className={styles.protectedInput}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={createChannelData.password}
                    onChange={(e) =>
                      setCreateChannelData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                  {showPassword ? (
                    <Visibility
                      onClick={handleShowPassword}
                      className={styles.passwordIcon}
                    />
                  ) : (
                    <VisibilityOff
                      onClick={handleShowPassword}
                      className={styles.passwordIcon}
                    />
                  )}
                </div>
              )}
            </div>
            <label className={styles.radio}>
              <input
                type="radio"
                name="type"
                value={createChannelData.type}
                checked={createChannelData.type === Type.PRIVATE}
                onChange={() =>
                  setCreateChannelData((prev) => ({
                    ...prev,
                    type: Type.PRIVATE,
                  }))
                }
              />
              private
            </label>
          </div>
        )}
        <div className={styles.buttonPosition}>
          <button className={styles.save} type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
