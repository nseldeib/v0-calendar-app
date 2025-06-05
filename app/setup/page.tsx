"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ step: string; success: boolean; message: string }[]>([])

  const runSetup = async () => {
    setLoading(true)
    setResults([])

    const steps = [
      {
        name: "Create profiles table",
        sql: `
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            timezone TEXT DEFAULT 'UTC',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "Create events table",
        sql: `
          CREATE TABLE IF NOT EXISTS public.events (
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
            recurrence_rule TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "Create todos table",
        sql: `
          CREATE TABLE IF NOT EXISTS public.todos (
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
        `,
      },
      {
        name: "Enable RLS on profiles",
        sql: `
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
          CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
          
          DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
          CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
          
          DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
          CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
        `,
      },
      {
        name: "Enable RLS on events",
        sql: `
          ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Users can manage own events" ON public.events;
          CREATE POLICY "Users can manage own events" ON public.events
            FOR ALL USING (auth.uid() = user_id);
        `,
      },
      {
        name: "Enable RLS on todos",
        sql: `
          ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Users can manage own todos" ON public.todos;
          CREATE POLICY "Users can manage own todos" ON public.todos
            FOR ALL USING (auth.uid() = user_id);
        `,
      },
    ]

    for (const step of steps) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql_query: step.sql })

        if (error) {
          setResults((prev) => [...prev, { step: step.name, success: false, message: error.message }])
        } else {
          setResults((prev) => [...prev, { step: step.name, success: true, message: "Success" }])
        }
      } catch (error) {
        setResults((prev) => [...prev, { step: step.name, success: false, message: "Failed to execute" }])
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Set up the required database tables and policies for your calendar app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will create the necessary database tables. Run this once after setting up your Supabase project.
            </AlertDescription>
          </Alert>

          <Button onClick={runSetup} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Setting up database..." : "Run Database Setup"}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Setup Results:</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={result.success ? "text-green-700" : "text-red-700"}>
                    {result.step}: {result.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && results.every((r) => r.success) && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Database setup completed successfully! You can now use the calendar app.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
