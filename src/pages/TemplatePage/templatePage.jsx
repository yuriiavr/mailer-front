import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import css from "./templatesPage.module.css";
import { useNotifications } from "../../utils/Notifications/Notifications";
import { apiClient } from "../../components/api/url";
import Container from "../../components/Container/Container";

const Template = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification, showConfirmation } = useNotifications();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("templates/gettemp");
      if (response.data && Array.isArray(response.data.templates)) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      showNotification("Failed to load templates", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const search = searchTerm.toLowerCase();
      return (
        template.tempName?.toLowerCase().includes(search) ||
        template.tempGeo?.toLowerCase().includes(search) ||
        String(template.id).includes(search)
      );
    });
  }, [templates, searchTerm]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const currentItems = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleDelete = async (id, name) => {
    const confirm = await showConfirmation(`Delete "${name}"?`);
    if (!confirm) return;
    try {
      await apiClient.delete(`templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showNotification("Template deleted", "success");
    } catch (error) {
      showNotification("Delete failed", "error");
    }
  };

  const handlePreview = async (id) => {
    try {
      const response = await apiClient.get(`templates/gettemp/${id}`);
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`<div style="padding:20px">${response.data.template.tempText}</div>`);
        newWindow.document.close();
      }
    } catch (error) {
      showNotification("Error opening preview", "error");
    }
  };

  return (
    <Container>
      <div className={css.container}>
        <div className={css.header}>
          <h2 className={css.title}>Templates Library</h2>
          <button onClick={() => navigate("/addTemplate")} className={css.createBtn}>
            + Create New
          </button>
        </div>

        <div className={css.controls}>
          <div className={css.searchWrapper}>
            <input
              type="text"
              placeholder="Search templates..."
              className={css.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <span className={css.clearSearch} onClick={() => setSearchTerm("")}>✕</span>}
          </div>
          
          <div className={css.perPageSelector}>
            <span>Rows:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={css.select}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={css.tableWrapper}>
              <table className={css.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>GEO</th>
                    <th style={{ textAlign: "end" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((template) => (
                    <tr key={template.id} className={css.row}>
                      <td>{template.id}</td>
                      <td className={css.templateName}>{template.tempName}</td>
                      <td><span className={css.geoBadge}>{template.tempGeo || "Global"}</span></td>
                      <td className={css.actions}>
                        <button onClick={() => handlePreview(template.id)} className={css.previewBtn}>Preview</button>
                        <button onClick={() => navigate(`/editTemplate/${template.id}`)} className={css.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(template.id, template.tempName)} className={css.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={css.pagination}>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className={css.arrowBtn}
                >
                  &lsaquo;
                </button>
                
                <div className={css.pageNumbers}>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`${css.pageBtn} ${currentPage === pageNum ? css.activePage : ""}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className={css.arrowBtn}
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default Template;