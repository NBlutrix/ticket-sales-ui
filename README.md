# Ticket Sales UI

React frontend for the Ticket Sales platform, featuring real-time seat maps with WebSocket updates.

## Tech Stack

- **React 19** + **Vite**
- **React Router** — client-side routing
- **Axios** — HTTP client with JWT interceptor
- **STOMP over SockJS** — WebSocket real-time updates

## Features

- User registration and login
- Browse available events
- Interactive seat map with color-coded availability
- Real-time seat status updates via WebSocket
- 10-minute seat hold before booking
- Booking confirmation flow

## Seat Status Colors

| Color | Status |
|-------|--------|
| 🟢 Green | Available |
| 🟠 Orange | Held (someone is checking out) |
| 🔴 Red | Booked |

## Running Locally

### Prerequisites
- Node.js 18+
- Ticket Sales API running on `http://localhost:8080`

### Install and run

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`

## Project Structure
src/
├── api/
│   └── axios.js          # Axios instance with JWT interceptor
├── context/
│   └── AuthContext.jsx   # Global auth state
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── EventsPage.jsx
│   └── SeatMapPage.jsx   # WebSocket seat map

## How WebSocket Works

When a user opens a seat map, the app subscribes to `/topic/events/{id}`. 
Every time any user holds or books a seat, the server broadcasts a message 
with the seat ID and new status. The UI updates instantly without any refresh.

```javascript
client.subscribe(`/topic/events/${eventId}`, (msg) => {
  const update = JSON.parse(msg.body)
  setSeats(prev => prev.map(seat =>
    seat.id === update.seatId
      ? { ...seat, status: update.status }
      : seat
  ))
})
```