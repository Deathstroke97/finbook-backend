import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../utils/functions";
import constants from "../../constants/constants";
import periods from "../../constants/periods";
import { deleteTransactionsStart } from "store/actions/transactions";

const initialState = {
  transactions: [],
  loading: false,
  error: null,
  initialLoading: true,
  filters: {
    period: constants.CURRENT_MONTH,
    account: "",
    startTime: periods[constants.CURRENT_MONTH].startTime,
    endTime: periods[constants.CURRENT_MONTH].endTime,
    type: "",
    page: 0,
    rowsPerPage: 15,
  },
};

const updateFilters = (state, action) => {
  return updateObject(state, { filters: action.filters });
};

const fetchTransactionsStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const fetchTransactionsSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
    transactions: action.transactions,
    initialLoading: false,
  });
};

const fetchTransactionsFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
    initialLoading: false,
  });
};

const createTransactionsStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const createTransactionsSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
  });
};

const createTransactionsFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
  });
};

const updateTransactionsStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const updateTransactionsSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
  });
};

const updateTransactionsFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
  });
};

const changePlannedToFalseStart = (state, action) => {
  return updateObject(state, { loading: true });
};
const changePlannedToFalseFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    //fetching actions
    case actionTypes.UPDATE_FILTERS:
      return updateFilters(state, action);
    case actionTypes.FETCH_TRANSACTIONS_START:
      return fetchTransactionsStart(state, action);

    case actionTypes.FETCH_TRANSACTIONS_SUCCESS:
      return fetchTransactionsSuccess(state, action);

    case actionTypes.FETCH_TRANSACTIONS_FAILED:
      return fetchTransactionsFailed(state, action);

    //creating actions
    case actionTypes.CREATE_TRANSACTION_START:
      return createTransactionsStart(state, action);

    case actionTypes.CREATE_TRANSACTION_SUCCESS:
      return createTransactionsSuccess(state, action);

    case actionTypes.CREATE_TRANSACTION_FAILED:
      return createTransactionsFailed(state, action);

    // updating actions

    case actionTypes.UPDATE_TRANSACTION_START:
      return updateTransactionsStart(state, action);

    case actionTypes.UPDATE_TRANSACTION_SUCCESS:
      return updateTransactionsSuccess(state, action);

    case actionTypes.UPDATE_TRANSACTION_FAILED:
      return updateTransactionsFailed(state, action);

    case actionTypes.CHANGE_PLANNED_TO_FALSE_START:
      return changePlannedToFalseStart(state, action);
    case actionTypes.CHANGE_PLANNED_TO_FALSE_FAIL:
      return changePlannedToFalseFailed(state, action);
    // case actionTypes.DELETE_TRANSACTION_START:
    //   return deleteTransactionsStart(state, action)

    // other
    case actionTypes.RESET_STATE:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
