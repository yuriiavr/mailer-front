import { Link } from 'react-router-dom';
import css from './SignUpPage.module.css';
import { useState } from 'react';
import { useNotifications } from '../../utils/Notifications/Notifications';
import Container from '../../components/Container/Container';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../redux/auth/operations';

export default function SignUp() {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const { showNotification } = useNotifications();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const resultAction = await dispatch(registerUser({ userName, email, password }));

        if (registerUser.fulfilled.match(resultAction)) {
            setShowSuccess(true);
            showNotification("Registration successful! Please check your email for verification.", 'success');
            setUserName('');
            setEmail('');
            setPassword('');
        } else if (registerUser.rejected.match(resultAction)) {
            const errorMessage = resultAction.payload || "Registration failed. Please try again.";
            showNotification(errorMessage, 'error');
        }

        setIsSubmitting(false);
    };

    return (
        <Container>
            {!showSuccess ? (
                <div className={css.signupSection}>
                    <h1 className={css.heading}>Sign Up for an Account</h1>

                    <form className={css.form} onSubmit={handleSubmit}>
                        <label className={css.label}>
                            <span>Email</span>
                            <input
                                className={css.input}
                                onChange={(e) => setEmail(e.target.value)}
                                name='email'
                                type="email"
                                autoComplete="new-password"
                                value={email}
                                required
                            />
                        </label>
                        <label className={css.label}>
                            <span>Username</span>
                            <input
                                className={css.input}
                                onChange={(e) => setUserName(e.target.value)}
                                name='userName'
                                type="text"
                                autoComplete="new-password"
                                value={userName}
                                required
                            />
                        </label>
                        <label className={css.label}>
                            <span>Password</span>
                            <input
                                className={css.input}
                                onChange={(e) => setPassword(e.target.value)}
                                name='password'
                                type="password"
                                value={password}
                                required
                            />
                        </label>
                        <button className={css.submitBtn} type='submit' disabled={isSubmitting}>
                            {isSubmitting ? "Registering..." : "Register"}
                        </button>
                        <span className={css.loginText}>Already have an account? <Link className={css.link} to={'/login'}>Log In</Link></span>
                    </form>
                </div>
            ) : (
                <div className={css.successSection}>
                    <div className={css.successContent}>
                        <h2>Congratulations! <br /> Registration successful <br /> <a target="_blank" rel="noopener noreferrer" className={css.link} href="https://mail.google.com/mail/u/">Check your email for verification</a></h2>
                        <Link className={css.goToLoginBtn} to={'/login'}>Log In</Link>
                    </div>
                </div>
            )}
        </Container>
    );
}