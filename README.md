# Odiya Store - Facebook-Like Marketplace

A complete, production-ready Facebook-like marketplace application built with Next.js and Node.js/Express for buying and selling items in Nigeria.

## Features

### For Buyers
- Browse items with infinite scroll
- Search and filter by category
- View detailed item information with seller details
- Contact sellers without needing to login
- Mobile-first responsive design

### For Sellers
- Create seller account with business details
- Upload items with images (₦500 per item upload fee)
- Manage active and sold items
- Receive and respond to buyer messages
- View shop statistics

### For Admins
- Approve/reject pending items
- Manage all users
- Suspend problematic sellers/buyers
- View platform statistics
- Delete inappropriate content

### Platform Features
- Secure authentication with JWT
- Role-based access control (Buyer, Seller, Admin)
- 10 product categories (Cars, Phones, Electronics, Furniture, etc.)
- Real-time message system between buyers and sellers
- Item status tracking (pending, approved, sold, rejected)
- User suspension system
- Mobile-optimized UI

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context API with localStorage
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for cross-origin requests

## Project Structure

\`\`\`
odiya-store/
├── frontend/                 # Next.js Application
│   ├── app/
│   │   ├── page.tsx         # Home page
│   │   ├── login/
│   │   ├── dashboard/       # User dashboard
│   │   ├── admin/           # Admin panel
│   │   ├── upload-item/
│   │   ├── item/[id]/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── terms/
│   │   └── privacy/
│   ├── components/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── item-card.tsx
│   │   └── pages/
│   ├── lib/
│   │   └── auth-context.tsx
│   ├── package.json
│   └── .env.local
│
└── backend/                  # Express.js API
    ├── models/               # MongoDB schemas
    │   ├── User.js
    │   ├── Item.js
    │   ├── Message.js
    │   └── Payment.js
    ├── routes/               # API endpoints
    │   ├── auth.js
    │   ├── items.js
    │   ├── users.js
    │   ├── admin.js
    │   ├── messages.js
    │   └── payments.js
    ├── middleware/
    │   └── auth.js
    ├── server.js
    ├── package.json
    └── .env
\`\`\`

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Backend Setup

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and other configurations
npm run dev
\`\`\`

Backend will run on `http://localhost:5000`

### Frontend Setup

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend will run on `http://localhost:3000`

## Configuration

### Backend `.env`

\`\`\`env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/odiya-store
JWT_SECRET=your_very_secure_random_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
UPLOAD_FEE=500
PAYMENT_ACCOUNT_NUMBER=2252184000
PAYMENT_ACCOUNT_NAME=Odiya Store
PAYMENT_BANK_NAME=Your Bank
\`\`\`

### Frontend `.env.local`

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

## Usage

### Create Test Accounts

1. **Regular User**: Register at `/login` with any email and password
2. **Become Seller**: Click "Become a Seller" in navbar and fill business details
3. **Admin**: Create manually in MongoDB with `isAdmin: true`

### Upload an Item (as Seller)

1. Login as seller
2. Go to Dashboard → Upload Item
3. Fill item details, add images
4. Pay ₦500 upload fee
5. Admin approves the item
6. Item appears on marketplace

### Browse Items

1. Visit home page
2. Search by keyword or filter by category
3. Click item to view details
4. Click "Contact Seller" to message seller

### Admin Panel

1. Login with admin account
2. Navigate to Admin section
3. View pending items, users, and statistics
4. Approve/reject items or suspend users

## API Endpoints

See `API_DOCUMENTATION.md` for complete API reference.

### Key Endpoints

\`\`\`
Auth: POST /api/auth/register, POST /api/auth/login
Items: GET/POST/PUT/DELETE /api/items
Users: GET/PUT /api/users/profile, PUT /api/users/become-seller
Admin: GET /api/admin/stats, PUT /api/admin/items/:id/approve
Messages: POST /api/messages, GET /api/messages/seller/:id
\`\`\`

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions for:
- Vercel + Railway
- Self-hosted server
- Docker deployment

Quick deployment options:
- Frontend: Vercel, Netlify, AWS Amplify
- Backend: Railway, Render, Heroku, AWS, DigitalOcean
- Database: MongoDB Atlas (recommended)

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: HTTPS enforcement
- ⚠️ TODO: Database encryption

## Performance

- Infinite scroll pagination (20 items per page)
- Optimized image handling
- Database indexing on key fields
- Client-side state caching with localStorage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Mobile Optimization

- Mobile-first responsive design
- Touch-friendly UI
- Optimized for 4G/5G networks
- Progressive Web App ready

## Future Enhancements

- [ ] Real payment integration (Paystack, Flutterwave)
- [ ] Image uploads to cloud storage (AWS S3, Cloudinary)
- [ ] Email notifications
- [ ] User ratings and reviews
- [ ] Item wishlist
- [ ] In-app messaging with real-time updates
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Item recommendations
- [ ] Admin analytics dashboard

## Troubleshooting

**Backend won't connect to MongoDB**
- Verify MONGODB_URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure MongoDB credentials are correct

**Images not uploading**
- Check file size limits
- Verify browser console for errors
- Check backend logs

**API 401 errors**
- Verify JWT token is being sent
- Check token expiration
- Re-login if needed

**Slow performance**
- Check MongoDB indexes
- Monitor API response times
- Reduce page size in infinite scroll

## License

MIT License - feel free to use this project for personal or commercial purposes

## Support

- Email: support@odiyastore.com
- Documentation: See DEPLOYMENT_GUIDE.md, API_DOCUMENTATION.md, QUICK_START.md

## Contributing

Contributions welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for Nigerian entrepreneurs**

Ready to deploy? Check out `DEPLOYMENT_GUIDE.md` for detailed instructions!
