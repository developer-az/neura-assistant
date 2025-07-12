import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainApp from '../../src/components/MainApp';
import { supabase } from '../../src/lib/supabase';

// Mock Supabase
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider>
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  </SafeAreaProvider>
);

describe('Complete App Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful authentication
    mockSupabase.auth = {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
      signInWithPassword: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user', email: 'test@example.com' } }, 
        error: null 
      })),
      signUp: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user', email: 'test@example.com' } }, 
        error: null 
      })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user' } }, 
        error: null 
      })),
    } as any;

    // Mock database operations
    mockSupabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })) as any;
  });

  describe('User Registration Flow', () => {
    it('should allow user to register and access dashboard', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Switch to sign up mode
      fireEvent.press(screen.getByText("Don't have an account? Sign Up"));

      // Fill in registration form
      fireEvent.changeText(
        screen.getByPlaceholderText('Enter your full name'),
        'Test User'
      );
      fireEvent.changeText(
        screen.getByPlaceholderText('Use your real email or test@example.com'),
        'test@example.com'
      );
      fireEvent.changeText(
        screen.getByPlaceholderText('Enter password (min 6 characters)'),
        'password123'
      );

      // Submit registration
      fireEvent.press(screen.getByText('Create Account'));

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Account created! You can now sign in.')).toBeTruthy();
      });
    });

    it('should handle registration validation errors', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Switch to sign up mode
      fireEvent.press(screen.getByText("Don't have an account? Sign Up"));

      // Try to submit without required fields
      fireEvent.press(screen.getByText('Create Account'));

      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeTruthy();
      });
    });
  });

  describe('User Authentication Flow', () => {
    it('should allow user to sign in and access dashboard', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Fill in sign in form
      fireEvent.changeText(
        screen.getByPlaceholderText('Use your real email or test@example.com'),
        'test@example.com'
      );
      fireEvent.changeText(
        screen.getByPlaceholderText('Enter password (min 6 characters)'),
        'password123'
      );

      // Submit sign in
      fireEvent.press(screen.getByText('Sign In'));

      // Should navigate to dashboard
      await waitFor(() => {
        expect(screen.getByText('Welcome back, there! 👋')).toBeTruthy();
      });
    });

    it('should handle authentication errors', async () => {
      // Mock authentication error
      mockSupabase.auth.signInWithPassword = jest.fn(() => 
        Promise.resolve({ 
          data: null, 
          error: { message: 'Invalid credentials' } 
        })
      );

      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Fill in sign in form
      fireEvent.changeText(
        screen.getByPlaceholderText('Use your real email or test@example.com'),
        'wrong@example.com'
      );
      fireEvent.changeText(
        screen.getByPlaceholderText('Enter password (min 6 characters)'),
        'wrongpassword'
      );

      // Submit sign in
      fireEvent.press(screen.getByText('Sign In'));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeTruthy();
      });
    });
  });

  describe('Task Management Flow', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getSession = jest.fn(() => Promise.resolve({ 
        data: { 
          session: { 
            user: { 
              id: 'test-user', 
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' }
            } 
          } 
        } 
      }));
    });

    it('should allow user to create and manage tasks', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User! 👋')).toBeTruthy();
      });

      // Create new task
      fireEvent.press(screen.getByText('+ New Task'));

      // Fill in task form
      fireEvent.changeText(
        screen.getByPlaceholderText('What do you want to accomplish?'),
        'Test Task'
      );
      fireEvent.changeText(
        screen.getByPlaceholderText('Add details about your task...'),
        'This is a test task'
      );

      // Submit task
      fireEvent.press(screen.getByText('Create Task'));

      // Should create task and close form
      await waitFor(() => {
        expect(screen.queryByText('Create New Task')).toBeNull();
      });
    });

    it('should validate task creation form', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User! 👋')).toBeTruthy();
      });

      // Open task creation form
      fireEvent.press(screen.getByText('+ New Task'));

      // Try to submit without title
      fireEvent.press(screen.getByText('Create Task'));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please enter a task title')).toBeTruthy();
      });
    });
  });

  describe('Goal Management Flow', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getSession = jest.fn(() => Promise.resolve({ 
        data: { 
          session: { 
            user: { 
              id: 'test-user', 
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' }
            } 
          } 
        } 
      }));
    });

    it('should allow user to create goals', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User! 👋')).toBeTruthy();
      });

      // Create new goal
      fireEvent.press(screen.getByText('+ New Goal'));

      // Fill in goal form
      fireEvent.changeText(
        screen.getByPlaceholderText('What do you want to achieve?'),
        'Test Goal'
      );
      fireEvent.changeText(
        screen.getByPlaceholderText('Add details about your goal...'),
        'This is a test goal'
      );

      // Select category
      fireEvent.press(screen.getByText('Health'));

      // Submit goal
      fireEvent.press(screen.getByText('Create Goal'));

      // Should create goal and close form
      await waitFor(() => {
        expect(screen.queryByText('Create New Goal')).toBeNull();
      });
    });

    it('should validate goal creation form', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User! 👋')).toBeTruthy();
      });

      // Open goal creation form
      fireEvent.press(screen.getByText('+ New Goal'));

      // Try to submit without title
      fireEvent.press(screen.getByText('Create Goal'));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please enter a goal title')).toBeTruthy();
      });
    });
  });

  describe('AI Insights Flow', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getSession = jest.fn(() => Promise.resolve({ 
        data: { 
          session: { 
            user: { 
              id: 'test-user', 
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' }
            } 
          } 
        } 
      }));
    });

    it('should allow user to generate insights', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User! 👋')).toBeTruthy();
      });

      // Generate insights
      fireEvent.press(screen.getByText('Generate Insights'));

      // Should show generating state
      await waitFor(() => {
        expect(screen.getByText('Analyzing...')).toBeTruthy();
      });
    });

    it('should display insights when available', async () => {
      // Mock insights data
      const mockInsights = [
        {
          id: 'insight-1',
          type: 'achievement',
          title: 'Great Progress! 🏆',
          description: 'You\'ve completed 80% of your tasks this week.',
          confidence: 0.95,
          actionable: false,
          icon: '🏆',
          created_at: new Date().toISOString(),
          read_at: null,
        },
      ];

      mockSupabase.from = jest.fn().mockImplementation((table) => {
        if (table === 'insights') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({ data: mockInsights, error: null })),
                })),
              })),
            })),
            insert: jest.fn(() => ({
              select: jest.fn(() => Promise.resolve({ data: mockInsights, error: null })),
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: mockInsights[0], error: null })),
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        };
      });

      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User! 👋')).toBeTruthy();
      });

      // Should display insights
      await waitFor(() => {
        expect(screen.getByText('AI Insights')).toBeTruthy();
        expect(screen.getByText('Great Progress! 🏆')).toBeTruthy();
      });
    });
  });

  describe('User Sign Out Flow', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getSession = jest.fn(() => Promise.resolve({ 
        data: { 
          session: { 
            user: { 
              id: 'test-user', 
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' }
            } 
          } 
        } 
      }));
    });

    it('should allow user to sign out', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User! 👋')).toBeTruthy();
      });

      // Sign out
      fireEvent.press(screen.getByText('Sign Out'));

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Are you sure you want to sign out?')).toBeTruthy();
      });

      // Confirm sign out
      fireEvent.press(screen.getByText('Sign Out'));

      // Should return to auth screen
      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeTruthy();
      });
    });
  });
}); 