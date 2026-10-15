# Contexto Completo del Proyecto CV-CREATOR-APP


================================================
ðŸ“„ ARCHIVO: .gitignore
================================================

# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

example

# generated native folders
/ios
/android


================================================
ðŸ“„ ARCHIVO: app.json
================================================

{
  "expo": {
    "name": "gestor-gastos",
    "slug": "gestor-gastos",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "gestorgastos",
    "userInterfaceStyle": "automatic",
    "ios": {
      "icon": "./assets/expo.icon"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#208AEF",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 76
        }
      ],
      "expo-sqlite"
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}


================================================
ðŸ“„ ARCHIVO: DESIGN_SYSTEM.md
================================================

# Sistema de Diseño - Liquid Glass

Base visual para crear pantallas y modales nuevos con el mismo estilo. Los valores salen de `src/constants/theme.ts`; los ejemplos reales están en `src/components/` y `src/app/index.tsx`.

## Colores y espaciado

```typescript
import { LiquidGlassColors, Spacing } from '@/constants/theme';
```

| Uso | Valor |
|-----|-------|
| Gradiente destacado | `primary #FF6B9D` → `secondary #C44569` |
| Fondo de pantalla | `LinearGradient` con `['#FFF5F9', '#FFE8F0', '#FFF9FC']` |
| Texto principal | `glassText #2C1B47` |
| Texto secundario | `glassTextSecondary #8B6B8F` |
| Texto sobre gradiente | `glassTextLight #FFFBF5` |
| Borde glass | `glassBorder` |

Espaciado: `Spacing.two` (8) entre elementos, `Spacing.three` (16) padding de cards, `Spacing.four` (24) padding de pantallas.

## Efecto glass

El blur solo se nota si hay color detrás. Reglas:

1. Usa `GlassCard` para las tarjetas.
2. Pon círculos de colores (`position: 'absolute'`, `borderRadius: 999`, `pointerEvents="none"`) entre el fondo y el contenido. Ejemplo en `src/app/index.tsx`.
3. Los gradientes sobre una `GlassCard` van translúcidos (~0.7), no sólidos.
4. Fondos de paneles y modales con poca opacidad (~0.45), nunca ~0.95.

En Android el blur de `expo-blur` es solo una aproximación; en iOS 26+ existe el Liquid Glass real con `GlassView` de `expo-glass-effect` (no usado todavía).

## Patrones

- **Pantalla:** `LinearGradient` de fondo + círculos + `SafeAreaView` (de `react-native-safe-area-context`) + contenido con `paddingHorizontal: Spacing.four`. Ver `src/app/index.tsx`.
- **Items de lista:** `GlassCard` dentro de `Animated.View` con `entering={FadeInDown.delay(index * 100).springify()}`. Ver `ExpenseItem.tsx`.
- **Botones principales:** `LinearGradient` primary → secondary con `start={{x:0,y:0}} end={{x:1,y:1}}`. Ver el FAB en `index.tsx`.
- **Modal bottom sheet:** copiar la estructura de `AddExpenseModal.tsx` (backdrop con blur, `SlideInDown`, handle, `ScrollView`).
- **Inputs:** fondo `rgba(255,255,255,0.5)`, `borderWidth: 1`, `glassBorder`, `borderRadius: Spacing.two`.

## Teclado (importante)

Todo modal o pantalla con inputs usa `KeyboardAvoidingView` (`'padding'` en iOS, `'height'` en Android) y un `ScrollView` con `keyboardShouldPersistTaps="handled"`, para que el teclado no tape los campos y los botones sigan funcionando.

## Tipografía

- Título de pantalla: 28, bold, `glassText`.
- Números grandes: 42, bold, `letterSpacing: -1`, `glassTextLight`.
- Texto secundario: `glassTextSecondary`.

## Checklist

- [ ] Fondo con gradiente y círculos de color
- [ ] Cards con `GlassCard`
- [ ] Gradientes translúcidos sobre cards, paneles con poca opacidad
- [ ] Colores y espaciado desde `theme.ts`, sin valores sueltos
- [ ] Inputs: `ScrollView` + `KeyboardAvoidingView`


