import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
  } from "../ui/alert-dialog";
  
  interface ErrorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    error: Error | string | any; // Update type to handle any error
    fileName: string;
  }
  
  export const ErrorDialog: React.FC<ErrorDialogProps> = ({
    isOpen,
    onClose,
    error,
    fileName,
  }) => {
    const getErrorMessage = (error: any) => {
      if (typeof error === 'string') return error;
      if (error instanceof Error) return error.message;
      if (typeof error === 'object' && error !== null) {
        return error.message || JSON.stringify(error, null, 2);
      }
      return 'Unknown error occurred';
    };
  
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Error - {fileName}</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 whitespace-pre-wrap">
              {getErrorMessage(error)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onClose}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };