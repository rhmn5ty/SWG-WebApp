// src/pages/index.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-orange-400 to-blue-500 py-2 text-white">
      <header className="flex justify-between w-full max-w-6xl px-6 py-4">
        <h1 className="text-3xl font-bold">Sinergi Wahana Gemilang</h1>
        <nav>
          <Link href="/signin" legacyBehavior>
            <div className="px-4 py-2 bg-white text-orange-500 rounded hover:bg-orange-100">Sign In</div>
          </Link>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center flex-1 w-full px-20 text-center">
        <h1 className="text-6xl font-bold mb-4">Secure Customer Information Management</h1>
        <p className="text-2xl mb-6">Protect your customer sensitive information with advanced tokenization technology.</p>
        <Link href="/signin" legacyBehavior>
          <div className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition duration-300">
            Get Started
          </div>
        </Link>
      </main>
      <footer className="w-full h-24 flex items-center justify-center border-t">
        <p className="text-sm">&copy; 2024 SecureInfo. All rights reserved.</p>
      </footer>
    </div>
  );
}
