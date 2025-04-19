// app/books/index.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { styles } from '@/assets/styles/books.styles';


export default function BooksScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setError(null);
      const response = await axios.get('http://localhost:4000/api/v1/get-all-books');
      if (response.data.status.includes('success')) {
        setBooks(response.data.data);
      } else {
        setError('Failed to fetch books');
      }
    } catch (err) {
      console.error('Error fetching books:', err);
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

  const renderBookItem = ({ item }) => (
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
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.subtitle}>by {item.author || 'Unknown'}</Text>
        
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
        
        {item.genre && (
          <View style={styles.genreContainer}>
            <Text style={styles.genreText}>{item.category}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5046E5" />
        <Text style={styles.loadingText}>Loading books...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <TouchableOpacity onPress={() => router.push('/books/search')}>
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={books}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderBookItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={64} color="#CCCCCC" />
                <Text style={styles.emptyText}>No books available</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}