"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, Variants } from "framer-motion";
import { UploadCloud } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const formItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } },
};

export default function AddSkillPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    skillName: "",
    skillCategory: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const categories = [
    "Web Development", "Design", "Music", "Languages", "Marketing",
    "Photography", "Cooking", "Fitness", "Writing", "Data Science",
    "Machine Learning", "Mobile Development", "Game Development",
    "Digital Marketing", "SEO", "Graphic Design", "Illustration",
    "Video Editing", "Animation", "Public Speaking", "Finance",
    "Investing", "Entrepreneurship", "Project Management",
    "UI/UX Design", "Cybersecurity", "Networking", "Cloud Computing",
    "DevOps", "Blockchain", "AR/VR", "Robotics", "Math", "Physics",
    "Chemistry", "Biology", "History", "Philosophy", "Yoga", "Dancing"
  ];

  if (status === "loading") {
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

  if (!session || session.user?.role !== "skill_member") {
    router.push("/forbidden");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skillName || !form.skillCategory || !form.description) {
      toast.error("Please fill all fields");
      return;
    }
    if (!videoFile) {
      toast.error("Please upload a video");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("skillName", form.skillName);
    formData.append("skillCategory", form.skillCategory);
    formData.append("description", form.description);
    formData.append("providerName", session.user.name || "Unknown");
    formData.append("providerId", session.user.id);
    formData.append("video", videoFile);

    try {
      const res = await fetch(`${API}/skills`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Submission failed");
      }
      toast.success("Skill created! Waiting for verification.");
      router.push("/skills");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-xl mx-auto px-4 py-16"
    >
      <motion.h1 variants={formItemVariants} className="text-3xl font-bold text-gray-900 mb-8">
        Add a New Skill
      </motion.h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
        <motion.div variants={formItemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            value={form.skillName}
            onChange={(e) => setForm({ ...form, skillName: e.target.value })}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            value={form.skillCategory}
            onChange={(e) => setForm({ ...form, skillCategory: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </motion.div>

        <motion.div variants={formItemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video (required)</label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-emerald-400 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-gray-500">
              <UploadCloud className="h-6 w-6 mb-1" />
              <span className="text-sm">{videoFile ? videoFile.name : "Click to upload video"}</span>
            </div>
          </div>
        </motion.div>

        <motion.button
          variants={formItemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-4 w-4 border-2 border-white border-t-[#0000] rounded-full"
              />
              Uploading...
            </span>
          ) : (
            "Submit Skill"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}