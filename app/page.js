// /app/page.js
"use client"; // This tells Next.js that this is a Client Component

import { useState, useEffect } from "react";
import { db } from "../lib/firebase"; // Firebase setup
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function Home() {
  const [bookings, setBookings] = useState([]);

  // Fetch booking data from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "class"));
        const bookingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Capture document ID for future updates
          ...doc.data(),
        }));
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
      }
    };

    fetchBookings();
  }, []);

  // Handle booking and updating Firestore
  const handleBooking = async (booking) => {
    if (booking.slots_left > 0) {
      const bookingRef = doc(db, "class", booking.id); // Reference to the Firestore document

      try {
        await updateDoc(bookingRef, {
          slots_left: booking.slots_left - 1, // Reduce slots left
        });

        // Update the local state to reflect the changes
        setBookings((prevBookings) =>
          prevBookings.map((b) =>
            b.id === booking.id ? { ...b, slots_left: b.slots_left - 1 } : b
          )
        );
      } catch (error) {
        console.error("Error updating booking: ", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Classes</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b text-left text-black">Day</th>
            <th className="py-2 px-4 border-b text-left text-black">Time</th>
            <th className="py-2 px-4 border-b text-left text-black">
              Slots Left
            </th>
            <th className="py-2 px-4 border-b text-left text-black">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="py-2 px-4 border-b text-black">{booking.day}</td>
              <td className="py-2 px-4 border-b text-black">{booking.time}</td>
              <td className="py-2 px-4 border-b text-black">
                {booking.slots_left}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  className={`px-4 py-2 rounded ${
                    booking.slots_left === 0
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                  onClick={() => handleBooking(booking)}
                  disabled={booking.slots_left === 0}
                >
                  {booking.slots_left === 0 ? "Fully Booked" : "Book Now"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
