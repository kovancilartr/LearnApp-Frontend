# LearnApp Frontend

A comprehensive remote education platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Zustand** for state management
- **Axios** for API communication
- **Role-based authentication** (Admin, Teacher, Student, Parent)
- **Responsive design** for all devices

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── courses/           # Course pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── course/           # Course components
│   ├── dashboard/        # Dashboard components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── store/                # Zustand stores
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Update the environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build the application for production:
```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## User Roles

The application supports four user roles:

- **Admin**: Manage users, courses, and system settings
- **Teacher**: Create and manage courses, lessons, and quizzes
- **Student**: Enroll in courses, watch lessons, take quizzes
- **Parent**: Monitor children's progress and performance

## Key Components

### Authentication
- JWT-based authentication with refresh tokens
- Role-based access control
- Protected routes and components

### State Management
- Zustand stores for auth, courses, and UI state
- Persistent storage for authentication state

### API Integration
- Axios client with interceptors
- Automatic token refresh
- Error handling and retry logic

### UI Components
- shadcn/ui component library
- Responsive design with Tailwind CSS
- Dark/light theme support

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `LearnApp` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.# LearnApp-Frontend
