import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Platform, RefreshControl, Modal,
    TextInput, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://wmt-mobile-app-xksy.vercel.app/api';

// Token එක ලබාගැනීමේ function එක නිවැරදි කර ඇත
const getToken = async () => {
    try {
        if (Platform.OS === 'web') return localStorage.getItem('token');
        return await AsyncStorage.getItem('token');
    } catch (err) {
        console.error('getToken error:', err);
        return null;
    }
};

const AdminComplaintScreen = ({ navigation }) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('All');
    const [replyModal, setReplyModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    const statuses = ['Pending', 'In Progress', 'Resolved'];

    useEffect(() => { 
        fetchComplaints(); 
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            
            if (!token) {
                console.error("No token found");
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE}/complaints`, {
                method: 'GET',
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            
            if (res.ok) {
                setComplaints(Array.isArray(data) ? data : []);
            } else {
                console.error('API Error:', data.msg);
            }
        } catch (err) {
            console.error('Fetch complaints error:', err);
            // Error එක screen එකේ පෙන්වීමට
            Platform.OS === 'web' ? alert("Error: " + err.message) : Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setUpdating(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/complaints/${selected._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-auth-token': token 
                },
                body: JSON.stringify({ status: newStatus, adminReply: replyText })
            });

            if (res.ok) {
                setReplyModal(false);
                const msg = 'Complaint updated! ✅';
                Platform.OS === 'web' ? alert(msg) : Alert.alert('Success', msg);
                fetchComplaints();
            }
        } catch (err) {
            console.error('Update error:', err);
        } finally {
            setUpdating(false);
        }
    };

    const openReply = (complaint) => {
        setSelected(complaint);
        setReplyText(complaint.adminReply || '');
        setNewStatus(complaint.status);
        setReplyModal(true);
    };

    const handleDelete = (id) => {
        const doDelete = async () => {
            try {
                const token = await getToken();
                await fetch(`${API_BASE}/complaints/${id}`, { 
                    method: 'DELETE', 
                    headers: { 'x-auth-token': token } 
                });
                fetchComplaints();
            } catch (err) {
                console.error('Delete error:', err);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Delete this complaint?')) doDelete();
        } else {
            Alert.alert('Delete', 'Delete this complaint?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete }
            ]);
        }
    };

    const statusColor = (s) => {
        if (s === 'Resolved') return '#10b981';
        if (s === 'In Progress') return '#3A86FF';
        return '#f59e0b';
    };

    const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>📢 Complaints Admin</Text>
                <View style={{ width: 50 }} />
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={[styles.stat, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.statNum}>{complaints.filter(c => c.status === 'Pending').length}</Text>
                    <Text style={styles.statLab}>Pending</Text>
                </View>
                <View style={[styles.stat, { backgroundColor: '#3A86FF' }]}>
                    <Text style={styles.statNum}>{complaints.filter(c => c.status === 'In Progress').length}</Text>
                    <Text style={styles.statLab}>In Progress</Text>
                </View>
                <View style={[styles.stat, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.statNum}>{complaints.filter(c => c.status === 'Resolved').length}</Text>
                    <Text style={styles.statLab}>Resolved</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
                    <TouchableOpacity key={f}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                        onPress={() => setFilter(f)}>
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <ActivityIndicator size="large" color="#FB5607" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchComplaints(); }} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ fontSize: 50 }}>📢</Text>
                            <Text style={{ color: '#aaa', marginTop: 10 }}>Complaints නැත</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.studentName}>👤 {item.student?.name || 'Unknown User'}</Text>
                                    <Text style={styles.studentId}>🪪 {item.student?.studentId || 'N/A'}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>
                            <Text style={styles.subject}>{item.subject}</Text>
                            <Text style={styles.messageText}>{item.message}</Text>
                            {item.adminReply ? (
                                <View style={styles.replyBox}>
                                    <Text style={styles.replyLabel}>💬 Your Reply:</Text>
                                    <Text style={styles.replyText}>{item.adminReply}</Text>
                                </View>
                            ) : null}
                            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#3A86FF' }]}
                                    onPress={() => openReply(item)}>
                                    <Text style={styles.actionBtnText}>💬 Reply</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                                    onPress={() => handleDelete(item._id)}>
                                    <Text style={styles.actionBtnText}>🗑 Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Reply Modal */}
            <Modal visible={replyModal} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>💬 Reply & Update</Text>
                        <Text style={styles.modalLabel}>Status</Text>
                        <View style={styles.statusRow}>
                            {statuses.map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.statusBtn, newStatus === s && { backgroundColor: statusColor(s) }]}
                                    onPress={() => setNewStatus(s)}>
                                    <Text style={[styles.statusBtnText, newStatus === s && { color: '#fff' }]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.modalLabel}>Admin Reply</Text>
                        <TextInput
                            style={[styles.modalInput, { height: 90 }]}
                            placeholder="Reply to Student..."
                            value={replyText}
                            onChangeText={setReplyText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.updateBtn, updating && { opacity: 0.6 }]}
                            onPress={handleUpdate}
                            disabled={updating}>
                            <Text style={{ color: '#fff', fontWeight: '700' }}>
                                {updating ? 'Updating...' : '✅ Update'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setReplyModal(false)} style={{ marginTop: 12 }}>
                            <Text style={{ textAlign: 'center', color: '#ef4444' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Styles remain same as your original code
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff5f0' },
    header: {
        backgroundColor: '#FB5607', paddingTop: 55, paddingBottom: 20,
        paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
    stat: { flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 14, alignItems: 'center', elevation: 3 },
    statNum: { color: '#fff', fontSize: 18, fontWeight: '800' },
    statLab: { color: '#fff', fontSize: 11, marginTop: 2 },
    filterScroll: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 50 },
    filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, elevation: 1 },
    filterBtnActive: { backgroundColor: '#FB5607' },
    filterText: { color: '#888', fontWeight: '600', fontSize: 13 },
    filterTextActive: { color: '#fff' },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 3 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    studentName: { fontWeight: '700', fontSize: 15, color: '#1a1a2e' },
    studentId: { color: '#888', fontSize: 12 },
    statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
    categoryBadge: { backgroundColor: '#fff5f0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#fb8c5e', marginBottom: 8 },
    categoryText: { color: '#FB5607', fontSize: 11, fontWeight: '700' },
    subject: { fontWeight: '800', fontSize: 15, color: '#1a1a2e', marginBottom: 6 },
    messageText: { color: '#666', fontSize: 13, lineHeight: 20, marginBottom: 8 },
    replyBox: { backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#10b981' },
    replyLabel: { color: '#10b981', fontWeight: '700', fontSize: 12, marginBottom: 3 },
    replyText: { color: '#444', fontSize: 13 },
    dateText: { color: '#aaa', fontSize: 11, marginBottom: 10 },
    actionRow: { flexDirection: 'row', gap: 10 },
    actionBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', backgroundColor: '#fff', padding: 24, borderRadius: 25 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14, textAlign: 'center', color: '#FB5607' },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
    modalInput: { backgroundColor: '#fff5f0', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#fdd9c8' },
    statusRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    statusBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center' },
    statusBtnText: { fontSize: 12, fontWeight: '600', color: '#444' },
    updateBtn: { backgroundColor: '#FB5607', padding: 16, borderRadius: 14, alignItems: 'center' },
});

export default AdminComplaintScreen;