// app/book-details/[id].jsx
import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';


export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://book-app-native.onrender.com/${id}`);
      if (response.data && response.data.data) {
        setBook(response.data.data);
      } else {
        setError('Failed to fetch book details');
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Could not load book details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5046E5" />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || 'Book not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Book Details</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="bookmark-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.bookImageSection}>
          <Image 
            source={{ uri: book.coverImage || 'https://via.placeholder.com/300x450' }} 
            style={styles.bookImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.authorText}>by {book.author || 'Unknown'}</Text>
          
          {book.rating && (
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star}
                  name={star <= Math.round(book.rating) ? "star" : "star-outline"} 
                  size={20} 
                  color="#FFD700" 
                  style={{ marginRight: 4 }}
                />
              ))}
              <Text style={styles.ratingText}>({book.rating.toFixed(1)})</Text>
            </View>
          )}

          <View style={styles.detailsRow}>
            {book.genre && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Genre</Text>
                <Text style={styles.detailValue}>{book.genre}</Text>
              </View>
            )}
            
            {book.publishedYear && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Published</Text>
                <Text style={styles.detailValue}>{book.publishedYear}</Text>
              </View>
            )}
            
            {book.pages && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pages</Text>
                <Text style={styles.detailValue}>{book.pages}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {book.description || 'No description available for this book.'}
            </Text>
          </View>

          {book.isbn && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailsTable}>
                <View style={styles.detailsTableRow}>
                  <Text style={styles.detailsTableLabel}>ISBN</Text>
                  <Text style={styles.detailsTableValue}>{book.isbn}</Text>
                </View>
                {book.publisher && (
                  <View style={styles.detailsTableRow}>
                    <Text style={styles.detailsTableLabel}>Publisher</Text>
                    <Text style={styles.detailsTableValue}>{book.publisher}</Text>
                  </View>
                )}
                {book.language && (
                  <View style={styles.detailsTableRow}>
                    <Text style={styles.detailsTableLabel}>Language</Text>
                    <Text style={styles.detailsTableValue}>{book.language}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.readButton}>
          <Text style={styles.readButtonText}>Start Reading</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}