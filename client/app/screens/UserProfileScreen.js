import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { userData, historyData, favoritesData, transactionsData } from '../Mock/CustomerHome';

const { width, height } = Dimensions.get('window');

/**
 * UserProfileScreen component with sub-tabs for history, favorites, and transactions
 */
export default function UserProfileScreen() {
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'favorites', 'transactions'
  const router = useRouter();



  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name="star"
        size={16}
        color={index < rating ? '#FFD700' : '#E0E0E0'}
        style={styles.star}
      />
    ));
  };

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      {historyData.map((item) => (
        <View key={item.id} style={styles.historyItem}>
          <View style={styles.hotelHeader}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{item.hotelName}</Text>
              <Text style={styles.hotelAddress}>{item.address}</Text>
              <Text style={styles.hotelDate}>(on {item.date})</Text>
              <Text style={styles.hotelTime}>{item.time}</Text>
            </View>
          </View>
          
          {item.items && (
            <View style={styles.orderDetails}>
              <Text style={styles.membersText}>{item.members} Members</Text>
              <Text style={styles.ordersText}>Orders</Text>
              {item.items.map((orderItem, idx) => (
                <View key={`${item.id}-${idx}`} style={styles.orderItem}>
                  <Text style={styles.itemName}>{orderItem.name}</Text>
                  <Text style={styles.itemDetails}>
                    {orderItem.quantity} units, {orderItem.price} per unit, total {orderItem.total}
                  </Text>
                </View>
              ))}
              <Text style={styles.totalAmount}>Total: {item.totalAmount}</Text>
            </View>
          )}
          
          {!item.items && (
            <View style={styles.simpleOrder}>
              <Text style={styles.membersText}>{item.members} Members</Text>
              <Text style={styles.ordersText}>Orders</Text>
              <Text style={styles.totalAmount}>Total amount: {item.totalAmount}</Text>
            </View>
          )}
          
          {item.id !== historyData[historyData.length - 1].id && <View style={styles.separator} />}
        </View>
      ))}
    </ScrollView>
  );

  const renderFavoritesTab = () => (
    <ScrollView style={styles.tabContent}>
      {favoritesData.map((item, index) => (
        <View key={item.id} style={styles.favoriteItem}>
          <View style={styles.favoriteHeader}>
            <MaterialIcons name="star" size={24} color="#FFD700" />
            <View style={styles.favoriteInfo}>
              <Text style={styles.hotelName}>{item.hotelName}</Text>
              <Text style={styles.favoriteDescription}>{item.description}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(item.rating)}
            </View>
            <Text style={styles.ratingText}>{item.status}</Text>
          </View>
          {index < favoritesData.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </ScrollView>
  );

  const renderTransactionsTab = () => (
    <ScrollView style={styles.tabContent}>
      {transactionsData.map((item, index) => (
        <View key={item.id} style={styles.transactionItem}>
          <View style={styles.transactionHeader}>
            <Text style={styles.hotelName}>{item.hotelName}</Text>
            <Text style={styles.membersText}>{item.members} Members</Text>
            <Text style={styles.ordersText}>Orders</Text>
            <Text style={styles.totalAmount}>Total amount: {item.totalAmount}</Text>
          </View>
          {index < transactionsData.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return renderHistoryTab();
      case 'favorites':
        return renderFavoritesTab();
      case 'transactions':
        return renderTransactionsTab();
      default:
        return renderHistoryTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/customer-home')}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="translate" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {userData.profileImage ? (
            <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialIcons name="person" size={40} color="#666" />
            </View>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>First Name: {userData.firstName}</Text>
          <Text style={styles.userInfoText}>Last Name: {userData.lastName}</Text>
          <Text style={styles.userInfoText}>Phone Number: {userData.phoneNumber}</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <MaterialIcons 
            name="history" 
            size={24} 
            color={activeTab === 'history' ? '#6854ff' : '#666'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <MaterialIcons 
            name="favorite" 
            size={24} 
            color={activeTab === 'favorites' ? '#6854ff' : '#666'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.currencyIcon, { color: activeTab === 'transactions' ? '#6854ff' : '#666' }]}>₹</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbbaef', // Light purple background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  tabNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  tabButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#bbbaef',
  },
  activeTab: {
    backgroundColor: 'rgba(104, 84, 255, 0.1)',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyItem: {
    backgroundColor: '#bbbaef',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  hotelHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 10,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  hotelAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  hotelDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  hotelTime: {
    fontSize: 12,
    color: '#666',
  },
  orderDetails: {
    marginTop: 10,
  },
  simpleOrder: {
    marginTop: 10,
  },
  membersText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  ordersText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  orderItem: {
    marginBottom: 5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  separator: {
    height: 2,
    backgroundColor: '#000000',
    marginTop: 15,
    marginHorizontal: -15,
  },
  favoriteItem: {
    backgroundColor: '#bbbaef',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  favoriteHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 10,
  },
  favoriteDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  transactionItem: {
    backgroundColor: '#bbbaef',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  transactionHeader: {
    marginBottom: 10,
  },
  currencyIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});


