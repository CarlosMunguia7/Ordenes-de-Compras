import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Check, X } from 'lucide-react';

export default function Approvals() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, profiles(full_name)')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        if (!confirm(`¿Estás seguro de que quieres ${newStatus === 'approved' ? 'APROBAR' : 'RECHAZAR'} esta orden?`)) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            fetchOrders();
            alert(`Orden ${newStatus === 'approved' ? 'aprobada' : 'rechazada'} correctamente.`);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error al actualizar la orden');
        }
    };

    if (loading) return (
        <div style={{ color: 'white', fontSize: '18px' }}>Cargando aprobaciones...</div>
    );

    return (
        <div>
            <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '24px',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                Aprobaciones Pendientes
            </h2>

            {orders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
                    <p style={{ color: '#6b7280', fontSize: '18px' }}>No hay órdenes pendientes de revisión.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map((order) => (
                        <div key={order.id} style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '24px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                marginBottom: '20px'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '8px'
                                    }}>
                                        Solicitud #{order.request_number}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Por: <span style={{ fontWeight: '600', color: '#374151' }}>
                                            {order.profiles?.full_name || 'Usuario desconocido'}
                                        </span>
                                        {' • '}
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: '#16a34a'
                                }}>
                                    C${order.total_amount}
                                </div>
                            </div>

                            <div style={{
                                background: '#f9fafb',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '24px'
                            }}>
                                <h4 style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    marginBottom: '8px'
                                }}>
                                    Justificación
                                </h4>
                                <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.6' }}>
                                    {order.justification}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => handleStatusChange(order.id, 'rejected')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 24px',
                                        border: '2px solid #dc2626',
                                        background: 'white',
                                        color: '#dc2626',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = '#fee2e2';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'white';
                                    }}
                                >
                                    <X size={18} /> Rechazar
                                </button>
                                <button
                                    onClick={() => handleStatusChange(order.id, 'approved')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 24px',
                                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)'
                                    }}
                                >
                                    <Check size={18} /> Aprobar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
