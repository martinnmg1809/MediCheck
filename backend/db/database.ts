import mongoose from 'mongoose';

const uri = "mongodb+srv://vicentegonzalez10_db_user:clave@medicheck.z0o2q3t.mongodb.net/?appName=MediCheck";

export const connectDB = async () => {
  try {
    // Conexión simplificada que evita errores de tipos
    await mongoose.connect(uri);
    
    console.log("Conexión exitosa a MongoDB Atlas");
  } catch (error) {
    console.error("Error en la conexión:", error);
    process.exit(1); 
  }
};
