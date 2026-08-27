"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Rating } from "@/components/ui/Rating";
import { InstantBookBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export interface ListingCardData {
  id: string;
  title: string;
  address: string | null;
  basePricePerNight: number;
  photoUrl: string | null;
  instantBook: boolean;
  rating: number;
  reviewCount: number;
}

export function ListingCard({ listing, index = 0 }: { listing: ListingCardData; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4), ease: "easeOut" }}
    >
      <Link href={`/listing/${listing.id}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
          {listing.photoUrl ? (
            <Image
              src={listing.photoUrl}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              No photo yet
            </div>
          )}
          <button
            aria-label="Save to wishlist"
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-coral-to backdrop-blur transition-transform hover:scale-110"
          >
            <Heart className="h-4 w-4" />
          </button>
          {listing.instantBook && (
            <div className="absolute left-3 top-3">
              <InstantBookBadge />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-heading text-sm font-semibold text-text-heading">
            {listing.title}
          </h3>
          <Rating value={listing.rating} count={listing.reviewCount} />
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-text-muted">
          {listing.address ?? "Location available after booking"}
        </p>
        <p className="mt-1 text-sm">
          <span className="font-heading font-semibold text-text-heading">
            {formatPrice(listing.basePricePerNight)}
          </span>{" "}
          <span className="text-text-muted">/ night</span>
        </p>
      </Link>
    </motion.div>
  );
}
