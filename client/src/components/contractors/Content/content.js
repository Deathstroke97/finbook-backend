import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Table from "components/common/Table/table";
import ObligationTable from "components/contractors/Contractor/ObligationsTable/table";

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

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

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
    marginTop: 14,
  },
  tabPanel: {
    "& > div": {
      padding: 0,
    },
  },
}));

export default function SimpleTabs(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const { contractorsFilters } = props;

  const handleChange = (event, newValue) => {
    setValue(newValue);
    props.handleTabChange(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="simple tabs example"
      >
        <Tab label="Операции" {...a11yProps(0)} />
        <Tab label="Обязательства" {...a11yProps(1)} />
      </Tabs>

      <TabPanel value={value} index={0} className={classes.tabPanel}>
        <Table contractorsFilters={contractorsFilters} />
      </TabPanel>
      <TabPanel value={value} index={1} className={classes.tabPanel}>
        <ObligationTable contractorsFilters={contractorsFilters} />
      </TabPanel>
    </div>
  );
}
