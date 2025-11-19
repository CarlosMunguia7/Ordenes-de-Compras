import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MyOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchOrders();
    }, [user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return { bg: '#dcfce7', text: '#16a34a' };
            case 'rejected': return { bg: '#fee2e2', text: '#dc2626' };
            default: return { bg: '#fef3c7', text: '#d97706' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle size={16} />;
            case 'rejected': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) return (
        <div style={{ color: 'white', fontSize: '18px' }}>Cargando órdenes...</div>
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
                Mis Órdenes
            </h2>

            {orders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
                    <FileText style={{ margin: '0 auto 16px', color: '#9ca3af' }} size={48} />
                    <p style={{ color: '#6b7280', fontSize: '18px' }}>No has creado ninguna orden todavía.</p>
                </div>
            ) : (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>ID Solicitud</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Fecha</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Justificación</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const statusStyle = getStatusColor(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                                            #{order.request_number}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.justification}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                                            C${order.total_amount}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: statusStyle.bg,
                                                color: statusStyle.text
                                            }}>
                                                {getStatusIcon(order.status)}
                                                {order.status === 'pending' ? 'Pendiente' :
                                                    order.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
