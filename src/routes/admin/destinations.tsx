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
          <h2 className="text-2xl font-bold text-text-main">
            Popular Destinations
          </h2>
          <p className="text-text-secondary">
            Trending locations for this season
          </p>
        </div>

        <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          Add Destination
        </button>
      </div>

      {destinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-xl border border-[#e7edf4] shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  ⭐ {dest.rating}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-text-main">
                      {dest.name}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {dest.country}
                    </p>
                  </div>

                  <div className="bg-blue-50 text-primary px-2 py-1 rounded text-xs font-bold">
                    Trend
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    👥 {dest.visitors} visitors
                  </span>

                  <button className="text-primary font-semibold hover:underline">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-[#e7edf4] text-text-secondary">
          <div className="p-4 bg-slate-50 rounded-full mb-3 text-4xl text-slate-300">
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
