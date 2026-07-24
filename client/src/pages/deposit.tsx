import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Info, Copy, CheckCircle, Upload, Phone, Loader2, ImageIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { COUNTRIES, type ApiCountry } from "@/lib/countries";
import type { PaymentNumber } from "@shared/schema";

export default function DepositPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"amount" | "select" | "form">("amount");
  const [selectedNumber, setSelectedNumber] = useState<PaymentNumber | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [amount, setAmount] = useState<number | "">("");
  const [senderPhone, setSenderPhone] = useState(user?.phone || "");
  const [screenshot, setScreenshot] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [reference, setReference] = useState("");

  const country = user?.country || "";

  const { data: apiCountries = [] } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const countryInfo = apiCountries.length > 0
    ? apiCountries.find(c => c.code === country && c.isActive)
    : COUNTRIES.find(c => c.code === country);
  const currency = countryInfo?.currency || "FCFA";

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "4000");

  const { data: paymentNumbersList = [], isLoading: numbersLoading } = useQuery<PaymentNumber[]>({
    queryKey: ["/api/payment-numbers", country],
    queryFn: async () => {
      const res = await fetch(`/api/payment-numbers?country=${country}`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    enabled: !!country,
  });

  const copyPhone = async (number: PaymentNumber) => {
    try {
      await navigator.clipboard.writeText(number.phone);
      setCopiedId(number.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({ title: "Numéro copié !", description: `${number.phone} copié dans le presse-papiers` });
    } catch {
      toast({ title: "Numéro: " + number.phone, description: "Copiez ce numéro manuellement" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fichier trop grand", description: "Maximum 5 Mo", variant: "destructive" });
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!selectedNumber) throw new Error("Aucun numéro sélectionné");
      const res = await apiRequest("POST", "/api/deposits", {
        amount: Number(amount),
        accountName: user?.fullName || "",
        accountNumber: senderPhone,
        paymentMethod: selectedNumber.operatorName,
        country,
        paymentNumberId: selectedNumber.id,
        channelName: `${selectedNumber.operatorName} - ${selectedNumber.phone}`,
        screenshot: screenshot || null,
        paymentMessage: paymentMessage || null,
        reference: reference || null,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Demande envoyée !", description: "Votre dépôt est en attente de validation par l'administrateur" });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      refreshUser();
      setStep("amount");
      setSelectedNumber(null);
      setAmount("");
      setSenderPhone(user?.phone || "");
      setScreenshot("");
      setScreenshotName("");
      setPaymentMessage("");
      setReference("");
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const handleAmountNext = () => {
    if (!amount || Number(amount) < MIN_DEPOSIT) {
      toast({
        title: "Montant invalide",
        description: `Le minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`,
        variant: "destructive",
      });
      return;
    }
    setStep("select");
  };

  const handleSubmit = () => {
    if (!senderPhone.trim()) {
      toast({ title: "Numéro requis", description: "Entrez le numéro depuis lequel vous avez payé", variant: "destructive" });
      return;
    }
    if (!screenshot) {
      toast({ title: "Capture requise", description: "Veuillez joindre la capture d'écran du paiement", variant: "destructive" });
      return;
    }
    depositMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">

      {/* ── STEP 1 : Saisir le montant ── */}
      {step === "amount" && (
        <>
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
            <Link href="/account">
              <button className="flex items-center gap-1 text-gray-800" data-testid="button-back">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-semibold text-base">Recharger</span>
              </button>
            </Link>
            <button
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              data-testid="button-info"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </header>

          <div className="px-4 pt-6 pb-10 space-y-6">
            {/* Label */}
            <div>
              <p className="text-gray-900 font-semibold text-sm mb-4">
                Montant de la recharge{" "}
                <span className="text-gray-500 font-normal">
                  (Minimum {MIN_DEPOSIT.toLocaleString()} {currency})
                </span>
              </p>

              {/* Input */}
              <div className="border border-gray-300 rounded-md flex items-center overflow-hidden">
                <span className="px-4 py-4 text-gray-800 font-semibold text-sm border-r border-gray-300 bg-white">
                  {currency}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Veuillez saisir le montant de la recharge"
                  className="flex-1 px-4 py-4 text-sm text-gray-400 outline-none bg-white placeholder:text-gray-400"
                  data-testid="input-deposit-amount"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleAmountNext}
              className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg"
              style={{
                background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #0a2e6e 100%)",
              }}
              data-testid="button-recharge-now"
            >
              Rechargez maintenant
            </button>

            {/* Info blocks */}
            <div className="space-y-5 pt-2">
              <p className="text-gray-700 text-sm leading-relaxed">
                Les services de dépôt sont disponibles 24h/24 et 7j/7. Le dépôt minimum est de{" "}
                <strong>{MIN_DEPOSIT.toLocaleString()} francs CFA</strong>, sans limite maximale.
              </p>

              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                <p>
                  Remarque importante : Ne divulguez à personne les captures d'écran de vos dépôts ni vos identifiants
                  de transaction, car cela pourrait entraîner le vol de vos fonds.
                </p>
                <p>
                  Pour tout problème lié à vos dépôts, veuillez contacter immédiatement le service client de la
                  plateforme.
                </p>
                <p>1. Le dépôt minimum est de {MIN_DEPOSIT.toLocaleString()} francs CFA.</p>
                <p>
                  2. Veuillez vérifier attentivement les informations de votre compte avant d'effectuer un transfert
                  afin d'éviter toute erreur de paiement.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── STEP 2 : Choisir un numéro ── */}
      {step === "select" && (
        <>
          <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
            <button
              className="flex items-center gap-1 text-gray-800"
              onClick={() => setStep("amount")}
              data-testid="button-back-to-amount"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-semibold text-base">Choisir un opérateur</span>
            </button>
            <Link href="/deposit-history">
              <button className="text-xs text-[#003366] font-semibold px-3 py-1.5 rounded-full border border-[#003366]" data-testid="button-history">
                Historique
              </button>
            </Link>
          </header>

          {/* Amount recap */}
          <div className="mx-4 mt-4 rounded-xl p-4 border border-blue-100 bg-blue-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Montant à déposer</p>
              <p className="text-xl font-bold text-[#003366]">
                {Number(amount).toLocaleString()} {currency}
              </p>
            </div>
            <button
              onClick={() => setStep("amount")}
              className="text-xs text-[#003366] underline"
              data-testid="button-change-amount"
            >
              Modifier
            </button>
          </div>

          <div className="p-4 space-y-3 pb-10">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Sélectionnez un numéro de paiement
            </p>

            {numbersLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
              </div>
            ) : paymentNumbersList.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun numéro disponible pour votre pays</p>
                <p className="text-xs mt-1">Contactez le support</p>
              </div>
            ) : (
              paymentNumbersList.map((num) => (
                <div
                  key={num.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  data-testid={`card-payment-number-${num.id}`}
                >
                  <div className="p-4 flex items-center gap-3">
                    {num.logoUrl ? (
                      <img src={num.logoUrl} alt={num.operatorName} className="w-12 h-12 rounded-xl object-contain border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-[#003366]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{num.operatorName}</p>
                      <p className="text-[#003366] font-mono font-bold text-lg">{num.phone}</p>
                      <p className="text-gray-500 text-xs">{num.ownerName}</p>
                    </div>
                    <button
                      onClick={() => copyPhone(num)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      data-testid={`button-copy-${num.id}`}
                    >
                      {copiedId === num.id
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <Copy className="w-5 h-5 text-[#003366]" />}
                    </button>
                  </div>
                  <button
                    onClick={() => { setSelectedNumber(num); setStep("form"); }}
                    className="w-full py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)" }}
                    data-testid={`button-select-${num.id}`}
                  >
                    J'ai envoyé l'argent sur ce numéro <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── STEP 3 : Formulaire de confirmation ── */}
      {step === "form" && selectedNumber && (
        <>
          <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
            <button
              className="flex items-center gap-1 text-gray-800"
              onClick={() => setStep("select")}
              data-testid="button-back-to-select"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-semibold text-base">Confirmer le paiement</span>
            </button>
          </header>

          <div className="p-4 space-y-4 pb-10">
            {/* Recap */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-center gap-3">
              {selectedNumber.logoUrl ? (
                <img src={selectedNumber.logoUrl} alt={selectedNumber.operatorName} className="w-10 h-10 rounded-lg object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-blue-100">
                  <Phone className="w-5 h-5 text-[#003366]" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-gray-500">Numéro destinataire</p>
                <p className="font-bold text-[#003366] text-sm">{selectedNumber.operatorName} — {selectedNumber.phone}</p>
                <p className="text-xs text-gray-500">{selectedNumber.ownerName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Montant</p>
                <p className="font-bold text-gray-800">{Number(amount).toLocaleString()} {currency}</p>
              </div>
            </div>

            {/* Sender phone */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Votre numéro payeur</p>
              <div className="border border-gray-300 rounded-md flex items-center overflow-hidden bg-white">
                <Phone className="w-4 h-4 text-gray-400 ml-4" />
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="Numéro depuis lequel vous avez payé"
                  className="flex-1 px-3 py-4 text-sm text-gray-700 outline-none bg-transparent"
                  data-testid="input-sender-phone"
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Référence / ID transaction{" "}
                <span className="text-gray-400 font-normal">(optionnel)</span>
              </p>
              <div className="border border-gray-300 rounded-md bg-white">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Numéro de référence de la transaction"
                  className="w-full px-4 py-4 text-sm text-gray-700 outline-none bg-transparent"
                  data-testid="input-reference"
                />
              </div>
            </div>

            {/* Payment message */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Message reçu après paiement{" "}
                <span className="text-gray-400 font-normal">(optionnel)</span>
              </p>
              <textarea
                value={paymentMessage}
                onChange={(e) => setPaymentMessage(e.target.value)}
                placeholder="Collez ici le SMS ou message de confirmation reçu..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 outline-none bg-white resize-none"
                data-testid="input-payment-message"
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Capture d'écran du paiement <span className="text-red-500">*</span>
              </p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" data-testid="input-screenshot" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl py-7 flex flex-col items-center gap-2 transition-colors ${
                  screenshot
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#003366] hover:bg-blue-50"
                }`}
                data-testid="button-upload-screenshot"
              >
                {screenshot ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <p className="text-sm font-medium text-green-600">{screenshotName}</p>
                    <p className="text-xs text-gray-400">Appuyez pour changer</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Appuyez pour ajouter la capture</p>
                    <p className="text-xs text-gray-400">JPG, PNG — max 5 Mo</p>
                  </>
                )}
              </button>
              {screenshot && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                  <img src={screenshot} alt="Capture" className="w-full max-h-52 object-contain bg-gray-50" />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={depositMutation.isPending}
              className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #0a2e6e 100%)",
              }}
              data-testid="button-submit-deposit"
            >
              {depositMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" /> Soumettre ma demande
                </span>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
