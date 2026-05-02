"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Activity,
  UserPlus,
  LogIn,
  Link as LinkIcon,
  UserCheck,
  UserX,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  RefreshCw,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

interface LogEntry {
  _id: string;
  type: string;
  description: string;
  userName: string;
  timestamp: string;
  metadata: any;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
};

const logTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  user_register: { icon: UserPlus, color: "text-green-600", label: "Registration" },
  user_login: { icon: LogIn, color: "text-blue-600", label: "Login" },
  user_delete: { icon: Trash2, color: "text-red-600", label: "User Deleted" },
  connection_request: { icon: LinkIcon, color: "text-purple-600", label: "Connection Request" },
  connection_accept: { icon: UserCheck, color: "text-emerald-600", label: "Connection Accepted" },
  connection_reject: { icon: UserX, color: "text-orange-600", label: "Connection Rejected" },
  connection_disconnect: { icon: LinkIcon, color: "text-gray-600", label: "Disconnected" },
  skill_create: { icon: PlusCircle, color: "text-teal-600", label: "Skill Created" },
  skill_edit: { icon: Edit, color: "text-amber-600", label: "Skill Edited" },
  skill_delete: { icon: Trash2, color: "text-red-600", label: "Skill Deleted" },
  skill_approve: { icon: CheckCircle, color: "text-green-600", label: "Skill Approved" },
  skill_reject: { icon: XCircle, color: "text-red-600", label: "Skill Rejected" },
  role_change: { icon: Shield, color: "text-indigo-600", label: "Role Change" },
};

const logTypes = Object.keys(logTypeConfig);

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const url = `/api/admin/logs?limit=200${filterType ? `&type=${filterType}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      } else {
        toast.error(data.message || "Failed to fetch logs");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/forbidden");
      return;
    }
    fetchLogs();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 10000); // refresh every 10 seconds
    }
    return () => clearInterval(interval);
  }, [session, status, filterType, autoRefresh]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getLogIcon = (type: string) => {
    const config = logTypeConfig[type];
    if (config) {
      const Icon = config.icon;
      return <Icon className={`h-5 w-5 ${config.color}`} />;
    }
    return <Activity className="h-5 w-5 text-gray-500" />;
  };

  const getLogLabel = (type: string) => {
    return logTypeConfig[type]?.label || type.replace(/_/g, " ");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Activity Logs</h1>
          <p className="text-gray-500 mt-1">Real-time report of all platform activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin-slow" : ""}`} />
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Filter by type:</span>
        <button
          onClick={() => setFilterType("")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterType === ""
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {logTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === type
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {getLogLabel(type)}
          </button>
        ))}
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"
          />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm">
          No activity logs found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.tr
                      key={log._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getLogIcon(log.type)}
                          <span className="text-sm font-medium text-gray-900">
                            {getLogLabel(log.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{log.description}</p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="text-xs text-gray-400 mt-1">
                            <summary className="cursor-pointer">Details</summary>
                            <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{log.userName || "System"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(log.timestamp)}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}