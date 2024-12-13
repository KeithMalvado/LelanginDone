import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  StyleSheet,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { realtimeDb } from "../../screen/firebase/index";
import { themeColors } from "../../theme/theme";

const normalizeString = (str) => str?.trim()?.toLowerCase();

const BarangPetugas = ({ navigation }) => {
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }

    const barangRef = ref(realtimeDb, "barang");
    const unsubscribe = onValue(barangRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const barangArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Filter barang hanya dengan statusValidasi 'disetujui'
        const filteredBarang = barangArray.filter(
          (item) => item.statusValidasi === "disetujui"
        );

        // Urutkan barang berdasarkan status: barang yang statusnya 'selesai' akan tampil terakhir
        filteredBarang.sort((a, b) => (a.status === "selesai" ? 1 : -1));

        setBarangList(filteredBarang);
      } else {
        setBarangList([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBid = (item) => {
    if (item.status === "selesai") {
      if (normalizeString(item.winner) === normalizeString(userId)) {
        navigation.navigate("Pembayaran", {
          barangId: item.id,
          nominal: item.hargaSaatIni,
        });
      } else {
        Alert.alert("Lelang Ditutup", "Anda bukan pemenang lelang ini.");
      }
    
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={themeColors.button} />;
  }

  if (barangList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>
          Tidak ada barang yang divalidasi untuk dilelang
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Daftar Barang Lelang</Text>

      <FlatList
        data={barangList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.namaBarang}</Text>
            <Text style={styles.cardText}>
              Harga Saat Ini: {item.hargaSaatIni}
            </Text>
            <Text style={styles.cardText}>
              Harga Maksimum: {item.hargaTertinggi}
            </Text>
            <Text style={styles.cardText}>
              Status:{" "}
              {item.status === "selesai"
                ? "Lelang Selesai"
                : "Lelang Berlangsung"}
            </Text>
            <Text style={styles.cardText}>
              Pemenang:{" "}
              {item.status === "selesai"
                ? item.winner || "Belum Ada"
                : "Belum Ada"}
            </Text>

          

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("RiwayatLelang", { barangId: item.id })
              }
              style={[
                styles.button,
                { backgroundColor: themeColors.button, marginTop: 10 },
              ]}
            >
              <Text style={styles.buttonText}>Riwayat Lelang</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.bg,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: themeColors.textSecondary,
    marginBottom: 35,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    color: themeColors.textSecondary,
  },
  card: {
    padding: 16,
    backgroundColor: themeColors.secondary,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: themeColors.textSecondary,
  },
  cardText: {
    color: themeColors.textSecondary,
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: themeColors.text,
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
    alignItems: "center",
  },
});

export default BarangPetugas;
