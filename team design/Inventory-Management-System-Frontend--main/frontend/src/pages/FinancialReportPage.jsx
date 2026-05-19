import { useState } from "react";
import {
  getDailyReport,
  getMonthlyReport,
  getYearlyReport,
} from "../services/reportService";

export default function FinancialReportPage() {
  const today = new Date().toISOString().split("T")[0];

  const [reportType, setReportType] = useState("daily");
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState("");

  const handleGenerateReport = async () => {
    try {
      let response;

      if (reportType === "daily") {
        response = await getDailyReport(date);
      } else if (reportType === "monthly") {
        response = await getMonthlyReport(year, month);
      } else {
        response = await getYearlyReport(year);
      }

      setReport(response.data);
      setMessage("Financial report generated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to generate report.");
      setReport(null);
    }
  };

  const formatDateOnly = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  };

  return (
    <div>
      <h1>Financial Reports</h1>

      {message && <p className="message">{message}</p>}

      <div className="card">
        <h2>Generate Daily, Monthly or Yearly Report</h2>

        <div className="form-grid">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="daily">Daily Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
          </select>

          {reportType === "daily" && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}

          {(reportType === "monthly" || reportType === "yearly") && (
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          )}

          {reportType === "monthly" && (
            <input
              type="number"
              min="1"
              max="12"
              placeholder="Month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            />
          )}

          <button type="button" onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>
      </div>

      {report && (
        <div className="card">
          <h2>{report.reportType} Financial Summary</h2>

          <div className="report-grid">
            <div className="report-card">
              <span>Total Sales Count</span>
              <strong>{report.totalSalesCount}</strong>
            </div>

            <div className="report-card">
              <span>Total Sales Amount</span>
              <strong>Rs. {report.totalSalesAmount}</strong>
            </div>

            <div className="report-card">
              <span>Total Discount</span>
              <strong>Rs. {report.totalDiscountAmount}</strong>
            </div>

            <div className="report-card">
              <span>Total Revenue</span>
              <strong>Rs. {report.totalRevenue}</strong>
            </div>
          </div>

          <table>
            <tbody>
              <tr>
                <th>Report Type</th>
                <td>{report.reportType}</td>
              </tr>
              <tr>
                <th>Start Date</th>
                <td>{formatDateOnly(report.startDate)}</td>
              </tr>
              <tr>
                <th>Report Until</th>
                <td>{formatDateOnly(report.endDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}