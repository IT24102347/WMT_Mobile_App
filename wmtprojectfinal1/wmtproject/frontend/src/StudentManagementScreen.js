import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Modal, Alert, Image, ActivityIndicator, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://wmt-mobile-app-xksy.vercel.app/api';

const StudentManagementScreen = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', course: 'Software Engineering', phone: '' });

  useEffect(() => { fetchStudents(); }, []);

  const getToken = async () => {
    if (Platform.OS === 'web') return localStorage.getItem('token');
    return await AsyncStorage.getItem('token');
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/students`, { 
        headers: { 'x-auth-token': token } 
      });
      const data = await res.json();
      if (res.ok) setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Network error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const seCount = students.filter(s => s.course?.toUpperCase().includes('SOFTWARE') || s.course?.toUpperCase() === 'SE').length;
  const itCount = students.filter(s => s.course?.toUpperCase().includes('INFORMATION') || s.course?.toUpperCase() === 'IT').length;
  const aiCount = students.filter(s => s.course?.toUpperCase().includes('ARTIFICIAL') || s.course?.toUpperCase() === 'AI').length;

  const handleDelete = async (id) => {
    const executeDelete = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/students/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        });
        if (res.ok) {
          setStudents(prev => prev.filter(s => s._id !== id));
          Platform.OS === 'web' ? alert("Student deleted!") : Alert.alert("Success", "Student deleted!");
        } else {
          const data = await res.json();
          const msg = data.msg || data.message || "Delete failed";
          Platform.OS === 'web' ? alert(msg) : Alert.alert("Error", msg);
        }
      } catch (err) {
        Platform.OS === 'web' ? alert("Network Error") : Alert.alert("Error", err.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Delete this student?")) executeDelete();
    } else {
      Alert.alert("Confirm Delete", "Delete this student?", [
        { text: "Cancel", style: 'cancel' },
        { text: "Delete", style: 'destructive', onPress: executeDelete },
      ]);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.course) {
      Alert.alert("Validation", "Name, Email, and Course are required.");
      return;
    }
    if (!editingId && !formData.password) {
      Alert.alert("Validation", "Password is required.");
      return;
    }

    try {
      const token = await getToken();
      const url = editingId ? `${API_BASE}/students/${editingId}` : `${API_BASE}/students/register`;
      const method = editingId ? 'PUT' : 'POST';
      const body = { ...formData };
      if (editingId && !body.password) delete body.password;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setModalVisible(false);
        setFormData({ name: '', email: '', password: '', course: 'Software Engineering', phone: '' });
        fetchStudents();
        const msg = editingId ? "Student updated! ✅" : `Student added! ✅\nID: ${data.student?.studentId || ''}`;
        Alert.alert("Success", msg);
      } else {
        Alert.alert("Error", data.msg || data.message || "Save failed");
      }
    } catch (err) {
      Alert.alert("Network Error", err.message);
    }
  };

  const courses = [
    { label: 'SE', value: 'Software Engineering' },
    { label: 'IT', value: 'Information Technology' },
    { label: 'AI', value: 'Artificial Intelligence' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.stat, { backgroundColor: '#064e3b' }]}>
          <Text style={styles.num}>{students.length}</Text><Text style={styles.lab}>Total</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: '#10b981' }]}>
          <Text style={styles.num}>{seCount}</Text><Text style={styles.lab}>SE</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: '#3b82f6' }]}>
          <Text style={styles.num}>{itCount}</Text><Text style={styles.lab}>IT</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: '#8338EC' }]}>
          <Text style={styles.num}>{aiCount}</Text><Text style={styles.lab}>AI</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => { 
        setEditingId(null); 
        setFormData({ name: '', email: '', password: '', course: 'Software Engineering', phone: '' }); 
        setModalVisible(true); 
      }}>
        <Text style={styles.addBtnText}>+ Add New Student</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#064e3b" />
        ) : students.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 40 }}>🎓</Text>
            <Text style={{ color: '#aaa', marginTop: 10 }}>Students නැත</Text>
          </View>
        ) : (
          students.map(s => (
            <View key={s._id} style={styles.card}>
              <Image 
                source={{ uri: s.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=064e3b&color=fff&size=128` }} 
                style={styles.img} 
              />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.cardName}>{s.name}</Text>
                <Text style={styles.cardCourse}>{s.course}</Text>
                <Text style={{ color: '#aaa', fontSize: 11 }}>{s.email}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity onPress={() => { 
                  setEditingId(s._id); 
                  setFormData({ name: s.name, email: s.email, course: s.course, phone: s.phone || '', password: '' }); 
                  setModalVisible(true); 
                }}>
                  <Text style={styles.editBtn}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(s._id)}>
                  <Text style={styles.deleteBtn}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalBody}>
          <Text style={styles.modalTitle}>{editingId ? 'Update Student' : 'New Student'}</Text>
          <TextInput placeholder="Full Name *" style={styles.input} value={formData.name} onChangeText={v => setFormData({ ...formData, name: v })} />
          <TextInput placeholder="Email *" style={styles.input} value={formData.email} onChangeText={v => setFormData({ ...formData, email: v.toLowerCase() })} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Course *</Text>
          <View style={styles.courseRow}>
            {courses.map(c => (
              <TouchableOpacity key={c.value} style={[styles.courseBtn, formData.course === c.value && styles.courseBtnActive]} onPress={() => setFormData({ ...formData, course: c.value })}>
                <Text style={[styles.courseBtnText, formData.course === c.value && styles.courseBtnTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput placeholder="Phone" style={styles.input} value={formData.phone} onChangeText={v => setFormData({ ...formData, phone: v })} keyboardType="phone-pad" />
          <TextInput placeholder={editingId ? "New Password (optional)" : "Password *"} style={styles.input} secureTextEntry value={formData.password} onChangeText={v => setFormData({ ...formData, password: v })} />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{editingId ? 'UPDATE STUDENT' : 'ADD STUDENT'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 15 }}>
            <Text style={{ textAlign: 'center', color: 'red', fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingTop: 50 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginBottom: 5 },
  stat: { width: '23%', padding: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  num: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  lab: { color: '#fff', fontSize: 11 },
  addBtn: { backgroundColor: '#064e3b', margin: 15, padding: 15, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 1 },
  img: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#e5e7eb' },
  cardName: { fontWeight: 'bold', fontSize: 15 },
  cardCourse: { color: '#10b981', fontSize: 12, marginTop: 2 },
  editBtn: { color: '#3b82f6', fontWeight: '600', marginBottom: 10 },
  deleteBtn: { color: '#ef4444', fontWeight: '600' },
  modalBody: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: '#064e3b' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, marginBottom: 15, padding: 13, fontSize: 14 },
  saveBtn: { backgroundColor: '#064e3b', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  label: { fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: '600' },
  courseRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  courseBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  courseBtnActive: { backgroundColor: '#064e3b', borderColor: '#064e3b' },
  courseBtnText: { color: '#6b7280', fontWeight: '600' },
  courseBtnTextActive: { color: '#fff', fontWeight: '600' },
});

export default StudentManagementScreen;