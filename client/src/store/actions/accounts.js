import * as actionTypes from "./actionTypes";
import axios from "axios-instance";

export const fetchAccountsStart = () => {
  return {
    type: actionTypes.FETCH_ACCOUNTS_START,
  };
};

export const fetchAccountsSuccess = (accounts) => {
  return {
    type: actionTypes.FETCH_ACCOUNTS_SUCCESS,
    accounts: accounts.accounts,
  };
};

export const fetchAccountsFail = (error) => {
  return {
    type: actionTypes.FETCH_ACCOUNTS_FAILED,
    error: error,
  };
};

export const fetchAccounts = (token) => {
  return (dispatch) => {
    dispatch(fetchAccountsStart());
    // fetch("http://192.168.1.67:8081/accounts", {
    //   headers: {
    //     Authorization: "Bearer " + token,
    //   },
    // })
    //   .then((res) => {
    //     return res.json();
    //   })
    //   .then((resData) => {
    //     dispatch(fetchAccountsSuccess(resData));
    //   })
    //   .catch((error) => {
    //     dispatch(fetchAccountsFail(error));
    //   });

    axios
      .get("/accounts")
      .then((res) => {
        dispatch(fetchAccountsSuccess(res.data));
      })
      .catch((error) => dispatch(fetchAccountsFail(error)));
  };
};
