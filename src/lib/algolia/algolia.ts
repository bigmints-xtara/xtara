import { liteClient as algoliasearch } from "algoliasearch/lite";

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "DEV_APP_ID";
const SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || "DEV_SEARCH_KEY";
const COLLEGES_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "xtara_colleges";

export const algoliaClient = algoliasearch(APP_ID, SEARCH_API_KEY);

export const collegesIndex = {
    name: COLLEGES_INDEX_NAME,
};
