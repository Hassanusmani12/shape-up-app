import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[ShapeUp ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#060a13",
            color: "#f1f5f9",
            fontFamily: "'Inter', sans-serif",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: "100%",
              background: "rgba(12, 18, 32, 0.8)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: 20,
              padding: "48px 40px",
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(230, 57, 70, 0.1)",
                border: "2px solid rgba(230, 57, 70, 0.2)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                fontSize: 32,
              }}
            >
              &#9888;
            </div>

            <h2
              style={{
                fontWeight: 800,
                fontSize: "1.5rem",
                marginBottom: 8,
                color: "#f1f5f9",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                marginBottom: 8,
              }}
            >
              The application encountered an unexpected error. This has been
              logged for investigation.
            </p>

            {/* Error details (collapsed) */}
            {this.state.error && (
              <details
                style={{
                  marginTop: 16,
                  marginBottom: 24,
                  textAlign: "left",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: "0.75rem",
                  color: "#64748b",
                  maxHeight: 150,
                  overflow: "auto",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#94a3b8",
                    marginBottom: 8,
                  }}
                >
                  Error Details
                </summary>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack || ""}
                </pre>
              </details>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "12px 28px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#94a3b8",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: "12px 28px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #00e676, #00c853)",
                  color: "#060a13",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
