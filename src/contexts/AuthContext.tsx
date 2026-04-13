import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState
} from 'react'

type AuthUser = {
  id: string
  email: string
}

type RegisterPayload = {
  email: string
  schoolName: string
  secretaryName: string
  password: string
  confirmPassword: string
}

export interface AuthContextData {
  user: AuthUser | null
  isAuthLoading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext({} as AuthContextData)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        setUser(null)
        return
      }
      const data = await response.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    }
  }, [])

  const parseApiJson = async (response: Response) => {
    const text = await response.text()
    if (!text) return {}
    try {
      return JSON.parse(text) as { error?: string; user?: AuthUser }
    } catch {
      return {
        error: `Resposta inválida do servidor (${response.status}).`
      }
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await parseApiJson(response)
      if (!response.ok) return { ok: false, error: data.error || 'Falha ao entrar.' }
      if (data.user) setUser(data.user)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Erro de conexão ao fazer login.' }
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await parseApiJson(response)
      if (!response.ok) return { ok: false, error: data.error || 'Falha ao cadastrar.' }
      if (data.user) setUser(data.user)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Erro de conexão ao criar conta.' }
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    setUser(null)
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsAuthLoading(false))
  }, [refreshUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
