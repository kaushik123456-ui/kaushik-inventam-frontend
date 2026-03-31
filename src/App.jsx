import { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'

const API_BASE = 'http://localhost:3000' // Adjust if backend port is different

function App() {
    const [user, setUser] = useState(null)
    const [habits, setHabits] = useState([])
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [newHabit, setNewHabit] = useState({ name: '', description: '' })

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            checkAuth()
        }
    }, [])

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${API_BASE}/auth/getMe`)
            setUser(res.data.user)
            fetchHabits()
        } catch (err) {
            localStorage.removeItem('token')
        }
    }

    const handleAuth = async (e) => {
        e.preventDefault()
        try {
            const endpoint = isLogin ? 'login' : 'signup'
            const res = await axios.post(`${API_BASE}/auth/${endpoint}`, formData)
            localStorage.setItem('token', res.data.token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
            setUser(res.data.user)
            fetchHabits()
        } catch (err) {
            alert(err.response?.data?.message || 'Error')
        }
    }

    const fetchHabits = async () => {
        try {
            const res = await axios.get(`${API_BASE}/habits`)
            setHabits(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const createHabit = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_BASE}/habits`, newHabit)
            setNewHabit({ name: '', description: '' })
            fetchHabits()
        } catch (err) {
            alert(err.response?.data?.message || 'Error')
        }
    }

    const completeHabit = async (id) => {
        try {
            await axios.post(`${API_BASE}/habits/${id}/complete`)
            fetchHabits()
        } catch (err) {
            alert(err.response?.data?.message || 'Error')
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        setHabits([])
    }

    if (!user) {
        return (
            <div className="auth-container">
                <h1>Habit Tracker</h1>
                <form onSubmit={handleAuth}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Need to signup?' : 'Already have account?'}
                </button>
            </div>
        )
    }

    return (
        <div className="app">
            <header>
                <h1>Habit Tracker</h1>
                <div className="user-info">
                    <span>Welcome, {user.name}</span>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <div className="habit-form">
                <h2>Add New Habit</h2>
                <form onSubmit={createHabit}>
                    <input
                        type="text"
                        placeholder="Habit name"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={newHabit.description}
                        onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    />
                    <button type="submit">Add Habit</button>
                </form>
            </div>

            <div className="habits-list">
                <h2>Your Habits</h2>
                {habits.length === 0 ? (
                    <p>No habits yet. Add one above!</p>
                ) : (
                    habits.map(habit => {
                        const today = new Date().toISOString().split('T')[0]
                        const isCompletedToday = habit.completions?.some(date =>
                            new Date(date).toISOString().split('T')[0] === today
                        )
                        return (
                            <div key={habit._id} className="habit-item">
                                <div className="habit-info">
                                    <h3>{habit.name}</h3>
                                    {habit.description && <p>{habit.description}</p>}
                                    <span className={isCompletedToday ? 'completed' : 'pending'}>
                                        {isCompletedToday ? '✓ Done today' : '○ Pending'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => completeHabit(habit._id)}
                                    disabled={isCompletedToday}
                                >
                                    Mark as Done
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default App