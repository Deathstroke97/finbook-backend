import React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import * as actions from "store/actions";
import axios from "axios-instance";

export const SessionContext = React.createContext({ user: {} });

const SessionProvider = (props) => {
  const [user, setUser] = useState({});
  const [error, setError] = useState(null);

  const setUserData = (data) => {
    const { token, user, business } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("business", JSON.stringify(business));

    setUser({
      isAuthenticated: true,
      token,
      user,
      business,
    });
  };

  const clearUserData = () => {
    setUser({});
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("/user");
      return res.data.user;
    } catch (error) {
      setError(error);
    }
  };

  const fetchBusiness = async () => {
    try {
      const res = await axios.get("/business");
      return res.data.business;
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const fetchData = async () => {
      const user = await fetchUser();
      const business = await fetchBusiness();
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("business", JSON.stringify(business));

      if (!business || !user) {
        return;
      }
      const userData = {
        isAuthenticated: true,
        token: token,
        user: user,
        business: business,
      };
      setUser(userData);
    };
    fetchData();
  }, []);

  const value = {
    user: user,
    setUserData,
    clearUserData,
  };

  return (
    <SessionContext.Provider value={value}>
      {props.children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
