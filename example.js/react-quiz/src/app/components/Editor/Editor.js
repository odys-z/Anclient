import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';


class Editor extends React.Component {
    const useStyles = makeStyles((theme) => ({
      root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
      },
      nested: {
        paddingLeft: theme.spacing(4),
      },
    }));

    const classes = useStyles();

    state = {
        questions: [],
        currrentqx: -1,
    };

  handleClick: () => {
    setOpen(!open);
  };

  onChange(e) {
    console.log(e.target.value);
    let qx = this.state.questions.currentqx;
    let questions = this.state.questions.slice();
    questions[qx] = e.target.value;
    this.setState({questions});
  }

  onAdd(e) {
    this.state.question.push('');
    this.setState({currentqx: ++this.state.currentqx});
  }

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Nested List Items
        </ListSubheader>
      }
      className={classes.root} >
      <ListItem button>
        <ListItemIcon><SendIcon /></ListItemIcon>
        <ListItemText primary="Add New" onClick={onAdd} />
      </ListItem>
      <ListItem button>
        <ListItemIcon><DraftsIcon /></ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItem>
      <ListItem button onClick={handleClick}>
        <ListItemIcon><InboxIcon /></ListItemIcon>
        <ListItemText primary="Inbox" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            <ListItemIcon><StarBorder /></ListItemIcon>
            <ListItemText primary="Option A" />
            <ListItemText primary="Option B" />
            <ListItemText primary="Option C" />
            <FormControlLabel
                control={<Checkbox checked={this.state.check0}
                                    // onChange={this.onCheck}
                                    name="chk0" color="primary" />}
                label="Primary"/>
          </ListItem>
        </List>
      </Collapse>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <TextField
          id="outlined-secondary"
          label="Avialable Options"
          variant="outlined"
          color="secondary"
          multiline
          onChange={this.onChange}
        />
      </Collapse>
    </List>
  );
}
