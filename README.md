# Movie API

This is a RESTful API for managing a movie watchlist. Users can register, login, and manage their watchlist by adding, updating, and deleting movies.

## Features

- User authentication (registration, login, logout) with JWT.
- Browse a list of movies.
- Manage a personal watchlist of movies.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (can be hosted on [Neon](https://console.neon.tech/))
- **ORM:** Prisma

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or later)
- [npm](https://www.npmjs.com/)
- A PostgreSQL database. You can create a free one at [Neon](https://console.neon.tech/).

### Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:

    ```bash
    cd backend
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of the project and add the following environment variables. You can use the `.env.example` file as a template.

```
DATABASE_URL="your-postgresql-connection-string"
PORT=5001
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
JWT_COOKIE_EXPIRES_IN="7"
```

- `DATABASE_URL`: The connection string for your PostgreSQL database. If you are using Neon, you can find this in your Neon project dashboard.
- `PORT`: The port the server will run on.
- `JWT_SECRET`: A secret key for signing JWTs.
- `JWT_EXPIRES_IN`: The expiration time for JWTs (e.g., "7d", "24h").
- `JWT_COOKIE_EXPIRES_IN`: The expiration time for the JWT cookie in days.

### Database Migration

Run the following command to apply the database migrations:

```bash
npx prisma migrate dev
```

### Seed the Database

Run the following command to seed the database with some initial movie data:

```bash
npx prisma db seed
```

### Running the Application

To start the server, run the following command:

```bash
npm start
```

The server will be running on `http://localhost:5001`.

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user.
  - **Body:** `{ "name": "John Doe", "email": "john.doe@example.com", "password": "password123" }`
- `POST /auth/login` - Login a user.
  - **Body:** `{ "email": "john.doe@example.com", "password": "password123" }`
- `POST /auth/logout` - Logout a user.

### Movies

- `GET /movies` - Get a list of all movies.

### Watchlist

- `POST /watchlist` - Add a movie to the watchlist.
  - **Headers:** `Authorization: Bearer <jwt-token>`
  - **Body:** `{ "movieId": "movie-id", "status": "PLANNED|WATCHING|COMPLETED", "rating": 9 }`
- `DELETE /watchlist/:id` - Remove a movie from the watchlist.
  - **Headers:** `Authorization: Bearer <jwt-token>`
- `PUT /watchlist/:id` - Update a movie in the watchlist.
  - **Headers:** `Authorization: Bearer <jwt-token>`
  - **Body:** `{ "status": "COMPLETED", "rating": 10 }`

## Postman Collection

You can use the `movieApi-2.postman_collection.json` file to test the API with [Postman](https://www.postman.com/).
