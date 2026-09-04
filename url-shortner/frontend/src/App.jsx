import { useRef, useState } from "react";
import AuthPanel from "./components/AuthPanel.jsx";
import ShortenForm from "./components/ShortenForm.jsx";
import StarField from "./components/StarField.jsx";
import "./App.css";

function App() {
  const cardRef = useRef(null);
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("url-shortener-token");
    const user = localStorage.getItem("url-shortener-user");
    return token && user ? { token, user: JSON.parse(user) } : null;
  });

  function handleAuth(nextSession) {
    if (!nextSession) {
      localStorage.removeItem("url-shortener-token");
      localStorage.removeItem("url-shortener-user");
      setSession(null);
      return;
    }

    localStorage.setItem("url-shortener-token", nextSession.token);
    localStorage.setItem(
      "url-shortener-user",
      JSON.stringify(nextSession.user),
    );
    setSession(nextSession);
  }

  function handleMouseMove(event) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  }

  return (
    <div className="page">
      <StarField />

      <header className="brand">
        <svg
          className="brand-mark"
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          role="presentation"
          aria-hidden="true"
        >
          <path
            d="M11 17L17 11"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M13.5 8.5L15 7C16.6569 5.34315 19.3431 5.34315 21 7C22.6569 8.65685 22.6569 11.3431 21 13L19.5 14.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M14.5 19.5L13 21C11.3431 22.6569 8.65685 22.6569 7 21C5.34315 19.3431 5.34315 16.6569 7 15L8.5 13.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="brand-name">URL Shortener Pro</span>
      </header>

      <main className="hero">
        <h1>Paste a long link, get a short one.</h1>
        <p className="subhead">
          Verify your email to keep every shortened link in your account.
        </p>

        <AuthPanel session={session} onAuth={handleAuth} />

        {session && (
          <div
            className="tilt-card"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <ShortenForm token={session.token} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
