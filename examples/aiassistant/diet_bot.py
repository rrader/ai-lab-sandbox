import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv

# Завантаження змінних середовища
load_dotenv()

# Ініціалізація LLM
llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    model_name="google/gemini-2.0-flash-lite-preview-02-05:free",
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_message = """
    👋 Вітаємо у DietPlanner Bot! 
    
    Я можу допомогти вам з:
    /plan - Отримати персоналізований план харчування
    /recipe - Отримати пропозиції здорових рецептів
    /calories - Розрахувати калорії для страви
    
    Просто напишіть своє запитання або використовуйте ці команди!
    """
    await update.message.reply_text(welcome_message)

async def get_ai_response(prompt_template: str, **kwargs) -> str:
    try:
        prompt = PromptTemplate(template=prompt_template, input_variables=list(kwargs.keys()))
        chain = LLMChain(prompt=prompt, llm=llm)
        response = chain.run(**kwargs)
        return response
    except Exception as e:
        print(f"Сталася помилка: {str(e)}")
        return "Вибачте, під час обробки вашого запиту сталася помилка. Будь ласка, спробуйте ще раз."

async def plan(update: Update, context: ContextTypes.DEFAULT_TYPE):
    plan_template = """Створіть здоровий план харчування на один день. Дотримуйтесь такої структури:
    
    Сніданок:
    - Пропозиції страв з порціями
    - Приблизні калорії
    
    Обід:
    - Пропозиції страв з порціями
    - Приблизні калорії
    
    Вечеря:
    - Пропозиції страв з порціями
    - Приблизні калорії
    
    Перекуски:
    - 2-3 варіанти здорових перекусок
    - Приблизні калорії
    
    Загальна кількість калорій за день та розподіл макроелементів.
    """
    
    response = await get_ai_response(plan_template)
    await update.message.reply_text(response)

async def recipe(update: Update, context: ContextTypes.DEFAULT_TYPE):
    recipe_template = """Запропонуйте здоровий рецепт з такими деталями:
    
    1. Назва рецепту
    2. Інгредієнти з кількістю
    3. Покрокові інструкції з приготування
    4. Час приготування
    5. Харчова цінність на порцію (калорії, білки, вуглеводи, жири)
    6. Поради щодо приготування
    """
    
    response = await get_ai_response(recipe_template)
    await update.message.reply_text(response)

async def calories(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_input = " ".join(context.args)
    if not user_input:
        await update.message.reply_text("Будь ласка, вкажіть продукти для підрахунку калорій. Приклад: /calories рис курка броколі")
        return
    
    calories_template = """Розрахуйте харчову цінність для: {food_items}
    
    Будь ласка, надайте:
    1. Загальну кількість калорій
    2. Вміст білків
    3. Вміст вуглеводів
    4. Вміст жирів
    5. Додаткові поради щодо харчової цінності
    """
    
    response = await get_ai_response(calories_template, food_items=user_input)
    await update.message.reply_text(response)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.message.text
    chat_template = """Як помічник з планування дієти, будь ласка, допоможіть з цим питанням: {question}
    Надайте чіткі, стислі та практичні поради, засновані на принципах здорового харчування."""
    
    response = await get_ai_response(chat_template, question=message)
    await update.message.reply_text(response)

def main():
    # Створення додатку
    application = Application.builder().token(os.getenv("TELEGRAM_TOKEN")).build()

    # Додавання обробників
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("plan", plan))
    application.add_handler(CommandHandler("recipe", recipe))
    application.add_handler(CommandHandler("calories", calories))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Запуск бота
    print("Бот запущено...")
    application.run_polling()

if __name__ == "__main__":
    main() 