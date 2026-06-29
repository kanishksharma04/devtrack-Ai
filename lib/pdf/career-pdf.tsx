import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 48,
    paddingVertical: 52,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  brandName: { fontSize: 12, color: "#10B981", fontFamily: "Helvetica-Bold" },
  metaText: { fontSize: 9, color: "#737373", textAlign: "right", lineHeight: 1.5 },
  heroScore: {
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  heroLeft: { flex: 1 },
  heroName: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#111111", marginBottom: 4 },
  heroRole: { fontSize: 13, color: "#10B981" },
  scoreBadge: { alignItems: "center" },
  scoreNum: { fontSize: 38, fontFamily: "Helvetica-Bold", color: "#10B981" },
  scoreLabel: { fontSize: 9, color: "#737373" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 7 },
  bullet: { color: "#10B981", fontSize: 13, marginRight: 8, lineHeight: 1.2 },
  itemText: { fontSize: 11, color: "#404040", flex: 1, lineHeight: 1.5 },
  recCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  recNum: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#10B981",
    marginRight: 10,
    minWidth: 18,
  },
  recText: { fontSize: 11, color: "#404040", flex: 1, lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 12,
  },
  footerText: { fontSize: 8, color: "#a3a3a3" },
});

interface CareerPDFProps {
  name: string;
  username: string;
  analysis: {
    primaryRole: string;
    careerLevel: string;
    overallScore: number;
    strengths: string[];
    weakAreas: string[];
    careerRecommendations: string[];
    updatedAt: Date | string;
  };
  generatedAt: string;
}

export function CareerPDF({ name, username, analysis, generatedAt }: CareerPDFProps) {
  return (
    <Document
      title={`${name} — Career Report`}
      author="DevTrack AI"
      subject="AI Career Analysis"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={s.brandDot} />
            <Text style={s.brandName}>DevTrack AI</Text>
          </View>
          <Text style={s.metaText}>Career Report{"\n"}@{username}{"\n"}{generatedAt}</Text>
        </View>

        {/* Hero card */}
        <View style={s.heroScore}>
          <View style={s.heroLeft}>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroRole}>
              {analysis.careerLevel} {analysis.primaryRole}
            </Text>
          </View>
          <View style={s.scoreBadge}>
            <Text style={s.scoreNum}>{analysis.overallScore}</Text>
            <Text style={s.scoreLabel}>Portfolio Score /100</Text>
          </View>
        </View>

        {/* Strengths */}
        <Text style={s.sectionTitle}>Core Strengths</Text>
        {(analysis.strengths as string[]).map((str, i) => (
          <View key={i} style={s.row}>
            <Text style={s.bullet}>✓</Text>
            <Text style={s.itemText}>{str}</Text>
          </View>
        ))}

        {/* Weak areas */}
        <Text style={s.sectionTitle}>Growth Areas</Text>
        {(analysis.weakAreas as string[]).map((w, i) => (
          <View key={i} style={s.row}>
            <Text style={{ ...s.bullet, color: "#f59e0b" }}>!</Text>
            <Text style={s.itemText}>{w}</Text>
          </View>
        ))}

        {/* Recommendations */}
        <Text style={s.sectionTitle}>AI Roadmap & Actionable Steps</Text>
        {(analysis.careerRecommendations as string[]).map((rec, i) => (
          <View key={i} style={s.recCard}>
            <Text style={s.recNum}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={s.recText}>{rec}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Powered by DevTrack AI — AI-powered developer portfolio analysis</Text>
          <Text style={s.footerText}>devtrack-ai.vercel.app/u/{username}</Text>
        </View>
      </Page>
    </Document>
  );
}
