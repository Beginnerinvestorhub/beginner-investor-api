import AuthForm from '../components/AuthForm'

export const metadata = {
  title: 'Login | Beginner Investor Hub',
  description: 'Login to access your personalized investment dashboard and tools.'
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1 items-center justify-center px-6 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <section className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
          <h1 className="mb-6 text-3xl font-extrabold text-center text-indigo-800">
            Welcome Back
          </h1>
          <p className="mb-8 text-sm text-center text-indigo-600">
            Log in to your account to access your personalized investment dashboard.
          </p>
          <AuthForm mode="login" />
        </section>
      </main>
    </div>
  )
}