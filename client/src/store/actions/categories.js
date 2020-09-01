import * as actionTypes from "./actionTypes";
import axios from "axios-instance";

export const fetchCategoriesStart = () => {
  return {
    type: actionTypes.FETCH_CATEGORIES_START,
  };
};

export const fetchCategoriesSuccess = (categories) => {
  return {
    type: actionTypes.FETCH_CATEGORIES_SUCCESS,
    categories: categories.categories,
  };
};

export const fetchCategoriesFail = (error) => {
  return {
    type: actionTypes.FETCH_CATEGORIES_FAILED,
    error: error,
  };
};

// export const fetchCategories = (token) => {
//   return (dispatch) => {
//     dispatch(fetchCategoriesStart());
//     fetch("http://192.168.1.67:8081/categories", {
//       headers: {
//         Authorization: "Bearer " + token,
//       },
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((resData) => {
//         dispatch(fetchCategoriesSuccess(resData));
//       })
//       .catch((error) => {
//         dispatch(fetchCategoriesFail(error));
//       });
//   };
// };

export const fetchCategories = (token) => {
  return (dispatch) => {
    dispatch(fetchCategoriesStart());
    axios
      .get("/categories")
      .then((res) => {
        dispatch(fetchCategoriesSuccess(res.data));
      })
      .catch((error) => {
        dispatch(fetchCategoriesFail(error));
      });
  };
};
