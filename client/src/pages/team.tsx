import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { useLocation } from "wouter";
import { Copy } from "lucide-react";

import lv1Img from "@assets/vestas_112v_closeup_(1)_1783210181118.jpg";
import lv2Img from "@assets/vestas_112v_closeup_(2)_1783210180090.jpg";
import teamIcon from "@assets/1244758_1783246767217.png";

interface TeamStats {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalCommission: number;
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: stats } = useQuery<TeamStats>({
    queryKey: ["/api/team/stats"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency = countryInfo?.currency || "FCFA";
  const referralLink = `${window.location.origin}/rejoindre?money=${user.referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast({ title: "Code copié !" });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copié !" });
  };

  const lv1Rate = settings?.level1Commission || "27";
  const lv2Rate = settings?.level2Commission || "2";
  const lv3Rate = settings?.level3Commission || "1";

  const vipRows = [
    {
      label: "VIP1",
      commission: `${lv1Rate}%`,
      users: stats?.level1Count || 0,
      rewards: (stats?.level1Commission || 0).toFixed(0),
    },
    {
      label: "VIP2",
      commission: `${lv2Rate}%`,
      users: stats?.level2Count || 0,
      rewards: (stats?.level2Commission || 0).toFixed(0),
    },
    {
      label: "VIP3",
      commission: `${lv3Rate}%`,
      users: stats?.level3Count || 0,
      rewards: (stats?.level3Commission || 0).toFixed(0),
    },
  ];

  return (
    <div className="flex flex-col min-h-full pb-24" style={{ background: "#F0F2F5" }}>

      {/* ── Mon équipe header ── */}
      <div className="bg-white px-4 pt-5 pb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img
            src={teamIcon}
            alt="équipe"
            className="w-7 h-7 object-contain"
            style={{ filter: "brightness(0) saturate(100%)" }}
          />
          <p className="text-gray-900 font-extrabold text-lg">Mon équipe</p>
        </div>
        <button
          onClick={() => navigate("/salary-bonus")}
          className="px-4 py-2 rounded-full text-white text-xs font-bold"
          style={{ background: "linear-gradient(90deg, #003087, #0047AB)" }}
          data-testid="button-centre-taches"
        >
          Aller au Centre des Tâches &gt;
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── VIP table ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-4 px-4 py-2 border-b border-gray-100">
            <div />
            <p className="text-gray-400 text-xs text-center">Commission</p>
            <p className="text-gray-400 text-xs text-center">Utilisateurs</p>
            <p className="text-gray-400 text-xs text-center">Récompenses</p>
          </div>

          {vipRows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-4 items-center px-4 py-3 border-b border-gray-50 last:border-0"
              data-testid={`vip-row-${idx + 1}`}
            >
              {/* VIP badge */}
              <div
                className="w-14 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #003087, #0047AB)" }}
              >
                <span className="text-white font-extrabold text-sm">{row.label}</span>
              </div>
              <p className="text-gray-800 font-bold text-sm text-center">{row.commission}</p>
              <p className="text-gray-800 font-bold text-sm text-center">{row.users}</p>
              <p className="text-gray-800 font-bold text-sm text-center">{row.rewards}</p>
            </div>
          ))}
        </div>

        {/* ── Inviter des amis ── */}
        <div className="rounded-2xl overflow-hidden shadow-sm">
          {/* Purple header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: "linear-gradient(90deg, #003087, #0047AB)" }}
          >
            <img
              src={teamIcon}
              alt=""
              className="w-5 h-5 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="text-white font-extrabold text-base">Inviter des amis</p>
          </div>

          {/* Content */}
          <div className="bg-white px-4 py-4 space-y-3">
            {/* Code row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-bold text-sm truncate" data-testid="text-referral-code">
                  {user.referralCode}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">Code d'invitation</p>
              </div>
              <button
                onClick={copyCode}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold shrink-0 flex items-center gap-1"
                style={{ background: "linear-gradient(90deg, #003087, #0047AB)" }}
                data-testid="button-copy-code"
              >
                <Copy className="w-3 h-3" />
                COPIER
              </button>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Link row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 text-xs truncate" data-testid="text-referral-link">
                  {referralLink}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">Lien d'invitation</p>
              </div>
              <button
                onClick={copyLink}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold shrink-0 flex items-center gap-1"
                style={{ background: "linear-gradient(90deg, #003087, #0047AB)" }}
                data-testid="button-copy-link"
              >
                <Copy className="w-3 h-3" />
                COPIER
              </button>
            </div>
          </div>
        </div>

        {/* ── Ma progression ── */}
        <div className="rounded-2xl overflow-hidden shadow-sm">
          {/* Purple header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: "linear-gradient(90deg, #003087, #0047AB)" }}
          >
            <span className="text-white text-base">✦</span>
            <p className="text-white font-extrabold text-base">Ma progression</p>
          </div>

          {/* Two image cards */}
          <div className="bg-white px-3 py-3 grid grid-cols-2 gap-3">

            {/* Card Lv1 */}
            <div className="relative rounded-2xl overflow-hidden" style={{ height: 160 }} data-testid="card-progress-lv1">
              <img src={lv1Img} alt="Lv1" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(91,33,182,0.85) 0%, rgba(0,0,0,0.1) 60%)" }} />
              <div className="absolute inset-0 p-3 flex flex-col justify-between">
                <span className="text-white font-extrabold text-xs bg-blue-900/60 px-2 py-0.5 rounded-full w-fit">VIP1</span>
                <div>
                  <p className="text-white font-extrabold text-2xl leading-none">{lv1Rate}%</p>
                  <p className="text-white/80 text-xs">Commission</p>
                  <div className="flex justify-between mt-1">
                    <div>
                      <p className="text-white font-bold text-sm" data-testid="text-level1-count">{stats?.level1Count || 0}</p>
                      <p className="text-white/70 text-[10px]">Membres</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-300 font-bold text-xs" data-testid="text-level1-commission">
                        {(stats?.level1Commission || 0).toFixed(0)} {currency}
                      </p>
                      <p className="text-white/70 text-[10px]">Récompenses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Lv2 + Lv3 stacked */}
            <div className="flex flex-col gap-3">
              {/* Lv2 */}
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 74 }} data-testid="card-progress-lv2">
                <img src={lv2Img} alt="Lv2" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "rgba(91,33,182,0.65)" }} />
                <div className="absolute inset-0 p-2.5 flex flex-col justify-between">
                  <span className="text-white font-extrabold text-xs">VIP2</span>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white font-extrabold text-lg leading-none">{lv2Rate}%</p>
                      <p className="text-white/70 text-[10px]">Commission</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xs" data-testid="text-level2-count">{stats?.level2Count || 0}</p>
                      <p className="text-white/70 text-[10px]">Membres</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lv3 */}
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 74 }} data-testid="card-progress-lv3">
                <img src={lv1Img} alt="Lv3" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "rgba(124,58,237,0.65)" }} />
                <div className="absolute inset-0 p-2.5 flex flex-col justify-between">
                  <span className="text-white font-extrabold text-xs">VIP3</span>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white font-extrabold text-lg leading-none">{lv3Rate}%</p>
                      <p className="text-white/70 text-[10px]">Commission</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xs" data-testid="text-level3-count">{stats?.level3Count || 0}</p>
                      <p className="text-white/70 text-[10px]">Membres</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Info ── */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-4 text-sm text-gray-600 leading-relaxed space-y-2">
          <p>Invitez un ami → il investit → vous recevez <span className="font-bold text-[#003087]">{lv1Rate}%</span> de son investissement.</p>
          <p>Niveau 2 : <span className="font-bold text-[#003087]">{lv2Rate}%</span> — Niveau 3 : <span className="font-bold text-[#003087]">{lv3Rate}%</span></p>
        </div>

      </div>
    </div>
  );
}
