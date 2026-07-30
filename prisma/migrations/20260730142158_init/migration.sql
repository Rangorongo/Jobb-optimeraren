-- CreateEnum
CREATE TYPE "JobMatchStatus" AS ENUM ('FORESLAGEN', 'ANSOKT', 'INTERVJU', 'AVSLAG');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CV', 'COVER_LETTER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "authProvider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferences" JSONB NOT NULL,
    "structuredCv" JSONB,
    "masterCvFileUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_matches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalJobId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rawAdText" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION,
    "status" "JobMatchStatus" NOT NULL DEFAULT 'FORESLAGEN',
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" TEXT NOT NULL,
    "jobMatchId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_guides" (
    "id" TEXT NOT NULL,
    "jobMatchId" TEXT NOT NULL,
    "invitationText" TEXT NOT NULL,
    "guideContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_guides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "job_matches_userId_externalJobId_key" ON "job_matches"("userId", "externalJobId");

-- CreateIndex
CREATE UNIQUE INDEX "interview_guides_jobMatchId_key" ON "interview_guides"("jobMatchId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_jobMatchId_fkey" FOREIGN KEY ("jobMatchId") REFERENCES "job_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_guides" ADD CONSTRAINT "interview_guides_jobMatchId_fkey" FOREIGN KEY ("jobMatchId") REFERENCES "job_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
