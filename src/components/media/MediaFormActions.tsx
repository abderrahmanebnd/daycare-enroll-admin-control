
import { Button } from "@/components/ui/button";

interface MediaFormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

const MediaFormActions: React.FC<MediaFormActionsProps> = ({ isLoading, onCancel }) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Annuler
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Ajout en cours..." : "Ajouter le média"}
      </Button>
    </div>
  );
};

export default MediaFormActions;
