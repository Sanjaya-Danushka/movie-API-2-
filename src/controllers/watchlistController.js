import { getPrismaClient } from "../config/db.js";

const addToWatchlist = async (req, res) => {
  const { movieId, status, rating, notes } = req.body;

  const prisma = await getPrismaClient();

  // verify movie exists
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  // check if already in watchlist
  const existInWatchlist = await prisma.watchlistItem.findFirst({
    where: { userId: req.user.id, movieId: movieId },
  });
  if (existInWatchlist) {
    return res.status(400).json({ error: "Movie already in watchlist" });
  }

  // add to watchlist
  const watchlistItem = await prisma.watchlistItem.create({
    data: {
      userId: req.user.id,
      movieId,
      status: status || "PLANNED",
      rating,
      notes,
    },
  });
  res.status(201).json({ status: "success", data: watchlistItem });
};

const deleteFromWatchlist = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming authMiddleware sets req.user.id
  
  const prisma = await getPrismaClient();

  // Find the watchlist item
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id },
  });

  if (!watchlistItem) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }

  // Check if the item belongs to the user
  if (watchlistItem.userId !== userId) {
    return res.status(403).json({ error: "Not authorized to delete this item" });
  }

  // Delete the watchlist item
  await prisma.watchlistItem.delete({
    where: { id },
  });

  res.status(200).json({ 
    status: "success", 
    message: "Item removed from watchlist" 
  });
};

export { addToWatchlist, deleteFromWatchlist };
