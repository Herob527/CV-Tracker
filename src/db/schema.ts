import { sql } from "drizzle-orm";
import {
  bytea,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("UserRole", ["user", "admin"]);

export const jobOfferStatusEnum = pgEnum("JobOfferStatus", [
  "Applied",
  "Interview",
  "Offer",
  "Declined",
]);

export const users = pgTable(
  "Users",
  {
    Id: uuid("Id").primaryKey().default(sql`uuidv7()`),
    Email: varchar("Email", { length: 255 }).notNull().unique(),
    Name: varchar("Name", { length: 100 }).notNull(),
    Surname: varchar("Surname", { length: 100 }).notNull(),
    Password: varchar("Password", { length: 255 }).notNull(),
    Role: userRoleEnum("Role").notNull().default("user"),
    CreatedAt: timestamp("CreatedAt").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("Users_Email_idx").on(table.Email)],
);

export const jobOffers = pgTable(
  "JobOffers",
  {
    Id: uuid("Id").primaryKey().default(sql`uuidv7()`),
    OwnerId: uuid("OwnerId")
      .notNull()
      .references(() => users.Id, { onDelete: "cascade" }),
    CompanyName: varchar("CompanyName", { length: 255 }).notNull(),
    JobTitle: varchar("JobTitle", { length: 255 }).notNull(),
    CreatedAt: timestamp("CreatedAt").notNull().defaultNow(),
    UpdatedAt: timestamp("UpdatedAt").notNull().defaultNow(),
    Status: jobOfferStatusEnum("Status").notNull().default("Applied"),
    Description: text("Description"),
    CompanyAddress: varchar("CompanyAddress", { length: 500 }),
    CompanyEmail: varchar("CompanyEmail", { length: 255 }),
    CompanyPhone: varchar("CompanyPhone", { length: 50 }),
    CvFile: bytea("CvFile"),
    CvFileName: varchar("CvFileName", { length: 255 }),
  },
  (table) => [
    index("JobOffers_OwnerId_idx").on(table.OwnerId),
    index("JobOffers_Status_idx").on(table.Status),
  ],
);

export const jobOfferChanges = pgTable(
  "JobOfferChanges",
  {
    Id: uuid("Id").primaryKey().default(sql`uuidv7()`),
    JobOfferId: uuid("JobOfferId")
      .notNull()
      .references(() => jobOffers.Id, { onDelete: "cascade" }),
    ChangedAt: timestamp("ChangedAt").notNull().defaultNow(),
    FieldName: varchar("FieldName", { length: 100 }).notNull(),
    OldValue: text("OldValue"),
    NewValue: text("NewValue"),
  },
  (table) => [index("JobOfferChanges_JobOfferId_idx").on(table.JobOfferId)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type JobOffer = typeof jobOffers.$inferSelect;
export type NewJobOffer = typeof jobOffers.$inferInsert;

export type JobOfferChange = typeof jobOfferChanges.$inferSelect;
export type NewJobOfferChange = typeof jobOfferChanges.$inferInsert;
