import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { getAiConfig, saveAiConfig, AiProvider, AiConfig } from '../utils/aiConfig';
import {
  Sparkles,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  X,
  Zap,
  Cpu,
  BookOpen
} from 'lucide-react';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: (config: AiConfig) => void;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
  const [provider, setProvider] = useState<AiProvider>('lucia');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('https://certainty-companion.lovable.app');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getAiConfig();
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setEndpoint(config.endpoint || 'https://certainty-companion.lovable.app');
      setTestResult(null);
      setSaveSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (provider === 'lucia' && !apiKey.trim()) {
      setTestResult({
        ok: false,
        message: 'Por favor ingresa tu API Key de Certainty Companion para probar la conexión.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    sound.playTypewriterClick();

    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': apiKey.trim(),
          'x-ai-provider': provider,
          'x-ai-endpoint': endpoint.trim()
        },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim(),
          endpoint: endpoint.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        sound.playInspireChime();
        setTestResult({
          ok: true,
          message: data.message || '¡Conexión exitosa con Certainty Companion! La IA está lista para responder.'
        });
      } else {
        setTestResult({
          ok: false,
          message: data.error || data.message || 'No se pudo conectar. Verifica la clave ingresada.'
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error desconocido de red';
      setTestResult({
        ok: false,
        message: `Error al conectar con el servidor: ${errMsg}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    sound.playTypewriterClick();
    const updated = saveAiConfig({
      provider,
      apiKey: apiKey.trim(),
      endpoint: endpoint.trim()
    });

    if (onConfigUpdated) {
      onConfigUpdated(updated);
    }

    setSaveSuccessMessage('¡Configuración de IA guardada correctamente!');
    sound.playInspireChime();

    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-amber-50 rounded-2xl border-4 border-stone-900 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-amber-200/90 px-5 py-4 border-b-3 border-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-stone-900 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h3 className="font-['Lora',serif] font-black text-stone-950 text-base sm:text-lg leading-tight">
                Configuración de Inteligencia Artificial
              </h3>
              <p className="text-stone-700 text-xs font-medium">
                Conecta Certainty Companion a las conversaciones de Peanuts
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playDoor();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-700 hover:text-stone-950 hover:bg-amber-300/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Provider Selector Cards */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-2">
              Motor de IA activo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Lucia / Certainty Companion */}
              <button
                type="button"
                onClick={() => {
                  sound.playTypewriterClick();
                  setProvider('lucia');
                }}
                className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  provider === 'lucia'
                    ? 'border-amber-600 bg-amber-100/90 shadow-[2px_2px_0px_rgba(180,83,9,0.5)] ring-2 ring-amber-500/50'
                    : 'border-stone-300 hover:border-stone-400 bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Zap className={`w-4 h-4 ${provider === 'lucia' ? 'text-amber-700' : 'text-stone-500'}`} />
                  {provider === 'lucia' && (
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-amber-600 text-white rounded-full">
                      Activo
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-black text-xs text-stone-950">Certainty Companion</div>
                  <div className="text-[10px] text-stone-600 font-medium">Lucia AI personalizada</div>
                </div>
              </button>

              {/* Option 2: Gemini */}
              <button
                type="button"
                onClick={() => {
                  sound.playTypewriterClick();
                  setProvider('gemini');
                }}
                className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  provider === 'gemini'
                    ? 'border-blue-600 bg-blue-50/90 shadow-[2px_2px_0px_rgba(37,99,235,0.5)] ring-2 ring-blue-500/50'
                    : 'border-stone-300 hover:border-stone-400 bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Cpu className={`w-4 h-4 ${provider === 'gemini' ? 'text-blue-700' : 'text-stone-500'}`} />
                  {provider === 'gemini' && (
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-blue-600 text-white rounded-full">
                      Activo
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-black text-xs text-stone-950">Google Gemini</div>
                  <div className="text-[10px] text-stone-600 font-medium">Gemini 3.8 Flash</div>
                </div>
              </button>

              {/* Option 3: Offline / Schulz Original */}
              <button
                type="button"
                onClick={() => {
                  sound.playTypewriterClick();
                  setProvider('offline');
                }}
                className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  provider === 'offline'
                    ? 'border-stone-800 bg-stone-100 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] ring-2 ring-stone-400/50'
                    : 'border-stone-300 hover:border-stone-400 bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <BookOpen className={`w-4 h-4 ${provider === 'offline' ? 'text-stone-800' : 'text-stone-500'}`} />
                  {provider === 'offline' && (
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-stone-800 text-white rounded-full">
                      Activo
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-black text-xs text-stone-950">Motor Schulz</div>
                  <div className="text-[10px] text-stone-600 font-medium">100% Offline clásico</div>
                </div>
              </button>
            </div>
          </div>

          {/* Details for Certainty Companion */}
          {provider === 'lucia' && (
            <div className="space-y-3.5 bg-amber-100/60 p-4 rounded-xl border border-amber-300/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-800" />
                  Tu API Key de Certainty Companion
                </span>
                <a
                  href="https://certainty-companion.lovable.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 underline underline-offset-2"
                >
                  Abrir app <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Pega aquí tu API key (ej. lucia_... o clave generada)"
                  className="w-full bg-white border-2 border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-stone-900 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 p-1"
                  title={showKey ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Endpoint URL field */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-stone-500" />
                  URL del Servicio IA
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Test connection action */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-stone-900 border border-stone-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-xs"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-800" />
                      <span>Probando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                      <span>Probar conexión</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-stone-600 font-medium">
                  Verifica que el endpoint y la clave respondan correctamente.
                </span>
              </div>

              {/* Test feedback */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-150 ${
                    testResult.ok
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : 'bg-rose-50 border-rose-400 text-rose-950'
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium leading-relaxed">{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {provider === 'gemini' && (
            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <strong>Google Gemini 3.8 Flash:</strong> Usa la clave configurada en el entorno de la aplicación. Es ideal si tienes cuota disponible en Google AI Studio.
            </div>
          )}

          {provider === 'offline' && (
            <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-300 text-xs text-stone-800 leading-relaxed">
              <strong>Motor Schulz Clásico:</strong> Funciona directamente en tu navegador sin ninguna conexión a internet ni consumo de tokens. Charlie Brown, Linus, Snoopy y el resto responderán con diálogos y reflexiones extraídas de las tiras originales.
            </div>
          )}

          {saveSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="bg-amber-100/90 px-5 py-3 border-t-2 border-stone-300 flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-600 font-semibold truncate">
            {provider === 'lucia' && apiKey ? 'Clave de usuario configurada' : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playDoor();
                onClose();
              }}
              className="px-3.5 py-2 text-stone-700 hover:text-stone-950 text-xs font-bold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 active:bg-black text-amber-50 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Guardar y Aplicar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
