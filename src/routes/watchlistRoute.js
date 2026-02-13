import express from "express";
import {
  addToWatchlist,
  deleteFromWatchlist,
  updateWatchlist,
} from "../controllers/watchlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { addToWatchlistSchema } from "../validators/watchlistValidators.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validateRequest(addToWatchlistSchema), addToWatchlist);
// router.post("/login", login);
// router.post("/logout", logout);

router.put("/:id", updateWatchlist);
router.delete("/:id", deleteFromWatchlist);

export default router;
