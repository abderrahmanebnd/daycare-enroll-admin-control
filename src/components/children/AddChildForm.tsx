import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { childService } from "@/services/childService";
import { MOCK_USERS } from "@/services/mockData";
import { Child, User } from "@/types";
import { Plus } from "lucide-react";
import axios from "axios";
import axiosPrivate from "@/axios/axios";

const childFormSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  gender: z.enum(["male", "female"], {
    message: "Veuillez sélectionner un genre",
  }),
  dateOfBirth: z.string().min(1, "La date de naissance est requise"),
  allergies: z.string(),
  emergencyContact: z.string().min(1, "Le contact d'urgence est requis"),
  specialNeeds: z.string(),
  parentId: z.string().min(1, "Veuillez sélectionner un parent"),
  educatorId: z.string().optional(),
  mediaConsent: z.boolean().default(false),
});

interface AddChildFormProps {
  onChildAdded: () => void;
}

const AddChildForm: React.FC<AddChildFormProps> = ({ onChildAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parents, setParents] = useState<User[]>([]);
  const [educators, setEducators] = useState<User[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof childFormSchema>>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      fullName: "",
      gender: "male",
      dateOfBirth: "",
      allergies: "",
      emergencyContact: "",
      specialNeeds: "",
      parentId: "",
      educatorId: "",
      mediaConsent: false,
    },
  });

  async function fetchParents() {
    const { data } = await axiosPrivate.get("/users?role=parent");
    return data.data;
  }
  async function fetchEducators() {
    const { data } = await axiosPrivate.get("/users?role=educator");
    return data.data;
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const parentsData = await fetchParents();
        setParents(parentsData);
        const educatorsData = await fetchEducators();
        setEducators(educatorsData);
      } catch (error) {
        console.error("Error fetching parents:", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de la récupération des parents et educators.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof childFormSchema>) => {
    try {
      setIsLoading(true);

      const childData: Omit<Child, "id" | "createdAt"> = {
        fullName: values.fullName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        allergies: values.allergies,
        emergencyContact: values.emergencyContact,
        specialNeeds: values.specialNeeds,
        parentId: values.parentId,
        educatorId: values.educatorId || undefined,
        educator: values.educatorId
          ? educators.find((e) => e.id === values.educatorId) || null
          : null,
        parent: parents.find((p) => p.id === values.parentId) || null,
        mediaConsent: values.mediaConsent,
      };

      await childService.createChild(childData);

      toast({
        title: "Enfant ajouté",
        description: `${values.fullName} a été ajouté avec succès.`,
      });

      form.reset();
      setIsOpen(false);
      onChildAdded();
    } catch (error) {
      console.error("Error creating child:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'enfant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-daycare-primary hover:bg-daycare-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un enfant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel enfant</DialogTitle>
          <DialogDescription>
            Remplissez les informations de l'enfant et assignez un éducateur.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom et prénom de l'enfant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      >
                        <option value="male">Garçon</option>
                        <option value="female">Fille</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      <option value="">Sélectionner un parent</option>
                      {parents.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.name} - {parent.email}
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
              name="educatorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Éducateur assigné (optionnel)</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      <option value="">Aucun éducateur assigné</option>
                      {educators.map((educator) => (
                        <option key={educator.id} value={educator.id}>
                          {educator.name} - {educator.email}
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
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact d'urgence</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Numéro de téléphone d'urgence"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez les allergies connues..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Besoins spéciaux</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez les besoins spéciaux..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mediaConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Consentement pour les médias</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Autorisation de partager photos/vidéos avec les parents
                    </p>
                  </div>
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
                {isLoading ? "Ajout en cours..." : "Ajouter l'enfant"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildForm;
