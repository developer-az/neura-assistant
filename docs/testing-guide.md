# 🧪 Neura App Testing Guide

This guide covers how to test the fully functional Neura app, including unit tests, integration tests, and manual testing procedures.

## 📋 Testing Overview

### Test Types
- **Unit Tests**: Individual components and hooks
- **Integration Tests**: Complete user flows
- **Manual Tests**: Real-world usage scenarios
- **E2E Tests**: End-to-end functionality

### Test Coverage Goals
- **Components**: 80%+ coverage
- **Hooks**: 90%+ coverage
- **Services**: 85%+ coverage
- **Integration**: 70%+ coverage

## 🚀 Quick Start Testing

### 1. Install Testing Dependencies
```bash
npm install
```

### 2. Run All Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### 3. Run Specific Test Suites
```bash
# Test only components
npm test -- --testPathPattern=components

# Test only hooks
npm test -- --testPathPattern=hooks

# Test only services
npm test -- --testPathPattern=services

# Test only integration
npm test -- --testPathPattern=integration
```

## 🧩 Unit Testing

### Component Testing

#### MainApp Component
```bash
npm test -- __tests__/components/MainApp.test.tsx
```

**Tests Coverage:**
- ✅ Authentication screen rendering
- ✅ Sign up/sign in form validation
- ✅ Dashboard rendering with user data
- ✅ Task creation form
- ✅ Goal creation form
- ✅ AI insights display
- ✅ User sign out flow

#### InsightsCard Component
```bash
npm test -- __tests__/components/features/insights/InsightsCard.test.tsx
```

**Tests Coverage:**
- ✅ Insight display with different types
- ✅ Generate insights button
- ✅ Mark as read functionality
- ✅ Empty state handling
- ✅ Loading states

### Hook Testing

#### useTasks Hook
```bash
npm test -- __tests__/hooks/useTasks.test.ts
```

**Tests Coverage:**
- ✅ Task fetching and filtering
- ✅ Task creation with validation
- ✅ Task completion and skipping
- ✅ Task statistics calculation
- ✅ Error handling
- ✅ Loading states

#### useInsights Hook
```bash
npm test -- __tests__/hooks/useInsights.test.ts
```

**Tests Coverage:**
- ✅ Insight fetching and caching
- ✅ AI insight generation
- ✅ Mark as read functionality
- ✅ Pattern analysis
- ✅ Error handling

#### useAuth Hook
```bash
npm test -- __tests__/hooks/useAuth.test.ts
```

**Tests Coverage:**
- ✅ User authentication flow
- ✅ Session management
- ✅ Profile creation
- ✅ Sign out functionality
- ✅ Error handling

### Service Testing

#### NotificationService
```bash
npm test -- __tests__/services/NotificationService.test.ts
```

**Tests Coverage:**
- ✅ Notification initialization
- ✅ Task reminder scheduling
- ✅ Insight notifications
- ✅ Motivational reminders
- ✅ Notification response handling
- ✅ Error handling

#### AIService
```bash
npm test -- __tests__/services/ai/AIService.test.ts
```

**Tests Coverage:**
- ✅ Goal parsing from text
- ✅ Task generation for goals
- ✅ Motivational message generation
- ✅ Behavior pattern analysis
- ✅ OpenAI integration readiness

## 🔗 Integration Testing

### Complete User Flow
```bash
npm test -- __tests__/integration/AppFlow.test.tsx
```

**Tests Coverage:**
- ✅ User registration flow
- ✅ User authentication flow
- ✅ Task management flow
- ✅ Goal management flow
- ✅ AI insights flow
- ✅ User sign out flow

### Database Integration
```bash
npm test -- __tests__/integration/DatabaseFlow.test.tsx
```

**Tests Coverage:**
- ✅ Data persistence
- ✅ Real-time updates
- ✅ Error handling
- ✅ Data validation

