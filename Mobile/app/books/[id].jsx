import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn } from 'react-native-reanimated';
import styles from '@/assets/styles/detailsbook.styles';
import ExpandableText from '@/components/ExpandableText';


// Memoized Book Image Component
const BookImage = React.memo(({ uri }) => (
  <Image
    source={{ uri: uri || 'https://via.placeholder.com/300x400' }}
    style={styles.bookImage}
    contentFit="cover"
    cachePolicy="memory-disk"
  />
));

const BookDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Animation values for buttons
  const cartScale = useSharedValue(1);
  const readScale = useSharedValue(1);
  const cartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));
  const readAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: readScale.value }],
  }));

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get(`https://book-app-native.onrender.com/api/v1/get-book-by-id/${id}`);
      if (response.data.status === 'success') {
        setBook(response.data.data);
      } else {
        setError('Failed to fetch book details');
      }
    } catch (error) {
      console.error('Fetch book error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openPDF = async () => {
    if (book?.pdfUrl) {
      try {
        // Use Google Docs Viewer for cross-platform PDF viewing
        const pdfViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(book.pdfUrl)}`;
        await WebBrowser.openBrowserAsync(pdfViewerUrl);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('PDF open error:', error);
        setError('Failed to open PDF. Please try again.');
      }
    } else {
      setError('No PDF available for this book.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#5046E5', '#7B3FE4']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Details</Text>
            <TouchableOpacity onPress={() => router.push('/cart')}>
              <Ionicons name="cart-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5046E5" />
          <Text style={styles.loadingText}>Loading book...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#5046E5', '#7B3FE4']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Details</Text>
            <TouchableOpacity onPress={() => router.push('/cart')}>
              <Ionicons name="cart-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || 'Book not found'}</Text>
          <TouchableOpacity style={styles.retryButton}>
            <LinearGradient
              colors={['#5046E5', '#7B3FE4']}
              style={styles.retryButtonInner}
            >
              <Text style={styles.retryButtonText} onPress={fetchBook}>
                Retry
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const price = book.price != null && typeof book.price === 'number' ? book.price : 0;
  const discountedPrice = book.discountedPrice != null && typeof book.discountedPrice === 'number'
    ? book.discountedPrice
    : price;
  const hasDiscount = book.discountPercent > 0 && discountedPrice < price;
  const rating = book.rating || Math.floor(Math.random() * 5) + 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#5046E5', '#7B3FE4']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Details</Text>
          <TouchableOpacity onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.imageContainer} entering={FadeIn}>
          <BookImage uri={book.url} />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{book.discountPercent}% OFF</Text>
            </View>
          )}
        </Animated.View>
        <Animated.View style={styles.detailsContainer} entering={FadeIn.delay(200)}>
          <Text style={styles.bookTitle}>{book.name}</Text>
          <Text style={styles.bookAuthor}>by {book.author}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < rating ? 'star' : 'star-outline'}
                size={18}
                color="#FFD700"
                style={styles.starIcon}
              />
            ))}
            <Text style={styles.ratingText}>({rating}.0)</Text>
          </View>
          {book.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{book.category}</Text>
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
          <ExpandableText text={book.description} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Language:</Text>
            <Text style={styles.infoValue}>{book.language || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stock:</Text>
            <Text style={styles.infoValue}>{book.stock || 'N/A'}</Text>
          </View>
          {book.isbn && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ISBN:</Text>
              <Text style={styles.infoValue}>{book.isbn}</Text>
            </View>
          )}
          <View style={styles.buttonContainer}>
            <Animated.View style={[styles.buttonWrapper, readAnimatedStyle]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  readScale.value = withSpring(0.95, {}, () => {
                    readScale.value = withSpring(1);
                  });
                  openPDF();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <LinearGradient
                  colors={['#5046E5', '#7B3FE4']}
                  style={styles.readButton}
                >
                  <Ionicons name="book" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.readButtonText}>Read Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.buttonWrapper, cartAnimatedStyle]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  cartScale.value = withSpring(0.95, {}, () => {
                    cartScale.value = withSpring(1);
                  });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Add to cart logic here
                }}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.addToCartButton}
                >
                  <Ionicons name="cart" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookDetailsScreen;