'use client';

import { getLanguageFullName } from '@/lib/utils';
import { HubspotPageT } from '@/types/hubspot';
import { useState } from 'react';
import toast from 'react-hot-toast';

export interface HubspotPage {
  id: string;
  publishedAt: string;
  authorName: string;
  name: string;
  slug: string;
  url: string;
  domain: string;
  language: string;
  updatedAt: string;
  content: string;
}

interface GetHubspotPagesProps {
  pages: HubspotPage[];
  setPages: (pages: HubspotPage[]) => void;
  domainFilter: string;
  setDomainFilter: (val: string) => void;
  languageFilter: string;
  setLanguageFilter: (val: string) => void;
}

export default function GetHubspotPages({
  pages,
  setPages,
  domainFilter,
  setDomainFilter,
  languageFilter,
  setLanguageFilter,
}: GetHubspotPagesProps) {
  const [loading, setLoading] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setPages([]); // Clear previous pages
      const res = await fetch('/api/hubspot/pages');
      const data = await res.json();
      if (res.ok) {
        const enrichedPages: HubspotPage[] = (data.pages || []).map((page: HubspotPageT): HubspotPage => {
          const updated = page.updatedAt ?? page.updated ?? '';
          return {
            id: page.id,
            publishedAt: page.publishDate || '',
            authorName: page.authorName || '',
            name: page.name || '',
            slug: page.slug || '',
            url: page.url || '',
            domain: page.url ? new URL(page.url).hostname : '',
            language: getLanguageFullName(page.language ?? '') || '',
            updatedAt: updated,
            content: page._sourceType || '',
          };
        });
        setPages(enrichedPages);
        toast.success('Fetched HubSpot pages successfully');
      } else {
        console.error('❌ Error:', data.error || data.details);
        toast.error(data.error || 'Failed to fetch pages');
      }
    } catch (err) {
      alert('err')
      console.error('❌ Unexpected Error:', err);
      toast.error('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      (domainFilter === '' || page.domain === domainFilter) &&
      (languageFilter === '' || page.language === languageFilter)
  );

  return (
    <div className="space-y-4 mt-6">
      <button
        onClick={fetchPages}
        disabled={loading}
        className={`px-4 py-2 rounded text-white transition ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
        }`}
      >
        {loading ? 'Fetching Pages...' : 'Fetch HubSpot Pages'}
      </button>

      <div className="flex gap-4 my-2">
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Domains</option>
          {[...new Set(pages.map((p) => p.domain))].map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>

        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Languages</option>
          {[...new Set(pages.map((p) => p.language || ''))].map((lang) => (
            <option key={lang} value={lang}>
              {lang || 'Unknown'}
            </option>
          ))}
        </select>
      </div>

      {filteredPages.length > 0 && (
        <table className="table-auto w-full border mt-4 text-sm">
          <thead>
            <tr className="text-left border">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Slug</th>
              <th className="p-2 border">Domain</th>
              <th className="p-2 border">Language</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <tr key={page.id}>
                <td className="p-2 border">{page.name || '—'}</td>
                <td className="p-2 border">{page.slug || page.url || '—'}</td>
                <td className="p-2 border">{page.domain || '—'}</td>
                <td className="p-2 border">{page.language || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filteredPages && filteredPages.length > 1 && 
      <div className="mt-2 text-right text-xs text-muted-foreground">
            Total records: {filteredPages.length}
          </div>
      }
    </div>
  );
}
