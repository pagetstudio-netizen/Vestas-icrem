import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FALLBACK_COUNTRIES, type ApiCountry } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2 } from "lucide-react";
import intelLogo from "@assets/vestas-logo_1783210030332.png";

const registerSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(6, "Au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const params = new URLSearchParams(searchString);
  const refCode = params.get("money") || params.get("reg") || "";

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "",
      country: "TD",
      password: "",
      confirmPassword: "",
      invitationCode: refCode,
    },
  });

  const { data: apiCountries } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const selectedCountry = form.watch("country");

  useEffect(() => {
    if (!apiCountries || apiCountries.length === 0) return;
    const isValid = apiCountries.some(ac => ac.code === selectedCountry && ac.isActive);
    if (!isValid) {
      const first = apiCountries.find(ac => ac.isActive);
      if (first) form.setValue("country", first.code);
    }
  }, [apiCountries, selectedCountry, form]);

  const countryData = (() => {
    if (apiCountries && apiCountries.length > 0) {
      const c = apiCountries.find(ac => ac.code === selectedCountry && ac.isActive);
      if (c) return { phonePrefix: c.phonePrefix, name: c.name };
      return null;
    }
    const f = FALLBACK_COUNTRIES.find(fc => fc.code === selectedCountry);
    return f ? { phonePrefix: f.phonePrefix, name: f.name } : null;
  })();

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await register({
        fullName: `User_${data.phone}`,
        phone: data.phone,
        country: data.country,
        password: data.password,
        invitationCode: data.invitationCode,
      });
      toast({ title: "Inscription réussie !", description: "Bienvenue sur Vestas !" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur d'inscription", description: error.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d1b2e" }}
    >
      <div className="flex-1 flex flex-col px-6 pt-14 pb-10 overflow-y-auto">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src={intelLogo} alt="Vestas" className="w-28 h-28 object-contain" />
        </div>

        {/* Fields */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input type="hidden" {...form.register("country")} />

          {/* Sélectionner pays */}
          <button
            type="button"
            onClick={() => setCountryModalOpen(true)}
            className="w-full h-14 bg-white rounded-lg flex items-center px-4 text-left"
            data-testid="button-select-country"
          >
            <span className="text-gray-500 text-base flex-1">
              {countryData ? `${countryData.name} (+${countryData.phonePrefix})` : "Sélectionnez votre pays >>"}
            </span>
          </button>
          {form.formState.errors.country && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.country.message}</p>
          )}

          {/* Numéro de téléphone */}
          <div className="w-full h-14 bg-white rounded-lg flex items-center px-4">
            <input
              {...form.register("phone")}
              type="tel"
              placeholder="Saisissez votre numéro de mobile"
              className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
              data-testid="input-phone"
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.phone.message}</p>
          )}

          {/* Mot de passe */}
          <div className="w-full h-14 bg-white rounded-lg flex items-center px-4">
            <input
              {...form.register("password")}
              type="password"
              placeholder="Mot de passe de connexion"
              className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
              data-testid="input-password"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.password.message}</p>
          )}

          {/* Confirmer mot de passe */}
          <div className="w-full h-14 bg-white rounded-lg flex items-center px-4">
            <input
              {...form.register("confirmPassword")}
              type="password"
              placeholder="Répéter le mot de passe"
              className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
              data-testid="input-confirm-password"
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.confirmPassword.message}</p>
          )}

          {/* Code d'invitation */}
          <div className="w-full h-14 bg-white rounded-lg flex items-center px-4">
            <input
              {...form.register("invitationCode")}
              placeholder="Code d'invitation"
              className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
              data-testid="input-invitation-code"
            />
          </div>

          {/* Bouton inscription */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full text-white font-bold text-base disabled:opacity-50 mt-4"
            style={{ background: "#0a1628", border: "2px solid #2a4a7f" }}
            data-testid="button-register"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Inscription...
              </span>
            ) : "Créez un compte dès maintenant"}
          </button>

          {/* Lien connexion */}
          <div className="text-center mt-4 pb-4">
            <span className="text-white/70 text-sm">J'ai déjà créé un compte,  </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-white font-bold text-sm underline"
              data-testid="link-login"
            >
              Je vais me connecter maintenant.
            </button>
          </div>
        </form>
      </div>

      <CountrySelector
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
      />
    </div>
  );
}
