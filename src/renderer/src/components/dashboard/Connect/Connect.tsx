import { FC } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { useUser } from '@renderer/hooks/useUser';
import { Alert, AlertDescription } from "../../ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@renderer/hooks/use-toast"
import { LocalFolderSync } from './LocalFolderSync' // We'll create this component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { useItems } from '@renderer/hooks/useItems';

export const Connect: FC = () => {
  const { user, setLocalPath, error: userError, isLoading: userLoading } = useUser();
  const { createLocalFolderStructure } = useItems();
  const { toast } = useToast();

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set local path"
      });
    }
  };

  const handleCreateFolderStructure = async () => {
    if (!user?.local_path) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please set a local path first"
      });
      return;
    }

    try {
      await createLocalFolderStructure(user.local_path);
      toast({
        title: "Success",
        description: "Folder structure created successfully"
      });
    } catch (error) {
      console.error('Error creating folder structure:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create folder structure"
      });
    }
  };


  const steps = [
    {
      number: 1,
      title: "Set Local Path",
      description: "Choose a folder where your audio files will be stored",
      action: handleConnect,
      actionLabel: "Select Folder",
      status: user?.local_path ? 'complete' : 'pending'
    },
    {
      number: 2,
      title: "Create Folder Structure",
      description: "Create your cloud folder structure locally",
      action: handleCreateFolderStructure,
      actionLabel: "Create Folders",
      status: 'pending',
      disabled: !user?.local_path
    },
    {
      number: 3,
      title: "Export from DAW",
      description: "Export your audio files directly to the created folders",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your folder structure has been created at:
            <code className="mx-2 px-2 py-1 bg-muted rounded">{user?.local_path}</code>
          </p>
          <Alert>
            <AlertDescription>
              You can now export audio files from your DAW directly to any of these folders.
              The files will be ready for syncing to the cloud in the next step.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      number: 4,
      title: "Sync Files",
      description: "Select files to sync with your cloud storage",
      content: (
        <Tabs defaultValue="selective" className="w-full">
          <TabsList>
            <TabsTrigger value="selective">Selective Sync</TabsTrigger>
            <TabsTrigger value="full">Full Sync</TabsTrigger>
          </TabsList>
          <TabsContent value="selective">
            <LocalFolderSync mode="selective" />
          </TabsContent>
          <TabsContent value="full">
            <LocalFolderSync mode="full" />
          </TabsContent>
        </Tabs>
      )
    }
  ];

  if (userLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (userError) return <div className="text-red-500">Error: {userError.message}</div>;

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
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${step.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                      {step.status === 'complete' ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      {step.content}
                      {step.action && (
                        <Button 
                          onClick={step.action}
                          variant={step.status === 'complete' ? "outline" : "default"}
                          className="mt-2"
                          disabled={step.disabled}
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