# URL Crawler 🚀

URL Crawler is a full-stack web application designed for analyzing and reporting key information about web pages.

### Purpose 🎯

Admins can submit website URLs for analysis. Regular users can only view the list of submitted websites and see the status and results of each scan.

The backend crawls each URL to extract important data such as:

- 📝 HTML version of the page  
- 🏷️ Page title  
- 📊 Count of heading tags by level (H1, H2, etc.)  
- 🔗 Number of internal versus external links  
- ❌ Number of inaccessible (broken) links (HTTP 4xx or 5xx)  
- 🔒 Detection of login forms on the page  

### Frontend ⚛️

- Built using **React**, **TypeScript**, and **Vite**  
- Responsive design supporting both desktop and mobile devices 📱💻  
- Admins can add URLs and control crawl operations 🛠️  
- Users can browse URLs and view crawl progress and detailed results with charts and broken link lists 📈  


### Backend 🦦

- Developed in **Go (Golang)** using the **Gin** framework  
- Uses **MySQL** database for persistent storage 🗄️  
- REST API with authentication protecting endpoints and role-based access control 🔐  
- Supports URL management, crawl control, and real-time status updates ⏱️  

### Key Features 🌟

- Admin-only URL submission and crawl control 👩‍💼  
- User access to view crawl statuses and detailed reports 👀  
- Paginated, sortable, and filterable results dashboard 📋  
- Detailed view per URL with charts and broken link reports 📊  
- Real-time crawl progress display ⏳

# Requirements & How to Run 🚀

## Requirements 🛠️

- **Node.js & npm** (for frontend development and production build)
- **Go (Golang)** (for backend, minimum version depends on your code, e.g. Go 1.24+)
- **MySQL** (for database, can be run locally or via Docker)
- **Docker & Docker Compose** (only required for production containerized setup)
- **Goose** for migrations
- No extra installations required if running in Docker production mode, all dependencies are containerized for easy setup 🐳

You need to provide .env files for both frontend and backend:

We provide two environment files for the frontend:

- `.env.development`
- `.env.production`

Currently, both files contain the same base URL value, but this setup is for conceptual clarity.

This allows easier future adaptation when deploying with nginx or other production steps where the API base URL may differ.
Frontend .env.production/.env.development example (in /client folder):
```
VITE_API_BASE_URL=http://localhost:8080/api
```

Backend .env example (at project root):

```
# General
APP_ENV=production

# Dev settings
DEV_DB_USER=root
DEV_DB_PASS=your_dev_password
DEV_DB_HOST=localhost
DEV_DB_PORT=3306
DEV_DB_NAME=url_crawler

# Prod settings
PROD_DB_USER=root
PROD_DB_PASS=your_prod_password
PROD_DB_HOST=mysql_db
PROD_DB_PORT=3306
PROD_DB_NAME=url_crawler

# Shared
JWT_SECRET=your_jwt_secret_here
PORT=8080
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ADMIN_EMAIL=admin@email.com
ADMIN_PASSWORD=SuperSecure123!
```

Note: Replace the passwords and secrets above with secure values before running.

## Project Structure 📁

After adding the required `.env` files, your project directory should look like this:
```
project-root/
│
├── .env
├── .dockerignore
├── .gitignore
├── docker-compose.yaml
├── DockerFile.backend
├── DockerFile.client
├── go.mod
├── go.sum
├── project-structure.txt
├── README.md
├── wait-for-it.sh
│
├── client/
│ ├── .env.development
│ ├── .env.production
│ ├── node_modules/
│ └── src/
│
├── cmd/
│ ├── seed/
│ └── server/
│
├── internal/
│ ├── api/
│ ├── auth/
│ ├── config/
│ ├── crawler/
│ ├── db/
│ ├── handlers/
│ ├── middleware/
│ └── models/
│
└── migrations/
```
## Running Locally (Development Mode) 🧑‍💻

1. Clone the repository and navigate to the frontend:

```
cd client
npm install
npm run dev
```

This will start the frontend Vite development server on http://localhost:5173.

2. In another terminal, navigate to the backend:

```
go run cmd/server/main.go
```

Make sure your .env file is configured with ```APP_ENV=development```and the DEV_DB_* variables point to your local MySQL instance.

3. Backend will automatically run migrations and seed the database with an admin user based on the credentials in .env.

4. Access the backend API at http://localhost:8080/api.

## Running in Production (Dockerized) 🐳

1. Make sure Docker and Docker Compose are installed.

2. Make sure your .env file is configured with ```APP_ENV=production``` and the DEV_DB points to MySQL container

2. Build and run all containers (frontend, backend, and MySQL) with:

```
docker-compose up --build
```

3. The backend container will handle migrations and seeding automatically.

4. Frontend will be served as a static build by the frontend container.

5. Access the application at http://localhost:3000 (or configured host/port).

## Running in Production (Without Docker) ⚙️


1. Build the frontend static files:
```
cd client
npm install
npm run build
```
2. Serve the frontend using a static server like `serve`:

install `serve` globally if you want to use the command directly:
```
npm install -g serve
```
Then run:
```
serve -s dist -l 3000
```
This will serve your built frontend on port 3000.

3. Configure your backend .env with 
```
APP_ENV=production
PROD_DB_HOST=localhost
```
5. If you want to access the frontend from another device in the network
(e.g. accessing it via http://192.168.1.100:3000 from your phone or another PC),
make sure to include that IP address in the CORS origins in your root .env file:
```
CORS_ORIGINS=http://localhost:5173, http://localhost:3000, http://192.168.1.100:3000
```
6. Run the backend:

```
go run cmd/server/main.go
```

## Admin & User Roles 👤

- Admin: Can add URLs, start/stop crawls, and delete entries.
- User: Can only view the list of URLs and crawl statuses.

Admin credentials are created automatically from .env on backend startup.

## Database Setup 🗄️

- No manual database creation needed.
- Backend will detect if the database and tables exist.
- If not, it runs migrations and seeds the admin user.

## Testing 🧪

- Basic API testing done via Postman.
- Frontend and backend automated tests will be added in future versions.

## Troubleshooting & Contact 📩

If you run into issues, feel free to contact me at:  
kareemabuqaoud@hotmail.com

---

Happy crawling! 🕷️✨
