import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('La variable de entorno DATABASE_URL no está definida correctamente.');
}

export const sql = neon(connectionString);

export async function connectDB() {
  try { 
    await sql`SELECT version()`;
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error; // Re-lanzamos el error para que pueda ser manejado por el llamador
  }
}