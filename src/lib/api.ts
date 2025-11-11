// Cliente API para reemplazar Supabase
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export type Service = {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactRequest = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: string;
  created_at?: string;
};

// Cliente API que simula la interfaz de Supabase
class TableQuery {
  private table: string;
  private baseUrl: string;
  private limitCount?: number;

  constructor(table: string, baseUrl: string) {
    this.table = table;
    this.baseUrl = baseUrl;
  }

  select(_columns: string = '*') {
    return this;
  }

  eq(_column: string, _value: any) {
    // Los filtros se manejan en el backend
    return this;
  }

  order(_column: string, _options?: { ascending?: boolean }) {
    // El orden se maneja en el backend
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  // Hacer que la clase sea "thenable" para soportar await
  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const promise = (async () => {
      try {
        let url = '';
        
        if (this.table === 'services') {
          url = `${this.baseUrl}/api/services`;
        } else if (this.table === 'blog_posts') {
          url = `${this.baseUrl}/api/blog-posts`;
          if (this.limitCount) {
            url += `?limit=${this.limitCount}`;
          }
        } else {
          throw new Error(`Tabla ${this.table} no soportada para SELECT`);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error al obtener datos de ${this.table}`);
        }
        const data = await response.json();
        return { data, error: null };
      } catch (error: any) {
        return { data: null, error };
      }
    })();

    if (onfulfilled || onrejected) {
      return promise.then(onfulfilled, onrejected);
    }
    return promise as Promise<TResult1 | TResult2>;
  }

  insert(data: any[]) {
    const insertQuery = {
      then: <TResult1 = { data: any; error: any }, TResult2 = never>(
        onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
      ): Promise<TResult1 | TResult2> => {
        const promise = (async () => {
          try {
            if (this.table !== 'contact_requests') {
              throw new Error(`Tabla ${this.table} no soportada para INSERT`);
            }

            const response = await fetch(`${this.baseUrl}/api/contact-requests`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data[0]),
            });

            if (!response.ok) {
              const error = await response.json();
              throw error;
            }

            return { data: null, error: null };
          } catch (error: any) {
            return { data: null, error };
          }
        })();

        if (onfulfilled || onrejected) {
          return promise.then(onfulfilled, onrejected);
        }
        return promise as Promise<TResult1 | TResult2>;
      },
    };
    return insertQuery;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  from(table: string) {
    return new TableQuery(table, this.baseUrl);
  }
}

export const api = new ApiClient(API_URL);

// Mantener compatibilidad con el código existente
export const supabase = {
  from: (table: string) => api.from(table),
};

