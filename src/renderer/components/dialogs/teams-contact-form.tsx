import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@renderer/components/ui/form"
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { useToast } from "@renderer/hooks/use-toast"
import { z } from "zod"
import { formService } from "@renderer/services/form-service"
import { useState } from "react"

const teamsContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  teamSize: z.string().min(1, "Please select your team size"),
  message: z.string().min(10, "Message must be at least 10 characters").max(500, "Message must be less than 500 characters"),
})

type TeamsContactFormData = z.infer<typeof teamsContactSchema>

interface TeamsContactFormProps {
  onBack: () => void
}

export function TeamsContactForm({ onBack }: TeamsContactFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<TeamsContactFormData>({
    resolver: zodResolver(teamsContactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      teamSize: "",
      message: "",
    },
  })

  async function onSubmit(data: TeamsContactFormData) {
    try {
      setIsSubmitting(true)
      await formService.submitTeamsContactForm(data)
      
      toast({
        title: "Message Sent",
        description: "We'll get back to you shortly about the Teams plan.",
      })
      onBack()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Contact Us</h2>
        <p className="text-white/80">Tell us about your team and we'll get back to you with custom pricing.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    className="bg-white/10 border-white/20 text-white"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="john@company.com" 
                    {...field} 
                    className="bg-white/10 border-white/20 text-white"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Company</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Company Name" 
                    {...field} 
                    className="bg-white/10 border-white/20 text-white"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="teamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Team Size</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="w-full rounded-md border border-white/20 bg-white/10 text-white px-3 py-2"
                    disabled={isSubmitting}
                  >
                    <option value="">Select team size</option>
                    <option value="1-5">1-5 people</option>
                    <option value="5-10">5-10 people</option>
                    <option value="11-25">11-25 people</option>
                    <option value="26-50">26-50 people</option>
                    <option value="51-100">51-100 people</option>
                    <option value="100+">100+ people</option>
                  </select>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Message</FormLabel>
                <FormControl>
                  <textarea 
                    {...field} 
                    placeholder="Tell us about your team's needs..."
                    className="w-full rounded-md border border-white/20 bg-white/10 text-white px-3 py-2 min-h-[100px]"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <div className="flex gap-4 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 