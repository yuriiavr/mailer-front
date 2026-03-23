import { useEffect, useState } from "react";
import AddSmtp from "../../components/Smtp/AddSmtp/AddSmtp";
import SmtpDashboard from "../../components/Smtp/SmtpDashboard/SmtpDashboard";
import css from './SmtpPage.module.css'

const SmtpPage = () => {
  const [activeSmtpTab, setActiveSmtpTab] = useState(() => {
    const storedTab = localStorage.getItem("activeSmtpTab");
    return storedTab;
  });

  useEffect(() => {
    localStorage.setItem("activeSmtpTab", activeSmtpTab);
  }, [activeSmtpTab]);

  return (
    <div style={{position: 'relative'}}>
      <div className={css.navCont}>
        <button
          className={`${css.tabButton} ${
            activeSmtpTab === "dashboard" ? css.active : ""
          }`}
          onClick={() => setActiveSmtpTab("dashboard")}
        >
          Dashboard
        </button>
        <span className={css.slash}>/</span>
        <button
          className={`${css.tabButton} ${
            activeSmtpTab === "addSmtp" ? css.active : ""
          }`}
          onClick={() => setActiveSmtpTab("addSmtp")}
        >
          Add New SMTP
        </button>
      </div>
      {activeSmtpTab === "dashboard" && <SmtpDashboard />}
      {activeSmtpTab === "addSmtp" && <AddSmtp />}
    </div>
  );
};

export default SmtpPage;
