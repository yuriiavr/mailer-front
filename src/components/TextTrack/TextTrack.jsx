import React, { useEffect, useState, useCallback } from "react";
import css from "../Track/track.module.css";
import Loader from "../../utils/Loader/Loader";
import { apiClient } from "../api/url";
import TruncatedName from "../../utils/TruncatedName/TruncatedName";

const formatDate = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const getDateRange = (type) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let start = null;
  let end = today;

  switch (type) {
    case "3_days":
      start = new Date(today);
      start.setDate(today.getDate() - 2);
      break;
    case "7_days":
      start = new Date(today);
      start.setDate(today.getDate() - 6);
      break;
    case "1_month":
      start = new Date(today);
      start.setMonth(today.getMonth() - 1);
      break;
    case "last_month":
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      start = lastMonthStart;
      end = lastMonthEnd;
      break;
    case "custom":
    default:
      start = null;
      end = null;
      break;
  }

  const formattedStart = start ? formatDate(start) : "";
  const formattedEnd = end ? formatDate(end) : "";

  return { startDate: formattedStart, endDate: formattedEnd };
};

const TextTrack = () => {
  const [textData, setTextData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFilterType, setDateFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("openRate");

  const fetchTextStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("senderMails/stats");
      setAllData(response.data);
    } catch (error) {
      console.error(
        "Помилка отримання статистики по текстовому наповненню:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
  };
  
  const handleDateFilterChange = (e) => {
    const newType = e.target.value;
    setDateFilterType(newType);
    
    if (newType !== "custom") {
      const { startDate: newStart, endDate: newEnd } = getDateRange(newType);
      setStartDate(newStart);
      setEndDate(newEnd);
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  useEffect(() => {
    fetchTextStats();
    const initialRange = getDateRange("7_days");
    setStartDate(initialRange.startDate);
    setEndDate(initialRange.endDate);
    setDateFilterType("7_days");
  }, [fetchTextStats]);

  useEffect(() => {
    const aggregated = {};

    const parseDate = (createdAt) => {
      const [datePart, timePart] = createdAt.split(" ");
      const [day, month, year] = datePart.split(".");
      return new Date(`20${year}-${month}-${day}T${timePart}`);
    };

    const filtered = allData.filter((item) => {
      if (!item.tempSubject) return false;

      const itemDate = parseDate(item.createdAt);

      const from = startDate ? new Date(startDate + "T00:00:00") : null;
      const to = endDate ? new Date(endDate + "T23:59:59") : null;

      if (from && itemDate < from) return false;
      if (to && itemDate > to) return false;

      return true;
    });

    filtered.forEach((item) => {
      const tempSubject = item.tempSubject;
      if (!aggregated[tempSubject]) {
        aggregated[tempSubject] = {
          tempSubject,
          previewText: item.previewText || "",
          geo: item.geo,
          posted: 0,
          delivered: 0,
          open: 0,
        };
      }

      aggregated[tempSubject].posted += Number(item.posted) || 0;
      aggregated[tempSubject].delivered += Number(item.deliveredCount) || 0;
      aggregated[tempSubject].open += Number(item.count) || 0;
    });

    let result = Object.values(aggregated).map((item) => {
      const openRate =
        item.delivered > 0 ? (item.open / item.delivered) * 100 : 0;
      return {
        ...item,
        openRateValue: openRate,
        openRate: openRate.toFixed(1) + "%",
      };
    });

    result.sort((a, b) => {
      const valA = a.openRateValue;
      const valB = b.openRateValue;

      if (sortOrder === "desc") {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });

    setTextData(result);
  }, [allData, startDate, endDate, sortOrder, sortField, dateFilterType]);

  const handleReset = () => {
    const defaultRange = getDateRange("7_days");
    setStartDate(defaultRange.startDate);
    setEndDate(defaultRange.endDate);
    setDateFilterType("7_days");
  }

  return (
    <div className={css.tableContainer}>
      <div className={css.controlsCont}>
        <div className={css.controls}>
          <label>
            <select
              value={dateFilterType}
              className={css.option}
              onChange={handleDateFilterChange}
            >
              <option value="">Date Range</option>
              <option value="3_days">Last 3 Days</option>
              <option value="7_days">Last 7 Days</option>
              <option value="1_month">Last 30 Days</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          {dateFilterType === "custom" && (
            <>
              <label>
                <input
                  type="date"
                  className={css.option}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                to
                <input
                  type="date"
                  className={css.option}
                  value={endDate}
                  style={{ marginLeft: "20px" }}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </>
          )}
          
          <button
            onClick={handleReset}
            className={css.resetButton}
            style={{ marginLeft: "10px" }}
          >
            x
          </button>
        </div>

        <button
          onClick={fetchTextStats}
          className={css.refreshButton}
          style={{ marginLeft: "20px" }}
        >
          🔄 Update
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table className={css.dataTable}>
          <thead>
            <tr>
              <th>Template Subject</th>
              <th>Preview Text</th>
              <th>Geo</th>
              <th>Posted</th>
              <th>Delivered</th>
              <th>Open</th>
              <th>
                Open Rate %{" "}
                <button
                  onClick={toggleSortOrder}
                  className={css.sortButton}
                  style={{ padding: "8px 12px", marginLeft: "10px" }}
                >
                  <img
                    className={css.sortIcon}
                    src={require("../../img/icon-change-sort.png")}
                    alt=""
                  />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {textData.map((item, index) => (
              <tr key={index}>
                <td>
                  <TruncatedName name={item.tempSubject} />
                </td>
                <td>
                  <TruncatedName name={item.previewText} />
                </td>
                <td>{item.geo}</td>
                <td>{item.posted}</td>
                <td>{item.delivered}</td>
                <td>{item.open}</td>
                <td>{item.openRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TextTrack;