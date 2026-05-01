export interface Skill {
  _id: string;
  skillName: string;
  skillCategory: string;
  description: string;
  providerName: string;
  verificationStatus: "pending" | "verified" | "rejected";
  ratings: number;
  feedback: any[];
  videoUrl: string;
  slug: string;
  createdAt: string;
  providerId?: string;
}