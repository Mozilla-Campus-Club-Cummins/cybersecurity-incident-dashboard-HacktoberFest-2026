import { useEffect, useMemo, useState } from "react";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LabelList
} from "recharts";

import api from "../services/api";


// =========================
// CONSTANTS
// =========================

const SEVERITY_LEVELS = [
    "Critical",
    "High",
    "Medium",
    "Low"
];

const SEVERITY_COLORS = {
    Critical: "#ef4444",
    High: "#f97316",
    Medium: "#eab308",
    Low: "#22c55e"
};

// Risk scores are 0-100. "High Risk" on the cards means a score above 80,
// so the Critical band starts at 81 to stay consistent with that number.
const RISK_BANDS = [
    { name: "Low", range: "0-39", min: 0, max: 39, color: "#22c55e" },
    { name: "Medium", range: "40-69", min: 40, max: 69, color: "#eab308" },
    { name: "High", range: "70-80", min: 70, max: 80, color: "#f97316" },
    { name: "Critical", range: "81-100", min: 81, max: 100, color: "#ef4444" }
];

const DATE_RANGES = [
    { value: "all", label: "All time", days: null },
    { value: "7", label: "Last 7 days", days: 7 },
    { value: "30", label: "Last 30 days", days: 30 }
];

const AXIS_COLOR = "#9ca3af";
const GRID_COLOR = "#1f2937";

const TOOLTIP_STYLE = {
    contentStyle: {
        background: "#0b1120",
        border: "1px solid #374151",
        borderRadius: 8,
        color: "#e5e7eb"
    },
    itemStyle: { color: "#e5e7eb" },
    labelStyle: { color: "#9ca3af" },
    cursor: { fill: "rgba(148, 163, 184, 0.12)" }
};


// =========================
// HELPERS
// =========================

// The API returns naive UTC timestamps (no "Z"), so add one before parsing.
function parseDate(value) {

    if (!value) {
        return null;
    }

    const text = String(value);

    const hasZone =
        /[zZ]$|[+-]\d{2}:?\d{2}$/.test(text);

    const date = new Date(
        hasZone ? text : `${text}Z`
    );

    return Number.isNaN(date.getTime())
        ? null
        : date;
}


function dayKey(date) {

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
}


function dayLabel(key) {

    const [year, month, day] =
        key.split("-").map(Number);

    return new Date(year, month - 1, day)
        .toLocaleDateString(
            undefined,
            { month: "short", day: "numeric" }
        );
}


// Count incidents by a field and return the biggest groups first
function countBy(list, field, limit) {

    const counts = {};

    list.forEach(incident => {

        const value =
            incident[field] || "Unknown";

        counts[value] =
            (counts[value] || 0) + 1;

    });

    const rows = Object.entries(counts)
        .map(([name, value]) => ({
            name,
            value
        }))
        .sort((a, b) =>
            b.value - a.value ||
            a.name.localeCompare(b.name)
        );

    return limit
        ? rows.slice(0, limit)
        : rows;
}


function shorten(text, max) {

    const value = String(text);

    return value.length > max
        ? `${value.slice(0, max - 1)}…`
        : value;
}


