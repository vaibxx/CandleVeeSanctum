# Vee Sanctum - Premium Candle E-commerce Platform

A complete e-commerce platform for selling premium candles online, featuring mood-based shopping and a modern user experience.

## Features

### 🕯️ Product Management
- **Mood-based categorization**: Relaxing, Energizing, Romantic
- **Product types**: Container candles, Pillars, Seasonal, Gift sets
- **Inventory tracking** with low-stock alerts
- **Rich product descriptions** with images and specifications

### 🛒 E-commerce Functionality
- **Shopping cart** with guest and user support
- **4-step checkout process**: Cart → Shipping → Payment → Confirmation
- **Multiple payment options**: Stripe, PayPal, Square
- **Guest checkout** option
- **Order tracking** and history

### 👤 User Experience
- **Responsive design** works on desktop, tablet, and mobile
- **User accounts** with order history and saved addresses
- **Wishlist functionality**
- **Product search** and filtering
- **Mood-based browsing**

### 🛠️ Admin Panel
- **Dashboard** with sales analytics
- **Product management**: Create, edit, delete products
- **Order management**: Status updates, tracking numbers
- **Inventory monitoring** with alerts
- **Customer management**

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **RESTful API** design
- **Multer** for file uploads
- **Bcrypt** for password hashing

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **React Query** for server state
- **Styled Components** for styling
- **Axios** for API calls
- **React Hook Form** for forms

### Development
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Nodemon** for development
- **ESLint** for code quality

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CandleVeeSanctum
   ```

2. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API on port 3001
   - Frontend app on port 3000

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/health

### Manual Setup (Alternative)

1. **Set up the database**
   ```bash
   # Start PostgreSQL
   createdb vee_sanctum

   # Run schema
   psql vee_sanctum < database/schema.sql
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vee_sanctum
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateways (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured/list` - Get featured products
- `GET /api/products/mood/:category` - Get products by mood
- `GET /api/products/search/query` - Search products

### Cart Endpoints
- `GET /api/cart` - Get cart contents
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:id` - Remove item from cart

### Order Endpoints
- `POST /api/checkout/process` - Process checkout
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

## Database Schema

### Products Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `mood_category` (ENUM: relaxing, energizing, romantic)
- `product_type` (ENUM: container, pillar, seasonal, gift_set)
- `size` (VARCHAR)
- `burn_time` (VARCHAR)
- `stock_quantity` (INTEGER)
- `image_url` (VARCHAR)
- `is_active` (BOOLEAN)

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `is_admin` (BOOLEAN)

### Orders Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `guest_email` (VARCHAR)
- `status` (ENUM: pending, processing, shipped, delivered, cancelled)
- `total_amount` (DECIMAL)
- `shipping_address` (JSONB)
- `billing_address` (JSONB)
- `payment_method` (VARCHAR)
- `payment_status` (VARCHAR)

## Project Structure

```
CandleVeeSanctum/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── Dockerfile
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API calls
│   │   └── styles/          # CSS files
│   ├── package.json
│   └── Dockerfile
├── database/                # Database setup
│   ├── schema.sql           # Database schema
│   └── seeds/               # Sample data
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please email support@veesanctum.com or open an issue on GitHub.

---

**Vee Sanctum** - Premium Candles for Everyday Moments 🕯️