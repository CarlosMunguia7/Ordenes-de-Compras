import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await signIn({ email, password });
        if (error) setError(error.message);
        else navigate('/');
        setLoading(false);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await signUp({
            email,
            password,
            options: {
                data: {
                    full_name: email.split('@')[0],
                }
            }
        });
        if (error) setError(error.message);
        else alert('¡Registro exitoso! Revisa tu correo para confirmar.');
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 10px 40px rgba(0, 0, 0, 0.3)',
                width: '100%',
                maxWidth: '420px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '90px',
                        height: '90px',
                        background: 'white',
                        borderRadius: '50%',
                        marginBottom: '20px',
                        boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)',
                        padding: '10px'
                    }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        Órdenes de Compra
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>Sistema de Gestión Empresarial</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        borderLeft: '4px solid #ef4444',
                        color: '#991b1b',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid #d1d5db',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid #d1d5db',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            style={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                color: 'white',
                                padding: '14px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? 'Cargando...' : 'Entrar'}
                        </button>
                        <button
                            onClick={handleSignUp}
                            disabled={loading}
                            style={{
                                flex: 1,
                                background: 'white',
                                color: '#16a34a',
                                padding: '14px 24px',
                                borderRadius: '10px',
                                border: '2px solid #16a34a',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.3s'
                            }}
                        >
                            Registrarse
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
                    <p>Sistema seguro con encriptación de datos</p>
                </div>
            </div>
        </div>
    );
}
