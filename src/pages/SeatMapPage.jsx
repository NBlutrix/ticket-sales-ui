import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import api from '../api/axios'

function SeatMapPage() {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [seats, setSeats] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [heldSeat, setHeldSeat] = useState(null)

    useEffect(() => {
        Promise.all([
            api.get(`/api/events/${eventId}`),
            api.get(`/api/events/${eventId}/seats`)
        ]).then(([eventRes, seatsRes]) => {
            setEvent(eventRes.data)
            setSeats(seatsRes.data)
        }).finally(() => setLoading(false))
    }, [eventId])

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                client.subscribe(`/topic/events/${eventId}`, (msg) => {
                    const update = JSON.parse(msg.body)
                    setSeats(prev => prev.map(seat =>
                        seat.id === update.seatId
                            ? { ...seat, status: update.status }
                            : seat
                    ))
                })
            }
        })
        client.activate()
        return () => client.deactivate()
    }, [eventId])

    const handleHold = async (seat) => {
        try {
            await api.post('/api/bookings/hold', { eventId: Number(eventId), seatId: seat.id })
            setHeldSeat(seat)
            setMessage(`Seat ${seat.rowLabel}${seat.seatNumber} held for 10 minutes! Click Book to confirm.`)
        } catch (err) {
            setMessage(err.response?.data?.error || 'Could not hold seat')
        }
    }

    const handleBook = async () => {
        if (!heldSeat) return
        try {
            await api.post('/api/bookings', { eventId: Number(eventId), seatId: heldSeat.id })
            setMessage(`Seat ${heldSeat.rowLabel}${heldSeat.seatNumber} booked! Check your email for confirmation.`)
            setHeldSeat(null)
        } catch (err) {
            setMessage(err.response?.data?.error || 'Could not book seat')
        }
    }

    const getSeatColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return '#4CAF50'
            case 'HELD': return '#FF9800'
            case 'BOOKED': return '#f44336'
            default: return '#gray'
        }
    }

    const groupByRow = (seats) => {
        return seats.reduce((acc, seat) => {
            if (!acc[seat.rowLabel]) acc[seat.rowLabel] = []
            acc[seat.rowLabel].push(seat)
            return acc
        }, {})
    }

    if (loading) return <p>Loading...</p>

    const seatsByRow = groupByRow(seats)

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
                ← Back to Events
            </button>

            {event && (
                <div>
                    <h1>{event.name}</h1>
                    <p>📍 {event.venue?.name}, {event.venue?.city}</p>
                    <p>💰 {event.price} RSD</p>
                </div>
            )}

            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: '#e8f5e9',
                    borderRadius: '8px',
                    border: '1px solid #4CAF50'
                }}>
                    {message}
                </div>
            )}

            {heldSeat && (
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={handleBook}
                        style={{
                            padding: '0.75rem 2rem',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Book Seat {heldSeat.rowLabel}{heldSeat.seatNumber}
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <span>🟢 Available</span>
                <span>🟠 Held</span>
                <span>🔴 Booked</span>
            </div>

            <div style={{
                background: '#333',
                color: 'white',
                textAlign: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                marginBottom: '2rem'
            }}>
                STAGE
            </div>

            {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                <div key={row} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <span style={{ width: '20px', fontWeight: 'bold' }}>{row}</span>
                    {rowSeats.sort((a, b) => a.seatNumber - b.seatNumber).map(seat => (
                        <div
                            key={seat.id}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                background: getSeatColor(seat.status),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '11px',
                                cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold',
                            }}
                            title={`Row ${seat.rowLabel} Seat ${seat.seatNumber} - ${seat.status}`}
                            onClick={() => {
                                if (seat.status === 'AVAILABLE') handleHold(seat)
                            }}
                        >
                            {seat.seatNumber}
                        </div>
                    ))}
                </div>
            ))}

            <div style={{ marginTop: '2rem' }}>
                <p style={{ color: '#666' }}>
                    Click a green seat to hold it for 10 minutes, then book it.
                </p>
            </div>
        </div>
    )
}

export default SeatMapPage