import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, FlatList, StyleSheet } from "react-native";
import { ref, get, update, push } from "firebase/database";
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";
import { realtimeDb } from "../../screen/firebase/index";
import { themeColors } from "../../theme/theme";

const DetailBarang = ({ route }) => {
  const { barangId, userId } = route.params;
  const [barang, setBarang] = useState(null);
  const [userBid, setUserBid] = useState("");
  const [riwayatBid, setRiwayatBid] = useState([]);

  const db = getFirestore();

  useEffect(() => {
    const fetchBarangDetail = async () => {
      try {
        const barangRef = ref(realtimeDb, `barang/${barangId}`);
        const snapshot = await get(barangRef);
        if (snapshot.exists()) {
          setBarang(snapshot.val());
        } else {
          Alert.alert("Error", "Barang tidak ditemukan.");
        }
      } catch (error) {
        console.error("Error fetching barang details: ", error);
        Alert.alert("Error", "Terjadi kesalahan saat mengambil data barang.");
      }
    };

    const fetchRiwayatBid = async () => {
      try {
        const bidsQuery = query(collection(db, "ikutLelang"), where("barangId", "==", barangId), orderBy("bid", "desc"));
        const querySnapshot = await getDocs(bidsQuery);
        const bidsData = querySnapshot.docs.map(doc => doc.data());
        setRiwayatBid(bidsData);
      } catch (error) {
        console.error("Error fetching bid history: ", error);
        Alert.alert("Error", "Terjadi kesalahan saat mengambil riwayat bid.");
      }
    };

    fetchBarangDetail();
    fetchRiwayatBid();
  }, [barangId, db]);

  const handleBid = async () => {
    if (!userBid || isNaN(userBid) || parseInt(userBid) <= 0) {
      Alert.alert("Warning", "Masukkan jumlah bid yang valid.");
      return;
    }

    try {
      const barangRef = ref(realtimeDb, `barang/${barangId}`);
      const currentMaxBid = barang.hargaTertinggi;

      if (parseInt(userBid) > currentMaxBid) {
        await update(barangRef, {
          hargaTertinggi: parseInt(userBid),
          winner: userId,
        });

        await addDoc(collection(db, "ikutLelang"), {
          barangId,
          userId,
          bid: parseInt(userBid),
          timestamp: new Date(),
        });

        Alert.alert("Success", "Bid berhasil diajukan! Anda adalah pemenangnya.");
      } else {
        Alert.alert("Warning", "Bid Anda harus lebih tinggi dari harga saat ini.");
      }
    } catch (error) {
      console.error("Error saat melakukan bid: ", error);
      Alert.alert("Error", "Terjadi kesalahan saat melakukan bid.");
    }
  };

  const renderRiwayatBid = ({ item }) => (
    <View style={styles.bidItem}>
      <Text style={styles.bidderName}>Bidder: {item.userId}</Text>
      <Text style={styles.bidAmount}>Bid: {item.bid}</Text>
    </View>
  );

  if (!barang) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg, justifyContent: 'center', paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: themeColors.text, marginBottom: 20, textAlign: 'center' }}>
        Detail Barang
      </Text>

      <View style={{
        backgroundColor: themeColors.secondary,
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 5,
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: themeColors.textSecondary, marginBottom: 12 }}>
          Nama Barang: {barang.namaBarang}
        </Text>

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: themeColors.textSecondary, marginBottom: 8 }}>
          Deskripsi:
        </Text>
        <Text style={{ color: themeColors.textSecondary, marginBottom: 12 }}>
          {barang.deskripsi}
        </Text>

        <View style={{ borderBottomWidth: 1, borderBottomColor: themeColors.secondary, marginBottom: 16 }} />

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: themeColors.textSecondary, marginBottom: 8 }}>
          Harga Saat Ini:
        </Text>
        <Text style={{ fontSize: 16, color: themeColors.textSecondary, marginBottom: 12 }}>
          {barang.openBit}
        </Text>

        <View style={{ borderBottomWidth: 1, borderBottomColor: themeColors.secondary, marginBottom: 16 }} />

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: themeColors.textSecondary, marginBottom: 8 }}>
          Max Bit:
        </Text>
        <Text style={{ fontSize: 16, color: themeColors.textSecondary, marginBottom: 12 }}>
          {barang.hargaTertinggi}
        </Text>

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
            marginBottom: 16,
          }}
        />

        <TouchableOpacity
          style={{
            paddingVertical: 16,
            backgroundColor: themeColors.button,
            borderRadius: 16,
            alignItems: 'center',
          }}
          onPress={handleBid}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: themeColors.textSecondary }}>Ajukan Bid</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: 'bold', color: themeColors.text, marginTop: 20 }}>
          Riwayat Bid
        </Text>

        <FlatList
          data={riwayatBid}
          renderItem={renderRiwayatBid}
          keyExtractor={(item, index) => index.toString()}
          style={{ marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bidItem: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: themeColors.secondary,
    borderRadius: 8,
  },
  bidderName: {
    fontSize: 16,
    color: themeColors.text,
    fontWeight: 'bold',
  },
  bidAmount: {
    fontSize: 14,
    color: themeColors.textSecondary,
  },
});

export default DetailBarang;
