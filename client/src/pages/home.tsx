import { useAuth } from "@/lib/auth";
import { SiTelegram } from "react-icons/si";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCountryByCode, formatCurrency } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Product } from "@shared/schema";

import productImg1 from "@assets/vestas_112v_closeup_1783210181172.jpg";
import productImg2 from "@assets/vestas_112v_closeup_(1)_1783210181118.jpg";
import productImg3 from "@assets/vestas_112v_closeup_(2)_1783210180090.jpg";
import productImg4 from "@assets/images_(50)_1783210180466.jpeg";
import productImg5 from "@assets/images_(41)_1783210181134.jpeg";
import productImg6 from "@assets/images_(49)_1783210181155.jpeg";
import productImg7 from "@assets/images_(40)_1783210181193.jpeg";
import productImg8 from "@assets/images_(39)_1783210181215.jpeg";

const PRODUCT_IMAGES = [
  productImg1, productImg2, productImg3, productImg4,
  productImg5, productImg6, productImg7, productImg8,
];

import jollibeeLogo from "@assets/vestas-logo_1783210030332.png";
import heroImg from "@assets/vestas_112v_closeup_1783210181172.jpg";
import bellIcon from "@assets/d7d9f6f6-dddc-4071-8bc2-d6e7e589fbae_(1)_1783248684110.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits from "@assets/2-1_1783245823825.png";
import iconService from "@assets/3-1_1783245823860.png";

interface ProductWithOwnership extends Product {
  isOwned?: boolean;
  canClaimFree?: boolean;
  ownedCount?: number;
}

const DARK_ICON = { filter: "brightness(0) saturate(100%)" } as React.CSSProperties;

