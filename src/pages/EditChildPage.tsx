import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { childService } from "@/services/childService";
import { Child, User } from "@/types";
import { MOCK_USERS } from "@/services/mockData";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import axiosPrivate from "@/axios/axios";

const childFormSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  dateOfBirth: z.date({ required_error: "La date de naissance est requise" }),
  gender: z.string({ required_error: "Le genre est requis" }),
  allergies: z.string().optional(),
  specialNeeds: z.string().optional(),
  emergencyContact: z.string().min(9).optional(),
  mediaConsent: z.boolean().default(false),
  educatorId: z.number().optional(),
});

type ChildFormValues = z.infer<typeof childFormSchema>;

const EditChildPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [educators, setEducators] = useState<User[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      fullName: "",
      allergies: "",
      specialNeeds: "",
      emergencyContact: "",
      mediaConsent: false,
    },
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      navigate("/login");
    }

    if (id) {
      fetchChild(id);
    }

    fetchEducators();
  }, [id, user, isLoading, navigate]);

  const fetchEducators = async () => {
    try {
      const { data } = await axiosPrivate.get("/users?role=educator");
      setEducators(data.data || []);
    } catch (err) {
      console.error("Failed to load educators:", err);
    }
  };

  const fetchChild = async (childId: string) => {
    try {
      setLoading(true);
      const childData = await childService.getChildById(childId);

      if (childData) {
        setChild(childData);
        setProfileImage(childData.profilePicture || null);

        // Set form values
        form.reset({
          fullName: childData.fullName,
          dateOfBirth: new Date(childData.dateOfBirth),
          gender: "female",
          allergies: childData.allergies || "",
          specialNeeds: childData.specialNeeds || "",
          emergencyContact: childData.emergencyContact || "", // We don't have this data in the model yet

          mediaConsent: childData.mediaConsent,
          educatorId: Number(childData.educatorId),
        });
      }
    } catch (error) {
      console.error("Error fetching child:", error);
      toast.error("Erreur lors du chargement des données de l'enfant");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ChildFormValues) => {
    if (!id || !child) return;

    try {
      const updatedChild = await childService.updateChild(id, {
        ...child,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth.toISOString(),
        allergies: data.allergies || "",
        specialNeeds: data.specialNeeds || "",
        mediaConsent: data.mediaConsent,
        emergencyContact: data.emergencyContact,
        educatorId: Number(data.educatorId),
        profilePicture: profileImage || undefined,
      });

      if (updatedChild) {
        toast.success("Profil de l'enfant mis à jour avec succès");
        navigate("/children");
      }
    } catch (error) {
      console.error("Error updating child profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <p>Chargement...</p>
        </div>
      </MainLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Modifier le profil de l'enfant</h1>
          <Button variant="outline" onClick={() => navigate("/children")}>
            Retour
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profileImage || undefined} alt="Profile" />
                <AvatarFallback className="bg-daycare-primary text-white text-2xl">
                  <UserIcon className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 bg-daycare-primary hover:bg-daycare-primary/90 text-white p-2 rounded-full cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                  <path d="m12 18 4-4"></path>
                  <path d="M8 18h4v-4"></path>
                  <path d="M15 3h6v6"></path>
                  <path d="m13 9 6-6"></path>
                </svg>
                <input
                  id="profile-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Cliquez pour changer la photo
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom de l'enfant" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de naissance</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un genre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Masculin</SelectItem>
                          <SelectItem value="female">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Listez toutes les allergies (une par ligne)"
                      />
                    </FormControl>
                    <FormDescription>
                      Listez toutes les allergies, y compris alimentaires et
                      médicamenteuses
                    </FormDescription>
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
                        {...field}
                        placeholder="Décrivez les besoins spéciaux de l'enfant"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 border rounded-md space-y-4">
                <h3 className="font-medium">Contact d'urgence</h3>
                <div>
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Numéro de téléphone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="educatorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Éducateur assigné</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un éducateur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {educators.map((educator) => (
                          <SelectItem key={educator.id} value={educator.id}>
                            {educator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Sélectionnez l'éducateur qui sera responsable de cet
                      enfant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mediaConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Consentement média</FormLabel>
                      <FormDescription>
                        Autorisation de partager des photos/vidéos de l'enfant
                        avec les parents
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/children")}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer les modifications</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditChildPage;
