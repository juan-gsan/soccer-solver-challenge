import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>
            Please try refresh the page with Ctrl+F5. If nothing happens, do not
            worry, our development team has been notified
          </p>
          <button
            type="button"
            onClick={(): void => window.location.assign("/")}
          >
            Go back to Homepage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
