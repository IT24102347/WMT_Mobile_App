import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Platform, RefreshControl, Modal,
    TextInput, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.8.166:5000/api';

const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('token');
    return await AsyncStorage.getItem('token');
};

const StudentPaymentScreen = ({ navigation }) => {
    const [payments, setPayments] = useState([]);
    const [approvedBookings, setApprovedBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [payModal, setPayModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [payMonth, setPayMonth] = useState('');
    const [payMethod, setPayMethod] = useState('Cash');
    const [payNote, setPayNote] = useState('');
    const [paying, setPaying] = useState(false);

    const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Online'];

    useEffect(() => {
        fetchPayments();
        fetchApprovedBookings();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/payments/my`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch payments error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchApprovedBookings = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/bookings/my`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            const approved = Array.isArray(data) ? data.filter(b => b.status === 'Approved') : [];
            setApprovedBookings(approved);
        } catch (err) {
            console.error('Fetch bookings error:', err);
        }
    };

    const openPayModal = (booking) => {
        setSelectedBooking(booking);
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        setPayMonth(`${now.getFullYear()}-${mm}`);
        setPayMethod('Cash');
        setPayNote('');
        setPayModal(true);
    };

    const handlePay = async () => {
        if (!payMonth) {
            const msg = 'Enter Month (e.g. 2026-05)';
            Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
            return;
        }
        setPaying(true);
        try {
            const token = await getToken();
            const existingPayment = payments.find(
                p => p.booking?._id === selectedBooking._id && p.month === payMonth
            );
            if (existingPayment) {
                const msg = `${payMonth} Payment for is already available.`;
                Platform.OS === 'web' ? alert(msg) : Alert.alert('Already Submitted', msg);
                setPaying(false);
                return;
            }

            const res = await fetch(`${API_BASE}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    studentId: selectedBooking.student,
                    bookingId: selectedBooking._id,
                    amount: selectedBooking.room?.pricePerMonth || 0,
                    month: payMonth,
                    paymentMethod: payMethod,
                    note: payNote
                })
            });
            const data = await res.json();
            if (res.ok) {
                setPayModal(false);
                const successMsg = `Payment submitted! Admin verify in progress.\nRs. ${(selectedBooking.room?.pricePerMonth || 0).toLocaleString()} - ${payMonth}`;
                Platform.OS === 'web' ? alert(successMsg) : Alert.alert('Success ✅', successMsg);
                fetchPayments();
            } else {
                const errMsg = data.msg || 'Payment failed';
                Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Error', errMsg);
            }
        } catch (err) {
            const errMsg = 'Payment submission error.';
            Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Error', errMsg);
        } finally {
            setPaying(false);
        }
    };

    const statusColor = (s) => {
        if (s === 'Paid') return '#10b981';
        if (s === 'Overdue') return '#ef4444';
        return '#f59e0b';
    };

    const totalDue = payments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>💰 My Payments</Text>
                <Text style={{ width: 50 }} />
            </View>

            <View style={styles.statsRow}>
                <View style={[styles.stat, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.statNum}>Rs.{totalPaid.toLocaleString()}</Text>
                    <Text style={styles.statLab}>Total Paid</Text>
                </View>
                <View style={[styles.stat, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.statNum}>Rs.{totalDue.toLocaleString()}</Text>
                    <Text style={styles.statLab}>Outstanding</Text>
                </View>
            </View>

            {approvedBookings.length > 0 && (
                <View style={styles.payNowSection}>
                    <Text style={styles.sectionTitle}>🏠 Approved Bookings - Pay Now</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {approvedBookings.map(booking => (
                            <View key={booking._id} style={styles.bookingCard}>
                                <Text style={styles.bookingRoom}>🏠 Room {booking.room?.roomNumber}</Text>
                                <Text style={styles.bookingType}>{booking.room?.roomType}</Text>
                                <Text style={styles.bookingPrice}>
                                    Rs. {booking.room?.pricePerMonth?.toLocaleString()}/mo
                                </Text>
                                <TouchableOpacity
                                    style={styles.payNowBtn}
                                    onPress={() => openPayModal(booking)}>
                                    <Text style={styles.payNowBtnText}>💳 Pay Now</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            <Text style={styles.sectionTitle2}>📋 Payment History</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={payments}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); fetchApprovedBookings(); }} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ fontSize: 40 }}>💰</Text>
                            <Text style={{ color: '#aaa', marginTop: 10 }}>Payment history නැත</Text>
                            {approvedBookings.length > 0 && (
                                <Text style={{ color: '#10b981', fontSize: 12, marginTop: 5 }}>
                                    ↑ Pay Now button click කර payment submit කරන්න
                                </Text>
                            )}
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <Text style={styles.month}>📅 {item.month}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.amount}>Rs. {item.amount?.toLocaleString()}</Text>
                            <Text style={styles.detail}>🏠 Room: {item.booking?.room?.roomNumber || '—'}</Text>
                            <Text style={styles.detail}>💳 {item.paymentMethod}</Text>
                            {item.note ? <Text style={styles.detail}>📝 {item.note}</Text> : null}
                            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                    )}
                />
            )}

            <Modal visible={payModal} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>💳 Payment Submit</Text>

                        {selectedBooking && (
                            <View style={styles.modalInfo}>
                                <Text style={styles.modalInfoText}>
                                    🏠 Room {selectedBooking.room?.roomNumber} - {selectedBooking.room?.roomType}
                                </Text>
                                <Text style={[styles.modalInfoText, { color: '#10b981', fontWeight: '800', fontSize: 16 }]}>
                                    Rs. {selectedBooking.room?.pricePerMonth?.toLocaleString()}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.modalLabel}>Month (YYYY-MM)</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. 2026-05"
                            value={payMonth}
                            onChangeText={setPayMonth}
                        />

                        <Text style={styles.modalLabel}>Payment Method</Text>
                        <View style={styles.methodRow}>
                            {paymentMethods.map(m => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.methodBtn, payMethod === m && styles.methodBtnActive]}
                                    onPress={() => setPayMethod(m)}>
                                    <Text style={[styles.methodBtnText, payMethod === m && { color: '#fff' }]}>
                                        {m}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalLabel}>Note (optional)</Text>
                        <TextInput
                            style={[styles.modalInput, { height: 70 }]}
                            placeholder="Any note..."
                            value={payNote}
                            onChangeText={setPayNote}
                            multiline
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, paying && { opacity: 0.6 }]}
                            onPress={handlePay}
                            disabled={paying}>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                                {paying ? 'Submitting...' : '✅ Submit Payment'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setPayModal(false)} style={{ marginTop: 12 }}>
                            <Text style={{ textAlign: 'center', color: '#ef4444', fontWeight: '700' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: {
        backgroundColor: '#10b981', paddingTop: 55, paddingBottom: 20,
        paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
    stat: { flex: 1, marginHorizontal: 6, padding: 16, borderRadius: 14, alignItems: 'center', elevation: 3 },
    statNum: { color: '#fff', fontSize: 16, fontWeight: '800' },
    statLab: { color: '#fff', fontSize: 12, marginTop: 2 },
    payNowSection: { paddingHorizontal: 16, marginBottom: 4 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#064e3b', marginBottom: 10 },
    sectionTitle2: { fontSize: 14, fontWeight: '700', color: '#064e3b', marginBottom: 8, paddingHorizontal: 16 },
    bookingCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 14, marginRight: 12,
        width: 180, elevation: 3, borderWidth: 2, borderColor: '#10b981'
    },
    bookingRoom: { fontWeight: '800', fontSize: 15, color: '#064e3b' },
    bookingType: { color: '#666', fontSize: 12, marginTop: 2 },
    bookingPrice: { color: '#10b981', fontWeight: '700', fontSize: 14, marginTop: 6, marginBottom: 10 },
    payNowBtn: { backgroundColor: '#10b981', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    payNowBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    month: { fontWeight: '700', fontSize: 15, color: '#1a1a2e' },
    statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
    amount: { fontSize: 22, fontWeight: '800', color: '#064e3b', marginBottom: 6 },
    detail: { color: '#666', fontSize: 13, marginBottom: 3 },
    dateText: { color: '#aaa', fontSize: 12, marginTop: 6 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', backgroundColor: '#fff', padding: 24, borderRadius: 25 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14, textAlign: 'center', color: '#064e3b' },
    modalInfo: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 14 },
    modalInfoText: { fontSize: 14, color: '#444', marginBottom: 2 },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
    modalInput: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 14 },
    methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    methodBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#d1fae5' },
    methodBtnActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
    methodBtnText: { fontSize: 12, fontWeight: '600', color: '#444' },
    submitBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 14, alignItems: 'center' },
});

export default StudentPaymentScreen;