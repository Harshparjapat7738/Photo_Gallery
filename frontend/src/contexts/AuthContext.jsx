import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={{ user: null, isAuthenticated: true, loading: false, login: async () => {}, logout: async () => {} }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
