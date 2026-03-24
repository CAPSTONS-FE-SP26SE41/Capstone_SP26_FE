import { createFileRoute } from '@tanstack/react-router'
import { Megaphone } from 'lucide-react'

export const Route = createFileRoute('/partner/_layout/advertisement')({
  component: PartnerAdvertisementPage,
})

function PartnerAdvertisementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />
        <button className="flex items-center gap-2 bg-[#e28743] hover:bg-[#cf7632] text-white px-4 py-2 rounded-xl transition-colors font-medium cursor-pointer shadow-sm">
          <Megaphone size={18} />
          <span>Create Ad</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-8 text-center">
        <div className="bg-[#faeadd] h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone className="h-8 w-8 text-[#e28743]" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Advertisements</h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-6">
          You haven't created any advertisements yet. Create an ad to promote your locations and POIs.
        </p>
      </div>
    </div>
  )
}
