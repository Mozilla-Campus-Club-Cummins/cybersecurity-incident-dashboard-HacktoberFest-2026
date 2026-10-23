import { useEffect, useState } from "react";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import api from "../services/api";
import AddIncident from "./AddIncident";


function Dashboard() {

    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [search, setSearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");

    const [selectedIncident, setSelectedIncident] =
        useState(null);


    useEffect(() => {
        fetchIncidents();
    }, []);


    async function fetchIncidents() {

        try {

            setLoading(true);

            const token =
                localStorage.getItem("token");

            const response = await api.get(
                "/incidents",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setIncidents(response.data);
            setError("");

        } catch (error) {

            console.error(error);

            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                window.location.href = "/";

                return;
            }

            setError(
                "Unable to load incidents."
            );

        } finally {

            setLoading(false);

        }
    }


    async function updateIncidentStatus(
        incidentId,
        newStatus
    ) {

        try {

            const token =
                localStorage.getItem("token");

            const response = await api.patch(
                `/incidents/${incidentId}/status`,
                {
                    status: newStatus
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setIncidents(prev =>
                prev.map(incident =>
                    incident.id === incidentId
                        ? response.data
                        : incident
                )
            );

            if (
                selectedIncident &&
                selectedIncident.id === incidentId
            ) {

                setSelectedIncident(
                    response.data
                );
            }

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Unable to update incident status."
            );
        }
    }


    async function deleteIncident(
        incidentId
    ) {

        const confirmed = window.confirm(
            "Are you sure you want to delete this incident?"
        );

        if (!confirmed) {
            return;
        }

        try {

            const token =
                localStorage.getItem("token");

            await api.delete(
                `/incidents/${incidentId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setIncidents(prev =>
                prev.filter(
                    incident =>
                        incident.id !== incidentId
                )
            );

            setSelectedIncident(null);

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Unable to delete incident."
            );
        }
    }


    function handleIncidentAdded() {
        fetchIncidents();
    }


    function logout() {

        localStorage.removeItem(
            "token"
        );

        window.location.href = "/";
    }


    const totalIncidents =
        incidents.length;


    const criticalIncidents =
        incidents.filter(
            incident =>
                incident.severity ===
                "Critical"
        ).length;


    const highRiskIncidents =
        incidents.filter(
            incident =>
                incident.risk_score >= 80
        ).length;


    const openIncidents =
        incidents.filter(
            incident =>
                incident.status === "Open"
        ).length;


    const severityData = [
        {
            name: "Critical",
            value: incidents.filter(
                incident =>
                    incident.severity ===
                    "Critical"
            ).length
        },
        {
            name: "High",
            value: incidents.filter(
                incident =>
                    incident.severity ===
                    "High"
            ).length
        },
        {
            name: "Medium",
            value: incidents.filter(
                incident =>
                    incident.severity ===
                    "Medium"
            ).length
        },
        {
            name: "Low",
            value: incidents.filter(
                incident =>
                    incident.severity ===
                    "Low"
            ).length
        }
    ];


    const PIE_COLORS = [
        "#ef4444",
        "#f97316",
        "#eab308",
        "#22c55e"
    ];


    const filteredIncidents =
        incidents.filter(incident => {

            const searchText =
                search.toLowerCase();

            const matchesSearch =
                incident.incident_type
                    .toLowerCase()
                    .includes(searchText) ||
                incident.source
                    .toLowerCase()
                    .includes(searchText);

            const matchesSeverity =
                severityFilter === "All" ||
                incident.severity ===
                severityFilter;

            const matchesStatus =
                statusFilter === "All" ||
                incident.status ===
                statusFilter;

            return (
                matchesSearch &&
                matchesSeverity &&
                matchesStatus
            );
        });
const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    let result = 0;

    switch (sortBy) {
        case "id":
            result = Number(a.id) - Number(b.id);
            break;

        case "severity": {
            const severityOrder = {
                Critical: 4,
                High: 3,
                Medium: 2,
                Low: 1
            };

            result =
                (severityOrder[a.severity] || 0) -
                (severityOrder[b.severity] || 0);
            break;
        }

        case "risk_score":
            result = Number(a.risk_score) - Number(b.risk_score);
            break;

        case "status":
            result = a.status.localeCompare(b.status);
            break;

        case "incident_type":
            result = a.incident_type.localeCompare(b.incident_type);
            break;

        default:
            result = 0;
    }

    return sortOrder === "asc" ? result : -result;
});



    function getSeverityClass(
        severity
    ) {

        return severity
            .toLowerCase();
    }


    return (

        <div className="dashboard">

            {/* SIDEBAR */}

            {/* MOBILE MENU BUTTON */}

            <button
                className="menu-button"
                aria-label="Toggle navigation menu"
                aria-expanded={sidebarOpen}
                onClick={() =>
                    setSidebarOpen(!sidebarOpen)
                }
            >
                {sidebarOpen ? "✕" : "☰"}
            </button>

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <aside
                className={
                    sidebarOpen
                        ? "sidebar open"
                        : "sidebar"
                }
            >

                <div className="logo">

                    🛡️

                    <span>
                        CyberGuard
                    </span>

                </div>


                <nav onClick={() => setSidebarOpen(false)}>

                    <a
                        href="/dashboard"
                        className="active"
                    >
                        Dashboard
                    </a>

                    <a href="#incidents">
                        Incidents
                    </a>

                    <a href="/analytics">
                        Analytics
                    </a>

                </nav>


                <button
                    className="logout-button"
                    onClick={logout}
                >
                    Logout
                </button>

            </aside>


            {/* MAIN CONTENT */}

            <main className="main-content">

                {/* TOP BAR */}

                <div className="topbar">

                    <div>

                        <h1>
                            Security Dashboard
                        </h1>

                        <p>
                            AI-powered cybersecurity
                            incident monitoring
                        </p>

                    </div>


                    <button
                        className="refresh-button"
                        onClick={fetchIncidents}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* SUMMARY CARDS */}

                <div className="cards">

                    <div className="card">

                        <span>
                            Total Incidents
                        </span>

                        <strong>
                            {totalIncidents}
                        </strong>

                    </div>


                    <div className="card critical-card">

                        <span>
                            Critical
                        </span>

                        <strong>
                            {criticalIncidents}
                        </strong>

                    </div>


                    <div className="card warning-card">

                        <span>
                            High Risk
                        </span>

                        <strong>
                            {highRiskIncidents}
                        </strong>

                    </div>


                    <div className="card open-card">

                        <span>
                            Open Incidents
                        </span>

                        <strong>
                            {openIncidents}
                        </strong>

                    </div>

                </div>


                {/* LOADING */}

                {loading && (

                    <div className="panel">

                        <p>
                            Loading incidents...
                        </p>

                    </div>

                )}


                {/* ERROR */}

                {error && (

                    <div className="panel">

                        <p className="error">
                            {error}
                        </p>

                    </div>

                )}


                {!loading &&
                    !error && (

                    <>

                        {/* CHART + SYSTEM STATUS */}

                        <div className="chart-grid">


                            {/* SEVERITY CHART */}

                            <div className="panel">

                                <h2>
                                    Incident Severity
                                </h2>

                                {totalIncidents >
                                0 ? (

                                    <div className="chart">

                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >

                                            <PieChart>

                                                <Pie
                                                    data={
                                                        severityData
                                                    }
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    label
                                                >

                                                    {severityData.map(
                                                        (
                                                            entry,
                                                            index
                                                        ) => (

                                                            <Cell
                                                                key={
                                                                    `cell-${index}`
                                                                }
                                                                fill={
                                                                    PIE_COLORS[
                                                                        index
                                                                    ]
                                                                }
                                                            />

                                                        )
                                                    )}

                                                </Pie>

                                                <Tooltip />

                                            </PieChart>

                                        </ResponsiveContainer>

                                    </div>

                                ) : (

                                    <p className="empty">

                                        No incident
                                        data available.

                                    </p>

                                )}

                            </div>


                            {/* SYSTEM STATUS */}

                            <div className="panel">

                                <h2>
                                    System Status
                                </h2>

                                <div className="system-status">

                                    <div>

                                        <span className="status-dot">
                                        </span>

                                        <span>
                                            API Server
                                        </span>

                                        <strong>
                                            Online
                                        </strong>

                                    </div>


                                    <div>

                                        <span className="status-dot">
                                        </span>

                                        <span>
                                            Database
                                        </span>

                                        <strong>
                                            Connected
                                        </strong>

                                    </div>


                                    <div>

                                        <span className="status-dot">
                                        </span>

                                        <span>
                                            AI Detection
                                        </span>

                                        <strong>
                                            Active
                                        </strong>

                                    </div>


                                    <div>

                                        <span className="status-dot">
                                        </span>

                                        <span>
                                            Authentication
                                        </span>

                                        <strong>
                                            Secure
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ADD INCIDENT */}

                        <AddIncident
                            onIncidentAdded={
                                handleIncidentAdded
                            }
                        />


                        {/* INCIDENTS */}

                        <div
                            className="panel incidents-panel"
                            id="incidents"
                        >

                            <div className="panel-header">

                                <div>

                                    <h2>
                                        Security Incidents
                                    </h2>

                                    <span>
                                        Showing{" "}
                                        {
                                            filteredIncidents.length
                                        }{" "}
                                        of{" "}
                                        {
                                            incidents.length
                                        }{" "}
                                        incidents
                                    </span>

                                </div>

                            </div>


                            {/* FILTERS */}

                            <div className="filters">

                                <input
                                    type="text"
                                    placeholder="Search incidents or source..."
                                    value={search}
                                    onChange={
                                        e =>
                                            setSearch(
                                                e.target.value
                                            )
                                    }
                                />


                                <select
                                    value={
                                        severityFilter
                                    }
                                    onChange={
                                        e =>
                                            setSeverityFilter(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="All">
                                        All Severities
                                    </option>

                                    <option value="Critical">
                                        Critical
                                    </option>

                                    <option value="High">
                                        High
                                    </option>

                                    <option value="Medium">
                                        Medium
                                    </option>

                                    <option value="Low">
                                        Low
                                    </option>

                                </select>


                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={
                                        e =>
                                            setStatusFilter(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="All">
                                        All Status
                                    </option>

                                    <option value="Open">
                                        Open
                                    </option>

                                    <option value="Closed">
                                        Closed
                                    </option>
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    aria-label="Sort incidents by"
                                >
                                    <option value="id">Incident ID</option>
                                    <option value="severity">Severity</option>
                                    <option value="risk_score">Risk Score</option>
                                    <option value="status">Status</option>
                                    <option value="incident_type">Incident Type</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSortOrder(
                                            sortOrder === "asc" ? "desc" : "asc"
                                        )
                                    }
                                    aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                                >
                                    {sortOrder === "asc" ? "Ascending ↑" : "Descending ↓"}
                                </button>

                            </div>


                            {/* TABLE */}


                            <div className="table-container">

                                  {sortedIncidents.length ===
0 ? (


                                    <p className="empty">

                                        No incidents
                                        found.

                                    </p>

                                ) : (

                                    <table>

                                        <thead>

                                            <tr>

                                                <th>
                                                    ID
                                                </th>

                                                <th>
                                                    Incident
                                                </th>

                                                <th>
                                                    Source
                                                </th>

                                                <th>
                                                    Severity
                                                </th>

                                                <th>
                                                    Risk Score
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {sortedIncidents.map(
    incident => (
                                                    <tr
                                                        key={
                                                            incident.id
                                                        }
                                                    >

                                                        <td>
                                                            #
                                                            {
                                                                incident.id
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                incident.incident_type
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                incident.source
                                                            }
                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    `badge ${getSeverityClass(
                                                                        incident.severity
                                                                    )}`
                                                                }
                                                            >
                                                                {
                                                                    incident.severity
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {
                                                                    incident.risk_score
                                                                }
                                                                /100
                                                            </strong>

                                                        </td>


                                                        <td>

                                                            <span className="status">

                                                                {
                                                                    incident.status
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="action-buttons">

                                                                <button
                                                                    className="details-button"
                                                                    onClick={() =>
                                                                        setSelectedIncident(
                                                                            incident
                                                                        )
                                                                    }
                                                                >
                                                                    Details
                                                                </button>


                                                                {incident.status ===
                                                                "Open" ? (

                                                                    <button
                                                                        className="close-button"
                                                                        onClick={() =>
                                                                            updateIncidentStatus(
                                                                                incident.id,
                                                                                "Closed"
                                                                            )
                                                                        }
                                                                    >
                                                                        Close
                                                                    </button>

                                                                ) : (

                                                                    <button
                                                                        className="reopen-button"
                                                                        onClick={() =>
                                                                            updateIncidentStatus(
                                                                                incident.id,
                                                                                "Open"
                                                                            )
                                                                        }
                                                                    >
                                                                        Reopen
                                                                    </button>

                                                                )}

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                )}

                            </div>

                        </div>

                    </>

                )}


                {/* INCIDENT DETAILS MODAL */}

                {selectedIncident && (

                    <div
                        className="modal-overlay"
                        onClick={() =>
                            setSelectedIncident(
                                null
                            )
                        }
                    >

                        <div
                            className="incident-modal"
                            onClick={e =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        Incident Details
                                    </h2>

                                    <p>
                                        Incident #
                                        {
                                            selectedIncident.id
                                        }
                                    </p>

                                </div>


                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setSelectedIncident(
                                            null
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="incident-details">


                                <div className="detail-item">

                                    <span>
                                        Incident Type
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.incident_type
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Source
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.source
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Severity
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.severity
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Risk Score
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.risk_score
                                        }
                                        /100
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.status
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Failed Logins
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.failed_logins
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Request Count
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.request_count
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Connection Count
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.connection_count
                                        }
                                    </strong>

                                </div>


                                <div className="detail-item">

                                    <span>
                                        Bytes Transferred
                                    </span>

                                    <strong>
                                        {
                                            selectedIncident.bytes_transferred
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* DESCRIPTION */}

                            <div className="description-box">

                                <span>
                                    Description
                                </span>

                                <p>

                                    {
                                        selectedIncident.description ||
                                        "No description provided."
                                    }

                                </p>

                            </div>


                            {/* MODAL FOOTER */}

                            <div className="modal-footer">


                                {selectedIncident.status ===
                                "Open" ? (

                                    <button
                                        className="close-button"
                                        onClick={() =>
                                            updateIncidentStatus(
                                                selectedIncident.id,
                                                "Closed"
                                            )
                                        }
                                    >
                                        Close Incident
                                    </button>

                                ) : (

                                    <button
                                        className="reopen-button"
                                        onClick={() =>
                                            updateIncidentStatus(
                                                selectedIncident.id,
                                                "Open"
                                            )
                                        }
                                    >
                                        Reopen Incident
                                    </button>

                                )}


                                <button
                                    className="details-button"
                                    onClick={() =>
                                        deleteIncident(
                                            selectedIncident.id
                                        )
                                    }
                                >
                                    Delete
                                </button>


                                <button
                                    className="modal-close-button"
                                    onClick={() =>
                                        setSelectedIncident(
                                            null
                                        )
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}


export default Dashboard;