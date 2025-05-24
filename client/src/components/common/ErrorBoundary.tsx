import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // عنصر بديل اختياري
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("حدث خطأ غير متوقع:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h2>حدث خطأ ما. يرجى المحاولة لاحقًا.</h2>;
    }

    return this.props.children;
  }
}
