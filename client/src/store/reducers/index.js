import { combineReducers } from "redux";
import projects from "./projects";
import contractors from "./contractors";
import accounts from "./accounts";
import categories from "./categories";
import transactions from "./transactions";

const rootReducer = combineReducers({
  transactions,
  accounts,
  projects,
  contractors,
  categories,
});

export default rootReducer;
