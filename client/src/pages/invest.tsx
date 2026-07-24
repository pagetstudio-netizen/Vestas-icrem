import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { Loader2, AlertTriangle, Settings } from "lucide-react";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

import vestasLogo from "@assets/vestas-logo_1783210030332.png";
import serviceIcon from "@assets/20260311_214852_1773265973964.png";
import productImg1 from "@assets/vestas_112v_closeup_1783210181172.jpg";
import productImg2 from "@assets/vestas_112v_closeup_(1)_1783210181118.jpg";
import productImg3 from "@assets/vestas_112v_closeup_(2)_1783210180090.jpg";
import productImg4 from "@assets/images_(50)_1783210180466.jpeg";
import productImg5 from "@assets/images_(41)_1783210181134.jpeg";
import productImg6 from "@assets/images_(49)_1783210181155.jpeg";
import productImg7 from "@assets/images_(40)_1783210181193.jpeg";
import productImg8 from "@assets/images_(39)_1783210181215.jpeg";

const PRODUCT_IMAGES = [productImg1, productImg2, productImg3, productImg4, productImg5, productImg6, productImg7, productImg8];

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function InvestPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [confirmProduct, setConfirmProduct] = useState<ProductWithOwnership | null>(null);

  const { data: products, isLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      setConfirmProduct(null);
      toast({ title: "Produit acheté !", description: "Vous commencerez à recevoir des gains demain." });
    },
    onError: (error: any) => {
      setConfirmProduct(null);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const paidProducts = products?.filter(p => !p.isFree) || [];

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#f0f2f5" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shadow-sm" style={{ background: "linear-gradient(135deg, #003366 0%, #001a40 100%)" }}>
        <img src={vestasLogo} alt="Vestas" className="h-8 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
        <button onClick={() => navigate("/service")} className="flex items-center justify-center" data-testid="button-service">
          <img src={serviceIcon} alt="Service client" className="w-8 h-8 object-contain" />
        </button>
      </div>

      {/* Products grid */}
      <div className="flex-1 overflow-y-auto pb-24 px-2 pt-3">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : paidProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {paidProducts.map((product, idx) => {
              const img = PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length];
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
                  data-testid={`product-card-${product.id}`}
                >
                  {/* Product name */}
                  <div className="text-center pt-3 pb-1 px-2">
                    <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                  </div>

                  {/* Product image */}
                  <div className="mx-3 my-2 rounded-xl overflow-hidden" style={{ height: 110 }}>
                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Stats */}
                  <div className="px-3 pb-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[11px]">Prix</span>
                      <span className="font-bold text-[11px]" style={{ color: "#003366" }}>
                        {currency} {Number(product.price).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[11px]">Rev. quotidien</span>
                      <span className="font-bold text-[11px]" style={{ color: "#003366" }}>
                        {currency} {Number(product.dailyEarnings).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[11px]">Rev. total</span>
                      <span className="font-bold text-[11px]" style={{ color: "#003366" }}>
                        {currency} {Number(product.totalReturn).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[11px]">Période</span>
                      <span className="font-bold text-[11px]" style={{ color: "#003366" }}>
                        {product.cycleDays} jours
                      </span>
                    </div>
                  </div>

                  {/* Price + button */}
                  <div className="mt-auto px-3 pb-3 pt-2">
                    <p className="text-gray-800 font-black text-base text-center mb-2">
                      {currency} {Number(product.price).toLocaleString("fr-FR")}
                    </p>
                    <button
                      onClick={() => setConfirmProduct(product)}
                      className="w-full py-2 rounded-xl text-sm font-bold text-white shadow"
                      style={{ background: "linear-gradient(135deg, #003366, #005599)" }}
                      data-testid={`button-purchase-${product.id}`}
                    >
                      Acheter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">Aucun produit disponible</p>
          </div>
        )}
      </div>

      {/* Purchase confirm modal */}
      {confirmProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60"
          onClick={() => setConfirmProduct(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(160deg, #003366 0%, #001a40 100%)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Title */}
            <div className="pt-6 px-6 pb-3">
              <h3 className="text-white text-2xl font-black">{confirmProduct.name}</h3>
              <p className="text-white/70 text-sm mt-1">
                Après l'achat du produit, vos gains seront crédités sur votre compte toutes les 24 heures.
              </p>
            </div>

            {/* Image + Info row */}
            <div className="flex items-center gap-4 px-6 py-3">
              <div className="w-28 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                <img
                  src={PRODUCT_IMAGES[(confirmProduct.sortOrder || 0) % PRODUCT_IMAGES.length]}
                  alt={confirmProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <div>
                  <p className="text-white/60 text-xs">Prix</p>
                  <p className="text-white font-bold text-sm">{currency} {Number(confirmProduct.price).toLocaleString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Revenu quotidien</p>
                  <p className="text-white font-bold text-sm">{currency} {Number(confirmProduct.dailyEarnings).toLocaleString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Revenu total</p>
                  <p className="text-white font-bold text-sm">{currency} {Number(confirmProduct.totalReturn).toLocaleString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Période de validité</p>
                  <p className="text-white font-bold text-sm">{confirmProduct.cycleDays} jours</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mx-6 mb-3">
              {balance < confirmProduct.price ? (
                <div className="flex items-center gap-2 p-2.5 bg-red-500/20 border border-red-400/30 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
                  <p className="text-xs text-red-200">
                    Solde insuffisant. Il vous manque {formatCurrency(confirmProduct.price - balance, user.country)}.
                  </p>
                </div>
              ) : (
                <p className="text-white/70 text-xs text-center font-semibold">
                  Chaque personne ne peut acheter qu'un seul article par jour.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 px-6 pb-6 pt-1">
              <button
                onClick={() => setConfirmProduct(null)}
                className="flex-1 py-3 rounded-full font-semibold text-sm"
                style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
                data-testid="button-cancel-purchase"
              >
                Annuler
              </button>
              <button
                onClick={() => purchaseMutation.mutate(confirmProduct.id)}
                disabled={purchaseMutation.isPending || balance < confirmProduct.price}
                className="flex-1 py-3 rounded-full text-white font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0066cc, #004499)" }}
                data-testid="button-confirm-purchase"
              >
                {purchaseMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
