import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mediaService } from "@/services/mediaService";
import { childService } from "@/services/childService";
import { useAuth } from "@/contexts/AuthContext";
import { MediaType, Child } from "@/types";
import { Camera } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  type: z.enum(["photo", "video"]),
  childId: z.string().min(1),
  file: z.any(),
});

type FormData = z.infer<typeof schema>;

interface AddMediaFormProps {
  onMediaAdded: () => void;
}

const AddMediaForm: React.FC<AddMediaFormProps> = ({ onMediaAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      type: "photo",
      childId: "",
      file: null,
    },
  });

  const handleDialogOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      const data = await childService.getChildrenWithConsent();
      setChildren(data);
    }
  };

  const onSubmit = async (values: FormData) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("type", values.type);
      formData.append("childId", values.childId);
      formData.append("file", values.file[0]);

      await mediaService.addMedia(formData);

      toast({ title: "Succès", description: "Média ajouté avec succès." });

      form.reset();
      onMediaAdded();
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur ajout média:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'ajout du média.",
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
          <DialogTitle>Ajouter un média</DialogTitle>
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
                    <Input {...field} />
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
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un enfant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {children?.map((child) => (
                        <SelectItem key={child.id} value={child.id.toString()}>
                          {child.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fichier</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMediaForm;
