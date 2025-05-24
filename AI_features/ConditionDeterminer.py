import google.generativeai as genai
import pathlib  
import os
from dotenv import load_dotenv

class ConditionDeterminer:
    def __init__(self, model_name='gemini-1.5-flash'):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)

    def determine_condition(self, image_path):
        image_path = pathlib.Path(image_path)
        image_data = image_path.read_bytes()
        response = self.model.generate_content([
            "Determine the condition of the item in the image. The item can be in Good, Mediocre, or Bad condition. Return a number between 1 and 10 where 1 is the worst and 10 is the best condition. No other text.",
            {"mime_type": "image/jpeg", "data": image_data}
        ])
        return response.text.strip()

# Example usage:
determiner = ConditionDeterminer()
result = determiner.determine_condition("bad_condition.jpg")
print(result)