import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, ScrollView, RefreshControl, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.8.166:5000/api';

const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('token');
    return await AsyncStorage.getItem('token');
};

const AdminBookingScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('All');

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/bookings`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch bookings error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const confirmAction = (title, msg, onConfirm) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`${title}: ${msg}`)) onConfirm();
        } else {
            Alert.alert(title, msg, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: onConfirm }
            ]);
        }
    };

    const handleApprove = (id) => {
        confirmAction('Approve', 'Are you sure you want to approve the booking?', async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_BASE}/bookings/approve/${id}`, {
                    method: 'PUT', headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                if (res.ok) {
                    Platform.OS === 'web' ? alert('Approved! ✅') : Alert.alert('Success', data.msg);
                    fetchBookings();
                } else {
                    Platform.OS === 'web' ? alert(data.msg) : Alert.alert('Error', data.msg);
                }
            } catch { Platform.OS === 'web' ? alert('Network error') : Alert.alert('Error', 'Network error'); }
        });
    };

    const handleReject = (id) => {
        confirmAction('Reject', 'Are you sure you want to reject the booking?', async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_BASE}/bookings/reject/${id}`, {
                    method: 'PUT', headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                if (res.ok) {
                    Platform.OS === 'web' ? alert('Rejected!') : Alert.alert('Success', data.msg);
                    fetchBookings();
                } else {
                    Platform.OS === 'web' ? alert(data.msg) : Alert.alert('Error', data.msg);
                }
            } catch { Platform.OS === 'web' ? alert('Network error') : Alert.alert('Error', 'Network error'); }
        });
    };

    const handleDelete = (id) => {
        confirmAction('Delete', 'Are you sure you want to delete the booking?', async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_BASE}/bookings/${id}`, {
                    method: 'DELETE', headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    Platform.OS === 'web' ? alert('Deleted!') : Alert.alert('Deleted', 'Booking deleted.');
                    fetchBookings();
                }
            } catch { Platform.OS === 'web' ? alert('Network error') : Alert.alert('Error', 'Network error'); }
        });
    };

    const statusColor = (s) => {
        if (s === 'Approved') return '#10b981';
        if (s === 'Rejected') return '#ef4444';
        if (s === 'Cancelled') return '#6b7280';
        return '#f59e0b';
    };

    const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);
    const pending  = bookings.filter(b => b.status === 'Pending').length;
    const approved = bookings.filter(b => b.status === 'Approved').length;
    const rejected = bookings.filter(b => b.status === 'Rejected').length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Room Bookings</Text>
                <Text style={{ width: 50 }} />
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.stat, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.statNum}>{pending}</Text>
                    <Text style={styles.statLab}>Pending</Text>
                </View>
                <View style={[styles.stat, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.statNum}>{approved}</Text>
                    <Text style={styles.statLab}>Approved</Text>
                </View>
                <View style={[styles.stat, { backgroundColor: '#ef4444' }]}>
                    <Text style={styles.statNum}>{rejected}</Text>
                    <Text style={styles.statLab}>Rejected</Text>
                </View>
                <View style={[styles.stat, { backgroundColor: '#8338EC' }]}>
                    <Text style={styles.statNum}>{bookings.length}</Text>
                    <Text style={styles.statLab}>Total</Text>
                </View>
            </View>

            {/* Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map(f => (
                    <TouchableOpacity key={f}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                        onPress={() => setFilter(f)}>
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <ActivityIndicator size="large" color="#8338EC" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Text style={{ fontSize: 40 }}>📋</Text>
                            <Text style={styles.emptyText}>No bookings available</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.studentName}>👤 {item.student?.name || 'Unknown'}</Text>
                                    <Text style={styles.detail}>🪪 ID: {item.student?.studentId || 'N/A'}</Text>
                                    <Text style={styles.detail}>📧 {item.student?.email}</Text>
                                    <Text style={styles.detail}>📚 {item.student?.course}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.detail}>🏠 Room: {item.room?.roomNumber} ({item.room?.roomType})</Text>
                            <Text style={styles.detail}>💰 Rs. {item.room?.pricePerMonth}/month</Text>
                            <Text style={styles.detail}>📅 Start: {new Date(item.startDate).toLocaleDateString()}</Text>
                            {item.note ? <Text style={styles.detail}>📝 {item.note}</Text> : null}
                            <Text style={styles.detail}>🕒 {new Date(item.createdAt).toLocaleString()}</Text>

                            {item.status === 'Pending' && (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                                        onPress={() => handleApprove(item._id)}>
                                        <Text style={styles.actionBtnText}>✅ Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                                        onPress={() => handleReject(item._id)}>
                                        <Text style={styles.actionBtnText}>❌ Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {item.status === 'Approved' && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#ef4444', marginTop: 10 }]}
                                    onPress={() => handleReject(item._id)}>
                                    <Text style={styles.actionBtnText}>❌ Reject & Free Room</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                                <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f3ff' },
    header: {
        backgroundColor: '#8338EC', paddingTop: 55, paddingBottom: 20,
        paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
    stat: { flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 14, alignItems: 'center', elevation: 3 },
    statNum: { color: '#fff', fontSize: 20, fontWeight: '800' },
    statLab: { color: '#fff', fontSize: 11, marginTop: 2 },
    filterScroll: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 50 },
    filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, elevation: 1 },
    filterBtnActive: { backgroundColor: '#8338EC' },
    filterText: { color: '#888', fontWeight: '600', fontSize: 13 },
    filterTextActive: { color: '#fff' },
    emptyBox: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#aaa', marginTop: 10, fontSize: 15 },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 3 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    studentName: { fontWeight: '700', fontSize: 16, color: '#1a1a2e', marginBottom: 4 },
    statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, marginLeft: 8 },
    statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
    detail: { color: '#444', fontSize: 13, marginBottom: 4 },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    actionBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontWeight: '700' },
    deleteBtn: { marginTop: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, alignItems: 'center' },
    deleteBtnText: { color: '#888', fontSize: 13 },
});

export default AdminBookingScreen;