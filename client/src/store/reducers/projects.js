import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../utils/functions";
import constants from "../../constants/constants";
import periods from "../../constants/periods";

const initialState = {
  projects: [],
  loading: false,
  error: null,
  initialLoading: true,
  project: {
    filters: {
      period: constants.CURRENT_MONTH,
      startTime: periods[constants.CURRENT_MONTH].startTime,
      endTime: periods[constants.CURRENT_MONTH].endTime,
      page: 0,
      rowsPerPage: 15,
    },
    overallNumbers: null,
    transactions: null,
    totalItems: null,
    project: null,
  },
};

const fetchProjectsStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const fetchProjectsSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
    projects: action.data,
    initialLoading: false,
  });
};

const fetchProjectsFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
    initialLoading: false,
  });
};

const fetchProjectStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const fetchProjectSuccess = (state, action) => {
  const updatedProject = updateObject(state.project, {
    overallNumbers: action.resData.overallNumbers,
    transactions: action.resData.transactions,
    totalItems: action.resData.totalItems,
    project: action.resData.project,
  });
  return updateObject(state, {
    loading: false,
    project: updatedProject,
  });
};

const fetchProjectFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
    initialLoading: false,
  });
};

const updateProjectFilters = (state, action) => {
  console.log("action filters: ", action.filters);
  const updatedProject = updateObject(state.project, {
    filters: action.filters,
  });
  return updateObject(state, {
    project: updatedProject,
  });
};

const clearProjectInState = (state, action) => {
  const projectId = action.projectId;

  if (state.project.project && projectId === state.project.project._id) {
    return state;
  }
  const updatedProject = updateObject(state.project, {
    filters: {
      period: constants.CURRENT_MONTH,
      startTime: periods[constants.CURRENT_MONTH].startTime,
      endTime: periods[constants.CURRENT_MONTH].endTime,
      page: 0,
      rowsPerPage: 15,
    },
    overallNumbers: null,
    transactions: null,
    totalItems: null,
    project: null,
  });
  return updateObject(state, {
    project: updatedProject,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_PROJECTS_START:
      return fetchProjectsStart(state, action);

    case actionTypes.FETCH_PROJECTS_SUCCESS:
      return fetchProjectsSuccess(state, action);

    case actionTypes.FETCH_PROJECTS_FAILED:
      return fetchProjectsFailed(state, action);
    case actionTypes.CLEAR_PROJECT_IN_STATE:
      return clearProjectInState(state, action);
    case actionTypes.FETCH_PROJECT_START:
      return fetchProjectStart(state, action);

    case actionTypes.FETCH_PROJECT_SUCCESS:
      return fetchProjectSuccess(state, action);

    case actionTypes.FETCH_PROJECT_FAILED:
      return fetchProjectFailed(state, action);
    case actionTypes.UPDATE_PROJECT_FILTERS:
      return updateProjectFilters(state, action);
    case actionTypes.PROJECTS_LOADING_FALSE:
      return updateObject(state, { loading: false });
    case actionTypes.PROJECTS_LOADING_TRUE:
      return updateObject(state, { loading: true });
    default:
      return state;
  }
};

export default reducer;
