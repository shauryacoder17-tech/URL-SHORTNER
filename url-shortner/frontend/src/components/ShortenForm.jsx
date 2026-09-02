import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./ShortenForm.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function isLikelyUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function ShortenForm() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setCopied(false);
    setShowQr(false);

    if (!isLikelyUrl(longUrl)) {
      setStatus("error");
      setErrorMessage("Enter a full link, starting with https://");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: longUrl }),
      });

      if (!response.ok) {
        throw new Error("The server could not shorten this link.");
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Is the backend running?"
          : err.message,
      );
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="shorten">
      <form className="shorten-form" onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="url"
          placeholder="https://your-long-link.com/goes-here"
          value={longUrl}
          onChange={(event) => setLongUrl(event.target.value)}
          aria-label="Long URL to shorten"
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Shortening…" : "Shorten"}
        </button>
      </form>

      {status === "error" && <p className="shorten-error">{errorMessage}</p>}

      {shortUrl && (
        <>
          <div className="shorten-result">
            <span className="shorten-result-url">{shortUrl}</span>
            <div className="shorten-result-actions">
              <button
                type="button"
                onClick={() => setShowQr((value) => !value)}
                className="copy-btn"
              >
                {showQr ? "Hide QR" : "QR code"}
              </button>
              <button type="button" onClick={handleCopy} className="copy-btn">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {showQr && (
            <div className="qr-panel">
              <QRCodeSVG value={shortUrl} size={144} level="M" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ShortenForm;
