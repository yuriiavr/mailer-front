import css from "../form.module.css";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import COUNTRIES from "../../../utils/Constants/Countries";
import { useNotifications } from "../../../utils/Notifications/Notifications";
import { apiClient } from "../../api/url";

const MANUAL_FORM_DATA_KEY = "manualFormData";

const ManualForm = () => {
  const [templates, setTemplates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  const { showNotification } = useNotifications();

  const [sendOption, setSendOption] = useState("sendNow");
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const [formData, setFormData] = useState({
    campaignName: "",
    nameFrom: "",
    domainName: "",
    templateName: "",
    shopName: "",
    productName: "",
    tempSubject: "",
    previewText: "",
    emails: "",
    dynamicLink: "",
  });

  const [geoInput, setGeoInput] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem(MANUAL_FORM_DATA_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
        if (parsedData.geo) {
          const selectedCountry = COUNTRIES.find(
            (c) => c.code === parsedData.geo
          );
          if (selectedCountry) {
            setGeoInput(selectedCountry.name);
          }
        }
        setSendOption(parsedData.sendOption || "sendNow");
        setScheduledDateTime(parsedData.scheduledDateTime || "");
      } catch (e) {
        console.error("Failed to parse stored form data from localStorage", e);
        localStorage.removeItem(MANUAL_FORM_DATA_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(
        MANUAL_FORM_DATA_KEY,
        JSON.stringify({
          ...formData,
          sendOption,
          scheduledDateTime,
        })
      );
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [formData, sendOption, scheduledDateTime]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await apiClient.get("templates/gettemp");
        if (response.data && Array.isArray(response.data.templates)) {
          setTemplates(response.data.templates);
        } else {
          console.error(
            "Error: Invalid template data format or templates is not an array.",
            response
          );
          setTemplates([]);
        }
      } catch (error) {
        console.error("Error fetching templates: ", error);
        setTemplates([]);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const rawEmailsString = formData.emails;
    const emailsArray = rawEmailsString
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email !== "");
    setEmailCount(emailsArray.length);
  }, [formData.emails]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "templateName") {
      const selectedTemplate = templates.find(
        (t) => t.tempName === e.target.value
      );
      if (selectedTemplate) {
        setFormData((prev) => ({
          ...prev,
          tempSubject: selectedTemplate.tempSubject,
          previewText: selectedTemplate.previewText || "",
        }));
      }
    }
  };

  const handleGeoInputChange = (e) => {
    const value = e.target.value;
    setGeoInput(value);
    setShowDropdown(true);

    const lowerCaseValue = value.toLowerCase();

    const filtered = COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(lowerCaseValue)
    );
    setFilteredCountries(filtered);

    const currentSelectedCountryObject = COUNTRIES.find(
      (c) => c.code === formData.geo
    );

    if (value === "") {
      setFormData((prev) => ({ ...prev, geo: "" }));
    } else if (
      currentSelectedCountryObject &&
      currentSelectedCountryObject.name.toLowerCase() !== lowerCaseValue
    ) {
      setFormData((prev) => ({ ...prev, geo: "" }));
    }
  };

  const handleGeoSelect = (country) => {
    setGeoInput(country.name);
    setFormData((prev) => ({ ...prev, geo: country.code }));
    setShowDropdown(false);
    setFilteredCountries([]);
  };

  const handleClickOutside = useCallback(
    (e) => {
      if (
        e.target &&
        !e.target.closest(`.${css.selectStylesGeo}`) &&
        showDropdown
      ) {
        setShowDropdown(false);

        const selectedCountry = COUNTRIES.find(
          (country) => country.code === formData.geo
        );
        if (selectedCountry) {
          if (geoInput !== selectedCountry.name) {
            setGeoInput(selectedCountry.name);
          }
        } else {
          setGeoInput("");
        }
      }
    },
    [showDropdown, geoInput, formData.geo]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const rawEmailsString = formData.emails;
    const emailStrings = rawEmailsString
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email !== "");

    const emailsForBackend = emailStrings.map((email) => ({ email: email }));

    if (emailsForBackend.length === 0) {
      showNotification("Please enter at least one email address.", "error");
      setIsSubmitting(false);
      return;
    }

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

    try {
      await apiClient.post("senderMails/send-manual", {
        campaignName: formData.campaignName,
        nameFrom: formData.nameFrom,
        domainName: formData.domainName,
        posted: emailsForBackend.length,
        templateName: formData.templateName,
        shopName: formData.shopName,
        productName: formData.productName,
        tempSubject: formData.tempSubject,
        previewText: formData.previewText,
        emails: emailsForBackend,
        scheduledTime: finalScheduledDateTime,
        dynamicLink: formData.dynamicLink,
      });

      showNotification(
        finalScheduledDateTime
          ? "Mailing successfully scheduled!"
          : "Sent successfully!",
        "success"
      );
      localStorage.removeItem(MANUAL_FORM_DATA_KEY);
      setFormData({
        campaignName: "",
        nameFrom: "",
        domainName: "",
        templateName: "",
        shopName: "",
        productName: "",
        tempSubject: "",
        previewText: "",
        emails: "",
      });
      setGeoInput("");
      setSendOption("sendNow");
      setScheduledDateTime("");
    } catch (error) {
      showNotification(
        `Error sending: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.campaignName &&
    formData.nameFrom &&
    formData.templateName &&
    formData.tempSubject &&
    formData.previewText &&
    formData.emails.trim() !== "";

  return (
    <div className={css.formSection}>
      <div className={css.sendNav}>
        <Link to={"/"} className={css.sendLink}>
          Email Mailing
        </Link>
        <h2 className={css.title}>/ Manual /</h2>
        <Link to={"/groupSender"} className={css.sendLink}>
          Group
        </Link>
      </div>
      <form className={css.form} onSubmit={handleSubmit}>
        <div className={css.formCont}>
          <div style={{ display: "flex" }}>
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
              <span>Enter dynamic link</span>
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

          <div style={{ display: "flex" }}>
            <label>
              <span>Choice email template</span>
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
                  {templates.map((template) => (
                    <option key={template.tempName} value={template.tempName}>
                      {template.tempName}
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
              <span>Select amount</span>
              <input
                name="posted"
                type="text"
                value={emailCount}
                readOnly
                disabled
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
                autoComplete="off"
                required
              />
            </div>
          </label>

          <label>
            <span>Enter preview text</span>
            <div className={css.selectStyles}>
              <textarea
                required
                name="previewText"
                value={formData.previewText}
                onChange={handleChange}
              />
            </div>
          </label>
          <label>
            <span>Enter emails</span>
            <div className={css.textAreaStyles}>
              <textarea
                name="emails"
                id="emails"
                value={formData.emails}
                onChange={handleChange}
                required
                placeholder="Enter emails, each on a new line"
              ></textarea>
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
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Start"}
        </button>
      </form>
    </div>
  );
};

export default ManualForm;
