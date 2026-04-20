/**
 * Page de sélection des scénarios — aide à comparer les 3 versions
 */
import { useNavigate } from "react-router-dom";
import { ArrowRight, Layers, BarChart2, Sparkles } from "lucide-react";

const SCENARIOS = [
  {
    route: "/newsletter-dashboard-a",
    letter: "A",
    title: "Le Rapport Annuel",
    subtitle: "Style Magazine Éditorial",
    description: "Mise en page inspirée des rapports HubSpot & UNICEF. Onglets piliers, grille d'événements magazine, résumé mensuel dépliable.",
    icon: Layers,
    accent: "#FFB476",
    accentBg: "rgba(255,180,118,0.1)",
    tags: ["Magazine", "Grille événements", "Onglets piliers"],
    preview: ["Hero éditorial avec statistiques", "3 onglets KPI (Business / Collaborateurs / ESG)", "Grille magazine multi-colonnes d'événements", "Sélecteur mensuel avec révélation animée"],
  },
  {
    route: "/newsletter-dashboard-b",
    letter: "B",
    title: "L'Observatoire",
    subtitle: "Style Intelligence Dashboard",
    description: "Chiffres géants centrés façon Accenture. Panneaux accordéon par pilier, timeline horizontale cliquable mois par mois.",
    icon: BarChart2,
    accent: "#A78BFA",
    accentBg: "rgba(167,139,250,0.1)",
    tags: ["Données d'abord", "Chiffres géants", "Timeline"],
    preview: ["Centre : 1 465 collaborateurs avec anneaux de pulsation", "6 statistiques orbitales animées", "3 panneaux accordéon avec métriques détaillées", "Timeline horizontale — cliquer = détail du mois"],
  },
  {
    route: "/newsletter-dashboard-c",
    letter: "C",
    title: "Le Rapport Vivant",
    subtitle: "Style Living Report Animé",
    description: "Hero diagonal DXC, navigation collante par pilier, sections complètes et générateur mensuel avec effet machine à écrire.",
    icon: Sparkles,
    accent: "#F2805E",
    accentBg: "rgba(242,128,94,0.1)",
    tags: ["Animé", "Sections complètes", "Générateur IA"],
    preview: ["Hero diagonal split : sombre gauche / dégradé orange droite", "Onglets collants — navigation entre piliers", "Sections détaillées avec blocs de réalisations", "Générateur mensuel : clic → animation + effet machine à écrire"],
  },
];

export default function NewsletterShowcase() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100%", padding: "24px 28px", boxSizing: "border-box" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.scenario-card{animation:fadeUp 0.4s ease forwards;}.scenario-card:hover .arrow-btn{background:#F2805E!important;}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "rgba(255,180,118,0.1)", border: "1px solid rgba(255,180,118,0.25)", borderRadius: 999, marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFB476" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#FFB476", letterSpacing: 1.5, textTransform: "uppercase" }}>Comparaison des scénarios</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)", margin: "0 0 10px", letterSpacing: -1 }}>
          Choisissez votre <span style={{ color: "#FFB476" }}>Dashboard Newsletter</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto" }}>
          3 scénarios de design ont été créés à partir des données ONETEAM FY26. Testez chacun et gardez celui qui correspond le mieux à votre vision.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 32 }}>
        {SCENARIOS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.route} className="scenario-card"
              style={{ background: "var(--bg-surface)", border: `1px solid var(--border)`, borderRadius: 16, overflow: "hidden", animationDelay: `${i * 0.1}s`, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; e.currentTarget.style.borderColor = s.accent + "60"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
              onClick={() => navigate(s.route)}>

              {/* Top accent bar */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />

              <div style={{ padding: 24 }}>
                {/* Icon + letter */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: s.accentBg, border: `1px solid ${s.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={22} color={s.accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: s.accent, textTransform: "uppercase", letterSpacing: 1.5 }}>Scénario {s.letter}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.subtitle}</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 16px" }}>{s.description}</p>

                {/* Tags */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {s.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: s.accentBg, color: s.accent }}>{t}</span>
                  ))}
                </div>

                {/* Preview list */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  {s.preview.map((p, pi) => (
                    <div key={pi} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.accent, flexShrink: 0, marginTop: 6, opacity: 0.7 }} />
                      <span style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button className="arrow-btn" onClick={(e) => { e.stopPropagation(); navigate(s.route); }}
                  style={{ width: "100%", marginTop: 20, padding: "12px", background: s.accentBg, border: `1px solid ${s.accent}40`, borderRadius: 10, color: s.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}>
                  Voir le Scénario {s.letter} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div style={{ textAlign: "center", padding: "16px 24px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Toutes les données sont extraites du rapport FY26 (PDF ONETEAM + Journal des réalisations). Une fois votre choix fait, le scénario retenu remplacera la page actuelle.
        </span>
      </div>
    </div>
  );
}
