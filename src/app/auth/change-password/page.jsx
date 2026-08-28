import { ChangePasswordForm } from "@/modules/auth/components/admin/change-password-form";

export default function ChangePassword() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ChangePasswordForm />
    </section>
  );
}
