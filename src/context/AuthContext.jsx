import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token')
        const email = localStorage.getItem('email')
        const firstName = localStorage.getItem('firstName')
        return token ? { token, email, firstName } : null
    })

    const login = (data) => {
        localStorage.setItem('token', data.token)
        localStorage.setItem('email', data.email)
        localStorage.setItem('firstName', data.firstName)
        setUser(data)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        localStorage.removeItem('firstName')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}