function Analytics() {

    const [incidents, setIncidents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    // Filters
    const [severityFilter, setSeverityFilter] =
        useState("All");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [typeFilter, setTypeFilter] =
        useState("All");

    const [dateRange, setDateRange] =
        useState("all");


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
    // FILTERING
    // =========================

    const incidentTypes = useMemo(
        () =>
            [
                ...new Set(
                    incidents
                        .map(i => i.incident_type)
                        .filter(Boolean)
                )
            ].sort(),
        [incidents]
    );

    const filtered = useMemo(() => {

        const range = DATE_RANGES.find(
            r => r.value === dateRange
        );

        const cutoff = range && range.days
            ? Date.now() - range.days * 86400000
            : null;

        return incidents.filter(incident => {

            if (
                severityFilter !== "All" &&
                incident.severity !== severityFilter
            ) {
                return false;
            }

            if (
                statusFilter !== "All" &&
                incident.status !== statusFilter
            ) {
                return false;
            }

            if (
                typeFilter !== "All" &&
                incident.incident_type !== typeFilter
            ) {
                return false;
            }

            if (cutoff !== null) {

                const created =
                    parseDate(incident.created_at);

                if (!created || created.getTime() < cutoff) {
                    return false;
                }
            }

            return true;
        });

    }, [
        incidents,
        severityFilter,
        statusFilter,
        typeFilter,
        dateRange
    ]);

    const filtersActive =
        severityFilter !== "All" ||
        statusFilter !== "All" ||
        typeFilter !== "All" ||
        dateRange !== "all";

    function resetFilters() {

        setSeverityFilter("All");
        setStatusFilter("All");
        setTypeFilter("All");
        setDateRange("all");

    }


    // =========================
    // STATS
    // =========================

    const stats = useMemo(() => {

        const total = filtered.length;

        const open = filtered.filter(
            i => i.status === "Open"
        ).length;

        const closed = filtered.filter(
            i => i.status === "Closed"
        ).length;

        const highRisk = filtered.filter(
            i => i.risk_score > 80
        ).length;

        const scores = filtered.map(
            i => Number(i.risk_score) || 0
        );

        const avgRisk = total
            ? scores.reduce((a, b) => a + b, 0) / total
            : 0;

        const maxRisk = total
            ? Math.max(...scores)
            : 0;

        const resolution = total
            ? Math.round((closed / total) * 100)
            : 0;

        return {
            total,
            open,
            closed,
            highRisk,
            avgRisk,
            maxRisk,
            resolution
        };

    }, [filtered]);


    // =========================
    // CHART DATA
    // =========================

    const severityData = useMemo(
        () =>
            SEVERITY_LEVELS.map(level => ({
                name: level,
                value: filtered.filter(
                    i => i.severity === level
                ).length
            })),
        [filtered]
    );

    const statusData = [
        { name: "Open", value: stats.open },
        { name: "Closed", value: stats.closed }
    ];

    const STATUS_COLORS = ["#3b82f6", "#22c55e"];

    const riskBandData = useMemo(
        () =>
            RISK_BANDS.map(band => ({
                name: band.name,
                range: band.range,
                color: band.color,
                value: filtered.filter(i => {
                    const score =
                        Number(i.risk_score) || 0;
                    return (
                        score >= band.min &&
                        score <= band.max
                    );
                }).length
            })),
        [filtered]
    );

    const typeData = useMemo(
        () => countBy(filtered, "incident_type", 6),
        [filtered]
    );

    const sourceData = useMemo(
        () => countBy(filtered, "source", 6),
        [filtered]
    );

    // Incidents per day, with empty days filled in so the line is honest
    const trendData = useMemo(() => {

        const perDay = {};

        filtered.forEach(incident => {

            const created =
                parseDate(incident.created_at);

            if (!created) {
                return;
            }

            const key = dayKey(created);

            perDay[key] = (perDay[key] || 0) + 1;
        });

        const keys = Object.keys(perDay).sort();

        if (keys.length === 0) {
            return [];
        }

        const rows = [];

        const [sy, sm, sd] =
            keys[0].split("-").map(Number);

        const cursor = new Date(sy, sm - 1, sd);

        const last = keys[keys.length - 1];

        // Safety cap so bad data can't build a huge array
        for (let i = 0; i < 400; i++) {

            const key = dayKey(cursor);

            rows.push({
                key,
                name: dayLabel(key),
                incidents: perDay[key] || 0
            });

            if (key >= last) {
                break;
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        return rows;

    }, [filtered]);

    const peakDay = trendData.reduce(
        (best, row) =>
            !best || row.incidents > best.incidents
                ? row
                : best,
        null
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


    // Height for horizontal bar charts grows with the number of rows
    function barHeight(rows) {
        return Math.max(180, rows * 44 + 50);
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


                {!loading && !error && (

                    <>

                        {/* =========================
                            FILTERS
                        ========================= */}

                        <div className="analytics-filters">

                            <div className="filters">

                                <select
                                    aria-label="Filter by severity"
                                    value={severityFilter}
                                    onChange={e =>
                                        setSeverityFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="All">
                                        All severities
                                    </option>
                                    {SEVERITY_LEVELS.map(level => (
                                        <option
                                            key={level}
                                            value={level}
                                        >
                                            {level}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    aria-label="Filter by status"
                                    value={statusFilter}
                                    onChange={e =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="All">
                                        All statuses
                                    </option>
                                    <option value="Open">
                                        Open
                                    </option>
                                    <option value="Closed">
                                        Closed
                                    </option>
                                </select>

                                <select
                                    aria-label="Filter by incident type"
                                    value={typeFilter}
                                    onChange={e =>
                                        setTypeFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="All">
                                        All incident types
                                    </option>
                                    {incidentTypes.map(type => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    aria-label="Filter by date range"
                                    value={dateRange}
                                    onChange={e =>
                                        setDateRange(
                                            e.target.value
                                        )
                                    }
                                >
                                    {DATE_RANGES.map(range => (
                                        <option
                                            key={range.value}
                                            value={range.value}
                                        >
                                            {range.label}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    className="refresh-button"
                                    onClick={resetFilters}
                                    disabled={!filtersActive}
                                >
                                    Reset
                                </button>

                            </div>

                            <p
                                className="filter-count"
                                role="status"
                                aria-live="polite"
                            >
                                Showing {stats.total} of{" "}
                                {incidents.length} incidents
                            </p>

                        </div>



                        {/* =========================
                            SUMMARY CARDS
                        ========================= */}

                        <div className="cards analytics-cards">

                            <div className="card">
                                <span>Total Incidents</span>
                                <strong>{stats.total}</strong>
                            </div>

                            <div className="card open-card">
                                <span>Open</span>
                                <strong>{stats.open}</strong>
                            </div>

                            <div className="card">
                                <span>Closed</span>
                                <strong>{stats.closed}</strong>
                            </div>

                            <div className="card warning-card">
                                <span>High Risk (above 80)</span>
                                <strong>{stats.highRisk}</strong>
                            </div>

                            <div className="card">
                                <span>Average Risk Score</span>
                                <strong>
                                    {stats.avgRisk.toFixed(1)}
                                </strong>
                            </div>

                            <div className="card">
                                <span>Resolution Rate</span>
                                <strong>
                                    {stats.resolution}%
                                </strong>
                            </div>

                        </div>



                        {/* =========================
                            CHART ROW 1
                        ========================= */}

                        <div className="analytics-grid">


                            {/* SEVERITY */}

                            <div className="panel">

                                <h2>
                                    Incidents by Severity
                                </h2>

                                <div className="analytics-chart">

                                    {stats.total > 0 ? (

                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >

                                            <BarChart
                                                data={severityData}
                                                margin={{
                                                    top: 20,
                                                    right: 8,
                                                    left: -16,
                                                    bottom: 0
                                                }}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke={GRID_COLOR}
                                                />

                                                <XAxis
                                                    dataKey="name"
                                                    stroke={AXIS_COLOR}
                                                />

                                                <YAxis
                                                    allowDecimals={false}
                                                    stroke={AXIS_COLOR}
                                                />

                                                <Tooltip
                                                    {...TOOLTIP_STYLE}
                                                />

                                                <Bar
                                                    dataKey="value"
                                                    name="Incidents"
                                                    radius={[6, 6, 0, 0]}
                                                >
                                                    {severityData.map(row => (
                                                        <Cell
                                                            key={row.name}
                                                            fill={
                                                                SEVERITY_COLORS[
                                                                    row.name
                                                                ]
                                                            }
                                                        />
                                                    ))}

                                                    <LabelList
                                                        dataKey="value"
                                                        position="top"
                                                        fill="#e5e7eb"
                                                        fontSize={12}
                                                    />
                                                </Bar>

                                            </BarChart>

                                        </ResponsiveContainer>

                                    ) : (

                                        <p className="empty">
                                            No incident data available.
                                        </p>

                                    )}

                                </div>

                            </div>



                            {/* STATUS */}

                            <div className="panel">

                                <h2>
                                    Incident Status
                                </h2>

                                <div className="analytics-chart">

                                    {stats.total > 0 ? (

                                        <ResponsiveContainer
                                            width="100%"
                                            height={280}
                                        >

                                            <PieChart>

                                                <Pie
                                                    data={statusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={95}
                                                    paddingAngle={2}
                                                    label
                                                >
                                                    {statusData.map((row, index) => (
                                                        <Cell
                                                            key={row.name}
                                                            fill={
                                                                STATUS_COLORS[
                                                                    index
                                                                ]
                                                            }
                                                            stroke="none"
                                                        />
                                                    ))}
                                                </Pie>

                                                <Tooltip
                                                    {...TOOLTIP_STYLE}
                                                />

                                                <Legend />

                                            </PieChart>

                                        </ResponsiveContainer>

                                    ) : (

                                        <p className="empty">
                                            No incident data available.
                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>



                        {/* =========================
                            RISK SCORE DISTRIBUTION
                        ========================= */}

                        <div className="panel analytics-panel">

                            <h2>
                                Risk Score Distribution
                            </h2>

                            <p className="chart-note">
                                Incidents grouped by risk score band.
                                Average score {stats.avgRisk.toFixed(1)},
                                highest {stats.maxRisk}.
                            </p>

                            <div className="analytics-chart">

                                {stats.total > 0 ? (

                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >

                                        <BarChart
                                            data={riskBandData}
                                            margin={{
                                                top: 20,
                                                right: 8,
                                                left: -16,
                                                bottom: 0
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke={GRID_COLOR}
                                            />

                                            <XAxis
                                                dataKey="name"
                                                stroke={AXIS_COLOR}
                                                tickFormatter={name => {
                                                    const band =
                                                        riskBandData.find(
                                                            b => b.name === name
                                                        );
                                                    return band
                                                        ? `${name} (${band.range})`
                                                        : name;
                                                }}
                                                interval={0}
                                                tick={{ fontSize: 12 }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                stroke={AXIS_COLOR}
                                            />

                                            <Tooltip
                                                {...TOOLTIP_STYLE}
                                            />

                                            <Bar
                                                dataKey="value"
                                                name="Incidents"
                                                radius={[6, 6, 0, 0]}
                                            >
                                                {riskBandData.map(row => (
                                                    <Cell
                                                        key={row.name}
                                                        fill={row.color}
                                                    />
                                                ))}

                                                <LabelList
                                                    dataKey="value"
                                                    position="top"
                                                    fill="#e5e7eb"
                                                    fontSize={12}
                                                />
                                            </Bar>

                                        </BarChart>

                                    </ResponsiveContainer>

                                ) : (

                                    <p className="empty">
                                        No risk score data available.
                                    </p>

                                )}

                            </div>

                        </div>



                        {/* =========================
                            TYPES AND SOURCES
                        ========================= */}

                        <div className="analytics-grid">


                            {/* TYPES */}

                            <div className="panel">

                                <h2>
                                    Top Incident Types
                                </h2>

                                <div className="analytics-chart">

                                    {typeData.length > 0 ? (

                                        <ResponsiveContainer
                                            width="100%"
                                            height={barHeight(
                                                typeData.length
                                            )}
                                        >

                                            <BarChart
                                                data={typeData}
                                                layout="vertical"
                                                margin={{
                                                    top: 4,
                                                    right: 28,
                                                    left: 4,
                                                    bottom: 4
                                                }}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke={GRID_COLOR}
                                                    horizontal={false}
                                                />

                                                <XAxis
                                                    type="number"
                                                    allowDecimals={false}
                                                    stroke={AXIS_COLOR}
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={104}
                                                    stroke={AXIS_COLOR}
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={name =>
                                                        shorten(name, 14)
                                                    }
                                                />

                                                <Tooltip
                                                    {...TOOLTIP_STYLE}
                                                />

                                                <Bar
                                                    dataKey="value"
                                                    name="Incidents"
                                                    fill="#8b5cf6"
                                                    radius={[0, 6, 6, 0]}
                                                >
                                                    <LabelList
                                                        dataKey="value"
                                                        position="right"
                                                        fill="#e5e7eb"
                                                        fontSize={12}
                                                    />
                                                </Bar>

                                            </BarChart>

                                        </ResponsiveContainer>

                                    ) : (

                                        <p className="empty">
                                            No incident data available.
                                        </p>

                                    )}

                                </div>

                            </div>



                            {/* SOURCES */}

                            <div className="panel">

                                <h2>
                                    Top Incident Sources
                                </h2>

                                <div className="analytics-chart">

                                    {sourceData.length > 0 ? (

                                        <ResponsiveContainer
                                            width="100%"
                                            height={barHeight(
                                                sourceData.length
                                            )}
                                        >

                                            <BarChart
                                                data={sourceData}
                                                layout="vertical"
                                                margin={{
                                                    top: 4,
                                                    right: 28,
                                                    left: 4,
                                                    bottom: 4
                                                }}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke={GRID_COLOR}
                                                    horizontal={false}
                                                />

                                                <XAxis
                                                    type="number"
                                                    allowDecimals={false}
                                                    stroke={AXIS_COLOR}
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    width={104}
                                                    stroke={AXIS_COLOR}
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={name =>
                                                        shorten(name, 14)
                                                    }
                                                />

                                                <Tooltip
                                                    {...TOOLTIP_STYLE}
                                                />

                                                <Bar
                                                    dataKey="value"
                                                    name="Incidents"
                                                    fill="#06b6d4"
                                                    radius={[0, 6, 6, 0]}
                                                >
                                                    <LabelList
                                                        dataKey="value"
                                                        position="right"
                                                        fill="#e5e7eb"
                                                        fontSize={12}
                                                    />
                                                </Bar>

                                            </BarChart>

                                        </ResponsiveContainer>

                                    ) : (

                                        <p className="empty">
                                            No incident data available.
                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>



                        {/* =========================
                            TREND OVER TIME
                        ========================= */}

                        <div className="panel analytics-panel">

                            <h2>
                                Incidents Over Time
                            </h2>

                            <div className="analytics-chart">

                                {trendData.length > 0 ? (

                                    <ResponsiveContainer
                                        width="100%"
                                        height={280}
                                    >

                                        <LineChart
                                            data={trendData}
                                            margin={{
                                                top: 10,
                                                right: 16,
                                                left: -16,
                                                bottom: 0
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke={GRID_COLOR}
                                            />

                                            <XAxis
                                                dataKey="name"
                                                stroke={AXIS_COLOR}
                                                tick={{ fontSize: 12 }}
                                                minTickGap={24}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                stroke={AXIS_COLOR}
                                            />

                                            <Tooltip
                                                {...TOOLTIP_STYLE}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="incidents"
                                                name="Incidents"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                dot={{ r: 3 }}
                                                activeDot={{ r: 5 }}
                                            />

                                        </LineChart>

                                    </ResponsiveContainer>

                                ) : (

                                    <p className="empty">
                                        No dated incidents to chart.
                                    </p>

                                )}

                            </div>

                        </div>



                        {/* =========================
                            KEY INSIGHTS
                        ========================= */}

                        <div className="panel">

                            <h2>
                                Key Insights
                            </h2>

                            <div className="analytics-summary">

                                <div>
                                    <span>Highest Risk Score</span>
                                    <strong>{stats.maxRisk}</strong>
                                </div>

                                <div>
                                    <span>Most Common Type</span>
                                    <strong>
                                        {typeData[0]
                                            ? typeData[0].name
                                            : "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Top Source</span>
                                    <strong>
                                        {sourceData[0]
                                            ? sourceData[0].name
                                            : "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Busiest Day</span>
                                    <strong>
                                        {peakDay && peakDay.incidents > 0
                                            ? `${peakDay.name} (${peakDay.incidents})`
                                            : "-"}
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
