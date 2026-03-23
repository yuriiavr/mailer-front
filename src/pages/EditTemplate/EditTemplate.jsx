import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import css from "./EditTemplate.module.css";
import { useNotifications } from "../../utils/Notifications/Notifications";
import { apiClient } from "../../components/api/url";
import Container from "../../components/Container/Container";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism.css";

const EditTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const [formData, setFormData] = useState({
    tempName: "",
    tempGeo: "",
    tempText: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handlePreview = () => {
    const htmlContent = formData.tempText;
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Preview - ${formData.tempName || 'Template'}</title>
            <style>
              body { margin: 0; padding: 20px; background: #f4f4f4; font-family: sans-serif; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            </style>
          </head>
          <body>
            <div class="container">${htmlContent}</div>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      showNotification("Please allow pop-ups for preview", "warning");
    }
  };

  const fetchTemplate = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`templates/gettemp/${id}`);
      if (response.data && response.data.template) {
        const { tempName, tempGeo, tempText } = response.data.template;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(tempText, 'text/html');
        const cleanHtml = doc.body ? doc.body.innerHTML : tempText;

        setFormData({
          tempName: tempName || "",
          tempGeo: tempGeo || "",
          tempText: cleanHtml || ""
        });
      }
    } catch (error) {
      showNotification("Failed to load template data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => {
    if (id) fetchTemplate();
  }, [id, fetchTemplate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put(`templates/gettemp/${id}`, {
        tempName: formData.tempName,
        tempGeo: formData.tempGeo,
        tempText: formData.tempText.replace(/&/g, '&amp;') 
      });
      
      showNotification("Template updated successfully!", "success");
      navigate("/templates");
    } catch (error) {
      showNotification("Error saving template", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Container><p>Loading template data...</p></Container>;

  return (
    <Container>
      <div className={css.cont}>
        <div className={css.header}>
          <h2 className={css.title}>Edit Template: {formData.tempName}</h2>
          <button onClick={() => navigate("/templates")} className={css.backBtn}>Back to List</button>
        </div>

        <form onSubmit={handleSave} className={css.form}>
          <div className={css.inputGroup}>
            <label className={css.label} style={{flex: 2}}>
              <span>Template Name:</span>
              <input
                type="text"
                name="tempName"
                value={formData.tempName}
                onChange={handleChange}
                className={css.input}
                required
              />
            </label>

            <label className={css.label} style={{flex: 1}}>
              <span>GEO (Country):</span>
              <input
                type="text"
                name="tempGeo"
                value={formData.tempGeo}
                onChange={handleChange}
                className={css.input}
                placeholder="e.g. US, UA"
              />
            </label>
          </div>

          <div className={css.editorWrapper}>
            <label className={css.label}>HTML Content:</label>
            <div className={css.editorContainer}>
              <Editor
                value={formData.tempText}
                onValueChange={(code) => setFormData(prev => ({...prev, tempText: code}))}
                highlight={(code) => highlight(code, languages.markup, "markup")}
                padding={15}
                className={css.editor}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 13,
                  minHeight: "450px",
                }}
              />
            </div>
          </div>

          <div className={css.actions}>
            <button 
              type="button" 
              className={css.previewBtn} 
              onClick={handlePreview}
            >
              Preview
            </button>

            <button 
              type="submit" 
              className={css.saveButton} 
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>

            <button 
              type="button" 
              className={css.cancelBtn} 
              onClick={() => navigate("/templates")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default EditTemplate;