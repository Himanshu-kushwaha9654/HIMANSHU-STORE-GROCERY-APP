import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";

export class AiService {
  private static instance: AiService;
  private genAI: GoogleGenerativeAI | null = null;
  private chatSession: ChatSession | null = null;
  private isConfigured = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  private init() {
    // In a real Spring Boot app, you'd fetch from your own backend endpoint.
    // For now, we use the client-side SDK with the injected env variable.
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isConfigured = true;
    }
  }

  /**
   * Returns whether the AI service is properly configured with an API key.
   */
  public isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Initializes or resets the conversational chat history.
   */
  public startNewChat() {
    if (!this.genAI) return;
    
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are an elite, premium grocery shopping concierge for 'Himanshu Store'. Your goal is to help users plan meals, find deals, and suggest recipes. Keep your answers concise, friendly, and formatted nicely. Always suggest high-quality, fresh, and organic products when applicable."
    });

    this.chatSession = model.startChat({
      history: [],
    });
  }

  /**
   * Sends a message to the AI and streams back the response in chunks.
   * @param message The user's input text
   * @param onChunk Callback triggered when a new piece of text arrives
   * @returns The complete accumulated response
   */
  public async streamMessage(message: string, onChunk: (text: string) => void): Promise<string> {
    if (!this.isReady() || !this.genAI) {
      throw new Error("AI_NOT_CONFIGURED");
    }

    if (!this.chatSession) {
      this.startNewChat();
    }

    try {
      const result = await this.chatSession!.sendMessageStream(message);
      let fullText = "";
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(fullText);
      }
      
      return fullText;
    } catch (error) {
      console.error("AiService Error:", error);
      throw new Error("API_ERROR");
    }
  }
}

export const aiService = AiService.getInstance();
