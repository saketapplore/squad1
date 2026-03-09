export const metadata = {
  title: "SquadXP SDR Intel",
  description: "Sales Intelligence Engine for SquadXP SDR team",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0a0a0a" }}>
        {children}
      </body>
    </html>
  );
}
