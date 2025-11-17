"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [shopId, setShopId] = useState<string>("");

  // ✅ Fetch shop info using Firebase Auth token
  const fetchShop = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user logged in");
        return;
      }

      // 🔑 Get a valid Firebase ID token
      const token = await user.getIdToken();

      const res = await fetch(`${baseUrl}/api/seller/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch shop profile:", await res.text());
        return;
      }

      const data = await res.json();
      if (data.success) {
        setShopId(data.shop._id);
        fetchOrders(data.shop._id);
      } else {
        console.error("Shop not found");
      }
    } catch (err) {
      console.error("Error fetching shop:", err);
    }
  };

  // ✅ Fetch orders belonging to this shop
  const fetchOrders = async (shopId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/shops/${shopId}/orders`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // ✅ Mark a cash order as paid
  const markAsPaid = async (orderId: string) => {
    if (!confirm("Mark this order as paid?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/shops/orders/${orderId}/mark-paid`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Order marked as paid!");
        fetchOrders(shopId);
      } else {
        alert("Failed to mark as paid");
      }
    } catch (err) {
      console.error("Error marking order paid:", err);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchShop();
  }, []);

  // ✅ Filter orders by status
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.paymentStatus === filter);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold text-orange-400 mb-6">Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        {["all", "pending", "paid"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? "bg-orange-600 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <p className="text-slate-400">No orders found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-slate-800 p-5 rounded-2xl border border-slate-700"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Order #{order._id.slice(-6)}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Total: ₹{order.totalAmount}
                  </p>
                  <p className="text-sm text-slate-400">
                    Payment: {order.paymentMethod.toUpperCase()} —{" "}
                    <span
                      className={
                        order.paymentStatus === "paid"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>

                {order.paymentMethod === "cash" &&
                  order.paymentStatus === "pending" && (
                    <button
                      onClick={() => markAsPaid(order._id)}
                      className="bg-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                    >
                      Mark as Paid
                    </button>
                  )}
              </div>

              <ul className="mt-3 text-slate-300 text-sm">
                {order.items.map((i: any, idx: number) => (
                  <li key={idx}>
                    {i.name} — ₹{i.price} × {i.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
