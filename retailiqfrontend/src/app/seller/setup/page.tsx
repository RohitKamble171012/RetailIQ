"use client";

import { useEffect, useState } from "react";
import { Store, Phone, FileText, Upload, Building2, Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Sidebar from "../../../components/Sidebar";

export default function SellerSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    mobile: "",
    address: "",
    shopType: "",
    gstNumber: "",
    upiId: "",
    openingHours: "",
    description: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) router.push("/login");
      else {
        setUser(u);
        await fetchShopProfile(u);
      }
    });
    return () => unsub();
  }, [router]);

  const fetchShopProfile = async (u: any) => {
    try {
      setFetching(true);
      const token = await getIdToken(u, true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/seller/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No existing shop found");
      const data = await res.json();
      if (data.success && data.shop) {
        const s = data.shop;
        setForm({
          shopName: s.name || "",
          ownerName: s.ownerName || "",
          mobile: s.mobile || "",
          address: s.address || "",
          shopType: s.type || "",
          gstNumber: s.gstNumber || "",
          upiId: s.upiId || "",
          openingHours: `${s.openTime || ""} - ${s.closeTime || ""}`,
          description: s.description || "",
        });
        if (s.logo) setLogoPreview(`${API_URL}${s.logo}`);
      }
    } catch (err) {
      console.log("No existing shop profile, new setup required.");
    } finally {
      setFetching(false);
    }
  };

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB)");
      return;
    }
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) return router.push("/login");
    setError(null);
    setLoading(true);

    try {
      const token = await getIdToken(user, true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append("logo", logo);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/seller/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      alert("Shop info saved successfully!");
      router.push("/seller/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shop Settings</h1>
          <p className="text-gray-600 mt-1">Update your shop details and preferences</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-8">
            {/* Basic Info */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    required
                    placeholder="Enter shop name"
                    value={form.shopName}
                    onChange={(e) => update("shopName", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Type *
                  </label>
                  <select
                    required
                    value={form.shopType}
                    onChange={(e) => update("shopType", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select shop type</option>
                    <option>Grocery</option>
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Pharmacy</option>
                    <option>Stationery</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number (Optional)
                  </label>
                  <input
                    placeholder="Enter GST number"
                    value={form.gstNumber}
                    onChange={(e) => update("gstNumber", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    required
                    placeholder="Enter mobile number"
                    value={form.mobile}
                    onChange={(e) => update("mobile", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID
                  </label>
                  <input
                    placeholder="yourname@upi"
                    value={form.upiId}
                    onChange={(e) => update("upiId", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Address *
                  </label>
                  <textarea
                    required
                    placeholder="Enter complete shop address"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Extra */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                Additional Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Hours
                  </label>
                  <input
                    placeholder="e.g. 9:00 AM - 9:00 PM"
                    value={form.openingHours}
                    onChange={(e) => update("openingHours", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Tell customers about your shop"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Logo
                  </label>
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <label
                        htmlFor="logo-upload"
                        className="block border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-orange-400 cursor-pointer text-center bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload logo</p>
                        <p className="text-xs text-gray-500 mt-1">Maximum 5MB</p>
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                    {logoPreview && (
                      <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
