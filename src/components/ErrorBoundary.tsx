import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by CityPulse ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-surface p-4 text-on-surface">
          <div className="w-full max-w-md rounded-3xl border border-error/30 bg-surface-lowest p-6 shadow-xl space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-container text-error">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="text-[20px] font-bold text-on-surface">Something went wrong</h2>
            <p className="text-[13px] text-on-surface-variant">
              CityPulse encountered an unexpected runtime error.
            </p>
            {this.state.error && (
              <div className="rounded-xl bg-surface-container p-3 text-left">
                <p className="text-[11px] font-mono text-error break-all">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/home'
                }}
                className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-on-primary font-semibold text-[13px] hover:bg-primary/90 transition-all active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reload App</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
