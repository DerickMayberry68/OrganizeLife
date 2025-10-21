# HomeSynchronicity 🎩

A comprehensive household management application built with Angular and .NET Core.

## 🌟 Features

- **Financial Management**: Track accounts, bills, and expenses
- **Document Storage**: Organize household documents
- **Inventory Tracking**: Keep track of household items
- **Insurance Management**: Store and manage insurance policies
- **Maintenance Scheduling**: Schedule and track home maintenance
- **Secure Authentication**: Supabase-powered user authentication
- **Multi-Household Support**: Manage multiple households with role-based access

## 🏗️ Architecture

### Frontend
- **Framework**: Angular 19 (Zoneless)
- **UI Library**: Bootstrap 5
- **Icons**: Font Awesome
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient with Interceptors

### Backend
- **Framework**: .NET 9.0 (ASP.NET Core)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Entity Framework Core
- **Authentication**: Supabase Auth + JWT Bearer
- **Architecture**: Clean Architecture (Core, Infrastructure, API layers)

### Database
- **Provider**: Supabase (PostgreSQL)
- **Features**: Row Level Security, Real-time subscriptions, Auth management

## 📁 Project Structure

```
HomeSynchronicity/
├── frontend/                 # Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── features/    # Feature modules
│   │   │   ├── services/    # Business logic services
│   │   │   ├── models/      # TypeScript interfaces
│   │   │   └── utils/       # Helper utilities
│   │   └── assets/          # Static assets
│   └── package.json
│
├── backend/                  # .NET API
│   ├── src/
│   │   ├── HomeSynchronicity.Api/           # Web API
│   │   ├── HomeSynchronicity.Core/          # Domain entities
│   │   └── HomeSynchronicity.Infrastructure/ # Data access & services
│   ├── tests/
│   │   └── HomeSynchronicity.Tests/         # NUnit tests
│   └── HomeSynchronicityApi.sln
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **.NET 9.0 SDK**
- **PostgreSQL** (via Supabase account)
- **Git**

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The Angular app will run on `http://localhost:4200`

### Backend Setup

```bash
cd backend/src/HomeSynchronicity.Api
dotnet restore
dotnet run
```

The API will run on `http://localhost:5000`

### Configuration

#### Frontend Environment
Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

#### Backend Configuration
Update `appsettings.json` in `HomeSynchronicity.Api`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_SUPABASE_CONNECTION_STRING"
  },
  "Supabase": {
    "Url": "YOUR_SUPABASE_URL",
    "AnonKey": "YOUR_SUPABASE_ANON_KEY",
    "JwtSecret": "YOUR_SUPABASE_JWT_SECRET"
  }
}
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
dotnet test
```

## 🗄️ Database

The application uses Supabase (PostgreSQL) with the following main tables:
- `households` - Household information
- `household_members` - User-household relationships
- `accounts` - Financial accounts
- `bills` - Bill tracking
- `documents` - Document storage
- `inventory` - Household inventory
- `insurance_policies` - Insurance management
- `maintenance_tasks` - Maintenance scheduling

## 🔐 Authentication

Authentication is handled by Supabase Auth:
1. Users register with email/password
2. Supabase returns JWT tokens
3. Backend validates JWT on protected endpoints
4. Frontend stores tokens in localStorage
5. HTTP interceptor adds tokens to API requests

## 📦 Deployment

### Recommended Stack
- **Frontend**: Vercel or Azure Static Web Apps
- **Backend**: Railway, Render, or Azure App Service
- **Database**: Supabase (already configured)

See deployment guides in `/docs` for detailed instructions.

## 🛠️ Tech Stack

### Frontend
- Angular 19
- TypeScript
- Bootstrap 5
- Font Awesome
- RxJS
- Angular Router

### Backend
- ASP.NET Core 9.0
- Entity Framework Core 9.0
- Npgsql (PostgreSQL driver)
- JWT Bearer Authentication
- Swagger/OpenAPI

### DevOps
- Git/GitHub
- npm
- .NET CLI
- Entity Framework Migrations

## 📝 API Documentation

API documentation is available via Swagger UI when running the backend:
- Local: `http://localhost:5000/swagger`

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

Private - All Rights Reserved

## 👤 Author

**Derick Mayberry**
- GitHub: [@DerickMayberry68](https://github.com/DerickMayberry68)

## 🙏 Acknowledgments

- Supabase for authentication and database
- Angular team for the amazing framework
- Microsoft for .NET Core
- Bootstrap for the UI components

---

**Last Updated**: January 2025
