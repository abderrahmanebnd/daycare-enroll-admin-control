
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-daycare-light to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-daycare-dark">
          <span className="text-daycare-primary">Little</span>Dreams
        </h1>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="border-daycare-primary text-daycare-primary hover:bg-daycare-light"
          >
            Connexion
          </Button>
          <Button 
            onClick={() => navigate('/register')}
            className="bg-daycare-primary hover:bg-daycare-primary/90"
          >
            Inscription
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-daycare-dark">
            La crèche qui prend soin de vos enfants
          </h2>
          <p className="text-lg mb-8 text-muted-foreground">
            Gérez les inscriptions, suivez les activités et communiquez facilement avec les éducateurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate('/register')}
              className="text-lg py-6 bg-daycare-primary hover:bg-daycare-primary/90"
              size="lg"
            >
              Inscrire mon enfant
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="text-lg py-6 border-daycare-primary text-daycare-primary hover:bg-daycare-light"
              size="lg"
            >
              Espace parents
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 animate-slide-in">
          <img 
            src="https://images.unsplash.com/photo-1526634332515-d56c5fd16991?auto=format&fit=crop&w=600&h=500&q=80" 
            alt="Enfants jouant" 
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-daycare-dark">
            Nos fonctionnalités
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-daycare-light p-6 rounded-lg shadow-md card-hover">
              <div className="text-4xl mb-4 text-daycare-primary">👶</div>
              <h3 className="text-xl font-semibold mb-2">Gestion des enfants</h3>
              <p className="text-muted-foreground">
                Suivez les profils des enfants, leurs allergies, et leurs besoins spécifiques en un seul endroit.
              </p>
            </div>
            <div className="bg-daycare-light p-6 rounded-lg shadow-md card-hover">
              <div className="text-4xl mb-4 text-daycare-primary">📝</div>
              <h3 className="text-xl font-semibold mb-2">Demandes d'admission</h3>
              <p className="text-muted-foreground">
                Soumettez vos demandes d'admission en ligne et suivez leur statut en temps réel.
              </p>
            </div>
            <div className="bg-daycare-light p-6 rounded-lg shadow-md card-hover">
              <div className="text-4xl mb-4 text-daycare-primary">💬</div>
              <h3 className="text-xl font-semibold mb-2">Communication directe</h3>
              <p className="text-muted-foreground">
                Échangez facilement avec les éducateurs et restez informé des activités de vos enfants.
              </p>
            </div>
            <div className="bg-daycare-light p-6 rounded-lg shadow-md card-hover">
              <div className="text-4xl mb-4 text-daycare-primary">🔔</div>
              <h3 className="text-xl font-semibold mb-2">Notifications</h3>
              <p className="text-muted-foreground">
                Recevez des alertes importantes concernant votre enfant et la crèche.
              </p>
            </div>
            <div className="bg-daycare-light p-6 rounded-lg shadow-md card-hover">
              <div className="text-4xl mb-4 text-daycare-primary">📸</div>
              <h3 className="text-xl font-semibold mb-2">Partage de médias</h3>
              <p className="text-muted-foreground">
                Accédez aux photos et vidéos des activités de votre enfant en toute sécurité.
              </p>
            </div>
            <div className="bg-daycare-light p-6 rounded-lg shadow-md card-hover">
              <div className="text-4xl mb-4 text-daycare-primary">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Accès sécurisé</h3>
              <p className="text-muted-foreground">
                Protégez les données de votre enfant grâce à notre système d'authentification sécurisé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-daycare-primary py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à nous rejoindre?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Inscrivez-vous dès aujourd'hui pour simplifier la gestion de la scolarité de votre enfant.
          </p>
          <Button 
            onClick={() => navigate('/register')}
            size="lg"
            className="bg-white text-daycare-primary hover:bg-daycare-light text-lg py-6"
          >
            Créer un compte parent
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-daycare-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                <span className="text-daycare-primary">Little</span>Dreams
              </h3>
              <p className="text-gray-300">
                Une solution complète pour la gestion de crèche et la communication avec les parents.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/login" className="hover:text-daycare-primary">Connexion</a></li>
                <li><a href="/register" className="hover:text-daycare-primary">Inscription</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                123 Rue des Enfants<br />
                75001 Paris, France<br />
                contact@littledreams.com<br />
                +33 1 23 45 67 89
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Little Dreams. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
