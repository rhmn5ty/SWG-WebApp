"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../context/ProtectedRoute';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const { user, logout } = useAuth();
  const rowsPerPage = 10;

  useEffect(() => {
    if (user) {
      // Fetch customer data from the backend API
      fetch(`/api/customer?username=${user.username}&password=${user.password}&role=${user.role}`, { cache: 'no-store' })  // Disable caching
        .then(response => response.json())
        .then(data => {
          // Sort customers by customer_id in descending order
          const sortedCustomers = data.sort((a, b) => b.customer_id - a.customer_id);
          setCustomers(sortedCustomers);
        })
        .catch(error => console.error('Error fetching customers:', error));
    }
  }, [user]);

  const handleLogout = () => {
    logout(() => {
      window.location.href = '/signin'; // Redirect to sign-in page after logout
    });
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
  };

  const currentCustomers = customers.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white py-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center px-6">
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-4">Logged in as: {user?.username}</span>
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
                  <th className="px-4 py-2 w-1/5">Name</th>
                  <th className="px-4 py-2 w-1/5">Email</th>
                  <th className="px-4 py-2 w-1/5">NIK</th>
                  <th className="px-4 py-2 w-1/5">Orders</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map((customer) => (
                  <React.Fragment key={customer.customer_id}>
                    <tr className="hover:bg-gray-200">
                      <td className="border px-4 py-2 w-1/5">{customer.name}</td>
                      <td className="border px-4 py-2 w-1/5">{customer.email}</td>
                      <td className="border px-4 py-2 w-1/5">{customer.nik}</td>
                      <td className="border px-4 py-2 w-1/5">
                        <details>
                          <summary className="cursor-pointer">View Orders</summary>
                          <table className="min-w-full bg-white border mt-2">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2">Order ID</th>
                                <th className="px-4 py-2">Product</th>
                                <th className="px-4 py-2">Quantity</th>
                                <th className="px-4 py-2">Credit Card</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customer.orders.map((order) => (
                                <tr key={order.order_id} className="hover:bg-gray-200">
                                  <td className="border px-4 py-2">{order.order_id}</td>
                                  <td className="border px-4 py-2">{order.product}</td>
                                  <td className="border px-4 py-2">{order.quantity}</td>
                                  <td className="border px-4 py-2">{order.creditCard}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </details>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
              <span>
                Showing {currentPage * rowsPerPage + 1} to {Math.min((currentPage + 1) * rowsPerPage, customers.length)} of {customers.length} entries
              </span>
            </div>
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 bg-gray-200 p-4 flex justify-between items-center">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 mr-2"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={(currentPage + 1) * rowsPerPage >= customers.length}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
