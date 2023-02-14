import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
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
  timeBasedContainer: {
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

const EditAuthenticator = withStyles(styles)((props) => {
  const { openEdit, handleClose, authenticators, setAuthenticators, authenticator, classes } = props;
  const [values, setValues] = useState({ name: '', account: '', key: '', timeBased: true });
  const [helperText, setHelperText] = useState({ name: '', account: '', key: '' });
  const [errors, setErrors] = useState({ name: false, account: false, key: false });
  const [timeBased, setTimeBased] = useState(true);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    window.api.store.clearRendererBindings();
    // Request so that the main process can use the store
    window.api.store.send(useConfigInMainRequest);
    setValues({
      ...values,
      name: authenticator.name,
      account: authenticator.account,
      key: authenticator.key,
      timeBased: authenticator.timeBased
    })
  }, []);

  const handleChange = () => {
    setTimeBased(prev => !prev);
  };

  const handleCheck = () => {
    let errorText = { name: '', account: '', key: '' };
    let errorFields = { name: false, account: false, key: false };
    let error = false;
    if (values.name === '') {
      errorText.name = 'Required fields';
      errorFields.name = true;
      error = true;
    }

    if (values.account === '') {
      errorText.account = 'Required fields';
      errorFields.account = true;
      error = true;
    }

    if (values.key === '') {
      errorText.key = 'Required fields';
      errorFields.key = true;
      error = true;
    }

    setHelperText(errorText);
    setErrors(errorFields);
    return error;
  };

  const handleUpdate = (e, key) => {
    let errorText = { name: '', account: '', key: '' };
    let errorFields = { name: false, account: false, key: false };
    if (key === 'name') {
      setValues({ ...values, name: e.target.value })
      if (values.name === '') {
        errorText.name = 'Required fields';
        errorFields.name = true;
      }
    }
    if (key === 'account') {
      setValues({ ...values, account: e.target.value })
      if (values.account === '') {
        errorText.account = 'Required fields';
        errorFields.account = true;
      }
    }
    if (key === 'key') {
      setValues({ ...values, key: e.target.value })
      if (values.key === '') {
        errorText.key = 'Required fields';
        errorFields.key = true;
      }
    }
    setHelperText(errorText);
    setErrors(errorFields);
  }

  const updateAuth = (obj) => {
    let newObj = obj;
    if (values.name !== obj.name) {
      newObj.name = values.name;
    }
    if (values.account !== obj.account) {
      newObj.account = values.account;
    }
    if (values.key !== obj.key) {
      newObj.key = values.key.replace(/\s/g, '');
    }
    if (values.timeBased !== obj.timeBased) {
      newObj.timeBased = values.timeBased;
    }
    return newObj;
  }

  const handleEdit = () => {
    if (handleCheck() === false) {
      let auths = authenticators;
      if (auths === undefined) {
        auths = [];
      }
      const idx = auths.findIndex(elem => elem.id === authenticator.id);
      const updatedAuth = updateAuth(auths[idx]);
      auths.splice(idx, 1, updatedAuth);
      window.api.store.send(writeConfigRequest, 'authenticators', auths); // edit authenticator
      setAuthenticators([...auths]);
      handleClose();
      enqueueSnackbar('OTP Generator successfully updated!', {
        variant: 'success',
      });
    }
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={openEdit}>
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        Update Code Generator
      </DialogTitle>
      <MuiDialogContent dividers>
        <Grid container className={classes.gridContainer}>
          <TextField
            id="outlined-full-width"
            label="Organization"
            style={{ margin: 8 }}
            placeholder="ex: Facebook, Instagram ..."
            fullWidth
            required
            error={errors.name}
            margin="normal"
            helperText={helperText.name}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            value={values.name}
            onChange={(e) => handleUpdate(e, 'name')}
          />
          <TextField
            id="outlined-full-width"
            label="Name"
            style={{ margin: 8 }}
            placeholder="username"
            fullWidth
            required
            error={errors.account}
            margin="normal"
            helperText={helperText.account}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            value={values.account}
            onChange={(e) => handleUpdate(e, 'account')}
          />
          <TextField
            id="outlined-full-width"
            label="Secret Key"
            style={{ margin: 8 }}
            placeholder="xxxx xxxx xxxx xxxx"
            fullWidth
            required
            error={errors.key}
            margin="normal"
            helperText={helperText.key}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            value={values.key}
            onChange={(e) => handleUpdate(e, 'key')}
          />
          <Grid container alignItems="center" wrap="nowrap" className={classes.timeBasedContainer}>
            <Grid item container direction="row" wrap="nowrap">
              Time based OTP
            </Grid>
            <Grid item className={classes.labelMargin}>
              <Switch checked={timeBased} onChange={handleChange} color="primary" />
            </Grid>
          </Grid>
        </Grid>
      </MuiDialogContent>
      <MuiDialogActions>
        <Button autoFocus onClick={handleEdit} color="primary">
          Update
        </Button>
      </MuiDialogActions>
    </Dialog>
  )
});

export default EditAuthenticator;