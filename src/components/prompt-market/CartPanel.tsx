import { useState } from "react";
import { X, Trash2, CreditCard, QrCode, Wallet, Tag, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
}

interface CartPanelProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

type PaymentMethod = "card" | "sbp" | "balance";
type CheckoutStep = "cart" | "checkout" | "success";

export function CartPanel({ open, onClose, items, onRemove, onClear }: CartPanelProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!open) return null;

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const handleApplyPromo = () => {
    if (promoCode.trim()) setPromoApplied(true);
  };

  const handlePay = () => {
    if (!agreedToTerms) return;
    setStep("success");
  };

  const handleClose = () => {
    setStep("cart");
    onClose();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border shadow-elevated flex flex-col h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {step === "cart" && `Корзина (${items.length})`}
            {step === "checkout" && "Оформление"}
            {step === "success" && "Готово!"}
          </h2>
          <button onClick={handleClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* CART STEP */}
          {step === "cart" && (
            <div className="p-5 space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 text-sm">Корзина пуста</p>
              ) : (
                <>
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-border">
                      <img src={item.image} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">@{item.author}</p>
                        <p className="text-sm font-bold mt-1">{item.price} ₽</p>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="self-start h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}

                  {/* Promo */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Промокод"
                        className={`${inputCls} pl-9`}
                        disabled={promoApplied}
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !promoCode.trim()}
                      className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {promoApplied ? "✓" : "Применить"}
                    </button>
                  </div>

                  {/* Total */}
                  <div className="space-y-1 pt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Подытог</span>
                      <span>{subtotal} ₽</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Скидка</span>
                        <span>−{discount} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-1">
                      <span>Итого</span>
                      <span>{total} ₽</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CHECKOUT STEP */}
          {step === "checkout" && (
            <div className="p-5 space-y-5">
              {/* Payment method */}
              <div>
                <h3 className="text-sm font-medium mb-3">Способ оплаты</h3>
                <div className="space-y-2">
                  {[
                    { key: "card" as const, icon: CreditCard, label: "Банковская карта РФ" },
                    { key: "sbp" as const, icon: QrCode, label: "СБП (QR-код)" },
                    { key: "balance" as const, icon: Wallet, label: "Внутренний баланс" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setPaymentMethod(m.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        paymentMethod === m.key ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                      }`}
                    >
                      <m.icon className="h-4 w-4" /> {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card form */}
              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Номер карты</label>
                    <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">Срок</label>
                      <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/ГГ" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">CVC</label>
                      <input value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="•••" type="password" className={inputCls} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="rounded border-border" />
                    Сохранить карту для будущих покупок
                  </label>
                </div>
              )}

              {paymentMethod === "sbp" && (
                <div className="text-center py-6">
                  <div className="h-40 w-40 mx-auto bg-muted rounded-xl flex items-center justify-center mb-3">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">QR-код для оплаты через СБП</p>
                </div>
              )}

              {paymentMethod === "balance" && (
                <div className="text-center py-4">
                  <p className="text-2xl font-bold">1 250 ₽</p>
                  <p className="text-sm text-muted-foreground mt-1">Ваш баланс</p>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>К оплате</span>
                <span>{total} ₽</span>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-border mt-0.5"
                />
                Я принимаю условия пользовательского соглашения и политики конфиденциальности
              </label>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === "success" && (
            <div className="p-5 text-center space-y-4 py-10">
              <div className="h-16 w-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-bold">Оплата прошла успешно!</h3>
              <p className="text-sm text-muted-foreground">
                Промпты добавлены в вашу библиотеку Studio.
                <br />Электронный чек отправлен на вашу почту.
              </p>
              <div className="bg-background rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID транзакции</span>
                  <span className="font-mono text-xs">PF-{Date.now().toString(36).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Сумма</span>
                  <span className="font-bold">{total} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Лицензия</span>
                  <span>Персональная</span>
                </div>
              </div>
              <Link
                to="/my-prompts"
                className="inline-block px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                onClick={handleClose}
              >
                Открыть в Studio
              </Link>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {step === "cart" && items.length > 0 && (
          <div className="p-5 border-t border-border">
            <button
              onClick={() => setStep("checkout")}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Перейти к оплате — {total} ₽
            </button>
          </div>
        )}
        {step === "checkout" && (
          <div className="p-5 border-t border-border space-y-2">
            <button
              onClick={handlePay}
              disabled={!agreedToTerms}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Оплатить {total} ₽
            </button>
            <button onClick={() => setStep("cart")} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Назад в корзину
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
