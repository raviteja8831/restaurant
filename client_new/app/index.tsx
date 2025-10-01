import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import api from "../services/api";

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/posts?_limit=5");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <View style={styles.container}>
      <Text h3>🚀 Expo + Axios Starter</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        posts.map((post) => (
          <Text key={post.id} style={styles.post}>{post.title}</Text>
        ))
      )}
      <Button title="Reload" onPress={fetchPosts} containerStyle={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  post: { marginTop: 10, fontSize: 16 }
});