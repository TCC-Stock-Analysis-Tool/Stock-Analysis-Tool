/* eslint-disable react/prop-types */
import  { useEffect } from 'react';
import { Snackbar, SnackbarContent, Grid, IconButton } from '@mui/material';
import { green, yellow, red } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';



export const AlertComponent = ({ open, message, severity, onClose }) => {
  let icon, backgroundColor;

  switch (severity) {
    case 'success':
      icon = <CheckCircleIcon sx={{ marginRight: 1 }} />;
      backgroundColor = green[600];
      break;
    case 'warning':
      icon = <WarningIcon sx={{ marginRight: 1 }} />;
      backgroundColor = yellow[800];
      break;
    case 'error':
      icon = <WarningIcon sx={{ marginRight: 1 }} />;
      backgroundColor = red[700];
      break;
    default:
      break;
  }

  const alertStyle = {
    backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  };

  useEffect(() => {
    if (open) {
      const timerId = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timerId);
    }
  }, [open, onClose]);

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={open}
      onClose={onClose}
      style={{ marginTop: '50px' }}
    >
      <SnackbarContent
        sx={alertStyle}
        message={
          <Grid container sx={alertStyle}>
            {icon}
            {message}
          </Grid>
        }
        action={
          <>
            <IconButton size="small" color="inherit" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </Snackbar>
  );
};
