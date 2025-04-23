import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn } from 'react-native-reanimated';
import ShimmerPlaceholder from 'expo-shimmer-placeholder';
import { useAuthStore } from '@/store/authStore';
import { styles } from '@/assets/styles/profile.styles';



const shimmerColors = ['#e1e9ee', '#f2f8fc', '#e1e9ee'];

// Memoized Favorite Book Card
const FavoriteBookCard = React.memo(({ item, isFavorite, onToggleFavorite, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.favoriteCard, animatedStyle]} entering={FadeIn}>
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => {
      scale.value = withSpring(0.95, {}, () => (scale.value = withSpring(1)));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress(item._id);
    }}
  >
    <Image
      source={{ uri: item.url || 'https://via.placeholder.com/150x200' }}
      style={styles.favoriteImage}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
    <TouchableOpacity
      style={styles.favoriteIcon}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggleFavorite(item._id, isFavorite);
      }}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={isFavorite ? '#FF6B6B' : '#6c757d'}
      />
    </TouchableOpacity>
    <Text style={styles.favoriteTitle} numberOfLines={1}>{item.name}</Text>
    <Text style={styles.favoriteAuthor} numberOfLines={1}>by {item.author}</Text>
  </TouchableOpacity>
</Animated.View>

  
  );
});

// Memoized Order Card
const OrderCard = React.memo(({ item }) => {
  const book = item.name || {};
  const date = new Date(item.createdAt).toLocaleDateString();

  return (
    <Animated.View style={styles.orderCard} entering={FadeIn}>
      <Image
        source={{ uri: book.url || 'https://via.placeholder.com/80x120' }}
        style={styles.orderImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.orderInfo}>
        <Text style={styles.orderTitle} numberOfLines={1}>{book.name || 'Unknown Title'}</Text>
        <Text style={styles.orderAuthor} numberOfLines={1}>by {book.author || 'Unknown Author'}</Text>
        <Text style={styles.orderDate}>Ordered on: {date}</Text>
        <Text style={styles.orderPrice}>
          ₹{(book.price || 0).toFixed(2)}
          {book.discount > 0 && (
            <Text style={styles.orderDiscount}> ({book.discount}% OFF)</Text>
          )}
        </Text>
      </View>
    </Animated.View>
  );
});

