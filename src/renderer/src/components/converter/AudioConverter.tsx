import { useState } from "react";
import { Card } from "../ui/card";
import { useToast } from "@renderer/hooks/use-toast";
import { processAudioFile, makeWav, audioToRawWave } from "./audioProcessing";
import { Button } from "../ui/button";
import { Download, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

export interface ConvertedFile {
  originalName: string;
  blob: Blob | null;
  downloaded: boolean;
  converting: boolean;
  error?: boolean;
  targetFormat: "wav" | "mp3";
}

interface AudioConverterProps {
  files: File[];
}

export function AudioConverter({ files }: AudioConverterProps) {
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>(
    files.map((file) => ({
      originalName: file.name,
      blob: null,
      downloaded: false,
      converting: false,
      error: false,
      targetFormat: file.name.toLowerCase().endsWith(".mp3") ? "wav" : "mp3",
    }))
  );
  const { toast } = useToast();

  const convertToWav = async (file: File): Promise<Blob> => {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const processedBuffer = await processAudioFile(audioBuffer, "both", 44100);
    const rawData = audioToRawWave(
      [processedBuffer.getChannelData(0), processedBuffer.getChannelData(1)],
      2
    );

    return makeWav(rawData, 2, 44100, 2);
  };

  const convertToMp3 = async (file: File): Promise<Blob> => {
    const buffer = await file.arrayBuffer();
    const mp3Buffer = await window.api.convertToMp3(Buffer.from(buffer));
    return new Blob([mp3Buffer], { type: "audio/mp3" });
  };

  const convertSingleFile = async (fileIndex: number) => {
    const currentFile = convertedFiles[fileIndex];
    if (currentFile.converting || currentFile.blob) return;

    setConvertedFiles((prev) =>
      prev.map((file, i) =>
        i === fileIndex ? { ...file, converting: true, error: false } : file
      )
    );

    try {
      const targetFormat = currentFile.targetFormat;
      const blob =
        targetFormat === "wav"
          ? await convertToWav(files[fileIndex])
          : await convertToMp3(files[fileIndex]);

      setConvertedFiles((prev) =>
        prev.map((file, i) =>
          i === fileIndex ? { ...file, blob, converting: false } : file
        )
      );
      toast({
        title: "Success",
        description: `${files[fileIndex].name} converted successfully`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      setConvertedFiles((prev) =>
        prev.map((file, i) =>
          i === fileIndex ? { ...file, converting: false, error: true } : file
        )
      );
      toast({
        title: "Error",
        description: `Failed to convert ${files[fileIndex].name}`,
        variant: "destructive",
      });
    }
  };

  const handleConvertAll = async () => {
    const unconvertedIndexes = convertedFiles
      .map((file, index) => ({ file, index }))
      .filter(({ file }) => !file.blob && !file.converting)
      .map(({ index }) => index);

    for (const index of unconvertedIndexes) {
      await convertSingleFile(index);
    }
  };

  const handleDownload = (fileIndex: number) => {
    const file = convertedFiles[fileIndex];
    if (!file.blob) return;

    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.originalName.replace(
      /\.[^/.]+$/,
      `.${file.targetFormat}`
    );
    a.click();
    URL.revokeObjectURL(url);

    setConvertedFiles((prev) =>
      prev.map((f, i) =>
        i === fileIndex ? { ...f, downloaded: true } : f
      )
    );
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Files to convert:</h3>
            <ul className="text-sm">
              {files.map((file, index) => (
                <li
                  key={file.name}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-muted-foreground">{file.name}</span>
                  <div className="flex gap-2">
                    {convertedFiles[index].error ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => convertSingleFile(index)}
                        className="text-red-500"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    ) : convertedFiles[index].blob ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(index)}
                        className={
                          convertedFiles[index].downloaded
                            ? "text-green-500"
                            : ""
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => convertSingleFile(index)}
                        disabled={convertedFiles[index].converting}
                      >
                        {convertedFiles[index].converting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleConvertAll}
          className="w-full"
          disabled={
            files.length === 0 ||
            convertedFiles.every((f) => f.blob || f.converting)
          }
        >
          Convert All
        </Button>
      </div>
    </Card>
  );
}