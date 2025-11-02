# Odiya Store Backend API

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update with your settings:
\`\`\`bash
cp .env.example .env
\`\`\`

### 3. Start MongoDB
Ensure MongoDB is running on your system (or update MONGODB_URI in .env for remote database)

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### 5. Run Production Server
\`\`\`bash
npm start
\`\`\`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Items
- GET `/api/items` - Get all approved items (paginated)
- GET `/api/items?category=Cars` - Filter by category
- GET `/api/items?search=phone` - Search items
- GET `/api/items/:id` - Get single item
- POST `/api/items` - Create item (seller only)
- PUT `/api/items/:id` - Update item
- DELETE `/api/items/:id` - Delete item
- PUT `/api/items/:id/sold` - Mark as sold

### Admin
- GET `/api/admin/pending-items` - Get pending items
- PUT `/api/admin/items/:id/approve` - Approve item
- PUT `/api/admin/items/:id/reject` - Reject item
- DELETE `/api/admin/items/:id` - Delete item
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id/suspend` - Suspend user
- GET `/api/admin/stats` - Get dashboard stats

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update profile
- PUT `/api/users/become-seller` - Become a seller
- GET `/api/users/my-items` - Get user's items

### Messages
- POST `/api/messages` - Send message to seller
- GET `/api/messages/seller/:sellerId` - Get seller messages
- PUT `/api/messages/:messageId/respond` - Respond to message

### Payments
- POST `/api/payments/create` - Create payment record
- POST `/api/payments/verify/:paymentId` - Verify payment

## Deployment

### Deploy to Heroku
\`\`\`bash
heroku create odiya-store-backend
heroku addons:create mongolab:sandbox
git push heroku main
\`\`\`

### Deploy to Railway/Render
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### Deploy to Your Host
1. Upload files to server
2. Run `npm install`
3. Update `.env` with production values
4. Use PM2 for process management: `pm2 start server.js --name "odiya-store"`
