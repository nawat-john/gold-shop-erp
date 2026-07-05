-- CreateTable
CREATE TABLE "document_sequences" (
    "key" TEXT NOT NULL,
    "next_number" BIGINT NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("key")
);
