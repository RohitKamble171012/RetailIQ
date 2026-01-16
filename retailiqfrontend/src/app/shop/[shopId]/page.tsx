"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Download, Store, Phone, MapPin, X, Package, CreditCard } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ShopPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (shopId) fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/shops/${shopId}`);
      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
        setProducts(data.products);
      } else {
        alert("Shop not found");
      }
    } catch (err) {
      console.error("Error fetching shop:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    setCart((prev: any) => {
      const existing = prev[product._id] || { ...product, quantity: 0 };
      return {
        ...prev,
        [product._id]: { ...existing, quantity: existing.quantity + 1 },
      };
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev: any) => {
      const updated = { ...prev };
      if (updated[id]) {
        const newQuantity = updated[id].quantity + delta;
        if (newQuantity <= 0) {
          delete updated[id];
        } else {
          updated[id] = { ...updated[id], quantity: newQuantity };
        }
      }
      return updated;
    });
  };

  const totalAmount = Object.values(cart).reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0
  );

  const totalItems = Object.values(cart).reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(shop.name || "Shop Receipt", 14, 20);
    doc.setFontSize(12);
    doc.text(`Address: ${shop.address || "N/A"}`, 14, 30);
    doc.text(`Phone: ${shop.mobile || "N/A"}`, 14, 36);
    if (shop.upiId) doc.text(`UPI ID: ${shop.upiId}`, 14, 42);

    const tableData = Object.values(cart).map((item: any) => [
      item.name,
      item.quantity,
      `₹${item.price}`,
      `₹${(item.price * item.quantity).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Grand Total: ₹${totalAmount.toFixed(2)}`, 14, finalY);
    doc.save(`${shop.name || "shop"}_receipt.pdf`);
  };

  const handleCashPayment = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/shops/${shopId}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: Object.values(cart),
          totalAmount,
          paymentMethod: "cash",
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Order placed successfully (Cash Payment Pending)");
        setCart({});
        setShowCart(false);
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Error placing order");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
      </div>
    );

  if (!shop)
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Shop not found</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {shop.logo ? (
                <img
                  src={`${baseUrl}${shop.logo}`}
                  alt={shop.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-orange-600" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{shop.name}</h1>
                <p className="text-sm text-gray-600">{shop.type || "Shop"}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCart(true)}
              className="relative bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Shop Info Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>{shop.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-600" />
              <span>{shop.mobile}</span>
            </div>
            {shop.upiId && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span>UPI: {shop.upiId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
          <p className="text-gray-600 mt-1">{products.length} items available</p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No products available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group"
              >
                <div className="relative overflow-hidden bg-gray-100">
                  {p.image ? (
                    <img
                      src={`${baseUrl}${p.image}`}
                      alt={p.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-56 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Only {p.stock} left
                    </span>
                  )}
                  {p.stock === 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {p.name}
                  </h3>
                  {p.category && (
                    <p className="text-xs text-gray-500 mb-2">{p.category}</p>
                  )}
                  {p.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{p.price}</p>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
                Your Cart ({totalItems})
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 text-orange-600 font-medium hover:text-orange-700"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {Object.values(cart).map((item: any) => (
                      <div
                        key={item._id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        {item.image ? (
                          <img
                            src={`${baseUrl}${item.image}`}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-orange-600 font-bold mb-2">
                            ₹{item.price}
                          </p>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-900 rounded-lg bg-gray-900 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-900 rounded-lg bg-gray-900 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {shop.upiId && totalAmount > 0 && (
                        <a
                          href={`upi://pay?pa=${shop.upiId}&pn=${shop.name}&am=${totalAmount}&cu=INR`}
                          className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Pay ₹{totalAmount.toFixed(2)} via UPI
                        </a>
                      )}

                      <button
                        onClick={handleCashPayment}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Pay via Cash
                      </button>

                      <button
                        onClick={generatePDF}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download Receipt
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
