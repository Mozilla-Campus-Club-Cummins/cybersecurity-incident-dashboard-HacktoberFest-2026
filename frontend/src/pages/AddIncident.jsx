import { useState } from "react";
import api from "../services/api";

function AddIncident({ onIncidentAdded }) {

    const [form, setForm] = useState({
        incident_type: "",
        source: "",
        severity: "Low",
        description: "",
        failed_logins: 0,
        request_count: 0,
        connection_count: 0,
        bytes_transferred: 0
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    }

    async function handleSubmit(e) {

        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            const response = await api.post(
                "/incidents",
                {
                    ...form,
                    failed_logins: Number(form.failed_logins),
                    request_count: Number(form.request_count),
                    connection_count: Number(form.connection_count),
                    bytes_transferred: Number(form.bytes_transferred)
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMessage(
                `Incident created successfully. Risk Score: ${response.data.risk_score}/100`
            );

            setForm({
                incident_type: "",
                source: "",
                severity: "Low",
                description: "",
                failed_logins: 0,
                request_count: 0,
                connection_count: 0,
                bytes_transferred: 0
            });

            if (onIncidentAdded) {
                onIncidentAdded();
            }

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.detail ||
                "Unable to create incident."
            );

        } finally {

            setLoading(false);

        }
    }

    return (

        <div className="panel add-incident-panel">

            <h2>
                Add Security Incident
            </h2>

            <form
                className="incident-form"
                onSubmit={handleSubmit}
            >

                <div className="form-row">

                    <div className="form-group">


                        <label>
                            Incident Type
                        </label>

                        <input
                            type="text"
                            name="incident_type"
                            placeholder="e.g. Suspicious Network Activity"
                            value={form.incident_type}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Source
                        </label>

                        <input
                            type="text"
                            name="source"
                            placeholder="e.g. 192.168.1.99"
                            value={form.source}
                            onChange={handleChange}
                            required
                        />

                    </div>

                </div>


                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Severity
                        </label>

                        <select
                            name="severity"
                            value={form.severity}
                            onChange={handleChange}
                        >

                            <option value="Low">
                                Low
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="High">
                                High
                            </option>

                            <option value="Critical">
                                Critical
                            </option>

                        </select>

                    </div>


                    <div className="form-group">

                        <label>
                            Failed Logins
                        </label>

                        <input
                            type="number"
                            name="failed_logins"
                            min="0"
                            value={form.failed_logins}
                            onChange={handleChange}
                        />

                    </div>

                </div>


                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Request Count
                        </label>

                        <input
                            type="number"
                            name="request_count"
                            min="0"
                            value={form.request_count}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Connection Count
                        </label>

                        <input
                            type="number"
                            name="connection_count"
                            min="0"
                            value={form.connection_count}
                            onChange={handleChange}
                        />

                    </div>

                </div>


                <div className="form-group">

                    <label>
                        Bytes Transferred
                    </label>

                    <input
                        type="number"
                        name="bytes_transferred"
                        min="0"
                        value={form.bytes_transferred}
                        onChange={handleChange}
                    />

                </div>


                <div className="form-group">

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        placeholder="Describe the security event..."
                        value={form.description}
                        onChange={handleChange}
                        rows="4"
                    />

                </div>


                <button
                    type="submit"
                    className="add-button"
                    disabled={loading}
                >

                    {loading
                        ? "Analyzing..."
                        : "Add Incident"}

                </button>


                {message && (
                    <p className="success">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

            </form>

        </div>
    );
}

export default AddIncident;