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
      posterUrl: "https://example.com/inception.jpg",
      createdBy: userId,
    },
    {
      title: "The Dark Knight",
      overview: "Batman faces the Joker in Gotham City.",
      releaseYear: 2008,
      genres: ["Action", "Crime", "Drama"],
      runtime: 152,
      posterUrl: "https://example.com/darkknight.jpg",
      createdBy: userId,
    },
    {
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space.",
      releaseYear: 2014,
      genres: ["Sci-Fi", "Adventure", "Drama"],
      runtime: 169,
      posterUrl: "https://example.com/interstellar.jpg",
      createdBy: userId,
    },
    {
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over years.",
      releaseYear: 1994,
      genres: ["Drama"],
      runtime: 142,
      posterUrl: "https://example.com/shawshank.jpg",
      createdBy: userId,
    },
    {
      title: "Avengers: Endgame",
      overview: "The Avengers assemble once more to reverse Thanos' actions.",
      releaseYear: 2019,
      genres: ["Action", "Adventure", "Sci-Fi"],
      runtime: 181,
      posterUrl: "https://example.com/endgame.jpg",
      createdBy: userId,
    },
    {
      title: "Pulp Fiction",
      overview: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      releaseYear: 1994,
      genres: ["Crime", "Drama"],
      runtime: 154,
      posterUrl: "https://example.com/pulpfiction.jpg",
      createdBy: userId,
    },
    {
      title: "Forrest Gump",
      overview: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
      releaseYear: 1994,
      genres: ["Drama", "Romance"],
      runtime: 142,
      posterUrl: "https://example.com/forrestgump.jpg",
      createdBy: userId,
    },
    {
      title: "The Matrix",
      overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
      releaseYear: 1999,
      genres: ["Action", "Sci-Fi"],
      runtime: 136,
      posterUrl: "https://example.com/matrix.jpg",
      createdBy: userId,
    },
    {
      title: "Lord of the Rings: The Fellowship of the Ring",
      overview: "A young hobbit, Frodo Baggins, inherits a magic ring and embarks on an epic quest to destroy it and save Middle-earth from the Dark Lord Sauron.",
      releaseYear: 2001,
      genres: ["Adventure", "Fantasy"],
      runtime: 178,
      posterUrl: "https://example.com/lotr1.jpg",
      createdBy: userId,
    },
    {
      title: "Parasite",
      overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
      releaseYear: 2019,
      genres: ["Comedy", "Drama", "Thriller"],
      runtime: 132,
      posterUrl: "https://example.com/parasite.jpg",
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
