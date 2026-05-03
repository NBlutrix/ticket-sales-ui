import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function RegisterPage() {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: ''
    })
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const response = await api.post('/api/auth/register', form)
            login(response.data)
            navigate('/')
        } catch (err) {
            setError('Registration failed. Email may already be in use.')
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem' }}>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                {['firstName', 'lastName', 'email', 'password'].map((field) => (
                    <div key={field} style={{ marginBottom: '1rem' }}>
                        <label>{field}</label>
                        <input
                            type={field === 'password' ? 'password' : 'text'}
                            name={field}
                            value={form[field]}
                            onChange={handleChange}
                            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                        />
                    </div>
                ))}
                <button type="submit" style={{ width: '100%', padding: '0.75rem' }}>
                    Register
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    )
}

export default RegisterPage