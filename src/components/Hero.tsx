import { ArrowRight, CheckCircle, Scale } from 'lucide-react';

export default function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen pt-20 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-5xl font-bold leading-tight lg:text-6xl xl:text-7xl text-stone-900">
                SERVICIOS NOTARIALES DE{' '}
                <span className="text-amber-800">ALTA CALIDAD</span>
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-stone-600">
                Ofrecemos soluciones notariales adaptables y flexibles. Nuestro equipo de profesionales
                especializados está entre los más grandes y experimentados del sector.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 text-amber-800" />
                <p className="text-stone-700">Más de 25 años de experiencia en servicios notariales</p>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 text-amber-800" />
                <p className="text-stone-700">Asesoría jurídica especializada y personalizada</p>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 text-amber-800" />
                <p className="text-stone-700">Atención profesional con los más altos estándares</p>
              </div>
            </div>

            <button
              onClick={scrollToContact}
              className="flex items-center px-8 py-4 space-x-2 font-medium text-white transition-all duration-300 rounded-lg shadow-xl group bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 hover:shadow-2xl"
            >
              <span>Contratar Experto</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute rounded-full -top-10 -right-10 w-72 h-72 bg-amber-200/30 blur-3xl"></div>
            <div className="absolute rounded-full -bottom-10 -left-10 w-72 h-72 bg-stone-200/30 blur-3xl"></div>

            <div className="relative p-12 shadow-2xl bg-gradient-to-br from-amber-100 to-stone-100 rounded-2xl">
              <div className="flex items-center justify-center h-full">
                <div className="space-y-6 text-center">
                  <div className="flex items-center justify-center w-64 mx-auto rounded-lg shadow-2xl h-80 bg-gradient-to-b from-amber-700 to-amber-900">
                    <Scale className="w-32 h-32 text-amber-50" />
                  </div>
                  <div className="p-6 shadow-lg bg-white/80 backdrop-blur rounded-xl">
                    <p className="mb-4 text-sm text-stone-600">
                      Nuestros abogados aportan más de 70 años de experiencia legal combinada.
                    </p>
                    <div className="flex justify-center -space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 font-bold text-white border-2 border-white rounded-full bg-gradient-to-br from-amber-700 to-amber-900">
                        MR
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 font-bold text-white border-2 border-white rounded-full bg-gradient-to-br from-stone-700 to-stone-900">
                        LC
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 font-bold text-white border-2 border-white rounded-full bg-gradient-to-br from-amber-600 to-amber-800">
                        AG
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 font-bold text-white border-2 border-white rounded-full bg-gradient-to-br from-stone-600 to-stone-800">
                        JM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
