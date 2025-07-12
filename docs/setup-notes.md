# Neura App Setup Guide

## Overview
This guide will help you set up Neura with full functionality including authentication, task management, goal tracking, AI insights, and notifications.

## Prerequisites
- Node.js 18+ installed
- Expo CLI installed (`npm install -g @expo/cli`)
- A Supabase account
- An Expo account (for push notifications)

## 1. Environment Setup

### Create Environment File
Copy `env.example` to `.env` and fill in your credentials:

```bash
cp env.example .env
```

### Required Environment Variables

#### Supabase Configuration
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Add to `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Expo Configuration (for push notifications)
1. Go to [expo.dev](https://expo.dev) and create a new project
2. Get your project ID from the project settings
3. Add to `.env`:
```
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

## 2. Database Setup

### Create Tables in Supabase

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  subscription_tier TEXT DEFAULT 'free',
  preferences JSONB DEFAULT '{}',
  push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('health', 'career', 'learning', 'habits', 'finance', 'relationships', 'personal')) NOT NULL,
  priority TEXT DEFAULT 'medium',
  target_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  ai_generated BOOLEAN DEFAULT FALSE,
  original_prompt TEXT,
  success_criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  estimated_duration_minutes INTEGER,
  difficulty_level INTEGER DEFAULT 2 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  energy_requirement TEXT DEFAULT 'medium' CHECK (energy_requirement IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped_at TIMESTAMP WITH TIME ZONE,
  streak_count INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT FALSE,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table
CREATE TABLE insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('pattern_recognition', 'behavioral_coaching', 'achievement', 'suggestion')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1) NOT NULL,
  actionable BOOLEAN DEFAULT FALSE,
  icon TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_scheduled_for ON tasks(scheduled_for);
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_created_at ON insights(created_at);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON insights FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start the Development Server

```bash
npm start
```

## 5. Test the App

### Authentication
- Sign up with a new account
- Sign in with existing credentials
- Test sign out functionality

### Task Management
- Create new tasks with different categories
- Mark tasks as complete
- Skip tasks with reasons
- View task statistics

### Goal Tracking
- Create goals in different categories
- Update goal progress
- View goal completion percentages

### AI Insights
- Generate insights based on your data
- View different types of insights (achievements, patterns, suggestions)
- Mark insights as read

### Notifications
- Grant notification permissions when prompted
- Create tasks with scheduled times to test reminders
- Test notification actions (complete, snooze, skip)

## 6. Features Overview

### ✅ Working Features
- **Authentication**: Full sign up/sign in with Supabase
- **Task Management**: Create, complete, skip tasks with scheduling
- **Goal Tracking**: Create goals, track progress, categorize
- **AI Insights**: Pattern recognition, behavioral coaching, achievements
- **Notifications**: Push notifications for task reminders
- **Real-time Sync**: Data syncs across devices
- **Statistics**: Comprehensive task and goal analytics

### 🔧 Technical Features
- **React Query**: Optimistic updates and caching
- **TypeScript**: Full type safety
- **Supabase**: Real-time database with RLS
- **Expo Notifications**: Cross-platform push notifications
- **Responsive Design**: Works on mobile and web

## 7. Troubleshooting

### Common Issues

**"Supabase URL not found"**
- Check your `.env` file has the correct Supabase URL
- Ensure the URL starts with `https://`

**"Authentication failed"**
- Verify your Supabase anon key is correct
- Check that RLS policies are properly set up

**"Notifications not working"**
- Ensure you're testing on a physical device (not simulator)
- Check that you've granted notification permissions
- Verify your Expo project ID is correct

**"Database errors"**
- Run the SQL setup commands in Supabase
- Check that all tables and policies are created
- Verify RLS is enabled on all tables

### Getting Help
- Check the Supabase dashboard for any error logs
- Review the browser console for JavaScript errors
- Ensure all environment variables are set correctly

## 8. Next Steps

### Production Deployment
1. Set up a production Supabase project
2. Configure custom domains
3. Set up monitoring and analytics
4. Deploy to app stores

### Advanced Features
- Integrate with OpenAI for natural language goal parsing
- Add team collaboration features
- Implement advanced analytics and reporting
- Add calendar integration

## 9. Development Notes

### Code Structure
- `src/hooks/`: Custom React hooks for data management
- `src/components/`: Reusable UI components
- `src/services/`: Business logic and external integrations
- `src/lib/`: Configuration and utilities

### Key Files
- `src/components/MainApp.tsx`: Main application component
- `src/hooks/useTasks.ts`: Task management logic
- `src/hooks/useGoals.ts`: Goal tracking logic
- `src/hooks/useInsights.ts`: AI insights generation
- `src/services/notifications/NotificationService.ts`: Push notifications

### Testing
- Test on both iOS and Android devices
- Verify all CRUD operations work correctly
- Test offline functionality
- Validate notification permissions and delivery
