import * as actionTypes from "./actionTypes";
import axios from "axios-instance";

export const fetchContractorsStart = () => {
  return {
    type: actionTypes.FETCH_CONTRACTORS_START,
  };
};

export const fetchContractorsSuccess = (data) => {
  return {
    type: actionTypes.FETCH_CONTRACTORS_SUCCESS,
    data: data,
  };
};

export const fetchContractorsFail = (error) => {
  return {
    type: actionTypes.FETCH_CONTRACTORS_FAILED,
    error: error,
  };
};

export const fetchContractors = (token, filters) => {
  return (dispatch) => {
    dispatch(fetchContractorsStart());
    axios
      .post("/contractors", filters)
      .then((resData) => {
        dispatch(fetchContractorsSuccess(resData.data));
      })
      .catch((error) => dispatch(fetchContractorsFail(error)));
  };
};

export const fetchContractorStart = () => {
  return {
    type: actionTypes.FETCH_CONTRACTOR_START,
  };
};

export const fetchContractorSuccess = (resData) => {
  return {
    type: actionTypes.FETCH_CONTRACTOR_SUCCESS,
    resData: resData,
  };
};

export const fetchContractorFail = (error) => {
  return {
    type: actionTypes.FETCH_CONTRACTOR_FAILED,
    error: error,
  };
};

// export const fetchContractor = (token, contractorId, filters) => {
//   return (dispatch) => {
//     dispatch(fetchContractorStart());
//     const startTime = filters.startTime;
//     const endTime = filters.endTime;
//     let url = `http://192.168.1.67:8081/contractor/${contractorId}?page=${filters.page}&rowsPerPage=${filters.rowsPerPage}`;
//     if (startTime && endTime) {
//       url = `${url}&startTime=${startTime}&endTime=${endTime}`;
//     }
//     axios
//       .get(url, {
//         headers: {
//           Authorization: "Bearer " + token,
//         },
//       })
//       .then((response) => {
//         dispatch(fetchContractorSuccess(response.data));
//       })
//       .catch((error) => {
//         dispatch(fetchContractorFail(error));
//       });
//   };
// };
export const fetchContractor = (token, contractorId, filters) => {
  return (dispatch) => {
    dispatch(fetchContractorStart());
    const startTime = filters.startTime;
    const endTime = filters.endTime;
    let url = `/contractor/${contractorId}?page=${filters.page}&rowsPerPage=${filters.rowsPerPage}`;
    if (startTime && endTime) {
      url = `${url}&startTime=${startTime}&endTime=${endTime}`;
    }
    axios
      .get(url)
      .then((response) => {
        dispatch(fetchContractorSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchContractorFail(error));
      });
  };
};

export const updateContractorFilters = (updatedFilters) => {
  return {
    type: actionTypes.UPDATE_CONTRACTOR_FILTERS,
    filters: updatedFilters,
  };
};

export const setLoadingContractorsTrue = () => {
  return {
    type: actionTypes.CONTRACTORS_LOADING_TRUE,
  };
};

export const setLoadingContractorsFalse = () => {
  return {
    type: actionTypes.CONTRACTORS_LOADING_FALSE,
  };
};
