export type UserRole = 'student' | 'instructor' | 'admin';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';

export type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  instructor?: InstructorProfile;
}

export interface InstructorProfile {
  id: string;
  userId: string;
  headline?: string;
  biography?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  payoutEmail?: string;
  isApproved: boolean;
  totalStudents: number;
  averageRating: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  courseCount?: number;
}

export interface Lecture {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration: number; // in seconds
  order: number;
  isPreview: boolean;
  resources?: { name: string; url: string; size?: number }[];
  isCompleted?: boolean;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lectures: Lecture[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  thumbnailUrl?: string;
  promoVideoUrl?: string;
  price: number;
  discountPrice?: number;
  level: CourseLevel;
  status: CourseStatus;
  language: string;
  requirements?: string[];
  learningOutcomes?: string[];
  targetAudience?: string[];
  categoryId: string;
  category?: Category;
  instructorId: string;
  instructor?: {
    id: string;
    headline?: string;
    biography?: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  sections?: Section[];
  averageRating: number;
  totalRatings: number;
  totalEnrollments: number;
  totalDuration: number;
  lectureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  progressPercent: number;
  completedAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}