const ProfileScreen = () => {
  const { user, token, logout } = useAuthStore();

  
  const router = useRouter();
  const [address, setAddress] = useState(user?.address || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Animation for buttons
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  useEffect(() => {
    if (user?._id && token) {
      fetchFavorites();
      fetchOrderHistory();
    }
  }, [user?._id, token]);

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      setError(null);
  
      const response = await axios.get('https://book-app-native.onrender.com/api/v1/get-favourites-books', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      if (response.data.status === 'success') {
        setFavoriteBooks(response.data.data);
        console.log("✅ Favorite books fetched:", response.data.data);
      } else {
        console.warn("⚠️ Failed response status:", response.data.status);
        setError('Failed to fetch favorite books');
      }
  
    } catch (error) {
      console.error('❌ Fetch favorites error:', error.message);
      setError('Network error fetching favorites');
    } finally {
      setLoadingFavorites(false);
    }
  };
  

  const fetchOrderHistory = async () => {
    try {
      setLoadingOrders(true);
      setError(null);
      const response = await axios.get('https://book-app-native.onrender.com/api/v1/get-order-history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      });
      console.log(response);
      if (response.data.status === 'success') {
        setOrderHistory(response.data.data);
      } else {
        setError('Failed to fetch order history');
      }
    } catch (error) {
      console.error('Fetch order history error:', error);
      setError('Network error fetching order history');
    } finally {
      setLoadingOrders(false);
    }
  };

  const toggleFavorite = async (bookId, isFavorite) => {
    try {
      setError(null);
      const endpoint = isFavorite ? 'https://book-app-native.onrender.com/api/v1/remove-from-favourite' : 'https://book-app-native.onrender.com/api/v1/add-to-favourite';
      const response = await axios.put(endpoint, {}, {
        headers: { id: user._id, bookid: bookId },
      });
      if (response.status === 200) {
        await fetchFavorites();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      setError('Network error updating favorites');
    }
  };

  const updateAddress = async () => {
    if (!address.trim()) {
      setAddressError('Address is required');
      return;
    }
    try {
      setAddressError(null);
      const response = await axios.put('https://book-app-native.onrender.com/api/v1/update-address', { address }, {
        headers: { id: user._id },
      });
      if (response.status === 200) {
        setShowAddressModal(false);
        useAuthStore.setState({ user: { ...user, address } });
      } else {
        setAddressError(response.data.message);
      }
    } catch (error) {
      console.error('Update address error:', error);
      setAddressError('Network error updating address');
    }
  };

  const updateProfile = async () => {
    if (!username.trim() || !email.trim()) {
      setProfileError('Username and email are required');
      return;
    }
    try {
      setProfileError(null);
      const response = await axios.put('https://book-app-native.onrender.com/api/v1/update-profile', { username, email }, {
        headers: { id: user._id },
      });
      if (response.status === 200) {
        setShowProfileModal(false);
        useAuthStore.setState({ user: { ...user, username, email } });
      } else {
        setProfileError(response.data.message);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setProfileError('Network error updating profile');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFavorites(), fetchOrderHistory()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    buttonScale.value = withSpring(0.95, {}, () => (buttonScale.value = withSpring(1)));
    logout();
    router.replace('/login');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderFavoritePlaceholder = () => (
    <View style={styles.favoriteCard}>
      <ShimmerPlaceholder style={styles.favoriteImage} shimmerColors={shimmerColors} />
      <ShimmerPlaceholder style={styles.favoriteTitle} shimmerColors={shimmerColors} />
      <ShimmerPlaceholder style={styles.favoriteAuthor} shimmerColors={shimmerColors} />
    </View>
  );

  const renderOrderPlaceholder = () => (
    <View style={styles.orderCard}>
      <ShimmerPlaceholder style={styles.orderImage} shimmerColors={shimmerColors} />
      <View style={styles.orderInfo}>
        <ShimmerPlaceholder style={styles.orderTitle} shimmerColors={shimmerColors} />
        <ShimmerPlaceholder style={styles.orderAuthor} shimmerColors={shimmerColors} />
        <ShimmerPlaceholder style={styles.orderDate} shimmerColors={shimmerColors} />
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#5046E5', '#7B3FE4']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in to view your profile</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace('/login')}
          >
            <LinearGradient
              colors={['#5046E5', '#7B3FE4']}
              style={styles.retryButtonInner}
            >
              <Text style={styles.retryButtonText}>Go to Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#5046E5', '#7B3FE4']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color="#5046E5" />
          </View>
          <Text style={styles.profileName}>{user.username}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setShowProfileModal(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setShowAddressModal(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.editButtonText}>
                {user.address ? 'Edit Address' : 'Add Address'}
              </Text>
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Books</Text>
          {loadingFavorites ? (
            <FlatList
              data={[1, 2, 3]}
              renderItem={renderFavoritePlaceholder}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.toString()}
              style={styles.favoriteList}
            />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : favoriteBooks.length === 0 ? (
            <Text style={styles.emptyText}>No favorite books yet</Text>
          ) : (
            <FlatList
              data={favoriteBooks}
              renderItem={({ item }) => (
                <FavoriteBookCard
                  item={item}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onPress={bookId => router.push(`/book/${bookId}`)}
                />
              )}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.favoriteList}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order History</Text>
          {loadingOrders ? (
            <FlatList
              data={[1, 2, 3]}
              renderItem={renderOrderPlaceholder}
              keyExtractor={item => item.toString()}
              showsVerticalScrollIndicator={false}
            />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : orderHistory.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet</Text>
          ) : (
            <FlatList
              data={orderHistory}
              renderItem={({ item }) => <OrderCard item={item} />}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <Animated.View style={[styles.logoutButtonWrapper, buttonAnimatedStyle]}>
          <TouchableOpacity onPress={handleLogout}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Address</Text>
            <TextInput
              style={styles.addressInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              placeholderTextColor="#6c757d"
              multiline
            />
            {addressError && <Text style={styles.errorText}>{addressError}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  updateAddress();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <LinearGradient
                  colors={['#5046E5', '#7B3FE4']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.addressInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="#6c757d"
            />
            <TextInput
              style={styles.addressInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#6c757d"
              keyboardType="email-address"
            />
            {profileError && <Text style={styles.errorText}>{profileError}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  updateProfile();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <LinearGradient
                  colors={['#5046E5', '#7B3FE4']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;