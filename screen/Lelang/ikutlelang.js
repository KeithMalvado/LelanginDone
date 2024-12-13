import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { getDatabase, ref, get, push, update } from "firebase/database"; 
import { getAuth } from "firebase/auth"; 
import { getFirestore, doc, getDoc } from "firebase/firestore"; 
import { themeColors } from "../../theme/theme"; 

const IkutLelang = ({ route }) => {
  const { barangId, userId: routeUserId } = route.params; 
  const [barang, setBarang] = useState(null);
  const [userBid, setUserBid] = useState("");
  const [isAuctionFinished, setIsAuctionFinished] = useState(false);

  const getUserId = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    return user ? user.uid : routeUserId || "Anonymous";
  };

  const getUserData = async (userId) => {
    const db = getFirestore();  
    const userRef = doc(db, "users", userId);  
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data(); 
    } else {
      console.log("User data not found!");
      return null;
    }
  };

  useEffect(() => {
    const fetchBarangDetail = async () => {
      try {
        const db = getDatabase(); 
        const barangRef = ref(db, `barang/${barangId}`); 
        const snapshot = await get(barangRef); 
        
        if (snapshot.exists()) {
          const barangData = snapshot.val(); 
          setBarang(barangData);

          if (barangData.status === "selesai") {
            setIsAuctionFinished(true); 
          }
        } else {
          Alert.alert("Error", "Barang tidak ditemukan.");
        }
      } catch (error) {
        Alert.alert("Error", "Terjadi kesalahan saat mengambil data barang.");
        console.log(error);
      }
    };
    fetchBarangDetail();
  }, [barangId]);

  const handleBid = async () => {
    const bidValue = parseInt(userBid, 10); 
    const currentHighest = parseInt(barang.hargaSaatIni || 0, 10); 
    const maxBid = parseInt(barang.hargaTertinggi, 10); 

    if (!bidValue || isNaN(bidValue) || bidValue <= currentHighest || bidValue > maxBid) {
      Alert.alert("Warning", "Bid Anda harus lebih tinggi harga saat ini / tidak lebih dari max bid.");
      return;
    }

    if (bidValue === currentHighest) {
      Alert.alert("Warning", "Harga harus lebih tinggi dari harga sebelumnya.");
      return;
    }

    const userId = getUserId(); 
    const userData = await getUserData(userId); 

    if (!userData) {
      Alert.alert("Error", "Data pengguna tidak ditemukan.");
      return;
    }

    const { name, phone } = userData; 

    try {
      const db = getDatabase(); 
      const barangRef = ref(db, `barang/${barangId}`); 
      const riwayatBidRef = ref(db, `barang/${barangId}/riwayatBid`); 

      const newBidRef = push(riwayatBidRef);
      console.log("User ID before update:", userId); 
      await update(newBidRef, {
        userId: userId, 
        userName: name, 
        userPhone: phone, 
        bidValue: bidValue, 
        timestamp: Date.now(), 
      });

      if (bidValue >= maxBid) {
        await update(barangRef, {
          hargaSaatIni: bidValue,
          winner: userId, 
          status: "selesai",
        });
        Alert.alert("Success", "Lelang selesai! Anda adalah pemenangnya.");
        setIsAuctionFinished(true);
      } else {
        await update(barangRef, {
          hargaSaatIni: bidValue,
          winner: userId, 
        });
        Alert.alert("Success", "Bid berhasil diajukan.");
      }      
    } catch (error) {
      console.log("Error in bid process:", error); 
      Alert.alert("Error", "Terjadi kesalahan saat melakukan bid.");
    }
  };

  if (!barang) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg, justifyContent: "center", paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: themeColors.text, marginBottom: 20, textAlign: "center" }}>
        Ikut Lelang
      </Text>
      <View style={{ backgroundColor: themeColors.secondary, padding: 20, borderRadius: 16, marginBottom: 20, elevation: 5 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.textSecondary, marginBottom: 12 }}>
          Nama Barang: {barang.namaBarang}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: themeColors.textSecondary, marginBottom: 8 }}>
          Deskripsi:
        </Text>
        <Text style={{ color: themeColors.textSecondary, marginBottom: 12 }}>{barang.deskripsi}</Text>
        <View style={{ borderBottomWidth: 1, borderBottomColor: themeColors.secondary, marginBottom: 16 }} />
        <Text style={{ fontSize: 18, fontWeight: "bold", color: themeColors.textSecondary, marginBottom: 8 }}>
          Bit Saat Ini:
        </Text>
        <Text style={{ fontSize: 16, color: themeColors.textSecondary, marginBottom: 12 }}>
          {barang.hargaSaatIni}
        </Text>
        <View style={{ borderBottomWidth: 1, borderBottomColor: themeColors.secondary, marginBottom: 16 }} />
        <TextInput
          placeholder="Masukkan Harga Bid"
          keyboardType="numeric"
          value={userBid}
          onChangeText={setUserBid}
          style={{
            padding: 16,
            backgroundColor: themeColors.text,
            color: themeColors.textSecondary,
            borderRadius: 16,
            marginBottom: 12,
          }}
        />
        <TouchableOpacity
          style={{
            paddingVertical: 16,
            backgroundColor: isAuctionFinished ? "gray" : themeColors.button,
            borderRadius: 16,
            marginBottom: 20,
            alignItems: "center",
          }}
          onPress={handleBid}
          disabled={isAuctionFinished}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: themeColors.text }}>
            {isAuctionFinished ? "Lelang Selesai" : "Ajukan Bid"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default IkutLelang;
