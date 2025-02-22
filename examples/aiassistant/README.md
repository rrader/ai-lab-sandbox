# DietPlanner Bot

Цей Telegram бот допомагає користувачам планувати здорове харчування, надаючи персоналізовані плани харчування, рецепти та розрахунок калорій.

## Необхідні умови

- Python 3.7 або новіша версія

## Налаштування

1. Клонуйте репозиторій та перейдіть до директорії проекту:

   ```bash
   cd <project-directory>
   ```

2. Встановіть необхідні залежності:

   ```bash
   pip install -r requirements.txt
   ```

3. Створіть файл `.env` з наступними змінними:

   ```
   OPENROUTER_API_KEY=your_openrouter_api_key
   TELEGRAM_TOKEN=your_telegram_bot_token
   ```

## Запуск бота

Запустіть бота командою:

```bash
python diet_bot.py
```

