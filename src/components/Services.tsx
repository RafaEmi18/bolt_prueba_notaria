import { useEffect, useState } from 'react';
import { supabase, type Service } from '../lib/supabase';
import * as Icons from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.FileText;
    return <Icon className="h-8 w-8" />;
  };

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            NUESTROS SERVICIOS
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-700 to-amber-900 mx-auto mb-6"></div>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios notariales profesionales para
            satisfacer todas sus necesidades legales.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-stone-100 animate-pulse rounded-xl h-64"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group bg-gradient-to-br from-stone-50 to-amber-50/30 p-8 rounded-xl hover:shadow-xl transition-all duration-300 border border-stone-200 hover:border-amber-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-amber-700 to-amber-900 w-16 h-16 rounded-lg flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {getIcon(service.icon_name)}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                  {service.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
