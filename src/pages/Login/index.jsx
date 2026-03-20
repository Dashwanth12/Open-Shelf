import React, {useState, useEffect} from 'react'
import {OTPInput} from 'input-otp'
import {supabase} from '../../supabaseClient'
import { LogOut } from 'lucide-react'
import './index.css'

export default function App() {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(0)
    const [timer, setTimer] = useState(0)


    useEffect(() => {
        supabase.auth.getSession().then(({data}) => setUser(data.session?.user ?? null))

        const {data : {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
       if (timer > 0){
        const interval = setInterval(() => setTimer((t) => t - 1), 1000)

        return () => clearInterval(interval)
       } 
    }, [timer])

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault()
            setLoading(true)

        const {error} = await supabase.auth.signInWithOtp({email})

        if (!error){
            setStep(2)
            setTimer(60)
        }else{
            alert(error.message)
        }
        setLoading(false)
    } 

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return
            setLoading(true)

        const {error} = await supabase.auth.verifyOtp({email, token: otp, type: 'email'})

        if (error) alert(error.message)
            setLoading(false)
    }

    const handleLogout = () => supabase.auth.signOut()


    if (user) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card">
                    <p className="welcome-text">Welcome, {user.email}</p>
                    <button className="btn-primary" onClick={handleLogout}>
                        <LogOut size={18} className="btn-icon" /> Sign Out
                    </button>
                </div>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="login-page-container">
                <div className="auth-card">
                    <h1 className="logo">Open Shelf</h1>
                    <p className="subtitle-text">Enter email to sign in</p>

                    <form onSubmit={handleSendOtp}>
                        <input
                            className="email-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@example.com"
                            required
                        />
                        <button className="btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Get Login Code'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    
    if (step === 2) {
        return (
            <div className="login-page-container">
                <div className="auth-card">
                    <h1 className="logo">Open Shelf</h1>
                    <p className="subtitle-text">We sent a code to {email}</p>

                    <OTPInput
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        onComplete={handleVerifyOtp}
                        render={({ slots }) => (
                            <div className="otp-group">
                                {slots.slice(0, 3).map((slot, i) => <Slot key={i} {...slot} />)}
                                <div className="otp-separator">-</div>
                                {slots.slice(3).map((slot, i) => <Slot key={i} {...slot} />)}
                            </div>
                        )}
                    />

                    <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading || otp.length < 6}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <p className="resend-container">
                        Didn't receive it?{' '}
                        <button className="btn-link" onClick={handleSendOtp} disabled={timer > 0}>
                            {timer > 0 ? `Resend in ${timer}s` : 'Resend code'}
                        </button>
                    </p>
                </div>
            </div>
        );
    }
}


function Slot({ isActive, char }) {
    return (
        <div className={`otp-slot ${isActive ? 'active' : ''}`}>
            {char || ''}
        </div>
    );
}