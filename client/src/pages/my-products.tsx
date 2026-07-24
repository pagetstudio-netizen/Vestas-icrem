import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2, Wind } from "lucide-react";
import { Link } from "wouter";

import heroBanner from "@assets/vestas_112v_closeup_1783210181172.jpg";
import productImg1 from "@assets/vestas_112v_closeup_1783210181172.jpg";
import productImg2 from "@assets/vestas_112v_closeup_(1)_1783210181118.jpg";
import productImg3 from "@assets/vestas_112v_closeup_(2)_1783210180090.jpg";
import productImg4 from "@assets/images_(50)_1783210180466.jpeg";
import productImg5 from "@assets/images_(41)_1783210181134.jpeg";
import productImg6 from "@assets/images_(49)_1783210181155.jpeg";
import productImg7 from "@assets/images_(40)_1783210181193.jpeg";
import productImg8 from "@assets/images_(39)_1783210181215.jpeg";

const PRODUCT_IMAGES = [productImg1, productImg2, productImg3, productImg4, productImg5, productImg6, productImg7, productImg8];

export default function MyProductsPage() {
  const { user } = useAuth();

  const { data: userProducts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";

  const allProducts = userProducts || [];

  const totalEarned = allProducts.reduce((sum: number, p: any) => {
    return sum + parseFloat(p.totalEarned || "0");
  }, 0);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#f0f2f5" }}>
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Hero banner with back button */}
        <div className="relative">
          <img
            src={heroBanner}
            alt="Vestas"
            className="w-full object-cover"
            style={{ height: 200 }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,20,60,0.55) 0%, rgba(0,20,60,0.75) 100%)" }} />

          {/* Back button */}
          <div className="absolute top-3 left-3">
            <Link href="/account">
              <button className="p-2 bg-white/20 rounded-full backdrop-blur-sm" data-testid="button-back">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            </Link>
          </div>

          {/* Title on banner */}
          <div className="absolute bottom-4 left-4">
            <p className="text-white text-xl font-black tracking-tight">Mes Produits</p>
            <p className="text-white/70 text-xs mt-0.5">Vestas Wind Energy</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mx-3 mt-3">
          <div
            className="rounded-2xl px-4 py-4 text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #003366, #004d99)" }}
          >
            <p className="text-white/70 text-xs mb-1">Mon appareil</p>
            <p className="text-white font-black text-2xl">{allProducts.length}</p>
          </div>
          <div
            className="rounded-2xl px-4 py-4 text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #003366, #004d99)" }}
          >
            <p className="text-white/70 text-xs mb-1">Mes revenus</p>
            <p className="text-white font-black text-xl leading-tight">
              {currency} {totalEarned.toLocaleString("fr-FR")}
            </p>
          </div>
        </div>

        {/* Info notice */}
        <div className="mx-3 mt-3 bg-white rounded-xl px-4 py-3 shadow-sm">
          <p className="text-gray-500 text-xs text-center">
            ℹ️ Les revenus des produits sont réglés toutes les 24 heures
          </p>
        </div>

        {/* Product cards */}
        <div className="px-3 mt-3 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#003366" }} />
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm flex flex-col items-center gap-3">
              <Wind className="w-12 h-12 text-gray-200" />
              <p className="text-gray-500 font-medium">Aucun produit Vestas</p>
              <p className="text-gray-400 text-sm">Achetez des produits pour commencer à gagner</p>
            </div>
          ) : (
            allProducts.map((up: any, index: number) => {
              const cycleDays = up.product?.cycleDays || 60;
              const daysRemaining = up.daysRemaining || 0;
              const daysCompleted = Math.max(0, cycleDays - daysRemaining);
              const dailyEarnings = up.product?.dailyEarnings || 0;
              const earnedSoFar = parseFloat(up.totalEarned || "0");
              const progress = cycleDays > 0 ? Math.round((daysCompleted / cycleDays) * 100) : 0;

              return (
                <div
                  key={up.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  data-testid={`product-card-${up.id}`}
                >
                  {/* Top header */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ background: "linear-gradient(135deg, #003366, #002244)" }}
                  >
                    <p className="text-white font-bold text-sm">{up.product?.name || "Produit"}</p>
                    <span className="text-white/70 text-xs">{formatDateTime(up.purchasedAt)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={PRODUCT_IMAGES[index % PRODUCT_IMAGES.length]}
                        alt={up.product?.name || "Produit"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Revenu/jour</span>
                        <span className="font-bold text-sm" style={{ color: "#003366" }}>
                          {currency} {dailyEarnings.toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Gagné</span>
                        <span className="font-bold text-sm" style={{ color: "#003366" }}>
                          {currency} {earnedSoFar.toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Durée</span>
                        <span className="font-bold text-xs text-gray-700">
                          {daysCompleted}/{cycleDays} jours
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 pb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-xs">Progression</span>
                      <span className="text-xs font-bold" style={{ color: "#003366" }}>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${progress}%`, background: "linear-gradient(90deg, #003366, #0066cc)" }}
                      />
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div
                    className="px-4 py-2.5 text-center text-white text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, #003366, #002244)" }}
                  >
                    Revenus reçus : {currency} {earnedSoFar.toLocaleString("fr-FR")}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
