import { ImageSearchClient } from '@azure/cognitiveservices-imagesearch'
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js"
import LRU from "lru-cache"

export class Gif {
  private api: ImageSearchClient
  private cache: LRU<string, string[]>

  constructor() {
    // Set up the API
    const credentials = new CognitiveServicesCredentials(process.env.AZURE_COGNITIVE_KEY!)
    this.api = new ImageSearchClient(credentials, { endpoint: process.env.AZURE_COGNITIVE_ENDPOINT! })

    // Set up the cache
    this.cache = new LRU({ max: 500, maxAge: 1209600000 })
  }

  private async searchApi(query: string): Promise<string[]> {
    try {
      const results = await this.api.images.search(query, { imageType: "AnimatedGif", count: 150 })
      return (results.value.map(result => result.contentUrl).filter(r => r) as string[])
    } catch (error) {
      throw error
    }
  }

  async search(query: string) {
    console.log('Raw query', query)
    // Sanitize input
    const sanitized = query.toLowerCase().substring(0, 250).trim()
    if (!sanitized) return undefined
    console.log('Sanitized query', sanitized)

    // Check the cache
    let urls: string[] = []
    if (this.cache.has(sanitized)) {
      console.log('Cache hit')
      urls = this.cache.get(sanitized)!
    } else {
      console.log('Cache miss')
      urls = await this.searchApi(sanitized)
    }

    // Return the next gif and cache the rest
    const remaining = urls.slice(1)
    if (remaining.length) {
      console.log(`Caching ${remaining.length} gifs for next time`)
      this.cache.set(sanitized, remaining)
    } else {
      this.cache.del(sanitized)
    }

    console.log('Found gif', urls[0])
    return urls[0]
  }
}