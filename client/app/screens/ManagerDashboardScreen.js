import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme } from 'react-native-paper';

export default function ManagerDashboardScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>  
      <Title style={styles.title}>Hotel Sai (3 Star)</Title>
      <Paragraph style={styles.date}>Today{`\n`}Wednesday{`\n`}21.02.2025</Paragraph>
      <CardRow>
        <StatCard title="No. of Orders" value="65" />
        <StatCard title="Tables Served" value="16" />
      </CardRow>
      <CardRow>
        <StatCard title="No. of Customers" value="345" />
        <StatCard title="Transactions" value="₹12345" />
      </CardRow>
      <Section title="Table Status">
        <Text>Free: 16 | Occupied: 4</Text>
      </Section>
      <Section title="Chef Status">
        <Text>Login: 2 | Not Assigned: 1 | Logged Out: 2</Text>
      </Section>
    </ScrollView>
  );
}

function CardRow({ children }) {
  return <Card.Content style={styles.cardRow}>{children}</Card.Content>;
}

function StatCard({ title, value }) {
  const theme = useTheme();
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.primary }]}> 
      <Card.Content style={{ alignItems: 'center' }}>
        <Paragraph style={styles.cardTitle}>{title}</Paragraph>
        <Title style={styles.cardValue}>{value}</Title>
      </Card.Content>
    </Card>
  );
}

function Section({ title, children }) {
  const theme = useTheme();
  return (
    <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}> 
      <Card.Content>
        <Paragraph style={styles.sectionTitle}>{title}</Paragraph>
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  date: { marginBottom: 20, fontSize: 16 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  card: { borderRadius: 15, flex: 1, margin: 5 },
  cardTitle: { fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  cardValue: { fontSize: 22, textAlign: 'center' },
  section: { borderRadius: 15, marginVertical: 10 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
});
