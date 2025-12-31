# Street Lab Store

An e-commerce platform for clearance of one-size-fits-all outfits where people can order what they want and check out everything else. Built with React, Node.js, and MongoDB.

## Prerequisites

- Docker and Docker Compose installed

## Step-by-Step Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/EHB-MCT/wdm-rayanarssi.git

```

### 2. Configure Environment Variables

Before starting the application, you need to set up the environment configuration file:

```bash
cp .env.template .env
```

This command creates a copy of the environment template file. The `.env` file contains essential configuration variables for the application, including:
- Backend port settings
- MongoDB database connection string
- JWT secret key for authentication
- Frontend API URL

### 3. Start the Application with Docker

```bash
docker compose up --build
```

This command will:

- Build and start all containers (frontend, backend, MongoDB)
- Set up the database automatically
- Start the development servers with hot reload

### 3. Verify the Application is Running

Wait for the containers to start completely. You should see output indicating all services are running.

### 4. Access the Application

**For Local Access (from the same computer):**
Open your web browser and navigate to:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Mongo Express**: http://localhost:8081

**For Teacher/Remote Access (from different computers):**
To allow teachers or others to access your application from their own computers:

1. **Find your local IP address:**
   - Windows: Open Command Prompt and run `ipconfig`
   - Mac/Linux: Open Terminal and run `ifconfig` or `ip addr`
   - Look for your Wi-Fi/Ethernet IP (usually starts with 192.168.x.x)

2. **Access using your IP address:**
   Replace `YOUR_IP_ADDRESS` with your actual IP address in these URLs:
   
   - **Frontend Application**: http://YOUR_IP_ADDRESS:5173
   - **Backend API**: http://YOUR_IP_ADDRESS:3000
   - **Mongo Express**: http://YOUR_IP_ADDRESS:8081

   Example (if your IP is 192.168.1.100):
   - http://192.168.1.100:5173

3. **For Teachers viewing products:**
   The products are already loaded in the database. Teachers can view them by accessing:
   - Frontend: http://YOUR_IP_ADDRESS:5173
   - Direct API check: http://YOUR_IP_ADDRESS:3000/products

## Testing the Application

### Normal User Flow

1. Go to http://localhost:5173
2. Browse the streetwear products on the home page
3. Register for an account or login
4. View product details and add items to cart
5. Proceed to checkout
6. Manage your profile

### Admin Access Flow

1. Go to http://localhost:5173
2. Navigate to the admin login page
3. Enter admin credentials:
   - Username: `admin@streetlabstore.com`
   - Password: `123`
4. Access the admin dashboard to manage products and view user data

## File Structure Overview

```
├── images/
│   ├── frontend/               # React frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── contexts/       # React contexts (Auth)
│   │   │   ├── helpers/        # Utility functions
│   │   │   ├── models/         # TypeScript models
│   │   │   ├── pages/          # Page components
│   │   │   └── services/       # API services
│   │   └── package.json
│   ├── backend/                # Node.js backend
│   │   ├── src/
│   │   │   └── index.js       # Main server file
│   │   ├── Dockerfile
│   │   └── package.json
├── docker-compose.yml      # Container configuration
├── .dockerignore          # Docker ignore file
└── .gitignore             # Git ignore file
```

## Stopping the Application

To stop all containers:

```bash
docker compose down
```

## API Endpoints

- User Authentication
  - `POST /register` - User registration
  - `POST /login` - User login
- Products
  - `GET /products` - Get all products
  - `GET /products/:id` - Get product details
- Admin
  - `GET /admin` - Admin dashboard (protected route)
- Checkout
  - `POST /checkout` - Process checkout

## Sources and References

This project was developed using the following sources and references:

### Development Tools and Libraries

- [Install Nodemon](https://nodemon.io/) - Development server for Node.js
- [Package bcrypt for password](https://www.npmjs.com/package/bcrypt) - Password hashing
- [Documentation uuid](https://refine.dev/blog/node-js-uuid/#uuids-in-distributed-systems-and-microservices) - UUID generation
- [JsonWebToken when sign in](https://stackoverflow.com/questions/67524171/i-am-having-problem-assigning-values-inside-jwt-sign) - JWT authentication

### Docker and Environment Setup

- [Docker composer env file](https://www.warp.dev/terminus/docker-compose-env-file) - Environment file configuration
- [Documentation Docker Container](https://dev.to/peterj/run-a-react-app-in-a-docker-container-kjn) - React in Docker
- [Fixing error processing file](https://github.com/danny-avila/LibreChat/discussions/2779) - Docker file processing
- [Docker legacy watch](https://stackoverflow.com/questions/70443307/nodemon-in-docker-doesnt-work-also-legacy-watch-l-are-not-working) - File watching in Docker
- [Nodemon not working in docker environment](https://stackoverflow.com/questions/27226653/nodemon-is-not-working-in-docker-environment) - Nodemon troubleshooting

### MongoDB References

- [Query Count](https://www.mongodb.com/docs/drivers/node/current/crud/query/count/) - MongoDB count operations
- [Aggregation Sort](https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/) - MongoDB aggregation sorting

### AI Assistance

- [AI Conversation](https://chatgpt.com/share/69349d38-2a0c-8005-a739-f69059302835) - Development guidance and problem-solving
