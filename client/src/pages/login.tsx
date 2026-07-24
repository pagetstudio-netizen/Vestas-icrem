import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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

const loginSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const savedCredentials = typeof window !== "undefined" ? localStorage.getItem("vestas_credentials") : null;
  const parsedCredentials = savedCredentials ? JSON.parse(savedCredentials) : null;
  const [rememberMe, setRememberMe] = useState(!!parsedCredentials);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: parsedCredentials?.phone || "",
      country: parsedCredentials?.country || "TD",
      password: parsedCredentials?.password || "",
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

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      await login(data.phone, data.country, data.password);
      if (rememberMe) {
        localStorage.setItem("vestas_credentials", JSON.stringify({ phone: data.phone, country: data.country, password: data.password }));
      } else {
        localStorage.removeItem("vestas_credentials");
      }
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur de connexion", description: error.message || "Vérifiez vos informations", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d1b2e" }}
    >
      <div className="flex-1 flex flex-col px-6 pt-16 pb-10">

        {/* Logo */}
        <div className="flex justify-center mb-14">
          <img src={intelLogo} alt="Vestas" className="w-32 h-32 object-contain" />
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
              placeholder="Veuillez saisir votre mot de passe."
              className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
              data-testid="input-password"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-xs -mt-1 ml-1">{form.formState.errors.password.message}</p>
          )}

          {/* Se souvenir */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 accent-white"
              data-testid="checkbox-remember"
            />
            <label htmlFor="remember" className="text-white text-sm cursor-pointer">
              Se souvenir de mon mot de passe
            </label>
          </div>

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full text-white font-bold text-base disabled:opacity-50 mt-4"
            style={{ background: "#0a1628", border: "2px solid #2a4a7f" }}
            data-testid="button-login"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </span>
            ) : "Se connecter"}
          </button>

          {/* Lien inscription */}
          <div className="text-center mt-4">
            <span className="text-white/70 text-sm">Je n'ai pas de compte.  </span>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-white font-bold text-sm underline"
              data-testid="link-register"
            >
              Créer un compte
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
