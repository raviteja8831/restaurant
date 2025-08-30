// Centralized form helper for input rendering, validation, and error display
// Design: Material-like validation, unified UI for all forms
// Usage: Import and use Form, FormInput, and useFormValidation in your screens

import React, { useState } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Text, Checkbox, RadioButton, Button } from 'react-native-paper';
let DateTimePicker;
try { DateTimePicker = require('@react-native-community/datetimepicker').default; } catch {}

// Validation hook
export function useFormValidation(initialValues, validate) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const handleChange = (name, value) => {
    setValues({ ...values, [name]: value });
    setTouched({ ...touched, [name]: true });
    if (validate) {
      const validationErrors = validate({ ...values, [name]: value });
      setErrors(validationErrors);
    }
  };

  const handleBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    setErrors,
    setTouched,
  };
}



// Material-like input supporting all types
export function FormInput(props) {
  const {
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    touched,
    type = 'text',
    customError,
    customLabel,
    options = [],
    ...rest
  } = props;
  const [showDate, setShowDate] = useState(false);
  let inputComponent = null;
  const showError = (customError || error) && touched;
  const labelText = customLabel || label;

  if (type === 'switch') {
    inputComponent = (
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{labelText}</Text>
        <Switch
          value={!!value}
          onValueChange={(val) => onChange(name, val)}
          {...props}
        />
      </View>
    );
  } else if (type === 'checkbox') {
    inputComponent = (
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{labelText}</Text>
        <Checkbox
          status={!!value ? 'checked' : 'unchecked'}
          onPress={() => onChange(name, !value)}
          {...props}
        />
      </View>
    );
  } else if (type === 'select') {
    inputComponent = (
      <View style={styles.inputWrapper}>
        <Text style={styles.selectLabel}>{labelText}</Text>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.selectOption, value === opt.value && styles.selectOptionActive]}
            onPress={() => onChange(name, opt.value)}
          >
            <Text style={styles.selectOptionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  } else if (type === 'radio') {
    inputComponent = (
      <View style={styles.inputWrapper}>
        <Text style={styles.selectLabel}>{labelText}</Text>
        <RadioButton.Group onValueChange={val => onChange(name, val)} value={value}>
          {options.map((opt) => (
            <View key={opt.value} style={styles.radioRow}>
              <RadioButton value={opt.value} />
              <Text style={styles.selectOptionText}>{opt.label}</Text>
            </View>
          ))}
        </RadioButton.Group>
      </View>
    );
  } else if (type === 'textarea') {
    inputComponent = (
      <TextInput
        label={labelText}
        value={value}
        onChangeText={(text) => onChange(name, text)}
        onBlur={() => onBlur(name)}
        mode="outlined"
        error={!!showError}
        style={[styles.input, { minHeight: 80 }]}
        multiline
        {...props}
      />
    );
  } else if (type === 'date') {
    const displayValue = value ? new Date(value).toLocaleDateString() : '';
    inputComponent = (
      <View>
        <Button mode="outlined" onPress={() => setShowDate(true)}>{displayValue || labelText}</Button>
        {showDate && DateTimePicker && (
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDate(false);
              if (selectedDate && selectedDate.nativeEvent && selectedDate.nativeEvent.timestamp) {
                onChange(name, new Date(selectedDate.nativeEvent.timestamp).toISOString());
              } else if (selectedDate) {
                onChange(name, selectedDate.toISOString());
              }
            }}
          />
        )}
      </View>
    );
  } else {
    inputComponent = (
      <TextInput
        label={labelText}
        value={value}
        onChangeText={(text) => onChange(name, text)}
        onBlur={() => onBlur(name)}
        mode="outlined"
        error={!!showError}
        style={styles.input}
        secureTextEntry={type === 'password'}
        keyboardType={type === 'number' ? 'numeric' : type === 'email' ? 'email-address' : 'default'}
        {...props}
      />
    );
  }

  return (
    <View style={styles.inputWrapper}>
      {inputComponent}
      {!!showError && <Text style={styles.errorText}>{customError || error}</Text>}
    </View>
  );
}

// Form wrapper (optional, for layout)
export function Form({ children, style }) {
  return <View style={[styles.form, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    alignItems: 'center',
  },
  inputWrapper: {
    width: '90%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#eae6ff',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: '#333',
  },
  selectLabel: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  selectOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#eae6ff',
    marginBottom: 6,
  },
  selectOptionActive: {
    backgroundColor: '#d1c4e9',
    borderColor: '#7b6eea',
    borderWidth: 2,
  },
  selectOptionText: {
    fontSize: 14,
    color: '#333',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#7b6eea',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  radioCircleActive: {
    backgroundColor: '#7b6eea',
  },
});
