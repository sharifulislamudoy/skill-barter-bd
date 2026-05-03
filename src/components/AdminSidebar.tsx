// components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  Users,
  Clock,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users Management",
    href: "/admin/users-management",
    icon: Users,
  },
  {
    label: "Skills Management",
    href: "/admin/skills",
    icon: Clock,
  },
];

// Animation variants with correct typing
const sidebarVariants: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
  }),
};

export default function AdminSidebar() {
  const pathname = usePathname();

  const router = useRouter();

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl border-r border-gray-200 p-6 flex flex-col z-30"
    >
      <div className="flex items-center gap-2 mb-8">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="text-xl font-bold text-gray-900"
        >
          <button
            onClick={() => router.push('/')}
            className="cursor-pointer"
          >Admin Panel
          </button>
        </motion.span>
      </div>

      <nav className="flex-1 space-y-2">
        {sidebarLinks.map((link, index) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <motion.div
              key={link.href}
              custom={index}
              variants={linkVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-6 border-t border-gray-200 text-xs text-gray-400"
      >
        SkillBarter Admin v1.0
      </motion.div>
    </motion.aside>
  );
}