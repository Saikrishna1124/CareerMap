import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  title: text("title"),
  bio: text("bio"),
  avatar: text("avatar"),
  skills: jsonb("skills"),
  experience: jsonb("experience"),
  education: jsonb("education"),
  socialLinks: jsonb("sociallinks"),
  targetRole: text("target_role"),
  roadmapProgress: jsonb("roadmap_progress"),
  careerMap: jsonb("career_map"),
  createdAt: timestamp("createdat").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: text("id").primaryKey(),
  userId: text("userid").notNull().references(() => users.id),
  content: text("content").notNull(),
  score: integer("score").notNull(),
  skills: jsonb("skills").notNull(),
  tips: jsonb("tips").notNull(),
  createdAt: timestamp("createdat").defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: text("id").primaryKey(),
  userId: text("userid").notNull().references(() => users.id),
  type: text("type").notNull(),
  score: integer("score").notNull(),
  communication: integer("communication").notNull(),
  technical: integer("technical").notNull(),
  confidence: integer("confidence").notNull(),
  integrity: integer("integrity").notNull(),
  feedback: text("feedback").notNull(),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("createdat").defaultNow(),
});

export const quizResults = pgTable("quiz_results", {
  id: text("id").primaryKey(),
  userId: text("userid").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  createdAt: timestamp("createdat").defaultNow(),
});
