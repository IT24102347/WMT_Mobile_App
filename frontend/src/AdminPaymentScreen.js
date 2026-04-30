import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, ScrollView, TextInput, Modal, Platform, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://wmt-mobile-app-xksy.vercel.app/api';

const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('token');
    return await AsyncStorage.getItem('token');
};

const AdminPaymentScreen = ({ navigation }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('All');
    const [genModal, setGenModal] = useState(false);
    const [genMonth, setGenMonth] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => { fetchPayments(); }, []);

    const fetchPayments = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/payments`, {
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

    const handleMarkPaid = async (id) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ status: 'Paid' })
            });
            if (res.ok) {
                Platform.OS === 'web' ? alert('Payment marked as Paid ✅') : Alert.alert('Success', 'Payment marked as Paid ✅');
                fetchPayments();
            }
        } catch { }
    };

    const handleMarkOverdue = async (id) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ status: 'Overdue' })
            });
            if (res.ok) { fetchPayments(); }
        } catch { }
    };

    const handleDelete = (id) => {
        const doDelete = async () => {
            const token = await getToken();
            await fetch(`${API_BASE}/payments/${id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
            fetchPayments();
        };
        if (Platform.OS === 'web') {
            if (window.confirm('Delete this payment?')) doDelete();
        } else {
            Alert.alert('Delete', 'Delete this payment?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete }
            ]);
        }
    };

    const handleGenerate = async () => {
        if (!genMonth) {
            Platform.OS === 'web' ? alert('Enter Month (e.g. 2026-05)') : Alert.alert('Error', 'Enter Month');
            return;
        }
        setGenerating(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/payments/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ month: genMonth })
            });
            const data = await res.json();
            Platform.OS === 'web' ? alert(data.msg) : Alert.alert('Success', data.msg);
            setGenModal(false);
            setGenMonth('');
            fetchPayments();
        } catch {
            Platform.OS === 'web' ? alert('Error generating') : Alert.alert('Error', 'Failed');
        } finally {
            setGenerating(false);
        }
    };

    const statusColor = (s) => {
        if (s === 'Paid') return '#10b981';
        if (s === 'Overdue') return '#ef4444';
        return '#f59e0b';
    };

    const filtered = filter === 'All' ? payments : payments.filter(p => p.status === filter);
    const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'Pending').length;
    const totalOverdue = payments.filter(p => p.status === 'Overdue').length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>💰 Payments</Text>
                <TouchableOpacity onPress={() => setGenModal(true)}>
                    <Text style={styles.genBtn}>+ Generate</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.stat, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.statNum}>Rs.{totalPaid.toLocaleString()}</Text>
                    <Text style={styles.statLab}>Collected</Text>
                </View>
                <View style={[styles.stat, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.statNum}>{totalPending}</Text>
                    <Text style={styles.statLab}>Pending</Text>
                </View>
                <View style={[styles.stat, { backgroundColor: '#ef4444' }]}>
                    <Text style={styles.statNum}>{totalOverdue}</Text>
                    <Text style={styles.statLab}>Overdue</Text>
                </View>
            </View>

            {/* Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['All', 'Pending', 'Paid', 'Overdue'].map(f => (
                    <TouchableOpacity key={f}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                        onPress={() => setFilter(f)}>
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ fontSize: 40 }}>💰</Text>
                            <Text style={{ color: '#aaa', marginTop: 10 }}>No Payments</Text>
                            <Text style={{ color: '#aaa', fontSize: 12, marginTop: 5 }}>+ Click the Generate button to create monthly payments.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.studentName}>👤 {item.student?.name || 'Unknown'}</Text>
                                    <Text style={styles.detail}>🪪 {item.student?.studentId}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.detail}>🏠 Room: {item.booking?.room?.roomNumber} ({item.booking?.room?.roomType})</Text>
                            <Text style={styles.detail}>💵 Amount: Rs. {item.amount?.toLocaleString()}</Text>
                            <Text style={styles.detail}>📅 Month: {item.month}</Text>
                            <Text style={styles.detail}>💳 Method: {item.paymentMethod}</Text>
                            {item.note ? <Text style={styles.detail}>📝 {item.note}</Text> : null}

                            <View style={styles.actionRow}>
                                {item.status !== 'Paid' && (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                                        onPress={() => handleMarkPaid(item._id)}>
                                        <Text style={styles.actionBtnText}>✅ Mark Paid</Text>
                                    </TouchableOpacity>
                                )}
                                {item.status === 'Pending' && (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                                        onPress={() => handleMarkOverdue(item._id)}>
                                        <Text style={styles.actionBtnText}>⚠ Overdue</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                                <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Generate Modal */}
            <Modal visible={genModal} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>📅 Generate Monthly Payments</Text>
                        <Text style={styles.modalLabel}>Month (YYYY-MM)</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. 2026-05"
                            value={genMonth}
                            onChangeText={setGenMonth}
                        />
                        <Text style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>
                            Approved bookings will have payment records created for them.
                        </Text>
                        <TouchableOpacity
                            style={[styles.genConfirmBtn, generating && { opacity: 0.6 }]}
                            onPress={handleGenerate} disabled={generating}>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                                {generating ? 'Generating...' : '✅ Generate'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setGenModal(false); setGenMonth(''); }} style={{ marginTop: 12 }}>
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
    genBtn: { color: '#fff', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
    stat: { flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 14, alignItems: 'center', elevation: 3 },
    statNum: { color: '#fff', fontSize: 16, fontWeight: '800' },
    statLab: { color: '#fff', fontSize: 11, marginTop: 2 },
    filterScroll: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 50 },
    filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, elevation: 1 },
    filterBtnActive: { backgroundColor: '#10b981' },
    filterText: { color: '#888', fontWeight: '600', fontSize: 13 },
    filterTextActive: { color: '#fff' },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 3 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    studentName: { fontWeight: '700', fontSize: 15, color: '#1a1a2e', marginBottom: 2 },
    statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
    detail: { color: '#444', fontSize: 13, marginBottom: 4 },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    actionBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontWeight: '700' },
    deleteBtn: { marginTop: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, alignItems: 'center' },
    deleteBtnText: { color: '#888', fontSize: 13 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#fff', padding: 25, borderRadius: 25 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center', color: '#064e3b' },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
    modalInput: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, marginBottom: 8, fontSize: 14 },
    genConfirmBtn: { backgroundColor: '#10b981', padding: 15, borderRadius: 14, alignItems: 'center' },
});

export default AdminPaymentScreen;