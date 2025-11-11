import { Scale, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-2.5 rounded-lg">
              <Scale className="h-7 w-7 text-amber-50" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-900">Notariq</h1>
              <p className="text-xs text-stone-600 tracking-wide">NOTARÍA PÚBLICA 4</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-stone-700 hover:text-amber-800 transition-colors font-medium">
              INICIO
            </button>
            <button onClick={() => scrollToSection('services')} className="text-stone-700 hover:text-amber-800 transition-colors font-medium">
              SERVICIOS
            </button>
            <button onClick={() => scrollToSection('about')} className="text-stone-700 hover:text-amber-800 transition-colors font-medium">
              NOSOTROS
            </button>
            <button onClick={() => scrollToSection('blog')} className="text-stone-700 hover:text-amber-800 transition-colors font-medium">
              BLOG
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-stone-700 hover:text-amber-800 transition-colors font-medium">
              CONTACTO
            </button>
          </div>

          <button
            onClick={() => scrollToSection('contact')}
            className="hidden md:block bg-gradient-to-r from-amber-700 to-amber-900 text-white px-6 py-3 rounded-lg hover:from-amber-800 hover:to-amber-950 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Agendar Cita
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-stone-700"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200">
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left py-2 text-stone-700 hover:text-amber-800 transition-colors font-medium">
              INICIO
            </button>
            <button onClick={() => scrollToSection('services')} className="block w-full text-left py-2 text-stone-700 hover:text-amber-800 transition-colors font-medium">
              SERVICIOS
            </button>
            <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 text-stone-700 hover:text-amber-800 transition-colors font-medium">
              NOSOTROS
            </button>
            <button onClick={() => scrollToSection('blog')} className="block w-full text-left py-2 text-stone-700 hover:text-amber-800 transition-colors font-medium">
              BLOG
            </button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-stone-700 hover:text-amber-800 transition-colors font-medium">
              CONTACTO
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-900 text-white px-6 py-3 rounded-lg hover:from-amber-800 hover:to-amber-950 transition-all duration-300 font-medium"
            >
              Agendar Cita
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
