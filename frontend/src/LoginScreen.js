import React, { useState, useRef, useEffect } from 'react';
import { Platform, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const API_URL = Platform.OS === 'web'
    ? 'http://localhost:5000'
    : 'http://192.168.8.166:5000';

const saveToken = async (token) => {
    if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
    } else {
        await AsyncStorage.setItem('token', token);
    }
};

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(bgAnim, { toValue: 1, duration: 4000, useNativeDriver: false }),
                Animated.timing(bgAnim, { toValue: 0, duration: 4000, useNativeDriver: false }),
            ])
        ).start();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        try {
            const endpoint = isAdmin
                ? `${API_URL}/api/students/admin/login`
                : `${API_URL}/api/students/login`;

            const response = await axios.post(endpoint, {
                email: email.trim().toLowerCase(),
                password: password.trim()
            });

            if (response.data.token) {
                await saveToken(response.data.token);

                // ✅ Role AsyncStorage 
                if (Platform.OS === 'web') {
                        localStorage.setItem('userRole', isAdmin ? 'admin' : 'student');
                    } else {
                        await AsyncStorage.setItem('userRole', isAdmin ? 'admin' : 'student');
                    }

                if (isAdmin) {
                    navigation.navigate('AdminDashboard');
                } else {
                    navigation.navigate('Dashboard', { studentName: response.data.student.name });
                }
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Login Failed", "Invalid Email or Password");
        }
    };

    const bgColor = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#062a1e', '#0a3d2b']
    });

    return (
        <Animated.View style={[styles.root, { backgroundColor: bgColor }]}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
            <View style={styles.circle4} />
            <View style={styles.overlay} />

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.logoArea}>
                    <View style={styles.logoIconBg}>
                        <Text style={styles.logoIcon}>🏨</Text>
                    </View>
                    <Text style={styles.logo}>SafeStay</Text>
                    <Text style={styles.logoSub}>Your Home Away From Home</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, !isAdmin && styles.toggleActive]}
                            onPress={() => setIsAdmin(false)}
                        >
                            <Text style={[styles.toggleText, !isAdmin && styles.toggleTextActive]}>
                                🎓 Student
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, isAdmin && styles.toggleActiveAdmin]}
                            onPress={() => setIsAdmin(true)}
                        >
                            <Text style={[styles.toggleText, isAdmin && styles.toggleTextActiveAdmin]}>
                                🔐 Admin
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputView}>
                        <Text style={styles.inputIcon}>✉️</Text>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Email Address"
                            placeholderTextColor="#aaa"
                            onChangeText={text => setEmail(text)}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputView}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                            secureTextEntry
                            style={styles.inputText}
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            onChangeText={text => setPassword(text)}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginBtn, isAdmin && styles.adminBtn]}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginText}>
                            {isAdmin ? '🔐  ADMIN LOGIN' : '🎓  LOGIN'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.registerBtn}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerText}>✏️  CREATE ACCOUNT</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    circle1: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(16,185,129,0.12)', top: -100, right: -80 },
    circle2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(16,185,129,0.08)', bottom: -60, left: -80 },
    circle3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.04)', top: height * 0.3, left: -40 },
    circle4: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(16,185,129,0.1)', bottom: height * 0.2, right: -20 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
    content: { width: '100%', alignItems: 'center', paddingHorizontal: 24 },
    logoArea: { alignItems: 'center', marginBottom: 28 },
    logoIconBg: { width: 70, height: 70, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)', marginBottom: 12 },
    logoIcon: { fontSize: 36 },
    logo: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1 },
    logoSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 },
    card: { width: '100%', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 14, marginBottom: 20, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
    toggleActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1 },
    toggleActiveAdmin: { backgroundColor: '#064e3b', elevation: 2 },
    toggleText: { color: '#999', fontWeight: '600', fontSize: 13 },
    toggleTextActive: { color: '#fb5b5a' },
    toggleTextActiveAdmin: { color: '#fff' },
    inputView: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7f7f7', borderRadius: 14, height: 52, marginBottom: 14, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee' },
    inputIcon: { fontSize: 16, marginRight: 10 },
    inputText: { flex: 1, color: '#1a1a1a', fontSize: 14 },
    loginBtn: { backgroundColor: '#fb5b5a', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: '#fb5b5a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    adminBtn: { backgroundColor: '#064e3b', shadowColor: '#064e3b' },
    loginText: { color: 'white', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
    dividerText: { color: '#aaa', paddingHorizontal: 10, fontSize: 13 },
    registerBtn: { borderWidth: 2, borderColor: '#064e3b', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
    registerText: { color: '#064e3b', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
});

export default LoginScreen;