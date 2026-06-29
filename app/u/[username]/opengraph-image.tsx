import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { githubUsername: username },
    include: {
      portfolioAnalysis: true,
      codingAnalytics: true,
    },
  });

  const repoCount = user
    ? await prisma.repository.count({ where: { userId: user.id } })
    : 0;

  const isValid = user && user.isPublicProfile;
  const name = user?.name || username;
  const role = user?.portfolioAnalysis?.primaryRole;
  const level = user?.portfolioAnalysis?.careerLevel;
  const score = user?.portfolioAnalysis?.overallScore;
  const totalStars = user?.codingAnalytics?.totalStars ?? 0;
  const totalCommits = user?.codingAnalytics?.totalCommits ?? 0;
  const topLanguages = (
    (user?.codingAnalytics?.topLanguages as { name: string; percentage: number }[]) ?? []
  ).slice(0, 4);

  if (!isValid) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "1200px",
            height: "630px",
            backgroundColor: "#090909",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 52, color: "#ffffff", fontWeight: 700 }}>DevTrack AI</div>
          <div style={{ fontSize: 22, color: "#737373", marginTop: 16 }}>Profile not found</div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          backgroundColor: "#090909",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "52px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: "#10B981",
                marginRight: 12,
              }}
            />
            <span style={{ fontSize: 18, color: "#a3a3a3", fontWeight: 600, letterSpacing: "-0.3px" }}>
              DevTrack AI
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 14, color: "#525252" }}>devtrack-ai.vercel.app</span>
        </div>

        {/* Main row */}
        <div style={{ display: "flex", flex: 1, alignItems: "flex-start" }}>
          {/* Left: identity + meta */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 48 }}>
            {/* Avatar + name */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
              {user.image ? (
                  <img
                  src={user.image}
                  width={76}
                  height={76}
                  alt={name}
                  style={{ borderRadius: "50%", marginRight: 24 }}
                />
              ) : (
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    backgroundColor: "#1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 30,
                    color: "#a3a3a3",
                    fontWeight: 700,
                    marginRight: 24,
                  }}
                >
                  {name[0].toUpperCase()}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 46,
                    color: "#ffffff",
                    fontWeight: 700,
                    lineHeight: 1.05,
                    letterSpacing: "-1px",
                  }}
                >
                  {name.length > 22 ? name.slice(0, 22) + "…" : name}
                </span>
                <span style={{ fontSize: 18, color: "#737373", marginTop: 6 }}>
                  @{username}
                </span>
              </div>
            </div>

            {/* Career role */}
            {role && level && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    color: "#10B981",
                    fontWeight: 600,
                  }}
                >
                  {level} {role}
                </span>
              </div>
            )}

            {/* Languages */}
            {topLanguages.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                {topLanguages.map((lang, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 15,
                      color: "#a3a3a3",
                      backgroundColor: "#1a1a1a",
                      padding: "5px 14px",
                      borderRadius: 8,
                      marginRight: 10,
                      marginBottom: 8,
                    }}
                  >
                    {lang.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: score card + stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              minWidth: 210,
            }}
          >
            {score !== undefined && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#111111",
                  borderRadius: 20,
                  padding: "28px 40px",
                  marginBottom: 20,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{
                    fontSize: 66,
                    color: "#10B981",
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "-2px",
                  }}
                >
                  {score}
                </span>
                <span style={{ fontSize: 12, color: "#737373", marginTop: 8, letterSpacing: "0.5px" }}>
                  PORTFOLIO SCORE
                </span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 15, color: "#737373" }}>
                {repoCount} repos · {totalStars} stars
              </span>
              {totalCommits > 0 && (
                <span style={{ fontSize: 15, color: "#737373", marginTop: 4 }}>
                  {totalCommits.toLocaleString()} commits this year
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: 24,
            marginTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ fontSize: 13, color: "#525252" }}>
            AI-powered developer portfolio analysis
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 14, color: "#525252" }}>
            devtrack-ai.vercel.app/u/{username}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
