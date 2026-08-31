import type { ContentProvider, ContentSource, PortfolioItem, PortfolioQuery } from "@/lib/types";
import { LocalContentProvider, applyPortfolioQuery } from "./local";

/**
 * CMS PROVIDER — the seam a headless CMS plugs into.
 *
 * It currently extends the local provider so the site is never broken while a
 * CMS is being chosen: anything not yet wired falls through to /src/content.
 *
 * To adopt Sanity / Payload / Contentful / Strapi, override the methods you
 * have modelled. Nothing in /src/components changes — every component consumes
 * `ContentProvider`, never a CMS SDK.
 *
 *   async getPosts() {
 *     const data = await sanity.fetch(POSTS_QUERY)
 *     return data.map(toBlogPost)       // map into src/lib/types.ts shapes
 *   }
 */
export class CMSContentProvider extends LocalContentProvider implements ContentProvider {
  readonly source: ContentSource = "cms";

  private readonly endpoint: string | undefined;

  constructor(endpoint = process.env.CMS_API_URL) {
    super();
    this.endpoint = endpoint;
  }

  /** Guard used by future overrides — falls back to local when unconfigured. */
  protected get isConfigured(): boolean {
    return Boolean(this.endpoint);
  }

  async getPortfolio(options?: PortfolioQuery): Promise<PortfolioItem[]> {
    if (!this.isConfigured) return super.getPortfolio(options);
    // TODO(cms): fetch, then `return applyPortfolioQuery(mapped, options)`.
    return applyPortfolioQuery(await super.getPortfolio(), options);
  }
}
