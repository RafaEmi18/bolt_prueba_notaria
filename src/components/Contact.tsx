import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert([formData]);

      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Hubo un error al enviar su mensaje. Por favor, intente nuevamente.');
      console.error('Error submitting contact form:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            CONTACTO
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-700 to-amber-900 mx-auto mb-6"></div>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            ¿Tiene alguna pregunta o necesita agendar una cita? Estamos aquí para ayudarle.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-6">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 mb-1">Dirección</h4>
                    <p className="text-stone-600">
                      Av. Evergreen Terrace 742<br />
                      Col. Springfield, CP 97075<br />
                      Ciudad de México, México
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 mb-1">Teléfono</h4>
                    <p className="text-stone-600">+52 (55) 1234-5678</p>
                    <p className="text-stone-600">+52 (55) 8765-4321</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 mb-1">Correo Electrónico</h4>
                    <p className="text-stone-600">contacto@notariq.com.mx</p>
                    <p className="text-stone-600">info@notariq.com.mx</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 mb-1">Horario de Atención</h4>
                    <p className="text-stone-600">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                    <p className="text-stone-600">Sábados: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">¿Por qué elegirnos?</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-100">Experiencia comprobada de más de 25 años</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-100">Atención personalizada y profesional</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-100">Procesos eficientes y transparentes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-100">Tecnología de vanguardia en gestión documental</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-xl p-8 border border-stone-200">
              <h3 className="text-2xl font-bold text-stone-900 mb-6">Envíenos un Mensaje</h3>

              {status === 'success' && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800">
                    ¡Gracias por contactarnos! Hemos recibido su mensaje y nos pondremos en contacto con usted pronto.
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all"
                    placeholder="juan@ejemplo.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all"
                    placeholder="+52 (55) 1234-5678"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all"
                    placeholder="Consulta sobre servicios notariales"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all resize-none"
                    placeholder="Describa brevemente su consulta o solicitud..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-amber-700 to-amber-900 text-white px-8 py-4 rounded-lg hover:from-amber-800 hover:to-amber-950 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
