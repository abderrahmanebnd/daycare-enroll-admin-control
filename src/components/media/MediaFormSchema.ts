
import * as z from "zod";

export const mediaFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  childId: z.string().min(1, "Veuillez sélectionner un enfant"),
  type: z.enum(["photo", "video"], {
    message: "Veuillez sélectionner un type de média",
  }),
  fileUrl: z.string().min(1, "Veuillez fournir une URL de fichier"),
  uploadDate: z.string().min(1, "Veuillez sélectionner une date"),
});

export type MediaFormData = z.infer<typeof mediaFormSchema>;
