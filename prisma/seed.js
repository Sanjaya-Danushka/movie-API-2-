import "dotenv/config";
import { getPrismaClient } from "../src/config/db.js";

const main = async () => {
  const prisma = await getPrismaClient();

  console.log("seeding movies");

  const userId = "a42343f4-89b1-4e13-bd8c-6c73074fc406";

  const movies = [
    {
      title: "Inception",
      overview:
        "A skilled thief is given a chance at redemption if he can successfully perform inception.",
      releaseYear: 2010,
      genres: ["Sci-Fi", "Action", "Thriller"],
      runtime: 148,
      posteUrl: "https://example.com/inception.jpg",
      createdBy: userId,
    },
    {
      title: "The Dark Knight",
      overview: "Batman faces the Joker in Gotham City.",
      releaseYear: 2008,
      genres: ["Action", "Crime", "Drama"],
      runtime: 152,
      posteUrl: "https://example.com/darkknight.jpg",
      createdBy: userId,
    },
    {
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space.",
      releaseYear: 2014,
      genres: ["Sci-Fi", "Adventure", "Drama"],
      runtime: 169,
      posteUrl: "https://example.com/interstellar.jpg",
      createdBy: userId,
    },
    {
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over years.",
      releaseYear: 1994,
      genres: ["Drama"],
      runtime: 142,
      posteUrl: "https://example.com/shawshank.jpg",
      createdBy: userId,
    },
    {
      title: "Avengers: Endgame",
      overview: "The Avengers assemble once more to reverse Thanos' actions.",
      releaseYear: 2019,
      genres: ["Action", "Adventure", "Sci-Fi"],
      runtime: 181,
      posteUrl: "https://example.com/endgame.jpg",
      createdBy: userId,
    },
  ];

  for (const movie of movies) {
    await prisma.movie.create({
      data: movie,
    });
    console.log(`created ${movie.title}`);
  }

  console.log("seeding complete");
  await prisma.$disconnect();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