## 🖥️ Manual Testing

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Add your Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
```

### 2. Database Setup
Run the SQL commands from `docs/setup-notes.md` in your Supabase project.

### 3. Manual Testing Checklist

#### Authentication Testing
- [ ] **User Registration**
  - [ ] Create new account with valid email/password
  - [ ] Validate form requirements (name, email, password)
  - [ ] Handle duplicate email registration
  - [ ] Verify email confirmation flow

- [ ] **User Login**
  - [ ] Sign in with correct credentials
  - [ ] Handle incorrect password
  - [ ] Handle non-existent email
  - [ ] Remember user session

- [ ] **User Logout**
  - [ ] Sign out successfully
  - [ ] Clear session data
  - [ ] Redirect to login screen

#### Task Management Testing
- [ ] **Task Creation**
  - [ ] Create task with all fields
  - [ ] Validate required fields
  - [ ] Link task to goal
  - [ ] Set difficulty and energy levels
  - [ ] Schedule task for specific time

- [ ] **Task Actions**
  - [ ] Mark task as complete
  - [ ] Skip task with reason
  - [ ] Edit task details
  - [ ] Delete task
  - [ ] Reschedule overdue task

- [ ] **Task Display**
  - [ ] Show today's tasks
  - [ ] Display overdue tasks
  - [ ] Show upcoming tasks
  - [ ] Filter by status
  - [ ] Sort by priority/time

#### Goal Management Testing
- [ ] **Goal Creation**
  - [ ] Create goal in all categories
  - [ ] Set target dates
  - [ ] Add descriptions
  - [ ] Set priorities

- [ ] **Goal Progress**
  - [ ] Update completion percentage
  - [ ] Mark goal as completed
  - [ ] Pause/archive goals
  - [ ] Track progress over time

- [ ] **Goal Display**
  - [ ] Show active goals
  - [ ] Display progress bars
  - [ ] Filter by category
  - [ ] Sort by completion

#### AI Insights Testing
- [ ] **Insight Generation**
  - [ ] Generate insights with user data
  - [ ] Analyze completion patterns
  - [ ] Identify productivity times
  - [ ] Detect behavioral patterns

- [ ] **Insight Display**
  - [ ] Show different insight types
  - [ ] Display confidence levels
  - [ ] Mark insights as read
  - [ ] Handle empty states

- [ ] **Insight Actions**
  - [ ] Apply actionable insights
  - [ ] Dismiss irrelevant insights
  - [ ] View insight history

#### Notification Testing
- [ ] **Push Notifications**
  - [ ] Grant notification permissions
  - [ ] Receive task reminders
  - [ ] Interactive notification actions
  - [ ] Handle notification responses

- [ ] **Local Notifications**
  - [ ] Motivational reminders
  - [ ] Insight notifications
  - [ ] Achievement celebrations

#### Performance Testing
- [ ] **App Performance**
  - [ ] Fast app startup
  - [ ] Smooth navigation
  - [ ] Quick data loading
  - [ ] Efficient memory usage

- [ ] **Data Sync**
  - [ ] Real-time updates
  - [ ] Offline functionality
  - [ ] Conflict resolution
  - [ ] Data consistency

## 🐛 Debugging Tests

### Common Test Issues

#### 1. Mock Setup Issues
```javascript
// Ensure mocks are properly configured
beforeEach(() => {
  jest.clearAllMocks();
  // Setup your mocks here
});
```

#### 2. Async Test Issues
```javascript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeTruthy();
});
```

#### 3. Component Rendering Issues
```javascript
// Wrap components in proper test providers
const TestWrapper = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  </QueryClientProvider>
);
```

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test with debugging
npm test -- --testNamePattern="should create task" --verbose

# Run tests with coverage and watch
npm test -- --coverage --watch

# Debug failing tests
npm test -- --detectOpenHandles --forceExit
```

## 📊 Test Coverage

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Coverage Targets
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 85%
- **Lines**: 80%

### Improving Coverage
1. **Identify uncovered code**: Check coverage report
2. **Add missing test cases**: Focus on critical paths
3. **Test error conditions**: Ensure error handling works
4. **Test edge cases**: Cover boundary conditions

## 🔄 Continuous Integration

### GitHub Actions Setup
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run type-check
      - run: npm run lint
```

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run test:ci && npm run lint"
```

## 🎯 Testing Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function/component
- **Assert**: Verify expected outcomes

### 2. Test Naming
```javascript
describe('ComponentName', () => {
  it('should do something when condition is met', () => {
    // Test implementation
  });
});
```

### 3. Mock Strategy
- Mock external dependencies (API, storage)
- Don't mock internal logic
- Use realistic test data

### 4. Async Testing
- Use `waitFor` for async operations
- Handle loading states
- Test error conditions

### 5. Component Testing
- Test user interactions
- Verify UI updates
- Check accessibility

## 🚨 Common Issues & Solutions

### Issue: Tests failing due to Supabase connection
**Solution**: Ensure Supabase is properly mocked in test setup

### Issue: Component not rendering in tests
**Solution**: Check if all required providers are wrapped

### Issue: Async operations timing out
**Solution**: Increase timeout or use proper async/await patterns

### Issue: Mock not working as expected
**Solution**: Clear mocks before each test and verify mock setup

## 📈 Performance Testing

### Load Testing
```bash
# Test with large datasets
npm test -- --testNamePattern="performance"

# Monitor memory usage
npm test -- --detectLeaks
```

### Bundle Size Testing
```bash
# Check bundle size
npm run build:web
npx bundle-analyzer dist/
```

## 🎉 Success Criteria

### Test Pass Rate
- **Unit Tests**: 100% pass rate
- **Integration Tests**: 95%+ pass rate
- **Coverage**: Meet minimum thresholds

### Performance Metrics
- **Test Runtime**: < 30 seconds for full suite
- **Memory Usage**: < 500MB during tests
- **Bundle Size**: < 2MB for web build

### Quality Gates
- All tests pass
- Coverage thresholds met
- No linting errors
- Type checking passes
- Build succeeds

---

**Happy Testing! 🧪✨**

This comprehensive testing setup ensures your Neura app is robust, reliable, and ready for production use. 