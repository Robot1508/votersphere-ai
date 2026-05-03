import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0a0a0c] overflow-hidden py-3">
      <div className="flex w-[200%] animate-marquee items-center gap-8 text-xs font-medium text-white/25 whitespace-nowrap">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="flex items-center gap-2"><Scale className="h-3.5 w-3.5" /> Article 324: Superintendence, direction and control of elections</span>
            <span className="flex items-center gap-2"><Scale className="h-3.5 w-3.5" /> Article 326: Elections to the House of the People and to the Legislative Assemblies of States to be on the basis of adult suffrage</span>
            <span className="flex items-center gap-2"><Scale className="h-3.5 w-3.5" /> Article 243K: Elections to the Panchayats</span>
          </div>
        ))}
      </div>
    </footer>
  );
}
