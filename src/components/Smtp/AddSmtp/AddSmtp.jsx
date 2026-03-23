import { useState } from "react";
import css from "./AddSmtp.module.css";
import { useNotifications } from "../../../utils/Notifications/Notifications";
import { apiClient } from "../../api/url";

const AddSmtp = () => {
  const { showNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: "",
    host: "",
    user: "",
    port: "",
    hostName: "",
    domain: "",
    userEmail: "",
    userPassword: "",
    privilegedGroup: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      name: formData.name,
      host: formData.host,
      user: formData.user || "root",
      port: Number(formData.port) || 22,
      keyPath: "",
      vars: {
        smtp_hostname: formData.hostName || undefined,
        smtp_domain: formData.domain,
        email_user: formData.userEmail || undefined,
        email_password: formData.userPassword || undefined,
        mail_privileged_group: formData.privilegedGroup || undefined,
      },
    };

    Object.keys(dataToSend.vars).forEach(key => {
      if (dataToSend.vars[key] === undefined) {
        delete dataToSend.vars[key];
      }
    });

    try {
      await apiClient.post("smtp/create-smtp", {
        hosts: [dataToSend],
      });

      showNotification("SMTP server added successfully!", "success");
      
      setFormData({
        name: "",
        host: "",
        user: "",
        port: "",
        hostName: "",
        domain: "",
        userEmail: "",
        userPassword: "",
        privilegedGroup: "",
      });

    } catch (err) {
      console.error("Failed to add SMTP:", err);
      const errorMessage = `Failed to add SMTP: ${
        err.response?.data?.message || err.message
      }`;
      showNotification(errorMessage, "error");
    }
  };

  return (
    <div className={css.formSection}>
      <form className={css.form} onSubmit={handleSubmit}>
        <h2 className={css.title}>Add New SMTP Server</h2>
        <div className={css.formCont}>
          <div style={{ display: "flex" }}>
            <label>
              <span>Smtp Name</span>
              <input name="name" type="text" value={formData.name} onChange={handleChange} required />
            </label>
            <label>
              <span>Host</span>
              <div className={css.selectStyles}>
                <input name="host" value={formData.host} onChange={handleChange} required />
              </div>
            </label>
          </div>
          <div style={{ display: "flex" }}>
            <label>
              <span>User</span>
              <div className={css.selectStyles}>
                <input name="user" type="text" value={formData.user} onChange={handleChange} autoComplete="off" required />
              </div>
            </label>
            <label>
              <span>Port</span>
              <div className={css.selectStyles}>
                <input type="number" required name="port" value={formData.port} onChange={handleChange} />
              </div>
            </label>
          </div>
          <div style={{ display: "flex" }}>
            <label>
              <span>Host Name</span>
              <div className={css.selectStyles}>
                <input type="text" name="hostName" value={formData.hostName} onChange={handleChange} />
              </div>
            </label>
            <label>
              <span>Domain</span>
              <div className={css.selectStyles}>
                <input type="text" required name="domain" value={formData.domain} onChange={handleChange} />
              </div>
            </label>
          </div>
          <div>
            <label>
              <span>User Email</span>
              <div className={css.selectStyles}>
                <input type="text" name="userEmail" value={formData.userEmail} onChange={handleChange} />
              </div>
            </label>

            <label>
              <span>User Password</span>
              <div className={css.selectStyles}>
                <input type="password" name="userPassword" value={formData.userPassword} onChange={handleChange} />
              </div>
            </label>
          </div>
          <label>
            <span>Email Privileged Group</span>
            <div className={css.selectStyles}>
              <input type="text" name="privilegedGroup" value={formData.privilegedGroup} onChange={handleChange} />
            </div>
          </label>
        </div>

        <button className="button" type="submit">
          Start
        </button>
      </form>
    </div>
  );
};

export default AddSmtp;