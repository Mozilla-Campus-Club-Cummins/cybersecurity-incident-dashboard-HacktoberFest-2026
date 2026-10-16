import { useEffect, useState } from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

import api from "../services/api";


function Analytics() {

    const [incidents, setIncidents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);


    // =========================
    // FETCH INCIDENTS
    // =========================

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

            setError(
                "Unable to load analytics data."
            );

        } finally {

            setLoading(false);

        }
    }


    // =========================
    // COUNTS
    // =========================

    const total =
        incidents.length;


    const open =
        incidents.filter(
            incident =>
                incident.status === "Open"
        ).length;


    const closed =
        incidents.filter(
            incident =>
                incident.status === "Closed"
        ).length;


    const anomalies =
        incidents.filter(
            incident =>
                incident.risk_score > 80
        ).length;


    // =========================
    // SEVERITY DATA
    // =========================

    const severityData = [

        {
            name: "Critical",
            value:
                incidents.filter(
                    incident =>
                        incident.severity ===
                        "Critical"
                ).length
        },

        {
            name: "High",
            value:
                incidents.filter(
                    incident =>
                        incident.severity ===
                        "High"
                ).length
        },

        {
            name: "Medium",
            value:
                incidents.filter(
                    incident =>
                        incident.severity ===
                        "Medium"
                ).length
        },

        {
            name: "Low",
            value:
                incidents.filter(
                    incident =>
                        incident.severity ===
                        "Low"
                ).length
        }

    ];


    const SEVERITY_COLORS = [

        "#ef4444",

        "#f97316",

        "#eab308",

        "#22c55e"

    ];


    // =========================
    // STATUS DATA
    // =========================

    const statusData = [

        {
            name: "Open",
            value: open
        },

        {
            name: "Closed",
            value: closed
        }

    ];


    // =========================
    // RISK SCORE DATA
    // =========================

    const riskData = incidents.map(
        incident => ({

            name:
                `#${incident.id}`,

            risk:
                incident.risk_score

        })
    );


    // =========================
    // LOGOUT
    // =========================

    function logout() {

        localStorage.removeItem(
            "token"
        );

        window.location.href = "/";

    }


    // =========================
    // UI
    // =========================

    return (

        <div className="dashboard">


            {/* =========================
                SIDEBAR
            ========================= */}

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
                    >
                        Dashboard
                    </a>

                    <a>
                        Incidents
                    </a>

                    <a
                        className="active"
                    >
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



            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="main-content">


                {/* HEADER */}

                <div className="topbar">

                    <div>

                        <h1>
                            Security Analytics
                        </h1>

                        <p>
                            Security incident
                            trends and risk analysis
                        </p>

                    </div>


                    <button
                        className="refresh-button"
                        onClick={fetchIncidents}
                    >
                        ↻ Refresh
                    </button>

                </div>



                {/* =========================
                    SUMMARY CARDS
                ========================= */}

                <div className="cards">


                    <div className="card">

                        <span>
                            Total Incidents
                        </span>

                        <strong>
                            {total}
                        </strong>

                    </div>


                    <div
                        className="card open-card"
                    >

                        <span>
                            Open
                        </span>

                        <strong>
                            {open}
                        </strong>

                    </div>


                    <div
                        className="card"
                    >

                        <span>
                            Closed
                        </span>

                        <strong>
                            {closed}
                        </strong>

                    </div>


                    <div
                        className="card warning-card"
                    >

                        <span>
                            High Risk
                        </span>

                        <strong>
                            {anomalies}
                        </strong>

                    </div>


                </div>



                {loading && (

                    <div className="panel">

                        <p>
                            Loading analytics...
                        </p>

                    </div>

                )}



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


                        {/* =========================
                            CHART ROW 1
                        ========================= */}

                        <div
                            className="analytics-grid"
                        >


                            {/* SEVERITY */}

                            <div className="panel">

                                <h2>
                                    Incidents by Severity
                                </h2>

                                <div
                                    className="analytics-chart"
                                >

                                    <ResponsiveContainer
                                        width="100%"
                                        height={320}
                                    >

                                        <BarChart
                                            data={
                                                severityData
                                            }
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#1f2937"
                                            />

                                            <XAxis
                                                dataKey="name"
                                                stroke="#9ca3af"
                                            />

                                            <YAxis
                                                allowDecimals={
                                                    false
                                                }
                                                stroke="#9ca3af"
                                            />

                                            <Tooltip />

                                            <Bar
                                                dataKey="value"
                                                fill="#3b82f6"
                                                radius={[
                                                    6,
                                                    6,
                                                    0,
                                                    0
                                                ]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>



                            {/* STATUS */}

                            <div className="panel">

                                <h2>
                                    Incident Status
                                </h2>

                                <div
                                    className="analytics-chart"
                                >

                                    {total > 0 ? (

                                        <ResponsiveContainer
                                            width="100%"
                                            height={320}
                                        >

                                            <PieChart>

                                                <Pie
                                                    data={
                                                        statusData
                                                    }
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={
                                                        100
                                                    }
                                                    label
                                                >

                                                    <Cell
                                                        fill="#3b82f6"
                                                    />

                                                    <Cell
                                                        fill="#22c55e"
                                                    />

                                                </Pie>

                                                <Tooltip />

                                                <Legend />

                                            </PieChart>

                                        </ResponsiveContainer>

                                    ) : (

                                        <p
                                            className="empty"
                                        >
                                            No incident
                                            data available.
                                        </p>

                                    )}

                                </div>

                            </div>


                        </div>



                        {/* =========================
                            RISK SCORE CHART
                        ========================= */}

                        <div className="panel analytics-panel">

                            <h2>
                                Incident Risk Scores
                            </h2>

                            {riskData.length > 0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={350}
                                >

                                    <BarChart
                                        data={riskData}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#1f2937"
                                        />

                                        <XAxis
                                            dataKey="name"
                                            stroke="#9ca3af"
                                        />

                                        <YAxis
                                            domain={[
                                                0,
                                                100
                                            ]}
                                            stroke="#9ca3af"
                                        />

                                        <Tooltip />

                                        <Bar
                                            dataKey="risk"
                                            fill="#f97316"
                                            radius={[
                                                6,
                                                6,
                                                0,
                                                0
                                            ]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            ) : (

                                <p className="empty">

                                    No risk score
                                    data available.

                                </p>

                            )}

                        </div>



                        {/* =========================
                            SECURITY SUMMARY
                        ========================= */}

                        <div className="panel">

                            <h2>
                                Security Summary
                            </h2>


                            <div
                                className="analytics-summary"
                            >


                                <div>

                                    <span>
                                        Total Events
                                    </span>

                                    <strong>
                                        {total}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Open Events
                                    </span>

                                    <strong>
                                        {open}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Closed Events
                                    </span>

                                    <strong>
                                        {closed}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        High-Risk Events
                                    </span>

                                    <strong>
                                        {anomalies}
                                    </strong>

                                </div>


                            </div>

                        </div>


                    </>

                )}

            </main>

        </div>

    );

}


export default Analytics;