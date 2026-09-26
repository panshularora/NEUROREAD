import { CloudOff, RotateCw } from 'lucide-react';
import { useApiStatus } from '../lib/useApiStatus';

type Props = {
  /** What stops working without the server, e.g. "Practice games". */
  feature?: string;
  className?: string;
  wrapperClassName?: string;
};

export default function ApiNotice({ feature, className = '', wrapperClassName }: Props) {
  const { status, recheck } = useApiStatus();
  if (status === 'online' || status === 'checking') return null;

  const what = feature ? `${feature} need` : 'Simplifying, lessons, practice games and progress need';

  const notice = (
    <div
      role="status"
      className={`flex flex-col gap-3 rounded-2xl border border-warn/30 bg-warn/10 p-4 text-ink sm:flex-row sm:items-start sm:gap-4 sm:p-5 ${className}`}
    >
      <CloudOff className="h-6 w-6 shrink-0 text-warn" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-bold">The NeuroRead server isn't connected</p>
        <p className="mt-1 text-sm text-muted">
          {what} the backend, which isn't reachable from this page right now.
          {status === 'unconfigured'
            ? ' This deployment is running without its API, so those parts are switched off.'
            : ' It may be starting up; free servers can take up to a minute.'}{' '}
          Reading settings, themes and the reading ruler still work.
        </p>
      </div>
      {status === 'offline' && (
        <button
          type="button"
          onClick={() => recheck()}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-line bg-surface px-4 py-2 text-sm font-bold hover:bg-ink/5"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );

  return wrapperClassName ? <div className={wrapperClassName}>{notice}</div> : notice;
}
