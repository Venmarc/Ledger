import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Sign up',
}

export default function SignUpPage() {
  return (
    <div className="flex justify-center w-full">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
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
