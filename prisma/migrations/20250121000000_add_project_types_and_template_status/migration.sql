-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('TEMPLATE_CREATION', 'CAMPAIGN');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "projectType" "ProjectType" NOT NULL DEFAULT 'CAMPAIGN';

-- AlterTable
ALTER TABLE "Template" ADD COLUMN "templateStatus" "TemplateStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN "projectId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Template_projectId_key" ON "Template"("projectId");

-- CreateIndex
CREATE INDEX "Template_templateStatus_idx" ON "Template"("templateStatus");

-- CreateIndex
CREATE INDEX "Project_projectType_idx" ON "Project"("projectType");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
