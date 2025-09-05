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
          style={styles.tabButton}
          onPress={() => setActiveTab('history')}
        >
          <MaterialIcons 
            name="history" 
            size={32} 
            color="#000" 
          />
          {activeTab === 'history' && <View style={styles.tabArrow} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('favorites')}
        >
          <MaterialIcons 
            name="favorite" 
            size={32} 
            color="#000" 
          />
          {activeTab === 'favorites' && <View style={styles.tabArrow} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.currencyIcon, { 
            color: '#000',
            fontSize: 32,
            fontWeight: '900'
          }]}>₹</Text>
          {activeTab === 'transactions' && <View style={styles.tabArrow} />}
        </TouchableOpacity>
      </View>

      {/* Border Separator */}
      <View style={styles.tabBorder} />

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
    paddingVertical: 20,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: 'flex-start',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 60,
    alignSelf: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 40,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'flex-start',
    width: '100%',
  },
  userInfoText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  tabNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#bbbaef',
    alignItems: 'center',
    position: 'relative',
  },
  tabArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000',
    marginTop: 5,
  },

  tabBorder: {
    height: 1,
    backgroundColor: '#000',
    marginHorizontal: 10,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 7.5,
  },
  historyItem: {
    backgroundColor: '#bbbaef',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  hotelAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  hotelDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  hotelTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
    height: 1,
    backgroundColor: '#000000',
    marginTop: 20,
    marginHorizontal: -20,
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
    fontSize: 28,
    fontWeight: 'bold',
  },
});


