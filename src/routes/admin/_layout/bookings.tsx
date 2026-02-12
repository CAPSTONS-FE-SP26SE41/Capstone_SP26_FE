import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
export const Route = createFileRoute('/admin/_layout/bookings')({
  component: AdminBookings,
})

type Booking = {
  id: string
  destination: string
  date: string
  amount: string
  status: 'Confirmed' | 'Pending' | 'Cancelled'
}

function AdminBookings() {
  const [bookings] = useState<Booking[]>([]) // sau này fetch API

  const statusList: Booking['status'][] = [
    'Confirmed',
    'Pending',
    'Cancelled',
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            Bookings
          </h2>
          <p className="text-text-secondary">
            Track and manage travel reservations
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-[#e7edf4] text-text-secondary hover:text-primary px-4 py-2 rounded-lg font-medium transition-colors">
            Filter
          </button>

          <button className="flex items-center gap-2 
  bg-blue-600 hover:bg-blue-700 
  text-white font-semibold
  px-6 py-3 
  rounded-2xl 
  shadow-lg hover:shadow-xl
  transition-all duration-200">
  <Plus size={18} />
  Add User
</button>

        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusList.map((status) => (
          <div
            key={status}
            className="bg-white p-4 rounded-xl border border-[#e7edf4] flex items-center justify-between"
          >
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Total {status}
              </p>
              <p className="text-2xl font-bold text-text-main mt-1">
                0
              </p>
            </div>

            <div
              className={`p-3 rounded-lg bg-opacity-10 ${
                status === 'Confirmed'
                  ? 'bg-emerald-500 text-emerald-600'
                  : status === 'Pending'
                  ? 'bg-amber-500 text-amber-600'
                  : 'bg-red-500 text-red-600'
              }`}
            >
              {status === 'Confirmed'
                ? '✔'
                : status === 'Pending'
                ? '⏳'
                : '✖'}
            </div>
          </div>
        ))}
      </div>

      {/* Booking List */}
      <div className="bg-white rounded-xl border border-[#e7edf4] shadow-sm flex flex-col min-h-[300px]">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col md:flex-row items-center p-6 border-b border-[#e7edf4] last:border-0 hover:bg-[#f8fafc] transition-colors gap-4"
            >
              <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  ✈
                </div>

                <div>
                  <p className="font-bold text-lg text-text-main">
                    {booking.destination}
                  </p>
                  <p className="text-sm text-text-secondary">
                    ID: #{booking.id}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-1/3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Date
                  </p>
                  <p className="text-sm font-medium text-text-main">
                    {booking.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Amount
                  </p>
                  <p className="text-sm font-medium text-text-main">
                    {booking.amount}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-1/3 flex justify-between items-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    booking.status === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : booking.status === 'Pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {booking.status}
                </span>

                <button className="text-text-secondary hover:text-primary font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center p-8 text-text-secondary">
            <div className="bg-slate-50 p-4 rounded-full mb-3 text-4xl text-slate-300">
              📅
            </div>
            <p className="font-medium">
              No bookings available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
