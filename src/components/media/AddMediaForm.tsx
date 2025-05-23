
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { mediaService } from "@/services/mediaService";
import { childService } from "@/services/childService";
import { useAuth } from "@/contexts/AuthContext";
import { Media, Child } from "@/types";
import { Camera } from "lucide-react";

const mediaFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  childId: z.string().min(1, "Veuillez sélectionner un enfant"),
  type: z.enum(["photo", "video"], {
    message: "Veuillez sélectionner un type de média",
  }),
  fileUrl: z.string().min(1, "Veuillez fournir une URL de fichier"),
  uploadDate: z.string().min(1, "Veuillez sélectionner une date"),
});

interface AddMediaFormProps {
  onMediaAdded: () => void;
}

const AddMediaForm: React.FC<AddMediaFormProps> = ({ onMediaAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof mediaFormSchema>>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      childId: "",
      type: "photo",
      fileUrl: "",
      uploadDate: new Date().toISOString().split('T')[0], // Today's date
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

  const onSubmit = async (values: z.infer<typeof mediaFormSchema>) => {
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre du média..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uploadDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'upload</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de média</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Vidéo</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="childId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enfant</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      <option value="">Sélectionner un enfant</option>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.fullName}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL du fichier</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnelle)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description de l'activité ou du moment..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Ajout en cours..." : "Ajouter le média"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMediaForm;
