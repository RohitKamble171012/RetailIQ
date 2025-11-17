"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ShopPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any>({});
  const [loading, setLoading] = useState(true);
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

  // 🧾 Generate PDF Receipt
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

  // 💵 Handle Cash Payment
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
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading shop...
      </div>
    );

  if (!shop)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-400">
        Shop not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Shop Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-orange-400">{shop.name}</h1>
            <p className="text-slate-400">{shop.address}</p>
            <p className="text-slate-400 text-sm">📞 {shop.mobile}</p>
            {shop.upiId && (
              <p className="text-slate-400 text-sm">UPI: {shop.upiId}</p>
            )}
          </div>
          {shop.logo && (
            <img
              src={`${baseUrl}${shop.logo}`}
              alt={shop.name}
              className="w-28 h-28 object-cover rounded-full border border-slate-700 mt-4 md:mt-0"
            />
          )}
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 hover:border-orange-500/50 transition-all"
            >
              {p.image && (
                <img
                  src={`${baseUrl}${p.image}`}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
              <h2 className="text-xl font-semibold mt-3">{p.name}</h2>
              <p className="text-slate-400 text-sm">{p.description}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-orange-400 font-bold">₹{p.price}</p>
                <button
                  onClick={() => addToCart(p)}
                  className="bg-orange-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-orange-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Section */}
        {Object.keys(cart).length > 0 && (
          <div className="mt-12 bg-slate-900/70 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-orange-500" /> Your Cart
            </h2>

            {Object.values(cart).map((item: any) => (
              <div
                key={item._id}
                className="flex items-center justify-between border-b border-slate-700 py-3"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-slate-400 text-sm">
                    ₹{item.price} × {item.quantity} = ₹
                    {item.price * item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item._id, -1)}
                    className="bg-slate-700 px-2 py-1 rounded hover:bg-slate-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-[2rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, 1)}
                    className="bg-slate-700 px-2 py-1 rounded hover:bg-slate-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 justify-between items-center mt-6">
              <p className="text-xl font-semibold">
                Total: ₹{totalAmount.toFixed(2)}
              </p>

              <div className="flex gap-3">
                {shop.upiId && totalAmount > 0 && (
                  <a
                    href={`upi://pay?pa=${shop.upiId}&pn=${shop.name}&am=${totalAmount}&cu=INR`}
                    className="bg-orange-600 px-5 py-2 rounded-lg font-semibold hover:bg-orange-700"
                  >
                    Pay via UPI
                  </a>
                )}

                <button
                  onClick={handleCashPayment}
                  className="bg-green-600 px-5 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Pay via Cash
                </button>

                <button
                  onClick={generatePDF}
                  className="bg-slate-700 px-5 py-2 rounded-lg font-semibold hover:bg-slate-600 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}