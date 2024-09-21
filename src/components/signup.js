import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import './signup.css';

const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleFirstNameChange = (e) => {
        setFirstName(e.target.value);
    }
    const handleLastNameChange = (e) => {
        setLastName(e.target.value);
    }
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }
    const handleLogin = () => {
        navigate('/login');
    }
    const handleSignup = (e) => {
        e.preventDefault();
        console.log('Signing up with', firstName, lastName, email, password);
        navigate('/home');
    }

    return (
        alert("Signup Page"),
        <div>
            <h1>Signup</h1>
            <form onSubmit={handleSignup}>
                <input type="text" value={firstName} onChange={handleFirstNameChange} placeholder="First Name" />
                <input type="text" value={lastName} onChange={handleLastNameChange} placeholder="Last Name" />
                <input type="email" value={email} onChange={handleEmailChange} placeholder="Email" />
                <input type="password" value={password} onChange={handlePasswordChange} placeholder="Password" />
                <button type="submit">Signup</button>
            </form>
            <button onClick={handleLogin}>Login</button>
        </div>
    )
}