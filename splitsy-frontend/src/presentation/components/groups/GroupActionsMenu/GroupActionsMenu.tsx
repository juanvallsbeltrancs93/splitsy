import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useGroupActionsMenu } from './useGroupActionsMenu';
import type { GroupActionsMenuProps } from './types';
import './styles.css';

export function GroupActionsMenu({ onEdit, onDelete, onShare }: GroupActionsMenuProps) {
  const { anchorEl, open, handleOpen, handleClose, handleEdit, handleDelete, handleShare } = useGroupActionsMenu({ onEdit, onDelete, onShare });

  return (
    <>
      <IconButton
        aria-label="Group actions"
        aria-controls={open ? 'group-actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        className="group-actions-menu__trigger"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="group-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {onShare && (
          <MenuItem onClick={handleShare} className="group-actions-menu__item">
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy invite link</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleEdit} className="group-actions-menu__item">
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {onDelete && (
          <MenuItem onClick={handleDelete} className="group-actions-menu__item group-actions-menu__item--danger">
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
