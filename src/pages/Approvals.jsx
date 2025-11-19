import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Check, X, Eye, XCircle, Clock, CheckCircle, FileText, Download } from 'lucide-react';

export default function Approvals() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'approved', 'rejected'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rejectingOrder, setRejectingOrder] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('orders')
                .select('*, profiles(full_name), order_items(*)')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Approvals mounted');
        fetchOrders();
    }, [statusFilter]);

    const handleApprove = async (orderId) => {
        if (!confirm('¿Confirmas la aprobación de esta orden?')) return;
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'approved' })
                .eq('id', orderId);
            if (error) throw error;
            fetchOrders();
        } catch (error) {
            alert('Error al aprobar: ' + error.message);
        }
    };

    const handleRejectClick = (order) => {
        setRejectingOrder(order);
        setRejectionReason('');
    };

    const confirmRejection = async () => {
        if (!rejectionReason.trim()) return alert('Debes escribir una razón para el rechazo.');

        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'rejected',
                    reviewer_notes: rejectionReason
                })
                .eq('id', rejectingOrder.id);

            if (error) throw error;

            setRejectingOrder(null);
            fetchOrders();
        } catch (error) {
            alert('Error al rechazar: ' + error.message);
        }
    };

    const exportCSV = (order) => {
        try {
            // 1. Define CSV content
            const headers = ['Orden de Compra', `Solicitud #${order.request_number}`];
            const titleRow = ['Título', `"${order.title ? order.title.replace(/"/g, '""') : ''}"`];
            const dateRow = ['Fecha', new Date(order.created_at).toLocaleDateString()];
            const statusRow = ['Estado', order.status === 'approved' ? 'Aprobada' : order.status === 'rejected' ? 'Rechazada' : 'Pendiente'];
            const justificationRow = ['Justificación', `"${order.justification ? order.justification.replace(/"/g, '""') : ''}"`];
            const requesterRow = ['Solicitado por', `"${order.profiles?.full_name || ''}"`];

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
                requesterRow,
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
            URL.revokeObjectURL(url); // Clean up
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Hubo un error al generar el archivo CSV.');
        }
    };

    const TabButton = ({ status, label, icon: Icon }) => (
        <button
            onClick={() => setStatusFilter(status)}
            style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: statusFilter === status ? 'white' : 'rgba(255,255,255,0.1)',
                color: statusFilter === status ? '#16a34a' : 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div>
            <h2 style={{
                fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '24px',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                Gestión de Órdenes
            </h2>

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: '12px', marginBottom: '32px',
                background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '16px'
            }}>
                <TabButton status="pending" label="Pendientes" icon={Clock} />
                <TabButton status="approved" label="Aprobadas" icon={CheckCircle} />
                <TabButton status="rejected" label="Rechazadas" icon={XCircle} />
            </div>

            {loading ? (
                <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Cargando órdenes...</div>
            ) : orders.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px', background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}>
                    <FileText style={{ margin: '0 auto 16px', color: '#9ca3af' }} size={48} />
                    <p style={{ color: '#6b7280', fontSize: '18px' }}>No hay órdenes en esta categoría.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map((order) => (
                        <div key={order.id} style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '24px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                            borderLeft: order.status === 'approved' ? '6px solid #16a34a' :
                                order.status === 'rejected' ? '6px solid #dc2626' : '6px solid #d97706'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                        Solicitud #{order.request_number} - {order.title || 'Sin Título'}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Por: <span style={{ fontWeight: '600', color: '#374151' }}>{order.profiles?.full_name}</span>
                                        {' • '} {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>
                                        C${order.total_amount}
                                    </div>
                                    <span style={{
                                        fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                                        color: order.status === 'approved' ? '#16a34a' :
                                            order.status === 'rejected' ? '#dc2626' : '#d97706'
                                    }}>
                                        {order.status === 'pending' ? 'Pendiente de Revisión' :
                                            order.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Justificación
                                </h4>
                                <p style={{ color: '#374151', fontSize: '15px' }}>{order.justification}</p>

                                {order.status === 'rejected' && order.reviewer_notes && (
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626', textTransform: 'uppercase', marginBottom: '4px' }}>
                                            Motivo del Rechazo
                                        </h4>
                                        <p style={{ color: '#991b1b', fontSize: '14px' }}>{order.reviewer_notes}</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                                        background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px',
                                        fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    <Eye size={18} /> Ver Detalles
                                </button>

                                {order.status === 'approved' && (
                                    <button
                                        onClick={() => exportCSV(order)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                                            background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '10px',
                                            fontWeight: '600', cursor: 'pointer'
                                        }}
                                    >
                                        <Download size={18} /> Descargar CSV
                                    </button>
                                )}

                                {/* Solo mostrar botones de acción si está pendiente */}
                                {order.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleRejectClick(order)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                                                border: '2px solid #dc2626', background: 'white', color: '#dc2626',
                                                borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
                                            }}
                                        >
                                            <X size={18} /> Rechazar
                                        </button>
                                        <button
                                            onClick={() => handleApprove(order.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                                                background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                                                border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
                                            }}
                                        >
                                            <Check size={18} /> Aprobar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
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
                                <XCircle size={24} color="#9ca3af" />
                            </button>
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

            {/* Modal Rechazo */}
            {rejectingOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#dc2626' }}>
                            Rechazar Solicitud
                        </h3>
                        <p style={{ marginBottom: '12px', color: '#374151' }}>
                            Por favor indica la razón del rechazo para que el empleado pueda corregirlo:
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db',
                                marginBottom: '20px', minHeight: '100px', fontFamily: 'inherit'
                            }}
                            placeholder="Ej: El precio unitario es demasiado alto..."
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setRejectingOrder(null)}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db',
                                    background: 'white', cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmRejection}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    background: '#dc2626', color: 'white', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Confirmar Rechazo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
