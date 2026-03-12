import { SignUpForm } from "@/components/forms/sign-up-form";

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <SignUpForm nextPath={resolvedSearchParams.next} />
    </div>
  );
}
