import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getAuth, sendEmailVerification, signOut, onAuthStateChanged } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { themeColors } from '../theme/theme';

export default function App() {
  return <HomeScreen />;
}

function HomeScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          console.log('Pengguna terverifikasi:', user.email);
        } else {
          sendEmailVerification(user).then(() => {
            Alert.alert(
              'Verifikasi Email',
              'Silakan verifikasi email Anda. Kami telah mengirimkan email verifikasi.'
            );
          }).catch((error) => {
            console.log('Error mengirimkan email verifikasi:', error);
          });
          Alert.alert(
            'Verifikasi Email',
            'Silakan verifikasi email Anda terlebih dahulu.'
          );
          signOut(auth);
          navigation.replace('Login');
        }
      } else {
        navigation.replace('Login');
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'users'), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
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

  const handleFeatureNavigation = (feature) => {
    if (!isProfileCompleted) {
      Alert.alert(
        'Lengkapi Data Diri',
        'Harap isi semua informasi sebelum menggunakan fitur ini.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DataUser'),
          },
        ]
      );
      return; 
    }
    navigation.navigate(feature);
  };

  const handleSaveProfile = async (newData) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, newData);
      setUserData((prevData) => ({ ...prevData, ...newData }));
      setIsProfileCompleted(true); 
      Alert.alert('Data berhasil disimpan');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Ionicons
          name="person-circle-outline"
          size={80}
          color="#6a1b9a"
          style={styles.profileIcon}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData?.name || 'Nama Pengguna'}</Text>
          <Text style={styles.userDetails}>
            {userData?.address || 'Alamat belum diisi'}
          </Text>
          <Text style={styles.userDetails}>
            Hp: {userData?.phone || 0}
          </Text>
        </View>
      </View>
      <Text style={[styles.sectionTitle, { color: 'white' }]}>Layanan</Text>
      <View style={styles.serviceContainer}>
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => handleFeatureNavigation('DaftarBarang')}
        >
          <Ionicons name="leaf-outline" size={40} color="#FFFFF" />
          <Text style={styles.serviceTitle}>Lelang</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => handleFeatureNavigation('Pesan')}
        >
          <Ionicons name="chatbubbles-outline" size={40} color="#795548" />
          <Text style={styles.serviceTitle}>Pesan Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => handleFeatureNavigation('TambahBarang')}
        >
          <MaterialCommunityIcons
            name="cash"
            size={40}
            color="#4CAF50"
          />
          <Text style={styles.serviceTitle}>lelangin</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.navButton}
        >
          <Ionicons name="home-outline" size={30} color="#000" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('CariBarang')}
          style={styles.navButton}
        >
          <Ionicons name="search-outline" size={30} color="#000" />
          <Text>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.navButton}
        >
          <Ionicons name="person-outline" size={30} color="#000" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.bg,
    padding: 20,
    color: 'white'
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceCard: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: themeColors.text,
    width: '30%'
  },
  serviceTitle: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  bottomNav: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopColor: "#ddd",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: themeColors.text,
    paddingHorizontal: 30,
  },
  navButton: {
    alignItems: 'center',
  },
});
