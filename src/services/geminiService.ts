import { GoogleGenAI, Chat, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Manages a chat session with Gemini, preserving conversation history.
 * @param existingChat - An optional existing chat instance.
 * @param message - The user's message.
 * @returns An object containing the updated chat instance and the model's response text.
 */
export const runChat = async (existingChat: Chat | null, message: string): Promise<{chatInstance: Chat, response: string}> => {
  const chat = existingChat || ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are Vibe Bot, a helpful and friendly AI assistant for developers. You are integrated into a code editor called Vibe Code. Be concise and helpful.'
    }
  });

  const response = await chat.sendMessage({ message });
  return { chatInstance: chat, response: response.text };
};

/**
 * Analyzes a code snippet for a quick overview using a fast model.
 * @param code - The code to analyze.
 * @returns A markdown-formatted analysis from the model.
 */
export const analyzeCode = async (code: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Analyze the following code snippet. Provide a brief, high-level overview of what it does, its purpose, and any potential improvements. Format the response in markdown.

--- CODE ---
${code}
--- END CODE ---
`,
  });
  return response.text;
};

/**
 * Performs complex code refactoring using the Pro model with maximum thinking budget.
 * @param code - The code to refactor.
 * @returns The refactored code block from the model.
 */
export const refactorCodeWithThinking = async (code: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `You are an expert software engineer. Refactor the following code snippet. Your goal is to improve its readability, efficiency, and adherence to best practices. Provide only the refactored code in a single code block, with brief comments explaining the major changes.

--- CODE TO REFACTOR ---
${code}
--- END CODE ---
`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });
  return response.text;
};

/**
 * Generates a file and folder structure based on a user prompt.
 * @param prompt - The user's description of what to create.
 * @returns An array of file objects with path and content.
 */
export const scaffoldProject = async (prompt: string): Promise<{path: string; content: string}[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Use a powerful model for this complex task
    contents: `You are an expert software architect. Based on the user's request, generate a list of files and their content to scaffold a new feature or project.
- Create a logical file and folder structure.
- Provide complete, high-quality code for each file.
- The user is working in a React/TypeScript environment. Assume standard tools like Vite or Create React App are in use.
- The file paths should be relative, e.g., "src/components/Button.tsx".
- Respond ONLY with the JSON object that adheres to the provided schema.

USER REQUEST:
---
${prompt}
---
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.STRING,
              description: 'The relative path of the file, including the filename. E.g., "src/components/UserProfile/UserProfile.tsx".',
            },
            content: {
              type: Type.STRING,
              description: 'The complete code or text content for the file.',
            },
          },
          required: ['path', 'content'],
        },
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    // Gemini may wrap the JSON in ```json ... ```, so we need to strip that.
    const sanitizedJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
    const result = JSON.parse(sanitizedJsonText);
    return result as {path: string; content: string}[];
  } catch (e) {
    console.error("Failed to parse Gemini's JSON response:", response.text);
    throw new Error("AI failed to generate a valid file structure. Please try again.");
  }
};
