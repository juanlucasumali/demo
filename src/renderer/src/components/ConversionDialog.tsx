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
import { RefreshCw } from "lucide-react";

type ConversionType =
  | {
      input: "mp3" | "wav";
      output: "mp3" | "wav";
    }
  | null;

export function ConversionDialog() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
            Convert your audio files between formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
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
      </DialogContent>
    </Dialog>
  );
}
