import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog"
import { Input } from "@/renderer/components/ui/input"
import { Button } from "@/renderer/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/renderer/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card"
import { Badge } from "@/renderer/components/ui/badge"
import { ScrollArea } from "@/renderer/components/ui/scroll-area"
import { IconX, IconSend, IconLoader2 } from "@tabler/icons-react"
import { Project } from '@/renderer/components/layout/types'
import { useToast } from "@/renderer/hooks/use-toast"
import { useCollabStore } from '@/renderer/stores/useCollabStore'
import { useAuth } from '@/renderer/stores/useAuthStore'

interface Collaborator {
  id: string
  username: string
  avatarUrl: string
  isPending: boolean
}

interface ShareProjectDialogProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ShareProjectDialog({ project, isOpen, onClose }: ShareProjectDialogProps) {
    if (!project) return
    const { collaborators, isLoading, addCollaborator, removeCollaborator, fetchCollaborators } = useCollabStore()
    const { user } = useAuth() // Your auth hook
    const [username, setUsername] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
  
    // Fetch collaborators when dialog opens
    useEffect(() => {
      if (isOpen && project.id) {
        fetchCollaborators(project.id)
      }
    }, [isOpen, project.id, fetchCollaborators])
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user) return
  
      setIsSubmitting(true)
      try {
        await addCollaborator(project.id, username, user.id)
        setUsername('')
        toast({
          title: "Success",
          description: `${username} has been added to the project`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to add collaborator",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  
    const handleRemoveCollaborator = async (userId: string) => {
      try {
        await removeCollaborator(project.id, userId)
        toast({
          title: "Success",
          description: "Collaborator has been removed",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove collaborator",
          variant: "destructive",
        })
      }
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[475px]"
        >
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on "{project.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Username Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!username || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <IconSend className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </form>

          {/* Current Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">People with access</CardTitle>
              <CardDescription>
                {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px] px-6">
                <div className="space-y-4 pb-4">
                  {collaborators.map(collaborator => (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between group rounded-lg p-2 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage 
                            src={collaborator.avatar || ''} 
                            alt={collaborator.username} 
                            />
                            <AvatarFallback>
                            {collaborator.displayName[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                            <span className="text-sm font-medium">
                                {collaborator.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                @{collaborator.username}
                            </span>
                            </div>
                        </div>
                        </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
