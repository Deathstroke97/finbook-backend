import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { SessionContext } from "context/SessionContext";
import * as actions from "store/actions/index";

import { makeStyles } from "@material-ui/core";
import Actions from "./actions";
import Cards from "./cards";
import Content from "components/contractors/Content/content";
import DatePicker from "components/common/DatePicker/datePicker";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

const Contractor = (props) => {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState(0);

  const { contractorId } = useParams();
  const { user } = useContext(SessionContext);
  const { filters, contractorsFilters } = props;

  useEffect(() => {
    props.onFetchContractor(user.token, contractorId, filters);
  }, []);

  const handleTabChange = (index) => {
    setTabIndex(index);
  };

  return (
    <div className={classes.root}>
      <DatePicker />
      <Actions tabIndex={tabIndex} contractorsFilters={contractorsFilters} />
      <Cards />
      <Content
        handleTabChange={handleTabChange}
        contractorsFilters={contractorsFilters}
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    filters: state.contractors.contractor.filters,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchContractor: (token, contractorId, filters) =>
      dispatch(actions.fetchContractor(token, contractorId, filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Contractor);
