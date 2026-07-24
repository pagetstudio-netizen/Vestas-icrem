import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center px-4 py-3 border-b bg-white">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        </Link>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">A propos de nous</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#003366]">Qui sommes-nous ?</h2>
          <p className="text-gray-600 leading-relaxed">
            Vestas est le leader mondial du secteur de l'énergie éolienne. L'entreprise conçoit, fabrique, installe et entretient des éoliennes terrestres (onshore) et en mer (offshore) dans le monde entier.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Grâce à notre expertise et à notre réseau mondial, nous offrons à nos utilisateurs des opportunités uniques de générer des revenus quotidiens en participant au financement et à l'expansion de la marque Vestas à l'échelle internationale.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#003366]">🏭 Fabrication et Installation</h2>
          <p className="text-gray-600 leading-relaxed">
            <strong>Conception d'éoliennes :</strong> Développement de turbines de haute technologie adaptées à différents climats et conditions de vent. Vestas produit industriellement les pales, les nacelles et les composants clés de chaque éolienne.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#003366]">Notre héritage</h2>
          <p className="text-gray-600 leading-relaxed">
            Aujourd'hui, Vestas est présente dans plus de 80 pays avec des milliers d'éoliennes installées à travers le monde, devenant ainsi la marque référence de l'énergie renouvelable à l'échelle internationale.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#003366]">Sécurité et Fiabilité</h2>
          <p className="text-gray-600 leading-relaxed">
            La sécurité de vos fonds et la transparence de nos opérations sont nos priorités absolues. L'empreinte de Vestas dans le domaine de l'énergie éolienne illustre parfaitement la capacité d'une entreprise à conjuguer qualité, innovation et stratégie de marque pérenne.
          </p>
        </div>
      </div>
    </div>
  );
}
