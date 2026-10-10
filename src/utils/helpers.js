// Reads the error message sent by our Spring Boot GlobalExceptionHandler
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
    if (error && error.response && error.response.data) {
        const data = error.response.data;

        // Validation errors look like: { message: "Validation failed", errors: { title: "Title is required" } }
        if (data.errors && typeof data.errors === "object") {
            return Object.values(data.errors).filter(Boolean).join(". ");
        }
        if (typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }
    }

    // No response at all means the backend is not reachable
    if (error && error.request) {
        return "Cannot connect to the server. Is the backend running?";
    }
    return fallback;
};

// 1500 -> ₹1,500.00 (safely handles null, undefined, strings, NaN)
export const formatCurrency = (amount) => {
    const num = Number(amount);
    const validNum = isNaN(num) ? 0 : num;
    return (
        "₹" +
        validNum.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
};

// Today's date in the format the backend expects: 2026-10-02 (uses local time)
export const getTodayDate = () => {
    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localTime.toISOString().slice(0, 10);
};