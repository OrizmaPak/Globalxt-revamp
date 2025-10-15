import { useEffect, useRef, useState } from "react";

const StatsAdmin = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [overlayNeeded, setOverlayNeeded] = useState(false);

  useEffect(() => {
    const delays = [0, 100, 300, 700, 1200];

    const tryHide = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      try {
        const doc =
          (iframe as HTMLIFrameElement).contentDocument ||
          (iframe as HTMLIFrameElement).contentWindow?.document;
        if (!doc) throw new Error("no doc");
        const el = doc.querySelector(".navbar") as HTMLElement | null;
        if (el) {
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("height", "0px", "important");
        }
      } catch (err) {
        // cross-origin or not ready -> use overlay fallback
        setOverlayNeeded(true);
      }
    };

    delays.forEach((d) => setTimeout(tryHide, d));

    // optional: ask the iframe to hide its navbar if it listens
    setTimeout(() => {
      try {
        iframeRef.current?.contentWindow?.postMessage({ type: "HIDE_NAVBAR" }, "https://counter.dev");
      } catch {}
    }, 400);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <iframe
        ref={iframeRef}
        src="https://counter.dev/dashboard.html?user=globalxt&token=THfCiQepV94%3D"
        title="Analytics"
        style={{ width: "100%", height: "80vh", border: "none", display: "block" }}
      />
      {overlayNeeded && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 72, // adjust if navbar is taller
            background: "white",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

export default StatsAdmin;
