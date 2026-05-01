// app/skill_member/connections/connected/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface ConnectedUser {
  connectionId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    slug: string;
  };
  connectedAt: string;
}

// Modal data structure
interface DisconnectModalData {
  connectionId: string;
  userName: string;
}

// Animation variants (same style as verifier page)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const headerVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } },
};

export default function ConnectedUsersPage() {
  const { data: session } = useSession();
  const [connections, setConnections] = useState<ConnectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [modalData, setModalData] = useState<DisconnectModalData | null>(null);

  const fetchConnectedUsers = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`${API}/connections/connected/${session.user.id}`);
      const data = await res.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectedUsers();
  }, [session]);

  const handleDisconnect = async (connectionId: string) => {
    setDisconnecting(true);
    try {
      const res = await fetch(`${API}/connections/disconnect/${connectionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.connectionId !== connectionId));
        // Optional toast
        alert("Disconnected successfully");
      } else {
        alert("Failed to disconnect");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setDisconnecting(false);
      setModalData(null);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view your connections.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto py-10 px-4"
    >
      <motion.h1 variants={headerVariants} className="text-2xl font-bold text-gray-900 mb-2">
        My Connections
      </motion.h1>
      <motion.p variants={headerVariants} className="text-gray-500 mb-6">
        People you are connected with
      </motion.p>

      {connections.length === 0 ? (
        <motion.div variants={headerVariants} className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          You don't have any connections yet.
          <div className="mt-2">
            <Link
              href="/skill_member/search"
              className="text-emerald-600 hover:underline"
            >
              Find people to connect with →
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {connections.map((conn) => (
              <motion.div
                key={conn.connectionId}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-lg">
                    {conn.user?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{conn.user?.name}</p>
                    <p className="text-sm text-gray-500">{conn.user?.email}</p>
                    <p className="text-xs text-gray-400">
                      Connected since: {new Date(conn.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/users/${conn.user?.slug}`}
                    className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    View Profile
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setModalData({
                        connectionId: conn.connectionId,
                        userName: conn.user?.name || "this user",
                      })
                    }
                    disabled={disconnecting}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    Disconnect
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      <AnimatePresence>
        {modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 400, damping: 25 }}
              >
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Disconnect</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Are you sure you want to disconnect from <strong>{modalData.userName}</strong>?
                <br />
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalData(null)}
                  className="flex-1 py-2 text-gray-600 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#dc2626" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDisconnect(modalData.connectionId)}
                  className="flex-1 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}