================================================
ðŸ“„ ARCHIVO: expo-env.d.ts
================================================

/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore

================================================
ðŸ“„ ARCHIVO: export_contex.js
================================================

const fs = require('fs');
const path = require('path');

// Nombre del archivo final que contendrÃ¡ todo tu cÃ³digo
const OUTPUT_FILE = 'contexto_proyecto.md';
const ROOT_DIR = __dirname;

// Carpetas que ignoramos porque son pesadas o no contienen cÃ³digo fuente Ãºtil
const IGNORE_DIRS = ['node_modules', '.expo', '.vscode', '.opencode', '.git', 'assets', '__tests__', '.tamagui'];

// Archivos especÃ­ficos que no queremos incluir
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', OUTPUT_FILE, 'export_context.js'];

// Extensiones permitidas
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];

function buildContext(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(item)) {
                buildContext(itemPath);
            }
        } else {
            const ext = path.extname(item);
            const isAllowedExtension = ALLOWED_EXTENSIONS.includes(ext);
            
            // Permitimos archivos de configuraciÃ³n que empiezan con punto (ej. .gitignore, eslint.config.js)
            const isConfigFile = item.startsWith('.') || item.includes('config'); 

            if (!IGNORE_FILES.includes(item) && (isAllowedExtension || isConfigFile)) {
                try {
                    const content = fs.readFileSync(itemPath, 'utf8');
                    const relativePath = path.relative(ROOT_DIR, itemPath);
                    
                    // Separador visual claro para que la IA distinga entre archivos
                    const separator = `\n\n================================================\n`;
                    const fileHeader = `ðŸ“„ ARCHIVO: ${relativePath}\n================================================\n\n`;
                    
                    fs.appendFileSync(path.join(ROOT_DIR, OUTPUT_FILE), separator + fileHeader + content);
                } catch (error) {
                    console.error(`Error leyendo ${itemPath}:`, error.message);
                }
            }
        }
    }
}

// 1. Inicializar/Limpiar el archivo de salida
fs.writeFileSync(path.join(ROOT_DIR, OUTPUT_FILE), '# Contexto Completo del Proyecto CV-CREATOR-APP\n');
console.log('â³ Recopilando cÃ³digo...');

// 2. Ejecutar la lectura
buildContext(ROOT_DIR);

console.log(`âœ… Â¡Listo! Todo tu cÃ³digo se ha consolidado en el archivo: ${OUTPUT_FILE}`);

================================================
ðŸ“„ ARCHIVO: package.json
================================================

{
  "name": "gestor-gastos",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "dependencies": {
    "@expo/ui": "~57.0.24",
    "@react-native-async-storage/async-storage": "2.2.0",
    "expo": "~57.0.29",
    "expo-blur": "~57.0.3",
    "expo-constants": "~57.0.22",
    "expo-device": "~57.0.2",
    "expo-font": "~57.0.4",
    "expo-glass-effect": "~57.0.4",
    "expo-image": "~57.0.5",
    "expo-linear-gradient": "~57.0.2",
    "expo-linking": "~57.0.13",
    "expo-router": "~57.0.27",
    "expo-splash-screen": "~57.0.10",
    "expo-sqlite": "~57.0.4",
    "expo-status-bar": "~57.0.1",
    "expo-symbols": "~57.0.3",
    "expo-system-ui": "~57.0.4",
    "expo-web-browser": "~57.0.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.10.1"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "private": true
}


================================================
ðŸ“„ ARCHIVO: README.md
================================================

# 💸 Gestor de Gastos para Poliestudiantes

Una aplicación móvil moderna para Android desarrollada con **Expo (React Native)** y **TypeScript** que permite a estudiantes universitarios registrar y visualizar sus gastos mensuales.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Expo](https://img.shields.io/badge/expo-SDK%2057-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-6.0.3-blue.svg)
![React Native](https://img.shields.io/badge/react--native-0.86.3-blue.svg)

>  **Este proyecto es la base para un taller progresivo de desarrollo móvil**. 
Los alumnos comenzarán con esta versión base (sin persistencia de datos) y avanzarán implementando AsyncStorage, SQLite 
---
##  Instalación y Configuración

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** versión 18 o superior ([Descargar aquí](https://nodejs.org/))
- ✅ **npm** o **yarn** (viene con Node.js)


###  Instalar dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias listadas en `package.json`. Puede tomar varios minutos la primera vez.

### Instalación manual de cada dependencia (opcional)

`npm install` ya instala todo lo anterior. Si empiezas un proyecto desde cero o necesitas reinstalar una dependencia puntual, estos son los comandos de cada una. Usa `npx expo install` para que Expo elija la versión compatible con el SDK 57.

**Núcleo (Expo, React y React Native):**

```bash
npx expo install expo
npx expo install react react-dom react-native
npx expo install expo-router
npx expo install expo-constants expo-linking expo-status-bar expo-system-ui expo-splash-screen
```

**Interfaz y efecto Liquid Glass:**

```bash
npx expo install expo-blur
npx expo install expo-linear-gradient
npx expo install expo-glass-effect
npx expo install expo-image
npx expo install expo-symbols
npx expo install expo-font
npx expo install @expo/ui
```

**Animaciones, gestos y navegación:**

```bash
npx expo install react-native-reanimated react-native-worklets
npx expo install react-native-gesture-handler
npx expo install react-native-safe-area-context
npx expo install react-native-screens
```

**Utilidades de dispositivo y web:**

```bash
npx expo install expo-device
npx expo install expo-web-browser
npx expo install react-native-web
```

| Dependencia | Para qué sirve |
|-------------|----------------|
| `expo` | Framework base para React Native |
| `react`, `react-dom`, `react-native` | Librerías centrales de la UI |
| `expo-router` | Navegación basada en archivos |
| `expo-constants`, `expo-linking`, `expo-status-bar`, `expo-system-ui`, `expo-splash-screen` | Soporte de Expo Router y del sistema |
| `expo-blur` | Efectos de desenfoque (blur) |
| `expo-linear-gradient` | Gradientes nativos |
| `expo-glass-effect` | Efecto de cristal nativo |
| `expo-image`, `expo-symbols`, `expo-font` | Imágenes, iconos y fuentes |
| `@expo/ui` | Componentes nativos de Expo |
| `react-native-reanimated`, `react-native-worklets` | Animaciones fluidas |
| `react-native-gesture-handler` | Gestos táctiles |
| `react-native-safe-area-context`, `react-native-screens` | Áreas seguras y pantallas nativas |
| `expo-device`, `expo-web-browser` | Información del dispositivo y navegador |
| `react-native-web` | Ejecutar la app en el navegador |


================================================
ðŸ“„ ARCHIVO: src\app\index.tsx
================================================

import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MonthlyHeader } from '@/components/MonthlyHeader';
import { ExpenseItem } from '@/components/ExpenseItem';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { useExpenses } from '@/context/ExpenseContext';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

// Pantalla principal: total del mes, lista de gastos y el boton + para agregar
export default function HomeScreen() {
  const { getCurrentMonthExpenses, isLoading } = useExpenses();
  const [modalVisible, setModalVisible] = useState(false);
  const expenses = getCurrentMonthExpenses();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF5F9', '#FFE8F0', '#FFF9FC']}
        style={styles.gradient}
      >
        {/* Circulos de color detras: dan algo que desenfocar a las tarjetas */}
        <View pointerEvents="none" style={[styles.orb, styles.orbPink]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbOrange]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbPurple]} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.appTitle}>Gastos Poliestudiante</Text>

            <MonthlyHeader />

            {/* Mientras se leen los datos guardados se muestra un indicador;
                sin esto se veria un instante el mensaje de "no hay gastos" */}
            {isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={LiquidGlassColors.primary} />
              </View>
            ) : expenses.length === 0 ? (
              /* Si no hay gastos este mes mostramos un mensaje en vez de la lista */
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
                <Text style={styles.emptyText}>
                  Presiona el botón + para agregar tu primer gasto
                </Text>
              </View>
            ) : (
              <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <ExpenseItem expense={item} index={index} />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Boton + de la esquina */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Text style={styles.fabIcon}>+</Text>
            </LinearGradient>
          </TouchableOpacity>

          <AddExpenseModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPink: {
    width: 220,
    height: 220,
    top: 60,
    left: -60,
    backgroundColor: 'rgba(255, 107, 157, 0.55)',
  },
  orbOrange: {
    width: 180,
    height: 180,
    top: 260,
    right: -50,
    backgroundColor: 'rgba(255, 159, 94, 0.5)',
  },
  orbPurple: {
    width: 200,
    height: 200,
    bottom: 120,
    left: 20,
    backgroundColor: 'rgba(168, 120, 220, 0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: LiquidGlassColors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '300',
  },
});


================================================
ðŸ“„ ARCHIVO: src\app\_layout.tsx
================================================

import { Stack } from 'expo-router';
import {SQLiteProvider} from 'expo-sqlite';

import { ExpenseProvider } from '@/context/ExpenseContext';
import {DATABASE_NAME, initDatabase} from '@/database/database';
// El provider va aqui arriba para que todas las pantallas compartan los gastos
export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      <ExpenseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </ExpenseProvider>
    </SQLiteProvider>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\AddExpenseModal.tsx
================================================

import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Category, CATEGORIES, CATEGORY_ICONS } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

// Modal que sube desde abajo para registrar un gasto.
// Para poder agregarlo hacen falta el monto y la categoria; la descripcion es opcional.
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
}) => {
  const { addExpense } = useExpenses();
  // El monto es string porque asi trabaja el TextInput; se pasa a numero al guardar
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');

  // async porque ahora hay que esperar a que el gasto se guarde en el telefono
  const handleSubmit = async () => {
    if (!amount || !category) return;
 
    try {
      await addExpense({
        amount: parseFloat(amount),
        category,
        date: new Date(),
        description: description.trim() || undefined,
      });
    } catch (error) {
      // Si no se pudo guardar, se avisa y el modal queda abierto con los datos
      console.error('Error al guardar el gasto', error);
      Alert.alert('Error', 'No se pudo guardar el gasto. Intenta de nuevo.');
      return;
    }
 
    // Reset form
    setAmount('');
    setCategory(null);
    setDescription('');
    onClose();
  };


  // Igual que al guardar, se limpia el formulario para que no quede texto viejo
  const handleClose = () => {
    setAmount('');
    setCategory(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
        keyboardVerticalOffset={0}
      >
        {/* Tocar el fondo tambien cierra el modal */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.modalContent}
        >
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.title}>Agregar Gasto</Text>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Monto (USD)</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Categoría</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {/* La elegida se pinta con el gradiente */}
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.categoryButton,
                          category === cat && styles.categoryButtonActive,
                        ]}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={[
                              LiquidGlassColors.primary,
                              LiquidGlassColors.secondary,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryTextActive}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <>
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ej: Almuerzo, transporte a la universidad..."
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    multiline
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!amount || !category) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!amount || !category}
                  >
                    <LinearGradient
                      colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>Agregar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalBackground: {
    // Bajito a proposito: si es casi opaco no se ve el blur del fondo
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  modalBlur: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LiquidGlassColors.glassTextSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    opacity: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.four,
  },
  inputSection: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: LiquidGlassColors.glassText,
    paddingVertical: Spacing.three,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.two,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: 'transparent',
  },
  categoryGradient: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  categoryText: {
    fontSize: 12,
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  submitButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\ExpenseItem.tsx
================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CATEGORY_ICONS } from '@/types/expense';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface ExpenseItemProps {
  expense: Expense;
  index: number; // sirve para que cada fila entre un poquito despues de la anterior
}

// Una fila de la lista de gastos
export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, index }) => {
  // Queda algo como "15 oct"
  const formattedDate = new Date(expense.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });

  // Queda algo como "$15.50"
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(expense.amount);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.container}
    >
      <GlassCard>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Text style={styles.icon}>{CATEGORY_ICONS[expense.category]}</Text>
              </LinearGradient>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.category}>{expense.category}</Text>
              {expense.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {expense.description}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.amount}>{formattedAmount}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.two,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: Spacing.two,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: LiquidGlassColors.glassTextSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\GlassCard.tsx
================================================

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number; // que tan borroso se ve el fondo, por defecto 20
  tint?: 'light' | 'dark' | 'default';
  animated?: boolean;
  animatedValue?: SharedValue<number>; // de 0 a 1, solo se usa si animated es true
}

// Tarjeta base del efecto "glass": fondo borroso, borde claro y sombra.
// La usan casi todos los demas componentes.
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  animated = false,
  animatedValue,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!animated || !animatedValue) return {};

    // Va de 0.95 a 1 segun el valor animado
    const scale = interpolate(animatedValue.value, [0, 1], [0.95, 1]);

    return {
      transform: [{ scale: withSpring(scale) }],
    };
  });

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blurContainer}>
        {children}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: LiquidGlassColors.glassBackground,
    shadowColor: LiquidGlassColors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  blurContainer: {
    padding: Spacing.three,
    overflow: 'hidden',
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\MonthlyHeader.tsx
================================================

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

// Muestra el mes y el total gastado
export const MonthlyHeader: React.FC = () => {
  const { getMonthlyTotal } = useExpenses();
  const total = getMonthlyTotal();

  const scale = useSharedValue(1);

  // Cada vez que cambia el total, el numero "late" un poco
  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  }, [total]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Sale en minuscula ("octubre de 2026"); la mayuscula la pone el estilo
  const currentMonth = new Date().toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(total);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <LinearGradient
          // Con algo de transparencia para que se vea el blur de la tarjeta
          colors={['rgba(255, 107, 157, 0.7)', 'rgba(196, 69, 105, 0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.monthText}>{currentMonth}</Text>
            <Animated.View style={animatedStyle}>
              <Text style={styles.totalLabel}>Total gastado</Text>
              <Text style={styles.totalAmount}>{formattedTotal}</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.four,
  },
  card: {
    overflow: 'hidden',
  },
  gradient: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  content: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    color: LiquidGlassColors.glassTextLight,
    textTransform: 'capitalize',
    marginBottom: Spacing.two,
    opacity: 0.9,
  },
  totalLabel: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextLight,
    marginBottom: Spacing.one,
    textAlign: 'center',
    opacity: 0.8,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
    textAlign: 'center',
    letterSpacing: -1,
  },
});


================================================
ðŸ“„ ARCHIVO: src\constants\theme.ts
================================================

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

/**
 * Colores del tema Liquid Glass - Paleta única no genérica
 */
export const LiquidGlassColors = {
  // Gradientes principales - Coral vibrante a lavanda
  primary: '#FF6B9D',      // Coral rosado intenso
  secondary: '#C44569',    // Vino/burgundy profundo
  accent: '#A8E6CF',       // Verde menta suave (contraste)

  // Fondos con transparencia para efecto glass
  glassBackground: 'rgba(255, 107, 157, 0.08)',     // Muy sutil
  glassBackgroundDark: 'rgba(196, 69, 105, 0.12)',  // Un poco más intenso

  // Bordes glass
  glassBorder: 'rgba(255, 107, 157, 0.25)',

  // Textos
  glassText: '#2C1B47',           // Púrpura oscuro profundo
  glassTextLight: '#FFFBF5',      // Blanco cálido (no puro)
  glassTextSecondary: '#8B6B8F',  // Malva grisáceo

  // Sombras
  shadowLight: 'rgba(255, 107, 157, 0.15)',
  shadowDark: 'rgba(196, 69, 105, 0.25)',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;


================================================
ðŸ“„ ARCHIVO: src\context\ExpenseContext.tsx
================================================


import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Expense } from '@/types/expense';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllExpenses, insertExpense } from '@/database/expenseRepository';
 
interface ExpenseContextType {
  expenses: Expense[];
  // true mientras se leen los gastos guardados al abrir la app
  isLoading: boolean;
  // Ahora devuelve una Promise porque guardar en el telefono es asincrono
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  getMonthlyTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
}
 
