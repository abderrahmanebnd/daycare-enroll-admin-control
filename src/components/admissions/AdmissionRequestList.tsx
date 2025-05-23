import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { admissionService } from "@/services/admissionService";
import { AdmissionRequest, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosPrivate from "@/axios/axios";

interface AdmissionRequestListProps {
  showOnlyPending?: boolean;
}

const AdmissionRequestList: React.FC<AdmissionRequestListProps> = ({
  showOnlyPending = false,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [educators, setEducators] = useState<User[]>([]);
  const [selectedEducators, setSelectedEducators] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    fetchRequests();
    if (user?.role === "admin") {
      fetchEducators();
    }
  }, [user]);

  const fetchEducators = async () => {
    try {
      const { data } = await axiosPrivate.get("/users?role=educator");
      setEducators(data.users || []);
    } catch (err) {
      console.error("Failed to load educators:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let requestsData: AdmissionRequest[];

      if (user?.role === "parent") {
        requestsData = await admissionService.getAdmissionRequestsByParentId();
      } else if (showOnlyPending) {
        requestsData = await admissionService.getPendingAdmissionRequests();
      } else {
        requestsData = await admissionService.getAllAdmissionRequests();
      }

      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching admission requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEducator = (requestId: string, educatorId: string) => {
    setSelectedEducators({
      ...selectedEducators,
      [requestId]: educatorId,
    });
  };

  const handleApproveRequest = async (id: string) => {
    try {
      if (!user) return;

      const educatorId = selectedEducators[id];
      if (!educatorId) {
        toast({
          title: "Sélection requise",
          description: "Veuillez sélectionner un éducateur pour cet enfant.",
          variant: "destructive",
        });
        return;
      }

      await admissionService.updateAdmissionStatus(
        id,
        "accepted",
        user.id,
        educatorId
      );

      setRequests(
        requests.map((req) =>
          req.id === id ? { ...req, status: "accepted" } : req
        )
      );

      toast({
        title: "Demande approuvée",
        description: "La demande d'admission a été approuvée avec succès.",
      });
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      if (!user) return;

      await admissionService.updateAdmissionStatus(id, "rejected", user.id);

      setRequests(
        requests.map((req) =>
          req.id === id ? { ...req, status: "rejected" } : req
        )
      );

      toast({
        title: "Demande refusée",
        description: "La demande a été refusée avec succès.",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du refus.",
        variant: "destructive",
      });
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "accepted":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Approuvée";
      case "rejected":
        return "Refusée";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement des demandes d'admission...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">
          {user?.role === "admin"
            ? "Aucune demande d'admission à traiter"
            : "Vous n'avez pas encore soumis de demande d'admission"}
        </p>
        {user?.role === "parent" && (
          <Button
            className="mt-4 bg-daycare-primary hover:bg-daycare-primary/90"
            onClick={() => (window.location.href = "/my-admissions/new")}
          >
            Soumettre une demande
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((request) => (
        <Card key={request.id} className="card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium">{request.childName}</h3>
              <Badge className={getBadgeColor(request.status)}>
                {getStatusText(request.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Date de naissance:{" "}
              {new Date(request.dateOfBirth).toLocaleDateString("fr-FR")}
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <p className="font-medium">Allergies:</p>
                <p className="text-muted-foreground">
                  {request.allergies || "Aucune"}
                </p>
              </div>
              <div>
                <p className="font-medium">Besoins spéciaux:</p>
                <p className="text-muted-foreground">
                  {request.specialNeeds || "Aucun"}
                </p>
              </div>
              <div>
                <p className="font-medium">Consentement média:</p>
                <p className="text-muted-foreground">
                  {request.mediaConsent ? "Accordé" : "Non accordé"}
                </p>
              </div>
              <div>
                <p className="font-medium">Date de soumission:</p>
                <p className="text-muted-foreground">
                  {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>

          {user?.role === "admin" && request.status === "pending" && (
            <CardFooter className="pt-2 flex flex-col gap-2">
              <div className="w-full mb-2">
                <label className="text-sm font-medium mb-1 block">
                  Assigner un éducateur:
                </label>
                <Select
                  onValueChange={(value) =>
                    handleSelectEducator(request.id, value)
                  }
                  value={selectedEducators[request.id] || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir un éducateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {educators.map((educator) => (
                      <SelectItem
                        key={educator.id}
                        value={educator.id.toString()}
                      >
                        {educator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="default"
                  className="w-full bg-daycare-secondary hover:bg-daycare-secondary/90"
                  onClick={() => handleApproveRequest(request.id)}
                >
                  Approuver
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleRejectRequest(request.id)}
                >
                  Refuser
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AdmissionRequestList;