export default function HomePage() {
  const { user, refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPopup, setShowPopup] = useState(false);
  const [confirmProduct, setConfirmProduct] = useState<ProductWithOwnership | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const { data: products } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
  });

  // Show popup on mount and every time home tab is clicked
  useEffect(() => {
    setShowPopup(true);
    const handler = () => setShowPopup(true);
    window.addEventListener("home-tab-clicked", handler);
    return () => window.removeEventListener("home-tab-clicked", handler);
  }, []);

  useEffect(() => {
    const w = window as any;
    if (w._installPrompt) { setInstallPrompt(w._installPrompt); w._installPrompt = null; }
    if (w._appInstalled) setInstalled(true);
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de l'achat");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      setConfirmProduct(null);
      toast({ title: "✅ Produit acheté !", description: "Vos gains débutent demain." });
    },
    onError: (error: any) => {
      setConfirmProduct(null);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleInstall = async () => {
    if (installed) {
      toast({ title: "Déjà installée", description: "L'app est déjà sur votre écran d'accueil." });
      return;
    }
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
    } else {
      toast({
        title: "Installer l'application",
        description: "iPhone : Partager → Sur l'écran d'accueil. Android : menu → Ajouter à l'écran d'accueil.",
      });
    }
  };

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const balance = parseFloat(user.balance || "0");

  const paidProducts = products?.filter(p => !p.isFree) || [];
  const signupBonus = settings?.signupBonus || "500";
  const level1Commission = settings?.level1Commission || "25";
  const telegramGroupLink = settings?.groupLink || "https://t.me/vestasgroup";
  const popupButtonLabel = settings?.popupButtonLabel || "Rejoindre notre groupe Telegram";

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#f0f2f5" }}>

      {/* ── POPUP NOTIFICATION ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.82)" }}
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "#111827" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Bell icon */}
            <div className="flex justify-center pt-7 pb-2">
              <img src={bellIcon} alt="Notification" className="w-24 h-24 object-contain" />
            </div>

            {/* Title */}
            <p className="text-white font-extrabold text-xl text-center tracking-widest mb-4">NOTIFICATION</p>

            {/* Numbered list */}
            <div className="px-6 pb-2 space-y-2">
              {[
                `Prime d'inscription : ${parseInt(signupBonus).toLocaleString()} FCFA.`,
                `Récompense de connexion quotidienne : 50 FCFA.`,
                `Invitez vos subordonnés à investir et recevez une récompense en espèces de ${level1Commission}% du montant de leur investissement.`,
                `Il n'y a aucune limite quant au temps de retrait ou au nombre de retraits. Vous pouvez retirer de l'argent à tout moment.`,
                `Vestas attache une grande importance au marché.`,
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-white/60 text-xs font-bold mt-0.5 shrink-0">{i + 1}.</span>
                  <p className="text-white/85 text-xs leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="px-5 pt-5 pb-6 space-y-3">
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3.5 bg-white rounded-full font-extrabold text-base text-gray-900"
                data-testid="button-popup-agree"
              >
                OK
              </button>
              <a
                href={telegramGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-bold text-sm text-white"
                style={{ background: "linear-gradient(90deg, #6d28d9, #7c3aed)" }}
                onClick={() => setShowPopup(false)}
              >
                <SiTelegram className="w-4 h-4" />
                Aller sur Telegram &gt;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <img src={jollibeeLogo} alt="Vestas" className="h-10 w-auto object-contain" />
        <button
          onClick={() => navigate("/service")}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
        >
          Support
        </button>
      </div>

      {/* ── Hero Banner ── */}
      <div className="mx-3 mt-2">
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 210 }}>
          <img src={heroImg} alt="Vestas" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm px-4 py-4">
        <div className="flex justify-around items-center">
          <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-2" data-testid="button-depot">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconRecharger} alt="Dépôt" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Recharger</span>
          </button>
          <button onClick={() => navigate("/withdrawal")} className="flex flex-col items-center gap-2" data-testid="button-retrait">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconRetraits} alt="Retrait" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Retirer</span>
          </button>
          <button onClick={() => navigate("/service")} className="flex flex-col items-center gap-2" data-testid="button-aide">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconService} alt="Aide" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Service Client</span>
          </button>
        </div>
      </div>

      {/* ── Produits ── */}
      {paidProducts.length > 0 && (
        <div className="mx-3 mt-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-gray-800 font-extrabold text-base">Nos Produits</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {paidProducts.map((product, idx) => {
              const img = PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length];
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => setConfirmProduct(product)}
                  data-testid={`home-product-card-${product.id}`}
                >
                  {/* Name */}
                  <div className="text-center pt-3 pb-1 px-2">
                    <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                  </div>

                  {/* Image */}
                  <div className="mx-2.5 rounded-xl overflow-hidden" style={{ height: 95 }}>
                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Stats */}
                  <div className="px-3 pt-2 pb-1 space-y-0.5 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[10px]">Prix</span>
                      <span className="font-bold text-[10px]" style={{ color: "#003366" }}>
                        {currency} {Number(product.price).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[10px]">Rev./jour</span>
                      <span className="font-bold text-[10px]" style={{ color: "#003366" }}>
                        {currency} {Number(product.dailyEarnings).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[10px]">Rev. total</span>
                      <span className="font-bold text-[10px]" style={{ color: "#003366" }}>
                        {currency} {Number(product.totalReturn).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[10px]">Durée</span>
                      <span className="font-bold text-[10px]" style={{ color: "#003366" }}>
                        {product.cycleDays} jours
                      </span>
                    </div>
                  </div>

                  {/* Buy button */}
                  <div className="px-2.5 pb-3 pt-2">
                    <div
                      className="w-full py-2 rounded-xl text-center text-white text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #003366, #005599)" }}
                    >
                      Acheter
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pb-24" />

      {/* ── Purchase confirm modal ── */}
      {confirmProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60"
          onClick={() => setConfirmProduct(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(160deg, #003366 0%, #001428 100%)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Title */}
            <div className="pt-6 px-6 pb-3">
              <h3 className="text-white text-2xl font-black">{confirmProduct.name}</h3>
              <p className="text-white/70 text-sm mt-1">
                Vos gains seront crédités toutes les 24 heures.
              </p>
            </div>

            {/* Image + Info */}
            <div className="flex items-center gap-4 px-6 py-3">
              <div className="w-28 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                <img
                  src={PRODUCT_IMAGES[((confirmProduct.sortOrder ?? 0)) % PRODUCT_IMAGES.length]}
                  alt={confirmProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
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
                  <p className="text-white/60 text-xs">Période</p>
                  <p className="text-white font-bold text-sm">{confirmProduct.cycleDays} jours</p>
                </div>
              </div>
            </div>

            {/* Warning / info */}
            <div className="mx-6 mb-3">
              {balance < Number(confirmProduct.price) ? (
                <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: "rgba(239,68,68,0.2)" }}>
                  <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
                  <p className="text-xs text-red-200">
                    Solde insuffisant. Il vous manque {formatCurrency(Number(confirmProduct.price) - balance, user.country)}.
                  </p>
                </div>
              ) : (
                <p className="text-white/60 text-xs text-center">
                  Chaque personne ne peut acheter qu'un seul article par jour.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 px-6 pb-6 pt-1">
              <button
                onClick={() => setConfirmProduct(null)}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
                data-testid="button-cancel-purchase"
              >
                Annuler
              </button>
              <button
                onClick={() => purchaseMutation.mutate(confirmProduct.id)}
                disabled={purchaseMutation.isPending || balance < Number(confirmProduct.price)}
                className="flex-1 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
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
