import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Truck, Building, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { CartItem, OnlineOrder } from '../types/pharmacy';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: OnlineOrder) => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
  onOpenCheckout,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'Express Courier' | 'Pharmacy Pickup' | 'Discreet Mail'>('Express Courier');
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderCompleteNotice, setOrderCompleteNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
  const deliveryFee = deliveryMethod === 'Express Courier' ? 12.0 : 0.0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const firstItem = cartItems[0].item;
    const orderNumber = `ORD-STORE-${Date.now().toString().slice(-6)}`;

    const newOrder: OnlineOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      patientName: patientName || 'Store Customer',
      email: email || 'customer@auracarehealth.com',
      phone: phone || '+1 (555) 000-0000',
      medicationName:
        cartItems.length === 1
          ? firstItem.name
          : `${firstItem.name} + ${cartItems.length - 1} other products`,
      orderType: firstItem.rxRequired ? 'Medication Refill' : 'Store Purchase',
      deliveryMethod,
      deliveryAddress: deliveryMethod !== 'Pharmacy Pickup' ? address : 'Local Pharmacy Desk Pickup',
      totalAmount: grandTotal,
      status: 'Submitted',
      placedAt: '2026-11-02 04:50 AM',
    };

    onOrderPlaced(newOrder);
    onClearCart();
    setOrderCompleteNotice(orderNumber);
    setIsCheckingOut(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-base">Your Health Cart</h3>
            <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, ci) => acc + ci.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => {
              setOrderCompleteNotice(null);
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {orderCompleteNotice ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Order Placed Successfully!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Thank you! Your order <span className="font-mono font-bold text-slate-900">{orderCompleteNotice}</span> has been confirmed and routed to our dispensary team for fulfillment.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200 text-left">
                <p className="font-semibold text-slate-800 mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                  <li>Dispensary team reviews and packages items</li>
                  <li>Tracking number dispatched via Hostinger sync email</li>
                  <li>Delivery via selected shipping method</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setOrderCompleteNotice(null);
                  onClose();
                }}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Your cart is currently empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Browse our sleep, weight loss, and daily wellness remedies to add items to your cart.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer"
              >
                Browse Store Products
              </button>
            </div>
          ) : !isCheckingOut ? (
            <div className="space-y-3">
              {cartItems.map((ci) => (
                <div
                  key={ci.item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    {ci.item.image ? (
                      <img
                        src={ci.item.image}
                        alt={ci.item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs">
                        Item
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{ci.item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ${ci.item.price.toFixed(2)}
                      </p>
                      {ci.item.rxRequired && (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1 py-0.2 rounded">
                          Clinical Grade
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-300 rounded bg-white text-xs">
                      <button
                        onClick={() => onUpdateQuantity(ci.item.id, ci.quantity - 1)}
                        className="px-2 py-0.5 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-mono font-bold text-slate-900">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(ci.item.id, ci.quantity + 1)}
                        className="px-2 py-0.5 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(ci.item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Order Cost Breakdown */}
              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Product Subtotal:</span>
                  <span className="font-mono text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax:</span>
                  <span className="text-slate-600 font-mono">$0.00 (Included)</span>
                </div>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                Customer &amp; Shipping Details
              </h4>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eleanor@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 349-1102"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fulfillment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('Express Courier')}
                    className={`p-2 rounded border text-left cursor-pointer ${
                      deliveryMethod === 'Express Courier'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 mb-1 text-teal-700" />
                    <span>Courier ($12)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('Pharmacy Pickup')}
                    className={`p-2 rounded border text-left cursor-pointer ${
                      deliveryMethod === 'Pharmacy Pickup'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 mb-1 text-teal-700" />
                    <span>Pickup ($0)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('Discreet Mail')}
                    className={`p-2 rounded border text-left cursor-pointer ${
                      deliveryMethod === 'Discreet Mail'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 mb-1 text-teal-700" />
                    <span>Mail ($0)</span>
                  </button>
                </div>
              </div>

              {deliveryMethod !== 'Pharmacy Pickup' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shipping Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, Apt, City, State, Zip"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs cursor-pointer"
                >
                  Confirm &amp; Place Order
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && !isCheckingOut && !orderCompleteNotice && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Estimated Order Total:</span>
              <span className="text-lg font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full py-3 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Proceed to Checkout (Card, PayPal, Crypto)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
