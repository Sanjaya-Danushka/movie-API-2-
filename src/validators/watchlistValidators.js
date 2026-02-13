import { z } from "zod";

export const addToWatchlistSchema = z.object({
  movieId: z.string().uuid(),
  status: z
    .enum(["PLANNED", "WATCHING", "COMPLETED", "DROPPED"], {
      error: () => {
        message: "Status must be one of the following: PLANNED, WATCHING, COMPLETED, DROPPED";
      },
    })
    .optional(),

  rating: z.coerce
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(10, "Rating must be at most 10")
    .optional(),
  notes: z.string().optional(),
});
