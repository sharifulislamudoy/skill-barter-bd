"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, Variants } from "framer-motion";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Skill {
  _id: string;
  skillName: string;
  skillCategory: string;
  description: string;
  providerName: string;
  providerId: string;
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

// Confirmation Modal Component
function DeleteConfirmModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Rating</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete your rating and feedback? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
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
  const [connectionStatus, setConnectionStatus] = useState<string>("none");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");

  // Rating form state
  const [userRating, setUserRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingUserRating, setExistingUserRating] = useState<Rating | null>(null);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);

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

  // Check connection status
  useEffect(() => {
    if (!session?.user?.id || !skill?.providerId) return;
    const checkConnection = async () => {
      try {
        const res = await fetch(
          `${API}/connections/status?userId=${session.user.id}&targetId=${skill.providerId}`
        );
        const data = await res.json();
        setConnectionStatus(data.status);
      } catch (error) {
        console.error("Failed to check connection", error);
      }
    };
    checkConnection();
  }, [session, skill]);

  // Load existing user rating
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
        toast.error(data.message || "Failed to submit rating");
        return;
      }

      toast.success(existingUserRating ? "Rating updated!" : "Rating submitted!");
      fetchRatings(skill._id);
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
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [session, skill, userRating, userFeedback, existingUserRating]);

  const handleSendConnectionRequest = async () => {
    if (!session?.user?.id || !skill?.providerId) return;
    setSendingRequest(true);
    setConnectionMessage("");
    try {
      const res = await fetch(`${API}/connections/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: session.user.id,
          toUserId: skill.providerId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConnectionStatus("pending_sent");
        toast.success("Connection request sent!");
      } else {
        toast.error(data.message || "Failed to send request");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!ratingToDelete || !session?.user?.id || !skill?._id) return;
    
    try {
      const res = await fetch(`${API}/skills/${skill._id}/ratings/${ratingToDelete._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete rating");
        return;
      }
      
      toast.success("Rating deleted successfully");
      // Refresh ratings and skill average
      fetchRatings(skill._id);
      setSkill((prev) =>
        prev
          ? {
              ...prev,
              averageRating: data.averageRating,
              totalRatings: data.totalRatings,
            }
          : prev
      );
      setRatingToDelete(null);
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const canViewVideo = () => {
    if (!session?.user?.id) return false;
    if (skill && session.user.id === skill.providerId) return true;
    if (connectionStatus === "connected") return true;
    return false;
  };

  const canRate = () => {
    if (!session?.user?.id) return false;
    // Provider cannot rate their own skill
    if (skill && session.user.id === skill.providerId) return false;
    // Only connected users can rate
    return connectionStatus === "connected";
  };

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
  const isOwner = isLoggedIn && session.user.id === skill.providerId;

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

      {/* Video Section */}
      <motion.div variants={itemVariants} className="mb-8 rounded-xl overflow-hidden shadow-lg">
        {canViewVideo() ? (
          <video controls width="100%" className="aspect-video bg-black">
            <source src={skill.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="bg-gray-100 rounded-xl p-8 text-center aspect-video flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-700 font-medium mb-2">Video locked</p>
            <p className="text-gray-500 text-sm mb-4">
              Connect with the provider to access this video and share your skills too.
            </p>
            {!isLoggedIn ? (
              <button onClick={() => signIn()} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Log in to connect
              </button>
            ) : connectionStatus === "pending_sent" ? (
              <div className="text-amber-600 font-medium">Request pending · Awaiting response</div>
            ) : connectionStatus === "pending_received" ? (
              <div className="text-amber-600 font-medium">You have a pending request from this provider</div>
            ) : connectionStatus === "connected" ? (
              <div className="text-emerald-600 font-medium">✓ You are connected – video should be visible</div>
            ) : (
              <button onClick={handleSendConnectionRequest} disabled={sendingRequest} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400">
                {sendingRequest ? "Sending..." : "Send Connection Request"}
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Description */}
      <motion.div variants={itemVariants} className="prose max-w-none text-gray-800 text-lg leading-relaxed mb-12">
        <p>{skill.description}</p>
      </motion.div>

      <hr className="border-gray-200 mb-10" />

      {/* Rating & Feedback Section */}
      <motion.div variants={itemVariants} className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {existingUserRating ? "Update Your Rating" : "Rate this Skill"}
        </h2>

        {!isLoggedIn ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-3">Please log in to rate and leave feedback.</p>
            <button onClick={() => signIn()} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              Log In to Rate
            </button>
          </div>
        ) : isOwner ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600">You cannot rate your own skill.</p>
          </div>
        ) : !canRate() ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-gray-700 font-medium mb-2">Ratings & feedback locked</p>
            <p className="text-gray-500 text-sm">You need to be connected with the provider to rate this skill.</p>
            {connectionStatus === "none" && (
              <button onClick={handleSendConnectionRequest} disabled={sendingRequest} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400">
                Send Connection Request
              </button>
            )}
            {(connectionStatus === "pending_sent" || connectionStatus === "pending_received") && (
              <p className="mt-4 text-amber-600 font-medium">
                {connectionStatus === "pending_sent" ? "Request pending approval" : "Pending request from provider – wait for connection"}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
              <InteractiveStarRating value={userRating} onChange={setUserRating} />
              {userRating > 0 && <p className="text-sm text-gray-500 mt-1">{userRating} star{userRating > 1 ? "s" : ""}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
              <textarea
                id="feedback"
                rows={3}
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="Share your experience with this skill..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-gray-700"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmitRating}
                disabled={userRating === 0 || submitting}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  userRating === 0 || submitting ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {submitting ? "Submitting..." : existingUserRating ? "Update Rating" : "Submit Rating"}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* All Ratings & Feedback */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ratings & Feedback ({ratings.length})</h2>

        {ratingsLoading ? (
          <div className="flex justify-center py-8">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-6 w-6 border-3 border-emerald-500 border-t-[#0000] rounded-full" />
          </div>
        ) : ratings.length === 0 ? (
          <p className="text-gray-500 py-6 text-center bg-gray-50 rounded-xl">No ratings yet. Be the first to rate this skill!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ratings.map((rating) => (
              <div key={rating._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
                    {rating.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{rating.userName}</p>
                      <StarDisplay rating={rating.rating} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500">{new Date(rating.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    {rating.feedback && <p className="text-gray-700 mt-2 leading-relaxed">{rating.feedback}</p>}
                    {!rating.feedback && <p className="text-gray-400 mt-2 italic text-sm">No feedback provided</p>}
                  </div>
                  {/* Delete button - only if logged in and rating belongs to current user */}
                  {isLoggedIn && session.user.id === rating.userId && (
                    <button
                      onClick={() => {
                        setRatingToDelete(rating);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete your rating"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRating}
      />
    </motion.div>
  );
}