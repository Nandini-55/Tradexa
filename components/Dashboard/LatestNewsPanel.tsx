import { getNews } from "@/lib/actions/finnhub.actions";

interface NewsItem {
    headline: string;
    url: string;
    source: string;
    datetime: number;
    image?: string;
    summary?: string;
}

export default async function LatestNewsPanel() {
    let news: NewsItem[] = [];
    try {
        const raw = await getNews();
        news = (raw || []).slice(0, 6).map((n: any) => ({
            headline: n.headline || n.title || '',
            url: n.url || '#',
            source: n.source || 'Market',
            datetime: n.datetime || Date.now() / 1000,
            image: n.image || n.imageUrl,
            summary: n.summary || n.description,
        }));
    } catch (e) {
        console.error("LatestNewsPanel error:", e);
    }

    function timeAgo(ts: number) {
        const diff = Math.floor(Date.now() / 1000 - ts);
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    if (!news.length) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No news available
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar">
            {news.map((item, i) => (
                <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.06]"
                >
                    {item.image && (
                        <img
                            src={item.image}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-white/[0.08]"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/90 leading-snug line-clamp-2 group-hover:text-[#A78BFA] transition-colors">
                            {item.headline}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium text-[#A78BFA]">{item.source}</span>
                            <span className="text-[10px] text-muted-foreground/60">·</span>
                            <span className="text-[10px] text-muted-foreground">{timeAgo(item.datetime)}</span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
}
