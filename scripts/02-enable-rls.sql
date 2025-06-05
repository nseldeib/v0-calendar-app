-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booked_meetings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events policies
CREATE POLICY "Users can manage own events" ON public.events
  FOR ALL USING (auth.uid() = user_id);

-- Todos policies
CREATE POLICY "Users can manage own todos" ON public.todos
  FOR ALL USING (auth.uid() = user_id);

-- Meeting requests policies
CREATE POLICY "Users can manage own meeting requests" ON public.meeting_requests
  FOR ALL USING (auth.uid() = organizer_id);

CREATE POLICY "Anyone can view active meeting requests" ON public.meeting_requests
  FOR SELECT USING (is_active = true);

-- Availability slots policies
CREATE POLICY "Users can manage availability for own meeting requests" ON public.availability_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meeting_requests 
      WHERE id = meeting_request_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view availability for active meeting requests" ON public.availability_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meeting_requests 
      WHERE id = meeting_request_id AND is_active = true
    )
  );

-- Booked meetings policies
CREATE POLICY "Users can view meetings for own requests" ON public.booked_meetings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meeting_requests 
      WHERE id = meeting_request_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can book meetings" ON public.booked_meetings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update meetings for own requests" ON public.booked_meetings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.meeting_requests 
      WHERE id = meeting_request_id AND organizer_id = auth.uid()
    )
  );
