import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "@renderer/hooks/use-toast";
import { AudioConverter } from "../components/converter/AudioConverter";
import { isValidYoutubeUrl } from "@renderer/lib/files";
import { Loader2, RefreshCw } from "lucide-react";

type ConversionType =
  | {
      input: "mp3" | "wav";
      output: "mp3" | "wav";
    }
  | null;

type YouTubeDownload = {
  id: string;
  title: string;
  url: string;
  blob: Blob;
  downloaded: boolean;
};

export function ConversionDialog() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [youtubeDownloads, setYoutubeDownloads] = useState<YouTubeDownload[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeOutputFormat, setYoutubeOutputFormat] = useState<"mp3" | "wav">(
    "mp3"
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [open, setOpen] = useState(false);
  const [conversionType, setConversionType] = useState<ConversionType>(null);
  const { toast } = useToast();

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Check if all files match the selected input format
      const validFiles = files.filter(
        (file) =>
          file.type === `audio/${conversionType?.input}` ||
          file.name.toLowerCase().endsWith(`.${conversionType?.input}`)
      );

      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid file type",
          description: `Please select only ${conversionType?.input.toUpperCase()} files`,
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      setSelectedFiles(validFiles);
    }
  };

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidYoutubeUrl(youtubeUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDownloading(true);

      // Assuming you're using Electron and have access to Node.js APIs
      const os = window.require("os");
      const fs = window.require("fs").promises;
      const path = window.require("path");

      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "yt-download-"));

      const { Downloader } = window.require("ytdl-mp3");
      const downloader = new Downloader({
        outputDir: tempDir,
        silentMode: true,
      });

      // Download to temp directory
      const result = await downloader.downloadSong(youtubeUrl);

      // Read the file into memory
      const fileData = await fs.readFile(result);

      // Create blob from file data
      const blob = new Blob([fileData], { type: "audio/mp3" });

      const videoIdMatch = youtubeUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      const videoId = videoIdMatch?.[1] || "unknown";

      // Add to downloads list
      setYoutubeDownloads((prev) => [
        ...prev,
        {
          id: videoId,
          title: `youtube-audio-${videoId}.${youtubeOutputFormat}`,
          url: youtubeUrl,
          blob: blob,
          downloaded: false,
        },
      ]);

      // Clean up: delete the temp file and directory
      await fs.unlink(result);
      await fs.rmdir(tempDir, { recursive: true });

      setYoutubeUrl("");

      toast({
        title: "Success",
        description: `Audio converted successfully to ${youtubeOutputFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("YouTube download error:", error);
      toast({
        title: "Error",
        description: "Failed to download audio",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle downloads from the list
  const handleYoutubeFileDownload = (download: YouTubeDownload) => {
    const url = URL.createObjectURL(download.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-audio-${download.id}.${youtubeOutputFormat}`; // Use selected format in filename
    a.click();
    URL.revokeObjectURL(url);

    setYoutubeDownloads((prev) =>
      prev.map((d) => (d.id === download.id ? { ...d, downloaded: true } : d))
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Convert Audio
          </Button>
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
                    setSelectedFiles([]); // Clear files when changing conversion type
                    switch (value) {
                      case "mp3-to-wav":
                        setConversionType({ input: "mp3", output: "wav" });
                        break;
                      case "wav-to-mp3":
                        setConversionType({ input: "wav", output: "mp3" });
                        break;
                      default:
                        setConversionType(null);
                    }
                  }}
                  value={
                    conversionType
                      ? `${conversionType.input}-to-${conversionType.output}`
                      : ""
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select conversion type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3-to-wav">MP3 to WAV</SelectItem>
                    <SelectItem value="wav-to-mp3">WAV to MP3</SelectItem>
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
                <AudioConverter files={selectedFiles} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="youtube">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select
                  value={youtubeOutputFormat}
                  onValueChange={(value: "mp3" | "wav") =>
                    setYoutubeOutputFormat(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select output format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input
                  placeholder="Enter YouTube URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>

              <Button
                onClick={handleYoutubeDownload}
                disabled={isDownloading || !youtubeUrl}
                className="w-full"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isDownloading
                  ? "Converting..."
                  : `Convert to ${youtubeOutputFormat.toUpperCase()}`}
              </Button>

              {youtubeDownloads.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Converted Files</Label>
                  <div className="space-y-2">
                    {youtubeDownloads.map((download) => (
                      <div
                        key={download.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="truncate mr-2">{download.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleYoutubeFileDownload(download)}
                        >
                          {download.downloaded ? "Downloaded" : "Download"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
