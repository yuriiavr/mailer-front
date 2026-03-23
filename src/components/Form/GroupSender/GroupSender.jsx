import css from "../form.module.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../../utils/Notifications/Notifications";
import { apiClient } from "../../api/url";

const MAIN_FORM_DATA_GROUP_KEY = "mainFormDataGroup";

const GroupSender = () => {
  const [allTemplates, setAllTemplates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedSavedTemplate, setSelectedSavedTemplate] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const { showNotification, showNameInput } = useNotifications();

  const [sendOption, setSendOption] = useState("sendNow");
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const [formData, setFormData] = useState({
    campaignName: "",
    nameFrom: "",
    posted: "",
    templateName: "",
    shopName: "",
    productName: "",
    tempSubject: "",
    previewText: "",
    dynamicLink: "",
  });

  useEffect(() => {
    const storedData = localStorage.getItem(MAIN_FORM_DATA_GROUP_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.posted) {
          parsedData.posted = Number(parsedData.posted) || "";
        }
        setFormData(parsedData);
        if (parsedData.selectedGroup) {
          setSelectedGroup(parsedData.selectedGroup);
        }
        setSendOption(parsedData.sendOption || "sendNow");
        setScheduledDateTime(parsedData.scheduledDateTime || "");
      } catch (e) {
        console.error("Failed to parse stored form data from localStorage", e);
        localStorage.removeItem(MAIN_FORM_DATA_GROUP_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(
        MAIN_FORM_DATA_GROUP_KEY,
        JSON.stringify({
          ...formData,
          selectedGroup,
          sendOption,
          scheduledDateTime,
        })
      );
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [formData, selectedGroup, sendOption, scheduledDateTime]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await apiClient.get("templates/gettemp");
        if (response.data && Array.isArray(response.data.templates)) {
          setAllTemplates(response.data.templates);
        } else {
          console.error(
            "Error: Invalid template data format or templates is not an array.",
            response
          );
          setAllTemplates([]);
        }
      } catch (error) {
        console.error("Error fetching templates: ", error);
        setAllTemplates([]);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchSavedTemplates = async () => {
      try {
        const response = await apiClient.get(
          "/senderMails/getSavedsaveTemplates"
        );
        if (response.data && Array.isArray(response.data.templates)) {
          setSavedTemplates(response.data.templates);
        } else {
          console.error(
            "Error: Invalid saved templates data format or templates is not an array.",
            response
          );
          setSavedTemplates([]);
        }
      } catch (error) {
        console.error("Error fetching saved templates: ", error);
        setSavedTemplates([]);
      }
    };
    fetchSavedTemplates();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get("senderMails/getAllGroups");
        if (response.data && Array.isArray(response.data.data)) {
          setGroups(response.data.data);
        } else {
          showNotification("Error fetching groups.", "error");
        }
      } catch (error) {
        showNotification("Error fetching groups.", "error");
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "posted") {
      const numValue = Number(value.trim());
      newValue = isNaN(numValue) ? "" : numValue;
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });

    if (name === "templateName") {
      const selectedTemplate = allTemplates.find((t) => t.tempName === value);
      if (selectedTemplate) {
        setFormData((prev) => ({
          ...prev,
          tempSubject: selectedTemplate.tempSubject,
          previewText: selectedTemplate.previewText || "",
        }));
      }
    }
  };

  const handleSavedTemplateChange = (e) => {
    const { value } = e.target;
    setSelectedSavedTemplate(value);
    if (value) {
      const selectedTemplate = savedTemplates.find(
        (t) => t.senderTemplateName === value
      );
      if (selectedTemplate) {
        setFormData({
          campaignName: selectedTemplate.campaignName,
          nameFrom: selectedTemplate.nameFrom,
          posted: selectedTemplate.posted,
          templateName: selectedTemplate.templateName,
          senderTemplateName: selectedTemplate.senderTemplateName,
          shopName: selectedTemplate.shopName,
          tempSubject: selectedTemplate.tempSubject,
          productName: selectedTemplate.productName,
          previewText: selectedTemplate.previewText,
        });
        setSelectedGroup(selectedTemplate.groupId || "");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalScheduledDateTime = null;
    if (sendOption === "schedule") {
      if (!scheduledDateTime) {
        showNotification(
          "Please select a date and time for delayed sending.",
          "error"
        );
        setIsSubmitting(false);
        return;
      }
      const selectedDate = new Date(scheduledDateTime);
      const now = new Date();
      if (selectedDate <= now) {
        showNotification(
          "The selected date and time must be in the future.",
          "error"
        );
        setIsSubmitting(false);
        return;
      }
      finalScheduledDateTime = scheduledDateTime;
    }

    const postedValue = Number(formData.posted);
    if (isNaN(postedValue)) {
      showNotification(
        "The 'Select amount' field must be a valid number.",
        "error"
      );
      setIsSubmitting(false);
      return;
    }
    const dataToSend = {
      campaignName: formData.campaignName,
      nameFrom: formData.nameFrom,
      domainName: formData.domainName,
      posted: postedValue,
      templateName: formData.templateName,
      groupId: selectedGroup,
      shopName: formData.shopName,
      productName: formData.productName,
      tempSubject: formData.tempSubject,
      previewText: formData.previewText,
      scheduledTime: finalScheduledDateTime,
      dynamicLink: formData.dynamicLink,
    };

    try {
      await apiClient.post("senderMails/send-by-group", dataToSend);

      showNotification(
        finalScheduledDateTime
          ? "Mailing successfully scheduled!"
          : "Sent successfully!",
        "success"
      );
      localStorage.removeItem(MAIN_FORM_DATA_GROUP_KEY);
      setFormData({
        campaignName: "",
        nameFrom: "",
        domainName: "",
        posted: "",
        templateName: "",
        shopName: "",
        productName: "",
        tempSubject: "",
        previewText: "",
      });
      setSelectedGroup("");
      setSendOption("sendNow");
      setScheduledDateTime("");
      setSelectedSavedTemplate("");
    } catch (error) {
      showNotification(
        `Error sending: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!isFormValid) {
      showNotification(
        "Please fill out all required fields before saving as a template.",
        "warning"
      );
      return;
    }

    try {
      const senderTemplateName = await showNameInput(
        "Please enter a name for the new template:"
      );

      const dataToSave = {
        ...formData,
        groupId: selectedGroup,
        senderTemplateName: senderTemplateName,
      };

      await apiClient.post("/senderMails/saveTemplate", dataToSave);
      showNotification(
        `Form saved as new template: "${senderTemplateName}"!`,
        "success"
      );

      const response = await apiClient.get(
        "/senderMails/getSavedsaveTemplates"
      );
      if (response.data && Array.isArray(response.data.templates)) {
        setSavedTemplates(response.data.templates);
      }
    } catch (error) {
      if (typeof error === "string" && error === "cancel") {
        showNotification("Template saving was cancelled.", "info");
      } else {
        showNotification(
          `Error saving template: ${
            error.response?.data?.error || error.message
          }`,
          "error"
        );
      }
    }
  };

  const isFormValid =
    formData.campaignName &&
    formData.nameFrom &&
    formData.posted !== "" &&
    !isNaN(Number(formData.posted)) &&
    formData.templateName &&
    selectedGroup &&
    formData.shopName &&
    formData.productName &&
    formData.tempSubject &&
    formData.previewText;

  return (
    <div className={css.formSection}>
      <div className={css.sendNav}>
              <Link to={"/"} className={css.sendLink}>
                Email Mailing /
              </Link>
              
              <Link to={"/manualSender"} className={css.sendLink}>
                Manual 
              </Link>
              <h2 className={css.title}>/ Group </h2>
            </div>
      <form className={css.form} onSubmit={handleSubmit}>
        <div className={css.formCont}>
          <label>
            <span>Send templates</span>
            <div className={css.selectStyles}>
              <select
                name="sendTemplates"
                value={selectedSavedTemplate}
                onChange={handleSavedTemplateChange}
              >
                <option value="">Select a saved template</option>
                {savedTemplates.map((template) => (
                  <option
                    key={template._id}
                    value={template.senderTemplateName}
                  >
                    {template.senderTemplateName}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <div style={{ display: "flex", gap: "20px" }}>
            <label>
              <span>Enter campaign name</span>
              <input
                name="campaignName"
                type="text"
                value={formData.campaignName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Enter link</span>
              <div className={css.selectStyles}>
                <input
                  type="url"
                  name="dynamicLink"
                  value={formData.dynamicLink}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <label>
              <span>Enter product name</span>
              <div className={css.selectStyles}>
                <input
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  type="text"
                  autoComplete="off"
                  required
                />
              </div>
            </label>
            <label>
              <span>Enter shop name</span>
              <div className={css.selectStyles}>
                <input
                  type="text"
                  required
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                />
              </div>
            </label>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <label>
              <span>Select email group</span>
              <div className={css.selectStyles}>
                <select
                  name="groupId"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a group
                  </option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label>
              <span>Enter sender name</span>
              <div className={css.selectStyles}>
                <input
                  type="text"
                  required
                  name="nameFrom"
                  value={formData.nameFrom}
                  onChange={handleChange}
                />
              </div>
            </label>
          </div>
          <div>
            <label>
              <span>Choose email template</span>
              <div className={css.selectStyles}>
                <select
                  name="templateName"
                  value={formData.templateName}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select template
                  </option>
                  {allTemplates.map((template) => (
                    <option key={template._id} value={template.tempName}>
                      {template.tempName}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label>
              <span>Select amount</span>
              <input
                name="posted"
                type="number"
                value={formData.posted}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <label>
            <span>Enter template subject</span>
            <div className={css.selectStyles}>
              <textarea
                name="tempSubject"
                value={formData.tempSubject}
                onChange={handleChange}
                type="text"
                autoComplete="off"
                required
              />
            </div>
          </label>

          <label>
            <span>Enter preview text</span>
            <div className={css.selectStyles}>
              <textarea
                type="text"
                required
                name="previewText"
                value={formData.previewText}
                onChange={handleChange}
              />
            </div>
          </label>
        </div>

        <div className={css.schedulingOptions}>
          <h3>Send Options:</h3>
          <div>
            <label className={css.radioLabel}>
              <input
                type="radio"
                value="sendNow"
                checked={sendOption === "sendNow"}
                onChange={() => setSendOption("sendNow")}
              />
              Send Now
            </label>
          </div>
          <div>
            <label className={css.radioLabel}>
              <input
                type="radio"
                value="schedule"
                checked={sendOption === "schedule"}
                onChange={() => setSendOption("schedule")}
              />
              Schedule Send
            </label>
          </div>
          {sendOption === "schedule" && (
            <label className={css.scheduleDateTimeLabel}>
              <span>Scheduled Date and Time:</span>
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                required
              />
            </label>
          )}
        </div>

        <button
          className="button"
          type="button"
          onClick={handleSaveAsTemplate}
          disabled={!isFormValid}
          style={{ marginBottom: "10px" }}
        >
          Save as template
        </button>

        <button
          disabled={!isFormValid || isSubmitting}
          className="button"
          type="submit"
        >
          {isSubmitting ? "Sending..." : "Start"}
        </button>
      </form>
    </div>
  );
};

export default GroupSender;