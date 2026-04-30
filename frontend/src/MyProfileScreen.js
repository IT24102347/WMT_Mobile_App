import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Modal, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const API_BASE = 'http://192.168.8.166:5000/api';

// ✅ Web + Mobile token helper
const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('token');
    return await AsyncStorage.getItem('token');
};
const removeToken = async () => {
    if (Platform.OS === 'web') localStorage.removeItem('token');
    else await AsyncStorage.removeItem('token');
};

const MyProfileScreen = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [passModal, setPassModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', profileImage: '', course: '' });
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/students/profile`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data);
                setFormData({
                    name: data.name,
                    phone: data.phone || '',
                    profileImage: data.profileImage || '',
                    course: data.course
                });
            }
        } catch (err) {
            console.error("Profile Fetch Error:", err);
        }
    };

    const pickImage = async () => {
        if (Platform.OS === 'web') {
            // Web: file input use කරන්න
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    setFormData({ ...formData, profileImage: reader.result });
                };
                reader.readAsDataURL(file);
            };
            input.click();
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "ගැලරියට අවසර දෙන්න.");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true
        });
        if (!result.canceled) {
            setFormData({ ...formData, profileImage: `data:image/jpeg;base64,${result.assets[0].base64}` });
        }
    };

    const handleUpdate = async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/students/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert("Success ✅", "Profile updated!");
                setEditing(false);
                fetchProfile();
            } else {
                Alert.alert("Error", data.msg || "Update failed");
            }
        } catch (err) {
            Alert.alert("Error", "Server connection failed.");
        }
    };

    const handleChangePassword = async () => {
        if (!passData.currentPassword || !passData.newPassword) {
            Alert.alert("Error", "Passwords ඇතුළත් කරන්න.");
            return;
        }
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/students/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(passData)
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert("Success", data.msg);
                setPassModal(false);
                await removeToken();
                navigation.replace('Login');
            } else {
                Alert.alert("Error", data.msg);
            }
        } catch (err) {
            Alert.alert("Error", "Server error");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.headerBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => setEditing(!editing)}>
                    <Text style={styles.headerBtnText}>{editing ? 'Cancel' : 'Edit'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.profileBox}>
                <TouchableOpacity onPress={editing ? pickImage : null}>
                    <Image
                        source={{ uri: formData.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name || 'U') + '&background=064e3b&color=fff&size=150' }}
                        style={styles.avatar}
                    />
                    {editing && <Text style={styles.changeText}>Change Photo</Text>}
                </TouchableOpacity>

                <View style={styles.infoSection}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={[styles.input, !editing && styles.disabled]}
                        value={formData.name}
                        editable={editing}
                        onChangeText={t => setFormData({ ...formData, name: t })}
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={[styles.input, !editing && styles.disabled]}
                        value={formData.phone}
                        editable={editing}
                        keyboardType="phone-pad"
                        onChangeText={t => setFormData({ ...formData, phone: t })}
                    />

                    <Text style={styles.label}>Course</Text>
                    <TextInput style={[styles.input, styles.disabled]} value={formData.course} editable={false} />

                    <Text style={styles.label}>Student ID</Text>
                    <TextInput style={[styles.input, styles.disabled]} value={profile ? profile.studentId : ''} editable={false} />
                </View>

                {editing && (
                    <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                        <Text style={styles.btnText}>Update Profile</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.passBtn} onPress={() => setPassModal(true)}>
                    <Text style={styles.passBtnText}>Change Password</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={passModal} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Password</Text>
                        <TextInput
                            placeholder="Current Password"
                            secureTextEntry
                            style={styles.modalInput}
                            onChangeText={t => setPassData({ ...passData, currentPassword: t })}
                        />
                        <TextInput
                            placeholder="New Password"
                            secureTextEntry
                            style={styles.modalInput}
                            onChangeText={t => setPassData({ ...passData, newPassword: t })}
                        />
                        <TouchableOpacity style={styles.saveBtnModal} onPress={handleChangePassword}>
                            <Text style={styles.btnText}>Change Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPassModal(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5fdfa' },
    header: {
        backgroundColor: '#064e3b', paddingTop: 60, paddingBottom: 60,
        paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    headerBtnText: { color: '#fff', fontWeight: 'bold' },
    profileBox: { alignItems: 'center', marginTop: -50 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff' },
    changeText: { color: '#10b981', fontSize: 12, marginTop: 5, fontWeight: 'bold', textAlign: 'center' },
    infoSection: { width: '90%', marginTop: 20 },
    label: { fontSize: 13, color: '#064e3b', fontWeight: 'bold', marginBottom: 5, marginLeft: 5 },
    input: { backgroundColor: '#e9e9f0', padding: 15, borderRadius: 15, marginBottom: 15, fontSize: 14 },
    disabled: { color: '#888' },
    saveBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 15, width: '90%', alignItems: 'center', marginTop: 10 },
    saveBtnModal: { backgroundColor: '#10b981', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    passBtn: { marginTop: 20, padding: 10 },
    passBtnText: { color: '#064e3b', fontWeight: 'bold' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#fff', padding: 25, borderRadius: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#064e3b' },
    modalInput: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 15, marginBottom: 15 },
    cancelText: { color: 'red', textAlign: 'center', marginTop: 15, fontWeight: 'bold' }
});

export default MyProfileScreen;