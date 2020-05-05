import { ImageSearchClient } from '@azure/cognitiveservices-imagesearch'
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js"

export class Gif {
  private api: ImageSearchClient
  constructor() {
    const credentials = new CognitiveServicesCredentials(process.env.AZURE_COGNITIVE_KEY!)
    this.api = new ImageSearchClient(credentials, { endpoint: process.env.AZURE_COGNITIVE_ENDPOINT! })
  }

  async search(query: string) {
    try {
      const results = await this.api.images.search(query, { imageType: "AnimatedGif", count: 1 })
      if (results.value.length) {
        return results.value[0].contentUrl
      }
    } catch (error) {
      console.error('Unable to search.', error)
    }
  }
}