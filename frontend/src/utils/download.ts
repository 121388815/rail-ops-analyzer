export function downloadUrl(url: string): void {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.click()
}

