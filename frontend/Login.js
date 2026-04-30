import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        console.log("Button Clicked!"); // 1. බටන් එක වැඩද බලන්න මෙතන check කරන්න

        if (!email || !password) {
            Alert.alert("Error", "කරුණාකර Email සහ Password ඇතුළත් කරන්න.");
            return;
        }

        setLoading(true);

        try {
            // ⚠️ ඔබේ පරිගණකයේ IPv4 ලිපිනය මෙතනට අනිවාර්යයෙන්ම දාන්න (උදා: 192.168.1.10)
            // Localhost (127.0.0.1) පාවිච්චි කරන්න එපා.
            const API_URL = 'http://192.168.8.166:5000/api/students/login'; 

            console.log("Sending request to:", API_URL);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password: password
                }),
            });

            const data = await response.json();
            console.log("Response from Server:", data);

            if (response.ok) {
                Alert.alert("Success", "Login සාර්ථකයි!");
                // Dashboard එකට navigate කරන code එක මෙතනට දාන්න
            } else {
                Alert.alert("Login Failed", data.msg || "Invalid credentials");
            }

        } catch (error) {
            console.error("Network Error Details:", error);
            Alert.alert("Network Error", "සර්වර් එකට සම්බන්ධ වීමට නොහැක. ඔබගේ IP එක සහ Network එක පරීක්ෂා කරන්න.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: loading ? '#ccc' : '#007AFF' }]} 
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, marginTop: 50 },
    input: { borderBottomWidth: 1, marginBottom: 15, padding: 8 },
    button: { padding: 15, alignItems: 'center', borderRadius: 5 },
    buttonText: { color: 'white', fontWeight: 'bold' }
});

export default LoginScreen;