import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { SessionContext } from "context/SessionContext";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import General from "components/settings/General/general";
import Users from "components/settings/Users/users";
import Profile from "components/settings/Profile/profile";
import PayFinbook from "components/settings/PayFinbook/payFinbook";
import Accounts from "components/settings/Accounts/accounts";
import Categories from "components/settings/Categories/categories";
import { isBusinessActive } from "utils/functions";
import { useHistory } from "react-router-dom";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tabPanel: {
    "& > div": {
      padding: 0,
    },
  },
}));

export default function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const { user } = useContext(SessionContext);
  const history = useHistory();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (!isBusinessActive(user)) {
      setValue(2);
    }
  }, [value]);

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="Общие настройки" {...a11yProps(0)} />
          {/* <Tab label="Пользователи" {...a11yProps(1)} /> */}
          <Tab label="Профиль" {...a11yProps(1)} />
          <Tab label="Оплатить Finbook" {...a11yProps(2)} />
          <Tab label="Счета и кассы" {...a11yProps(3)} />
          <Tab label="Статьи операции" {...a11yProps(4)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <General />
      </TabPanel>
      {/* <TabPanel value={value} index={1} className={classes.tabPanel}>
        <Users />
      </TabPanel> */}
      <TabPanel value={value} index={1}>
        <Profile />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <PayFinbook />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Accounts />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Categories />
      </TabPanel>
    </div>
  );
}
