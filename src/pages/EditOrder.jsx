import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditOrder() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [justification, setJustification] = useState('');
    const [reviewerNotes, setReviewerNotes] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Fetch order details
                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (orderError) throw orderError;

                // Verify ownership
                if (order.user_id !== user.id) {
                    alert('No tienes permiso para editar esta orden.');
                    navigate('/');
                    return;
                }

                // Only allow editing rejected or pending orders (optional logic)
                if (order.status === 'approved') {
                    alert('No puedes editar una orden ya aprobada.');
                    navigate('/');
                    return;
                }

                setTitle(order.title || '');
                setJustification(order.justification);
                setReviewerNotes(order.reviewer_notes);

                // Fetch order items
                const { data: orderItems, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', id);

                if (itemsError) throw itemsError;

                setItems(orderItems);
            } catch (error) {
                console.error('Error fetching order:', error);
                alert('Error al cargar la orden.');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (user && id) fetchOrder();
    }, [user, id, navigate]);

    const addItem = () => {
        setItems([...items, { product_name: '', supplier: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!title.trim()) return alert('Por favor escribe un título para la orden');
        if (!justification) return alert('Por favor escribe una justificación');
        if (items.some(i => !i.product_name || i.quantity <= 0)) return alert('Revisa los items');

        setSaving(true);
        try {
            // Update order
            const { error: orderError } = await supabase
                .from('orders')
                .update({
                    title,
                    justification,
                    total_amount: calculateTotal(),
                    status: 'pending', // Reset status to pending after edit
                    reviewer_notes: null // Clear rejection notes as it's a new submission
                })
                .eq('id', id);

            if (orderError) throw orderError;

            // Delete existing items (simplest way to update items)
            const { error: deleteError } = await supabase
                .from('order_items')
                .delete()
                .eq('order_id', id);

            if (deleteError) throw deleteError;

            // Insert new items
            const orderItems = items.map(item => ({
                order_id: id,
                product_name: item.product_name,
                supplier: item.supplier,
                quantity: parseInt(item.quantity),
                unit_price: parseFloat(item.unit_price)
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            alert('Orden actualizada y enviada a revisión nuevamente.');
            navigate('/');

        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error al actualizar la orden: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ color: 'white' }}>Cargando orden...</div>;

    return (
        <div>
            <button
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'white',
                    background: 'transparent',
                    border: 'none',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                <ArrowLeft size={20} /> Volver
            </button>

            <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '24px',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                Editar Orden #{id}
            </h2>

            {reviewerNotes && (
                <div style={{
                    background: '#fee2e2',
                    borderLeft: '4px solid #dc2626',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    color: '#991b1b',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'start'
                }}>
                    <AlertCircle size={24} style={{ flexShrink: 0 }} />
                    <div>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '4px' }}>Motivo del Rechazo:</h4>
                        <p>{reviewerNotes}</p>
                    </div>
                </div>
            )}

            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                maxWidth: '1000px'
            }}>
                <form onSubmit={handleUpdate}>
                    {/* Title */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px'
                        }}>
                            Título de la Orden
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '2px solid #d1d5db',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'border 0.3s'
                            }}
                            placeholder="Ej: Material de Oficina - Noviembre"
                            required
                        />
                    </div>

                    {/* Justification */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px'
                        }}>
                            Justificación de la Compra
                        </label>
                        <textarea
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '2px solid #d1d5db',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'border 0.3s',
                                fontFamily: 'inherit'
                            }}
                            rows="3"
                            required
                        />
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={16} /> Agregar Item
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((item, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'start',
                                    background: '#f9fafb',
                                    padding: '16px',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                            Producto
                                        </label>
                                        <input
                                            type="text"
                                            value={item.product_name}
                                            onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '14px'
                                            }}
                                            placeholder="Nombre del producto"
                                            required
                                        />
                                    </div>
                                    <div style={{ flex: 1.5 }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                            Proveedor
                                        </label>
                                        <input
                                            type="text"
                                            value={item.supplier || ''}
                                            onChange={(e) => updateItem(index, 'supplier', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '14px'
                                            }}
                                            placeholder="Proveedor"
                                        />
                                    </div>
                                    <div style={{ width: '100px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '14px'
                                            }}
                                            required
                                        />
                                    </div>
                                    <div style={{ width: '120px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                            Precio Unit.
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '14px'
                                            }}
                                            required
                                        />
                                    </div>
                                    <div style={{ width: '90px', paddingTop: '26px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                                        C${(item.quantity * item.unit_price).toFixed(2)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        style={{
                                            marginTop: '26px',
                                            padding: '10px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#dc2626',
                                            cursor: 'pointer'
                                        }}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: '20px',
                            textAlign: 'right',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#16a34a'
                        }}>
                            Total: C${calculateTotal().toFixed(2)}
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        paddingTop: '24px',
                        borderTop: '2px solid #e5e7eb'
                    }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                color: 'white',
                                padding: '14px 32px',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.6 : 1,
                                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)'
                            }}
                        >
                            <Save size={20} />
                            {saving ? 'Guardando...' : 'Actualizar Orden'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
