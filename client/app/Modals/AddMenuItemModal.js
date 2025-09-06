
import React, { useState, useEffect } from "react";
import { View, Modal, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

// menus: [{ id, name, items: [{id, name}] }], allottedMenuItemIds: [id]
export default function AddMenuItemModal({ visible, onClose, menus = [], allottedMenuItemIds = [], onAdd }) {
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);

  useEffect(() => {
    if (visible) {
      setSelectedMenuId(null);
      setSelectedMenuItemIds(allottedMenuItemIds || []);
    }
  }, [visible, allottedMenuItemIds]);

  // Normalize API response: support menuItems or items, and handle undefined
  const normalizedMenus = (menus || []).map(menu => ({
    ...menu,
    items: Array.isArray(menu.items)
      ? menu.items
      : Array.isArray(menu.menuItems)
        ? menu.menuItems
        : [],
  }));

  // Filter out already allotted menu items
  const filteredMenus = normalizedMenus.map(menu => ({
    ...menu,
    items: (menu.items || []).filter(item => !allottedMenuItemIds.includes(item.id)),
  })).filter(menu => menu.items.length > 0);

  const selectedMenu = filteredMenus.find(m => m.id === selectedMenuId);
  const menuItems = selectedMenu ? selectedMenu.items : [];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Add Allotted Menu Items</Text>
          {filteredMenus.length === 0 ? (
            <Text style={{ color: '#888', marginVertical: 24, textAlign: 'center' }}>No menu items available to assign.</Text>
          ) : (
            <>
              {/* Menu Dropdown */}
              <Text style={styles.label}>Menu</Text>
              <ScrollView style={styles.dropdown}>
                {filteredMenus.map(menu => (
                  <TouchableOpacity
                    key={menu.id}
                    style={[styles.dropdownItem, selectedMenuId === menu.id && styles.selected]}
                    onPress={() => setSelectedMenuId(menu.id)}
                  >
                    <Text>{menu.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Menu Item Dropdown (multi-select) */}
              {selectedMenu && (
                <>
                  <Text style={styles.label}>Menu Items</Text>
                  <ScrollView style={styles.dropdown}>
                    {menuItems.map(item => {
                      const isSelected = selectedMenuItemIds.includes(item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.dropdownItem, isSelected && styles.selected]}
                          onPress={() => {
                            setSelectedMenuItemIds(prev =>
                              isSelected
                                ? prev.filter(id => id !== item.id)
                                : [...prev, item.id]
                            );
                          }}
                        >
                          <Text>{item.name} {isSelected ? '✓' : ''}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}
            </>
          )}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selectedMenuItemIds.length > 0 && onAdd(selectedMenuItemIds)}
              style={[styles.addBtn, (selectedMenuItemIds.length === 0 || filteredMenus.length === 0) && { opacity: 0.5 }]}
              disabled={selectedMenuItemIds.length === 0 || filteredMenus.length === 0}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: 320, maxHeight: 480 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 15, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  dropdown: { maxHeight: 90, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  selected: { backgroundColor: '#e0e0ff' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { marginRight: 16 },
  addBtn: { backgroundColor: '#4b5cff', borderRadius: 20, padding: 8 },
});
