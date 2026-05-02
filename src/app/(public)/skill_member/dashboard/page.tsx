"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { User, Mail, Lock, Save, Eye, EyeOff, BookOpen, Users, Star, CheckCircle, Clock, XCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Skill {
  _id: string;
  skillName: string;
  skillCategory: string;
  verificationStatus: string;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

interface Stats {
  totalSkills: number;
  verifiedSkills: number;
  pendingSkills: number;
  rejectedSkills: number;
  totalConnections: number;
  averageRating: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } },
};

export default function SkillMemberDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSkills: 0,
    verifiedSkills: 0,
    pendingSkills: 0,
    rejectedSkills: 0,
    totalConnections: 0,
    averageRating: 0,
  });
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
    if (session.user?.role !== "skill_member") {
      router.push("/forbidden");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      name: session.user?.name || "",
      email: session.user?.email || "",
    }));
    
    fetchMemberData();
  }, [session, status]);

  const fetchMemberData = async () => {
    if (!session?.user?.id) return;
    try {
      const skillsRes = await fetch(`${API}/skills/user/${session.user.id}`);
      const skillsData = await skillsRes.json();
      const userSkills = skillsData.skills || [];
      setSkills(userSkills);
      
      const connRes = await fetch(`${API}/connections/connected/${session.user.id}`);
      const connData = await connRes.json();
      const connections = connData.connections || [];
      
      const verified = userSkills.filter((s: Skill) => s.verificationStatus === "verified").length;
      const pending = userSkills.filter((s: Skill) => s.verificationStatus === "pending").length;
      const rejected = userSkills.filter((s: Skill) => s.verificationStatus === "rejected").length;
      
      const totalRatingSum = userSkills.reduce((sum: number, s: Skill) => sum + (s.averageRating || 0), 0);
      const avgRating = userSkills.length > 0 ? totalRatingSum / userSkills.length : 0;
      
      setStats({
        totalSkills: userSkills.length,
        verifiedSkills: verified,
        pendingSkills: pending,
        rejectedSkills: rejected,
        totalConnections: connections.length,
        averageRating: avgRating,
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
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
        <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name}</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Skills", value: stats.totalSkills, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Verified", value: stats.verifiedSkills, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: stats.pendingSkills, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Connections", value: stats.totalConnections, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Avg Rating", value: stats.averageRating.toFixed(1), icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Rejected", value: stats.rejectedSkills, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className={`${stat.bg} rounded-xl p-4 shadow-sm text-center`}
          >
            <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/skill_member/add-skills"
          className="bg-emerald-500 text-white rounded-xl p-5 text-center hover:bg-emerald-600 transition-colors shadow-sm"
        >
          <PlusCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-semibold">Add New Skill</p>
          <p className="text-sm opacity-90">Share your expertise</p>
        </Link>
        <Link
          href="/skill_member/connections"
          className="bg-purple-500 text-white rounded-xl p-5 text-center hover:bg-purple-600 transition-colors shadow-sm"
        >
          <Users className="h-8 w-8 mx-auto mb-2" />
          <p className="font-semibold">Connection Requests</p>
          <p className="text-sm opacity-90">Manage pending requests</p>
        </Link>
        <Link
          href="/skill_member/connections/connected"
          className="bg-blue-500 text-white rounded-xl p-5 text-center hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Users className="h-8 w-8 mx-auto mb-2" />
          <p className="font-semibold">My Connections</p>
          <p className="text-sm opacity-90">View your network</p>
        </Link>
        <Link
          href="/skill_member/my-skills"
          className="bg-amber-500 text-white rounded-xl p-5 text-center hover:bg-amber-600 transition-colors shadow-sm"
        >
          <BookOpen className="h-8 w-8 mx-auto mb-2" />
          <p className="font-semibold">My Skills</p>
          <p className="text-sm opacity-90">Manage your skills</p>
        </Link>
      </motion.div>

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
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-2xl">
                {session?.user?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-lg">{session?.user?.name}</p>
                <p className="text-gray-500">{session?.user?.email}</p>
                <p className="text-xs text-gray-400 capitalize mt-1">Role: {session?.user?.role?.replace("_", " ")}</p>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Recent Skills</h2>
          <Link href="/skill_member/my-skills" className="text-emerald-600 text-sm hover:underline">
            View all →
          </Link>
        </div>
        {skills.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            You haven't added any skills yet.
            <Link href="/skill_member/add-skills" className="block text-emerald-600 mt-2 hover:underline">
              Add your first skill →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.slice(0, 4).map((skill) => (
              <div key={skill._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{skill.skillName}</h3>
                    <p className="text-sm text-gray-500">{skill.skillCategory}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    skill.verificationStatus === "verified" ? "bg-green-100 text-green-800" :
                    skill.verificationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {skill.verificationStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span>{skill.averageRating.toFixed(1)} ({skill.totalRatings} ratings)</span>
                </div>
                <Link
                  href={`/skills/${skill.skillName.toLowerCase().replace(/\s+/g, "-")}-${skill.skillCategory.toLowerCase().replace(/\s+/g, "-")}`}
                  className="inline-block mt-3 text-emerald-600 text-sm hover:underline"
                >
                  View skill →
                </Link>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}