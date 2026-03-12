import { useState } from "react";
import {
  Search, BookOpen, MessageCircle, Send, Paperclip, ChevronDown,
  ChevronRight, ThumbsUp, ThumbsDown, Play, HelpCircle, Bug,
  Lightbulb, Star, X, Plus, Clock, CheckCircle, AlertCircle,
  Phone, Upload, Camera, Info
} from "lucide-react";

interface KBArticle {
  id: number;
  title: string;
  category: string;
  type: "ARTICLE" | "FAQ" | "TUTORIAL";
  helpful: boolean;
  likes: number;
  content: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  created: string;
  lastReply: string;
  messages: { from: "user" | "support"; text: string; time: string; attachments?: string[] }[];
  rated?: number;
}

interface ChatMessage {
  id: string;
  from: "user" | "bot" | "operator";
  text: string;
  time: string;
}

const mockArticles: KBArticle[] = [
  {
    id: 1,
    category: "Начало работы",
    type: "ARTICLE",
    title: "Как начать работу с Промт-Студией",
    content: `<h3>1. Регистрация аккаунта</h3>
<ul>
<li>Перейдите на главную страницу Промт-Студия</li>
<li>Нажмите кнопку «Регистрация»</li>
<li>Укажите email и придумайте надёжный пароль</li>
<li>Подтвердите email, перейдя по ссылке из письма</li>
</ul>
<h3>2. Настройка профиля</h3>
<ul>
<li>Заполните информацию о себе</li>
<li>Укажите специализацию</li>
<li>Добавьте аватар (опционально)</li>
</ul>
<h3>3. Выбор тарифа</h3>
<ul>
<li><strong>Free</strong>: базовый доступ к библиотеке промптов</li>
<li><strong>PRO</strong> (990₽/месяц): неограниченный доступ + приоритетная поддержка</li>
<li><strong>Business</strong> (2999₽/месяц): все функции PRO + API + команда до 5 человек</li>
</ul>
<h3>4. Первое знакомство с интерфейсом</h3>
<ul>
<li>Prompt-Market: библиотека готовых промптов</li>
<li>Studio: создание и управление своими промптами</li>
<li>Менеджер аккаунтов: безопасное хранение логинов и паролей</li>
</ul>
<h3>5. Начало использования</h3>
<ul>
<li>Изучите Базу знаний</li>
<li>Попробуйте бесплатные промпты</li>
<li>Присоединяйтесь к сообществу</li>
</ul>`,
    likes: 156,
    helpful: true
  },
  {
    id: 2,
    category: "Начало работы",
    type: "ARTICLE",
    title: "Что такое промт-инженеринг",
    content: `<p>Промт-инженеринг — это искусство составления эффективных запросов к искусственному интеллекту.</p>
<h3>Основные принципы:</h3>
<ul>
<li>Чёткость формулировок</li>
<li>Контекст и детализация</li>
<li>Структурирование запроса</li>
<li>Итеративное улучшение</li>
</ul>
<h3>Почему это важно:</h3>
<ul>
<li>Качественный промт = качественный результат</li>
<li>Экономия времени и ресурсов</li>
<li>Предсказуемость результата</li>
<li>Профессиональное использование AI</li>
</ul>
<h3>Промт-Студия помогает:</h3>
<ul>
<li>Освоить лучшие практики промт-инженеринга</li>
<li>Использовать готовые шаблоны</li>
<li>Создавать свои уникальные промпты</li>
<li>Делиться опытом с сообществом</li>
</ul>`,
    likes: 142,
    helpful: true
  },
  {
    id: 3,
    category: "Маркетплейс",
    type: "TUTORIAL",
    title: "Как создать и опубликовать промт",
    content: `<h3>Шаг 1: Создание промпта</h3>
<ol>
<li>Перейдите в раздел Studio</li>
<li>Нажмите «Создать новый промт»</li>
<li>Введите название промпта</li>
<li>Опишите задачу, которую решает промт</li>
<li>Напишите сам промт (шаблон с переменными)</li>
<li>Добавьте примеры использования</li>
<li>Укажите параметры (температура, max tokens и т.д.)</li>
</ol>
<h3>Шаг 2: Тестирование</h3>
<ol>
<li>Протестируйте промт на разных AI-моделях</li>
<li>Проверьте корректность работы переменных</li>
<li>Убедитесь в качестве результатов</li>
<li>Внесите необходимые правки</li>
</ol>
<h3>Шаг 3: Оформление</h3>
<ol>
<li>Добавьте подробное описание</li>
<li>Укажите категорию (маркетинг, программирование, дизайн и т.д.)</li>
<li>Добавьте теги для поиска</li>
<li>Загрузите скриншоты результатов (опционально)</li>
<li>Укажите цену (если продаёте) или отметьте как бесплатный</li>
</ol>
<h3>Шаг 4: Публикация</h3>
<ol>
<li>Нажмите «Опубликовать»</li>
<li>Подтвердите согласие с условиями платформы</li>
<li>Промт появится в библиотеке после модерации (обычно в течение 24 часов)</li>
</ol>
<h3>Важные моменты:</h3>
<ul>
<li>Вы сохраняете авторские права на промт</li>
<li>Предоставляете платформе лицензию на распространение</li>
<li>Несёте ответственность за содержание</li>
<li>Можете редактировать или удалить промт в любой момент</li>
</ul>`,
    likes: 98,
    helpful: true
  },
  {
    id: 4,
    category: "Маркетплейс",
    type: "ARTICLE",
    title: "Как купить промт",
    content: `<h3>Процесс покупки:</h3>
<h4>1. Поиск промпта</h4>
<ul>
<li>Используйте поиск по ключевым словам</li>
<li>Фильтруйте по категориям</li>
<li>Сортируйте по рейтингу, цене, новизне</li>
</ul>
<h4>2. Изучение промпта</h4>
<ul>
<li>Прочитайте описание</li>
<li>Посмотрите примеры использования</li>
<li>Проверьте отзывы других покупателей</li>
<li>Убедитесь в совместимости с вашими AI-моделями</li>
</ul>
<h4>3. Покупка</h4>
<ul>
<li>Нажмите «Купить»</li>
<li>Выберите способ оплаты (карта, СБП, электронный кошелёк)</li>
<li>Подтвердите оплату</li>
<li>Промт автоматически добавится в вашу библиотеку</li>
</ul>
<h4>4. Использование</h4>
<ul>
<li>Перейдите в Studio → Библиотека</li>
<li>Найдите купленный промт</li>
<li>Нажмите «Использовать»</li>
<li>Заполните переменные (если есть)</li>
<li>Скопируйте результат или отправьте в AI-модель</li>
</ul>
<h3>Важная информация:</h3>
<ul>
<li>Покупка даёт право личного использования</li>
<li>Перепродажа запрещена без согласия автора</li>
<li>Возврат средств не предусмотрен (см. Публичную оферту)</li>
<li>При обнаружении мошенничества — подайте жалобу</li>
</ul>`,
    likes: 87,
    helpful: true
  },
  {
    id: 5,
    category: "Менеджер аккаунтов",
    type: "TUTORIAL",
    title: "Как пользоваться Менеджером аккаунтов",
    content: `<p>Менеджер аккаунтов — это безопасное хранилище ваших логинов и паролей.</p>
<h3>Начало работы:</h3>
<h4>1. Доступ к Менеджеру</h4>
<ul>
<li>Перейдите в раздел «Менеджер аккаунтов»</li>
<li>Введите мастер-пароль (это пароль от вашего аккаунта Промт-Студия)</li>
</ul>
<h4>2. Добавление аккаунта</h4>
<ul>
<li>Нажмите «Добавить аккаунт»</li>
<li>Введите название сервиса (например, «ChatGPT»)</li>
<li>Введите логин/email</li>
<li>Введите пароль</li>
<li>Добавьте заметки (опционально)</li>
<li>Нажмите «Сохранить»</li>
</ul>
<h4>3. Просмотр сохранённых данных</h4>
<ul>
<li>Все аккаунты отображаются списком</li>
<li>Нажмите на аккаунт для просмотра деталей</li>
<li>Пароль скрыт по умолчанию (нажмите «показать» для отображения)</li>
<li>Кнопка «Копировать» для быстрого копирования логина или пароля</li>
</ul>
<h4>4. Редактирование и удаление</h4>
<ul>
<li>Нажмите «Редактировать» для изменения данных</li>
<li>Нажмите «Удалить» для удаления аккаунта</li>
<li>Подтвердите действие</li>
</ul>
<h3>Безопасность:</h3>
<ul>
<li>Все данные шифруются алгоритмом AES-256</li>
<li>Доступ только с вашего устройства</li>
<li>Мы не видим ваши пароли</li>
<li>Регулярно меняйте мастер-пароль</li>
<li>Включите двухфакторную аутентификацию</li>
</ul>
<h3>Советы:</h3>
<ul>
<li>Используйте уникальный мастер-пароль</li>
<li>Не храните мастер-пароль в браузере</li>
<li>Регулярно делайте резервные копии важных данных</li>
<li>Проверяйте сохранённые аккаунты на актуальность</li>
</ul>`,
    likes: 74,
    helpful: true
  },
  {
    id: 6,
    category: "Менеджер аккаунтов",
    type: "ARTICLE",
    title: "Настройка автопостинга",
    content: `<p>Функция автопостинга позволяет автоматически публиковать контент.</p>
<h3>Настройка:</h3>
<h4>1. Подключение аккаунтов</h4>
<ul>
<li>Перейдите в Менеджер аккаунтов</li>
<li>Добавьте аккаунты социальных сетей</li>
<li>Предоставьте необходимые разрешения</li>
</ul>
<h4>2. Создание расписания</h4>
<ul>
<li>Перейдите в раздел «Планировщик»</li>
<li>Нажмите «Создать расписание»</li>
<li>Выберите платформы для публикации</li>
<li>Укажите дни и время</li>
<li>Настройте частоту (ежедневно, еженедельно, ежемесячно)</li>
</ul>
<h4>3. Подготовка контента</h4>
<ul>
<li>Создайте или выберите промт для генерации контента</li>
<li>Настройте переменные</li>
<li>Добавьте медиафайлы (если нужно)</li>
</ul>
<h4>4. Активация</h4>
<ul>
<li>Включите автопостинг</li>
<li>Проверьте настройки</li>
<li>Сохраните</li>
</ul>
<h3>Мониторинг:</h3>
<ul>
<li>Просматривайте статистику публикаций</li>
<li>Отслеживайте ошибки</li>
<li>Корректируйте расписание при необходимости</li>
</ul>
<h3>Важные моменты:</h3>
<ul>
<li>Соблюдайте правила социальных сетей</li>
<li>Не злоупотребляйте частотой публикаций</li>
<li>Проверяйте контент перед публикацией</li>
<li>Автопостинг требует активной подписки PRO или Business</li>
</ul>`,
    likes: 63,
    helpful: true
  },
  {
    id: 7,
    category: "Финансы",
    type: "FAQ",
    title: "Часто задаваемые вопросы об оплате",
    content: `<h4>ВОПРОС: Какие способы оплаты доступны?</h4>
<p><strong>ОТВЕТ:</strong></p>
<ul>
<li>Банковские карты МИР, Visa, MasterCard</li>
<li>Система быстрых платежей (СБП)</li>
<li>Электронные кошельки (ЮMoney, WebMoney и др.)</li>
<li>Мобильные платёжные системы (Apple Pay, Google Pay)</li>
</ul>
<h4>ВОПРОС: Безопасна ли оплата?</h4>
<p><strong>ОТВЕТ:</strong> Да. Мы используем:</p>
<ul>
<li>Шифрование SSL/TLS</li>
<li>Платёжных провайдеров: ЮKassa, Robokassa, АО «ТБанк»</li>
<li>Не храним данные карт на наших серверах</li>
<li>Соответствие стандарту PCI-DSS</li>
</ul>
<h4>ВОПРОС: Как получить чек?</h4>
<p><strong>ОТВЕТ:</strong></p>
<ul>
<li>Чек автоматически отправляется на email после оплаты</li>
<li>Соответствует 54-ФЗ</li>
<li>Можно скачать в личном кабинете в разделе «Подписка»</li>
</ul>
<h4>ВОПРОС: Как отменить подписку?</h4>
<p><strong>ОТВЕТ:</strong></p>
<ul>
<li>Перейдите в Настройки → Подписка</li>
<li>Нажмите «Отключить автопродление»</li>
<li>Доступ сохранится до конца оплаченного периода</li>
</ul>
<h4>ВОПРОС: Возможен ли возврат средств?</h4>
<p><strong>ОТВЕТ:</strong></p>
<ul>
<li><strong>За подписку:</strong> возврат не предусмотрен (см. Публичную оферту)</li>
<li><strong>За промпты:</strong> возврат не предусмотрен, так как платформа не является стороной сделки</li>
<li><strong>При мошенничестве:</strong> подайте жалобу, автор будет заблокирован</li>
</ul>
<h4>ВОПРОС: Могу ли я сменить тариф?</h4>
<p><strong>ОТВЕТ:</strong> Да. Смена тарифа доступна в любой момент:</p>
<ul>
<li>Перейдите на более высокий тариф: доплата рассчитывается пропорционально</li>
<li>Перейдите на более низкий тариф: изменения вступят в силу со следующего периода</li>
</ul>`,
    likes: 210,
    helpful: true
  },
  {
    id: 8,
    category: "Безопасность",
    type: "ARTICLE",
    title: "Безопасность и двухфакторная аутентификация (2FA)",
    content: `<p>Защита вашего аккаунта — наш приоритет.</p>
<h3>Двухфакторная аутентификация (2FA):</h3>
<h4>Что это:</h4>
<ul>
<li>Дополнительный уровень защиты аккаунта</li>
<li>Требует подтверждения входа через мобильное приложение</li>
<li>Даже при утечке пароля злоумышленник не войдёт в аккаунт</li>
</ul>
<h4>Как включить:</h4>
<ol>
<li>Перейдите в Настройки → Безопасность</li>
<li>Нажмите «Включить 2FA»</li>
<li>Отсканируйте QR-код приложением: Google Authenticator, Authy, Microsoft Authenticator</li>
<li>Введите код из приложения</li>
<li>Сохраните резервные коды (на случай потери доступа к приложению)</li>
<li>Готово!</li>
</ol>
<h4>При входе:</h4>
<ol>
<li>Введите логин и пароль</li>
<li>Откройте приложение аутентификатора</li>
<li>Введите 6-значный код</li>
<li>Доступ разрешён</li>
</ol>
<h3>Рекомендации по безопасности:</h3>
<h4>1. Пароль:</h4>
<ul>
<li>Минимум 12 символов</li>
<li>Заглавные и строчные буквы</li>
<li>Цифры и специальные символы</li>
<li>Уникальный (не используйте на других сайтах)</li>
</ul>
<h4>2. Мастер-пароль Менеджера аккаунтов:</h4>
<ul>
<li>Должен быть максимально сложным</li>
<li>Никогда не сообщайте его</li>
<li>Не храните в браузере</li>
</ul>
<h4>3. Email:</h4>
<ul>
<li>Используйте надёжный email</li>
<li>Включите 2FA на почтовом сервисе</li>
<li>Регулярно проверяйте почту на предмет подозрительных писем</li>
</ul>
<h4>4. Устройства:</h4>
<ul>
<li>Не входите с общественных компьютеров</li>
<li>Всегда выходите из аккаунта на чужих устройствах</li>
<li>Используйте только доверенные сети Wi-Fi</li>
</ul>
<h4>5. Мониторинг активности:</h4>
<ul>
<li>Проверяйте историю входов (Настройки → Безопасность → Активность)</li>
<li>Немедленно меняйте пароль при подозрении на взлом</li>
<li>Обратитесь в поддержку: security@prompt-studio.ru</li>
</ul>
<h3>Что делать при компрометации:</h3>
<ol>
<li>Немедленно смените пароль</li>
<li>Завершите все активные сессии</li>
<li>Проверьте Менеджер аккаунтов на несанкционированные изменения</li>
<li>Уведомите поддержку</li>
</ol>`,
    likes: 132,
    helpful: true
  },
  {
    id: 9,
    category: "Безопасность",
    type: "ARTICLE",
    title: "Защита персональных данных",
    content: `<p>Мы соблюдаем Федеральный закон № 152-ФЗ «О персональных данных».</p>
<h3>Какие данные мы собираем:</h3>
<h4>1. Предоставляемые вами:</h4>
<ul>
<li>Email</li>
<li>Имя (опционально)</li>
<li>Пароль (хэшируется)</li>
<li>Платёжная информация (обрабатывается провайдерами)</li>
</ul>
<h4>2. Собираемые автоматически:</h4>
<ul>
<li>IP-адрес</li>
<li>Информация о браузере</li>
<li>Данные об устройстве</li>
<li>Cookies</li>
</ul>
<h4>3. Менеджер аккаунтов:</h4>
<ul>
<li>Логины и пароли от внешних сервисов</li>
<li>Шифруются AES-256</li>
<li>Доступны только вам</li>
</ul>
<h3>Как мы защищаем данные:</h3>
<ul>
<li>Шифрование при передаче (SSL/TLS)</li>
<li>Шифрование при хранении (AES-256)</li>
<li>Сервера в России (соответствие 152-ФЗ)</li>
<li>Регулярное резервное копирование</li>
<li>Мониторинг безопасности</li>
<li>Ограничение доступа сотрудников</li>
</ul>
<h3>Ваши права:</h3>
<h4>1. Доступ к данным:</h4>
<ul>
<li>Можете запросить копию своих данных</li>
<li>Email: privacy@prompt-studio.ru</li>
</ul>
<h4>2. Исправление:</h4>
<ul>
<li>Редактируйте данные в настройках профиля</li>
<li>Или обратитесь в поддержку</li>
</ul>
<h4>3. Удаление:</h4>
<ul>
<li>Удалите аккаунт в настройках</li>
<li>Данные удаляются в течение 30 дней</li>
<li>Кроме информации, требуемой законом</li>
</ul>
<h4>4. Отзыв согласия:</h4>
<ul>
<li>Можете отозвать согласие на обработку</li>
<li>Это может ограничить функционал</li>
</ul>
<h3>Cookies:</h3>
<h4>Мы используем:</h4>
<ul>
<li>Необходимые cookies (работа сайта)</li>
<li>Функциональные cookies (настройки)</li>
<li>Аналитические cookies (улучшение сервиса)</li>
</ul>
<h4>Управление:</h4>
<ul>
<li>Настройте браузер для блокировки cookies</li>
<li>Некоторые функции могут стать недоступны</li>
</ul>
<p>Подробнее: см. Политику конфиденциальности</p>`,
    likes: 118,
    helpful: true
  },
  {
    id: 10,
    category: "Studio",
    type: "TUTORIAL",
    title: "Как вывести заработок из Studio",
    content: `<p>Если вы продаёте промпты, вы можете выводить заработанные средства.</p>
<h3>Требования для вывода:</h3>
<h4>1. Верификация аккаунта:</h4>
<ul>
<li>Подтвердите email</li>
<li>Укажите реальные данные</li>
<li>Привяжите платёжный метод</li>
</ul>
<h4>2. Минимальная сумма:</h4>
<ul>
<li>Минимум для вывода: 500 рублей</li>
<li>Комиссия платформы: 10% с каждой продажи</li>
</ul>
<h4>3. Платёжные методы:</h4>
<ul>
<li>Банковская карта (МИР, Visa, MasterCard)</li>
<li>ЮMoney</li>
<li>WebMoney</li>
<li>Qiwi</li>
</ul>
<h3>Процесс вывода:</h3>
<h4>Шаг 1: Проверка баланса</h4>
<ol>
<li>Перейдите в Studio → Финансы</li>
<li>Проверьте доступный баланс</li>
<li>Убедитесь что сумма >= 500₽</li>
</ol>
<h4>Шаг 2: Создание заявки</h4>
<ol>
<li>Нажмите «Вывести средства»</li>
<li>Выберите платёжный метод</li>
<li>Введите реквизиты</li>
<li>Укажите сумму</li>
<li>Подтвердите заявку</li>
</ol>
<h4>Шаг 3: Обработка</h4>
<ul>
<li>Проверка заявки: до 24 часов</li>
<li>Перевод средств: 1-3 рабочих дня</li>
<li>Уведомление на email</li>
</ul>
<h4>Шаг 4: Получение</h4>
<ul>
<li>Средства поступят на указанный счёт</li>
<li>Проверьте историю транзакций</li>
<li>Сохраните чек</li>
</ul>
<h3>Важная информация:</h3>
<ul>
<li><strong>Налог:</strong> вы самостоятельно уплачиваете НДФЛ (13%)</li>
<li><strong>Статус:</strong> рекомендуется оформить самозанятость или ИП</li>
<li><strong>Лимиты:</strong> максимум 100 000₽ в месяц</li>
<li><strong>Комиссия:</strong> платёжных систем может взиматься дополнительно</li>
</ul>
<h3>Частые вопросы:</h3>
<h4>ВОПРОС: Почему заявка отклонена?</h4>
<p><strong>ОТВЕТ:</strong></p>
<ul>
<li>Недостаточная сумма</li>
<li>Неверные реквизиты</li>
<li>Подозрение на мошенничество</li>
<li>Нарушение правил платформы</li>
</ul>
<h4>ВОПРОС: Можно ли отменить вывод?</h4>
<p><strong>ОТВЕТ:</strong></p>
<ul>
<li>До обработки: да, в разделе «История»</li>
<li>После обработки: нет</li>
</ul>
<h4>ВОПРОС: Как долго идёт перевод?</h4>
<p><strong>ОТВЕТ:</strong></p>
<ul>
<li>На карты: 1-3 рабочих дня</li>
<li>На электронные кошельки: до 24 часов</li>
</ul>
<h4>ВОПРОС: Где взять справку о доходах?</h4>
<p><strong>ОТВЕТ:</strong></p>
<ul>
<li>Раздел «Финансы» → «Отчёты»</li>
<li>Скачайте справку за период</li>
</ul>`,
    likes: 89,
    helpful: true
  },
  {
    id: 11,
    category: "Studio",
    type: "ARTICLE",
    title: "Как работать с библиотекой промптов",
    content: `<p>Библиотека — это место хранения всех ваших промптов.</p>
<h3>Разделы библиотеки:</h3>
<h4>1. Мои промпты:</h4>
<ul>
<li>Созданные вами промпты</li>
<li>Черновики и опубликованные</li>
<li>Статистика просмотров и продаж</li>
</ul>
<h4>2. Купленные промпты:</h4>
<ul>
<li>Промпты, приобретённые у других авторов</li>
<li>Доступны для использования</li>
<li>История покупок</li>
</ul>
<h4>3. Избранное:</h4>
<ul>
<li>Сохранённые промпты</li>
<li>Быстрый доступ</li>
<li>Не требует покупки</li>
</ul>
<h4>4. История:</h4>
<ul>
<li>Все действия с промптами</li>
<li>Дата создания, редактирования, использования</li>
<li>Результаты генерации</li>
</ul>
<h3>Управление промптами:</h3>
<h4>Создание:</h4>
<ul>
<li>Studio → Создать промт</li>
<li>Заполните все поля</li>
<li>Сохраните как черновик или опубликуйте</li>
</ul>
<h4>Редактирование:</h4>
<ul>
<li>Библиотека → Мои промпты</li>
<li>Выберите промт → Редактировать</li>
<li>Внесите изменения</li>
<li>Сохраните</li>
</ul>
<h4>Удаление:</h4>
<ul>
<li>Библиотека → Мои промпты</li>
<li>Выберите промт → Удалить</li>
<li>Подтвердите</li>
<li>Удалённые промпты невозможно восстановить</li>
</ul>
<h3>Организация:</h3>
<h4>Категории:</h4>
<ul>
<li>Назначьте категорию промпту</li>
<li>Упрощает поиск и навигацию</li>
<li>Примеры: Маркетинг, Программирование, Дизайн</li>
</ul>
<h4>Теги:</h4>
<ul>
<li>Добавьте ключевые слова</li>
<li>Улучшает поиск</li>
<li>До 10 тегов на промт</li>
</ul>
<h4>Папки (для тарифа Business):</h4>
<ul>
<li>Создавайте папки для группировки</li>
<li>Перетаскивайте промпты</li>
<li>Удобно для больших коллекций</li>
</ul>
<h3>Поиск и фильтры:</h3>
<ul>
<li>Поиск по названию</li>
<li>Фильтр по категории</li>
<li>Сортировка по дате, рейтингу, цене</li>
<li>Фильтр по статусу (опубликовано/черновик)</li>
</ul>
<h3>Советы:</h3>
<ul>
<li>Регулярно обновляйте промпты</li>
<li>Следите за статистикой</li>
<li>Отвечайте на отзывы</li>
<li>Удаляйте неактуальные промпты</li>
</ul>`,
    likes: 76,
    helpful: true
  },
  {
    id: 12,
    category: "Studio",
    type: "FAQ",
    title: "Возврат средств за промпты",
    content: `<h3>ВОПРОС: Возможен ли возврат средств за промт?</h3>
<p><strong>ОТВЕТ:</strong></p>
<p>Возврат средств за приобретённые промпты <strong>не предусмотрен</strong>.</p>
<h4>Почему:</h4>
<ol>
<li>Промт-Студия — это платформа-посредник</li>
<li>Мы не являемся стороной сделки купли-продажи</li>
<li>Покупка осуществляется напрямую у автора промпта</li>
<li>Цифровой контент не подлежит возврату после использования</li>
</ol>
<h4>Что делать если промт не работает:</h4>
<ol>
<li>Проверьте соответствие описанию</li>
<li>Убедитесь в правильности использования</li>
<li>Свяжитесь с автором через форму обратной связи</li>
<li>Если промт откровенно мошеннический:
<ul>
<li>Подайте жалобу: support@prompt-studio.ru</li>
<li>Приложите доказательства</li>
<li>Укажите ссылку на промт</li>
</ul>
</li>
</ol>
<h4>Что происходит после жалобы:</h4>
<ul>
<li>Мы рассматриваем в течение 10 рабочих дней</li>
<li>При подтверждении мошенничества:
<ul>
<li>Автор блокируется</li>
<li>Промпт удаляется</li>
<li>Возврат средств возможен <strong>ТОЛЬКО</strong> по усмотрению платформы и при технической возможности (не гарантируется)</li>
</ul>
</li>
</ul>
<h4>Профилактика:</h4>
<ul>
<li>Внимательно читайте описание промпта</li>
<li>Проверяйте отзывы других покупателей</li>
<li>Убедитесь в совместимости с вашими AI-моделями</li>
<li>Начните с бесплатных промптов для тестирования</li>
</ul>
<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
<p className="text-sm text-yellow-800">
<strong>Важно:</strong> Покупая промт, вы принимаете на себя риски, связанные с использованием пользовательского контента.
</p>
</div>`,
    likes: 203,
    helpful: true
  }
];

