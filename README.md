# Social Network API

A Node.js + Express.js backend API for a social networking platform.
This project showcases REST API design, authentication, and database integration.

## Features

🔐 Authentication & Authorization (JWT-based)
👤 User Profiles (create, update, delete)
📝 Posts (CRUD operations)
💬 Comments (add, update, delete)
👍 Likes / Unlikes
🛡️ Ownership Middleware for secure actions

## Tech Stack

 * Node.js + Express.js
 * Prisma ORM
 * SQLite
 * JWT for authentication
 * bcrypt for password hashing

## Getting Started

1️⃣ Clone the repository
git clone https://github.com/your-username/social-network-api.git
cd social-network-api

2️⃣ Install dependencies
npm install

3️⃣ Set up environment variables
Create a .env file in the root with:
DATABASE_URL="your_database_url"
JWT_SECRET="your_jwt_secret"

4️⃣ Run the app
npm run dev

## API Endpoints

### Auth
 * POST /auth/register → Register new user
 * POST /auth/login → Login & get token

### Users
 * GET /users/:id → Get user profile
 * PUT /users/:id → Update profile (owner only)
 * DELETE /users/:id → Delete profile (owner only)

### Posts
 * GET /posts → Get all posts
 * GET /posts/:id → Get post by ID
 * POST /posts → Create post
 * PUT /posts/:id → Update post (owner only)
 * DELETE /posts/:id → Delete post (owner only)

### Comments
 * POST /posts/:id/comments → Add comment
 * DELETE /posts/:id/comments/:commentId → Delete comment (owner only)

# Example Request

POST /auth/register
Content-Type: application/json
{
  "name": "John Doe",
  "username": "johndoe",
  "password": "mypassword123"
}

Response:
{
  "id": "user123",
  "username": "johndoe",
  "token": "jwt.token.here"
}

## License
This project is open-source and available under the MIT License.
