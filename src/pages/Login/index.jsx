import React, { Component } from 'react';
import { OTPInput } from 'input-otp';
import { supabase } from '../../supabaseClient';
import {  LogOut } from 'lucide-react';
import './index.css';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            otp: '',
            step: 1,
            user: null,
            loading: false,
            timer: 0,
            subscription: null
        };
    }

    componentDidMount() {
        this.checkSession();
        this.setupAuthListener();
    }

    componentWillUnmount() {
        if (this.state.subscription) {
            this.state.subscription.unsubscribe();
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        this.setState({ user: session?.user ?? null });
    }

    setupAuthListener = () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            this.setState({ user: session?.user ?? null });
        });
        this.setState({ subscription });
    }

    startTimer = () => {
        if (this.interval) clearInterval(this.interval);
        this.setState({ timer: 60 });
        this.interval = setInterval(() => {
            if (this.state.timer > 0) {
                this.setState((prevState) => ({ timer: prevState.timer - 1 }));
            } else {
                clearInterval(this.interval);
            }
        }, 1000);
    }

    handleSendOtp = async (e) => {
        e?.preventDefault();
        this.setState({ loading: true });

        const { error } = await supabase.auth.signInWithOtp({
            email: this.state.email,
            options: { shouldCreateUser: true }
        });

        if (!error) {
            this.setState({ step: 2 });
            this.startTimer();
        } else {
            alert(error.message);
        }
        this.setState({ loading: false });
    }

    handleVerifyOtp = async () => {
        if (this.state.otp.length !== 6) return;
        this.setState({ loading: true });

        const { error } = await supabase.auth.verifyOtp({
            email: this.state.email,
            token: this.state.otp,
            type: 'email'
        });

        if (error) alert(error.message);
        this.setState({ loading: false });
    }

    render() {
        const { email, otp, step, user, loading, timer } = this.state;

        if (user) {
            return (
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <p className="welcome-text">Welcome, {user.email}</p>
                        <button className="btn-primary" onClick={() => supabase.auth.signOut()}>
                            <LogOut size={18} className="btn-icon" />
                            Sign Out
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="login-page-container">
                
                <div className="auth-card">
                    <h1 className="logo">Open Shelf</h1>
                    <h1 className="logo"></h1>
                    <h1 className='sub'>{step === 1 ? '' : ''}</h1>
                    <p className="subtitle-text">
                        {step === 1 ? 'Enter email to sign in' : `We sent a code to ${email}`}
                    </p>

                    {step === 1 ? (
                        <form onSubmit={this.handleSendOtp}>
                            <input
                                className="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => this.setState({ email: e.target.value })}
                                placeholder="hello@example.com"
                                required
                            />
                            <button className="btn-primary" disabled={loading}>
                                {loading ? 'Sending...' : 'Get Login Code'}
                            </button>
                        </form>
                    ) : (
                        <div>
                            <OTPInput
                                maxLength={6}
                                value={otp}
                                onChange={(val) => this.setState({ otp: val })}
                                onComplete={this.handleVerifyOtp}
                                render={({ slots }) => (
                                    <div className="otp-group">
                                        {slots.slice(0, 3).map((slot, i) => <Slot key={i} {...slot} />)}
                                        <div className="otp-separator">-</div>
                                        {slots.slice(3).map((slot, i) => <Slot key={i} {...slot} />)}
                                    </div>
                                )}
                            />
                            <button
                                className="btn-primary"
                                onClick={this.handleVerifyOtp}
                                disabled={loading || otp.length < 6}
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>
                            <p className="resend-container">
                                Didn't receive it?{' '}
                                <button
                                    className="btn-link"
                                    onClick={this.handleSendOtp}
                                    disabled={timer > 0}
                                >
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend code'}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

function Slot(props) {
    return (
        <div className={`otp-slot ${props.isActive ? 'active' : ''}`}>
            {props.char !== null ? props.char : ''}
        </div>
    );
}