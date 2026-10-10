import React, { useEffect, useState } from "react";
import { getInsights } from "../services/insightService";
import { getErrorMessage } from "../utils/helpers";

const ICONS = {
    INFO: "💡",
    SUCCESS: "✅",
    WARNING: "⚠️",
    DANGER: "🚨",
};

function SmartInsights({ refreshTrigger }) {
    const [insights, setInsights] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;   // ignore old responses if a newer request was started

        const loadInsights = async () => {
            try {
                const data = await getInsights();
                if (!ignore) {
                    setInsights(data);
                    setError("");
                }
            } catch (err) {
                if (!ignore) {
                    setError(getErrorMessage(err, "Failed to load insights"));
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadInsights();
        return () => {
            ignore = true;
        };
    }, [refreshTrigger]);

    return (
        <div className="card">
            <h3>Smart Insights</h3>

            {loading && <p>Loading insights...</p>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && insights.length === 0 && (
                <p className="empty-state">No insights available yet.</p>
            )}

            <ul className="insight-list">
                {insights.map((insight, index) => (
                    <li
                        key={`${insight.type}-${index}`}
                        className={`insight-item insight-${(insight.severity || "info").toLowerCase()}`}
                    >
                        <span className="insight-icon">{ICONS[insight.severity] || "💡"}</span>
                        <span>{insight.message}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SmartInsights;