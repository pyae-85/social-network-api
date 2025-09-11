# Social Network API

A Node.js + Express.js backend API for a social networking platform.<br>
This project showcases REST API design, authentication, and database integration.

## Features

🔐 Authentication & Authorization (JWT-based)<br>
👤 User Profiles (create, update, delete)<br>
📝 Posts (CRUD operations)<br>
💬 Comments (add, update, delete)<br>
👍 Likes / Unlikes<br>
🛡️ Ownership Middleware for secure actions<br>

## Tech Stack

 * Node.js + Express.js
 * Prisma ORM
 * postgreSQL
 * JWT for authentication
 * bcrypt for password hashing

## Getting Started

1️⃣ Clone the repository<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;git clone https://github.com/your-username/social-network-api.git<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cd social-network-api

2️⃣ Install dependencies<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;npm install<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;npx prisma migrate dev --name init

3️⃣ Set up environment variables<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Create a .env file in the root with:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DATABASE_URL="your_database_url"<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JWT_SECRET="your_jwt_secret"

4️⃣ Run the app<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;npx nodemon index.js<br>

## API Endpoints

### Auth
 * POST /users/register → Register new user<br>
 * POST /users/login → Login & get token<br>
 * POST /users/verity → verify token

### Users
 * GET /users/:id → Get user profile<br>
 * PUT /users/:id → Update profile (owner only)<br>
 * DELETE /users/:id → Delete profile (owner only)

### Posts
 * GET /posts → List posts (paginated)<br>
 * GET /posts/:id → Get post details<br>
 * POST /posts → Create post<br>
 * PUT /posts/:id → Update post (owner only)<br>
 * DELETE /posts/:id → Delete post (owner only)<br>
 * POST /posts/:postId/like   → Like post<br>
 * DELETE /posts/:postId/like   → Unlike post

### Comments
 * POST /posts/:id/comments → Add comment<br>
 * PUT /posts/:postId/comments/:commentId → Update comment (ownership)
 * DELETE /posts/:id/comments/:commentId → Delete comment (owner only)

# Example Request

POST /users/login<br>
Content-Type: application/json<br>
{<br>
&nbsp;&nbsp;&nbsp;&nbsp;"username": "johndoe",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"password": "mypassword123"<br>
}

Response:<br>
{<br>
&nbsp;&nbsp;&nbsp;&nbsp;"success": true,<br>
&nbsp;&nbsp;&nbsp;&nbsp;"data": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"token": "jwt.token.here",<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"expiresAt": 1699999999999<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
}<br>
<br>
{<br>
&nbsp;&nbsp;&nbsp;&nbsp;"success": false,<br>
&nbsp;&nbsp;&nbsp;&nbsp;"message": "Incorrect username or password"<br>
}

## License
This project is open-source and available under the MIT License.
