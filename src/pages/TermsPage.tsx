import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadPDF = () => {
    alert('Функция скачивания PDF будет реализована в ближайшее время');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 smooth-scroll">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link
            to="/support/about"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm md:text-base">Назад</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={downloadPDF}
              className="px-3 md:px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-3 md:px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Печать
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Title */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-4">
            Условия использования
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Сервиса «Промт-Студия»
          </p>
          <p className="text-slate-500 text-sm md:text-base mt-4">
            <strong>Дата вступления в силу:</strong> 11 марта 2026 года.<br />
            <strong>Версия:</strong> 1.0
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg p-6 md:p-8 mb-8 border border-slate-200 shadow-sm">
          <p className="text-slate-700 leading-relaxed mb-4">
            Настоящие Условия использования (далее — «Условия») регулируют порядок доступа и использования сервиса «Промт-Студия» (далее — «Сервис»), принадлежащего ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА». Сервис представляет собой платформу для создания, управления, покупки и продажи промптов для систем искусственного интеллекта, а также предоставляет инструменты для безопасного хранения учётных данных (Менеджер аккаунтов).
          </p>
          <p className="text-slate-700 leading-relaxed">
            Начиная использование Сервиса, Пользователь подтверждает, что ознакомлен с настоящими Условиями, Политикой конфиденциальности и Публичной офертой, и принимает их без каких-либо исключений. Если Пользователь не согласен с настоящими Условиями, он обязан немедленно прекратить использование Сервиса.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-lg p-6 md:p-8 mb-12 border border-blue-200">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Содержание</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[
              { num: 1, title: 'Общие положения' },
              { num: 2, title: 'Регистрация и аккаунт' },
              { num: 3, title: 'Правила использования сервиса' },
              { num: 4, title: 'Промпты и пользовательский контент' },
              { num: 5, title: 'Менеджер аккаунтов' },
              { num: 6, title: 'Оплата и тарифы' },
              { num: 7, title: 'Интеллектуальная собственность' },
              { num: 8, title: 'Ответственность и отказ от гарантий' },
              { num: 9, title: 'Модерация и контроль' },
              { num: 10, title: 'Изменения условий' },
              { num: 11, title: 'Приостановление и прекращение работы сервиса' },
              { num: 12, title: 'Применимое право и разрешение споров' },
              { num: 13, title: 'Особые условия для AI-контента' },
              { num: 14, title: 'Заключительные положения' },
              { num: 15, title: 'Контактная информация' },
            ].map((item) => (
              <a
                key={item.num}
                href={`#section-${item.num}`}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                <span className="font-semibold">{item.num}.</span> {item.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section id="section-1" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">1. Общие положения</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>1.1.</strong> Настоящие Условия использования (далее — «Условия») регулируют порядок доступа и использования сервиса «Промт-Студия» (далее — «Сервис»), принадлежащего ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА».</p>
                <p><strong>1.2.</strong> Сервис представляет собой платформу для создания, управления, покупки и продажи промптов для систем искусственного интеллекта, а также предоставляет инструменты для безопасного хранения учётных данных (Менеджер аккаунтов).</p>
                <p><strong>1.3.</strong> Начиная использование Сервиса, Пользователь подтверждает, что ознакомлен с настоящими Условиями, Политикой конфиденциальности и Публичной офертой, и принимает их без каких-либо исключений.</p>
                <p><strong>1.4.</strong> Если Пользователь не согласен с настоящими Условиями, он обязан немедленно прекратить использование Сервиса.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">2. Регистрация и аккаунт</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>2.1.</strong> Для доступа к полному функционалу Сервиса Пользователь обязан пройти регистрацию, предоставив достоверную и актуальную информацию.</p>
                <p><strong>2.2.</strong> Минимальный возраст для регистрации — 18 лет. Лица от 14 до 18 лет могут использовать Сервис только с согласия законных представителей.</p>
                <p><strong>2.3.</strong> Пользователь обязуется:</p>
                <ul className="ml-6 space-y-2">
                  <li>• предоставлять точную и полную информацию при регистрации;</li>
                  <li>• своевременно обновлять информацию при её изменении;</li>
                  <li>• хранить логин и пароль в тайне;</li>
                  <li>• немедленно уведомлять поддержку о любом несанкционированном доступе к аккаунту.</li>
                </ul>
                <p><strong>2.4.</strong> Запрещено:</p>
                <ul className="ml-6 space-y-2">
                  <li>• создавать более одного аккаунта без письменного разрешения Исполнителя;</li>
                  <li>• передавать свой аккаунт третьим лицам;</li>
                  <li>• использовать чужие аккаунты;</li>
                  <li>• обходить ограничения, наложенные на аккаунт.</li>
                </ul>
                <p><strong>2.5.</strong> Исполнитель вправе заблокировать или удалить аккаунт без предварительного уведомления при нарушении настоящих Условий.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">3. Правила использования сервиса</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>3.1.</strong> Пользователь вправе использовать Сервис только в законных целях, не противоречащих законодательству Российской Федерации.</p>
                <p><strong>3.2.</strong> Пользователь обязуется не использовать Сервис для запрещённого контента и запрещённых действий.</p>
                <p><strong>3.3.</strong> Запрещённый контент:</p>
                <ul className="ml-6 space-y-2">
                  <li>• создание, хранение или распространение материалов экстремистского характера;</li>
                  <li>• распространение информации, нарушающей права несовершеннолетних;</li>
                  <li>• создание порнографических материалов с участием несовершеннолетних;</li>
                  <li>• распространение призывов к суициду или причинению вреда здоровью;</li>
                  <li>• пропаганда наркотических средств и психотропных веществ;</li>
                  <li>• разжигания розни по национальному, религиозному или иному признаку.</li>
                </ul>
                <p><strong>3.4.</strong> Запрещённые действия:</p>
                <ul className="ml-6 space-y-2">
                  <li>• взлом, обход защиты или несанкционированный доступ к системам Сервиса;</li>
                  <li>• распространение вирусов, вредоносного кода или любых программ, нарушающих работу Сервиса;</li>
                  <li>• спам-рассылок и массовых автоматизированных запросов без разрешения;</li>
                  <li>• копирования, реверс-инжиниринга или модификации программного кода Сервиса;</li>
                  <li>• использования Сервиса для обхода ограничений других платформ и сервисов;</li>
                  <li>• автоматизированного сбора данных (скрейпинг) без письменного разрешения;</li>
                  <li>• вмешательства в работу серверов и сетевой инфраструктуры.</li>
                </ul>
                <p><strong>3.5.</strong> Пользователь несёт полную ответственность за весь контент, созданный, размещённый или распространяемый через его аккаунт.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">4. Промпты и пользовательский контент</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>4.1.</strong> Пользователь сохраняет авторские права на промпты, созданные им самостоятельно.</p>
                <p><strong>4.2.</strong> Размещая промпт в публичной библиотеке Сервиса, Пользователь предоставляет Исполнителю неисключительную, безвозмездную, бессрочную лицензию на:</p>
                <ul className="ml-6 space-y-2">
                  <li>• хранение промпта на серверах Сервиса;</li>
                  <li>• отображение промпта другим Пользователям;</li>
                  <li>• распространение промпта в рамках функционала Сервиса;</li>
                  <li>• модерацию и редактирование описания промпта.</li>
                </ul>
                <p><strong>4.3.</strong> При продаже промпта другому Пользователю:</p>
                <ul className="ml-6 space-y-2">
                  <li>• покупатель получает право личного использования промпта;</li>
                  <li>• исключительные авторские права остаются у автора;</li>
                  <li>• перепродажа промпта третьим лицам запрещена без согласия автора;</li>
                  <li>• коммерческое использование разрешено только если это указано в условиях промпта.</li>
                </ul>
                <p><strong>4.4.</strong> Пользователь гарантирует, что размещаемые им промпты:</p>
                <ul className="ml-6 space-y-2">
                  <li>• созданы им самостоятельно или на законных основаниях;</li>
                  <li>• не нарушают авторские и смежные права третьих лиц;</li>
                  <li>• не содержат вредоносный код, инструкции по обходу защиты;</li>
                  <li>• не нарушают законодательство Российской Федерации.</li>
                </ul>
                <p><strong>4.5.</strong> Исполнитель вправе удалять любые промпты без предварительного уведомления, если они нарушают настоящие Условия или законодательство.</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">5. Менеджер аккаунтов</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>5.1.</strong> Менеджер аккаунтов — это инструмент для безопасного хранения логинов, паролей и других учётных данных от внешних сервисов.</p>
                <p><strong>5.2.</strong> Пользователь понимает и принимает, что:</p>
                <ul className="ml-6 space-y-2">
                  <li>• все данные шифруются алгоритмом AES-256 перед сохранением;</li>
                  <li>• ключи шифрования хранятся отдельно от зашифрованных данных;</li>
                  <li>• доступ к данным возможен только с устройства Пользователя после ввода мастер-пароля;</li>
                  <li>• Исполнитель не имеет технической возможности просматривать сохранённые данные.</li>
                </ul>
                <p><strong>5.3.</strong> Пользователь несёт полную ответственность за:</p>
                <ul className="ml-6 space-y-2">
                  <li>• сохранение мастер-пароля от Промт-Студия;</li>
                  <li>• безопасность устройства, с которого осуществляется доступ;</li>
                  <li>• своевременное обновление паролей от сохранённых аккаунтов.</li>
                </ul>
                <p><strong>5.4.</strong> Исполнитель не несёт ответственности за:</p>
                <ul className="ml-6 space-y-2">
                  <li>• утрату данных вследствие потери мастер-пароля Пользователем;</li>
                  <li>• несанкционированный доступ вследствие компрометации устройства Пользователя;</li>
                  <li>• работу внешних сервисов, учётные данные от которых хранятся в Менеджере аккаунтов.</li>
                </ul>
                <p><strong>5.5.</strong> При удалении аккаунта в Промт-Студия все данные Менеджера аккаунтов удаляются безвозвратно.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">6. Оплата и тарифы</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>6.1.</strong> Сервис предоставляет бесплатный тариф (Free) и платные тарифы (PRO, Business).</p>
                <p><strong>6.2.</strong> Оплата подписки осуществляется авансовым способом за полный расчётный период (месяц).</p>
                <p><strong>6.3.</strong> Доступ к функциям тарифа предоставляется немедленно после подтверждения оплаты.</p>
                <p><strong>6.4.</strong> Средства, уплаченные за текущий период подписки, не подлежат возврату.</p>
                <p><strong>6.5.</strong> Пользователь вправе отказаться от автоматического продления подписки в любой момент через настройки аккаунта.</p>
                <p><strong>6.6.</strong> Отключение автопродления вступает в силу после окончания текущего оплаченного периода.</p>
                <p><strong>6.7.</strong> При покупке промптов у других Пользователей:</p>
                <ul className="ml-6 space-y-2">
                  <li>• оплата осуществляется через платёжную систему Сервиса;</li>
                  <li>• Исполнитель выступает оператором площадки, а не стороной сделки;</li>
                  <li>• средства не подлежат возврату, за исключением случаев мошенничества;</li>
                  <li>• комиссия Сервиса удерживается автоматически при проведении сделки.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">7. Интеллектуальная собственность</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>7.1.</strong> Все права на программное обеспечение, дизайн, интерфейс, логотипы, базу данных и иные объекты интеллектуальной собственности Сервиса принадлежат Исполнителю или его правообладателям.</p>
                <p><strong>7.2.</strong> Запрещается без письменного разрешения Исполнителя:</p>
                <ul className="ml-6 space-y-2">
                  <li>• копирование или воспроизведение элементов Сервиса;</li>
                  <li>• создание производных продуктов на основе Сервиса;</li>
                  <li>• использование товарных знаков и логотипов Сервиса;</li>
                  <li>• публикация скриншотов или материалов Сервиса в коммерческих целях.</li>
                </ul>
                <p><strong>7.3.</strong> Пользователь может использовать скриншоты и материалы Сервиса в личных некоммерческих целях (обзоры, инструкции, обучение) с обязательным указанием источника.</p>
                <p><strong>7.4.</strong> При нарушении прав интеллектуальной собственности Исполнитель вправе требовать возмещения убытков в полном объёме.</p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">8. Ответственность и отказ от гарантий</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>8.1.</strong> Сервис предоставляется «как есть» (as is). Исполнитель не гарантирует, что:</p>
                <ul className="ml-6 space-y-2">
                  <li>• сервис будет работать без перебоев и ошибок;</li>
                  <li>• результаты использования промптов будут соответствовать ожиданиям;</li>
                  <li>• сервис будет совместим со всеми устройствами и браузерами;</li>
                  <li>• ошибки будут исправлены в кратчайшие сроки.</li>
                </ul>
                <p><strong>8.2.</strong> Исполнитель не несёт ответственности за:</p>
                <ul className="ml-6 space-y-2">
                  <li>• результаты, полученные Пользователем при использовании промптов;</li>
                  <li>• работу сторонних сервисов и платформ (AI-модели, сайты, приложения);</li>
                  <li>• убытки, возникшие вследствие использования или невозможности использования Сервиса;</li>
                  <li>• косвенные убытки и упущенную выгоду;</li>
                  <li>• действия третьих лиц, включая других Пользователей Сервиса.</li>
                </ul>
                <p><strong>8.3.</strong> Максимальная ответственность Исполнителя ограничена суммой, уплаченной Пользователем за услуги в течение 3 (трёх) месяцев, предшествующих возникновению претензии.</p>
                <p><strong>8.4.</strong> Пользователь самостоятельно оценивает риски использования Сервиса и принимает на себя всю ответственность за результаты.</p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">9. Модерация и контроль</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>9.1.</strong> Исполнитель вправе осуществлять модерацию всего пользовательского контента, включая промпты, описания, отзывы и сообщения.</p>
                <p><strong>9.2.</strong> Исполнитель вправе без предварительного уведомления:</p>
                <ul className="ml-6 space-y-2">
                  <li>• скрывать или удалять контент, нарушающий настоящие Условия;</li>
                  <li>• блокировать аккаунты Пользователей, нарушающих правила;</li>
                  <li>• ограничивать доступ к отдельным функциям Сервиса;</li>
                  <li>• требовать подтверждения личности при подозрении на нарушение.</li>
                </ul>
                <p><strong>9.3.</strong> Пользователь вправе обжаловать решение о модерации через службу поддержки в течение 14 дней с момента применения санкций.</p>
                <p><strong>9.4.</strong> Решение Исполнителя по жалобе является окончательным и пересмотру не подлежит.</p>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">10. Изменения условий</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>10.1.</strong> Исполнитель вправе вносить изменения в настоящие Условия в одностороннем порядке.</p>
                <p><strong>10.2.</strong> Изменения публикуются на странице /support/about/terms с указанием даты обновления.</p>
                <p><strong>10.3.</strong> Изменения вступают в силу через 7 (семь) календарных дней после публикации.</p>
                <p><strong>10.4.</strong> Пользователь уведомляется об изменениях через:</p>
                <ul className="ml-6 space-y-2">
                  <li>• электронную почту, указанную при регистрации;</li>
                  <li>• уведомление в личном кабинете;</li>
                  <li>• баннер на главной странице Сервиса.</li>
                </ul>
                <p><strong>10.5.</strong> Продолжение использования Сервиса после вступления изменений в силу означает полное согласие Пользователя с новыми Условиями.</p>
                <p><strong>10.6.</strong> Если Пользователь не согласен с изменениями, он обязан прекратить использование Сервиса до вступления изменений в силу.</p>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section id="section-11" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">11. Приостановление и прекращение работы сервиса</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>11.1.</strong> Исполнитель вправе приостанавливать работу Сервиса для проведения плановых технических работ с предварительным уведомлением не менее чем за 24 часа.</p>
                <p><strong>11.2.</strong> При аварийных ситуациях Исполнитель вправе приостановить работу Сервиса без предварительного уведомления для устранения угрозы безопасности.</p>
                <p><strong>11.3.</strong> Исполнитель вправе прекратить работу Сервиса полностью с уведомлением Пользователей не менее чем за 30 календарных дней.</p>
                <p><strong>11.4.</strong> При прекращении работы Сервиса Пользователям предоставляется возможность:</p>
                <ul className="ml-6 space-y-2">
                  <li>• экспортировать свои данные в течение 30 дней;</li>
                  <li>• получить пропорциональный возврат средств за неиспользованный период подписки.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 12 */}
          <section id="section-12" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">12. Применимое право и разрешение споров</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>12.1.</strong> Настоящие Условия регулируются законодательством Российской Федерации.</p>
                <p><strong>12.2.</strong> Все споры и разногласия Стороны будут стремиться разрешить путём переговоров.</p>
                <p><strong>12.3.</strong> При недостижении согласия спор передаётся на рассмотрение в суд по месту нахождения Исполнителя (Курская область, РФ).</p>
                <p><strong>12.4.</strong> До обращения в суд обязательным является направление досудебной претензии на email support@prompt-studio.ru.</p>
                <p><strong>12.5.</strong> Срок рассмотрения претензии — 30 календарных дней с момента получения.</p>
                <p><strong>12.6.</strong> Пользователь соглашается на получение уведомлений в электронной форме.</p>
              </div>
            </div>
          </section>

          {/* Section 13 */}
          <section id="section-13" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">13. Особые условия для AI-контента</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>13.1.</strong> Пользователь понимает, что промпты предназначены для использования с системами искусственного интеллекта сторонних разработчиков.</p>
                <p><strong>13.2.</strong> Исполнитель не контролирует и не несёт ответственности за:</p>
                <ul className="ml-6 space-y-2">
                  <li>• работу AI-моделей (ChatGPT, Midjourney, Stable Diffusion и др.);</li>
                  <li>• изменения в алгоритмах и правилах сторонних AI-сервисов;</li>
                  <li>• блокировки аккаунтов в сторонних сервисах вследствие использования промптов;</li>
                  <li>• соответствие результатов работы AI законодательству РФ.</li>
                </ul>
                <p><strong>13.3.</strong> Пользователь обязуется использовать AI-модели в соответствии с их условиями использования и законодательством РФ.</p>
                <p><strong>13.4.</strong> Запрещено использовать промпты для генерации контента, нарушающего законодательство или права третьих лиц.</p>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section id="section-14" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">14. Заключительные положения</h2>
              <div className="space-y-4 text-slate-700">
                <p><strong>14.1.</strong> Заголовки разделов приведены для удобства и не влияют на толкование положений Условий.</p>
                <p><strong>14.2.</strong> Если какое-либо положение Условий будет признано недействительным, это не влияет на действительность остальных положений.</p>
                <p><strong>14.3.</strong> Настоящие Условия составлены на русском языке. В случае наличия перевода на иные языки приоритет имеет русскоязычная версия.</p>
                <p><strong>14.4.</strong> Исполнитель не передаёт права и обязательства по настоящим Условиям третьим лицам без согласия Пользователя, за исключением случаев реорганизации или продажи бизнеса.</p>
                <p><strong>14.5.</strong> Пользователь вправе передать права по аккаунту третьему лицу только с письменного разрешения Исполнителя.</p>
                <p><strong>14.6.</strong> Все вопросы, не урегулированные настоящими Условиями, регулируются законодательством РФ и Публичной офертой Сервиса.</p>
              </div>
            </div>
          </section>

          {/* Section 15 */}
          <section id="section-15" className="scroll-mt-24">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">15. Контактная информация</h2>
              <div className="space-y-4 text-slate-700">
                <p className="font-semibold">Для всех вопросов по Условиям использования:</p>
                <p>Электронная почта: <strong>support@prompt-studio.ru</strong></p>
                
                <p className="font-semibold mt-4">Для юридических вопросов:</p>
                <p><strong>legal@prompt-studio.ru</strong></p>
                
                <p className="font-semibold mt-4">Для вопросов по персональным данным:</p>
                <p><strong>privacy@prompt-studio.ru</strong></p>
                
                <p className="font-semibold mt-4">Часы работы поддержки:</p>
                <p>Понедельник — Пятница, 9:00–18:00 (Московское время)</p>
                
                <p className="font-semibold mt-4">Реквизиты Исполнителя:</p>
                <p>ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА»<br />
                ИНН: 4600004389<br />
                Юридический адрес: 307041, Курская область, Медвенский район, с. 1-я Гостомля, д. 156</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-300 text-center text-slate-600 text-sm">
          <p className="mb-2">© 2026 ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА». Все права защищены.</p>
          <p className="mb-4">Сервис «Промт-Студия» — продукт компании ООО «СТАРТ ТЕХНОЛОГИЧЕСКОГО ПРОГРЕССА».</p>
          <p className="text-slate-500">Дата публикации: 11 марта 2026 года. Версия документа: 1.0</p>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-20"
          aria-label="Вернуться наверх"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
};

export default TermsPage;