import Template from "@/components/layout/Template";
import { getUserOrRedirect } from "@/lib/auth/getAuth";
import AccountClient from "@/components/account/AccountClient";

export default async function AccountPage() {
  const { user } = await getUserOrRedirect();

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasSerper = Boolean(process.env.SERPER_API_KEY);

  return (
    <Template
      title="Account"
      subtitle="Profile, safety settings, and configuration status."
    >
      <AccountClient
        user={{
          id: user.id,
          email: user.email ?? "",
          created_at: (user as any).created_at ?? null,
          user_metadata: (user as any).user_metadata ?? {},
        }}
        config={{
          openaiConfigured: hasOpenAI,
          serperConfigured: hasSerper,
          model: process.env.OPENAI_MODEL ?? null,
        }}
      />
    </Template>
  );
}

