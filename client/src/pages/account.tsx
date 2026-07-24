import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import avatarImg from "@assets/IMG_20260326_091340_948_1782691806785.jpg";
import iconRecords from "@assets/mine-mod-records-DgHXSKa1_1782689837747.png";
import iconGift from "@assets/téléchargement_(66)_1782689859239.png";
import iconAbout from "@assets/mine-mod-aboutus-xnaBhqOq_1782689895455.png";
import iconCS from "@assets/mine-mod-cs-DtBQ0Sp0_1782689895410.png";
import iconWithdraw from "@assets/withdraw-icon-DFsum39V_(1)_1782689895379.png";
import iconChangePwd from "@assets/mine-mod-change-pwd-D4tL_Aft_1782689895436.png";
import iconWallet from "@assets/portefeuille-chaud-3d-icon-png-download-9878550_1783248791774.png";
import iconRevenu from "@assets/3309927_1783248791847.png";
import iconSalaire from "@assets/téléchargement_(63)_1783248791872.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits from "@assets/2-1_1783245823825.png";

const BLUE_FILTER = "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1200%) hue-rotate(188deg) brightness(95%)";
const WHITE_FILTER = "brightness(0) invert(1)";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const { data: products } = useQuery<any[]>({
    queryKey: ["/api/user-products"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await apiRequest("POST", "/api/admin/verify-pin", { pin });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Code PIN incorrect");
      }
      return res.json();
    },
    onSuccess: () => {
      setShowPinModal(false);
      setAdminPin("");
      navigate("/admin");
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleAdminClick = () => {
    if (user?.isAdminPasswordRequired === false) {
      navigate("/admin");
      return;
    }
    setShowPinModal(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const totalEarnings = products?.reduce((sum: number, p: any) => sum + parseFloat(p.dailyIncome || "0"), 0) || 0;
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const phonePrefix = country?.phonePrefix || "";

  const gridItems = [
    { icon: iconRecharger, label: "Recharger", href: "/deposit", white: true },
    { icon: iconRetraits, label: "Retirer", href: "/withdrawal", white: true },
    { icon: iconRecords, label: "Facture", href: "/history", white: false },
    { icon: iconChangePwd, label: "Sécurité", href: "/change-password", white: false },
    { icon: iconGift, label: "Échangeur", href: "/gift-code", white: false },
    { icon: iconCS, label: "Service", href: "/service", white: false },
    { icon: iconAbout, label: "À propos", href: "/about", white: false },
    { icon: iconWithdraw, label: "Ma carte", href: "/wallet", white: false },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f0f2f5" }}>
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ── Blue top section ── */}
        <div style={{ background: "linear-gradient(160deg, #1565C0 0%, #1976D2 70%, #1E88E5 100%)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-2">
            <p className="text-white font-extrabold text-2xl">Moi</p>
            <img src={iconSalaire} alt="" className="w-8 h-8 object-contain" style={{ filter: WHITE_FILTER }} />
          </div>

          {/* Profile row */}
          <div className="flex items-center justify-between px-5 pt-2 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/40 shrink-0">
                <img src={avatarImg} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight" data-testid="text-phone">
                  {phonePrefix}{user.phone}
                </p>
                <p className="text-white/70 text-xs mt-0.5">ID : {user.referralCode}</p>
              </div>
            </div>
            <img src={iconWallet} alt="" className="w-16 h-16 object-contain" />
          </div>

          {/* Two balance cards */}
          <div className="px-4 pb-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl px-4 py-3.5" style={{ background: "rgba(255,255,255,0.18)" }}>
              <div className="flex items-center gap-2 mb-1">
                <img src={iconWallet} alt="" className="w-7 h-7 object-contain" />
              </div>
              <p className="text-white font-extrabold text-base leading-tight" data-testid="text-balance">
                {balance.toFixed(2)}
              </p>
              <p className="text-white/70 text-xs mt-0.5">Solde du compte</p>
            </div>
            <div className="rounded-2xl px-4 py-3.5" style={{ background: "rgba(255,255,255,0.18)" }}>
              <div className="flex items-center gap-2 mb-1">
                <img src={iconRevenu} alt="" className="w-7 h-7 object-contain" />
              </div>
              <p className="text-white font-extrabold text-base leading-tight" data-testid="text-earnings">
                {totalEarnings.toFixed(2)}
              </p>
              <p className="text-white/70 text-xs mt-0.5">Revenus({currency})</p>
            </div>
          </div>
        </div>

        {/* ── Récompense Salariale banner ── */}
        <div className="mx-4 mt-4">
          <button
            onClick={() => navigate("/salary-bonus")}
            className="w-full rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-transform"
            style={{ background: "linear-gradient(120deg, #FFF3CD 0%, #FFE0A0 50%, #FFD166 100%)" }}
            data-testid="button-salary-bonus"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex-1">
                <p className="font-extrabold text-base text-amber-900 leading-tight">
                  Récompense <span className="text-amber-700">Salariale</span>
                </p>
                <p className="font-extrabold text-base text-amber-900 leading-tight">Quotidienne</p>
                <p className="text-amber-700 text-xs mt-1.5">Plus vous invitez, plus vous recevez</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <img src={iconRevenu} alt="" className="w-10 h-10 object-contain" />
                <span className="text-xs font-bold text-amber-800 whitespace-nowrap">Vérifiez les détails &gt;&gt;</span>
              </div>
            </div>
          </button>
        </div>

        {/* ── Fonctions communes ── */}
        <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest px-5 pt-4 pb-3">
            Fonctions communes
          </p>
          <div className="grid grid-cols-4 gap-0 px-2 pb-4">
            {gridItems.map((item, idx) => (
              <Link href={item.href} key={idx}>
                <button
                  className="flex flex-col items-center gap-1.5 py-3 w-full active:bg-gray-50 rounded-xl"
                  data-testid={`button-grid-${idx}`}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)" }}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-6 h-6 object-contain"
                      style={{ filter: item.white ? WHITE_FILTER + " " + BLUE_FILTER : BLUE_FILTER }}
                    />
                  </div>
                  <span className="text-gray-700 text-[10px] font-medium text-center leading-tight">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Déconnexion ── */}
        <div className="mx-4 mt-3">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl text-sm font-bold border-2 border-[#1565C0] text-[#1565C0] bg-white active:bg-blue-50"
            data-testid="button-logout"
          >
            Déconnexion
          </button>
        </div>

        {/* ── Admin button ── */}
        {user.isAdmin && (
          <div className="mx-4 mt-3 mb-4">
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #003366, #002244)" }}
              data-testid="button-admin"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">Panel Admin</span>
            </button>
          </div>
        )}

      </div>

      {/* ── Admin PIN modal ── */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Code d'accès administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Entrez votre code PIN pour accéder au panel administrateur
            </p>
            <Input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="Code PIN"
              className="text-center text-2xl tracking-widest"
              maxLength={8}
              data-testid="input-admin-pin"
            />
            <Button
              onClick={() => {
                if (adminPin.length < 4) {
                  toast({ title: "Le code PIN doit contenir au moins 4 caractères", variant: "destructive" });
                  return;
                }
                verifyPinMutation.mutate(adminPin);
              }}
              disabled={verifyPinMutation.isPending || adminPin.length < 4}
              className="w-full"
              style={{ backgroundColor: "#1565C0" }}
              data-testid="button-verify-pin"
            >
              {verifyPinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
