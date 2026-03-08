import { useEffect, useMemo, useState } from "react";

import { apiClient } from "../api/client";
import { useAppContext } from "../context/AppContext";

const initialCreateForm = {
  title: "",
  description: "",
  pickupLocation: "",
  dropoffLocation: "",
  campus: "",
  transportMode: "other",
  reward: "",
};

export function TasksPage() {
  const { session } = useAppContext();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", campus: "" });
  const [busyAction, setBusyAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createForm, setCreateForm] = useState(initialCreateForm);

  const canCreate = session.user && ["requester", "admin"].includes(session.user.role);

  const loadTasks = async () => {
    if (session.status !== "authenticated") {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await apiClient.getTasks(filters);
      setItems(payload.data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [session.status, filters.search, filters.status, filters.campus]);

  const groupedCounts = useMemo(() => {
    return items.reduce(
      (summary, item) => {
        summary[item.status] = (summary[item.status] || 0) + 1;
        return summary;
      },
      { open: 0, accepted: 0, in_progress: 0, completed: 0, cancelled: 0 },
    );
  }, [items]);

  const runTaskAction = async (taskId, action, payload) => {
    setBusyAction(`${action}:${taskId}`);
    setError("");
    setSuccess("");

    try {
      if (action === "accept") {
        await apiClient.acceptTask(taskId);
      }

      if (action === "in-progress") {
        await apiClient.markTaskInProgress(taskId);
      }

      if (action === "complete") {
        await apiClient.completeTask(taskId);
      }

      if (action === "cancel") {
        await apiClient.cancelTask(taskId, payload);
      }

      setSuccess("Task action completed.");
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction("");
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setBusyAction("create");
    setError("");
    setSuccess("");

    try {
      await apiClient.createTask({
        ...createForm,
        reward: createForm.reward === "" ? 0 : Number(createForm.reward),
      });
      setCreateForm(initialCreateForm);
      setSuccess("Task created successfully.");
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyAction("");
    }
  };

  if (session.status !== "authenticated") {
    return (
      <section className="placeholder-page">
        <span className="eyebrow">Tasks</span>
        <h1>Sign in to work with tasks</h1>
        <p>The task workspace uses protected backend routes and becomes available after login.</p>
      </section>
    );
  }

  return (
    <section className="workspace-grid">
      <div className="workspace-main">
        <div className="workspace-header">
          <div>
            <span className="eyebrow">Tasks</span>
            <h1>Live task feed</h1>
          </div>
          <div className="pill-row">
            {Object.entries(groupedCounts).map(([status, value]) => (
              <span key={status} className="mini-pill">
                {status.replace("_", " ")}: {value}
              </span>
            ))}
          </div>
        </div>

        <div className="toolbar-card">
          <label>
            <span>Search</span>
            <input
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Title, location, campus"
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            <span>Campus</span>
            <input
              value={filters.campus}
              onChange={(event) =>
                setFilters((current) => ({ ...current, campus: event.target.value }))
              }
            />
          </label>
        </div>

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {success ? <p className="form-message form-message--success">{success}</p> : null}

        {loading ? <p className="empty-state">Loading tasks...</p> : null}
        {!loading && items.length === 0 ? <p className="empty-state">No tasks found.</p> : null}

        <div className="resource-list">
          {items.map((task) => (
            <article key={task.id} className="resource-card">
              <div className="resource-card__header">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>
                <span className={`status-chip status-chip--${task.status}`}>{task.status}</span>
              </div>
              <div className="resource-card__meta">
                <span>{task.pickupLocation}</span>
                <span>{task.dropoffLocation}</span>
                <span>{task.campus || "No campus"}</span>
                <span>Rs {task.reward}</span>
              </div>
              <div className="resource-card__actions">
                {session.user.role === "runner" && task.status === "open" ? (
                  <button
                    className="button button--primary"
                    type="button"
                    disabled={busyAction === `accept:${task.id}`}
                    onClick={() => runTaskAction(task.id, "accept")}
                  >
                    Accept
                  </button>
                ) : null}
                {session.user.role === "runner" && task.status === "accepted" && task.assignedRunner?.id === session.user.id ? (
                  <button
                    className="button button--primary"
                    type="button"
                    disabled={busyAction === `in-progress:${task.id}`}
                    onClick={() => runTaskAction(task.id, "in-progress")}
                  >
                    Mark In Progress
                  </button>
                ) : null}
                {session.user.role === "runner" && task.status === "in_progress" && task.assignedRunner?.id === session.user.id ? (
                  <button
                    className="button button--primary"
                    type="button"
                    disabled={busyAction === `complete:${task.id}`}
                    onClick={() => runTaskAction(task.id, "complete")}
                  >
                    Complete
                  </button>
                ) : null}
                {["requester", "admin"].includes(session.user.role) && ["open", "accepted", "in_progress"].includes(task.status) ? (
                  <button
                    className="button button--outline"
                    type="button"
                    disabled={busyAction === `cancel:${task.id}`}
                    onClick={() =>
                      runTaskAction(task.id, "cancel", { cancellationReason: "Cancelled from web client" })
                    }
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="workspace-side">
        <div className="workspace-panel">
          <span className="eyebrow">Task creation</span>
          <h2>Create a task</h2>
          {canCreate ? (
            <form className="form-grid" onSubmit={handleCreateTask}>
              <label>
                <span>Title</span>
                <input
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, description: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>Pickup location</span>
                <input
                  value={createForm.pickupLocation}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, pickupLocation: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>Dropoff location</span>
                <input
                  value={createForm.dropoffLocation}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, dropoffLocation: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>Campus</span>
                <input
                  value={createForm.campus}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, campus: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Transport mode</span>
                <select
                  value={createForm.transportMode}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, transportMode: event.target.value }))
                  }
                >
                  <option value="other">Other</option>
                  <option value="walk">Walk</option>
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="public_transport">Public transport</option>
                </select>
              </label>
              <label>
                <span>Reward</span>
                <input
                  type="number"
                  min="0"
                  value={createForm.reward}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, reward: event.target.value }))
                  }
                />
              </label>
              <button className="button button--primary" disabled={busyAction === "create"} type="submit">
                {busyAction === "create" ? "Creating..." : "Create Task"}
              </button>
            </form>
          ) : (
            <p>Task creation is available for requester and admin roles.</p>
          )}
        </div>
      </aside>
    </section>
  );
}