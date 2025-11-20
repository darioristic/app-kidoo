import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl px-8 py-6 text-center">
            <p className="text-gray-500 font-bold">Something went wrong. Please refresh.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}