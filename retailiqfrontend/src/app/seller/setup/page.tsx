"use client";

import { useEffect, useState } from "react";
import { Store, Phone, FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";

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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/seller/profile`, {
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
        if (s.logo) setLogoPreview(`${baseUrl}${s.logo}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push("/login");
    setError(null);
    setLoading(true);

    try {
      const token = await getIdToken(user, true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append("logo", logo);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/seller/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      alert(" Shop info saved successfully!");
      router.push("/seller/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading your shop info...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-slate-900/80 rounded-2xl shadow-2xl border border-slate-700/50 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-2">Your Shop Profile</h2>
          <p className="text-slate-400 mb-8">
            Update or edit your shop details anytime below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Store className="w-5 h-5 text-orange-500" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  required
                  placeholder="Shop Name"
                  value={form.shopName}
                  onChange={(e) => update("shopName", e.target.value)}
                  className="input-field"
                />
                <input
                  required
                  placeholder="Owner Name"
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  className="input-field"
                />
                <select
                  required
                  value={form.shopType}
                  onChange={(e) => update("shopType", e.target.value)}
                  className="input-field"
                >
                  <option value="">Select shop type</option>
                  <option>Grocery</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Pharmacy</option>
                  <option>Stationery</option>
                  <option>Other</option>
                </select>
                <input
                  placeholder="GST Number (optional)"
                  value={form.gstNumber}
                  onChange={(e) => update("gstNumber", e.target.value)}
                  className="input-field"
                />
              </div>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-orange-500" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  required
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                  className="input-field"
                />
                <input
                  placeholder="UPI ID"
                  value={form.upiId}
                  onChange={(e) => update("upiId", e.target.value)}
                  className="input-field"
                />
                <textarea
                  required
                  placeholder="Shop Address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="input-field md:col-span-2"
                />
              </div>
            </section>

            {/* Extra */}
            <section>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-orange-500" /> Additional Details
              </h3>
              <input
                placeholder="Opening Hours (e.g. 9:00 AM - 9:00 PM)"
                value={form.openingHours}
                onChange={(e) => update("openingHours", e.target.value)}
                className="input-field"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="input-field"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Shop Logo
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="logo-upload"
                      className="block border-2 border-dashed border-slate-600 rounded-lg p-6 hover:border-orange-400 cursor-pointer text-center text-slate-400"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      Click to upload logo (max 5MB)
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
                    <div className="w-32 h-32 border-2 border-slate-600 rounded-lg overflow-hidden bg-slate-800">
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #475569;
          background-color: #1e293b;
          color: white;
        }
      `}</style>
    </div>
  );
}
