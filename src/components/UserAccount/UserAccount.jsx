import { useState, useEffect } from "react";
import { useNotifications } from "../../utils/Notifications/Notifications";
import css from "./UserAccount.module.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserState } from "../../redux/auth/slice";
import { changeEmail, deleteUser, changeDbLink } from "../../redux/auth/operations"; 

const UserAccount = () => {
  const { showConfirmation, showNotification } = useNotifications();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(selectUserState);

  const [email, setEmail] = useState("");
  const [isEmailChanging, setIsEmailChanging] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [dbLinkState, setDbLinkState] = useState("");
  const [isDbLinkChanging, setIsDbLinkChanging] = useState(false);
  const [newDbLink, setNewDbLink] = useState("");
  
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC+2");

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
      setNewEmail(user.email);
      setDbLinkState(user.dbLink || "");
      setNewDbLink(user.dbLink || "");
    }
  }, [user]);

  const handleDbLinkChangeClick = () => {
    setIsDbLinkChanging(true);
  };

  const handleSaveDbLink = async () => {
  
  if (!newDbLink || newDbLink.trim() === "") {
    showNotification("DB Link cannot be empty.", "error");
    return;
  }

  try {
    await dispatch(changeDbLink(newDbLink)).unwrap(); 
    
    setDbLinkState(newDbLink);
    setIsDbLinkChanging(false);
    showNotification("DB Link has been successfully updated.", "success");
  } catch (error) {
    const errorMessage =
      error.payload || "Failed to change DB Link. Please try again.";
    showNotification(errorMessage, "error");
    console.error("Change DB Link failed:", error);
  }
};

  const handleCancelDbLinkChange = () => {
    setNewDbLink(dbLinkState);
    setIsDbLinkChanging(false);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };
  const handleTimezoneChange = (e) => {
    setTimezone(e.target.value);
  };

  const handleEmailChangeClick = () => {
    setIsEmailChanging(true);
  };

  const handleSaveEmail = async () => {
    if (!newEmail || newEmail.trim() === "") {
      showNotification("Email cannot be empty.", "error");
      return;
    }

    try {
      await dispatch(changeEmail({ newEmail })).unwrap();
      showNotification(
        "Email has been successfully changed. Please check your new email to verify it.",
        "success"
      );
      setIsEmailChanging(false);
    } catch (error) {
      const errorMessage =
        error.payload || "Failed to change email. Please try again.";
      showNotification(errorMessage, "error");
      console.error("Change email failed:", error);
    }
  };

  const handleCancelEmailChange = () => {
    setNewEmail(email);
    setIsEmailChanging(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmed = await showConfirmation(
        "Are you sure you want to delete your account? This action cannot be undone."
      );
      if (confirmed) {
        try {
          await dispatch(deleteUser()).unwrap();
          showNotification("Account successfully deleted.", "success");
          navigate("/");
        } catch (error) {
          const errorMessage =
            error.payload || "Failed to delete account. Please try again.";
          showNotification(errorMessage, "error");
          console.error("Delete account failed:", error);
        }
      }
    } catch (error) {
      console.log("Account deletion canceled.");
    }
  };


  return (
    <div className={css.accountWrapper}>
      <h2>Account Settings</h2>
      <div className={css.settingItem}>
        <label>Email:</label>
        {isEmailChanging ? (
          <div className={css.emailInputGroup}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={css.inputField}
              placeholder="Enter new email..."
            />
            <button className={css.saveButton} onClick={handleSaveEmail}>
              Save
            </button>
            <button
              className={css.cancelButton}
              onClick={handleCancelEmailChange}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className={css.emailDisplay}>
            <span>{email}</span>
            <button
              className={css.changeButton}
              onClick={handleEmailChangeClick}
            >
              Change
            </button>
          </div>
        )}
      </div>

      <div className={css.settingItem}>
        <label>Interface Language:</label>
        <select
          value={language}
          onChange={handleLanguageChange}
          className={css.selectField}
        >
          <option value="en">English</option>
          <option value="ua">Українська</option>
        </select>
      </div>

      <div className={css.settingItem}>
        <label>Time Zone:</label>
        <select
          value={timezone}
          onChange={handleTimezoneChange}
          className={css.selectField}
        >
          <option value="UTC+2">UTC+2</option>
          <option value="UTC+3">UTC+3</option>
        </select>
      </div>

      <h2>DB Connection</h2>

      <div className={css.settingItem}>
        <label>Link to DB:</label>
        {isDbLinkChanging ? (
          <div className={css.emailInputGroup}> 
            <input
              type="text"
              value={newDbLink}
              onChange={(e) => setNewDbLink(e.target.value)}
              className={css.inputField}
              placeholder="Enter new DB connection link..."
            />
            <button className={css.saveButton} onClick={handleSaveDbLink}>
              Save
            </button>
            <button
              className={css.cancelButton}
              onClick={handleCancelDbLinkChange}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className={css.emailDisplay}> 
            <span>{dbLinkState || "Not set"}</span>
            <button
              className={css.changeButton}
              onClick={handleDbLinkChangeClick}
            >
              Change
            </button>
          </div>
        )}
      </div>

      <div className={css.actionButtons}>
        <button className={css.deleteButton} onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default UserAccount;