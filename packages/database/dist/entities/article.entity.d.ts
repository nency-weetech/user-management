export declare class Article {
    id: string;
    externalId: number;
    title: string | null;
    summary: string | null;
    url: string;
    image: string | null;
    author: string | null;
    language: string | null;
    catagory: string | null;
    sourceCountry: string | null;
    sentiment: number | null;
    publishDated: Date | null;
    lastRefreshedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
