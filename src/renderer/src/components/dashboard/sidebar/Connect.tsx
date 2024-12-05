import { FC } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { useUser } from '@renderer/hooks/useUser';
import { Alert, AlertDescription } from "../../ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"

export const Connect: FC = () => {
  const { user, setLocalPath, error, isLoading } = useUser();

  const handleConnect = async () => {
    try {
      if (!window.electron?.showOpenDialog) {
        console.error('showOpenDialog is not available');
        return;
      }
  
      const result = await window.electron.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select or Create Folder',
        buttonLabel: 'Select Folder'
      });
  
      if (!result.canceled && result.filePaths.length > 0) {
        await setLocalPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };  

  const steps = [
    {
      title: "Set Local Path",
      description: "Choose a folder where your audio files will be stored",
      action: handleConnect,
      actionLabel: "Select Folder",
      status: user?.local_path ? 'complete' : 'pending'
    },
    {
      title: "Download VST Plugin",
      description: "Download our VST plugin for your DAW",
      action: () => window.open('https://yourwebsite.com/downloads', '_blank'),
      actionLabel: "Download Plugin",
      status: 'pending' // You might want to track this status in your database
    },
    {
      title: "Install Plugin",
      description: "Copy the downloaded plugin to your DAW's VST folder:",
      details: [
        "Windows: C:\\Program Files\\Common Files\\VST3",
        "Mac: /Library/Audio/Plug-Ins/VST3",
      ]
    },
    {
      title: "Configure DAW",
      description: "Set up the plugin in your DAW:",
      details: [
        "1. Open your DAW",
        "2. Scan for new plugins",
        "3. Add our plugin to a track",
        "4. Enable MIDI input/output in the plugin settings"
      ]
    }
  ];

  if (isLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="flex-none p-6 border-b">
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            {user?.local_path ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Current local path: {user.local_path}</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Local path not set</span>
              </>
            )}
          </AlertDescription>
        </Alert>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect to Your DAW</CardTitle>
              <CardDescription>
                Follow these steps to connect your DAW to our application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${step.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                      {step.status === 'complete' ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      {step.details && (
                        <ul className="text-sm text-muted-foreground list-none pl-4 space-y-1">
                          {step.details.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      )}
                      {step.action && (
                        <Button 
                          onClick={step.action}
                          variant={step.status === 'complete' ? "outline" : "default"}
                          className="mt-2"
                        >
                          {step.status === 'complete' ? "✓ Complete" : step.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
