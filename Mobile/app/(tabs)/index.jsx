import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import styles, { BANNER_WIDTH } from '@/assets/styles/home.styles';

// Enhanced banner data with real book images and descriptions
const banners = [
  { 
    id: 1, 
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=1470&auto=format&fit=crop', 
    title: 'New Releases',
    description: 'Discover the latest bestsellers',
    buttonText: 'Explore',
  },
  { 
    id: 2, 
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1470&auto=format&fit=crop', 
    title: 'Best Sellers',
    description: 'Books everyone is talking about',
    buttonText: 'View All',
  },
  { 
    id: 3, 
    image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=1471&auto=format&fit=crop', 
    title: 'Up to 50% Off',
    description: 'Limited time special offers',
    buttonText: 'Shop Now',
  },
];

// Function to generate random ratings for demo purposes
const generateRandomRating = () => {
  return (Math.random() * 2 + 3).toFixed(1); // Generates a number between 3.0 and 5.0
};

const HomeScreen = () => {
  const { user, loadUser } = useAuthStore();
  const [allBooks, setAllBooks] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [100, 70],
    extrapolate: 'clamp',
  });
  
  // Banner carousel auto-scroll setup
  const flatListRef = useRef(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Auto-scroll banner carousel
  useEffect(() => {
    let index = 0; // Start from the first banner
    const interval = setInterval(() => {
      index = (index + 1) % banners.length;
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
        });
      }
      setCurrentBannerIndex(index); // Update UI dot indicators
    }, 5000);
  
    return () => clearInterval(interval);
  }, []);
  

  useEffect(() => {
    loadUser(); // Load user data from AsyncStorage
    fetchBooks();
    
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchBooks = async () => {
    try {
      setError(null);
      setLoading(true);
   
      // Fetch all books
      const allResponse = await axios.get('https://book-app-native.onrender.com/api/v1/get-all-books');
      if (allResponse.data.status === 'success') {
        const books = allResponse.data.data;
        // Validate and clean book data
        const validBooks = books.filter(book => 
          book.price != null && typeof book.price === 'number'
        ).map(book => ({
          ...book,
          rating: generateRandomRating(), // Add random rating for demo purposes
        }));
        
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
    
  const handleCategorySelect = (category) => {
    // Add haptic feedback when selecting a category
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedCategory(category);
  };

  const renderBanner = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.bannerCard} 
      activeOpacity={0.9}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // Handle banner tap
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.bannerOverlay}
      >
        <Text style={styles.bannerText}>{item.title}</Text>
        <Text style={[styles.bannerButtonText, { marginTop: 4, marginBottom: 8 }]}>
          {item.description}
        </Text>
        <TouchableOpacity style={styles.bannerButton}>
          <Text style={styles.bannerButtonText}>{item.buttonText}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item && styles.selectedCategoryButton]}
      onPress={() => handleCategorySelect(item)}
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
    
    // Create animated scale for touch effect
    const animatedScale = new Animated.Value(1);
    
    const handlePressIn = () => {
      Animated.spring(animatedScale, {
        toValue: 0.95,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePressOut = () => {
      Animated.spring(animatedScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    // Generate star rating based on the random rating value
    const rating = parseFloat(item.rating);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <Animated.View style={{ 
        transform: [{ scale: animatedScale }],
      }}>
        <TouchableOpacity
          style={styles.bookCard}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push(`/books/${item._id}`);
          }}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.bookImageContainer}>
            <Image
              source={{ uri: item.url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1374&auto=format&fit=crop' }}
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
            
            {/* Star rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.rating}>
                {[...Array(5)].map((_, i) => {
                  let iconName = 'star';
                  let iconColor = '#CBD5E0';
                  
                  if (i < fullStars) {
                    iconColor = '#F59E0B';
                  } else if (i === fullStars && hasHalfStar) {
                    iconName = 'star-half-alt';
                    iconColor = '#F59E0B';
                  }
                  
                  return (
                    <FontAwesome5 
                      key={i} 
                      name={iconName} 
                      size={14} 
                      color={iconColor} 
                      style={{ marginRight: 2 }}
                    />
                  );
                })}
              </View>
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            
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
            
            {/* Quick add to cart button */}
            <TouchableOpacity 
              style={styles.bookCardButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                // Handle add to cart
              }}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render pagination dots for banner carousel
  const renderPaginationDots = () => {
    return (
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 8,
        marginBottom: 4,
      }}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentBannerIndex === index ? '#5046E5' : '#D1D5DB',
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' }}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Bookishh</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.userGreeting}>
            {user ? `Hi, ${user.username}` : 'Hello'}
          </Text>
          <TouchableOpacity 
            style={styles.cartButton} 
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/cart')
            }}
          >
            <Ionicons name="cart-outline" size={20} color="#2D3748" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => {
          // Handle search
        }}
      >
        <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <Text style={styles.searchText}>Search for books, authors, genres...</Text>
      </TouchableOpacity>

      {loading && !refreshing ? (
        <Animated.View 
          style={[
            styles.loadingContainer,
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          <ActivityIndicator size="large" color="#5046E5" />
          <Text style={styles.loadingText}>Discovering books for you...</Text>
        </Animated.View>
      ) : error ? (
        <Animated.View 
          style={[
            styles.errorContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Ionicons name="cloud-offline" size={64} color="#CBD5E0" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchBooks}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.FlatList
          data={[{ key: 'content' }]} // Wrap content in a single item to allow nested FlatLists
          renderItem={() => (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
              {/* Banner Carousel */}
              <View>
                <FlatList
                  ref={flatListRef}
                  data={banners}
                  renderItem={renderBanner}
                  keyExtractor={item => item.id.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.bannerContainer}
                  snapToInterval={BANNER_WIDTH + 20}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    const newIndex = Math.round(
                      event.nativeEvent.contentOffset.x / (BANNER_WIDTH + 20)
                    );
                    setCurrentBannerIndex(newIndex);
                  }}
                />
                {renderPaginationDots()}
              </View>

              {/* Category Filter */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Categories</Text>
                </View>
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
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {selectedCategory === 'All' ? 'All Books' : selectedCategory}
                  </Text>
                  <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <MaterialIcons name="chevron-right" size={16} color="#5046E5" />
                  </TouchableOpacity>
                </View>
                
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
                    refreshControl={
                      <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#5046E5']} 
                        tintColor="#5046E5"
                      />
                    }
                  />
                )}
              </View>
            </Animated.View>
          )}
          keyExtractor={item => item.key}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;