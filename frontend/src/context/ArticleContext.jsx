import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { getArticles } from "../services/api";

const ArticleContext = createContext(null);

function extractFundingRounds(articles) {
  return articles
    .filter(a => {
      const text = ((a.title || "") + " " + (a.description || "") + " " + (a.summary || "")).toLowerCase();
      return text.includes("raises") || text.includes("funding") || text.includes("million") || text.includes("series");
    })
    .slice(0, 10)
    .map(a => ({
      id: a.id,
      company: a.source || "Unknown",
      amount: "—",
      round: "—",
      source: a.source || "Unknown",
      date: a.published_at || "",
      title: a.title,
    }));
}

function computeNewsSources(articles) {
  const map = {};
  articles.forEach(a => {
    const key = a.source || "Unknown";
    if (!map[key]) {
      map[key] = { id: key, name: key, type: "Publication", role: "News Source", mentions: 0 };
    }
    map[key].mentions++;
  });
  return Object.values(map).sort((a, b) => b.mentions - a.mentions);
}

function computeSectorCounts(articles) {
  const map = {};
  articles.forEach(a => {
    const key = a.topic || a.industry || a.search_topic || "General";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function computeSignalCounts(articles) {
  const map = {};
  articles.forEach(a => {
    const key = a.signal_strength || "Unknown";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, count]) => ({ name, count }));
}

export function ArticleProvider({ children }) {
  const [articles, setArticles]     = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchArticles = useCallback(async (opts = {}) => {
    setIsLoading(true);
    try {
      const response = await getArticles({ pageSize: 500, ...opts });
      const items = response.items || [];
      setArticles(items);
      setLastFetched(new Date().toISOString());
      return items;
    } catch (e) {
      console.error("[ArticleContext] fetchArticles error:", e);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fundingRounds = useMemo(() => extractFundingRounds(articles), [articles]);
  const newsSources   = useMemo(() => computeNewsSources(articles),   [articles]);
  const sectorCounts  = useMemo(() => computeSectorCounts(articles),  [articles]);
  const signalCounts  = useMemo(() => computeSignalCounts(articles),  [articles]);

  return (
    <ArticleContext.Provider value={{
      articles, setArticles,
      fetchArticles,
      isLoading, lastFetched,
      fundingRounds, newsSources, sectorCounts, signalCounts,
    }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticles() {
  return useContext(ArticleContext);
}
