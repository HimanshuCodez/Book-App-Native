import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import styles from '@/assets/styles/detailsbook.styles';


const BookDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={styles.loadingText}>Loading book...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e63946" />
          <Text style={styles.errorText}>{error || 'Book not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBook}>
            <Text style={styles.retryButtonText}>Retry</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Details</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: book.url || 'https://via.placeholder.com/300x400' }}
          style={styles.bookImage}
          resizeMode="cover"
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.bookTitle}>{book.name}</Text>
          <Text style={styles.bookAuthor}>by {book.author}</Text>
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
          <Text style={styles.description}>{book.description}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Language:</Text>
            <Text style={styles.infoValue}>{book.language}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stock:</Text>
            <Text style={styles.infoValue}>{book.stock}</Text>
          </View>
          {book.isbn && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ISBN:</Text>
              <Text style={styles.infoValue}>{book.isbn}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookDetailsScreen;