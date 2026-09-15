export declare class Article {
    id: string;
    external_id: number;
    title: string | null;
    summary: string | null;
    url: string;
    image: string | null;
    author_name: string | null;
    language: string | null;
    catagory: string | null;
    source_country: string | null;
    sentiment: number | null;
    published_date: Date | null;
    last_refreshed_at: Date;
    created_at: Date;
    updated_at: Date;
}
