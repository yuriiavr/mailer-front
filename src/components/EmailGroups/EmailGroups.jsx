import { useState, useEffect } from "react";
import { apiClient } from "../api/url";
import { useNotifications } from "../../utils/Notifications/Notifications";
import css from "./EmailGroups.module.css";

const EmailGroups = () => {
  const [groupName, setGroupName] = useState("");
  const [emails, setEmails] = useState("");
  const [groups, setGroups] = useState([]);
  const [openGroup, setOpenGroup] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [showAddEmailInput, setShowAddEmailInput] = useState(false);
  const { showNotification, showConfirmation } = useNotifications();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get("senderMails/getAllGroups");
      if (response.data.status === "success") {
        setGroups(response.data.data);
      } else {
        showNotification("Error fetching groups.", "error");
      }
    } catch (error) {
      showNotification("Error fetching groups.", "error");
      console.error("Error fetching groups:", error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const emailsArray = emails
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email);

    try {
      const response = await apiClient.post("senderMails/createGroup", {
        groupName,
        emails: emailsArray,
      });
      if (response.data.status === "success") {
        showNotification("Group created successfully!", "success");
        setGroupName("");
        setEmails("");
        fetchGroups();
      } else {
        showNotification("Error creating group.", "error");
      }
    } catch (error) {
      showNotification("Error creating group.", "error");
      console.error("Error creating group:", error);
    }
  };

  const handleToggleGroup = (groupId) => {
    setOpenGroup(openGroup === groupId ? null : groupId);
  };

  const handleDeleteEmail = async (groupId, emailToDelete) => {
    showNotification(
      `Deleting ${emailToDelete} from group ${groupId}...`,
      "info"
    );
    try {
      await apiClient.post(`senderMails/deleteEmailFromGroup`, {
        groupId,
        email: emailToDelete,
      });
      showNotification("Email deleted successfully!", "success");
      fetchGroups();
    } catch (error) {
      showNotification("Error deleting email.", "error");
      console.error("Error deleting email:", error);
    }
  };

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleAddEmail = async (groupId) => {
    const emailsArray = newEmail
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email);

    if (emailsArray.length === 0) {
      showNotification("Please enter at least one email.", "error");
      return;
    }

    const invalidEmails = emailsArray.filter((email) => !validateEmail(email));
    if (invalidEmails.length > 0) {
      showNotification(
        `Invalid emails found: ${invalidEmails.join(", ")}`,
        "error"
      );
      return;
    }

    try {
      showNotification(`Adding emails to group ${groupId}...`, "info");
      await apiClient.post(`senderMails/addEmailToGroup`, {
        groupId,
        emails: emailsArray,
      });
      showNotification("Emails added successfully!", "success");
      setNewEmail("");
      setShowAddEmailInput(false);
      fetchGroups();
    } catch (error) {
      showNotification("Error adding email.", "error");
      console.error("Error adding email:", error);
    }
  };

  const handleCloseAddEmail = () => {
    setShowAddEmailInput(false);
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await showConfirmation("Are you sure you want to delete this group?");
      showNotification(`Deleting group...`, "info");
      await apiClient.delete(`senderMails/deleteGroup/${groupId}`);
      showNotification("Group deleted successfully!", "success");
      setOpenGroup(null);
      fetchGroups();
    } catch (error) {
      showNotification("Deletion cancelled.", "info");
      console.error("Error deleting group:", error);
    }
  };

  return (
    <div className={css.cont}>
      <form className={css.form} onSubmit={handleCreateGroup}>
        <h2 className="title">Create New Email Group</h2>
        <label className={css.label}>
          <span>Group Name:</span>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </label>
        <button className="button" type="submit">
          Create Group
        </button>
      </form>
      <div style={{ marginTop: "20px" }}>
        <h3 className="title">Existing Groups</h3>
        <ul className={css.groupsList}>
          {groups.map((group) => (
            <li key={group._id} className={css.groupItem}>
              <div
                className={css.groupHeader}
                onClick={() => handleToggleGroup(group._id)}
              >
                <strong title={group.groupName}>{group.groupName}</strong> ({group.emails.length}{" "}
                emails)
                <span className={css.toggleIcon}>
                  {openGroup === group._id ? "▲" : "▼"}
                </span>
              </div>
              {openGroup === group._id && (
                <div className={css.emailsContainer}>
                  {!showAddEmailInput && (
                    <div className={css.addEmailButtonContainer}>
                      <button
                        onClick={() => handleDeleteGroup(group._id)}
                        className={css.closeButton}
                      >
                        Delete Group
                      </button>
                      <button
                        onClick={() => setShowAddEmailInput(true)}
                        className={css.plusButton}
                      >
                        Add mail to group
                      </button>
                    </div>
                  )}
                  {showAddEmailInput && (
                    <div className={css.addEmailSection}>
                      <div className={css.addEmailCont}>
                        <h3 className={css.addingTitle}>
                          Adding mails to group
                        </h3>
                        <textarea
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new emails (one per line)..."
                          className={css.newEmailInput}
                          rows="5"
                        />
                        <div>
                          <button
                            onClick={() => handleCloseAddEmail(group._id)}
                            className={css.closeButton}
                          >
                            Close
                          </button>
                          <button
                            onClick={() => handleAddEmail(group._id)}
                            className={css.addButton}
                          >
                            Add mail to group
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <ul className={css.emailList}>
                    {group.emails.map((email, index) => (
                      <li key={index} className={css.emailItem}>
                        <span>{email}</span>
                        <button
                          onClick={() => handleDeleteEmail(group._id, email)}
                          className={css.deleteButton}
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmailGroups;
