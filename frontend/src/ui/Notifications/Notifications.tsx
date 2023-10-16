import { Badge, IconButton, Popover } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { MouseEvent, useEffect, useState } from 'react';
import { useNotifications } from './hooks/useNotifications';
import { NotificationFriendship } from './components/NotificationFriendship';
import { NotificationType } from './types/NotificationType';

export function Notifications() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { notifications } = useNotifications();
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (notifications.length !== 0) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    if (notifications.length === 0) setAnchorEl(null);
  }, [notifications]);

  return (
    <>
      <IconButton onClick={handleClick} aria-describedby={id}>
        <Badge badgeContent={notifications.length} max={99} color="primary">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div style={{ padding: '1rem'}}>
          {notifications.map((notification, index) => {
            if (notification.type === NotificationType.FRIENDSHIP) {
              return (
                <NotificationFriendship
                  notification={notification}
                  key={index}
                />
              );
            }
            return null;
          })}
        </div>
      </Popover>
    </>
  );
}
