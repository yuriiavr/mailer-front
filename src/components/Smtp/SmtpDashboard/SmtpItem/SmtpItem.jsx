import { useState } from "react";
import styles from "./SmtpItem.module.css";
import { useNotifications } from "../../../../utils/Notifications/Notifications";
import { apiClient } from "../../../api/url";

const SmtpItem = ({ smtp, onUpdate }) => {
  const [dailyLimit, setDailyLimit] = useState(smtp.dailyLimit);
  const [status, setStatus] = useState(smtp.status);
  const [description, setDescription] = useState(smtp.smtpDescriptions || "");
  const [isEditing, setIsEditing] = useState(false);

  const { showNotification } = useNotifications();

  const handleLimitChange = (e) => {
    setDailyLimit(Number(e.target.value));
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdate = async () => {
    try {
      await apiClient.put(
        `smtp/smtp-statuses/${smtp.smtp_id}`,
        {
          dailyLimit: dailyLimit,
          status: status,
          smtpDescriptions: description,
        }
      );

      onUpdate();
      showNotification("Updated successfully!", "success");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update SMTP:", err);
      const errorMessage = `Failed to update: ${
        err.response?.data?.message || err.message
      }`;
      showNotification(errorMessage, "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDailyLimit(smtp.dailyLimit);
    setStatus(smtp.status);
    setDescription(smtp.smtpDescriptions || "");
  };

  const getStatusClass = (currentStatus) => {
    switch (currentStatus) {
      case "stopped":
        return styles.statusStopped;
      case "ban":
        return styles.statusBan;
      case "free":
        return styles.statusFree;
      case "busy":
        return styles.statusBusy;
      default:
        return "";
    }
  };

  return (
    <>
      <div className={styles.smtpItemContainer}>
        <h3 className={styles.smtpId}>{smtp.smtp_id}</h3>
        <p className={styles.descriptionText}>
          <strong>Description:</strong> {smtp.smtpDescriptions || "No description"}
        </p>
        <p>
          Current Status:{" "}
          <strong
            className={`${styles.statusText} ${getStatusClass(smtp.status)}`}
          >
            {smtp.status}
          </strong>
        </p>
        <p>Daily Limit: {smtp.dailyLimit}</p>
        <p>Today's Sends: {smtp.todaySends}</p>

        <button
          onClick={() => setIsEditing(true)}
          className={styles.editButton}
        >
          Edit
        </button>
      </div>

      {isEditing && (
        <div className={styles.modalOverlay}>
          <div className={styles.editModal}>
            <div className={styles.editSection}>
              <h4 className={styles.editTitle}>Edit SMTP Settings:</h4>
              
              <div className={styles.formGroup}>
                <label>Description:</label>
                <textarea
                  className={styles.textArea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor={`dailyLimit-${smtp._id}`}>Daily Limit:</label>
                <input
                  type="number"
                  id={`dailyLimit-${smtp._id}`}
                  value={dailyLimit}
                  onChange={handleLimitChange}
                />
              </div>
              <div className={styles.radioGroup}>
                <p>Change Status:</p>
                {["stopped", "ban", "free", "busy"].map((s) => (
                  <label key={s}>
                    <input
                      type="radio"
                      name={`status-${smtp._id}`}
                      value={s}
                      checked={status === s}
                      onChange={handleStatusChange}
                    />
                    <span className={styles.radioCustom}></span>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </label>
                ))}
              </div>
              <div>
                <button onClick={handleUpdate} className={styles.saveButton}>
                  Save Changes
                </button>
                <button onClick={handleCancel} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmtpItem;