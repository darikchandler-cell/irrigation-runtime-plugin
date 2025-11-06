// Professional brand logos for irrigation controllers
import { ImageWithFallback } from './figma/ImageWithFallback';

export type ControllerBrandName = 'rainbird' | 'hunter' | 'rachio' | 'toro' | 'hydrawise' | 'orbit' | 'irritrol' | 'weathermatic';

interface ControllerBrandIconProps {
  brand: ControllerBrandName;
  size?: number;
}

export default function ControllerBrandIcon({ brand, size = 48 }: ControllerBrandIconProps) {
  // Actual brand logo URLs
  const brandLogos: Record<ControllerBrandName, string> = {
    rainbird: 'https://bigirrigation.com/wp-content/uploads/2022/10/Rain-Bird-logo.webp',
    hunter: 'https://bigirrigation.com/wp-content/uploads/2022/10/hunter-industries-vector-logo.webp',
    toro: 'https://bigirrigation.com/wp-content/uploads/2022/10/Toro-Logo-1.png',
    hydrawise: 'https://bigirrigation.com/wp-content/uploads/2023/11/Hydrawise-Logo.png',
    orbit: 'https://bigirrigation.com/wp-content/uploads/2024/11/Bhyve-Pro-1300x494.webp',
    irritrol: 'https://bigirrigation.com/wp-content/uploads/2022/10/Irritrol-logo.webp',
    weathermatic: 'https://bigirrigation.com/wp-content/uploads/2023/08/Weathermatic-2.webp',
    rachio: 'https://cdn.kustomerhostedcontent.com/media/5f775c7b7cad407e578daa84/add35dc6d42d7c47e14cde5c1f5a6081.png'
  };

  const brandNames: Record<ControllerBrandName, string> = {
    rainbird: 'Rain Bird',
    hunter: 'Hunter Industries',
    rachio: 'Rachio',
    toro: 'Toro',
    hydrawise: 'Hydrawise',
    orbit: 'Orbit B-hyve',
    irritrol: 'Irritrol',
    weathermatic: 'Weathermatic'
  };

  return (
    <ImageWithFallback
      src={brandLogos[brand]}
      alt={`${brandNames[brand]} logo`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        transform: 'scale(1.2)'
      }}
    />
  );
}

// Brand name component with correct styling
export function ControllerBrandName({ brand }: { brand: ControllerBrandName }) {
  const brandNames: Record<ControllerBrandName, string> = {
    rainbird: 'Rain Bird',
    hunter: 'Hunter Industries',
    rachio: 'Rachio',
    toro: 'Toro',
    hydrawise: 'Hydrawise',
    orbit: 'Orbit B-hyve',
    irritrol: 'Irritrol',
    weathermatic: 'Weathermatic'
  };
  
  return <span>{brandNames[brand] || brand}</span>;
}
