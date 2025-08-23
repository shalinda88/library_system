# Library Management System

A full-stack MERN application for managing library resources, borrowings, users, and notifications.

## Deployment Instructions for Render

This project is configured for deployment on [Render](https://render.com) using the `render.yaml` Blueprint for automatic setup.

### Prerequisites

1. Create a Render account at [render.com](https://render.com)
2. Have your MongoDB connection string ready (from MongoDB Atlas or another provider)
3. Fork or own this repository on GitHub

### Deployment Steps

#### Option 1: One-Click Deployment (Recommended)

1. Log in to your Render account
2. Go to the Dashboard and click "New +"
3. Select "Blueprint" from the dropdown menu
4. Connect your GitHub account if not already connected
5. Select this repository
6. Render will automatically detect the `render.yaml` configuration
7. Set the required environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret for JWT token signing
8. Click "Apply" to start the deployment

#### Option 2: Manual Deployment

If you prefer to deploy the services separately:

##### Backend Service

1. In Render dashboard, click "New +" and select "Web Service"
2. Connect your GitHub repository
3. Use the following settings:
   - Name: `library-system-backend`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `NODE_ENV`: production
     - `PORT`: 10000
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A strong secret for JWT token signing
     - `CLIENT_URL`: URL of your frontend (after it's deployed)
     - `SOCKET_CORS_ORIGIN`: Same as CLIENT_URL

##### Frontend Service

1. In Render dashboard, click "New +" and select "Static Site"
2. Connect your GitHub repository
3. Use the following settings:
   - Name: `library-system-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     - `NODE_VERSION`: 18
     - `VITE_API_URL`: URL of your backend API (e.g., https://library-system-backend.onrender.com/api)

### Post-Deployment

1. After both services are deployed, update the `CLIENT_URL` and `SOCKET_CORS_ORIGIN` environment variables in the backend service to match the frontend URL
2. Update the `VITE_API_URL` environment variable in the frontend service to match the backend API URL

## Local Development

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both the backend and frontend directories based on the example files
   - For the backend, you'll need a MongoDB URI and JWT secret
   - For the frontend, set `VITE_API_URL` to point to your local backend

4. Start the development servers:
   ```bash
   # Start the backend server
   cd backend
   npm run dev

   # In another terminal, start the frontend server
   cd frontend
   npm run dev
   ```

5. Access the application:
   - Backend: http://localhost:10000
   - Frontend: http://localhost:5173

## Features

- User authentication and authorization
- Book management
- Borrowing management
- Real-time notifications
- Responsive UI
- Role-based access control (Admin, Librarian, User)
- Search and filtering capabilities
- Dashboard with statistics

## Technologies Used

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - TailwindCSS
  - Socket.io Client

- **Backend:**
  - Node.js
  - Express
  - TypeScript
  - MongoDB with Mongoose
  - Socket.io
  - JWT Authentication
