# Testing the Setup Controller

## 🎉 SetupController is Ready!

This controller handles **first-time user registration** - no authentication required!

## 📋 Available Endpoints

### 1. **POST** `/api/setup/register` (Public - No Auth)
Register a new user and create their first household

### 2. **POST** `/api/setup/login` (Public - No Auth)
Login an existing user and get their households

### 3. **GET** `/api/setup/user/{userId}` (Public - For Testing)
Get user info and households

### 4. **GET** `/api/setup/test-config` (Public - For Testing)
Verify Supabase configuration

## 🧪 Test the Registration Flow

### Step 1: Open Swagger UI
Go to: **http://localhost:5000/swagger**

### Step 2: Test Configuration (Optional)
Click on **GET** `/api/setup/test-config` to verify Supabase is configured

### Step 3: Register a New User
Click on **POST** `/api/setup/register` and use this sample:

```json
{
  "email": "john.doe@example.com",
  "password": "Test123456!",
  "firstName": "John",
  "lastName": "Doe",
  "householdName": "The Doe Family"
}
```

**Expected Response** (201 Created):
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "householdId": "660e8400-e29b-41d4-a716-446655440000",
  "householdName": "The Doe Family",
  "message": "User registered successfully! Your default household has been created."
}
```

### Step 4: Copy the Access Token
The `accessToken` from the response is your **JWT token** - save it!

### Step 5: Authorize in Swagger
1. Click the **🔒 Authorize** button (top right)
2. Enter: `Bearer [paste-your-token-here]`
3. Click **Authorize**

### Step 6: Test Creating an Account
Now go to **POST** `/api/accounts` and create a financial account:

```json
{
  "householdId": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Chase Checking",
  "type": "Checking",
  "institution": "Chase Bank",
  "accountNumberLast4": "1234",
  "balance": 5000.00,
  "currency": "USD"
}
```

It should work! ✅

## 🔐 Complete Registration Flow

```
1. User fills out registration form
   ↓
2. POST /api/setup/register
   - Signs up with Supabase Auth
   - Creates user account
   - Creates default household
   - Adds user as household admin
   ↓
3. Returns JWT token + household info
   ↓
4. User can now access protected endpoints!
   - Create accounts
   - Add bills
   - Upload documents
   - etc.
```

## 📝 What Happens During Registration

### 1. Supabase Auth Sign Up
- Creates user account in Supabase (`auth.users` table)
- Hashes and stores password securely
- Returns JWT access token

### 2. Create Household
- Inserts record into `households` table
- Sets user as creator
- Names it whatever you specified

### 3. Add User as Member
- Inserts record into `household_members` table
- Sets role to "Admin"
- Marks as active

### 4. Return Everything
- User ID
- Email
- **JWT Access Token** (use this for all future requests)
- Household ID
- Household Name

## 🔁 Login Flow (Existing Users)

If a user already exists:

```json
POST /api/setup/login

{
  "email": "john.doe@example.com",
  "password": "Test123456!"
}
```

**Response**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "households": [
    {
      "householdId": "660e8400-e29b-41d4-a716-446655440000",
      "householdName": "The Doe Family",
      "role": "Admin",
      "joinedAt": "2025-10-09T16:00:00Z"
    }
  ]
}
```

## 🎯 Testing Different Scenarios

### Scenario 1: New User Registration

```bash
POST http://localhost:5000/api/setup/register
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "SecurePass123!",
  "firstName": "Alice",
  "lastName": "Smith",
  "householdName": "Smith Household"
}
```

✅ **Result**: User created, household created, token returned

### Scenario 2: Duplicate Email

Try registering the same email again:

❌ **Result**: 400 Bad Request - "User already registered"

### Scenario 3: Weak Password

```json
{
  "email": "bob@example.com",
  "password": "123",
  "firstName": "Bob",
  "lastName": "Jones",
  "householdName": "Jones Family"
}
```

❌ **Result**: 400 Bad Request - "Password must be at least 6 characters"

### Scenario 4: Login After Registration

```bash
POST http://localhost:5000/api/setup/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

✅ **Result**: Token returned with list of households

## 🔐 Using the Token

After registration or login, use the token in all authenticated requests:

```bash
GET http://localhost:5000/api/accounts/household/{householdId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✨ Benefits of This Approach

✅ **No Manual Household Setup** - Automatically created on registration
✅ **User is Admin** - Full permissions from the start
✅ **Single API Call** - Registration + household creation in one step
✅ **JWT Token Ready** - Immediate access to protected endpoints
✅ **Supabase Integration** - Real authentication, not fake/mock data

## 🚀 Next Steps

Now that users can register, they can:

1. ✅ **Create financial accounts** (`POST /api/accounts`)
2. ✅ **View household accounts** (`GET /api/accounts/household/{id}`)
3. **Create bills** (when you build BillsController)
4. **Upload documents** (when you build DocumentsController)
5. **Invite household members** (when you build that feature)

## 📊 Database Tables Updated

### `auth.users` (Supabase - Automatic)
- User authentication data
- Email, hashed password
- Managed by Supabase

### `households` (Your Database)
- Household record
- Name, created_at, created_by

### `household_members` (Your Database)
- Membership record
- User-household relationship
- Role: "Admin"

## 🐛 Troubleshooting

### "Supabase configuration is missing"
- Check `appsettings.json` has `Supabase:Url` and `Supabase:AnonKey`
- Run `/api/setup/test-config` to verify

### "User already registered"
- Email already exists in Supabase
- Try a different email or use `/api/setup/login`

### "Invalid email or password" (Login)
- Check credentials
- Password is case-sensitive
- Make sure you registered first

### 401 Unauthorized on Protected Endpoints
- Make sure you clicked **Authorize** in Swagger
- Token format: `Bearer YOUR_TOKEN` (include "Bearer ")
- Token might be expired (get a new one via login)

---

**Status**: ✅ Ready to Test!  
**Swagger UI**: http://localhost:5000/swagger  
**No Auth Required**: Registration and Login are public endpoints!

