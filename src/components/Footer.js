export default function Footer() {
  return (
    <footer className="footer" style={{ padding: "3rem 2rem", background: "var(--saa-navy-dark)" }}>
      <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.7)" }}>
        <p>&copy; {new Date().getFullYear()} Footer text.</p>
      </div>
    </footer>
  );
}
