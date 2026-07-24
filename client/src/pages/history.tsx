import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

import nodataImg from "@assets/nodata-da225bbb_(1)_1783249133513.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits from "@assets/2-1_1783245823825.png";

interface Deposit {
  id: number;
  userId: number;
  amount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  soleaspayReference?: string;
  soleaspayOrderId?: string;
  omnipayId?: string;
  omnipayReference?: string;
}

interface Withdrawal {
  id: number;
  userId: number;
  amount: string;
  netAmount: string;
  status: string;
  createdAt: string;
}

const BG = "linear-gradient(160deg, #1565C0 0%, #1976D2 70%, #1E88E5 100%)";

export default function HistoryPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";

  const { data: deposits = [], isLoading: depositsLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits/history"],
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/history"],
  });

  const getStatusLabel = (status: string, type: "deposit" | "withdrawal") => {
    switch (status) {
      case "completed":
      case "approved":
        return type === "deposit" ? "Succès du dépôt" : "Succès du retrait";
      case "rejected":
        return "Échec";
      case "processing":
        return "En traitement";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "#00BCD4";
      case "rejected":
        return "#EF4444";
      default:
        return "#F59E0B";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  };

  const getReference = (deposit: Deposit) => {
    if (deposit.omnipayReference) return deposit.omnipayReference;
    if (deposit.omnipayId) return deposit.omnipayId;
    if (deposit.soleaspayReference) return deposit.soleaspayReference;
    if (deposit.soleaspayOrderId) return deposit.soleaspayOrderId;
    return `DEP${deposit.id.toString().padStart(10, "0")}`;
  };

  const isPendingDeposit = (deposit: Deposit) =>
    (deposit.status === "pending" || deposit.status === "processing") &&
    (deposit.soleaspayReference || deposit.soleaspayOrderId || deposit.omnipayId || deposit.omnipayReference);

  const handleVerify = async (depositId: number) => {
    setVerifyingId(depositId);
    try {
      const res = await fetch(`/api/deposits/${depositId}/verify`, { credentials: "include" });
      const data = await res.json();
      if (data.status === "approved") {
        toast({ title: "Paiement confirmé", description: "Votre compte a été crédité" });
        refreshUser();
        queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      } else if (data.status === "rejected") {
        toast({ title: "Paiement échoué", description: "Le paiement a été refusé", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      } else {
        toast({ title: "En cours", description: "Le paiement est toujours en attente" });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de vérifier le paiement", variant: "destructive" });
    } finally {
      setVerifyingId(null);
    }
  };

  if (!user) return null;

  const isLoading = activeTab === "deposits" ? depositsLoading : withdrawalsLoading;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>

      {/* ── Header ── */}
      <div className="flex items-center px-4 pt-6 pb-4 gap-3">
        <Link href="/account">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
        <p className="flex-1 text-center text-white font-extrabold text-lg pr-9">Détails</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-end px-8 gap-6 mb-4">
        <button
          onClick={() => setActiveTab("deposits")}
          className="pb-2 font-semibold text-base transition-all"
          style={{
            color: activeTab === "deposits" ? "#fff" : "rgba(255,255,255,0.55)",
            borderBottom: activeTab === "deposits" ? "3px solid #fff" : "3px solid transparent",
          }}
          data-testid="tab-deposits"
        >
          Recharger
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className="pb-2 font-semibold text-base transition-all"
          style={{
            color: activeTab === "withdrawals" ? "#fff" : "rgba(255,255,255,0.55)",
            borderBottom: activeTab === "withdrawals" ? "3px solid #fff" : "3px solid transparent",
          }}
          data-testid="tab-withdrawals"
        >
          Retirer
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : (activeTab === "deposits" ? deposits : withdrawals).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <img src={nodataImg} alt="Aucune donnée" className="w-28 h-28 object-contain opacity-90" />
            <p className="text-white/70 text-sm">Aucune transaction pour le moment</p>
          </div>
        ) : activeTab === "deposits" ? (
          deposits.map((deposit) => {
            const statusColor = getStatusColor(deposit.status);
            return (
              <div
                key={deposit.id}
                className="bg-white rounded-2xl shadow-sm px-4 py-3.5"
                data-testid={`deposit-item-${deposit.id}`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)" }}
                  >
                    <img src={iconRecharger} alt="" className="w-6 h-6 object-contain"
                      style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1200%) hue-rotate(188deg) brightness(95%)" }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-bold text-sm">Recharger</p>
                    <p className="text-xs mt-0.5" style={{ color: statusColor }}>
                      {getStatusLabel(deposit.status, "deposit")}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{formatDate(deposit.createdAt)}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ color: statusColor }}>
                      +{parseFloat(deposit.amount).toLocaleString()}{currency}
                    </p>
                  </div>
                </div>

                {isPendingDeposit(deposit) && (
                  <button
                    onClick={() => handleVerify(deposit.id)}
                    disabled={verifyingId === deposit.id}
                    className="mt-3 w-full py-2 text-white text-xs font-bold rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "#1976D2" }}
                    data-testid={`button-verify-${deposit.id}`}
                  >
                    {verifyingId === deposit.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <RefreshCw className="w-3.5 h-3.5" />}
                    Vérifier la transaction
                  </button>
                )}
              </div>
            );
          })
        ) : (
          withdrawals.map((withdrawal) => {
            const statusColor = getStatusColor(withdrawal.status);
            return (
              <div
                key={withdrawal.id}
                className="bg-white rounded-2xl shadow-sm px-4 py-3.5"
                data-testid={`withdrawal-item-${withdrawal.id}`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)" }}
                  >
                    <img src={iconRetraits} alt="" className="w-6 h-6 object-contain"
                      style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1200%) hue-rotate(188deg) brightness(95%)" }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-bold text-sm">Retirer</p>
                    <p className="text-xs mt-0.5" style={{ color: statusColor }}>
                      {getStatusLabel(withdrawal.status, "withdrawal")}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{formatDate(withdrawal.createdAt)}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ color: statusColor }}>
                      -{parseFloat(withdrawal.amount).toLocaleString()}{currency}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
