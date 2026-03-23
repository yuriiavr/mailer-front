import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/auth/operations";
import css from "./Header.module.css";
import { useAuth } from "../../hooks/useAuth";
import { ReactComponent as LogOutIcon } from "../../img/logout.svg";
import { ReactComponent as UserIcon } from "../../img/user.svg";
import { useEffect } from "react";
import { useRef } from "react";
import { useNotifications } from "../../utils/Notifications/Notifications";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const addContainerRef = useRef(null);
  const { showConfirmation } = useNotifications();

  const openAdd = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const confirmed = await showConfirmation("Are you sure you want to log out?");
      if (confirmed) {
        dispatch(logoutUser())
          .then(() => {
            navigate("/");
          })
          .catch((error) => console.error(error));
      }
    } catch (error) {
      console.error("Logout canceled:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        addContainerRef.current &&
        !addContainerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isMailingActive =
    location.pathname === "/" || location.pathname === "/manualSender";
  const isStatActive =
    location.pathname === "/trackpage" ||
    location.pathname === "/geoTrack" ||
    location.pathname === "/textTrack";
  const isTemplatesActive = location.pathname === "/templates";
  const isScheduleActive = location.pathname === "/schedulePage";
  const isLogInActive = location.pathname === "/login";
  const isSignUpActive = location.pathname === "/signup";
  const isUserHomePageActive = location.pathname === "/userhomepage";

  return (
    <div className={css.header}>
      <div className={css.logoCont}>
        <img
          className={css.logo}
          src={require("../../img/logo.png")}
          alt="logo"
        />
      </div>
      <div className={css.navigation}>
        <Link
          className={`${css.link} ${isMailingActive ? css.activeLink : ""}`}
          to="/"
        >
          Mailing
        </Link>
        <Link
          className={`${css.link} ${isStatActive ? css.activeLink : ""}`}
          to="/trackpage"
        >
          Stat
        </Link>
        <Link
          className={`${css.link} ${isTemplatesActive ? css.activeLink : ""}`}
          to="/templates"
        >
          Templates
        </Link>
        <Link
          className={`${css.link} ${isScheduleActive ? css.activeLink : ""}`}
          to="/schedulePage"
        >
          Schedule
        </Link>
      </div>

      <div className={css.authSection}>
        {isLoggedIn ? (
          <>
            <Link
              to={"/userhomepage"}
              className={`${css.profileIconLink} ${
                isUserHomePageActive ? css.activeLink : ""
              }`}
            >
              <UserIcon className={css.icon} width="30" height="30" />
            </Link>
            <button
              className={`${css.link} ${css.logoutButton}`}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
              onClick={handleLogout}
            >
              <LogOutIcon className={css.icon} width="30" height="30" />
            </button>
          </>
        ) : (
          <>
            <Link
              className={`${css.link} ${isLogInActive ? css.activeLink : ""}`}
              style={{ marginRight: "15px" }}
              to="/login"
            >
              Log In
            </Link>
            <Link
              className={`${css.link} ${isSignUpActive ? css.activeLink : ""}`}
              to="/signup"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;