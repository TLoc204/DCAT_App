import React, { useState } from 'react';
import { SafeAreaView, useColorScheme, Button, TextInput } from 'react-native';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';


  const backgroundStyle = {
    
  };

  const onPress = async () => {
    
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <TextInput
      />
      <Button
        title="Click to invoke your native module!"
        color="#841584"
      />
    </SafeAreaView>
  );
};

export default App;