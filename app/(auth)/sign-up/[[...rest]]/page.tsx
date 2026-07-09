import { SignUp } from '@clerk/nextjs'
import { Logo } from '@/core/ui/Logo'

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      <Logo variant="full" tone="positive" size={32} />
      <SignUp />
    </main>
  )
}
