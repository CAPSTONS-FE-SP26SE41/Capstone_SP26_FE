import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/destinations')({
  component: AdminDestinations,
})

type Destination = {
  id: string
  name: string
  country: string
  imageUrl: string
  rating: number
  visitors: number
}

function AdminDestinations() {
  const [destinations] = useState<Destination[]>([]) // sau này fetch API

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Popular Destinations</h2>
          <p className="text-gray-500">
            Trending locations for this season
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
          Add Destination
        </button>
      </div>

      {destinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg transition"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  ⭐ {dest.rating}
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold">{dest.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {dest.country}
                    </p>
                  </div>

                  <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                    Trend
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    👥 {dest.visitors} visitors
                  </span>

                  <button className="text-blue-600 font-semibold hover:underline">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed text-gray-500">
          <div className="p-4 bg-gray-50 rounded-full mb-3 text-4xl">
            🗺️
          </div>
          <p className="font-medium text-lg">
            No destinations added yet
          </p>
          <p className="text-sm">
            Create a new destination to see it here
          </p>
        </div>
      )}
    </div>
  )
}
