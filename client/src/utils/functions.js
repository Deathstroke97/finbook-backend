import constants from "constants/constants";
import moment from "moment";

export const isBusinessActive = (user) => {
  const activationEndDate = user.business.activationEndDate;
  const activated = moment(activationEndDate) > moment();
  return activated;
};

export const splitByThree = (value) => {
  var string = String(value).split(".")[0];
  var index = string.length;
  while (index >= 3) {
    var arr = string.split("");
    arr.splice(index - 3, 0, " ");
    index = index - 3;
    string = arr.join("");
  }
  return string;
};

export const getAmountWithoutSign = (amount) => {
  // let isNegative = value > 0 ? false : true;
  // let actual = Math.abs(value) / 100;
  // let integerPart = Math.trunc(actual);
  // let decimalPart = Math.round((actual % 1) * 100);

  // let str = decimalPart == 0 ? "00" : decimalPart;
  // let result = splitByThree(integerPart) + "," + str;
  // return result;
  let arr = amount.split(".");
  let integerPart = arr[0];
  let decimalPart = arr[1];
  let result = splitByThree(integerPart) + "." + decimalPart;
  return result;
};

export const getAmountWithSign = (value) => {
  let isNegative = value > 0 ? false : true;
  let actual = Math.abs(value) / 100;
  let integerPart = Math.trunc(actual);
  let decimalPart = Math.round((actual % 1) * 100);

  let str = decimalPart == 0 ? "00" : decimalPart;
  let result = splitByThree(integerPart) + "," + str;

  return isNegative ? "-" + result.trim() : "+" + result.trim();
};

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const filterCategoriesByType = (categories) => {
  const result = {
    incomeCategories: [],
    outcomeCategories: [],
  };
  categories.forEach((category) => {
    if (category.type === constants.INCOME) {
      result.incomeCategories.push(category);
    }
    if (category.type === constants.OUTCOME) {
      result.outcomeCategories.push(category);
    }
  });
  return result;
};
