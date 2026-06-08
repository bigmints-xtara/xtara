import { liteClient as algoliasearch } from "algoliasearch/lite";

const APP_ID = "94C231P5QA";
const SEARCH_API_KEY = "7d87dea285e1b098041840f354ce9e8e";
const COLLEGES_INDEX_NAME = "xtara_colleges";

export const algoliaClient = algoliasearch(APP_ID, SEARCH_API_KEY);

export const collegesIndex = {
    name: COLLEGES_INDEX_NAME,
};
