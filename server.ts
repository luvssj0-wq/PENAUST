import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { getContextualReply } from "./src/utils/peanutsDialogueEngine";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const DEFAULT_LUCIA_ENDPOINT =
  process.env.LUCIA_API_URL ||
  process.env.COMPANION_API_URL ||
  "https://certainty-companion.lovable.app";

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback curated authentic quotes matching user prompt specs
const CURATED_THOUGHTS = [
  {
    quote: "Cinco minutos bastan para soñar toda una vida, así de relativo es el tiempo.",
    author: "Mario Benedetti",
    theme: "tiempo",
    isOriginal: false,
  },
  {
    quote: "Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos.",
    author: "Julio Cortázar",
    theme: "amor y encuentro",
    isOriginal: false,
  },
  {
    quote: "Uno no es lo que es por lo que escribe, sino por lo que ha leído.",
    author: "Jorge Luis Borges",
    theme: "identidad",
    isOriginal: false,
  },
  {
    quote: "Mucha gente pequeña, en lugares pequeños, haciendo cosas pequeñas, puede cambiar el mundo.",
    author: "Eduardo Galeano",
    theme: "esperanza",
    isOriginal: false,
  },
  {
    quote: "Lo esencial es invisible a los ojos; sólo con el corazón se puede ver bien.",
    author: "Antoine de Saint-Exupéry",
    theme: "vida",
    isOriginal: false,
  },
  {
    quote: "Llevo sobre mí todas las heridas de las batallas que evité.",
    author: "Fernando Pessoa",
    theme: "memoria",
    isOriginal: false,
  },
  {
    quote: "No hay barrera, cerradura ni cerrojo que puedas imponer a la libertad de mi mente.",
    author: "Virginia Woolf",
    theme: "creatividad",
    isOriginal: false,
  },
  {
    quote: "Sé tú mismo; todos los demás ya están cogidos.",
    author: "Oscar Wilde",
    theme: "identidad",
    isOriginal: false,
  },
  {
    quote: "Deja que todo te suceda: la belleza y el terror. Solo sigue caminando. Ningún sentimiento es definitivo.",
    author: "Rainer Maria Rilke",
    theme: "calma",
    isOriginal: false,
  },
  {
    quote: "No nos atrevemos a muchas cosas porque son difíciles; son difíciles porque no nos atrevemos.",
    author: "Séneca",
    theme: "miedo",
    isOriginal: false,
  },
  {
    quote: "La tranquilidad no es otra cosa que el buen orden de la mente.",
    author: "Marco Aurelio",
    theme: "calma",
    isOriginal: false,
  },
  {
    quote: "El hombre que no se contenta con poco, no se contenta con nada.",
    author: "Epicuro",
    theme: "vida",
    isOriginal: false,
  },
  {
    quote: "La vida solo puede ser comprendida mirando hacia atrás, pero debe ser vivida mirando hacia adelante.",
    author: "Søren Kierkegaard",
    theme: "decisiones",
    isOriginal: false,
  },
  {
    quote: "A veces sentarse al sol sin apuro es el acto de resistencia más noble contra la prisa del mundo.",
    author: "Reflexión al borde del muro",
    theme: "calma",
    isOriginal: true,
  },
  {
    quote: "Las cometas no se pierden en los árboles: solo nos recuerdan que algunas cosas deben volar libres.",
    author: "Reflexión de Ari",
    theme: "sueños",
    isOriginal: true,
  },
  {
    quote: "El silencio de una tarde de otoño suele tener mejores respuestas que diez libros abiertos.",
    author: "Reflexión del barrio",
    theme: "memoria",
    isOriginal: true,
  }
];

// Helper to extract API key and provider from request
function extractAiRequestConfig(req: express.Request) {
  const headerKey =
    (req.headers["x-user-api-key"] as string) ||
    (req.headers["x-api-key"] as string) ||
    (req.headers["authorization"]?.toString().replace(/^Bearer\s+/i, "")) ||
    "";

  const bodyKey = (req.body?.apiKey as string) || "";
  const envLuciaKey = process.env.LUCIA_API_KEY || process.env.COMPANION_API_KEY || "";

  const effectiveKey = (headerKey || bodyKey || envLuciaKey).trim();

  const provider = (
    (req.headers["x-ai-provider"] as string) ||
    req.body?.provider ||
    (effectiveKey ? "lucia" : process.env.GEMINI_API_KEY ? "gemini" : "offline")
  ).toLowerCase();

  const rawEndpoint =
    (req.headers["x-ai-endpoint"] as string) ||
    req.body?.endpoint ||
    DEFAULT_LUCIA_ENDPOINT;

  const endpoint = rawEndpoint.replace(/\/+$/, "");

  return { apiKey: effectiveKey, provider, endpoint };
}

