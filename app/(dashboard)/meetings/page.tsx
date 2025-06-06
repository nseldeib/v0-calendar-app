"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Users, Copy, ExternalLink, Settings, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/supabase/types"

type MeetingRequest = Database["public"]["Tables"]["meeting_requests"]["Row"]
type MeetingRequestInsert = Database["public"]["Tables"]["meeting_requests"]["Insert"]

export default function MeetingsPage() {
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRequest | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 30,
    buffer_minutes: 15,
    location: "",
    meeting_type: "video" as "in-person" | "video" | "phone",
    is_active: true,
  })

  // Client-side auth protection
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Meetings page auth check:", {
          hasAuthUser: !!user,
          hasDirectSession: !!session,
        })

        if (!session?.user) {
          console.log("No valid session found, redirecting to login")
          router.replace("/login")
          return
        }

        console.log("Valid session found, staying on meetings page")
        setAuthChecked(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.replace("/login")
      }
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router, user])

  // Fetch meeting requests
  const fetchMeetingRequests = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        console.log("No session for fetching meeting requests")
        return
      }

      console.log("Fetching meeting requests for user:", session.user.id)
      const { data, error } = await supabase
        .from("meeting_requests")
        .select("*")
        .eq("organizer_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      console.log("Meeting requests fetched:", data?.length || 0)
      setMeetingRequests(data || [])
    } catch (error) {
      console.error("Error fetching meeting requests:", error)
      toast({
        title: "Error",
        description: "Failed to load meeting requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authChecked) {
      fetchMeetingRequests()
    }
  }, [authChecked])

  // Generate unique slug
  const generateSlug = (title: string) => {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    return `${baseSlug}-${randomSuffix}`
  }

  // Handle save meeting request
  const handleSaveMeetingRequest = async () => {
    if (!formData.title.trim()) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to save meeting requests",
          variant: "destructive",
        })
        return
      }

      const meetingData: MeetingRequestInsert = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        duration_minutes: formData.duration_minutes,
        buffer_minutes: formData.buffer_minutes,
        location: formData.location.trim() || null,
        meeting_type: formData.meeting_type,
        is_active: formData.is_active,
        organizer_id: session.user.id,
        slug: selectedMeeting ? selectedMeeting.slug : generateSlug(formData.title),
      }

      if (selectedMeeting) {
        // Update existing meeting request
        const { error } = await supabase.from("meeting_requests").update(meetingData).eq("id", selectedMeeting.id)
        if (error) throw error

        toast({
          title: "Success",
          description: "Meeting request updated successfully",
        })
      } else {
        // Create new meeting request
        const { error } = await supabase.from("meeting_requests").insert(meetingData)
        if (error) throw error

        toast({
          title: "Success",
          description: "Meeting request created successfully",
        })
      }

      fetchMeetingRequests()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving meeting request:", error)
      toast({
        title: "Error",
        description: "Failed to save meeting request",
        variant: "destructive",
      })
    }
  }

  // Handle delete meeting request
  const handleDeleteMeetingRequest = async (meetingId: string) => {
    try {
      const { error } = await supabase.from("meeting_requests").delete().eq("id", meetingId)
      if (error) throw error

      setMeetingRequests(meetingRequests.filter((meeting) => meeting.id !== meetingId))
      toast({
        title: "Success",
        description: "Meeting request deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting meeting request:", error)
      toast({
        title: "Error",
        description: "Failed to delete meeting request",
        variant: "destructive",
      })
    }
  }

  // Toggle meeting active status
  const toggleMeetingActive = async (meetingId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("meeting_requests").update({ is_active: isActive }).eq("id", meetingId)

      if (error) throw error

      setMeetingRequests(
        meetingRequests.map((meeting) => (meeting.id === meetingId ? { ...meeting, is_active: isActive } : meeting)),
      )

      toast({
        title: "Success",
        description: isActive ? "Meeting request activated" : "Meeting request deactivated",
      })
    } catch (error) {
      console.error("Error updating meeting request:", error)
      toast({
        title: "Error",
        description: "Failed to update meeting request",
        variant: "destructive",
      })
    }
  }

  // Copy booking link
  const copyBookingLink = (slug: string) => {
    const bookingUrl = `${window.location.origin}/book/${slug}`
    navigator.clipboard.writeText(bookingUrl)
    toast({
      title: "Success",
      description: "Booking link copied to clipboard",
    })
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration_minutes: 30,
      buffer_minutes: 15,
      location: "",
      meeting_type: "video",
      is_active: true,
    })
    setSelectedMeeting(null)
  }

  // Open dialog for new meeting
  const handleAddMeeting = () => {
    resetForm()
    setDialogOpen(true)
  }

  // Open dialog for editing meeting
  const handleEditMeeting = (meeting: MeetingRequest) => {
    setSelectedMeeting(meeting)
    setFormData({
      title: meeting.title,
      description: meeting.description || "",
      duration_minutes: meeting.duration_minutes,
      buffer_minutes: meeting.buffer_minutes,
      location: meeting.location || "",
      meeting_type: meeting.meeting_type,
      is_active: meeting.is_active,
    })
    setDialogOpen(true)
  }

  // Show loading while checking auth or loading meetings
  if (!authChecked || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{!authChecked ? "Checking authentication..." : "Loading meetings..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meeting Requests</h1>
          <p className="text-muted-foreground">Create shareable booking links for meetings</p>
        </div>
        <Button onClick={handleAddMeeting}>
          <Plus className="h-4 w-4 mr-2" />
          Create Meeting Request
        </Button>
      </div>

      {/* Meeting Requests List */}
      <div className="flex-1 overflow-auto">
        {meetingRequests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No meeting requests</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first meeting request to start accepting bookings
                </p>
                <Button onClick={handleAddMeeting}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Meeting Request
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {meetingRequests.map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {meeting.title}
                        <Badge variant={meeting.is_active ? "default" : "secondary"}>
                          {meeting.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      {meeting.description && (
                        <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={meeting.is_active}
                        onCheckedChange={(checked) => toggleMeetingActive(meeting.id, checked)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleEditMeeting(meeting)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteMeetingRequest(meeting.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{meeting.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Buffer</p>
                      <p className="text-sm text-muted-foreground">{meeting.buffer_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground capitalize">{meeting.meeting_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{meeting.location || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyBookingLink(meeting.slug)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/book/${meeting.slug}`, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedMeeting ? "Edit Meeting Request" : "Create Meeting Request"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Meeting title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) || 30 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buffer">Buffer (minutes)</Label>
                <Input
                  id="buffer"
                  type="number"
                  min="0"
                  max="60"
                  value={formData.buffer_minutes}
                  onChange={(e) => setFormData({ ...formData, buffer_minutes: Number.parseInt(e.target.value) || 15 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meeting Type</Label>
              <Select
                value={formData.meeting_type}
                onValueChange={(value: any) => setFormData({ ...formData, meeting_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Meeting location (optional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Active (accepting bookings)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMeetingRequest} disabled={!formData.title.trim()}>
              {selectedMeeting ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
