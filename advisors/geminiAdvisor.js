import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey } from "../config/gemini.config";

// Initialize the Gemini API
let genAI = null;

function initGemini(apiKey) {
  if (!genAI && apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generateGeminiAdvice(question, userProfile, conversationHistory = []) {
  try {
    const apiKey = getGeminiApiKey();
    
    console.log("🔑 Gemini API Key status:", apiKey ? `Found (${apiKey.substring(0, 10)}...)` : "Missing");
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      throw new Error("Gemini API key not found or not configured");
    }

    console.log("🤖 Initializing Gemini AI...");
    console.log("API Key (first 20 chars):", apiKey.substring(0, 20) + "...");
    
    const ai = initGemini(apiKey);
    
    // Use Gemini 2.5 Flash - the latest available model
    const model = ai.getGenerativeModel({ 
      model: "models/gemini-2.5-flash"
    });
    
    console.log("✅ Gemini 2.5 Flash initialized successfully");

    // Build context from user profile
    let profileContext = "";
    if (userProfile) {
      const annualIncome = userProfile.annualIncome || 0;
      const currentBalance = userProfile.currentBalance || 0;
      const monthlyIncome = annualIncome / 12;
      
      profileContext = `\n\nUser Profile Context:
- Annual Income: $${annualIncome.toLocaleString()}
- Monthly Income: $${monthlyIncome.toFixed(2).toLocaleString()}
- Current Balance: $${currentBalance.toLocaleString()}`;
    }

    // Build conversation history for context
    let historyContext = "";
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6); // Last 3 exchanges
      historyContext = "\n\nRecent Conversation:\n" + 
        recentHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    }

    // System prompt for financial advisor
    const systemPrompt = `You are Wise, an expert AI financial advisor for FinanceWise, a personal finance app. Your role is to provide clear, actionable, and personalized financial advice.

Guidelines:
1. Be conversational, friendly, and encouraging
2. Provide specific, actionable advice tailored to the user's financial situation
3. Use clear examples and explain financial concepts simply
4. Focus on practical steps users can take immediately
5. When relevant, mention specific financial products or strategies (401k, Roth IRA, index funds, emergency funds, etc.)
6. If the user's profile shows limited income/savings, prioritize emergency funds and budgeting basics
7. For investment questions, emphasize diversification and low-cost index funds
8. Always consider the user's risk tolerance and time horizon
9. Keep responses concise but informative (2-4 paragraphs typically)
10. Include relevant reputable sources when appropriate (IRS.gov, Investor.gov, CFPB.gov, etc.)

Your expertise covers:
- Budgeting and saving strategies
- Investment basics (stocks, bonds, ETFs, mutual funds)
- Retirement planning (401k, IRA, Roth IRA)
- Tax optimization
- Debt management
- Credit scores and reports
- Insurance planning
- Emergency funds
- Major purchases (homes, cars)
- Student loans
- And all other personal finance topics

${profileContext}${historyContext}`;

    // Combine system prompt with user question
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${question}\n\nProvide a helpful, personalized response:`;

    // Generate response
    console.log("📤 Sending request to Gemini API...");
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    console.log("📥 Received response from Gemini:", text.substring(0, 100) + "...");

    // Extract potential sources (basic implementation)
    const sources = extractSources(text);

    return {
      answer: text,
      sources: sources,
      model: "gemini-pro"
    };

  } catch (error) {
    console.error("❌ Gemini API error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

// Helper function to extract and suggest relevant sources
function extractSources(text) {
  const sources = [];
  
  // Common financial authority sources
  const sourceMap = {
    'irs': { title: 'IRS - Tax Information', url: 'https://www.irs.gov' },
    'tax': { title: 'IRS - Tax Information', url: 'https://www.irs.gov' },
    '401': { title: 'IRS - 401(k) Plans', url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/401k-resource-guide' },
    'roth': { title: 'IRS - Roth IRA', url: 'https://www.irs.gov/retirement-plans/roth-iras' },
    'ira': { title: 'Investor.gov - IRAs', url: 'https://www.investor.gov/introduction-investing/investing-basics/save-invest/retirement/individual-retirement-accounts' },
    'invest': { title: 'Investor.gov - Investing Basics', url: 'https://www.investor.gov/introduction-investing/investing-basics' },
    'etf': { title: 'Investor.gov - ETFs', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/exchange-traded-funds-etfs' },
    'index fund': { title: 'Investor.gov - Mutual Funds', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds' },
    'budget': { title: 'CFPB - Budgeting', url: 'https://www.consumerfinance.gov/consumer-tools/budgeting/' },
    'credit': { title: 'USA.gov - Credit Reports', url: 'https://www.usa.gov/credit-reports' },
    'emergency fund': { title: 'Investopedia - Emergency Fund', url: 'https://www.investopedia.com/terms/e/emergency_fund.asp' },
    'student loan': { title: 'StudentAid.gov - Loan Repayment', url: 'https://studentaid.gov/manage-loans/repayment' },
    'mortgage': { title: 'USA.gov - Mortgages', url: 'https://www.usa.gov/mortgages' },
    'insurance': { title: 'USA.gov - Insurance', url: 'https://www.usa.gov/insurance' },
  };

  const lowerText = text.toLowerCase();
  const addedUrls = new Set();

  for (const [keyword, source] of Object.entries(sourceMap)) {
    if (lowerText.includes(keyword) && !addedUrls.has(source.url)) {
      sources.push(source);
      addedUrls.add(source.url);
      if (sources.length >= 3) break; // Limit to 3 sources
    }
  }

  return sources;
}

