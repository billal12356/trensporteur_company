import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 1
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1
    }));

    console.error("حدث خطأ غير متوقع:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              حدث خطأ ما
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 text-right mb-6">
              نعتذر عن المشكلة. حاول تحديث الصفحة أو العودة إلى الصفحة السابقة.
            </p>

            {/* Error Details (Development Only) */}
            {this.props.showDetails && process.env.NODE_ENV === "development" && (
              <div className="mb-6">
                <details className="cursor-pointer">
                  <summary className="text-sm font-medium text-gray-700 mb-2 select-none hover:text-gray-900">
                    📋 تفاصيل الخطأ
                  </summary>
                  <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-40 text-left">
                    <p className="mb-2 font-bold">Error Message:</p>
                    <p className="mb-3 text-red-600">{this.state.error.message}</p>

                    {this.state.errorInfo?.componentStack && (
                      <>
                        <p className="mb-2 font-bold">Component Stack:</p>
                        <pre className="mb-3 text-gray-700 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}

                    <p className="text-xs text-gray-600">
                      Error Count: {this.state.errorCount}
                    </p>
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة محاولة
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="flex-1"
              >
                الصفحة الرئيسية
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for manual error boundaries in components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return {
    error,
    clearError: () => setError(null),
    throwError: (err: Error) => setError(err),
  };
}

/**
 * Higher-order component to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, retry: () => void) => ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
