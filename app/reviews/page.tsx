"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Star } from "lucide-react"
import { facilities } from "@/lib/data"
import Image from "next/image"

export default function ReviewsPage() {
  // Simplified version of Search page for Reviews
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-slate-50 py-12 border-b">
        <div className="container text-center space-y-4">
          <h1 className="text-3xl font-bold">시설 리뷰</h1>
          <p className="text-muted-foreground">다른 사용자들의 생생한 이용 후기를 확인해보세요.</p>

          <div className="max-w-2xl mx-auto flex gap-2 mt-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="시설명 또는 지역으로 검색" className="pl-10 h-12" />
            </div>
            <Button className="h-12 px-8 bg-purple-600">검색</Button>
          </div>
        </div>
      </div>

      <div className="container py-12 max-w-5xl">
        <div className="grid gap-6">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-xl border shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
            >
              <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={facility.image || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl mb-1">{facility.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {facility.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{facility.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{facility.description}</p>
                <div className="flex gap-2">
                  {facility.features.slice(0, 4).map((f) => (
                    <span key={f} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
