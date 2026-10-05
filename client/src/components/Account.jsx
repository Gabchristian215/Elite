import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Alert, Button, Field, PageHeader, Panel } from "./ui.jsx";

export default function Account() {
  const { user, setSession } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  const update = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setStatus({ type: "error", text: "New passwords do not match." });
      return;
    }
    setBusy(true);
    setStatus({ type: "", text: "" });
    try {
      // the API issues a fresh token, since the old one is invalidated by the change
      setSession(await api.updatePassword(form.current, form.next));
      setForm({ current: "", next: "", confirm: "" });
      setStatus({ type: "success", text: "Password updated." });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <PageHeader title="Settings" subtitle="Manage your account." />

      <Panel className="max-w-[520px]">
        <h2 className="mb-4 font-semibold">Profile</h2>
        <dl className="grid grid-cols-[110px_1fr] gap-2">
          <dt className="text-muted">Username</dt><dd>{user.username}</dd>
          <dt className="text-muted">Email</dt><dd>{user.email}</dd>
          <dt className="text-muted">Role</dt><dd>{user.role}</dd>
        </dl>
      </Panel>

      <Panel as="form" className="max-w-[520px]" onSubmit={submit}>
        <h2 className="mb-4 font-semibold">Change password</h2>
        <Field label="Current password" type="password" value={form.current} onChange={update("current")} autoComplete="current-password" required />
        <Field label="New password" type="password" value={form.next} onChange={update("next")} autoComplete="new-password" required />
        <Field label="Confirm new password" type="password" value={form.confirm} onChange={update("confirm")} autoComplete="new-password" required />
        {status.text && <Alert type={status.type}>{status.text}</Alert>}
        <Button disabled={busy}>Update password</Button>
      </Panel>
    </section>
  );
}
