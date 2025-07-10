// src/app/actualizar/page.tsx
import ActualizarForm from '../../components/ActualizarForm';  // Ruta relativa al componente ActualizarForm

export default function ActualizarPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167490/20032025-DSC_3694_1_1_ztvhwm.jpg)'
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-lg w-full relative z-10">
        <ActualizarForm />  {/* Aquí estamos usando el componente que creamos */}
      </div>
    </div>
  );
}
