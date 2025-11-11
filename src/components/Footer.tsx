import { Scale, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-2.5 rounded-lg">
                <Scale className="h-7 w-7 text-amber-50" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold">Notariq</h3>
                <p className="text-xs text-amber-400 tracking-wide">NOTARÍA PÚBLICA 4</p>
              </div>
            </div>
            <p className="text-stone-400 mb-6 leading-relaxed">
              Servicios notariales profesionales con más de 25 años de experiencia.
              Garantizamos seguridad jurídica en cada uno de sus trámites.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-amber-900/50 hover:bg-amber-800 p-2 rounded-lg transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-amber-900/50 hover:bg-amber-800 p-2 rounded-lg transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-amber-900/50 hover:bg-amber-800 p-2 rounded-lg transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-amber-900/50 hover:bg-amber-800 p-2 rounded-lg transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-amber-400">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('home')} className="text-stone-400 hover:text-amber-400 transition-colors">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('services')} className="text-stone-400 hover:text-amber-400 transition-colors">
                  Servicios
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="text-stone-400 hover:text-amber-400 transition-colors">
                  Nosotros
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('blog')} className="text-stone-400 hover:text-amber-400 transition-colors">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="text-stone-400 hover:text-amber-400 transition-colors">
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-amber-400">Servicios</h4>
            <ul className="space-y-2 text-stone-400">
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Actas Notariales</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Poderes y Mandatos</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Compraventa</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Testamentos</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Constitución de Sociedades</li>
              <li className="hover:text-amber-400 transition-colors cursor-pointer">Certificaciones</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-amber-400">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-stone-400">
                  Av. Evergreen Terrace 742<br />
                  Springfield, CDMX
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-stone-400">
                  +52 (55) 1234-5678
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-stone-400">
                  contacto@notariq.com.mx
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-stone-400 text-sm">
              © {new Date().getFullYear()} Notariq. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">
                Aviso Legal
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
