import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
    const router = useRouter()
    const { user, isAuthLoading, login, register } = useAuth()

    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [schoolName, setSchoolName] = useState('')
    const [secretaryName, setSecretaryName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [feedback, setFeedback] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isAuthLoading) return
        if (user) router.replace('/boletim')
    }, [isAuthLoading, router, user])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isSubmitting) return

        setIsSubmitting(true)
        setFeedback('')

        const result = mode === 'login'
            ? await login(email, password)
            : await register({
                email,
                schoolName,
                secretaryName,
                password,
                confirmPassword
            })

        if (!result.ok) {
            setFeedback(result.error || 'Nao foi possivel autenticar.')
            setIsSubmitting(false)
            return
        }

        setFeedback(mode === 'login' ? 'Login realizado com sucesso.' : 'Conta criada com sucesso.')
        router.replace('/boletim')
    }

    if (isAuthLoading || user) {
        return <main className='w-screen h-screen flex items-center justify-center'>Carregando...</main>
    }

    return (
        <main className='w-screen h-screen flex items-center justify-center p-4 bg-black text-white'>
            <section className='w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-6 flex flex-col gap-4'>
                <h1 className='text-2xl font-semibold text-center'>Boletim Escolar</h1>

                <div className='grid grid-cols-2 gap-2'>
                    <button
                        type='button'
                        onClick={() => setMode('login')}
                        className={`rounded-md py-2 transition-colors ${mode === 'login' ? 'bg-white text-black' : 'bg-zinc-800 text-white border border-zinc-700'}`}
                    >
                        Login
                    </button>
                    <button
                        type='button'
                        onClick={() => setMode('register')}
                        className={`rounded-md py-2 transition-colors ${mode === 'register' ? 'bg-white text-black' : 'bg-zinc-800 text-white border border-zinc-700'}`}
                    >
                        Cadastro
                    </button>
                </div>

                <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                    <input
                        type='email'
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        placeholder='E-mail'
                        className='w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-white'
                        required
                    />
                    {mode === 'register' && (
                        <>
                            <input
                                type='text'
                                value={schoolName}
                                onChange={event => setSchoolName(event.target.value)}
                                placeholder='Nome da escola'
                                className='w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-white'
                                required
                            />
                            <input
                                type='text'
                                value={secretaryName}
                                onChange={event => setSecretaryName(event.target.value)}
                                placeholder='Responsável pela secretaria'
                                className='w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-white'
                                required
                            />
                        </>
                    )}
                    <input
                        type='password'
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        placeholder='Senha (min. 6)'
                        className='w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-white'
                        minLength={6}
                        required
                    />
                    {mode === 'register' && (
                        <input
                            type='password'
                            value={confirmPassword}
                            onChange={event => setConfirmPassword(event.target.value)}
                            placeholder='Confirmar senha'
                            className='w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-white'
                            minLength={6}
                            required
                        />
                    )}
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-full bg-white hover:bg-zinc-200 text-black rounded-md py-2 transition-colors disabled:opacity-60'
                    >
                        {isSubmitting ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
                    </button>
                </form>

                {feedback && <p className='text-sm text-center text-gray-500'>{feedback}</p>}
            </section>
        </main>
    )
}