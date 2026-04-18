import { StarryButton } from "@/components/ui/liquid-glass-button";
import JoinUsBackground from "./JoinUsBackground";
import { MagneticText } from "@/components/ui/magnetic-text";

export default function Contact() {
  const handleDiscord = () => {
    window.open("https://discord.gg/zG3nPd9vU6", "_blank");
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center" id="contact">
      <JoinUsBackground />

      <div className="container relative z-10">
        <div className="section-header">
          <span className="section-label">Contact</span>
          <div className="flex justify-center mt-4">
            <MagneticText
              text={"READY FOR\nTAKEOFF?"}
              hoverText={"JOIN US\nNOW"}
              className="mb-10"
            />
          </div>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          marginTop: "3rem"
        }}>
          <StarryButton onClick={handleDiscord}>
            Discord Server
          </StarryButton>
        </div>
      </div>
    </section>
  );
}

