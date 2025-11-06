// Brand Icon Showcase - Test/demo component to view all brand icons
// This is for development/testing purposes - not used in production

import ControllerBrandIcon, { ControllerBrandName } from './ControllerBrandIcon';

export default function BrandIconShowcase() {
  const brands = ['rainbird', 'hunter', 'rachio', 'toro', 'hydrawise', 'orbit', 'irritrol', 'weathermatic'] as const;
  const sizes = [24, 32, 48, 64, 96];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-gray-900 mb-2">Irrigation Controller Brand Logos</h1>
        <p className="text-gray-600 mb-8">
          Official brand logos for all major irrigation controller manufacturers
        </p>

        {/* Size Comparison */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h2 className="text-gray-900 mb-6">Size Comparison</h2>
          <div className="grid grid-cols-5 gap-8">
            {sizes.map((size) => (
              <div key={size} className="text-center">
                <div className="text-sm text-gray-500 mb-4">{size}px</div>
                <div className="space-y-4">
                  {brands.map((brand) => (
                    <div key={brand} className="flex justify-center">
                      <ControllerBrandIcon brand={brand} size={size} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Brand Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {brands.map((brand) => (
            <div key={brand} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <ControllerBrandIcon brand={brand} size={64} />
                <div>
                  <h3 className="text-gray-900">
                    <ControllerBrandName brand={brand} />
                  </h3>
                  <p className="text-sm text-gray-500">{brand}</p>
                </div>
              </div>
              <div className="flex justify-around items-center pt-4 border-t border-gray-100">
                <ControllerBrandIcon brand={brand} size={24} />
                <ControllerBrandIcon brand={brand} size={32} />
                <ControllerBrandIcon brand={brand} size={48} />
                <ControllerBrandIcon brand={brand} size={64} />
              </div>
            </div>
          ))}
        </div>

        {/* Hover Effects Demo */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-gray-900 mb-6">Interactive Hover Effects</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <button
                key={brand}
                className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group"
              >
                <div className="transform group-hover:scale-110 transition-transform">
                  <ControllerBrandIcon brand={brand} size={64} />
                </div>
                <span className="text-xs text-gray-700 text-center font-medium">
                  <ControllerBrandName brand={brand} />
                </span>
                <span className="text-xs text-gray-400">Hover me!</span>
              </button>
            ))}
          </div>
        </div>

        {/* Official Brand Logos */}
        <div className="bg-white rounded-2xl p-8 mt-8 shadow-lg">
          <h2 className="text-gray-900 mb-6">Official Brand Logos</h2>
          <p className="text-sm text-gray-500 mb-6">All logos are displayed using official brand assets</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brands.map((brand) => (
              <div key={brand} className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="h-16 flex items-center justify-center">
                  <ControllerBrandIcon brand={brand} size={80} />
                </div>
                <div className="text-sm text-gray-700 text-center">
                  <ControllerBrandName brand={brand} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
