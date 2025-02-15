import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the LLM
llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    model_name="google/gemini-2.0-flash-lite-preview-02-05:free",
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_message = """
    👋 Welcome to DietPlanner Bot! 
    
    I can help you with:
    /plan - Get a personalized diet plan
    /recipe - Get healthy recipe suggestions
    /calories - Calculate calories for a meal
    
    Just type your question or use these commands!
    """
    await update.message.reply_text(welcome_message)

async def get_ai_response(prompt_template: str, **kwargs) -> str:
    try:
        prompt = PromptTemplate(template=prompt_template, input_variables=list(kwargs.keys()))
        chain = LLMChain(prompt=prompt, llm=llm)
        response = chain.run(**kwargs)
        return response
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return "Sorry, an error occurred while processing your request. Please try again."

async def plan(update: Update, context: ContextTypes.DEFAULT_TYPE):
    plan_template = """Create a healthy diet plan for one day. Follow this structure:
    
    Breakfast:
    - Meal suggestions with portions
    - Approximate calories
    
    Lunch:
    - Meal suggestions with portions
    - Approximate calories
    
    Dinner:
    - Meal suggestions with portions
    - Approximate calories
    
    Snacks:
    - 2-3 healthy snack options
    - Approximate calories
    
    Total daily calories and macronutrient breakdown.
    """
    
    response = await get_ai_response(plan_template)
    await update.message.reply_text(response)

async def recipe(update: Update, context: ContextTypes.DEFAULT_TYPE):
    recipe_template = """Suggest a healthy recipe with the following details:
    
    1. Recipe name
    2. Ingredients with quantities
    3. Step-by-step preparation instructions
    4. Cooking time
    5. Nutritional information per serving (calories, protein, carbs, fats)
    6. Tips for preparation
    """
    
    response = await get_ai_response(recipe_template)
    await update.message.reply_text(response)

async def calories(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_input = " ".join(context.args)
    if not user_input:
        await update.message.reply_text("Please provide the food items to calculate calories. Example: /calories rice chicken broccoli")
        return
    
    calories_template = """Calculate nutritional information for: {food_items}
    
    Please provide:
    1. Total calories
    2. Protein content
    3. Carbohydrate content
    4. Fat content
    5. Additional nutritional insights
    """
    
    response = await get_ai_response(calories_template, food_items=user_input)
    await update.message.reply_text(response)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.message.text
    chat_template = """As a diet planning assistant, please help with this question: {question}
    Provide clear, concise, and practical advice based on sound nutritional principles."""
    
    response = await get_ai_response(chat_template, question=message)
    await update.message.reply_text(response)

def main():
    # Create application
    application = Application.builder().token(os.getenv("TELEGRAM_TOKEN")).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("plan", plan))
    application.add_handler(CommandHandler("recipe", recipe))
    application.add_handler(CommandHandler("calories", calories))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Start the bot
    print("Bot is running...")
    application.run_polling()

if __name__ == "__main__":
    main() 