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
    marginBottom: 28,
    paddingBottom: 18,
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
  repoName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#111111", marginBottom: 4 },
  repoDesc: { fontSize: 11, color: "#737373", marginBottom: 24 },
  scoresRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  scoreCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    width: "18.5%",
    alignItems: "center",
  },
  scoreValue: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#111111", lineHeight: 1 },
  scoreSlash: { fontSize: 9, color: "#737373", marginBottom: 4 },
  scoreLabel: { fontSize: 8, color: "#737373", textAlign: "center" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  summaryText: { fontSize: 11, color: "#404040", lineHeight: 1.6 },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 7 },
  bullet: { color: "#10B981", fontSize: 13, marginRight: 8, lineHeight: 1.2 },
  itemText: { fontSize: 11, color: "#404040", flex: 1, lineHeight: 1.5 },
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

interface RepoAuditPDFProps {
  repoName: string;
  description: string | null;
  insights: {
    codeQualityScore: number;
    documentationScore: number;
    performanceScore: number;
    securityScore: number;
    readabilityScore: number;
    summary: string;
    highlights: string[];
    recommendations: string[];
    updatedAt?: Date | string;
  };
  generatedAt: string;
}

export function RepoAuditPDF({ repoName, description, insights, generatedAt }: RepoAuditPDFProps) {
  const scores = [
    { label: "Code Quality", value: insights.codeQualityScore },
    { label: "Documentation", value: insights.documentationScore },
    { label: "Performance", value: insights.performanceScore },
    { label: "Security", value: insights.securityScore },
    { label: "Readability", value: insights.readabilityScore },
  ];

  return (
    <Document
      title={`${repoName} — AI Audit Report`}
      author="DevTrack AI"
      subject="Repository Code Audit"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={s.brandDot} />
            <Text style={s.brandName}>DevTrack AI</Text>
          </View>
          <Text style={s.metaText}>AI Code Audit Report{"\n"}{generatedAt}</Text>
        </View>

        {/* Repo title */}
        <Text style={s.repoName}>{repoName}</Text>
        {description && <Text style={s.repoDesc}>{description}</Text>}

        {/* Score cards */}
        <View style={s.scoresRow}>
          {scores.map((sc) => (
            <View key={sc.label} style={s.scoreCard}>
              <Text style={s.scoreValue}>{sc.value}</Text>
              <Text style={s.scoreSlash}>/100</Text>
              <Text style={s.scoreLabel}>{sc.label}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <Text style={s.sectionTitle}>Analysis Summary</Text>
        <Text style={s.summaryText}>{insights.summary}</Text>

        {/* Highlights */}
        <Text style={s.sectionTitle}>Project Highlights</Text>
        {(insights.highlights as string[]).map((h, i) => (
          <View key={i} style={s.row}>
            <Text style={s.bullet}>✓</Text>
            <Text style={s.itemText}>{h}</Text>
          </View>
        ))}

        {/* Recommendations */}
        <Text style={s.sectionTitle}>AI Recommendations</Text>
        {(insights.recommendations as string[]).map((rec, i) => (
          <View key={i} style={s.row}>
            <Text style={{ ...s.bullet, color: "#3b82f6" }}>›</Text>
            <Text style={s.itemText}>{rec}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Powered by DevTrack AI — AI-powered repository analysis</Text>
          <Text style={s.footerText}>devtrack-ai.vercel.app</Text>
        </View>
      </Page>
    </Document>
  );
}
