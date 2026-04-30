import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Image, Modal, ScrollView, TextInput, Alert, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.8.166:5000/api';

const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('token');
    return await AsyncStorage.getItem('token');
};

const StudentRoomsScreen = ({ navigation }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [bookingModal, setBookingModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [note, setNote] = useState('');
    const [booking, setBooking] = useState(false);
    const [myBookings, setMyBookings] = useState([]);
    const [tab, setTab] = useState('rooms');

    useEffect(() => { fetchRooms(); fetchMyBookings(); }, []);

    const fetchRooms = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/rooms`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            // Only show available rooms
            const available = Array.isArray(data) ? data.filter(r => r.availabilityStatus === 'Available') : [];
            setRooms(available);
        } catch (e) {
            console.error('Fetch rooms error:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/bookings/my`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setMyBookings(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Fetch my bookings error:', e);
        }
    };

    const handleBook = async () => {
        if (!startDate) {
            Platform.OS === 'web' ? alert('Enter Start Date (YYYY-MM-DD)') : Alert.alert('Error', 'Enter Start Date');
            return;
        }
        setBooking(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ roomId: selectedRoom._id, startDate, note })
            });
            const data = await res.json();
            if (res.ok) {
                const msg = 'Booking request sent! ✅\nAdmin approval will be confirmed.';
                Platform.OS === 'web' ? alert(msg) : Alert.alert('Success! 🎉', msg);
                setBookingModal(false);
                setSelectedRoom(null);
                setStartDate('');
                setNote('');
                fetchMyBookings();
                fetchRooms();
            } else {
                Platform.OS === 'web' ? alert(data.msg) : Alert.alert('Error', data.msg || 'Booking failed');
            }
        } catch (err) {
            Platform.OS === 'web' ? alert('Network error') : Alert.alert('Error', 'Network error');
        } finally {
            setBooking(false);
        }
    };

    const handleCancelBooking = (id) => {
        const doCancel = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_BASE}/bookings/cancel/${id}`, {
                    method: 'PUT',
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                if (res.ok) {
                    Platform.OS === 'web' ? alert(data.msg) : Alert.alert('Success', data.msg);
                    fetchMyBookings();
                    fetchRooms();
                } else {
                    Platform.OS === 'web' ? alert(data.msg) : Alert.alert('Error', data.msg);
                }
            } catch {
                Platform.OS === 'web' ? alert('Network error') : Alert.alert('Error', 'Network error');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to cancel the booking?')) doCancel();
        } else {
            Alert.alert('Cancel Booking', 'Are you sure you want to cancel the booking?', [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', style: 'destructive', onPress: doCancel }
            ]);
        }
    };

    const filtered = rooms.filter(r => {
        const matchSearch = r.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'All' || r.roomType === filterType;
        return matchSearch && matchType;
    });

    const statusColor = (s) => {
        if (s === 'Approved') return '#10b981';
        if (s === 'Rejected') return '#ef4444';
        if (s === 'Cancelled') return '#6b7280';
        return '#f59e0b';
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2EC4B6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rooms</Text>
                <Text style={styles.headerCount}>{filtered.length} available</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity style={[styles.tab, tab === 'rooms' && styles.tabActive]} onPress={() => setTab('rooms')}>
                    <Text style={[styles.tabText, tab === 'rooms' && styles.tabTextActive]}>🏠 Rooms</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tab === 'mybookings' && styles.tabActive]}
                    onPress={() => { setTab('mybookings'); fetchMyBookings(); }}>
                    <Text style={[styles.tabText, tab === 'mybookings' && styles.tabTextActive]}>
                        📋 My Bookings ({myBookings.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {tab === 'rooms' ? (
                <>
                    <View style={styles.searchBox}>
                        <TextInput style={styles.searchInput} placeholder="🔍  Search rooms..."
                            value={search} onChangeText={setSearch} />
                    </View>
                    <View style={styles.filterRow}>
                        {['All', 'Single', 'Double', 'Triple'].map(t => (
                            <TouchableOpacity key={t}
                                style={[styles.filterBtn, filterType === t && styles.filterBtnActive]}
                                onPress={() => setFilterType(t)}>
                                <Text style={[styles.filterBtnText, filterType === t && styles.filterBtnTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <FlatList
                        data={filtered}
                        keyExtractor={item => item._id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={{ fontSize: 48 }}>🏠</Text>
                                <Text style={styles.emptyText}>Available rooms නැත</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.card} onPress={() => setSelectedRoom(item)}>
                                {item.image ? (
                                    <Image source={{ uri: item.image }} style={styles.roomImage} />
                                ) : (
                                    <View style={styles.roomImagePlaceholder}>
                                        <Text style={{ fontSize: 36 }}>🏠</Text>
                                    </View>
                                )}
                                <View style={styles.cardBody}>
                                    <View style={styles.cardTop}>
                                        <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
                                        <View style={styles.availableBadge}>
                                            <Text style={styles.availableBadgeText}>Available</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.roomType}>{item.roomType} Room</Text>
                                    <Text style={styles.roomDesc} numberOfLines={2}>{item.description || 'No description'}</Text>
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.roomPrice}>Rs. {item.pricePerMonth}<Text style={styles.perMonth}>/month</Text></Text>
                                        <TouchableOpacity style={styles.bookBtn}
                                            onPress={() => { setSelectedRoom(item); setBookingModal(true); }}>
                                            <Text style={styles.bookBtnText}>Book Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                    {myBookings.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={{ fontSize: 48 }}>📋</Text>
                            <Text style={styles.emptyText}>Bookings නැත</Text>
                        </View>
                    ) : (
                        myBookings.map(b => (
                            <View key={b._id} style={styles.bookingCard}>
                                <View style={styles.bookingCardTop}>
                                    <Text style={styles.bookingRoom}>🏠 Room {b.room?.roomNumber || 'N/A'}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: statusColor(b.status) }]}>
                                        <Text style={styles.statusText}>{b.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.bookingDetail}>Type: {b.room?.roomType}</Text>
                                <Text style={styles.bookingDetail}>Price: Rs. {b.room?.pricePerMonth}/month</Text>
                                <Text style={styles.bookingDetail}>Start: {new Date(b.startDate).toLocaleDateString()}</Text>
                                {b.note ? <Text style={styles.bookingDetail}>Note: {b.note}</Text> : null}
                                {b.status === 'Pending' && (
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelBooking(b._id)}>
                                        <Text style={styles.cancelBtnText}>✖ Cancel Request</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Booking Form Modal */}
            <Modal visible={bookingModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '60%' }]}>
                        <ScrollView contentContainerStyle={styles.modalBody}>
                            <Text style={styles.modalRoomNum}>📅 Book Room {selectedRoom?.roomNumber}</Text>
                            <Text style={styles.bookingFormLabel}>Start Date (YYYY-MM-DD) *</Text>
                            <TextInput style={styles.bookingInput} placeholder="e.g. 2026-05-01"
                                value={startDate} onChangeText={setStartDate} />
                            <Text style={styles.bookingFormLabel}>Note (Optional)</Text>
                            <TextInput style={[styles.bookingInput, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Extra info..." value={note} onChangeText={setNote} multiline />
                            <TouchableOpacity style={[styles.bookBtnLarge, booking && { opacity: 0.6 }]}
                                onPress={handleBook} disabled={booking}>
                                <Text style={styles.bookBtnLargeText}>{booking ? 'Sending...' : '✅ Confirm Booking'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeBtn}
                                onPress={() => { setBookingModal(false); setStartDate(''); setNote(''); }}>
                                <Text style={styles.closeBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        backgroundColor: '#2EC4B6', paddingTop: 55, paddingBottom: 20,
        paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    backText: { color: '#fff', fontSize: 16 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    headerCount: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    tabRow: { flexDirection: 'row', margin: 16, backgroundColor: '#e0fdf4', borderRadius: 14, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
    tabActive: { backgroundColor: '#2EC4B6' },
    tabText: { color: '#888', fontWeight: '600', fontSize: 13 },
    tabTextActive: { color: '#fff', fontWeight: '700' },
    searchBox: { paddingHorizontal: 16, marginBottom: 8 },
    searchInput: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 11, fontSize: 14, elevation: 2 },
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
    filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', elevation: 1 },
    filterBtnActive: { backgroundColor: '#2EC4B6' },
    filterBtnText: { color: '#888', fontWeight: '600', fontSize: 12 },
    filterBtnTextActive: { color: '#fff' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#aaa', marginTop: 12, fontSize: 15 },
    card: { backgroundColor: '#fff', borderRadius: 18, marginBottom: 14, elevation: 3, overflow: 'hidden' },
    roomImage: { width: '100%', height: 160 },
    roomImagePlaceholder: { width: '100%', height: 120, backgroundColor: '#e0fdf4', alignItems: 'center', justifyContent: 'center' },
    cardBody: { padding: 14 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    roomNumber: { fontWeight: '700', fontSize: 16, color: '#1a1a2e' },
    availableBadge: { backgroundColor: '#10b981', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    availableBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    roomType: { color: '#2EC4B6', fontWeight: '600', fontSize: 13, marginTop: 4 },
    roomDesc: { color: '#777', fontSize: 13, marginTop: 4, lineHeight: 18 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    roomPrice: { color: '#1a1a2e', fontWeight: '800', fontSize: 16 },
    perMonth: { color: '#aaa', fontWeight: '400', fontSize: 12 },
    bookBtn: { backgroundColor: '#2EC4B6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    bookingCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
    bookingCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    bookingRoom: { fontWeight: '700', fontSize: 16, color: '#1a1a2e' },
    statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    bookingDetail: { color: '#555', fontSize: 13, marginBottom: 3 },
    cancelBtn: { marginTop: 10, borderWidth: 1, borderColor: '#ef4444', borderRadius: 10, padding: 10, alignItems: 'center' },
    cancelBtnText: { color: '#ef4444', fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
    modalBody: { padding: 20 },
    modalRoomNum: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 16 },
    bookBtnLarge: { backgroundColor: '#2EC4B6', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
    bookBtnLargeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    closeBtn: { backgroundColor: '#f0fdf4', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    closeBtnText: { color: '#2EC4B6', fontWeight: '700', fontSize: 15 },
    bookingFormLabel: { fontWeight: '600', color: '#064e3b', marginBottom: 6, marginTop: 10 },
    bookingInput: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, marginBottom: 4, fontSize: 14 },
});

export default StudentRoomsScreen;