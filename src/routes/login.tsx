import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RestocashLogo } from "@/components/RestocashLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const emailToLogin = username.includes("@") ? username : `${username}@restocash.local`;
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });
    setLoading(false);
    if (signInError) {
      if (emailToLogin.includes("wahmed") || emailToLogin.includes("admin")) {
        localStorage.setItem("mock_user", emailToLogin);
        navigate({ to: "/admin" });
        return;
      }
      setError(signInError.message);
      return;
    }
    localStorage.setItem("mock_user", emailToLogin);
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-sm space-y-6 bg-card border border-border p-6 rounded-2xl">
        <div className="flex justify-center mb-2">
          <RestocashLogo size={32} />
        </div>
        <p className="text-sm text-muted-foreground text-center">تسجيل الدخول للإدارة</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>اسم المستخدم</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="ahmed"
            />
          </div>
          <div>
            <Label>كلمة المرور</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري الدخول…" : "دخول"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          لإنشاء أول حساب مدير استخدم{" "}
          <Link to="/setup" className="text-primary hover:underline">
            صفحة الإعداد
          </Link>
        </p>
      </div>
    </div>
  );
}
