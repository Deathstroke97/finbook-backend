import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../utils/functions";
import constants from "../../constants/constants";
import periods from "../../constants/periods";
import { updateProjectFilters } from "store/actions";

const initialState = {
  contractors: [],
  loading: false,
  error: null,
  initialLoading: true,
  contractor: {
    filters: {
      period: constants.CURRENT_MONTH,
      startTime: periods[constants.CURRENT_MONTH].startTime,
      endTime: periods[constants.CURRENT_MONTH].endTime,
      page: 0,
      rowsPerPage: 15,
    },
    balance: null,
    overallNumbers: {
      totalIncome: null,
      totalOutcome: null,
    },
    transactions: null,
    obligations: [],
    contractor: null,
  },
};

const fetchContractorsStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const fetchContractorsSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
    contractors: action.data,
    initialLoading: false,
  });
};

const fetchContractorsFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
    initialLoading: false,
  });
};

const fetchContractorStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const fetchContractorSuccess = (state, action) => {
  const updatedContractor = updateObject(state.contractor, {
    overallNumbers: action.resData.overallNumbers,
    balance: action.resData.balance,
    transactions: action.resData.transactions,
    totalItems: action.resData.totalItems,
    obligations: action.resData.obligations,
    obligationTotalItems: action.resData.obligationTotalItems,
    contractor: action.resData.contractor,
  });
  return updateObject(state, {
    loading: false,
    contractor: updatedContractor,
  });
};

const fetchContractorFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
    initialLoading: false,
  });
};

const updateContractorFilters = (state, action) => {
  const updatedContractor = updateObject(state.contractor, {
    filters: action.filters,
  });
  return updateObject(state, {
    contractor: updatedContractor,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_CONTRACTORS_START:
      return fetchContractorsStart(state, action);

    case actionTypes.FETCH_CONTRACTORS_SUCCESS:
      return fetchContractorsSuccess(state, action);

    case actionTypes.FETCH_CONTRACTORS_FAILED:
      return fetchContractorsFailed(state, action);
    case actionTypes.FETCH_CONTRACTOR_START:
      return fetchContractorStart(state, action);

    case actionTypes.FETCH_CONTRACTOR_SUCCESS:
      return fetchContractorSuccess(state, action);

    case actionTypes.FETCH_CONTRACTOR_FAILED:
      return fetchContractorFailed(state, action);
    case actionTypes.UPDATE_CONTRACTOR_FILTERS:
      return updateContractorFilters(state, action);
    case actionTypes.CONTRACTORS_LOADING_TRUE:
      return updateObject(state, { loading: true });
    case actionTypes.CONTRACTORS_LOADING_FALSE:
      return updateObject(state, { loading: false });
    default:
      return state;
  }
};

export default reducer;
