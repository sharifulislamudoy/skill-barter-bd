"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, Variants } from "framer-motion";
import { Pencil, Trash2, Video, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

interface Skill {
  _id: string;
  skillName: string;
  skillCategory: string;
  description: string;
  verificationStatus: "pending" | "verified" | "rejected";
  averageRating: number;
  totalRatings: number;
  videoUrl: string;
  slug: string;
  createdAt: string;
}

export default function MySkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editForm, setEditForm] = useState({
    skillName: "",
    skillCategory: "",
    description: "",
  });
  const [editVideo, setEditVideo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session.user?.role === "skill_member") {
      fetchMySkills();
    } else if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session.user?.role !== "skill_member") {
      router.push("/forbidden");
    }
  }, [status, session]);

  const fetchMySkills = async () => {
    try {
      const res = await fetch(`${API}/skills/user/${session?.user.id}`);
      const data = await res.json();
      setSkills(data.skills);
    } catch (error) {
      toast.error("Failed to load your skills");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    try {
      const res = await fetch(`${API}/skills/${skillId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Skill deleted");
      setSkills(skills.filter((s) => s._id !== skillId));
    } catch (error) {
      toast.error("Could not delete skill");
    }
    setDeleteConfirm(null);
  };

  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);
    setEditForm({
      skillName: skill.skillName,
      skillCategory: skill.skillCategory,
      description: skill.description,
    });
    setEditVideo(null);
  };

  const closeEditModal = () => {
    setEditingSkill(null);
    setEditVideo(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("skillName", editForm.skillName);
    formData.append("skillCategory", editForm.skillCategory);
    formData.append("description", editForm.description);
    formData.append("userId", session?.user.id);
    if (editVideo) formData.append("video", editVideo);

    try {
      const res = await fetch(`${API}/skills/${editingSkill._id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setSkills(skills.map((s) => (s._id === editingSkill._id ? updated.skill : s)));
      toast.success("Skill updated");
      closeEditModal();
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Rejected</span>;
      default:
        return null;
    }
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
      className="max-w-4xl mx-auto px-4 py-16"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Skills</h1>
        <button
          onClick={() => router.push("/skill_member/add-skills")}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
        >
          + Add New Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow-sm">
          You haven't added any skills yet.
        </div>
      ) : (
        <div className="space-y-6">
          {skills.map((skill) => (
            <motion.div
              key={skill._id}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{skill.skillName}</h2>
                    {getStatusBadge(skill.verificationStatus)}
                  </div>
                  <p className="text-sm text-emerald-600 mb-2">{skill.skillCategory}</p>
                  <p className="text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>⭐ {skill.averageRating.toFixed(1)} ({skill.totalRatings} ratings)</span>
                    <span>📅 {new Date(skill.createdAt).toLocaleDateString()}</span>
                    {skill.videoUrl && (
                      <a
                        href={skill.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:underline"
                      >
                        <Video className="w-4 h-4" /> Watch video
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(skill)}
                    className="p-2 text-gray-500 hover:text-emerald-600 transition"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(skill._id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Delete confirmation */}
              {deleteConfirm === skill._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <span className="text-sm text-gray-600">Are you sure?</span>
                  <button
                    onClick={() => handleDelete(skill._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal - fixed text visibility */}
      {editingSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Skill</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  value={editForm.skillName}
                  onChange={(e) => setEditForm({ ...editForm, skillName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  value={editForm.skillCategory}
                  onChange={(e) => setEditForm({ ...editForm, skillCategory: e.target.value })}
                  required
                >
                  <option value="" className="text-gray-500">Select category</option>
                  {["Web Development", "Design", "Music", "Languages", "Marketing", "Photography", "Cooking", "Fitness", "Writing", "Data Science", "Machine Learning", "Mobile Development", "Game Development", "Digital Marketing", "SEO", "Graphic Design", "Illustration", "Video Editing", "Animation", "Public Speaking", "Finance", "Investing", "Entrepreneurship", "Project Management", "UI/UX Design", "Cybersecurity", "Networking", "Cloud Computing", "DevOps", "Blockchain", "AR/VR", "Robotics", "Math", "Physics", "Chemistry", "Biology", "History", "Philosophy", "Yoga", "Dancing"].map((cat) => (
                    <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Replace Video (optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEditVideo(e.target.files?.[0] || null)}
                  className="w-full text-gray-700 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-500 text-white rounded-lg py-2 hover:bg-emerald-600 disabled:opacity-50 transition flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}