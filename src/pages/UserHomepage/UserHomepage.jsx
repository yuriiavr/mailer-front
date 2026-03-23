import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUserState } from "../../redux/auth/slice";
import Container from "../../components/Container/Container";
import EmailGroups from "../../components/EmailGroups/EmailGroups";
import UserAccount from "../../components/UserAccount/UserAccount";
import css from "./UserHomepage.module.css";
import SmtpPage from "../SmtpPage/SmtpPage";

const UserHomepage = () => {
  const { user } = useSelector(selectUserState);
  const [activeTab, setActiveTab] = useState(() => {
    const storedTab = localStorage.getItem("activeUserHomepageTab");
    return storedTab || (user?.role === "admin" ? "smtp" : "groups");
  });

  useEffect(() => {
    localStorage.setItem("activeUserHomepageTab", activeTab);
  }, [activeTab]);

  const isAdmin = user?.role === "admin";

  return (
    <Container>
      <div className={css.dashboardWrapper}>
        <div className={css.navCont}>
          <button
            className={`${css.tabButton} ${
              activeTab === "user" ? css.active : ""
            }`}
            onClick={() => setActiveTab("user")}
          >
            User
          </button>
          <span className={css.slash}>/</span>
          <button
            className={`${css.tabButton} ${
              activeTab === "groups" ? css.active : ""
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>

          {isAdmin && (
            <>
              <span className={css.slash}>/</span>
              <button
                className={`${css.tabButton} ${
                  activeTab === "smtp" ? css.active : ""
                }`}
                onClick={() => setActiveTab("smtp")}
              >
                SMTP
              </button>
            </>
          )}
        </div>

        {activeTab === "smtp" && isAdmin && <SmtpPage />}
        {activeTab === "groups" && <EmailGroups />}
        {activeTab === "user" && <UserAccount />}
      </div>
    </Container>
  );
};

export default UserHomepage;
