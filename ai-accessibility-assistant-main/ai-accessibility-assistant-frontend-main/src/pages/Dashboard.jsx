import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

import { getDashboard, ensureUserId } from '../services/api';
import { useAsync } from '../hooks/useAsync';

export default function Dashboard() {
  const [userId, setUserId] = useState(() => ensureUserId('demo-user-001'));
  const [data, setData] = useState(null);
  const dashboardAsync = useAsync(getDashboard, { retries: 1 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await dashboardAsync.run(userId);
        if (mounted) setData(res);
      } catch {
        // handled by hook
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const trendData = useMemo(() => {
    const trend = data?.improvement_trend || [];
    return trend.map((v, idx) => ({ session: idx + 1, cognitive_load: Number(v) }));
  }, [data]);

  const difficultyBars = useMemo(() => {
    const d = data?.difficulty_distribution || { low: 0, moderate: 0, high: 0 };
    return [
      { name: 'Low', value: d.low || 0 },
      { name: 'Moderate', value: d.moderate || 0 },
      { name: 'High', value: d.high || 0 },
    ];
  }, [data]);

  return (
    <section id="dashboard" className="py-24 bg-cream relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs text-clay uppercase tracking-wider mb-4 block">Analytics</span>
          <h2 className="font-medium text-4xl tracking-tight text-charcoal mb-4">Cognitive Dashboard</h2>
          <p className="text-charcoal/70 text-sm md:text-base leading-relaxed">
            Track cognitive load over sessions and see difficulty distribution.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-10">
          <label className="text-[10px] font-medium text-charcoal/50 uppercase tracking-wider">User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-72 rounded-xl border border-moss/15 bg-white px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-moss/20"
          />
          <button
            type="button"
            onClick={dashboardAsync.retry}
            className="px-5 py-2.5 rounded-full bg-moss text-cream text-xs font-medium uppercase tracking-wide disabled:opacity-60"
            disabled={dashboardAsync.loading}
          >
            {dashboardAsync.loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {dashboardAsync.error ? (
          <div className="max-w-2xl mx-auto mb-8 text-sm text-red-600 text-center">
            {dashboardAsync.error.message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-moss/10 rounded-[2rem] p-8 bg-white">
            <h3 className="font-medium text-xl tracking-tight text-charcoal mb-4">Cognitive Load Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,64,54,0.12)" />
                  <XAxis dataKey="session" stroke="rgba(46,64,54,0.6)" />
                  <YAxis domain={[0, 100]} stroke="rgba(46,64,54,0.6)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="cognitive_load" stroke="#2E4036" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-charcoal/50 mt-4">
              Avg cognitive load: <span className="font-medium text-charcoal">{data?.avg_cognitive_load ?? '—'}</span>
            </p>
          </div>

          <div className="border border-moss/10 rounded-[2rem] p-8 bg-white">
            <h3 className="font-medium text-xl tracking-tight text-charcoal mb-4">Difficulty Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,64,54,0.12)" />
                  <XAxis dataKey="name" stroke="rgba(46,64,54,0.6)" />
                  <YAxis allowDecimals={false} stroke="rgba(46,64,54,0.6)" />
                  <Tooltip />
                  <Bar dataKey="value" fill="rgba(185, 124, 93, 0.85)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-charcoal/50 mt-4">
              Sessions logged: <span className="font-medium text-charcoal">{data?.session_history?.length ?? 0}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

