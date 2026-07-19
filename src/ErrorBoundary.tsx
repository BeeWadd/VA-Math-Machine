import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(): void {
    // Deliberately avoid logging: entries and calculated details can be sensitive.
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <main className="page-shell" id="calculator">
          <section className="card notice" aria-labelledby="recovery-title">
            <h1 id="recovery-title">The calculator could not continue</h1>
            <p>
              No estimate is being shown. Refresh the page to start again; entries are not
              retained.
            </p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
