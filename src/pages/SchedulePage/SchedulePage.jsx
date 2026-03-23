import React, { useState, useEffect, useCallback } from "react";
import "./SchedulePage.css";
import { useNotifications } from "../../utils/Notifications/Notifications";
import Loader from "../../utils/Loader/Loader";
import { apiClient } from "../../components/api/url";

const SchedulePage = () => {
  const [scheduledCampaigns, setScheduledCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification, showConfirmation } = useNotifications();

  const fetchScheduledCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("senderMails/getLastData");

      if (response && response.data && Array.isArray(response.data.data)) {
        const filteredData = response.data.data.filter(
          (campaign) =>
            campaign.scheduledTime !== null &&
            campaign.scheduledTime !== undefined
        );
        setScheduledCampaigns(filteredData);
      } else {
        console.warn(
          "Expected response format not found (response.data.data is not an array).",
          response
        );
        setScheduledCampaigns([]);
      }
    } catch (err) {
      console.error("Error fetching scheduled campaigns:", err);
      setError("Failed to load scheduled campaigns.");
      showNotification("Failed to load scheduled campaigns.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchScheduledCampaigns();
  }, [fetchScheduledCampaigns]);

  const handleCancelSend = async (id) => {
    try {
      const confirmed = await showConfirmation(
        "Are you sure you want to cancel this scheduled send?"
      );

      if (confirmed) {
        await apiClient.put(`senderMails/cancelSend/${id}`);

        setScheduledCampaigns((prevCampaigns) =>
          prevCampaigns.map((campaign) =>
            campaign.id === id ? { ...campaign, status: "Cancelled" } : campaign
          )
        );
        showNotification(`Campaign ${id} cancelled successfully.`, "success");
      }
    } catch (err) {
      if (err !== false) {
        console.error("Error canceling scheduled send:", err);
        showNotification("Failed to cancel scheduled send.", "error");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="scheduled-sends-container error-message">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="scheduled-sends-container">
      <h1>Scheduled Email Campaigns</h1>
      {scheduledCampaigns.length === 0 ? (
        <p>No scheduled campaigns found.</p>
      ) : (
        <div className="scheduled-sends-list">
          {scheduledCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`scheduled-send-card ${
                campaign.status ? campaign.status.toLowerCase() : ""
              }`}
            >
              <h3>{campaign.campaignName}</h3>
              <p>
                <strong>Template:</strong> {campaign.templateName}
              </p>
              <p>
                <strong>Scheduled Time:</strong>{" "}
                {campaign.scheduledTime
                  ? new Date(campaign.scheduledTime).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status-badge ${
                    campaign.status ? campaign.status.toLowerCase() : ""
                  }`}
                >
                  {campaign.status || "N/A"}
                </span>
              </p>
              <p>
                <strong>GEO:</strong> {campaign.geo}
              </p>
              <p>
                <strong>Product:</strong> {campaign.productName || "N/A"}
              </p>
              <p>
                <strong>Shop:</strong> {campaign.shopName || "N/A"}
              </p>
              <div className="card-actions">
                {campaign.status === "Pending" && (
                  <button
                    onClick={() => handleCancelSend(campaign.id)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;