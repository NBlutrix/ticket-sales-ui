import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function EventsPage() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        api.get('/api/events')
            .then(res => setEvents(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (loading) return <p>Loading...</p>

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Ticket Sales</h1>
                <div>
                    <span style={{ marginRight: '1rem' }}>Hello, {user?.firstName || user?.email}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <h2>Available Events</h2>
            {events.length === 0 ? (
                <p>No events available.</p>
            ) : (
                <div>
                    {events.map(event => (
                        <div key={event.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            marginBottom: '1rem',
                        }}>
                            <h3>{event.name}</h3>
                            <p>{event.description}</p>
                            <p>📅 {new Date(event.eventDate).toLocaleDateString('sr-RS', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}</p>
                            <p>📍 {event.venue?.name}, {event.venue?.city}</p>
                            <p>💰 {event.price} RSD</p>
                            <button
                                onClick={() => navigate(`/events/${event.id}`)}
                                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                            >
                                View Seats
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default EventsPage