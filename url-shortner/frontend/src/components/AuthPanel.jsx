import { useState } from "react";
import "./AuthPanel.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, body) {
  const response = await fetch(`${API_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function AuthPanel({ session, onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (needsVerification) {
        const data = await request("verify-otp", { email, code });
        onAuth(data);
        return;
      }

      if (mode === "register") {
        const data = await request("register", { name, email, password });
        setNeedsVerification(true);
        setMessage(data.message);
      } else {
        const data = await request("login", { email, password });
        onAuth(data);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError("");
    setMessage("");
    try {
      const data = await request("resend-otp", { email });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (session) {
    return (
      <div className="auth-panel auth-session">
        <span>Signed in as {session.user.email}</span>
        <button type="button" onClick={() => onAuth(null)}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <section className="auth-panel">
      <div className="auth-tabs">
        <button
          type="button"
          className={mode === "login" && !needsVerification ? "active" : ""}
          onClick={() => {
            setMode("login");
            setNeedsVerification(false);
            setError("");
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={mode === "register" && !needsVerification ? "active" : ""}
          onClick={() => {
            setMode("register");
            setNeedsVerification(false);
            setError("");
          }}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {needsVerification ? (
          <>
            <p className="auth-prompt">
              Enter the 6-digit code sent to {email}.
            </p>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              maxLength={6}
              placeholder="Verification code"
              aria-label="Verification code"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify email"}
            </button>
            <button type="button" className="auth-link" onClick={resendCode}>
              Resend code
            </button>
          </>
        ) : (
          <>
            {mode === "register" && (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                aria-label="Your name"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (8+ characters)"
              aria-label="Password"
              minLength={8}
              required
            />
            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Send verification code"}
            </button>
          </>
        )}
      </form>

      {message && <p className="auth-message">{message}</p>}
      {error && <p className="auth-error">{error}</p>}
    </section>
  );
}

export default AuthPanel;
