// app/skill_member/connections/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

interface ConnectionRequest {
  _id: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  createdAt: string;
  fromUser: {
    _id: string;
    name: string;
    email: string;
    slug: string;
  };
}

export default function ConnectionsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`${API}/connections/received/${session.user.id}`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [session]);

  const handleAccept = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const res = await fetch(`${API}/connections/${requestId}/accept`, {
        method: "PATCH",
      });
      if (res.ok) {
        // Remove from list or update status
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      } else {
        alert("Failed to accept request");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const res = await fetch(`${API}/connections/${requestId}/reject`, {
        method: "PATCH",
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      } else {
        alert("Failed to reject request");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setProcessing(null);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view connection requests.</p>
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
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Connection Requests</h1>

      {requests.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          No pending connection requests.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                  {req.fromUser?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{req.fromUser?.name}</p>
                  <p className="text-sm text-gray-500">{req.fromUser?.email}</p>
                  <p className="text-xs text-gray-400">
                    Requested: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/users/${req.fromUser?.slug}`}
                  className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => handleAccept(req._id)}
                  disabled={processing === req._id}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  disabled={processing === req._id}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}