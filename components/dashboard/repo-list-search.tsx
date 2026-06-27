"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RepoCard } from "./repo-card";
import { Search } from "lucide-react";

interface RepoListSearchProps {
  initialRepos: any[];
}

export function RepoListSearch({ initialRepos }: RepoListSearchProps) {
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");

  const languages = ["All", ...Array.from(new Set(initialRepos.map((r) => r.primaryLanguage).filter(Boolean)))];

  const filteredRepos = initialRepos.filter((repo) => {
    const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) || 
      (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesLang = selectedLang === "All" || repo.primaryLanguage === selectedLang;
    
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border/85 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-muted border-border text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center justify-end w-full sm:w-auto">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                selectedLang === lang
                  ? "bg-white text-black border-white"
                  : "bg-zinc-900 text-muted-foreground border-border hover:text-white"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {filteredRepos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <p className="text-sm text-muted-foreground">No repositories found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
