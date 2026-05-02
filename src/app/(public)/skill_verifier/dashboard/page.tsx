"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { User, Mail, Lock, Save, Eye, EyeOff, CheckCircle, Clock, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Skill {
  _id: string;
  skillName: string;
  verificationStatus: string;
  createdAt: string;
}

interface Stats {
  pendingSkills: number;
  approvedSkills: number;
  rejectedSkills: number;
  totalReviews: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } },
};

export default function VerifierDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<Stats>({ pendingSkills: 0, approvedSkills: 0, rejectedSkills: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user?.role !== "skill_verifier") {
      router.push("/forbidden");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      name: session.user?.name || "",
      email: session.user?.email || "",
    }));
    
    fetchVerifierData();
  }, [session, status]);

  const fetchVerifierData = async () => {
    try {
      const res = await fetch(`${API}/skills/pending`);
      const data = await res.json();
      const pendingSkills = data.skills || [];
      setSkills(pendingSkills);
      setStats({
        pendingSkills: pendingSkills.length,
        approvedSkills: 0,
        rejectedSkills: 0,
        totalReviews: pendingSkills.length,
      });
    } catch (error) {
      toast.error("Failed to load verifier data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }
      
      toast.success("Profile updated. Please log in again.");
      
      // Force logout after a short delay to allow toast to show
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1500);
      
    } catch (error: any) {
      toast.error(error.message);
      setSubmitting(false);
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
      className="max-w-6xl mx-auto py-10 px-4 space-y-8"
    >
      <motion.div variants={cardVariants}>
        <h1 className="text-3xl font-bold text-gray-900">Verifier Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Reviews", value: stats.pendingSkills, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Approved", value: stats.approvedSkills, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected", value: stats.rejectedSkills, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Total Reviews", value: stats.totalReviews, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover={{ y: -5 }}
            className={`${stat.bg} rounded-xl p-5 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        <div className="p-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xl">
                  {session?.user?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-sm text-gray-500">{session?.user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize mt-1">Role: {session?.user?.role?.replace("_", " ")}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                  required
                />
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Change Password (optional)</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 pr-10"
                        placeholder="Leave blank to keep current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: session?.user?.name || "",
                      email: session?.user?.email || "",
                      currentPassword: "",
                      newPassword: "",
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      <motion.div variants={cardVariants}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Skills Pending Your Review</h2>
        {skills.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            No pending skills to review at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div key={skill._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{skill.skillName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Submitted: {new Date(skill.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => router.push(`/skill_verifier/skills/${skill._id}`)}
                    className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}