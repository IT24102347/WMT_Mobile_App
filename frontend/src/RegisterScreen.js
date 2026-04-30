import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_URL = Platform.OS === 'web'
    ? 'http://localhost:5000'
    : 'http://192.168.8.166:5000';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [course, setCourse] = useState('Software Engineering');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/students/register`, {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                course
            });

            Alert.alert(
                "Success! 🎉",
                `Registered successfully!\nYour Student ID: ${response.data.student.studentId}`,
                [{ text: "Login Now", onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            console.log(error);
            const msg = error.response?.data?.msg || "Registration failed!";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerBubble1} />
                    <View style={styles.headerBubble2} />
                    <Text style={styles.headerLabel}>SAFESTAY</Text>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <Text style={styles.headerSub}>Join us today</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputView}>
                        <Text style={styles.inputIcon}>👤</Text>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Enter your full name"
                            placeholderTextColor="#aaa"
                            onChangeText={setName}
                            value={name}
                        />
                    </View>

                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputView}>
                        <Text style={styles.inputIcon}>✉️</Text>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Enter your email"
                            placeholderTextColor="#aaa"
                            onChangeText={setEmail}
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <Text style={styles.label}>Course</Text>
                    <View style={styles.inputView}>
                        <Text style={styles.inputIcon}>📚</Text>
                        <TextInput
                            style={styles.inputText}
                            placeholder="e.g. Software Engineering"
                            placeholderTextColor="#aaa"
                            onChangeText={setCourse}
                            value={course}
                        />
                    </View>

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputView}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Min. 6 characters"
                            placeholderTextColor="#aaa"
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry
                        />
                    </View>

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputView}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Re-enter password"
                            placeholderTextColor="#aaa"
                            onChangeText={setConfirmPassword}
                            value={confirmPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* Student ID Note */}
                    <View style={styles.noteBox}>
                        <Text style={styles.noteText}>🎓 Student ID will be automatically generated</Text>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerBtn, loading && styles.btnDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.registerText}>CREATE ACCOUNT</Text>
                        }
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>
                            Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, backgroundColor: '#f0faf4' },

    // Header
    header: {
        backgroundColor: '#064e3b',
        paddingTop: 60,
        paddingBottom: 35,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        overflow: 'hidden',
        marginBottom: 25,
    },
    headerBubble1: {
        position: 'absolute', width: 180, height: 180, borderRadius: 90,
        backgroundColor: '#065f46', top: -60, right: -40,
    },
    headerBubble2: {
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#047857', bottom: -30, left: 20,
    },
    headerLabel: { color: '#6ee7b7', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
    headerTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 6 },
    headerSub:   { color: '#6ee7b7', fontSize: 13, marginTop: 4 },

    // Form
    form: { paddingHorizontal: 22, paddingBottom: 40 },
    label: { fontSize: 13, fontWeight: '600', color: '#064e3b', marginBottom: 6, marginLeft: 4 },

    inputView: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        height: 52,
        marginBottom: 16,
        paddingHorizontal: 15,
        shadowColor: '#064e3b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    inputIcon: { fontSize: 16, marginRight: 10 },
    inputText: { flex: 1, color: '#1a1a1a', fontSize: 14 },

    noteBox: {
        backgroundColor: '#d1fae5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    noteText: { color: '#064e3b', fontSize: 13, fontWeight: '500' },

    registerBtn: {
        backgroundColor: '#064e3b',
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#064e3b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    btnDisabled: { backgroundColor: '#aaa' },
    registerText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },

    loginLink: { textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 4 },
    loginLinkBold: { color: '#064e3b', fontWeight: '700' },
});

export default RegisterScreen;