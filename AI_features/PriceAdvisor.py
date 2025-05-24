import os
import requests
from dotenv import load_dotenv
from langchain.agents import initialize_agent, Tool
from langchain_google_genai import ChatGoogleGenerativeAI

class PriceAdvisor:
    def __init__(self):
        load_dotenv()
        self.GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
        self.CSE_API_KEY = os.getenv("GOOGLE_CSE_API_KEY")
        self.CSE_ID = os.getenv("GOOGLE_CSE_ID")

        if not self.GEMINI_API_KEY or not self.CSE_API_KEY or not self.CSE_ID:
            raise ValueError("Please set GOOGLE_API_KEY, GOOGLE_CSE_API_KEY, and GOOGLE_CSE_ID in your .env file")

        # === Custom Search Tool ===
        def google_custom_search(query):
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                "key": self.CSE_API_KEY,
                "cx": self.CSE_ID,
                "q": query,
            }
            response = requests.get(url, params=params)
            results = response.json()
            snippets = []

            try:
                for item in results.get("items", []):
                    title = item.get("title", "")
                    snippet = item.get("snippet", "")
                    link = item.get("link", "")
                    snippets.append(f"{title}\n{snippet}\n{link}")
            except Exception as e:
                return f"Search failed: {str(e)}"
            
            return "\n\n".join(snippets[:5])  # Top 5 results

        # === Calculator Tool ===
        def calculate_price(input_str):
            """Calculate discounted price from a string input in format 'price,discount'.
            Example: '100,20' for 20% off $100."""
            try:
                # Split the input string into price and discount
                parts = input_str.split(',')
                if len(parts) != 2:
                    return "Error: Please provide input in format 'price,discount' (e.g., '100,20')"
                
                base_price = float(parts[0].strip())
                discount_percentage = float(parts[1].strip())
                
                if discount_percentage < 0 or discount_percentage > 100:
                    return "Error: Discount must be between 0 and 100"
                    
                discount = discount_percentage / 100
                final_price = base_price * (1 - discount)
                return f"${final_price:.2f}"
            except ValueError:
                return "Error: Please provide valid numbers in format 'price,discount'"
            except Exception as e:
                return f"Calculation failed: {str(e)}"

        # Wrap as LangChain Tools
        search_tool = Tool(
            name="Google Search",
            func=google_custom_search,
            description="Searches Google for current product prices and information. Use this to find the current market price of new items."
        )

        calculator_tool = Tool(
            name="Price Calculator",
            func=calculate_price,
            description="Calculates discounted price. Input should be a string in format 'price,discount'. Example: '100,20' for 20% off $100."
        )

        # === Gemini LLM ===
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.GEMINI_API_KEY,
            temperature=0.4,
        )

        # === Create Agent ===
        self.agent = initialize_agent(
            tools=[search_tool, calculator_tool],
            llm=llm,
            agent="zero-shot-react-description",
            verbose=True
        )

    def get_price_estimate(self, item_title, item_description, condition):
        query = f'''
You are a resale pricing expert. Follow these steps:

1. Use the Google Search tool to find the current market price of this item when new in Bangladesh.
2. Based on the condition "{condition}", apply a 20-30% discount to the new price.
3. Use the Price Calculator tool to calculate the final price. Input should be in format 'price,discount' (e.g., '100,20' for 20% off $100).
4. Explain your reasoning for the discount percentage chosen.

Title: {item_title}
Description: {item_description}
Condition: {condition}

Return your answer in BDT and explain your reasoning.
'''
        response = self.agent.run(query)
        return response

# Example usage:
if __name__ == "__main__":
    advisor = PriceAdvisor()
    result = advisor.get_price_estimate("Gshock Casio Watch", "Rugged Casio Watch", "Used - Poor")
    print(result)