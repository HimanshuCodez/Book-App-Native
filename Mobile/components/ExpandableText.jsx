import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '@/assets/styles/detailsbook.styles';

const ExpandableText = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  const characterLimit = 150;

  if (!text) {
    return <Text style={styles.description}>No description available.</Text>;
  }

  const isLongText = text.length > characterLimit;
  const shownText = expanded ? text : text.slice(0, characterLimit) + (isLongText ? '...' : '');

  return (
    <View>
      <Text style={styles.description}>{shownText}</Text>
      {isLongText && (
        <TouchableOpacity onPress={toggleExpanded}>
          <Text style={styles.readMoreText}>
            {expanded ? 'Read less ▲' : 'Read more ▼'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ExpandableText;
