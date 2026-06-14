import React, { useState, useEffect } from 'react';
import { ChevronLeft, Send, Settings, Upload, Calendar, Eye, EyeOff, Phone, User, MessageSquare, Save, Share2 } from 'lucide-react';

export default function WhatsGestion() {
  const [activeScreen, setActiveScreen] = useState('send');
  const [config, setConfig] = useState({
    template: "Buenas tardes [NOMBRE]🙋🏻‍♂️, te escribe xxxxx, del BCP de la agencia de pichanaqui, el día [FECHA] visitaste la agencia por lo cual te llegó una encuesta a tu gmail📧, si todo estuvo conforme con la atencion te agradeceria nos puedas apoyar ingresando a la encuesta con el numero 10 ✅",
    fecha: '',
    imagen: null,
  });

  const [sendForm, setSendForm] = useState({
    celular: '',
    nombre: '',
  });

  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('whatsGestion');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const guardarConfig = () => {
    localStorage.setItem('whatsGestion', JSON.stringify(config));
    alert('Configuración guardada ✅');
  };

  const generarPreview = () => {
    let msg = config.template;
    msg = msg.replace('[NOMBRE]', sendForm.nombre || '[NOMBRE]');
    msg = msg.replace('[FECHA]', config.fecha || '[FECHA]');
    setPreview(msg);
    setShowPreview(true);
  };

  const validarCelular = (cel) => {
    const clean = cel.replace(/\D/g, '');
    return clean.length === 9 && clean.startsWith('9');
  };

  const enviarWhatsApp = () => {
    if (!validarCelular(sendForm.celular)) {
      alert('❌ Número peruano inválido. Debe empezar con 9 (ej: 987654321)');
      return;
    }
    if (!sendForm.nombre.trim()) {
      alert('❌ Ingresa el nombre del cliente');
      return;
    }
    if (!config.fecha) {
      alert('❌ Selecciona una fecha');
      return;
    }

    let msg = config.template;
    msg = msg.replace('[NOMBRE]', sendForm.nombre);
    msg = msg.replace('[FECHA]', config.fecha);

    const celLimpio = sendForm.celular.replace(/\D/g, '');
    const url = `https://wa.me/51${celLimpio}?text=${encodeURIComponent(msg)}`;
    
    window.open(url, '_blank');

    setSendForm({ celular: '', nombre: '' });
  };

  const compartirImagenPorWhatsApp = async () => {
    if (!config.imagen) {
      alert('❌ Primero sube una imagen en Configuración');
      return;
    }

    if (!sendForm.celular.trim()) {
      alert('❌ Ingresa el número del cliente');
      return;
    }

    try {
      // Convertir base64 a blob
      const base64Data = config.imagen.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const file = new File([blob], 'encuesta.jpg', { type: 'image/jpeg' });

      if (navigator.share) {
        await navigator.share({
          title: 'Encuesta',
          text: 'Encuesta de satisfacción',
          files: [file]
        });
      } else {
        alert('Tu navegador no soporta compartir archivos');
      }
    } catch (error) {
      console.log('Compartir cancelado:', error);
    }
  };

  const handleImagenUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig({ ...config, imagen: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const generarFechas = () => {
    const fechas = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dia = date.toLocaleDateString('es-PE', { weekday: 'long' });
      const fecha = date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
      const texto = `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${fecha.charAt(0).toUpperCase() + fecha.slice(1)}`;
      fechas.push(texto);
    }
    return fechas;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-slate-50 min-h-screen font-sans text-slate-800">
      {/* HEADER */}
      <div className="bg-blue-700 text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">What's Gestión</h1>
              <p className="text-blue-100 text-sm">Herramienta de Mensajes</p>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen(activeScreen === 'send' ? 'config' : 'send')}
            className="p-2 hover:bg-blue-600 rounded-lg transition"
          >
            {activeScreen === 'send' ? <Settings size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>
      </div>

      {/* PANTALLA ENVÍO */}
      {activeScreen === 'send' && (
        <div className="p-4 space-y-4 pb-20">
          {/* Card Info */}
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-600">
            <p className="text-sm text-slate-600">
              <strong>Recuerda:</strong> Ingresa el número, nombre y verifica el preview antes de enviar.
            </p>
          </div>

          {/* Número celular */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Phone size={18} />
              Número celular peruano
            </label>
            <input
              type="tel"
              placeholder="987654321"
              value={sendForm.celular}
              onChange={(e) => setSendForm({ ...sendForm, celular: e.target.value })}
              maxLength="9"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg"
            />
            <p className="text-xs text-slate-500 mt-1">Solo números, empieza con 9</p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <User size={18} />
              Primer nombre del cliente
            </label>
            <input
              type="text"
              placeholder="Ej: Kenyi"
              value={sendForm.nombre}
              onChange={(e) => setSendForm({ ...sendForm, nombre: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg"
            />
          </div>

          {/* Fecha actual (editable) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={18} />
              Fecha de atención
            </label>
            <select
              value={config.fecha}
              onChange={(e) => setConfig({ ...config, fecha: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none text-base bg-white text-slate-900"
              style={{ minHeight: '44px', fontSize: '16px' }}
            >
              <option value="">-- Elige una fecha --</option>
              {generarFechas().map((fecha, idx) => (
                <option key={idx} value={fecha}>
                  {fecha}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div>
            <button
              onClick={generarPreview}
              className="w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              {showPreview ? 'Ocultar' : 'Ver'} Preview
            </button>
          </div>

          {/* Preview Card */}
          {showPreview && (
            <div className="bg-slate-100 rounded-xl p-4 border-2 border-slate-300">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Mensaje que se enviará:</p>
              <div className="bg-white rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {preview}
              </div>
            </div>
          )}

          {/* Botón Enviar (wa.me) */}
          <button
            onClick={enviarWhatsApp}
            className="w-full px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold text-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Enviar a WhatsApp
          </button>

          {/* Botón Compartir Imagen (Web Share API) */}
          <button
            onClick={compartirImagenPorWhatsApp}
            className="w-full px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-bold text-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            Compartir Imagen por WhatsApp
          </button>

          {/* Configurar */}
          <button
            onClick={() => setActiveScreen('config')}
            className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Settings size={18} />
            Ir a Configuración
          </button>
        </div>
      )}

      {/* PANTALLA CONFIGURACIÓN */}
      {activeScreen === 'config' && (
        <div className="p-4 space-y-4 pb-20">
          {/* Template */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MessageSquare size={18} />
              Mensaje Personalizado
            </label>
            <textarea
              value={config.template}
              onChange={(e) => setConfig({ ...config, template: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm h-32"
              placeholder="Usa [NOMBRE] y [FECHA] para personalizar"
            />
            <p className="text-xs text-slate-500 mt-1">Variables: [NOMBRE] y [FECHA]</p>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={18} />
              Selecciona la Fecha de Atención
            </label>
            <select
              value={config.fecha}
              onChange={(e) => setConfig({ ...config, fecha: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none text-base bg-white text-slate-900"
              style={{ minHeight: '44px', fontSize: '16px' }}
            >
              <option value="">-- Elige una fecha --</option>
              {generarFechas().map((fecha, idx) => (
                <option key={idx} value={fecha}>
                  {fecha}
                </option>
              ))}
            </select>
            {config.fecha && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                <p className="text-sm font-semibold text-green-800">✅ Fecha: {config.fecha}</p>
              </div>
            )}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Upload size={18} />
              Imagen de la Encuesta
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagenUpload}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {config.imagen && (
              <div className="mt-3">
                <img src={config.imagen} alt="Preview" className="w-full rounded-lg border-2 border-slate-300 max-h-60" />
              </div>
            )}
          </div>

          {/* Guardar */}
          <button
            onClick={guardarConfig}
            className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Guardar Configuración
          </button>

          {/* Volver */}
          <button
            onClick={() => setActiveScreen('send')}
            className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} />
            Volver a Envíos
          </button>
        </div>
      )}
    </div>
  );
}