// Call Certainty Companion (Lucia AI) OpenAI-compatible endpoint
async function callLuciaChat(
  endpoint: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7
): Promise<string> {
  const url = `${endpoint}/v1/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: "lucia",
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    let errBody: any = null;
    try {
      errBody = await response.json();
    } catch {
      // ignore
    }
    const message =
      errBody?.error?.message ||
      `Error del servidor de Certainty Companion (código ${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || data.reply || "";
  if (!reply) {
    throw new Error("Respuesta vacía recibida de Certainty Companion");
  }
  return reply.trim();
}

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    luciaEndpoint: DEFAULT_LUCIA_ENDPOINT,
    hasServerLuciaKey: !!(process.env.LUCIA_API_KEY || process.env.COMPANION_API_KEY),
    hasServerGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Test connection endpoint for Certainty Companion or active provider
app.post("/api/ai/test", async (req, res) => {
  try {
    const { apiKey, endpoint, provider } = extractAiRequestConfig(req);

    if (provider === "offline") {
      return res.json({
        ok: true,
        message: "Motor Schulz Clásico configurado en modo Offline (no requiere claves).",
      });
    }

    if (provider === "gemini") {
      const ai = getAiClient();
      if (!ai) {
        return res.status(400).json({
          ok: false,
          error: "No hay GEMINI_API_KEY configurada en las variables de entorno.",
        });
      }
      const ping = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: "Responde únicamente 'OK'",
      });
      return res.json({
        ok: true,
        message: "Conexión exitosa con Google Gemini 3.8 Flash.",
      });
    }

    // Default: test Certainty Companion (Lucia AI)
    if (!apiKey) {
      return res.status(400).json({
        ok: false,
        error: "Por favor proporciona la API key para probar la conexión con Certainty Companion.",
      });
    }

    const testReply = await callLuciaChat(
      endpoint,
      apiKey,
      [
        { role: "system", content: "Responde de forma muy breve." },
        { role: "user", content: "Prueba de conexión con el universo Peanuts" },
      ],
      0.3
    );

    return res.json({
      ok: true,
      message: `¡Conexión exitosa con Certainty Companion! Respuesta de prueba recibida: "${testReply.slice(0, 100)}"`,
    });
  } catch (err: any) {
    console.error("AI test connection error:", err);
    return res.status(400).json({
      ok: false,
      error: err.message || "Error al conectar con Certainty Companion.",
    });
  }
});

