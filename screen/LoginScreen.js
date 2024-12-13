// import React, { useState, useEffect } from 'react';
// import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from '../screen/firebase/index';
// import { themeColors } from '../theme/theme';
// import { ArrowLeftIcon } from 'react-native-heroicons/outline';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         fetchUserRole(user.uid);
//       }
//     });
//     return () => unsubscribe();
//   }, [navigation]);

//   const fetchUserRole = async (userId) => {
//     try {
//       setLoading(true);
//       const userDocRef = doc(db, 'users', userId);
//       const userDoc = await getDoc(userDocRef);

//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         console.log('Login berhasil:', userData.email, 'Role:', userData.role);
        
//         if (userData.role === 'user') {
//           navigation.replace('Home');
//         } else if (userData.role === 'admin') {
//           navigation.replace('HomeAdmin')
//         }        

//         if (userData.role === 'user') {
//           navigation.replace('Home');
//         } else if (userData.role === 'admin') {
//           navigation.replace('HCpetugas');
//         } else {
//           Alert.alert('Error', 'Role pengguna tidak dikenal.');
//           await signOut(auth);
//         }
//       } else {
//         Alert.alert('Error', 'Data pengguna tidak ditemukan.');
//         await signOut(auth);
//       }
//     } catch (error) {
//       Alert.alert('Error', `Gagal mengambil data pengguna: ${error.message}`);
//       console.error('Fetch user role error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert('Error', 'Email dan password wajib diisi.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       if (user.emailVerified) {
//         console.log('Login berhasil:', user.email);
//         fetchUserRole(user.uid);
//       } else {
//         Alert.alert('Verifikasi diperlukan', 'Silakan verifikasi email Anda terlebih dahulu.');
//         await signOut(auth);
//       }
//     } catch (error) {
//       Alert.alert('Login gagal', error.message);
//       console.error('Login error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!email) {
//       Alert.alert('Error', 'Silakan masukkan email Anda untuk mengatur ulang password.');
//       return;
//     }

