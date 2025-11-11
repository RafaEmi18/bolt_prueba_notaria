import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-stone-900 leading-tight">
                SERVICIOS NOTARIALES DE{' '}
                <span className="text-amber-800">ALTA CALIDAD</span>
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed max-w-xl">
                Ofrecemos soluciones notariales adaptables y flexibles. Nuestro equipo de profesionales
                especializados está entre los más grandes y experimentados del sector.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-amber-800 flex-shrink-0" />
                <p className="text-stone-700">Más de 25 años de experiencia en servicios notariales</p>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-amber-800 flex-shrink-0" />
                <p className="text-stone-700">Asesoría jurídica especializada y personalizada</p>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-amber-800 flex-shrink-0" />
                <p className="text-stone-700">Atención profesional con los más altos estándares</p>
              </div>
            </div>

            <button
              onClick={scrollToContact}
              className="group bg-gradient-to-r from-amber-700 to-amber-900 text-white px-8 py-4 rounded-lg hover:from-amber-800 hover:to-amber-950 transition-all duration-300 font-medium shadow-xl hover:shadow-2xl flex items-center space-x-2"
            >
              <span>Contratar Experto</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-stone-200/30 rounded-full blur-3xl"></div>

            <div className="relative bg-gradient-to-br from-amber-100 to-stone-100 rounded-2xl p-12 shadow-2xl">
              <div className="flex justify-center items-center h-full">
                <div className="text-center space-y-6">
                  <div className="w-64 h-80 mx-auto bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg shadow-2xl flex items-center justify-center">
                    <Scale className="h-32 w-32 text-amber-50" />
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
                    <p className="text-sm text-stone-600 mb-4">
                      Nuestros abogados aportan más de 70 años de experiencia legal combinada.
                    </p>
                    <div className="flex justify-center -space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-white flex items-center justify-center text-white font-bold">
                        MR
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 border-2 border-white flex items-center justify-center text-white font-bold">
                        LC
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-white flex items-center justify-center text-white font-bold">
                        AG
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-600 to-stone-800 border-2 border-white flex items-center justify-center text-white font-bold">
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
