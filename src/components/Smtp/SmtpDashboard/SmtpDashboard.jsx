import { useEffect, useState, useCallback } from 'react';
import SmtpItem from "./SmtpItem/SmtpItem";
import Loader from "../../../utils/Loader/Loader";
import css from './SmtpDashboard.module.css';
import { apiClient } from '../../api/url';

const SmtpDashboard = () => {
    const [smtpStatuses, setSmtpStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatuses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get("smtp/smtp-statuses");
            setSmtpStatuses(response.data);
        } catch (err) {
            console.error("Failed to fetch SMTP statuses:", err);
            setError("Failed to load SMTP statuses. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    const handleUpdateSmtp = () => {
        fetchStatuses();
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <div className={css.titleCont}>
                <h2 className={css.title}>SMTP Status Dashboard</h2>
                <button
                    onClick={fetchStatuses}
                    className={css.refreshButton}
                >
                    Refresh Statuses
                </button>
            </div>
            {error ? (
                <p className={`${css.statusMessage} ${css.error}`}>{error}</p>
            ) : smtpStatuses.length === 0 ? (
                <p className={css.statusMessage}>No SMTP statuses found.</p>
            ) : (
                <div className={css.SmtpListWrapper}>
                    {smtpStatuses.map((smtp) => (
                        <SmtpItem key={smtp._id} smtp={smtp} onUpdate={handleUpdateSmtp} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SmtpDashboard;