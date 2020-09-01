import React, { useState } from "react";
import { useStyles } from "./style";
import { menuList } from "./menuList";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import clsx from "clsx";

const SideBar = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.head}>
        <h2>Finbook</h2>
      </div>

      <ul className={classes.nav}>
        {menuList.map((menu, index) => (
          <li className={classes.navItemContainer} key={index}>
            <NavLink to={menu.link}>
              <div className={classes.navItem} onClick={null}>
                <p>{menu.text}</p>
                {menu.icon}
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;
