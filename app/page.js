"use client"; // This tells Next.js that this is a Client Component

import { useState, useEffect, Suspense } from "react";
import { db } from "../lib/firebase"; // Firebase setup
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import Skeleton from "@/components/Skeleton";

export default function Home() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [tempBookings, setTempBookings] = useState({}); // For temporary slot reduction
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const [loading, setLoading] = useState(true);

  // Fetch booking data from Firestore with real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "class"), (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id, // Capture document ID for future updates
        ...doc.data(),
      }));
      setBookings(bookingsData);
      setLoading(false);
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  // Handle booking and updating Firestore
  const handleBooking = (booking) => {
    if (booking.slots_left > 0) {
      // Temporary reduction of slots
      setTempBookings((prev) => ({
        ...prev,
        [booking.id]: booking.slots_left - 1,
      }));
      setSelectedBooking(booking);
    }
  };

  // Submit the booking to Firestore
  const handleSubmit = async () => {
    if (selectedBooking && studentName) {
      setIsSubmitting(true); // Set loading state

      try {
        // Save the booking details in Firestore's 'bookings' collection
        await addDoc(collection(db, "bookings"), {
          student_name: studentName,
          day: selectedBooking.day,
          time: selectedBooking.time,
        });

        // Update the slots_left in 'class' collection
        const bookingRef = doc(db, "class", selectedBooking.id);
        await updateDoc(bookingRef, {
          slots_left: tempBookings[selectedBooking.id],
        });

        // Reset form
        setStudentName("");
        setSelectedBooking(null);
        setTempBookings({});
      } catch (error) {
        console.error("Error submitting booking: ", error);
      } finally {
        setIsSubmitting(false); // Reset loading state
      }
    }
  };

  // Cancel the booking selection
  const handleCancel = () => {
    setSelectedBooking(null);
    setStudentName("");
    setTempBookings({});
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Available Classes for Replacement
      </h1>
      <div>
        Dear parents, please book separately for each child. And scroll down to
        type the child's name.
      </div>
      {loading ? (
        <Skeleton />
      ) : (
        <Suspense fallback={<Skeleton />}>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b text-left text-black">Day</th>
                <th className="py-2 px-4 border-b text-left text-black">
                  Time
                </th>
                <th className="py-2 px-4 border-b text-left text-black">
                  Slots Left
                </th>
                <th className="py-2 px-4 border-b text-left text-black">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="py-2 px-4 border-b text-black">
                    {booking.day}
                  </td>
                  <td className="py-2 px-4 border-b text-black">
                    {booking.time}
                  </td>
                  <td className="py-2 px-4 border-b text-black">
                    {tempBookings[booking.id] ?? booking.slots_left}
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
        </Suspense>
      )}

      {selectedBooking && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>
          <div className="mb-4">
            <label className="block text-black mb-2">Student Name:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="Enter your name"
            />
          </div>

          <div className="flex gap-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Submit Booking"}
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleCancel}
              disabled={isSubmitting} // Disable cancel during submission
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
