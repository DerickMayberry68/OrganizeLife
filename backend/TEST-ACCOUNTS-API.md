# Testing the Accounts Controller

## 🎉 AccountsController is Ready!

Your API now has a fully functional **Accounts** controller with Supabase authentication.

## 📋 Available Endpoints

### 1. **GET** `/api/accounts/household/{householdId}` 
Get all accounts for a household

### 2. **GET** `/api/accounts/{id}`
Get a specific account

### 3. **POST** `/api/accounts`
Create a new account

### 4. **PUT** `/api/accounts/{id}`
Update an account

### 5. **DELETE** `/api/accounts/{id}`
Delete an account (soft delete)

### 6. **GET** `/api/accounts/household/{householdId}/summary`
Get account summary with totals by type

## 🧪 How to Test in Swagger

### Step 1: Open Swagger UI
Go to: **http://localhost:5000/swagger**

### Step 2: (Optional) Authorize
If you have a Supabase JWT token:
1. Click the **🔒 Authorize** button (top right)
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click **Authorize**

**Note:** Without a token, you can still explore the API schema, but authenticated endpoints will return 401.

### Step 3: Test Create Account Endpoint

Click on **POST** `/api/accounts` and try this sample data:

```json
{
  "householdId": "00000000-0000-0000-0000-000000000001",
  "name": "Chase Checking",
  "type": "Checking",
  "institution": "Chase Bank",
  "accountNumberLast4": "1234",
  "balance": 5000.00,
  "currency": "USD"
}
```

### Step 4: Test Get Household Accounts

Click on **GET** `/api/accounts/household/{householdId}` and enter a household ID

### Step 5: Test Account Summary

Click on **GET** `/api/accounts/household/{householdId}/summary` to see totals

## 📝 Sample Requests

### Create a Checking Account

```bash
POST http://localhost:5000/api/accounts
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "householdId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Main Checking",
  "type": "Checking",
  "institution": "Bank of America",
  "accountNumberLast4": "5678",
  "balance": 3500.50,
  "currency": "USD"
}
```

### Create a Savings Account

```bash
POST http://localhost:5000/api/accounts
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "householdId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Emergency Fund",
  "type": "Savings",
  "institution": "Ally Bank",
  "accountNumberLast4": "9012",
  "balance": 15000.00,
  "currency": "USD"
}
```

### Create a Credit Card

```bash
POST http://localhost:5000/api/accounts
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "householdId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Chase Sapphire",
  "type": "Credit Card",
  "institution": "Chase",
  "accountNumberLast4": "3456",
  "balance": -1250.75,
  "currency": "USD"
}
```

### Update an Account

```bash
PUT http://localhost:5000/api/accounts/{accountId}
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "name": "Updated Account Name",
  "balance": 6000.00,
  "isActive": true
}
```

### Get Household Accounts

```bash
GET http://localhost:5000/api/accounts/household/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Account Summary

```bash
GET http://localhost:5000/api/accounts/household/550e8400-e29b-41d4-a716-446655440000/summary
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response Example:**
```json
{
  "totalAccounts": 3,
  "totalBalance": 17249.75,
  "byType": [
    {
      "type": "Savings",
      "count": 1,
      "totalBalance": 15000.00
    },
    {
      "type": "Checking",
      "count": 1,
      "totalBalance": 3500.50
    },
    {
      "type": "Credit Card",
      "count": 1,
      "totalBalance": -1250.75
    }
  ],
  "lastUpdated": "2025-10-09T15:30:00Z"
}
```

## 🔐 Authorization

All endpoints require:
- ✅ **Valid Supabase JWT token** in `Authorization: Bearer {token}` header
- ✅ **User must be a member of the household** they're accessing

The controller automatically:
- Extracts the user ID from the JWT token
- Verifies the user is a member of the household
- Returns `403 Forbidden` if not authorized
- Returns `401 Unauthorized` if no/invalid token

## 🎯 Account Types Supported

- `Checking` - Checking accounts
- `Savings` - Savings accounts
- `Credit Card` - Credit card accounts
- `Investment` - Investment accounts
- `Loan` - Loan accounts
- Any custom type you want!

## ✨ Features

### ✅ Authorization
- Only household members can access accounts
- User ID extracted from Supabase JWT token
- Automatic authorization checks

### ✅ CRUD Operations
- **Create** - Add new financial accounts
- **Read** - Get single account or list by household
- **Update** - Modify account details
- **Delete** - Soft delete (sets `deleted_at`)

### ✅ Summary Endpoint
- Total accounts count
- Total balance across all accounts
- Breakdown by account type
- Last updated timestamp

### ✅ Data Validation
- Required fields checked
- Household membership verified
- Balance tracking
- Currency support (defaults to USD)

## 📊 Database Schema

The `accounts` table includes:
- `id` - Unique identifier (UUID)
- `household_id` - Household reference
- `name` - Account name
- `type` - Account type (Checking, Savings, etc.)
- `institution` - Bank/institution name
- `account_number_last4` - Last 4 digits
- `balance` - Current balance
- `currency` - Currency code (USD, EUR, etc.)
- `is_active` - Active status
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User references
- `deleted_at` - Soft delete timestamp

## 🚀 Next Steps

Now that you have the Accounts controller, you can:

1. **Test without authentication first** - Explore the Swagger UI
2. **Get a Supabase token** - Use the `get-token.ps1` script or create user in Supabase dashboard
3. **Create real data** - Add actual households and accounts
4. **Build more controllers** - Bills, Documents, Budgets, etc.
5. **Integrate with Angular** - Connect your frontend

## 📚 Related Controllers to Build Next

- **HouseholdsController** - Manage households
- **BillsController** - Track bills and payments
- **TransactionsController** - Financial transactions
- **BudgetsController** - Budget management
- **SubscriptionsController** - Recurring subscriptions

---

**Status**: ✅ Ready to Test!  
**Swagger UI**: http://localhost:5000/swagger  
**API Running**: http://localhost:5000

