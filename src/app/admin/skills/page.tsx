"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Skill {
  _id: string;
  skillName: string;
  skillCategory: string;
  description: string;
  providerName: string;
  verificationStatus: string;
  videoUrl: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const headerVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const tableRowVariants: Variants = {
  hidden: { x: -30, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { x: 30, opacity: 0, transition: { duration: 0.2 } },
};

export default function AdminSkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalData, setModalData] = useState<{
    id: string;
    action: "approve" | "reject" | "delete";
  } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/forbidden");
      return;
    }
    fetchSkills();
  }, [session, status]);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/admin/skills");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSkills(data.skills);
    } catch {
      toast.error("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (id: string, action: "approve" | "reject" | "delete") => {
    try {
      if (action === "delete") {
        await fetch("/api/admin/skills", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } else {
        await fetch("/api/admin/skills", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action }),
        });
      }
      toast.success(`Skill ${action}ed`);
      fetchSkills();
    } catch {
      toast.error("Action failed");
    }
  };

  const handleActionClick = (id: string, action: "approve" | "reject" | "delete") => {
    setModalData({ id, action });
  };

  const confirmAction = () => {
    if (!modalData) return;
    performAction(modalData.id, modalData.action);
    setModalData(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 border-4 border-emerald-500 border-t-[#0000] rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto py-10 px-4 space-y-6"
    >
      <motion.h1 variants={headerVariants} className="text-3xl font-bold text-gray-900">
        Admin Skills Management
      </motion.h1>

      <motion.div
        variants={headerVariants}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {skills.map((skill) => (
                  <motion.tr
                    key={skill._id}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{skill.skillName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{skill.skillCategory}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{skill.providerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          skill.verificationStatus === "verified"
                            ? "bg-green-100 text-green-800"
                            : skill.verificationStatus === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {skill.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {skill.videoUrl ? (
                        <a href={skill.videoUrl} target="_blank" className="text-sky-600 underline hover:text-sky-800">
                          Watch
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {skill.verificationStatus !== "verified" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleActionClick(skill._id, "approve")}
                            className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm hover:bg-emerald-600"
                          >
                            Approve
                          </motion.button>
                        )}
                        {skill.verificationStatus !== "rejected" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleActionClick(skill._id, "reject")}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                          >
                            Reject
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleActionClick(skill._id, "delete")}
                          className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {skills.length === 0 && (
            <div className="text-center py-12 text-gray-500">No skills found.</div>
          )}
        </div>
      </motion.div>

      {/* Confirmation Modal */}
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
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm {modalData.action === "delete" ? "Deletion" : modalData.action.charAt(0).toUpperCase() + modalData.action.slice(1)}
              </h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                {modalData.action === "delete"
                  ? "This action is irreversible. Are you sure you want to delete this skill?"
                  : `Are you sure you want to ${modalData.action} this skill?`}
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
                  whileHover={{ scale: 1.02, backgroundColor: modalData.action === "delete" ? "#dc2626" : modalData.action === "reject" ? "#dc2626" : "#059669" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmAction}
                  className={`flex-1 py-2 text-sm text-white rounded-lg transition-colors ${
                    modalData.action === "delete" || modalData.action === "reject"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {modalData.action === "delete" ? "Delete" : modalData.action === "reject" ? "Reject" : "Approve"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}