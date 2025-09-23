// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col justify-between p-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167278/IMG_0498_1_oqi6c7.jpg)'
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      
      <main className="flex flex-col items-center justify-center flex-grow text-center relative z-10">
        <div className="mb-8">
          {/* Logo con efecto glow - Clickable */}
          <Link 
            href="https://www.siriusagentic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-[200px] h-[200px] mx-auto filter drop-shadow-glow block"
          >
            <Image
              src="/logo.png"
              alt="Sirius Regenerative"
              width={200}
              height={200}
              className="mb-4"
              priority
            />
          </Link>
          <h2 className="text-2xl font-bold text-indigo-400">
            SIRIUS REGENERATIVE
          </h2>
        </div>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl">
          Si eres proveedor o prestador de servicios, accede a tu portal. 
          Si aún no lo eres, únete a nuestra red.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
              transition-colors duration-200 text-lg font-medium"
          >
            Acceder como Proveedor
          </Link>

          <Link
            href="/registro"
            className="px-8 py-3 bg-transparent border-2 border-indigo-500 text-indigo-400 
              rounded-lg hover:bg-indigo-500 hover:text-white transition-colors duration-200 
              text-lg font-medium"
          >
            Crear Perfil de Proveedor
          </Link>
        </div>
      </main>

      <footer className="text-center text-gray-500 py-8 relative z-10">
        <p>&copy; {new Date().getFullYear()} SIRIUS REGENERATIVE. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}