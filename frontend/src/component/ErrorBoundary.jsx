import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
    // Send to error tracking service in production
    // sendToErrorTracking(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry for the inconvenience. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-left bg-red-100 p-4 rounded text-sm text-red-800">
                <p className="font-bold">Error Details (Dev Only):</p>
                <pre className="overflow-auto mt-2">{this.state.error?.toString()}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
