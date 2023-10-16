import styles from './ContextMenu.module.scss';
import { ReactNode, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

type Props = {
  children: ReactNode;
  menu: ReactNode;
  bug?: boolean;
};

export function ContextMenu({ children, menu, bug = false }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });
  const menuRef = useRef(null);

  const handleOpen = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowMenu(true);
    if (bug) {
      const bounding = (e.target as HTMLDivElement).getBoundingClientRect();
      const relativeX = e.clientX - bounding.left;
      const relativeY = e.clientY - bounding.top;
      setPoints({ x: relativeX, y: relativeY });
    } else setPoints({ x: e.pageX, y: e.pageY });
  };

  const handleClick = () => {
    setShowMenu(false);
  };

  useOnClickOutside(menuRef, handleClick);

  return (
    <div>
      <div onContextMenu={handleOpen}>{children}</div>
      {showMenu && (
        <div
          ref={menuRef}
          className={styles.menu}
          style={{ left: points.x, top: points.y }}
        >
          <div className={styles.container}>{menu}</div>
        </div>
      )}
    </div>
  );
}
