import React from 'react';

// No hook equivalent exists for error boundaries - componentDidCatch/getDerivedStateFromError
// require a class component. Wrapped around the routed page content in App.js so a crash in
// one page shows an on-screen error (with the real message/stack) instead of silently
// unmounting the whole app, which previously just left a blank screen with no clue why.
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('Uncaught render error:', error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return (
                <div className='p-6 max-w-2xl mx-auto mt-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm'>
                    <div className='text-lg font-semibold text-red-700 dark:text-red-400 mb-2'>Something went wrong</div>
                    <div className='text-red-600 dark:text-red-400 mb-3 whitespace-pre-wrap break-words'>
                        {String((this.state.error && this.state.error.message) || this.state.error)}
                    </div>
                    <details className='text-red-500 dark:text-red-400 whitespace-pre-wrap break-words'>
                        <summary className='cursor-pointer'>Details</summary>
                        {this.state.error && this.state.error.stack}
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        className='mt-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-md'
                    >
                        Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
