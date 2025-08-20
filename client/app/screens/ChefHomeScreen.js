import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme, Surface, IconButton, Avatar, Appbar, Button } from 'react-native-paper';

function ChefHomeScreen({ navigation }) {
  const theme = useTheme();
  return (
    <Surface style={[styles.container, { backgroundColor: '#a6a6e7' }]}> 
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Chef Home" titleStyle={styles.appbarTitle} />
        <IconButton
          icon={() => <Avatar.Icon size={40} icon="account" style={styles.avatar} color={theme.colors.primary} />}
          onPress={() => navigation.navigate('ChefProfile')}
        />
      </Appbar.Header>
      <Surface style={styles.headerRow}>
        <Text style={styles.time}>8:30 AM</Text>
        <IconButton
          icon="magnify"
          style={styles.filterBtn}
          size={28}
          onPress={() => {}}
          color={theme.colors.primary}
        />
      </Surface>
      <StatCard title="Main Menu Orders" value="45" />
      <StatCard title="Rev. Codes" value="32" />
      <StatCard title="Routine Dishes" value="16" />
      <Surface style={styles.bottomBar}>
        <Button
          mode="contained"
          style={styles.bottomButton}
          labelStyle={styles.buttonText}
          onPress={() => navigation.navigate('ChefMenu')}
        >
          Go to Menu
        </Button>
      </Surface>
    </Surface>
  );
}

function StatCard({ title, value }) {
  const theme = useTheme();
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.primary }]}> 
      <Card.Content style={{ alignItems: 'center' }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </Card.Content>
    </Card>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: '#a6a6e7' },
  appbar: { backgroundColor: '#a6a6e7', elevation: 0 },
  appbarTitle: { fontWeight: 'bold', fontSize: 20, textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'transparent', elevation: 0, paddingHorizontal: 20 },
  time: { fontSize: 16, color: '#333' },
  avatar: { backgroundColor: '#e0c3fc' },
  filterBtn: { marginBottom: 0 },
  card: { borderRadius: 15, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', marginBottom: 5, textAlign: 'center', color: '#fff' },
  cardValue: { fontSize: 22, textAlign: 'center', color: '#fff' },
  bottomBar: { padding: 16, backgroundColor: '#a6a6e7', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8, marginTop: 16 },
  bottomButton: { borderRadius: 24, width: '100%', alignSelf: 'center', paddingVertical: 10, backgroundColor: '#7b6eea' },
  buttonText: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
});

export default ChefHomeScreen;

