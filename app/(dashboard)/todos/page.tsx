"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Calendar, Clock, Filter, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/supabase/types"

type Todo = Database["public"]["Tables"]["todos"]["Row"]
type TodoInsert = Database["public"]["Tables"]["todos"]["Insert"]

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all")

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  })

  // Client-side auth protection
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Todos page auth check:", {
          hasAuthUser: !!user,
          hasDirectSession: !!session,
        })

        if (!session?.user) {
          console.log("No valid session found, redirecting to login")
          router.replace("/login")
          return
        }

        console.log("Valid session found, staying on todos page")
        setAuthChecked(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.replace("/login")
      }
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router, user])

  // Fetch todos
  const fetchTodos = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        console.log("No session for fetching todos")
        return
      }

      console.log("Fetching todos for user:", session.user.id)
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      console.log("Todos fetched:", data?.length || 0)
      setTodos(data || [])
    } catch (error) {
      console.error("Error fetching todos:", error)
      toast({
        title: "Error",
        description: "Failed to load todos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authChecked) {
      fetchTodos()
    }
  }, [authChecked])

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    const statusMatch = filter === "all" || (filter === "completed" ? todo.completed : !todo.completed)
    const priorityMatch = priorityFilter === "all" || todo.priority === priorityFilter
    return statusMatch && priorityMatch
  })

  // Handle todo completion toggle
  const toggleTodoComplete = async (todoId: string, completed: boolean) => {
    try {
      const { error } = await supabase.from("todos").update({ completed }).eq("id", todoId)

      if (error) throw error

      setTodos(todos.map((todo) => (todo.id === todoId ? { ...todo, completed } : todo)))

      toast({
        title: "Success",
        description: completed ? "Todo marked as completed" : "Todo marked as pending",
      })
    } catch (error) {
      console.error("Error updating todo:", error)
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      })
    }
  }

  // Handle todo save
  const handleSaveTodo = async () => {
    if (!formData.title.trim()) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to save todos",
          variant: "destructive",
        })
        return
      }

      const todoData: TodoInsert = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        user_id: session.user.id,
      }

      if (selectedTodo) {
        // Update existing todo
        const { error } = await supabase.from("todos").update(todoData).eq("id", selectedTodo.id)
        if (error) throw error

        toast({
          title: "Success",
          description: "Todo updated successfully",
        })
      } else {
        // Create new todo
        const { error } = await supabase.from("todos").insert(todoData)
        if (error) throw error

        toast({
          title: "Success",
          description: "Todo created successfully",
        })
      }

      fetchTodos()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving todo:", error)
      toast({
        title: "Error",
        description: "Failed to save todo",
        variant: "destructive",
      })
    }
  }

  // Handle todo delete
  const handleDeleteTodo = async (todoId: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", todoId)
      if (error) throw error

      setTodos(todos.filter((todo) => todo.id !== todoId))
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting todo:", error)
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      })
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    })
    setSelectedTodo(null)
  }

  // Open dialog for new todo
  const handleAddTodo = () => {
    resetForm()
    setDialogOpen(true)
  }

  // Open dialog for editing todo
  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo)
    setFormData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      due_date: todo.due_date ? format(new Date(todo.due_date), "yyyy-MM-dd'T'HH:mm") : "",
    })
    setDialogOpen(true)
  }

  // Show loading while checking auth or loading todos
  if (!authChecked || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{!authChecked ? "Checking authentication..." : "Loading todos..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Todos</h1>
          <p className="text-muted-foreground">Manage your tasks and stay organized</p>
        </div>
        <Button onClick={handleAddTodo}>
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Todos List */}
      <div className="flex-1 overflow-auto">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No todos found</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first todo</p>
                <Button onClick={handleAddTodo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Todo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <Card key={todo.id} className={todo.completed ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={(checked) => toggleTodoComplete(todo.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${todo.completed ? "line-through" : ""}`}>{todo.title}</h3>
                        <Badge className={PRIORITY_COLORS[todo.priority]}>{todo.priority}</Badge>
                      </div>
                      {todo.description && <p className="text-sm text-muted-foreground mb-2">{todo.description}</p>}
                      {todo.due_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Due: {format(new Date(todo.due_date), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTodo(todo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTodo(todo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Todo Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedTodo ? "Edit Todo" : "Create Todo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Todo title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Todo description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTodo} disabled={!formData.title.trim()}>
              {selectedTodo ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
