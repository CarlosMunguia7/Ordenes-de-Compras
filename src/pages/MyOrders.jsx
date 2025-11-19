import { useEffect, useState } from 'react';

import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Eye, Edit, Download, X, Trash2 } from 'lucide-react';

export default function MyOrders() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
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

    const handleDelete = async (orderId) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer.')) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            setOrders(orders.filter(o => o.id !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error al eliminar la orden.');
        }
    };

    const exportCSV = (order) => {
        try {
            // 1. Define CSV content
            const headers = ['Orden de Compra', `Solicitud #${order.request_number}`];
            const titleRow = ['Título', `"${order.title ? order.title.replace(/"/g, '""') : ''}"`];
            const dateRow = ['Fecha', new Date(order.created_at).toLocaleDateString()];
            const statusRow = ['Estado', 'Aprobada'];
            const justificationRow = ['Justificación', `"${order.justification ? order.justification.replace(/"/g, '""') : ''}"`];

            const emptyRow = [];
            const tableHeader = ['Producto', 'Proveedor', 'Cantidad', 'Precio Unitario', 'Total'];

            const tableRows = order.order_items.map(item => [
                `"${item.product_name.replace(/"/g, '""')}"`,
                `"${item.supplier ? item.supplier.replace(/"/g, '""') : ''}"`,
                item.quantity,
                item.unit_price,
                (item.quantity * item.unit_price).toFixed(2)
            ]);

            const totalRow = ['', '', '', 'Total General', order.total_amount];

            // 2. Combine all rows
            const csvContent = [
                headers,
                titleRow,
                dateRow,
                statusRow,
                justificationRow,
                emptyRow,
                tableHeader,
                ...tableRows,
                emptyRow,
                totalRow
            ].map(e => e.join(',')).join('\n');

            // 3. Create Blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.setAttribute('download', `Orden_${order.request_number}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Hubo un error al generar el archivo CSV.');
        }
    };

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

    if (loading) return <div style={{ color: 'white' }}>Cargando órdenes...</div>;

    return (
        <div>
            <h2 style={{
                fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '24px',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                Mis Órdenes
            </h2>

            {orders.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px', background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
                    <FileText style={{ margin: '0 auto 16px', color: '#9ca3af' }} size={48} />
                    <p style={{ color: '#6b7280', fontSize: '18px' }}>No has creado ninguna orden todavía.</p>
                </div>
            ) : (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Título</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Fecha</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Estado</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const statusStyle = getStatusColor(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '16px 24px', fontWeight: '600', color: '#111827' }}>#{order.request_number}</td>
                                        <td style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>{order.title || 'Sin Título'}</td>
                                        <td style={{ padding: '16px 24px', color: '#6b7280' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px 24px', fontWeight: '600', color: '#111827' }}>C${order.total_amount}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                                                borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                background: statusStyle.bg, color: statusStyle.text
                                            }}>
                                                {getStatusIcon(order.status)}
                                                {order.status === 'pending' ? 'Pendiente' :
                                                    order.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    title="Ver Detalles"
                                                    style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#f3f4f6', color: '#374151', cursor: 'pointer' }}
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {order.status === 'rejected' && (
                                                    <button
                                                        onClick={() => navigate(`/edit-order/${order.id}`)}
                                                        title="Editar y Reenviar"
                                                        style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#ffedd5', color: '#ea580c', cursor: 'pointer' }}
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                )}

                                                {(order.status === 'pending' || order.status === 'rejected') && (
                                                    <button
                                                        onClick={() => handleDelete(order.id)}
                                                        title="Eliminar Orden"
                                                        style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}

                                                {order.status === 'approved' && (
                                                    <button
                                                        onClick={() => exportCSV(order)}
                                                        title="Descargar CSV"
                                                        style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#dcfce7', color: '#16a34a', cursor: 'pointer' }}
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Detalles */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div style={{
                        background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '800px',
                        maxHeight: '80vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Detalles de la Orden</h3>
                                <p style={{ color: '#6b7280', marginTop: '4px' }}>{selectedOrder.title}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#9ca3af" />
                            </button>
                        </div>

                        {selectedOrder.status === 'rejected' && selectedOrder.reviewer_notes && (
                            <div style={{
                                background: '#fee2e2', borderLeft: '4px solid #dc2626', padding: '12px',
                                borderRadius: '8px', marginBottom: '20px', color: '#991b1b'
                            }}>
                                <strong>Razón del rechazo:</strong> {selectedOrder.reviewer_notes}
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Justificación:</h4>
                            <p style={{ color: '#6b7280' }}>{selectedOrder.justification}</p>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ textAlign: 'left', padding: '8px', color: '#6b7280' }}>Producto</th>
                                    <th style={{ textAlign: 'left', padding: '8px', color: '#6b7280' }}>Proveedor</th>
                                    <th style={{ textAlign: 'center', padding: '8px', color: '#6b7280' }}>Cant.</th>
                                    <th style={{ textAlign: 'right', padding: '8px', color: '#6b7280' }}>Precio</th>
                                    <th style={{ textAlign: 'right', padding: '8px', color: '#6b7280' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.order_items?.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 8px' }}>{item.product_name}</td>
                                        <td style={{ padding: '12px 8px', color: '#6b7280' }}>{item.supplier || '-'}</td>
                                        <td style={{ textAlign: 'center', padding: '12px 8px' }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', padding: '12px 8px' }}>C${item.unit_price}</td>
                                        <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: '600' }}>
                                            C${(item.quantity * item.unit_price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ marginTop: '24px', textAlign: 'right', fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                            Total: C${selectedOrder.total_amount}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
