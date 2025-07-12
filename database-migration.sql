-- Migration script to add recurring task support and achievement tracking
-- Run this in your Supabase SQL Editor after the initial setup

-- Add recurring task fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'custom')),
ADD COLUMN IF NOT EXISTS recurrence_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS next_occurrence TIMESTAMP WITH TIME ZONE;

-- Add achievement tracking fields
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_completion_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_completion_time_minutes INTEGER DEFAULT 0;

-- Update existing tasks to have default values for new fields
UPDATE tasks 
SET 
  is_recurring = FALSE,
  recurrence_config = '{}',
  completion_count = CASE WHEN status = 'completed' THEN 1 ELSE 0 END,
  total_completion_time_minutes = CASE WHEN status = 'completed' THEN COALESCE(estimated_duration_minutes, 30) ELSE 0 END,
  average_completion_time_minutes = CASE WHEN status = 'completed' THEN COALESCE(estimated_duration_minutes, 30) ELSE 0 END
WHERE is_recurring IS NULL;

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_tasks_is_recurring ON tasks(is_recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_next_occurrence ON tasks(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_tasks_completion_count ON tasks(completion_count);

-- Add function to automatically create next occurrence for recurring tasks
CREATE OR REPLACE FUNCTION create_next_recurrence()
RETURNS TRIGGER AS $$
DECLARE
  next_date TIMESTAMP WITH TIME ZONE;
  next_task_id UUID;
BEGIN
  -- Only create next occurrence if task was completed and is recurring
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.is_recurring = TRUE THEN
    
    -- Calculate next occurrence date based on pattern
    CASE NEW.recurrence_pattern
      WHEN 'daily' THEN
        next_date := NEW.scheduled_for + INTERVAL '1 day';
      WHEN 'weekly' THEN
        next_date := NEW.scheduled_for + INTERVAL '7 days';
      WHEN 'monthly' THEN
        next_date := NEW.scheduled_for + INTERVAL '1 month';
      ELSE
        next_date := NULL;
    END CASE;
    
    -- Create next occurrence if we have a valid next date
    IF next_date IS NOT NULL THEN
      INSERT INTO tasks (
        user_id,
        goal_id,
        title,
        description,
        scheduled_for,
        estimated_duration_minutes,
        difficulty_level,
        energy_requirement,
        status,
        is_recurring,
        recurrence_pattern,
        recurrence_config,
        parent_task_id,
        next_occurrence,
        ai_generated,
        context
      ) VALUES (
        NEW.user_id,
        NEW.goal_id,
        NEW.title,
        NEW.description,
        next_date,
        NEW.estimated_duration_minutes,
        NEW.difficulty_level,
        NEW.energy_requirement,
        'pending',
        TRUE,
        NEW.recurrence_pattern,
        NEW.recurrence_config,
        NEW.id,
        next_date,
        NEW.ai_generated,
        NEW.context
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic next occurrence creation
DROP TRIGGER IF EXISTS trigger_create_next_recurrence ON tasks;
CREATE TRIGGER trigger_create_next_recurrence
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_next_recurrence();

-- Add function to update completion statistics
CREATE OR REPLACE FUNCTION update_completion_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update completion count and time statistics when task is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completion_count := COALESCE(OLD.completion_count, 0) + 1;
    NEW.total_completion_time_minutes := COALESCE(OLD.total_completion_time_minutes, 0) + COALESCE(NEW.estimated_duration_minutes, 30);
    NEW.average_completion_time_minutes := NEW.total_completion_time_minutes / NEW.completion_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic completion stats update
DROP TRIGGER IF EXISTS trigger_update_completion_stats ON tasks;
CREATE TRIGGER trigger_update_completion_stats
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_completion_stats();

-- Add RLS policies for new fields
-- (These should already be covered by existing policies, but let's make sure)
CREATE POLICY IF NOT EXISTS "Users can view own recurring tasks" ON tasks 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own recurring tasks" ON tasks 
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON tasks TO authenticated; 