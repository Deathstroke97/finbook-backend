import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../utils/functions";

const initialState = {
  categories: [],
  loading: false,
  error: null,
  initialLoading: true,
};

const fetchCategoriesStart = (state, action) => {
  return updateObject(state, { loading: true });
};

const fetchCategoriesSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
    categories: action.categories,
    initialLoading: false,
  });
};

const fetchCategoriesFailed = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
    initialLoading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_CATEGORIES_START:
      return fetchCategoriesStart(state, action);

    case actionTypes.FETCH_CATEGORIES_SUCCESS:
      return fetchCategoriesSuccess(state, action);

    case actionTypes.FETCH_CATEGORIES_FAILED:
      return fetchCategoriesFailed(state, action);
    default:
      return state;
  }
};

export default reducer;
