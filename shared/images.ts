export const sourceImages = Array.from({ length: 10 }, (_, index) => {
  const name = `photo-${String(index + 1).padStart(2, '0')}.jpg`
  return {
    src: `/images/thumbnails/${name}`,
    'data-source': `/images/${name}`,
    alt: `风景 ${index + 1}`,
  }
})
export type Kind = 'component' | 'directive' | 'api'
export function imageHtml(images: typeof sourceImages) {
  // This fixture only contains trusted, local image paths.
  return images
    .map(
      (image) =>
        `<img src="${image.src}" data-source="${image['data-source']}" alt="${image.alt}">`,
    )
    .join('')
}
