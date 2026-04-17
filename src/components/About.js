export default function About() {
  return (
    <section className="section section-light" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Label</span>
          <h2 className="section-title">Section Title</h2>
        </div>

        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <p style={{ color: "var(--saa-text-muted)", lineHeight: "1.8" }}>
            Small example description text for this section.
          </p>
        </div>
      </div>
    </section>
  );
}
