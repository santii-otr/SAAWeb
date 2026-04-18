import { StarryButton } from "@/components/ui/liquid-glass-button";

export default function Contact() {
  const handleWhatsApp = () => {
    window.open("https://wa.me/524426314607", "_blank");
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Contacto</span>
          <h2 className="section-title">¿Listo para despegar?</h2>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          marginTop: "3rem"
        }}>
          <p style={{
            color: "var(--saa-text-muted)",
            maxWidth: "600px",
            textAlign: "center",
            fontSize: "1.1rem"
          }}>
            Estamos listos para llevar tu proyecto al siguiente nivel. Haz clic para contactarnos vía WhatsApp.
          </p>

          <StarryButton onClick={handleWhatsApp}>
            Contactar por WhatsApp
          </StarryButton>
        </div>
      </div>
    </section>
  );
}

