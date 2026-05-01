"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Skill {
  _id: string;
  skillName: string;
  skillCategory: string;
  description: string;
  providerName: string;
  slug: string;
  verificationStatus: string;
  videoUrl?: string;
  averageRating: number;
  totalRatings: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  slug: string;
  role: string;
  createdAt: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function truncateDescription(text: string) {
  const words = text.split(" ");
  if (words.length <= 7) return text;
  return words.slice(0, 7).join(" ") + " …";
}

export default function UserProfilePage() {
  const { slug } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchUserAndSkills = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/users/${slug}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser(data.user);
        setSkills(data.skills || []);
      } catch (error) {
        console.error(error);
        setUser(null);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndSkills();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 border-4 border-emerald-500 border-t-[#0000] rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        User not found.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto py-12 px-4"
    >
      {/* User header */}
      <div className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-gray-500 mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Skills section */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills offered by {user.name}</h2>

      {skills.length === 0 ? (
        <p className="text-gray-500 py-8 text-center bg-gray-50 rounded-xl">
          This user hasn't added any verified skills yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <motion.div
              key={skill._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -5, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.1)" }}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{skill.skillName}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Verified
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{skill.skillCategory}</p>

              <div className="flex items-center gap-2 mb-2">
                <StarDisplay rating={skill.averageRating || 0} />
                <span className="text-sm font-medium text-gray-700">
                  {skill.averageRating ? skill.averageRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-xs text-gray-400">({skill.totalRatings || 0})</span>
              </div>

              <p className="text-gray-700 mb-3 line-clamp-2">{truncateDescription(skill.description)}</p>
              <p className="text-sm text-gray-500">by {skill.providerName}</p>
              <Link
                href={`/skills/${skill.slug}`}
                className="mt-4 inline-block text-emerald-600 font-medium hover:underline hover:text-emerald-700 transition-colors"
              >
                View Details →
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}