import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unexpected UI error" };
  }

  componentDidCatch(error) {
    console.error("UI crash:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
          <h2>App crashed while rendering</h2>
          <p>{this.state.message}</p>
          <p>Try refreshing the page. If it persists, clear localStorage for this site.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
