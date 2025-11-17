"use client";

import { useEffect, useState } from "react";
import {
  Store,
  Package,
  PlusCircle,
  QrCode,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Phone,
  CreditCard,
  Edit,
  Upload,
  X,
  ImageIcon,
  Trash2,
  Edit3,
  Check,
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { QRCodeCanvas } from "qrcode.react";
import app from "../../../lib/firebase";

export default function SellerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(currentUser);
      const token = await currentUser.getIdToken();
      try {
        const res = await fetch(`${API_URL}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch shop");
        const data = await res.json();
        setShop(data.shop);
        await fetchProducts(token);
      } catch (err) {
        console.error("Error fetching shop:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setNewProduct({ ...newProduct, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewProduct({ ...newProduct, image: null });
    setImagePreview(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    if (!user || !shop) return alert("Please wait, loading...");

    setIsSubmitting(true);
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value) formData.append(key, value as any);
      });

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");
      setProducts((prev) => [...prev, data.product]);
      alert(" Product added successfully!");
      setShowAddProduct(false);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        image: null,
      });
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert(" Error adding product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector("#shopQR") as HTMLCanvasElement;
    const link = document.createElement("a");
    link.download = `${shop?.name || "shop"}_QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        alert(" Product deleted successfully!");
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert(" Error deleting product");
    }
  };

  const handleStockUpdate = async (id: string) => {
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`${API_URL}/api/products/${id}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, stock: newStock } : p))
        );
        setEditingStock(null);
        alert(" Stock updated successfully!");
      } else {
        alert(data.message || "Failed to update stock");
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      alert(" Error updating stock");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Store className="w-12 h-12 mb-4 text-orange-500" />
        <h2 className="text-xl font-semibold mb-2">Please log in to continue</h2>
      </div>
    );

  const stats = [
    { label: "Total Products", value: products.length, icon: Package },
    {
      label: "Total Stock",
      value: products.reduce((sum, p) => sum + (p.stock || 0), 0),
      icon: ShoppingBag,
    },
    {
      label: "Categories",
      value: new Set(products.map((p) => p.category)).size,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Seller Dashboard</h1>
          <p className="text-slate-400">Manage your shop & products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-slate-900/70 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <stat.icon className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {shop ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600/30 p-3 rounded-lg">
                    <Store className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{shop.name}</h2>
                    <p className="text-slate-400 text-sm">{shop.type}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-800 rounded-lg">
                  <Edit className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex gap-2 items-start">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Phone className="w-5 h-5 text-orange-400" />
                  <span>{shop.mobile}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  <span>{shop.upiId}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6 text-center flex flex-col items-center justify-center">
              <QrCode className="w-12 h-12 text-orange-500 mb-3" />
              <p className="text-slate-400 mb-4">Shop QR Code</p>
              <button
                onClick={() => setShowQRModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white"
              >
                View / Download QR
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 mb-10">
            No shop found. Please register your shop first.
          </p>
        )}

        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-500" /> Your Products
            </h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
            >
              <PlusCircle className="w-5 h-5" /> Add Product
            </button>
          </div>

          {products.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all"
                >
                  <div className="relative">
                    <img
                      src={`${API_URL}${p.image}`}
                      alt={p.name}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="absolute top-2 right-2 p-2 bg-red-600/90 hover:bg-red-700 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">{p.name}</h3>
                    <p className="text-orange-400 font-bold mb-2">₹{p.price}</p>
                    <p className="text-slate-400 text-sm mb-3">{p.category}</p>

                    {/* Stock Management */}
                    <div className="border-t border-slate-700 pt-3">
                      {editingStock === p._id ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={newStock}
                              onChange={(e) => setNewStock(Number(e.target.value))}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              min="0"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStockUpdate(p._id)}
                              className="flex-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm">
                            Stock: <span className="font-semibold text-white">{p.stock}</span>
                          </span>
                          <button
                            onClick={() => {
                              setEditingStock(p._id);
                              setNewStock(p.stock);
                            }}
                            className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-sm transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No products yet</p>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
            <QRCodeCanvas
              id="shopQR"
              value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`}
              size={256}
              includeMargin
            />

            {/* 👇 ADD THIS NEW SECTION */}
            <div className="mt-4">
              <p className="text-slate-300 text-sm mb-2">Shop Link:</p>
              <div className="flex items-center justify-center gap-2 bg-slate-800 p-2 rounded-lg">
                <input
                  type="text"
                  readOnly
                  value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`}
                  className="w-full bg-transparent text-slate-300 text-center text-sm focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/shop/${shop._id}`
                    );
                    alert("Shop link copied!");
                  }}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm text-white"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* ✅ Buttons */}
            <div className="mt-4 space-x-3">
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white"
              >
                Download QR
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Enhanced Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl my-8">
            {/* Modal Header */}
            <div className="border-b border-slate-700 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Product</h2>
                <p className="text-slate-400 text-sm mt-1">Fill in the details to add a product to your shop</p>
              </div>
              <button
                onClick={() => setShowAddProduct(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Image Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Product Image *
                  </label>

                  {!imagePreview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-700/50 rounded-full">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-300 font-medium mb-1">
                            Drop your image here
                          </p>
                          <p className="text-slate-500 text-sm">or click to browse</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="imageUpload"
                          required
                        />
                        <label
                          htmlFor="imageUpload"
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white cursor-pointer transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Choose File
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-slate-700">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white text-sm font-medium truncate">
                          {newProduct.image?.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Product Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, price: e.target.value })
                        }
                        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, stock: e.target.value })
                        }
                        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Electronics, Clothing"
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, category: e.target.value })
                      }
                      className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter product description..."
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleAddProduct}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}