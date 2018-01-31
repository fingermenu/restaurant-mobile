import React from 'react';
import { TextInput, View } from 'react-native';

/**
 * to be wrapped with redux-form Field component
 */
export default function FormTextInput(props) {
  const { input, ...inputProps } = props;

  return (
    <View>
      <TextInput
        {...inputProps}
        onBlur={evt => input.onBlur(evt.nativeEvent.text)}
        onChangeText={input.onChange}
        // onBlur={input.onBlur}
        onFocus={input.onFocus}
        value={input.value}
        // maxLength={4}
      />
    </View>
  );
}