import { useState, useCallback, useEffect } from 'react';
import css from './addTemplate.module.css';
import { apiClient } from "../api/url";
import COUNTRIES from "../../utils/Constants/Countries";
import { useNotifications } from '../../utils/Notifications/Notifications';
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism.css";

const ADD_TEMPLATE_DATA_KEY = 'addTemplateData';

const htmlDecode = (input) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    return textarea.value;
};

const openPreviewWindow = (htmlContent) => {
    const newWindow = window.open("", "_blank");

    if (newWindow) {
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Preview</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .preview-container { max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ddd; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="preview-container">
        ${htmlContent}
    </div>
</body>
</html>`;

        newWindow.document.write(fullHtml);
        newWindow.document.close();
    } else {
        alert("Could not open preview window. Please check your browser's pop-up blocker settings.");
    }
};

const AddTemplate = () => {
    const [tempName, setTempName] = useState('');
    const [tempSubject, setTempSubject] = useState('');
    const [tempBody, setTempBody] = useState('');
    const [tempGeo, setTempGeo] = useState('');
    const [geoInput, setGeoInput] = useState("");
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const { showNotification } = useNotifications();

    useEffect(() => {
        const storedData = localStorage.getItem(ADD_TEMPLATE_DATA_KEY);
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                let loadedTempBody = parsedData.tempBody || '';
                if (loadedTempBody.includes('&amp;')) {
                    loadedTempBody = loadedTempBody.replace(/&amp;/g, '&');
                }

                setTempName(parsedData.tempName || '');
                setTempSubject(parsedData.tempSubject || '');
                setTempBody(loadedTempBody);
                setTempGeo(parsedData.tempGeo || '');
                setGeoInput(parsedData.geoInput || '');
            } catch (e) {
                console.error("Failed to parse stored form data from localStorage", e);
                localStorage.removeItem(ADD_TEMPLATE_DATA_KEY);
            }
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            const dataToStore = { tempName, tempSubject, tempBody, tempGeo, geoInput };
            localStorage.setItem(ADD_TEMPLATE_DATA_KEY, JSON.stringify(dataToStore));
        }, 500);
        return () => {
            clearTimeout(handler);
        };
    }, [tempName, tempSubject, tempBody, tempGeo, geoInput]);

    const isFormValid = tempName && tempSubject && tempBody && tempGeo;

    const handleGeoInputChange = (e) => {
        const value = e.target.value;
        setGeoInput(value);
        setShowDropdown(true);

        const lowerCaseValue = value.toLowerCase();

        const filtered = COUNTRIES.filter((country) =>
            country.name.toLowerCase().includes(lowerCaseValue)
        );
        setFilteredCountries(filtered);

        const currentSelectedCountryObject = COUNTRIES.find(c => c.code === tempGeo);
        if (value === "") {
            setTempGeo("");
        } else if (currentSelectedCountryObject && currentSelectedCountryObject.name.toLowerCase() !== lowerCaseValue) {
            setTempGeo("");
        }
    };

    const handleGeoSelect = (country) => {
        setGeoInput(country.name);
        setTempGeo(country.code);
        setShowDropdown(false);
        setFilteredCountries([]);
    };

    const handleClickOutside = useCallback((e) => {
        if (e.target && !e.target.closest(`.${css.selectStylesGeo}`) && showDropdown) {
            setShowDropdown(false);

            const selectedCountry = COUNTRIES.find(country => country.code === tempGeo);
            if (selectedCountry) {
                if (geoInput !== selectedCountry.name) {
                    setGeoInput(selectedCountry.name);
                }
            } else {
                setGeoInput("");
            }
        }
    }, [showDropdown, geoInput, tempGeo]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);


    const handlePreview = () => {
        if (!tempBody) {
            showNotification('Template body is empty. Cannot preview.', 'warning');
            return;
        }

        const decodedBody = htmlDecode(tempBody);

        openPreviewWindow(decodedBody);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let finalTempBody = tempBody;

            finalTempBody = htmlDecode(finalTempBody);


            if (!finalTempBody) {
                showNotification('Template body cannot be empty.', 'error');
                return;
            }

            const response = await apiClient.post('templates/addtemp', {
                tempName,
                tempSubject,
                tempBody: finalTempBody,
                tempGeo
            });

            showNotification('Template saved!', 'success');
            localStorage.removeItem(ADD_TEMPLATE_DATA_KEY);
            setTempName('');
            setTempSubject('');
            setTempBody('');
            setTempGeo('');
            setGeoInput('');
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('Error creating template. Please try again.', 'error');
        }
    };

    return (
        <div className={css.cont}>
            <form className={css.form} onSubmit={handleSubmit}>
                <h2 className="title">Create Template</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '530px' }}>
                    <label className={css.label}>
                        <span>Template name:</span>
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            required
                        />
                    </label>
                    <label className={css.label}>
                        <span>Template title:</span>
                        <input
                            type="text"
                            value={tempSubject}
                            onChange={(e) => setTempSubject(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <label className={css.label}>
                    <span>Select a country:</span>
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
                <label className={css.textareaLabel}>
                    <span>Template html:</span>
                    <div className={css.editorContainer}>
                        <Editor
                            value={tempBody}
                            onValueChange={(code) => setTempBody(code)}
                            highlight={(code) => highlight(code, languages.markup, "markup")}
                            padding={10}
                            className={css.editor}
                            required
                        />
                    </div>
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '10px' }}>
                    <button
                        className="button"
                        type="button"
                        onClick={handlePreview}
                        disabled={!tempBody}
                    >
                        Preview
                    </button>
                    <button className="button" type="submit" disabled={!isFormValid}>
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTemplate;