import { ImageSearchClient } from '@azure/cognitiveservices-imagesearch'
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js"
import LRU from "lru-cache"

export class Gif {
  private api: ImageSearchClient
  private cache: LRU<string, string[]>
  private prefixes: { [key: string]: string } = {}

  constructor() {
    // Set up the API
    const credentials = new CognitiveServicesCredentials(process.env.AZURE_COGNITIVE_KEY!)
    this.api = new ImageSearchClient(credentials, { endpoint: process.env.AZURE_COGNITIVE_ENDPOINT! })

    // Set up the cache
    this.cache = new LRU({ max: 500, maxAge: 1209600000 })
  }

  private async searchApi(query: string): Promise<string[]> {
    try {
      console.debug(`Bing image search for ${query}`)
      const results = await this.api.images.search(query, { imageType: "AnimatedGif", count: 150 })
      return (results.value.map(result => result.contentUrl).filter(r => r) as string[])
    } catch (error) {
      throw error
    }
  }

  private async getTrendingApi() {
    try {
      console.debug('Bing trending images lookup')
      const results = await this.api.images.trending({ imageType: "AnimatedGif", count: 150 })
      const gifs = results.categories.find(category => category.title === "Popular gif searches")
      return (gifs?.tiles.map(result => result.image.contentUrl).filter(r => r) as string[])
    } catch (error) {
      throw error
    }
  }

  async setChannelPrefix(channelId: string, prefix: string) {
    this.prefixes[channelId] = prefix
    console.log('Set channel prefix', channelId, prefix)
  }

  async search(query?: string, channelId?: string) {
    let sanitized = query?.toLowerCase().substring(0, 250).trim()

    // Check for a prefix
    if (channelId && this.prefixes[channelId]) {
      console.log('Using prefix', this.prefixes[channelId])
      sanitized = `${this.prefixes[channelId]} ${sanitized}`.trim()
    }

    // Check the cache
    let urls: string[] = []
    if (this.cache.has(sanitized || 'TRENDING')) {
      console.log('Cache hit')
      urls = this.cache.get(sanitized || 'TRENDING')!
    } else {
      console.log('Cache miss')
      urls = await (sanitized ? this.searchApi(sanitized) : this.getTrendingApi())
    }

    // Return the next gif and cache the rest
    const remaining = urls.slice(1)
    if (remaining.length) {
      console.log(`Caching ${remaining.length} gifs for next time`)
      this.cache.set(sanitized || 'TRENDING', remaining, !sanitized ? 3600000 : undefined)
    } else {
      this.cache.del(sanitized || 'TRENDING')
    }

    console.log('Found gif', urls[0])
    return urls[0]
  }
}