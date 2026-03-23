import css from "./track.module.css";
import { useEffect, useState, useCallback } from "react";
import Loader from "../../utils/Loader/Loader";
import TruncatedName from "../../utils/TruncatedName/TruncatedName";
import { apiClient } from "../../components/api/url";

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

const Track = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [geoFilter, setGeoFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateFilterType, setDateFilterType] = useState(""); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const parseDate = (createdAt) => {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    return new Date(`20${year}-${month}-${day}T${timePart}`);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("senderMails/stats");

      const initialSortedData = [...response.data].sort((a, b) => {
        return parseDate(b.createdAt) - parseDate(a.createdAt);
      });

      setData(initialSortedData);
      setFilteredData(initialSortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Помилка отримання даних: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    } else if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
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
    fetchData();
    const initialRange = getDateRange("7_days");
    setStartDate(initialRange.startDate);
    setEndDate(initialRange.endDate);
    setDateFilterType("7_days");
  }, [fetchData]);

  useEffect(() => {
    let result = [...data];

    if (geoFilter) {
      result = result.filter((item) => item.geo === geoFilter);
    }

    if (startDate || endDate) {
      result = result.filter((item) => {
        const itemDate = parseDate(item.createdAt);
        
        const fromDate = startDate ? new Date(startDate + "T00:00:00") : null;
        const toDate = endDate ? new Date(endDate + "T23:59:59") : null;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;

        return true;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;

      if (sortConfig.key === "openRate") {
        const rateA = a.deliveredCount > 0 ? a.count / a.deliveredCount : 0;
        const rateB = b.deliveredCount > 0 ? b.count / b.deliveredCount : 0;
        comparison = rateA - rateB;
      } else if (sortConfig.key === "createdAt") {
        const dateA = parseDate(a.createdAt);
        const dateB = parseDate(b.createdAt);
        comparison = dateA - dateB;
      }

      return sortConfig.direction === "asc" ? comparison : comparison * -1;
    });

    setFilteredData(result);
    setCurrentPage(1);
  }, [geoFilter, startDate, endDate, data, sortConfig, dateFilterType]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const uniqueGeos = [...new Set(data.map((item) => item.geo))];
  
  const handleReset = () => {
    setGeoFilter("");
    const defaultRange = getDateRange("7_days");
    setStartDate(defaultRange.startDate);
    setEndDate(defaultRange.endDate);
    setDateFilterType("7_days");
    setFilteredData([...data]);
    setCurrentPage(1);
  }


  return (
    <div className={css.tableContainer}>
      <div className={css.controlsCont}>
        <div className={css.controls}>
          <label>
            <select
              className={css.option}
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <label>
            <select
              value={geoFilter}
              className={css.option}
              onChange={(e) => setGeoFilter(e.target.value)}
            >
              <option value="">Geo</option>
              {uniqueGeos.map((geo, idx) => (
                <option key={idx} value={geo}>
                  {geo}
                </option>
              ))}
            </select>
          </label>
          
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
                  value={startDate}
                  className={css.option}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                to
                <input
                  style={{ margin: "0 0 0 20px" }}
                  type="date"
                  value={endDate}
                  className={css.option}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </>
          )}

          <button
            onClick={handleReset}
            className={css.resetButton}
          >
            x
          </button>
        </div>

        <button onClick={fetchData} className={css.refreshButton}>
          🔄 Update
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <table className={css.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Campaign Name</th>
                <th>Posted</th>
                <th>Delivered</th>
                <th>Open</th>
                <th>
                  Open rate{" "}
                  <button
                    onClick={() => handleSort("openRate")}
                    className={css.sortButton}
                    style={{ padding: "8px 12px" }}
                  >
                    <img
                      className={css.sortIcon}
                      src={require("../../img/icon-change-sort.png")}
                      alt=""
                    />
                  </button>
                </th>
                <th>Geo</th>
                <th>SMTP Name</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>
                    <TruncatedName name={item.campaignName} />
                  </td>
                  <td>{item.posted}</td>
                  <td>{item.deliveredCount}</td>
                  <td>{item.count}</td>
                  <td>
                    {item.deliveredCount > 0
                      ? ((item.count / item.deliveredCount) * 100).toFixed(1) +
                        "%"
                      : "0%"}
                  </td>

                  <td>{item.geo}</td>
                  <td>{item.smtpName}</td>
                  <td>{item.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={css.pagination}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Track;