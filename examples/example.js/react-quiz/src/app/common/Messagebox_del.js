import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

/// DESIGN NOTE:
// Let's keep this for a while - it's a hard lesson learnt that React function and hook is not a good idea.
export function ConfirmDialog(opt = {}) {
  const state = {
	// title: opt.title,
	// displayTitle: typeof opt.title === 'string' ? 'block' : 'none',
	// displayCancel: opt.cancel === undefined || !opt.cancel ? 'block' : 'none',
	// txtCancel: typeof opt.cancel === 'string' ? opt.cancel : "Cancel",
	// txtOk: typeof opt.ok || opt.OK ? opt.ok || opt.OK : "OK",
  };

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(opt.title);
  const [displayTitle, setDisplayTitle] = React.useState(false);
  const [displayCancel, setDisplayCancel] = React.useState(false);
  const [txtCancel, setCancel] = React.useState('Cancel');
  const [txtOk, setOk] = React.useState('OK');

  React.useEffect(() => {
		setOpen(!!opt.open);
		setTitle(!!opt.title);
		let displayTitle = typeof opt.title === 'string' ? 'block' : 'none';
		setDisplayTitle(displayTitle);
		let displayCancel = opt.cancel === undefined || !opt.cancel ? 'block' : 'none';
		setDisplayCancel(displayCancel);
		let txtCancel = typeof opt.cancel === 'string' ? opt.cancel : "Cancel";
		setCancel(txtCancel);
		let txtOk = typeof opt.ok || opt.OK ? opt.ok || opt.OK : "OK";
		setOk(txtOk);
	}, [opt.open, opt.title, displayCancel, txtCancel, txtOk])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" display={displayTitle}>
		  {title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending anonymous location data to
            Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {txtOk}
          </Button>
          <Button onClick={handleClose} color="primary" display={displayCancel} autoFocus>
            {txtCancel}
          </Button>
        </DialogActions>
      </Dialog>
  );
}

ConfirmDialog.prototype.show = () => { setOpen(true); }
