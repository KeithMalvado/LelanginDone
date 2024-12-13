import React, { useEffect, useState } from "react";
import { View, Text, FlatList, SafeAreaView, ActivityIndicator } from "react-native";
import { ref, get } from "firebase/database";  
import { realtimeDb } from "../../screen/firebase/index"; 
import { themeColors } from "../../theme/theme"; 
import { getFirestore, doc, getDoc } from "firebase/firestore";

const RiwayatLelang = ({ route }) => {
  const { barangId } = route.params;  
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const riwayatRef = ref(realtimeDb, `barang/${barangId}/riwayatBid`);
    
    const fetchData = async () => {
      try {
        const snapshot = await get(riwayatRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const riwayatArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          const updatedRiwayatList = [];

          for (let item of riwayatArray) {
            const userData = await getUserData(item.userId);
            updatedRiwayatList.push({
              ...item,
              namaUser: userData?.name || "N/A",
              noHp: userData?.phone || "N/A",
            });
          }

          updatedRiwayatList.sort((a, b) => b.bidValue - a.bidValue);

          setRiwayatList(updatedRiwayatList);
        } else {
          setRiwayatList([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [barangId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: themeColors.bg }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (riwayatList.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: themeColors.bg }}>
        <Text style={{ fontSize: 18, color: themeColors.textSecondary }}>No bids available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg, justifyContent: 'center', paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: themeColors.text, marginBottom: 35, marginTop: 60, textAlign: 'center' }}>
        Riwayat Lelang
      </Text>

      <FlatList
        data={riwayatList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 16,
              backgroundColor: themeColors.secondary,
              borderRadius: 16,
              marginBottom: 12,
              shadowColor: themeColors.shadow,
              shadowOpacity: 0.1,
              shadowRadius: 10,
              borderWidth: 1,
              borderColor: themeColors.borderColor,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: themeColors.textSecondary }}>
              Nama: {item.namaUser}
            </Text>
            <Text style={{ color: themeColors.textSecondary }}>Bid: {item.bidValue}</Text>
            <Text style={{ color: themeColors.textSecondary }}>No HP: {item.noHp}</Text>
            <Text style={{ color: themeColors.textSecondary, marginTop: 8 }}>Tanggal: {new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default RiwayatLelang;
