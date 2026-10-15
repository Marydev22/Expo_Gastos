import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

// Todas las facturas viven en una carpeta propia de la app.
// Asi al editar o eliminar un gasto sabemos que archivo hay que borrar.
const INVOICES_DIR = (FileSystem.documentDirectory ?? '') + 'invoices/';

// Crear la carpeta la primera vez que se guarda una factura
export async function ensureInvoiceDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(INVOICES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(INVOICES_DIR, { intermediates: true });
  }
}

// Copia la imagen elegida en la galeria/camara a nuestra carpeta.
// Sin esta copia el URI del picker es temporal y podria desaparecer.
export async function saveInvoiceImage(imageUri: string): Promise<string> {
  try {
    await ensureInvoiceDirectory();

    const fileName = `invoice_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}.jpg`;
    const savedUri = INVOICES_DIR + fileName;

    await FileSystem.copyAsync({ from: imageUri, to: savedUri });
    return savedUri;
  } catch (error) {
    console.error('Error guardando la factura:', error);
    throw error;
  }
}

// Borra la factura del gasto. Solo toca archivos de nuestra carpeta:
// cualquier otro URI (por ejemplo el de la galeria) queda intacto.
export async function deleteInvoiceImage(invoiceUri: string): Promise<void> {
  if (!invoiceUri.startsWith(INVOICES_DIR)) return;

  try {
    await FileSystem.deleteAsync(invoiceUri, { idempotent: true });
  } catch (error) {
    // Que no falle la eliminacion del gasto por un archivo que ya no existe
    console.error('Error eliminando la factura:', error);
  }
}

// Abre la galeria y devuelve la imagen elegida (o null si se cancela)
export async function pickInvoiceImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Se requieren permisos de galeria');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
}

// Saca foto con la camara del celular. Mismo esquema que pickInvoiceImage:
// se pide permiso, se lanza la camara y se devuelve la URI o null.
export async function takeCameraPhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Se requieren permisos de camara');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
}