// Thought generation endpoint (Muro de pensar)
app.post("/api/think", async (req, res) => {
  const { topic } = req.body || {};
  const { apiKey, provider, endpoint } = extractAiRequestConfig(req);

  // 1. Try Certainty Companion (Lucia AI) if provider is 'lucia' and apiKey is present
  if (provider === "lucia" && apiKey) {
    try {
      const prompt = `Eres el narrador contemplativo del universo de Peanuts y del Muro de Pensar de Ari.
Devuelve un JSON estrictamente válido con un pensamiento o cita breve en español.
Puede ser una cita real de autores como Benedetti, Cortázar, Borges, Galeano, Saint-Exupéry, Pessoa, Woolf, Wilde, Rilke, Séneca, Marco Aurelio, Epicuro, Kierkegaard, o bien una reflexión poética atribuida a 'Reflexión de Ari' o 'Pensamiento del Muro'.
Tema pedido: ${topic || "vida, calma, amistad, tiempo, identidad o sueños"}.

Formato JSON esperado:
{
  "quote": "texto de la cita o reflexión",
  "author": "Nombre del autor o Reflexión de...",
  "theme": "tema principal",
  "isOriginal": false
}
Responde únicamente con el JSON sin formato markdown ni explicaciones adicionales.`;

      const reply = await callLuciaChat(
        endpoint,
        apiKey,
        [
          { role: "system", content: "Eres un generador de citas reflexivas en formato JSON estricto." },
          { role: "user", content: prompt },
        ],
        0.7
      );

      // Clean markdown if present
      const cleaned = reply.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json({
        ...parsed,
        source: "Certainty Companion (Lucia AI)",
      });
    } catch (err) {
      console.warn("Certainty Companion think generation failed, trying fallback:", err);
    }
  }

  // 2. Try Gemini if provider is 'gemini' or fallback
  if (provider === "gemini" || (!apiKey && process.env.GEMINI_API_KEY)) {
    try {
      const ai = getAiClient();
      if (ai) {
        const prompt = `Eres el narrador contemplativo del universo de Peanuts y del Muro de Pensar de Ari.
Devuelve un JSON estrictamente válido con un pensamiento o cita breve en español.
Tema pedido: ${topic || "vida, calma, amistad, tiempo, identidad o sueños"}.
Formato JSON:
{
  "quote": "texto de la cita o reflexión",
  "author": "Nombre del autor o Reflexión de...",
  "theme": "tema principal",
  "isOriginal": false
}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({
            ...parsed,
            source: "Google Gemini",
          });
        }
      }
    } catch (err) {
      console.warn("AI think generation via Gemini failed:", err);
    }
  }

  // 3. Curated fallback
  const randomIndex = Math.floor(Math.random() * CURATED_THOUGHTS.length);
  res.json({
    ...CURATED_THOUGHTS[randomIndex],
    source: "Motor Schulz Clásico",
  });
});

// Character dialogue endpoint
app.post("/api/chat", async (req, res) => {
  const { character, message, locationName, thoughtContext, history } = req.body || {};
  const { apiKey, provider, endpoint } = extractAiRequestConfig(req);

  const systemInstruction = `Eres ${character || "Charlie Brown"} del universo de Peanuts (tiras cómicas creadas por Charles M. Schulz).
Estás hablando con Ari en el escenario '${locationName || "el barrio"}'.
Mantén rigurosamente la personalidad y voz del personaje en español:
- Charlie Brown: bondadoso, melancólico, algo inseguro, apasionado por el béisbol, reflexivo pero resignado ("¡Caramba!").
- Linus Van Pelt: sumamente filosófico, reflexivo, sabio más allá de sus años, apegado a su manta de seguridad, creyente ferviente de la Gran Calabaza.
- Lucy Van Pelt: segura de sí misma, mandona pero carismática, práctica, psicóloga de 5 centavos ("¡El doctor está dentro!"), directa.
- Snoopy: juguetón, teatral, imaginativo, amante de la comida y la buena literatura, comunica pensamientos con humor y elegancia canina.
- Sally Brown: expresiva, infantil, práctica, enamorada de su "dulce babbo" Linus, cuestiona la escuela y las reglas absurdas.
- Schroeder: entregado en cuerpo y alma a Beethoven y a su piano de juguete, serio, tolerante con Lucy.
- Peppermint Patty: deportista, enérgica, habla claro y sin rodeos ("¡Hola, chaval!"), informal, muy leal.
- Marcie: muy educada, inteligente, calmada, llama a Peppermint Patty "señor" ("sir"), reflexiva y leal.

Contexto previo: "${thoughtContext || "conversación casual en el escenario"}".
Mensaje que Ari te dice: "${message || "Hola"}".
Responde respondiendo de forma DIRECTA, COHERENTE, ORIGINAL y ESPECÍFICA a lo que Ari te ha dicho (1 a 3 frases, tono de tira cómica clásica de Charles Schulz, en español). NUNCA repitas la misma frase ni la misma respuesta anterior.`;

  // Build message history
  const chatMessages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemInstruction }
  ];

  if (Array.isArray(history) && history.length > 0) {
    for (const h of history.slice(-6)) {
      if (h.text) {
        chatMessages.push({
          role: h.sender === "user" ? "user" : "assistant",
          content: h.text,
        });
      }
    }
  }

  chatMessages.push({
    role: "user",
    content: `Ari te dice: "${message || "¿Qué piensas de este lugar?"}"`,
  });

  // 1. Try Certainty Companion (Lucia AI) if provider is 'lucia' and apiKey is available
  if (provider === "lucia" && apiKey) {
    try {
      const reply = await callLuciaChat(
        endpoint,
        apiKey,
        chatMessages,
        0.75
      );

      return res.json({
        reply,
        provider: "Certainty Companion (Lucia AI)",
      });
    } catch (err: any) {
      console.warn("Certainty Companion chat error, falling back:", err.message);
    }
  }

  // 2. Try Gemini if provider is 'gemini' or fallback when Gemini key exists
  if (provider === "gemini" || (!apiKey && process.env.GEMINI_API_KEY)) {
    try {
      const ai = getAiClient();
      if (ai && character) {
        const historyText = Array.isArray(history)
          ? history.slice(-4).map((h) => `${h.sender === "user" ? "Ari" : character}: "${h.text}"`).join("\n")
          : "";

        const contents = historyText
          ? `${historyText}\nAri te dice: "${message || "¿Qué piensas de este lugar?"}"`
          : `Ari te dice: "${message || "¿Qué piensas de este lugar?"}"`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.75,
          },
        });

        if (response.text) {
          return res.json({
            reply: response.text.trim(),
            provider: "Google Gemini",
          });
        }
      }
    } catch (err: any) {
      console.warn("AI chat failed with Gemini, using authentic contextual NLP engine:", err?.message || err);
    }
  }

  // 3. Authentic contextual NLP engine fallback tailored specifically to the user's message
  const reply = getContextualReply(character || "Charlie Brown", message || "", locationName, thoughtContext);
  res.json({
    reply,
    provider: "Motor Schulz Clásico",
  });
});

// Vite middleware configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
