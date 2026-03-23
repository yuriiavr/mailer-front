import { useState, useEffect, useCallback } from "react";
import css from "./DelTemplate.module.css";
import { useNotifications } from "../../utils/Notifications/Notifications";
import { apiClient } from "../api/url";

const DeleteTemplate = () => {
  const [allTemplates, setAllTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [templateSearchInput, setTemplateSearchInput] = useState("");
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  const { showNotification, showConfirmation } = useNotifications();

const fetchAllTemplates = useCallback(async () => {
  try {
    const response = await apiClient.get("templates/gettemp");
    if (response.data && Array.isArray(response.data.templates)) {
      setAllTemplates(response.data.templates);
      setFilteredTemplates(response.data.templates);
    } else {
      console.error(
        "Error loading templates or incorrect data format:",
        response
      );
      setAllTemplates([]);
      setFilteredTemplates([]);
    }
  } catch (error) {
    console.error("Error loading templates:", error);
    setAllTemplates([]);
    setFilteredTemplates([]);
  }
}, []);

  useEffect(() => {
    fetchAllTemplates();
  }, [fetchAllTemplates]);

  const handleTemplateSearchInputChange = (e) => {
    const value = e.target.value;
    setTemplateSearchInput(value);
    setShowTemplateDropdown(true);

    const lowerCaseValue = value.toLowerCase();
    const filtered = allTemplates.filter((template) =>
      template.tempName.toLowerCase().includes(lowerCaseValue)
    );
    setFilteredTemplates(filtered);

    const currentlySelectedTemplate = allTemplates.find(
      (t) => t.id === selectedTemplateId
    );
    if (
      currentlySelectedTemplate &&
      currentlySelectedTemplate.tempName.toLowerCase() !== lowerCaseValue
    ) {
      setSelectedTemplateId("");
    } else if (!value) {
      setSelectedTemplateId("");
    }
  };

  const handleTemplateSelect = (template) => {
    setTemplateSearchInput(template.tempName);
    setSelectedTemplateId(template.id);
    setShowTemplateDropdown(false);
    setFilteredTemplates([]);
  };

  const handleClickOutside = useCallback(
    (e) => {
      if (
        e.target &&
        !e.target.closest(`.${css.templateSearchContainer}`) &&
        showTemplateDropdown
      ) {
        setShowTemplateDropdown(false);

        const selectedTemplate = allTemplates.find(
          (t) => t.id === selectedTemplateId
        );
        if (selectedTemplate) {
          if (templateSearchInput !== selectedTemplate.tempName) {
            setTemplateSearchInput(selectedTemplate.tempName);
          }
        } else {
          setTemplateSearchInput("");
        }
        setFilteredTemplates(allTemplates);
      }
    },
    [
      showTemplateDropdown,
      templateSearchInput,
      selectedTemplateId,
      allTemplates,
    ]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTemplateId) {
      showNotification("Choose template please", "error");
      return;
    }

    try {
      const confirmDelete = await showConfirmation("Are you sure?");
      if (!confirmDelete) {
        return;
      }

      const response = await apiClient.delete(
        `templates/${selectedTemplateId}`
      );

      if (response) {
        showNotification(`Template deleted successfully!`, "success");
        await fetchAllTemplates();
        setSelectedTemplateId("");
        setTemplateSearchInput("");
        setShowTemplateDropdown(false);
      } else {
        showNotification(`Error: Unknown Error`, "error");
      }
    } catch (error) {
      showNotification("Error deleting template.", "error");
    }
  };

  return (
    <div className={css.cont}>
      <h2 className={css.title}>Delete Template</h2>
      <form className={css.form} onSubmit={handleDeleteSubmit}>
        <label className={css.label}>
          <span>Search Template by Name:</span>
          <div
            className={css.templateSearchContainer}
            style={{ position: "relative" }}
          >
            <input
              type="text"
              name="templateSearch"
              value={templateSearchInput}
              onChange={handleTemplateSearchInputChange}
              onFocus={() => setShowTemplateDropdown(true)}
              placeholder="Start typing template name..."
              autoComplete="off"
              required
            />
            {showTemplateDropdown && filteredTemplates.length > 0 && (
              <ul className={css.templateDropdown}>
                {filteredTemplates.map((template) => (
                  <li
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={css.dropdownItem}
                  >
                    {template.tempName} ({template.tempGeo || "none"}) - ID:{" "}
                    {template.id}
                  </li>
                ))}
              </ul>
            )}
            {showTemplateDropdown &&
              filteredTemplates.length === 0 &&
              templateSearchInput && (
                <ul className={css.templateDropdown}>
                  <li className={css.noResults}>
                    No templates found for "{templateSearchInput}"
                  </li>
                </ul>
              )}
          </div>
        </label>

        {selectedTemplateId && (
          <p className={css.selectedTemplateInfo}>
            Selected for deletion: <strong>{templateSearchInput}</strong> (ID:{" "}
            {selectedTemplateId})
          </p>
        )}

        <button
          className={css.deleteButton}
          type="submit"
          disabled={!selectedTemplateId}
        >
          Delete Template
        </button>
      </form>
    </div>
  );
};

export default DeleteTemplate;
