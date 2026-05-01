"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search } from "lucide-react";

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
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const headerVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const cardVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  exit: { scale: 0.8, opacity: 0 },
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, [search]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const url = search
        ? `${API}/skills?search=${encodeURIComponent(search)}`
        : `${API}/skills`;
      const res = await fetch(url);
      const data = await res.json();
      setSkills(data.skills);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const truncateDescription = (text: string) => {
    const words = text.split(" ");
    if (words.length <= 7) return text;
    return words.slice(0, 7).join(" ") + " …";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto py-10 px-4 space-y-8"
    >
      <motion.div variants={headerVariants}>
        <h1 className="text-3xl font-bold text-gray-900">Verified Skills</h1>
        <p className="text-gray-600 mt-2">Browse skills that have passed verification.</p>
      </motion.div>

      <motion.div variants={headerVariants} className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 border-4 border-emerald-500 border-t-[#0000] rounded-full"
          />
        </div>
      ) : skills.length === 0 ? (
        <motion.p
          variants={headerVariants}
          className="text-center py-12 text-gray-500"
        >
          No skills found.
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {skills.map((skill) => (
              <motion.div
                key={skill._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
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
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}