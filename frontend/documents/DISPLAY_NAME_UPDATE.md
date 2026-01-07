# Display Name Update

## What Changed

The user display name now comes from the **Supabase database** (firstName and lastName fields) instead of being extracted from the email address.

## Files Modified

### 1. **auth.service.ts**
- ✅ Updated `CurrentUser` interface to include `firstName?` and `lastName?`
- ✅ Added `extractUserMetadata()` method to parse firstName/lastName from JWT token
- ✅ Updated `register()` method to extract and store firstName/lastName
- ✅ Updated `login()` method to extract and store firstName/lastName

### 2. **header.component.ts**
- ✅ Updated `userDisplayName` getter to use `firstName` and `lastName`
- ✅ Added fallback logic: Full name → First name only → Email → "User"

### 3. **sidebar.component.ts**
- ✅ Updated `userDisplayName` getter to use `firstName` and `lastName`
- ✅ Added same fallback logic as header

## How It Works

### Registration Flow
1. User registers with firstName and lastName
2. API sends these to Supabase Auth in `user_metadata`
3. Supabase returns a JWT token with `user_metadata.first_name` and `user_metadata.last_name`
4. Angular app extracts these from the token and stores them in localStorage

### Login Flow
1. User logs in with email/password
2. Supabase returns JWT token with user_metadata
3. Angular app extracts firstName/lastName from token
4. Stores in localStorage for display

### Display Logic
The `userDisplayName` getter uses this priority:
1. **First + Last Name**: `"John Doe"` (if both available)
2. **First Name Only**: `"John"` (if only first name)
3. **Email Username**: `"john.doe"` (fallback if no name)
4. **Default**: `"User"` (if nothing available)

## JWT Token Structure

The JWT token contains:
```json
{
  "sub": "user-id",
  "email": "john.doe@example.com",
  "user_metadata": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "email_verified": true
  }
}
```

## Testing

### For New Users
1. **Register** a new user with firstName and lastName
2. Check header (top right) - should show "FirstName LastName"
3. Check sidebar profile - should show "FirstName LastName"
4. Role should show as "Admin" for the household creator

### For Existing Users
If you were logged in before this update:

**Option 1: Clear Storage**
1. Open DevTools -> Application -> Local Storage
2. Clear `organizelife_user`, `organizelife_access_token`, `organizelife_refresh_token`
3. Refresh page -> you'll be redirected to login
4. Login again -> names will be extracted from token

**Option 2: Just Logout**
1. Click "Log Out" from header or sidebar
2. Login again with your credentials
3. Names will now be displayed correctly

### Verify It's Working
```typescript
// Open browser console and run:
const user = JSON.parse(localStorage.getItem('organizelife_user'));
console.log(user);
// Should show:
// {
//   userId: "...",
//   email: "...",
//   firstName: "...",    // <- Should be present
//   lastName: "...",     // <- Should be present
//   households: [...]
// }
```

## Example Output

**Before** (email-based):
- Email: `derickmayberry@gmail.com`
- Display: "Derickmayberry" ❌

**After** (database-based):
- Email: `derickmayberry@gmail.com`
- First Name: `Derick`
- Last Name: `Mayberry`
- Display: **"Derick Mayberry"** ✅

## Benefits

✅ Shows proper capitalized names  
✅ Works with any email format  
✅ Uses actual user data from registration  
✅ Fallback to email if name is missing  
✅ No more weird formatting from email addresses  

## Future Enhancement

When you add the ability to edit profile, the firstName and lastName should be stored in the OrganizeLife database (not just Supabase metadata), and you can update them independently.

---

**All set!** User names now come from the Supabase database!

