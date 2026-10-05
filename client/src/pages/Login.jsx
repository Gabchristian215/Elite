import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Alert, Button, Field } from "../components/ui.jsx";

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const update = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) await signup(form.username.trim(), form.email.trim(), form.password);
      else await login(form.username.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-6 bg-[radial-gradient(ellipse_at_top,rgb(126_211_33/0.12),transparent_60%)]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] p-8 bg-surface border border-line rounded-[18px] shadow-[0_20px_60px_rgb(0_0_0/0.5)]"
      >
        <img src="/logo.png" alt="Elite" className="block size-24 mx-auto -mt-2 mb-2 rounded-2xl" />
        <h1 className="text-center text-[1.6rem] font-bold tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-center text-muted mb-6">
          {isSignup ? "Start tracking sealed product prices" : "Sign in to access your dashboard"}
        </p>

        <Field
          label="Username"
          value={form.username}
          onChange={update("username")}
          autoComplete="username"
          autoFocus
          required
        />
        {isSignup && (
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
            required
          />
        )}
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
        />

        {error && <Alert type="error">{error}</Alert>}

        <Button block disabled={submitting}>
          {submitting ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </Button>

        <p className="text-center mt-5 text-sm text-muted">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button type="button" onClick={switchMode} className="font-semibold text-accent cursor-pointer hover:underline">
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </form>
    </main>
  );
}
