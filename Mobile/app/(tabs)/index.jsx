import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import styles from '@/assets/styles/home.styles';

const banners = [
  { id: 1, image: 'https://via.placeholder.com/300x150.png?text=New+Releases', title: 'New Releases' },
  { id: 2, image: 'https://via.placeholder.com/300x150.png?text=Best+Sellers', title: 'Best Sellers' },
  { id: 3, image: 'https://via.placeholder.com/300x150.png?text=Discounts', title: 'Up to 50% Off' },
];

const HomeScreen = () => {
  const { user, loadUser } = useAuthStore();
  const [recentBooks, setRecentBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadUser(); // Load user data from AsyncStorage
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch recent books
      const recentResponse = await axios.get('https://book-app-native.onrender.com/api/v1/get-recent-books');
      if (recentResponse.data.status === 'success') {
        const validRecentBooks = recentResponse.data.data.filter(book => 
          book.price != null && typeof book.price === 'number'
        );
        setRecentBooks(validRecentBooks);
      } else {
        setError('Failed to fetch recent books');
      }

      // Fetch all books
      const allResponse = await axios.get('https://book-app-native.onrender.com/api/v1/get-all-books');
      if (allResponse.data.status === 'success') {
        const books = allResponse.data.data;
        // Validate and clean book data
        const validBooks = books.filter(book => 
          book.price != null && typeof book.price === 'number'
        );
        setAllBooks(validBooks);
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(validBooks.map(book => book.category))];
        setCategories(uniqueCategories);
      } else {
        setError('Failed to fetch books');
      }
    } catch (error) {
      console.error('Fetch books error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  const filteredBooks = selectedCategory === 'All'
    ? allBooks
    : allBooks.filter(book => book.category === selectedCategory);

  const renderBanner = ({ item }) => (
    <TouchableOpacity style={styles.bannerCard} activeOpacity={0.7}>
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerText}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item && styles.selectedCategoryButton]}
      onPress={() => setSelectedCategory(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryText, selectedCategory === item && styles.selectedCategoryText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderBookCard = ({ item }) => {
    // Fallback values for price and discountedPrice
    const price = item.price != null && typeof item.price === 'number' ? item.price : 0;
    const discountedPrice = item.discountedPrice != null && typeof item.discountedPrice === 'number' 
      ? item.discountedPrice 
      : price;
    const hasDiscount = item.discountPercent > 0 && discountedPrice < price;

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => router.push(`/books/${item._id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.bookImageContainer}>
          <Image
            source={{ uri: item.url || 'https://via.placeholder.com/150x200' }}
            style={styles.bookImage}
            resizeMode="cover"
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
            </View>
          )}
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>by {item.author}</Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <Text style={styles.discountedPrice}>₹{discountedPrice.toFixed(2)}</Text>
                <Text style={styles.originalPrice}>₹{price.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.discountedPrice}>₹{price.toFixed(2)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookishh 📚👻</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userGreeting}>
            {user ? `Hi, ${user.username}` : 'Hello'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5046E5" />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[{ key: 'content' }]} // Wrap content in a single item to allow nested FlatLists
          renderItem={() => (
            <View>
              {/* Banner Carousel */}
              <FlatList
                data={banners}
                renderItem={renderBanner}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.bannerContainer}
              />

              {/* Recently Added Books */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recently Added</Text>
                {recentBooks.length === 0 ? (
                  <Text style={styles.emptyText}>No recent books available</Text>
                ) : (
                  <FlatList
                    data={recentBooks}
                    renderItem={renderBookCard}
                    keyExtractor={item => item._id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalList}
                  />
                )}
              </View>

              {/* Category Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <FlatList
                  data={categories}
                  renderItem={renderCategory}
                  keyExtractor={item => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryList}
                />
              </View>

              {/* All Books */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'All' ? 'All Books' : selectedCategory}
                </Text>
                {filteredBooks.length === 0 ? (
                  <Text style={styles.emptyText}>No books available in this category</Text>
                ) : (
                  <FlatList
                    data={filteredBooks}
                    renderItem={renderBookCard}
                    keyExtractor={item => item._id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.bookGrid}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  />
                )}
              </View>
            </View>
          )}
          keyExtractor={item => item.key}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;