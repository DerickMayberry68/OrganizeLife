# Authentication Setup Complete! 🎉

Your Angular app now has a complete authentication system integrated with your Butler API.

## What Was Created

### Services
✅ **`auth.service.ts`** - Handles login, register, token storage, and user management
✅ **`auth.interceptor.ts`** - Automatically adds JWT tokens to all HTTP requests
✅ **`auth.guard.ts`** - Protects routes from unauthorized access

### Components
✅ **Login Component** (`/login`) - Beautiful login page with email/password
✅ **Register Component** (`/register`) - Registration page for new users

### Features
- ✅ JWT token management (access & refresh tokens)
- ✅ Automatic token expiration checking
- ✅ Protected routes with auth guard
- ✅ Automatic logout on 401 errors
- ✅ User state management with RxJS
- ✅ Beautiful gradient UI design
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling & display

## Routes

### Public Routes
- `/login` - User login page
- `/register` - New user registration

### Protected Routes (Require Authentication)
- `/dashboard`
- `/financial`
- `/inventory`
- `/documents`
- `/accounts`
- `/insurance`
- `/bills`
- `/maintenance`

All protected routes will redirect to `/login` if the user is not authenticated.

## How to Use

### 1. Start the Angular App
```bash
cd C:\Users\deric\source\repos\StudioXConsulting\Projects\HomeSynchronicity
npm start
# or
ng serve
```

### 2. Navigate to the Login Page
Open your browser to: `http://localhost:4200/login`

### 3. Register a New User
1. Click "Create one" on the login page
2. Fill in:
   - First Name
   - Last Name
   - Email
   - Household Name
   - Password (min 6 characters)
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

### 4. Login with Existing User
1. Enter your email and password
2. Click "Sign In"
3. You'll be redirected to the dashboard

## API Integration

The auth service connects to your Butler API at `http://localhost:5000/api`:

- **POST** `/setup/register` - Create new user
- **POST** `/setup/login` - Authenticate user

Make sure your API is running on port 5000!

## Token Storage

Tokens are stored in browser `localStorage`:
- `butler_access_token` - JWT access token
- `butler_refresh_token` - Refresh token
- `butler_user` - User info (email, userId, households)

## Auth Service Methods

### Login
```typescript
authService.login({ email, password }).subscribe(response => {
  // User is now authenticated
  // Redirected to dashboard
});
```

### Register
```typescript
authService.register({
  email,
  password,
  firstName,
  lastName,
  householdName
}).subscribe(response => {
  // User created and logged in
});
```

### Logout
```typescript
authService.logout(); // Clears tokens and redirects to /login
```

### Check if Authenticated
```typescript
if (authService.isAuthenticated()) {
  // User is logged in
}
```

### Get Current User
```typescript
const user = authService.getCurrentUser();
// Returns: { userId, email, households[] }
```

### Get User's Household ID
```typescript
const householdId = authService.getDefaultHouseholdId();
// Use this when making API calls that require householdId
```

## Next Steps

### Add Logout Button
Add this to your header/navbar:

```typescript
// In your header component
logout() {
  this.authService.logout();
}
```

```html
<button (click)="logout()" class="btn btn-outline-danger">
  <i class="fas fa-sign-out-alt me-2"></i>Logout
</button>
```

### Use Auth in Your Components
```typescript
import { inject } from '@angular/core';
import { AuthService } from '@app/services/auth.service';

export class MyComponent {
  private authService = inject(AuthService);
  
  ngOnInit() {
    // Get current user
    const user = this.authService.getCurrentUser();
    console.log('Current user:', user);
    
    // Get household ID for API calls
    const householdId = this.authService.getDefaultHouseholdId();
  }
}
```

### Make Authenticated API Calls
The interceptor automatically adds the token, so just make normal HTTP calls:

```typescript
// This will automatically include the Authorization header
this.http.get(`http://localhost:5000/api/accounts/household/${householdId}`)
  .subscribe(accounts => {
    console.log('User accounts:', accounts);
  });
```

## Testing

### Test User Registration
1. Go to `http://localhost:4200/register`
2. Fill in the form
3. Check the browser console for the response
4. Check localStorage to see stored tokens

### Test User Login
1. Go to `http://localhost:4200/login`
2. Use the credentials you just created
3. Check console and localStorage

### Test Protected Routes
1. Clear localStorage (Application tab in DevTools)
2. Try to access `http://localhost:4200/dashboard`
3. You should be redirected to `/login`

## Styling

The login and register pages use a beautiful gradient design with:
- Purple/blue gradient background for login
- Green gradient for register
- Smooth animations
- Responsive design
- Font Awesome icons

You can customize colors in:
- `login.scss` - Login page styles
- `register.scss` - Register page styles

## Troubleshooting

### "Cannot read property 'sub' of undefined"
- Make sure the API is running on port 5000
- Check that JWT claims mapping is working correctly in the API

### 401 Unauthorized
- Token might be expired - try logging in again
- Check that the API's JWT secret matches

### CORS Errors
- Make sure the API has CORS enabled for `http://localhost:4200`
- Check the `Program.cs` file in the API

## Security Notes

- ✅ Tokens are validated on every request
- ✅ Expired tokens trigger automatic logout
- ✅ 401 errors redirect to login
- ✅ All API routes except login/register require authentication
- ✅ Users can only access their own household data

---

**You're all set!** 🎉 Your Angular app now has a complete authentication system connected to your Butler API.

