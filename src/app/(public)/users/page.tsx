"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface User {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  totalSkills: number;
  totalRatings: number;
  averageRating: number;
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = search
        ? `${API}/users?search=${encodeURIComponent(search)}`
        : `${API}/users`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto py-10 px-4 space-y-8"
    >
      <motion.div variants={headerVariants}>
        <h1 className="text-3xl font-bold text-gray-900">Skill Providers</h1>
        <p className="text-gray-600 mt-2">Browse all members who share their skills.</p>
      </motion.div>

      <motion.div variants={headerVariants} className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-gray-700 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
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
      ) : users.length === 0 ? (
        <motion.p variants={headerVariants} className="text-center py-12 text-gray-500">
          No users found.
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ y: -5, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.1)" }}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Member since {formatDate(user.createdAt)}
                </p>

                <div className="flex items-center gap-2 mb-2">
                  <StarDisplay rating={user.averageRating || 0} />
                  <span className="text-sm font-medium text-gray-700">
                    {user.averageRating ? user.averageRating.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-xs text-gray-400">({user.totalRatings} ratings)</span>
                </div>

                <p className="text-gray-700 mb-3">
                  <span className="font-medium">{user.totalSkills}</span> published skill{user.totalSkills !== 1 ? "s" : ""}
                </p>

                <Link
                  href={`/users/${user.slug}`}
                  className="mt-4 inline-block text-emerald-600 font-medium hover:underline hover:text-emerald-700 transition-colors"
                >
                  View Profile →
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}