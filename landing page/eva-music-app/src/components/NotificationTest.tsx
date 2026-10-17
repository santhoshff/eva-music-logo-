import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { EvaMedia, isNativeAndroid, type NotificationStatus } from '../services/nativeMedia';
import { audioEngine } from '../services/audioEngine';

type Result = { ok: boolean; message: string } | null;

const Item = ({ label, ok }: { label: string; ok?: boolean }) => (
  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
    <span>{label}</span>
    {ok === undefined ? <span className="text-slate-400">—</span> : ok
      ? <CheckCircle2 size={16} className="text-emerald-500" />
      : <XCircle size={16} className="text-rose-500" />}
  </div>
);

export const NotificationTest: React.FC = () => {
  const native = isNativeAndroid();
  const [status, setStatus] = useState<NotificationStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result>(null);

  useEffect(() => {
    if (native) EvaMedia.checkNotificationStatus().then(setStatus).catch(() => {});
  }, [native]);

  const runTest = async () => {
    setRunning(true);
    setResult(null);
    try {
      let s = await EvaMedia.checkNotificationStatus();
      if (!s.permission) s = await EvaMedia.requestNotificationPermission();
      setStatus(s);
      if (!s.permission) { setResult({ ok: false, message: 'Notification permission was denied. Open Settings → Apps → EVA Music → Notifications and turn it on.' }); return; }
      if (!s.enabled || !s.channelEnabled) { setResult({ ok: false, message: 'Notifications are turned off for EVA Music. Turn on "Music playback" in Settings → Apps → EVA Music → Notifications.' }); return; }
      const r = await EvaMedia.runTest();
      setStatus(r);
      setResult(r.posted
        ? { ok: true, message: 'Success! EVA Music showed a playback notification. Pull down your notification bar to see it.' }
        : { ok: false, message: r.error ? `Could not show notification: ${r.error}` : 'The notification could not be confirmed. Please check notification settings.' });
      setTimeout(() => audioEngine.refreshNativeNotification(), 5000);
    } catch (e: any) {
      setResult({ ok: false, message: e?.message || 'Test failed' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-3xl p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/90 dark:border-white/10 shadow-sm space-y-3">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-900/60 dark:text-purple-300/70 flex items-center gap-2"><Bell size={14} />Playback notification</h4>
      {!native ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">The notification test is available in the EVA Music Android app.</p>
      ) : (
        <>
          <Item label="Notification permission" ok={status?.permission} />
          <Item label="Notifications turned on" ok={status ? status.enabled && status.channelEnabled : undefined} />
          <Item label="Playback notification shown" ok={status?.posted} />
          <button onClick={runTest} disabled={running}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
            {running ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
            <span>{running ? 'Testing…' : 'Run notification test'}</span>
          </button>
          {result && <p className={`text-xs font-semibold ${result.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{result.message}</p>}
        </>
      )}
    </div>
  );
};