// Arranca en undefined para poder avisar si alguien usa el hook sin Provider
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
 
// Fase 3: los gastos se guardan en una base de datos SQLite dentro del telefono.
// La interfaz del contexto es la misma de la fase 2, por eso las pantallas no cambian.
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Conexion a la base que abrio SQLiteProvider en _layout.tsx
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
  // Se ejecuta al montar el Provider (al abrir la app).
  // db va en las dependencias porque se usa adentro; no cambia mientras la app esta abierta.
  useEffect(() => {
    const cargarGastos = async () => {
      try {
        const guardados = await getAllExpenses(db);
        setExpenses(guardados);
      } catch (error) {
        // Si falla la consulta, la app arranca vacia
        console.error('No se pudieron cargar los gastos', error);
      } finally {
        // Haya funcionado o no, ya terminamos de cargar
        setIsLoading(false);
      }
    };
 
    cargarGastos();
  }, [db]);
 
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    // Timestamp + algo aleatorio para que dos gastos seguidos no repitan id
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    };
 
    // Primero se inserta en la base y DESPUES se actualiza la pantalla.
    // Si el INSERT falla, lanza el error y el estado no cambia.
    // Solo se escribe una fila: ya no hace falta reescribir toda la lista.
    await insertExpense(db, newExpense);
 
    // Va al principio para que el ultimo gasto salga arriba
    setExpenses((prev) => [newExpense, ...prev]);
  };
 
  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
 
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });
  };
 
  const getMonthlyTotal = () => {
    return getCurrentMonthExpenses().reduce(
      (total, expense) => total + expense.amount,
      0
    );
  };
 
  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense,
        getMonthlyTotal,
        getCurrentMonthExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
 
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};


================================================
ðŸ“„ ARCHIVO: src\database\database.ts
================================================

import {SQLiteDatabase} from 'expo-sqlite';

export const DATABASE_NAME = 'gastos.db';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            description TEXT
        );
    `);
}

================================================
ðŸ“„ ARCHIVO: src\database\expenseRepository.ts
================================================

import {SQLiteDatabase} from 'expo-sqlite';
import { Expense, Category } from '@/types/expense';

interface ExpenseRow {
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string | null;
}

function mapRowToExpense(row: ExpenseRow): Expense {
    return {
        id: row.id,
        amount: row.amount,
        category: row.category as Category,
        date: new Date(row.date),
        description: row.description ?? undefined,
    };
}

export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
    const rows = await db.getAllAsync<ExpenseRow>(
        'SELECT id, amount, category, date, description FROM expenses ORDER BY date DESC');
        return rows.map(mapRowToExpense);
}

export async function insertExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
    await db.runAsync(
        'INSERT INTO expenses (id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
        expense.id,
        expense.amount,
        expense.category,
        expense.date.toISOString(),
        expense.description ?? null
    );
} 

================================================
ðŸ“„ ARCHIVO: src\types\expense.ts
================================================

/**
 * Tipos para el sistema de gestion de gastos
 */

// Categorias que puede elegir el usuario
export type Category =
  | 'Transporte'
  | 'Alimentación'
  | 'Material académico'
  | 'Entretenimiento'
  | 'Salud'
  | 'Otros';

export interface Expense {
  id: string;
  amount: number; // en dolares
  category: Category;
  date: Date;
  description?: string;
}

// Mismo orden en que se muestran en el selector del modal
export const CATEGORIES: Category[] = [
  'Transporte',
  'Alimentación',
  'Material académico',
  'Entretenimiento',
  'Salud',
  'Otros',
];

/**
 * Iconos asociados a cada categoria
 */
export const CATEGORY_ICONS: Record<Category, string> = {
  'Transporte': '🚗',
  'Alimentación': '🍔',
  'Material académico': '📚',
  'Entretenimiento': '🎮',
  'Salud': '💊',
  'Otros': '📦',
};


================================================
ðŸ“„ ARCHIVO: tsconfig.json
================================================

{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
