export const accounts = [
  {
    value: "Евразийский банк",
    label: "Евразийский банк",
  },
  {
    value: "БЦК",
    label: "БЦК",
  },
  {
    value: "Каспи банк",
    label: "Каспи банк",
  },
  {
    value: "Альфа банк",
    label: "Альфа банк",
  },
];

const report = {
  totalExpenseWeek: "150000",
  totalIncomeWeek: "121000",
  totalExpenseMonth: "150000",
  totalIncomeMonth: "290000",
  totalIncomeQuarter: [
    {
      label: "окт 2019",
      value: "124000",
    },
    {
      label: "ноябрь 2019",
      value: "50000",
    },
    {
      label: "дек 2019",
      value: "10000",
    },
    {
      label: "ИТОГО",
      value: "545000",
    },
  ],
  totalExpenseQuarter: [
    {
      label: "окт 2019",
      value: "124000",
    },
    {
      label: "ноябрь 2019",
      value: "50000",
    },
    {
      label: "дек 2019",
      value: "10000",
    },
    {
      label: "ИТОГО",
      value: "545000",
    },
  ],
};

export const articles = [
  {
    value: "-1",
    label: "Без статьи",
    report: { ...report },
  },
  {
    value: "Педикюр",
    label: "Педикюр",
    report: { ...report },
  },
  {
    value: "Маникюр",
    label: "Маникюр",
    report: { ...report },
  },
  {
    value: "Продажа косметики",
    label: "Продажа косметики",
    report: { ...report },
  },
  {
    value: "Обслуживание клиента",
    label: "Обслуживание клиента",
    report: { ...report },
  },
];

export const projects = [
  {
    value: "Astana Media Group",
    label: "Astana Media Group",
  },
  {
    value: "Открытие нового салона красоты",
    label: "Открытие нового салона красоты",
  },
  {
    value: "Beauty Production",
    label: "Педикюр",
  },
];

export const counterparties = [
  {
    value: "TOO Самурук",
    label: "TOO Самурук",
  },
  {
    value: "TOO Acтыкжан",
    label: "TOO Acтыкжан",
  },
  {
    value: "TOO Star Astana",
    label: "TOO Star Astana",
  },
  {
    value: "TOO CompScience",
    label: "TOO CompScience",
  },
];

export const categoryTypes = [
  {
    value: 1,
    label: "Доходы",
  },
  {
    value: 2,
    label: "Расходы",
  },
];

export const activities = [
  {
    value: 3,
    label: "Операционная",
  },
  {
    value: 2,
    label: "Инвестиционная",
  },
  {
    value: 1,
    label: "Финансовая",
  },
];

export const isOwnerTransferIncome = [
  {
    value: false,
    label: "Cтатья доходов",
  },
  {
    value: true,
    label: "Ввод денег",
  },
];

export const isOwnerTransferOutcome = [
  {
    value: false,
    label: "Cтатья расходов",
  },
  {
    value: true,
    label: "Вывод денег",
  },
];

// ["RUB", "EUR", "USD", "KZT", "UAH", "GBP", "BYN"],

export const currencies = [
  {
    value: "KZT",
    label: "KZT",
  },
  // {
  //   value: "RUB",
  //   label: "RUB",
  // },
  // {
  //   value: "EUR",
  //   label: "EUR",
  // },
  // {
  //   value: "USD",
  //   label: "USD",
  // },
  // {
  //   value: "UAH",
  //   label: "UAH",
  // },
  // {
  //   value: "GBP",
  //   label: "GBP",
  // },
  // {
  //   value: "BYN",
  //   label: "BYN",
  // },
];
