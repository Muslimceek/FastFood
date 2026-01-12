import { GoogleGenAI } from "@google/genai";
import { Order, OrderStatus } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const generateManagerInsights = async (input: Order[] | string) => {
  const ai = getClient();
  if (!ai) return "API Key not configured. Unable to generate insights.";

  let salesSummary = '';

  if (typeof input === 'string') {
    salesSummary = input;
  } else {
    // Prepare data summary for the AI from Order[]
    const orders = input;
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalItemsSold = completedOrders.reduce((sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0), 0);
    
    // Create a simplified text representation of recent sales
    salesSummary = `
      Total Revenue: ${totalRevenue} RUB
      Total Orders Completed: ${completedOrders.length}
      Total Items Sold: ${totalItemsSold}
      Detailed Recent Orders: ${JSON.stringify(completedOrders.slice(-10).map(o => ({
        time: new Date(o.createdAt).toLocaleTimeString(),
        items: o.items.map(i => i.name).join(', '),
        total: o.totalAmount
      })))}
    `;
  }

  const prompt = `
    You are an expert restaurant business analyst. Analyze the following fast food sales data in Russia.
    Data:
    ${salesSummary}

    Please provide a concise analysis in Russian language (Markdown format) covering:
    1. Key performance trends.
    2. Which items seem popular or often bought together (inference).
    3. Specific actionable advice for the manager to increase revenue or efficiency.
    4. A "Quote of the day" for the kitchen staff motivation.
    
    Keep it professional but encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Не удалось сгенерировать анализ. Проверьте соединение или API ключ.";
  }
};