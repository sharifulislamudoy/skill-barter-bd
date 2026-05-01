"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRightLeft,
  BookOpen,
  GraduationCap,
  Users,
  Star,
  Code,
  Palette,
  Music,
  Languages,
  ChevronRight,
} from "lucide-react";
import type { SkillCard } from "@/types/hero";

const skillCards: SkillCard[] = [
  { id: 1, name: "Web Dev", icon: "Code", color: "bg-blue-100 text-blue-600" },
  { id: 2, name: "Design", icon: "Palette", color: "bg-pink-100 text-pink-600" },
  { id: 3, name: "Music", icon: "Music", color: "bg-yellow-100 text-yellow-600" },
  { id: 4, name: "Languages", icon: "Languages", color: "bg-green-100 text-green-600" },
  { id: 5, name: "Marketing", icon: "Star", color: "bg-purple-100 text-purple-600" },
];

const iconMap: Record<string, React.ElementType> = {
  Code,
  Palette,
  Music,
  Languages,
  Star,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { delay: 0.8 + i * 0.1, type: "spring", stiffness: 200 },
  }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* গ্রেডিয়েন্ট গ্লো সরানো হয়েছে */}

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-20 lg:px-8 lg:py-40">
        {/* Left column */}
        <motion.div
          className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex">
            <span className="inline-flex items-center gap-x-1.5 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-600 ring-1 ring-sky-600/20">
              <ArrowRightLeft className="h-4 w-4" />
              Skill Exchange Platform
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-10 text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
          >
            <span className="text-black">Skill</span>{" "}
            <span className="text-emerald-400">Barter</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-xl leading-8 text-gray-600"
          >
            Learn. Share. Grow. Exchange skills without money. Teach what you know,
            learn what you need — all through trusted barter.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="/register"
              className="group inline-flex items-center gap-x-2 rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-emerald-400 hover:shadow-emerald-500/25"
            >
              Get Started Free
              <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-sky-600"
            >
              <BookOpen className="h-5 w-5" />
              How it works <span aria-hidden="true">→</span>
            </a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap gap-6"
          >
            <div className="flex items-center gap-x-2">
              <Users className="h-5 w-5 text-sky-500" />
              <span className="text-sm text-gray-700">
                <strong>12k+</strong> Skill Members
              </span>
            </div>
            <div className="flex items-center gap-x-2">
              <GraduationCap className="h-5 w-5 text-sky-500" />
              <span className="text-sm text-gray-700">
                <strong>3k+</strong> Skills Shared
              </span>
            </div>
            <div className="flex items-center gap-x-2">
              <Star className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-gray-700">
                <strong>4.9</strong> Rating
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right column: floating cards */}
        <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:ml-10 hidden lg:block">
          <div className="relative h-[400px] w-[400px] flex items-center justify-center">
            {/* Center swap icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
              className="absolute z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-sky-200/50 ring-1 ring-gray-200"
            >
              <ArrowRightLeft className="h-10 w-10 text-sky-500" />
            </motion.div>

            {skillCards.map((card, index) => {
              const IconComponent = iconMap[card.icon] || Code;
              const angle = (index * 72) * (Math.PI / 180);
              const radius = 150;
              const x = (Math.cos(angle) * radius).toFixed(4);
              const y = (Math.sin(angle) * radius).toFixed(4);

              return (
                <motion.div
                  key={card.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className={`absolute flex items-center gap-2 rounded-xl ${card.color} px-4 py-3 shadow-lg backdrop-blur-sm`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {card.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}