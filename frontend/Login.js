import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        console.log("Button Clicked!"); 

        if (!email || !password) {
            Alert.alert("Error", "Please enter your email and password..");
            return;
        }

        setLoading(true);

        try {
            
            const API_URL = 'https://wmt-mobile-app-xksy.vercel.app';

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
                Alert.alert("Success", "Login successful!");
                // Navigate to the dashboard or another screen
            } else {
                Alert.alert("Login Failed", data.msg || "Invalid credentials");
            }

        } catch (error) {
            console.error("Network Error Details:", error);
            Alert.alert("Network Error", "Failed to connect to the server. Please check your IP and Network connection.");
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