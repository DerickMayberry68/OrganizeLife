# Backdoor Login - Development Mode

## Overview
The backdoor login feature allows developers to access the frontend application without requiring the backend API to be running. This is useful for:
- UI development and testing
- Frontend debugging
- Rapid prototyping
- Working offline

## Important Notes
⚠️ **This is for development only** - The backdoor login should never be deployed to production.

📝 **No Data Available** - When using backdoor login, no actual data will be displayed since the backend is not being called. All API requests will still fail, but you can navigate the UI.

## How to Use

### Backdoor Credentials
```
Email: backdoor@dev.local
Password: backdoor
```

### Steps to Login
1. Navigate to the login page
2. Enter the backdoor email: `backdoor@dev.local`
3. Enter the backdoor password: `backdoor`
4. Click "Sign In"

### What Happens Behind the Scenes
- The login component detects the special backdoor credentials
- Instead of calling the backend API, it calls `authService.backdoorLogin()`
- A mock JWT token is generated with a 24-hour expiration
- Mock user data is created and stored in localStorage:
  - User ID: `dev-user-id`
  - First Name: `Dev`
  - Last Name: `User`
  - Household ID: `dev-household-id`
  - Household Name: `Dev Household`
  - Role: `Admin`
- You're redirected to the dashboard

### Console Output
When using backdoor login, you'll see this in the console:
```
🔓 Backdoor login successful - Development mode
```

## Mock Token Structure
The generated JWT token contains:
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "dev-user-id",
    "email": "backdoor@dev.local",
    "exp": <timestamp_24_hours_from_now>,
    "user_metadata": {
      "first_name": "Dev",
      "last_name": "User"
    }
  }
}
```

## Limitations
When using backdoor login:
- ❌ No real data will be loaded from the backend
- ❌ CRUD operations won't work (create, update, delete)
- ❌ API calls will fail
- ✅ You can navigate all routes
- ✅ UI components will render
- ✅ You can test layout and styling
- ✅ Authentication guards will pass

## Implementation Details

### Files Modified
1. **src/app/services/auth.service.ts**
   - Added `backdoorLogin()` method
   - Added `createMockToken()` private method

2. **src/app/features/auth/login/login.ts**
   - Added detection for backdoor credentials
   - Routes to appropriate login method

### Code References

**AuthService - Backdoor Login Method:**
```typescript
backdoorLogin(request: LoginRequest): Observable<LoginResponse> {
  return new Observable<LoginResponse>(observer => {
    const mockToken = this.createMockToken();
    const mockResponse: LoginResponse = { /* ... */ };
    this.storeAuthData(/* ... */);
    observer.next(mockResponse);
    observer.complete();
  });
}
```

**LoginComponent - Backdoor Detection:**
```typescript
const isBackdoorLogin = this.email === 'backdoor@dev.local' 
  && this.password === 'backdoor';

const loginObservable = isBackdoorLogin 
  ? this.authService.backdoorLogin({ email: this.email, password: this.password })
  : this.authService.login({ email: this.email, password: this.password });
```

## Security Considerations
- This feature should be removed or disabled in production builds
- Consider adding environment checks to only enable in development
- The mock token is not cryptographically signed
- No password validation occurs for backdoor credentials

## Future Enhancements
Potential improvements:
- Add environment check to disable in production
- Support for different mock user roles
- Mock data service to provide fake API responses
- Configuration file for customizing mock user data

## Testing
To verify the backdoor login works:
1. Stop your backend API
2. Open the frontend application
3. Login with backdoor credentials
4. Verify you can navigate to dashboard and other routes
5. Check console for backdoor success message
6. Verify localStorage contains mock auth data

## Troubleshooting

**Problem:** Still redirected to login after using backdoor credentials  
**Solution:** Check browser console for errors. Clear localStorage and try again.

**Problem:** Can't navigate to protected routes  
**Solution:** Ensure the mock token has a valid expiration time in the future.

**Problem:** Changes to backdoor not working  
**Solution:** Clear browser cache and localStorage, then rebuild the application.

---

**Created:** October 20, 2025  
**Last Updated:** October 20, 2025  
**Author:** Development Team

