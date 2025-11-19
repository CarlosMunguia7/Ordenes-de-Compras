import { useAuth } from '../context/AuthContext';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, FileText, PlusCircle, CheckSquare } from 'lucide-react';

export default function MainLayout() {
    const { user, role, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)',
            display: 'flex'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '30px 24px',
                    borderBottom: '2px solid #e5e7eb',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <img
                            src="/logo.png"
                            alt="HC Logo"
                            style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'contain',
                                background: 'white',
                                padding: '8px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        />
                        <div>
                            <h1 style={{
                                fontSize: '22px',
                                fontWeight: 'bold',
                                color: 'white',
                                marginBottom: '4px',
                                letterSpacing: '0.5px'
                            }}>
                                Sistema de Órdenes
                            </h1>
                            <p style={{
                                fontSize: '11px',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: '500'
                            }}>
                                HC - Gestión de Compras
                            </p>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '4px'
                    }}>
                        {user?.email}
                    </p>
                    <p style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#fde047',
                        textTransform: 'uppercase'
                    }}>
                        {role === 'boss' ? '👔 Jefe' : '👤 Empleado'}
                    </p>
                </div>

                <nav style={{ flex: 1, padding: '20px 16px' }}>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        marginBottom: '8px',
                        fontWeight: '500',
                        transition: 'all 0.3s',
                        background: 'transparent'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#dcfce7';
                            e.currentTarget.style.color = '#16a34a';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#374151';
                        }}>
                        <FileText size={20} />
                        Mis Órdenes
                    </Link>

                    <Link to="/new-order" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        marginBottom: '8px',
                        fontWeight: '500',
                        transition: 'all 0.3s',
                        background: 'transparent'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#dcfce7';
                            e.currentTarget.style.color = '#16a34a';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#374151';
                        }}>
                        <PlusCircle size={20} />
                        Nueva Orden
                    </Link>

                    {role === 'boss' && (
                        <Link to="/approvals" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#374151',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            marginBottom: '8px',
                            fontWeight: '500',
                            transition: 'all 0.3s',
                            background: 'transparent'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#dcfce7';
                                e.currentTarget.style.color = '#16a34a';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#374151';
                            }}>
                            <CheckSquare size={20} />
                            Aprobaciones
                        </Link>
                    )}
                </nav>

                <div style={{
                    padding: '20px 16px',
                    borderTop: '2px solid #e5e7eb'
                }}>
                    <button
                        onClick={handleSignOut}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#dc2626',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            width: '100%',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            fontSize: '16px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                padding: '32px',
                overflowY: 'auto'
            }}>
                <Outlet />
            </main>
        </div>
    );
}
