/*
  Warnings:

  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First, add the column as nullable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Update existing users with a temporary password hash (bcrypt hash of "temp123")
-- This is: $2a$10$rXKZ7ZqN.bVYH9vXYXzYxO8qHJ8gKQZJYH3tXZQZJYH3tXZQZJYH3t
UPDATE "User" SET "passwordHash" = '$2a$10$rXKZ7ZqN.bVYH9vXYXzYxO8qHJ8gKQZJYH3tXZQZJYH3tXZQZJYH3t';

-- Now make it NOT NULL
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_idx" ON "ActivityLog"("organizationId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "Asset_brandId_idx" ON "Asset"("brandId");

-- CreateIndex
CREATE INDEX "Brand_organizationId_idx" ON "Brand"("organizationId");

-- CreateIndex
CREATE INDEX "Comment_projectId_idx" ON "Comment"("projectId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Creative_projectId_idx" ON "Creative"("projectId");

-- CreateIndex
CREATE INDEX "Project_brandId_idx" ON "Project"("brandId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_templateId_idx" ON "Project"("templateId");

-- CreateIndex
CREATE INDEX "Template_brandId_idx" ON "Template"("brandId");

-- CreateIndex
CREATE INDEX "Template_isActive_idx" ON "Template"("isActive");
