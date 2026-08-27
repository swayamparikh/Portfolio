-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('guest', 'host', 'admin');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('entire_place', 'private_room', 'shared_room');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "RevieweeType" AS ENUM ('listing', 'guest');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'paid', 'failed');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'guest',
    "profile_photo_url" TEXT,
    "password_hash" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "stripe_account_id" TEXT,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "property_type" "PropertyType",
    "address" TEXT,
    "location" geography(Point, 4326),
    "base_price_per_night" DECIMAL(10,2) NOT NULL,
    "cleaning_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "max_guests" INTEGER,
    "bedrooms" INTEGER,
    "beds" INTEGER,
    "bathrooms" INTEGER,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instant_book" BOOLEAN NOT NULL DEFAULT false,
    "status" "ListingStatus" NOT NULL DEFAULT 'pending',
    "ai_generated_description" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_photos" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "custom_price" DECIMAL(10,2),
    "ai_suggested_price" DECIMAL(10,2),

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "guests_count" INTEGER,
    "total_price" DECIMAL(10,2) NOT NULL,
    "platform_commission" DECIMAL(10,2) NOT NULL,
    "host_payout" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "stripe_payment_intent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "listing_id" TEXT,
    "reviewee_type" "RevieweeType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "ai_summary_included" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "ai_drafted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "stripe_transfer_id" TEXT,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "availability_listing_id_date_key" ON "availability"("listing_id", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
