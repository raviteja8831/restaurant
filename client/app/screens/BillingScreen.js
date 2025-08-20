import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { List, Appbar } from 'react-native-paper';

export default function BillingScreen() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3000/api/billing')
      .then(res => res.json())
      .then(setData);
  }, []);
  return (
    <>
      <Appbar.Header><Appbar.Content title="Billing" /></Appbar.Header>
      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <List.Item title={item.name} />
        )}
      />
    </>
  );
}
