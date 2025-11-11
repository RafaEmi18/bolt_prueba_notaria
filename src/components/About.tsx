import { Award, Users, Clock, Shield } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4">
            ¿LISTO PARA POTENCIAR SU{' '}
            <span className="text-amber-400">ESTRATEGIA LEGAL?</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
          <p className="text-amber-100 text-lg max-w-2xl mx-auto">
            Con años de experiencia y un equipo dedicado, brindamos servicios notariales
            de la más alta calidad con atención personalizada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center group">
            <div className="bg-amber-900/50 backdrop-blur w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Award className="h-10 w-10 text-amber-400" />
            </div>
            <h3 className="text-3xl font-bold text-amber-400 mb-2">25+</h3>
            <p className="text-amber-100">Años de Experiencia</p>
          </div>

          <div className="text-center group">
            <div className="bg-amber-900/50 backdrop-blur w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-10 w-10 text-amber-400" />
            </div>
            <h3 className="text-3xl font-bold text-amber-400 mb-2">5,000+</h3>
            <p className="text-amber-100">Clientes Satisfechos</p>
          </div>

          <div className="text-center group">
            <div className="bg-amber-900/50 backdrop-blur w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-10 w-10 text-amber-400" />
            </div>
            <h3 className="text-3xl font-bold text-amber-400 mb-2">24/7</h3>
            <p className="text-amber-100">Soporte Disponible</p>
          </div>

          <div className="text-center group">
            <div className="bg-amber-900/50 backdrop-blur w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-10 w-10 text-amber-400" />
            </div>
            <h3 className="text-3xl font-bold text-amber-400 mb-2">100%</h3>
            <p className="text-amber-100">Confidencialidad</p>
          </div>
        </div>

        <div className="bg-amber-900/30 backdrop-blur rounded-2xl p-8 lg:p-12 border border-amber-800/50">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-serif font-bold mb-6">Nuestra Misión</h3>
              <p className="text-amber-100 leading-relaxed mb-4">
                Ser la notaría de referencia en la región, ofreciendo servicios jurídicos de
                excelencia que garanticen seguridad, confianza y tranquilidad a nuestros clientes
                en cada uno de sus trámites legales.
              </p>
              <p className="text-amber-100 leading-relaxed">
                Nos comprometemos a mantener los más altos estándares de ética profesional,
                proporcionando asesoría personalizada y soluciones eficientes que protejan
                los intereses de quienes confían en nosotros.
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-serif font-bold mb-6">Nuestros Valores</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="bg-amber-600 rounded-full p-1 mt-1">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-300">Integridad</p>
                    <p className="text-amber-100 text-sm">Actuamos con honestidad y transparencia</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-amber-600 rounded-full p-1 mt-1">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-300">Profesionalismo</p>
                    <p className="text-amber-100 text-sm">Excelencia en cada servicio prestado</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-amber-600 rounded-full p-1 mt-1">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-300">Confidencialidad</p>
                    <p className="text-amber-100 text-sm">Protección absoluta de su información</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
