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
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import styles from '@/assets/styles/home.styles';

const banners = [
  { id: 1, image: 'https://i.pinimg.com/736x/71/01/55/710155c549f342fa69bd72a57bd623bf.jpg', title: 'New Releases' },
  { id: 2, image: 'https://i.pinimg.com/736x/a3/a3/b5/a3a3b5b9021fca2561aff644809af46b.jpg', title: 'Best Sellers' },
  { id: 3, image: 'https://i.pinimg.com/736x/e6/58/81/e658818e5983c2916626f2037f718b42.jpg', title: 'Up to 50% Off' },
  { id: 4, image: 'https://i.pinimg.com/736x/0f/8e/0e/0f8e0e0f8e0e0f8e0e0f8e0e0f8e0e0f.jpg', title: 'Fiction Favorites' },
];

// Banner Item Component
const BannerItem = ({ item }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.bannerCard, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)']}
          style={styles.bannerOverlay}
        >
          <Text style={styles.bannerText}>{item.title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Book Card Component
const BookCard = ({ item, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const price = item.price != null && typeof item.price === 'number' ? item.price : 0;
  const discountedPrice = item.discountedPrice != null && typeof item.discountedPrice === 'number'
    ? item.discountedPrice
    : price;
  const hasDiscount = item.discountPercent > 0 && discountedPrice < price;

  return (
    <Animated.View style={[styles.bookCard, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
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
    </Animated.View>
  );
};

// Featured Book Component
const FeaturedBook = ({ book, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const price = book.price != null && typeof book.price === 'number' ? book.price : 0;
  const discountedPrice = book.discountedPrice != null && typeof book.discountedPrice === 'number'
    ? book.discountedPrice
    : price;
  const hasDiscount = book.discountPercent > 0 && discountedPrice < price;

  return (
    <Animated.View style={[styles.featuredCard, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
      >
        <Image
          source={{ uri: book.url || 'https://via.placeholder.com/300x200' }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)']}
          style={styles.featuredOverlay}
        >
          <Text style={styles.featuredTitle}>{book.name}</Text>
          <Text style={styles.featuredAuthor}>by {book.author}</Text>
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <Text style={styles.featuredPrice}>₹{discountedPrice.toFixed(2)}</Text>
                <Text style={styles.featuredOriginalPrice}>₹{price.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.featuredPrice}>₹{price.toFixed(2)}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.readNowButton}
            onPress={onPress}
          >
            <Text style={styles.readNowText}>Read Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
    loadUser();
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setError(null);
      setLoading(true);

      const recentResponse = await axios.get('https://book-app-native.onrender.com/api/v1/get-recent-books');
      if (recentResponse.data.status === 'success') {
        const validRecentBooks = recentResponse.data.data.filter(book =>
          book.price != null && typeof book.price === 'number'
        );
        setRecentBooks(validRecentBooks);
      } else {
        setError('Failed to fetch recent books');
      }

      const allResponse = await axios.get('https://book-app-native.onrender.com/api/v1/get-all-books');
      if (allResponse.data.status === 'success') {
        const books = allResponse.data.data;
        const validBooks = books.filter(book =>
          book.price != null && typeof book.price === 'number'
        );
        setAllBooks(validBooks);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookishh 📚👻</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userGreeting}>
            {user ? `Hi, ${user.username}` : 'Hello'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/books/search')}>
            <Ionicons name="search-outline" size={24} color="#333" style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e63946" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <View>
              {/* Featured Book */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured Book</Text>
                {recentBooks.length === 0 ? (
                  <Text style={styles.emptyText}>No featured book available</Text>
                ) : (
                  <FeaturedBook
                    book={recentBooks[0]}
                    onPress={() => router.push(`/books/${recentBooks[0]._id}`)}
                  />
                )}
              </View>

              {/* Banner Carousel */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Explore More</Text>
                <FlatList
                  data={banners}
                  renderItem={({ item }) => <BannerItem item={item} />}
                  keyExtractor={item => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bannerContainer}
                />
              </View>

              {/* Recently Added Books */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recently Added</Text>
                {recentBooks.length === 0 ? (
                  <Text style={styles.emptyText}>No recent books available</Text>
                ) : (
                  <FlatList
                    data={recentBooks}
                    renderItem={({ item }) => (
                      <BookCard
                        item={item}
                        onPress={() => router.push(`/books/${item._id}`)}
                      />
                    )}
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
                    renderItem={({ item }) => (
                      <BookCard
                        item={item}
                        onPress={() => router.push(`/books/${item._id}`)}
                      />
                    )}
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