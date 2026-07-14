import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex justify-center w-full">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            card: "shadow-none bg-transparent border-0 w-full",
            headerTitle: "font-display text-text-primary",
            headerSubtitle: "text-text-secondary",
            socialButtonsBlockButton: "border-border-strong text-text-primary hover:bg-bg-subtle",
            formFieldLabel: "text-text-secondary font-medium",
            formFieldInput: "bg-bg-base border-border text-text-primary focus:border-orange",
            formButtonPrimary: "bg-orange hover:bg-orange-hover text-orange-btn-text font-bold"
          }
        }}
      />
    </div>
  )
}
