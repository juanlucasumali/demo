import { useState } from "react"
import { Card } from "../ui/card"
import { Progress } from "../ui/progress"
import { useToast } from '@renderer/hooks/use-toast';
import { processAudioFile, makeWav, audioToRawWave } from './audioProcessing'
import { Button } from "../ui/button";

interface AudioConverterProps {
  files: File[]
  conversionType: {
    input: string
    output: string
  }
  onConversionComplete?: () => void
}

export function AudioConverter({ files, conversionType, onConversionComplete }: AudioConverterProps) {
  const [progress, setProgress] = useState(0)
  const [converting, setConverting] = useState(false)
  const { toast } = useToast()

  const convertToWav = async (file: File): Promise<void> => {
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
      const url = URL.createObjectURL(wavBlob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.[^/.]+$/, '.wav')
      a.click()
      
      URL.revokeObjectURL(url)
      
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const handleConversion = async () => {
    setConverting(true)
    setProgress(0)
    
    try {
      for (let i = 0; i < files.length; i++) {
        await convertToWav(files[i])
        setProgress(((i + 1) / files.length) * 100)
      }
      
      toast({
        title: "Success",
        description: "All files converted successfully",
      })
      
      onConversionComplete?.()
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


  return (
    <Card className="p-4">
      <div className="space-y-4">
        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Files to convert:</h3>
            <ul className="text-sm">
              {files.map((file, index) => (
                <li key={index} className="text-muted-foreground">
                  {file.name}
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
            disabled={files.length === 0}
          >
            Convert to {conversionType.output.toUpperCase()}
          </Button>
        )}
      </div>
    </Card>
  )
}