const faqItems = [];

const mockTickets: Ticket[] = [
  { id: "T-001", subject: "Не работает автопостинг в VK", status: "in_progress", priority: "high", created: "19 фев 2026", lastReply: "20 фев 2026", messages: [
    { from: "user", text: "При попытке опубликовать пост в VK возникает ошибка 403.", time: "19 фев, 14:20" },
    { from: "support", text: "Здравствуйте! Проверьте, пожалуйста, что токен VK актуален в разделе Подключённые сервисы.", time: "20 фев, 09:15" },
  ]},
  { id: "T-002", subject: "Вопрос по лицензии промта", status: "resolved", priority: "low", created: "15 фев 2026", lastReply: "16 фев 2026", messages: [
    { from: "user", text: "Можно ли использовать купленный промт в коммерческих проектах?", time: "15 фев, 10:00" },
    { from: "support", text: "Да, стандартная лицензия включает коммерческое использование. Подробности в карточке промта.", time: "16 фев, 11:30" },
  ], rated: 5 },
];

const statusLabels: Record<string, string> = { open: "Открыт", in_progress: "В работе", resolved: "Решён", closed: "Закрыт" };
const statusColors: Record<string, string> = { open: "bg-warning/10 text-warning", in_progress: "bg-primary/10 text-primary", resolved: "bg-success/10 text-success", closed: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { low: "Низкий", medium: "Средний", high: "Высокий" };

const popularQueries = ["автопостинг", "вывод средств", "2FA", "возврат", "лицензия"];

// navigation tabs for support page; kept outside component to avoid
// redefinition or accidental state conflicts that could cause text flicker
export const supportSections = [
  { key: "search", label: "Поиск", icon: Search },
  { key: "kb", label: "База знаний", icon: BookOpen },
  { key: "tickets", label: "Тикеты", icon: HelpCircle },
  { key: "chat", label: "Чат", icon: MessageCircle },
  { key: "feedback", label: "Обратная связь", icon: Lightbulb },
];

export default function SupportPage() {
  const [activeSection, setActiveSection] = useState<"search" | "kb" | "tickets" | "chat" | "feedback">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", priority: "medium" as string, description: "" });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", from: "bot", text: "Здравствуйте! Я виртуальный помощник Промт-Студии. Чем могу помочь?", time: "сейчас" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"bot" | "operator">("bot");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "nps">("bug");
  const [feedbackText, setFeedbackText] = useState("");
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [helpfulArticles, setHelpfulArticles] = useState<Record<string, boolean>>({});


  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), from: "user", text: chatInput, time: "сейчас" };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: chatMode === "bot" ? "bot" : "operator",
        text: chatMode === "bot" ? "Спасибо за вопрос! Ищу информацию в базе знаний..." : "Оператор скоро ответит.",
        time: "сейчас"
      };
      setChatMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const createTicket = () => {
    const t: Ticket = {
      id: `T-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: newTicket.subject,
      status: "open",
      priority: newTicket.priority as any,
      created: "сегодня",
      lastReply: "сегодня",
      messages: [{ from: "user", text: newTicket.description, time: "сейчас" }],
    };
    setTickets(prev => [t, ...prev]);
    setShowCreateTicket(false);
    setNewTicket({ subject: "", priority: "medium", description: "" });
    setSelectedTicket(t);
  };

  const sendTicketReply = () => {
    if (!ticketReplyText.trim() || !selectedTicket) return;
    const updated = { ...selectedTicket, messages: [...selectedTicket.messages, { from: "user" as const, text: ticketReplyText, time: "сейчас" }] };
    setSelectedTicket(updated);
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setTicketReplyText("");
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  const filteredArticles = mockArticles.filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Поддержка</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success"></span>
          Среднее время ответа: ~15 мин
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto pb-px">
        {supportSections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key as any)} className={`pb-3 px-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeSection === s.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <s.icon className="h-4 w-4" /> {s.label}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      {activeSection === "search" && (
        <div className="animate-fade-in">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Опишите проблему или вопрос..." className="w-full pl-9 pr-3 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {popularQueries.map(q => (
              <button key={q} onClick={() => setSearchQuery(q)} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary">
                {q}
              </button>
            ))}
          </div>
          {searchQuery && (
            <div className="space-y-2">
              {filteredArticles.map(a => (
                <button key={a.id} onClick={() => setActiveSection("kb")} className="w-full text-left bg-card rounded-lg border border-border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    {a.type === "video" ? <Play className="h-4 w-4 text-primary" /> : <BookOpen className="h-4 w-4 text-primary" />}
                    <span className="text-sm font-medium">{a.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{a.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!searchQuery && (
            <div className="grid sm:grid-cols-2 gap-3">
              <button onClick={() => setActiveSection("kb")} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <BookOpen className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">База знаний</h3>
                <p className="text-xs text-muted-foreground mt-1">Статьи, FAQ, видео и туториалы</p>
              </button>
              <button onClick={() => setActiveSection("tickets")} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <HelpCircle className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Создать тикет</h3>
                <p className="text-xs text-muted-foreground mt-1">Обратиться в техподдержку</p>
              </button>
              <button onClick={() => setActiveSection("chat")} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <MessageCircle className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Живой чат</h3>
                <p className="text-xs text-muted-foreground mt-1">Бот или оператор онлайн</p>
              </button>
              <button onClick={() => setActiveSection("feedback")} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <Lightbulb className="h-6 w-6 text-warning mb-2" />
                <h3 className="font-semibold text-sm">Обратная связь</h3>
                <p className="text-xs text-muted-foreground mt-1">Баг-репорт, идеи, опросы</p>
              </button>
              <button onClick={() => window.location.href = "/support/about"} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <Info className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">О сервисе</h3>
                <p className="text-xs text-muted-foreground mt-1">Информация о компании и документация</p>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Knowledge Base ── */}
      {activeSection === "kb" && (
        <div className="animate-fade-in">
          <div className="space-y-3 mb-6">
            {filteredArticles.map(a => (
              <div key={a.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  {a.type === "video" && <Play className="h-4 w-4 text-primary" />}
                  {a.type === "article" && <BookOpen className="h-4 w-4 text-primary" />}
                  {a.type === "tutorial" && <BookOpen className="h-4 w-4 text-success" />}
                  {a.type === "faq" && <HelpCircle className="h-4 w-4 text-warning" />}
                  <span className="text-xs text-muted-foreground">{a.category}</span>
                  <span className="text-xs text-muted-foreground uppercase ml-auto">{a.type}</span>
                </div>
                <h3 className="font-semibold text-sm">{a.title}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setHelpfulArticles(prev => ({ ...prev, [a.id]: true }))} className={`h-7 w-7 rounded flex items-center justify-center ${helpfulArticles[a.id] === true ? "bg-success/10 text-success" : "hover:bg-muted text-muted-foreground"}`}><ThumbsUp className="h-3 w-3" /></button>
                    <button onClick={() => setHelpfulArticles(prev => ({ ...prev, [a.id]: false }))} className={`h-7 w-7 rounded flex items-center justify-center ${helpfulArticles[a.id] === false ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground"}`}><ThumbsDown className="h-3 w-3" /></button>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.helpful} нашли полезным</span>
                </div>
              </div>
            ))}
          </div>
          {/* FAQ Accordion */}
          <h3 className="font-semibold text-sm mb-3">Часто задаваемые вопросы</h3>
          <div className="space-y-2">
            {faqItems.map((f, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="text-sm font-medium">{f.q}</span>
                  {expandedFaq === i ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>
                {expandedFaq === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tickets ── */}
      {activeSection === "tickets" && (
        <div className="animate-fade-in">
          {selectedTicket ? (
            <div>
              <button onClick={() => setSelectedTicket(null)} className="text-sm text-primary hover:underline mb-3 flex items-center gap-1">← Назад к тикетам</button>
              <div className="bg-card rounded-xl border border-border p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{selectedTicket.id}: {selectedTicket.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[selectedTicket.status]}`}>{statusLabels[selectedTicket.status]}</span>
                </div>
                <p className="text-xs text-muted-foreground">Приоритет: {priorityLabels[selectedTicket.priority]} · Создан: {selectedTicket.created}</p>
              </div>
              <div className="space-y-3 mb-4">
                {selectedTicket.messages.map((m, i) => (
                  <div key={i} className={`p-3 rounded-xl text-sm ${m.from === "user" ? "bg-primary/5 border border-primary/20 ml-8" : "bg-card border border-border mr-8"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{m.from === "user" ? "Вы" : "Поддержка"}</span>
                      <span className="text-xs text-muted-foreground">{m.time}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== "closed" && (
                <div className="flex gap-2">
                  <input value={ticketReplyText} onChange={e => setTicketReplyText(e.target.value)} placeholder="Ваш ответ..." className={inputCls} />
                  <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted"><Paperclip className="h-4 w-4" /></button>
                  <button onClick={sendTicketReply} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
                </div>
              )}
              {selectedTicket.status === "closed" && !selectedTicket.rated && (
                <div className="bg-card rounded-xl border border-border p-4 mt-4">
                  <p className="text-sm font-medium mb-2">Оцените качество поддержки:</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><Star className={`h-4 w-4 ${s <= (npsScore || 0) ? "text-warning fill-current" : "text-muted-foreground"}`} /></button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Мои тикеты</h3>
                <button onClick={() => setShowCreateTicket(true)} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1"><Plus className="h-4 w-4" /> Создать тикет</button>
              </div>
              {showCreateTicket && (
                <div className="bg-card rounded-xl border border-border p-4 mb-4">
                  <h3 className="font-semibold text-sm mb-3">Новый тикет</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Тема</label>
                      <input value={newTicket.subject} onChange={e => setNewTicket(prev => ({ ...prev, subject: e.target.value }))} className={`${inputCls} mt-1`} placeholder="Кратко опишите проблему" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Приоритет</label>
                      <select value={newTicket.priority} onChange={e => setNewTicket(prev => ({ ...prev, priority: e.target.value }))} className={`${inputCls} mt-1`}>
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Описание</label>
                      <textarea value={newTicket.description} onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))} rows={3} className={`${inputCls} mt-1 resize-none`} placeholder="Подробное описание..." />
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-lg border border-border text-sm flex items-center gap-1"><Paperclip className="h-4 w-4" /> Прикрепить</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowCreateTicket(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Отмена</button>
                      <button onClick={createTicket} disabled={!newTicket.subject || !newTicket.description} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-40">Отправить</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {tickets.map(t => (
                  <button key={t.id} onClick={() => setSelectedTicket(t)} className="w-full text-left bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{t.id}: {t.subject}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Приоритет: {priorityLabels[t.priority]}</span>
                      <span>Создан: {t.created}</span>
                      <span>Последний ответ: {t.lastReply}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Live Chat ── */}
      {activeSection === "chat" && (
        <div className="animate-fade-in">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-semibold text-sm">Чат поддержки</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setChatMode("bot")} className={`px-3 py-1 rounded-lg text-xs font-medium ${chatMode === "bot" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Бот</button>
                <button onClick={() => setChatMode("operator")} className={`px-3 py-1 rounded-lg text-xs font-medium ${chatMode === "operator" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Оператор</button>
              </div>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.from !== "user" && <p className="text-[10px] font-medium mb-0.5 opacity-70">{m.from === "bot" ? "🤖 Бот" : "👤 Оператор"}</p>}
                    <p>{m.text}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-3 border-t border-border">
              <button className="px-2 py-2 rounded-lg border border-border hover:bg-muted"><Paperclip className="h-4 w-4 text-muted-foreground" /></button>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Введите сообщение..." className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={sendChat} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Если оператор оффлайн, вопрос автоматически станет тикетом.</p>
        </div>
      )}

      {/* ── Feedback ── */}
      {activeSection === "feedback" && (
        <div className="animate-fade-in">
          <div className="flex gap-2 mb-4">
            {([{ key: "bug", label: "Баг-репорт", icon: Bug }, { key: "feature", label: "Идея / запрос", icon: Lightbulb }, { key: "nps", label: "Оценка (NPS)", icon: Star }] as const).map(f => (
              <button key={f.key} onClick={() => setFeedbackType(f.key)} className={`flex-1 py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5 ${feedbackType === f.key ? "border-primary bg-primary/5" : "border-border"}`}>
                <f.icon className="h-4 w-4" /> {f.label}
              </button>
            ))}
          </div>

          {feedbackType === "bug" && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-semibold text-sm">Сообщить об ошибке</h3>
              <p className="text-xs text-muted-foreground">Системные данные (браузер, версия, ОС) будут собраны автоматически</p>
              <div>
                <label className="text-xs text-muted-foreground">Шаги для воспроизведения</label>
                <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={3} className={`${inputCls} mt-1 resize-none`} placeholder="1. Открыл страницу...&#10;2. Нажал кнопку...&#10;3. Увидел ошибку..." />
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg border border-border text-sm flex items-center gap-1"><Upload className="h-4 w-4" /> Скриншот</button>
                <button className="px-3 py-2 rounded-lg border border-border text-sm flex items-center gap-1"><Camera className="h-4 w-4" /> Запись экрана</button>
              </div>
              <button className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Отправить</button>
            </div>
          )}

          {feedbackType === "feature" && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-semibold text-sm">Предложить функцию</h3>
              <div>
                <label className="text-xs text-muted-foreground">Описание идеи</label>
                <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={3} className={`${inputCls} mt-1 resize-none`} placeholder="Было бы здорово если..." />
              </div>
              <p className="text-xs text-muted-foreground">💡 Другие пользователи смогут голосовать за вашу идею</p>
              <button className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Предложить</button>
            </div>
          )}

          {feedbackType === "nps" && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-sm mb-3">Насколько вы рекомендуете Промт-Студию?</h3>
              <div className="flex gap-1 mb-4 justify-center">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setNpsScore(n)} className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${npsScore === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-4">
                <span>Точно нет</span>
                <span>Обязательно!</span>
              </div>
              {npsScore && (
                <div>
                  <textarea placeholder="Что можно улучшить?" rows={2} className={`${inputCls} resize-none mb-3`} />
                  <button className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Отправить оценку</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
