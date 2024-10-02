"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase"; // Firebase setup
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function Home() {
  const [bookings, setBookings] = useState([]);

  // Fetch booking data from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
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
      const bookingRef = doc(db, "bookings", booking.id); // Reference to the Firestore document

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{booking.day}</h2>
            <p>Time: {booking.time}</p>
            <p>Slots Left: {booking.slots_left}</p>
            <button
              className={`mt-2 px-4 py-2 rounded ${
                booking.slots_left === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
              onClick={() => handleBooking(booking)}
              disabled={booking.slots_left === 0}
            >
              {booking.slots_left === 0 ? "Fully Booked" : "Book Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
