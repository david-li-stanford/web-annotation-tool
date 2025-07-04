# Web-Based Text Annotation Tool

A web-based platform for interactive text markup and annotation, built with React and Node.js.

## Features

### User Interface
- Browse and select text excerpts for annotation
- Interactive text highlighting and commenting
- Real-time annotation management

### Admin Interface
- Secure authentication system (development mode accepts any credentials)
- Upload and manage text excerpts
- Content management dashboard

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- RESTful API design

### Database Schema
- `text_excerpts`: Stores text content for annotation
- `annotations`: Stores user annotations with position data

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/david-li-stanford/web-annotation-tool.git
cd web-annotation-tool
```

2. Set up the database:
```bash
# Create PostgreSQL database
sudo -u postgres createdb text_annotation
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
```bash
# The .env file is already configured for local development
# Update database credentials if needed
```

5. Initialize the database:
```bash
npm run init-db
```

6. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser:
- User interface: http://localhost:3000
- Admin interface: http://localhost:3000/admin

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login (accepts any credentials in development)

#### Text Excerpts
- `GET /api/texts` - Get all text excerpts
- `GET /api/texts/:id` - Get single text excerpt with annotations
- `POST /api/texts` - Create new text excerpt (requires auth)
- `PUT /api/texts/:id` - Update text excerpt (requires auth)
- `DELETE /api/texts/:id` - Delete text excerpt (requires auth)

#### Annotations
- `GET /api/annotations/text/:textId` - Get annotations for text
- `POST /api/annotations` - Create new annotation
- `PUT /api/annotations/:id` - Update annotation
- `DELETE /api/annotations/:id` - Delete annotation

### Testing Database Connection

```bash
cd backend
npm run test-db
```

## Development

### Project Structure
```
├── frontend/          # React TypeScript application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx       # Main application with routing
│   │   └── index.tsx     # Application entry point
│   └── package.json
├── backend/           # Node.js Express server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── auth.ts       # Authentication logic
│   │   ├── database.ts   # Database connection
│   │   └── server.ts     # Express server setup
│   └── package.json
└── context/           # Project documentation
    ├── project_overview.md
    └── tech_stack.md
```

### Current Implementation Status

#### ✅ Completed
- Project setup with TypeScript
- Database schema and connection
- Authentication system
- Basic user interface for text browsing
- Admin login interface
- RESTful API endpoints
- React Router navigation

#### 🚧 In Progress
- Text highlighting functionality
- Annotation comment system
- Admin text upload interface
- Full CRUD operations for content management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.