// src/app/customer/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../context/ProtectedRoute';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch customer data from the backend API
      fetch(`/api/customer?username=${user.username}&password=${user.password}&role=${user.role}`, { cache: 'no-store' })  // Disable caching
        .then(response => response.json())
        .then(data => setCustomers(data))
        .catch(error => console.error('Error fetching customers:', error));
    }
  }, [user]);

  const handleLogout = () => {
    logout(() => {
      window.location.href = '/signin'; // Redirect to sign-in page after logout
    });
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white py-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center px-6">
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-4">Logged in as: {user?.username} ({user?.role})</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
              >
                Logout
              </button>
              {user?.role !== 'customer' && user?.role !== 'hr' && user?.role !== 'finance' ? (
                <Link href="/add" legacyBehavior>
                  <a className="ml-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-300">
                    Add New Customer
                  </a>
                </Link>
              ) : (
                <button
                  disabled
                  className="ml-4 px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                >
                  Add New Customer
                </button>
              )}
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-6 py-8">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="w-full bg-blue-100">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">NIK</th>
                  <th className="px-4 py-2">Credit Card</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-200">
                    <td className="border px-4 py-2">{customer.name}</td>
                    <td className="border px-4 py-2">{customer.email}</td>
                    <td className="border px-4 py-2">{customer.nik}</td>
                    <td className="border px-4 py-2">{customer.creditCard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
