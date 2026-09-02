import ShortenForm from "./components/ShortenForm.jsx";
import "./App.css";

function App() {
  return (
    <div className="page">
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
          No sign-up. Your link stays live until you decide otherwise.
        </p>
        <ShortenForm />
      </main>
    </div>
  );
}

export default App;
