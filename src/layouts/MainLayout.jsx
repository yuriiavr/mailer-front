import './layout.css';
import React from 'react';
import Header from "../components/Header/Header";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="App">
      <div className="central-stripes-wrapper"></div>

      <div className="background-elements">
        <div className="blur-blob blob-top-left"></div>
        <div className="blur-blob blob-center"></div>
      </div>

      <Header />

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;