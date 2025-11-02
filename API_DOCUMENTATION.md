# Odiya Store API Documentation

## Authentication

All protected endpoints require:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Endpoints

### Auth

#### Register
\`\`\`
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "securepassword"
}

Response:
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": { ... }
}
\`\`\`

#### Login
\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": { ... }
}
\`\`\`

### Items

#### Get All Items (Public)
\`\`\`
GET /api/items?page=1&category=Cars&search=phone

Response:
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pages": 5
}
\`\`\`

#### Get Single Item (Public)
\`\`\`
GET /api/items/:id

Response:
{
  "_id": "...",
  "title": "Samsung Galaxy S23",
  "price": 450000,
  "category": "Phones",
  "views": 42,
  "sellerId": { ... },
  ...
}
\`\`\`

#### Create Item (Seller Only)
\`\`\`
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "iPhone 14 Pro",
  "description": "Excellent condition",
  "category": "Phones",
  "price": 550000,
  "images": ["data:image/..."],
  "location": "Lagos",
  "condition": "Like New"
}

Response:
{
  "message": "Item created successfully",
  "item": { ... }
}
\`\`\`

#### Update Item (Seller Only)
\`\`\`
PUT /api/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New title",
  "price": 500000
}
\`\`\`

#### Delete Item
\`\`\`
DELETE /api/items/:id
Authorization: Bearer <token>
\`\`\`

#### Mark as Sold
\`\`\`
PUT /api/items/:id/sold
Authorization: Bearer <token>
\`\`\`

### Users

#### Get Profile
\`\`\`
GET /api/users/profile
Authorization: Bearer <token>

Response:
{
  "_id": "...",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "isSeller": false,
  ...
}
\`\`\`

#### Update Profile
\`\`\`
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "city": "Lagos",
  "state": "Lagos"
}
\`\`\`

#### Become Seller
\`\`\`
PUT /api/users/become-seller
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessName": "John's Electronics",
  "businessDescription": "Selling quality electronics",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "John Doe",
  "bankName": "First Bank"
}
\`\`\`

### Messages

#### Send Message
\`\`\`
POST /api/messages
Content-Type: application/json

{
  "itemId": "...",
  "senderName": "Jane",
  "senderPhone": "+2348098765432",
  "senderEmail": "jane@example.com",
  "message": "Is this item still available?"
}
\`\`\`

#### Get Seller Messages
\`\`\`
GET /api/messages/seller/:sellerId
Authorization: Bearer <token>

Response: [
  {
    "_id": "...",
    "itemId": { "title": "..." },
    "senderName": "Jane",
    "message": "...",
    "sellerResponse": null
  }
]
\`\`\`

#### Respond to Message
\`\`\`
PUT /api/messages/:messageId/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "Yes, still available. Available for viewing tomorrow."
}
\`\`\`

### Admin

#### Get Statistics
\`\`\`
GET /api/admin/stats
Authorization: Bearer <admin_token>

Response:
{
  "totalUsers": 150,
  "totalSellers": 45,
  "totalItems": 320,
  "pendingItems": 12
}
\`\`\`

#### Get Pending Items
\`\`\`
GET /api/admin/pending-items
Authorization: Bearer <admin_token>

Response: [...]
\`\`\`

#### Approve Item
\`\`\`
PUT /api/admin/items/:id/approve
Authorization: Bearer <admin_token>
\`\`\`

#### Reject Item
\`\`\`
PUT /api/admin/items/:id/reject
Authorization: Bearer <admin_token>
\`\`\`

#### Delete Item
\`\`\`
DELETE /api/admin/items/:id
Authorization: Bearer <admin_token>
\`\`\`

#### Get All Users
\`\`\`
GET /api/admin/users
Authorization: Bearer <admin_token>

Response: [...]
\`\`\`

#### Suspend User
\`\`\`
PUT /api/admin/users/:id/suspend
Authorization: Bearer <admin_token>
\`\`\`

#### Unsuspend User
\`\`\`
PUT /api/admin/users/:id/unsuspend
Authorization: Bearer <admin_token>
\`\`\`

## Error Responses

\`\`\`
400 Bad Request
{
  "error": "Validation error message"
}

401 Unauthorized
{
  "error": "Access token required"
}

403 Forbidden
{
  "error": "Unauthorized access"
}

404 Not Found
{
  "error": "Resource not found"
}

500 Internal Server Error
{
  "error": "Internal server error"
}
\`\`\`

## Rate Limiting

No rate limiting currently implemented. Add this in production using Express rate limiter.

## CORS

Configured to allow requests from `FRONTEND_URL` environment variable.

## Pagination

Items endpoint supports pagination:
- `page`: Page number (default: 1)
- Results per page: 20 items
- Use `pages` field in response to know total pages
