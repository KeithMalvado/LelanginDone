import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, StyleSheet } from "react-native";
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { realtimeDb } from "../../screen/firebase/index";
import { themeColors } from "../../theme/theme";
import Ionicons from "react-native-vector-icons/Ionicons";

const normalizeString = (str) => str?.trim()?.toLowerCase();

const DaftarLelang = ({ navigation }) => {
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

        const filteredBarang = barangArray.filter(item => item.statusValidasi === "disetujui");

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
    if (item.user.userId === userId) {
      Alert.alert("Anda tidak bisa ikut lelang barang Anda sendiri.");
      return;
    }
  
    if (item.status === "selesai") {
      if (normalizeString(item.winner) === normalizeString(userId)) {
        navigation.navigate("Pembayaran", {
          barangId: item.id,
          nominal: item.hargaSaatIni,
        });
      } else {
        Alert.alert("Lelang Ditutup", "Anda bukan pemenang lelang ini.");
      }
    } else {
      navigation.navigate("ikutlelang", { barangId: item.id });
    }
  };
  

  if (loading) {
    return <ActivityIndicator size="large" color={themeColors.button} />;
  }

  if (barangList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Tidak ada barang yang divalidasi untuk dilelang</Text>
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
              onPress={() => handleBid(item)}
              style={[
                styles.button,
                {
                  backgroundColor:
                    item.status === "selesai"
                      ? normalizeString(item.winner) === normalizeString(userId)
                        ? themeColors.button
                        : "gray"
                      : themeColors.button,
                },
              ]}
              disabled={
                item.status === "selesai" &&
                normalizeString(item.winner) !== normalizeString(userId)
              }
            >
              <Text style={styles.buttonText}>
                {item.status === "selesai"
                  ? normalizeString(item.winner) === normalizeString(userId)
                    ? "Pembayaran"
                    : "Lelang Selesai"
                  : "ikut Lelang"}
              </Text>
            </TouchableOpacity>

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

      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.navButton}
        >
          <Ionicons name="home-outline" size={30} color="#000" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("CariBarang")}
          style={styles.navButton}
        >
          <Ionicons name="search-outline" size={30} color="#000" />
          <Text>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.navButton}
        >
          <Ionicons name="person-outline" size={30} color="#000" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: themeColors.bg,
    paddingHorizontal: 0,
    paddingTop: 70,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: themeColors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: themeColors.text,
    marginTop: 20,
  },
  card: {
    padding: 20,
    backgroundColor: themeColors.secondary,
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
    alignSelf: 'center'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: themeColors.textSecondary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: themeColors.textSecondary,
    marginBottom: 4,
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: themeColors.button,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
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
    flex: 1,
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    color: "#000",
  },
});


export default DaftarLelang;