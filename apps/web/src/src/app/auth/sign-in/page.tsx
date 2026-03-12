import { SignInForm } from "@/components/forms/sign-in-form";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <SignInForm
        nextPath={resolvedSearchParams.next}
        authErrorCode={resolvedSearchParams.error}
      />
    </div>
  );
}
