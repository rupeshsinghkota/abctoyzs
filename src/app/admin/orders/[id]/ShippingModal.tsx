"use client";

import { useState } from 'react';
import { X, Loader2, Truck, Package, Calendar } from 'lucide-react';

type Courier = {
    courier_id: number;
    courier_name: string;
    freight_charge: number;
    estimated_delivery_days: string;
    etd: string;
};

type ShippingModalProps = {
    orderId: string;
    shiprocketOrderId: string;
    onClose: () => void;
    onSuccess: () => void;
};

export default function ShippingModal({ orderId, shiprocketOrderId, onClose, onSuccess }: ShippingModalProps) {
    const [step, setStep] = useState<'couriers' | 'pickup'>('couriers');
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
    const [loading, setLoading] = useState(false);
    const [pickupDate, setPickupDate] = useState('');
    const [shipmentId, setShipmentId] = useState('');

    // Load available couriers
    useState(() => {
        loadCouriers();
    });

    async function loadCouriers() {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/ship/couriers`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load couriers');
            }
            const data = await response.json();
            console.log('[ShippingModal] Received courier data:', data);

            // Shiprocket response: {data: {available_courier_companies: [...]}}
            const courierList = data.data?.available_courier_companies || data.available_courier_companies || data.couriers?.available_courier_companies || data.couriers || [];
            console.log('[ShippingModal] Extracted couriers:', courierList);
            setCouriers(courierList);

            if (courierList.length === 0) {
                console.warn('[ShippingModal] No couriers found in response');
            }
        } catch (error: any) {
            console.error('[ShippingModal] Load error:', error);
            alert(`Failed to load courier options: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleAssignCourier() {
        if (!selectedCourier) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/ship/couriers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courier_id: selectedCourier.courier_id })
            });

            if (!response.ok) throw new Error('Failed to assign courier');

            const { data } = await response.json();
            setShipmentId(data.response?.data?.shipment_id || shiprocketOrderId);
            setStep('pickup');
        } catch (error: any) {
            console.error(error);
            alert(`Failed to assign courier: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleSchedulePickup() {
        if (!pickupDate || !shipmentId) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/ship/pickup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickup_date: pickupDate,
                    shipment_id: shipmentId
                })
            });

            if (!response.ok) throw new Error('Failed to schedule pickup');

            alert('✅ Pickup scheduled successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(`Failed to schedule pickup: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {step === 'couriers' ? 'Select Courier' : 'Schedule Pickup'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'couriers' && (
                        <>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : couriers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No couriers available for this order</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {couriers.map((courier) => (
                                        <button
                                            key={courier.courier_id}
                                            onClick={() => setSelectedCourier(courier)}
                                            className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${selectedCourier?.courier_id === courier.courier_id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-5 h-5 text-blue-600" />
                                                    <span className="font-semibold text-lg">{courier.courier_name}</span>
                                                </div>
                                                <span className="text-xl font-bold text-blue-600">
                                                    ₹{courier.freight_charge}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Est. Delivery: <span className="font-medium">{courier.estimated_delivery_days} days</span>
                                                {courier.etd && <span className="ml-2">({courier.etd})</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignCourier}
                                    disabled={!selectedCourier || loading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Assigning...' : 'Continue to Pickup'}
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'pickup' && (
                        <>
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700">
                                    <Package className="w-5 h-5" />
                                    <span className="font-semibold">Courier Assigned: {selectedCourier?.courier_name}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Select Pickup Date
                                </label>
                                <input
                                    type="date"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                                />
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setStep('couriers')}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSchedulePickup}
                                    disabled={!pickupDate || loading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Scheduling...
                                        </>
                                    ) : (
                                        'Schedule Pickup'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
