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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#151515] p-4 rounded-[14px] border border-[rgba(255,255,255,0.06)]">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-[10px] bg-[#111111] border-[rgba(255,255,255,0.06)] text-[13px] focus:ring-1 focus:ring-[#10B981] focus:outline-none text-white placeholder:text-[#737373]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center justify-end w-full sm:w-auto">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-[10px] border transition-colors duration-150 cursor-pointer ${
                selectedLang === lang
                  ? "bg-white text-[#090909] border-white"
                  : "bg-[#1a1a1a] text-[#a3a3a3] border-[rgba(255,255,255,0.06)] hover:text-white"
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
        <div className="text-center py-12 border border-dashed border-[rgba(255,255,255,0.06)] rounded-[14px]">
          <p className="text-[13px] text-[#737373]">No repositories found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
