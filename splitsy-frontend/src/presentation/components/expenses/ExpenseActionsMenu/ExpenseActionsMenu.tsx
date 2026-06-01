import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { useExpenseActionsMenu } from './useExpenseActionsMenu';
import type { ExpenseActionsMenuProps } from './types';
import './styles.css';

export function ExpenseActionsMenu({ onEdit, onDelete, onDuplicate }: ExpenseActionsMenuProps) {
  const { anchorEl, open, handleOpen, handleClose, handleEdit, handleDuplicate, handleDelete } = useExpenseActionsMenu({ onEdit, onDelete, onDuplicate });

  return (
    <>
      <IconButton
        aria-label="Expense actions"
        aria-controls={open ? 'expense-actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        className="expense-actions-menu__trigger"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="expense-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit} className="expense-actions-menu__item">
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {onDuplicate && (
          <MenuItem onClick={handleDuplicate} className="expense-actions-menu__item">
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} className="expense-actions-menu__item expense-actions-menu__item--danger">
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
