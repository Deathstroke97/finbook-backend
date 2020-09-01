import React, { useContext } from "react";
import { connect } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
  Container,
  Grid,
  makeStyles,
  Typography,
  MenuItem,
} from "@material-ui/core";

import * as actions from "../../../store/actions/index";
import { SessionContext } from "../../../context/SessionContext";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import AccountCircle from "@material-ui/icons/AccountCircle";
import NotificationsIcon from "@material-ui/icons/Notifications";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import Fade from "@material-ui/core/Fade";
import NotificationItem from "./notificationItem";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import WorkIcon from "@material-ui/icons/Work";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    backgroundColor: "white",
    height: "60px",
    alignItems: "center",
  },
  right: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: 30,
  },
  paper: {
    marginTop: 3,
    width: "auto",
    maxWidth: 400,
  },
  iconWrapper: {},
  userWrapper: {
    display: "flex",
    alignItems: "center",
    width: "auto",
  },
  notificationAll: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 0",
    fontSize: 12,
    fontWeight: 700,
  },
  username: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  navItems: {
    display: "flex",
    alignItems: "center",
    "& > :not(:last-child)": {
      marginRight: 10,
    },
  },
  left: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    "& p": {
      fontWeight: theme.typography.fontWeightBold,
      padding: "0 25px",
      fontSize: 16,
    },
    "& svg": {
      borderRight: "1px solid #e1e5eb!important",
      borderLeft: "1px solid #e1e5eb!important",
      width: "48px",
      height: "48px",
      padding: "0 10px",
    },
  },
}));

const Toolbar = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [openUserMenu, setUserMenu] = React.useState(false);
  const anchorRefUser = React.useRef(null);
  const history = useHistory();
  const { user } = useContext(SessionContext);
  const businessName = user.business.name;
  const name = user.user.name;

  const handleToggle = () => {
    console.log("3");
    setOpen((prevOpen) => !prevOpen);
  };

  const handleUserMenuToggle = () => {
    console.log("1");
    setUserMenu(!openUserMenu);
  };

  const handleClose = (event) => {
    console.log("2");
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleCloseUserMenu = (event) => {
    console.log("event.target.vl: ", event.target.value);
    if (anchorRefUser.current && anchorRefUser.current.contains(event.target)) {
      return;
    }

    setUserMenu(false);
  };

  function handleListKeyDown(event) {
    console.log("here1");

    if (event.key === "Tab") {
      console.log("here2");

      event.preventDefault();
      setOpen(false);
    }
  }

  const goToSettings = () => {
    history.push("/settings");
  };

  const handleSignOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <div className={classes.root}>
      <div className={classes.left}>
        <Typography>{businessName}</Typography>
        <WorkIcon color="primary" />
      </div>
      <div className={classes.right}>
        <div className={classes.navItems}>
          <div className={classes.iconWrapper}>
            <IconButton
              ref={anchorRef}
              aria-controls={open ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
            >
              <Badge badgeContent={17} color="primary">
                <NotificationsIcon color="secondary" />
              </Badge>
            </IconButton>

            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              placement="bottom-end"
            >
              {({ TransitionProps, placement }) => {
                return (
                  <Fade
                    in={open}
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === "bottom" ? "center top" : "center bottom",
                    }}
                  >
                    <Paper className={classes.paper}>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList
                          autoFocusItem={open}
                          id="menu-list-grow"
                          onKeyDown={handleListKeyDown}
                          style={{ padding: 0 }}
                        >
                          <NotificationItem success />
                          <NotificationItem danger />
                          <NotificationItem success />

                          <div className={classes.notificationAll}>
                            View all notifications
                          </div>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Fade>
                );
              }}
            </Popper>
          </div>
          <Typography className={classes.username}>{name}</Typography>
          <div className={classes.userWrapper}>
            <IconButton
              edge="end"
              aria-label="account of current user"
              ref={anchorRefUser}
              aria-controls={openUserMenu ? "menu-user-list-grow" : undefined}
              aria-haspopup="true"
              onClick={handleUserMenuToggle}
              color="inherit"
              fontSize="large"
            >
              <AccountCircle style={{ fontSize: "27px" }} color="secondary" />
            </IconButton>
            <Popper
              open={openUserMenu}
              anchorEl={anchorRefUser.current}
              role={undefined}
              transition
              disablePortal={false}
              placement="bottom-end"
            >
              {({ TransitionProps, placement }) => {
                return (
                  <Fade
                    in={open}
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === "bottom" ? "center top" : "center bottom",
                    }}
                  >
                    <Paper className={classes.paper}>
                      <ClickAwayListener onClickAway={handleCloseUserMenu}>
                        <MenuList
                          autoFocusItem={open}
                          id="menu-user-list-grow"
                          onKeyDown={handleListKeyDown}
                          style={{ padding: 0 }}
                        >
                          <MenuItem onClick={goToSettings}>Настройки</MenuItem>
                          <MenuItem onClick={handleSignOut}>Выйти</MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Fade>
                );
              }}
            </Popper>
          </div>
        </div>
      </div>
    </div>
  );
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//     onResetState: () => dispatch(actions.resetState()),
//   };
// };

export default Toolbar;
// export default connect(null, mapDispatchToProps)(Toolbar);
