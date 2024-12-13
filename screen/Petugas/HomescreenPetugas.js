import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { ref, update, onValue } from "firebase/database";
import { realtimeDb } from "../firebase/index";
import { themeColors } from "../../theme/theme"; 

export default function ValidasiBarang() {
  const [barangList, setBarangList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const barangRef = ref(realtimeDb, "barang");
    const unsubscribe = onValue(
      barangRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const barangArray = Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .filter((item) => item.statusValidasi === "menunggu");
          setBarangList(barangArray);
        } else {
          setBarangList([]);
        }
      },
      (error) => {
        console.error("Error fetching data: ", error);
        Alert.alert("Error", "Gagal mengambil data barang.");
      }
    );

    return () => unsubscribe();
  }, []);

  const handleValidate = (barangId, isApproved) => {
    setIsLoading(true);
    const barangRef = ref(realtimeDb, `barang/${barangId}`);
    update(barangRef, {
      statusValidasi: isApproved ? "disetujui" : "ditolak",
    })
      .then(() => {
        Alert.alert(
          "Success",
          `Barang ${isApproved ? "disetujui" : "ditolak"}.`
        );
        setBarangList((prev) => prev.filter((item) => item.id !== barangId));
      })
      .catch((error) => {
        Alert.alert("Error", `Gagal memvalidasi barang: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const confirmValidate = (barangId, isApproved) => {
    Alert.alert(
      "Konfirmasi",
      `Apakah Anda yakin ingin ${
        isApproved ? "menyetujui" : "menolak"
      } barang ini?`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya", onPress: () => handleValidate(barangId, isApproved) },
      ]
    );
  };

  if (barangList.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          Tidak ada barang yang perlu divalidasi
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      )}
      <FlatList
        data={barangList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.namaBarang}</Text>
            <Text style={styles.cardText}>Deskripsi: {item.deskripsi}</Text>
            <Text style={styles.cardText}>
              Harga Maksimum: {item.hargaTertinggi}
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.primary }]}
              onPress={() => confirmValidate(item.id, true)}
            >
              <Text style={styles.buttonText}>Setujui</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.error }]}
              onPress={() => confirmValidate(item.id, false)}
            >
              <Text style={styles.buttonText}>Tolak</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: themeColors.bg, 
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    color: themeColors.text, 
  },
  card: {
    padding: 16,
    margin: 10,
    borderRadius: 10,
    backgroundColor: themeColors.secondary, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: themeColors.text, 
  },
  cardText: {
    fontSize: 16,
    marginVertical: 4,
    color: themeColors.textSecondary, 
  },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: themeColors.text, 
    fontSize: 16,
  },
});
