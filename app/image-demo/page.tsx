"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ImageDemoPage() {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})
  const [refreshKey, setRefreshKey] = useState(0)

  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }))
  }

  const refreshImages = () => {
    setRefreshKey((prev) => prev + 1)
    setImageErrors({})
  }

  const ImageWithFallback = ({
    src,
    alt,
    className,
    fallbackText,
    id,
  }: {
    src: string
    alt: string
    className: string
    fallbackText: string
    id: string
  }) => {
    if (imageErrors[id]) {
      return (
        <div
          className={`${className} bg-monastery-surface/50 border-2 border-dashed border-monastery-primary/30 flex items-center justify-center`}
        >
          <div className="text-center p-4">
            <div className="text-monastery-accent text-2xl mb-2">🖼️</div>
            <p className="text-xs text-monastery-ethereal/70">{fallbackText}</p>
            <p className="text-xs text-monastery-accent/50 mt-1">Image loading failed</p>
          </div>
        </div>
      )
    }

    return (
      <img
        src={`${src}&v=${refreshKey}`}
        alt={alt}
        className={className}
        onError={() => handleImageError(id)}
        crossOrigin="anonymous"
      />
    )
  }

  return (
    <div className="min-h-screen bg-monastery-void p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold monastery-title mb-4">Digital Monastery Aesthetic Images</h1>
          <p className="text-monastery-accent/70">Lorem Picsum with monastery-matching filters</p>
          <Button onClick={refreshImages} className="cyber-button mt-4">
            🔄 Refresh All Images
          </Button>
        </div>

        {/* Monastery Aesthetic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dark & Moody */}
          <Card className="monastery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-monastery-primary text-monastery-ethereal">Dark</Badge>
                Moody & Atmospheric
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageWithFallback
                src="https://picsum.photos/400/300?random=100&grayscale"
                alt="Dark atmospheric"
                className="w-full h-48 object-cover rounded-lg shadow-monastery mb-3"
                fallbackText="Dark Mood"
                id="dark1"
              />
              <code className="text-xs text-monastery-accent">?random=100&grayscale</code>
              <p className="text-xs text-monastery-ethereal/70 mt-1">Grayscale for dark monastery vibes</p>
            </CardContent>
          </Card>

          {/* Minimalist */}
          <Card className="monastery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-monastery-accent text-monastery-surface">Minimal</Badge>
                Clean & Zen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageWithFallback
                src="https://picsum.photos/400/300?random=200&blur=1"
                alt="Minimalist zen"
                className="w-full h-48 object-cover rounded-lg shadow-cyber mb-3"
                fallbackText="Minimal Zen"
                id="minimal1"
              />
              <code className="text-xs text-monastery-accent">?random=200&blur=1</code>
              <p className="text-xs text-monastery-ethereal/70 mt-1">Subtle blur for zen meditation feel</p>
            </CardContent>
          </Card>

          {/* High Contrast */}
          <Card className="monastery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-monastery-secondary text-monastery-ethereal">Cyber</Badge>
                High Contrast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageWithFallback
                src="https://picsum.photos/400/300?random=300"
                alt="High contrast"
                className="w-full h-48 object-cover rounded-lg shadow-transcendent mb-3 contrast-125 saturate-50"
                fallbackText="High Contrast"
                id="contrast1"
              />
              <code className="text-xs text-monastery-accent">?random=300 + CSS filters</code>
              <p className="text-xs text-monastery-ethereal/70 mt-1">CSS contrast + desaturate for cyber look</p>
            </CardContent>
          </Card>

          {/* Sepia Tone */}
          <Card className="monastery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-monastery-warning text-monastery-ethereal">Warm</Badge>
                Sepia Meditation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageWithFallback
                src="https://picsum.photos/400/300?random=400"
                alt="Sepia meditation"
                className="w-full h-48 object-cover rounded-lg shadow-[0_0_20px_rgba(230,63,0,0.3)] mb-3 sepia"
                fallbackText="Sepia Tone"
                id="sepia1"
              />
              <code className="text-xs text-monastery-accent">?random=400 + sepia filter</code>
              <p className="text-xs text-monastery-ethereal/70 mt-1">CSS sepia for warm monastery glow</p>
            </CardContent>
          </Card>

          {/* Purple Tinted */}
          <Card className="monastery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-monastery-success text-monastery-surface">Mystical</Badge>
                Purple Tinted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageWithFallback
                src="https://picsum.photos/400/300?random=500&grayscale"
                alt="Purple mystical"
                className="w-full h-48 object-cover rounded-lg shadow-[0_0_20px_rgba(114,230,0,0.3)] mb-3"
                style={{ filter: "grayscale(100%) sepia(100%) hue-rotate(250deg) saturate(200%) brightness(0.8)" }}
                fallbackText="Purple Mystical"
                id="purple1"
              />
              <code className="text-xs text-monastery-accent">grayscale + hue-rotate(250deg)</code>
              <p className="text-xs text-monastery-ethereal/70 mt-1">CSS hue rotation for purple monastery theme</p>
            </CardContent>
          </Card>

          {/* Cyan Glow */}
          <Card className="monastery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-monastery-danger text-monastery-ethereal">Cyber</Badge>
                Cyan Digital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageWithFallback
                src="https://picsum.photos/400/300?random=600&grayscale"
                alt="Cyan digital"
                className="w-full h-48 object-cover rounded-lg shadow-[0_0_20px_rgba(198,18,57,0.3)] mb-3"
                style={{ filter: "grayscale(100%) sepia(100%) hue-rotate(180deg) saturate(300%) brightness(0.9)" }}
                fallbackText="Cyan Digital"
                id="cyan1"
              />
              <code className="text-xs text-monastery-accent">grayscale + hue-rotate(180deg)</code>
              <p className="text-xs text-monastery-ethereal/70 mt-1">CSS hue rotation for cyan digital glow</p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Combinations */}
        <Card className="monastery-card border-2 border-monastery-accent/30">
          <CardHeader>
            <CardTitle className="text-center monastery-title">🎨 Advanced Monastery Combinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Specific Image IDs that work well */}
              <div className="text-center">
                <ImageWithFallback
                  src="https://picsum.photos/id/1018/200/200"
                  alt="Mountain landscape"
                  className="w-full h-32 object-cover rounded-lg shadow-cyber mb-2 grayscale contrast-125"
                  fallbackText="Mountain"
                  id="mountain"
                />
                <p className="text-xs text-monastery-accent">Mountain (ID: 1018)</p>
              </div>

              <div className="text-center">
                <ImageWithFallback
                  src="https://picsum.photos/id/1015/200/200"
                  alt="River landscape"
                  className="w-full h-32 object-cover rounded-lg shadow-transcendent mb-2"
                  style={{ filter: "grayscale(100%) sepia(100%) hue-rotate(250deg) saturate(150%)" }}
                  fallbackText="River"
                  id="river"
                />
                <p className="text-xs text-monastery-secondary">River (ID: 1015)</p>
              </div>

              <div className="text-center">
                <ImageWithFallback
                  src="https://picsum.photos/id/1043/200/200"
                  alt="Forest path"
                  className="w-full h-32 object-cover rounded-lg shadow-[0_0_15px_rgba(114,230,0,0.4)] mb-2 blur-sm"
                  fallbackText="Forest"
                  id="forest"
                />
                <p className="text-xs text-monastery-success">Forest (ID: 1043)</p>
              </div>

              <div className="text-center">
                <ImageWithFallback
                  src="https://picsum.photos/id/1036/200/200"
                  alt="Abstract texture"
                  className="w-full h-32 object-cover rounded-lg shadow-[0_0_15px_rgba(230,63,0,0.4)] mb-2"
                  style={{ filter: "contrast(150%) saturate(50%) brightness(0.7)" }}
                  fallbackText="Abstract"
                  id="abstract"
                />
                <p className="text-xs text-monastery-warning">Abstract (ID: 1036)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Reference */}
        <Card className="monastery-card">
          <CardHeader>
            <CardTitle>📝 Monastery Aesthetic Code Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-monastery-surface/50 p-4 rounded-lg border border-monastery-primary/20">
              <h4 className="text-monastery-accent font-semibold mb-2">🌑 Dark Monastery:</h4>
              <code className="text-sm text-monastery-ethereal/80 block mb-2">
                {`src="https://picsum.photos/400/300?random=X&grayscale"`}
              </code>
              <code className="text-sm text-monastery-ethereal/80">{`className="grayscale contrast-125"`}</code>
            </div>

            <div className="bg-monastery-surface/50 p-4 rounded-lg border border-monastery-primary/20">
              <h4 className="text-monastery-accent font-semibold mb-2">💜 Purple Mystical:</h4>
              <code className="text-sm text-monastery-ethereal/80 block mb-2">
                {`src="https://picsum.photos/400/300?random=X&grayscale"`}
              </code>
              <code className="text-sm text-monastery-ethereal/80">
                {`style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(250deg) saturate(200%)' }}`}
              </code>
            </div>

            <div className="bg-monastery-surface/50 p-4 rounded-lg border border-monastery-primary/20">
              <h4 className="text-monastery-accent font-semibold mb-2">🌊 Cyan Digital:</h4>
              <code className="text-sm text-monastery-ethereal/80 block mb-2">
                {`src="https://picsum.photos/400/300?random=X&grayscale"`}
              </code>
              <code className="text-sm text-monastery-ethereal/80">
                {`style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(180deg) saturate(300%)' }}`}
              </code>
            </div>

            <div className="bg-monastery-surface/50 p-4 rounded-lg border border-monastery-primary/20">
              <h4 className="text-monastery-accent font-semibold mb-2">🧘 Zen Blur:</h4>
              <code className="text-sm text-monastery-ethereal/80 block mb-2">
                {`src="https://picsum.photos/400/300?random=X&blur=1"`}
              </code>
              <code className="text-sm text-monastery-ethereal/80">{`className="blur-sm opacity-80"`}</code>
            </div>

            <div className="bg-monastery-success/20 p-4 rounded-lg border border-monastery-success/30">
              <h4 className="text-monastery-success font-semibold mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm text-monastery-ethereal/80 space-y-1">
                <li>• Use specific IDs (1015, 1018, 1043) for consistent results</li>
                <li>• Combine `?grayscale` with CSS `hue-rotate()` for color themes</li>
                <li>• Add `&blur=1` for zen meditation backgrounds</li>
                <li>• Use `contrast()` and `saturate()` for cyber effects</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
