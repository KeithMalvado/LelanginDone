import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfilePetugas() {
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  const [userData, setUserData] = useState(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userDoc = docSnap.data();
        setUserData(userDoc);
        setIsProfileCompleted(userDoc.isProfileCompleted);  
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');  
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat logout');
    }
  };

  const handleEditProfile = () => {
    if (!isProfileCompleted) {
      Alert.alert(
        'Lengkapi Data Diri',
        'Harap isi semua informasi sebelum melanjutkan.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DataUser'),  
          },
        ]
      );
    } else {
      navigation.navigate('EditUser');  
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#6a1b9a" style={styles.profileIcon} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData?.name || 'Nama Pengguna'}</Text>
          <Text style={styles.userDetails}>
            {userData?.address || 'Alamat belum diisi'}
          </Text>
          <Text style={styles.userDetails}>
            Hp: {userData?.phone || 'Nomor belum diisi'}
          </Text>
        </View>
      </View>
      <View style={styles.profileStatus}>
        <Text style={styles.statusText}>
          {isProfileCompleted ? 'Profil Anda sudah lengkap' : 'Profil Anda belum lengkap'}
        </Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Text style={styles.editButtonText}>
          {isProfileCompleted ? 'Edit Profil' : 'Lengkapi Profil'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileIcon: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileStatus: {
    marginVertical: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#00796b',
  },
  editButton: {
    backgroundColor: '#6a1b9a',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
  },
  navButton: {
    alignItems: 'center',
  },
});
