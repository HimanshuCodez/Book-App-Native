import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e63946',
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookImage: {
    width: '100%',
    height: 400,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  detailsContainer: {
    padding: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  bookAuthor: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  discountedPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4361ee',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: '#6c757d',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  addToCartButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default styles;