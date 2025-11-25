import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  message_type: 'text' | 'service_selection' | 'form' | 'requirements' | 'confirmation';
  metadata?: any;
  created_at: string;
}

interface Conversation {
  id: string;
  session_id: string;
  status: string;
  current_step: string;
  selected_service?: string;
}

interface FormData {
  clientName: string;
  nationality: string;
  birthPlace: string;
  residence: string;
  phone: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    nationality: '',
    birthPlace: '',
    residence: '',
    phone: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generar o recuperar sessionId
  useEffect(() => {
    let storedSessionId = localStorage.getItem('chatbot_session_id');
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Cargar mensajes cuando se abre el chat
  useEffect(() => {
    if (isOpen && sessionId) {
      loadConversation();
    }
  }, [isOpen, sessionId]);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      // Iniciar o obtener conversación
      const convResponse = await fetch(`${API_URL}/api/chatbot/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (convResponse.ok) {
        const conv = await convResponse.json();
        setConversation(conv);

        // Cargar mensajes
        const messagesResponse = await fetch(`${API_URL}/api/chatbot/conversation/${sessionId}/messages`);
        if (messagesResponse.ok) {
          const msgs = await messagesResponse.json();
          setMessages(msgs);

          // Si la conversación está completada, mostrar el historial pero permitir reinicio al enviar mensaje
          // No reiniciar automáticamente aquí, el backend lo manejará cuando el usuario envíe un mensaje
          if (conv.current_step === 'completed') {
            // Solo asegurarse de que el formulario no esté visible
            setShowForm(false);
            setFormData({
              clientName: '',
              nationality: '',
              birthPlace: '',
              residence: '',
              phone: ''
            });
            return;
          }

          // Si no hay mensajes, iniciar conversación
          if (msgs.length === 0 && conv.current_step === 'welcome') {
            sendInitialMessage();
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const sendInitialMessage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: 'Hola',
          messageType: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Si el servidor reinició la conversación, reemplazar mensajes previos
        if (data.restarted) {
          setMessages([data.botMessage]);
          setShowForm(false);
          setFormData({
            clientName: '',
            nationality: '',
            birthPlace: '',
            residence: '',
            phone: ''
          });
        } else {
          setMessages(prev => [...prev, data.botMessage]);
        }

        setConversation(data.conversation);
      }
    } catch (error) {
      console.error('Error sending initial message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Si estamos en el formulario, no enviar mensajes de texto
    if (showForm) {
      return;
    }

    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      sender: 'user',
      message: inputMessage,
      message_type: 'text',
      created_at: new Date().toISOString()
    };

    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: messageToSend,
          messageType: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Si la conversación se reinició, limpiar mensajes anteriores y empezar de nuevo
        if (data.restarted) {
          setMessages([userMessage, data.botMessage]);
          setShowForm(false);
          setFormData({
            clientName: '',
            nationality: '',
            birthPlace: '',
            residence: '',
            phone: ''
          });
        } else {
          // Agregar el mensaje del usuario y la respuesta del bot normalmente
          setMessages(prev => [...prev, userMessage, data.botMessage]);
        }

        setConversation(data.conversation);

        // Solo mostrar el formulario cuando el paso sea 'collecting_data' y el mensaje sea de tipo 'form'
        if (data.conversation.current_step === 'collecting_data' && data.botMessage.message_type === 'form') {
          setShowForm(true);
        }
      } else {
        // Manejar errores del servidor
        const errorData = await response.json().catch(() => ({ error: 'Error al procesar el mensaje' }));
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          sender: 'bot',
          message: errorData.error || 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          message_type: 'text',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        sender: 'bot',
        message: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        message_type: 'text',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!conversation?.selected_service) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chatbot/service-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          serviceType: conversation.selected_service,
          clientName: formData.clientName,
          nationality: formData.nationality,
          birthPlace: formData.birthPlace,
          residence: formData.residence,
          phone: formData.phone
        })
      });

      if (response.ok) {
        // Recargar mensajes para obtener la confirmación
        const messagesResponse = await fetch(`${API_URL}/api/chatbot/conversation/${sessionId}/messages`);
        if (messagesResponse.ok) {
          const msgs = await messagesResponse.json();
          setMessages(msgs);
        }

        // Obtener la conversación actualizada
        const convResponse = await fetch(`${API_URL}/api/chatbot/conversation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        if (convResponse.ok) {
          const conv = await convResponse.json();
          setConversation(conv);
        }

        setShowForm(false);
        setFormData({
          clientName: '',
          nationality: '',
          birthPlace: '',
          residence: '',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text: string) => {
    // Convertir markdown básico a HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 flex items-center justify-center p-4 text-white transition-all duration-300 rounded-full shadow-lg bottom-6 right-6 bg-amber-700 hover:bg-amber-800 hover:shadow-xl"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Widget del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-stone-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white rounded-t-lg bg-gradient-to-r from-amber-700 to-amber-900">
            <div>
              <h3 className="text-lg font-bold">ChaBot</h3>
              <p className="text-xs text-amber-100">Notaría Pública</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white transition-colors hover:text-amber-200"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-stone-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${msg.sender === 'user'
                    ? 'bg-amber-700 text-white'
                    : 'bg-white text-stone-900 border border-stone-200'
                    }`}
                >
                  {msg.message_type === 'requirements' && msg.metadata?.requirements ? (
                    <div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg.message.split('📋')[0])
                        }}
                      />
                      <div className="pt-2 mt-2 border-t border-stone-200">
                        <p className="mb-2 font-semibold">Requisitos necesarios:</p>
                        <ul className="space-y-1 text-sm list-decimal list-inside">
                          {msg.metadata.requirements.map((req: string, idx: number) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div
                        className="pt-2 mt-2 border-t border-stone-200"
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg.message.split('¿Deseas')[1] || '')
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(msg.message)
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 bg-white border rounded-lg border-stone-200">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario */}
          {showForm && conversation?.selected_service && (
            <div className="p-4 overflow-y-auto bg-white border-t border-stone-200 max-h-64">
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-stone-700">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-stone-700">
                    Nacionalidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-stone-700">
                    Lugar de nacimiento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-stone-700">
                    Lugar de residencia *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.residence}
                    onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-stone-700">
                    Número de teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 font-medium text-white transition-colors rounded-md bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>
            </div>
          )}

          {/* Input de mensaje */}
          {!showForm && conversation?.current_step !== 'collecting_data' && (
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-stone-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-2 border rounded-md border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2 text-white transition-colors rounded-md bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {/* Mensaje cuando está esperando el formulario */}
          {!showForm && conversation?.current_step === 'collecting_data' && (
            <div className="p-4 border-t bg-amber-50 border-stone-200">
              <p className="text-sm text-center text-stone-600">
                Por favor, completa el formulario que aparece arriba.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

