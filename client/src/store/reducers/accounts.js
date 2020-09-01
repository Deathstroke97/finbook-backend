import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../utils/functions";

const initialState = {
  accounts: [],
  loading: false,
  initialLoading: true,
  error: null,
};

const fetchAccountsStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const fetchAccountsSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
    accounts: action.accounts,
    initialLoading: false,
  });
};

const fetchAccountsFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
    initialLoading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_ACCOUNTS_START:
      return fetchAccountsStart(state, action);

    case actionTypes.FETCH_ACCOUNTS_SUCCESS:
      return fetchAccountsSuccess(state, action);

    case actionTypes.FETCH_ACCOUNTS_FAILED:
      return fetchAccountsFailed(state, action);
    default:
      return state;
  }
};

export default reducer;
