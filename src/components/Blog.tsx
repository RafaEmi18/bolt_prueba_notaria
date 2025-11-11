import { useEffect, useState } from 'react';
import { supabase, type BlogPost } from '../lib/supabase';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section id="blog" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            NUESTRAS NOTICIAS Y ACTUALIZACIONES
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-700 to-amber-900 mx-auto mb-6"></div>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Manténgase informado con nuestros artículos sobre servicios notariales,
            cambios legales y consejos prácticos.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white animate-pulse rounded-xl h-96"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 bg-gradient-to-br from-amber-700 to-amber-900 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-amber-50 opacity-20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent"></div>
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-amber-800 mb-3">
                    <Calendar className="h-4 w-4" />
                    <time>{formatDate(post.published_at)}</time>
                  </div>

                  <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-amber-800 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-stone-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <button className="text-amber-800 font-semibold flex items-center space-x-2 group-hover:space-x-3 transition-all">
                    <span>Leer Más</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-serif font-bold mb-4">
            Entendiendo los Servicios Esenciales de una Notaría Pública
          </h3>
          <p className="text-amber-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Las notarías públicas son instituciones fundamentales en el sistema legal mexicano,
            encargadas de dar fe pública a los actos y hechos jurídicos más importantes de la vida
            de las personas y empresas. Desde la compraventa de inmuebles hasta la constitución
            de sociedades, nuestros servicios garantizan la legalidad y seguridad de sus trámites.
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg transition-colors duration-300 font-medium shadow-lg hover:shadow-xl inline-flex items-center space-x-2">
            <span>Ver Más Artículos</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
