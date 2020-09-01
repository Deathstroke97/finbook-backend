import React from "react";
import Home from "@material-ui/icons/Home";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import PeopleIcon from "@material-ui/icons/People";
import TimelineIcon from "@material-ui/icons/Timeline";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import SettingsIcon from "@material-ui/icons/Settings";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import grey from "@material-ui/core/colors/grey";

export const menuList = [
  {
    text: "Домой",
    icon: <Home />,
    link: "/dashboard",
  },
  {
    text: "Проекты",
    icon: <BusinessCenterIcon />,
    link: "/projects",
  },
  {
    text: "Контрагенты",
    icon: <PeopleIcon />,
    link: "/contractors",
  },
  {
    text: "Движение средств",
    icon: <TimelineIcon />,
    link: "/cashFlow",
  },
  {
    text: "Прибыли и убытки",
    icon: <LocalAtmIcon />,
    link: "/profitAndLoss",
  },
  {
    text: "Настройки",
    icon: <SettingsIcon />,
    link: "/settings",
  },
  {
    text: "Помощь",
    icon: <HelpOutlineIcon />,
    link: "/help",
  },
];
