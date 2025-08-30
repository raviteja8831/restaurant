import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Avatar, useTheme, Surface, Title, Paragraph } from 'react-native-paper';
import Header from '../components/Header';
import { getHeading } from '../constants/headings';

export default function ChefProfileScreen() {
  const theme = useTheme();
  return (
    <>
      <Header title={getHeading('ChefProfileScreen')} />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <Avatar.Icon size={90} icon="chef-hat" style={styles.avatar} color={theme.colors.primary} />
        <Title style={styles.name}>Chef Name</Title>
        <StatsRow />
        <Card style={styles.infoBox}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Paragraph>Login Hours: 4 Hrs</Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
}

function StatsRow() {
  return (
    <Surface style={styles.statsRow}>
      <StatBox value="45" label="Total Orders" />
      <StatBox value="215" label="Total Dishes" />
    </Surface>
  );
}

function StatBox({ value, label }) {
  const theme = useTheme();
  return (
    <Card style={[styles.statBox, { backgroundColor: theme.colors.primary }]}> 
      <Card.Content style={{ alignItems: 'center' }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  avatar: { marginBottom: 15, backgroundColor: '#e0c3fc' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20, backgroundColor: 'transparent', elevation: 0 },
  statBox: { borderRadius: 15, flex: 1, margin: 5 },
  statValue: { fontSize: 22, color: '#fff', textAlign: 'center' },
  statLabel: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  infoBox: { borderRadius: 15, width: '100%', alignItems: 'center', marginTop: 10 },
});
