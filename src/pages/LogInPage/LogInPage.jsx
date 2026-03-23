import { Link, useNavigate } from "react-router-dom";
import css from "./LogInPage.module.css";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../redux/auth/operations";
import Container from "../../components/Container/Container";
import ReactDOM from 'react-dom';

// Локальні стилі для нотіфікацій
const notificationCss = {
  notificationContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
  },
  notification: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '250px',
    maxWidth: '350px',
    boxSizing: 'border-box',
    fontSize: '1rem',
    pointerEvents: 'auto',
    animation: 'fadeInOut 0.5s ease-in-out',
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontSize: '1.2rem',
    cursor: 'pointer',
    marginLeft: '15px',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
  },
  // Анімація додана прямо в стилі через JavaScript
};

// Компонент для відображення одного повідомлення
const LocalNotification = ({ message, type, onClose }) => {
    const style = {
        ...notificationCss.notification,
        ...notificationCss[type],
    };

    return (
        <div style={style}>
            {message}
            <button onClick={onClose} style={notificationCss.closeButton}>
                &times;
            </button>
        </div>
    );
};

// Хелпер функція для анімації (адаптація @keyframes)
const addKeyframes = () => {
    const styleSheet = document.styleSheets[0];
    const keyframes = `
        @keyframes fadeInOut {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
};

// Виклик хелпера для додавання анімації
addKeyframes();


export default function LogIn() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Стан для локальних нотіфікацій
    const [localNotifications, setLocalNotifications] = useState([]);

    // Локальна функція для показу нотіфікацій
    const showLocalNotification = useCallback((message, type = 'info', duration = 3000) => {
        const effectiveType = type === 'success' || type === 'info' ? 'success' : 'error';
        const id = Date.now() + Math.random();
        setLocalNotifications((prev) => [...prev, { id, message, type: effectiveType }]); 

        if (duration > 0) {
            setTimeout(() => {
                setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
            }, duration);
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const { currentTarget: formRef } = event;
        const { email, password } = formRef.elements;
        const credentials = {
            email: email.value,
            password: password.value,
        };

        const resultAction = await dispatch(loginUser(credentials));

        if (loginUser.fulfilled.match(resultAction)) {
            showLocalNotification("Login successful!", 'success');
            navigate("/userhomepage", { replace: true });
        } else {
            const errorMessage = "Invalid email or password. Please try again."
            showLocalNotification(errorMessage, 'error');
        }

        setIsSubmitting(false);
    };

    return (
        <Container>
            <div className={css.loginSection}>
                <h1 className={css.heading}>
                    Log In to Your Account
                </h1>

                <form className={css.form} onSubmit={handleSubmit}>
                    <label className={css.label}>
                        <span>Email</span>
                        <input
                            className={css.input}
                            name="email"
                            type="email"
                            required
                        />
                    </label>
                    <label className={css.label}>
                        <span>Password</span>
                        <input
                            className={css.input}
                            autoComplete="on"
                            name="password"
                            type="password"
                            required
                        />
                    </label>
                    <button className={css.submitBtn} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Log In"}
                    </button>
                    <span className={css.signupText}>
                        Don't have an account?{" "}
                        <Link className={css.link} to={"/signup"}>
                            Sign Up
                        </Link>
                    </span>
                </form>
            </div>
            {/* Рендеринг локальних нотіфікацій */}
            {ReactDOM.createPortal(
                <div style={notificationCss.notificationContainer}>
                    {localNotifications.map((n) => (
                        <LocalNotification 
                            key={n.id} 
                            message={n.message} 
                            type={n.type} 
                            onClose={() => setLocalNotifications((prev) => prev.filter((item) => item.id !== n.id))}
                        />
                    ))}
                </div>,
                document.body
            )}
        </Container>
    );
}   