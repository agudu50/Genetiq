# MongoDB to Supabase Migration Guide

## Overview
This project has been migrated from MongoDB/Mongoose to Supabase for data persistence.

## Setup Instructions

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Get your Supabase URL and Anon Key from the project settings

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env` and update with your Supabase credentials:
```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

### 3. Create Database Schema
Run the SQL migration in Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy the contents of `server/migrations/001_create_initial_schema.sql`
5. Execute the query

This will create:
- `users` table with username, email, password, avatar fields
- `messages` table with message, users, sender fields
- Necessary indexes for performance

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/allusers/:id` - Get all users except the specified user
- `POST /api/auth/setavatar/:id` - Set user avatar
- `GET /api/auth/logout/:id` - Logout user

### Messages
- `POST /api/messages/addmsg/` - Add a new message
- `POST /api/messages/getmsg/` - Get messages between two users

## Key Changes from MongoDB

### User Model
**Old (MongoDB):**
```javascript
{
  username: String,
  email: String,
  password: String,
  isAvatarImageSet: Boolean,
  avatarImage: String
}
```

**New (Supabase):**
Same structure, but uses UUID for `id` instead of MongoDB's `_id`

### Message Model
**Old (MongoDB):**
```javascript
{
  message: { text: String },
  users: Array,
  sender: ObjectId,
  timestamps: true
}
```

**New (Supabase):**
```javascript
{
  id: UUID,
  message: String,
  users: UUID[],
  sender: UUID,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## Files Changed
- `server/config/supabase.js` - Supabase client configuration
- `server/models/userQueries.js` - User database queries
- `server/models/messageQueries.js` - Message database queries
- `server/controllers/userController.js` - Updated to use Supabase
- `server/controllers/messageController.js` - Updated to use Supabase
- `server/index.js` - Removed Mongoose connection
- `package.json` - Removed Mongoose dependency

## Troubleshooting

### "Missing SUPABASE_URL or SUPABASE_ANON_KEY" error
- Check that your `.env` file contains the correct credentials
- Verify you're using the ANON key (not the service role key)

### Connection Issues
- Ensure your Supabase project is running
- Check that CORS is properly configured in your Supabase settings
- Verify the connection URL includes the protocol (https://)

### RLS Policies
If you encounter permission errors, you may need to configure Row Level Security (RLS) policies in Supabase:
1. Go to the SQL Editor
2. Disable RLS for development, or
3. Set up appropriate RLS policies for your use case

## Next Steps
- Implement user authentication with Supabase Auth
- Set up Row Level Security (RLS) policies
- Configure real-time subscriptions if needed
