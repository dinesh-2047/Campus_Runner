import { useEffect, useState } from "react";

import { apiClient } from "../api/client";
import { useAppContext } from "../context/AppContext";

export function AdminPage() {
  const { session } = useAppContext();
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ status: "", entityType: "" });
  const [reportAction, setReportAction] = useState({ reportId: "", status: "reviewed", resolutionNote: "" });
  const [moderation, setModeration] = useState({ userId: "", suspensionReason: "", taskId: "", archiveReason: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReports = async () => {
    if (session.user?.role !== "admin") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await apiClient.getReports(filters);
      setReports(payload.data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [session.user?.role, filters.status, filters.entityType]);

  const handleReportStatus = async (event) => {
    event.preventDefault();
    setBusy("report");
    setError("");
    setSuccess("");

    try {
      await apiClient.updateReportStatus(reportAction.reportId, {
        status: reportAction.status,
        resolutionNote: reportAction.resolutionNote,
      });
      setSuccess("Report status updated.");
      setReportAction({ reportId: "", status: "reviewed", resolutionNote: "" });
      await loadReports();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const handleSuspendUser = async (event) => {
    event.preventDefault();
    setBusy("suspend");
    setError("");
    setSuccess("");

    try {
      await apiClient.suspendUser(moderation.userId, {
        suspensionReason: moderation.suspensionReason,
      });
      setSuccess("User suspended.");
      setModeration((current) => ({ ...current, userId: "", suspensionReason: "" }));
      await loadReports();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const handleArchiveTask = async (event) => {
    event.preventDefault();
    setBusy("archive");
    setError("");
    setSuccess("");

    try {
      await apiClient.archiveTask(moderation.taskId, {
        archiveReason: moderation.archiveReason,
      });
      setSuccess("Task archived.");
      setModeration((current) => ({ ...current, taskId: "", archiveReason: "", userId: current.userId, suspensionReason: current.suspensionReason }));
      await loadReports();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  if (session.user?.role !== "admin") {
    return (
      <section className="placeholder-page">
        <span className="eyebrow">Admin</span>
        <h1>Admin access required</h1>
        <p>This workspace is connected to admin-only backend APIs and is visible only to admin sessions.</p>
      </section>
    );
  }

  return (
    <section className="workspace-grid">
      <div className="workspace-main">
        <div className="workspace-header">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Moderation and report review</h1>
          </div>
        </div>

        <div className="toolbar-card">
          <label>
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </label>
          <label>
            <span>Entity type</span>
            <select
              value={filters.entityType}
              onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value }))}
            >
              <option value="">All</option>
              <option value="user">User</option>
              <option value="task">Task</option>
            </select>
          </label>
        </div>

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {success ? <p className="form-message form-message--success">{success}</p> : null}

        {loading ? <p className="empty-state">Loading reports...</p> : null}
        {!loading && reports.length === 0 ? <p className="empty-state">No reports found.</p> : null}

        <div className="resource-list">
          {reports.map((report) => (
            <article key={report.id} className="resource-card">
              <div className="resource-card__header">
                <div>
                  <h3>{report.reason}</h3>
                  <p>{report.details || "No details provided"}</p>
                </div>
                <span className={`status-chip status-chip--${report.status}`}>{report.status}</span>
              </div>
              <div className="resource-card__meta">
                <span>{report.entityType}</span>
                <span>{report.reporter?.fullName || "Unknown reporter"}</span>
                <span>{report.reportedUser?.email || report.reportedTask?.title || "No target"}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="workspace-side">
        <div className="workspace-panel">
          <span className="eyebrow">Report handling</span>
          <h2>Update report status</h2>
          <form className="form-grid" onSubmit={handleReportStatus}>
            <label>
              <span>Report ID</span>
              <input
                value={reportAction.reportId}
                onChange={(event) =>
                  setReportAction((current) => ({ ...current, reportId: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span>Status</span>
              <select
                value={reportAction.status}
                onChange={(event) =>
                  setReportAction((current) => ({ ...current, status: event.target.value }))
                }
              >
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
                <option value="open">Open</option>
              </select>
            </label>
            <label>
              <span>Resolution note</span>
              <textarea
                value={reportAction.resolutionNote}
                onChange={(event) =>
                  setReportAction((current) => ({ ...current, resolutionNote: event.target.value }))
                }
              />
            </label>
            <button className="button button--primary" disabled={busy === "report"} type="submit">
              {busy === "report" ? "Updating..." : "Update Report"}
            </button>
          </form>
        </div>

        <div className="workspace-panel">
          <span className="eyebrow">Moderation</span>
          <h2>Suspend a user</h2>
          <form className="form-grid" onSubmit={handleSuspendUser}>
            <label>
              <span>User ID</span>
              <input
                value={moderation.userId}
                onChange={(event) =>
                  setModeration((current) => ({ ...current, userId: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span>Reason</span>
              <textarea
                value={moderation.suspensionReason}
                onChange={(event) =>
                  setModeration((current) => ({ ...current, suspensionReason: event.target.value }))
                }
              />
            </label>
            <button className="button button--outline" disabled={busy === "suspend"} type="submit">
              {busy === "suspend" ? "Suspending..." : "Suspend User"}
            </button>
          </form>
        </div>

        <div className="workspace-panel">
          <span className="eyebrow">Task moderation</span>
          <h2>Archive a task</h2>
          <form className="form-grid" onSubmit={handleArchiveTask}>
            <label>
              <span>Task ID</span>
              <input
                value={moderation.taskId}
                onChange={(event) =>
                  setModeration((current) => ({ ...current, taskId: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span>Archive reason</span>
              <textarea
                value={moderation.archiveReason}
                onChange={(event) =>
                  setModeration((current) => ({ ...current, archiveReason: event.target.value }))
                }
              />
            </label>
            <button className="button button--outline" disabled={busy === "archive"} type="submit">
              {busy === "archive" ? "Archiving..." : "Archive Task"}
            </button>
          </form>
        </div>
      </aside>
    </section>
  );
}