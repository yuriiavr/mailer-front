import css from "./form.module.css";
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import COUNTRIES from "../../utils/Constants/Countries";
import { useNotifications } from "../../utils/Notifications/Notifications";
import { apiClient } from "../api/url";

const MAIN_FORM_DATA_KEY = "mainFormData";

const Form = () => {
  const [allTemplates, setAllTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedSavedTemplate, setSelectedSavedTemplate] = useState("");

  const { showNotification, showNameInput } = useNotifications();

  const [sendOption, setSendOption] = useState("sendNow");
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const [formData, setFormData] = useState({
    campaignName: "",
    nameFrom: "",
    posted: "",
    templateName: "",
    geo: "",
    shopName: "",
    productName: "",
    tempSubject: "",
    previewText: "",
    dynamicLink: "",
  });

  const [geoInput, setGeoInput] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem(MAIN_FORM_DATA_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.posted) {
          parsedData.posted = Number(parsedData.posted) || "";
        }
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
        localStorage.removeItem(MAIN_FORM_DATA_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(
        MAIN_FORM_DATA_KEY,
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
    if (!formData.geo) {
      setFilteredTemplates(
        allTemplates.filter(
          (template) =>
            template.tempGeo === "none" || template.tempGeo === undefined
        )
      );
    } else {
      const templatesByGeo = allTemplates.filter(
        (template) =>
          template.tempGeo === formData.geo || template.tempGeo === "none"
      );
      setFilteredTemplates(templatesByGeo);
    }
  }, [formData.geo, allTemplates]);

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
      const selectedTemplate = filteredTemplates.find(
        (t) => t.tempName === value
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
          geo: selectedTemplate.geo,
          shopName: selectedTemplate.shopName,
          tempSubject: selectedTemplate.tempSubject,
          productName: selectedTemplate.productName,
          previewText: selectedTemplate.previewText,
        });
        const selectedCountry = COUNTRIES.find(
          (c) => c.code === selectedTemplate.geo
        );
        if (selectedCountry) {
          setGeoInput(selectedCountry.name);
        }
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

    if (
      value === "" ||
      !COUNTRIES.some((c) => c.name.toLowerCase() === lowerCaseValue)
    ) {
      setFormData((prev) => ({
        ...prev,
        geo: "",
        templateName: "",
        tempSubject: "",
        previewText: "",
      }));
    }
  };

  const handleGeoSelect = (country) => {
    setGeoInput(country.name);
    setFormData((prev) => ({
      ...prev,
      geo: country.code,
      templateName: "",
      tempSubject: "",
      previewText: "",
    }));
    setShowDropdown(false);
    setFilteredCountries([]);
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
      posted: postedValue,
      templateName: formData.templateName,
      geo: formData.geo,
      shopName: formData.shopName,
      productName: formData.productName,
      tempSubject: formData.tempSubject,
      previewText: formData.previewText,
      scheduledTime: finalScheduledDateTime,
      dynamicLink: formData.dynamicLink
    };

    console.log("Відправляючі дані на сервер:", dataToSend);

    try {
      await apiClient.post("senderMails/send", dataToSend);

      showNotification(
        finalScheduledDateTime
          ? "Mailing successfully scheduled!"
          : "Sent successfully!",
        "success"
      );
      localStorage.removeItem(MAIN_FORM_DATA_KEY);
      setFormData({
        campaignName: "",
        nameFrom: "",
        posted: "",
        templateName: "",
        geo: "",
        shopName: "",
        productName: "",
        tempSubject: "",
        previewText: "",
        dynamicLink: "",
      });
      setGeoInput("");
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

    console.log(savedTemplates);
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

  const isFormValid =
    formData.campaignName &&
    formData.nameFrom &&
    formData.posted !== "" &&
    !isNaN(Number(formData.posted)) &&
    formData.templateName &&
    formData.geo &&
    formData.shopName &&
    formData.productName &&
    formData.tempSubject &&
    formData.previewText;

  return (
    <div className={css.formSection}>
      <div className={css.sendNav}>
        <h2 className={css.title}>Email Mailing /</h2>
        <Link to={"/manualSender"} className={css.sendLink}>
          Manual /
        </Link>
        <Link to={"/groupSender"} className={css.sendLink}>
          Group
        </Link>
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
          <div style={{ display: "flex" }}>
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
          <div style={{ display: "flex" }}>
            <label>
              <span>Select a country</span>
              <div
                className={css.selectStylesGeo}
                style={{ position: "relative" }}
              >
                <input
                  type="text"
                  name="geoInput"
                  value={geoInput}
                  onChange={handleGeoInputChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Start typing..."
                  autoComplete="off"
                  required
                />
                {showDropdown && filteredCountries.length > 0 && (
                  <ul className={css.countryDropdown}>
                    {filteredCountries.map((country) => (
                      <li
                        key={country.code}
                        onClick={() => handleGeoSelect(country)}
                        className={css.dropdownItem}
                      >
                        {country.name}
                      </li>
                    ))}
                  </ul>
                )}
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
                  {filteredTemplates.map((template) => (
                    <option key={template.id} value={template.tempName}>
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

export default Form;
