import React, { useState, useEffect } from 'react';
import { AppNotification } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Bell, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  CheckCheck, 
  RotateCcw,
  Calendar,
  Layers,
  Send
} from 'lucide-react';

interface AlertsPageProps {
  onNavigate: (page: string) => void;
  onSelectTenderById?: (tenderId: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ 
  onNavigate,
  onSelectTenderById
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await ApiService.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ApiService.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleTriggerDeadlineScan = async () => {
    try {
      await ApiService.checkDeadlines();
      await loadAlerts();
    } catch (err) {
      console.error('Deadline scan error:', err);
    }
  };

  const filtered = filterType === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Real-time Tender Deadline Monitor</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Deadline Alerts & Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configurable closing alerts, eligibility notifications, and workspace checklist reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <CheckCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}

          <button
            onClick={handleTriggerDeadlineScan}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-sm"
            title="Scan upcoming tender closing dates against current date"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Check Deadlines</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: 'All Notifications', count: notifications.length },
          { id: 'DEADLINE_WARNING', label: 'Submission Deadlines', count: notifications.filter(n => n.type === 'DEADLINE_WARNING').length },
          { id: 'ELIGIBILITY_ALERT', label: 'Eligibility Matches', count: notifications.filter(n => n.type === 'ELIGIBILITY_ALERT').length },
          { id: 'STAGE_CHANGE', label: 'Pipeline Updates', count: notifications.filter(n => n.type === 'STAGE_CHANGE').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border ${
              filterType === tab.id
                ? 'bg-teal-700 border-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1.5 opacity-70 text-[10px]">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Retrieving alert history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
          <Bell className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Notifications in this Category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You are fully up to date! As submission deadlines approach for your saved tenders, alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const isDeadline = notif.type === 'DEADLINE_WARNING';
            const isMatch = notif.type === 'ELIGIBILITY_ALERT';

            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
                className={`rounded-2xl border p-4 transition-all flex items-start gap-3.5 ${
                  !notif.read
                    ? 'border-teal-500/50 bg-teal-500/5 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                  isDeadline
                    ? 'bg-amber-500/10 text-amber-500'
                    : isMatch
                    ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {isDeadline ? (
                    <Clock className="h-5 w-5" />
                  ) : isMatch ? (
                    <Sparkles className="h-5 w-5" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-teal-500" title="Unread" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Actions & Target link */}
                  <div className="pt-2 flex items-center justify-between">
                    {notif.tender_id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectTenderById) onSelectTenderById(notif.tender_id!);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        <span>View Tender Scope</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('my-tenders');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        <span>Open Bid Workspace</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {!notif.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notif.id);
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
