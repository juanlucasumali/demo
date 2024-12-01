import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useToast } from '@renderer/hooks/use-toast';
import { AudioConverter } from "../components/converter/AudioConverter"

type ConversionType = {
  input: 'mp3'
  output: 'wav'
} | null

interface ConversionDialogProps {
  onYoutubeDownload: (url: string, format: string) => Promise<void>
}

export function ConversionDialog({ onYoutubeDownload }: ConversionDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [format, setFormat] = useState("mp3")
  const [open, setOpen] = useState(false)
  const [conversionType, setConversionType] = useState<ConversionType>(null)
  const { toast } = useToast()

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      // Check if all files match the selected input format
      const validFiles = files.filter(file => 
        file.type === `audio/${conversionType?.input}` || 
        file.name.toLowerCase().endsWith(`.${conversionType?.input}`)
      )

      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid file type",
          description: `Please select only ${conversionType?.input.toUpperCase()} files`,
          variant: "destructive",
        })
        e.target.value = '' // Reset input
        return
      }

      setSelectedFiles(validFiles)
    }
  }

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      })
      return
    }

    await onYoutubeDownload(youtubeUrl, format)
  }

  const handleConversionComplete = () => {
    setSelectedFiles([])
    setConversionType(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Convert Audio</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert Audio</DialogTitle>
          <DialogDescription>
            Convert audio files or download from YouTube
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">File Conversion</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Download</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <div className="space-y-4">
              <div>
                <Label>Conversion Type</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedFiles([]) // Clear files when changing conversion type
                    setConversionType(value === 'mp3-to-wav' ? { input: 'mp3', output: 'wav' } : null)
                  }}
                  value={conversionType ? 'mp3-to-wav' : ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select conversion type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3-to-wav">MP3 to WAV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {conversionType && (
                <div>
                  <Label>Select {conversionType.input.toUpperCase()} Files</Label>
                  <Input
                    type="file"
                    multiple
                    accept={`.${conversionType.input}`}
                    onChange={handleFileSelection}
                  />
                </div>
              )}
              
              {selectedFiles.length > 0 && conversionType && (
                <AudioConverter 
                  files={selectedFiles}
                  conversionType={conversionType}
                  onConversionComplete={handleConversionComplete}
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="youtube">
            {/* YouTube section remains the same */}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}