//     try {
//       await sendPasswordResetEmail(auth, email);
//       Alert.alert('Berhasil', 'Tautan reset password telah dikirim ke email Anda.');
//     } catch (error) {
//       Alert.alert('Error', `Gagal mengirim tautan reset password: ${error.message}`);
//       console.error('Reset password error:', error);
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: themeColors.bg }}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={{
//               backgroundColor: themeColors.bg,
//               padding: 10,
//               borderBottomLeftRadius: 20,
//               marginLeft: 16,
//             }}
//           >
//             <ArrowLeftIcon size="20" color={themeColors.textSecondary} />
//           </TouchableOpacity>
//         </View>
//         <View style={{ alignItems: 'center' }}>
//           <Image
//             source={require('../assets/images/welcome.png')}
//             style={{ width: 200, height: 200 }}
//           />
//         </View>
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: 'white',
//             paddingHorizontal: 30,
//             paddingTop: 30,
//             borderTopLeftRadius: 50,
//             borderTopRightRadius: 50,
//           }}
//         >
//           <View style={{ marginBottom: 20 }}>
//             <Text style={{ color: themeColors.primary, marginLeft: 10 }}>Alamat Email</Text>
//             <TextInput
//               style={{
//                 padding: 10,
//                 backgroundColor: '#f1f1f1',
//                 borderRadius: 25,
//                 marginBottom: 15,
//               }}
//               placeholder="Masukan Alamat Email"
//               keyboardType="email-address"
//               value={email}
//               onChangeText={setEmail}
//             />
//             <Text style={{ color: themeColors.primary, marginLeft: 10 }}>Password</Text>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 backgroundColor: '#f1f1f1',
//                 borderRadius: 25,
//                 paddingHorizontal: 10,
//               }}
//             >
//               <TextInput
//                 style={{ flex: 1, paddingVertical: 10 }}
//                 secureTextEntry={!showPassword}
//                 placeholder="Masukan Password"
//                 value={password}
//                 onChangeText={setPassword}
//               />
//               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                 <Ionicons
//                   name={showPassword ? 'eye-outline' : 'eye-off-outline'}
//                   size={24}
//                   color={themeColors.TextInput}
//                 />
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity 
//               style={{ alignItems: 'flex-end', marginVertical: 10 }} 
//               onPress={handleForgotPassword}
//             >
//               <Text style={{ color: themeColors.primary }}>Lupa Password?</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={{
//                 paddingVertical: 15,
//                 backgroundColor: themeColors.button,
//                 borderRadius: 25,
//               }}
//               onPress={handleLogin}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="white" />
//               ) : (
//                 <Text
//                   style={{
//                     fontSize: 18,
//                     fontWeight: 'bold',
//                     textAlign: 'center',
//                     color: themeColors.text,
//                   }}
//                 >
//                   Login
//                 </Text>
//               )}
//             </TouchableOpacity>
//           </View>
//           <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30 }}>
//             <Text style={{ color: themeColors.bg, borderRadius: 25 }}>Belum Memiliki Akun? </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
//               <Text style={{ color: themeColors.button, fontWeight: 'bold' }}>Daftar</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../screen/firebase/index';
import { themeColors } from '../theme/theme';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRole(user.uid);
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  const fetchUserRole = async (userId) => {
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'user') {
          navigation.replace('Home');
        } else if (userData.role === 'petugas') {
          navigation.replace('HCpetugas');
        } else if (userData.role === 'admin'){
          navigation.replace('HomeAdmin');
        } else {
          Alert.alert('Error', 'Role pengguna tidak dikenal.');
          await signOut(auth);
        }
      } else {
        Alert.alert('Error', 'Data pengguna tidak ditemukan.');
        await signOut(auth);
      }
    } catch (error) {
      Alert.alert('Error', `Gagal mengambil data pengguna: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        fetchUserRole(user.uid);
      } else {
        Alert.alert('Verifikasi diperlukan', 'Silakan verifikasi email Anda terlebih dahulu.');
        await signOut(auth);
      }
    } catch (error) {
      console.error('Login error:', error.message);

      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        console.log('Email atau password salah.');
      } else {
        console.log('Terjadi kesalahan lain:', error.message);
      }

      Alert.alert('Login gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Silakan masukkan email Anda untuk mengatur ulang password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Berhasil', 'Tautan reset password telah dikirim ke email Anda.');
    } catch (error) {
      Alert.alert('Error', `Gagal mengirim tautan reset password: ${error.message}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: themeColors.bg,
              padding: 10,
              borderBottomLeftRadius: 20,
              marginLeft: 16,
            }}
          >
            <ArrowLeftIcon size="20" color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('../assets/images/welcome.png')}
            style={{ width: 200, height: 200 }}
          />
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            paddingHorizontal: 30,
            paddingTop: 30,
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
          }}
        >
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: themeColors.primary, marginLeft: 10 }}>Alamat Email</Text>
            <TextInput
              style={{
                padding: 10,
                backgroundColor: '#f1f1f1',
                borderRadius: 25,
                marginBottom: 15,
              }}
              placeholder="Masukan Alamat Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Text style={{ color: themeColors.primary, marginLeft: 10 }}>Password</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f1f1f1',
                borderRadius: 25,
                paddingHorizontal: 10,
              }}
            >
              <TextInput
                style={{ flex: 1, paddingVertical: 10 }}
                secureTextEntry={!showPassword}
                placeholder="Masukan Password"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color={themeColors.TextInput}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={{ alignItems: 'flex-end', marginVertical: 10 }} 
              onPress={handleForgotPassword}
            >
              <Text style={{ color: themeColors.primary }}>Lupa Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 15,
                backgroundColor: themeColors.button,
                borderRadius: 25,
              }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: themeColors.text,
                  }}
                >
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30 }}>
            <Text style={{ color: themeColors.bg, borderRadius: 25 }}>Belum Memiliki Akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={{ color: themeColors.button, fontWeight: 'bold' }}>Daftar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
