// src/StudentComplaintScreen.js

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Platform, RefreshControl, Modal,
    TextInput, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://wmt-mobile-app-xksy.vercel.app/api';

const getToken = async () => {
    try {
        if (Platform.OS === 'web') return localStorage.getItem('token');
        return await AsyncStorage.getItem('token');
    } catch (err) {
        console.error('getToken error:', err);
        return null;
    }
};

const StudentComplaintScreen = ({ navigation }) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('All');
    const [addModal, setAddModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('Other');
    const [submitting, setSubmitting] = useState(false);

    const categories = ['Room Issue', 'Maintenance', 'Payment Issue', 'Other'];

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Error', 'Session expired. Please login again.');
                setLoading(false);
                setRefreshing(false);
                return;
            }
            const res = await fetch(`${API_BASE}/complaints/my`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setComplaints(Array.isArray(data) ? data : []);
            } else {
                Alert.alert('Error', data.msg || 'Failed to fetch complaints');
            }
        } catch (err) {
            console.error('Fetch complaints error:', err);
            Alert.alert('Error', `Fetch complaints error: ${err.message}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) {
            const msg = 'Enter a Subject and Message.';
            Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
            return;
        }
        setSubmitting(true);
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Error', 'Session expired. Please login again.');
                return;
            }
            const res = await fetch(`${API_BASE}/complaints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ subject, message, category })
            });
            const data = await res.json();
            if (res.ok) {
                setAddModal(false);
                setSubject('');
                setMessage('');
                setCategory('Other');
                const successMsg = 'Complaint submitted! Admin review in progress. 📢';
                Platform.OS === 'web' ? alert(successMsg) : Alert.alert('Success ✅', successMsg);
                fetchComplaints();
            } else {
                const errMsg = data.msg || 'Submit failed';
                Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Error', errMsg);
            }
        } catch (err) {
            const errMsg = `Complaint submit error: ${err.message}`;
            Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Error', errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const statusColor = (s) => {
        if (s === 'Resolved') return '#10b981';
        if (s === 'In Progress') return '#3A86FF';
        return '#f59e0b';
    };

    const statusIcon = (s) => {
        if (s === 'Resolved') return '✅';
        if (s === 'In Progress') return '🔄';
        return '⏳';
    };

    // Filter logic
    const filteredComplaints = filter === 'All'
        ? complaints
        : complaints.filter(c => c.status === filter);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>📢 Complaints</Text>
                <TouchableOpacity onPress={() => setAddModal(true)} style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
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

            {/* Filter Buttons */}
            <View style={styles.filterRow}>
                {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                        onPress={() => setFilter(f)}>
                        <Text style={[styles.filterBtnText, filter === f && { color: '#fff' }]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Complaints List */}
            {loading ? (
                <ActivityIndicator size="large" color="#FB5607" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredComplaints}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchComplaints(); }}
                        />
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ fontSize: 50 }}>📢</Text>
                            <Text style={{ color: '#aaa', marginTop: 10, fontSize: 15 }}>Complaints නැත</Text>
                            {filter === 'All' && (
                                <Text style={{ color: '#aaa', fontSize: 12, marginTop: 5 }}>+ New button click කරන්න</Text>
                            )}
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{item.category}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{statusIcon(item.status)} {item.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.subject}>{item.subject}</Text>
                            <Text style={styles.messageText} numberOfLines={3}>{item.message}</Text>
                            {item.adminReply ? (
                                <View style={styles.replyBox}>
                                    <Text style={styles.replyLabel}>💬 Admin Reply:</Text>
                                    <Text style={styles.replyText}>{item.adminReply}</Text>
                                </View>
                            ) : null}
                            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                    )}
                />
            )}

            {/* Add Complaint Modal */}
            <Modal visible={addModal} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>📢 New Complaint</Text>

                            <Text style={styles.modalLabel}>Category</Text>
                            <View style={styles.catRow}>
                                {categories.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.catBtn, category === c && styles.catBtnActive]}
                                        onPress={() => setCategory(c)}>
                                        <Text style={[styles.catBtnText, category === c && { color: '#fff' }]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.modalLabel}>Subject *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. Water leak in room"
                                value={subject}
                                onChangeText={setSubject}
                                maxLength={100}
                            />

                            <Text style={styles.modalLabel}>Message *</Text>
                            <TextInput
                                style={[styles.modalInput, { height: 100 }]}
                                placeholder="Describe the problem..."
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                maxLength={500}
                            />
                            <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 16, textAlign: 'right' }}>
                                {message.length}/500
                            </Text>

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                                onPress={handleSubmit}
                                disabled={submitting}>
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                                    {submitting ? 'Submitting...' : '📢 Submit Complaint'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { setAddModal(false); setSubject(''); setMessage(''); setCategory('Other'); }}
                                style={{ marginTop: 12 }}>
                                <Text style={{ textAlign: 'center', color: '#ef4444', fontWeight: '700' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff5f0' },
    header: {
        backgroundColor: '#FB5607', paddingTop: 55, paddingBottom: 20,
        paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    addBtn: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
    stat: { flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 14, alignItems: 'center', elevation: 3 },
    statNum: { color: '#fff', fontSize: 18, fontWeight: '800' },
    statLab: { color: '#fff', fontSize: 11, marginTop: 2 },

    filterRow: {
        flexDirection: 'row', justifyContent: 'space-around',
        paddingHorizontal: 16, marginBottom: 4
    },
    filterBtn: {
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#fff', elevation: 2,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4
    },
    filterBtnActive: { backgroundColor: '#FB5607' },
    filterBtnText: { fontSize: 12, fontWeight: '600', color: '#666' },

    card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 3 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    categoryBadge: {
        backgroundColor: '#fff5f0', borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 1, borderColor: '#fb8c5e'
    },
    categoryText: { color: '#FB5607', fontSize: 11, fontWeight: '700' },
    statusBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    subject: { fontWeight: '800', fontSize: 16, color: '#1a1a2e', marginBottom: 6 },
    messageText: { color: '#666', fontSize: 13, lineHeight: 20, marginBottom: 8 },
    replyBox: {
        backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10,
        marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#10b981'
    },
    replyLabel: { color: '#10b981', fontWeight: '700', fontSize: 12, marginBottom: 3 },
    replyText: { color: '#444', fontSize: 13 },
    dateText: { color: '#aaa', fontSize: 11 },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', backgroundColor: '#fff', padding: 24, borderRadius: 25 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center', color: '#FB5607' },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
    modalInput: {
        backgroundColor: '#fff5f0', borderRadius: 12, padding: 14,
        marginBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#fdd9c8'
    },
    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    catBtn: {
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
        backgroundColor: '#fff5f0', borderWidth: 1, borderColor: '#fdd9c8'
    },
    catBtnActive: { backgroundColor: '#FB5607', borderColor: '#FB5607' },
    catBtnText: { fontSize: 12, fontWeight: '600', color: '#FB5607' },
    submitBtn: { backgroundColor: '#FB5607', padding: 16, borderRadius: 14, alignItems: 'center' },
});

export default StudentComplaintScreen;