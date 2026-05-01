// app/(admin)/admin/users-management/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Users,
  Shield,
  CheckCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

// Animation variants with correct typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const headerVariants: Variants = {
  hidden: { y: -30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const statCardVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { delay: i * 0.1, type: "spring", stiffness: 200 },
  }),
};

const tableVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.3 },
  },
};

const rowVariants: Variants = {
  hidden: { x: -30, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { x: 30, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState<{
    userId: string;
    currentRole: string;
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else toast.error(data.message || "Failed to fetch users");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Role updated!");
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Update failed");
    }
    setRoleModal(null);
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      const res = await fetch(`/api/admin/users?id=${deleteUserId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("User deleted");
        setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
      } else {
        toast.error("Deletion failed");
      }
    } catch {
      toast.error("Network error");
    }
    setDeleteUserId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={headerVariants}>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all registered users. Change roles or delete accounts.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Total Users", color: "text-sky-500", value: users.length },
          { icon: Shield, label: "Admins", color: "text-emerald-500", value: users.filter((u) => u.role === "admin").length },
          { icon: CheckCircle, label: "Verifiers", color: "text-pink-500", value: users.filter((u) => u.role === "skill_verifier").length },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={statCardVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 cursor-default"
          >
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <motion.div
        variants={tableVariants}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.6)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "skill_verifier"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setRoleModal({
                              userId: user._id,
                              currentRole: user.role,
                            })
                          }
                          className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md hover:bg-emerald-100 transition-colors duration-200"
                        >
                          Change Role
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteUserId(user._id)}
                          className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded-md hover:bg-red-100 transition-colors duration-200 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500"
          >
            No users found.
          </motion.div>
        )}
      </motion.div>

      {/* Role Change Modal */}
      <AnimatePresence>
        {roleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change User Role
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Select a new role for this user.
              </p>
              <div className="space-y-2">
                {["skill_member", "skill_verifier", "admin"].map((role) => (
                  <motion.button
                    key={role}
                    whileHover={{ x: 4 }}
                    onClick={() => handleRoleChange(roleModal.userId, role)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      roleModal.currentRole === role
                        ? "bg-emerald-100 text-emerald-700 font-medium"
                        : "bg-gray-50 hover:bg-emerald-50 text-gray-700"
                    }`}
                  >
                    {role
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ backgroundColor: "#f3f4f6" }}
                onClick={() => setRoleModal(null)}
                className="mt-4 w-full py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                This action is irreversible. Are you sure you want to delete
                this user?
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteUserId(null)}
                  className="flex-1 py-2 text-gray-600 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#dc2626" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="flex-1 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}