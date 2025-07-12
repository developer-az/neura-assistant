# 🧠 Neura - AI-Powered Productivity App

A modern, intelligent productivity app built with React Native, Expo, and Supabase. Neura combines task management, goal tracking, and AI-powered insights to help you achieve more with less effort.

## ✨ New Features (Latest Update)

### 🎯 Enhanced Task Completion
- **Satisfaction Ratings**: Rate your satisfaction (1-5) after completing tasks
- **Completion Modal**: Beautiful completion feedback with motivational messages
- **Achievement Tracking**: Track completion count, time invested, and average satisfaction
- **Visual Feedback**: Animated checkmarks and progress indicators

### 🔄 Recurring Tasks
- **Daily/Weekly/Monthly**: Set tasks to repeat automatically
- **Smart Scheduling**: Next occurrence created automatically upon completion
- **Recurrence Patterns**: Flexible scheduling with custom intervals
- **Visual Indicators**: Clear badges showing recurring task status

### 🏆 Achievement System
- **Progress Levels**: Beginner → Intermediate → Pro → Expert → Master
- **Motivational Messages**: Dynamic encouragement based on your progress
- **Statistics Dashboard**: Comprehensive view of your productivity metrics
- **Time Tracking**: Monitor total time invested in task completion

### 🎨 Modern UI Overhaul
- **Card-Based Design**: Clean, modern card layouts with shadows
- **Color-Coded Difficulty**: Visual difficulty indicators (🟢🟡🔴)
- **Energy Level Icons**: Intuitive energy requirement display (🌱⚡🔥)
- **Organized Task Lists**: Grouped by status (Overdue, Pending, Completed)
- **Responsive Animations**: Smooth interactions and feedback

## 🚀 Key Features

### Task Management
- **Smart Scheduling**: AI-powered optimal timing suggestions
- **Difficulty & Energy Levels**: Match tasks to your current capacity
- **Goal Linking**: Connect tasks to larger objectives
- **Streak Tracking**: Build momentum with completion streaks
- **Skip Reasons**: Understand why tasks are skipped for better planning

### Goal Tracking
- **Category-Based Organization**: Health, Career, Learning, Habits, Finance, Relationships, Personal
- **Progress Visualization**: Visual progress bars and completion percentages
- **Success Criteria**: Define clear success metrics for each goal
- **AI-Generated Goals**: Get intelligent goal suggestions

### AI Insights
- **Pattern Recognition**: Identify productivity patterns and trends
- **Behavioral Coaching**: Personalized recommendations for improvement
- **Achievement Celebrations**: Recognize and celebrate your successes
- **Actionable Suggestions**: Practical tips to boost productivity

### Real-time Sync
- **Cross-Device Sync**: Access your data anywhere, anytime
- **Offline Support**: Work without internet, sync when connected
- **Instant Updates**: Real-time collaboration and updates
- **Conflict Resolution**: Smart handling of concurrent edits

## 🛠️ Technical Stack

### Frontend
- **React Native + Expo**: Cross-platform mobile and web development
- **TypeScript**: Full type safety and better developer experience
- **React Query**: Optimistic updates and intelligent caching
- **Modern UI Components**: Custom-built components with consistent design

### Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security**: Secure data access and user isolation
- **Authentication**: Built-in user management and social login
- **Database Triggers**: Automatic recurring task creation and stats updates

### AI Features
- **Pattern Analysis**: Behavioral insights from user data
- **Smart Scheduling**: Optimal task timing recommendations
- **Motivational Coaching**: Personalized encouragement messages
- **Achievement Recognition**: Automatic milestone detection

## 📱 Screenshots & UI

### Modern Dashboard
- Achievement card with progress level and motivational messages
- Organized task lists with status-based grouping
- Real-time statistics and completion rates
- Clean, card-based design with modern shadows

### Enhanced Task Creation
- Recurring task toggle with pattern selection
- Visual difficulty and energy level selectors
- Goal linking with category-based colors
- Duration and scheduling options

### Completion Experience
- Satisfaction rating modal with emoji feedback
- Achievement badges and progress indicators
- Streak tracking and completion statistics
- Motivational messages and celebrations

## 🔧 Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd neura-app-fresh
npm install
```

### 2. Environment Setup
Create a `.env` file with your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the complete setup in your Supabase SQL Editor:
```sql
-- Run database-setup.sql first
-- Then run database-migration.sql for new features
```

### 4. Start Development
```bash
npm start
```

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── features/
│   │   ├── tasks/
│   │   │   ├── TaskItem.tsx          # Modern task component
│   │   │   ├── TaskList.tsx          # Organized task lists
│   │   │   ├── CreateTaskForm.tsx    # Enhanced task creation
│   │   │   └── AchievementCard.tsx   # Progress tracking
│   │   ├── goals/
│   │   └── insights/
│   ├── ui/                           # Reusable UI components
│   └── MainApp.tsx                   # Main dashboard
├── hooks/                            # Custom React hooks
├── services/                         # API and external services
└── types/                           # TypeScript definitions
```

### Database Schema
- **Tasks**: Enhanced with recurring fields and achievement tracking
- **Goals**: Category-based organization with progress tracking
- **Insights**: AI-generated recommendations and patterns
- **Profiles**: User preferences and notification settings

## 🎨 Design System

### Colors
- **Primary**: Modern blue (#6366f1)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Background**: Clean whites and grays

### Typography
- **Hierarchy**: Clear font sizes and weights
- **Readability**: Optimized line heights and spacing
- **Consistency**: Unified typography across components

### Components
- **Cards**: Elevated containers with shadows
- **Buttons**: Interactive elements with hover states
- **Forms**: Clean input fields with validation
- **Modals**: Overlay dialogs for focused interactions

## 🔄 Recurring Tasks

### How It Works
1. **Create Recurring Task**: Toggle recurring option and select pattern
2. **Automatic Creation**: Next occurrence created when current task is completed
3. **Pattern Support**: Daily, weekly, monthly with custom intervals
4. **Smart Scheduling**: Maintains original time and duration settings

### Configuration Options
- **Daily**: Every day, every 2 days, etc.
- **Weekly**: Every week, every 2 weeks, etc.
- **Monthly**: Every month, every 2 months, etc.
- **Custom**: Advanced scheduling with specific rules

## 🏆 Achievement System

### Progress Levels
- **Beginner** (0-49%): 🌱 Starting your journey
- **Intermediate** (50-69%): 🎯 Building momentum
- **Pro** (70-79%): ⭐ Consistent performer
- **Expert** (80-89%): 🏆 High achiever
- **Master** (90%+): 👑 Productivity master

### Tracking Metrics
- **Completion Rate**: Percentage of tasks completed
- **Time Invested**: Total minutes spent on tasks
- **Average Satisfaction**: User satisfaction ratings
- **Streak Count**: Consecutive days of task completion

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create regular and recurring tasks
- [ ] Complete tasks with satisfaction ratings
- [ ] Verify recurring task creation
- [ ] Check achievement level progression
- [ ] Test task organization and filtering
- [ ] Validate real-time sync across devices

### Automated Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## 🚀 Deployment

### Expo Build
```bash
expo build:android         # Android APK
expo build:ios            # iOS IPA
expo build:web            # Web deployment
```

### Supabase Deployment
- Database migrations run automatically
- Real-time subscriptions enabled
- Row Level Security policies active
- Authentication flows configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: Report bugs on GitHub
- **Discussions**: Join community discussions
- **Email**: Contact for enterprise support

---

**Built with ❤️ using React Native, Expo, and Supabase** 