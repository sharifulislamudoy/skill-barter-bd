// app/skills/[slug]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, Variants } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Skill {
  _id: string;
  skillName: string;
  skillCategory: string;
  description: string;
  providerName: string;
  verificationStatus: string;
  videoUrl: string;
  slug: string;
  createdAt: string;
  averageRating: number;
  totalRatings: number;
}

interface Rating {
  _id: string;
  skillId: string;
  userId: string;
  userName: string;
  rating: number;
  feedback: string;
  createdAt: string;
  updatedAt?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } },
};

function StarDisplay({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className={`flex gap-0.5 ${sizeClass}`}>
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

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || value;

  return (
    <div
      className="flex gap-1 text-3xl"
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          className={`transition-transform hover:scale-110 cursor-pointer ${
            star <= displayRating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function SkillDetailPage() {
  const { slug } = useParams();
  const { data: session } = useSession();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  // Rating form state
  const [userRating, setUserRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [existingUserRating, setExistingUserRating] = useState<Rating | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchSkill();
  }, [slug]);

  const fetchSkill = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/skills/slug/${slug}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setSkill(data.skill);
      // Fetch ratings after skill is loaded
      if (data.skill?._id) {
        fetchRatings(data.skill._id);
      }
    } catch {
      setSkill(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (skillId: string) => {
    setRatingsLoading(true);
    try {
      const res = await fetch(`${API}/skills/${skillId}/ratings`);
      const data = await res.json();
      setRatings(data.ratings || []);
    } catch {
      setRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  // When ratings load or session changes, check if current user already rated
  useEffect(() => {
    if (!session?.user?.id || ratings.length === 0) {
      setExistingUserRating(null);
      setUserRating(0);
      setUserFeedback("");
      return;
    }
    const existing = ratings.find((r) => r.userId === session.user.id);
    if (existing) {
      setExistingUserRating(existing);
      setUserRating(existing.rating);
      setUserFeedback(existing.feedback || "");
    } else {
      setExistingUserRating(null);
      setUserRating(0);
      setUserFeedback("");
    }
  }, [ratings, session]);

  const handleSubmitRating = useCallback(async () => {
    if (!session?.user?.id || !skill?._id || userRating === 0) return;

    setSubmitting(true);
    setSubmitMessage("");

    try {
      const res = await fetch(`${API}/skills/${skill._id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          userName: session.user.name || "Anonymous",
          rating: userRating,
          feedback: userFeedback,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitMessage(data.message || "Failed to submit rating");
        return;
      }

      setSubmitMessage(data.message || "Rating submitted!");
      // Refresh ratings and skill data
      fetchRatings(skill._id);
      // Update skill average locally
      setSkill((prev) =>
        prev
          ? {
              ...prev,
              averageRating: data.averageRating,
              totalRatings: data.totalRatings,
            }
          : prev
      );
    } catch {
      setSubmitMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [session, skill, userRating, userFeedback]);

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

  if (!skill) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Skill not found.
      </div>
    );
  }

  const isLoggedIn = !!session?.user?.id;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto py-16 px-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-4xl font-bold text-gray-900">{skill.skillName}</h1>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
          Verified
        </span>
      </motion.div>

      <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-1">
        {skill.skillCategory}
      </motion.p>
      <motion.p variants={itemVariants} className="text-gray-500 mb-2">
        by {skill.providerName}
      </motion.p>

      {/* Average Rating Display */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
        <StarDisplay rating={skill.averageRating || 0} size="lg" />
        <span className="text-lg font-semibold text-gray-800">
          {skill.averageRating ? skill.averageRating.toFixed(1) : "0.0"}
        </span>
        <span className="text-gray-500">
          ({skill.totalRatings || 0} {skill.totalRatings === 1 ? "rating" : "ratings"})
        </span>
      </motion.div>

      {/* Video */}
      {skill.videoUrl && (
        <motion.div variants={itemVariants} className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <video controls width="100%" className="aspect-video bg-black">
            <source src={skill.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      )}

      {/* Description */}
      <motion.div
        variants={itemVariants}
        className="prose max-w-none text-gray-800 text-lg leading-relaxed mb-12"
      >
        <p>{skill.description}</p>
      </motion.div>

      {/* Divider */}
      <hr className="border-gray-200 mb-10" />

      {/* Rating & Feedback Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {existingUserRating ? "Update Your Rating" : "Rate this Skill"}
        </h2>

        {!isLoggedIn ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-3">Please log in to rate and leave feedback.</p>
            <button
              onClick={() => signIn()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Log In to Rate
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* Star selector */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
              <InteractiveStarRating value={userRating} onChange={setUserRating} />
              {userRating > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {userRating} star{userRating > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Feedback textarea */}
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                id="feedback"
                rows={3}
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="Share your experience with this skill..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-gray-700"
              />
            </div>

            {/* Submit button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmitRating}
                disabled={userRating === 0 || submitting}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  userRating === 0 || submitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : existingUserRating
                  ? "Update Rating"
                  : "Submit Rating"}
              </button>
              {submitMessage && (
                <span
                  className={`text-sm font-medium ${
                    submitMessage.includes("success") || submitMessage.includes("updated")
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {submitMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* All Ratings & Feedback */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ratings & Feedback ({ratings.length})
        </h2>

        {ratingsLoading ? (
          <div className="flex justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-6 w-6 border-3 border-emerald-500 border-t-[#0000] rounded-full"
            />
          </div>
        ) : ratings.length === 0 ? (
          <p className="text-gray-500 py-6 text-center bg-gray-50 rounded-xl">
            No ratings yet. Be the first to rate this skill!
          </p>
        ) : (
          <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
            {ratings.map((rating) => (
              <div
                key={rating._id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-full flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                    {rating.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{rating.userName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <StarDisplay rating={rating.rating} size="sm" />
                  </div>
                </div>
                {rating.feedback && (
                  <p className="text-gray-700 mt-2 leading-relaxed">{rating.feedback}</p>
                )}
                {!rating.feedback && (
                  <p className="text-gray-400 mt-2 italic text-sm">No feedback provided</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}