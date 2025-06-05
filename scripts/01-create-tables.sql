-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  location TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_all_day BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- RRULE format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todos table
CREATE TABLE public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meeting_requests table
CREATE TABLE public.meeting_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER DEFAULT 15,
  location TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('in-person', 'video', 'phone')) DEFAULT 'video',
  is_active BOOLEAN DEFAULT TRUE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability_slots table
CREATE TABLE public.availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_request_id UUID REFERENCES public.meeting_requests(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL, -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC'
);

-- Create booked_meetings table
CREATE TABLE public.booked_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_request_id UUID REFERENCES public.meeting_requests(id) ON DELETE CASCADE NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_todos_user_id ON public.todos(user_id);
CREATE INDEX idx_todos_due_date ON public.todos(due_date);
CREATE INDEX idx_meeting_requests_organizer_id ON public.meeting_requests(organizer_id);
CREATE INDEX idx_meeting_requests_slug ON public.meeting_requests(slug);
CREATE INDEX idx_booked_meetings_start_time ON public.booked_meetings(start_time);
