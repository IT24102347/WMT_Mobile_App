import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Animated, Dimensions, StatusBar
} from 'react-native';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const menuItems = [
        { title: 'Student\nManagement', icon: '👤', member: 'Rashmi',   bg: '#FF6B6B', accent: '#FF8E8E', screen: 'StudentManagement' },
        { title: 'Room\nManagement',   icon: '🏠', member: 'Samadi',    bg: '#2EC4B6', accent: '#3DD9CA', screen: 'AdminRooms' },
        { title: 'Payments',           icon: '💳', member: 'Neethini',  bg: '#3A86FF', accent: '#5E9EFF', screen: 'AdminPayments' },
        { title: 'Room\nBooking',      icon: '📅', member: 'Methsani',  bg: '#8338EC', accent: '#9B59F5', screen: 'AdminBookings' },
        { title: 'Complaints',         icon: '📢', member: 'Wathmini',  bg: '#FB5607', accent: '#FF7C3A', screen: 'AdminComplaints' },
    ];

    const stats = [
        { label: 'Students', value: '124', icon: '🎓' },
        { label: 'Rooms',    value: '48',  icon: '🏠' },
        { label: 'Pending',  value: '5',   icon: '⏳' },
    ];

    const CardItem = ({ item }) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;

        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '48%' }}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: item.bg }]}
                    onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start()}
                    onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
                    onPress={() => item.screen && navigation.navigate(item.screen)}
                    activeOpacity={1}
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
            <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerBubble1} />
                    <View style={styles.headerBubble2} />
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={styles.greeting}>Welcome Back 👋</Text>
                                <Text style={styles.userName}>Admin</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.avatarBtn}
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Text style={styles.avatarText}>A</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.headerCard}>
                            <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>🔐  ADMINISTRATOR</Text>
                            </View>
                            <Text style={styles.headerCardTitle}>SafeStay Management</Text>
                            <Text style={styles.headerCardSub}>Full access · All modules enabled</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Stats Row */}
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
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.logoutText}>🚪  Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f0faf4' },
    scroll: { flex: 1 },

    // Header - Deep Green
    header: {
        backgroundColor: '#064e3b',
        paddingTop: 55,
        paddingBottom: 30,
        paddingHorizontal: 22,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },
    headerBubble1: {
        position: 'absolute',
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: '#065f46',
        top: -60, right: -40,
    },
    headerBubble2: {
        position: 'absolute',
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#047857',
        bottom: -30, left: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 22,
    },
    greeting: { color: '#6ee7b7', fontSize: 13, letterSpacing: 0.5 },
    userName: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginTop: 2 },
    avatarBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#10b981',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    headerCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    },
    adminBadge: {
        backgroundColor: '#10b981',
        borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    adminBadgeText: { color: 'white', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    headerCardTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 4 },
    headerCardSub: { color: '#6ee7b7', fontSize: 12, marginTop: 4 },

    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 20,
        gap: 10,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#064e3b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statIcon:  { fontSize: 20, marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '800', color: '#064e3b' },
    statLabel: { fontSize: 10, color: '#6ee7b7', marginTop: 2, textAlign: 'center', fontWeight: '600' },

    // Section
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#064e3b', marginBottom: 14, letterSpacing: 0.3 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },

    // Cards
    card: {
        borderRadius: 20, padding: 16, marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 10,
        elevation: 5, minHeight: 130,
        justifyContent: 'space-between',
    },
    cardIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    cardIcon:   { fontSize: 22 },
    cardTitle:  { color: '#ffffff', fontSize: 14, fontWeight: '700', lineHeight: 20, flex: 1 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)', marginRight: 5 },
    cardMember: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500' },

    // Logout
    logoutBtn: {
        marginHorizontal: 20, marginTop: 24,
        backgroundColor: '#064e3b',
        borderRadius: 16, paddingVertical: 16,
        alignItems: 'center',
    },
    logoutText: { color: '#ffffff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
});

export default AdminDashboardScreen;