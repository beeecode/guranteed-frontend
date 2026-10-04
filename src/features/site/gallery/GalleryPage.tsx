import { PageHero } from '../components/PageHero';
import { GalleryBrowser } from './GalleryBrowser';

export function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="School Life"
        title="School"
        highlight="Gallery."
        waveWidth={180}
        description="A window into the vibrant, creative life of Guaranteed Future Model Schools."
      />

      <GalleryBrowser />
    </>
  );
}
