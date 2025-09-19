import React, { useState, useEffect } from "react";
import { View, Modal, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

// menus: [{ id, name, items: [{id, name}] }], allottedMenuItemIds: [id]
export default function AddMenuItemModal({
  visible,
  onClose,
  menus = [],
  allottedMenuItemIds = [],
  action = "",
  onAdd
}) {
  // Always store as strings
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);

  // Normalize menus/items
  const normalizedMenus = (menus || []).map(menu => ({
    ...menu,
    items: Array.isArray(menu.items)
      ? menu.items
      : Array.isArray(menu.menuItems)
        ? menu.menuItems
        : [],
  }));

  // Filter menus/items for remove action
  const allottedIdsStr = (allottedMenuItemIds || []).map(String);
  const filteredMenus = action === "remove"
    ? normalizedMenus
        .map(menu => ({
          ...menu,
          items: (menu.items || []).filter(item => allottedIdsStr.includes(String(item.id))),
        }))
        .filter(menu => menu.items.length > 0)
    : normalizedMenus;

  // On open, auto-select first menu and preselect items
  useEffect(() => {
    if (visible) {
      if (filteredMenus.length > 0) {
        const firstMenu = filteredMenus[0];
        setSelectedMenuId(firstMenu.id);
        const menuItemIds = (firstMenu.items || []).map(item => String(item.id));
        if (action === "add") {
          // Auto-select all menu items in this menu that are allotted
          setSelectedMenuItemIds(menuItemIds.filter(id => allottedIdsStr.includes(id)));
        } else if (action === "remove") {
          setSelectedMenuItemIds(menuItemIds);
        } else {
          setSelectedMenuItemIds([]);
        }
      } else {
        setSelectedMenuId(null);
        setSelectedMenuItemIds([]);
      }
    }
    // Only run on open or allottedMenuItemIds change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, allottedMenuItemIds]);

  // Get selected menu and items
  const selectedMenu = filteredMenus.find(m => m.id === selectedMenuId);
  const menuItems = selectedMenu ? selectedMenu.items : [];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Allot Menu Items</Text>
          {filteredMenus.length === 0 ? (
            <Text style={{ color: '#888', marginVertical: 24, textAlign: 'center' }}>
              No menu items available to assign.
            </Text>
          ) : (
            <>
              {/* Menu Dropdown */}
              <Text style={styles.label}>Menu</Text>
              <ScrollView style={styles.dropdown}>
                {filteredMenus.map(menu => (
                  <TouchableOpacity
                    key={menu.id}
                    style={[styles.dropdownItem, selectedMenuId === menu.id && styles.selected]}
                    onPress={() => {
                      setSelectedMenuId(menu.id);
                      // When menu changes, auto-select allotted items for 'add' action
                      const menuItemIds = (menu.items || []).map(item => String(item.id));
                      if (action === "add") {
                        setSelectedMenuItemIds(menuItemIds.filter(id => allottedIdsStr.includes(id)));
                      } else if (action === "remove") {
                        setSelectedMenuItemIds(menuItemIds);
                      } else {
                        setSelectedMenuItemIds([]);
                      }
                    }}
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
                      const itemIdStr = String(item.id);
                      const isSelected = selectedMenuItemIds.includes(itemIdStr);
                      const isAllotted = allottedIdsStr.includes(itemIdStr);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.dropdownItem, isSelected && styles.selected]}
                          onPress={() => {
                            // if (action === "add") {
                              if (!isSelected) {
                                setSelectedMenuItemIds(prev => [...prev, itemIdStr]);
                              } else {
                                setSelectedMenuItemIds(prev => prev.filter(id => id !== itemIdStr));
                              }
                            // } else if (action === "remove") {
                            //   if (isSelected) {
                            //     setSelectedMenuItemIds(prev => prev.filter(id => id !== itemIdStr));
                            //   }
                            // }
                          }}
                          disabled={action === "remove" ? !isSelected : false}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
                            <Text style={{ flexShrink: 1 }}>{item.name}</Text>
                            {isSelected ? (
                              <Ionicons name="checkmark" size={18} color="#4b5cff" style={{ marginLeft: 10, minWidth: 18 }} />
                            ) : null}
                            {action === "add" && isAllotted ? (
                              <Text style={{ color: '#888', marginLeft: 4 }}>(already allotted)</Text>
                            ) : null}
                          </View>
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
              style={[
                styles.addBtn,
                (selectedMenuItemIds.length === 0 || filteredMenus.length === 0) && { opacity: 0.5 }
              ]}
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