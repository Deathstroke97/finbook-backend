import * as actionTypes from "./actionTypes";
import * as actions from "./index";
import axios from "axios-instance";

export const updateFilters = (updatedFilters) => {
  return {
    type: actionTypes.UPDATE_FILTERS,
    filters: updatedFilters,
  };
};

export const fetchTransactionsStart = () => {
  return {
    type: actionTypes.FETCH_TRANSACTIONS_START,
  };
};

export const fetchTransactionsSuccess = (resData) => {
  return {
    type: actionTypes.FETCH_TRANSACTIONS_SUCCESS,
    transactions: resData,
  };
};

export const fetchTransactionsFail = (error) => {
  return {
    type: actionTypes.FETCH_TRANSACTIONS_FAILED,
    error: error,
  };
};

export const resetState = () => {
  return {
    type: actionTypes.RESET_STATE,
  };
};

// export const fetchTransactions = (token, filters) => {
//   return (dispatch, getState) => {
//     dispatch(fetchTransactionsStart());
//     // const state = getState();
//     // const filters = state.filters.filters;
//     console.log("filters in fetch: ", filters);
//     fetch("http://192.168.1.67:8081/transactions", {
//       method: "POST",
//       headers: {
//         Authorization: "Bearer " + token,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         period: filters.period,
//         account: filters.account,
//         project: filters.project,
//         queryData: {
//           createTime: {
//             $gte: filters.startTime,
//             $lte: filters.endTime,
//           },
//         },
//         type: filters.type,
//         // page: filters.page,
//         // rowsPerPage: filters.rowsPerPage,
//       }),
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((resData) => {
//         dispatch(fetchTransactionsSuccess(resData));
//       })
//       .catch((error) => {
//         dispatch(fetchTransactionsFail(error));
//       });
//   };
// };

export const fetchTransactions = (token, filters) => {
  return (dispatch, getState) => {
    dispatch(fetchTransactionsStart());
    // const state = getState();
    // const filters = state.filters.filters;

    axios
      .post("/transactions", {
        period: filters.period,
        account: filters.account,
        project: filters.project,
        queryData: {
          createTime: {
            $gte: filters.startTime,
            $lte: filters.endTime,
          },
        },
        type: filters.type,
        // page: filters.page,
        // rowsPerPage: filters.rowsPerPage,
      })

      .then((res) => {
        dispatch(fetchTransactionsSuccess(res.data));
      })
      .catch((error) => {
        dispatch(fetchTransactionsFail(error));
      });
  };
};

export const createTransactionStart = () => {
  return {
    type: actionTypes.CREATE_TRANSACTION_START,
  };
};

export const createTransactionSuccess = () => {
  return {
    type: actionTypes.CREATE_TRANSACTION_SUCCESS,
  };
};

export const createTransactionFail = (error) => {
  return {
    type: actionTypes.CREATE_TRANSACTION_FAILED,
    error: error,
  };
};

// export const createTransaction = (token, transaction, callback) => {
//   return (dispatch) => {
//     dispatch(createTransactionStart());
//     // dispatch(actions.setLoadingProjectsTrue());
//     // dispatch(actions.setLoadingContractorsTrue());
//     fetch("http://192.168.1.67:8081/transaction", {
//       method: "POST",
//       headers: {
//         Authorization: "Bearer " + token,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(transaction),
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((resData) => {
//         dispatch(actions.setLoadingContractorsFalse());
//         dispatch(actions.setLoadingProjectsFalse());
//         callback();
//       })
//       .catch((error) => {
//         dispatch(createTransactionFail(error));
//       });
//   };
// };

export const createTransaction = (token, transaction, callback) => {
  return (dispatch) => {
    dispatch(createTransactionStart());
    // dispatch(actions.setLoadingProjectsTrue());
    // dispatch(actions.setLoadingContractorsTrue());
    axios
      .post("/transaction", transaction)

      .then((res) => {
        dispatch(actions.setLoadingContractorsFalse());
        dispatch(actions.setLoadingProjectsFalse());
        callback();
      })
      .catch((error) => {
        dispatch(createTransactionFail(error));
      });
  };
};

export const updateTransactionStart = () => {
  return {
    type: actionTypes.UPDATE_TRANSACTION_START,
  };
};

export const updateTransactionSuccess = () => {
  return {
    type: actionTypes.UPDATE_TRANSACTION_SUCCESS,
  };
};

export const updateTransactionFail = (error) => {
  return {
    type: actionTypes.UPDATE_TRANSACTION_FAILED,
    error: error,
  };
};

// export const updateTransaction = (token, transaction, callback) => {
//   return (dispatch) => {
//     dispatch(updateTransactionStart());
//     // dispatch(actions.setLoadingProjectsTrue());
//     // dispatch(actions.setLoadingContractorsTrue());
//     fetch(`http://192.168.1.67:8081/transaction`, {
//       method: "PUT",
//       headers: {
//         Authorization: "Bearer " + token,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(transaction),
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((resData) => {
//         dispatch(actions.setLoadingContractorsFalse());
//         dispatch(actions.setLoadingProjectsFalse());
//         callback();
//       })
//       .catch((error) => {
//         dispatch(updateTransactionFail(error));
//       });
//   };
// };

export const updateTransaction = (token, transaction, callback) => {
  return (dispatch) => {
    dispatch(updateTransactionStart());
    // dispatch(actions.setLoadingProjectsTrue());
    // dispatch(actions.setLoadingContractorsTrue());
    axios
      .put(`/transaction`, transaction)
      .then((resData) => {
        dispatch(actions.setLoadingContractorsFalse());
        dispatch(actions.setLoadingProjectsFalse());
        callback();
      })
      .catch((error) => {
        dispatch(updateTransactionFail(error));
      });
  };
};

export const deleteTransactionsStart = () => {
  return {
    type: actionTypes.DELETE_TRANSACTION_START,
  };
};

export const deleteTransactionsSuccess = () => {
  return {
    type: actionTypes.DELETE_TRANSACTION_SUCCESS,
  };
};

export const deleteTransactionsFail = (error) => {
  return {
    type: actionTypes.DELETE_TRANSACTION_FAILED,
    error: error,
  };
};

// export const deleteTransactions = (token, transactions, callback) => {
//   return (dispatch) => {
//     dispatch(deleteTransactionsStart());
//     // dispatch(actions.setLoadingProjectsTrue());
//     // dispatch(actions.setLoadingContractorsTrue());
//     fetch(`http://192.168.1.67:8081/transactions`, {
//       method: "DELETE",
//       headers: {
//         Authorization: "Bearer " + token,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ transactions: transactions }),
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((resData) => {
//         dispatch(actions.setLoadingContractorsFalse());
//         dispatch(actions.setLoadingProjectsFalse());
//         callback();
//       })
//       .catch((error) => {
//         dispatch(deleteTransactionsFail(error));
//       });
//   };
// };

export const deleteTransactions = (token, transactions, callback) => {
  return (dispatch) => {
    dispatch(deleteTransactionsStart());
    // dispatch(actions.setLoadingProjectsTrue());
    // dispatch(actions.setLoadingContractorsTrue());
    axios
      .delete(`/transactions`, { data: { transactions } })
      .then((resData) => {
        dispatch(actions.setLoadingContractorsFalse());
        dispatch(actions.setLoadingProjectsFalse());
        callback();
      })
      .catch((error) => {
        dispatch(deleteTransactionsFail(error));
      });
  };
};

const cancelTransactionRepetitionStart = () => {
  return {
    type: actionTypes.CANCEL_TRANSACTION_REPETITION_START,
  };
};

const cancelTransactionRepetitionFail = (error) => {
  return {
    type: actionTypes.CANCEL_TRANSACTION_REPETITION_FAIL,
    error: error,
  };
};

// export const cancelTransactionRepetition = (
//   token,
//   periodicChainId,
//   transactionId,
//   callback
// ) => {
//   return (dispatch) => {
//     dispatch(cancelTransactionRepetitionStart());
//     fetch("http://192.168.1.67:8081/transaction/cancelRepetition", {
//       method: "POST",
//       headers: {
//         Authorization: "Bearer " + token,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ periodicChainId, transactionId }),
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((resData) => {
//         // dispatch(fetchTransactions(token, filters));
//         callback();
//       })
//       .catch((error) => {
//         dispatch(cancelTransactionRepetitionFail(error));
//       });
//   };
// };

export const cancelTransactionRepetition = (
  token,
  periodicChainId,
  transactionId,
  callback
) => {
  return (dispatch) => {
    dispatch(cancelTransactionRepetitionStart());
    axios
      .post("/transaction/cancelRepetition", {
        periodicChainId,
        transactionId,
      })
      .then((resData) => {
        // dispatch(fetchTransactions(token, filters));
        callback();
      })
      .catch((error) => {
        dispatch(cancelTransactionRepetitionFail(error));
      });
  };
};

// export const changePlannedToFalse = (token, transactionId, callback) => {
//   return (dispatch) => {
//     dispatch({ type: actionTypes.CHANGE_PLANNED_TO_FALSE_START });
//     fetch(
//       `http://192.168.1.67:8081/transaction/updatePlannedTransaction/${transactionId}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: "Bearer " + token,
//           "Content-Type": "application/json",
//         },
//       }
//     )
//       .then((res) => {
//         return res.json();
//       })
//       .then((resData) => {
//         // dispatch(fetchTransactions(token));
//         callback();
//       })
//       .catch((error) => {
//         dispatch({
//           type: actionTypes.CHANGE_PLANNED_TO_FALSE_FAIL,
//           error: error,
//         });
//       });
//   };
// };

export const changePlannedToFalse = (token, transactionId, callback) => {
  return (dispatch) => {
    dispatch({ type: actionTypes.CHANGE_PLANNED_TO_FALSE_START });
    axios
      .put(`/transaction/updatePlannedTransaction/${transactionId}`)
      .then((resData) => {
        // dispatch(fetchTransactions(token));
        callback();
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.CHANGE_PLANNED_TO_FALSE_FAIL,
          error: error,
        });
      });
  };
};
