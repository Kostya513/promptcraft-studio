import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const requisitesText = `ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА»
Сокращённое наименование: ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА»
Юридический адрес организации: 307041, РОССИЯ, КУРСКАЯ ОБЛАСТЬ, М.Р-Н МЕДВЕНСКИЙ, С.П. ГОСТОМЛЯНСКИЙ СЕЛЬСОВЕТ, С 1-Я ГОСТОМЛЯ, Д. 156
ИНН: 4600004389
КПП: 460001001
ОГРН/ОГРНИП: 1254600001028
Расчётный счёт: 40702810210001873721
Банк: АО «ТБанк»
ИНН банка: 7710140679
БИК банка: 044525974
Корреспондентский счёт банка: 30101810145250000974
Юридический адрес банка: 127287, г. Москва, ул. Хуторская 2-я, д. 38А, стр. 26`;

export default function PrivacyPolicy() {
  const [showTop, setShowTop] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const copyRequisites = async () => {
    try {
      await navigator.clipboard.writeText(requisitesText);
      toast({ title: "Реквизиты скопированы" });
    } catch (e) {
      console.error(e);
    }
  };
  const printPage = () => window.print();
  const downloadPdf = () => window.print();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/support" className="hover:underline">Поддержка</Link> &gt; <Link to="/support/about" className="hover:underline">О сервисе</Link> &gt; Политика конфиденциальности
      </nav>
      <Link to="/support/about" className="text-primary hover:underline mb-4 inline-block">← Вернуться назад</Link>

      <h1 className="text-4xl font-bold mb-2">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</h1>
      <p className="text-sm text-muted-foreground mb-6">Дата последнего обновления: 11 марта 2026 года | Версия: 1.0</p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={downloadPdf} className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:opacity-90">📄 Скачать PDF</button>
        <button onClick={printPage} className="px-4 py-2 bg-secondary text-white rounded-md text-sm font-medium hover:opacity-90">🖨️ Распечатать</button>
        <button onClick={copyRequisites} className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:opacity-90">📋 Копировать реквизиты</button>
      </div>

      {/* 1. ОБЩИЕ ПОЛОЖЕНИЯ */}
      <section id="general" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">1. ОБЩИЕ ПОЛОЖЕНИЯ</h2>
        <p className="mb-3">Настоящая Политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты персональных данных пользователей сервиса «Промт-Студия» (далее — Сервис), принадлежащего ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА» (далее — Оператор).</p>
        <p className="mb-3">Обработка персональных данных осуществляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».</p>
        <p>Используя Сервис, вы выражаете согласие с условиями настоящей Политики. Если вы не согласны с условиями Политики, пожалуйста, прекратите использование Сервиса.</p>
        <hr className="my-6" />
      </section>

      {/* 2. СОСТАВ ПЕРСОНАЛЬНЫХ ДАННЫХ */}
      <section id="composition" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. СОСТАВ ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
        
        <h3 className="text-lg font-semibold mb-3">2.1. Данные, предоставляемые пользователем</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Фамилия, имя, отчество (при указании)</li>
          <li>Адрес электронной почты (email)</li>
          <li>Номер телефона (при указании)</li>
          <li>Пароль для доступа к аккаунту</li>
          <li>Аватар профиля (при загрузке)</li>
          <li>Информация о профиле и специализации</li>
          <li>Платёжные данные (информация о способах оплаты)</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">2.2. Данные, собираемые автоматически</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>IP-адрес устройства</li>
          <li>Информация о браузере (тип, версия, язык)</li>
          <li>Информация об операционной системе</li>
          <li>Данные об устройстве (тип, разрешение экрана)</li>
          <li>Файлы cookies и аналогичные технологии</li>
          <li>Данные о действиях пользователя в Сервисе</li>
          <li>Дата и время доступа к Сервису</li>
          <li>Страницы, посещённые пользователем</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">2.3. Платёжные данные</h3>
        <p>Информация о банковских картах обрабатывается платёжными провайдерами (ЮKassa, Robokassa, Сбербанк, ТБанк) и не хранится на серверах Сервиса. Сервис получает только информацию о факте оплаты и транзакции.</p>
        <hr className="my-6" />
      </section>

      {/* 3. ЦЕЛИ ОБРАБОТКИ */}
      <section id="purposes" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. ЦЕЛИ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
        
        <h3 className="text-lg font-semibold mb-3">3.1. Идентификация и аутентификация</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Регистрация пользователя в Сервисе</li>
          <li>Предоставление доступа к персонализированным функциям</li>
          <li>Предоставление доступа к промптам и инструментам</li>
          <li>Предоставление доступа к Менеджеру аккаунтов</li>
          <li>Подтверждение личности пользователя</li>
          <li>Восстановление доступа к аккаунту</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">3.2. Предоставление услуг</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Обеспечение функционирования всех функций Сервиса</li>
          <li>Обработка покупок и подписок</li>
          <li>Предоставление доступа к промптам и инструментам</li>
          <li>Синхронизация данных между устройствами</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">3.3. Техническая поддержка</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Обработка обращений в службу поддержки</li>
          <li>Решение технических проблем</li>
          <li>Ответы на вопросы пользователей</li>
          <li>Устранение неполадок в работе Сервиса</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">3.4. Уведомления</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Отправка важной информации об аккаунте</li>
          <li>Уведомления об изменениях в Сервисе</li>
          <li>Информирование об обновлениях и новых функциях</li>
          <li>Напоминания о подписках и платежах</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">3.5. Маркетинг (только с согласия)</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Отправка рекламных материалов</li>
          <li>Информирование о специальных предложениях</li>
          <li>Проведение опросов и исследований</li>
          <li>Персонализация контента</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">3.6. Аналитика и улучшение</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Анализ поведения пользователей</li>
          <li>Улучшение качества Сервиса</li>
          <li>Оптимизация работы платформы</li>
          <li>Исследование пользовательского опыта</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">3.7. Безопасность</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Предотвращение мошенничества</li>
          <li>Защита от несанкционированного доступа</li>
          <li>Обеспечение безопасности данных</li>
          <li>Мониторинг подозрительной активности</li>
        </ul>
        <hr className="my-6" />
      </section>

      {/* 4. ХРАНЕНИЕ И ЗАЩИТА */}
      <section id="storage" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4. ХРАНЕНИЕ И ЗАЩИТА ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
        
        <h3 className="text-lg font-semibold mb-3">4.1. Место хранения</h3>
        <p className="mb-4">Персональные данные пользователей хранятся на серверах, расположенных на территории Российской Федерации, что соответствует требованиям Федерального закона № 152-ФЗ.</p>

        <h3 className="text-lg font-semibold mb-3">4.2. Срок хранения</h3>
        <p className="mb-4">Персональные данные хранятся в течение срока действия аккаунта пользователя, а также в течение 3 (трёх) лет после удаления аккаунта в соответствии с требованиями законодательства Российской Федерации.</p>

        <h3 className="text-lg font-semibold mb-3">4.3. Меры защиты</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Шифрование данных при передаче (SSL/TLS)</li>
          <li>Шифрование чувствительных данных при хранении (AES-256)</li>
          <li>Ограничение доступа к персональным данным</li>
          <li>Регулярное резервное копирование</li>
          <li>Мониторинг безопасности и обнаружения вторжений</li>
          <li>Регулярное обновление систем безопасности</li>
          <li>Аудит доступа к данным</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">4.4. Доступ третьих лиц</h3>
        <p className="mb-2">Персональные данные не передаются третьим лицам за исключением случаев:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>С явного согласия пользователя</li>
          <li>По требованию законодательства (суд, правоохранительные органы)</li>
          <li>Платёжным провайдерам для обработки транзакций</li>
          <li>Хостинг-провайдерам для обеспечения работы Сервиса</li>
        </ul>
        <hr className="my-6" />
      </section>

      {/* 5. ПРАВА ПОЛЬЗОВАТЕЛЯ */}
      <section id="rights" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">5. ПРАВА ПОЛЬЗОВАТЕЛЯ</h2>
        
        <h3 className="text-lg font-semibold mb-3">5.1. Право на доступ</h3>
        <p className="mb-2">Пользователь имеет право получить информацию об обработке своих персональных данных, включая:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Категории обрабатываемых данных</li>
          <li>Цели обработки</li>
          <li>Способы и сроки обработки</li>
          <li>Иных получателей данных</li>
        </ul>
        <p className="mb-4">Для получения информации пользователь может обратиться в службу поддержки.</p>

        <h3 className="text-lg font-semibold mb-3">5.2. Право на исправление</h3>
        <p className="mb-2">Пользователь может исправить неточные или неполные персональные данные:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Самостоятельно в настройках профиля</li>
          <li>Через обращение в службу поддержки</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">5.3. Право на удаление</h3>
        <p className="mb-2">Пользователь имеет право потребовать удаления своих персональных данных:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Через функцию удаления аккаунта в настройках</li>
          <li>Через обращение в службу поддержки</li>
        </ul>
        <p className="mb-4">Удаление происходит в течение 30 дней с момента запроса.</p>

        <h3 className="text-lg font-semibold mb-3">5.4. Право на отзыв согласия</h3>
        <p className="mb-2">Пользователь может отозвать согласие на обработку персональных данных:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Через настройки конфиденциальности</li>
          <li>Через обращение в службу поддержки</li>
        </ul>
        <p className="mb-4">Отзыв согласия может повлечь невозможность предоставления отдельных функций Сервиса.</p>

        <h3 className="text-lg font-semibold mb-3">5.5. Право на перенос данных</h3>
        <p className="mb-4">Пользователь имеет право получить копию своих персональных данных в структурированном, машиночитаемом формате для передачи другому оператору.</p>

        <h3 className="text-lg font-semibold mb-3">5.6. Право на обжалование</h3>
        <p>Пользователь имеет право обжаловать действия или бездействие Оператора в уполномоченный орган по защите прав субъектов персональных данных (Роскомнадзор).</p>
        <hr className="my-6" />
      </section>

      {/* 6. COOKIES */}
      <section id="cookies" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">6. COOKIES И АНАЛОГИЧНЫЕ ТЕХНОЛОГИИ</h2>
        
        <h3 className="text-lg font-semibold mb-3">6.1. Что такое cookies</h3>
        <p className="mb-4">Cookies — это небольшие текстовые файлы, которые сохраняются в браузере пользователя при посещении Сервиса.</p>

        <h3 className="text-lg font-semibold mb-3">6.2. Типы используемых cookies</h3>
        
        <p className="font-semibold mb-2">Необходимые cookies:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Обеспечивают базовую функциональность Сервиса</li>
          <li>Не могут быть отключены</li>
          <li>Не содержат персональных данных</li>
        </ul>

        <p className="font-semibold mb-2">Функциональные cookies:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Запоминают настройки пользователя</li>
          <li>Обеспечивают персонализацию</li>
          <li>Улучшают пользовательский опыт</li>
        </ul>

        <p className="font-semibold mb-2">Аналитические cookies:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Помогают понять как пользователи взаимодействуют с Сервисом</li>
          <li>Собирают анонимную статистику</li>
          <li>Используются для улучшения Сервиса</li>
        </ul>

        <p className="font-semibold mb-2">Маркетинговые cookies:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Используются для показа релевантной рекламы</li>
          <li>Отслеживают эффективность рекламных кампаний</li>
          <li>Требуют согласия пользователя</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">6.3. Управление cookies</h3>
        <p className="mb-2">Пользователь может управлять настройками cookies через:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Настройки браузера</li>
          <li>Настройки конфиденциальности в Сервисе</li>
        </ul>
        <p>Отключение некоторых cookies может повлиять на функциональность Сервиса.</p>
        <hr className="my-6" />
      </section>

      {/* 7. МЕНЕДЖЕР АККАУНТОВ */}
      <section id="manager" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">7. ОБРАБОТКА ДАННЫХ МЕНЕДЖЕРА АККАУНТОВ</h2>
        
        <h3 className="text-lg font-semibold mb-3">7.1. Особый статус данных</h3>
        <p className="mb-2">Менеджер аккаунтов хранит особо чувствительные данные:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Логины и пароли от внешних сервисов</li>
          <li>Платёжные данные подписок</li>
          <li>Персональные профили</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">7.2. Уровень защиты</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Все данные шифруются алгоритмом AES-256 перед сохранением</li>
          <li>Ключи шифрования хранятся отдельно от данных</li>
          <li>Доступ возможен только с устройства пользователя</li>
          <li>Данные не передаются третьим лицам</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">7.3. Ответственность пользователя</h3>
        <p className="mb-2">Пользователь несёт ответственность за:</p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Сохранение мастер-пароля от Промт-Студии</li>
          <li>Безопасность устройства доступа</li>
          <li>Своевременное обновление паролей</li>
        </ul>
        <hr className="my-6" />
      </section>

      {/* 8. ИЗМЕНЕНИЯ */}
      <section id="changes" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">8. ИЗМЕНЕНИЯ В ПОЛИТИКЕ КОНФИДЕНЦИАЛЬНОСТИ</h2>
        
        <h3 className="text-lg font-semibold mb-3">8.1. Право на изменения</h3>
        <p className="mb-4">Оператор оставляет за собой право вносить изменения в настоящую Политику в одностороннем порядке.</p>

        <h3 className="text-lg font-semibold mb-3">8.2. Уведомление об изменениях</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Изменения публикуются на странице Политики</li>
          <li>Пользователи уведомляются через email</li>
          <li>В Сервисе появляется уведомление об изменениях</li>
          <li>Указывается дата последнего обновления</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">8.3. Вступление в силу</h3>
        <p className="mb-4">Изменения вступают в силу через 7 (семь) календарных дней после публикации.</p>

        <h3 className="text-lg font-semibold mb-3">8.4. Согласие с изменениями</h3>
        <p>Продолжение использования Сервиса после вступления изменений в силу означает согласие с новыми условиями.</p>
        <hr className="my-6" />
      </section>

      {/* 9. КОНТАКТЫ И РЕКВИЗИТЫ */}
      <section id="contacts" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">9. КОНТАКТНАЯ ИНФОРМАЦИЯ И РЕКВИЗИТЫ ОПЕРАТОРА</h2>
        
        <h3 className="text-lg font-semibold mb-3">9.1. Для вопросов по обработке персональных данных</h3>
        <p className="mb-4">Email: <strong>privacy@prompt-studio.ru</strong></p>

        <h3 className="text-lg font-semibold mb-3">9.2. Для обращения в службу поддержки</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Через форму обратной связи в Сервисе</li>
          <li>Email: <strong>support@prompt-studio.ru</strong></li>
          <li>Часы работы: Пн-Пт с 9:00 до 18:00 (МСК)</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">9.3. Реквизиты Оператора</h3>
        <div className="bg-muted border border-border rounded-lg p-5 space-y-3 text-sm">
          <div>
            <p className="font-semibold">Название организации:</p>
            <p className="mt-1">ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА»</p>
          </div>
          <div>
            <p className="font-semibold">Сокращённое наименование:</p>
            <p className="mt-1">ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА»</p>
          </div>
          <div>
            <p className="font-semibold">Юридический адрес организации:</p>
            <p className="mt-1">307041, РОССИЯ, КУРСКАЯ ОБЛАСТЬ, М.Р-Н МЕДВЕНСКИЙ, С.П. ГОСТОМЛЯНСКИЙ СЕЛЬСОВЕТ, С 1-Я ГОСТОМЛЯ, Д. 156</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="font-semibold">ИНН:</p><p>4600004389</p></div>
            <div><p className="font-semibold">КПП:</p><p>460001001</p></div>
            <div><p className="font-semibold">ОГРН/ОГРНИП:</p><p>1254600001028</p></div>
            <div><p className="font-semibold">Расчётный счёт:</p><p>40702810210001873721</p></div>
          </div>
          <div>
            <p className="font-semibold">Банк:</p>
            <p className="mt-1">АО «ТБанк»</p>
            <p className="mt-2"><strong>ИНН банка:</strong> 7710140679</p>
            <p><strong>БИК банка:</strong> 044525974</p>
            <p><strong>Корреспондентский счёт банка:</strong> 30101810145250000974</p>
            <p className="mt-2"><strong>Юридический адрес банка:</strong></p>
            <p>127287, г. Москва, ул. Хуторская 2-я, д. 38А, стр. 26</p>
          </div>
        </div>
        <hr className="my-6" />
      </section>

      {/* 10. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ */}
      <section id="final" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">10. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</h2>
        
        <h3 className="text-lg font-semibold mb-3">10.1. Применимое право</h3>
        <p className="mb-4">Настоящая Политика регулируется законодательством Российской Федерации.</p>

        <h3 className="text-lg font-semibold mb-3">10.2. Язык Политики</h3>
        <p className="mb-4">Политика составлена на русском языке. В случае наличия перевода на другие языки, приоритет имеет русскоязычная версия.</p>

        <h3 className="text-lg font-semibold mb-3">10.3. Неправомерный доступ</h3>
        <p className="mb-4">Пользователь обязуется не предпринимать попыток несанкционированного доступа к данным других пользователей и системам Сервиса.</p>

        <h3 className="text-lg font-semibold mb-3">10.4. Межведомственное взаимодействие</h3>
        <p className="mb-4">Оператор взаимодействует с уполномоченными органами по защите прав субъектов персональных данных в установленном порядке.</p>

        <div className="bg-card border border-border rounded-lg p-5 text-center text-sm mt-6">
          <p className="font-semibold">© 2026 ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА». Все права защищены.</p>
          <p className="mt-2 text-muted-foreground">Сервис «Промт-Студия» — продукт компании ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА».</p>
        </div>
      </section>

      <div className="mt-12 pt-6 border-t border-border">
        <Link to="/support/about" className="text-primary hover:underline">← Вернуться назад</Link>
      </div>

      {showTop && (
        <button onClick={scrollToTop} aria-label="Наверх" className="fixed bottom-6 right-6 p-3 bg-primary text-white rounded-full shadow-lg hover:opacity-90 transition-opacity z-40">
          ↑
        </button>
      )}
    </div>
  );
}
