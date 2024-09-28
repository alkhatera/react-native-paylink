# React Native Paylink 💳

[![runs with Expo Go](https://img.shields.io/badge/Runs%20with%20Expo%20Go-000.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.dev/client)

React Native Paylink package to process payments using Paylink as a payment gateway for iOS, Android and Web apps 💥

---

#### Web Preview

Soon...

#### Web Preview

Soon...

## ✨Features

- 📦 Very tiny and lightweight
- 🧩 Exports functions independently so you can develop your own UIs if needed
- ⌨ Smart & automatic keyboard and orientation handling for iOS & Android
- 💪 Imperative calls
- 💯 Compatible with Expo
- 🌐 Runs on the web
- ✅ Written in TypeScript

## 💻 Installation

```sh
npm install react-native-paylink
```

or

```sh
yarn add react-native-paylink
```

## 📱 Minimal Usage

Opening and closing the bottom sheet is done imperatively, so just pass a `ref` to the bottom sheet and call the `open` or `close` methods via the `ref` instance to open and close the bottom sheet respectively.

## Examples

#### Javascript

```tsx
import React, { useRef } from 'react';
import { Button, View } from 'react-native';
import { ReactNativePaylink } from 'react-native-paylink';

const App = () => {
  const sheetRef = useRef(null);
  return (
    <View>
      <Button title="Open" onPress={() => sheetRef.current?.open()} />
      <ReactNativePaylink ref={sheetRef} />
    </View>
  );
};
```

### ⚠ Warning

The bottom sheet component [react-native-bottom-sheet](https://github.com/stanleyugwu/react-native-bottom-sheet) uses and handles pan gestures internally, so to avoid scroll/pan misbehavior with its container, **DO NOT** put it inside a container that supports panning e.g `ScrollView`. You can always put it just next to the `ScrollView` and use `React Fragment` or a `View` to wrap them and everything should be okay.

#### ❌ Don't do this

```jsx
<ScrollView>
  <ReactNativePaylink>...</ReactNativePaylink>
</ScrollView>
```

#### ✅ Do this

```jsx
<>
  <ScrollView>...</ScrollView>

  <ReactNativePaylink>...</ReactNativePaylink>
</>
```

## 🛠 Props

Soon...

## Examples

Start receiving payments as soon as possible with React Native Paylink

### 1️⃣ Fetching token


#### _More Examples and code samples coming soon..._

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

see [LICENSE](LICENSE.md)

---

</> with 💖 by Alaa ✌
