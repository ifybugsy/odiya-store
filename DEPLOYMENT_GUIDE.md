# Odiya Store - Complete Deployment Guide

## Project Structure

\`\`\`
odiya-store/
├── frontend/                 # Next.js App Router Frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   ├── .env.local
│   └── next.config.mjs
│
└── backend/                  # Node.js/Express Backend
    ├── models/
    ├── routes/
    ├── middleware/
    ├── server.js
    ├── package.json
    ├── .env
    └── .env.example
\`\`\`

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git
- A hosting provider (Vercel, Railway, Render, or custom server)

## Backend Setup

### 1. Install Dependencies

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Configure Environment Variables

\`\`\`bash
cp .env.example .env
\`\`\`

Update `.env` with your values:

\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/odiya-store
JWT_SECRET=your_very_secure_random_secret_key_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
UPLOAD_FEE=500
PAYMENT_ACCOUNT_NUMBER=2252184000
PAYMENT_ACCOUNT_NAME=Odiya Store
PAYMENT_BANK_NAME=Your Bank Name
\`\`\`

### 3. Test Backend Locally

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:5000/api/health` to verify it's working.

## Frontend Setup

### 1. Install Dependencies

\`\`\`bash
cd frontend
npm install
\`\`\`

### 2. Configure Environment Variables

Create `.env.local`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

For production:

\`\`\`env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
\`\`\`

### 3. Test Frontend Locally

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the app.

## Deployment Options

### Option 1: Deploy to Vercel (Frontend) + Railway/Render (Backend)

#### Frontend on Vercel

1. Push your frontend folder to GitHub
2. Go to vercel.com and connect your repo
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api`
4. Deploy

#### Backend on Railway

1. Push backend folder to GitHub
2. Go to railway.app and create new project
3. Connect GitHub repo
4. Add MongoDB connection (Railway offers free MongoDB)
5. Set environment variables in Railway dashboard
6. Deploy

### Option 2: Deploy Both to Your Own Server

#### Prerequisites

- Ubuntu/Linux server with SSH access
- Nginx or Apache
- PM2 for Node.js process management

#### Backend Deployment

\`\`\`bash
# SSH into server
ssh root@your_server_ip

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone your-repo-url
cd odiya-store/backend

# Install dependencies
npm install --production

# Install PM2 globally
sudo npm install -g pm2

# Create .env file
nano .env
# Paste your production environment variables

# Start with PM2
pm2 start server.js --name "odiya-store-api"
pm2 startup
pm2 save

# Check status
pm2 status
\`\`\`

#### Configure Nginx for Backend

\`\`\`bash
sudo nano /etc/nginx/sites-available/odiya-store-api
\`\`\`

\`\`\`nginx
server {
    listen 80;
    server_name api.odiyastore.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

\`\`\`bash
# Enable site
sudo ln -s /etc/nginx/sites-available/odiya-store-api /etc/nginx/sites-enabled/

# Test nginx
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.odiyastore.com
\`\`\`

#### Frontend Deployment (Next.js)

\`\`\`bash
# On server
git clone your-repo-url
cd odiya-store/frontend

# Create .env.local
echo "NEXT_PUBLIC_API_URL=https://api.odiyastore.com/api" > .env.local

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start "npm start" --name "odiya-store-web"

# Or use a process manager with auto-restart
\`\`\`

#### Configure Nginx for Frontend

\`\`\`bash
sudo nano /etc/nginx/sites-available/odiya-store-web
\`\`\`

\`\`\`nginx
server {
    listen 80;
    server_name odiyastore.com www.odiyastore.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

### Option 3: Docker Deployment

#### Create Docker Compose Setup

`docker-compose.yml`:

\`\`\`yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: odiya-mongo
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: odiya-backend
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/odiya-store
      JWT_SECRET: your_secret_key
      PORT: 5000
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    container_name: odiya-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongo-data:
\`\`\`

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
\`\`\`

## Database Setup

### MongoDB Atlas (Recommended for Beginners)

1. Go to mongodb.com/atlas
2. Create free account
3. Create a cluster
4. Whitelist IP address
5. Create database user
6. Get connection string
7. Update `MONGODB_URI` in backend `.env`

### Local MongoDB

\`\`\`bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb

# Connect
mongosh
\`\`\`

## Important Configuration Notes

### Image Uploads

Currently, images are stored as Base64 in the database. For production:

1. **Use Vercel Blob** (if on Vercel):
\`\`\`bash
npm install @vercel/blob
\`\`\`

2. **Use AWS S3, Cloudinary, or similar**:
   - Update `handleImageUpload` in `app/upload-item/page.tsx`
   - Use API endpoints to upload to cloud storage
   - Store URLs in database instead of Base64

### Email System

To send emails for notifications:

\`\`\`bash
npm install nodemailer
\`\`\`

Add email routes in backend for:
- Seller notifications
- Buyer notifications
- Admin alerts

### Payment Integration

Replace the manual bank transfer system with:
- **Paystack**: `npm install paystack`
- **Flutterwave**: `npm install flutterwave-react-v3`
- **Stripe**: `npm install stripe`

## Security Checklist

- [ ] Change JWT_SECRET to a strong, random value
- [ ] Enable HTTPS on both frontend and backend
- [ ] Set CORS properly for your domain
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Set rate limiting on API endpoints
- [ ] Implement input validation and sanitization
- [ ] Regular security audits
- [ ] Backup database regularly
- [ ] Monitor server logs for suspicious activity

## Performance Optimization

1. **Frontend**:
   - Enable Image Optimization
   - Implement caching strategies
   - Code splitting

2. **Backend**:
   - Add database indexes on frequently queried fields
   - Implement caching (Redis)
   - Optimize database queries

3. **Database**:
   - Regular maintenance
   - Indexes on searchable fields
   - Archive old data

## Monitoring & Maintenance

### Server Monitoring

\`\`\`bash
# Check disk space
df -h

# Check memory usage
free -h

# Check processes
pm2 status

# View logs
pm2 logs
\`\`\`

### Database Monitoring

\`\`\`bash
# Connect to MongoDB
mongosh

# View database stats
db.stats()

# Check indexes
db.items.getIndexes()
\`\`\`

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify Node.js is installed
- Check port 5000 is not in use
- Review error logs: `pm2 logs odiya-store-api`

### Frontend shows 404
- Verify backend URL is correct
- Check CORS settings
- Verify API endpoints match backend routes

### Images not uploading
- Check file size limits in Express
- Verify browser console for errors
- Check backend logs

### Slow performance
- Check MongoDB indexes
- Reduce page size in infinite scroll
- Implement caching
- Optimize database queries

## Support & Updates

For questions or issues:
- Email: support@odiyastore.com
- Check documentation
- Review backend logs
- Verify environment variables

## Next Steps

1. Deploy backend first
2. Test all API endpoints
3. Deploy frontend
4. Test complete flow (login → upload → view)
5. Monitor for errors
6. Scale based on usage

Good luck with your Odiya Store deployment!
