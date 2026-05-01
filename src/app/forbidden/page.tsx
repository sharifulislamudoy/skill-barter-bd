"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const childVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } },
};

export default function ForbiddenPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-screen items-center justify-center bg-gray-50"
    >
      <div className="text-center bg-white rounded-2xl shadow-xl p-10 max-w-sm mx-4">
        <motion.h1
          variants={childVariants}
          className="text-7xl font-extrabold text-red-500"
        >
          403
        </motion.h1>
        <motion.p variants={childVariants} className="mt-4 text-gray-600">
          You do not have permission to access this page.
        </motion.p>
        <motion.div variants={childVariants} className="mt-8">
          <Link
            href="/"
            className="inline-block bg-sky-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-600 transition-colors"
          >
            Go Home
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}