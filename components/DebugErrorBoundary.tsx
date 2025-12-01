"use client";

import React from "react";

export class DebugErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any; info: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("⛔ FULL ERROR CAUGHT BY BOUNDARY ⛔");
    console.error("ERROR:", error);
    console.error("STACK:", error?.stack);
    console.error("INFO:", info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", color: "red" }}>
          <h2>React Error Boundary</h2>
          <pre>{String(this.state.error)}</pre>
          <pre>{this.state.error?.stack}</pre>
          <pre>{JSON.stringify(this.state.info, null, 2)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

