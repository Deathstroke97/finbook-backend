import axios from "axios";
import moment from "moment";

const isMixed = (transactions) => {
  let hasPlanned = false;
  let hasFact = false;
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].isPlanned === true) {
      hasPlanned = true;
      break;
    }
  }
  for (let j = 0; j < transactions.length; j++) {
    if (transactions[j].isPlanned === false) {
      hasFact = true;
      break;
    }
  }
  return hasPlanned && hasFact;
};

const getOnlyFactTransactions = (transactions) => {
  return transactions.filter((transaction) => {
    return transaction.isPlanned === false;
  });
};

export const filterTransactions = (
  hasFactTransactionForThisDate,
  transactions
) => {
  let result = transactions;
  if (hasFactTransactionForThisDate && isMixed(transactions)) {
    console.log("mixed true");
    result = getOnlyFactTransactions(transactions);
  }
  return result;
};

export const getFactTransactionForGivenDate = (date1, transactions) => {
  for (const transaction of transactions) {
    const date2 = moment(transaction.date).format("YYYY-MM-DD");
    if (moment(date1).isSame(date2) && !transaction.isPlanned) {
      return true;
    }
  }
  return false;
};

export const getBalanceForDate = async (
  date,
  conversionRates,
  accounts,
  accountInFilter,
  transactions
) => {
  let total = 0;

  for (const account of accounts) {
    if (transactions.length > 0) {
      for (let i = transactions.length - 1; i >= 0; i--) {
        const transaction = transactions[i];
        if (transaction.account._id === account._id) {
          const converted =
            conversionRates[transaction.account._id] *
            +transaction.accountBalance;

          total += converted;
          break;
        }
      }
    }
  }

  if (!accountInFilter) {
    for (const account of accounts) {
      if (account.transactions.length === 0) {
        const accountInitialBalanceDate = moment(
          account.initialBalanceDate
        ).format("YYYY-MM-DD");
        if (
          moment(accountInitialBalanceDate) < moment(date) ||
          moment(date).isSame(accountInitialBalanceDate)
        ) {
          const convertedInitialBalance =
            conversionRates[account._id] * +account.initialBalance;
          total += convertedInitialBalance;
        }
      }
    }
  }
  return total;
};

export const attachTransactionsForAccounts = (accounts, transactions) => {
  accounts = accounts.map((account) => {
    return {
      ...account,
      transactions: [],
    };
  });

  for (const transaction of transactions) {
    for (const account of accounts) {
      if (transaction.account._id === account._id) {
        account.transactions.push(transaction);
        break;
      }
    }
  }
  return accounts;
};

export const getConversionRates = async (accounts, businessCurrency) => {
  let conversion_rates = {};
  for (const account of accounts) {
    const accountCurrency = account.currency;
    let exchangeRate = 1;
    try {
      // const resourse1 = await axios.get(
      //   `https://free.currconv.com/api/v7/convert?q=${accountCurrency}_${businessCurrency}&compact=ultra&apiKey=8c36daab09adfc1b0ab5`
      // );
      // exchangeRate = resourse1.data[`${accountCurrency}_${businessCurrency}`];
      // conversion_rates[accountCurrency] = exchangeRate;
      // conversion_rates[account._id] = exchangeRate;
      conversion_rates[accountCurrency] = 1;
      conversion_rates[account._id] = 1;
    } catch (err) {
      try {
        const resourse2 = await axios.get(
          `https://v6.exchangerate-api.com/v6/4ff75eafe9d880c6bd719af7/latest/${accountCurrency}`
        );
        exchangeRate = resourse2.data.conversion_rates[accountCurrency];
        conversion_rates[accountCurrency] = exchangeRate;
        conversion_rates[account._id] = exchangeRate;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
  return conversion_rates;
};
