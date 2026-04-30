import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, Modal, ScrollView, Image,
    KeyboardAvoidingView, Platform, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const API_BASE = 'http://192.168.8.166:5000/api';

const EMPTY_FORM = {
    roomNumber: '',
    roomType: 'Single',
    pricePerMonth: '',
    capacity: '',
    currentOccupancy: '0',
    description: '',
    image: '',
    availabilityStatus: 'Available'
};

const Adminroomscreen = ({ navigation }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`${API_BASE}/rooms`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.4, 
            base64: true,
        });

        if (!result.canceled) {
            setForm({ ...form, image: `data:image/jpeg;base64,${result.assets[0].base64}` });
        }
    };

    // ✅ DATABASE SAVE FIX
    const handleSave = async () => {
        if (!form.roomNumber || !form.pricePerMonth || !form.capacity) {
            Alert.alert("Error", "Required fields are missing!");
            return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const method = editingRoom ? 'PUT' : 'POST';
            const url = editingRoom ? `${API_BASE}/rooms/${editingRoom._id}` : `${API_BASE}/rooms`;

            
            const payload = {
                ...form,
                pricePerMonth: Number(form.pricePerMonth),
                capacity: Number(form.capacity),
                currentOccupancy: Number(form.currentOccupancy)
            };

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                Alert.alert("Success", "Room details saved to database!");
                setModalVisible(false);
                fetchRooms();
            } else {
                Alert.alert("Error", data.msg || "Database save failed");
            }
        } catch (err) {
            Alert.alert("Error", "Server connection failed. Check your IP Address.");
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ DELETE BUTTON FIX
    const handleDelete = (room) => {
        Alert.alert(
            "Delete Room",
            `Are you sure you want to delete room ${room.roomNumber}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            const res = await fetch(`${API_BASE}/rooms/${room._id}`, {
                                method: 'DELETE',
                                headers: { 
                                    'Content-Type': 'application/json',
                                    'x-auth-token': token 
                                }
                            });

                            if (res.ok) {
                                Alert.alert("Success", "Room deleted successfully");
                                fetchRooms();
                            } else {
                                const errData = await res.json();
                                Alert.alert("Error", errData.msg || "Could not delete");
                            }
                        } catch (err) {
                            Alert.alert("Error", "Network error");
                        }
                    }
                }
            ]
        );
    };

    const renderRoomItem = ({ item }) => (
        <View style={styles.card}>
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
            ) : (
                <View style={styles.noImageBox}><Text>No Photo</Text></View>
            )}
            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.cardTitle}>Room {item.roomNumber}</Text>
                    <Text style={{ color: '#666' }}>{item.roomType} • LKR {item.pricePerMonth}</Text>
                </View>
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => { setEditingRoom(item); setForm(item); setModalVisible(true); }}>
                        <Text style={styles.editBtn}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)}>
                        <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>⬅️</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Room Management</Text>
                <TouchableOpacity onPress={() => { setEditingRoom(null); setForm(EMPTY_FORM); setModalVisible(true); }} style={styles.addBtn}>
                    <Text style={styles.addText}>+</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2EC4B6" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={rooms}
                    keyExtractor={(item) => item._id}
                    renderItem={renderRoomItem}
                    contentContainerStyle={{ padding: 15 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchRooms} />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide">
                <ScrollView contentContainerStyle={styles.modalBody}>
                    <Text style={styles.modalTitle}>{editingRoom ? 'Update Room' : 'New Room'}</Text>
                    
                    <TouchableOpacity style={styles.pickerBox} onPress={handlePickImage}>
                        {form.image ? <Image source={{ uri: form.image }} style={styles.pickedImg} /> : <Text>📷 Add Image</Text>}
                    </TouchableOpacity>

                    <Text style={styles.label}>Room Number</Text>
                    <TextInput style={styles.input} value={form.roomNumber} onChangeText={(v) => setForm({...form, roomNumber: v})} placeholder="Ex: A1" />
                    
                    <Text style={styles.label}>Monthly Price (LKR)</Text>
                    <TextInput style={styles.input} value={String(form.pricePerMonth)} onChangeText={(v) => setForm({...form, pricePerMonth: v})} keyboardType="numeric" />
                    
                    <Text style={styles.label}>Capacity</Text>
                    <TextInput style={styles.input} value={String(form.capacity)} onChangeText={(v) => setForm({...form, capacity: v})} keyboardType="numeric" />

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={submitting}>
                        <Text style={styles.saveBtnText}>{submitting ? 'Processing...' : 'Save to Database'}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelLink}>
                        <Text style={{ color: 'red' }}>Cancel</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff', elevation: 2 },
    backIcon: { fontSize: 24, marginRight: 15 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    addBtn: { backgroundColor: '#2EC4B6', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    addText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 3 },
    cardImage: { width: '100%', height: 150 },
    noImageBox: { width: '100%', height: 150, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
    cardContent: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold' },
    actionRow: { flexDirection: 'row', alignItems: 'center' },
    editBtn: { color: '#2EC4B6', fontWeight: 'bold', marginRight: 15 },
    deleteBtnText: { color: '#FF6B6B', fontWeight: 'bold' },
    modalBody: { padding: 25, paddingTop: 60 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    pickerBox: { height: 180, backgroundColor: '#f0f0f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
    pickedImg: { width: '100%', height: '100%' },
    label: { fontWeight: 'bold', marginBottom: 5 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
    saveBtn: { backgroundColor: '#2EC4B6', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontWeight: 'bold' },
    cancelLink: { marginTop: 20, alignItems: 'center' }
});

export default Adminroomscreen;