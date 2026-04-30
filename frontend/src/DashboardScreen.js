import React, { useState, useEffect, useRef, useCallback } from 'react'; // ✅ useCallback එක් කරන ලදී
import { Platform, View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Animated, Dimensions, StatusBar, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const API_BASE = 'http://192.168.8.166:5000/api';

const DashboardScreen = ({ navigation, route }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const [studentName, setStudentName] = useState('Student');
    const [profileImage, setProfileImage] = useState('');
    const [userRole, setUserRole] = useState('student');

    // ✅ මෙහිදී useFocusEffect භාවිතා කිරීමෙන් වෙනත් screen එකක සිට (Profile) 
    // නැවත Dashboard එකට එන සෑම විටම අලුත් දත්ත fetch වේ.
    useFocusEffect(
        useCallback(() => {
            fetchProfileAndRole();
        }, [])
    );

    const fetchProfileAndRole = async () => {
        try {
            // ✅ Role load කිරීම
            const role = Platform.OS === 'web' ? localStorage.getItem('userRole') : await AsyncStorage.getItem('userRole');
            setUserRole(role || 'student');

            const token = Platform.OS === 'web' ? localStorage.getItem('token') : await AsyncStorage.getItem('token');
            if (!token) return;

            // ✅ Header එක 'x-auth-token' ලෙස වෙනස් කරන ලදී (ඔබේ MyProfile එකේ ඇති පරිදි)
            const response = await fetch(`${API_BASE}/students/profile`, {
                headers: { 'x-auth-token': token } 
            });

            if (response.ok) {
                const data = await response.json();
                // ✅ State එක update කිරීම
                setStudentName(data.name || 'Student');
                setProfileImage(data.profileImage || '');
            }
        } catch (error) {
            console.error('Dashboard profile fetch error:', error);
        }
    };

    // Animation Effect
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    // Menu items and other components (එලෙසම පවතී...)
    const menuItems = [
        { title: 'Student\nManagement', icon: '👤', member: 'Rashmi', bg: '#FF6B6B', accent: '#FF8E8E', navTo: 'MyProfile' },
        { 
            title: 'Room\nManagement', icon: '🏠', member: 'Samadi', bg: '#2EC4B6', accent: '#3DD9CA',
            get navTo() { return userRole === 'admin' ? 'AdminRooms' : 'StudentRooms'; }
        },
        { title: 'Payments', icon: '💳', member: 'Neethini', bg: '#3A86FF', accent: '#5E9EFF', get navTo() { return userRole === 'admin' ? 'AdminPayments' : 'StudentPayments'; } },
        { title: 'Room\nBooking', icon: '📅', member: 'Methsani', bg: '#8338EC', accent: '#9B59F5', get navTo() { return userRole === 'admin' ? 'AdminBookings' : 'StudentRooms'; } },
        { title: 'Complaints', icon: '📢', member: 'Wathmini', bg: '#FB5607', accent: '#FF7C3A', get navTo() { return userRole === 'admin' ? 'AdminComplaints' : 'StudentComplaints'; } },
    ];

    const stats = [
        { label: 'Total Rooms', value: '48', icon: '🏢' },
        { label: 'Occupied', value: '36', icon: '✅' },
        { label: 'Pending', value: '5', icon: '⏳' },
    ];

    const CardItem = ({ item }) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;
        const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
        const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();

        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '48%' }}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: item.bg }]}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    activeOpacity={1}
                    onPress={() => {
                        const dest = typeof item.navTo === 'function' ? item.navTo() : item.navTo;
                        if (dest) navigation.navigate(dest);
                    }}
                >
                    <View style={[styles.cardIconBg, { backgroundColor: item.accent }]}>
                        <Text style={styles.cardIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.cardFooter}>
                        <View style={styles.dot} />
                        <Text style={styles.cardMember}>{item.member}</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <View style={styles.headerBubble1} />
                    <View style={styles.headerBubble2} />
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={styles.greeting}>Good Day 👋</Text>
                                <Text style={styles.userName}>{studentName}</Text>
                                <View style={[styles.roleBadge, userRole === 'admin' && styles.roleBadgeAdmin]}>
                                    <Text style={styles.roleBadgeText}>{userRole === 'admin' ? '🔐 Admin' : '🎓 Student'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('MyProfile')}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>{studentName.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.headerCard}>
                            <Text style={styles.headerCardLabel}>SafeStay</Text>
                            <Text style={styles.headerCardTitle}>Hostel Management</Text>
                            <Text style={styles.headerCardSub}>Manage everything in one place</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Stats */}
                <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                    {stats.map((s, i) => (
                        <View key={i} style={styles.statBox}>
                            <Text style={styles.statIcon}>{s.icon}</Text>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Menu */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>Modules</Text>
                    <View style={styles.grid}>
                        {menuItems.map((item, index) => (
                            <CardItem key={index} item={item} />
                        ))}
                    </View>
                </Animated.View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
                    if (Platform.OS === 'web') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userRole');
                    } else {
                        await AsyncStorage.removeItem('token');
                        await AsyncStorage.removeItem('userRole');
                    }
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                }}>
                    <Text style={styles.logoutText}>🚪   Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// Styles (පවතින පරිදිම භාවිතා කරන්න...)
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F2F8' },
    scroll: { flex: 1 },
    header: {
        backgroundColor: '#1a1a2e', paddingTop: 55, paddingBottom: 30,
        paddingHorizontal: 22, borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        overflow: 'hidden', position: 'relative',
    },
    headerBubble1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#16213e', top: -60, right: -40 },
    headerBubble2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#0f3460', bottom: -30, left: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
    greeting: { color: '#a0aec0', fontSize: 13, letterSpacing: 0.5 },
    userName: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginTop: 2 },
    roleBadge: { marginTop: 6, backgroundColor: 'rgba(251,91,90,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
    roleBadgeAdmin: { backgroundColor: 'rgba(16,185,129,0.25)' },
    roleBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    avatarBtn: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FB5B5A', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
    avatarImage: { width: 58, height: 58, borderRadius: 29 },
    avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 22 },
    headerCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    headerCardLabel: { color: '#FB5B5A', fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
    headerCardTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 4 },
    headerCardSub: { color: '#a0aec0', fontSize: 12, marginTop: 4 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 20, gap: 10 },
    statBox: { flex: 1, backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 14, alignItems: 'center', elevation: 3 },
    statIcon: { fontSize: 20, marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },
    statLabel: { fontSize: 10, color: '#a0aec0', marginTop: 2, textAlign: 'center', fontWeight: '500' },
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    card: { borderRadius: 20, padding: 16, marginBottom: 4, elevation: 5, minHeight: 130, justifyContent: 'space-between' },
    cardIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    cardIcon: { fontSize: 22 },
    cardTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', lineHeight: 20, flex: 1 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)', marginRight: 5 },
    cardMember: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500' },
    logoutBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: '#1a1a2e', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    logoutText: { color: '#ffffff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
});

export default DashboardScreen;