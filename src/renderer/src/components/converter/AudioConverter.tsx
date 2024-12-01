import { useState } from "react"
import { Card } from "../ui/card"
import { Progress } from "../ui/progress"
import { useToast } from '@renderer/hooks/use-toast';
import { processAudioFile, makeWav, audioToRawWave } from './audioProcessing'
import { Button } from "../ui/button";
import { Download } from "lucide-react";

export interface ConvertedFile {
  originalName: string;
  blob: Blob;
  downloaded: boolean;
}

interface AudioConverterProps {
  files: File[]
  conversionType: {
    input: string
    output: string
  }
  onConversionComplete?: (convertedFiles: ConvertedFile[]) => void
}

export function AudioConverter({ files, conversionType, onConversionComplete }: AudioConverterProps) {
  const [progress, setProgress] = useState(0)
  const [converting, setConverting] = useState(false)
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const { toast } = useToast()

  const convertToWav = async (file: File): Promise<ConvertedFile> => {
    try {
      const audioContext = new AudioContext()
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      const processedBuffer = await processAudioFile(audioBuffer, 'both', 44100)
      const rawData = audioToRawWave(
        [processedBuffer.getChannelData(0), processedBuffer.getChannelData(1)],
        2
      )
      
      const wavBlob = makeWav(rawData, 2, 44100, 2)
      
      return {
        originalName: file.name,
        blob: wavBlob,
        downloaded: false
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const handleConversion = async () => {
    setConverting(true)
    setProgress(0)
    const converted: ConvertedFile[] = []
    
    try {
      for (let i = 0; i < files.length; i++) {
        const convertedFile = await convertToWav(files[i])
        converted.push(convertedFile)
        setProgress(((i + 1) / files.length) * 100)
      }
      
      setConvertedFiles(converted)
      toast({
        title: "Success",
        description: "All files converted successfully",
      })
      
      onConversionComplete?.(converted)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert some files",
        variant: "destructive",
      })
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = (file: ConvertedFile) => {
    const url = URL.createObjectURL(file.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.originalName.replace(/\.[^/.]+$/, '.wav')
    a.click()
    URL.revokeObjectURL(url)
    
    // Mark file as downloaded
    setConvertedFiles(prev => 
      prev.map(f => 
        f === file ? { ...f, downloaded: true } : f
      )
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Files to convert:</h3>
            <ul className="text-sm">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{file.name}</span>
                  {convertedFiles[index] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(convertedFiles[index])}
                      className={convertedFiles[index].downloaded ? "text-green-500" : ""}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {converting ? (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Converting... {Math.round(progress)}%
            </p>
          </div>
        ) : (
          <Button 
            onClick={handleConversion}
            className="w-full"
            disabled={files.length === 0 || convertedFiles.length > 0}
          >
            Convert to {conversionType.output.toUpperCase()}
          </Button>
        )}
      </div>
    </Card>
  )
}