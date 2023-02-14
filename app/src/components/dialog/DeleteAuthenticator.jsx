import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { findIndex } from 'lodash';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useConfigInMainRequest, writeConfigRequest } from 'secure-electron-store';

const styles = (theme) => ({
  root: {
    margin: 0,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  gridContainer: {
    padding: theme.spacing(1),
  },
  contentContainer: {
    padding: theme.spacing(1),
  }
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const DeleteAuthenticator = withStyles(styles)((props) => {
  const { openDelete, handleClose, authenticators, setAuthenticators, authenticator, classes } = props;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    window.api.store.clearRendererBindings();
    // Request so that the main process can use the store
    window.api.store.send(useConfigInMainRequest);
  }, []);

  const handleDelete = () => {
    let auths = authenticators;
    if (auths === undefined) {
      auths = [];
    }
    const idx = findIndex(auths, elem => elem.id === authenticator.id);
    auths.splice(idx, 1);
    window.api.store.send(writeConfigRequest, 'authenticators', auths); // delete elem
    setAuthenticators([...auths]);
    handleClose();
    enqueueSnackbar('OTP has successfully removed!', {
      variant: 'success',
    });
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={openDelete}>
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        Delete a code generator
      </DialogTitle>
      <MuiDialogContent dividers>
        <Grid container className={classes.gridContainer}>
          <Grid container alignItems="center">
            <Typography gutterBottom>

              The generator will be deleted. This action is irreversible. You will no longer be able to access the code if you do not have the private key in your possession.
            </Typography>
            <Typography gutterBottom>
              Do you confirm the deletion of the generator?
            </Typography>
          </Grid>
        </Grid>
      </MuiDialogContent>
      <Grid container wrap="nowrap" justify="flex-end">
        <MuiDialogActions>
          <Button autoFocus onClick={handleDelete} color="primary">
            Delete
          </Button>
        </MuiDialogActions>
        <MuiDialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
        </MuiDialogActions>
      </Grid>
    </Dialog>
  )
});

export default DeleteAuthenticator;