# Quick Start Guide

## Local Development (5 minutes)

### Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URL
npm run dev
\`\`\`

Backend runs on `http://localhost:5000`

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend runs on `http://localhost:3000`

## Default Test Accounts

### Regular User
- Email: `buyer@test.com`
- Password: `test123`

### Seller Account
- Email: `seller@test.com`
- Password: `test123`
- Has permission to upload items

### Admin Account
- Email: `admin@test.com`
- Password: `test123`
- Can approve items and manage users

## Key Features

1. **Browse Items**: Visit homepage, scroll infinitely through items
2. **Search**: Use search bar and category filters
3. **Contact Seller**: Click any item to view details and message seller
4. **Become Seller**: 
   - Click "Become a Seller" in navbar
   - Fill business details
   - Pay ₦500 per item upload
5. **Upload Items**: 
   - Go to dashboard
   - Click "Upload Item"
   - Add images, details, price
   - Submit for admin approval
6. **Admin Panel**:
   - View pending items
   - Approve or reject
   - Manage users
   - View statistics

## API Endpoints Summary

\`\`\`
POST   /api/auth/register
POST   /api/auth/login

GET    /api/items
GET    /api/items?category=Cars
GET    /api/items/:id
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
PUT    /api/items/:id/sold

PUT    /api/users/become-seller
GET    /api/users/profile
PUT    /api/users/profile

POST   /api/messages
GET    /api/messages/seller/:sellerId
PUT    /api/messages/:id/respond

GET    /api/admin/stats
GET    /api/admin/pending-items
PUT    /api/admin/items/:id/approve
GET    /api/admin/users
PUT    /api/admin/users/:id/suspend
\`\`\`

## Useful Commands

\`\`\`bash
# Frontend development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Backend development
npm run dev          # Start dev server with nodemon
npm start            # Start production server

# Database
mongosh              # Connect to MongoDB
db.items.find()      # View all items
db.users.find()      # View all users
\`\`\`

Happy selling!
