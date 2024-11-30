// components/ConversionDialog.tsx
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { useToast } from '@renderer/hooks/use-toast';

interface ConversionDialogProps {
  onConvert: (files: File[], format: string) => Promise<void>
  onYoutubeDownload: (url: string, format: string) => Promise<void>
}

export function ConversionDialog({ onConvert, onYoutubeDownload }: ConversionDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [format, setFormat] = useState("mp3")
  const { toast } = useToast()

  const handleFileConversion = async () => {
    if (!selectedFiles?.length) {
      toast({
        title: "Error",
        description: "Please select files to convert",
        variant: "destructive",
      })
      return
    }

    await onConvert(Array.from(selectedFiles), format)
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

  return (
    <Dialog>
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
                <Label>Select Files</Label>
                <Input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
              </div>
              
              <RadioGroup value={format} onValueChange={setFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mp3" id="mp3" />
                  <Label htmlFor="mp3">Convert to MP3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wav" id="wav" />
                  <Label htmlFor="wav">Convert to WAV</Label>
                </div>
              </RadioGroup>
              
              <Button onClick={handleFileConversion}>Convert</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="youtube">
            <div className="space-y-4">
              <div>
                <Label>YouTube URL</Label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              
              <RadioGroup value={format} onValueChange={setFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mp3" id="yt-mp3" />
                  <Label htmlFor="yt-mp3">Download as MP3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wav" id="yt-wav" />
                  <Label htmlFor="yt-wav">Download as WAV</Label>
                </div>
              </RadioGroup>
              
              <Button onClick={handleYoutubeDownload}>Download</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
