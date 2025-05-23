
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mediaService } from "@/services/mediaService";
import { childService } from "@/services/childService";
import { useAuth } from "@/contexts/AuthContext";
import { Media, Child } from "@/types";
import { Camera } from "lucide-react";
import { mediaFormSchema, MediaFormData } from "./MediaFormSchema";
import MediaFormFields from "./MediaFormFields";
import MediaFormActions from "./MediaFormActions";

interface AddMediaFormProps {
  onMediaAdded: () => void;
}

const AddMediaForm: React.FC<AddMediaFormProps> = ({ onMediaAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      childId: "",
      type: "photo",
      fileUrl: "",
      uploadDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleDialogOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      try {
        const childrenData = await childService.getAllChildren();
        setChildren(childrenData);
      } catch (error) {
        console.error("Error fetching children:", error);
      }
    }
  };

  const onSubmit = async (values: MediaFormData) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const mediaData: Omit<Media, "id" | "createdAt"> = {
        fileUrl: values.fileUrl,
        childId: values.childId,
        description: `${values.title}${values.description ? ` - ${values.description}` : ''}`,
        uploadedBy: user.id,
        type: values.type,
      };

      await mediaService.addMedia(mediaData);
      
      toast({
        title: "Média ajouté",
        description: `${values.title} a été ajouté avec succès.`,
      });
      
      form.reset({
        title: "",
        description: "",
        childId: "",
        type: "photo",
        fileUrl: "",
        uploadDate: new Date().toISOString().split('T')[0],
      });
      setIsOpen(false);
      onMediaAdded();
    } catch (error) {
      console.error("Error creating media:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du média.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-daycare-secondary hover:bg-daycare-secondary/90">
          <Camera className="h-4 w-4 mr-2" />
          Ajouter un média
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau média</DialogTitle>
          <DialogDescription>
            Ajoutez une photo ou vidéo pour un enfant de la crèche.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <MediaFormFields control={form.control} children={children} />
            <MediaFormActions 
              isLoading={isLoading} 
              onCancel={() => setIsOpen(false)} 
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMediaForm;
