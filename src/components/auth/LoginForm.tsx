import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      navigate("/dashboard");
    } catch (error) {
      setError("Identifiants invalides. Veuillez réessayer.");
      toast({
        title: "Erreur de connexion",
        description: "Identifiants invalides. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link
            to="/forgot-password"
            className="text-xs text-daycare-primary hover:underline"
          >
            Mot de passe oublié?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button
        type="submit"
        className="w-full bg-daycare-primary hover:bg-daycare-primary/90"
        disabled={isLoading}
      >
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>
      <div className="text-center text-sm">
        <p>
          Pas encore de compte?{" "}
          <Link to="/register" className="text-daycare-primary hover:underline">
            S'inscrire
          </Link>
        </p>
        {/* <div className="mt-4 text-xs text-muted-foreground">
          <p>Utilisez ces identifiants pour tester:</p>
          <p>Admin: admin@example.com</p>
          <p>Educator: educator@example.com</p>
          <p>Parent: parent@example.com</p>
          <p>(mot de passe: n'importe quoi)</p>
        </div> */}
      </div>
    </form>
  );
};

export default LoginForm;
