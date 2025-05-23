import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { admissionService } from "@/services/admissionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const AdmissionRequestForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState(""); //
  const [dob, setDob] = useState(""); // Date of Birth
  const [allergies, setAllergies] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [mediaConsent, setMediaConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erreur",
        description:
          "Vous devez être connecté pour soumettre une demande d'admission.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await admissionService.createAdmissionRequest({
        childName,
        gender,
        dob: new Date(dob).toISOString(),
        allergies,
        specialNeeds,
        parentId: user.id,
        mediaConsent,
      });

      toast({
        title: "Demande soumise",
        description: "Votre demande d'admission a été soumise avec succès.",
      });

      navigate("/my-admissions");
    } catch (error) {
      console.error("Error submitting admission request:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la soumission de votre demande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="childName">Nom de l'enfant</Label>
        <Input
          id="childName"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Féminin/Masculin</Label>
        <Input
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob">Date de naissance</Label>
        <Input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="Listez les allergies de votre enfant, ou 'Aucune'"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialNeeds">Besoins spéciaux</Label>
        <Textarea
          id="specialNeeds"
          value={specialNeeds}
          onChange={(e) => setSpecialNeeds(e.target.value)}
          placeholder="Décrivez les besoins spéciaux de votre enfant, ou 'Aucun'"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="mediaConsent"
          checked={mediaConsent}
          onCheckedChange={setMediaConsent}
        />
        <Label htmlFor="mediaConsent">
          J'autorise la crèche à prendre et partager des photos/vidéos de mon
          enfant
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full bg-daycare-primary hover:bg-daycare-primary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Soumission en cours..." : "Soumettre la demande"}
      </Button>
    </form>
  );
};

export default AdmissionRequestForm;
