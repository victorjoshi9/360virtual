import "./globals.css";

export const metadata = {
  title: "360virtual Tour",
  description: "Mobile-first 360 virtual tour viewer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
