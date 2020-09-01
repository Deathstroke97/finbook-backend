import * as actionTypes from "./actionTypes";
import axios from "axios-instance";
import { fetchContractor } from "./contractors";

export const fetchProjectsStart = () => {
  return {
    type: actionTypes.FETCH_PROJECTS_START,
  };
};

export const fetchProjectsSuccess = (data) => {
  return {
    type: actionTypes.FETCH_PROJECTS_SUCCESS,
    data: data,
  };
};

export const fetchProjectsFail = (error) => {
  return {
    type: actionTypes.FETCH_PROJECTS_FAILED,
    error: error,
  };
};

export const fetchProjects = (token, filters) => {
  return (dispatch) => {
    dispatch(fetchProjectsStart());
    axios
      .post("/projects", filters, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((resData) => {
        dispatch(fetchProjectsSuccess(resData.data));
      })
      .catch((error) => dispatch(fetchProjectsFail(error)));
  };
};

export const fetchProjectStart = () => {
  return {
    type: actionTypes.FETCH_PROJECT_START,
  };
};

export const fetchProjectSuccess = (resData) => {
  return {
    type: actionTypes.FETCH_PROJECT_SUCCESS,
    resData: resData,
  };
};

export const fetchProjectFail = (error) => {
  return {
    type: actionTypes.FETCH_PROJECT_FAILED,
    error: error,
  };
};

export const updateProjectFilters = (updatedFilters) => {
  return {
    type: actionTypes.UPDATE_PROJECT_FILTERS,
    filters: updatedFilters,
  };
};

export const clearProjectInState = (projectId) => {
  return {
    type: actionTypes.CLEAR_PROJECT_IN_STATE,
    projectId,
  };
};

// export const fetchProject = (token, projectId, filters) => {
//   return (dispatch) => {
//     dispatch(clearProjectInState(projectId));
//     dispatch(fetchProjectStart());
//     const startTime = filters.startTime;
//     const endTime = filters.endTime;
//     let url = `http://192.168.1.67:8081/project/${projectId}?page=${filters.page}&rowsPerPage=${filters.rowsPerPage}`;
//     if (startTime && endTime) {
//       url = `${url}&startTime=${startTime}&endTime=${endTime}`;
//     }
//     axios
//       .get(url)
//       .then((response) => {
//         dispatch(fetchProjectSuccess(response.data));
//       })
//       .catch((error) => {
//         dispatch(fetchProjectFail(error));
//       });
//   };
// };

export const fetchProject = (token, projectId, filters) => {
  return (dispatch) => {
    dispatch(clearProjectInState(projectId));
    dispatch(fetchProjectStart());
    const startTime = filters.startTime;
    const endTime = filters.endTime;
    let url = `/project/${projectId}?page=${filters.page}&rowsPerPage=${filters.rowsPerPage}`;
    if (startTime && endTime) {
      url = `${url}&startTime=${startTime}&endTime=${endTime}`;
    }
    axios
      .get(url)
      .then((response) => {
        dispatch(fetchProjectSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchProjectFail(error));
      });
  };
};

export const setLoadingProjectsTrue = () => {
  return {
    type: actionTypes.PROJECTS_LOADING_TRUE,
  };
};

export const setLoadingProjectsFalse = () => {
  return {
    type: actionTypes.PROJECTS_LOADING_FALSE,
  };
};
