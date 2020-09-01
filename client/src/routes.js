// Layout Types
import { DashboardLayout } from "./layouts";
import Home from "./views/dashboard/Home";
import Projects from "./views/dashboard/Projects";
import Contractors from "./views/dashboard/Contractors";
import CashFlow from "./views/dashboard/CashFlow";
import ProfitAndLoss from "./views/dashboard/ProfitAndLoss";
import Settings from "./views/dashboard/Settings";
import Help from "./views/dashboard/Help";

export default [
  {
    path: "/dashboard",
    exact: true,
    layout: DashboardLayout,
    component: Home,
  },
  {
    path: "/projects",
    layout: DashboardLayout,
    component: Projects,
  },
  {
    path: "/contractors",
    layout: DashboardLayout,
    component: Contractors,
  },
  {
    path: "/cashFlow",
    layout: DashboardLayout,
    component: CashFlow,
  },
  {
    path: "/profitAndLoss",
    layout: DashboardLayout,
    component: ProfitAndLoss,
  },
  {
    path: "/settings",
    layout: DashboardLayout,
    component: Settings,
  },
  {
    path: "/help",
    layout: DashboardLayout,
    component: Help,
  },
];
