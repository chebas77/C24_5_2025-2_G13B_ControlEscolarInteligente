import { Button } from "./ui/button";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="bg-white shadow-lg border-b-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-red-600">Fe y Alegría</h1>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-md ${
                  currentPage === 'home' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                Inicio
              </Button>
              <Button
                variant={currentPage === 'about' ? 'default' : 'ghost'}
                onClick={() => onNavigate('about')}
                className={`px-3 py-2 rounded-md ${
                  currentPage === 'about' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                Nosotros
              </Button>
              <Button
                variant={currentPage === 'teachers' ? 'default' : 'ghost'}
                onClick={() => onNavigate('teachers')}
                className={`px-3 py-2 rounded-md ${
                  currentPage === 'teachers' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                Docentes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navigation;